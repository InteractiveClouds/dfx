var sessionGate = require('./sessionGate');

function Constr ( o ) {
    sessionGate.Constructor.call(this, o);
}

Constr.prototype = new sessionGate.Constructor;

Constr.prototype.onSuccess = function (req, res, next) {
    next();
};

exports.Constructor = Constr;

