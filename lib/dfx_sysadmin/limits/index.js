/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */
var Q = require('q');
var SETTINGS = require('../../dfx_settings');
var endpoints = require('../../utils/endpoints');
var log = new (require('../../utils/log')).Instance({label: "DFX_Limits"});
var db = require('../../mdbw')(SETTINGS.mdbw_options);
var sysdbName = SETTINGS.system_database_name;

var tenants;
var list = {};

module.exports.init = function(obj){
    list.applications = require('./list/application');
    list.users = require('./list/user')
    tenants = obj.tenants;
    exports = out;
    return out;
};

var out = {};

function validateLimits(tenant, limit, action, value, items, options) {
    if ((!limit) || (!tenant) || (typeof value == 'undefined') || (typeof action == 'undefined')) return Q.reject( "Fields 'limit','tenant','action' and 'value' are required");
    if (value < 0) return Q.reject("Limit value must be >= 0");
    if ((items) && !(items instanceof Array)) return Q.reject("Items must be Array type");
    if ((limit !== 'applications') && (limit !== 'users')) return Q.reject("Wrong limit type - [" + limit + "]! Limit type can be 'applications' or 'users'");
    if ((action != '+') && (action != '-') && (action != '=')) return Q.reject("Wrong action value - [" + action + "]! Action values are - '+','-' or '='");
    return Q.resolve();
};

function validateOptions(options){
    if (!options) return Q.reject( "Options object is required");
    if ((!options.tenant) || (!options.limit)) return Q.reject( "Fields 'limit','tenant' are required");
    if ((options.limit !== 'applications') && (options.limit !== 'users')) return Q.reject("Wrong limit type - [" + options.limit + "]! Limit type can be 'applications' or 'users'");
    return Q.resolve();
};

function calculateLimit(tenant, limit, action, value) {
    return list[limit].getLimit(tenant, limit)
        .then(function(oldLimit){
            var newlimit;
            if (action == "=") newLimit = value * 1;
            if (action == "-") newLimit = oldLimit * 1 - value * 1;
            if (action == "+") newLimit = oldLimit * 1 + value * 1;

            if (newLimit < 0) return Q.reject("Limit value must be >= 0");
            return newLimit;
        })
}

var api = {
    get: function (parsed) {
        return out.get(parsed.options);
    },
    set: function (parsed) {
        return out.set(parsed.options);
    },
    list: function(parsed) {
        return out.list(parsed.options);
    }
};

out.api = endpoints.json({
    parser: function (req) {
        return {
            action: req.params.action,
            data: {
                options: req.query
            }
        }
    },
    action: api,
    log: log
});

out.initDefaultLimits = function(tenant) {

    var types = Object.keys(list);
    var tasks = types.map(function(type){
        return list[type].init(tenant);
    });

    return Q.all(tasks);
};

out.set = function(options) {

    var tenant = options.tenant;
    var limit = options.limit;
    var action = options.action;
    var value = options.value;
    var items = options.items;

    return validateLimits(tenant, limit, action, value, items)
        .then(function(){
            return calculateLimit(tenant, limit, action, value)
                .then(function(newLimitValue){
                    return list[limit].getAllObjects(tenant)
                        .then(function(objlist){
                            if (newLimitValue >= objlist.length) {
                                return list[limit].saveLimit(tenant, newLimitValue);
                            } else {
                                var diff = objlist.length - newLimitValue;
                                if (items) {
                                   if  (limit === 'applications') {
                                       var activeAppList = objlist.map(function (app) {
                                           return app.name;
                                       });
                                       var appForDeactivateList = items.filter(function (app) {
                                           return (activeAppList.indexOf(app.toString()) !== -1);
                                       });

                                       if (appForDeactivateList.length !== diff ) return Q.reject("Wrong objects list!");
                                   }

                                    if (limit === 'users') {
                                        var activeUsersList = objlist.map(function (user) {
                                            return user.login;
                                        });
                                        var userForDeactivateList = items.filter(function (user) {
                                            return (activeUsersList.indexOf(user.toString()) !== -1);
                                        });

                                        if (userForDeactivateList.length !== diff ) return Q.reject("Wrong objects list!");
                                    }

                                }

                                return list[limit].saveLimit(tenant, newLimitValue)
                                    .then(function(){
                                        if (newLimitValue !== 0)
                                            return list[limit].disable(tenant, newLimitValue, items);
                                        else return 1;
                                    });
                            }

                        });
                });
        })
};

out.get = function (options) {
    return validateOptions(options)
        .then(function(){
            return list[options.limit].getLimit(options.tenant , options.limit);
        });
};

out.list = function (option) {
    if ((!option) || (!option.tenant)) return Q.reject("Tenant is required!");
    return db.get(
        sysdbName,
        "tenants",
        {id : option.tenant}
    ).then(function(t){
            if  (t.length > 0) return t[0].limits;
            return Q.reject("Tenant " + option.tenant + " not found in system");
        })
};
