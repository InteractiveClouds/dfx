
## DBTool instructions

*   [Preparation](#preparation)
*   [Install DBTool](#installdbtool)
*   [Example](#example)
*   [DBTool Info](#dbtoolinfo)
*   [Remark](#remark)


------------------

### &nbsp;

### <a id="preparation">Preparation</a>

Because of this package dependent on oracle, before you install this package, you must install the [Oracle instant client](http://www.oracle.com/technetwork/database/features/instant-client/index-097480.html) first.

For detail, you can click [here](https://npmjs.org/package/oracle).

In this place, I just show you how to install [Oracle instant client](http://www.oracle.com/technetwork/database/features/instant-client/index-097480.html) in linux.(from [npm oracle package](https://npmjs.org/package/oracle))

##### 1. Install

  1. Instant Client Package - Basic or Basic Lite: All files required to run OCI, OCCI, and JDBC-OCI applications
  2. Instant Client Package - SDK: Additional header files and an example makefile for developing Oracle applications with Instant Client

  **Please make sure you download the correct packages for your system architecture, such as 64 bit vs 32 bit Unzip the files 1 and 2 into the same directory, such as /opt/instantclient_11_2 or c:\instantclient_12_1**

##### 2. Set up the following environment variables
    
    export OCI_HOME=<directory of Oracle instant client>
    export OCI_LIB_DIR=$OCI_HOME
    export OCI_INCLUDE_DIR=$OCI_HOME/sdk/include
    export OCI_VERSION=<the instant client major version number> # Optional. Default is 11.

##### 3. Create the following symbolic links

    cd $OCI_LIB_DIR
    ln -s libclntsh.so.11.1 libclntsh.so
    ln -s libocci.so.11.1 libocci.so

##### 4. Libaio library is required on Linux systems

* On Unbuntu/Debian

        sudo apt-get install libaio1

* On Fedora/CentOS/RHEL

        sudo yum install libaio

##### 5. Add the shared object files to the ld cache

    # Replace /opt/instantclient_11_2/ with wherever you extracted the Basic Lite files to
    echo '/opt/instantclient_11_2/' | sudo tee -a /etc/ld.so.conf.d/oracle_instant_client.conf
    sudo ldconfig



### &nbsp;


### <a id="installdbtool">Install DBTool</a>

    sudo npm install dbtool


### &nbsp;


### <a id="example">Example</a>
##### 1. Make a global common file like this

    //common.js
    var dbtool = require('dbtool');
    var mysqlConfig = {
        dialect  : 'mysql',
        host     : '192.168.1.113',
        port     : 3306,
        database : 'ME',
        user     : 'root',
        password : 'root',
        min  : 0,               //default 0
        max  : 10,              //default 1
        idleTimeoutMillis : 100 //default 100
    };
    exports.mysqlDBTool = dbtool.createDBTool(mysqlConfig);

    ////////////////////////////////////////////////////////////////////
    var mssqlConfig = {
        dialect  : 'mssql',
        host     : '192.168.1.113',
        port     : 1433,
        database : 'ME',
        user     : 'sa',
        password : 'sa'
    };
    exports.mssqlDBTool = dbtool.createDBTool(mssqlConfig);

    ////////////////////////////////////////////////////////////////////
    var oracleConfig = {
        dialect  : 'oracle',
        host     : '192.168.1.113',
        port     : 1521,
        database : 'ME',
        user     : 'sys',
        password : 'sys'
    };
    exports.oracleDBTool = dbtool.createDBTool(oracleConfig);


##### 2. Execute query and get the result

    var common = require("./common");

    ////////////////////////////////////////////////////////////////////
    var MysqlDBTool = common.mysqlDBTool;
    var options = {
        params: [1],
        sort : {
            id: 'asc',
            colname: 'desc'},
        skip: 50,
        limit: 10
    };
    MysqlDBTool.executeQuery("select * from ru_dbtool_col where cannull=@@ ", options, function(err, rows){
        if(err) {
            throw err;
        }
        console.dir(rows);
    });
    MysqlDBTool.executeQuery("select 1 as time", function(err, rows){
        if(err) {
            throw err;
        }
        console.dir(rows);
    });

    ////////////////////////////////////////////////////////////////////
    var MssqlDBTool = common.mssqlDBTool;
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

    ////////////////////////////////////////////////////////////////////
    var oracleDBTool = common.oracleDBTool;
    var options = {
        params: ['1'],
        sort : {
            userCode: 'asc',
            userName: 'desc'},
        skip: 19,
        limit: 10
    };
    oracleDBTool.executeQuery("select * from PM_USER where userflag = @@", options, function(err, rows){
        if(err) {
            throw err;
        }
        console.dir(rows);
    });
    oracleDBTool.executeQuery("select 1 from dual", function(err, rows){
        if(err) {
            throw err;
        }
        console.dir(rows);
    });

### &nbsp;

### <a id="dbtoolinfo">DBTool Info</a>

The following functions will let you get information about the DBTool status:

    // returns number of connection in the dbtool inner pool regardless of
    // whether they are free or in use
    getPoolSize()

    // returns number of using connection in the dbtool inner pool
    getBusyConnsCount()

    // returns number of unused connection in the dbtool inner pool
    getAvailableConnsCount()

    // returns number of callers waiting to acquire a connection
    getWaitingClientsCount()

### &nbsp;

### <a id="remark">Remark</a>

##### 1. This package use the connection pool technology and you don't need to care about the release of the connection. Every time you call `executeQuery` function, it will get a connection from connection pool. Beyond the scope of the callback function, the connection will put back to connection pool automatically.

##### 2. This DBTool unified the paging and scheduling interface, but it is not support `sql server 2000`.


