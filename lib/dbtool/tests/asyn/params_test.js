var mssqlDBToolAsyn = require("./common_asyn").MssqlDBToolAsyn;
var mysqlDBToolAsyn = require("./common_asyn").MysqlDBToolAsyn;
var oracleDBToolAsyn = require("./common_asyn").OracleDBToolAsyn;

mysqlDBToolAsyn.getConnection(function(err, connection) {
    if (err) {
        throw err;
    };
    connection.query("select ? as one, ? as two", [1, new Date()], function(err, rows){
        if(err) {
            throw err;
        }
        console.dir(rows);
        connection.close();
    });
});

// mssqlDBToolAsyn.getConnection(function(err, connection) {
//     if (err) {
//         throw err;
//     };
//     connection.query("select @id as id", [{'id': 12}], function(err, rows){
//         if(err) {
//             throw err;
//         }
//         console.dir(rows);
//         connection.close();
//     });
// });

oracleDBToolAsyn.getConnection(function(err, connection) {
    if (err) {
        throw err;
    };
    connection.query("select :1 as one, :2 as two from dual", [1, new Date()], function(err, rows){
        if(err) {
            throw err;
        }
        console.dir(rows);
        connection.close();
    });
});



