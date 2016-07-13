
/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

const Q = require('q');

exports.description = 'Add default status to objects';

exports.run = function (cfg, opts) {
    const
        db = cfg.db,
        DB_TENANTS_PREFIX = opts.SETTINGS.databases_tenants_name_prefix,
        SYS_DB_NAME       = opts.SETTINGS.system_database_name,
        TENANTS_COLLECTION_NAME = opts.SETTINGS.system_database_tenants_collection_name;

    var collections = [
        'applications',
        'dataqueries',
        'datawidgets',
        'db_drivers',
        'auth_providers',
        'users',
        'roles',
        'resources',
        'metadata',
        'datawidgets_categories',
        'dataqueries_categories',
        'screens_categories',
        'application_configuration'
    ];
    var defaultStatus = {
        "versioning": {
            "status": "added",
            "user": "admin",
            "last_action": (new Date() / 1000).toFixed()
        }
    };


    return db.get(SYS_DB_NAME, TENANTS_COLLECTION_NAME)
        .then(function (tenants) {
            return Q.all(tenants.map(function(tenant){
                return Q.all( collections.map(function(collectionName){
                    if ((collectionName === 'db_drivers') || (collectionName === 'auth_providers')) {
                        return db.update(
                            collectionName,
                            tenant.id,
                            {},
                            {$set : defaultStatus}
                        );
                    } else {
                        return db.update(
                            DB_TENANTS_PREFIX + tenant.id,
                            collectionName,
                            {},
                            {$set : defaultStatus}
                        );
                    }
                }));
            }))
        });
}
