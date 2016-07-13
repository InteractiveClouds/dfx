/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */
var  SETTINGS = require('../../../dfx_settings'),
    Q = require('q'),
    db = require('../../../mdbw')(SETTINGS.mdbw_options),
    sysdbName        = SETTINGS.system_database_name,
    DB_TENANTS_PREFIX = SETTINGS.databases_tenants_name_prefix;

var UsersLimit = {};

UsersLimit.init = function(tenant) {
    return db.exists(
        sysdbName,
        "tenants",
        {
            id : tenant,
            "limits.users" : { $exists: true}
        }
    )
        .then(function(exists){
            if (!exists) {
                var defaultLimit = SETTINGS.default_limits.users;
                return UsersLimit.saveLimit(tenant, defaultLimit);
            } else {
                return Q.reject("Users limit was already set!")
            }
        });
};

UsersLimit.saveLimit = function(tenant, limit) {
    return db.update(
        sysdbName,
        "tenants",
        {id : tenant},
        {
            $set : {"limits.users" : limit}
        }
    );
};

UsersLimit.getLimit = function(tenant, limit) {
    return db.get(
        sysdbName,
        "tenants",
        {id : tenant}
    ).then(function(t){
            if  (t.length > 0) return t[0].limits[limit];

            return Q.reject("Tenant " + tenant + " not found in system");
        })
};

UsersLimit.disable = function(tenant, diff, items) {
    if (items) {
        console.log("Users [" + items  + "] will be removed");
        var tasks = items.map(function(user){
            return require('../../../dfx_sysadmin').tenant.user.remove(tenant, user);
        });
        return Q.all(tasks);
    } else {
        return require('../../../dfx_sysadmin').tenant.user.list(tenant)
            .then(function(list){
                list = list.slice(diff);
                var tasks = list.map(function(user){
                    console.log("Users [" + user.login  + "] will be removed");
                    return require('../../../dfx_sysadmin').tenant.user.remove(tenant, user.login);
                });
                return Q.all(tasks)
            });


    }
};

UsersLimit.getAllObjects = function(tenant) {
    return require('../../../dfx_sysadmin').tenant.user.list(tenant);
};

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
};


module.exports = UsersLimit;
