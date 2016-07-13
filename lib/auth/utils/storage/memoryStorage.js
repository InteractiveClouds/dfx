/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var Q = require('q'),
    unicue = require('../index').unicue;

var id = 0,
    cache = {};

function Constructor ( o ) {
    this._id = o.id || ++id;
    if ( !cache.hasOwnProperty(this._id) ) cache[this._id] = {};
};

Constructor.fn = Constructor.prototype;

Constructor.fn.get = function ( id ) {
    return id && cache[this._id].hasOwnProperty(id)
        ? Q.resolve(cache[this._id][id])
        : Q.reject()
};


Constructor.fn.put = function ( o ) {
    var that = this;

    return ( o._id ? Q(o._id) : unicue() )
    .then(function(_id){
        o._id = _id;
        cache[that._id][_id] = JSON.parse(JSON.stringify(o));
        return Q.resolve(_id)
    })
};


Constructor.fn.rm = function ( id ) {
    return cache[this._id].hasOwnProperty(id)
        ? Q.resolve( delete cache[this._id][id] )
        : Q.reject()
};


Constructor.fn.update = function ( id, fields ) {
    if ( !id || !cache[this._id].hasOwnProperty(id) || typeof fields !== 'object' ) {
        return Q.reject();
    }

    for ( var key in fields ) {
        var value = fields[key];

        if ( typeof value === 'object' ) value = JSON.parse(JSON.stringify(value));
        cache[this._id][id][key] = value;
    }
    return Q.resolve();
};


exports.Constructor = Constructor;
