var defaultSchema = require('../default/studio'),
    SETTINGS      = require('../../../dfx_settings');


function Constr ( o ) {
    defaultSchema.Constructor.call(this, o);
}

Constr.fn = Constr.prototype = new defaultSchema.Constructor;


Constr.fn.parse = function (req, success, fail, pocket, res) {

    pocket.userid    = req.body.userid   || '';
    pocket.upn       = req.header(SETTINGS.authSiteminderHeaderName);
    pocket.password  = req.body.password || '';
    pocket.tenantid  = req.body.tenantid;

    if ( !pocket.userid && pocket.upn ) {
        pocket.isSiteminderUser = true;
        pocket.userid = pocket.upn;
    }

    if ( !pocket.tenantid || !pocket.userid ) return fail('Wrong credentials.');
    else success();
};

var origCheck = Constr.fn.checkCredentials;
Constr.fn.checkCredentials = function (req, success, fail, pocket, res) {

    if ( pocket.isSiteminderUser ) success();
    else origCheck.call(this, req, success, fail, pocket, res);
};


var origSetLastLoginCookie = Constr.fn.setLastLoginCookie;
Constr.fn.setLastLoginCookie = function (req, success, fail, pocket, res) {

    if ( pocket.isSiteminderUser ) {
        util.lastLoginCookie.set(req, res, true); // save just tenant to the cookie
        success();
    } else {
        origSetLastLoginCookie.call(this, req, success, fail, pocket, res);
    }
};

exports.Constructor = Constr;
