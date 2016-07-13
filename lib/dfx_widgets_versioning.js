/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */
var SETTINGS          = require('./dfx_settings'),
    mdbw              = require('./mdbw')(SETTINGS.mdbw_options),
    mongo             = require('mongodb'),
    log               = new (require('./utils/log')).Instance({label: "DFX_Widgets_Versioning"}),
    Q                 = require('q'),
    DB_TENANTS_PREFIX = SETTINGS.databases_tenants_name_prefix;

var WidgetsVersioning = function () {
};

WidgetsVersioning.getNotDeletedFilter = function (req) {
    var obj                                           = {};
    obj["versioning.status"] = {"$ne": "deleted"};
    return obj;

};

WidgetsVersioning.getNotDeletedFilterWithName = function (req, widgetName) {
    var obj                                           = {};
    obj["versioning.status"] = {"$ne": "deleted"};
    obj.name                                          = widgetName;
    return obj;
};

WidgetsVersioning.getNotCommittedFilter = function (req) {
    var obj                                           = {};
    obj["versioning.status"] = {"$ne": "committed"};
    return obj;
};

WidgetsVersioning.getRecoverFilter = function (req) {
    var obj                                           = {};
    obj["versioning.status"] = "modified";
    return obj;
};

WidgetsVersioning.getSaveAsFilter = function (req, widgetName, applicationName, platform) {
    var obj                                           = {};
    obj["versioning.status"] = "deleted";
    obj.name                                          = widgetName;
    obj.application                                   = applicationName;
    obj.platform                                      = platform;
    return obj;
};

WidgetsVersioning.setWidget = function (widgetName, applicationName, platform, req, callback) {
    mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'datawidgets', {name: widgetName, application: applicationName, platform: platform})
        .then(function (result) {
            if (result[0].versioning.status === 'committed') {
                setStatusToObject("datawidgets", result[0]._id, req.session.user.id, req.session.tenant.id, "modified")
                    .then(callback());
            } else {
                callback();
            }
        });
};

WidgetsVersioning.addWidget = function (id, req, callback) {
    mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'datawidgets', {_id: new mongo.ObjectID(id)})
        .then(function(widget){
            mdbw.rm(DB_TENANTS_PREFIX + req.session.tenant.id, 'trash', {name: widget[0].name, application: widget[0].application, type: 'datawidgets' })
                .then(function(){
                    setStatusToObject("datawidgets", id, req.session.user.id, req.session.tenant.id, "added")
                        .then(callback());
                })
        })
};

WidgetsVersioning.deleteWidget = function (widgetName, req, callback) {
    mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'datawidgets', {name: widgetName}).then(function (result) {
        if ((result[0].versioning) && (result[0].versioning.status === 'committed')) {
            setStatusToObject('datawidgets', result[0]._id, req.session.user.id, req.session.tenant.id, "deleted");
            callback();
        } else {
            callback(1);
        }
    });
};

WidgetsVersioning.moveToTrash = function (o) {
    return mdbw.get(DB_TENANTS_PREFIX + o.tenantId, 'datawidgets', {name: o.name, application: o.application, platform: o.platform})
        .then(function(datawidgets){
            datawidgets[0].type = "datawidgets";
            datawidgets[0].versioning.status = "deleted";
            return mdbw.put(DB_TENANTS_PREFIX + o.tenantId, 'trash',datawidgets[0]);
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

exports = module.exports = WidgetsVersioning;
