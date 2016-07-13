var SETTINGS = require('../dfx_settings'),
    sysadmin = require('../dfx_sysadmin'),
    request  = require('request'),
    queries,
    uuid = require('node-uuid'),
    credCrypt = require('../auth/utils/credCrypt'),
    URL = require('url'),
    AR = require('../authRequest'),
    providers = require('./providers'),
    PRFX = SETTINGS.databases_tenants_name_prefix,
    THIS_SERVER_URI = URL.format({
        protocol : process.env.DFX_HTTPS ? 'https' : 'http',
        hostname : SETTINGS.external_server_host,
        port     : SETTINGS.external_server_port,
    }),
    THIS_REDIRECT_URI = URL.resolve(THIS_SERVER_URI, 'oauth2callback'),
    Q = require('q'),
    db,
    log = new (require('../utils/log')).Instance({label: 'OAUTH2_ACCESS_TOKENS'});

log.dbg('THIS_REDIRECT_URI : ' + THIS_REDIRECT_URI);

var ar = AR.getRequestInstance();

exports.init = function ( o ) {
    queries = require('../dfx_queries'),
    db = o.storage;
    delete exports.init;
};

exports.get = function ( o ) {
    log.dbg('GET access_token : ', o);

    return db.get(PRFX + o.tenant, 'oAuth2_access_tokens', {
        application : o.application,
        user        : o.user,
        provider    : o.provider
    })
    .then(function(docs){
        return !docs.length
            ? Q.resolve(null)
            : credCrypt.decrypt(docs[0].credentials)
                .then(function(decrypted){
                    docs[0].credentials = JSON.parse(decrypted);
                    log.dbg('TOKEN CREDS FROM DB : ', docs[0].credentials);
                    return docs[0];
                });
    })
};

exports.rm = function ( o ) {
    log.dbg('REMOVE access_token : ', o);

    return db.rm(PRFX + o.tenant, 'oAuth2_access_tokens', {
        application : o.application,
        user        : o.user,
        provider    : o.provider
    })
};

exports.put = function ( o ) {
    return exports.rm(o)
    .then(function(){
        log.dbg('PUT access_token : ', o);

        return credCrypt.encrypt(JSON.stringify({
            access_token  : o.credentials.access_token,
            refresh_token : o.credentials.refresh_token
        }))
    })
    .then(function(encrypted){
        return db.put(PRFX + o.tenant, 'oAuth2_access_tokens', {
            application : o.application,
            user        : o.user,
            provider    : o.provider,
            expires     : o.expires,
            credentials : encrypted
        });
    })
};

var cache = {}; // TODO watch quantity // TODO auto delete

exports.obtain = function ( req, res, next ) {

    var qry = req.query;
        tenant             = req.user.tenantid,
        user               = req.user.userid,
        apiRoute           = qry.apiroute, // undefined if isStudio
        application        = qry.isStudio ? qry.application : req.user.application,
        successRedirectURL = qry.isStudio ? qry.studiourl : qry.appurl,
        providerID         = qry.isStudio ? qry.authProvider : undefined,
        state              = uuid.v1();

    // TODO check the parsed params


    (function(){
        return providerID
            ? Q(providerID)
            : queries.getDQObjByApiRoute(tenant, application, apiRoute)
                .then(function(dq){
                    return dq.settings.authentication;
                })
    })()
    .then(function(provider){

        log.dbg('obtain access_token request : ' + JSON.stringify({
            tenant             : tenant,
            application        : application,
            user               : user,
            apiRoute           : apiRoute,
            successRedirectURL : successRedirectURL,
            state              : state,
            provider           : provider
        }, null, 4));

        //res.redirect(req.query.appurl);

        return sysadmin.provider.get({
            tenant          : tenant,
            provider        : provider,
            applicationName : application
        })
        .then(function(prvdrOpts){
        
            if ( prvdrOpts.schema !== 'oAuth2' || prvdrOpts.credentials.access_token ) {
                return res.redirect(successRedirectURL);
            }
        
            var type = prvdrOpts.credentials.type,
                authURL = providers[type].formatAuthorizePath(prvdrOpts, state); // TODO get provider from request
        
            cache[state] = {
                authURL            : authURL,
                tenant             : tenant,
                application        : application,
                provider           : provider,
                user               : user,
                successRedirectURL : successRedirectURL,
                consumerKey        : prvdrOpts.credentials.consumer_key,
                consumerSecret     : prvdrOpts.credentials.consumer_secret,
                baseSite           : prvdrOpts.credentials.base_site,
                accessTokenPath    : prvdrOpts.credentials.access_token_path,
                created            : (new Date).getTime()
            };
        
            log.dbg('REDIRECTING TO : ' + authURL);

            res.redirect(authURL);
        })
    })
    .done();
};

exports.oauth2callback = function ( req, res, next ) {

    var error = req.query.error,
        code  = req.query.code,
        state = req.query.state;

    log.dbg('oauth2callback is invoked: ', {
        error : error,
        code  : code,
        state : state
    });

    if ( !state ) return log.error('no state at callback');
    if ( error ) log.error('error at callback: ', error);

    var urlParams;
    if ( cache[state].baseSite ) {
        urlParams= URL.parse(cache[state].baseSite);
        urlParams.pathname = cache[state].accessTokenPath;
    } else {
        urlParams= URL.parse(cache[state].accessTokenPath);
    }

    var accessTokenURL = URL.format(urlParams),
        body = {
            code          : code,
            client_id     : cache[state].consumerKey,
            client_secret : cache[state].consumerSecret,
            redirect_uri  : THIS_REDIRECT_URI,
            grant_type    : 'authorization_code'
        },
        now = (new Date).getTime();

    request.post({
        url  : accessTokenURL,
        form : body
    }, function(error, httpResponse, data){
        if ( error ) throw( error );

        var parsed;

        log.dbg('access_token raw response : ', data);

        try { parsed = JSON.parse(data) }
        catch (e) { log.error('can not parse access_token response', e) }

        log.dbg('access_token parsed response : ', (parsed || 'PARSE ERROR'));

        exports.put({
            application : cache[state].application,
            user        : cache[state].user,
            tenant      : cache[state].tenant,
            provider    : cache[state].provider,
            expires     : now + parsed.expires_in * 1000,
            credentials : {
                access_token  : parsed.access_token,
                refresh_token : parsed.refresh_token,
                token_type    : parsed.token_type
            }
        })
        .done();

        res.redirect(cache[state].successRedirectURL);
        delete cache[state];
    });
};
