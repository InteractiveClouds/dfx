/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

//common.js
var mysqlConfig = {
    dialect  : 'mysql',
    host     : '127.0.0.1',
    port     : 3306,
    database : 'test',
    user     : 'root',
    password : '',
    min  : 0,               //default 0
    max  : 10,              //default 1
    idleTimeoutMillis : 100 //default 100
};
exports.mysqlConfig = mysqlConfig;
////////////////////////////////////////////////////////////////////
var mssqlConfig = {
    dialect  : 'mssql',
    host     : 'localhost',
    port     : 1433,
    database : 'test',
    user     : 'user',
    password : 'pass'
};
exports.mssqlConfig = mssqlConfig;
////////////////////////////////////////////////////////////////////
var oracleConfig = {
    dialect  : 'oracle',
    host     : '192.168.1.113',
    port     : 1521,
    database : 'ME',
    user     : 'sys',
    password : 'sys'
};
exports.oracleConfig = oracleConfig;
