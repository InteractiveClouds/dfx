const Q = require('q');

var getCategoryDefinition = function () {
    return {
            "ownerId": "",
            "name": "Default",
            "application": "",
            "requestDate": new Date(),
            "visibility": "visible",
            "versioning": {
            "status":      "added",
                "user":        "admin",
                "last_action": (new Date() / 1000).toFixed()
            }
        };
};

exports.description = 'applying new explicit categories';

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

                // put 2 'Default' categories in shared catalog for widgets (web & mobile platforms)
                // and 1 for queries
                var categoryDefinition = getCategoryDefinition();
                categoryDefinition.platform = "web";
                tasks.push( db.put(tenantDbName, 'datawidgets_categories', categoryDefinition) );

                categoryDefinition = getCategoryDefinition();
                categoryDefinition.platform = "mobile";
                tasks.push( db.put(tenantDbName, 'datawidgets_categories', categoryDefinition) );

                categoryDefinition = getCategoryDefinition();
                tasks.push( db.put(tenantDbName, 'dataqueries_categories', categoryDefinition) );

                // update all widgets/queries with '' category for 'Default' one
                tasks.push( db.update(tenantDbName, 'datawidgets',
                    {category: ''},
                    {$set: {category: 'Default'}
                }) );
                tasks.push( db.update(tenantDbName, 'dataqueries',
                    {category: ''},
                    {$set: {category: 'Default'}
                }) );

                // loop through all apps and add 'Default' category
                tasks.push( db.select(tenantDbName, 'applications', {}, { name: true }).then(function (appNames) {
                    appNames.forEach(function(appName) {
                        categoryDefinition = getCategoryDefinition();
                        categoryDefinition.application = appName.name;
                        db.put(tenantDbName, 'datawidgets_categories', categoryDefinition);
                        db.put(tenantDbName, 'dataqueries_categories', categoryDefinition);
                    });
                }) );

                // add platform to shared categories
                tasks.push( db.get(tenantDbName, 'datawidgets_categories', { application: '' }).then(function (categories) {
                    categories.forEach(function(category) {
                        if (category.name != '' && category.name != 'Default') {
                            db.update(tenantDbName, 'datawidgets_categories',
                                {name: category.name, application: ''}, {$set: {platform: 'web'}})
                                .then(function () {
                                    category.platform = "mobile";
                                    delete category._id;
                                    db.put(tenantDbName, 'datawidgets_categories', category);
                                });
                        }
                    });
                }) );

                return Q.all(tasks);
            });
        });

        return d;
    });
};

