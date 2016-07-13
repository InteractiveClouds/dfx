var common = exports;
var sql = require('.');


//////////////////////////////////////////////////////////////////

var mysqlConfig = {
    dialect  : 'mysql',
    version  : '5',

    host     : '192.168.1.113',
    port     : 3306,
    database : 'NRS',
    user     : 'root',
    password : 'aabbccdd_123',

    charset  : 'utf-8',
    maxConn  : 20
};

common.MysqlDBToolAsyn = sql.createDBTool(mysqlConfig, function(err){
    if(err) {
        throw err;
    }
});


////////////////////////////////////////////////////////////////////


var mssqlConfig = {
    dialect  : 'mssql',
    version  : '2008',

    host     : '192.168.1.113',
    port     : 1433,
    database : 'NRS2_DB',
    user     : 'sa',
    password : 'aabbccdd_123',

    charset  : 'utf-8',
    maxConn  : 20
};

common.MssqlDBToolAsyn = sql.createDBTool(mssqlConfig, function(err){
    if(err) {
        throw err;
    }
    //console.log("is back!");
});




///////////////////////////////////////////////////////

var oracleConfig = {
    dialect  : 'oracle',
    version  : '11',

    host     : '192.168.1.113',
    port     : 1521,
    database : 'HYBASE',
    user     : 'motoruser',
    password : 'motoruser',

    charset  : 'utf-8',
    maxConn  : 20
};

common.OracleDBToolAsyn = sql.createDBTool(oracleConfig, function(err){
    if(err) {
        throw err;
    }
    //console.log("is back!");
});