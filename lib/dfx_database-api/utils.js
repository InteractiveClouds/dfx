/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var DREAMFACE_PREFIX = require('../dfx_settings').databases_tenants_name_prefix;


/**
 * filters array af all databases for the tenant
 * and clears databases names from prefix and tenant name
 *
 * @param {Array} dbs
 * @param {String} tenant
 * @returns {Array}
 */
exports.filterWithTenant = function ( dbs, tenant ) {
    var clear = [];
    dbs.map(function(e){
        var dbName = clearOfTenant(e, tenant);
        if ( dbName ) clear.push(dbName);
    });
    return clear;
}


/**
 * wraps string ( database name ) with tenant name and dreamface prefix
 *
 * EXAMPLE:
 * 'databaseName' ==> 'dreamface_someTenant_databaseName'
 *
 * @param {String} str string to wrap
 * @param {String} tenant
 * @returns {String}
 */
exports.wrapWithTenant = function ( str, tenant ) {
    return str
        ? DREAMFACE_PREFIX + tenant + '_' + str
        : '';
}


/**
 * @param {String} json
 * @returns {Object}
 */
exports.parseQuery = function (query) {
        var answer = {
            data  : '',
            error : ''
        };
        if ( ! query ) return answer;
        try {
            answer.data = JSON.parse(query);
        } catch ( error ) {
            answer.error = error;
        }
        return answer;
}


/**
 * answer to client
 *
 * @param {Object} res
 * @param {String|Object} data
 * @param {String|Number} [status] http-status-code
 *      if status is not set:
 *      it will be 400 if `data` is an object and there is an `error` field
 *      or 200 otherwise
 */
exports.doAnswer = function ( res, data, status ) {
    var answer = typeof data === 'object'
        ? JSON.stringify(data, null, 0)
        : data;
    res.status( status || ( data.error ? 400 : 200 ) );
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Length', answer.length);
    res.end(answer);
}


/**
 * clears string ( database name ) from tenant name and dreamface prefix
 *
 * EXAMPLE:
 * 'dreamface_someTenant_databaseName' ==> 'databaseName'
 *
 * @param {String} str string to clear
 * @param {String} tenant
 * @returns {String}
 */
function clearOfTenant ( str, tenant ) {
    var regex = new RegExp('^' + DREAMFACE_PREFIX + tenant + '_(.+)$');
    return ( regex.exec(str) || [] )[1] || '';
}
