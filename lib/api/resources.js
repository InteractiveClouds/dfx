var Q = require('q'),
    endpoint  = require('../utils/endpoints'),
    apps      = require('../dfx_applications'),
    resources = require('../dfx_resources'),
    log       = new (require('../utils/log')).Instance({label:'API_RESOURCES'}),
    versioningUtils = require('../dfx_versioning.utils'),

    api = {

        list : function ( o ) {
            return resources.api.list({ "tenant": o.tenantid })
        },

        getAppResourceItems : function ( o ) {
            return apps.getApplicationWidgets(o.appname, o.fakeReq, o.platform).then(function (appWidgets) {
                return resources.api.getAppResourceItemsAsPromise(o.appname, appWidgets, o.tenantid);
            });
        },

        deployResources : function ( o ) {
            return apps.getApplicationWidgets(o.appname, o.fakeReq, o.platform).then(function (appWidgets) {
                //deployResources(appname, app_widgets, deploy_dir, req.session.tenant.id)
                return resources.api.getAppResourceItemsAsPromise(o.appname, appWidgets, o.tenantid);
            });
        }
    };


module.exports =  endpoint.json({

    parser : function ( req ) {

        var D = Q.defer(),
            tenantid = req.query.tenantid,
            fakeReq = {
                session : { tenant : { id : tenantid }},
                user : { tenantid : tenantid },
                params : { applicationName : req.query.appname }
            };

        versioningUtils.addActiveRepositoryToSession( fakeReq, function(){
            D.resolve({
                action : req.params.action,
                data : {
                    tenantid : tenantid,
                    appname  : req.query.appname,
                    platform : req.query.platform,
                    fakeReq  : fakeReq
                }
            });
        });

        return D.promise;
    },

    action : api,

    log : log
});

