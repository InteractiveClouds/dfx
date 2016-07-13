/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var core     = require('../../core'),
    studio   = require('./studio'),
    utils    = require('../../utils'),

    VERIFICATION_URL = utils.getTheServerAddress() + '/studio/openidverify',

    openid       = require('openid'),
    url          = require('url'),
    querystring  = require('querystring'),
    relyingParty = new openid.RelyingParty(
        VERIFICATION_URL,
        utils.getTheServerAddress() + '/studio/',
        true, // Use stateless verification
        false, // Strict mode
        []
    ),

    time  = utils.time;




function Constr ( o ) {

    o = o || {};

    core.Constructor.call(this, { users : o.users });

    this.log = o.log;
    this.sessionManager = o.sessionManager;
    this.afterLoginBin  = o.runAfterLogin;
    this.cookieName = o.cookieName;
    this.cookiePath = o.cookiePath;
    this.cookieExpiresIn = o.cookieExpiresIn;
    this.usersStorage = o.users;
    this.tenants = o.tenants;


    this.use(this.verify);
    this.use(this.findUser);
    this.use(this.hasRightToStartStudio);
    this.use(this.createSession);
    this.use(this.setLastLoginCookie);
    this.use(this.afterLogin);
    this.use(this.writeSession);
}

Constr.fn = Constr.prototype = Object.create(studio.Constructor.prototype);

Constr.fn.verify = function (req, success, fail, pocket, res) {

    var cookieData, openIdData,
        that = this;
    
    try { cookieData = JSON.parse(req.cookies[this.cookieName]) } catch (e) {};

    if ( !cookieData ) return fail('openid verify endpoint got request without cookie');

    res.clearCookie(this.cookieName, {
        path : this.cookiePath
    });


    pocket.tenantid  = cookieData.tenantid;
    pocket.successRedirect = cookieData.successRedirect; // TODO remove


    relyingParty.verifyAssertion(req, function(error, result) {

        if ( error )    return fail(error.message);

        that.log.debug(result);

        pocket.userid    = result.claimedIdentifier || cookieData.userid;

        that.log.info('identifyed through OpenId: ', pocket);

        success();
    });

};

Constr.fn.looksLikeOpenId = (function(){

    var rgxp = /^https?:\/\/.+/i;

    return function ( userid ) {
        return rgxp.test(userid)
    }
})();


Constr.fn.start = function (userid, tenantid, res, fail, successRedirect) {
    var that = this,
        cookieData = JSON.stringify({
            tenantid : tenantid,
            userid : userid,
            successRedirect : successRedirect
        });

    res.cookie(this.cookieName, cookieData, {
        path    : that.cookiePath,
        expires : new Date(time.now + that.cookieExpiresIn)
    });


    // Resolve identifier, associate, and build authentication URL
    relyingParty.authenticate(userid, false, function(error, authUrl) {

        if ( error )    return fail(error);
        if ( !authUrl ) return fail('[openid]: can\'t compose authUrl');

        res.redirect(authUrl);
    });
};

exports.Constructor = Constr;
