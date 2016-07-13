/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

// Yet Another Event Manager (Pub/Sub)
//
// all listeners are executed in context of a instance of the EventManager

exports.EventManager = EventManager;

/**
 * @constructor
 *
 * @param {Object} [o] options
 *      @param {Boolean} [o.debug] to do 'console.error' for errors of 'listeners' or not.
 */
function EventManager ( o ) {
    this._events = {};
    this._debug = !!( o && o.debug );
}


EventManager.fn = EventManager.prototype;


/**
 * @param {String} eventName
 * @returns {Array} of listeners for the event
 */
EventManager.fn._getListeners = function (eventName) {
    return this._events[eventName] || ( this._events[eventName] = [] );
};


/**
 * @param {String} eventName
 * @param {Function} listener
 */
EventManager.fn.subscribe = function (eventName, listener){
    this._getListeners(eventName).push(listener);
};


/**
 * @param {String} eventName
 * @param {*} [data] whatever you want to transfer to listeners (just single param)
 */
EventManager.fn.publish = function (eventName, data) {
    var _this = this,
        listeners = this._getListeners(eventName);
    
    for (var i = 0, l = listeners.length; i < l; ) try { // TODO remove the try
        listeners[i++].call(_this, {name:eventName, target:_this}, data);
    } catch (error) {
        if ( _this._debug && console && console.error ) {
            console.error(
                '\nERROR [EventManager]:\nEVENT NAME: "%s"\nSTACK: %s',
                eventName,
                error.stack
            );
        }
    };

    if ( this._onClear ) setTimeout(function(){_this._onClear()}, 0);
};

EventManager.fn.onClear = function ( func ) {
    this._onClear = typeof func === 'function' ? func : null;
};

/**
 * @param {String} eventName
 * @param {Function} listener
 */
EventManager.fn.unsubscribe = function (eventName, listener) {
    var listeners = this._getListeners(eventName),
        index = listeners.indexOf(listener);

    if ( ~index ) listeners.splice(index, 1);
};
