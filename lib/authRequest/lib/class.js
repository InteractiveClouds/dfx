/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/**
 * implements classes
 * creating, inheriting, adding properties, etc.
 *
 * @param {Object} [parent class]
 * @returns {Object} new class
 */
exports.create = function(parent){
    var klass = function(){
        this.init.apply(this, arguments);
    };

    // Change klass' prototype
    if (parent) {
        var subclass = function() {};
        subclass.prototype = parent.prototype;
        klass.prototype = new subclass;
    };

    klass.prototype.init = function(){};

    // Shortcuts
    klass.fn = klass.prototype;
    klass.fn.parent = klass;
    //klass._super = klass.__proto__;

    // Adding class properties
    klass.extend = function(obj){
        var extended = obj.extended;
        for(var i in obj){
            klass[i] = obj[i];
        }
        if (extended) extended(klass)
    };

    // Adding instance properties
    klass.include = function(obj){
        var included = obj.included;
        for(var i in obj){
            klass.fn[i] = obj[i];
        }
        if (included) included(klass)
    };

    // Adding a proxy function
    klass.proxy = function(func){
        var self = this;
        return(function(){
            return func.apply(self, arguments);
        });
    }

    // Add the function on instances too
    klass.fn.proxy = klass.proxy;

    return klass;
};
