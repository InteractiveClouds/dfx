var Q = require('q');

// Declaration of DFX modules
var SETTINGS = require('./dfx_settings');
var endpoints = require('./utils/endpoints');
var mdbw = require('./mdbw')(SETTINGS.mdbw_options);
var log = new (require('./utils/log')).Instance({label: "DFX_Environments"});
var DB_TENANTS_PREFIX = SETTINGS.databases_tenants_name_prefix;
var ObjectID = require('mongodb').ObjectID;

var environments = {};

var api = {
    add: function (parsed) {
        return environments.add(parsed);
    },
    edit: function (parsed) {
        return environments.edit(parsed);
    },
    delete: function (parsed) {
        return environments.delete(parsed);
    },
    getAll: function (parsed) {
        return environments.getAll(parsed);
    },
    generate: function (parsed) {
        return environments.generate(parsed);
    },
    getGeneratedEnvironment: function (parsed) {
        return environments.getGeneratedEnvironment(parsed);
    }
};

environments.api = endpoints.json({
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

environments.getAll = function(parsed){
	var data = parsed.body;

	return mdbw.get(DB_TENANTS_PREFIX + parsed.tenant, 'environments', { "app_name": data.app_name });
}

environments.add = function(parsed){
	var data = parsed.body;

	return mdbw.put(DB_TENANTS_PREFIX + parsed.tenant, 'environments', data);
}

environments.edit = function(parsed){
	var data = parsed.body,
		query = {
			$set: {
                name: data.name,
                data: data.data
            }
        };
    
	return mdbw.update(DB_TENANTS_PREFIX + parsed.tenant, 'environments', { "_id": ObjectID(data._id) }, query);
}

environments.delete = function(parsed){
	var data = parsed.body;

	return mdbw.rm(DB_TENANTS_PREFIX + parsed.tenant, 'environments', { "_id": ObjectID(data._id) });
}

environments.generate = function(parsed){
    var data = parsed.body;
    
    return mdbw.rm(DB_TENANTS_PREFIX + parsed.tenant, 'environments_map', { "app_name": data.app_name }).then(function(){
        return mdbw.put(DB_TENANTS_PREFIX + parsed.tenant, 'environments_map', data);
    });
}

environments.getGeneratedEnvironment = function(parsed){
    var data = parsed.body;
    console.log(data);
    return mdbw.get(DB_TENANTS_PREFIX + parsed.tenant, 'environments_map', { "app_name": data.app_name });        
}

module.exports = environments;