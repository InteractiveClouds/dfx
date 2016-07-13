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
    log = new (require('../../utils/log')).Instance({label:'AUTH_TOKENMANAGER'}),

    time  = utils.time;


function Constructor ( o ) {

    var that = this;

    this.storage = o.storage;
    this.expires = o.expires;
    this.firstExpires = o.firstExpires;
    this.maxCalls = o.maxCalls;
    this.users   = o.users;
    this.tenants = o.tenants;
    //this.apps = o.apps;
    this.crypt = o.crypt;
    this.NONCE_LENGTH = o.nonceLength || 32;
    this.SECRET_LENGTH = o.secretLength || 32;
    this.clearEach  = o.clearEach || 1000 * 60 * 60; // an hour
    this._quantity  = 0;
    this.isInited   =
        clearExpired(that.storage)
        .then(that.storage.count.bind(that.storage))
        .then(function ( c ) {
            that._quantity = c;
            setInterval(function(){
                clearExpired(that.storage)
                .then(
                    function(c){
                        if ( !c ) return;

                        log.info('Removed ' + c + ' expired tokens.');
                        that._quantity -= c;
                    },
                    function(error){
                        log.error('Error happens when clearing expired tokens: ', error);
                    }
                )
            }, that.clearEach);

            log.info(
                'Token manager is initialised.');
        })
        .fail(function(error){
            log.error('Token manager initializing error: ', error.stack);
        });
}

Constructor.fn = Constructor.prototype;

Constructor.fn.get = function ( id ) {
    // TODO check expires
    return this.storage.get(id);
};

Constructor.fn.rm = function ( id ) {
    var that = this;

    return this.storage.rm(id)
        .then(function(){
            that._quantity--;
            log.info('App token "' + id + '" has been removed');
        })
};

Constructor.fn.update = function ( id ) {

    var that = this;

    return Q.all([
            utils.random(this.NONCE_LENGTH), 
            that.storage.get(id)
        ])
        .spread(function ( nonce, token ) {

            var toUpdate = {
                    expires   : time.now + that.expires,
                    callsLeft : that.maxCalls,
                    nonce     : nonce
                };

            return that.storage.update(id, toUpdate)
                .then(function(){

                    // send time that is left
                    toUpdate.expires = toUpdate.expires - time.now;

                    return that.crypt.encrypt(
                        JSON.stringify(toUpdate),
                        token.secret
                    );
                });
        });
};


Constructor.fn.tick = function ( id, session ) {

    return this.storage.update(id, {
        $inc : {
            totalCount :  1,
            callsLeft  : -1,
        },
        $set : { session : session }
    }, true);
};

Constructor.fn.composeToken = function ( o ) {
    var that = this;

    return Q.all([
        utils.random(that.NONCE_LENGTH),
        utils.random(that.SECRET_LENGTH)
    ])
    .spread(function(nonce, secret){

        var timeNow = time.now;

        return { // token
            expires     : timeNow + that.firstExpires,
            created     : timeNow,
            nonce       : nonce,
            secret      : secret,
            tenantid    : o.tenant.id,
            userid      : o.user.login,
            user        : o.user,
            appid       : o.appid,
            totalCount  : 0,
            callsLeft   : that.maxCalls,
            refreshable : true,
            session     : o.session
        };
    });
};

Constructor.fn.formatAnswer = function ( token, user, encrypt ) {

    var that = this,
        rawToken = {
            id        : token.id,
            secret    : token.secret,
            callsLeft : token.callsLeft,
            expires   : token.expires,
            nonce     : token.nonce
        };

    return encrypt
        ? {
            token : that.crypt.encrypt(JSON.stringify(rawToken), user.password),
            type : 'default'
            }
        : {
            token : rawToken,
            type : 'plain'
            };
};

Constructor.fn.create = function (tenantid, userid, appid, session) {

    if ( !tenantid || !userid || !appid ) return Q.reject('tenantid, appid, userid is required.');

    var that = this;

    return Q.all([
        this.tenants.get(tenantid),
        this.users.get(tenantid, userid, null, appid)
    ])
    .spread(function(tenant, user){

        return Q.when(that.composeToken({
            appid   : appid,
            tenant  : tenant,
            user    : user,
            session : session
        }), function (token) {

            return that.storage.put(token)
            .then(function (id) {

                token.id = id;
                that._quantity++;

                //log.info(
                //    'Created token "' + id + '" for user ' +
                //    tenantid + ':' + userid + ' of application ' + appid, {
                //        id     : id,
                //        secret : token.secret,
                //        nonce  : token.nonce
                //    }
                //);

                return Q(that.formatAnswer(token, user, (appid !== '_preview') ));
            });
        });
    });
};

function clearExpired ( storage ) {
     return storage.rm({ $or : [
         {expires : {$lt : time.now}},
         {callsLeft : {$lt : 1}}
     ]});
}


exports.Constructor = Constructor;
