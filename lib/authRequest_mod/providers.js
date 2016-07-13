var URL = require('url'),
    SETTINGS = require('../dfx_settings'),
    THIS_SERVER_URI = URL.format({
        protocol : process.env.DFX_HTTPS ? 'https' : 'http',
        hostname : SETTINGS.external_server_host,
        port     : SETTINGS.external_server_port,
    }),
    THIS_REDIRECT_URI = URL.resolve(THIS_SERVER_URI, 'oauth2callback');

exports.google = {
    formatAuthorizePath : function ( o, state ) {

        var cr   = o.credentials,
            opts = URL.parse(cr.base_site);

        opts.pathname = cr.authorize_path;
        opts.query = {
            response_type : 'code',
            client_id     : cr.consumer_key,
            redirect_uri  : THIS_REDIRECT_URI,
            scope         : cr.scope.replace(/\+/g, ' '),
            state         : state,
        };

        return URL.format(opts);
    }
};

exports.facebook = {
    formatAuthorizePath : function ( o, state ) {

        var cr   = o.credentials,
            opts = URL.parse(cr.authorize_path);

        opts.query = {
            response_type : cr.response_type,
            client_id     : cr.consumer_key,
            redirect_uri  : THIS_REDIRECT_URI,
            state         : state,
        };

        if ( cr.scope ) opts.query.scope = cr.scope.replace(/\+/g, ' ');

        return URL.format(opts);
    }
};
