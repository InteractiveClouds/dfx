var Q = require('q'),
    endpoint            = require('../utils/endpoints'),
    gcTemplates         = require('../dfx_gc_templates'),
    log                 = new (require('../utils/log')).Instance({label:'API_GC_TEMPLATES'}),

    api = {

        getAll : function ( o ) {
            var D = Q.defer();

            gcTemplates.getAllForCompiler(o.appname, o.fakeReq, o.platform, function(item){
                D.resolve(item);
            });

            return D.promise;
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

        return {
            action : req.params.action,
            data : {
                tenantid : tenantid,
                appname  : req.query.appname,
                platform : req.query.platform,
                fakeReq  : fakeReq
            }
        }

    },

    action : api,

    log : log
});
