var checkRights = require('../default/appQuery').checkRights,
    appGate  = require('./app');

function Constr ( o ) {
    appGate.Constructor.call(this, o);

    this.use(checkRights);
}

Constr.prototype = new appGate.Constructor({});


exports.Constructor = Constr;
