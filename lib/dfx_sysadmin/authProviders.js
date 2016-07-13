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

var SETTINGS = require('../dfx_settings'),
Q            = require('q'),
credCrypt    = require('../auth/utils/credCrypt'),
log        = new (require('./../utils/log')).Instance({label: "Auth_Providers"}),
MDBW;


var authDbName = SETTINGS.authProviders_database_name,
    sharedCatalogName = SETTINGS.sharedCatalogName;
var DB_TENANTS_PREFIX = SETTINGS.databases_tenants_name_prefix;

exports.init = function ( o ) {
    MDBW = o.storage;

    delete exports.init;
}

/**
 * creates or replaces auth provider,
 *
 * @param {String} tenantName
 * @param {String} providerName
 * @param {String} schema any schema implemented with authRequest (basic, digest, etc.),
 * @param {Object} credentials
 * @returns {Promise * Undefined}
 */
exports.put = function (p) {
    var applicationDbName = getAppDbName(p.applicationName),
        error =
            ( !p.tenant && 'need tenant name'   ) ||
            ( !p.schema && 'need schema name'   ) ||
            ( !p.credentials && 'need credentials' ) ||
            ( !p.provider && 'need provider name' ) || false;

    if (error) return Q.reject(error);

    if (p.user == null) p.user = "admin";

    log.debug('PUT PROVIER : ', p);

    return Q.when(credCrypt.encrypt(JSON.stringify(p.credentials)), function (encrypted) {
        p.credentials = encrypted;
        var filter = getFilter(p);
        return MDBW.get(authDbName, p.tenant, {provider : p.provider, application : applicationDbName})
            .then(function(providers){
                var status = "added";
                if ((providers[0]) && (providers[0].versioning)
                        && ((providers[0].versioning.status === 'committed')
                        || (providers[0].versioning.status === 'modified'))) {
                    status = "modified";
                }
                return MDBW.update(authDbName, p.tenant, filter, {
                    $set: {
                        schema:      p.schema,
                        credentials: p.credentials,
                        dataSource: p.dataSource || '',
                        route: p.route || '',
                        versioning: {
                            "status": (p.pull) ? 'committed' : status,
                            "user": p.user,
                            "last_action": (new Date() / 1000).toFixed()
                        }
                    }
                })
                    .then(function (updated) {
                        return updated || MDBW.put(authDbName, p.tenant, {
                                provider:    p.provider,
                                application: applicationDbName,
                                dataSource: p.dataSource || '',
                                route: p.route || '',
                                schema:      p.schema,
                                credentials: p.credentials,
                                versioning :{
                                    "status": (p.pull) ? 'committed' : 'added',
                                    "user": p.user,
                                    "last_action": (new Date() / 1000).toFixed()
                                }
                            })
                                .then(function(){
                                    return MDBW.rm(DB_TENANTS_PREFIX + p.tenant, 'trash', {
                                        provider : p.provider,
                                        application : applicationDbName,
                                        type : 'auth_providers'
                                    });
                                })
                    })
            });
    });
};

/**
 * removes auth provider,
 *
 * @param {String} tenantName
 * @param {String} providerName
 * @returns {Promise * Number} quantity of removed (actualy it is always 1)
 */
exports.remove = function (p) {
    var self = this;
    var moveToTrash = function(o) {
        return self.get(o)
            .then(function(providers){
                providers.type = "auth_providers";
                providers.versioning = {
                    "status": 'deleted',
                    "user": p.user,
                    "last_action": (new Date() / 1000).toFixed()
                }

                return MDBW.put(DB_TENANTS_PREFIX + o.tenant, 'trash',providers);
            });
    };
    moveToTrash(p);

    var error =
            ( !p.tenant && 'need tenant name'   ) ||
            ( !p.provider && 'need provider name' ) || false;
    var filter = getFilter(p);

    if (error) {
        return Q.reject(new Error(error));
    } else {
        return MDBW.rm(authDbName, p.tenant, filter)
            .then(function(){
                return MDBW.rm(DB_TENANTS_PREFIX + p.tenant, 'oAuth2_access_tokens', {provider : p.provider, application : p.applicationName});
            })
    }
};

/**
 * returns auth-provider-document for the tenant,
 *
 * @param {String} tenantName
 * @param {String} providerName
 * @returns {Promise * Object | Undefined}
 */
exports.get = function (p) {
    var error =
            ( !p.tenant && 'need tenant name'   ) ||
            ( !p.provider && 'need provider name' ) || false;
    var filter = getFilter(p);

    var applicationDbName = getAppDbName(p.applicationName);
    if (applicationDbName) {
        filter.$or = [{application: applicationDbName}, {application: ''}];
        delete filter.application;
    }

    return error
        ? Q.reject(new Error(error))
        : MDBW.get(authDbName, p.tenant, filter)
        .then(function (creds) {
            if (!creds.length) return;
            if ( creds[0].schema === 'none' ) return creds[0];

            return Q.when(credCrypt.decrypt(creds[0].credentials), function (decrypted) {
                creds[0].credentials = JSON.parse(decrypted);
                return creds[0];
            });
        })
};

/**
 * returns list of auth providers for the tenant
 *
 * @param {String} p tenantName
 * @returns {Promise | Array | Undefined}
 */
exports.list = function (p) {
    var error = (!p.tenant && 'need tenant name') || false;

    var filter = getFilterForList(p);

    return error
        ? Q.reject(new Error(error))
        : MDBW.get(authDbName, p.tenant, filter).then(function (docs) {
        return !docs ? undefined : docs.map(function (e) {
            return e.provider
        });
    })
};

/**
 * returns list of auth providers for the tenant and application
 *
 * @param {String} p tenant
 * +* @param {String} p application
 * @returns {Promise | Array | Undefined}
 */
exports.fullList = function (p) {
    var error = (!p.tenant && 'need tenant name') || false;

    var filter = getFilterForList(p),
        tasks = [];

    return error
        ? Q.reject(new Error(error))
        : MDBW.get(authDbName, p.tenant, filter).then(function (docs) {

                if ( !p.getCreds ) return docs;

                docs.forEach(function(doc){
                    tasks.push( Q.when(credCrypt.decrypt(doc.credentials), function (decrypted) {
                        doc.credentials = JSON.parse(decrypted);
                    }));
                });
                return Q.all(tasks).then(function(){ return docs; });
            })
};

/**
 * returns all of auth providers for the tenant
 *
 * @param {String} p tenantName
 * @returns {Promise | Array | Undefined}
 */
exports.items = function (p) {
    var error = (!p.tenant && 'need tenant name') || false;

    var filter = getFilterForList(p);

    return error
        ? Q.reject(new Error(error))
        : MDBW.get(authDbName, p.tenant, filter).then(function (docs) {
        return !docs ? undefined : docs.map(function (e) {
            return {
                provider: e.provider,
                schema:   e.schema,
                application: e.application
            }
        });
    })
};

var getFilter = function(p) {
    var applicationDbName = getAppDbName(p.applicationName);
    return { provider: p.provider, application: applicationDbName };
};
var getFilterForList = function(p) {
    var applicationDbName = getAppDbName(p.applicationName);
    return { application: applicationDbName };
};
var getAppDbName = function (applicationName) {
    return ((!applicationName) || applicationName == sharedCatalogName) ? '' : applicationName;
};
