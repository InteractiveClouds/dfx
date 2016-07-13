/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var Q      = require('q'),
    util   = require('../index'),
    unicue = util.unicue,
    time   = util.time,
    log = new (require('../../../utils/log')).Instance({label:'MONGOSTORAGE'});


function Constructor ( o ) {
    this.database   = o.database;
    this.collection = o.collection;
    this.db = o.db;
};

Constructor.fn = Constructor.prototype;

Constructor.fn.get = function ( id ) {

    if ( !id ) return Q.reject(log.error('need document id'));

    return this.db.get(this.database, this.collection, {_id : id})
    .then(function ( docs ){
        return docs && docs[0] || Q.reject(log.error('can not get ' + id));
    });
};


Constructor.fn.put = function ( o ) {

    if ( typeof o !== 'object' ) return Q.reject(log.error('object is expected'));

    return this.db.put(this.database, this.collection, o);
};


/**
 * @param {String|Number|Object} id id or mongodb query
 * @returns {Promise}
 */
Constructor.fn.rm = function ( id ) {

    var type = typeof id;

    if ( type !== 'string' && type !== 'number' && type !== 'object' ) {
        return Q.reject(Error(log.error('Wrong type of argument: ' + type)));
    }

    return type === 'object'
        ? this.db.rm(this.database, this.collection, id)
        : this.db.rm(this.database, this.collection, {_id : id});
};

Constructor.fn.rmByQuery = function ( query ) {

    return this.db.rm(this.database, this.collection, query);
};


Constructor.fn.update = function ( id, fields, isQuery ) {

    if ( !id ) return Q.reject('need document id');

    if ( typeof fields !== 'object' ) return Q.reject(log.error('object is expected'));

    return this.db.update(
        this.database,
        this.collection,
        {_id : id},
        ( isQuery ? fields : {$set:fields}),
        {multi: false}
    );
};


Constructor.fn.count = function () {
    return this.db.count(this.database, this.collection);
};


exports.Constructor = Constructor;
