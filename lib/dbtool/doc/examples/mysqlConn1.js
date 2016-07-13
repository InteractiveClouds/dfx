var mysql      = require('mysql');

var config = {
  host     : '192.168.1.113',
  port     : 3306,
  user     : 'root',
  password : 'aabbccdd_123',
  database : 'NRS'
};

var connection = mysql.createConnection(config);

connection.connect( function(err) {
    if (err) {
        console.log(err);
    };

    connection.query('select * from ru_dbtool_col limit 10, 2', function(err, rows, fields) {
      if (err) throw err;

        //console.log('The solution is: ', rows);
    });

    connection.end();

    // try{
    //   throw new Error('This is a test!');
    // } catch(e) {
    //   console.dir(e);
    // }
});

