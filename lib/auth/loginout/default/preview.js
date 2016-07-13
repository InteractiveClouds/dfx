var App = require('./app').Constructor;


function Constr ( o ) {
    o = o || {};
    App.call(this, o);
}

Constr.fn = Constr.prototype = Object.create(App.prototype);

Constr.fn.parse = function (req, success, fail, pocket, res) {
    pocket.tenantid  = req.user.tenantid;
    pocket.userid    = req.user.userid;
    pocket.appid     = '_preview';
    pocket.ispreview = '_preview';

    success();
};

Constr.fn.check = function (req, success, fail, pocket, res) {
    return success();
};

exports.Constructor = Constr;
