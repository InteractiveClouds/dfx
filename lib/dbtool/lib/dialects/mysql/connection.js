var Mysql = require('mysql');
var Const = require('../common/const');
var Tools = require('../common/tools');

module.exports = Connection;

function Connection(options, callBack) {
    var thisConn = this;
    var connection = thisConn._connection = Mysql.createConnection(options);
    connection.connect(function(err){
        callBack(err, thisConn);
    });
}

Connection.prototype.query = function(sql, options, callBack) {
    var sqlTemp = Connection.transSqlStr(sql, options);
    var paramsTemp  = options.params? options.params: [];
    var callBackTemp = callBack? callBack: options;
    this._connection.query(sqlTemp, paramsTemp, callBackTemp);
};

Connection.prototype.close = function(callBack) {
    var thisConn = this;
    if (callBack && typeof callBack ==='function') {
        thisConn._connection.end(callBack);
    } else {
        thisConn._connection.end();
    }
    //delete thisConn._connection;
};

Connection.transSqlStr = function(sql, options) {
    var sqlTemp = sql.replace(Const.PLACE_HOLDER, '?');
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
        var limit = 0;
        var skip = 0;
        // if (options.limit && Tools.isInt(options.limit)) {
        //     limit = options.limit;
        //     if (options.skip && Tools.isInt(options.skip)) {
        //         skip = options.skip;
        //     };
        // };
        if (Tools.isInt(options.limit) && Tools.isInt(options.skip)) {
            limit = options.limit;
            skip = options.skip;
        };
        if (limit) {
            sqlTemp += " limit " + skip + "," + limit + " ";
        };
    };
    return sqlTemp;
}