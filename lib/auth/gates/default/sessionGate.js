/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var Q    = require('q'),
    core = require('../gate.core');

var log = new (require('../../../utils/log')).Instance({label:'GATES_SESSIONS'});

function Constr ( o ) {
    o = o || {};
    core.Constructor.call(this, { users : o.users });

    this.sessionManager = o.sessionManager;
    this.failedAnswer   = o.failedAnswer || function () {};

    this.use(checkAndSet);
}

Constr.prototype = new core.Constructor;

Constr.fn = Constr.prototype;

Constr.fn.onEnd = function (req, res, data, pocket) {

    this.sessionManager.update(req, res);
    return data;
}

Constr.fn.onFail = function (req, res) {
    this.sessionManager.rm(req, res);
    this.failedAnswer(req, res);
};

function checkAndSet (req, success, fail, pocket, res) {

    var that = this;

    this.sessionManager.get(req, res)
    .fin(function(){

        if ( req.session && req.session.tenant && req.session.tenant.id ) {
            if ( req.session.origin ) {
                res.setHeader('Access-Control-Allow-Origin', req.session.origin);
                res.setHeader('Access-Control-Allow-Credentials', 'true');
            } else {
                req.user = that.touchUser(req.session.tenant.id, req.session.user.id);
            }
        }
    })
    .then(success, fail)
    .fail(log.error.bind(log));
};

exports.Constructor = Constr;

