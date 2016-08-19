/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var util     = require('../../utils'),
    core     = require('../../core'),
    pmx = require('pmx'),
    log_pmx = require('../../../dfx_settings').log_pmx,


    SUCCESS_REDIRECT_URL = '/studio/landing.html';


function Constr ( o ) {

    o = o || {};

    core.Constructor.call(this, { users : o.users });

    this.log = o.log;
    this.sessionManager = o.sessionManager;
    this.afterLoginBin  = o.runAfterLogin;
    this.openidStudioLogin = o.openidStudioLogin;
    this.usersStorage = o.users;
    this.tenants = o.tenants;
    this.URL = o.URL;


    this.use(this.parse);
    this.use(this.findUser);
    this.use(this.checkCredentials);
    this.use(this.hasRightToStartStudio);
    this.use(this.createSession);
    this.use(this.setLastLoginCookie);
    this.use(this.afterLogin);
    this.use(this.writeSession);
}

Constr.fn = Constr.prototype = Object.create(core.Constructor.prototype);

Constr.fn.parse = function (req, success, fail, pocket, res) {

    var isPOST = req.method === 'POST';

    pocket.userid    = isPOST ? req.body.userid   || '' : req.query.user || '';
    pocket.password  = isPOST ? req.body.password || '' : '';
    pocket.tenantid  = isPOST ? req.body.tenantid : req.query.tenant;
    pocket.successRedirect = req.query.successRedirect || SUCCESS_REDIRECT_URL;

    this.log.dbg('POCKET : ', pocket);

    if ( !pocket.tenantid || !pocket.userid) {
            return fail('Wrong credentials. No tenantid or userid.');
    }
    
    if ( !pocket.password ) {
        if ( this.openidStudioLogin.looksLikeOpenId(pocket.userid) ) {
            // the flow is terminated from here
            // ( no findUser, createSession etc. will be invoked )
            // the openidStudioLogin flow is started instead
            return this.openidStudioLogin.start(
                pocket.userid,
                pocket.tenantid,
                res,
                fail,
                pocket.successRedirect
            );
        } else {
            return fail('Wrong credentials. No password.');
        }
    }

    success();
};

Constr.fn.findUser = function (req, success, fail, pocket, res) {
    var that = this;

    this.tenants.isActive(pocket.tenantid).then(
        function(){
            that.usersStorage.get(pocket.tenantid, pocket.userid, null, pocket.appid).then(
                function (user) {
                    pocket.user = user;
                    req.user = that.touchUser(pocket.tenantid, pocket.userid, pocket.appid);
                    success();
                },
                fail
            );
        },
        function () {
            fail(Error('tenant "' + pocket.tenantid + '" is not active.'));
        }
    );
};

Constr.fn.checkCredentials = function (req, success, fail, pocket, res) {

    var that = this;

    return req.user.getProperty('type').then(function(type){

        if ( !type ) return that.usersStorage.checkCredentials(
            pocket.tenantid,
            pocket.userid,
            pocket.password
        )
        .then(success, fail);

        fail('Unknown user\'s type "' + type + '"');
    })
};

Constr.fn.hasRightToStartStudio = function (req, success, fail, pocket, res) {

    req.user.hasRight('accessRealm::studio').then(
        success,
        fail.bind(null, 'user has no right to start studio')
    );
}

Constr.fn.createSession = function (req, success, fail, pocket, res) {

    if (log_pmx) {
        pmx.emit('developer:login', {
            tenantid : pocket.tenantid,
            user : pocket.userid
        });
    }

    var openidCookie;
    try { openidCookie = JSON.parse(req.cookies[this.cookieName]) } catch (e) {};

    req.session = {
        tenant : { id: pocket.tenantid },
        user   : { id: pocket.userid }
    };

    if ( !!openidCookie ) return success();

    if ( util.getTheServerAddress() !== req.headers.origin ) {
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        req.session.origin = req.headers.origin;
        pocket.via = req.headers.origin;
    }

    res.cookie('X-DREAMFACE-TENANT', pocket.tenantid , { maxAge: 900000, httpOnly: true });

    success();
};

Constr.fn.writeSession = function (req, success, fail, pocket, res) {
    this.sessionManager.create(req, res, req.session).then(success, fail);
};

Constr.fn.setLastLoginCookie = function (req, success, fail, pocket, res) {
    util.lastLoginCookie.set(req, res);
    success();
};

Constr.fn.onFail = function (req, res, reason, httpStatus, pocket) {

    var last   = util.lastLoginCookie.get(req),
        tenant = pocket.tenantid || last.tenantid || '',
        path   = tenant
            ? '/studio/' + tenant + '/login'
            : '/studio/loginerror';

    this.log.warn('Failed login. User ' + pocket.tenantid + ':' + pocket.userid);

    if (log_pmx) {
        pmx.emit('developer:unauthorized', {
            tenantid : pocket.tenantid,
            user : pocket.userid
        });
    }

    res.redirect(path);
};

Constr.fn.onSuccess = function (req, res, next, pocket) {
    if ( pocket.via ) res.json({result:'success'});
    else res.redirect(pocket.successRedirect);
    
    this.log.info(
        'User ' + pocket.tenantid + ':' + pocket.userid + ' is logged in.' +
        ( pocket.via ? ' Via ' + pocket.via : '' )
    );
};

Constr.fn.loginPage = function ( req, res ) {
    var tenantid = req.params.tenantid,
        last     = util.lastLoginCookie.get(req);
    this.sessionManager.rm(req, res).fin(function(){

        res.render('login_dialog', {
            tenantid    : tenantid,
            userid      : last.tenantid === tenantid ? last.userid : ''
        });
    });
};

Constr.fn.loginerror = function(req, res){
    res.end('login error')
};


exports.Constructor = Constr;

//$.ajax({
//    type        : "post",
//    url         : 'http://dfx.host:9000/studio/login',
//    crossDomain : true,
//    dataType    : 'json',
//    xhrFields : {
//        withCredentials: true
//    },
//    data : {
//        tenantid : 'com',
//        userid   : 'admin',
//        password : 'admin1'
//    }
//})
//.then(function(data){ console.log('SUCCESS : ', data); })
//.fail(function(data){ console.log('FAIL : ', data); })
//
//$.ajax({
//    type        : 'get',
//    url         : 'http://dfx.host:9000/studio/index.html',
//    crossDomain : true,
//    dataType    : 'json',
//    xhrFields : {
//        withCredentials: true
//    }
//})
//.then(function(data){ console.log('SUCCESS : ', data); })
//.fail(function(data){ console.log('FAIL : ', data); })
