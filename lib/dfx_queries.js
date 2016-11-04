/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var SETTINGS          = require('./dfx_settings'),
    sysdbName         = SETTINGS.system_database_name,
    mdbw,
    jade              = require('jade'),
    fs                = require('graceful-fs'),
    path              = require('path'),
    xml2js            = require('xml2js'),
    extend            = require('node.extend'),
    request           = require('request'),
    sysadmin          = require('./dfx_sysadmin'),
    async               = require('async'),
    user_definition   = require('./dfx_user_definition'),
    endpoints         = require('./utils/endpoints'),
    ARM               = require('./authRequest_mod').request,
    dbTools           = require('./dbtool'),
    uuid              = require('node-uuid'),
    Q                 = require('q'),
    _                 = require('underscore'),
    CHANNELS          = require('./channels').channels,
    DB_TENANTS_PREFIX = SETTINGS.databases_tenants_name_prefix,
    Query             = {},
    log               = new (require('./utils/log')).Instance({label: 'QUERIES'}),
    sharedCatalogName = SETTINGS.sharedCatalogName,
    pmx = require('pmx');

if ( SETTINGS.studio ) {
    var versioning        = require('./dfx_queries_versioning');
}
var helper            = require('./dfxquery-helper');
var cache;

Query.init = function( o ) {
    mdbw = o.storage;
    cache = o.cache;
    delete Query.init;
};

var api = {
    create: function (parsed) {
        var D = Q.defer();
        Query.createNew(parsed.queryParameters, parsed.req, function (err, data) {
            return err
                ? D.reject(err)
                : D.resolve('API Route created!')
        });
        return D.promise;
    },

    delete: function (parsed) {
        var D = Q.defer();
        Query.deleteQuery(parsed.queryParameters.queryName, parsed.req, function () {
            return D.resolve("API service object " + parsed.queryParameters.queryName + " has been successfully deleted");
        }, parsed.queryParameters.applicationName);
        return D.promise;
    },

    deleteItem: function (parsed) {
        var D = Q.defer();
        Query.deleteQueryItem(parsed.queryParameters, parsed.req, function (err) {
            if (!err) {
                return D.resolve("API route item " + parsed.queryParameters.apiRouteItemName + " has been successfully deleted");
            } else {
                return D.reject(err);
            }
        });
        return D.promise;
    },

    updateItem: function (parsed) {
        var D = Q.defer();
        Query.updateQueryItem(parsed.queryParameters, parsed.req, function (err) {
            if (!err) {
                return D.resolve("API route item " + parsed.queryParameters.newApiRouteItemName + " has been successfully updated");
            } else {
                return D.reject(err);
            }
        });
        return D.promise;
    },

    update: function (parsed) {
        var D = Q.defer();
        Query.set(parsed.queryName, parsed.queryParameters, parsed.req, function (err, data) {
            return err
                ? D.reject(err)
                : D.resolve("API route " + parsed.queryName + " has been successfully updated");
        });
        return D.promise;
    },
    updateNew: function (parsed) {
        var D = Q.defer();
        Query.setNew(parsed.queryName, parsed.queryParameters, parsed.req, function (data) {
            return !data
                ? D.reject("Something went wrong during editing API route " + parsed.queryName)
                : D.resolve("API route " + parsed.queryName + " has been successfully updated");
        });
        return D.promise;
    },

    saveas: function (parsed) {
        var D = Q.defer();
        Query.saveAs(parsed.queryName, parsed.queryParameters, parsed.req, function (err, data) {
            return err
                ? D.resolve(err)
                : D.resolve("API route has been successfully created");
        });
        return D.promise;
    },

    recover: function (parsed) {
        var D = Q.defer();
        Query.recover(parsed.queryParameters.name, parsed.req, function (err, data) {
            return err
                ? D.reject(err)
                : D.resolve('API Route was recovered!')
        });
        return D.promise;
    },

    createCategory: function (parsed) {
        var D = Q.defer();
        Query.createNewCat(parsed.queryParameters, parsed.req, function (err, data) {
            return err
                ? D.resolve(err)
                : D.resolve('Category has been successfully created');
        });
        return D.promise;
    },

    updateCategory: function (parsed) {
        var D = Q.defer();
        Query.setCat(parsed.name, parsed.queryParameters, parsed.req, function (err, data) {
            return err
                ? D.resolve(err)
                : D.resolve('Category has been successfully updated');
        });
        return D.promise;
    },

    removeCategory: function (parsed) {
        var D = Q.defer();
        Query.deleteCat(parsed.queryParameters, parsed.req, function () {
            return D.resolve('Category ' + parsed.queryParameters.name + ' has been successfully deleted');
        });
        return D.promise;
    },

    createService: function (parsed) {
        var D = Q.defer();
        Query.createNewService(parsed.queryParameters, parsed.req, function (err, data) {
            return err
                ? D.resolve(err)
                : D.resolve('API route service has been successfully created');
        });
        return D.promise;
    },

    updateService: function (parsed) {
        var D = Q.defer();
        Query.setService(parsed.name, parsed.queryParameters, parsed.req, function (err, data) {
            return err
                ? D.resolve(err)
                : D.resolve('API route service has been successfully updated');
        });
        return D.promise;
    },

    removeService: function (parsed) {
        var D = Q.defer();
        Query.deleteService(parsed.queryParameters.serviceName, parsed.req, function () {
            return D.resolve('API route service ' + parsed.queryParameters.serviceName + ' has been successfully deleted');
        });
        return D.promise;
    },

    validateServiceName : function (parsed) {
        return Query.validateServiceName(parsed.req, parsed.queryParameters.name, parsed.queryParameters.applicationName);
    },

    validateServiceUrl : function (parsed) {
        return Query.validateServiceUrl(parsed.req, parsed.queryParameters.name, parsed.queryParameters.applicationName, parsed.queryParameters.uuid);
    },

    validateApiRoute:  function (parsed) {
        var D = Q.defer();
         Query.validateApiRoute(parsed.queryParameters.app, parsed.queryParameters.apiRoutes, parsed.queryParameters.queryName, parsed.req)
            .then(function(data){
                if (data.length > 0) {
                    var counter = 0;
                    async.each(data, function (val,cb) {
                            if (val) {
                                return D.resolve("API route with name - " + parsed.queryParameters.apiRoutes[counter] + " already exists in application " + parsed.queryParameters.app);
                            }
                            cb();
                            counter++;
                        },
                        function () {
                            return D.resolve();
                        });
                } else {
                    return D.resolve();
                }
            })
            .fail(function(err){
                return D.resolve(err);
            });
        return D.promise;
    },

    clearCache: function(parsed) {
        return Query.clearCache(parsed.queryParameters, parsed.req.session);
    }
};

Query.api = endpoints.json({
    parser: function (req) {
        return {
            action: req.params.action,
            data:   {
                queryName:       req.params.queryName,
                queryParameters: req.body,
                name:            req.params.name,
                req:             req
            }
        }
    },
    action: api,
    log:    log
});

Query.clearCache = function (o, req) {
    switch (o.type) {
        case 'user' : var key = req.tenant.id + "_" + req.user.id + "_" + o.application + "_" + o.name;  return cache.del(key); break;
        case 'tenant' : var key = req.tenant.id + "_" + o.application + "_" + o.name;  return cache.del(key); break;
    }
};

Query.list = function (req, res) {
    if (req.body.filter) {
        Query.getAllWithFilter(req.body.filter, req, function (arr_queries) {
            res.end(JSON.stringify({
                queries: arr_queries
            }));
        });
    } else {
        Query.getAll(req, function (arr_queries) {
            res.end(JSON.stringify({
                queries: arr_queries
            }));
        });
    }
};

Query.listByApp = function (req, res) {
    var applicationDbName = getAppDbName(req.params.applicationName);

    var response = {queries: []},
        filter   = {application: applicationDbName};

    Query.getAllWithFilter(filter, req, function (arr_queries) {
        arr_queries.map(function (query) {
            response.queries.push({
                name: query.name
            });
        });
        res.end(JSON.stringify(response));
    });
};

Query.listByAppDetailed = function (req, res) {
    var applicationDbName = getAppDbName(req.params.applicationName);
    if (applicationDbName === '__shared__') applicationDbName = "";

    var response = {queries: {}},
        filter   = {application: applicationDbName};

    Query.getAllWithFilter(filter, req, function (arr_queries) {
        arr_queries.map(function (query) {
            if (response.queries[query.category]==null) {
                response.queries[query.category]=[];
            }
            response.queries[query.category].push({
                name: query.name,
                category: query.category,
                service: query.service,
                description: query.description,
                apiRoutes: query.apiRoutes
            });
        });
        res.end(JSON.stringify(response));
    });
};

Query.search = function (req, res) {
    Query.getAllWithFilter({'name': {$regex: req.query.q, $options: 'i'}}, req, function (arr_queries) {
        if (!arr_queries) {
            return res.end("{queries:[]}");
        }
        res.end(JSON.stringify({
            queries: arr_queries
        }));
    });
};

Query.searchByApp = function (req, res) {
    var applicationDbName = getAppDbName(req.params.applicationName),
        filter            = {},
        $or               = [
            {
                name: {
                    $regex:   req.query.q,
                    $options: 'i'
                }
            },
            {
                description: {
                    $regex:   req.query.q,
                    $options: 'i'
                }
            }
        ];
    if (applicationDbName) {
        filter.$and = [{$or: $or}, {$or: [{application: applicationDbName}, {application: ''}]}];
    } else {
        filter.$or         = $or;
        filter.application = applicationDbName;
    }

    Query.getAllWithFilter(filter, req, function (arr_queries) {
        if (!arr_queries) {
            return res.end("{queries:[]}");
        }
        res.end(JSON.stringify({
            queries: arr_queries
        }));
    });
};

Query.getOneQuery = function (req, res) {
    Query.get(req.params.queryName, req, function (query) {
        if (!query) {
            return res.end("{error:'Not Found this API Route'}");
        }
        if (query.settings.url == "") {
            return res.end("{error:'Cannot execute this API Route because url is empty'}");
        }
        res.end(JSON.stringify({
            query: query
        }));
    });
};

Query.getItem = function (req, res) {
    Query.get(req.params.queryName, req, function (query) {
        res.end(JSON.stringify({
            query: query
        }));
    });
};

/**
 * get auth options for db
 * @param tenantId
 * @returns {*}
 */
Query.getAuthDB = function (tenantId) {
    return sysadmin.tenant.get(tenantId)
        .then(function (tenant) {
            if (tenant.databaseTokens) {
                return {
                    'user':            tenantId,
                    'pass':            Object.keys(tenant.databaseTokens)[0],
                    'sendImmediately': true
                };
            }
        })
        .fail(function (err) {
            log.error(err)
        });
};

/**
 * get DB/collName Params
 * @param req
 * @param res
 */
Query.getDBParams = function (req, res) {
    if (!req.query.dbName || !req.query.clName) {
        resultEnd(res, {error: 'Not set DB Name or collection Name!', typeError: 'request'});
        return;
    }

    var dbName     = req.query.dbName,
        clName     = req.query.clName,
        tenantId   = req.user.tenantid,
        driverName = req.query.dbdriver,
        options    = {};
    options.method = 'get';
    if (driverName == 'mongodb') {
        options.url = req.protocol + '://' + req.get('host') + '/database/getOne/' + dbName + '/' + clName + '/{}';
        Query.getAuthDB(req.user.tenantid)
            .then(function (auth) {
                options.auth = auth;
                request(options, function (err, response, body) {
                    if (err) {
                        resultEnd(res, {error: 'Request error!', typeError: 'request'});
                    } else {
                        body = JSON.parse(body);
                        if (body.data) {
                            resultEnd(res, {params: Object.keys(body.data)}, {"Access-Control-Allow-Origin": "*"});
                        }
                    }
                });
            });
    } else {
        getDBDriverParams({
            tenantid:   req.user.tenantid,
            driverName: driverName,
            dbName:     dbName,
            clName:     clName
        })
            .then(
            function (result) {
                if (result['cols']) {
                    var obj = Object.keys(result['cols']);
                    resultEnd(res, {params: obj}, {"Access-Control-Allow-Origin": "*"});
                } else {
                    resultEnd(
                        res, {
                            error:     'Unable to set the parameters for db table: ' + clName,
                            typeError: 'app'
                        }
                    );
                }
            },
            function (error) {
                resultEnd(res, {error: error.toString(), typeError: 'request'});
            }
        )
            .done();
    }
};

/**
 * get Query By Name from DB
 * @param queryName
 * @param tenantid
 * @param setparams
 * @param setreqbody
 * @param req
 * @returns {*}
 */
Query.getQueryByName = function (queryName, tenantid, setparams, setreqbody, req) {
    var options = {};

    // if setparams - extend params with new params
    var setParameters = function (pars, source) {
        var arrParams = [],
            type      = (source == 'ext') ? 'request' : '',
            operation = 'eq',
            isSetPars = (pars && pars.length) ? 1 : 0,
            obj       = {};

        for (key in setparams) {
            if (setparams.hasOwnProperty(key)) {
                //obj = {'name': setparams[key].name, 'value': setparams[key]};
                obj = {'name': key, 'value': setparams[key]};
                if (!isSetPars) {
                    obj.type      = type;
                    obj.operation = operation;
                }
                arrParams.push(obj);
            }
        }
        //return extend(true, [], pars, arrParams);

        // map params from dq.setParameters to params from Query definition
        if (pars && pars.length) {
            pars.forEach(function (param, index) {
                for (var i = 0; i < arrParams.length; i++) {
                    if (param.name == arrParams[i].name) {
                        pars[index].value = arrParams[i].value;
                    }
                }
            });
        }

        // treat params that do not exist in Query definition
        if (pars && pars.length) {
            arrParams.forEach(function (arrParam, index) {
                var exists = false;
                for (var i = 0; i < pars.length; i++) {
                    if (arrParam.name == pars[i].name) {
                        exists = true;
                    }
                }
                if (!exists) {
                    pars.push(arrParam);
                }
            });
        } else {
            pars = arrParams;
        }

        return pars;
    };

    // compile params, set options.params, options.headers
    var setOptsParams = function (pars, source, typeRequest, dialect, url) {
        var params = compileParameters(pars, source, typeRequest, dialect, url);
        if (params.headers) {
            options.headers = params.headers;
        }
        if (params.urlParams) {
            options.urlParams = params.urlParams;
        }
        if (params.params) {
            options.params = params.params;
        } else if (options.params) {
            delete options.params;
        }
    };

    return Query.getOne(queryName, tenantid, req)
        .then(function (doc) {
            var source      = doc.source,
                url         = doc.settings.url,
                typeRequest = 'get',
                auth        = {'auth': 'none'},
                params      = (doc.parameters.length) ? doc.parameters : [],
                urlRandom   = doc.settings.urlrandom || 0,
                dbdriver    = doc.settings.dbdriver || '',
                appexpr     = (doc.appexpr.length) ? doc.appexpr : [],
                dbnames     = (doc.settings.dbnames) ? doc.settings.dbnames : {},
                reqbody     = '',
                soap        = null,
                isSql       = url.match(/\/sql$|\/rm/);

            // type request (get/post)
            if (doc.settings.typerequest) {
                var arrTypeReq = doc.settings.typerequest.split('_');
                if (arrTypeReq[1]) {
                    typeRequest = arrTypeReq[1].toLowerCase();
                }
            }

            // auth
            if (doc.settings.authentication != 'none') {
                auth.auth = doc.settings.authentication;
            }

            // soap
            if (doc.settings.soap) {
                soap = doc.settings.soap;
            }

            // reqbody and post
            if (typeRequest == 'post') {
                // set reqbody
                if (doc.settings.postrequestbody) {
                    reqbody = doc.settings.postrequestbody;
                }
                // if we set reqbody not from definition screen - set this reqbody
                if (setreqbody != '') {
                    if (typeof setreqbody == 'string' && setreqbody.indexOf('<') > -1) {
                        doc.format = 'xml';
                    }
                    reqbody = setreqbody;
                }
                // check post body if we want to put document in db
                if (dbdriver == 'mongodb' && typeof reqbody == 'object') {
                    if (Object.keys(reqbody).length != 0) {
                        for (var key in reqbody) {
                            if (reqbody.hasOwnProperty(key) && reqbody[key] === '') {
                                return 'The Request Body contains empty fields!';
                            }
                        }
                    }
                }
            }

            // set options
            options = {
                url:       url,
                method:    typeRequest,
                source:    source,
                urlRandom: urlRandom,
                headers:   {},
                params:    '',
                auth:      auth,
                appexpr:   appexpr,
                reqbody:   reqbody,
                format:    doc.format,
                dbnames:   dbnames,
                application: doc.application
            };

            // if soap
            if (soap) {
                options.soap = soap;
            }
            // if setparams - extend params
            if (setparams) {
                if (soap) {
                    try {
                        var paramsJson = JSON.parse(soap.paramsJson);
                        for (var i in setparams) {
                            if (setparams.hasOwnProperty(i)) {
                                if (typeof paramsJson[i] != 'object') {
                                    if (paramsJson[i]) {
                                        paramsJson[i] = setparams[i];
                                    }
                                }

                            }
                        }
                        options.soap.params = toXML(paramsJson);
                    } catch (e) {
                    }
                } else {
                    if (!_.isArray(setparams) || setparams.length == 0) {
                        params = setParameters(params, source);
                    } else {
                        params = setparams;
                    }
                }
            }
            if (source == 'db') {
                if (url.match(/\/update|\/rm/) && !params.length) {
                    return 'You must set the parameters to update the fields in the database!';
                }
            }

            return user_definition.api.getUser({
                req: req,
                userId: req.user.userid,
                tenantId: tenantid,
                applicationName : options.application
            }).then(function (user) {
                options.user = user;

                // postcode
                if (doc.postcode && doc.postcode.length) {
                    options.postcode = doc.postcode;
                }

                // precode
                if (!params.length && !doc.precode.length) {
                    return options;
                }
                if (doc.precode && doc.precode.length) {
                    //fill array with code
                    var arrCodes = [];
                    doc.precode.forEach(function (el, index) {
                        //if (el.code.indexOf('terminateFilter(') == -1) {
                        //    el.code += ';terminateFilter(params);'
                        //}
                        arrCodes.push(el.code);
                    });

                    return helper.execCode(params, '', 'params', self.opts.reqbody, arrCodes, tenantid, user)
                        .then(function (o) {
                            setOptsParams(o, source, typeRequest, dbdriver, url);
                            return options;
                        })
                        .fail(function (err) {
                            log.error(err);
                            return err;
                        });
                } else {
                    setOptsParams(params, source, typeRequest, dbdriver, url);
                    return options;
                }
            });
        });
};

Query.getQueryByApiRoute = function(req, appName, apiRoute) {
    var apiRouteKey = "apiRoutes." + apiRoute;
    var query = {};
    query.application = appName;
    query[apiRouteKey] = { $exists: true };
    return mdbw.get(DB_TENANTS_PREFIX + req.user.id, 'dataqueries', query)
        .then(function (docs) {
            if (docs.length > 0) {
                var currentApiRoute = docs[0].apiRoutes[apiRoute];
                var obj = {
                    queryName: '',
                    typeRequest: currentApiRoute.settings.typerequest.replace('HTTP_', ''),
                    source: currentApiRoute.settings.source,
                    tenantid: req.user.id,
                    auth: {auth: currentApiRoute.settings.authentication},
                    url: currentApiRoute.settings.url,
                    urlRandom: currentApiRoute.settings.urlrandom,
                    reqbody: currentApiRoute.settings.postrequestbody,
                    dbnames: currentApiRoute.settings.dbnames,
                    format: currentApiRoute.format,
                    data: currentApiRoute.settings.parameters || '',
                    application: appName,
                    _: Date.now()
                }
                return Q.resolve(obj);
            } else {
                return Q.reject("Not found apiRoute - " + req.url + "!");
            }
        });
}

Query.validateServiceName = function(req, serviceName, appName) {
    var D = Q.defer();
     (!serviceName)  ?  D.resolve("Service name can't be empty")
                :  mdbw.exists(DB_TENANTS_PREFIX + req.user.tenantid, 'dataqueries', {"name" : serviceName, "application" : appName}).then(function(exist){
                        exist ? D.resolve("Current service name already exists") : D.resolve();
                    });
    return D.promise;
},

Query.validateServiceUrl = function(req, url, appName, uuid) {
    var D = Q.defer();
    var regex = /[a-z0-9A-Z_-]+(\/{1}[a-z0-9A-Z_-]+){0,}$/;
    var result = url.match(new RegExp(regex));
        if ((!url) || (!result) || (result.index != 0)) {
            D.resolve('Service url name incorrect');
        } else {
            var query = {};
            query["apiRoutes." + url] = { $exists: true };
            query.application = appName;
            if (uuid) query["apiRoutes." + url + ".uuid"] = {"$ne": uuid};
            mdbw.exists(DB_TENANTS_PREFIX + req.user.tenantid, 'dataqueries', query).then(function(exist){
                exist ? D.resolve("Current service url already exists") : D.resolve();
            });
        }
    return D.promise;
}

Query.validateApiRoute = function(app, apiRoutes, queryName, req) {
    var tasks = [];
    apiRoutes.forEach(function(apiRoute){
        var apiRouteKey = "apiRoutes." + apiRoute;
        var query = {};
        query.application = app;
        query[apiRouteKey] = { $exists: true };
        query.name = {$ne : queryName};
        tasks.push(mdbw.exists(DB_TENANTS_PREFIX + req.user.tenantid, 'dataqueries', query));
    });
    return Q.all(tasks);
}

Query.getDQObjByApiRoute = function ( tenantid, appname, route ) {

    if ( appname === '_shared' ) appname = '';

    var apiRouteKey = "apiRoutes." + route;
    var query = {};
    query.application = appname;
    query[apiRouteKey] = { $exists: true };

    return mdbw.get(
        DB_TENANTS_PREFIX + tenantid,
        'dataqueries',
        query
    )
    .then(function (docs) {

        if ( !docs.length ) return null;
            docs[0].apiRoutes[route].name = docs[0].name;
        return docs[0].apiRoutes[route];
    });
}

// _________________________START QUERY EXECUTE__________________________________

Query.executeApiRoute = function (req, res) {
    if (!req.user) {
        req.user = {};
        req.user.tenantid = req.body.userInfo.tenantId;
        req.user.userid = req.body.userInfo.userId;
    }
    var tenantid = req.user.tenantid || req.user.id,
        apiRoute = req.params[0],
        appName  = req.params.appname,
        parameters = (req.method == 'POST') ? req.body.params : req.query.data,
        body = (req.method == 'POST') ? req.body.body : '',
        cache = (req.method == 'POST') ? req.body.cache : req.query.cache;

    Query.getDQObjByApiRoute(tenantid, appName, apiRoute).then(function(docObj){

        if ( docObj === null ) {
            res.status(404).send("Not found apiRoute - " + req.url + "!");
            return;
        }

        // replace params form View
        if (!_.isEmpty(parameters)) {
            if (docObj.parameters.length > 0) {
                docObj.parameters.forEach(function(p, index) {
                    if ((parameters[p.name]) || (parameters[p.alias])) {
                        docObj.parameters[index].value = (parameters[p.name]) ? parameters[p.name] : parameters[p.alias];
                    }
                });
            }
        }

        var obj = {
            queryName   : '',
            typeRequest : docObj.settings.typerequest.replace('HTTP_',''),
            source      : docObj.settings.source,
            auth        : { auth: docObj.settings.authentication},
            url         : docObj.settings.url,
            urlRandom   : docObj.settings.urlrandom,
            reqbody     : !_.isEmpty(body) ? body : docObj.settings.postrequestbody,
            appexpr:   docObj.appexpr,
            precode:   docObj.precode,
            postcode:  docObj.postcode,
            dbnames     : docObj.settings.dbnames,
            format      : docObj.format,
            data        : docObj.parameters,
            application : appName,
            cache:     cache ? cache.cache : docObj.settings.cache || 'none',
            cacheTimeExpiry:     cache ? cache.cacheTimeExpiry : 'none',
            name:      apiRoute || '',
            _: Date.now()
        };

        var o = {
            "action" : "get",
            "applicationName" : appName,
            "provider" : docObj.settings.authentication,
            "tenant" : tenantid
        }
        // Set Auth none if schema equals "public/rest"
        sysadmin.provider.get(o).then(function(data){
            if ((data) && (data.schema) && ((data.schema === 'public/rest') || (data.schema === 'none'))) {
                obj.auth  = {"auth" :'none'};
            }
            if (docObj.settings.typerequest === 'HTTP_POST') {
                req.method = 'POST';
                req.body = obj;
            } else if (docObj.settings.typerequest === 'HTTP_PUT') {
                req.method = 'PUT';
                req.body = obj;
            } else {
                req.method = 'GET';
                req.query = obj;
            }

            return Query.execute(req, res);
        });
    })
    .done(); // TODO return fails to client ( use endpoints )
};

/**
 *
 * @param req
 * @param res
 * @returns {ExecuteQuery}
 */
Query.execute = function (req, res) {
    return new ExecuteQuery(req, res);
};

/**
 * ExecuteQuery - prepare parameters for request and execute Query
 * @param req
 * @param res
 * @constructor
 */
function ExecuteQuery(req, res) {
    var self       = this;
    var reqParams  = ((req.method == 'POST') || (req.method == 'PUT')) ? req.body : req.query;
    this.opts      = {
        tenantid:  reqParams.tenantid || req.user.tenantid || req.user.id,
        userid:    req.user.userid || 'admin',
        url:       reqParams.url || '',
        params:    reqParams.data || [],
        appexpr:   reqParams.appexpr || [],
        precode:   reqParams.precode || [],
        postcode:  reqParams.postcode || [],
        source:    reqParams.source || '',
        cache:     reqParams.cache || 'none',
        cacheTimeExpiry : reqParams.cacheTimeExpiry || 'none',
        name:      reqParams.name || '',
        method:    (reqParams.typeRequest) ? reqParams.typeRequest.toLowerCase() : 'get',
        urlRandom: reqParams.urlRandom || 0,
        reqbody:   reqParams.reqbody || '',
        dbnames:   reqParams.dbnames || {},
        auth:      reqParams.auth || '',
        queryName: reqParams.queryName || '',
        format:    reqParams.format,
        soap:      reqParams.soap || '',
        application: reqParams.application
    }

    req.user.tenantId = this.opts.tenantid;
    req.user.userid = this.opts.userid;

    this.reqParams = this.opts.params;
    this.res       = res;
    this.dialect   = this.parsedUrl = null;
    // make user object accessible to pre/post code
    if (this.opts.precode.length || this.opts.postcode.length) {
        user_definition.api.getUser({
            req: req, userId: req.user.userid || req.session.user.id || this.opts.userid,
            tenantId: this.opts.tenantid, applicationName: reqParams.application
        }).then(function (user) {
            self.opts.user = user;
            if (self.opts.queryName) {
                self.prepareQueryByName(req);
            } else {
                self.prepareQuery();
            }
        })
        .fail(function(error){
            log.error('post/pre code branch error : ', error);
        })
    } else {
        if (self.opts.queryName) {
            self.prepareQueryByName(req);
        } else {
            self.prepareQuery();
        }
    }
};

ExecuteQuery.prototype.setDbOpts = function () {
    var self   = this,
        errObj = [];
    if (self.opts.source == 'db') {
        var parsedUrl  = parseDbUrl(this.opts.url);
        self.parsedUrl = parsedUrl;
        if (!parsedUrl.action) {
            errObj.push('Not set action.');
        }
        if (!parsedUrl.dialect) {
            errObj.push('Not set database driver.');
        } else {
            self.dialect = parsedUrl.dialect;
        }
    }
    return errObj;
};

/**
 * get query from database and implement (query by name)
 */
ExecuteQuery.prototype.prepareQueryByName = function (req) {
    var self = this;
    Query.getQueryByName(self.opts.queryName, self.opts.tenantid, self.opts.params, self.opts.reqbody, req)
        .then(function (opts) {
            if (typeof opts == 'string') {
                self.abortQueryExecution({'name': opts, 'type': 'app'});
                return;
            }
            self.opts  = extend(true, {}, self.opts, opts);
            var errObj = self.setDbOpts();
            if (errObj.length) {
                self.abortQueryExecution({'name': errObj.join('; '), 'type': 'app'});
                return;
            }
            self.implement();
        })
        .fail(function (e) {
            self.abortQueryExecution({'name': e.message, 'type': 'app'});
        });
};

/**
 * set parameters, execute pre code and implement (definition screen)
 */
ExecuteQuery.prototype.prepareQuery = function () {
    var self   = this,
        o      = self.opts,
        errObj = self.setDbOpts();
    if (errObj.length) {
        self.abortQueryExecution({'name': errObj.join('; '), 'type': 'app'});
        return;
    }

    if (!o.params.length && !o.precode.length) {
        self.implement();
        return;
    }
    if (o.precode.length) {
        //fill array with code
        var arrCodes = [];
        o.precode.forEach(function (el, index) {
            //if (el.code.indexOf('terminateFilter(') == -1) {
            //    el.code += ';terminateFilter(params);'
            //}
            arrCodes.push(el.code);
        });
        // execute precode
        helper.execCode(self.opts.params, '', 'params', self.opts.reqbody, arrCodes, self.opts.tenantid, self.opts.user, self.opts.userid, self.opts.application)
            .then(function (o) {
                self.opts.params = o.params;
                self.opts.reqbody = o.body;
                self.setOptsParameters();
                self.implement();
            })
            .fail(function (err) {
                self.abortQueryExecution({'name': err, 'type': 'app'});
            });
    } else {
        self.setOptsParameters();
        self.implement();
    }
};

/**
 * set params for definition screen
 */
ExecuteQuery.prototype.setOptsParameters = function () {
    var self   = this,
        params = compileParameters(self.opts.params, self.opts.source, self.opts.method, self.dialect, self.opts.url);
    if (params.headers) {
        self.opts.headers = params.headers;
    }
    self.opts.urlParams = '';
    if (params.urlParams) {
        self.opts.urlParams = params.urlParams;
    }
    self.opts.params = '';
    if (params.params) {
        self.opts.params = params.params;
    }
};

/**
 * prepare all options and call executeDo
 */
ExecuteQuery.prototype.implement = function () {
    var self = this,
        o    = self.opts;
    if (!implement[o.source]) {
        self.abortQueryExecution({
            'name': 'the function [implement.' + o.source + '] is not implemented!',
            'type': 'app'
        });
    }
    implement[o.source](o, self);
};

// implemented depending on the source
var implement = {};
// external source
implement.ext = function (o, self) {
    var parseUrl;
    // params with type = url
    if (o.urlParams) {
        if (o.urlParams.indexOf('{') == -1) {
            o.url = o.urlParams
        } else {
            var regText = new RegExp('{.*}', "g");
            o.url       = o.url.replace(regText, "");
        }
    }
    // params
    if (o.params != "") {
        o.url += '?' + o.params;
    }
    if (!o.headers) {
        o.headers = {};
    }
    // post
    if (((o.method == 'post') || (o.method == 'put')) && o.reqbody != '') {
        o["form"] = o.reqbody;
    }
    // xml
    if (o.format == 'xml') {
        o["headers"]["Content-Type"] = "text/xml; charset=utf-8";
        if (o["form"]) {
            o["headers"]["Content-Length"] = o["form"].length;
        }
        o["headers"]["Connection"] = "close";
    } else {
        o["headers"]["Content-Type"] = "application/json; charset=utf-8";
    }

    o.params = '';
    // if add random
    if (o.urlRandom == '1') {
        parseUrl = require('url').parse(o.url, true);
        var rand = Math.floor(Math.random() * 100000000).toString(),
            addD = (Object.keys(parseUrl.query).length != 0) ? '&' : '?';

        o.url += addD + '_dfxrand=' + rand;
    }

    // provider or simple external url
    if (o.auth.auth != 'none') { // provider
        // execute with provider
        self.executeWithProvider({
            'userid'  : o.userid,
            'tenantid': o.tenantid,
            'provider': o.auth.auth,
            'applicationName': o.application,
            'method':   o.method,
            'url':      o.url,
            'format':   o.format,
            'form':     (o.form) ? o.form : ''
        }, {'source': o});

    } else { // simple external url

        // do execute
        self.executeDo({
            'url':     o.url,
            'method':  o.method,
            'params':  (o.params) ? o.params : '',
            'headers': (o.headers) ? o.headers : {},
            'format':  o.format,
            'form':    (o.form) ? o.form : ''
        }, {'source': o});

    }
};

//soap
implement.soap = function (o, self) {
    var soapJSON = o.soap;
    var soapURL  = require('url').parse(soapJSON.url, true);
    var http;
    if (soapURL.protocol.indexOf('https') > -1) {
        http = require('https');
    } else {
        http = require('http');
    }
    //soapJSON.url = 'https://50.97.60.187:9443/teamworks/webservices/CHS1/HRProcessinboundWS.tws';
    var soapXML =
            '<?xml version="1.0" encoding="utf-8"?>' +
            '<soap:Envelope ' +
            'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
            'xmlns:xsd="http://www.w3.org/2001/XMLSchema" ' +
            'xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
            '<soap:Body>' +
            '<' + soapJSON.operation + ' xmlns="' + o.soap.ns + '">' +
            soapJSON.params +
            '</' + soapJSON.operation + '>' +
            '</soap:Body>' +
            '</soap:Envelope>';

    //console.log(soapXML);

    soapJSON.headers = {
        "SOAPAction":   soapJSON.soapAction,
        "Content-Type": "text/xml; charset=utf-8",
        "Accept":       "*/*"
    };

    var httpOptions                       = {
        host:    soapURL.hostname,
        port:    soapURL.port || 80,
        method:  soapURL.method || 'POST',
        path:    soapURL.pathname,
        headers: soapJSON.headers
    };
    httpOptions.headers["Content-Length"] = Buffer.byteLength(soapXML);
    httpOptions.headers["Connection"]     = "close";
    httpOptions.body                      = soapXML;
    //console.log(httpOptions)

    doHTTP(httpOptions,
        function (d) {
            d.data = d.data.replace(/&lt;/g, '<');
            d.data = d.data.replace(/&gt;/g, '>');
            //console.log(d.data)
            xml2js.parseString(d.data, function (e, parsed) {
                body = JSON.stringify(parsed);
                self.resultExecution(body);
            });
        },
        function (e) {
            console.log('error:', e)
            self.abortQueryExecution({'name': e, 'type': 'request'})
        }
    );
    function doHTTP(options, success, error) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        var req                                  = http.request(options, function (res) {
            var data          = '';
            self.opts.headers = res.headers;
            res.setEncoding(options.encoding || 'utf8');
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function () {
                success({data: data, response: res});
            });
        });

        if (typeof options.body != 'undefined') req.write(options.body);
        req.end();

        req.on('error', function (e) {
            console.log(e)
            error('HTTP ERROR: ' + e.message);
        });
    }
};

//db
implement.db = function (o, self) {
    if (o.method == 'get') { //get
        if (!self.parsedUrl.database) {
            self.abortQueryExecution({'name': 'Not set database!', 'type': 'app'});
            return;
        }
        if (!self.parsedUrl.tblName) {
            self.abortQueryExecution({'name': 'Not set db table (collection)!', 'type': 'app'});
            return;
        }
        o.url = o.url + '/' + o.params;
    } else { // post

        if (self.dialect == 'mongodb') {
            if (self.parsedUrl.action == 'put' || self.parsedUrl.action == 'rm' || self.parsedUrl.action == 'update') {
                if (!o.reqbody && self.parsedUrl.action != 'rm') {
                    self.abortQueryExecution({'name': 'Request Body is empty!!', 'type': 'app'});
                    return;
                }
                var newReqBody = {};
                if (!o.reqbody['database'] && !o.reqbody['collection']) {
                    if (!o.dbnames['database'] || !o.dbnames['collection']) {
                        self.abortQueryExecution({'name': 'Not set database or collection!', 'type': 'app'});
                        return;
                    }
                    if (self.parsedUrl.action == 'put') {
                        newReqBody["document"] = o.reqbody;
                    }
                    if (self.parsedUrl.action == 'update') {
                        newReqBody["fields"] = {$set: o.reqbody}
                    }
                    newReqBody['database']   = o.dbnames['database'];
                    newReqBody['collection'] = o.dbnames['collection'];
                } else { // for old query
                    newReqBody = o.reqbody;
                }
                // if params
                if (o.params && self.parsedUrl.action == 'update' || self.parsedUrl.action == 'rm') {
                    newReqBody["query"] = JSON.parse(decodeURIComponent(o.params));
                }
                o["form"] = newReqBody;
            }
        } else {
            o["form"] = o.reqbody;
        }
    }
    var opts = {
        'url':     o.url,
        'method':  o.method,
        'params':  (o.params) ? o.params : '',
        'headers': (o.headers) ? o.headers : {},
        'form':    (o.form) ? o.form : ''
    };

    if (self.dialect == 'mongodb') {  // mongodb
        //log.error(decodeURIComponent(options.params))
        Query.getAuthDB(o.tenantid)
            .then(function (auth) {
                opts.auth = auth;
                self.executeDo(opts, {'source': o});
            });
    } else { // db driver
        self.executeExtDB(opts);
    }
};

/**
 * Execute Ext DB driver (mysql,mssql)
 * @param {Object} o
 */
ExecuteQuery.prototype.executeExtDB = function (o) {
    var self     = this,
        config   = self.parsedUrl,
        tenantid = self.opts.tenantid;
    if (o.params && !o.params.length) {
        o.params = '';
    }
    dbActions.init({
        tenantid: tenantid,
        dialect:  config.dialect,
        action:   config.action,
        dbName:   config.database,
        clName:   config.tblName,
        query:    o.params,
        postBody: o.form
    })
        .then(
        function (result) {
            if (result.error) {
                self.abortQueryExecution({'name': result.error.toString(), 'type': 'request'});
            } else {
                self.resultExecution(JSON.stringify({data: result}));
            }
        },
        function (error) {
            //log.error('err->',error.toString())
            self.abortQueryExecution({'name': error.toString(), 'type': 'request'});
        }
    )
        .done();
};

var convertQueryFormatToHttpHeader = {
    'json': 'application/json',
    'xml':  'application/xml'   // it can be 'text/xml' also
};

/**
 * Execute with Provider
 * @param {Object} o
 */
ExecuteQuery.prototype.executeWithProvider = function (o, dqo) {
    var self = this,
        requestObject = {
        tenant      : o.tenantid,
        application : o.applicationName,
        user        : o.userid,
        provider    : o.provider,

        url         : o.url,
        method      : o.method
    };

    if ('get' !== o.method) {
        requestObject.body    = o.form;
        requestObject.headers = {
            'Content-Type': convertQueryFormatToHttpHeader[o.format] // TODO where is format?
        };
    }

    return ARM(requestObject)
    .then(function (response) {
        if ( response && response.body && Buffer.isBuffer(response.body) ) {
            log.dbg('ARM Instanse returned Buffer for ', {
                provider : o.provider,
                method   : o.method,
                url      : o.url,
                tenant   : o.tenantid,
                user     : o.userid
            });
            response.body = response.body.toString('utf8');
        } else if ( response && response.body ) {
            log.dbg('ARM Instanse returned NOT Buffer for ', {
                provider : o.provider,
                method   : o.method,
                url      : o.url,
                tenant   : o.tenantid,
                user     : o.userid
            });
        }
            if (response.body.charAt(0) == '<') { // may be xml
                if (response.body.indexOf('Not Found') > -1 || response.body.indexOf('<html') > -1) {
                    self.abortQueryExecution({'name': 'Not Found page', 'type': 'request'});
                    return;
                }
                xml2js.parseString(response.body, function (e, parsed) {
                    body = JSON.stringify(parsed);
                    self.resultExecution(body);
                });
            } else { // may be JSON
                self.resultExecution(response.body);
            }
    })
    .fail(function (err) {
	if ( err instanceof ARM.Error ) {
            return self.abortQueryExecution(err);
	}

        log.error(err);
        if (SETTINGS.log_pmx) {
            pmx.notify({"type":"query:authenticate", "dqo": dqo, "error": error});
        }
        self.abortQueryExecution({'name': 'Could not authenticate you', 'type': 'app'});
    });
};

/**
 * Execute
 * @param {Object} opts
 */
ExecuteQuery.prototype.executeDo = function (opts, dqo) {
    var self = this;
    if (typeof opts.form === 'string') {
        try {
            opts.form = JSON.parse(opts.form);
        } catch(e) {}
    }
    if ((opts.method == 'post') || (opts.method == 'put')) {
        opts.body = opts.form;
        delete opts.form;
        opts.json = true;
        delete opts.format;
    }

    if (dqo.source.cache != 'none'){
        if (dqo.source.cache == 'user') {
            var key = dqo.source.tenantid + "_" + dqo.source.userid + "_" + dqo.source.application + "_" + dqo.source.name;
            var cacheTimeExpiry = dqo.source.cacheTimeExpiry;
            cache.get(key)
                .then(function(data){
                    data ? self.resultExecution(data) : doRequest(key, cacheTimeExpiry);
                });
        } else if (dqo.source.cache == 'tenant') {
            var key = dqo.source.tenantid + "_" + dqo.source.application + "_" + dqo.source.name;
            var cacheTimeExpiry = dqo.source.cacheTimeExpiry;
            cache.get(key)
                .then(function(data){
                    data ? self.resultExecution(data) : doRequest(key, cacheTimeExpiry);
                });
        } else {
            doRequest();
        }
    } else {
        doRequest();
    }

    function doRequest(key, cacheTimeExpiry) {
        if (!opts.url) {
            // For case when we don't use URL we return just empty object
            self.resultExecution(JSON.stringify({}));
        } else {
            request(opts, function (err, response, body) {
                if (typeof body === 'object') body = JSON.stringify(body);
                if (err) {
                    if (SETTINGS.log_pmx) {
                        pmx.notify({"type": "query:execute", "dqo": dqo, "error": err});
                    }
                    self.abortQueryExecution({'name': 'Request error', 'type': 'request'});
                } else {
                    if (response.headers) {
                        self.opts.headers = response.headers;
                    }
                    if (body.charAt(0) == '<') { // may be xml
                        if (body.indexOf('Not Found') > -1 || body.indexOf('<html') > -1) {
                            self.abortQueryExecution({'name': 'Not Found page', 'type': 'request'});
                            return;
                        }
                        xml2js.parseString(body, function (e, parsed) {
                            body = JSON.stringify(parsed);
                            if (key) {
                                if (cacheTimeExpiry != 0) {
                                    cache.set(key, body).then(function () {
                                        cache.expire(key, cacheTimeExpiry);
                                    })
                                } else {
                                    cache.set(key, body);
                                }
                            }
                            self.resultExecution(body);
                        });
                    } else { // may be JSON
                        if (key) {
                            if (cacheTimeExpiry != 0) {
                                cache.set(key, body).then(function () {
                                    cache.expire(key, cacheTimeExpiry);
                                })
                            } else {
                                cache.set(key, body);
                            }
                        }
                        self.resultExecution(body);
                    }
                }
            });
        }
    }
};

/**
 * try parse response and call returnData
 * @param response
 */
ExecuteQuery.prototype.resultExecution = function (response) {
    var self = this;
    try {
        this.res.setHeader("Access-Control-Allow-Origin", "*");
        //
        // application error
        if (self.opts.appexpr.length) {
            var key = containsRegex(self.opts.appexpr, response);
            if (key > -1) {
                self.abortQueryExecution({'name': self.opts.appexpr[key].name, 'type': 'app'});
                return;
            }
        }
        response = JSON.parse(response);
        if (response.error) {
            self.abortQueryExecution({'name': response.error, 'type': 'app'});
            return;
        }
        // execute post code
        if (self.opts.postcode.length) {

            //fill array with code
            var arrCodes = [];
            var user     = self.opts.user || '';
            self.opts.postcode.forEach(function (el, index) {
                if (el.code.indexOf('terminateFilter(') == -1) {
                    el.code += ';terminateFilter(response);'
                }
                arrCodes.push(el.code);
            });
            // execute post code
            helper.execCode(response, self.reqParams, 'response', null, arrCodes, self.opts.tenantid, user, self.opts.userid, self.opts.application)
                .then(function (o) {
                    response = o;
                    self.returnData(response);
                })
                .fail(function (err) {
                    log.error(err);
                    self.abortQueryExecution({'name': err, 'type': 'app'});
                });

        } else {
            self.returnData(response);
        }
    } catch (ex) {
        self.abortQueryExecution({'name': 'The returned object is not JSON!', 'type': 'app'});
    }
};

ExecuteQuery.prototype.returnData = function (body) {
    try {
        var metadata = {};
        try {
            metadata = dfxMetaData.setMetaData(body);
        } catch (e) {
            metadata = {
                "name":     "root",
                "type":     "root",
                "children": {
                    "error retrieving metadata": ""
                }
            };
        }
        var result = {
            data:        body,
            metadata:    metadata,
            requestData: {
                url:     this.opts.url,
                method:  this.opts.method,
                headers: this.opts.headers || {},
                reqBody: (this.opts.form) ? this.opts.form : ''
            }
        };
        this.res.setHeader("Content-Type", "application/json; charset=utf-8");
        this.res.end(JSON.stringify(result));
    } catch (ex) {
        this.abortQueryExecution({'name': ex, 'type': 'app'});
    }
};

/**
 * @param {Object} o
 */
ExecuteQuery.prototype.abortQueryExecution = function (o) {
    var typeError = o.type || 'request',
        errorObj  = {};
    if (typeError == 'app') typeError = 'system';
    if (o.name.application) typeError = 'application';
    errorObj      = {
        error:     o.name.application || o.name,
        typeError: typeError
    };

    var metadata = {};

    var result = {
        data:        errorObj,
        metadata:    errorObj,
        requestData: {
            url:     this.opts.url,
            method:  this.opts.method,
            headers: this.opts.headers || {},
            reqBody: (this.opts.form) ? this.opts.form : ''
        }
    };
    this.res.setHeader("Content-Type", "application/json; charset=utf-8");
    this.res.status(400).json({result: 'failed', reason: errorObj});

};

// _________________________END QUERY EXECUTE__________________________________

// _________________________START Soap ACTIONS_________________________________
Query.soap = function (req, res) {
    var action  = req.params.action,
        soapUrl = req.query.soapUrl || '';
    if (!Query.soap[action]) {
        resultEnd(res, {error: 'Unknown action: ' + action});
        return;
    }
    if (soapUrl) {
        Query.soap[action]({url: soapUrl}, res);
    }
};

Query.soap.getWsdl = function (opts, res) {
    if (!opts.method) {
        opts.method = 'get';
    }
    request(opts, function (err, response, body) {
        if (err) {
            resultEnd(res, {error: err.toString(), typeError: 'request'});
        } else {
            if (body.indexOf('<') > -1) { // may be xml
                res.set('Content-Type', 'text/xml');
                res.end(body);
            } else {
                resultEnd(res, {error: 'Soap Response Error', typeError: 'request'});
            }
        }
    });
};
// _________________________END Soap ACTIONS___________________________________

// _________________________START DB DRIVERS ACTIONS___________________________
var dbDriverTools = {},
    dbActions     = {};
// Query.dbDriver = {}; 

Query.dbDriver = function (req, res) {
    var driverName = req.params.driverName || null,
        action     = req.params.action || null,
        dbName     = req.params.dbName || null,
        clName     = req.params.clName || null,
        query      = req.params.query || '',
        postBody   = req.body || '',
        tenantid   = req.user.tenantid;
    if (!dbActions[action]) {
        resultEnd(res, {error: 'Unknown action: ' + action});
        return;
    }
    dbActions.init({
        tenantid: tenantid,
        dialect:  driverName,
        action:   action,
        dbName:   dbName,
        clName:   clName,
        query:    query,
        postBody: postBody
    })
        .then(
        function (result) {
            if (result.error) {
                resultEnd(res, {error: result.error.toString(), typeError: 'request'});
            } else {
                if (action != 'getTree') {
                    result = {data: result};
                }
                resultEnd(res, result);
            }
        },
        function (error) {

            resultEnd(res, {error: error.toString(), typeError: 'request'});
        }
    )
        .done();
};

dbActions.init = function (o) {
    var error =
            ( !o.tenantid && 'need tenant name' ) ||
            ( !o.dialect && 'need db driver name' ) ||
            ( !o.action && 'need db action' ) || false;
    return error
        ? Q.reject(error)
        : sysadmin.dbDriver['get']({'tenant': o.tenantid, 'nameDriver': o.dialect})
        .then(function (doc) {
            // config
            if (!doc) {
                return Q.reject('Not set true driverName for driver: ' + o.dialect);
            }
            var action   = o.action,
                query    = o.query || '',
                oQuery   = '',
                postBody = o.postBody || '';

            dbDriverTools = dbTools.createDBTool(doc);
            if (!o.dbName) {
                o.dbName = doc['database'];
            }
            // if params
            if (query) {
                var partQuery = '',
                    operation = '',
                    replOp    = {"eq": "=", "ne": "<>", "lt": "<", "gt": ">"},
                    add       = '';
                if (typeof query == 'string') {
                    try {
                        query = JSON.parse(query);
                    } catch (e) {
                        log.error(e);
                        return Q.reject('API Route JSON is not valid !');
                    }
                }
                for (var i = query.length; i;) {
                    partQuery = query[--i];
                    operation = partQuery.operation;
                    operation = operation.replace(new RegExp(operation, "g"), replOp[operation]);
                    if (doc.dialect == 'mysql') {
                        oQuery += add + escapeIdentifier(partQuery.field, '`') + operation + escapeIdentifier(partQuery.value, "'");
                    } else {
                        oQuery += add + '[' + partQuery.field + ']' + operation + escapeIdentifier(partQuery.value, "'");
                    }
                    add = ' AND ';
                }
                if (oQuery) {
                    query = oQuery;
                }
            }
            return dbActions[action]({
                dialect:  doc.dialect,
                dbName:   o.dbName,
                clName:   o.clName,
                query:    query,
                postBody: postBody
            });
        });
};

dbActions.sql = function (o) {
    return dbDriverTools.executeQuery(o.postBody, {});
};

dbActions.getTree = function (o) {
    var dbName  = o.dbName,
        sql     = 'SELECT TABLE_NAME as tblname FROM information_schema.TABLES',
        options = {
            params: [dbName]
        };

    if (o.dialect == 'mysql') {
        sql += ' WHERE TABLE_SCHEMA = ?';
    } else {
        sql = 'SELECT TABLE_NAME as tblname FROM information_schema.TABLES';
    }

    return dbDriverTools.executeQuery(sql, options)
        .then(function (tbls) {
            var tree        = {},
                collections = {};
            for (var i = tbls.length; i;) {
                var tblname = tbls[--i].tblname || '';
                if (tblname) {
                    collections[tblname] = null;
                }
            }
            tree[dbName] = collections;
            return {tree: tree}
        })
        .fail(function (err) {
            log.error(err);
            return {error: err}
        });
};

dbActions.get = function (o) {
    var options = {},
        sql     = 'SELECT * FROM ' + o.clName,
        query   = o.query;
    if (query) {
        sql += ' WHERE ' + query;
    }
    return dbDriverTools.executeQuery(sql, options);
};

dbActions.getOne = function (o) {
    var options = {
            params: [],
            skip:   0,
            limit:  1
        },
        query   = o.query,
        sql     = 'SELECT * FROM ' + o.clName;
    if (query) {
        sql += ' WHERE ' + query;
    }
    return dbDriverTools.executeQuery(sql, options)
        .then(function (result) {
            var obj = [];
            if (result && result[0]) {
                obj = result[0];
                if (obj['rownum_temp__'] != "undefined") {
                    delete obj['rownum_temp__'];
                }
                if (typeof obj['column_temp__'] != "undefined") {
                    delete obj['column_temp__'];
                }
                obj = result;
            }
            return obj;
        })
        .fail(function (err) {
            log.error(err);
            return {error: err}
        });
};

dbActions.fields = function (o) {
    var quote = "'",
        sql   = 'SELECT COLUMN_NAME AS cols FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ' + escapeIdentifier(o.clName, quote);
    return dbDriverTools.executeQuery(sql, {})
        .then(function (fields) {
            var obj = {};
            for (var i = 0, len = fields.length; i < len; i++) {
                obj[fields[i].cols] = null;
            }
            return {cols: obj}
        })
        .fail(function (err) {
            log.error(err);
            return {error: err}
        });
};

dbActions.count = function (o) {
    var sql   = 'SELECT count(*) as data FROM ' + o.clName,
        query = o.query;
    if (query) {
        sql += ' WHERE ' + query
    }
    return dbDriverTools.executeQuery(sql, {});
};

dbActions.exists = function (o) {
    return dbActions.count(o)
        .then(function (res) {
            if (res[0] && res[0].data) {
                return {data: !!res[0].data}
            }
            return res;
        });
};

dbActions.put = function (o) {
    var postBody = o.postBody,
        fields   = Object.keys(postBody).join(', '),
        values   = [],
        quote    = "'";

    for (var i in postBody) {
        values.push(escapeIdentifier(postBody[i], quote));
    }
    values  = values.join(', ');
    var sql = 'INSERT INTO ' + o.clName + ' (' + fields + ') VALUES (' + values + ')';
    return dbDriverTools.executeQuery(sql, {})
        .then(function (result) {
            var obj = {data: 'success'}
            if (result && result.insertId) {
                obj = {data: result.insertId}
            }
            return obj;
        })
        .fail(function (err) {
            log.error(err);
            return {error: err}
        });

};

dbActions.update = function (o) {
    var field, value,
        postBody   = o.postBody,
        query      = o.query,
        strUpdates = '',
        del        = '',
        quote      = "'";
    for (var i in postBody) {
        field = i;
        value = escapeIdentifier(postBody[i], quote);
        strUpdates += del + field + " = " + value;
        del   = ',';
    }
    var sql = 'UPDATE ' + o.clName + ' SET ' + strUpdates;
    if (query) {
        sql += ' WHERE ' + query;
    }
    return dbDriverTools.executeQuery(sql, {})
        .then(function (result) {
            var obj = {data: 'success'}
            if (result && result.insertId) {
                obj = {data: result.insertId}
            }
            return obj;
        })
        .fail(function (err) {
            log.error(err);
            return {error: err}
        });
};

dbActions.rm = function (o) {
    var sql = 'DELETE FROM ' + o.clName + ' WHERE ' + o.query;
    return dbDriverTools.executeQuery(sql, {});
};

var escapeIdentifier = function (str, quote) {
    quote = quote || '"';
    return quote + str + quote;
};

var parseDbUrl = function (dbUrl) {
    var url = require('url');
    if (typeof dbUrl === 'object') {
        if (dbUrl.adapter) return dbUrl;
        return {error: '"adapter" is required in config objects'};
    }
    var parsed     = url.parse(dbUrl, true),
        defAdapter = 'mongodb',
        pathname   = parsed.pathname || '',
        host       = parsed.hostname || '',
        port       = '',
        adapter    = '',
        auth       = [],
        arrPath    = [],
        user       = '',
        password   = '',
        action     = '',
        database   = '',
        tblName    = '';

    if (parsed.auth) {
        auth     = parsed.auth.split(':');
        user     = auth[0];
        password = auth[1];
    }
    if (pathname.substr(0, 1) == '/') {
        pathname = pathname.substring(1);
    }
    if (pathname.indexOf('database') > -1) {
        adapter = defAdapter;
    }
    if (pathname) {
        var str      = (adapter == defAdapter) ? 'database' : 'dbdriver';
        var posDbDrv = pathname.indexOf(str);
        if (posDbDrv > -1) {
            pathname = pathname.substring(posDbDrv + str.length);
        }
        if (pathname.substr(0, 1) == '/') {
            pathname = pathname.substring(1);
        }
        arrPath = pathname.split('/');
        if (arrPath.length) {
            if (adapter == defAdapter) {
                if (arrPath[0]) {
                    action = arrPath[0];
                }
                if (arrPath[1]) {
                    database = arrPath[1];
                }
                if (arrPath[2]) {
                    tblName = arrPath[2];
                }
            } else {
                if (arrPath[0]) {
                    adapter = arrPath[0];
                }
                if (arrPath[1]) {
                    action = arrPath[1];
                }
                if (arrPath[2]) {
                    database = arrPath[2];
                }
                if (arrPath[3]) {
                    tblName = arrPath[3];
                }
            }
        }
    }

    if (parsed.port) {
        port = parseInt(parsed.port, 10);
        if (isNaN(port)) port = void(0);
    }
    var config = {
        dialect:  adapter,
        host:     host,
        port:     port,
        user:     user,
        password: password,
        action:   action,
        database: database,
        tblName:  tblName
    }
    for (var k in parsed.query) {
        config[k] = parsed.query[k];
    }
    return config;
};

var getDBDrivers = function (dbDrivers) {
    var dbsettings = [],
        o          = {};
    //driver://user:pass@hostname/database
    for (var i = 0, len = dbDrivers.length; i < len; i++) {
        if (dbDrivers[i].dialect && dbDrivers[i].nameDriver) {
            o = {'name': dbDrivers[i].nameDriver, 'strConfig': dbDrivers[i].nameDriver};
            dbsettings.push(o);
        }
    }
    return dbsettings;
};

var getDBDriverParams = function (o) {
    return dbActions.init({
        tenantid: o.tenantid,
        dialect:  o.driverName,
        action:   'fields',
        dbName:   o.dbName,
        clName:   o.clName
    })
};
// _________________________STOP DB DRIVERS ACTIONS____________________________

// _________________________START QUERY ACTIONS________________________________
Query.getAll = function (req, callback) {
    var filter = versioning.getNotDeletedFilter(req);
    mdbw.get(DB_TENANTS_PREFIX + req.user.tenantid, 'dataqueries', filter)
        .then(function (docs) {
            callback(docs);
        });
};

Query.selectAll = function (fields, req, callback) {
    var filter = versioning.getNotCommittedFilter(req);
    mdbw.select(DB_TENANTS_PREFIX + req.user.tenantid, 'dataqueries', filter, fields)
        .then(function (docs) {
            callback(docs);
        });
};

Query.getAllbyApps = function (apps, req) {
    return apps.map(function (app) {

    });
};

Query.getAllbyApp = function (applicationName, req, callback) {
    var appDbName = getAppDbName(applicationName);

    Query.getAllWithFilter({application: appDbName}, req, callback);
};

Query.getAllWithFilter = function (filter, req, callback) {
    var mainFilter = versioning.getNotDeletedFilter(req);
    _.extend(filter, mainFilter);
    mdbw.get(DB_TENANTS_PREFIX + req.user.tenantid, 'dataqueries', filter)
        .then(function (docs) {
            callback(docs);
        });
};

Query.get = function (queryName, req, callback) {
    var appDbName = getAppDbName(req.params.applicationName),
        filter = versioning.getSaveAsFilter(req, queryName, appDbName);
    return mdbw.getOne(DB_TENANTS_PREFIX + req.user.tenantid, 'dataqueries', filter)
        .then(function (doc) {
            if (typeof doc != "object") {
                throw new Error('The record [' + queryName + '] does not exist!');
                return null;
            }
            if (callback) {
                callback(doc);
            } else {
                return doc;
            }
        }).fail(function (err) {
            log.error(err);
        });
};

Query.getOne = function (queryName, tenantid, req, callback) {

    var filter = {
        name : queryName
    };
    var appDbName = (req.session && req.session.app)
        ? getAppDbName(req.session.app.id)
        : req.query.application || req.body.application;

    // first, look for a query in the application and then, look for it in the shared catalog
    if (appDbName) {
        filter.$or = [{application: appDbName}, {application: ''}];
    } else {
        filter.application = appDbName;
    }

    return mdbw.get(DB_TENANTS_PREFIX + tenantid, 'dataqueries', filter)
        .then(function (docs) {
            if ((! docs.length) || typeof docs[0] != "object") {
                throw new Error('The record [' + queryName + '] does not exist!');
                return null;
            }
            if (callback) {
                callback( docs[0] );
            } else {
                return docs[0];
            }
        });
};

Query.countByApp = function (req, res) {
    var applicationDbName = getAppDbName(req.params.applicationName);

    Query.count({application: applicationDbName}, req, function (quantity) {
        res.end(JSON.stringify({
            nbqueries: quantity
        }));
    });
};

Query.count = function (query, req, callback) {
    var filter = versioning.getNotDeletedFilter(req);
    _.extend(query, filter);

    mdbw.count(DB_TENANTS_PREFIX + req.user.tenantid, 'dataqueries', query)
        .then(function (quantity) {
            callback(quantity);
        })
        .fail(function (error) {
            log.error(error)
        });
};

Query.recover = function (queryName, req, callback) {
    var data                                                       = {};
    data["versioning." + req.session.activeRepository + ".status"] = "modified";
    mdbw.update(DB_TENANTS_PREFIX + req.session.tenant.id, 'dataqueries', {name: queryName}, {$set: data})
        .then(function (quantity) {
            callback(null, quantity);
        })
        .fail(function (err) {
            callback(err, null);
            log.error(err);
        });
};

Query.set = function (queryName, dataquery, req, callback) {
    var appDbName = getAppDbName(dataquery.change ? dataquery.change.application : dataquery.application);
    if (!dataquery.change) {
        var apiRoutes = {};
        dataquery.apiRoutes.forEach(function (apiRoute) {
            if ( !apiRoute.data.uuid ) apiRoute.data.uuid = uuid.v1();
            apiRoutes[apiRoute.name] = apiRoute.data;
        });

        dataquery.apiRoutes = apiRoutes;
    }

        versioning.setQuery(queryName, appDbName, req, function () {
            var tenantID          = req.user.tenantid;
            dataquery.requestDate = new Date();
            if (dataquery.change) {
                dataquery.category = dataquery.change.category;
                delete dataquery.change;
            }
            if (dataquery.settings && dataquery.settings.postrequestbody) {
                try {
                    dataquery.settings.postrequestbody = JSON.parse(dataquery.settings.postrequestbody);
                } catch (e) {
                }
            }
            if (! dataquery.category) dataquery.category = 'Default';
            mdbw.update(DB_TENANTS_PREFIX + tenantID, 'dataqueries', {name: queryName, application: appDbName}, {$set: dataquery})
                .then(function (quantity) {

                    if (dataquery.name !== queryName) CHANNELS.root.publish(
                        'DATAQUERY.changed_name',
                        {from: queryName, to: dataquery.name, tenant: tenantID}
                    );

                    callback(null, quantity);
                })
                .fail(function (err) {
                    callback(err.errmsg || err);
                    log.error(err);
                });
        });
};

function task(repo, id, userID, tenantID) {
    return function (callback) {
        setStatusToObject('dataqueries', id, userID, tenantID, "modified", repo, function () {
            callback();
        });
    };
}

Query.copyAs = function (req, res) {
    var sendResponse = function (data) {
        var result = JSON.stringify(data);
        res.setHeader('Content-Type', 'text/text');
        res.setHeader('Content-Length', result.length);
        res.status(data.result == 'failed' ? '400' : '200').end(result);
    };

    var appTargetDbName = getAppDbName(req.body.applicationTarget);

    Query.getByApp(req.params.applicationName, req.params.queryName, req, function (queryParameters) {
        delete(queryParameters._id);
        queryParameters.name        = req.body.saveAsName;
        queryParameters.application = appTargetDbName;
        queryParameters.category = req.body.categoryTarget;
        mdbw.put(DB_TENANTS_PREFIX + req.session.tenant.id, 'dataqueries', queryParameters).then(function (query_id) {
            versioning.addQuery(query_id, req);
            CHANNELS.root.publish('DATAQUERY.created', {
                queryName:   queryParameters.name,
                tenant:      req.session.tenant.id,
                application: queryParameters.application
            });
            sendResponse({result: 'success', data: 'API Route copied!'});
        }).fail(function (err) {
            if (err.code == 11000) {
                sendResponse({
                    error:  {
                        type:    "request error",
                        message: 'API Route with name "' + queryParameters.name + '" already exists'
                    },
                    result: "failed"
                });
            } else {
                sendResponse({
                    error:  {
                        type:    "request error",
                        message: 'Unknown error'
                    },
                    result: "failed"
                });
            }
        });
    });
};

Query.getByApp = function (applicationName, queryName, req, callback) {
    var filter         = versioning.getNotDeletedFilterWithName(req, queryName);
    filter.application = getAppDbName(applicationName);
    mdbw.getOne(DB_TENANTS_PREFIX + req.session.tenant.id, 'dataqueries', filter).then(function (doc) {
        callback(doc);
    });
};

Query.saveAs = function (queryName, dataquery, req, callback) {
    var queryFilter        = versioning.getSaveAsFilter(req, queryName);
    var that               = this;
    var tenantID           = req.user.tenantid;
    var current_query_name = dataquery.current_query_name;
    var appDbName          = getAppDbName(dataquery.applicationName);
    delete dataquery.current_query_name;

    dataquery.name        = queryName;
    dataquery.requestDate = new Date();
    dataquery.parameters  = (dataquery.parameters) ? dataquery.parameters : [];
    dataquery.appexpr     = (dataquery.appexpr) ? dataquery.appexpr : [];
    dataquery.precode     = (dataquery.precode) ? dataquery.precode : [];
    dataquery.postcode    = (dataquery.postcode) ? dataquery.postcode : [];
    dataquery.metadata    = (dataquery.metadata) ? dataquery.metadata : {
        "name":     "root",
        "type":     "root",
        "children": {}
    };
    if (dataquery.settings && dataquery.settings.postrequestbody) {
        try {
            dataquery.settings.postrequestbody = JSON.parse(dataquery.settings.postrequestbody);
        } catch (e) {
        }
    }

    mdbw.rm(DB_TENANTS_PREFIX + tenantID, 'dataqueries', queryFilter)
        .then(function () {
            that.get(current_query_name, req, function (query) {
                // get some data from the current query
                dataquery.connector      = query.connector;
                dataquery.lock           = query.lock;
                dataquery.selector       = query.selector;
                dataquery.update_comment = query.update_comment;
                dataquery.visibility     = query.visibility;
                dataquery.application    = getAppDbName(query.application);

                // save as - save new query
                mdbw.put(DB_TENANTS_PREFIX + tenantID, 'dataqueries', dataquery)
                    .then(function (query_id) {
                        versioning.addQuery(query_id,req);
                        CHANNELS.root.publish('DATAQUERY.created', {queryName: dataquery.name, tenant: tenantID, application: dataquery.application});
                        callback(null, query_id);
                    })
                    .fail(function (err) {
                        log.error(err);
                        if (err.code == 11000) {
                            callback('API Route with name "' + queryName + '" already exists', null);
                        } else {
                            callback('Unknown error', null);
                        }
                    })
                    .done();
            });
        });
};

Query.createNew = function (queryParameters, req, callback) {
    var tenantID = req.user.tenantid;
    var appDbName = getAppDbName(queryParameters.application);

    var apiRoutes = {};
    if (queryParameters.apiRoutes instanceof Array) {
        queryParameters.apiRoutes.forEach(function (apiRoute) {
            apiRoute.data.uuid = uuid.v1();
            apiRoutes[apiRoute.name] = apiRoute.data;
        });
    } else {
        apiRoutes = queryParameters.apiRoutes;
    }

    var tasks = [];
    var err = false;

    _.each(apiRoutes, function (value, key) {
        tasks.push(Query.validateServiceUrl(req, key, appDbName));
    });

    Q.all(tasks).then(function (response) {
        response.forEach(function (res) {
            if (res) {
                 callback('One of service url already exists', null);
                 err = true;
            }
        })
    }).then(function(){
         if (!err) {
                 var json = {};
                 json.name = queryParameters.name;
                 json.application = appDbName;
                 json.apiRoutes = apiRoutes;
                 json.ownerId = queryParameters.ownerId;
                 json.description = queryParameters.description;
                 json.persistence = queryParameters.persistence;
                 json.requestDate = new Date();
                 json.selector = queryParameters.selector;
                 json.visibility = queryParameters.visibility;
                 json.lock = queryParameters.lock;
                 json.category = queryParameters.category;
                 json.service = queryParameters.service || {name: ''};
                 var queryFilter = versioning.createNewQueryFilter(req, queryParameters.name, appDbName);
                 mdbw.rm(DB_TENANTS_PREFIX + tenantID, 'dataqueries', queryFilter)
                     .then(function () {
                         mdbw.put(DB_TENANTS_PREFIX + tenantID, 'dataqueries', json)
                             .then(function (query_id) {
                                 versioning.addQuery(query_id, req);
                                 CHANNELS.root.publish('DATAQUERY.created', {
                                     queryName: json.name,
                                     tenant: tenantID,
                                     application: appDbName
                                 });
                                 callback(null, query_id);
                             })
                             .fail(function (err) {
                                 log.error(err);
                                 if (err.code == 11000) {
                                     callback('API service object with name "' + queryParameters.name + '" already exists', null);
                                 } else {
                                     callback('Unknown error', null);
                                 }
                             });
                     });
         }
    });
};

Query.deleteQuery = function (queryName, req, callback, applicationName) {
    var appDbName = getAppDbName(applicationName),
        tenantID = req.user.tenantid;

    versioning.moveToTrash({
        tenantId : tenantID,
        name : queryName,
        application: appDbName
    }).then(function(){
        mdbw.rm(DB_TENANTS_PREFIX + tenantID, 'dataqueries', {name: queryName, application: appDbName})
            .then(function (quantity_query) {
                CHANNELS.root.publish('DATAQUERY.removed', {queryName: queryName, tenant: tenantID, application: appDbName});
                callback();
            });
    });
};

Query.deleteQueryItem = function (params, req, callback) {
    var appDbName = getAppDbName(params.appId),
         tenantID = req.user.tenantid;

    return mdbw.get(
        DB_TENANTS_PREFIX + tenantID,
        'dataqueries',
        {"name" : params.apiRouteName, "application" : appDbName}
    )
        .then(function (doc) {
            var content = doc[0];
            delete content.apiRoutes[params.apiRouteItemName];

            if (_.isEmpty(content.apiRoutes) ) {
                callback("You can\'t remove last apiRoute item!");
                return;
            }

            return mdbw.update(
                DB_TENANTS_PREFIX + tenantID,
                'dataqueries',
                {"name" : params.apiRouteName, "application" : appDbName},
                {
                    $set: {
                        apiRoutes : content.apiRoutes
                    }
                }
            ).then(function(res){
                    callback();
                });
        });
};

Query.updateQueryItem = function (params, req, callback) {
    var appDbName = getAppDbName(params.appId),
        tenantID = req.user.tenantid;
        var query = {$set:{}};

        query.$set['apiRoutes.' + params.newApiRouteItemName] = params.apiRoute.data;
        if (params.newApiRouteItemName != params.apiRouteItemName) {
            query.$unset = {};
            query.$unset['apiRoutes.' + params.apiRouteItemName] = 1;
        }

        return mdbw.update(
            DB_TENANTS_PREFIX + tenantID,
            'dataqueries',
            {"name" : params.apiRouteName, "application" : appDbName},
            query
        ).then(function(res){
                callback();
            });
};

Query.getNewJSON = function (req, callback) {
    fs.readFile(path.join(__dirname, '..', 'templates/static_json/blanks/query.json'), 'utf8', function (err, data) {
        if (err) log.error(err);
        callback(err, JSON.parse(data));
    });
};

Query.listCats = function (req, res) {
    req.params.application = getAppDbName(req.params.application);

    Query.getAllCat(req, function (querycats) {
        res.end(JSON.stringify({
            querycats: querycats
        }));
    });
};

// collection: dataqueries_categories
Query.getAllCat = function (req, callback) {
    var appDbName = getAppDbName(req.params.applicationName);

    return mdbw.get(DB_TENANTS_PREFIX + req.user.tenantid, 'dataqueries_categories', {
        application: appDbName || ''
    }).then(function (docs) {
        if (callback) {
            callback(docs);
        } else {
            return docs;
        }
    });
};

Query.getNewJSONCat = function (req, callback) {
    fs.readFile(path.join(__dirname, '..', 'templates/static_json/blanks/query_categories.json'), 'utf8', function (err, data) {
        if (err) log.error(err);
        callback(err, JSON.parse(data));
    });
};

Query.getTenantCategories = function (req, callback) {
    return mdbw.get(DB_TENANTS_PREFIX + req.user.tenantid, 'dataqueries_categories').then(function (docs) {
        if (callback) {
            callback(docs);
        } else {
            return docs;
        }
    });
};

Query.createNewCat = function (queryParameters, req, callback) {
    var applicationDbName = getAppDbName(queryParameters.application);
    var userId = req.session.user.id;
    Query.getNewJSONCat(req.user.tenantid, function (err, json) {
        if (err && callback) callback(err, null);
        mdbw.exists(DB_TENANTS_PREFIX + req.user.tenantid, 'dataqueries_categories', {
            name: queryParameters.name, application: applicationDbName
        }).then(function (result) {
            if (!result) {
                json.ownerId     = queryParameters.ownerId;
                json.name        = queryParameters.name;
                json.application = applicationDbName;
                json.requestDate = new Date();
                json.visibility  = "visible";
                json.versioning = {
                    "status":      'added',
                    "user":        userId,
                    "last_action": (new Date() / 1000).toFixed()
                };
                mdbw.put(DB_TENANTS_PREFIX + req.user.tenantid, 'dataqueries_categories', json).then(function (querycat_id) {
                    mdbw.rm(DB_TENANTS_PREFIX + req.user.tenantid, 'trash', {
                        name: queryParameters.name,
                        application : applicationDbName,
                        type: 'dataqueries_categories'
                    }).then(function(){
                        if (callback) callback(null, querycat_id);
                    });
                });
            } else {
                if (callback) callback("Current category name already exists");
            }
        });

    });
};


Query.deleteCat = function (queryParameters, req, callback) {
    var applicationDbName = getAppDbName(queryParameters.application),
        userId = req.session.user.id,
        tenantId = req.user.tenantid;
    mdbw.get(DB_TENANTS_PREFIX + tenantId, 'dataqueries_categories',{
            name: queryParameters.name,
            application: applicationDbName}
    ).then(function(categories){
            categories[0].type = "dataqueries_categories";
            categories[0].versioning = {
                    "status":      "deleted",
                    "user":        userId,
                    "last_action": (new Date() / 1000).toFixed()
            };
            mdbw.put(DB_TENANTS_PREFIX + tenantId, 'trash',categories[0])
                .then(function(){
                    mdbw.rm(DB_TENANTS_PREFIX + tenantId, 'dataqueries_categories', {
                        name:        queryParameters.name,
                        application: applicationDbName
                    }).then(function (quantity_cats) {
                        updateCategoryNameInQueries(tenantId, applicationDbName, queryParameters.name, 'Default', quantity_cats, callback);
                    });
                });
        });
};

Query.setCat = function (currentCatName, queryParameters, req, callback) {
    var newCatName = queryParameters.name,
        applicationName = getAppDbName(queryParameters.application),
        tenantId = req.user.tenantid;
    var userId = req.session.user.id;
    mdbw.getOne(DB_TENANTS_PREFIX + tenantId, 'dataqueries_categories', {
        name:        currentCatName,
        application: applicationName
    }).then(function(categories) {
        mdbw.exists(DB_TENANTS_PREFIX + tenantId, 'dataqueries_categories', {
            name: newCatName,
            application: applicationName
        }).then(function (result) {
            if (!result) {
                var status;
                (categories.versioning.status === 'committed')  ?   status = "modified" : status = categories.versioning.status;
                mdbw.update(DB_TENANTS_PREFIX + tenantId, 'dataqueries_categories', {
                    name: currentCatName,
                    application: applicationName
                }, {$set: {name: newCatName, versioning : {
                    "status":      status,
                    "user":        userId,
                    "last_action": (new Date() / 1000).toFixed()
                    }}}
                ).then(function (quantity_cats) {
                    updateCategoryNameInQueries(tenantId, applicationName, currentCatName, newCatName, quantity_cats, callback);
                }).fail(function (err) {
                    log.error(err);
                });
            } else {
                callback("Current category name already exists");
            }
        });
    });
};

var updateCategoryNameInQueries = function (tenantId, applicationName, currentCatName, newCatName, quantity_cats, callback) {
    // update this category name in all the queries
    mdbw.update(DB_TENANTS_PREFIX + tenantId, 'dataqueries',
        {application: applicationName, category: currentCatName},
        {$set: {category: newCatName}}
    ).then(function (quantity_cats) {
        callback(null, quantity_cats);
    })
    .fail(function (err) {
        log.error(err);
    });
};

// collection: dataqueries_services
Query.getAllServices = function (req, callback) {
    return mdbw.get(DB_TENANTS_PREFIX + req.user.tenantid, 'dataqueries_services')
        .then(function (docs) {
            if (callback) {
                callback(docs);
            } else {
                return docs;
            }
        });
};

Query.createNewService = function (serviceParameters, req, callback) {
    Query.getNewJSONService(req.user.tenantid, function (err, json) {
        if (err) return callback(err, null);
        json             = serviceParameters;
        json.requestDate = new Date();
        mdbw.exists(DB_TENANTS_PREFIX + req.user.tenantid, 'dataqueries_services', {name: serviceParameters.name}).then(function (result) {
            if (!result) {
                mdbw.put(DB_TENANTS_PREFIX + req.user.tenantid, 'dataqueries_services', json)
                    .then(function (service_id) {
                        callback(null, service_id);
                    });
            } else {
                callback("Current service name is exists!");
            }
        });

    });
};

Query.getNewJSONService = function (req, callback) {
    fs.readFile(path.join(__dirname, '..', 'templates/static_json/blanks/query_services.json'), 'utf8', function (err, data) {
        if (err) log.error(err);
        callback(err, JSON.parse(data));
    });
};

Query.deleteService = function (queryCatName, req, callback) {
    mdbw.rm(DB_TENANTS_PREFIX + req.user.tenantid, 'dataqueries_services', {name: queryCatName})
        .then(function (quantity) {
            callback();
        });
};

Query.setService = function (serviceName, dataService, req, callback) {
    dataService.requestDate = new Date();
    mdbw.exists(DB_TENANTS_PREFIX + req.user.tenantid, 'dataqueries_services', {name: serviceName}).then(function (result) {
        if (!result) {
            mdbw.update(DB_TENANTS_PREFIX + req.user.tenantid, 'dataqueries_services', {name: serviceName}, {$set: dataService})
                .then(function (quantity) {
                    callback(null, quantity);
                })
                .fail(function (err) {
                    log.error(err);
                });
        } else {
            callback("Current service name is exists!");
        }
    });
};

Query.createQuery = function (req, res) {
    var o = {'action': 'list', 'tenant': req.user.tenantid};
    return Q.all([
        sysadmin.provider[o.action](o),
        sysadmin.dbDriver[o.action](o),
        Query.getAllCat(req),
        Query.getAllServices(req)
    ])
        .spread(function (providers, dbDrivers, cats, services) {
            fs.readFile(path.join(__dirname, '..', 'templates/studio/create-query.jade'), 'utf8', function (err, data) {
                if (err) throw err;
                var fn   = jade.compile(data);
                var body = fn({
                    querycats:  cats,
                    services:   services,
                    providers:  providers,
                    dbsettings: getDBDrivers(dbDrivers)
                });
                res.setHeader('Content-Type', 'text/html');
                res.setHeader('Content-Length', body.length);
                res.end(body);
            });
        });
};

Query.createData = function (req, res) {
    var opshuns = {'action': 'list', 'tenant': req.user.tenantid, applicationName: req.params.applicationName};
    return Q.all([
        sysadmin.provider[opshuns.action](opshuns),
        sysadmin.dbDriver[opshuns.action](opshuns),
        Query.getAllCat(req),
        Query.getAllServices(req)
    ]).spread(function (providers, dbDrivers, cats, services) {
        var data = JSON.stringify({
            querycats:  cats,
            services:   services,
            providers:  providers,
            dbsettings: getDBDrivers(dbDrivers)
        }, null, 0);
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Content-Length', data.length);
        res.end(data);
    });
};

Query.viewQuery = function (req, res) {
    var queryName = req.params.queryName;
    var o         = {'action': 'list', 'tenant': req.user.tenantid};
    return Q.all([
        sysadmin.provider[o.action](o),
        sysadmin.dbDriver[o.action](o),
        Query.getAllCat(req),
        Query.getAllServices(req)
    ])
        .spread(function (providers, dbDrivers, cats, services) {
            Query.get(queryName, req)
                .then(function (doc) {
                    if (doc.metadata && typeof doc.metadata == 'string') {
                        doc.metadata = JSON.parse(doc.metadata);
                    }
                    if (doc.settings.postrequestbody && typeof doc.settings.postrequestbody == 'object') {
                        doc.settings.postrequestbody = JSON.stringify(doc.settings.postrequestbody, null, 4);
                    }
                    var settings = {
                        query:      doc,
                        cats:       cats,
                        services:   services,
                        keysDB:     '',
                        providers:  providers,
                        dbsettings: getDBDrivers(dbDrivers),
                        dbdriver:   ''
                    };
                    if (doc.source == 'db') {
                        Query.showDbQuery(settings, req, res);
                    } else {
                        Query.showQuery(settings, res);
                    }
                })
                .fail(function (e) {
                    res.end(JSON.stringify({
                        error: e.message
                    }));
                });
        });
};

Query.getQueryData = function (req, res) {
    var queryName = req.params.queryName;
    var o         = {'action': 'list', 'tenant': req.user.tenantid, applicationName: req.params.applicationName};
    return Q.all([
        sysadmin.provider[o.action](o),
        sysadmin.dbDriver[o.action](o),
        Query.getAllCat(req),
        Query.getAllServices(req)
    ]).spread(function (providers, dbDrivers, cats, services) {
        Query.get(queryName, req)
            .then(function (doc) {
                if (doc.metadata && typeof doc.metadata == 'string') {
                    doc.metadata = JSON.parse(doc.metadata);
                }
                if (doc.settings.postrequestbody && typeof doc.settings.postrequestbody == 'object') {
                    doc.settings.postrequestbody = JSON.stringify(doc.settings.postrequestbody, null, 4);
                }
                var qryData = {
                    query:      doc,
                    cats:       cats,
                    services:   services,
                    keysDB:     '',
                    providers:  providers,
                    dbsettings: getDBDrivers(dbDrivers),
                    dbdriver:   ''
                };
                if (doc.source == 'db') {
                    Query.sendDbQueryData(qryData, req, res);
                } else {
                    res.end(JSON.stringify(qryData));
                }
            })
            .fail(function (e) {
                res.end(JSON.stringify({
                    error: e.message
                }));
            });
    });
};

Query.getQueryDataNew = function (req, res) {
    var queryName = req.params.queryName;
    var o         = {'action': 'list', 'tenant': req.user.tenantid, applicationName: req.params.applicationName};
    return Q.all([
        sysadmin.provider[o.action](o),
        sysadmin.dbDriver[o.action](o),
        Query.getAllCat(req),
        Query.getAllServices(req)
    ]).spread(function (providers, dbDrivers, cats, services) {
        Query.get(queryName, req)
            .then(function (doc) {
                var apiRoutesArr = [];
                Object.keys(doc.apiRoutes).forEach(function(key){
                   apiRoutesArr.push({
                       name : key,
                       data : doc.apiRoutes[key]
                   })
                });
                var qryData = {
                    query:      doc,
                    cats:       cats,
                    services:   services,
                    apiRoutes:  apiRoutesArr,
                    providers:  providers
                };
                res.end(JSON.stringify(qryData));
            })
            .fail(function (e) {
                res.end(JSON.stringify({
                    error: e.message
                }));
            });
    });
};

Query.sendDbQueryData = function (settings, req, res) {
    var doc            = settings.query,
        url            = doc.settings.url || '',
        dbdriver       = doc.settings.dbdriver || '',
        typeRequest    = 'get',
        parsedUrl      = parseDbUrl(url),
        collectionName = parsedUrl.tblName,
        action         = parsedUrl.action,
        dialect        = parsedUrl.dialect,
        dbName         = parsedUrl.database;
    if (dbdriver) {
        settings.dbdriver             = dbdriver;
        settings.query.dbName         = '';
        settings.query.collectionName = '';
    }
    // type request (get/post)
    if (doc.settings.typerequest) {
        var arrTypeReq = doc.settings.typerequest.split('_');
        if (arrTypeReq[1]) {
            typeRequest = arrTypeReq[1].toLowerCase();
        }
    }
    if (dialect == 'mongodb') {
        if (settings.query.settings.postrequestbody != '') {
            var reqBody = JSON.parse(settings.query.settings.postrequestbody);
            if (reqBody.database && reqBody.collection) { // for old query
                dbName         = reqBody.database;
                collectionName = reqBody.collection;
            }
        }
        if (settings.query.settings.dbnames) { // new query
            dbName         = settings.query.settings.dbnames.database;
            collectionName = settings.query.settings.dbnames.collection;
        }
    }
    if (dbName != '' && collectionName != '') {
        settings.query.dbName         = dbName;
        settings.query.collectionName = collectionName;
    } else {
        res.end(JSON.stringify(settings));
        return;
    }
    //--- get request
    if (url) {
        if (dbdriver == 'mongodb' || !dbdriver) {
            var options    = {},
                tenantId   = req.user.tenantid;
            options.url    = req.protocol + "://" + req.get('host') + '/database/getOne/' + dbName + '/' + collectionName + '/{}';
            options.method = 'get';
            Query.getAuthDB(tenantId)
                .then(function (auth) {
                    options.auth = auth;
                    request(options, function (err, response, body) {
                        if (err) {
                            resultEnd(res, {error: err.toString(), typeError: 'request'});
                        } else {
                            body            = JSON.parse(body);
                            settings.keysDB = (body.data) ? Object.keys(body.data) : "";
                            res.end(JSON.stringify(settings));
                        }
                    });
                });
        } else {
            getDBDriverParams({
                tenantid:   req.user.tenantid,
                driverName: settings.dbdriver,
                dbName:     dbName,
                clName:     collectionName
            })
                .then(
                function (result) {
                    if (result['cols']) {
                        settings.keysDB = Object.keys(result['cols']);
                    }
                    res.end(JSON.stringify(settings));
                },
                function (error) {
                    log.error(error)
                }
            )
                .done();
        }
    }
};

Query.showDbQuery = function (settings, req, res) {
    var doc            = settings.query,
        url            = doc.settings.url || '',
        dbdriver       = doc.settings.dbdriver || '',
        typeRequest    = 'get',
        parsedUrl      = parseDbUrl(url),
        collectionName = parsedUrl.tblName,
        action         = parsedUrl.action,
        dialect        = parsedUrl.dialect,
        dbName         = parsedUrl.database;
    if (dbdriver) {
        settings.dbdriver             = dbdriver;
        settings.query.dbName         = '';
        settings.query.collectionName = '';
    }
    // type request (get/post)
    if (doc.settings.typerequest) {
        var arrTypeReq = doc.settings.typerequest.split('_');
        if (arrTypeReq[1]) {
            typeRequest = arrTypeReq[1].toLowerCase();
        }
    }
    if (dialect == 'mongodb') {
        if (settings.query.settings.postrequestbody != '') {
            var reqBody = JSON.parse(settings.query.settings.postrequestbody);
            if (reqBody.database && reqBody.collection) { // for old query
                dbName         = reqBody.database;
                collectionName = reqBody.collection;
            }
        }
        if (settings.query.settings.dbnames) { // new query
            dbName         = settings.query.settings.dbnames.database;
            collectionName = settings.query.settings.dbnames.collection;
        }
    }
    if (dbName != '' && collectionName != '') {
        settings.query.dbName         = dbName;
        settings.query.collectionName = collectionName;
    } else {
        Query.showQuery(settings, res);
        return;
    }
    //--- get request
    if (url) {
        if (dbdriver == 'mongodb' || !dbdriver) {
            var options    = {},
                tenantId   = req.user.tenantid;
            options.url    = req.protocol + "://" + req.get('host') + '/database/getOne/' + dbName + '/' + collectionName + '/{}';
            options.method = 'get';
            Query.getAuthDB(tenantId)
                .then(function (auth) {
                    options.auth = auth;
                    request(options, function (err, response, body) {
                        if (err) {
                            resultEnd(res, {error: err.toString(), typeError: 'request'});
                        } else {
                            body            = JSON.parse(body);
                            settings.keysDB = (body.data) ? Object.keys(body.data) : "";
                            Query.showQuery(settings, res);
                        }
                    });
                });
        } else {
            getDBDriverParams({
                tenantid:   req.user.tenantid,
                driverName: settings.dbdriver,
                dbName:     dbName,
                clName:     collectionName
            })
                .then(
                function (result) {
                    if (result['cols']) {
                        settings.keysDB = Object.keys(result['cols']);
                    }
                    Query.showQuery(settings, res);
                },
                function (error) {
                    log.error(error)
                }
            )
                .done();
        }
    }
};

Query.showQuery = function (settings, res) {
    fs.readFile(path.join(__dirname, '..', 'templates/studio/query.jade'), 'utf8', function (err, data) {
        if (err) throw err;
        var fn = jade.compile(data);
        //t = process.hrtime(t);
        //log.error('benchmark took %d seconds and %d nanoseconds', t[0], t[1]);
        var body = fn({
            query:      settings.query,
            querycats:  settings.cats,
            services:   settings.services,
            keysDB:     settings.keysDB,
            providers:  settings.providers,
            dbsettings: settings.dbsettings,
            dbdriver:   settings.dbdriver
        });

        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Length', body.length);
        res.end(body);
    });
};

module.exports = Query;
// _________________________STOP QUERY ACTIONS_________________________________

var resultEnd = function (res, obj, headers) {
    if (headers) {
        for (var index in headers) {
            if (headers.hasOwnProperty(index)) {
                res.setHeader(index, headers[index]);
            }
        }
    }
    res.end(JSON.stringify(obj));
};

/**
 *  Compile parameters
 * @param objParameters
 * @param source
 * @param typeRequest
 * @param dialect
 * @param url
 * @returns {{}}
 */
var compileParameters = function (objParameters, source, typeRequest, dialect, url) {
    var objPars = {};
    if (source == 'ext') {
        objPars = compileExtParams(objParameters, typeRequest, url);
    } else if (source == 'db') {
        objPars = compileDBParams(objParameters, typeRequest, dialect);
    }
    return objPars;
};

/**
 *  Compile params for external source
 * @param objParameters
 * @param typeRequest
 * @param url
 * @returns {{}}
 */
var compileExtParams = function (objParameters, typeRequest, url) {
    var objParsQuery = null, dl = "", headers = null, urlParams = null, objPars = {}, regText = null;
    for (var index in objParameters) {
        if (objParameters.hasOwnProperty(index)) {
            var element = objParameters[index];

            // check for 'element.value' is not enough because 0 (zero) should go through
            if (element.name && element.value !== undefined && element.value !== '' && element.value !== null) {
                var name  = element.name,
                    type  = (element.type) ? element.type : 'request',
                    value = element.value;
                if (type == "header") {
                    if (headers == null) {
                        headers = {};
                    }
                    headers[name] = value;
                }
                if (type == "url" && url) {
                    if (urlParams == null) {
                        urlParams = url;
                    }
                    regText = new RegExp('{' + element.name + '}', "g");
                    if (urlParams.search(regText) > -1) {
                        urlParams = urlParams.replace(regText, value);
                    }
                }
                if (type == "request") {
                    if (objParsQuery == null) {
                        objParsQuery = "";
                    }
                    objParsQuery += dl + name + "=" + value;
                    dl = '&';
                    /*
                     if (typeRequest == "get") {
                     if (objParsQuery == null) {
                     objParsQuery = "";
                     }
                     objParsQuery += dl + name + "=" + value;
                     dl = '&';
                     } else {
                     if (objParsQuery == null) {
                     objParsQuery = {};
                     }
                     if (objParsQuery[name]) {
                     if (typeof objParsQuery[name] != "array") {
                     objParsQuery[name] = [];
                     }
                     objParsQuery[name].push(value);
                     } else {
                     objParsQuery[name] = value;
                     }
                     }
                     */
                }
            }
        }
    }
    if (urlParams != null) {
        objPars.urlParams = urlParams;
    }
    if (objParsQuery != null) {
        objPars.params = objParsQuery;
    }
    if (headers != null) {
        objPars.headers = headers;
    }
    return objPars;
};

/**
 * Compile params for DB source
 * @param objParameters
 * @param typeRequest
 * @param dialect String(mongodb/mysql/mssql/oracle)
 * @returns {{}}
 */
var compileDBParams = function (objParameters, typeRequest, dialect) {
    var objParsQuery = null, objPars = {};
    if (objParameters.length) {
        objParsQuery = objParameters;
        objParsQuery = [];
        for (var index in objParameters) {
            var element = objParameters[index];
            if (element['name'] && typeof element['value'] !== 'undefined') {
                objParsQuery[index] = {
                    field:     element['name'],
                    value:     element['value'],
                    operation: (element['operation']) ? element['operation'] : 'eq'
                }
            }
        }
        if (dialect == 'mongodb') {
            objParsQuery = convertParams(objParsQuery).toMongoQuery();
        } else {
            objParsQuery = JSON.stringify(objParsQuery);
        }
    }
    if (objParsQuery != null) {
        objPars.params = objParsQuery;
    }
    return objPars;
};

/**
 *  Generate meta data from data json
 */
var dfxMetaData = (function () {
    /**
     private functions
     */
    var _private = {
        jsonSelect: function (path, stream) {
            var return_buffer = stream;
            var arr_path      = null;
            if (path == null) {
                arr_path = [":root"];
            } else {
                arr_path = path.split(" ");
            }
            for (var i = 0; i < arr_path.length; i++) {
                var key = arr_path[i].substring(1);
                if (key != "root") {
                    if (return_buffer instanceof Array) {
                        return_buffer = return_buffer[0][key];
                    } else {
                        return_buffer = return_buffer[key];
                    }
                }
            }
            return return_buffer;
        }
    };
    // public function
    return {
        data:             null,
        queryMetaData:    null,
        setData:          function (data) {
            this.data = data;
        },
        setMetaData:      function (data) {
            this.setData(data);
            this.queryMetaData = null;
            this.generateMetaData();
            try {
                this.queryMetaData = JSON.parse(JSON.stringify(this.queryMetaData));
                if (typeof this.queryMetaData != 'object') {
                    throw 'Failure occurred! Meta Data is not a Json Object';
                }
            } catch (ex) {
                throw ex;
            }
            return this.queryMetaData;
        },
        generateMetaData: function (key_obj, path_from) {
            var path             = ":root",
                regexp_forbidden = /[;, ]+/i;
            if (this.queryMetaData == null) {
                this.queryMetaData = {"name": "root", "type": "root", "children": {}};
            }
            var json_doc = this.data;

            if (key_obj != null) {
                path = path_from + " ." + key_obj;
            }
            json_doc = _private.jsonSelect(path, json_doc);
            if (json_doc instanceof Array) {
                json_doc = json_doc[0];
                if (json_doc instanceof Array) {
                    json_doc = json_doc[0];
                }
            }
            if (typeof json_doc == 'object') {
                for (var key in json_doc) {
                    if (json_doc.hasOwnProperty(key)) {
                        //var regexp_forbidden = new RegExp( "[:;, ]" );
                        if (!regexp_forbidden.test(key)) {
                            //if (!key.match( regexp_forbidden )) {
                            var value_type = "String";
                            var value      = json_doc[key];
                            if (value instanceof String) {
                                value_type = "String";
                            } else if (typeof value == "number") {
                                value_type = "Number";
                            } else if (typeof value == "boolean") {
                                value_type = "Boolean";
                            } else if (value instanceof Date) {
                                value_type = "Date";
                            } else if (value instanceof Array) {
                                value_type = "Array";
                            } else if (value instanceof Object) {
                                value_type = "Object";
                            }
                            this.getMDElement(key, path, value_type);
                            if (value instanceof Object) {
                                this.generateMetaData(key, path);
                            }
                        }
                    }
                }
            }
        },
        getMDElement:     function (key, path, value_type) {
            var meta_data_element = this.queryMetaData;
            var arr_path          = path.split(" ");
            for (var i = 0; i < arr_path.length; i++) {

                if (arr_path.length == 1) {

                    meta_data_element = this.queryMetaData[key];
                    if (meta_data_element == null || key == "name") {
                        this.queryMetaData.children[key] = {
                            "name":        key, "type": value_type, "options": {
                                "properties": {},
                                "gcontrols":  [
                                    {
                                        "name":        "SimpleText",
                                        "perspective": "Default",
                                        "type":        "TextField",
                                        "attributes":  {"label": key},
                                        "styles":      {}
                                    },
                                    {
                                        "name":        "SimpleEdit",
                                        "perspective": "Edit",
                                        "type":        "TextField",
                                        "attributes":  {"label": key},
                                        "styles":      {}
                                    }
                                ]
                            }, "children": {}
                        };
                        meta_data_element                = this.queryMetaData.children[key];
                    }

                } else {

                    var elem_name = arr_path[i].substring(1);
                    if (i > 0) {
                        meta_data_element = meta_data_element.children[elem_name];
                        if ((i + 1) == arr_path.length) {
                            var new_meta_data_element = meta_data_element.children[key];
                            if (new_meta_data_element == null || key == "name") {
                                new_meta_data_element           = {
                                    "name":        key, "type": value_type, "options": {
                                        "properties": {},
                                        "gcontrols":  [
                                            {
                                                "name":        "SimpleText",
                                                "perspective": "Default",
                                                "type":        "TextField",
                                                "attributes":  {"label": key},
                                                "styles":      {}
                                            },
                                            {
                                                "name":        "SimpleEdit",
                                                "perspective": "Edit",
                                                "type":        "TextField",
                                                "attributes":  {"label": key},
                                                "styles":      {}
                                            }
                                        ]
                                    }, "children": {}
                                };
                                meta_data_element.children[key] = new_meta_data_element;
                                meta_data_element               = new_meta_data_element;
                            }
                        }
                    }
                }

            }
            return meta_data_element;
        }
    };
}());

/**
 * Convert params to mongoQuery
 */
var convertParams = (function () {

    /**
     * @returns {String | Object} normaly — string, if error — object.error = …
     */
    var operations = {

        'eq': function (o) {
            return ( o.field !== undefined && o.hasOwnProperty('value') )
                ? ['{"', o.field, '":"', o.value, '"}'].join('')
                : {error: '[convertParams.operations.eq]: both "parameter" and "value" must exists'}
        },

        'ne': function (o) {
            return ( o.field !== undefined && o.hasOwnProperty('value') )
                ? ['{"', o.field, '":{"$ne":"', o.value, '"}}'].join('')
                : {error: '[convertParams.operations.ne]: both "parameter" and "value" must exists'}
        },

        'lt': function (o) {
            if (isNaN(parseFloat(o.value)) || !isFinite(o.value))
                return {error: '[convertParams.operations.lt]: "value" must be a number'};

            if (!o.field || !o.hasOwnProperty('value'))
                return {error: '[convertParams.operations.ne]: both "parameter" and "value" must exists'};

            return ['{"', o.field, '":{"$lt":"', o.value, '"}}'].join('')
        },

        'gt': function (o) {
            if (isNaN(parseFloat(o.value)) || !isFinite(o.value))
                return {error: '[convertParams.operations.gt]: "value" must be a number'};

            if (!o.field || !o.hasOwnProperty('value'))
                return {error: '[convertParams.operations.ne]: both "parameter" and "value" must exists'};

            return ['{"', o.field, '":{"$gt":"', o.value, '"}}'].join('')
        },

        'regexp': function (o) {
            if (!o.field || !o.hasOwnProperty('value'))
                return {error: '[convertParams.operations.regexp]: both "parameter" and "value" must exists'};

            var rgxp;

            if (typeof o.value === 'string') {
                o.value = o.value.replace(/^\//, '');
                o.value = o.value.replace(/([^\\])\/$/, '$1');
                try {
                    rgxp = new RegExp(o.value);
                }
                catch (e) {
                    return {error: '[convertParams.operations.regexp]: ' + e.toString()}
                }
            } else if (o.value instanceof RegExp) {
                rgxp = o.value;
            } else {
                return {error: '[convertParams.operations.regexp]: typeof "value" must be "regexp" or "string"'}
            }

            return ['{"', o.field, '":{"$regexp":', rgxp.toString(), '}}'].join('')
        }
    };

    function convertParams(params) {
        if (!(this instanceof convertParams)) return new convertParams(params);
        if (!params) {
            this.error = '[convertParams]: invoking without parameters is useless';
            return this;
        }
        if (!(params instanceof Array)) {
            this.error = '[convertParams]: parameters must to be an array';
            return this;
        }

        this.params = params;
    }

    convertParams.prototype.toMongoQuery = function () {
        if (this.error) return this;
        var chunks = [];

        for (var i = 0, l = this.params.length; i < l; i++) {

            if (typeof this.params[i] !== 'object') {
                return {error: '[convertParams.toMongoQuery]: each item in parameters must be an object'};
            }

            var operation = this.params[i].operation || 'eq',
                chunk;

            if (!operations.hasOwnProperty(operation)) {
                return {error: '[convertParams.toMongoQuery]: unknown operation: ' + operation};
            }

            chunk = operations[operation](this.params[i]);

            if (typeof chunk === 'object') return chunk;

            chunks.push(chunk);
        }

        return encodeURIComponent('{"$and":[' + chunks.join(',') + ']}');
    };

    convertParams.prototype.toUrlQuery = function () {
        return {error: '[convertParams.toUrlQuery]: not implemented yet'};
    };

    return convertParams;

})();
/**
 *
 * @param {Array} a (array of regexp such as [{name:'not found',regexp:'error',...}])
 * @param str
 * @returns {number}
 */
var containsRegex = function (a, str) {
    for (var i = 0, len = a.length; i < len; i++) {
        var regText = new RegExp(a[i].regexp, "g");
        if (str.search(regText) > -1) {
            return i;
        }
    }
    return -1;
};
var strToJson     = function (str) {
    eval("var x = " + str + ";");
    return JSON.stringify(x);
}
var toXML         = function (parameters, name) {
    var xml = "";
    for (var p in parameters) {
        if (typeof(parameters[p]) == "object") {
            var iparameters = parameters[p];
            for (var rp in iparameters)
                //Complex object
                if (typeof(iparameters[rp]) == "object") {
                    if (typeof(iparameters[rp][0]) == "undefined") {
                        xml += "<" + rp + ">";
                        xml += WSClientParameters.getXML(iparameters[rp], rp);
                        if (rp.indexOf(" ") > 0)
                            xml += "</" + rp.substr(0, rp.indexOf(" ")) + ">";
                        else
                            xml += "</" + rp + ">";
                    } else {
                        xml += WSClientParameters.getXML(iparameters[rp], rp);
                    }
                } else { //Simple Array
                    if (rp.indexOf(" ") > 0)
                        xml += "<" + rp + ">" + iparameters[rp].toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</" + rp.substr(0, rp.indexOf(" ")) + ">";
                    else
                        xml += "<" + rp + ">" + iparameters[rp].toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</" + rp + ">";
                }

        } else if (typeof(parameters[p]) != "function") {
            if (name) {
                if (name.indexOf(" ") > 0)
                    xml += "<" + name + ">" + parameters[p].toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</" + name.substr(0, name.indexOf(" ")) + ">";
                else
                    xml += "<" + name + ">" + parameters[p].toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</" + name + ">";
            } else {
                if (p.indexOf(" ") > 0)
                    xml += "<" + p + ">" + parameters[p].toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</" + p.substr(0, p.indexOf(" ")) + ">";
                else
                    xml += "<" + p + ">" + parameters[p].toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</" + p + ">";
            }
        }
    }
    return xml;

}

var getAppDbName = function(applicationName) {
    return ((!applicationName) || applicationName == sharedCatalogName) ? '' : applicationName;
};
