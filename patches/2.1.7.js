const Q = require('q');

exports.description = 'changing default screen categories for Default from empty string';

var getCategoryDefinition = function () {
    return {
        "ownerId": "",
        "name": "Default",
        "application": "",
        "requestDate": new Date(),
        "versioning": {
            "status":      "added",
            "user":        "admin",
            "last_action": (new Date() / 1000).toFixed()
        }
    };
};

exports.run = function (cfg, opts) {
    const
        DB_TENANTS_PREFIX = opts.SETTINGS.databases_tenants_name_prefix,
        db = cfg.db;

    return db.get(
        'dreamface_sysdb',
        'tenants'
    ).then(function( result ) {
            var tenants = result.map(function(res){
                return res.id;
            });

            var d = Q(1);
            tenants.forEach(function(tenant){
                d = d.then(function () {
                    var tenantDbName = DB_TENANTS_PREFIX + tenant;

                    var tasks = [];

                    // loop through all apps and add 'Default' screen category
                    tasks.push( db.select(tenantDbName, 'applications', {}, { name: true }).then(function (appNames) {
                        appNames.forEach(function(appName) {
                            var categoryDefinition = getCategoryDefinition();
                            categoryDefinition.application = appName.name;
                            db.update(tenantDbName, 'screens_categories',
                                {
                                    name: 'Default',
                                    application: appName.name
                                },
                                categoryDefinition,
                                {
                                    upsert: true,
                                    multi: false
                                }
                            );
                        });
                    }) );

                    // loop through all screens and add 'Default' screen category instead of empty one
                    tasks.push( db.select(tenantDbName, 'screens', {}, {}).then(function (screens) {
                        screens.forEach(function(screen) {
                            if (! screen.category) {
                                screen.category = 'Default';
                                db.update(tenantDbName, 'screens', {
                                        name: screen.name,
                                        application: screen.application
                                    },
                                        screen
                                    ,
                                    {
                                        upsert: false,
                                        multi: false
                                    }
                                );
                            }
                        });
                    }) );

                    return Q.all(tasks);
                });
            });

            return d;
        });
};

