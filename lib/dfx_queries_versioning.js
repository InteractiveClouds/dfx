/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */
var SETTINGS = require('./dfx_settings'),
    mdbw = require('./mdbw')(SETTINGS.mdbw_options),
    mongo = require('mongodb'),
    log = new (require('./utils/log')).Instance({label: "DFX_Queries_Versioning"}),
    Q = require('q');

var DB_TENANTS_PREFIX = SETTINGS.databases_tenants_name_prefix;

var QueriesVersioning = function () {
};

QueriesVersioning.getNotDeletedFilter = function (req) {
    var obj = {};
    obj["versioning.status"] = {"$ne": "deleted"};
    return obj;

};

QueriesVersioning.getNotDeletedFilterWithName = function (req, queryName) {
    var obj                                           = {};
    obj["versioning.status"] = {"$ne": "deleted"};
    obj.name                                          = queryName;
    return obj;
};

QueriesVersioning.getNotCommittedFilter = function (req) {
    var obj = {};
    obj["versioning.status"] = {"$ne": "committed"};
    return obj;
};

QueriesVersioning.getSaveAsFilter = function (req, queryName, applicationName) {
    var obj = {};
    obj["versioning.status"] = {"$ne": "deleted"};
    obj["name"] = queryName;
    obj["application"] = applicationName;
    return obj;
};

QueriesVersioning.createNewQueryFilter = function (req, queryName, applicationName) {
    var obj = {};
    obj["versioning.status"] = "deleted";
    obj["name"] = queryName;
    obj["application"] = applicationName;
    return obj;
};

QueriesVersioning.setQuery = function (qName, applicationName, req, callback) {
    mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'dataqueries', {name: qName, application: applicationName})
        .then(function (result) {
            if (result[0].versioning.status === 'committed') {
                setStatusToObject("dataqueries", result[0]._id, req.session.user.id, req.session.tenant.id, "modified")
                    .then(callback());
            } else {
                callback();
            }
        });
};


QueriesVersioning.addQuery = function (id, req, callback) {
    mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'dataqueries', {_id: new mongo.ObjectID(id)})
        .then(function(dq){
            mdbw.rm(DB_TENANTS_PREFIX + req.session.tenant.id, 'trash', {name: dq[0].name, application: dq[0].application, type: 'dataqueries'})
                .then(function(){
                    setStatusToObject("dataqueries", id, req.session.user.id, req.session.tenant.id, "added")
                        .then(callback());
                })
        })
};

QueriesVersioning.deleteQuery = function (qName, req, callback) {
    mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'dataqueries', {name: qName}).then(function (result) {
        if ((result[0].versioning) && (result[0].versioning.status === 'committed')) {
            setStatusToObject('dataqueries', result[0]._id, req.session.user.id, req.session.tenant.id, "deleted");
            callback();
        } else {
            callback(1);
        }
    });
};

QueriesVersioning.moveToTrash = function (o) {
    return mdbw.get(DB_TENANTS_PREFIX + o.tenantId, 'dataqueries', {name: o.name, application: o.application})
        .then(function(dataqueries){
            dataqueries[0].type = "dataqueries";
            dataqueries[0].versioning.status = "deleted";
            return mdbw.put(DB_TENANTS_PREFIX + o.tenantId, 'trash',dataqueries[0]);
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

exports = module.exports = QueriesVersioning;
