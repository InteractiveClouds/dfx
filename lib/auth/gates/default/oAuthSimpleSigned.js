/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

const
    RGXP_IMPLEMENTED_METHODS = /^(?:GET|DELETE)$/i;

var Q    = require('q'),
    URL = require('url'),
    core = require('../gate.core');

var log = new (require('../../../utils/log')).Instance({label:'GATES_OAUTH_SS'});

function Constr ( o ) {
    o = o || {};
    core.Constructor.call(this, { users : o.users });

    this.oauthSignature = o.oauthSignature;
    this.oauth_consumer_key    = o.oauth_consumer_key;
    this.oauth_consumer_secret = o.oauth_consumer_secret;

    this.use(check);
    this.use(setUser);
}

Constr.prototype = new core.Constructor;

Constr.fn = Constr.prototype;

Constr.fn.onFail = function (req, res, _reason, httpStatus, pocket) {
    res.status(401).end();
};

Constr.fn.onEnd = function (req, res, data, pocket) { // TODO
    return data;
}

function setUser (req, success, fail, pocket, res) {
    req.user = {
        type   : 'consumer',
        credentials : {
            secret : this.oauth_consumer_secret,
            key    : this.oauth_consumer_key
        }
    };

    return success();
}

function check (req, success, fail, pocket, res) {

    var that = this;

    if ( !RGXP_IMPLEMENTED_METHODS.test(req.method) ) return fail(Error(
        'checking "' + req.method + '" is not implemented'
    ));

    var params = extractAuthInfo(req);

    if ( !params ) return fail();
    if ( params.oauth_consumer_key !== this.oauth_consumer_key ) return fail(Error('unknown consumer key'));

    var originalSignature = params.oauth_signature;

    delete params.oauth_signature;

    var url = URL.parse( req.protocol + '://' + req.get('host') + req.originalUrl ),
        clearUrl = URL.format({
            protocol : url.protocol,
            host     : url.host,
            port     : url.port,
            hostname : url.hostname,
            pathname : url.pathname
        }),
        calculatedSignature = this.oauthSignature.generate(
            req.method,
            clearUrl,
            params,
            this.oauth_consumer_secret
        ),
        unescaped = unescape(calculatedSignature);

    return originalSignature === calculatedSignature || originalSignature === unescaped
        ? success()
        : fail('wrong signature.'
                //+ JSON.stringify({
                //    'GOTTEN     ' : originalSignature,
                //    'CALCULATED ' : calculatedSignature,
                //    'UNESCAPED'   : unescaped,
                //    'CLEAR URL  ' : clearUrl,
                //    'AUTH INFO  ' : params
                //},null,4)
            );
};

function extractAuthInfo ( req ) {

    var authInfo,
        query = req.query;

    if ( !hasAuthHeader(req) ) {
        log.error('extracting oAuth info from URL\'s query is not implemented');
        return null;
    }

    authInfo = parseAuthorizationHeader(req.headers.authorization);

    if ( !authInfo || !Object.keys(authInfo).length ) {
        log.error('can not extract authorization info');
        return null;
    }

    for ( var param in query ) authInfo[param] = query[param];


    return authInfo;
}

var authParamRegExp = /^([^="]+)(?:="?([^"]*)"?)?$/;

function parseAuthorizationHeader ( str ) {

    var arr  = str.split(/,?\s+/),
        auth = arr.shift(),
        obj = {};

    if ( auth !== 'OAuth' ) {
        log.error('unknown authorization type "' + auth + '",\n\tHEADER: ' + str);
        return null;
    }

    arr.forEach(function(e){
        var arr = authParamRegExp.exec(e);

        if ( arr ) obj[arr[1]] = arr[2];
    });

    if (
               !obj.oauth_consumer_key
            || !obj.oauth_nonce
            || !obj.oauth_signature
            || !obj.oauth_signature_method
            || !obj.oauth_timestamp
            || !obj.oauth_version
        ) {
            log.error('wrong authorization header format: ' + str);
            return null;
    }

    return obj;
}

function hasAuthHeader ( req ) {
    return req.headers.hasOwnProperty('authorization');
}

exports.Constructor = Constr;
