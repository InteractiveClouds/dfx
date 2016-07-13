/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var CLASS = require('../class'),
    NOAUTH = require('./no-auth'),
    Q = require('Q'),
    CRYPTO = require('crypto');

var Constr = new CLASS.create(NOAUTH.Constructor);

exports.Constructor = Constr;

Constr.include({
    init : function ( o ) {
        this._authInfo = {
            user : o.credentials.username,
            pass : o.credentials.password,
            nc   : 0
        };
    }, 
    _second  : false,
    _send : function (params) {
        var that = this;
        return random()
        .then(function(random){
            that._authInfo.method = params.method;
            that._authInfo.url    = params.path;
            that._authInfo.cnonce = random;
            ++that._authInfo.nc;
            makeAuthorizationHeader(that._authInfo, params);
            return that._sendQioRequest(params)
            .then(function( response ){
                var auth = parseAuthHeader(response.headers['www-authenticate']);
                // TODO check server header-schema-name
                that._authInfo.realm  = auth.realm;
                that._authInfo.qop    = auth.qop;
                that._authInfo.nonce  = auth.nonce;
                that._authInfo.opaque = auth.opaque;
                if ( !/^\s*(?:401|404)\s*/.test(response.status) ) {
                    that._second = false;
                    return Q.resolve(response);
                }
                if ( that._second ) {
                    that._second = false;
                    return Q.reject(new Error('Unauthorized.'));
                }
                that._second = true;
                return that._send(params);
            })
        })
    }
});


/**
 * parses 'WWW-Authenticate' header to object (param:value)
 *
 * @param{String} header ('WWW-Authenticate' header value)
 * @returns {Object} object (param = value)
 */
function parseAuthHeader ( header ) {
    // TODO check is it 'Digest' indeed
    var pair = [],
        reg = /([^= ,]+)=(?:"([^"]+)"|([^ ,]+))/g,
        result = {};
    while( pair = reg.exec(header) ) {
        result[pair[1]] = pair[2] || pair[3];
    }
    result.qop = chooseQop(result.qop);
    return result;
}


/**
 * @param {Object} o auth-info
 * @param {Object} params where to set auth-header
 */
function makeAuthorizationHeader ( o, params ) {
    if ( !o.nonce ) return; // means first request, so no Auth header is required
    var ha1 = md5(o.user + ':' + o.realm + ':' + o.pass);

    params.headers.Authorization =
          'Digest '
        + 'username="'  + o.user   + '"'
        + ',uri="'      + o.url    + '"'
        + ',realm="'    + o.realm  + '"'
        +   (o.qop
                ?       ',qop='     + o.qop
                      + ',nc='      + o.nc
                      + ',cnonce="' + o.cnonce + '"'
                      + ',nonce="'  + o.nonce  + '"'
                : ''
            )
        +   (o.opaque
                ?       ',opaque="' + o.opaque + '"'
                : ''
            )
        + ',response="' + authorizationHeader_responsePart[o.qop](o, params, ha1) + '"';
}


/**
 * creates 'response' part of Auth header depended on qop-value
 * object key === 'qop' value
 *
 * @returns {String} 'response' part of Authorization header
 *      which depends on 'qop' value
 */
var authorizationHeader_responsePart = {
    'undefined' : function (o, params, ha1) {
        var ha2 = md5(o.method + ':' + o.url);
        return md5(ha1 + ':' + o.nonce + ':' + ha2);
    },

    'auth' : function (o, params, ha1) {
        var ha2 = md5(o.method + ':' + o.url);
        return md5([ha1, o.nonce, o.nc, o.cnonce, 'auth', ha2].join(':'));
    },

    'auth-int' : function (o, params, ha1) {
        var entityBody = md5(params._entireBody || ''),
            ha2 = md5(o.method + ':' + o.url + ':' + entityBody);
        return md5([ha1, o.nonce, o.nc, o.cnonce, 'auth-int', ha2].join(':'));
    },
};


/**
 * it should choose the strongest value of qop
 *
 * @param {String} qop
 * @returns {String|Undefined} strongest possible value of qop
 */
function chooseQop ( qopString ) {
    if ( !qopString ) return;
    return /auth-int/.test(qopString)
        ? 'auth-int'
        : /auth/.test(qopString)
            ? 'auth'
            : console.log('[AuthRequest] WARNING: unknown qop value: "%s"', qopString);
}


/**
 * @param {Number} length
 * @returns {String} random string with 'length' symbols
 */
function random ( length ) {
    var D = Q.defer();
    length = length ? length >> 1 : 4;
    CRYPTO.randomBytes(length, function(error, buf) {
    return error
        ? D.reject(error)
        : D.resolve( new Buffer(buf).toString('hex') );
    });
    return D.promise;
}


/**
 * @param {String} string
 * @returns {String} md5 hash of param
 */
function md5 ( string ) {
    return CRYPTO.createHash('md5').update(string).digest("hex");
}
