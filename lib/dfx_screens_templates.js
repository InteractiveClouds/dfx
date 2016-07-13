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
    log               = new (require('./utils/log')).Instance({label: "SCREENS_TEMPLATES"}),
    fs                = require('fs');
    DB_TENANTS_PREFIX = SETTINGS.databases_tenants_name_prefix;

var ScreenTemplate = {};

var api = {
    create: function (parsed) {
        var D = Q.defer();
        ScreenTemplate.createNew(parsed.screenTemplateParameters, parsed.req, function (err, data) {
            return err
                ? D.reject(err)
                : D.resolve('Page Template created!')
        });
        return D.promise;
    },

    update: function (parsed) {
        var D = Q.defer();
        ScreenTemplate.set(parsed.screenTemplateParameters.change, parsed.req, function (err, data) {
            return err
                ? D.reject("Something went wrong saving template " + parsed.screenTemplateParameters.change.name)
                : D.resolve("Template " + parsed.screenTemplateParameters.change.name + " has been updated successfully!");
        });
        return D.promise;
    }
};

ScreenTemplate.api = endpoints.json({
    parser: function (req) {
        return {
            action: req.params.action,
            data:   {
                screenTemplateParameters: req.body,
                req:              req
            }
        }
    },
    action: api,
    log:    log
});

ScreenTemplate.createNew = function (screenTemplateParameters, req, callback) {
    fs.readFile(path.join(__dirname, '..', 'templates/static_json/screentpl/header.html'), 'utf8', function (err, header_tpl) {
        if (err) {
            log.error(err);
        } else {
            screenTemplateParameters.layout.header.content.value = header_tpl;
        }
        fs.readFile(path.join(__dirname, '..', 'templates/static_json/screentpl/footer.html'), 'utf8', function (err_footer, footer_tpl) {
            if (err_footer) {
                log.error(err_footer);
            } else {
                screenTemplateParameters.layout.footer.content.value = footer_tpl;
            }
            mdbw.exists(DB_TENANTS_PREFIX + req.session.tenant.id, 'screens_templates', {
                'name':        screenTemplateParameters.name,
                'application': screenTemplateParameters.application
            }).then(function (exists) {
                if (!exists) {
                    mdbw.put(DB_TENANTS_PREFIX + req.session.tenant.id, 'screens_templates', screenTemplateParameters)
                        .then(function (screen_template_id) {
                            callback(null, screen_template_id);
                        });
                } else {
                    callback("Current screen template name already exists!", null);
                }
            });
        });
    });
};

ScreenTemplate.select = function (req, res) {
    var filter = {application: req.params.applicationName, name: req.params.screenTemplateName};
    mdbw.getOne(DB_TENANTS_PREFIX + req.session.tenant.id, 'screens_templates', filter)
        .then(function (screenTemplate) {
            res.end(JSON.stringify({
                screenTemplate: screenTemplate
            }));
        });
};

ScreenTemplate.getAll = function (applicationName, req, callback) {
    var filter = {application: applicationName};
    mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'screens_templates', filter)
        .then(function (docs) {
            callback(docs);
        });
};

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

ScreenTemplate.set = function (screenTemplate, req, callback) {
    screenTemplate.requestDate = new Date();
    mdbw.update(DB_TENANTS_PREFIX + req.session.tenant.id, 'screens_templates', {
        name:        screenTemplate.name,
        application: screenTemplate.application
    }, {$set: screenTemplate})
        .then(function (quantity) {
            callback(null);
        })
        .fail(function (err) {
            log.error(err);
        });
};

ScreenTemplate.getDefaultHeader = function() {
    fs.readFile(path.join(__dirname, '..', 'templates/static_json/screentpl/header.html'), 'utf8', function (err, data) {
        if (err) {
            log.error(err);
            return '';
        }
        return data;
    });
};

ScreenTemplate.getDefaultFooter = function() {
    fs.readFile(path.join(__dirname, '..', 'templates/static_json/screentpl/footer.html'), 'utf8', function (err, data) {
        if (err) {
            log.error(err);
            return '';
        }
        return data;
    });
};

module.exports = ScreenTemplate;