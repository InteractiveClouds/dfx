var defaultSchema = require('../default/app');
var log = new (require('../../../utils/log')).Instance({label:'GATES_APP_SITEMINDER'});

function Constr ( o ) {
    defaultSchema.Constructor.call(this, o);
}


Constr.fn = Constr.prototype = Object.create(defaultSchema.Constructor.prototype);

Constr.fn.parseSeal = function (req, success, fail, pocket) {
    pocket.tokenid = pocket.seal;
    success();
};

Constr.fn.checkSeal = function (req, success, fail, pocket) {

    pocket.tenantid = pocket.token.tenantid;
    pocket.userid   = pocket.token.userid;

    req.user = {
        tenantid : pocket.tenantid,
        userid   : pocket.userid,
        tokenid  : pocket.tokenid
    };

    log.dbg(
        'SITEMINDER. Checking seal is SUCCESS. User is ' +
        JSON.stringify(req.user, null, 4)
    );

    req[pocket.where] = req.data = pocket.data;

    success();
};

exports.Constructor = Constr;
