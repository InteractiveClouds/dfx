var Q = require('q'),
    providersStorage = require('../dfx_sysadmin').provider,
    accessTokens = require('./oAuth2AccessTokens'),
    log = new (require('../utils/log')).Instance({label:'AUTH_REQUEST_MOD'}),
    util = require('util'),
    _ar = require('../authRequest'),

    cache = {}; // promices for the data


function composeCacheKey ( info ) {
    return [
        info.tenant,
        info.application,
        info.provider
    ].join('::');
}

function parseParams ( o ) {
    return {
        req : {
                url     : o.url,
                method  : o.method,
                headers : o.headers || {},
                query   : o.query   || {},
                body    : o.body    || {}
            },
        info : {
            tenant      : o.tenant,
            user        : o.user,
            application : o.application,
            provider    : o.provider
        },
        // arInstance,
        // provider,
        // cacheKey,
    };
}

function getARInstanceAndProvider ( params ) {

    var key = params.cacheKey = composeCacheKey(params.info);

    if ( cache.hasOwnProperty(key) ) return Q.when(cache[key], function(_cache){
        params.arInstance = _cache.arInstance;
        params.provider   = _cache.provider;

        return params;
    });

    var D = Q.defer();

    cache[key] = D.promise;

    return (
        params.info.provider
            ?   providersStorage.get({
                    tenant          : params.info.tenant,
                    provider        : params.info.provider,
                    applicationName : params.info.application
                })
            : Q.resolve()
    )
    .then(function(provider){
        return Q.when(_ar.getRequestInstance(provider), function(instance){
            params.arInstance = instance;
            params.provider   = provider;

            D.resolve({
                arInstance : instance,
                provider   : provider
            });

            return params;
        });
    });
}

function getoAuth2AccessToken ( params ) {
    return accessTokens.get({
        tenant      : params.info.tenant,
        application : params.info.application,
        user        : params.info.user,
        provider    : params.info.provider
    })
    .then(function(token){
        var now = (new Date).getTime();
    
        if ( token && token.expires > now ) {
            params.provider.credentials.access_token = token.credentials.access_token;
            return params;
        }
    
        return Q.reject(new ApiRouteError({type : 'oAuth2 redirection is required'}));
    });
}

function request ( o ) {

    return getARInstanceAndProvider(parseParams(o))
    .then(function(params){
        return (
            (
                'oAuth2' !== params.provider.schema    ||
                params.provider.credentials.access_token
            )
                ? Q(params)
                : getoAuth2AccessToken(params)
        )
        .then(function(params){
            return params.arInstance[params.req.method](params.req);
        })
        .then(
            function(answer){
                // TODO provider based answer parsing
                return answer;
            },
            function(error){

                log.error('GOT ERROR : ', error); // TODO remove

	            if ( error instanceof ApiRouteError ) return Q.reject(error);

                // TODO provider based error parsing
                if ( error && error.status+'' === '401' ) {

                    log.dbg('STATUS IS 401 for ', params.info);

                    delete cache[params.cacheKey];

                    return accessTokens.rm({
                        tenant      : params.info.tenant,
                        application : params.info.application,
                        user        : params.info.user,
                        provider    : params.info.provider
                    })
                    .then(function(){
                        return Q.reject(new ApiRouteError({type : 'oAuth2 redirection is required'}));
                    })
                } else {
                    return Q.reject(error);
                }
            }
        )
    });
}

request.Error = ApiRouteError;

// TODO rename?
function ApiRouteError ( o ) {
    this.type = o.type;
}


module.exports.request = request;
module.exports.oAuth2AccessTokens = accessTokens;



//ar({
//    provider    : '', // optional
//    tenant      : '',
//    user        : '',
//    application : '',
//
//    method  : '', // GET, POST, etc
//    url     : '',
//    headers : {}, // optional
//    query   : {}, // optional
//    body    : {}  // optional
//})
//.then(function(data){})
//.fail(function(error){});
