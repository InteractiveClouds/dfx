var Q    = require('q'),
    core = require('../../core'),
    Studio   = require('./studio').Constructor,
    pmx = require('pmx'),
    log_pmx = require('../../../dfx_settings').log_pmx;

/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/*
 * if tenantid, userid, appid are valid — login is successfull
 *      token with short expires time is created,
 *      encrypted and is send to app
 * app should decrypt it with user password,
 * to get decrypted token and to send an refresh request immediately
 * then normal exipred time is set for the token,
 * otherwise the token will be rotten
 */



function Constr ( o ) {

    o = o || {};

    core.Constructor.call(this, {users : o.users});

    this.log = o.log;
    this.tokenManager  = o.tokenManager;
    this.afterLoginBin = o.runAfterLogin;
    this.usersStorage  = o.users;
    this.tenants       = o.tenants;
    this.apps          = o.apps;

    this.use(this.parse);
    this.use(this.findUser);
    this.use(this.check);
    this.use(this.createSession);
    this.use(this.afterLogin);
    this.use(this.createToken);
}

Constr.fn = Constr.prototype = new core.Constructor;

Constr.fn.findUser = Studio.fn.findUser;

Constr.fn.parse = function (req, success, fail, pocket, res) {

    pocket.tenantid  = req.body.tenantid;
    pocket.userid    = req.body.userid;
    pocket.appid     = req.body.appid;
    pocket.ispreview = req.body.ispreview;

    success();
};

Constr.fn.check = function (req, success, fail, pocket, res) {

    if ( pocket.user.kind !== 'application' ) return fail(
        'the user "' + pocket.tenantid + '::' + pocket.userid +
        '" can not access to an applications, cause of wrong kind'
    );


    if ( !pocket.tenantid || !pocket.userid || !pocket.appid ) return fail(Error(
        'some parameters are missed:' +
        '\ntenant : ' + pocket.tenantid +
        '\nuser   : ' + pocket.userid +
        '\napp    : ' + pocket.appid
    ));

    if ( pocket.ispreview == '_preview' ) return success();

    this.apps.isActive({
        tenantId : pocket.tenantid,
        app      : pocket.appid
    })
    .then(function ( active ) {
        if ( !active ) return Q.reject(Error(
            'application "' + pocket.appid + '" is not active'
        ));

        success();
    })
    .fail(fail);
};

Constr.fn.createSession = function (req, success, fail, pocket, res) {

    if (log_pmx) {
        pmx.emit('user:login', {
            tenant: pocket.tenantid,
            user : pocket.userid,
            application : pocket.appid
        });
    }

    req.session = {
        tenant : { id: pocket.tenantid },
        user   : { id: pocket.userid },
        app    : { id: pocket.appid }
    };

    success();
};

Constr.fn.createToken = function (req, success, fail, pocket, res) {

    this.tokenManager.create(pocket.tenantid, pocket.userid, pocket.appid, req.session)
    .then(
        function (token) {
            pocket.token = token
            success();
        },
        fail
    );
};

Constr.fn.logout = function (req, res, next) {
    if (log_pmx) {
        pmx.emit('user:logout', {
            user : req.user.tokenid
        });
    }

    var tokenid = req.user.tokenid
        that = this;
    
    this.tokenManager.rm(tokenid)
    .then( // crutch
        function ()      { that.onSuccess(req, res, next, {}); },
        function (error) { that.onFail(req, res, error);       }
    );
}

Constr.fn.refreshtoken = function (req, res, next) {
    this.tokenManager.update(req.user.tokenid)
    .then(function(s){
        res.end(s);
    })
}

Constr.fn.onSuccess = function (req, res, next, pocket) {
    res.json({
        result : 'success',
        data   : pocket.token || {}
    });
}

Constr.fn.onFail = function (req, res, reason, httpStatus, pocket) {
    if (log_pmx) {
        pmx.emit('user:unauthorized', {
            user : req.user.tokenid
        });
    }

    res.json({
        result : 'failed',
        reason : reason || 'unauthorized'
    });
}



exports.Constructor = Constr;
