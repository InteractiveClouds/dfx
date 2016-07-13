var oracle = require("oracle");

var config = {
    hostname: "192.168.1.113",
    user: "motoruser",
    password: "motoruser",
    database: "HYBASE"
};

oracle.connect(config, function(err, connection) {
    if (err) {
        console.log(err);
        return false;
    };
    connection.execute("select * from PM_USER where rownum < 3 ", [], function(err, results){
        if(err) {
            console.log(err);
            return false;
        }
        console.log(results);
        connection.close(); // call this when you are done with the connection
    });

});