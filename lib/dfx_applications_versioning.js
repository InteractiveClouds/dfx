/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */
var SETTINGS = require('./dfx_settings'),
    mdbw = require('./mdbw')(SETTINGS.mdbw_options),
    mongo = require('mongodb'),
    Q         = require('q'),
    log = new (require('./utils/log')).Instance({label: "DFX_Applications_Versioning"});

var DB_TENANTS_PREFIX = SETTINGS.databases_tenants_name_prefix;
var ApplicationsVersioning = function () {
};

ApplicationsVersioning.getAllApplicationsFilter = function (req) {
    var obj = {};
    obj["versioning.status"] = {"$ne": "deleted"};
    obj.active = true;
    return obj;

};

ApplicationsVersioning.selectAllApplicationsFilter = function (req) {
    var obj = {};
    obj["versioning.status"] = {"$ne": "committed"};
    obj.active = true;
    return  obj;
};

ApplicationsVersioning.recoverApplicationFilter = function (appname, req) {
    var obj = {};
    obj["versioning.status"] = "modified";
    return  obj;
};

ApplicationsVersioning.getFullDefinitionOfApplicationFilters = function (appname, req, callback) {
    var filterObj = {};
    var appFilter = {};
    appFilter["versioning.status"] = {"$ne": "deleted"};
    appFilter.active = true;
    appFilter["name"] = appname;
    filterObj.appFilter = appFilter;
    var scrFilter = {};
    scrFilter["versioning.status"] = {"$ne": "deleted"};
    scrFilter.active = true;
    scrFilter["application"] = appname;
    filterObj.scrFilter = scrFilter;
    return filterObj;
};

ApplicationsVersioning.getApplicationFilter = function (appname, req, callback) {
    var obj = {};
    obj["versioning.status"] = {"$ne": "deleted"};
    obj.active = true;
    obj.name = appname;
    return obj;
};

ApplicationsVersioning.createNewApplicationFilter = function (applicationParameters, req, callback) {
    var obj = {};
    obj["versioning.status"] = "deleted";
    obj.name = applicationParameters.applicationName;
    return obj;
};

ApplicationsVersioning.setModifyStatusToApp = function (appName, req, callback) {
    mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'applications', {name: appName})
        .then(function (result) {
            if (result[0].versioning.status === 'committed') {
                setStatusToObject("applications", result[0]._id, req.session.user.id, req.session.tenant.id, "modified")
                    .then(callback());
            } else {
                callback();
            }
        });
};

ApplicationsVersioning.addApplication = function (id, req) {
    setStatusToObject("applications", id, req.session.user.id, req.session.tenant.id, "added");
};


ApplicationsVersioning.deleteApplication = function (appName, req, callback) {
    mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'applications', {name: appName}).then(function (result) {
        if ((result[0].versioning) && (result[0].versioning.status === 'committed')) {
            setStatusToObject('applications', result[0]._id, req.session.user.id, req.session.tenant.id, "deleted");
            callback();
        } else {
            callback(1);
        }
    });
};

function setStatusToObject(collection, ObjectID, userID, tenantID, status) {
    var obj                               = {};
    obj.versioning = {
        "status":      status,
        "user":        userID,
        "last_action": (new Date() / 1000).toFixed()
    };

    return mdbw.update(DB_TENANTS_PREFIX + tenantID, collection, {_id: new mongo.ObjectID(ObjectID)}, {$set: obj})
}

module.exports = ApplicationsVersioning;
