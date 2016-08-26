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

Obj.set = function( name, key, value ) {
    return Obj.get( name ).then(function( data ){
            if (!data) {
                var obj = {};
                if (key) {
                    obj[key] = value;
                    data = obj;
                } else {
                    data = value;
                }
            } else {
                if (key) {
                    var keys = key.split('.');
                    var str = "data";
                    keys.forEach(function(key){
                        str += "['" + key + "']";
                    });
                    str += "=" + "'" + value + "'";
                    try{
                        eval(str);
                    }catch(e){
                        return Q.reject("Bad key!");
                    }
                } else {
                    data = value;
                }
            }

            data = JSON.stringify( data );
            return cache.set(name, data);
    });
}

Obj.delete = function( name, key ) {
    return Obj.get( name ).then(function( data ){
        try {
            data = JSON.parse( data );

            if (data) {
                delete data[key];
            }

            data = JSON.stringify( data );
            return cache.set(name, data);
        }
        catch(e){
            return Q.reject("Not JSON!");
        }
    })
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


