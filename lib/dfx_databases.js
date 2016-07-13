/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var jade = require('jade'),
    Q = require('q'),
    QFS = require('q-io/fs'),
    path = require('path'),
    SETTINGS = require('./dfx_settings'),
    mdbw = require('./mdbw')(SETTINGS.mdbw_options);

var $DFX_DB_JEDI_MODE = process.env.NODE_ENV === 'development'
        && !!process.env.DFX_DB_JEDI_MODE;

var DREAMFACE_PREFIX = SETTINGS.databases_tenants_name_prefix,
    PATH_TO_TEMPLATES = SETTINGS.path_to_databases_templates,
    actions = {};

exports.action = function ( req, res ) {
    var action = req.params.action;

    if ( !actions[action] ) return doAnswer( res, '', {error: 'unknown action: ' + action});

        var query = parseQuery(req.params.query);
        if ( query.error ) return doAnswer(res, '', { error: query.error.toString() });
        var body = req.body || {};

        actions[action]({
            clName   : body.collection || req.params.clName || '',
            tenant   : req.session.tenant.id,
            query    : body.query || query.data || '',
            document : body.document || '',
            fields   : body.fields || '',
            req      : req,
            dbName   : wrapWithTenant(req.params.dbName || body.database, req.session.tenant.id) || '',

            doc      : req.body ? req.body.doc : null,
            docId    : req.params.id || 0,
        })
        .then(
            function(answer){ doAnswer(res, '', answer) },
            function(error){ doAnswer(res, '', { error: error.toString() }) }
        )
        .done();
}


/**
 * @param {Object} p (see 'exports.action')
 * @returns {Object}
 */
actions.showCollection = function (p) {
    return mdbw.get(p.dbName, p.clName)
    .then(function(docs){

        var formatedDocs = {};
        for ( var i = docs.length; i; ) {
            formatedDocs[docs[--i]['_id']] = docs[i];
        }

        return {
            documents  : formatedDocs,
            database   : clearOfTenant(p.dbName, p.tenant),
            collection : p.clName
        }
    })
}


/**
 * @param {Object} p (see 'exports.action')
 * @returns {Object}
 */
actions.createCollection = function (p) {
    if ( ! isNameValid(p.clName) ) return Q.reject('invalid collection name');
    return mdbw.put(p.dbName, p.clName)
    .then(function(){
        return {
            database   : clearOfTenant(p.dbName, p.tenant),
            collection : p.clName
        }
    })
}


/**
 * @param {Object} p (see 'exports.action')
 * @returns {Object}
 */
actions.removeCollection = function (p) {
    return mdbw.rm(p.dbName, p.clName)
    .then(function(){
        return {
            database   : clearOfTenant(p.dbName, p.tenant),
            collection : p.clName
        }
    })
}


/**
 * @param {Object} p (see 'exports.action')
 * @returns {Object}
 */
// TODO rename to createDatabase
actions.showDatabase = function (p) {
    return mdbw.put(p.dbName)
    .then(function(){
        return { database   : clearOfTenant(p.dbName, p.tenant) };
    })
}


/**
 * @param {Object} p (see 'exports.action')
 * @returns {Object}
 */
actions.removeDatabase = function (p) {
    return mdbw.rm(p.dbName)
    .then(function(){
        return { database   : clearOfTenant(p.dbName, p.tenant) };
    })
}


/**
 * @param {Object} p (see 'exports.action')
 * @returns {Object}
 */
actions.removeDocument = function (p) {
    return mdbw.rm(p.dbName, p.clName, {'_id': p.docId})
    .then(function(){
        return { success: true };
    })
}


/**
 * @param {Object} p (see 'exports.action')
 * @returns {Object}
 */
actions.insertDocument = function (p) {
    var doc = JSON.parse(p.doc);
    return mdbw.put(p.dbName, p.clName, doc)
    .then(function(newId){
        return  { id: doc['_id'] || newId };
    })
}


/**
 * returns tree of databases and collections
 * EXAMPLE:
 * {
 *      databaseName_1: {
 *          'collections': {
 *              collectionName_1: null,
 *              collectionName_2: null
 *          }
 *      },
 *      databaseName_2: {
 *          'collections': {
 *              collectionName_1: null,
 *              collectionName_2: null
 *          }
 *      }
 * }
 *
 * @param {Object} p (see 'exports.action')
 * @returns {Object}
 */
actions.getTree = function (p) {
    return mdbw.get()
    .then(function (dbs) {
        return filterDatabasesListForTheTenant(dbs, p.tenant)
    })
    .then(function(dbs){
        var promises = [],
            tree = {};
        for ( var i = dbs.length; i; ) (function(i){
            promises.push(
                mdbw.get( wrapWithTenant(dbs[i], p.tenant) )
                .then(function(cls){
                    tree[dbs[i]] = {};
                    tree[dbs[i]].collections = makeObjectFromArray(cls);
                })
            )
        })(--i);
        return Q.all(promises).then(function(){
            return { tree : tree };
        })
    })
}




/**
 * @param {String} json
 * @returns {Object}
 */
function parseQuery (query) {
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
 * @param {Array} arr
 * @param {*} fillWith
 * @returns {Object}
 */
function makeObjectFromArray ( arr, fillWith ) {
    var obj = {},
        fillWith = fillWith || null;
    for ( var i = arr.length; i; ) obj[ arr[--i] ] = fillWith;
    return obj;
}


/**
 * @param {String} clName
 * @returns {Boolean}
 */
function isNameValid ( clName ) {
    return /^[a-z0-9_-]+$/i.test(clName);
}


/**
 * answer to client
 *
 * @param {Object} res
 * @param {String} templateName
 * @param {Object} params for jade to fill the template
 */
function doAnswer ( res, templateName, params ) {
    return compileAnswer( templateName, params )
    .then(function(answer){
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Content-Length', answer.length);
        res.end(answer);
    })
}


/**
 * if there is the templateName returns jade-compiled answer
 * if not stringified params
 *
 * @param {String} templateName
 * @param {Object} params for jade to fill the template
 * @returns {String}
 */
function compileAnswer ( templateName, params ) {
    // TODO remove templating ( it is on client side )
    if ( ! templateName ) return Q.resolve(
        typeof params === 'object'
            ? JSON.stringify(params, null, 0)
            : params
    );
    return QFS.read( path.join(__dirname, '..', PATH_TO_TEMPLATES, templateName) )
    .then(function(templateText){
	    return jade.compile(templateText)(params);
    })
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
    if ( $DFX_DB_JEDI_MODE ) return str;
    var regex = new RegExp('^' + DREAMFACE_PREFIX + tenant + '_(.+)$');
    return ( regex.exec(str) || [] )[1] || '';
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
function wrapWithTenant ( str, tenant ) {
    if ( $DFX_DB_JEDI_MODE ) return str;
    return str
        ? DREAMFACE_PREFIX + tenant + '_' + str
        : '';
}


/**
 * @param {Array} databases list
 * @returns {Array} filtered list
 */
function filterDatabasesListForTheTenant ( dbs, tenant ) {
    if ( $DFX_DB_JEDI_MODE ) return dbs;
    var clear = [];
    dbs.map(function(e){
        var dbName = clearOfTenant(e, tenant);
        if ( dbName ) clear.push(dbName);
    });
    return clear;
}
