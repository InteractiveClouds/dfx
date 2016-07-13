var Q = require('q'),
    endpoint = require('../utils/endpoints'),
    apps     = require('../dfx_applications'),
    menus    = require('../dfx_menus'),
    log      = new (require('../utils/log')).Instance({label:'API_APPS'}),
    versioningUtils = require('../dfx_versioning.utils'),

    api = {

        get : function ( o ) {
            var D = Q.defer();

            apps.get(o.appname, o.fakeReq, function(error, item){
                error
                    ? D.reject(error)
                    : D.resolve(item);
            });

            return D.promise;
        },

        getApplicationWidgets : function ( o ) {
            return apps.getApplicationWidgets(o.appname, o.fakeReq, o.platform);
        },

        getApplicationMenus : function ( o ) {
            return menus.getAllAsPromise(o.appname, o.fakeReq).then(function(menus) {
                return menus;
            });
        },

        getApplicationConfiguration : function ( o ) {
            return apps.getConfigurationAsPromise(o.appname, o.fakeReq).then(function(menus) {
                return menus;
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
