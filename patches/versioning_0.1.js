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
    async = require('async'),
    mongo = require('mongodb'),
     _ = require('underscore');
var DB_TENANTS_PREFIX = SETTINGS.databases_tenants_name_prefix;

mdbw.get("dreamface_sysdb", 'tenants')
.then(function (tenants) {
    if (!_.isEmpty(tenants)) {
        async.each(tenants, function(tenant, callback) {
                 async.parallel(
                    [
                      function(cb){
                            mdbw.get(DB_TENANTS_PREFIX + tenant.id, 'applications')
                                .then(function(applications) {
                                    applications.forEach(function(application) {
                                        if (application.versioning && application.versioning.status === 'deleted') {
                                            mdbw.rm(DB_TENANTS_PREFIX + tenant.id, 'applications', {name: application.name})
                                                .then(function(){
                                                    cb();
                                                });
                                        } else {
                                             if (application.versioning) {
                
                                              mdbw.update(DB_TENANTS_PREFIX + tenant.id, 'applications', {name:application.name}, {$unset:{versioning:1}})
                                              .then(function(){
                                                cb();
                                              });

                                             }
                                        }
                                        });
                                     });
                               // Empty versioning providers collection
                               mdbw.update(DB_TENANTS_PREFIX + tenant.id, 'versioning_providers', {}, {$unset:{provider:1,repositories:1,repository:1,tenant:1,username:1}})
                                              .then(function(){
                                              }).fail(function(err){
                                                  console.log(err);
                                              });


                      },
                      function(cb){
                          mdbw.get(DB_TENANTS_PREFIX + tenant.id, 'screens')
                                .then(function(screens) {
                                    screens.forEach(function(screen) {
                                        if (screen.versioning && screen.versioning.status === 'deleted') {
                                            mdbw.rm(DB_TENANTS_PREFIX + tenant.id, 'screens', {_id: new mongo.ObjectID(screen._id)})
                                                .then(function(){
                                                    cb();
                                                });
                                        } else {
                                             if (screen.versioning) {     
                                              mdbw.update(DB_TENANTS_PREFIX + tenant.id, 'screens', {_id: new mongo.ObjectID(screen._id)}, {$unset:{versioning:1}})
                                              .then(function(){
                                                cb();
                                              })
                                             }
                                        }
                                        });
                                     });
                      },
                      function(cb){
                        mdbw.get(DB_TENANTS_PREFIX + tenant.id, 'datawidgets')
                                                .then(function(datawidgets) {
                                                    datawidgets.forEach(function(datawidget) {
                                                        if (datawidget.versioning && datawidget.versioning.status === 'deleted') {
                                                            mdbw.rm(DB_TENANTS_PREFIX + tenant.id, 'datawidgets', {name: datawidget.name})
                                                                .then(function(){
                                                                });
                                                        } else {
                                                         if (datawidget.versioning) {     
                                                          mdbw.update(DB_TENANTS_PREFIX + tenant.id, 'datawidgets', {name: datawidget.name}, {$unset:{versioning:1}})
                                                          .then(function(){
                                                            cb();
                                                          })
                                                         }
                                                    }
                                                    });
                                                });

                      },
                      function(cb){
                        mdbw.get(DB_TENANTS_PREFIX + tenant.id, 'dataqueries')
                                                                .then(function(dataqueries) {
                                                                    dataqueries.forEach(function(dataquery) {
                                                                        if (dataquery.versioning && dataquery.versioning.status == 'deleted') {
                                                                            mdbw.rm(DB_TENANTS_PREFIX + tenant.id, 'dataqueries', {name: dataquery.name})
                                                                                .then(function(){

                                                                                });
                                                                        } else {
                                                                          if (dataquery.versioning) {     
                                                                              mdbw.update(DB_TENANTS_PREFIX + tenant.id, 'dataqueries', {name: dataquery.name}, {$unset:{versioning:1}})
                                                                              .then(function(){
                                                                                cb();
                                                                              })
                                                                             }
                                                                        }
                                                                    });
                                                                });

                      },
                      function(cb){
                          mdbw.get(DB_TENANTS_PREFIX + tenant.id, 'users').then(function(users){
                                 users.forEach(function(user){
                                         mdbw.update(DB_TENANTS_PREFIX + tenant.id, 'users', {_id: new mongo.ObjectID(user._id)}, {$unset:{access_token:1}})
                                                          .then(function(){
                                                          }).fail(function(err){
                                                           console.log(err);
                                                          });
                                 });
                          });
                      }
                    ]
                  ,function(){

                 });
        },function(){
        });
    }
}).fail(function(err){
   console.log(err);
});


console.log("Wait please 5 seconds and then press CTRL + C :)");
