var sql = require('mssql'); 

var config = {
    user: 'sa',
    password: 'aabbccdd_123',
    server: '192.168.1.113',
    database: 'NRS2_DB'
};

var connection = new sql.Connection(config, function(err) {
    console.error(err);

    var request = new sql.Request(connection); // or: var request = connection.request();
    request.query('select top 2 * from RU_DBTOOL_COL', function(err, recordset) {
        console.dir(recordset);
    });
});

// Query



// // Stored Procedure

// var request = new sql.Request(connection);
// request.input('input_parameter', sql.Int, value);
// request.output('output_parameter', sql.Int);
// request.execute('procedure_name', function(err, recordsets, returnValue) {
//     console.dir(recordsets);
// });