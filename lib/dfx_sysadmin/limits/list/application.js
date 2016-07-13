/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */
var  SETTINGS = require('../../../dfx_settings'),
     Q = require('q'),
     db = require('../../../mdbw')(SETTINGS.mdbw_options),
     sysdbName        = SETTINGS.system_database_name,
     DB_TENANTS_PREFIX = SETTINGS.databases_tenants_name_prefix;

var AppLimits = {};

AppLimits.init = function(tenant) {
    return db.exists(
            sysdbName,
            "tenants",
            {
                id : tenant,
                "limits.applications" : { $exists: true}
            }
        )
        .then(function(exists){
             if (!exists) {
                 var defaultLimit = SETTINGS.default_limits.applications;
                 return AppLimits.saveLimit(tenant, defaultLimit);
             } else {
                 return Q.reject("Application limit was already set!")
             }
        });
};

AppLimits.saveLimit = function(tenant, limit) {
            return db.update(
                sysdbName,
                "tenants",
                {id : tenant},
                {
                    $set : {"limits.applications" : limit}
                }
            );
};

AppLimits.getLimit = function(tenant, limit) {
    return db.get(
        sysdbName,
        "tenants",
        {id : tenant}
    ).then(function(t){
            if  (t.length > 0) return t[0].limits[limit];

            return Q.reject("Tenant " + tenant + " not found in system");
        })
};

AppLimits.disable = function(tenant, diff, items) {
    if (items) {
        return require('../../../dfx_applications').deactivate({apps : items, tenantId : tenant});
    } else {
        return getLast(tenant, diff)
            .then(function(list){
               var appsList =  list.map(function(item){
                    return item.name;
                });
               return require('../../../dfx_applications').deactivate({apps : appsList, tenantId : tenant});
            });


    }
};

AppLimits.getAllObjects = function(tenant) {
    return require('../../../dfx_applications').getAllActive(tenant);
}

function getLast(tenant, diff) {
    var D = Q.defer();
    db.native(
        DB_TENANTS_PREFIX + tenant,
        "applications"
    ).then(function(d){
            d.find({active : true}).limit(diff).sort({creationDate:-1}).toArray(function(err, docs) {
                if (err)  D.reject(err);
                return D.resolve(docs);
            });
        });
    return D.promise;
}

module.exports = AppLimits;