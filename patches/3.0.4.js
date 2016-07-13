/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

const Q = require('q');

exports.description = 'it sets default "web" platform for all existing screens_categories and datawidgets_categories';

exports.run = function (cfg, opts) {
    const
        SETTINGS = opts.SETTINGS,
        db       = cfg.db,
        DB_TENANTS_PREFIX       = SETTINGS.databases_tenants_name_prefix,
        SYS_DB_NAME             = SETTINGS.system_database_name,
        TENANTS_COLLECTION_NAME = SETTINGS.system_database_tenants_collection_name;

    var collections = [
        'datawidgets_categories',
        'screens_categories',
    ];
    var query = {
        "platform": "web"
    };

    return db.get(SYS_DB_NAME, TENANTS_COLLECTION_NAME)
        .then(function (tenants) {
            return Q.all(tenants.map(function(tenant){
                return Q.all( collections.map(function(collectionName){
                    return db.update(
                        DB_TENANTS_PREFIX + tenant.id,
                        collectionName,
                        {},
                        {$set : query},
                        { multi : true, upsert : false }
                    );
                }));
            }))
        });
}
