/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var SETTINGS = require('../../dfx_settings'),
    crypto   = require('crypto'),
    Q        = require('q'),
    QFS      = require('q-io/fs'),
    log      = new (require('../../utils/log')).Instance({label:'AUTH_UTILS'}),
    path     = require('path');

var confFilePath = SETTINGS.auth_conf_path,
    sysdbName    = SETTINGS.system_database_name;

if ( !confFilePath ) log.fatal('path to .auth.conf is not set');

var hash = md5; // TODO ATTENTION!


/**
 * simple password strength meter
 *
 *
 * EXAMPLES OF RESULTS:
 *
 *     'fff'       : 5,
 *     'fffff'     : 6,
 *     'fgfgf'     : 9,
 *     'abcabc'    : 14,
 *     'FgfGf'     : 28,
 *     'password'  : 41,
 *     'fF_g%Hk&4' : 69,
 *     ''          : 0
 *
 *
 * @param{String} password
 * @returns{Number} strength
 *
 */
function passwordStrenght ( pass ) {

    var pointsPerType   = 5, // digits, a-z symbols, special symbols, etc.
        pointsPerSymbol = 1,
        pointsPerUnique = 5, // is divided into identical symbols quantity

        length    = pass.length;


    if ( !pass ) return 0;


    // points for total symbols quantity
    var quantityCount = length * pointsPerSymbol;


    // points for unique symbols
    var uniqueCount = 0,
        symbols     = {};
        

    for ( var i = 0; i < length; i++ ) symbols[pass[i]] = (symbols[pass[i]] || 0) + 1;
    for ( var symbol in symbols ) uniqueCount += pointsPerUnique / symbols[symbol];


    // points for quantity of symbol's types
    var typeCount = -pointsPerType,
        types = {
            digits : /\d/.test(pass),
            lower  : /[a-z]/.test(pass),
            upper  : /[A-Z]/.test(pass),
            nonABC : /[^a-z]/i.test(pass),
        };

    for ( var type in types ) typeCount += +types[type] * pointsPerType;

    
    return Math.round( typeCount + quantityCount + uniqueCount );
}



var lastLoginCookie = (function (){
    var SPLIT_SYMBOL           = '::',
        MAX_AGE                = SETTINGS.dfx_last_login_cookie_max_age,
        LAST_LOGIN_COOKIE_NAME = 'dfx_last_login';

    return {

        set : function ( req, res, justTenant ) {
            var tenant = req.session.tenant.id,
                user   = justTenant ? '' : req.session.user.id,
                cookie = new Buffer([tenant, user].join(SPLIT_SYMBOL)).toString('base64');

            res.cookie(LAST_LOGIN_COOKIE_NAME, cookie, {
                maxAge: MAX_AGE,
                httpOnly: true
            });
        },

        get : function ( req ) {
            var cookie = req.cookies[LAST_LOGIN_COOKIE_NAME],
                obj = {tenantid : '', userid : ''};

            if ( !cookie ) return obj;

            var arr = ( new Buffer(cookie, 'base64') ).toString('utf8').split(SPLIT_SYMBOL);

            obj.tenantid = arr[0] || '';
            obj.userid   = arr[1] || '';

            return obj;
        }
    };
})();


/**
 * @param {Number} length
 * @returns {String} random string with 'length' symbols
 */
function random ( length ) {
    var D = Q.defer();
    length = length ? length >> 1 : 4;
    crypto.randomBytes(length, function(error, buf) {
    return error
        ? D.reject(error)
        : D.resolve( new Buffer(buf).toString('hex') );
    });
    return D.promise;
};

var unicue = (function () {
    var n = (new Date()).getTime();

    return function () {
        return Q.when(random(16), function (r) { return ++n + r })
    }
})();


/**
 * @param {String} string
 * @returns {String} md5 hash of param
 */
function md5 ( string ) {
    return crypto.createHash('md5').update(string).digest("hex");
}

function getStoragePassHash () {
    var storagePassHash;
    try {
        var conf = require(confFilePath);
        storagePassHash = hash(conf.storagePass + conf.nonce);
    } catch (e) {};

    return storagePassHash;
}

function createStoreCredentialsPasswordFile ( pass, nonce, consumer_key, consumer_secret ) {
    return Q.all([
            ( pass            ? Q(pass)            : random(64)  ),
            ( nonce           ? Q(nonce)           : random(128) ),
            ( consumer_key    ? Q(consumer_key)    : random(12)  ),
            ( consumer_secret ? Q(consumer_secret) : random(24)  )
    ]).spread(function ( pass, nonce, consumer_key, consumer_secret ) {
        var content =   'exports.storagePass  = \'' + pass  + '\';\n' +
                        'exports.nonce        = \'' + nonce + '\';\n' +
                        'exports.externalGate = {\n' +
                        '   consumer_key    : \'' + consumer_key    + '\',\n' +
                        '   consumer_secret : \'' + consumer_secret + '\'\n' +
                        '}\n';

        return QFS.write(confFilePath, content, {mode:0400});
    })
    .then(
        function(){log.info('Created file with credentials storage password (".auth.conf")')},
        function(error){log.fatal('Can not create file with credentials storage password (".auth.conf").\n' + error)}
    );
};

function initCheck () {
    if ( !SETTINGS.studio ) return Q.resolve();
    var db = require('../../mdbw')(SETTINGS.mdbw_options);

    return db.get(sysdbName, 'settings', {name:'auth'})
    .then(function ( docs ) {
        var auth = docs[0],
            storagePassHash = getStoragePassHash();

        if ( !auth ) {
            if ( !storagePassHash ) return createStoreCredentialsPasswordFile();

            // ~~ cloudRepository is not inited
            return log.warn('There is ".auth.conf", but no storagePassHash in sysdb/auth. The file will be used.');
        }

        if ( !auth.storagePassHash ) return log.fatal('Broken sysdb/auth. No storagePassHash field was found.');

        if ( !storagePassHash ) {
            log.fatal('Can not find .auth.conf.');
        }

        if ( auth.storagePassHash !== storagePassHash ) {
            log.fatal('Looks like the credentials storage password was changed.');
        }
    })
    .fail(function ( error ) { log.fatal(error) }) // problem with database or creating .auth.conf
};

var time = {
    get now() {
        return (new Date()).getTime();
    }
};

/**
 * @param {Array} arr1
 * @param {Array} arr2
 *
 * @returns {Boolean} is there similar elements in the arrays or not
 */
function hasSimilar ( arr1, arr2 ) {
    var a = arr1.sort(),
        b = arr2.sort(),
        al = a.length,
        bl = b.length,
        ai = bi = 0;

    while ( ai < al && bi < bl ) {
        if ( a[ai] === b[bi] ) return true;
        if ( a[ai] < b[bi] ) ai++; else bi++;
    }

    return false;
}


function getTheServerAddress () {

    var protocol = ( !!process.env.DFX_HTTPS ? 'https' : 'http' ) + '://',
        host     = SETTINGS.external_server_host,
        port     = SETTINGS.external_server_port === 80
		? ''
		: ':' + SETTINGS.external_server_port;

    return protocol + host + port;
}

exports.passwordStrenght = passwordStrenght;
exports.lastLoginCookie = lastLoginCookie;
exports.random = random;
exports.unicue = unicue;
exports.hash = md5;
exports.md5 = md5;
exports.initCheck = initCheck;
exports.getStoragePassHash = getStoragePassHash;
exports.time = time;
exports.hasSimilar = hasSimilar;
exports.getTheServerAddress = getTheServerAddress;
exports.confFilePath = confFilePath;
