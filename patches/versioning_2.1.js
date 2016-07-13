
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


 return mdbw.get(SYS_DB_NAME, TENANTS_COLLECTION_NAME)
     .then(function (tenants) {
      return Q.all(tenants.map(function(tenant){
       return Q.all( collections.map(function(collectionName){
           if ((collectionName === 'db_drivers') || (collectionName === 'auth_providers')) {
               return mdbw.update(
                   collectionName,
                   tenant.id,
                   {},
                   {$set : defaultStatus}
               );
           } else {
               return mdbw.update(
                   DB_TENANTS_PREFIX + tenant.id,
                   collectionName,
                   {},
                   {$set : defaultStatus}
               );
           }
       }));
      }))
          .then(function(){
          console.log("Patch was done!");
              process.exit(0);
      })
     });
}());

