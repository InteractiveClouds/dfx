/*
 This notice must be untouched at all times.
 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds
 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.
 LICENSE: DreamFace Open License
 */
var SETTINGS          = require('./dfx_settings'),
    mdbw              = require('./mdbw')(SETTINGS.mdbw_options),
    Q                 = require('q'),
    path              = require('path'),
    endpoints         = require('./utils/endpoints'),
    versioning        = require('./dfx_applications_versioning'),
    log               = new (require('./utils/log')).Instance({label: "GC_TEMPLATES"}),
    fs                = require('fs');
    DB_TENANTS_PREFIX = SETTINGS.databases_tenants_name_prefix;

var GcTemplate = {};

var api = {
    create: function (parsed) {
        var D = Q.defer();
        GcTemplate.createNew(parsed.gcTemplateParameters, parsed.req, function (err, data) {
            return err
                ? D.reject(err)
                : D.resolve('Component Template created!')
        });
        return D.promise;
    },

    update: function (parsed) {
        var D = Q.defer();
        GcTemplate.set(parsed.gcTemplateParameters.change, parsed.req, function (err, data) {
            return err
                ? D.reject("Something went wrong saving template " + parsed.gcTemplateParameters.change.name)
                : D.resolve("Template " + parsed.gcTemplateParameters.change.name + " has been updated successfully!");
        });
        return D.promise;
    }
};

GcTemplate.api = endpoints.json({
    parser: function (req) {
        return {
            action: req.params.action,
            data:   {
                gcTemplateParameters: req.body,
                req:              req
            }
        }
    },
    action: api,
    log:    log
});

GcTemplate.createNew = function (gcTemplateParameters, req, callback) {
    mdbw.exists(DB_TENANTS_PREFIX + req.session.tenant.id, 'gc_templates', {
        'name':        gcTemplateParameters.name,
        'type':        gcTemplateParameters.type,
        'description': gcTemplateParameters.description,
        'application': gcTemplateParameters.application,
        'definition':  gcTemplateParameters.definition
    }).then(function (exists) {
        if (!exists) {
            mdbw.put(DB_TENANTS_PREFIX + req.session.tenant.id, 'gc_templates', gcTemplateParameters)
                .then(function (gc_template_id) {
                    callback(null, gc_template_id);
                });
        } else {
            callback("Current component template name already exists!", null);
        }
    });
};

GcTemplate.select = function (req, res) {
    var filter = {application: req.params.applicationName, name: req.params.gcTemplateName};
    mdbw.getOne(DB_TENANTS_PREFIX + req.session.tenant.id, 'gc_templates', filter)
        .then(function (gc_template) {
            res.end(JSON.stringify({
                gc_template: gc_template
            }));
        });
};

GcTemplate.getAll = function (applicationName, req, callback) {
    var filter = {application: applicationName};
    mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'gc_templates', filter)
        .then(function (docs) {
            callback(docs);
        });
};

GcTemplate.getByType = function (req, res) {
    var filter = {application: req.params.applicationName, type: req.params.gcTemplateType};
    mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'gc_templates', filter)
        .then(function (gc_templates) {
            res.end(JSON.stringify({
                gc_templates: gc_templates
            }));
        });
};

/*
ScreenTemplate.list = function (req, res) {
    ScreenTemplate.selectAll(req.params.applicationName, ['name','layout'], req, function (arr_screens_templates) {
        res.end(JSON.stringify({
            screens_templates: arr_screens_templates
        }));
    });
};

ScreenTemplate.selectAll = function (applicationName, fields, req, callback) {
    var filter = {application: applicationName};
    mdbw.select(DB_TENANTS_PREFIX + req.session.tenant.id, 'screens_templates', filter, fields)
        .then(function (docs) {
            callback(docs);
        });
};
*/
GcTemplate.set = function (gcTemplate, req, callback) {
    gcTemplate.requestDate = new Date();
    mdbw.update(DB_TENANTS_PREFIX + req.session.tenant.id, 'gc_templates', {
        name:        gcTemplate.name,
        type:        gcTemplate.type,
        description: gcTemplate.description,
        application: gcTemplate.application,
        definition:  gcTemplate.definition
    }, {$set: gcTemplate})
        .then(function (quantity) {
            callback(null);
        })
        .fail(function (err) {
            log.error(err);
        });
};

module.exports = GcTemplate;
