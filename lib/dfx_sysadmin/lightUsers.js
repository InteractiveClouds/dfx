var path = require('path'),
    fs   = require('fs'),
    Q = require('q'),

    credCrypt = require('../auth/utils/credCrypt'),
    Fdb = require('../fileStorage/mdbwLike').Instance,
    tools = require('../fileStorage/idbased')._tools,

    SETTINGS = require('../dfx_settings'),

    storage;

exports.init = function ( o ) {
    storage = o.storage;

    delete exports.init;
}

exports.get = function ( tenantid, userid, unsafe, appid ) {
    return storage.get(SETTINGS.databases_tenants_name_prefix + tenantid, 'users', {
        login       : userid,
        application : appid
    })
        .then(function(user){
            if (user.length) {
                user = user[0];

                return credCrypt.decrypt(user.encrypted_password).then(function (pass) {
                    user.password = user.pass = pass;

                    return user;
                })
            } else {
                return Q.reject("Can't get users of tenant - " + tenantid);
            }
        })

};

exports.hasRight = function ( tenant, login, right, type, application ) {

    return exports.get( tenant, login, false, application )
    .then(function(user){

        var rights = user.rights,
            rightName = type ? type + '::' + right : right,
            hasRight = !!~rights.indexOf(rightName);

        return hasRight ? Q.resolve() : Q.reject();
    })
}

exports.touch = function (tenantId, userId, application ) {
    return new User(tenantId, userId, null, application);
};

exports.checkCredentials = function ( tenantid, userid, pass ) {
    console.log('light users 2');
    return Q.resolve() // Q.reject()
};

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
    return exports.hasRight(
        this.tenantid,
        this.userid,
        right,
        type,
        this.application
    );
};

User.fn.hasEitherRight = function () {

    var that = this,
        requiredRights = arguments;

    return exports.get( this.tenantid, this.userid, false, this.application )
    .then(function(user){

        var has = false,
            rights = user.rights;
        
        for (var i = 0, l = requiredRights.length; i < l; i++) {
        
            if ( !!~rights.indexOf(requiredRights[i]) ) {
                has = true;
                break;
            }
        }

        return has ? Q.resolve() : Q.reject();
    })
};

User.fn.getProperty = function ( propName ) {
    return this.isSuperUser
        ? undefined
        : exports.get(this.tenantid, this.userid, this.application).then(function(u){
            return u.hasOwnProperty(propName)
                ? Q.resolve(u[propName])
                : Q.reject('unknown user\'s property "' + propName + '"');
        })
};


function unpack ( entry, tenant, unsafe, application ) {

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
