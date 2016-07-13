var common = exports;

var sql = require('.');

var mysqlConfig = {
    dialect  : 'mysql',

    host     : '192.168.1.113',
    port     : 3306,
    database : 'NRS',
    user     : 'root',
    password : 'aabbccdd_123',

    idleTimeoutMillis: 100,
    min: 0,
    max: 10
};

common.mysqlDBTool = sql.createDBTool(mysqlConfig);
// Fiber(
//     futureMysql = new Future();
//     sql.createDBTool(mysqlConfig, function(err, connection){
//         if(err) {
//             future.throw(err);
//             return;
//         }
//         future.return([true, connection]);
//     });
//     common.MysqlDBTool = futureMysql.wait();
// ).run();

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

common.mssqlDBTool = sql.createDBTool(mssqlConfig);




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

common.oracleDBTool = sql.createDBTool(oracleConfig);