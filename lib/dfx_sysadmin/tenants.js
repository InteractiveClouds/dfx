

var CRYPTO = require('crypto'),
    SETTINGS = require('../dfx_settings'),
    Q = require('q'),
    QFS        = require('q-io/fs'),
    _ = require('lodash'),
    CHANNELS = require('../channels').channels,
    MDBW,
    db,
    fs = require('graceful-fs'),
    path = require('path'),
    activator = require('../utils/activator'),
    log       = new (require('../utils/log')).Instance({label:'SYSADMIN_TENANTS'}),
    credCrypt = require('../auth/utils/credCrypt');

var sysdbName        = SETTINGS.system_database_name,
    tenantsClName    = SETTINGS.system_database_tenants_collection_name,
    tokenLength      = SETTINGS.database_token_length,
    repositoryPrefix = SETTINGS.databases_tenants_name_prefix,
    sharedCatalogName = SETTINGS.sharedCatalogName,
    sharedAppRole    = 'shared_guest',
    authProvidersDbName = SETTINGS.authProviders_database_name,
    dbDriversDbName = SETTINGS.dbDrivers_database_name,
    RESOURCES_DEV_PATH = SETTINGS.resources_development_path;


var tenants = exports;
var activeTenants;

if (SETTINGS.studio) {
    var hasSimilar = require('../auth/utils').hasSimilar;
    var passwordStrenght = require('../auth/utils').passwordStrenght;

    var limits     = require('./limits').init({tenants: tenants});
    exports.limits = limits;
}

var cache = require('../utils/redisLayer');

exports.init = function ( o ) {
    MDBW = o.storage;
    db = o.storage;

    if (SETTINGS.edition !== 'deployment'){
        exports.Initlist().then(function(tenants){
            activator.init(tenants).then(function(){
                activator.getAll().then(function(tenants){
                    activeTenants = tenants;
                    roles.init();
                });
            });
        });
    }


    delete exports.init;
}

exports.generateUnicueTenantIdForBlueMix = function () {
    return exports.list().then(function( list ){
        var l = list
            .filter(function(e){
                return /^\d+$/.test(e);
            })
            .sort(function(a, b){
                return a * 1 - b * 1;
            });

        return l.length
            ? l[l.length - 1] * 1 + 1
            : 1;
    });
};

exports.list = function() {
    return activator.getAll().then(function( activeTenants ) {
        return MDBW.get(sysdbName, tenantsClName)
            .then(function (docs) {
                return docs.map(function (e) {
                    return e.id
                })
                    .filter(function (f) {
                        return activeTenants ? activeTenants.indexOf(f) != -1
                            : true;
                    });
            })
    });
};

exports.Initlist = function() {
    return MDBW.get(sysdbName, tenantsClName).then(function( tenants ){
        return tenants.map(function (tenant) {
            return tenant.id;
        })
    })
};

exports.exists = function( tenantName ) {
    return activator.getAll().then(function( activeTenants ) {
        return validateName(tenantName)
            .then(function () {
                return MDBW.exists(sysdbName, tenantsClName, {"id": tenantName})
                    .then(function (exists) {
                        return exists
                            ? activeTenants ? activeTenants.indexOf(tenantName) != -1 ? Q.resolve() : Q.reject() : Q.resolve()
                            : Q.reject();
                    });
            });
    });
};

/**
 * @param {String} tenantName
 * @returns {Promise * Object | Undefined} entire tenant's record from sysdb
 */
exports.get = function( tenantName ) {
    return activator.getAll().then(function( activeTenants ) {
        return validateName(tenantName)
            .then(function () {
                return MDBW.get(sysdbName, tenantsClName, {"id": tenantName})
            })
            .then(function (docs) {
                return activeTenants ? activeTenants.indexOf(tenantName) != -1 ? docs[0] : null : docs[0];
            })
    });
};

exports.deactivate = function( tenantName ) {
    return tenants.exists(tenantName)
        .then(function(){
            return db.update(
                sysdbName,
                tenantsClName,
                {"id": tenantName},
                {$set : {deactivated : true}}
            );
        });
};

exports.activate = function( tenantName ) {
    return tenants.exists(tenantName)
        .then(function(){
            return db.update(
                sysdbName,
                tenantsClName,
                {"id": tenantName},
                {$set : {deactivated : false}}
            );
        });
};

exports.isActive = function( tenantName ) {
    return tenants.get(tenantName)
        .then(function(tenant){
            return tenant.deactivated
                ? Q.reject()
                : Q.resolve();
        });
};

/**
 * creates new tenant
 *
 * @param {String} tenantName
 * @param {String} userPassword
 * @param {Object} bm bluemix options (see lib/appDirect)
 * @returns {Promise * Undefined}
 */
exports.create = function( tenantName, userPassword, bm ) {
    return validateName(tenantName)
        .then(function(){
            return Q.all([
                MDBW.exists(sysdbName, tenantsClName, {"id": tenantName} ),
                getRandomString(tokenLength)
            ])
        })
        .spread(function(exists, token){
            if ( exists ) return Q.reject(
                'Tenant "' + tenantName + '" already exists. Nothing is created.'
            );

            var tenantDbName = repositoryPrefix + tenantName,
                tokens = {};
            tokens[token] = {
                'permissions': {
                    'read': true,
                    'write': true
                }
            };

            CHANNELS.root.publish('TENANTS.created', {tenant: tenantName});


            // create default roles

            var defaultRoles  = SETTINGS.auto_generated_roles,
                generateRoles = [];


            return Q.all([
                MDBW.put(sysdbName, tenantsClName, {
                    'id': tenantName,
                    'deactivated' : false,
                    'datecreation': new Date(),
                    'partner' : ( bm && bm.partner ) || null,
                    'databaseTokens': tokens
                }),
                MDBW.put(tenantDbName, 'applications').then(function(){
                    MDBW.native(tenantDbName).then(function(db){
                        db.createIndex(
                            'applications',
                            {name:1},
                            {unique:true},
                            function(err, indexName) {
                                if (err) {
                                    console.log(err);
                                }
                            }
                        );
                    });
                }),
                MDBW.put(tenantDbName, 'datawidgets').then(function(){
                    MDBW.native(tenantDbName).then(function(db){
                        db.createIndex(
                            'datawidgets',
                            {name:1, application:1, platform:1},
                            {unique:true},
                            function(err, indexName) {
                                if (err) {
                                    console.log(err);
                                }
                            }
                        );
                    });
                }),
                MDBW.put(tenantDbName, 'dataqueries').then(function(){
                    MDBW.native(tenantDbName).then(function(db){
                        db.createIndex(
                            'dataqueries',
                            {name:1, application:1},
                            {unique:true},
                            function(err, indexName) {
                                if (err) {
                                    console.log(err);
                                }
                            }
                        );
                    });
                }),
                MDBW.put(tenantDbName, 'screens'),
                MDBW.put(tenantDbName, 'screens_templates'),

                MDBW.put(tenantDbName, 'datawidgets_categories', {
                    "ownerId": "",
                    "name": "Default",
                    "application": "",
                    "requestDate": new Date(),
                    "visibility": "visible",
                    "platform": "web",
                    "versioning": {
                        "status":      "added",
                        "user":        "admin",
                        "last_action": (new Date() / 1000).toFixed()
                    }
                }),
                MDBW.put(tenantDbName, 'datawidgets_categories', {
                    "ownerId": "",
                    "name": "Default",
                    "application": "",
                    "requestDate": new Date(),
                    "visibility": "visible",
                    "platform": "mobile",
                    "versioning": {
                        "status":      "added",
                        "user":        "admin",
                        "last_action": (new Date() / 1000).toFixed()
                    }
                }),
                MDBW.put(tenantDbName, 'dataqueries_categories', {
                    "ownerId": "",
                    "name": "Default",
                    "application": "",
                    "requestDate": new Date(),
                    "visibility": "visible",
                    "versioning": {
                        "status":      "added",
                        "user":        "admin",
                        "last_action": (new Date() / 1000).toFixed()
                    }
                })
            ])
                .then(function(){
                    if (limits) return limits.initDefaultLimits(tenantName);
                })
                // we are NOT creating guest role for the whole tenant anymore
                /*.then(function(){
                 generateRoles.push(
                 roles.create({
                 tenant      : tenantName,
                 name        : 'guest',
                 unremovable : true,
                 description : ''
                 })
                 )
                 })*/
                .then(function(){
                    generateRoles.push(
                        roles.create({
                            tenant      : tenantName,
                            name        : sharedAppRole,
                            unremovable : true,
                            description : '',
                            shared      : true
                        })
                    )
                })
                .then(function(){
                    if ( !bm ) return exports.user.create({
                        tenant : tenantName,
                        login  : SETTINGS.default_user.id,
                        pass   : userPassword,
                        kind   : 'system',
                        roles  : {
                            list      : SETTINGS.default_user.roles_list,
                            'default' : SETTINGS.default_user.roles_list[0]
                        },
                        lastName : '',
                        firstName : ''
                    });

                    else return  exports.user.create({
                        tenant : tenantName,
                        login  : bm.userId,
                        pass   : '',
                        kind   : 'system',
                        type   : bm.userType,
                        roles  : {
                            list      : bm.rolesList,
                            'default' : bm.rolesList[0]
                        },
                        lastName  : bm.lastName  || '',
                        firstName : bm.firstName || ''
                    });

                })
                .then(function(){
                    activator.add(tenantName);
                }) // to return undefined
        })
};



/**
 * removes tenant from 'dreamface_sysdb'
 * and removes all tenant's databases
 *
 * @param {String} tenantName
 * @param {Boolean} [quiet=false] to not reject if the tenant is not exist
 * @returns {Promise}
 */
exports.remove = function( tenantName, quiet ) {
    return validateName(tenantName)
        .then(function(){
            return MDBW.exists(sysdbName, tenantsClName, {'id':tenantName});
        })
        .then(function(exists){
            return exists
                ? MDBW.get()
                // find and remove all tenant's databases
                .then(function(dbs){
                    var isThisTenantsDatabase = new RegExp('^' + repositoryPrefix + tenantName);

                    return Q.all(
                        dbs.map(function(dbName){
                            if (isThisTenantsDatabase.test(dbName)) {
                                MDBW.rm(dbName);
                            }
                        })
                    );
                })
                // remove tenant's record in sysdb, auth providers and db drivers
                .then(function(){
                    return MDBW.rm(sysdbName, tenantsClName, {'id':tenantName})
                        .then(function(){
                            return MDBW.rm(authProvidersDbName, tenantName)
                                .then(function(){
                                    var filePath = path.join(RESOURCES_DEV_PATH, tenantName);
                                    return MDBW.rm(dbDriversDbName, tenantName).then(function(){
                                        QFS.removeTree(filePath);
                                    });
                                })
                        });
                    activator.delete(tenantName);
                })
                : quiet
                ? Q.resolve()
                : Q.reject('Tenant "'+tenantName+'" is not exists. Nothing done.')
        });
};

/**
 * @param {String} tenantName
 * @param {Object} query
 * @returns {Promise * Object | Undefined} entire tenant's record from sysdb
 */
exports.edit = function( tenantName, query ) {
    return MDBW.update(sysdbName, tenantsClName, {"id": tenantName}, {$set : query});
}

/**
 * @param {String} tenantName
 * @param {Object} o 'write' and 'read' permissions for the token
 *      if 'o' is not specified both permissions will be set to 'true'
 * @returns {String} new token (random hex string)
 */
exports.generateNewDatabaseToken = function(tenantName, o) {
    if ( !tenantName || typeof tenantName !== 'string' ) {
        return Q.reject('Need tenant\'s name. No token was created.');
    }
    if ( o && typeof o !== 'object' ) {
        return Q.reject('Access options must be an object. No token was created.');
    }
    o = o || {read: true, write: true};
    if ( typeof o.read !== 'boolean' || typeof o.write !== 'boolean' ) {
        return Q.reject('Type of options "read" and "write" must be a boolean.');
    }

    return getRandomString(tokenLength)
        .then(function(randomString){
            return MDBW.get(sysdbName, tenantsClName, {'id': tenantName})
                .then(function(records){
                    if ( records.length < 1 ) {
                        return Q.reject('Tenant "' + tenantName + '" not exists. Nothing done.' );
                    }
                    if ( records.length > 1 ) {
                        return Q.reject('More than one tenant with the name "' + tenantName + '". Nothing done.');
                    }
                    var record = records[0];
                    if ( ! record.hasOwnProperty('databaseTokens') ) record.databaseTokens = {};
                    record.databaseTokens[randomString] = {
                        permissions: {
                            read: o.read,
                            write: o.write
                        }
                    };
                    return MDBW.put(sysdbName, tenantsClName, record)
                        .then(function(){return randomString});
                })
        });
}


/**
 * @param {String} tenantName
 * @param {String} token
 */
exports.removeDatabaseToken = function(tenantName, token) {
    if ( !tenantName || typeof token !== 'string' ) return Q.reject('Need tenant\'s name. Nothing was removed.');
    if ( !token || typeof token !== 'string' ) return Q.reject('Need token to remove. Nothing was removed.');

    return MDBW.get(sysdbName, tenantsClName, {'id': tenantName})
        .then(function(records){
            if ( records.length < 1 ) {
                return Q.reject('Tenant "' + tenantName + '" not exists. Nothing done.' );
            }
            if ( records.length > 1 ) {
                return Q.reject('More than one tenant with the name "' + tenantName + '". Nothing done.');
            }
            var record = records[0];
            if ( ! record.hasOwnProperty('databaseTokens') ) record.databaseTokens = {};
            delete record.databaseTokens[token];
            return MDBW.put(sysdbName, tenantsClName, record);
        })
};


/**
 * TODO add counter at the end
 *
 * @param {Number} length
 * @returns {String} random hex string
 */
function getRandomString ( length ) {
    var D = Q.defer();
    CRYPTO.randomBytes( (length / 2), function(ex, buffer) {
        D.resolve( buffer.toString('hex') );
    });
    return D.promise;
}

/**
 * @param {String} str
 * @returns {Promise * Undefined}
 */
function validateName ( str ) {
    return !str || !/^[a-z0-9_.-]+$/i.test(str)
        ? Q.reject(
        'Invalid symbols. Allowed: a-z, A-Z, 0-9, "-", "_", ".".' +
        'Got: "' + str + '"'
    )
        : Q.resolve();
}


function User ( tenantId, userId, superuser, application ) {

    if ( !superuser ) {
        Object.defineProperty(this, 'isSuperUser', {
            get : function userIdGetter () {
                return false;
            }
        });

        Object.defineProperty(this, 'userid', {
            get : function userIdGetter () {
                return userId;
            }
        });

        Object.defineProperty(this, 'tenantid', {
            get : function userIdGetter () {
                return tenantId;
            }
        });

        Object.defineProperty(this, 'application', {
            get : function userIdGetter () {
                return application;
            }
        });
    } else {
        Object.defineProperty(this, 'isSuperUser', {
            get : function userIdGetter () {
                return true;
            }
        });

        Object.defineProperty(this, 'userid', {
            get : function userIdGetter () {
                return;
            }
        });

        Object.defineProperty(this, 'tenantid', {
            get : function userIdGetter () {
                return;
            }
        });

        Object.defineProperty(this, 'application', {
            get : function userIdGetter () {
                return;
            }
        });
    }
}

User.fn = User.prototype;

User.fn.hasRight = function ( right, type ) {
    return this.isSuperUser
        ? Q.resolve(true)
        : exports.user.hasRight(this.tenantid, this.userid, right, type, this.application);
};

User.fn.hasEitherRight = function () {
    var that = this,
        requiredRights = arguments;

    return this.isSuperUser
        ? Q.resolve(true)
        : exports.user.getRoles(this.tenantid, this.userid, this.application).then(function(hasRoles){
        return roles.getRights({ tenant : that.tenantid, role : hasRoles.list, application: that.application })
            .then(function(rights){
                var has = false;

                for (var i = 0, l = requiredRights.length; i < l; i++) {

                    if ( !!~rights.indexOf(requiredRights[i]) ) {
                        has = true;
                        break;
                    }
                }

                return has ? Q.resolve() : Q.reject();
            })
    });
};

User.fn.getProperty = function ( propName ) {
    return this.isSuperUser
        ? undefined
        : exports.user.get(this.tenantid, this.userid, this.application).then(function(u){
        return u.hasOwnProperty(propName)
            ? Q.resolve(u[propName])
            : Q.reject('unknown user\'s property "' + propName + '"');
    })
};


exports.user = (function(){

    var u = {}; // exports

    var check = (function(){

        var isMailRight = /@/,
            isTypeRight = /^(?:openid|ldap)$/,
            isKindRight = /^(?:system|application)$/,
            isUrl       = /^https?:\/\/.+/i,

            MIN_PASS_LEVEL = SETTINGS.minPassStrengthLevel.user;


        return function check ( u, tenant ) {

            var pass = ( u.credentials.pass || '' ).toString();

            if ( ! isKindRight.test(u.kind)  ) return Q.reject('wrong value of "kind"');
            if ( u.type ) {
                if ( !isTypeRight.test(u.type)  ) return Q.reject('wrong value of "type"');
                if ( u.credentials.pass ) return Q.reject(
                    'user with type "' + u.type + '" must have no password'
                );
                if ( u.type === 'openid' && ! isUrl.test(u.credentials.login) ) {
                    return Q.reject('openId users must have an URL like a login.');
                }
                if ( u.type === 'ldap' ) {
                    if ( !u.credentials.provider ) return Q.reject('user with type "ldap" must have "provider" field');
                    if ( !u.credentials.dn       ) return Q.reject('user with type "ldap" must have "dn" field');
                    if ( !u.credentials.upn      ) return Q.reject('user with type "ldap" must have "upn" field');
                    if ( !u.credentials.uid      ) return Q.reject('user with type "ldap" must have "uid" field');
                }
            } else {
                if ( pass !== u.credentials.pass ) return Q.reject(
                    'password is absent or has wrong type'
                );

                if ( passwordStrenght(pass) < MIN_PASS_LEVEL ) return Q.reject(
                    'password is too weak'
                );
            }
            if ( !u.credentials.login ) return Q.reject('empty login');
            if ( u.email && ! isMailRight.test(u.email) ) return Q.reject(
                'wrong value of "email"'
            );

            // TODO check if ldap provider exists
            // TODO check if roles exists

            return Q.all([
                Q( roles.getStaffList() ),
                Q( roles.getAppsList(tenant)  )
            ])
                .spread(function(staffRolesList, appsRolesList){
                    var hasStaffRoles = hasSimilar(u.roles.list, staffRolesList),
                        hasAppsRoles  = hasSimilar(u.roles.list, appsRolesList);

                    if ( u.kind === 'system'      && hasAppsRoles  ) return Q.reject(
                        'system(staff) user can not have applications roles'
                    );
                    if ( u.kind === 'application' && hasStaffRoles ) return Q.reject(
                        'application user can not have system(staff) roles'
                    );
                });

        }
    })();

    u.touch = function (tenantId, userId, application ) {
        return new User(tenantId, userId, null, application);
    };


    /**
     * @param {String} tenant
     * @param {String} login (user login)
     * @param {String} pass
     *
     * @returns {Promise * undefined|String} string for error
     */
    u.checkCredentials = function ( tenant, login, pass ) {

        // TODO if type is either openid or ldap

        var tenantDbName = repositoryPrefix + tenant;

        return MDBW.get(tenantDbName, 'users', { 'credentials.login' : login })
            .then(function( docs ){

                if ( !docs.length ) return Q.reject('No such user');

                return Q.when(credCrypt.decrypt(docs[0].credentials.pass), function (truePass) {
                    return pass === truePass
                        ? Q.resolve()
                        : Q.reject('Wrong password');
                });
            });
    };

    function checkUsersLimit ( o ) {

        if ( o.kind !== 'system' ) return;

        return Q.all([
            limits.get({tenant : o.tenant, limit : 'users'}),
            listSystemUsers(o.tenant)
        ])
            .spread(function(sysUsersLimit, systemUsers){

                if ( sysUsersLimit && sysUsersLimit <= systemUsers.length ) {
                    return Q.reject(
                        'can not create user "' + o.login +
                        '", limit for system users is reached.'
                    );
                }
            })
    }

    function formatUser ( o ) {

        var user = {

            email : o.email,

            name : {
                last  : o.lastName  || '',
                first : o.firstName || ''
            },

            type : o.type || '',
            kind : o.kind,

            roles : {},

            credentials : {
                login : o.login
            }
        };

        var roles = o.roles instanceof Object ? o.roles : {};

        user.roles.list    = roles.list    || [];
        user.roles.default = roles.default || '';

        if ( o.pass )     user.credentials.pass     = o.pass;
        if ( o.provider ) user.credentials.provider = o.provider;
        if ( o.dn )       user.credentials.dn       = o.dn;
        if ( o.upn )      user.credentials.upn      = o.upn;
        if ( o.uid )      user.credentials.uid      = o.uid;
        if ( o.application ) user.application       = o.application;

        return user;
    }

    /**
     * creates a user
     *
     * @param {Object} o options
     *      @param {String}  o.tenant
     *      @param {String}  o.login
     *      @param {String}  o.application
     *      @param {String}  o.pass
     *      @param {String} [o.type='']   also can be 'ldap' or 'openid'
     *      @param {String} [o.firstName]
     *      @param {String} [o.lastName]
     *      @param {String} [o.email]
     *      @param {Object} [o.roles]
     *          @param {Array.<String>} [o.roles.list=[]]    roles assigned to the user
     *          @param {String}         [o.roles.default=''] default role
     *      @param {String} [o.provider] ldap provider
     *      @param {String} [o.dn]  ldap user dn
     *      @param {String} [o.upn] ldap user upn
     *      @param {String} [o.uid] ldap user uid
     * @param {Boolean} [staff]
     *
     * @returns {Promise * String|Object} string for error
     */
    u.create = function ( o, staff ) {

        return Q.when(checkUsersLimit(o), function(){

            var user = formatUser(o);

            var filter = (o.application) ? { 'credentials.login' : user.credentials.login, application: o.application } : { 'credentials.login' : user.credentials.login };

            if ( !o.tenant ) return Q.reject('need tenant');

            return check(user, o.tenant).then(function(){

                var tenantDbName = repositoryPrefix + o.tenant;

                return Q.all([
                    MDBW.exists(tenantDbName),
                    MDBW.exists(tenantDbName, 'users', filter),
                    (function(){
                        return user.credentials.pass
                            ? credCrypt.encrypt(user.credentials.pass)
                            : Q.resolve();
                    })()
                ]).spread(function(tenantExists, userExists, encryptedPass){
                    if ( !tenantExists ) return Q.reject('no such tenant');
                    if ( userExists ) return Q.reject('user already exists');

                    if ( encryptedPass ) user.credentials.pass = encryptedPass;
                    if (user.kind != 'system') user.roles.list.push(sharedAppRole);

                    user.versioning = {
                        "status":      (o.pull) ? 'committed' : 'added',
                        "user": o.userId,
                        "last_action": (new Date() / 1000).toFixed()
                    };
                    return MDBW.rm(tenantDbName, 'trash',{
                        'credentials.login' : user.credentials.login,
                        'application' : o.application,
                        'type' : 'users'
                    }).then(function(){
                        return MDBW.put(tenantDbName, 'users', user)
                            .then(function(){
                                log.info('addedd new user for tenant "'+o.tenant+'":', user);
                            });
                    });

                })
            });

        })
    };

    /**
     * creates band of users
     *
     * @param {Object} o
     *      @param {String}         o.tenant
     *      @param {Array.<Object>} o.band array of users (see method 'create' for options)
     *
     * @returns {Promise * Array.<String>|undefined} array of strings for errors
     */
    u.createband = function ( o ) {
        var tasks = [],
            errors = [];
        o.band.forEach(function(e){
            e.tenant = o.tenant;
            tasks.push(u.create(e).fail(function(error){errors.push(error)}))
        });

        return Q.all(tasks)
            .then(
            function () { return Q.resolve() },
            function () { return Q.reject(errors) }
        )
    };

    function updateUserFields ( user, o ) {
        if ( user.type !== 'staff' ) { // only password can be changed at staff user
            if ( o.email )     user.email                = o.email;
            if ( o.lastName ) user.name.last             = o.lastName;
            if ( o.firstName ) user.name.first           = o.firstName;
            if ( o.provider )  user.credentials.provider = o.provider;
            if ( o.dn )        user.credentials.dn       = o.dn;
            if ( o.upn )       user.credentials.upn      = o.upn;
            if ( o.uid )       user.credentials.uid      = o.uid;
            if ( o.application ) user.application        = o.application;
            if ( o.roles instanceof Object ) {
                if ( o.roles.list )    user.roles.list    = o.roles.list;
                if ( o.roles.default ) user.roles.default = o.roles.default;
            }

            if (user.kind != 'system' && user.roles.list.indexOf(sharedAppRole) == -1) {
                user.roles.list.push(sharedAppRole);
            }

            // additional properties
            if ( o.properties ) {
                for (var additional_prop in o.properties) {
                    if (o.properties.hasOwnProperty(additional_prop)) {
                        user[additional_prop] = o.properties[additional_prop];
                    }
                }
            }
        }

        if ( o.pass ) user.credentials.pass = o.pass;
        return user;
    }

    /**
     * updates a user
     *
     * @param {Object} o options
     *      @param {String}  o.tenant
     *      @param {String}  o.login
     *      @param {String} [o.pass]
     *      @param {String} [o.type]
     *      @param {String} [o.firstName]
     *      @param {String} [o.lastName]
     *      @param {String} [o.email]
     *      @param {Object} [o.roles]
     *          @param {Array.<String>} [o.roles.list]    roles assigned to the user
     *          @param {String}         [o.roles.default] default role
     *      @param {String} [o.provider] ldap provider
     *      @param {String} [o.dn]  ldap user dn
     *      @param {String} [o.upn] ldap user upn
     *      @param {String} [o.uid] ldap user uid
     *
     * @returns {Promise * String|Number} string for error number (1) if success
     */
    u.update = function (o) {

        if (!o.tenant) return Q.reject('need tenant');
        if (!o.login) return Q.reject('need login');

        var tenantDbName = repositoryPrefix + o.tenant;

        var filter = (o.application) ? { 'credentials.login' : o.login, application: o.application } : { 'credentials.login' : o.login };

        return Q.all([
            MDBW.exists(tenantDbName),
            MDBW.get(tenantDbName, 'users', filter).then(function(docs){

                return !docs || !docs.length
                    ? Q.reject('no such user')
                    : Q.resolve(docs[0]);
            }),
            (function(){
                return o.pass
                    ? credCrypt.encrypt(o.pass)
                    : Q.resolve();
            })()
        ]).spread(function (tenantExists, user, encryptedPass) {

            if (!tenantExists) return Q.reject('no such tenant');

            var oldLogin = user.credentials.login,
                id = user._id;

            delete user._id;

            updateUserFields(user, o);

            return check(user, o.tenant)
                .then(function() {

                    if (encryptedPass) user.credentials.pass = encryptedPass;

                    return MDBW.get(repositoryPrefix + o.tenant, 'users', {
                        'credentials.login': o.login,
                        application: o.application
                    }).then(function (users) {
                        if ((users[0]) && (users[0].versioning) && (users[0].versioning.status === 'committed')) {
                            user.versioning = {
                                status : "modified",
                                user : o.userId,
                                last_action : (new Date() / 1000).toFixed()
                            };
                        }
                        return MDBW.update(
                            tenantDbName,
                            'users',
                            {_id: id},
                            {$set: user},
                            {multi: false}
                        );
                    });
                })
                .then(function(){
                    log.info('user "'+oldLogin+'" for tenant "'+o.tenant+'" was updated:', user);
                });
        })
    };


    /**
     * @param {String} tenant
     * @param {String} login (user login)
     * @param {Boolean} [unsafe=false] with password
     * @param {String} application (application name)
     *
     * @returns {Promise * String|Object} string for error
     */
    u.get = function ( tenant, login, unsafe, application ) {

        var unsafe = true;  // TODO
        if ( application === '_preview' ) application = undefined;

        if ( !tenant ) return Q.reject('need tenant');
        if ( !login ) return Q.reject('need login');

        var filter = (application) ? { 'credentials.login' : login, application: application } : { 'credentials.login' : login };

        return MDBW.get(
            repositoryPrefix + tenant,
            'users',
            filter
        )
            .then(function(docs){
                return docs && docs.length
                    ? dbEntryFormat.unpack(docs[0], tenant, unsafe, application)
                    : MDBW.get( // TODO remove the copypaste
                    repositoryPrefix + tenant,
                    'users',
                    { 'credentials.login' : login }
                )
                    .then(function(docs){
                        return docs && docs.length
                            ? dbEntryFormat.unpack(docs[0], tenant, unsafe, application)
                            : Q.reject('no such user: ' + login)
                    })

            })
    };

    var dbEntryFormat = {
        pack : function ( user ) {
        },

        unpack : function ( entry, tenant, unsafe, application ) {

            return Q.all([
                ( unsafe ? credCrypt.decrypt(entry.credentials.pass) : '' ),
                roles.getRights({ tenant : tenant, role : entry.roles.list, application: application })
            ])
                .spread(function (pass, rights) {
                    var user = {
                        tenant     : tenant,
                        login      : entry.credentials.login,
                        roles      : entry.roles,
                        rights     : rights,
                        email      : entry.email,
                        type       : entry.type || '',
                        lastName   : entry.name.last,
                        firstName  : entry.name.first,
                        kind       : entry.kind,
                        application : entry.application,
                        _id        : entry['_id']
                    };

                    if ( entry.type === 'ldap' ) {
                        user.dn = entry.credentials.dn;
                        user.ldapProvider = entry.credentials.provider;
                    } else {
                        if ( unsafe ) {
                            user.pass = pass;
                            user.password = pass;
                        }

                        // Add additional user properties
                        var mandatory_user_props = ['name', 'email', 'credentials', 'roles', 'type'];
                        for (var user_prop in entry) {
                            if (entry.hasOwnProperty(user_prop)) {
                                if (mandatory_user_props.indexOf(user_prop) == -1) {
                                    user[user_prop] = entry[user_prop];
                                }
                            }
                        }

                        return Q.resolve(user);
                    }

                    return Q.resolve(user);
                });
        }
    };

    function listSystemUsers ( tenant ) {
        return u.list(tenant).then(function(list){
            return list.filter(function(user){
                return user.kind === 'system'
            });
        });
    }


    /**
     * @param {String} tenant
     * @param {Boolean} [unsafe=false] with password
     *
     * @returns {Promise * String|Array.<Object>} promise for array of users
     *                                            or string for error
     */
    u.list = function (tenant, unsafe, currentUser, application, filter) {
        if (!tenant) return Q.reject('can not list users for undefined tenant');

        var tenantDbName       = repositoryPrefix + tenant,
            includeStaffUsers  = true,
            includeCustomUsers = true,
            list               = [];

        filter = filter || (application ? {application: application} : {application: {$exists: false}});

        return (function () {
            if (!currentUser) return Q.resolve();
            else return Q.allSettled([
                currentUser.hasRight('listUsers::StaffUsers'),
                currentUser.hasRight('listUsers::CustomUsers')
            ]).spread(function (staff, custom) {
                includeStaffUsers  = staff.state === 'fulfilled';
                includeCustomUsers = custom.state === 'fulfilled';

                return includeStaffUsers || includeCustomUsers
                    ? Q.resolve()
                    : Q.reject();
            })
        })()
            .then(function () {
                return MDBW.get(tenantDbName, 'users', filter);
            })
            .then(function (docs) {
                if (!docs || !docs.length) return Q.resolve([]);

                var tasks = docs.map(function (doc) {
                    return dbEntryFormat.unpack(doc, tenant, unsafe, application)
                        .then(function (user) {
                            if (includeStaffUsers) {
                                if (!unsafe) {
                                    user.encrypted_password = doc.credentials.pass;
                                }
                                list.push(user);
                            } else {
                                return Q.when(roles.getStaffList(), function (staffRoles) {
                                    if (!hasSimilar(user.roles.list, staffRoles)) {
                                        if (!unsafe) {
                                            user.encrypted_password = doc.credentials.pass;
                                        }
                                        list.push(user);
                                    }
                                });
                            }
                        });
                });

                return Q.all(tasks)
                    .then(function () {
                        return Q.resolve(list);
                    });
            })
    };


    /**
     * @param {String} tenant
     * @param {String} login (user login)
     *
     * @returns {Promise * String|Number} string for error or 1 for success
     */
    u.remove = function ( tenant, login, currentUser, application, userId ) {
        if ( !tenant ) return Q.reject('need tenant');
        if ( !login ) return Q.reject('need login');
        if ( currentUser && currentUser.userid === login ) return Q.reject('user can\'t remove himself');

        var tenantDbName = repositoryPrefix + tenant,
            canManageStaffUsers = false,
            that = this;

        var filter = (application) ? { 'credentials.login' : login, application: application } : { 'credentials.login' : login };

        return (function () {
            return currentUser
                ? currentUser.hasRight('manageUsers::StaffUsers')
                : Q.resolve();
        })()
            .then(function () {
                canManageStaffUsers = true;
            },function () {
                console.log('current user ' + login + ' can not manage staff users');
            } )
            .then(function() {
                return Q.all([
                    that.get(tenant, login, null, application),
                    db.count(tenantDbName, 'users')
                ])
                    .spread(function(user, count){

                        if ( !canManageStaffUsers && user.type === 'staff' ) {
                            return Q.reject('current user has no right to remove the user');
                        }

                        if ( count === 1 ) return Q.reject('can\'t remove last user');

                        if ( user.type === 'staff' ) return Q.reject('staff user is unremovable');
                        return MDBW.get(tenantDbName, 'users', filter)
                            .then(function(users){
                                users[0].type = "users";
                                users[0].versioning = {
                                    status : "deleted",
                                    user : userId,
                                    last_action : (new Date() / 1000).toFixed()
                                };
                                return MDBW.put(repositoryPrefix + tenant, 'trash',users[0])
                                    .then(function(){
                                        return MDBW.rm(tenantDbName, 'users', filter)
                                            .then(function(){
                                                log.info('user "'+login+'" of the tenant "'+tenant+'" was removed.');
                                            })
                                    });
                            });
                    });
            })
    };

    /**
     * @param {String} tenant
     * @param {String} login (user login)
     *
     * @returns {Promise * String|Object} roles or error
     *     @returns {Array.<String>} [roles.list]    roles assigned to the user
     *     @returns {String}         [roles.default] default role
     */
    u.getRoles = function ( tenant, login, application ) {
        var tenantDbName = repositoryPrefix + tenant;
        return this.get(tenant, login, null, application)
            .then(function(user){ return user.roles });
    };

    /**
     * @param {String} tenant
     * @param {String} role
     *
     * @returns {Promise * String|undefined} string for error
     */
    u.removeRole = function ( tenant, role, application ) {

        var tenantDbName = repositoryPrefix + tenant;

        var filter = (application) ? { application: application } : {};
        var filterAppRoles = (application) ? { 'roles.default': role, application: application } : { 'roles.default': role };

        return MDBW.update(tenantDbName, 'users', filter, {$pull : {'roles.list' : role}})
            .then(function(){return MDBW.get(tenantDbName, 'users', filterAppRoles)})
            .then(function(docs){
                for ( var i = 0, l = docs.length; i < l; i++ ) MDBW.update(
                    tenantDbName, 'users',
                    {'_id': docs[i]['_id']},
                    {$set : {'roles.default' : docs[i].roles.list[0] || ''}}
                );
            })
    };

    /**
     * @param {String} tenant
     * @param {String} login
     * @param {String} right
     * @param {String} type only 'DATAQUERY' for now
     *
     * @returns {Promise * undefined} resolve if has, or reject otherwise
     */
    u.hasRight = function ( tenant, login, right, type, application ) {

        return u.getRoles(tenant, login, application)
            .then(
            function (roles) {

                //log.dbg(
                //    '[sysadmin/tenants/users/checkRight] the user "' + tenant + ':' + login + '" ' +
                //    'has roles: ' + JSON.stringify(roles, null, 4)
                //);

                return exports.role.getRights({
                    role   : roles.list,
                    tenant : tenant,
                    application : application
                })
            },
            function (error) {

                log.dbg(
                    '[sysadmin/tenants/users/checkRight] ERROR: can not get roles of the user "' +
                    tenant + ':' + login + '". Error: ' + error
                );

                return Q.reject();
            }
        )
            .then(
            function(rights){

                var rightName = type ? type + '::' + right : right,
                    hasRight = !!~rights.indexOf(rightName);

                //log.dbg(
                //    '[sysadmin/tenants/users/checkRight] the user "' + tenant + ':' + login + '" ' +
                //    'has rights: ' + JSON.stringify(rights, null, 4) +
                //    '\nChecking passed: ' + hasRight
                //);

                return hasRight ? Q.resolve() : Q.reject();
            },
            function (error) {

                log.dbg(
                    '[sysadmin/tenants/users/checkRight] can not get rights for the user "' + tenant + ':' + login + '".' +
                    '\nError: ' + error
                );

                return Q.reject();

            }
        )
    };

    u.searchByApp = function (req, res) {
        var filter = {
            application: req.params.applicationName,
            $or:         [
                {
                    'credentials.login': {
                        $regex:   req.query.q,
                        $options: 'i'
                    }
                },
                {
                    'name.first': {
                        $regex:   req.query.q,
                        $options: 'i'
                    }
                },
                {
                    'name.last': {
                        $regex:   req.query.q,
                        $options: 'i'
                    }
                }
            ],
            kind:        'application'
        };

        MDBW.get(repositoryPrefix + req.user.tenantid, 'users', filter).then(function (docs) {
            docs     = docs || [];
            var data = JSON.stringify({users: docs}, null, 0);
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('Content-Length', data.length);
            res.end(data);
        });
    };

    u.api = function (req, res, next) {
        var options    = req.body || {};
        options.tenant = req.session.tenant.id;
        options.userId = req.session.user.id;

        if (req.user instanceof User) options.currentUser = req.user;

        (function () {
            switch (req.params.action) {
                case 'list':
                    return u.list(options.tenant, false, options.currentUser, options.application);
                    break;
                case 'get':
                    return u.get(options.tenant, options.login, false, options.application);
                    break;
                case 'update':
                    return u.update(options);
                    break;
                case 'remove':
                    return u.remove(options.tenant, options.login, options.currentUser, options.application, options.userId);
                    break;
                case 'create':
                    return u.create(options);
                    break;
                case 'createband':
                    return u.createband(options);
                    break;
                case 'getRoles':
                    log.error('DEPRECATED API method /studio/users/getRoles is invoked.');
                    return u.getRoles(req.user.tenant, req.user.login, options.application);
                    break;
                default:
                    return Q.reject('unknown command');
            }
        })().then(
            function (data) {
                return {data: data, status: 200}
            },

            // TODO set appropriate status 400 or 500
            function (data) {
                return {data: data, status: 400}
            }
        ).then(function (o) {
                var answer = JSON.stringify({data: o.data}, null, 0);
                res.status(o.status);
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.setHeader('Content-Length', answer.length);
                res.end(answer);
            }).done();
    };


    return u;
})();

exports.right = {};

var roles = (function( tenants, users, rights ){

    // TODO watch for tenant.create, tenant.remove

    if ( typeof SETTINGS.staffRoles !== 'object' ) log.fatal(
        'SETTINGS.staffRoles is not object'
    );

    if ( !Object.keys(SETTINGS.staffRoles).length ) log.warn(
        'SETTINGS.staffRoles is empty'
    );

    // TODO check syntax of staffRoles

    var out = {};

    function normaliseAndFilterExistedRights ( rights, tenantId, applicationName ) {

        if ( !rights || !(rights instanceof Array) || !rights.length ) return Q([]);

        return storage.rightsList(tenantId, applicationName).then(function(allExistingRights){
            return rights.map(function( right ){
                return typeof right === 'object'
                    ? right.type + '::' + right.name
                    : right;
            })
                .filter(function(right){
                    return !!~allExistingRights.indexOf(right);
                });
        });
    }

    function composeDbName ( tenantId ) {
        return repositoryPrefix + tenantId;
    }

    var storage = function(){

// SEARCH staffRoles\|staffRights\|rolesCache\|rightsCache
        var innerStorage = {},

            staffRoles,
            staffRights,
            rolesCache,
            rightsCache,

            _cacheIsReady = Q.defer(),
            cacheIsReady = _cacheIsReady.promise;

        /**
         * @param {String|Object} toRemove
         * @param {String} tenantId
         *
         * @returns {Promise}
         */
        function removeRightsFromDb ( toRemove, tenantId ) {
            var tasks = [],
                apps = Object.keys( toRemove );

            if (apps.length) {
                for (var i = 0; i < apps.length; i++) {
                    var appRights = [].concat( Object.keys(toRemove[ apps[i] ]) );

                    var filter = (apps[i] == sharedCatalogName) ? { application: '' } : { application: apps[i] };
                    tasks.push( db.update(
                        composeDbName(tenantId),
                        'roles',
                        filter,
                        {$pullAll : {rights : appRights}}
                    ));
                }

                return Q.all(tasks)
                    .fail(log.error.bind(log))
                    .done();
            }
        }

        function fillStaffCache () {
            var roles = SETTINGS.staffRoles;

            for ( var roleName in roles ) {
                staffRoles[roleName] = {
                    description : roles[roleName].description || '',
                    rights : {}
                }

                for ( var rightName in roles[roleName].rights ) {

                    if ( roles[roleName].rights[rightName] ) {
                        staffRoles[roleName].rights[rightName] = true;
                    }

                    staffRights[rightName] = staffRights[rightName] || [];
                    staffRights[rightName].push(staffRoles[roleName].rights);
                }
            }
            return cache.Obj.set("staffRights", staffRights).then(function(){
                return cache.Obj.set("staffRoles", staffRoles).then(function(){
                    return _cacheIsReady.resolve();
                });
            })
        }

        function fillCache (onlyForCurrentTenant) {
            cacheIsReady = ( _cacheIsReady = Q.defer() ).promise;

            log.info( ( rolesCache ? 're' : '' ) + 'building roles cache');

            staffRoles  = {};
            staffRights = {};
            rolesCache  = {};
            rightsCache = {};

            fillStaffCache();

            return tenants.list()
                .then(function(tenantsList){
                    if (onlyForCurrentTenant) {
                        tenantsList = [];
                        tenantsList.push(onlyForCurrentTenant);
                    }
                    return Q.all(tenantsList.map(function(tenantId){
                        rolesCache[tenantId] = {};
                        rightsCache[tenantId] = {};

                        // all what I need here -- is to get dataqueries list
                        // but it is impossible to do in easy way with dfx_dataqueries.js
                        // so:
                        return db.get(composeDbName(tenantId), 'dataqueries').then(function(docs){
                            var existed = {};
                            existed[tenantId] = {};

                            docs.forEach(function(doc){
                                var right = 'DATAQUERY::' + doc.name,
                                    application = doc.application || sharedCatalogName;

                                rightsCache[tenantId][application] = rightsCache[tenantId][application] || {};
                                rightsCache[tenantId][application][right] = rightsCache[tenantId][application][right] || [];

                                existed[tenantId][application] = existed[tenantId][application] || {};
                                existed[tenantId][application][right] = true;
                            });

                            return existed;
                        })
                            .then(function(existedDataqueries){

                                var artefactRights = {};


                                return db.get(composeDbName(tenantId), 'roles')
                                    .then(function( docs ){
                                        docs.forEach(function(role){
                                            var application = role.application || sharedCatalogName;

                                            if ( staffRoles.hasOwnProperty(role.name) ) return log.warn(
                                                'Database entry for the tenant "' + tenantId +
                                                '" has staff role "' + role.name +
                                                '". The entry was ignored.'
                                            );

                                            rolesCache[tenantId][application] = rolesCache[tenantId][application] || {};
                                            rolesCache[tenantId][application][role.name] = {
                                                rights : {}
                                            };

                                            rightsCache[tenantId][application] = rightsCache[tenantId][application] || {};

                                            role.rights.forEach(function(right){

                                                if (
                                                    /^DATAQUERY::/.test(right) &&
                                                    existedDataqueries[tenantId][application] &&
                                                    !existedDataqueries[tenantId][application].hasOwnProperty(right)
                                                ) {

                                                    log.error(
                                                        'Role "' + role.name + '" of the tenant "' + tenantId +
                                                        '" contains right for the dataquery "' + right +
                                                        '", but the dataquery doesn\'t exist. The right will be removed.'
                                                    );

                                                    artefactRights[application] = artefactRights[application] || {};
                                                    artefactRights[application][right] = true;

                                                    return;
                                                }

                                                rolesCache[tenantId][application][role.name].rights[right] = true;
                                                rightsCache[tenantId][application][right] = rightsCache[tenantId][application][right] || [];
                                                rightsCache[tenantId][application][right].push(rolesCache[tenantId][application][role.name].rights);
                                            });

                                            rolesCache[tenantId][application][role.name]._id = role._id.toString();
                                            rolesCache[tenantId][application][role.name].unremovable = role.unremovable;
                                            rolesCache[tenantId][application][role.name].description = role.description || '';
                                            rolesCache[tenantId][application][role.name].application = role.application || '';
                                        });

                                        removeRightsFromDb(artefactRights, tenantId);
                                    });
                            });
                    }));
                })
                .then(function(){
                    return cache.Obj.set("staffRoles", staffRoles).then(function () {
                        return cache.Obj.set("staffRights", staffRights).then(function () {
                            if (!onlyForCurrentTenant) {
                                return cache.Obj.set("rolesCache", rolesCache).then(function () {
                                    return cache.Obj.set("rightsCache", rightsCache).then(function () {
                                        return _cacheIsReady.resolve();
                                    })
                                });
                            } else {
                                return cache.Obj.get("rolesCache").then(function (rolesCacheFromDB) {
                                    rolesCacheFromDB[onlyForCurrentTenant] = rolesCache[onlyForCurrentTenant];
                                    return cache.Obj.set("rolesCache", rolesCacheFromDB).then(function () {
                                        return cache.Obj.get("rightsCache").then(function (rightsCacheFromDB) {
                                            rightsCacheFromDB[onlyForCurrentTenant] = rightsCache[onlyForCurrentTenant];
                                            return cache.Obj.set("rightsCache", rightsCacheFromDB).then(function () {
                                                return _cacheIsReady.resolve();
                                            })
                                        });
                                    })
                                });
                            }
                        });
                    });
                });
        }

        fillCache();

        innerStorage.fillCache = fillCache;

        innerStorage.put = function ( w, name, tenantId ) {
            return cache.Obj.get("rolesCache").then(function(rolesCache) {
                return Q.when(cacheIsReady, function () {
                    db.put(composeDbName(tenantId), 'roles', w)
                        .fail(log.error.bind(log));
                    rolesCache[tenantId][w.application] = rolesCache[tenantId][w.application] || {};
                    rolesCache[tenantId][w.application][name] = w;
                    return cache.Obj.set("rolesCache", rolesCache).then(function(){
                        return _cacheIsReady.resolve();
                    });
                });
            });
        };

        innerStorage.exists = function (roleName, tenantId, applicationName) {
            return Q.when( cacheIsReady, function(){
                return cache.Obj.get("staffRoles").then(function(staffRoles) {
                    return cache.Obj.get("rolesCache").then(function(rolesCache) {
                        return staffRoles.hasOwnProperty(roleName) ||
                            rolesCache[tenantId][applicationName] &&
                            rolesCache[tenantId][applicationName].hasOwnProperty(roleName);
                    });
                });
            });
        };

        innerStorage.remove = function (roleName, tenantId, applicationName) {
            return Q.when( cacheIsReady, function () {
                var filter = (applicationName) ? {name: roleName, application: applicationName} : {name: roleName};
                db.rm(composeDbName(tenantId), 'roles', filter)
                    .fail(log.error.bind(log));

                delete rolesCache[tenantId][applicationName][roleName];

                return cache.Obj.set("rolesCache", rolesCache).then(function(){
                    return _cacheIsReady.resolve();
                });
            });
        };

        innerStorage.update = function ( w, roleName, tenantId, applicationName, userId ) {
            applicationName = applicationName || sharedCatalogName;

            return Q.when( cacheIsReady, function(){
                var toUpdate = {$set:{}};
                return cache.Obj.get("rolesCache").then(function(rolesCache) {
                    return cache.Obj.get("rightsCache").then(function (rightsCache) {
                        if (w.rights) {

                            rolesCache[tenantId][applicationName][roleName].rights = {};

                            w.rights.forEach(function (right) {

                                if (!rightsCache[tenantId][applicationName].hasOwnProperty(right)) {
                                    log.error(
                                        'Attempt to update the role "' + roleName +
                                        '" of the tenant "' + tenantId +
                                        '" with the right "' + right +
                                        '", but the right doesn\'t exist. The right is ignored.'
                                    );

                                    return;
                                }

                                rolesCache[tenantId][applicationName][roleName].rights[right] = true;
                            });

                            toUpdate.$set.rights = w.rights;
                        }

                        if (w.hasOwnProperty('description')) {
                            rolesCache[tenantId][applicationName][roleName].description = w.description;
                            toUpdate.$set.description = w.description;
                        }

                        var filter = applicationName == sharedCatalogName ? {name: roleName} : {
                            name: roleName,
                            application: applicationName
                        };

                        toUpdate.$set.versioning = {
                            "status": 'modified',
                            "user": userId,
                            "last_action": (new Date() / 1000).toFixed()
                        };

                        return MDBW.get(repositoryPrefix + tenantId, 'roles', {
                            name: roleName,
                            application: applicationName
                        }).then(function (roles) {
                            if ((roles[0]) && (roles[0].versioning) && (roles[0].versioning.status === 'added')) {
                                toUpdate.$set.versioning.status = "added";
                            }
                            db.update(
                                composeDbName(tenantId),
                                'roles',
                                filter,
                                toUpdate,
                                {multi: false}
                            ).fail(log.error.bind(log));

                            return cache.Obj.set("rolesCache", rolesCache).then(function () {
                                return _cacheIsReady.resolve();
                            });
                        });
                    });
                });
            });
        };

        innerStorage.addRightToRole = function ( right, app, role, tenantId ) {
            return cache.Obj.get("rolesCache").then(function (rolesCache){
                var roleName = app ? role : sharedAppRole,
                    appName = app ? app : sharedCatalogName,
                    filter = app ? {name: roleName, application: appName} : {name: roleName};

                return Q.when(cacheIsReady, function () {
                    var toUpdate = {$set: {}};

                    if (!rolesCache[tenantId][appName][roleName].rights) {
                        rolesCache[tenantId][appName][roleName].rights = {};
                    }

                    rolesCache[tenantId][appName][roleName].rights[right] = true;
                    return cache.Obj.set("rolesCache", tenantId + '.' + appName + '.' + roleName + '.rights.right', true).then(function(){
                        toUpdate.$set.rights = Object.keys(rolesCache[tenantId][appName][roleName].rights);

                        toUpdate.$set.versioning = {
                            "status": 'modified',
                            "user": 'admin',
                            "last_action": (new Date() / 1000).toFixed()
                        };

                        db.update(
                            composeDbName(tenantId),
                            'roles',
                            filter,
                            toUpdate,
                            {multi: false}
                        ).fail(log.error.bind(log));

                        return cache.Obj.set("rolesCache", rolesCache).then(function(){
                            return _cacheIsReady.resolve();
                        });
                    });
                });
            });
        };

        innerStorage.list = function ( tenantId, applicationName ) {
            return cache.Obj.get("rolesCache").then(function(rolesCache) {
                return cache.Obj.get("staffRoles").then(function (staffRoles) {
                    return Q.when(cacheIsReady, function () {

                        var answer = [];

                        var fetchRolesFromCache = function (app_name) {
                            for (var roleName in rolesCache[tenantId][app_name]) answer.push({
                                name: roleName,
                                application: app_name,
                                _id: rolesCache[tenantId][app_name][roleName]._id,//need for compiler
                                description: rolesCache[tenantId][app_name][roleName].description,
                                unremovable: rolesCache[tenantId][app_name][roleName].unremovable,
                                rights: Object.keys(rolesCache[tenantId][app_name][roleName].rights)
                            });
                        };

                        if (!applicationName) {// get roles for all apps in this tenant
                            var appNames = Object.keys(rolesCache[tenantId]);
                            for (var i = 0; i < appNames.length; i++) {
                                fetchRolesFromCache(appNames[i]);
                            }
                        } else {                // get roles for only one app in this tenant
                            fetchRolesFromCache(applicationName);
                        }

                        for (var roleName in staffRoles) answer.push({
                            name: roleName,
                            description: staffRoles[roleName].description,
                            rights: Object.keys(staffRoles[roleName].rights),
                            type: 'staff'
                        });

                        return answer;
                    });
                });
            });
        };

        innerStorage.get = function (roleName, tenantId, applicationName) {
            return Q.when( cacheIsReady, function(){
                return cache.Obj.get("staffRoles").then(function(staffRoles){
                    return cache.Obj.get("rolesCache").then(function(rolesCache){

                        var role = staffRoles.hasOwnProperty(roleName)
                            ? staffRoles[roleName]
                            : rolesCache[tenantId][applicationName] && rolesCache[tenantId][applicationName].hasOwnProperty(roleName)
                            ? rolesCache[tenantId][applicationName][roleName]
                            : roleName == sharedAppRole
                            ? rolesCache[tenantId][sharedCatalogName][roleName]
                            : null;

                        return !role
                            ? Q.reject()
                            : Q.resolve({
                            name : roleName,
                            description : role.description,
                            type : role.type || '',
                            unremovable: role.unremovable,
                            rights : Object.keys(role.rights)
                        });

                    });
                });
            });
        };

        innerStorage.changeRightsName = function ( from, to, tenantId, applicationName ) {
            return cache.Obj.get("rightsCache").then(function(rightsCache) {
                return Q.when(cacheIsReady, function () {
                    db.update(
                        composeDbName(tenantId),
                        'roles',
                        {rights: from, application: applicationName},
                        {$set: {"rights.$": to}},
                        {multi: true}
                    )
                        .fail(log.error.bind(log));

                    rightsCache[tenantId][applicationName][from].forEach(function (rights) {
                        rights[to] = rights[from];
                        delete rights[from];
                    });

                    rightsCache[tenantId][applicationName][to] = rightsCache[tenantId][applicationName][from];
                    delete rightsCache[tenantId][applicationName][from];

                    return cache.Obj.set("rightsCache", rightsCache).then(function(){
                        return _cacheIsReady.resolve();
                    });
                });
            });
        };

        innerStorage.removeRight = function ( rightName, tenantId, applicationName ) {
            return cache.Obj.get("rightsCache").then(function(rightsCache) {
                return cache.Obj.get("rolesCache").then(function (rolesCache) {
                    return Q.when(cacheIsReady, function () {
                        var toRemove = {};
                        toRemove[applicationName] = {};
                        toRemove[applicationName][rightName] = true;
                        removeRightsFromDb(toRemove, tenantId);

                        rightsCache[tenantId][applicationName || sharedCatalogName][rightName].forEach(function (rights) {
                            delete rights[rightName];
                        });

                        Object.keys(rolesCache[tenantId][applicationName || sharedCatalogName]).forEach(function (roleName) {
                            delete rolesCache[tenantId][applicationName || sharedCatalogName][roleName].rights[rightName];
                        });

                        delete rightsCache[tenantId][applicationName || sharedCatalogName][rightName];

                        return cache.Obj.set("rightsCache", rightsCache).then(function(){
                            return cache.Obj.set("rolesCache", rolesCache).then(function(){
                                return _cacheIsReady.resolve();
                            });
                        })
                    });
                });
            });
        };

        innerStorage.existsRight = function ( rightName, tenantId, applicationName ) {
            return cache.Obj.get("rightsCache").then(function(rightsCache) {
                return cache.Obj.get("staffRights").then(function (staffRights) {
                    return Q.when(cacheIsReady, function () {
                        return (rightsCache[tenantId][applicationName || sharedCatalogName]
                            && rightsCache[tenantId][applicationName || sharedCatalogName].hasOwnProperty(rightName))
                            || staffRights.hasOwnProperty(rightName);
                    });
                });
            });
        };

        innerStorage.createRight = function ( rightName, tenantId, applicationName ) {
            return cache.Obj.get("rightsCache").then(function(rightsCache) {
                applicationName = applicationName || sharedCatalogName;

                return Q.when(cacheIsReady, function () {
                    return rightsCache[tenantId][applicationName][rightName] = [];
                });
            });
        };

        innerStorage.rightsList = function ( tenantId, applicationName ) {
            return cache.Obj.get("rightsCache").then(function(rightsCache) {
                return cache.Obj.get("staffRights").then(function (staffRights) {
                    return Q.when(cacheIsReady, function () {
                        var appRights = rightsCache[tenantId][applicationName]
                            ? Object.keys(rightsCache[tenantId][applicationName])
                            : [];

                        return appRights
                            .concat(Object.keys(staffRights));
                    });
                });
            });
        };

        innerStorage.getAppsList = function (tenantid) {
            return cache.Obj.get("rolesCache").then(function (rolesCache) {
                return Q.when(cacheIsReady, function () {
                    return Object.keys(rolesCache[tenantid]);
                });
            });
        };

        innerStorage.getStaffList = function () {
            return cache.Obj.get("staffRoles").then(function (staffRoles) {
                return Q.when(cacheIsReady, function () {
                    return Object.keys(staffRoles);
                });
            });
        };

        innerStorage.addTenantToCache = function ( tenantId ) {
            return cache.Obj.get("rolesCache").then(function (rolesCacheFromDB) {
                rolesCacheFromDB[tenantId] = {};
                return cache.Obj.set("rolesCache", rolesCacheFromDB).then(function () {
                    return cache.Obj.get("rightsCache").then(function (rightsCacheFromDB) {
                        rightsCacheFromDB[tenantId] = {};
                        return cache.Obj.set("rightsCache", rightsCacheFromDB).then(function () {
                            return _cacheIsReady.resolve();
                        })
                    });
                })
            });
        };

        innerStorage.ifTenantExists = function ( tenantId ) {
            return Q.when( cacheIsReady, function(){
                return cache.Obj.get("rolesCache").then(function(rolesCache){
                    return rolesCache.hasOwnProperty(tenantId)
                        ? Q.resolve()
                        : Q.reject();
                })
            });
        };

        innerStorage.isRightStaff = function ( right ) {
            return cache.Obj.get("staffRights").then(function (staffRights) {
                return Q.when(cacheIsReady, function () {
                    return staffRights.hasOwnProperty(right);
                });
            });
        };

        innerStorage.isRoleUnremovable = function ( role, tenantid, applicationName ) {
            return cache.Obj.get("rolesCache").then(function (rolesCache) {
                return cache.Obj.get("staffRoles").then(function (staffRoles) {
                    return Q.when(cacheIsReady, function () {
                        return !!(
                        rolesCache[tenantid][applicationName][role].unremovable ||
                        staffRoles.hasOwnProperty(role)
                        );
                    });
                });
            });
        };

        innerStorage.isRoleStaff = function ( role ) {
            return cache.Obj.get("staffRoles").then(function (staffRoles) {
                return Q.when(cacheIsReady, function () {
                    return staffRoles.hasOwnProperty(role);
                });
            });
        };

        storage = innerStorage;
    };

    out.create = function ( o, staff ) {
        return storage.ifTenantExists(o.tenant).then(function(){

                return Q.all([
                    normaliseAndFilterExistedRights(o.rights, o.tenant, o.application),
                    storage.exists(o.name, o.tenant, o.application)
                ])
                    .spread(function(rights, roleExists){

                        if ( roleExists ) return Q.reject(log.error(
                            'Role "' + o.name + '" already exists. Nothing was created.'
                        ));

                        return MDBW.rm(repositoryPrefix + o.tenant, 'trash',{
                            'name' : o.name,
                            'application' : o.application,
                            'type' : 'roles'
                        }).then(function() {
                            return storage.put({
                                name: o.name,
                                application: (o.application ? o.application : ''),
                                rights: rights,
                                type: staff ? 'staff' : '',
                                unremovable: !!( o.unremovable || staff ),
                                description: o.description || '',
                                versioning: {
                                    "status": "added",
                                    "user": o.userId,
                                    "last_action": (new Date() / 1000).toFixed()
                                }
                            }, o.name, o.tenant);
                        });
                    });
            },
            function () {
                return Q.reject(log.error(
                    'Tenant "' + o.tenant + '" doesn\'t exist. Role "' +
                    o.name + '" was not created.'
                ));
            });
    };

    out.remove = function ( o ) {

        return storage.ifTenantExists(o.tenant)
            .fail(function () {
                return Q.reject(log.error(
                    'Tenant "' + o.tenant + '" doesn\'t exist. Role "' +
                    o.name + '" was not removed.'
                ));
            })
            .then(function () {
                return storage.isRoleUnremovable(o.name, o.tenant, o.application);
            })
            .then(function(roleUnremovable){

                if ( roleUnremovable ) return Q.reject(log.error(
                    'Role "' + o.name + '" can not be removed.'
                ));

                return storage.exists(o.name, o.tenant, o.application).then(function(roleExists){

                    if ( !roleExists ) return Q.reject(log.error(
                        'Role "' + o.name + '" doesn\'t exist, so was not removed.'
                    ));

                    return MDBW.get(composeDbName(o.tenant), 'roles', {name: o.name , application: o.application})
                        .then(function(roles){
                            roles[0].type = "roles";
                            roles[0].versioning = {
                                status : "deleted",
                                user : o.userId,
                                last_action : (new Date() / 1000).toFixed()
                            };
                            return MDBW.put(repositoryPrefix + o.tenant, 'trash',roles[0])
                                .then(function(){
                                    return users.removeRole(o.tenant, o.name, o.application).then(function () {
                                        return storage.remove(o.name, o.tenant, o.application);
                                    });
                                });
                        });
                });
            });
    };

    out.update = function ( o ) {

        return storage.ifTenantExists(o.tenant).then(function(){
                return Q.all([
                    normaliseAndFilterExistedRights(o.rights, o.tenant, o.application),
                    storage.exists(o.name, o.tenant, o.application),
                    storage.isRoleStaff(o.name)
                ])
                    .spread(function(rights, roleExists, isStaffRole){
                        if ( isStaffRole ) return Q.reject(log.error(
                            'Attempt to update staff role "' + o.name +
                            '". Staff roles can not be changed.'
                        ));

                        if ( !roleExists ) return Q.reject(log.error(
                            'Role "' + o.name + '" doesn\'t exist, so nothing to update.'
                        ));

                        var toUpdate = {};

                        if ( o.hasOwnProperty('description') ) toUpdate.description = o.description;
                        if ( o.rights && o.rights.length ) toUpdate.rights = o.rights;

                        // TODO
                        // this is a cratch
                        // if you remove all rigts from a role at a client-side
                        // the 'rights' property is an empty Array, but
                        // jQuery does not send the empty-array-property at all in this case
                        // so if we have got neither of these properties -- it means it is empty rights
                        if ( !o.hasOwnProperty('rights') ) {
                            toUpdate.rights = [];
                        }

                        return Object.keys(toUpdate).length
                            ? storage.update(toUpdate, o.name, o.tenant, o.application, o.userId)
                            : Q.reject(log.error('Nothing to update.', o));
                    })
            },
            function () {
                return Q.reject(log.error(
                    'Tenant "' + o.tenant + '" doesn\'t exist. Role "' +
                    o.name + '" was not updated.'
                ));
            });
    };

    out.list = function ( o ) {

        var includeStaffRoles    = true,
            includeCustomRoles   = true,
            includeRoleAdmin     = true,
            includeRoleDeveloper = true,
            toRemove = [];


        return storage.ifTenantExists(o.tenant)
            .fail(function () {
                return Q.reject(log.error(
                    'Tenant "' + o.tenant + '" doesn\'t exist. Can\'t give roles list.'
                ));
            })
            .then(function(){
                if ( !o.currentUser ) return;
                else return Q.allSettled([
                    o.currentUser.hasRight('assignAny::StaffRoles'),
                    o.currentUser.hasRight('assignAny::CustomRoles'),
                    o.currentUser.hasRight('assignStaffRole::admin'),
                    o.currentUser.hasRight('assignStaffRole::developer')
                ]).spread(function(staff, custom, admin, developer){
                    includeStaffRoles    = staff.state     === 'fulfilled';
                    includeCustomRoles   = custom.state    === 'fulfilled';
                    includeRoleAdmin     = admin.state     === 'fulfilled';
                    includeRoleDeveloper = developer.state === 'fulfilled';

                    if ( !includeStaffRoles && !includeRoleDeveloper ) toRemove.push('developer');
                    if ( !includeStaffRoles && !includeRoleAdmin )     toRemove.push('admin');

                    return includeCustomRoles || includeStaffRoles || includeRoleDeveloper || includeRoleAdmin
                        ? Q.resolve()
                        : Q.reject();
                })
            })
            .then(function(){
                return storage.list(o.tenant, o.application);
            })
            .then(
            function(list){
                return list.filter(function(role){
                    return !~toRemove.indexOf(role.name);
                })
            },
            function(){
                return [];
            }
        )

    };

    out.get = function ( o ) {

        return storage.ifTenantExists(o.tenant).then(function(){
                return storage.get(o.name, o.tenant, o.application);
            },
            function () {
                return Q.reject(log.error(
                    'Tenant "' + o.tenant +
                    '" doesn\'t exist. Can\'t give the role "' + o.name + '".'
                ));
            });
    };

    out.getRights = function ( o ) {
        // TODO find if it is used anywhere
        // TODO add staffRoles too

        return storage.ifTenantExists(o.tenant).then(function () {
                var roles = [].concat(o.role),
                    rights = {};

                return Q.all(roles.map(function(roleName) {
                    return storage.get(roleName, o.tenant, o.application).then(function(role) {

                        if (typeof role !== 'object' || !(role.rights instanceof Array)) return;
                        role.rights.forEach(function(right) { rights[right] = true });
                    });
                }))
                    .then(function(){
                        return Object.keys(rights);
                    });
            },
            function () {
                return Q.reject(log.error(
                    'Tenant "' + o.tenant +
                    '" doesn\'t exist. Can\'t getRights for the role "'
                    + o.name + '".'
                ));
            });
    };

    out.changeRightsName = function ( o ) {
        return storage.ifTenantExists(o.tenant).then(function(){
                return Q.all([
                    storage.existsRight(o.from, o.tenant, o.application),
                    storage.existsRight(o.to, o.tenant, o.application),
                    storage.isRightStaff(o.from),
                    storage.isRightStaff(o.to)
                ])
                    .spread(function( existsFrom, existsTo, isStaffFrom, isStaffTo ){

                        if ( !existsFrom ) return Q.reject(log.error(
                            'Right name "' + o.from +
                            '" doesn\'t exist. Can\'t change right\'s name from "' +
                            o.from + '" to "' +
                            o.to + '".'
                        ));

                        if ( existsTo ) return Q.reject(log.error(
                            'Right name "' + o.from +
                            '" already exist. Can\'t change right\'s name from "' +
                            o.from + '" to "' +
                            o.to + '".'
                        ));

                        if ( isStaffFrom ) return Q.reject(log.error(
                            'Right name "' + o.from +
                            '" already exist. Can\'t change right\'s name from "' +
                            o.from + '" to "' +
                            o.to + '".'
                        ));

                        if ( isStaffTo ) return Q.reject(log.error(
                            'Right name "' + o.from +
                            '" already exist. Can\'t change right\'s name from "' +
                            o.from + '" to "' +
                            o.to + '".'
                        ));

                        return storage.changeRightsName(o.from, o.to, o.tenant, o.application);
                    });
            },
            function () {
                return Q.reject(log.error(
                    'Tenant "' + o.tenant +
                    '" doesn\'t exist. Can\'t change right\'s name from "' +
                    o.from + '" to "' +
                    o.to + '".'
                ));
            });
    };

    out.removeRight = function ( o ) {

        return storage.ifTenantExists(o.tenant).then(function(){
                return storage.existsRight(o.right, o.tenant, o.application)
                    .then(function( exists ){
                        if ( !exists ) return Q.reject(log.error(
                            'Right name "' + o.right + '" doesn\'t exist. Can\'t remove'
                        ));

                        return storage.removeRight(o.right, o.tenant, o.application);
                    });
            },
            function () {
                return Q.reject(log.error(
                    'Tenant "' + o.tenant +
                    '" doesn\'t exist. Can\'t remove right  "' +
                    o.right + '".'
                ));
            });
    };

    var casualRightTypeRegExp = /^(DATAQUERY)::(.+)$/,
        staffRightTypeRegExp  = /^(accessRealm|assignRight)::(.+)$/;

    out.rightsList = function ( o ) {

        return storage.rightsList(o.tenant, o.application).then(function(listOfRightsNames){
            var result = [];

            listOfRightsNames.map(function(rightName){
                var arr = casualRightTypeRegExp.exec(rightName);
                if ( arr && arr[1] === 'DATAQUERY' ) {
                    result.push({
                        type : 'DATAQUERY',
                        name : arr[2],
                        id   : rightName
                    });
                }
            });

            return result;
        });
    };

    out.api = function ( req, res, next ) {
        var options   = req.body || {};
        options.tenant = req.session.tenant.id;
        options.userId = req.session.user.id;

        if ( req.user instanceof User ) options.currentUser = req.user;

        (function(){
            switch (req.params.action) {
                case 'get':
                    return out.get(options);
                    break;
                case 'getRights':
                    return out.getRights(options);
                    break;
                case 'list':
                    return out.list(options);
                    break;
                case 'rightsList':
                    return out.rightsList(options);
                    break;
                case 'update':
                    return out.update(options);
                    break;
                case 'remove':
                    return out.remove(options);
                    break;
                case 'create':
                    return out.create(options);
                    break;
                default:
                    return Q.reject('unknown command');
            }
        })().then(
            function(data){
                return {data: data, status: 200}
            },
            function(data){
                return {data: data, status: 400}
            }
        ).then(function(o){
                var answer = JSON.stringify({data: o.data}, null, 0);
                res.status( o.status );
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.setHeader('Content-Length', answer.length);
                res.end(answer);
            }).done();
    };

    out.searchByApp = function (req, res) {
        var filter = {
            application: req.params.applicationName,
            $or:         [
                {
                    name: {
                        $regex:   req.query.q,
                        $options: 'i'
                    }
                },
                {
                    description: {
                        $regex:   req.query.q,
                        $options: 'i'
                    }
                }
            ]
        };

        MDBW.get(repositoryPrefix + req.user.tenantid, 'roles', filter).then(function (docs) {
            docs     = docs || [];
            var data = JSON.stringify({roles: docs}, null, 0);
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('Content-Length', data.length);
            res.end(data);
        });
    };


    CHANNELS.root.subscribe('DATAQUERY.created', function ( event, data ) {

        var rightName = 'DATAQUERY::' + data.queryName;

        storage.ifTenantExists(data.tenant)
            .then(function(){
                storage.existsRight(rightName, data.tenant, data.application)
                    .then(function( exists ){
                        if ( exists ) return log.error(
                            'Right name "' + rightName + '" already exists. Can\'t create.'
                        );

                        storage.createRight(rightName, data.tenant, data.application);

                        storage.addRightToRole(rightName, data.application, "guest", data.tenant);
                    });
            },
            function () {
                log.error(
                    'Tenant "' + data.tenant +
                    '" doesn\'t exist. Can\'t create right  "' +
                    rightName + '".'
                );
            });
    });

    CHANNELS.root.subscribe('DATAQUERY.removed', function ( event, data ) {

        var rightName = 'DATAQUERY::' + data.queryName;

        out.removeRight({
            right : rightName,
            tenant : data.tenant,
            application : data.application
        });
    });

    CHANNELS.root.subscribe('DATAQUERY.changed_name', function ( event, data ) {

        out.changeRightsName({
            tenant : data.tenant,
            from   : 'DATAQUERY::' + data.from,
            to     : 'DATAQUERY::' + data.to,
            application : data.application
        });
    });

    CHANNELS.root.subscribe('TENANTS.created', function ( event, data ) {
        storage.addTenantToCache(data.tenant);
    });

    out.init = function() {
        storage();

        out.getStaffList = storage.getStaffList;

        out.getAppsList = storage.getAppsList;

        out.rebuildCache = storage.fillCache;
    };

    return out;

})(tenants, exports.user, exports.right);

exports.role = roles;

var userDefinition = (function () {
    var exports = {
        fetch: function (req, res, callback) {
            var filter = (req.params.applicationName)
                ? {document: 'userDefinition', application: req.params.applicationName}
                : {document: 'userDefinition'};

            MDBW.count(repositoryPrefix + req.session.tenant.id, 'metadata', filter).then(function (number) {
                if (number) {
                    MDBW.getOne(repositoryPrefix + req.session.tenant.id, 'metadata', filter)
                        .then(function (document) {
                            callback(document);
                        });
                } else {
                    exports.create(req, callback);
                }
            }).fail(function (err) {
                log.error(err);
            });
        },

        create: function (req, callback) {
            this.getTemplate(function (json) {
                if (req.params.applicationName) { json.application = req.params.applicationName; }
                json.versioning = {
                    status : "added",
                    user : req.session.user.id,
                    last_action : (new Date() / 1000).toFixed()
                };
                MDBW.put(repositoryPrefix + req.session.tenant.id, 'metadata', json)
                    .then(function () {
                        callback(json);
                    });
            });
        },

        get: function (applicationName, tenantid) {
            var filter = applicationName
                ? {document: 'userDefinition', application: applicationName}
                : {document: 'userDefinition'};

            return MDBW.count(repositoryPrefix + tenantid, 'metadata', filter).then(function (number) {
                if (number) {
                    return MDBW.getOne(repositoryPrefix + tenantid, 'metadata', filter);
                } else {
                    return exports.createNew(applicationName, tenantid);
                }
            }).fail(function (err) {
                log.error(err);
            });
        },

        createNew: function (applicationName, tenantid) {
            return Q.nfcall(fs.readFile, path.join(__dirname, '../..', 'templates/static_json/blanks/user-definition.json'))
                .then(function (buffer) {
                    var json = JSON.parse(buffer.toString('utf-8'));
                    if (applicationName) { json.application = applicationName; }
                    json.versioning = {
                        status : "added",
                        user : "admin",
                        last_action : (new Date() / 1000).toFixed()
                    };
                    return MDBW.put(repositoryPrefix + tenantid, 'metadata', json);
                });
        },

        getTemplate: function (callback) {
            fs.readFile(path.join(__dirname, '../..', 'templates/static_json/blanks/user-definition.json'), 'utf8', function (err_log, data) {
                callback(JSON.parse(data));
            });
        },

        update: function (def, req, callback) {
            var filter = {document: 'userDefinition'};

            if (def.applicationName) {
                filter.application = def.applicationName;
                delete def.applicationName;
            }
            MDBW.getOne(repositoryPrefix + req.session.tenant.id, 'metadata', filter)
                .then(function(definition){
                    var status = "added";
                    if ((definition) && (definition.versioning)
                        && ((definition.versioning.status === 'committed')
                        || (definition.versioning.status === 'modified'))){
                        status = "modified";
                    }
                    MDBW.update(repositoryPrefix + req.session.tenant.id, 'metadata', filter, {
                        $set: {
                            requestDate: new Date(),
                            versioning : {
                                "status": status,
                                "user": req.session.user.id,
                                "last_action": (new Date() / 1000).toFixed()
                            },
                            metadata:    def
                        }
                    }).then(function (quantity) {
                        callback(quantity);
                    })
                        .fail(function (err) {
                            log.error(err);
                        });
                });
        }
    };
    return exports;
})();

exports.userDefinition = userDefinition;
