/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

// INSTRUCTIONS:

//  1. backup your mongodb databases
//  2. ensure you are backuped your mongodb databases
//  3. run `npm install`
//  4. fill and uncomment the mdbw_options:
           //var mdbw_options = {
           //    host : 'localhost',
           //    port : '27017',
           //    user : '',
           //    pass : ''
           //};
//  5. run the patch
//  6. if something wrong and you have not reached this clause yet -- remove the `node_modules` dir and goto 3


// BE AWARE: the file lib/aut/.auth.conf is used to crypt all credentials at your dfx databases.
// It is unique and important. If it is lost you have either:
//      waste a lot of time reseting all credentials
//      or lost all your dfx databases ( widgets, applications etc. ).
//
// The file is generated once when new repository is initialising, or when patches/auth_0.1 is invoked.




var mdbw_options;
var path      = require('path');

var log = require('../lib/utils/logger');
log.init({
    projectRootPath : path.resolve(__dirname, '..'),
    makeGlobal      : true,
    toSTDOUT        : true
});

if ( !mdbw_options ) log.fatal('read instructions first');


var SETTINGS  = require('../lib/dfx_settings'),
    log       = require('../lib/utils/logger'),
    Q         = require('q'),
    QFS       = require('q-io/fs'),
    db        = require('../lib/mdbw')(mdbw_options),
    credCrypt,
    authUtils = require('../lib/auth/utils');

var confFilePath = path.resolve(__dirname, '../lib/auth/.auth.conf'),
    sysdbName    = SETTINGS.system_database_name,
    tenantsClName    = SETTINGS.system_database_tenants_collection_name,
    repositoryPrefix = SETTINGS.databases_tenants_name_prefix;


db.get(sysdbName, 'settings', {name:'auth'})
.then(function ( docs ) {
 
    log.info('checking auth.version');
    var auth = docs[0];
    if ( auth ) log.fatal('auth.version is ok');
 
})
.then(function () {
 
    log.info('checking .auth.conf');
    var storagePassHash = authUtils.getStoragePassHash();
    if ( storagePassHash ) log.fatal('.auth.conf exists');
 
})
.then(authUtils.initCheck)
.then(function () {
 
    log.info('encrypting users credentials');
    credCrypt = require('../lib/auth/utils/credCrypt');
    return db.get(sysdbName, tenantsClName).then(
        function(tenants){
            var ids = tenants.map(function(e){return e.id});
            var tasks1 = [];
            ids.forEach(function(e){
                var tenantDB = repositoryPrefix + e;
                tasks1.push(db.get(tenantDB, 'users').then(function(users){
                    var tasks2 = [];
                    users.forEach(function(e){
                        tasks2.push(
                            credCrypt.encrypt(e.credentials.pass).then(function(encPass){
                                return db.update(tenantDB, 'users', {_id : e._id}, {$set: {'credentials.pass': encPass}} )
                            })
                        );
                    });
                    return Q.all(tasks2);
                }));
            });
            return Q.all(tasks1);
        },
        function (error) {log.fatal('can not get databases list. ' + error)}
    )
})
.then(function(){log.ok('users credentials are encrypted')})
.then(function () {
 
    log.info('encrypting auth providers credentials');
    return db.get('auth_providers').then(
        function(ids){
            var tasks1 = [];
            ids.forEach(function(id){
                tasks1.push(
                    db.get('auth_providers', id).then(function(providers){
                        var tasks2 = [];
                        providers.forEach(function(e){
                            tasks2.push(
                                credCrypt.encrypt(JSON.stringify(e.credentials)).then(function(enc){
                                    return db.update('auth_providers', id, {_id : e._id}, {$set: {credentials: enc}} )
                                })
                            );
                        });
                        return Q.all(tasks2);
                    })
                );
            });
            return Q.all(tasks1);
        },
        function (error) {log.fatal('can not get databases list. ' + error)}
    )
})
.then(function(){log.ok('auth providers credentials are encrypted')})
.then(function () {

    log.info('encrypting db providers passwords');
    return db.get('db_drivers').then(
        function(ids){
            var tasks1 = [];
            ids.forEach(function(id){
                tasks1.push(
                    db.get('db_drivers', id).then(function(providers){
                        var tasks2 = [];
                        providers.forEach(function(e){
                            tasks2.push(
                                credCrypt.encrypt(JSON.stringify(e.password)).then(function(enc){
                                    return db.update('db_drivers', id, {_id : e._id}, {$set: {password: enc}} )
                                })
                            );
                        });
                        return Q.all(tasks2);
                    })
                );
            });
            return Q.all(tasks1);
        },
        function (error) {log.fatal('can not get databases list. ' + error)}
    )
})
.then(function(){log.ok('db providers passwords are encrypted')})
.then(function () {

    log.info('reorganizing sysdb/settings');
    return db.get(sysdbName, 'settings', {'name':'sysdb'}).then(
        function(docs){
            if ( !docs.length ) log.fatal('can not get sysdb/settings collection ');
            var sett = docs[0];
            return db.rm(sysdbName, 'settings').then(function(){
                return credCrypt.encrypt(sett.sysCredentials.password).then(function(enc){
                    return Q.all([
                        db.put(sysdbName, 'settings', {
                            'name'           : 'sysdb',
                            'datecreation'   : sett.datecreation,
                            'version'        : sett.version
                        }),
                        db.put(sysdbName, 'settings', {
                            'name'            : 'auth',
                            'version'         : '0.1',
                            'storagePassHash' : authUtils.getStoragePassHash()
                        }),
                        db.put(sysdbName, 'settings', {
                            'name'     : 'sysadmin',
                            'username' : sett.sysCredentials.username,
                            'password' : enc,
                        })
                    ])
                });
            });

        },
        function (error) {log.fatal('can not get databases list. ' + error)}
    )
})
.then(function(){
    log.ok('sysdb/settings are reorganized');
    process.exit();
})
.done();
