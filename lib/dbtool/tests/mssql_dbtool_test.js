var common = require("./common");
var MssqlDBTool = common.mssqlDBTool;


// MssqlDBTool.executeQuery("select top 2 * from RU_DBTOOL_COL", [], function(err, rows){
//     if(err) {
//         throw err;
//     }
//     console.dir(rows);
// });
var options = {
    params: [0],
    sort : {
        id: 'asc'},
    skip: 29,
    limit: 10
};
MssqlDBTool.executeQuery("select * from RU_DBTOOL_COL where PRIMARYKEYFLAG = @@", options, function(err, rows){
    if(err) {
        throw err;
    }
    console.dir(rows);
});

MssqlDBTool.executeQuery("select 1 as one", function(err, rows){
    if(err) {
        throw err;
    }
    console.dir(rows);
});

