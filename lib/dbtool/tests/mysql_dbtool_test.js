var common = require("./common");
var MysqlDBTool = common.mysqlDBTool;

var options = {
   params: [1],
   sort : {
       id: 'asc',
       colname: 'desc'},
   skip: 50,
   limit: 10
};
// for(var i=0; i<2000; i++) {
//    options.rParams = {p1: i};
//    MysqlDBTool.executeQuery("select * from ru_dbtool_col where cannull=@@ ", options, function(err, rows, params){
//        if(err) {
//            throw err;
//        }
//        //console.dir(params);
//        //console.dir(rows);
//    });
// };

// setInterval(function() {
//     var waitingClientsCount = MysqlDBTool.getWaitingClientsCount();
//     console.log("WaitingClientsCount:" + waitingClientsCount);
//     console.log("BusyConnsCount:" + MysqlDBTool.getBusyConnsCount());
//     //console.log("WaitingClientsCount:" + waitingClientsCount);
// /*    if(waitingClientsCount===0) {
//         cleanTimeout(timer);
//     } else {
//         timer
//     }*/
// }, 1000);



// MysqlDBTool.executeQuery("update ru_dbtool_col set colalias=@@ where id=1", {params:["#ewr@wew."]}, function(err, rows){
//     if(err) {
//         throw err;
//     }
//     console.dir(rows);
// });

MysqlDBTool.executeQuery("select 1 as time", function(err, rows){
    if(err) {
        throw err;
    }
    console.dir(rows);
});

var Fiber = require('fibers');
Fiber(function(){
    var result = MysqlDBTool.executeQueryAsyn("select 2 as time");
    console.log(result);
}).run();
