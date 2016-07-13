var Q = require('q'),
    endpoint = require('../utils/endpoints'),
    screens  = require('../dfx_screens'),
    log      = new (require('../utils/log')).Instance({label:'API_SCREENS'}),

    api = {

        getAll : function ( o ) {
            var D = Q.defer();

            screens.getAll(o.appname, o.fakeReq, o.platform, function(item){
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

