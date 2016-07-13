const Q = require('q');

exports.description = 'it sets new index on datawidgets collection';

exports.run = function (cfg, opts) {
    const
        db = cfg.db,
        DB_TENANTS_PREFIX = opts.SETTINGS.databases_tenants_name_prefix;

    if ( typeof db.native !== 'function' ) return Q.resolve();

    return db.get(
        'dreamface_sysdb',
        'tenants'
    ).then(function (result) {
            var tenants = result.map(function (res) {
                return res.id;
            });
            return Q.all(tenants.map(function (tenant) {
                return db.native(DB_TENANTS_PREFIX + tenant, 'datawidgets')
                    .then(function(db){
                        db.dropIndex('name_1_application_1', function(){
                            db.createIndex({platform:1,application:1,name:1},
                                {unique:true},
                                function(err, indexName) {
                                    return Q.resolve();
                                }
                            );
                        });
                    });
            }));
        });
};
