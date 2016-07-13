var SETTINGS = require('./dfx_settings'),
    Q = require('q'),
    mdbw = require('./mdbw')(SETTINGS.mdbw_options);

exports.addActiveRepositoryToSession = function ( req, done ) {
    var prefix = SETTINGS.databases_tenants_name_prefix,
        tenantid = req.session.tenant.id;
    Q.when( mdbw.get(prefix + tenantid, 'versioning_providers',{"provider": "github"}),
        function(docs){
            if (docs.length === 0) done();
            var data = {};
            docs[0].repositories.forEach(function(r){
                data[r.application] = r
            });
            req.session.activeRepository = data;
            done();
        }
    );
};
