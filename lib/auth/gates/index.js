/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var SETTINGS = require('../../dfx_settings'),
    log = new (require('../../utils/log')).Instance({label:'GATES_INDEX'}),
    oauthSignature = require('oauth-signature'),
    util = require('../utils');


exports.init = function ( o ) {
    exports.init = function () { log.fatal('Init can be invoked only once'); };


    var out = {};

    var app = new (require('./' + o.schema + '/app.js').Constructor)({
        users        : o.users,
        tokenManager : o.tokenManager
    });

    out.app = app.endpoint.bind(app);


    var appQuery = new (require('./' + o.schema + '/appQuery.js').Constructor)({
        users        : o.users,
        tokenManager : o.tokenManager
    });

    out.appQuery = appQuery.endpoint.bind(appQuery);


    var console = new (require('./' + o.schema + '/sessionGate').Constructor)({
        sessionManager : o.consoleSessionManager,
        failedAnswer   : function ( req, res ) {
            res.redirect('/console/login');
        }
    });

    out.console = console.endpoint.bind(console);


    var consoleStatic = new (require('./' + o.schema + '/sessionGateStatic').Constructor)({
        sessionManager : o.consoleSessionManager,
        failedAnswer   : function ( req, res ) {
            res.status(401).end();
        }
    });

    out.consoleStatic = consoleStatic.endpoint.bind(consoleStatic);


    var studio = new (require('./' + o.schema + '/sessionGate').Constructor)({
        sessionManager: o.studioSessionManager,
        failedAnswer:   function (req, res) {
            log.info(req.path);
            if ((/^\/studio(?:\/(?:widget\/)?index\.html)?$/.test(req.path)) || (/^\/studio(?:\/?landing\.html)?$/.test(req.path))) {
                var tenantid = util.lastLoginCookie.get(req).tenantid;
                if (tenantid) {
                    res.redirect('/studio/' + tenantid + '/login');
                    return;
                }
            }
            res.statusCode = 401;
            res.end('Unauthorized');
        }
    });

    out.studio = studio.endpoint.bind(studio);


    var oAuthSimpleSigned = new (require('./default/oAuthSimpleSigned').Constructor)({
        oauthSignature : oauthSignature,
        oauth_consumer_key    : o.extGate.consumer_key,
        oauth_consumer_secret : o.extGate.consumer_secret
    });

    out.oAuthSimpleSigned = oAuthSimpleSigned.endpoint.bind(oAuthSimpleSigned);


    return out;
};
