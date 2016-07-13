var Q = require('q');
var request = require('request');
var SETTINGS = require('./dfx_settings');
var fs = require('fs');
var endpoints = require('./utils/endpoints');
var log  = new (require('./utils/log')).Instance({label: "DFX_PHONE_GAP_API"});
var mdbw = require('./mdbw')(SETTINGS.mdbw_options);

var core = {};

var api = {
    getUserProfile: function (parsed) {
        var o = {req : parsed.req};
        return core.getUserProfile(o);
    },
    getApp: function (parsed) {
        var o = {
            req : parsed.req,
            appId : parsed.query.appId
        };
        return core.getApp(o);
    },
    getApps: function (parsed) {
        var o = {
            req : parsed.req
        };
        return core.getApps(o);
    },
    getByPlatform: function (parsed) {
        var o = {
            req : parsed.req,
            platform : parsed.query.platform,
            appId : parsed.query.appId
        };
        return core.getByPlatform(o);
    },
    createApp: function (parsed) {
        var o = {
            req : parsed.req,
            package : parsed.req.body.package,
            version : parsed.req.body.version,
            title :   parsed.req.body.title,
            filePath : parsed.req.body.filePath
        }
        return core.createApp(o);
    }

};

core.api = endpoints.json({
    parser: function (req) {
        return {
            action: req.params.action,
            data:   {
                params:            req.params,
                query:             req.query,
                body:              req.body,
                req:               req
            }
        }
    },
    action: api,
    log:    log
});

var getCredentials = function(o) {
    var tenantId = o.req.session.tenant.id;
    var query = {id : tenantId};
    return mdbw.getOne('dreamface_sysdb', 'tenants', query);
}

// Get Data APIs

core.getUserProfile = function(o) {
    return getCredentials(o).then(function(data){
        var D = Q.defer();
        var url = "https://build.phonegap.com/api/v1/me";
        var auth = "Basic " + new Buffer(data.phoneGapLogin + ":" + data.phoneGapPassword).toString("base64");
        request(
            {
                url : url,
                headers : {
                    "Authorization" : auth
                }
            },
            function (error, response, body) {
                (error || (response.statusCode != 200)) ? D.reject(error || body)
                                                        : D.resolve(body);
            }
        );
        return D.promise;
    });
};

core.getApp = function(o) {
    return getCredentials(o).then(function(data){
        var D = Q.defer();
        var url = "https://build.phonegap.com/api/v1/apps/" + o.appId;
        var auth = "Basic " + new Buffer(data.phoneGapLogin + ":" + data.phoneGapPassword).toString("base64");
        request(
            {
                url : url,
                headers : {
                    "Authorization" : auth
                }
            },
            function (error, response, body) {
                (error || (response.statusCode != 200)) ? D.reject(error || body)
                                                        : D.resolve(body);
            }
        );
        return D.promise;
    });
};

core.getApps = function(o) {
    return getCredentials(o).then(function(data){
        var D = Q.defer();
        var url = "https://build.phonegap.com/api/v1/apps";
        var auth = "Basic " + new Buffer(data.phoneGapLogin + ":" + data.phoneGapPassword).toString("base64");
        request(
            {
                url : url,
                headers : {
                    "Authorization" : auth
                }
            },
            function (error, response, body) {
                (error || (response.statusCode != 200)) ? D.reject(error || body)
                                                        : D.resolve(body);
            }
        );
        return D.promise;
    });
};

core.getByPlatform = function(o) {
    return getCredentials(o).then(function(data){
        var D = Q.defer();
        var url = "https://build.phonegap.com/api/v1/apps/" + o.appId + "/" + o.platform;
        var auth = "Basic " + new Buffer(data.phoneGapLogin + ":" + data.phoneGapPassword).toString("base64");
        request(
            {
                url : url,
                headers : {
                    "Authorization" : auth,
                    'Content-Type': 'application/json'
                }
            },
            function (error, response, body) {
                (error || (response.statusCode != 200)) ? D.reject(error || body)
                                                        : D.resolve(response.request.headers);
            }
        );
        return D.promise;
    });
};


// Set Data APIs

core.createApp = function(o) {
    return getCredentials(o).then(function(data){
        var D = Q.defer();
        var url = "https://build.phonegap.com/api/v1/apps";
        var auth = "Basic " + new Buffer(data.phoneGapLogin + ":" + data.phoneGapPassword).toString("base64");
        var data = {
            title : o.title,
            package : o.package,
            version : o.version,
            create_method :"file"
        }
        var formData = {
            data: JSON.stringify(data),
            file: fs.createReadStream(o.filePath)
        };

        request(
            {
                url : url,
                method : "POST",
                formData: formData,
                headers : {
                    "Authorization" : auth
                }
            },
            function (error, response, body) {
                (error || (response.statusCode != 201)) ? D.reject(error || body)
                                                        : D.resolve(body);
            }
        );
        return D.promise;
    });
}

core.updateApp = function(o) {
    return getCredentials(o).then(function(data){
        var D = Q.defer();
        var url = "https://build.phonegap.com/api/v1/apps/" + o.appId;
        var auth = "Basic " + new Buffer(data.phoneGapLogin + ":" + data.phoneGapPassword).toString("base64");
        var body = {
            data: o.updateData
        };
        request(
            {
                url : url,
                method : "PUT",
                json : body,
                headers : {
                    "Authorization" : auth
                }
            },
            function (error, response, body) {
                (error || (response.statusCode != 200)) ? D.reject(error || body)
                                                        : D.resolve(body);
            }
        );
        return D.promise;
    });
}

core.updateAppFile = function(o) {
    return getCredentials(o).then(function(data){
        var D = Q.defer();
        var url = "https://build.phonegap.com/api/v1/apps/" + o.appId;
        var auth = "Basic " + new Buffer(data.phoneGapLogin + ":" + data.phoneGapPassword).toString("base64");

        var formData = {
            data: JSON.stringify(data),
            file: fs.createReadStream(o.filePath)
        };
        request(
            {
                url : url,
                method : "PUT",
                formData: formData,
                headers : {
                    "Authorization" : auth
                }
            },
            function (error, response, body) {
                (error || (response.statusCode != 200)) ? D.reject(error || body)
                    : D.resolve(body);
            }
        );
        return D.promise;
    });
}

core.deleteApp = function(o) {
    return getCredentials(o).then(function(data){
        var D = Q.defer();
        var url = "https://build.phonegap.com/api/v1/apps/" + o.appId;
        var auth = "Basic " + new Buffer(data.phoneGapLogin + ":" + data.phoneGapPassword).toString("base64");

        request(
            {
                url : url,
                method : "DELETE",
                headers : {
                    "Authorization" : auth
                }
            },
            function (error, response, body) {
                console.log(response);
                (error || (response.statusCode != 202)) ? D.reject(error || body)
                    : D.resolve(body);
            }
        );
        return D.promise;
    });
}

module.exports = core;
