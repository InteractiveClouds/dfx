var Q = require('q');
var PoolModule = require('generic-pool');
var Fiber = require('fibers');

var ConnCfg = require("./conn_cfg");
var PoolCfg = require("./pool_cfg");
var Connection = require("./connection");


module.exports = DBTool;

function DBTool(options) {
    this._wrapper = options.dialect || '';
    this._connCfg = new ConnCfg(options);
    this._poolCfg = new PoolCfg(options);
    this.connect();
};
DBTool.prototype.connect = function(){
    var thisDBtool = this,
        connCfg = this._connCfg,
        poolCfg = this._poolCfg,
        factory = {
            name: poolCfg.name,
            min: poolCfg.min,
            max: poolCfg.max,
            idleTimeoutMillis: poolCfg.idleTimeoutMillis,
            create: function(callBack) {
                new Connection(thisDBtool._connCfg, function(err, connection){
                    if (err) {
                        callBack(err);
                    } else {
                        callBack(null, connection);
                    }
                });
            },
            destroy: function(connection) {
                if(connection){
                    connection.close();
                }
            }
        };
    this._pool = PoolModule.Pool(factory);
}
DBTool.prototype.executeQuery = function(sql, options, callBack) {
    var thisDBtool = this,
        optionsTemp = options || {},
        callBackTemp = callBack || null,
        D = Q.defer();

    thisDBtool._pool.acquire(function(err, connection){
        if(err) {
            thisDBtool._pool.release(connection);
            return D.reject(err);
            //callBackTemp(err, null);
        } else {
            if (connection===null) {
                //console.log('connection is null')
                return D.reject('can not get a connection, please check the config is right(ip, host, user, password are all right?');
                //callBackTemp(new Error("can not get a connection, please check the config is right(ip, host, user, password are all right?)"), null);
            } else {
                connection.query(sql, optionsTemp, function(err, results) {
                    thisDBtool._pool.release(connection);
                    if(err){
                        return D.reject(err);
                    } else {
                        return D.resolve(results);
                    }
                    //callBackTemp(err, results, rParams);
                });
            };
        }
    });
    return D.promise;
};

DBTool.prototype.executeQueryAsyn = function(sql, options) {
    var thisDBtool = this;
    var errResults = null;
    var retResults = [];
    var optionsTemp = options ? options : {};
    var rParams = optionsTemp.rParams? optionsTemp.rParams: [];
    var fiber = Fiber.current;

    thisDBtool._pool.acquire(function(err, connection){
        if(err) {
            errResults = err;
        } else {
            if (connection===null) {
                throw new Error("can not get a connection, please check the config is right(ip, host, user, password are all right?)");
            } else {
                connection.query(sql, optionsTemp, function(err, results) {
                    if (err) {
                        thisDBtool._pool.release(connection);
                        errResults = err;
                    } else {
                        retResults = results;
                        thisDBtool._pool.release(connection);
                        fiber.run();
                    }
                });
            }
        }
    });
    Fiber.yield();
    if (errResults) {
        throw errResults;
    } else {
        return retResults;
    };
};


DBTool.prototype.drain = function() {
    var thisDBtool = this;
    thisDBtool._pool.drain(function(){
        thisDBtool._pool.destroyAllNow();
    });
};

DBTool.prototype.getConnection = function(callBack) {
    if(!callBack || typeof callBack !== 'function') {
        throw new Error("this function require a callBack");
    }
    var thisDBtool = this;
    new Connection(thisDBtool._options, callBack);
};

DBTool.prototype.executeQueryOnce = function(sql, params, callBack, rParams) {
    var thisDBtool = this;
    var conn = null;
    var paramsTemp = callBack ? params : [];
    var rParamsTemp = rParams;
    var callBackTemp = callBack ? callBack: params;

    new Connection(thisDBtool._options, function(err, connection){
        if(err) {
            try {
                conn.close();
            } catch(e) {

            }
            callBackTemp(err, null);
        } else {
            conn = connection;
            conn.query(sql, paramsTemp, function(err, results) {
                conn.close();
                callBackTemp(err, results, rParamsTemp);
            });
        }
    });
};

DBTool.prototype.getPoolSize = function() {
    return this._pool.getPoolSize();
}

DBTool.prototype.getBusyConnsCount = function() {
    return this._pool.getPoolSize() - this._pool.availableObjectsCount();
}

DBTool.prototype.getAvailableConnsCount = function() {
    return this._pool.availableObjectsCount();
}

DBTool.prototype.getWaitingClientsCount = function() {
    return this._pool.waitingClientsCount();
}
