/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

// Declaration of main modules

var validator;
var SETTINGS = require('./lib/dfx_settings');
var passport = require('passport');
var request = require('request');
var LocalStrategy = require('passport-local').Strategy;
var DigestStrategy = require('passport-http').DigestStrategy;
var BasicStrategy = require('passport-http').BasicStrategy;
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var path = require('path');
var fs = require('fs');
var QFS = require('q-io/fs');
var Q = require('q');
var sockets = require('./lib/dfx_sockets');
var version = require('./package.json').version;
var isPortFree = require('./lib/utils/isPortFree');
var pmx = require('pmx');

var out = module.exports = {},
    Log,
    log,
    isInited = false,
    host_app,
    server;

var key = process.argv[2];

process.env['NODE_ENV'] = 'development';
process.env['DFX_DB_JEDI_MODE'] = true;


out.registerTheme = function( theme_name, theme ) {

    SETTINGS.templates[theme_name] = theme;
    console.log( 'Theme ' + theme_name + ' has been registered' );

};

out.registerUrl = function( name, url, request_type, callback ) {

    SETTINGS.customUrls.push({ url: url, request_type: request_type, callback: callback });
    console.log( 'Custom URL ' + url + ' has been registered' );
    return out;

};

out.init = function ( settings ) {

    if ( isInited ) throw('Init can be invoked only once.');

    if ( !settings ) throw('FATAL: local settings is not set');

    if ( typeof settings === 'string' ) {
        try { settings = require( settings ) }
        catch (e) {throw(
            'FATAL: can not require local settings at path "' + settings +
            '"\n' + e.stack
        )}
    } else if ( typeof settings !== 'object' ) {
        throw(
            'FATAL: third param of the init must be either ' +
            'path to local settings or object of local settings itself'
        );
    }

    overwriteSettings(SETTINGS, settings);

    SETTINGS.EXTERNAL_URL =
        (
            process.env.DFX_HTTPS ? 'https' : 'http' + '://'
        ) +
        SETTINGS.external_server_host +
        (
            SETTINGS.external_server_port && SETTINGS.external_server_port !== '80'
                ? ':' + SETTINGS.external_server_port
                : ''
        );
        

    // choose edition and storage
    if ( SETTINGS.edition === 'deployment' && SETTINGS.storage === 'file' ) {
        SETTINGS.studio = false;
    } else if ( SETTINGS.edition === 'development' && SETTINGS.storage === 'mongod' ) {
        SETTINGS.studio = true;
    } else {
        throw(Error(
            'Wrong settings:\n' +
            'EDITION: ' + SETTINGS.edition + '\n' +
            'STORAGE: ' + SETTINGS.storage
        ));
    }


    //if ( host_server ) server = host_server;
    //if ( app ) host_app = app;

    isInited = true;


    Log = require('./lib/utils/log');
    if ( SETTINGS.logging.stdout ) Log.init.stdout(SETTINGS.logging.stdout);
    if ( SETTINGS.logging.file   ) {
        SETTINGS.logging.file.path = path.join(__dirname, SETTINGS.logging.file.path);
        Log.init.file(  SETTINGS.logging.file);
    }
    log = new Log.Instance({label:'DFX_MAIN'});

    log.info('this URL is : ' + SETTINGS.EXTERNAL_URL);

    require('./lib/utils/tempdir').init({
        log : new Log.Instance({label: 'TEMP_DIR_TOOL'}),
        prefix : 'dreamface_'
    });

    if (SETTINGS.log_pmx) {
        pmx.init();
    }

    return out;


    /**
     * deep overwrite a with params of b
     * BUT arrays will be overwritten wholly
     *
     * @param {Object} a object to overwrite
     * @param {Object} b with params of the object a will be overwritten
     */
    function overwriteSettings ( a, b, path ) {

        path = path || [];
    
        for ( var param in b ) {
    
            if ( !a.hasOwnProperty(param) ) {
                console.log(
                    'WARN   : Unknown parameter '         +
                    path.concat(param).join('.') +
                    ' is added to SETTINGS.'
                );

                a[param] = b[param];

                continue;
            }
    
            if ( typeof b[param] !== 'object' || b[param] instanceof Array ) {
                a[param] = b[param];
            } else {
                overwriteSettings(a[param], b[param], path.concat(param));
            }
        }
    }
};

var sysadmin;
out.start = function () {

    if ( !isInited ) out.init();

    return isPortFree(SETTINGS.server_host, SETTINGS.server_port) // TODO it'll not works if there is host_app
    .then(function () {

        if (SETTINGS.studio) {
            validator = require('./lib/dfx_validator');

            if (key) {

                if (key !== "-v") throw("Unknown key " + key);

                return validator.getVersionInfo()
                    .then(function () {
                        process.exit();
                    });
            }
        }

    }).then(function(){
            var tokenFolder = path.join(__dirname, 'tmp/apptokens');
            var fsdbFolder = SETTINGS.fsdb_path;

            return QFS.exists( tokenFolder )
                .then(function (exists) {

                    if (! exists) {
                        return QFS.makeTree( tokenFolder );
                    } else {
                        return Q();
                    }

                }).then(function () {
                    return QFS.exists( fsdbFolder ).then(function (exists) {

                        if (!exists) {
                            return QFS.makeTree(fsdbFolder);
                        } else {
                            return Q();
                        }

                    });

                }).then(function () {
                    const
                        tenants  = require('./lib/dfx_sysadmin/tenants'),
                        cache    = require('./lib/dfx_cache').init({
                                log : new Log.Instance({label:'CACHE'})
                            });

                    if (SETTINGS.studio) {
                        const _storage = require('./lib/mdbw')(SETTINGS.mdbw_options);

                        tenants.init({ storage: _storage });

                        require('./lib/dfx_sysadmin/authProviders').init({ storage: _storage });
                        require('./lib/dfx_sysadmin/dbDrivers').init({ storage: _storage });

                        require('./lib/dfx_queries').init({ storage: _storage });
                        require('./lib/authRequest_mod').oAuth2AccessTokens.init({ storage: _storage });
                        require('./lib/dfx_resources').api.init({ storage: _storage });

                        var userLib = tenants.user;
                        require('./lib/dfx_user_definition').api.init({ storage: _storage, userLib: userLib });

                        require('./lib/dfx_menus').init({ storage: _storage });

                        require('./lib/dfx_applications').init({ storage: _storage });
                        require('./lib/dockerisation').init({db:_storage});
                        require('./lib/BlueMixCloudFoundry')
                            .init({
                                log       : new Log.Instance({label:'BLUEMIX_CF'}),
                                db        : _storage,
                                getDbName : function ( tenant ) { return 'dreamface_tenant_' + tenant},
                                getClName : function () { return 'BlueMixCF' },
                                DEBUG     : SETTINGS.debug_BM_CF
                            });
                    } else {
                        return initFileStorage(fsdbFolder).then(function(_storage) {

                            tenants.init({ storage: _storage });

                            require('./lib/dfx_sysadmin/authProviders').init({ storage: _storage });
                            require('./lib/dfx_sysadmin/dbDrivers').init({ storage: _storage });

                            require('./lib/dfx_deploy').init({ storage: _storage });
                            require('./lib/dfx_deploy').dep.onUpdate = function(){
                                return _storage._updateAllCollectionsDocsLists();
                            }

                            require('./lib/dfx_queries').init({ storage: _storage });
                            require('./lib/authRequest_mod').oAuth2AccessTokens.init({ storage: _storage });
                            require('./lib/dfx_resources').api.init({ storage: _storage });

                            var userLib = require('./lib/dfx_sysadmin/lightUsers');
                            userLib.init({ storage: _storage });

                            require('./lib/dfx_user_definition').api.init({ storage: _storage, userLib: userLib });

                            require('./lib/dfx_menus').init({ storage: _storage });

                            require('./lib/dfx_applications').init({ storage: _storage });
                        });
                    }

                });

        })

    .then(function(){
        sysadmin = require('./lib/dfx_sysadmin');

        if (SETTINGS.studio) {
            return require('./lib/auth/utils')
                .initCheck()
                .then(sysadmin.cloudRepository.get)
                .then(function(repository){
                     if ( repository && repository.version ) {

                        const
                            patches = new (require('db-patch-manager'))({
                                actualVersion : version,
                                db            : require('./lib/mdbw')(SETTINGS.mdbw_options),
                                getDbVersion  : function(db){
                                        return db.get('dreamface_sysdb', 'settings', {name: "dfx version"})
                                        .then(function (res) {
                                            return (res && res.length && res[0].version) || '0.0.1';
                                        });
                                    },
                                setDbVersion  : function(version, db){
                                        return db.update(
                                            'dreamface_sysdb',
                                            'settings',
                                            {name: 'dfx version'},
                                            {
                                                name: 'dfx version',
                                                version: version
                                            },
                                            {multi: false, upsert: false}
                                        );
                                    },
                                pathToPatches : path.join(__dirname, 'patches'),
                                log : log
                            });

                        return patches.apply({
                            SETTINGS : SETTINGS
                        });
                    }
                })
                .then(_start);
        } else {
            return require('./lib/auth/utils')
                .initCheck()
                .then(_start)
                .then(function(){
                    var _path = SETTINGS.deploy_on_start_apps_from;

                    if ( _path ) {
                        log.info('DEPLOY ON START PATH IS SET TO: ' + _path);
                        return require('./lib/dfx_deploy').dep.deployOnStart(_path);
                    }
                })
        }

    }).done();
};

var fsdbMap = {}; // tenantid / usersStorage
function initFileStorage (fsdbFolder) {
    var Fdb = require('./lib/fileStorage/mdbwLikeWithDbAndCl').Instance,
        tools = require('./lib/fileStorage/idbased')._tools;

    //return tools.lsStat(fsdbFolder)
    //.then(function(list){
    //    list.forEach(function(item){
    //        // tenant
    //        if ( item.isDirectory() ) {
    //            fsdbMap[item.name] = {};
    //        }
    //    });

    //    return Q.all(Object.keys(fsdbMap).map(function(_tenantid){
    //        return tools.lsStat(path.join(fsdbFolder, _tenantid))
    //            .then(function(list){

    //                list.forEach(function(item){

    //                    if ( !item.isDirectory() ) return;

    //                    fsdbMap[_tenantid][item.name] = {
    //                        path : path.join(
    //                            fsdbFolder,
    //                            _tenantid,
    //                            item.name
    //                        ),
    //                        uniqueField : '_id'
    //                    };
    //                });
    //            })
    //    }));
    //})
    //.then(function(){
    //    return new Fdb(fsdbMap);
    //});
    

    return Q.resolve(new Fdb({path:fsdbFolder}));
}

function _start () {

    // mongodb-settings depended modules,
    // it should be required after setting mongo_host, mongo_port
    var proxy = require('./lib/dfx_proxy');

    passport.use(new DigestStrategy({ qop: 'auth', realm: 'application' },
        function( complexName, done ) {
            complexName = complexName.split('::');

            var tenant      = complexName[0],
                application = complexName[1],
                login       = complexName[2],
                role        = complexName[3];

            return sysadmin.tenant.user.get(tenant, login)
            .then(function( u ){
                role = role || u.roles['default'];

                if ( !~u.roles.list.indexOf(role) ) return done(null, false);

                return sysadmin.tenant.role.getRights({role:role, tenant:tenant})
                .then(function(rights){
                    var user = {
                        tenant      : tenant,
                        application : application,
                        login       : login,
                        role        : role,
                        rights      : rights,
                        email       : u.email,
                        lastName    : u.lastName,
                        firstName   : u.firstName,
                        _id         : u['_id']
                    };
                    done(null, user, u.password);
                })
            })
            .fail(done)
            .done();
        },
        function(params, done) {
            // TODO
            done(null, true)
        }
    ));


    passport.use(new BasicStrategy(
        function(tenantName, token, done) {
            sysadmin.tenant.get(tenantName)
            .then(function(tenant){
                    if (!tenant || tenant.length === 0) { return done(null, false); }
                    var user = {
                        "id": tenantName,
                        "token": Object.keys(tenant.databaseTokens)[0]
                    };
                    return token === user.token
                        ? done(null, user)
                        : done(null, false);
                },
                function () { done(null, false) }
            ).done();
        }
    ));

    var app = host_app || require('express')();

    //if ( !host_app ) {
        if ( process.env.DFX_HTTPS ) {

            server = require('https').createServer(
                {
                    key  : fs.readFileSync(
                        './certs/server.key', 'utf8'
                    ),
                    cert : fs.readFileSync(
                        './certs/server.crt', 'utf8'
                    )
                },
                app
            );
            log.ok('Server is run in HTTPS mode.')

        } else {

            server = require('http').createServer(app);
            log.warn('Server is run in HTTP mode.')

        }
    //}

    var io = require('socket.io').listen(server, { log: false });

    if ( SETTINGS.logging.server ) {
        var settings = Object.create(SETTINGS.logging.server);
        settings.socket = io.of('/logserver');

        Log.init.server(settings);
        Log.startServer();
    }

    app.set('views', path.join(__dirname, 'templates'));
    app.set('view engine', 'jade');

    if ( process.env.DFX_RESLOG ) app.use((function(){
        var log = new Log.Instance({label: 'RESLOG'});
        return function(req, res, next){
            var _end = res.end;
            res.end = function () {
                log.dbg(req.ip+' '+res.statusCode+' '+req.method+' '+req.originalUrl);
                _end.apply(res, arguments);
            }
            next();
        }
    })());
    app.use("/deploy", express.static( SETTINGS.deploy_path ));
    app.use("/resources", express.static(path.join(__dirname, SETTINGS.resources_deploy_path )));
    app.use("/resources/development", express.static(SETTINGS.resources_development_path));
    app.use("/widgets", express.static(path.join(__dirname, 'widgets')));
    app.use("/css", express.static(path.join(__dirname, 'public', 'css')));
    app.use("/js", express.static(path.join(__dirname, 'public', 'js')));
    //app.use("/js/angular", express.static(path.join(__dirname, 'public/js/angular')));
    //app.use("/js/vendor", express.static(path.join(__dirname, 'public/js/vendor')));
    //app.use("/js/preview", express.static(path.join(__dirname, 'public/js/preview')));
    //app.use("/js/console", express.static(path.join(__dirname, 'public/js/console')));
    //app.use("/js/studio", express.static(path.join(__dirname, 'public/js/studio')));
    //app.use("/js/visualbuilder", express.static(path.join(__dirname, 'public/js/visualbuilder')));
    //app.use("/js/preview", express.static(path.join(__dirname, 'public/js/preview')));
    //app.use("/js/preview/datatables", express.static(path.join(__dirname, 'public/js/preview/datatables')));
    //app.use("/js/commons", express.static(path.join(__dirname, 'public/js/commons')));
    //app.use("/js/dellme", express.static(path.join(__dirname, 'src/js/studio')));
    //app.use("/css/vendor", express.static(path.join(__dirname, 'public/css/vendor')));
    //app.use("/css/dfx", express.static(path.join(__dirname, 'public/css/dfx')));
    //app.use("/css/visualbuilder", express.static(path.join(__dirname, 'public/css/visualbuilder')));
    app.use("/tmp", express.static(path.join(__dirname, 'tmp')));
    app.use("/fonts", express.static(path.join(__dirname, 'public/fonts')));
    app.use("/img", express.static(path.join(__dirname, 'public/images')));
    app.use("/images", express.static(path.join(__dirname, 'public/images')));
    app.use("/images/sampleapps", express.static(path.join(__dirname, 'public/images/sampleapps')));
    app.use("/styles_palettes", express.static(path.join(__dirname, 'templates/palette_styles_definitions')));
    //app.use("/css/img", express.static(path.join(__dirname, 'public/images')));
    app.use("/templates", express.static(path.join(__dirname, '/templates')));
    app.use("/studio", express.static(path.join(__dirname, 'public/js/vendor')));
    app.use("/studio/help", express.static(path.join(__dirname, 'studio/help')));
    app.use("/node_modules/codemirror", express.static(path.join(__dirname, '/node_modules/codemirror')));
    app.use("/gcontrols/web", express.static(path.join(__dirname, '/gcontrols/web')));
    app.use("/studio/studioviews", express.static(path.join(__dirname, 'public/studioviews')));
    app.use("/src/catalog", express.static(path.join(__dirname, 'src/catalog')));
    //app.use("/studio/widget", express.static(path.join(__dirname, 'src/js/vendor')));
    app.use(bodyParser.urlencoded({extended: true, limit:'50mb', parameterLimit:'Infinity'}));
    app.use(bodyParser.json({limit:'50mb'}));
    app.use(cookieParser());

    var auth = require('./lib/auth'),
        gate = auth.gate;

    app.use("/console/logfile", gate.consoleStatic);
    app.use("/console/logfile", express.static(path.join(__dirname, 'logs')));

    app.use(passport.initialize());
    app.use(passport.session());
    app.use( function(req, res, next){
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers",  'WWW-Authenticate, Authorization, Accept');
        res.setHeader("Access-Control-Expose-Headers", 'WWW-Authenticate, Authorization, Accept');
        res.setHeader('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
        next();
    });


    if ( SETTINGS.studio ) {
        var mdbw = require('./lib/mdbw')(SETTINGS.mdbw_options);
        var versioningUtils = require('./lib/dfx_versioning.utils');

        auth.whenAppUserIsLoggedIn(   versioningUtils.addActiveRepositoryToSession);
        auth.whenStudioUserIsLoggedIn(versioningUtils.addActiveRepositoryToSession);
    }

    // Socket Initialization
    sockets.init(io);


    // Proxy Initialization
    proxy.initialize(app);

    if ( !host_app ) {
        server.listen(SETTINGS.server_port, SETTINGS.server_host);
        console.log( 'DreamFace starts ' + ( process.env.DFX_HTTPS ? 'HTTPS' : 'HTTP' ) + ' listener.');
    }

    // Application Server Start
    console.log('------------------------------------------------------');
    console.log('Starting DreamFace X-Platform on port %s', SETTINGS.server_port);
    console.log('v%s', version);
    console.log('Copyright (c) 2016 Interactive Clouds, Inc.');
    console.log('"DreamFace" is a trademark of Interactive Clouds, Inc.');
    console.log('http://www.interactive-clouds.com');
    console.log('------------------------------------------------------');

    if ( SETTINGS.studio ) {
        //  Verifying External Server Host
        validator.verifyExternalHostValue();


        // init cloud repository if is not inited yet
        sysadmin.cloudRepository.get()
        .then(function (repository) {

            if (repository && repository.version) return;

            // is not inited
            log.warn('Cloud repository is not initialized. Trying to initialize...');

            return sysadmin.cloudRepository.init()
                .then(
                function () {
                    log.ok('Cloud repository is initialized.')
                },
                function (error) {
                    log.fatal('Can not initialize cloud repository: ' + error)
                }
            )
        })
        .then(function () {
            setServerInfo(mdbw, SETTINGS)
        })
    }
}

function setServerInfo (mdbw, SETTINGS) {
    mdbw.get(SETTINGS.system_database_name, 'settings', {'name':'sysdb'})
    .then(function(d){
        SETTINGS.serverinfo = {
            'server-uuid'  : d[0]['server-uuid'],
            'studio'       : true,
            'apps-hosting' : true
        };
    })
    .done();
}

if ( !module.parent ) out.start();
