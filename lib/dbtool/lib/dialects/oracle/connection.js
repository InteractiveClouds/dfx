var oracle = require('oracle');
var Const = require('../common/const');
var Tools = require('../common/tools');

module.exports = Connection;

function Connection(options, callBack) {
    var thisConn = this;
    oracle.connect(options, function(err, connection){
        thisConn._connection = connection;
        callBack(err, thisConn);
    });
}

Connection.prototype.query = function(sql, options, callBack) {
    var sqlTemp = Connection.transSqlStr(sql, options);
    var paramsTemp  = options.params? options.params: [];
    var callBackTemp = callBack? callBack: options;
    //console.log(sqlTemp);
    this._connection.execute(sqlTemp, paramsTemp, callBackTemp);
};


Connection.prototype.close = function(callBack) {
    var thisConn = this;
    thisConn._connection.close();
    if (callBack && typeof callBack ==='function') {
        callBack();
    }
    //delete thisConn._connection;
};

Connection.transSqlStr = function(sql, options) {
    var inc = 0;
    var sqlTemp = sql.replace(Const.PLACE_HOLDER, function(str) {
        return ":" + ++inc;
    });
    if (options && typeof options==="object") {
        if (options.sort && typeof options.sort==="object") {
            var orderStr = "";
            for (var prop in options.sort) {
                orderStr += prop + " " + options.sort[prop]+",";
            };
            if (orderStr) {
                sqlTemp += " order by " + orderStr.substring(0, orderStr.length-1) + " ";
            };
        };
        var max = 0;
        var min = 0;
        if (Tools.isInt(options.limit) && Tools.isInt(options.skip)) {
            min = options.skip;
            max = options.skip + options.limit + 1;
            sqlTemp = "select T2_TEMP__.* from (select T1_TEMP__.*, rownum rownum_temp__ from ("+ sqlTemp +") T1_TEMP__ where rownum<"+ max +") T2_TEMP__ where T2_TEMP__.rownum_temp__>"+ min +" ";
        };
    }
    return sqlTemp;
}