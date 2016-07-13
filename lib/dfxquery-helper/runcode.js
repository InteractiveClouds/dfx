/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var Script = require('vm'),
    util = require('util'),
    HTTP = require('q-io/http'),
    sysadmin = require('../dfx_sysadmin'),
    Log = new (require('../utils/log')).Instance({label:'QUERIES_RUNCODE'}),
    Q = require('q');

// our function abortQueryExecution
var abortQueryExecution = function (obj){
    var txtErr = (obj.name) ? obj.name: 'Abort execution!';
    throw new Error(txtErr);
};
var executeQuery = function(o, callback){
    var tenantId = context.tenantId,
        qName = o.qName || '',
        setParams = o.params || '',
        url = 'http://localhost:3000/api/query/execute?queryName='+qName,
        params = {},
        dfd = Q.defer(),
        qStr = '', dlm = '';
    if(setParams){
        for(key in setParams){
            qStr += dlm+'data['+key+']='+setParams[key];
            dlm = '&';
        }
        url += '&'+qStr;
    }
    params = {url:url,headers:{}};
    //
    sysadmin.tenant.get(tenantId)
    .then(function (tenant) {
        if (tenant.databaseTokens) {
            params.headers.Authorization = 'Basic ' + new Buffer(tenantId + ':' + Object.keys(tenant.databaseTokens)[0]).toString('base64');
            return HTTP.request(params)
            .then(function (res) {
                return res.body.read()
                .then(function (body) {
                    var result = body.toString('utf8');
                    try{
                        result = JSON.parse(result);
                        return dfd.resolve(result);
                    } catch(e){
                        return dfd.reject(e);
                    }
                })
            })
        }
    })
    .fail(function (err) {
        log.error(err);
        return dfd.reject(err);
    });
    return dfd.promise;
}

// create context
var context = Script.createContext();
context.Q = Q;
context.console = console;
context.abortQueryExecution = abortQueryExecution;
context.executeQuery = executeQuery;

var sendResult = function(result){
    process.send(JSON.stringify( { result: result } ) );
};
var sendErrorResult = function(e){
    process.send(JSON.stringify( { error: e } ) );
};
// receive string code from parent
process.on('message', function(o) {
    var code = o.code;
    if(o.tenantId){
        context.tenantId = o.tenantId;
    }
    //console.log('>>>CHILD got message:',code);
    var result, script;

    try {
        script = Script.createScript(code);
        script.runInNewContext(context)
        .then(function(res){
            //console.log("--->")
            //console.log(res)
            sendResult(res);
        });
    } catch(e){
        console.log('code error->',e)
        if(e.name == 'SyntaxError'){
            result = e.name + ': ' + e.message;
        } else {
            result = e.message;
        }
        sendErrorResult(result);
    }
    process.stdout.on( 'drain', function() {
        process.exit(0);
    });

});
