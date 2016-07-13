module.exports = Connection;

function Connection(options, callBack) {
    var thisConn = this;
    thisConn.config = options.config;
    thisConn.callBack = callBack;
    var ConnectionProto = require(__dirname+"/dialects/"+options.dialect+"/connection");
    new ConnectionProto(options, function(err, connection) {
        thisConn._connection = connection;
        if (thisConn.callBack) {
            thisConn.callBack(err, connection);
        };
    });
};

Connection.prototype.query = function(sql, options, callBack) {
    this._connection.query(sql, options, callBack);
}

Connection.prototype.close = function(callBack) {
    this._connection.close(callBack);
    //delete this._connection;
}