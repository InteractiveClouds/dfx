/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var Q     = require('q'),
    utils = require('../utils'),
    log = new (require('../../utils/log')).Instance({label:'AUTH_SESSIONMANAGER'}),

    time  = utils.time;

// TODO stringify/parse session data
//
// TODO validate cookie value !!!

function Constructor ( o ) {

    this.storage    = o.storage;
    this.expires    = o.expires;
    this.path       = o.path;
    this.cookieName = o.cookieName;
    this.clearEach  = o.clearEach || 1000 * 60 * 60; // an hour
    this._quantity  = 0;
    this.isInited   = init.call(this);
}

Constructor.fn = Constructor.prototype;

Constructor.fn.get = function ( req, res ) {
    var that = this,
        id   = req.cookies[this.cookieName];

    if ( !id ) return Q.reject('Has no appropriate cookie.');

    return this.storage.get(id)
    .then(function(session){

        if ( time.now > session.expires ) {
            that.rm(id);
            res.clearCookie(that.cookieName, {
                path : that.path
            });
            return Q.reject('Expired session.');
        }

        req.session = session.data;

        return Q.resolve();
    });
};

Constructor.fn.rm = function ( req, res ) {
    var id = req.cookies[this.cookieName],
        that = this;

    res.clearCookie(this.cookieName, {
        path : this.path
    });

    if ( id ) {
        return this.storage.rm(id)
            .then(function(){
                that._quantity--;
                log.info(
                    'Session ' + id + ' is removed. ' +
                    'From "' + that.cookieName + '". ' +
                    that._quantity + ' is active.'
                );
            })
    } else {
        return Q.resolve();
    }
};

Constructor.fn.update = function ( req, res, data ) {

    if ( data ) log.error('"data" argument is depricated');

    var id = req.cookies[this.cookieName],
        session = {
        expires : time.now + this.expires
    };

    session.data = req.session;

    res.cookie(this.cookieName, id, {
        path    : this.path,
        expires : new Date(session.expires)
    });

    return this.storage.update(id, session);
};

Constructor.fn.create = function ( req, res, data ) {

    data = data || {};

    var that = this,
        session = {
            created : time.now,
            expires : time.now + this.expires,
            data    : data
        };
    return this.storage.put(session)
    .then(function(id){
        res.cookie(that.cookieName, id, {
            path    : that.path,
            expires : new Date(session.expires)
        });

        req.session = data;

        that._quantity++;

        log.info(
            'Created session ' + id +
            ' for "' + that.cookieName + '".' +
            ' Total active: ' + that._quantity
        );
    });
};

function init () {
    var that = this;

    return clearExpired(that.storage)
    .then(that.storage.count.bind(that.storage))
    .then(function ( c ) {
        that._quantity = c;
        setInterval(function(){
            clearExpired(that.storage)
            .then(
                function(c){
                    if ( !c ) return;

                    log.info('Removed ' + c + ' expired sessions.');
                    that._quantity -= c;
                },
                function(error){
                    log.error('Error happens when clearing expired sessions: ', error);
                }
            )
        }, that.clearEach);

        log.info(
            'session manager for cookies "' +
            that.cookieName +
            '" is initialised.');
    })
    .fail(function(error){
        log.error('sessionManager init error: ', error);
    });
}


function clearExpired ( storage ) {
     return storage.rm({expires : {$lt : time.now}});
}


exports.Constructor = Constructor;
