var mssqlDBToolAsyn = require("./common_asyn").MssqlDBToolAsyn;

mssqlDBToolAsyn.getConnection(function(err, connection) {
    if (err) {
        throw err;
    };
    connection.query("select top 1 * from RU_DBTOOL_COL where id = @@ ", [1], function(err, rows){
        if(err) {
            throw err;
        }
        console.dir(rows);

    });

    connection.query("select 1 as one", function(err, rows){
        if(err) {
            throw err;
        }
        console.dir(rows);
        //connection.close();
    });

    connection.query("select @@ as one, @@ as tow", [1, new Date()], function(err, rows){
        if(err) {
            throw err;
        }
        console.dir(rows);
        //connection.close();
    });
    connection.query("select top 1 * from RU_DBTOOL_COL where id = @@ ", [1], function(err, rows){
        if(err) {
            throw err;
        }
        console.dir(rows);

    });
    connection.close();
});



// mssqlDBToolAsyn.getConnection(function(err, connection) {
//     if (err) {
//         throw err;
//     };
//     connection.query("select 1 as one", function(err, rows){
//         if(err) {
//             throw err;
//         }
//         console.dir(rows);
//         connection.close();
//     });
// });



// mssqlDBToolAsyn.getConnection(function(err, connection) {
//     if (err) {
//         throw err;
//     };
//     connection.query("select @@ as one, @@ as tow", [1, new Date()], function(err, rows){
//         if(err) {
//             throw err;
//         }
//         console.dir(rows);
//         connection.close();
//     });
// });