var Q     = require('q'),
    utils = require('../utils'),
    core  = require('./tokenManager.default');

var time = utils.time;

function Constr ( o ) {
    core.Constructor.call(this, o);
}

Constr.fn = Constr.prototype = Object.create(core.Constructor.prototype);

Constr.fn.composeToken = function ( o ) {

    var timeNow = time.now;

    return { // token
        expires     : timeNow + this.firstExpires,
        created     : timeNow,
        tenantid    : o.tenant.id,
        userid      : o.user.login,
        user        : o.user,
        appid       : o.appid,
        totalCount  : 0,
        callsLeft   : this.maxCalls,
        refreshable : true,
        session     : o.session
    };
};

Constr.fn.formatAnswer = function ( token, user ) {

    return {
        token : {
                id        : token.id,
                callsLeft : token.callsLeft,
                expires   : token.expires
            },
        type : 'plain'
    };
};

Constr.fn.update = function ( id ) {

    var that = this;

    return that.storage.get(id)
        .then(function ( token ) {

            var toUpdate = {
                    expires   : time.now + that.expires,
                    callsLeft : that.maxCalls
                };

            return that.storage.update(id, toUpdate)
                .then(function(){

                    // send time that is left
                    toUpdate.expires = toUpdate.expires - time.now;

                    return JSON.stringify(toUpdate);
                });
        });
};

exports.Constructor = Constr;
