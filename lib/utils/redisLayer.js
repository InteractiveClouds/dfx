var SETTINGS = require('../dfx_settings');
var cache;
var wasInit = false;
var Q = require('q');

var init = function( o ) {
    cache = o.cache;
    wasInit = true;
}

var isInit = function () {
    return wasInit;
}

var Arr = {};

// Replace Array functionality

Arr.add = function( key, value ) {
    return cache.rpush(key, value);
}

Arr.delete = function( key, value ) {
    return cache.lrem(key, 1, value);
}

Arr.get = function( key ) {
    return cache.lrange(key, 0, -1);
}

var Obj = {};

// Replace Object functionality

Obj.set = function( name, data ) {
    return cache.set(name, JSON.stringify( data ));
}

Obj.get = function( key ) {
    return cache.get(key).then(function(data){
        return JSON.parse(data);
    })
}

// Replace Var functionality

var Var = {};

Var.set = function( name, value ) {
    return cache.set(name, value);
}

Var.delete = function( name, value ) {
    return cache.del( name );
}

Var.get = function( name) {
    return cache.get( name );
}

module.exports = {
    init : init,
    isInit : isInit,
    Arr : Arr,
    Obj : Obj,
    Var : Var
}


