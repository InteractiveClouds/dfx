// Declaration of main modules
var Q = require('q');

// Declaration of DFX modules
var SETTINGS = require('./dfx_settings');
var endpoints = require('./utils/endpoints');
var mdbw = require('./mdbw')(SETTINGS.mdbw_options);
var log = new (require('./utils/log')).Instance({label: "DFX_Data_dictionary"});
var DB_TENANTS_PREFIX = SETTINGS.databases_tenants_name_prefix;

var data_dictionary = {};


var api = {
    put: function (parsed) {
        return data_dictionary.put(parsed);
    },
    remove: function (parsed) {
        return data_dictionary.remove(parsed);
    },
    list: function (parsed) {
        return data_dictionary.list(parsed);
    },
    get: function (parsed) {
        return data_dictionary.get(parsed);
    }
};

data_dictionary.api = endpoints.json({
    parser: function (req) {
        return {
            action: req.params.action,
            data:   {
                body: req.body,
                params : req.params,
                tenant : req.session.tenant.id
            }
        }
    },
    action: api,
    log:    log
});

data_dictionary.put = function(parsed) {
    var error = (!parsed.body.name && 'need data dictionary name') ||
                ((parsed.body.name.indexOf(" ") > -1) && 'name cannot contains spaces') ||
                (!parsed.params.applicationName && 'need applicationName') || false;
    var filter = {
        "name" : parsed.body.name,
        "application" : parsed.params.applicationName
    };

    var dbName = DB_TENANTS_PREFIX + parsed.tenant;
    return error
        ? Q.reject(error)
        : mdbw.update(dbName, 'datadictionary', filter, {
                $set: {
                    content: parsed.body.content || ''
                }
        }).then(function (updated) {
        return updated || mdbw.put(dbName, 'datadictionary', {
                name: parsed.body.name,
                application: parsed.params.applicationName,
                content: parsed.body.content || ''
            })
         });
};

data_dictionary.remove = function(parsed) {
    var error = (!parsed.params.name && 'need data dictionary name') ||
                (!parsed.params.applicationName && 'need applicationName') || false;
    var filter = {
        "name" : parsed.params.name,
        "application" : parsed.params.applicationName
    };

    var dbName = DB_TENANTS_PREFIX + parsed.tenant;
    return error
        ? Q.reject(error)
        : mdbw.rm(dbName, 'datadictionary', filter)
};

data_dictionary.list = function(parsed) {
    var error = (!parsed.params.applicationName && 'need applicationName') || false;
    var filter = {
        "application" : parsed.params.applicationName
    };

    var dbName = DB_TENANTS_PREFIX + parsed.tenant;
    return error
        ? Q.reject(error)
        : mdbw.get(dbName, 'datadictionary', filter)
};

data_dictionary.get = function(parsed) {
    var error = (!parsed.params.name && 'need data dictionary name') ||
                (!parsed.params.applicationName && 'need applicationName') || false;
    var filter = {
        "name" : parsed.params.name,
        "application" : parsed.params.applicationName
    };

    var dbName = DB_TENANTS_PREFIX + parsed.tenant;
    return error
        ? Q.reject(error)
        : mdbw.getOne(dbName, 'datadictionary', filter)
};

module.exports = data_dictionary;