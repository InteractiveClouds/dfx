var defaultApp = require('../default/app'),
    SETTINGS   = require('../../../dfx_settings');

function Constr ( o ) {
    defaultApp.Constructor.call(this, o);
}

Constr.fn = Constr.prototype = Object.create(defaultApp.Constructor.prototype);


Constr.fn.parse = function (req, success, fail, pocket, res) {

    pocket.tenantid = req.body.tenantid;
    pocket.userid   = req.header(SETTINGS.authSiteminderHeaderName);
    pocket.appid    = req.body.appid;

    success();
};


exports.Constructor = Constr;
