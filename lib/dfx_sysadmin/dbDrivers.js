/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/**
 * DESCRIPTION of auth_providers database:
 *
 * collection name -> tenant name
 * document: {
 *      provider    : {String} name,
 *      schema      : {String} auth schema name
 *          any schema implemented with authRequest (basic, digest, etc.),
 *      credentials : {Object}
 * }
 */

var SETTINGS = require('../dfx_settings');
var Q         = require('q'),
    credCrypt = require('../auth/utils/credCrypt'),
    MDBW;


var dbDriverDbName = SETTINGS.dbDrivers_database_name,
    sharedCatalogName = SETTINGS.sharedCatalogName;
var DB_TENANTS_PREFIX = SETTINGS.databases_tenants_name_prefix;

exports.init = function ( o ) {
    MDBW = o.storage;

    delete exports.init;
}

/**
 * creates or replaces db driver,
 *
 * @param {String} tenantName
 * @param {String} dialect
 * @param {String} host,
 * @param {String} port,
 * @param {String} database,
 * @param {String} user,
 * @param {String} password,
 * @returns {Promise * Undefined}
 */
exports.put = function (p) {
    var applicationDbName = getAppDbName(p.applicationName);
        error =
            ( !p.tenant && 'need tenant name'   ) ||
            ( !p.nameDriver && 'need name of Db Driver'   ) ||
            ( !p.host && 'need host'   ) ||
            ( !p.port && 'need port'   ) ||
            ( !p.database && 'need database name'   ) ||
            ( !p.user && 'need user'   ) ||
            ( !p.dialect && 'need db driver name' ) || false;

    if (error) return Q.reject(error);
    if (p.user == null) p.user = "admin";

    return Q.when(
        (p.password && credCrypt.encrypt(p.password) ),
        function (encryptedPass) {
            var filter = getFilter(p);
            return MDBW.get(dbDriverDbName, p.tenant, {nameDriver:p.nameDriver})
                .then(function(driver){
                    return MDBW.exists(dbDriverDbName, p.tenant, {nameDriver:p.nameDriver})
                        .then(function(exists) {
                            if (!exists) {
                                MDBW.rm(DB_TENANTS_PREFIX + p.tenant, 'trash', {
                                    nameDriver : p.nameDriver,
                                    application : applicationDbName,
                                    type : 'db_drivers'
                                });
                            }
                            var status = "added";
                            if (p.pull) {
                                status = "committed";
                            } else if ((driver[0]) && (driver[0].versioning)
                                        && ((driver[0].versioning.status === 'committed')
                                        || (driver[0].versioning.status === 'modified'))) {
                                status = "modified";
                            }
                            return MDBW.update(
                                dbDriverDbName,
                                p.tenant,
                                filter,
                                {
                                    $set: {
                                        nameDriver:        p.nameDriver,
                                        application:       applicationDbName,
                                        dialect:           p.dialect,
                                        host:              p.host,
                                        port:              p.port,
                                        database:          p.database,
                                        user:              p.dbDriverUser,
                                        password:          encryptedPass,
                                        min:               p.min,
                                        max:               p.max,
                                        idleTimeoutMillis: p.idleTimeoutMillis,
                                        versioning :{
                                            "status": status,
                                            "user": p.user,
                                            "last_action": (new Date() / 1000).toFixed()
                                        }
                                    }
                                },
                                {upsert: true}
                            )
                        });
                });
        });
};

/**
 * removes db driver,
 *
 * @param {String} tenantName
 * @param {String} dialect
 * @returns {Promise * Number} quantity of removed (actualy it is always 1)
 */
exports.remove = function (p) {
    var self = this;
    var error =
            ( !p.tenant && 'need tenant name'   ) ||
            ( !p.nameDriver && 'need db driver name' ) || false;

    var filter = getFilter(p);
    var moveToTrash = function(o) {
        return self.get(o)
            .then(function(drivers){
                drivers.type = "db_drivers";
                drivers.versioning = {
                    status : "deleted",
                    user : p.user,
                    last_action : (new Date() / 1000).toFixed()
                    };
                return MDBW.put(DB_TENANTS_PREFIX + o.tenant, 'trash',drivers);
            });
    };
    moveToTrash(p);

    return error
        ? Q.reject(new Error(error))
        : MDBW.rm(dbDriverDbName, p.tenant, filter)
};

/**
 * returns auth-provider-document for the tenant,
 *
 * @param {String} tenantName
 * @param {String} dialect
 * @returns {Promise * Object | Undefined}
 */
exports.get = function (p) {
    var error =
            ( !p.tenant && 'need tenant name'   ) ||
            ( !p.nameDriver && 'need db driver name' ) || false;

    var filter = getFilter(p);

    return error
        ? Q.reject(new Error(error))
        : MDBW.get(dbDriverDbName, p.tenant, filter)
        .then(function (data) {
            if (!data.length) return;

            return Q.when(
                ( data[0].password && credCrypt.decrypt(data[0].password) ),
                function (decrypted) {
                    data[0].password = decrypted;

                    return data && data[0] || undefined;
                }
            )
        })
};

/**
 * returns all of database providers for the tenant
 *
 * @param {String} p tenantName
 * @returns {Promise | Array | Undefined}
 */
exports.list = function (p) {
    var error = (!p.tenant && 'need tenant name') || false;

    var filter = getFilterForList(p);

    return error
        ? Q.reject(new Error(error))
        : MDBW.get(dbDriverDbName, p.tenant, filter).then(function (docs) {
        return !docs ? undefined : docs.map(function (e) {
            return {
                nameDriver: e.nameDriver,
                dialect:   e.dialect,
                application: e.application
            }
        });
    })
};

/**
 * returns list of db drivers for the tenant and application
 *
 * @param {String} p tenant
 * +* @param {String} p application
 * @returns {Promise | Array | Undefined}
 */
exports.fullList = function (p) {
    var error = (!p.tenant && 'need tenant name') || false;

    var filter = getFilterForList(p);

    return error
        ? Q.reject(new Error(error))
        : MDBW.get(dbDriverDbName, p.tenant, filter).then(function (docs) {
        return docs;
    })
};

var getFilter = function(p) {
    var applicationDbName = getAppDbName(p.applicationName);
    return { nameDriver: p.nameDriver, application: applicationDbName };
};
var getFilterForList = function(p) {
    var applicationDbName = getAppDbName(p.applicationName);
    return { application: applicationDbName };
};
var getAppDbName = function (applicationName) {
    return ((!applicationName) || applicationName == sharedCatalogName) ? '' : applicationName;
};