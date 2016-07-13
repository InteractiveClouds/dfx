/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var Q = require('q'),
    packageVersion = require('../../package.json').version,
    SETTINGS = require('../dfx_settings'),
    uuid = require('node-uuid'),
    MDBW = require('../mdbw')(SETTINGS.mdbw_options);


var sysdbName     = SETTINGS.system_database_name,
    sysdb_version = "1.1";


/**
 * @returns {Promise}
 */
exports.get = function() {
    return Q.all([
        MDBW.get(sysdbName, 'settings', {name:'sysdb'}),
        MDBW.get(sysdbName, 'tenants')
    ]).spread(function(settings, tenants){
        return {
            version : ( settings[0] && settings[0].version ) || false,
            tenants : tenants
        }
    });
};


/**
 * @returns {Promise}
 */
exports.init = function() {
    var auth = require('../auth'),
        authUtils = require('../auth/utils'),
        credCrypt = require('../auth/utils/credCrypt');
        sysAdminDefaultPass = SETTINGS.sysadmin_default_password;

    return MDBW.exists(sysdbName, 'settings', {name:'sysdb'})
    .then(function(exists){
        return exists
            ? console.warn('repository already exists')
            : Q.when(credCrypt.encrypt(sysAdminDefaultPass), function ( sysAdminPassHash ) {
                    return Q.all([
                        MDBW.put(sysdbName, 'tenants'),
                        MDBW.put(sysdbName, 'settings', {
                            'name'           : 'sysdb',
                            'datecreation'   : new Date(),
                            'version'        : sysdb_version,
                            'server-uuid'    : uuid.v1()
                        }),
                        MDBW.put(sysdbName, 'settings', {
                            'name'            : 'auth',
                            'version'         : auth.version,
                            'storagePassHash' : authUtils.getStoragePassHash()
                        }),
                        MDBW.put(sysdbName, 'settings', {
                            'name'     : 'sysadmin',
                            'username' : SETTINGS.sysadmin_username,
                            'password' : sysAdminPassHash,
                        }),
                        MDBW.put(sysdbName, 'settings', {
                            name: 'dfx version',
                            version: packageVersion
                        })
                    ])
                });
    })
};
