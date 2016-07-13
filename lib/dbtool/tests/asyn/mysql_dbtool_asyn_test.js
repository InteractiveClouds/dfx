var mysqlDBToolAsyn = require("./common_asyn").MysqlDBToolAsyn;

mysqlDBToolAsyn.getConnection(function(err, connection) {
    if (err) {
        throw err;
    };
    connection.query("select * from ru_dbtool_col limit @@, @@", [1, 1], function(err, rows){
        if(err) {
            throw err;
        }
        console.dir(rows);
        //connection.close();
    });

    connection.query("select @@ as time", [new Date()], function(err, rows){
        if(err) {
            throw err;
        }
        console.dir(rows);
        //connection.close();
    });

    connection.query("select 1 as time", function(err, rows){
        if(err) {
            throw err;
        }
        console.dir(rows);
        //connection.close();
    });

    connection.query("select * from ru_dbtool_col limit @@, @@", [1, 1], function(err, rows){
        if(err) {
            throw err;
        }
        console.dir(rows);
        //connection.close();
    });
    connection.close();
});


// mysqlDBToolAsyn.getConnection(function(err, connection) {
//     if (err) {
//         throw err;
//     };
//     connection.query("select @@ as time", [new Date()], function(err, rows){
//         if(err) {
//             throw err;
//         }
//         console.dir(rows);
//         connection.close();
//     });
// });

// mysqlDBToolAsyn.getConnection(function(err, connection) {
//     if (err) {
//         throw err;
//     };
//     connection.query("select 1 as time", function(err, rows){
//         if(err) {
//             throw err;
//         }
//         console.dir(rows);
//         connection.close();
//     });
// });