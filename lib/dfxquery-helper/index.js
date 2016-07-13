/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var Q = require('q'),
    path = require( 'path'),
    Script = require('vm'),
    SETTINGS = require('../dfx_settings'),
    query = require('../dfx_queries'),
    _ = require('underscore'),
    AR = require('../authRequest'),
    log = new (require('../utils/log')).Instance({label:'QUERY_HELPER'}),
    request = require('request');

if ( SETTINGS.studio ) {
    var sysadmin          = require('../dfx_sysadmin');
}

//---- helper functions
var _objType = function(o){
    return Object.prototype.toString.call(o)
};

var filterKeys = function(o, keys, isExclude){
    var no = {};
    for (var k in o) {
        if(o.hasOwnProperty(k)){
            if ((keys.indexOf(k) > -1 && !isExclude) || (keys.indexOf(k) == -1 && isExclude)) {
                no[k] = o[k];
            }
        }
    }
    return no;
};

var filterArrayByKeys = function(o, keys, isExclude){
    var newO, resArr = [];
    o = o.forEach(function(item,index){
        newO = filterKeys(item, keys, isExclude);
        if(Object.keys(newO).length !== 0){
            resArr.push(newO);
        }
    });
    return resArr;
};

var filterByOperation = function(el, oProp){
    var condition, dlm = '';
    var prop = oProp.prop, operation = oProp.op, value = oProp.value;
    if(operation ==  'eq' ){
        return el[prop] == value;
    } else if(operation ==  'ne'){
        return el[prop] != value;
    } else if(operation ==  'lt'){
        return el[prop] < value;
    } else if(operation ==  'gt'){
        return el[prop] > value;
    } else {
        return el[prop];
    }

};

var filterArr = function(arr, arrProp){
    return arr.filter(function(el) {
        return arrProp.every(function(c) {
            return filterByOperation(el, c);
        });
    });
};
var IsNumber = function(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
};
var hasObjChildren = function(o){
    var objType, isChildren = false;
    for(var i in o){
        if(o.hasOwnProperty(i)){
            objType = _objType(o[i]);
            if(objType == '[object Object]' || objType == '[object Array]'){
                isChildren = true;
                break;
            }
        }
    }
    return isChildren;
};
var isNeedProp = function(arr, arrProp){
    var resArr = [],keysSearch = [];
    for(var i= 0,len = arrProp.length; i<len; i++){
        keysSearch.push(arrProp[i].prop);
    }
    arr.forEach(function(item, index){
        if(keysSearch.indexOf(item) > -1){
            resArr.push(item);
        }
    });
    return resArr;
}
var hasChildren =  function(o){
    var isChildren = false;
    if(_objType(o) == '[object Array]'){
        isChildren = true;
        for(var i= 0, len = o.length; i < len;i++){
            isChildren = hasObjChildren(o[i]);
            if(isChildren){
                isChildren = true;
                break;
            }
        }
    } else {
        isChildren = hasObjChildren(o);
    }
    return isChildren;
};
var buildArrEmpty = function(str, arr){
    var arrK = str.split('_'), resAr, resStr;
    resAr = lastNum(arrK);
    if(resAr && resAr.length){
        resStr = resAr.join('_');
        if(arr.indexOf(resStr) == -1){
            arr.push(resStr);
        }
    }
    return arr;
};
var lastNum = function(arr){
    var last = arr.pop();
    if(!IsNumber(last)){
        if(arr.length){
            return lastNum(arr);
        } else {
            return false;
        }
    } else {
        arr.push(last);
        return arr;
    }
};
var customFilter = function (obj, oSearch, current, arr){
    var keys = (obj) ? Object.keys(obj) : [],
        objType,
        val,
        key,
        res,
        isChild,
        isProp;
    for(var i= 0, len = keys.length; i < len;i++){
        key = keys[i];
        val = obj[key];
        objType = _objType(val);
        if(typeof val == 'object'){
            isChild = hasChildren(val);
            ikey = current ? current + '_' + key: key;
            if(objType == '[object Array]' && val.length && Object.keys(val[0]).length) {
                isProp = isNeedProp(Object.keys(val[0]), oSearch);
                if(isProp.length){
                    res = filterArr(val, oSearch);
                    obj[key] = res;
                    // build array for delete element
                    if(!res.length){
                        obj[key] = {};
                        //arr.push(current)
                        arr = buildArrEmpty(current,arr);
                    }
                    continue;
                }
            } else if(objType == '[object Object]') {
                if(!isChild){
                    // filter object
                    res = filterArr([val], oSearch);
                    if(res.length){
                        obj[key] = res[0];
                    } else {
                        delete obj[key];
                        // build array for delete element
                        //arr.push(ikey)
                        arr = buildArrEmpty(ikey,arr);
                    }
                }
            }
            customFilter(val, oSearch, ikey, arr);
        }
    }
};

//---- context functions
var abortQueryExecution = function (obj){
    var txtErr = (obj.name) ? obj.name: 'Abort execution!';
    throw new Error(txtErr);
};
var transformToObject = function(pars){
    var res = {};
    if(_objType(pars) == '[object Array]') {
        for(var i= 0, len = pars.length; i<len; i++){
            if(pars[i].name && pars[i].value){
                if(!res[pars[i].name]){
                    res[pars[i].name] = pars[i].value;
                }
            }
        }
    } else {
        res = pars;

    }
    return res;
}
var filterProperties = function (obj, keys, callback) {
    var rObj = {}, firstKey,
        objType = _objType(obj);

    if(objType == '[object Array]'){

        rObj = filterArrayByKeys(obj, keys, 0);

    } else if(objType == '[object Object]') {

        firstKey = Object.keys(obj)[0];
        if(_objType(obj[firstKey]) == '[object Array]'){
            rObj[firstKey] = filterArrayByKeys(obj[firstKey], keys, 0);
        } else {
            rObj = filterKeys(obj, keys, 0);
        }

    } else {
        rObj = obj;
    }
    callback(rObj);
};
var excludeProperties = function (obj, keys, callback) {
    var rObj = {}, firstKey,
        objType = _objType(obj);


    if(objType == '[object Array]'){

        rObj = filterArrayByKeys(obj, keys, 1);

    } else if(objType == '[object Object]') {

        firstKey = Object.keys(obj)[0];
        if(_objType(obj[firstKey]) == '[object Array]'){
            rObj[firstKey] = filterArrayByKeys(obj[firstKey], keys, 1);
        } else {
            rObj = filterKeys(obj, keys, 1);
        }

    } else {
        rObj = obj;
    }
    callback(rObj);
};
var filterData = function(obj, arrParams, callback){
    var objType = _objType(obj), arrKeys = [];

    if(objType == '[object Array]'){
        obj = {'custF':obj}
    }
    if(_objType(arrParams) != '[object Array]'){
        abortQueryExecution({'name':'Params in filterData function mast be an array!'});
        return;
    }
    customFilter(obj, arrParams, '', arrKeys);
    if(obj['custF']){
        obj = obj['custF'];
    }
    // delete empty nodes
    var elDel, arrK, lastKey, str = '' ;
    for(var i= arrKeys.length-1; i >= 0; i--){
        elDel = arrKeys[i];
        arrK = elDel.split('_');
        lastKey = arrK.pop();
        for(var j= 0, lenK = arrK.length; j< lenK; j++){
            str += (IsNumber(arrK[j])) ? '['+arrK[j]+']' : '["'+arrK[j]+'"]';
        }
        if(IsNumber(lastKey)){
            try{
                eval('obj'+str+'.splice('+lastKey+',1)')
            } catch(e){}
        }
        str = '';
    }
    callback(obj);
}

var getService = function(apiRoute, params) {
    if (arguments.length != 2) {
        throw "Function must have 2 arguments!";
    }
    var tenantId = context.tenantId;
    var application = context.application;
    var bodyData = {
        params : params || {}
    }
        url = 'http://' + SETTINGS.server_host + ':' + SETTINGS.server_port +'/api/' + application + '/apiRoute/' + apiRoute;

    var D = Q.defer();

    sysadmin.tenant.get(tenantId)
        .then(function (tenant) {
            if (tenant.databaseTokens) {
                var authContent = tenantId + ":" + Object.keys(tenant.databaseTokens)[0];
                var options = {
                    method: 'POST',
                    url: url,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': "Basic " + new Buffer(authContent).toString("base64")
                    },
                    json: bodyData

                };

                function callback(error, response, body) {
                    if (!error) {
                        var info = JSON.parse(JSON.stringify(body));
                        D.resolve(info.data);
                    }else {
                        D.reject(error);
                    }
                }
                request(options, callback);

            } else {
                console.log('error get tenant token ->',tenantId);
            }
        })
        .fail(function (err) {
            console.log('error get tenant->',err);
        });

    return D.promise;
}

var postService = function(apiRoute, params, body) {
    if (arguments.length != 3) {
        throw "Function must have 3 arguments!";
    }
    var tenantId = context.tenantId;
    var application = context.application;
    var bodyData = {
        body : body || {},
        params : params || {}
    }
    url = 'http://' + SETTINGS.server_host + ':' + SETTINGS.server_port +'/api/' + application + '/apiRoute/' + apiRoute;

    var D = Q.defer();

    sysadmin.tenant.get(tenantId)
        .then(function (tenant) {
            if (tenant.databaseTokens) {
                var authContent = tenantId + ":" + Object.keys(tenant.databaseTokens)[0];
                var options = {
                    method: 'POST',
                    url: url,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': "Basic " + new Buffer(authContent).toString("base64")
                    },
                    json: bodyData

                };

                function callback(error, response, body) {
                    if (!error) {
                        var info = JSON.parse(JSON.stringify(body));
                        D.resolve(info.data);
                    }else {
                        D.reject(error);
                    }
                }
                request(options, callback);

            } else {
                console.log('error get tenant token ->',tenantId);
            }
        })
        .fail(function (err) {
            console.log('error get tenant->',err);
        });

    return D.promise;
}

var executeQuery = function(o, callback){
    var tenantId = context.tenantId,
        qName = o.qName || '',
        setParams = o.params || '',
        url = 'http://'+SETTINGS.server_host+':'+SETTINGS.server_port+'/api/query/execute?queryName='+qName,
        qStr = '', dlm = '';
    if(setParams){
        for(var key in setParams){
            qStr += dlm+'data['+key+']='+setParams[key];
            dlm = '&';
        }
        url += '&'+qStr;
    }
    //
    sysadmin.tenant.get(tenantId)
    .then(function (tenant) {
        if (tenant.databaseTokens) {
            AR.getRequestInstance({
                schema: 'basic',
                credentials: {
                    username: tenantId,
                    password: Object.keys(tenant.databaseTokens)[0]
                }
            })
            .get({
                url: url,
                headers: {'Content-Type': 'application/json; charset=utf-8'}
            })
            .then(function (response) { // show answer
                var data = response.body.toString('utf-8');
                try{
                    data = JSON.parse(data);
                    callback(data);
                } catch(e){
                    callback({'error':e.toString()});
                }
            })
            .fail(function (err) {
                callback({'error':err.toString()});
            });
        }
    })
    .fail(function (err) {
        console.log('error get tenant->',err);
        callback({'error':err.toString()});
    });
}
var initSandbox = {
    Q: Q,
    AR: AR,
    console: console,
    abortQueryExecution: abortQueryExecution,
    filterProperties: filterProperties,
    excludeProperties: excludeProperties,
    filterData: filterData,
    executeQuery: executeQuery,
    getService: getService,
    postService: postService,
    transformToObject: transformToObject
};
// create context
var context = Script.createContext(initSandbox);

/**
 * runCode runs the code with sandbox and returns the result
 * @param {String} code
 * @param callback
 */
function runCode(code, callback){
    var timer,
        timeout = 10000;
    clearTimeout( timer );
    try {
        script = Script.createScript(code);
        script.runInNewContext(context)
            .then(function(res){
                if(typeof res == "object"){
                    callback(res);
                } else {
                    try{
                        res = JSON.parse(res);
                        callback(res);
                    } catch(e){
                        callback({'error':e.toString()});
                    }
                }
            })
            .fail(function(err){
                console.log("error run code in context->",e);
                callback({'error':err.toString()});
            });
    } catch(e){
        callback({'error': e.toString()});
    }
    timer = setTimeout(function(){
        callback({'error': 'Timeout Error'});
    }, timeout);
}
/**
 * Make a promise chain of code execution
 * @param {Object} pars (object that we can change after the code)
 * @param {Object} reqParams (object containing request parameters)
 * @param {String} strNameVar (name of the object)
 * @param {Array} arrCodes (an array of strings with the code)
 * @param {String} tenantId
 * @param {Object} user to pass as a variable to pre/post code
 * @returns {*}
 */
function execCode(pars, reqParams, strNameVar, body, arrCodes, tenantId, user, userId, application){
    // create an empty promise to begin the chain
    var deferred = Q.defer(), strCode = '', dlm = '';
    if(tenantId){
        context.tenantId = tenantId;
    }
    if(user){
        context.myuser = user;
    } else {
        user = context.myuser;
    }
    context.userId = userId || 'admin';
    context.application = application;
    // construct the code for Q.all
    if (strNameVar == 'params') {
        arrCodes.forEach(function (operation, index) {
            strCode += dlm + '(function(){var d = Q.defer(); var terminateFilter = function(p){return d.resolve(p);};' +
            'var applicationError = function(err) { return {"application":err} }; var abortFilter = function(p){return d.reject(p || "Unknown error");}; ' + operation + '; preExecutionFilter(params, body) ;return d.promise;})()';
            dlm = ',';
        });
    } else {
        arrCodes.forEach(function (operation, index) {
            strCode += dlm + '(function(){var d = Q.defer(); var terminateFilter = function(p){return d.resolve(p);};' +
            'var applicationError = function(err) { return {"application":err} }; var abortFilter = function(p){return d.reject(p || "Unknown error");}; ' + operation + '; postExecutionFilter(response) ;return d.promise;})()';
            dlm = ',';
        });
    }
    // construct the code
    var code = '(function(){var D = Q.defer();var '+strNameVar+' = '+JSON.stringify(pars)+';';
    if (strNameVar == 'params') {
        code += "function getParameter(key) { "
        +"var paramData = params.filter(function(p){"
        +    "return (p.name == key || p.alias == key)"
        + "})[0];"
        + "return paramData ? paramData.value : null;"
        + "}"
        + "function setParameter(key, value) {"
        +    "return params.map(function(p){"
        +        "if (p.name == key || p.alias == key) {"
        +            "p.value = value;"
        +        "}"
        +        "return p;"
        +    "});"
        + "}"
        + "function addParameter(param) {"
        +    "params.push(param);"
        + "}"
        + "function setBody(data) {"
        +    "body = data;"
        + "}";

    }
    if (reqParams) {
        code += 'var params = '+JSON.stringify(transformToObject(reqParams))+';';
    }
    if (body) {
        code += 'var body = '+JSON.stringify(transformToObject(body))+';';
    } else {
        code += 'var body = null;'
    }

    if (user) {
        code += 'var $user = '+JSON.stringify(user)+';';
    }
    code += 'Q.all(['+strCode+']).spread(function(res){';
    if (strNameVar == 'params'){
        code += 'return D.resolve({"params" : params, "body" : body});})';
    } else {
       code += ' return D.resolve(response);})';
    }

       code += '.fail(function(err){return D.resolve({"error" : err});});return D.promise;})()';
    //console.log(code);

    runCode(code, function(result) {
        //console.log("Result:");
        //console.log(result);
        if(result == null){
            return deferred.reject('Result is null for '+strNameVar);
        }
        if(typeof result == 'string' || (result.error && typeof result == 'object')){
            if ((result.error) && (!result.error.application))  {
                result =  result.error.toString();
            } else {
                result = result.error;
            }
            return deferred.reject(result);
        } else {
            return deferred.resolve(result);
        }
    });
    return deferred.promise;
}

module.exports.execCode = execCode;
