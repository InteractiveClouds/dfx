var oracleDBToolAsyn = require("./common_asyn").OracleDBToolAsyn;

oracleDBToolAsyn.getConnection(function(err, connection) {
    if (err) {
        throw err;
    };
    connection.query("select * from PM_USER where rownum < @@", [2], function(err, rows){
        if(err) {
            throw err;
        }
        console.dir(rows);
        connection.close();
    });
});

oracleDBToolAsyn.getConnection(function(err, connection) {
    if (err) {
        throw err;
    };
    connection.query("select 1 from dual", function(err, rows){
        if(err) {
            throw err;
        }
        console.dir(rows);
        connection.close();
    });
});

oracleDBToolAsyn.getConnection(function(err, connection) {
    if (err) {
        throw err;
    };
    connection.query("select @@ as one, @@ as two from dual", [1, new Date()], function(err, rows){
        if(err) {
            throw err;
        }
        console.dir(rows);
        connection.close();
    });
});