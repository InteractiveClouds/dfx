/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var Q = require('q'),
    SETTINGS = require('../dfx_settings');

Q.longStackSupport = true;

var log = new (require('../utils/log')).Instance({label:'AUTH_CORE'}),
    _users;

if ( SETTINGS.studio ) _users = require('../dfx_sysadmin').tenant.user;

function Core ( o ) {
    this.flow = [];
    this.touchUser = o && o.users
        ? o.users.touch
        : _users
            ? _users.touch
            : function(){ throw(Error('something wrong with \'touchUser\'')) }

};

Core.fn = Core.prototype;

Core.fn.use = function ( func ) {
    this.flow.push(func);
};

Core.fn.endpoint = function ( req, res, next ) {

    var i = 0,
        l = this.flow.length,
        pocket = {}
        that = this;

    // TODO wrap params to object
    this.flow[i].call(this, req, success, fail, pocket, res);

    function success () {

        if ( ++i < l ) {
            return that.flow[i]
                    .call(that, req, success, fail, pocket, res);
        }

        that.onSuccess.call(that, req, res, next, pocket);
    }

    function fail ( reason, httpStatus, raw ) {

        log.warn(
            'Unauthorized request from ' + req.ip + ' for '
            + req.path + '. ', ( reason || '' )
        );

        var _reason = !raw
            ? typeof reason === 'string' ? reason : ''
            : reason;

        return that.onFail.call(that, req, res, _reason, httpStatus, pocket);
    }
};

Core.fn.afterLogin = function (req, success, fail, pocket, res) {

    if ( !this.afterLoginBin.length ) return success();

    var i = 0,
        l = this.afterLoginBin.length,
        that = this;

    this.afterLoginBin[i].call(null, req, done);

    function done ( error ) {

        if ( error ) log.warn(error, error.stack);

        if ( ++i < l ) that.afterLoginBin[i].call(null, req, done);
        else success();
    }
};


Core.fn.onFail = function () {};

Core.fn.onSuccess = function () {};


exports.Constructor = Core;
