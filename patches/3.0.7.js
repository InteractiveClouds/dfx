const Q = require('q');

exports.description = 'it sets default "web" platform for all application builds';

exports.run = function (cfg, opts) {
    const
        DB_TENANTS_PREFIX = opts.SETTINGS.databases_tenants_name_prefix,
        db = cfg.db;

    return db.get(
        'dreamface_sysdb',
        'tenants'
    )
        .then(function (tenants) {
            return Q.all(tenants.map(function (tenant ) {
                return db.update(
                    DB_TENANTS_PREFIX + tenant.id,
                    'application_builds',
                    {},
                    { $set: {'platform':'web'} },
                    { multi : true, upsert : false }
                );
            }));
        });
};
