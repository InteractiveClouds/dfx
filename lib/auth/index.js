/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var SessionManager = require('./utils/sessionManager'),
    //MemoryStorage = require('./utils/storage/memoryStorage'),
    MongoStorage = require('./utils/storage/mongoStorage'),
    path = require('path'),

    SETTINGS = require('../dfx_settings'),
    db = SETTINGS.studio ? require('../mdbw')(SETTINGS.mdbw_options) : null,
    Fdb = require('../fileStorage/mdbwLike').Instance,
    crypt = require('./utils/tripleDes.wrapped.js'),
    apps = SETTINGS.studio ? require('../dfx_applications') : null,
    tenants = require('../dfx_sysadmin/tenants'),
    users = tenants.user,
    lightTenants = require('../dfx_sysadmin/lightTenants'),
    lightUsers   = require('../dfx_sysadmin/lightUsers'),
    sysdbName = SETTINGS.system_database_name,
    credCrypt = require('./utils/credCrypt'),
    Log = require('../utils/log'),
    ldap = require('../ldap'),
    thisUtils = require('./utils'),
    authConf = require(thisUtils.confFilePath),
    schema = SETTINGS.authSchema || 'default',
    TokenManager = require('./utils/tokenManager.' + schema),
    runWhenAppUserIsLoggedIn = [],
    runWhenStudioUserIsLoggedIn = [],



    tokens_fdb_options = {};

    tokens_fdb_options[sysdbName] = {
        'appsTokens' : {
            path        : path.join(__dirname, '..', '..', 'tmp/apptokens'),
            uniqueField : '_id'
        }
    };

var tokens_fdb = new Fdb(tokens_fdb_options),

    tokenStorage = new MongoStorage.Constructor({
        database   : sysdbName,
        collection : 'appsTokens',
        db         : SETTINGS.studio ? db : tokens_fdb
    }),

    tokenManager = new TokenManager.Constructor({
        storage      : tokenStorage,
        tenants      : SETTINGS.studio ? tenants : lightTenants,
        users        : SETTINGS.studio ? users   : lightUsers,
        expires      : SETTINGS.appToken_EpiresTime,
        firstExpires : SETTINGS.appToken_loginTokenExpires,
        //apps         : apps,
        maxCalls     : SETTINGS.appToken_maxCallsPerToken,
        crypt        : crypt
    });



exports.version   = '0.1';

if ( SETTINGS.studio ) {
    var consoleSessionStorage = new MongoStorage.Constructor({
            database   : sysdbName,
            collection : 'consoleSessions',
            db         : db
        }),

        clearConsoleSessionsEach = SETTINGS.clearConsoleSessionsEach
            || 1000 * 60 * 60, // an hour

        consoleSessionExpiresIn = SETTINGS.consoleSessionExpiresIn
            || 1000 * 60 * 30, // half an hour

        consoleSessionManager = new SessionManager.Constructor({
            storage    : consoleSessionStorage,
            expires    : consoleSessionExpiresIn,
            path       : '/console',
            cookieName : 'dfx_console_session',
            clearEach  : clearConsoleSessionsEach
        }),



        studioSessionStorage = new MongoStorage.Constructor({
            database   : sysdbName,
            collection : 'studioSessions',
            db         : db
        }),

        // when to remove expired sessions
        clearStudioSessionsEach = SETTINGS.clearStudioSessionsEach
            || 1000 * 60 * 30, // half an hour

        // when cookie expires
        studioSessionExpiresIn = SETTINGS.studioSessionExpiresIn
            || 1000 * 60 * 60, // an hour

        studioSessionManager = new SessionManager.Constructor({
            storage    : studioSessionStorage,
            expires    : studioSessionExpiresIn,
            path       : '/studio',
            cookieName : 'dfx_studio_session',
            clearEach  : clearStudioSessionsEach
        });

    var openidStudioLogin = require('./loginout/'+schema+'/openidStudioLogin');
    var openidStudioLoginInstance = new openidStudioLogin.Constructor({
            log             : new Log.Instance({label:'LOGINOUT_OPENID_STUDIO'}),
            sessionManager  : studioSessionManager,
            runAfterLogin   : runWhenStudioUserIsLoggedIn,
            tenants         : tenants,
            users           : users,
            cookieExpiresIn : 1000 * 60 * 30, // 30 minutes
            cookieName      : 'dfx_openid_storage',
            cookiePath      : '/studio/openidverify'
        });
    exports.studioOpenId = {
        verify   : openidStudioLoginInstance.endpoint.bind(openidStudioLoginInstance)
    };
    
    var studioInstance = new (require('./loginout/'+schema+'/studio')).Constructor({
            log            : new Log.Instance({label:'LOGINOUT_STUDIO'}),
            sessionManager : studioSessionManager,
            runAfterLogin  : runWhenStudioUserIsLoggedIn,
            tenants        : tenants,
            users          : users,
            openidStudioLogin : openidStudioLoginInstance,
            URL               : SETTINGS.EXTERNAL_URL
        });
    exports.studio = {
        loginPage   : studioInstance.loginPage.bind(studioInstance),
        loginVerify : studioInstance.endpoint.bind(studioInstance),
        loginerror  : studioInstance.loginerror.bind(studioInstance)
    };
    
    
    var consoleInstance = new (require('./loginout/'+schema+'/console')).Constructor({
        log            : new Log.Instance({label:'LOGINOUT_CONSOLE'}),
        sessionManager : consoleSessionManager,
        db             : db
    });
    exports.console   = {
        loginPage   : consoleInstance.loginPage.bind(consoleInstance),
        loginVerify : consoleInstance.endpoint.bind(consoleInstance),
        logout      : consoleInstance.logout.bind(consoleInstance)
    };

    var previewInstance = new (require('./loginout/'+schema+'/preview')).Constructor({
        log           : new Log.Instance({label:'LOGINOUT_PREVIEW'}),
        tokenManager  : tokenManager,
        apps          : { isActive : function(){ return Q(true) }},
        runAfterLogin : runWhenAppUserIsLoggedIn,
        tenants       : tenants,
        users         : users
    });
    exports.preview = {
        login : previewInstance.endpoint.bind(previewInstance)
    };
}
var Q = require('q');
var appInstance = new (require('./loginout/'+schema+'/app')).Constructor({
    log           : new Log.Instance({label:'LOGINOUT_APP'}),
    tokenManager  : tokenManager,
    apps          : SETTINGS.studio ? apps : { isActive : function(){ return Q(true) }},
    runAfterLogin : runWhenAppUserIsLoggedIn,
    tenants       : SETTINGS.studio ? tenants : lightTenants,
    users         : SETTINGS.studio ? users   : lightUsers
});
exports.app = {
    login        : appInstance.endpoint.bind(appInstance),
    logout       : appInstance.logout.bind(appInstance),
    refreshtoken : appInstance.refreshtoken.bind(appInstance)
};

exports.gate      = require('./gates').init({
    tokenManager          : tokenManager,
    users                 : SETTINGS.studio ? users   : lightUsers,
    consoleSessionManager : consoleSessionManager,
    studioSessionManager  : studioSessionManager,
    schema                : schema,
    extGate : {
            consumer_key    : authConf.externalGate.consumer_key,
            consumer_secret : authConf.externalGate.consumer_secret
        }
});

exports.credCrypt = credCrypt;

exports.whenAppUserIsLoggedIn = function ( func ) {
    runWhenAppUserIsLoggedIn.push(func);
};

exports.whenStudioUserIsLoggedIn = function ( func ) {
    runWhenStudioUserIsLoggedIn.push(func);
};
