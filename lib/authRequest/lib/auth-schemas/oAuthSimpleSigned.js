var CLASS = require('../class'),
    Q = require('q'),
    NOAUTH = require('./no-auth'),
    URL = require('url'),
    utils = require('../../../auth/utils'),
    oauthSignature = require('oauth-signature'),
    QS  = require('querystring');

var Constr = new CLASS.create(NOAUTH.Constructor);

exports.Constructor = Constr;

Constr.include({

    init : function ( o ) {
        this._creds = {
            oauth_signature_method : o.oauth_signature_method,
            oauth_consumer_key     : o.credentials.consumer_key,
            oauth_consumer_secret  : o.credentials.consumer_secret,
            oauth_version          : o.oauth_version
        };
    }, 

    post : isNotImplemented,
    put  : isNotImplemented,


    _send : function (reqObject) {

        var that = this;

        return Q.when( utils.random(16), function ( nonce ) {
            var srcUrl   = reqObject.url,
                method   = reqObject.method,
                parsed   = URL.parse(srcUrl),
                headers  = reqObject.headers,
                params   = QS.parse(parsed.query),
                clearUrl = URL.format({
                    protocol : parsed.protocol,
                    host     : parsed.host,
                    port     : parsed.port,
                    hostname : parsed.hostname,
                    pathname : parsed.pathname
                }),
                authHeaderParams = {};

            
            authHeaderParams.oauth_consumer_key     = params.oauth_consumer_key     = that._creds.oauth_consumer_key;
            authHeaderParams.oauth_signature_method = params.oauth_signature_method = that._creds.oauth_signature_method;
            authHeaderParams.oauth_version          = params.oauth_version          = that._creds.oauth_version;
            authHeaderParams.oauth_timestamp        = params.oauth_timestamp        = utils.time.now;
            authHeaderParams.oauth_nonce            = params.oauth_nonce            = nonce;


            var encodedSignature = oauthSignature.generate(
                    method,
                    clearUrl,
                    params,
                    that._creds.oauth_consumer_secret
                ),
                authHeader = ['OAuth '];

            for ( var key in authHeaderParams ) {
                authHeader.push( key + '="' + authHeaderParams[key] + '", ' );
            }

            authHeader = authHeader.join('');
            authHeader = authHeader + 'oauth_signature="' + unescape(encodedSignature) + '"';

            params.oauth_signature = encodedSignature;


            parsed.query = QS.stringify(params);
            delete parsed.path;
            parsed.search = '?' + parsed.query;

            var targetUrl       = URL.format(parsed),
                targetReqObject = that._normalizeRequest(srcUrl);

            targetReqObject.headers = headers;
            targetReqObject.headers.Authorization = authHeader;
            targetReqObject.method  = method;

            return that._sendQioRequest(targetReqObject);
        });
    }
});

function isNotImplemented () {
    return Q.reject('the method is not implemented');
}
