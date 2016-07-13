const uuid = require('node-uuid');

exports.description = 'it sets uuid for all API Services URLs';

exports.run = function (cfg, opts) {
    const
        db = cfg.db,
        DB_TENANTS_PREFIX = opts.SETTINGS.databases_tenants_name_prefix;

    return db.get(
        'dreamface_sysdb',
        'tenants'
    ).then(function (result) {
            var tenants = result.map(function (res) {
                return res.id;
            });

            tenants.forEach(function (tenant) {
                db.get(
                    DB_TENANTS_PREFIX + tenant,
                    'dataqueries'
                ).then(function(dataqueries){
                        dataqueries.forEach(function(dataquery){
                            Object.keys(dataquery.apiRoutes).forEach(function (key) {
                                var query = {};
                                query['apiRoutes.' + key + '.uuid'] = uuid.v1();
                                return db.update(
                                    DB_TENANTS_PREFIX + tenant,
                                    'dataqueries',
                                    {name: dataquery.name},
                                    {$set: query}
                                );
                            });
                        });
                    });
            });
        });
};
