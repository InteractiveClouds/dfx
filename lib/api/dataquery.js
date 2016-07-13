var Q = require('q'),
    endpoint = require('../utils/endpoints'),
    queries  = require('../dfx_queries'),
    log      = new (require('../utils/log')).Instance({label:'API_QUERIES'}),
    versioningUtils = require('../dfx_versioning.utils'),

    api = {

        getAll : function ( o ) {
            var D = Q.defer();

            queries.getAll(o.fakeReq, function(item){
                D.resolve(item);
            });

            return D.promise;
        },

        getApplicationWidgets : function ( o ) {
            return apps.getApplicationWidgets(o.appname, o.fakeReq);
        }
    };


module.exports =  endpoint.json({

    parser : function ( req ) {

        var D = Q.defer(),
            tenantid = req.query.tenantid,
            fakeReq = {
                session : { tenant : { id : tenantid }},
                user : { tenantid : tenantid }
            };

        versioningUtils.addActiveRepositoryToSession( fakeReq, function(){
            D.resolve({
                action : req.params.action,
                data : {
                    tenantid : tenantid,
                    appname  : req.query.appname,
                    fakeReq  : fakeReq
                }
            });
        });

        return D.promise;
    },

    action : api,

    log : log
});

