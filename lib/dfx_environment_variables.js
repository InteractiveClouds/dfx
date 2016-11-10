var Q = require('q');

// Declaration of DFX modules
var SETTINGS = require('./dfx_settings');
var endpoints = require('./utils/endpoints');
var mdbw = require('./mdbw')(SETTINGS.mdbw_options);
var log = new (require('./utils/log')).Instance({label: "DFX_Environment_Variables"});
var DB_TENANTS_PREFIX = SETTINGS.databases_tenants_name_prefix;
var ObjectID = require('mongodb').ObjectID;

var env_vars = {};

var api = {
    add: function (parsed) {
        return env_vars.add(parsed);
    },
    edit: function (parsed) {
        return env_vars.edit(parsed);
    },
    delete: function (parsed) {
        return env_vars.delete(parsed);
    },
    getAll: function (parsed) {
        return env_vars.getAll(parsed);
    }
};

env_vars.api = endpoints.json({
    parser: function (req) {
    	console.log(req.params);
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

env_vars.getAll = function(parsed){
	var data = parsed.body;

	return mdbw.get(DB_TENANTS_PREFIX + parsed.tenant, 'environment_variables', { "app_name": data.app_name });
}

env_vars.add = function(parsed){
	var data = parsed.body;

	return mdbw.put(DB_TENANTS_PREFIX + parsed.tenant, 'environment_variables', data);
}

env_vars.edit = function(parsed){
	var data = parsed.body,
		query = {
			$set: {
                name: data.name,
                description: data.description,
            }
        };
    
	return mdbw.update(DB_TENANTS_PREFIX + parsed.tenant, 'environment_variables', { "_id": ObjectID(data._id) }, query);
}

env_vars.delete = function(parsed){
	var data = parsed.body;

	return mdbw.rm(DB_TENANTS_PREFIX + parsed.tenant, 'environment_variables', { "_id": ObjectID(data._id) });
}

module.exports = env_vars;