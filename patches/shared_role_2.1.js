
/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var SETTINGS = require('../lib/dfx_settings'),
    mdbw = require('../lib/mdbw')(SETTINGS.mdbw_options),
    Q = require('q'),
    DB_TENANTS_PREFIX = SETTINGS.databases_tenants_name_prefix,
    SYS_DB_NAME       = SETTINGS.system_database_name,
    TENANTS_COLLECTION_NAME    = SETTINGS.system_database_tenants_collection_name;

//exports.description = 'Add default status to objects';

var run = (function () {
    var defaultRoles = {
         "roles": {
             "list": [
                 "guest",
                 "shared_guest"
             ],
             "default": "guest"
         }
    };

    var sharedRole = {
            "name": "shared_guest",
            "application": "",
            "rights": [],
            "type": "",
            "unremovable": true,
            "description": "",
            "versioning": {
            "status": "added",
                "user": "admin",
                "last_action": (new Date() / 1000).toFixed()
        }
    };

     return mdbw.get(SYS_DB_NAME, TENANTS_COLLECTION_NAME)
         .then(function (tenants) {
              return Q.all(tenants.map(function(tenant) {
                   return mdbw.update(
                           DB_TENANTS_PREFIX + tenant.id,
                           'users',
                           {'kind': 'application'},
                           {$set : defaultRoles}
                       ).then(function(){
                           return mdbw.put(
                               DB_TENANTS_PREFIX + tenant.id,
                               'roles',
                               sharedRole
                           );
                       });

              })).then(function(){
                  console.log("Patch was done!");
                  process.exit(0);
              })
         });
}());

