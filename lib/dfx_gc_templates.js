/*
 This notice must be untouched at all times.
 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds
 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.
 LICENSE: DreamFace Open License
 */
var SETTINGS          = require('./dfx_settings'),
    mdbw,
    Q                 = require('q'),
    path              = require('path'),
    endpoints         = require('./utils/endpoints'),
    log               = new (require('./utils/log')).Instance({label: "GC_TEMPLATES"}),
    tenants           = require('./dfx_sysadmin').tenant,
    fs                = require('fs'),
    jade              = require('jade');
    DB_TENANTS_PREFIX = SETTINGS.databases_tenants_name_prefix;

var GcTemplate = {};

GcTemplate.init = function( o ) {
    mdbw = o.storage;

    delete GcTemplate.init;
};

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
    },

    delete: function (parsed) {
        var D = Q.defer();
        GcTemplate.delete(parsed.gcTemplateParameters.name, parsed.gcTemplateParameters.application, parsed.gcTemplateParameters.platform, parsed.req, function (err, data) {
            return err
                ? D.resolve(err)
                : D.resolve("Template " + parsed.gcTemplateParameters.name + " was successfully deleted!");
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

GcTemplate.index = function (req, res) {
    tenants.get(req.session.tenant.id).then(function(tenant) {
        res.render('studio/gctemplate-editui-' + req.params.platform + '-index.jade', {
            "tenantid":      req.session.tenant.id,
            "username":      req.session.user.id,
            "applicationName": req.params.applicationName,
            "gcTemplateName":  req.params.gcTemplateName,
            "platform" :       req.params.platform
        });
    });
};

GcTemplate.createNew = function (gcTemplateParameters, req, callback) {
    mdbw.exists(DB_TENANTS_PREFIX + req.session.tenant.id, 'gc_templates', {
        'name':        gcTemplateParameters.name,
        'type':        gcTemplateParameters.type,
        'platform':    gcTemplateParameters.platform,
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
    var tenant_id = req.params.tenant || req.session.tenant.id;
    var filter = {application: req.params.applicationName, name: req.params.gcTemplateName, platform: req.params.platform};
    mdbw.get(DB_TENANTS_PREFIX + tenant_id, 'gc_templates', filter)
        .then(function (gc_template) {
            res.end(JSON.stringify({
                gc_template: gc_template[0]
            }));
        });
};

GcTemplate.getAll = function (req, res) {
    var filter = {application: req.params.applicationName};
    mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'gc_templates', filter)
        .then(function (gc_templates) {
            res.end(JSON.stringify({
                gc_templates: gc_templates
            }));
        });
};

GcTemplate.getAllByPlatform = function (req, res) {
    var filter = {application: req.params.applicationName, platform: req.params.platform};
    mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'gc_templates', filter)
        .then(function (gc_templates) {
            res.end(JSON.stringify({
                gc_templates: gc_templates
            }));
        });
};

GcTemplate.getAllForCompiler = function (applicationName, req, platform, callback) {
    var filter = {application: applicationName, platform: platform};
    mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'gc_templates', filter)
        .then(function (gc_templates) {
            callback(gc_templates);
        });
};

GcTemplate.getAllAsObject = function (application, platform, tenant_id) {
    var filter = {application: application, platform: platform};
    return mdbw.get(DB_TENANTS_PREFIX + tenant_id, 'gc_templates', filter)
        .then(function (gc_templates) {
            var gc_templates_as_object = {};
            gc_templates.forEach(function(gc_template) {
                gc_templates_as_object[gc_template.name] = gc_template;
            });;
            return Q.resolve(gc_templates_as_object);
        });
};

GcTemplate.getByType = function (req, res) {
    var filter = {application: req.params.applicationName, type: req.params.gcTemplateType, platform: req.params.platform};
    mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'gc_templates', filter)
        .then(function (gc_templates) {
            res.end(JSON.stringify({
                gc_templates: gc_templates
            }));
        });
};

GcTemplate.set = function (gcTemplate, req, callback) {
    gcTemplate.requestDate = new Date();
    mdbw.update(DB_TENANTS_PREFIX + req.session.tenant.id, 'gc_templates', {
        'name':        gcTemplate.name,
        'platform':    gcTemplate.platform,
        'application': gcTemplate.application
    }, {$set: gcTemplate})
        .then(function (quantity) {
            callback(null);
        })
        .fail(function (err) {
            log.error(err);
        });
};

GcTemplate.delete = function (gc_template_name, app_name, platform, req, callback) {
    var filter = {
        name:    gc_template_name,
        application: app_name,
        platform : platform
    };

    mdbw.getOne(DB_TENANTS_PREFIX + req.session.tenant.id, 'gc_templates', filter).then(function (gc_template) {
        mdbw.rm(DB_TENANTS_PREFIX + req.session.tenant.id, 'gc_templates', filter).then(function (quantity_scrs) {
            callback(quantity_scrs);
        });
    }).fail(function (err) {
        log.error('Template Deleting Error: ', err);
    });
};

GcTemplate.editui = function (req, res) {
    var filter = {application: req.params.applicationName, name: req.params.gcTemplateName, platform: req.params.platform};
    mdbw.getOne(DB_TENANTS_PREFIX + req.session.tenant.id, 'gc_templates', filter).then(function (gc_template) {
        gc_template.attributes = JSON.stringify(gc_template.attributes, null, '\t'); // JADE editor needs a string

        fs.readFile(path.join(__dirname, '..', 'templates/studio/gctemplates/gctemplate_visual_editor.jade'), 'utf8', function (err, data) {
            if (err) throw err;
            var fn   = jade.compile(data, {
                filename: path.join(__dirname, '..', 'templates/studio/gctemplates/gctemplate_visual_editor.jade')
            });
            var body = fn({
                gc_template: gc_template
            });
            res.setHeader('Content-Type', 'text/html');
            res.setHeader('Content-Length', body.length);
            res.end(body);
        });
    });
};

module.exports = GcTemplate;
