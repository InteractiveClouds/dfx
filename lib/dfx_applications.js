/*
 This notice must be untouched at all times.
 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds
 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.
 LICENSE: DreamFace Open License
 */
var SETTINGS   = require('./dfx_settings'),
    Q          = require('q'),
    mdbw,
    path       = require('path'),
    fs         = require('graceful-fs'),
    QFS        = require('q-io/fs'),
    jade       = require('jade'),
    _          = require('lodash'),
    menus      = require('./dfx_menus'),
    log        = new (require('./utils/log')).Instance({label: "DFX_Applications"}),
    endpoints  = require('./utils/endpoints'),
    limit      = require('./dfx_sysadmin').tenant.limits,
    roles      = require('./dfx_sysadmin').tenant.role,
    sysadmin   = require('./dfx_sysadmin');
    async      = require('async');

var DB_TENANTS_PREFIX = SETTINGS.databases_tenants_name_prefix,
    RESOURCES_DEV_PATH = SETTINGS.resources_development_path,
    DB_SORT_ASC       = 1,
    DB_SORT_DESC      = -1;
var Application       = {};

if ( SETTINGS.studio ) {
    var screens             = require('./dfx_screens');
    var screens_templates   = require('./dfx_screens_templates');
    var screen_categories   = require('./dfx_screens_categories.js');
    var widgets             = require('./dfx_widgets');
    var categories          = require('./dfx_screens_categories.js');
    var versioning          = require('./dfx_applications_versioning');
    var dataqueries         = require('./dfx_queries');
}

Application.init = function( o ) {
    mdbw = o.storage;

    delete Application.init;
};

var api         = {

    get : function (parsed) {
        var D = Q.defer();
        Application.get(parsed.applicationName, parsed.req, function (err, data) {
            return err
                ? D.reject(err)
                : D.resolve(data);
        });
        return D.promise;
    },

    getEnv: function (parsed) {
        return Application.getGeneratedEnvironment(parsed);
    },

    create: function (parsed) {
        var D = Q.defer();
        Application.createNew(parsed.applicationParameters, parsed.req, function (err, data) {
            return err
                ? D.reject(err)
                : D.resolve('Application created!');
        });
        return D.promise;
    },

    'delete': function (parsed) {
        var D = Q.defer();
        Application.deleteApplication(parsed.applicationParameters.applicationName, parsed.req, function (err, data) {
            return err
                ? D.reject(err)
                : D.resolve("Application " + parsed.applicationParameters.applicationName + " was successfully deleted!");
        });
        return D.promise;
    },

    update: function (parsed) {
        var D = Q.defer();
        Application.set(parsed.applicationName, parsed.applicationParameters, parsed.req, function (err, data) {
            return !data
                ? D.reject(err)
                : D.resolve("Application " + parsed.applicationName + " has been updated successfully!");
        });
        return D.promise;
    },

    recover: function (parsed) {
        var D = Q.defer();
        Application.recover(parsed.applicationParameters.name, parsed.req, function (err, data) {
            return err
                ? D.reject(err)
                : D.resolve('Application was recovered!')
        });
        return D.promise;
    },

    updateConf: function (parsed) {
        var D = Q.defer();
        Application.updateConfiguration(parsed.applicationName, parsed.req, parsed.applicationParameters, function (err) {
            return err
                ? D.reject(err)
                : D.resolve('Application configuration has been successfully updated!')
        });
        return D.promise;
    },

    copyObject: function (parsed) {
        var D = Q.defer();
        Application.copyObject(parsed.applicationParameters, parsed.req, function (err, data) {
            var response = {
                type : err ? 'error' : 'success',
                message : err ? err : data
            };
            return D.resolve(response);
        });
        return D.promise;
    },

    copyCategory: function (parsed) {
        var D = Q.defer();
        Application.copyCategory(parsed.applicationParameters, parsed.req, function(err, data){
            return err
                ? D.reject(err)
                : D.resolve(data)
        });
        return D.promise;
    },

    getUserInfo: function (parsed) {
        return Application.getUserInfo(parsed);
    }
};
Application.api = endpoints.json({
    parser: function (req) {
        return {
            action: req.params.action,
            data:   {
                applicationName:       req.params.applicationName || req.query.applicationName,
                applicationParameters: req.body,
                req:                   req
            }
        }
    },
    action: api,
    log:    log
});

Application.getUserInfo = function(parsed) {
    var user_id = parsed.req.session.user.id;
    var tenant_id = parsed.req.session.tenant.id;
    return sysadmin.tenant.user.list(tenant_id, false, '', '', {"credentials.login" : user_id});
}

Application.copyObject = function(data, req, cb) {
    switch (data.type){
        case 'widget' :
            widgets.get(data.widgetName, data.applicationName, data.platform, req, function(content){
                var widgetParameters =  {
                    application : data.applicationTarget,
                    name : data.saveAsName,
                    ownerId : content.ownerId,
                    description : content.description,
                    category : data.categoryTarget,
                    wtype : content.wtype,
                    platform : data.platform,
                    src : content.src,
                    src_script : content.src_script.replace(new RegExp(data.widgetName,'g'), data.saveAsName),
                    src_styles : content.src_styles || ''
                }
                return widgets.createNew(widgetParameters, req, cb);
            });
            break;
        case 'dataquery' :
            req.params.applicationName = data.applicationName;
            dataqueries.get(data.queryName, req, function(content){
                if (data.prefix) {
                    var newRoutes = {};
                    for (var key in content.apiRoutes) {
                        newRoutes[data.prefix + '/' + key] = content.apiRoutes[key];
                    }
                    content.apiRoutes = newRoutes;
                }
                var queryParameters = {
                    application : data.applicationTarget,
                    name : data.saveAsName,
                    apiRoutes : content.apiRoutes,
                    ownerId : content.ownerId,
                    description : content.description,
                    persistence : content.persistence,
                    selector : content.selector,
                    visibility : content.visibility,
                    lock : content.lock,
                    category : data.categoryTarget,
                    service : content.service
                }
                return dataqueries.createNew(queryParameters, req, cb);
            });
            break;
        case 'screen' :
            screens.get(data.screenName, data.applicationName, data.platform, req, function(content){
                var screenParametres = {
                    application : data.applicationTarget,
                    category : data.categoryTarget,
                    layout : content.layout,
                    name : data.saveAsName,
                    platform : data.platform,
                    script : content.script,
                    template : content.template,
                    title : content.title,
                    visibility : content.visibility
                };
                return screens.createNew(screenParametres, req, cb);
            });
            break;
        default : return cb('Unknown type', null); break;
    }
}



Application.copyCategory = function(data, req, cb) {
    req.query = {application : data.applicationName};
    req.cb = function (tree) {
        switch (data.type) {
            case 'widget' :
                var categoryParametres = {
                    application : data.applicationTarget,
                    name : data.categoryTarget,
                    platform : data.platform
                }
                widgets.createNewCat(categoryParametres, req, function(err, res){
                    if (err) {
                        return cb(err, null);
                    } else {
                        async.each(tree.views[data.platform][data.categoryName],function(view, cb){
                            var objParams = {
                                "applicationName": data.applicationName,
                                "applicationTarget": data.applicationTarget,
                                "categoryTarget": data.categoryTarget,
                                "platform": data.platform,
                                "widgetName": view.name,
                                "saveAsName": view.name,
                                "type": "widget"
                            }
                            Application.copyObject(objParams, req, cb);
                        },function(err, data){
                            return err ? cb(err, null)
                                : cb(null,'Copied');
                        });
                    }
                });
                break;

            case 'dataquery' :
                var categoryParametres = {
                    application : data.applicationTarget,
                    name : data.categoryTarget
                }
                dataqueries.createNewCat(categoryParametres, req, function(err, res){
                    if (err) {
                        return cb(err, null);
                    } else {
                        async.each(tree.apiServices[data.categoryName],function(query, cb){
                            var objParams = {
                                "applicationName": data.applicationName,
                                "applicationTarget": data.applicationTarget,
                                "categoryTarget": data.categoryTarget,
                                "queryName": query.name,
                                "saveAsName": query.name,
                                "prefix" : data.prefix,
                                "type": "dataquery"
                            }
                            Application.copyObject(objParams, req, cb);
                        },function(err, data){
                            return err ? cb(err, null)
                                : cb(null,'Copied');
                        });
                    }
                });
                break;
            case 'screen' :
                var categoryParametres = {
                    application : data.applicationTarget,
                    name : data.categoryTarget,
                    title : data.categoryTarget,
                    platform: data.platform
                }
                screen_categories.createNew(categoryParametres, req, function(err, res){
                    if (err) {
                        return cb(err, null);
                    } else {
                        async.each(tree.pages[data.platform][data.categoryName],function(screen, cb){
                            var objParams = {
                                "applicationName": data.applicationName,
                                "applicationTarget": data.applicationTarget,
                                "categoryTarget": data.categoryTarget,
                                "screenName": screen.name,
                                "platform": data.platform,
                                "saveAsName": screen.name,
                                "type": "screen"
                            }
                            Application.copyObject(objParams, req, cb);
                        },function(err, data){
                            return err ? cb(err, null)
                                : cb(null,'Copied');
                        });
                    }
                });
                break;
            default : return cb("Unknown type", null); break;
        }
    };
    require('./dfx_studio').tree(req);
}



Application.activate = function (data) {
    if (!data.apps || !(data.apps instanceof Array)) return Q.reject("Object data.apps must be Array type!");
    return limit.get({tenant: data.tenantId, limit: "applications"})
        .then(function (appLimit) {
            return Application.getAllActive(data.tenantId)
                .then(function (appList) {
                    var diff               = appLimit - appList.length;
                    var activeAppList      = appList.map(function (app) {
                        return app.name;
                    });
                    var appForActivateList = data.apps.filter(function (app) {
                        return (activeAppList.indexOf(app.toString()) === -1);
                    });
                    if ((appForActivateList.length > diff) && (appLimit !== 0)) return Q.reject("You can't activate so many applications because you will exceed the limit!");
                    if (appForActivateList.length === 0) return Q.reject("Applications [" + data.apps + "] is already activated!");
                    console.log("Applications [" + appForActivateList + "] will be activated");
                    var tasks              = appForActivateList.map(function (app) {
                        return mdbw.update(
                            DB_TENANTS_PREFIX + data.tenantId,
                            'applications',
                            {name: app.toString()}, {$set: {active: true}}
                        );
                    });
                    return Q.all(tasks);
                });
        });
};

Application.deactivate = function (data) {
    console.log("Applications [" + data.apps + "] will be deactivated");
    var tasks = data.apps.map(function (app) {
        return mdbw.update(
            DB_TENANTS_PREFIX + data.tenantId,
            'applications',
            {name: app.toString()}, {$set: {active: false}}
        );
    });
    return Q.all(tasks);
};

Application.isActive = function (data) {
    return mdbw.exists(
        DB_TENANTS_PREFIX + data.tenantId,
        'applications',
        {name: data.app.toString(), active: true}
    );
};

Application.getAllActive = function (tenant) {
    return mdbw.get(
        DB_TENANTS_PREFIX + tenant,
        'applications',
        {active: true}
    );
};

Application.count = function (req, res) {
    var filter = versioning.getAllApplicationsFilter(req);
    mdbw.count(DB_TENANTS_PREFIX + req.session.tenant.id, 'applications', filter)
        .then(function (quantity) {
            var data = JSON.stringify({
                apps_number: quantity
            }, null, 0);
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('Content-Length', data.length);
            res.end(data);
        })
        .fail(function (error) {
            log.error(error);
        });
};

Application.getTemplates = function (req, res) {
    res.end(JSON.stringify({templates: SETTINGS.templates}));
};

Application.view = function (req, res) {
    sysadmin.tenant.role.list({tenant: req.session.tenant.id}).then(function (roles) {
        Application.get(req.params.applicationName, req, function (application) {
            if (!application.github) {
                application.github = {
                    "token":      "",
                    "username":   "",
                    "repository": ""
                };
            }
            if (!application.phonegap) {
                application.phonegap = {
                    "token":         "",
                    "applicationId": ""
                };
            }
            application.github.token           = application.github.token || "";
            application.phonegap.token         = application.phonegap.token || "";
            application.phonegap.applicationId = application.phonegap.applicationId || "";
            fs.readFile(path.join(__dirname, '..', 'templates/studio/application.jade'), 'utf8', function (err, data) {
                if (err) throw err;
                var fn   = jade.compile(data);
                var body = fn({
                    application: application,
                    templates:   SETTINGS.templates,
                    roles:       _.remove(roles, function (e) {
                        return !e.name.match(/^admin|developer$/);
                    }),
                    tenantid:    req.session.tenant.id
                });
                res.setHeader('Content-Type', 'text/html');
                res.setHeader('Content-Length', body.length);
                res.end(body);
            });
        });
    });
};

Application.menu = function (req, res) {
    Application.getFullDefinition(req.params.applicationName, req, function (application) {
        menus.getAll(req.params.applicationName, req, function (menuItems) {
            var tpl_filename = application.platform === 'web' ? 'templates/studio/web_application_menu.jade' : 'templates/studio/mobile_application_menu.jade';
            fs.readFile(path.join(__dirname, '..', tpl_filename), 'utf8', function (err, data) {
                if (err) throw err;
                var fn   = jade.compile(data, {
                    filename: path.join(__dirname, '..', tpl_filename, req.params.gc_type + '.jade')
                });
                var body = fn({
                    application: application,
                    menuItems:   menuItems
                });
                res.setHeader('Content-Type', 'text/html');
                res.setHeader('Content-Length', body.length);
                res.end(body);
            });
        });
    });
};

Application.screens = function (req, res) {
    Application.getFullDefinition(req.params.applicationName, req, function (application) {
        categories.getAll(req.params.applicationName, req, function (categories) {
            screens.getAll(req.params.applicationName, req, function (screens) {
                fs.readFile(path.join(__dirname, '..', 'templates/studio/application_screens.jade'), 'utf8', function (err, data) {
                    if (err) throw err;
                    var fn   = jade.compile(data);
                    var body = fn({
                        application: application,
                        categories:  categories,
                        screens:     screens
                    });
                    res.setHeader('Content-Type', 'text/html');
                    res.setHeader('Content-Length', body.length);
                    res.end(body);
                });
            });
        });
    });
};

Application.getApplicationMenu = function (req, res) {
    Application.getFullDefinition(req.params.applicationName, req, function (application) {
        menus.getAll(req.params.applicationName, req, function (menuItems) {
            fs.readFile(path.join(__dirname, '..', 'templates/studio/configure-application-menu.jade'), 'utf8', function (err, data) {
                if (err) throw err;
                var fn   = jade.compile(data, {
                    filename: path.join(__dirname, '..', 'templates/studio/configure-application-menu.jade', req.params.gc_type + '.jade')
                });
                var body = fn({
                    application: application,
                    role:        req.params.role,
                    menuItems:   menuItems
                });
                res.setHeader('Content-Type', 'text/html');
                res.setHeader('Content-Length', body.length);
                res.end(body);
            });
        });
    });
};

Application.getApplicationMenuData = function (req, res) {
    Application.getFullDefinition(req.params.applicationName, req, function (application) {
        menus.getAll(req.params.applicationName, req, function (menuItems) {
            var data = {
                    application: application,
                    role:        req.params.role,
                    menuItems:   menuItems
                },
                body = JSON.stringify(data, null, 0).replace(/[\u007f-\uffff]/g,
                    function(c) {
                        return '\\u'+('0000'+c.charCodeAt(0).toString(16)).slice(-4);
                    }
                );
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('Content-Length', body.length);
            res.end(body);
        });
    });
};

Application.getApplicationScreens     = function (req, res) {
    Application.getFullDefinition(req.params.applicationName, req, function (application) {
        categories.getAll(req.params.applicationName, req, function (categories) {
            screens.getAll(req.params.applicationName, req, function (screens) {
                fs.readFile(path.join(__dirname, '..', 'templates/studio/configure-application-graphical-components.jade'), 'utf8', function (err, data) {
                    if (err) throw err;
                    var fn   = jade.compile(data);
                    var body = fn({
                        application: application,
                        categories:  categories,
                        screens:     screens,
                        role:        req.params.role
                    });
                    res.setHeader('Content-Type', 'text/html');
                    res.setHeader('Content-Length', body.length);
                    res.end(body);
                });
            });
        });
    });
};

Application.getApplicationScreensData = function (req, res) {
    Application.getFullDefinition(req.params.applicationName, req, function (application) {
        categories.getAll(req.params.applicationName, req, function (categories) {
            screens.getAll(req.params.applicationName, req, function (screens) {
                var data = {
                        application: application,
                        categories:  categories,
                        screens:     screens,
                        role:        req.params.role
                    },
                    body = JSON.stringify(data);
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Length', body.length);
                res.end(body);
            });
        });
    });
};

Application.getApplicationWidgetsData = function (req, res) {
    Application.getFullDefinition(req.params.applicationName, req, function (application) {
        widgets.getAllCat(req, function (categories) {
            widgets.getAllWithFilter({application: req.params.applicationName}, req, function (widgets) {
                var data = {
                        application: application,
                        categories:  categories,
                        widgets:     widgets
                    },
                    body = JSON.stringify(data);
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Length', body.length);
                res.end(body);
            });
        })
    });
};

Application.getApplicationPlatform = function (req, res) {
    mdbw.select(DB_TENANTS_PREFIX + req.session.tenant.id, 'applications', {name: req.params.applicationName}, {platform: true}).then(function (docs) {
        var data = {
                platform: docs[0].platform
            },
            body = JSON.stringify(data);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Length', body.length);
        res.end(body);
    });
};

Application.getApplicationSnapshot = function (req, res) {
    Application.getSnapshot(req.params.applicationName, req, function (snapshot) {
        fs.readFile(path.join(__dirname, '..', 'templates/studio/configure-application-snapshot.jade'), 'utf8', function (err, data) {
            if (err) throw err;
            var fn   = jade.compile(data);
            var body = fn({
                application: req.params.applicationName,
                snapshot:    snapshot
            });
            res.setHeader('Content-Type', 'text/html');
            res.setHeader('Content-Length', body.length);
            res.end(body);
        });
    });
};

Application.getApplicationMatrix = function (req, res) {
    Application.getSnapshot(req.params.applicationName, req, function (matrix) {
        var body = JSON.stringify({matrix: matrix});
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Length', body.length);
        res.end(body);
    });
};

Application.getApplicationConfiguration = function (req, res) {
    Application.getConfiguration(req.params.applicationName, req, req.body, function (app_config) {
        var data = JSON.stringify(app_config, null, 0);
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Content-Length', data.length);
        res.end(data);
    })
};

Application.getAll = function (req, callback) {
    var filter = versioning.getAllApplicationsFilter(req);
    mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'applications', filter)
        .then(function (docs) {
            callback(docs);
        });
};

Application.getAllSorted = function (req, callback) {
    var filter = versioning.getAllApplicationsFilter(req);
    mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'applications', filter, {name: DB_SORT_ASC})
        .then(function (docs) {
            callback(docs);
        });
};

Application.getList = function (req, res) {
    Application.selectAll({name: true}, req, function (apps) {
        var retval = [];
        apps.forEach(function (app) {
            retval.push(app.name);
        });
        var data = JSON.stringify({apps: retval}, null, 0);
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Content-Length', data.length);
        res.end(data);
    });
};

Application.getListWithPlatformsAndWidgetCats = function (req, res) {
    Application.selectAll({ name: true, platform: true }, req, function (apps) {
        widgets.getTenantCategories(req, function(widgetCategories) {
            var result = [];
            apps.push({ name: '' });//entry for shared catalog
            apps.forEach(function (app) {
                var appDataItem = { name: app.name, platform: app.platform, widgetCategories: [] };

                for (var i = 0; i < widgetCategories.length; i++) {
                    if (widgetCategories[i].application == app.name) {
                        appDataItem.widgetCategories.push({ name: widgetCategories[i].name, platform: widgetCategories[i].platform });
                    }
                }

                result.push(appDataItem);
            });
            var data = JSON.stringify({ apps: result }, null, 0);
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('Content-Length', data.length);
            res.end(data);
        });
    });
};

Application.getListWithPlatformsAndQueryCats = function (req, res) {
    Application.selectAll({ name: true, platform: true }, req, function (apps) {
        var queries = require('./dfx_queries');
        queries.getTenantCategories(req, function(queryCategories) {
            var result = [];
            apps.push({ name: '' });//entry for shared catalog
            apps.forEach(function (app) {
                var appDataItem = { name: app.name, platform: app.platform, queryCategories: [] };

                for (var i = 0; i < queryCategories.length; i++) {
                    if (queryCategories[i].application == app.name) {
                        appDataItem.queryCategories.push(queryCategories[i].name);
                    }
                }

                result.push(appDataItem);
            });
            var data = JSON.stringify({ apps: result }, null, 0);
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('Content-Length', data.length);
            res.end(data);
        });
    });
};

Application.selectAll = function (fields, req, callback) {
    var filter = versioning.getAllApplicationsFilter(req);
    mdbw.select(DB_TENANTS_PREFIX + req.session.tenant.id, 'applications', filter, fields).then(function (docs) {
        callback(docs);
    });
};

Application.get = function (appname, req, callback) {
    var filter = versioning.getApplicationFilter(appname, req);
    mdbw.getOne(DB_TENANTS_PREFIX + req.session.tenant.id, 'applications', filter)
        .then(function (doc) {
            mdbw.getOne(DB_TENANTS_PREFIX + req.session.tenant.id, 'gc_extensions', {'extension_type': 'directives'})
                .then(function (gc_extensions) {
                    var gc_extensions_obj = {};
                    var i;
                    if (gc_extensions != null) {
                        for (i = 0; i < gc_extensions.extensions.length; i++) {
                            if (!gc_extensions_obj[gc_extensions.extensions[i].gcname]) {
                                gc_extensions_obj[gc_extensions.extensions[i].gcname] = {};
                            }
                            gc_extensions_obj[gc_extensions.extensions[i].gcname][gc_extensions.extensions[i].attribute] = gc_extensions.extensions[i].directive;
                        }
                    }
                    doc.directives = gc_extensions_obj;
                    callback(null, doc);
                });
        });
};

Application.read = function (req, res) {
    sysadmin.tenant.role.list({tenant: req.session.tenant.id}).then(function (roles) {
        Application.get(req.params.applicationName, req, function (err, application) {
            if (!application.github) {
                application.github = {
                    "token":      "",
                    "username":   "",
                    "repository": ""
                };
            }
            if (!application.phonegap) {
                application.phonegap = {
                    "token":         "",
                    "applicationId": ""
                };
            }
            application.github.token           = application.github.token || "";
            application.phonegap.token         = application.phonegap.token || "";
            application.phonegap.applicationId = application.phonegap.applicationId || "";
            application.tenant = req.session.tenant.id;
            application.user = req.session.user.id;
            res.end(JSON.stringify({
                application: application
            }));
        });
    });
};

/*
 Get the full application definition including its associated screens
 */
Application.getFullDefinition = function (appname, req, callback) {
    var filterObj = versioning.getFullDefinitionOfApplicationFilters(appname, req);
    var that      = this;
    mdbw.getOne(DB_TENANTS_PREFIX + req.session.tenant.id, 'applications', filterObj.appFilter)
        .then(function (app_item) {
            mdbw.getOne(DB_TENANTS_PREFIX + req.session.tenant.id, 'gc_extensions', {'extension_type': 'directives'})
                .then(function (gc_extensions) {
                    var gc_extensions_obj = {};
                    var i;
                    if (gc_extensions) {
                        for (i = 0; i < gc_extensions.length; i++) {
                            if (!gc_extensions_obj[gc_extensions[i].gcname]) {
                                gc_extensions_obj[gc_extensions[i].gcname] = {};
                            }
                            gc_extensions_obj[gc_extensions[i].gcname][gc_extensions[i].attribute] = gc_extensions[i].directive;
                        }
                    }
                    app_item.directives = gc_extensions_obj;
                    mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'screens', filterObj.scrFilter)
                        .then(function (screen_items) {
                            var screens_tree  = new Array();
                            var i             = 0;
                            var hasMoreScreen = false;
                            do {
                                var hasMoreScreen = false;
                                for (i = 0; i < screen_items.length; i++) {
                                    var screen_item = screen_items[i];
                                    if (screen_item._status == null || screen_item._status == 0) {
                                        if (screen_item.parentname == null) {
                                            screen_item.children = [];
                                            screens_tree.push(screen_item);
                                            screen_item._status  = 1;
                                        } else {
                                            var parent_item = that._getScreenItem(screen_item.parentname, screens_tree);
                                            if (parent_item != null) {
                                                screen_item._status  = 1;
                                                screen_item.children = [];
                                                parent_item.children.push(screen_item);
                                            } else {
                                                screen_item._status = 0;
                                                hasMoreScreen       = true;
                                            }
                                        }
                                    }
                                }
                            } while (hasMoreScreen);
                            app_item.screens = screens_tree;
                            callback(app_item);
                        });
                }).fail(function (err) {
                    log.error(err);
                });
        });
};

/**
 * Gets application widgets definitions, without duplicates.
 *
 * @param appname
 * @param req
 */
Application.getApplicationWidgets = function (appname, req, platform) {
    return getApplicationWidgetsWithoutDuplicates(appname, req, platform)
        .then(function (appWidgets) {
            return screens.loadWidgetClassesFromDB(0, appWidgets, req, appname)
                .spread(function () {// load widget definitions
                    return appWidgets;
                });
        });
};

/**
 * Get applications widget names, without duplicates.
 *
 * @param req
 * @param callback
 */
Application.getApplicationWidgetNames = function (appname, req, callback) {
    getApplicationWidgetsWithoutDuplicates(appname, req, function (appWidgets) {
        appWidgets = appWidgets.map(function (el) {
            return el.name;
        });
        callback(appWidgets);
    });
};

/*
 * Returns app widgets as an array of {widgetName, widgetId}, without duplicate names.
 */
function getApplicationWidgetsWithoutDuplicates(appname, req, platform) {

    var removeDuplicates     = function (appWidgets) {
        for (var i = 0; i < appWidgets.length; ++i) {
            for (var j = i + 1; j < appWidgets.length; ++j) {
                if (appWidgets[i].name === appWidgets[j].name)
                    appWidgets.splice(j--, 1);
            }
        }
        return appWidgets;
    };
    var getAllAppWidgetNames = function (appWidgets) {
        return widgets.selectAllbyApp(appname, platform, {name: true}, req)
            .then(function (app_widget_names) {
                for (var i = 0; i < app_widget_names.length; i++) {
                    appWidgets = appWidgets.concat([{name: app_widget_names[i].name}]);
                }
                return removeDuplicates(appWidgets);
            });
    };

    return screens.getAllAsPromise(appname, platform, req)
        .then(function (screen_items) {
            var appWidgets = [];
            for (var i = 0; i < screen_items.length; i++) {
                var screenWidgets = screens.getScreenWidgets(screen_items[i]);
                appWidgets        = appWidgets.concat(screenWidgets);
            }
            return appWidgets;
        })
        .then(getAllAppWidgetNames);

    /*if (platform == 'web') {

     } else {
     return menus.getAllAsPromise(appname, req)
     .then(function (menu_items) {
     var appWidgets = [];
     for (var i = 0; i < menu_items.length; i++) {
     appWidgets = appWidgets.concat([{name: menu_items[i].action.value}]);
     }
     return appWidgets;
     })
     .then(getAllAppWidgetNames);
     }*/
}

Application.recover = function (appname, req, callback) {
    var data = versioning.recoverApplicationFilter(appname, req);
    mdbw.update(DB_TENANTS_PREFIX + req.session.tenant.id, 'applications', {name: appname}, {$set: data})
        .then(function (quantity) {
            mdbw.update(DB_TENANTS_PREFIX + req.session.tenant.id, 'screens', {application: appname}, {$set: data})
                .then(function (quantity) {
                    callback(null, quantity);
                });
        })
        .fail(function (err) {
            callback(err, null);
            log.error(err);
        });
};

Application.set = function (appname, application, req, callback) {
    if (appname === SETTINGS.sharedCatalogName) return callback(null, "OK");
    versioning.setModifyStatusToApp(appname, req, function () {
        var query = {
            tenantId: req.session.tenant.id,
            app:      appname
        };
        Application.isActive(query).then(function (active) {
            if (!active) callback("You can't edit not active application!!!");
            else {
                mdbw.update(
                    DB_TENANTS_PREFIX + req.session.tenant.id,
                    'applications',
                    {name: appname}, {$set: application}
                )
                    .then(function (data) {
                        callback(null, data);
                    })
                    .fail(function (err) {
                        callback(err);
                    })
            }
        });
    });
};

Application.getPlatform = function (appname, req, callback) {
    var filter = versioning.getApplicationFilter(appname, req);
    mdbw.select(DB_TENANTS_PREFIX + req.session.tenant.id, 'applications', filter, {platform: true})
        .then(function (doc) {
            var result = (doc && doc.length > 0) ? doc[0].platform : '';
            callback(result);
        });
};

Application.createNew = function (applicationParameters, req, callback) {
    var that = this;
    applicationParameters.platform = "web";
    limit.get({tenant: req.session.tenant.id, limit: "applications"})
        .then(function (appLimit) {
            Application.getAllActive(req.session.tenant.id)
                .then(function (appList) {
                    if ((appLimit <= appList.length) && (appLimit !== 0)) return callback("You have application limit = " + appLimit);

                    else {
                        that.getNewJSON(req.session.tenant.id, function (err, json) {
                            if (err) return callback(err, null);
                            json.name            = applicationParameters.applicationName;
                            json.ownerId         = applicationParameters.ownerId;
                            json.title           = applicationParameters.title || applicationParameters.applicationName;
                            json.creationDate    = new Date();
                            json.security        = 'public';
                            json.active          = true;
                            json.version         = '1.0';
                            json.platform        = applicationParameters.platform;
                            json.script          = 'dfxApplication.controller(\'' + applicationParameters.applicationName + 'ApplicationController\', [ \'$scope\', function ($scope) {\n\t\n}]);';
                            json.scriptMobile    = 'dfxApplication.controller(\'' + applicationParameters.applicationName + 'ApplicationController\', [ \'$scope\', function ($scope) {\n\t\n}]);';
                            json.personalization = (applicationParameters.platform == 'mobile') ? {"template": "Standard Mobile"} : {"template": "Basic"};
                            json.logo            = applicationParameters.logo || '';
                            var appFilter        = versioning.createNewApplicationFilter(applicationParameters, req);
                            mdbw.rm(DB_TENANTS_PREFIX + req.session.tenant.id, 'applications', appFilter)
                                .then(function (quantity_app) {
                                    mdbw.rm(DB_TENANTS_PREFIX + req.session.tenant.id, 'screens', {application: applicationParameters.applicationName})
                                        .then(function () {
                                            json.templates = {
                                                login_page_web : {},
                                                login_page_mobile : {}
                                            }
                                            QFS.read(path.join(__dirname, '..', 'src', 'packages', 'templates', 'default_login_page.html')).then(function (data) {
                                                data = data.replace(/##appName/g, applicationParameters.applicationName);
                                                data = data.replace(/##tenant/g, req.session.tenant.id);
                                                json.templates.login_page_web =  data;
                                                QFS.read(path.join(__dirname, '..', 'src', 'packages', 'templates', 'default_login_page_mobile.html')).then(function (data) {
                                                    var deploymentServerUrl = 'http://' + SETTINGS.deployment_server_host + ':' + SETTINGS.deployment_server_port;
                                                    data = data.replace(/##appName/g, applicationParameters.applicationName);
                                                    data = data.replace(/##tenant/g, req.session.tenant.id);
                                                    data = data.replace(/##server/g, deploymentServerUrl);
                                                    json.templates.login_page_mobile = data;
                                                    mdbw.put(DB_TENANTS_PREFIX + req.session.tenant.id, 'applications', json)
                                                        .then(function (app_id) {
                                                            versioning.addApplication(app_id, req);
                                                            sysadmin.tenant.role.create({
                                                                tenant: req.session.tenant.id,
                                                                name: 'guest',
                                                                application: applicationParameters.applicationName,
                                                                unremovable: true,
                                                                description: ''
                                                            })
                                                                .then(function () {
                                                                    return sysadmin.tenant.user.create({
                                                                        tenant: req.session.tenant.id,
                                                                        login: SETTINGS.default_app_user.id,
                                                                        pass: SETTINGS.default_app_user.password,
                                                                        kind: 'application',
                                                                        application: applicationParameters.applicationName,
                                                                        roles: {
                                                                            list: SETTINGS.default_app_user.roles_list,
                                                                            'default': SETTINGS.default_app_user.roles_list[0]
                                                                        },
                                                                        lastName: '',
                                                                        firstName: ''
                                                                    });
                                                                })
                                                                .then(function () {
                                                                    var action;
                                                                    if (applicationParameters.platform === 'web') {
                                                                        var screenParameters = {
                                                                            "title": "Home",
                                                                            "name": "Home",
                                                                            "ownerId": applicationParameters.ownerId,
                                                                            "application": applicationParameters.applicationName,
                                                                            "template": "basic",
                                                                            "platform": "web",
                                                                            "layout": {
                                                                                "width": "100%",
                                                                                "backgroundcolor": "white",
                                                                                "rows": [
                                                                                    {
                                                                                        "columns": [
                                                                                            {
                                                                                                "width": 100,
                                                                                                "views": []
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                ]
                                                                            },
                                                                            "script": "dfxAppPages.controller('HomePageController', [ '$scope', '$rootScope', function( $scope, $rootScope) {\n\t// Insert your code here\n}]);",
                                                                            "category": "Default"
                                                                        };
                                                                        action = {
                                                                            type: 'screen',
                                                                            value: 'Home'
                                                                        };
                                                                        screens.createNew(screenParameters, req, function (err, data) {
                                                                            var menuItemParameters = {
                                                                                name: 'Home',
                                                                                application: applicationParameters.applicationName,
                                                                                title: 'Home',
                                                                                ownerId: applicationParameters.ownerId,
                                                                                icon: 'home',
                                                                                action: action,
                                                                                order: '0'
                                                                            };
                                                                            menus.createNew(menuItemParameters, req, function (err, data) {
                                                                                callback(null, app_id);
                                                                            });

                                                                            // Create Tablet Default Home Screen
                                                                            screenParameters.platform = "tablet";
                                                                            screens.createNew(screenParameters, req, function () {
                                                                                // Create Mobile Default Home Screen
                                                                                screenParameters.platform = "mobile";
                                                                                screenParameters.template = "basic_mobile",
                                                                                    screens.createNew(screenParameters, req);
                                                                            });
                                                                        });
                                                                        screens_templates.createNew({
                                                                            "name": "basic",
                                                                            "platform": "web",
                                                                            "application": applicationParameters.applicationName,
                                                                            "layout": {
                                                                                "header": {
                                                                                    "content": {
                                                                                        "type": "html",
                                                                                        "value": ""
                                                                                    },
                                                                                    "height": "80px",
                                                                                    "display": "true",
                                                                                    "halignment": "center",
                                                                                    "valignment": "center",
                                                                                    "style": "",
                                                                                    "class": ""
                                                                                },
                                                                                "left": {
                                                                                    "content": {
                                                                                        "type": "html",
                                                                                        "value": ""
                                                                                    },
                                                                                    "width": "150px",
                                                                                    "whiteframe": "md-whiteframe-1dp",
                                                                                    "display": "false",
                                                                                    "halignment": "start",
                                                                                    "valignment": "start",
                                                                                    "style": "",
                                                                                    "class": ""
                                                                                },
                                                                                "right": {
                                                                                    "content": {
                                                                                        "type": "html",
                                                                                        "value": ""
                                                                                    },
                                                                                    "width": "150px",
                                                                                    "whiteframe": "md-whiteframe-1dp",
                                                                                    "display": "false",
                                                                                    "halignment": "start",
                                                                                    "valignment": "start",
                                                                                    "style": "",
                                                                                    "class": ""
                                                                                },
                                                                                "body": {
                                                                                    "style": "background:#fff;padding:10px",
                                                                                    "class": ""
                                                                                },
                                                                                "footer": {
                                                                                    "content": {
                                                                                        "type": "html",
                                                                                        "value": ""
                                                                                    },
                                                                                    "height": "60px",
                                                                                    "display": "true",
                                                                                    "halignment": "center",
                                                                                    "valignment": "center",
                                                                                    "style": "",
                                                                                    "class": ""
                                                                                }
                                                                            }
                                                                        }, req);
                                                                        screens_templates.createNew({
                                                                            "name": "basic_mobile",
                                                                            "platform": "mobile",
                                                                            "application": applicationParameters.applicationName,
                                                                            "layout": {
                                                                                "header": {
                                                                                    "content": {
                                                                                        "type": "html",
                                                                                        "value": ""
                                                                                    },
                                                                                    "height": "50px",
                                                                                    "display": "true",
                                                                                    "halignment": "center",
                                                                                    "valignment": "center",
                                                                                    "style": "",
                                                                                    "class": ""
                                                                                },
                                                                                "left": {
                                                                                    "content": {
                                                                                        "type": "html",
                                                                                        "value": ""
                                                                                    },
                                                                                    "width": "150px",
                                                                                    "whiteframe": "md-whiteframe-1dp",
                                                                                    "display": "false",
                                                                                    "halignment": "start",
                                                                                    "valignment": "start",
                                                                                    "style": "",
                                                                                    "class": ""
                                                                                },
                                                                                "right": {
                                                                                    "content": {
                                                                                        "type": "html",
                                                                                        "value": ""
                                                                                    },
                                                                                    "width": "150px",
                                                                                    "whiteframe": "md-whiteframe-1dp",
                                                                                    "display": "false",
                                                                                    "halignment": "start",
                                                                                    "valignment": "start",
                                                                                    "style": "",
                                                                                    "class": ""
                                                                                },
                                                                                "body": {
                                                                                    "style": "background:#fff;",
                                                                                    "class": ""
                                                                                },
                                                                                "footer": {
                                                                                    "content": {
                                                                                        "type": "html",
                                                                                        "value": ""
                                                                                    },
                                                                                    "height": "30px",
                                                                                    "display": "true",
                                                                                    "halignment": "center",
                                                                                    "valignment": "center",
                                                                                    "style": "",
                                                                                    "class": ""
                                                                                }
                                                                            }
                                                                        }, req);
                                                                        categories.createNew({
                                                                            "title": "Default",
                                                                            "ownerId": applicationParameters.ownerId,
                                                                            "name": "Default",
                                                                            "application": applicationParameters.applicationName,
                                                                            "requestDate": new Date(),
                                                                            "visibility": "visible",
                                                                            "platform": "web",
                                                                            "versioning": {
                                                                                "status": "added",
                                                                                "user": req.session.user.id,
                                                                                "last_action": (new Date() / 1000).toFixed()
                                                                            }
                                                                        }, req);
                                                                        categories.createNew({
                                                                            "title": "Default",
                                                                            "ownerId": applicationParameters.ownerId,
                                                                            "name": "Default",
                                                                            "application": applicationParameters.applicationName,
                                                                            "requestDate": new Date(),
                                                                            "visibility": "visible",
                                                                            "platform": "tablet",
                                                                            "versioning": {
                                                                                "status": "added",
                                                                                "user": req.session.user.id,
                                                                                "last_action": (new Date() / 1000).toFixed()
                                                                            }
                                                                        }, req);
                                                                        categories.createNew({
                                                                            "title": "Default",
                                                                            "ownerId": applicationParameters.ownerId,
                                                                            "name": "Default",
                                                                            "application": applicationParameters.applicationName,
                                                                            "requestDate": new Date(),
                                                                            "visibility": "visible",
                                                                            "platform": "mobile",
                                                                            "versioning": {
                                                                                "status": "added",
                                                                                "user": req.session.user.id,
                                                                                "last_action": (new Date() / 1000).toFixed()
                                                                            }
                                                                        }, req);
                                                                    } else if (applicationParameters.platform === 'mobile') {
                                                                        var menuItemParameters = {
                                                                            name: 'Home',
                                                                            application: applicationParameters.applicationName,
                                                                            title: 'Home',
                                                                            ownerId: applicationParameters.ownerId,
                                                                            icon: 'home',
                                                                            order: '0'
                                                                        };
                                                                        menus.createNew(menuItemParameters, req, function () {
                                                                            callback(null, app_id);
                                                                        });
                                                                    }
                                                                }).then(function () {
                                                                    widgets.createNewCat({
                                                                        ownerId: applicationParameters.ownerId,
                                                                        name: 'Default',
                                                                        "platform": "web",
                                                                        application: applicationParameters.applicationName
                                                                    }, req);
                                                                    widgets.createNewCat({
                                                                        ownerId: applicationParameters.ownerId,
                                                                        name: 'Default',
                                                                        "platform": "tablet",
                                                                        application: applicationParameters.applicationName
                                                                    }, req);
                                                                    widgets.createNewCat({
                                                                        ownerId: applicationParameters.ownerId,
                                                                        name: 'Default',
                                                                        "platform": "mobile",
                                                                        application: applicationParameters.applicationName
                                                                    }, req);
                                                                    var queries = require('./dfx_queries');
                                                                    queries.createNewCat({
                                                                        ownerId: applicationParameters.ownerId,
                                                                        name: 'Default',
                                                                        application: applicationParameters.applicationName
                                                                    }, req);
                                                                }).done(function () {
                                                                    // Create default ENV
                                                                    var default_env = {
                                                                        "app_name" : applicationParameters.applicationName,
                                                                        "content": [
                                                                            {
                                                                                "name": "development",
                                                                                "data": {}
                                                                            }
                                                                        ]
                                                                    }
                                                                    return mdbw.put(DB_TENANTS_PREFIX + req.session.tenant.id, 'environments_map',default_env).then(function(){
                                                                        return roles.rebuildCache().then(function () {
                                                                            callback(null, app_id);
                                                                        })
                                                                    });
                                                                });
                                                        }).fail(function (err) {
                                                            if (err.code == 11000) {
                                                                callback('Application with name "' + applicationParameters.applicationName + '" already exists', null);
                                                            } else {
                                                                callback('Unknown error', null);
                                                            }
                                                        });
                                                }).fail(function (err) {
                                                    callback('Can\'t read default_login_page.html', null);
                                                });
                                            }).fail(function (err) {
                                                callback('Can\'t read default_login_page_mobile.html', null);
                                            });
                                        });
                                });
                        });
                    }
                });
        });
};

Application.deleteApplication = function (applicationName, req, callback) {
    var collectionsToDelete = [
        'roles',
        'applications',
        'screens',
        'application_menus',
        'screens_categories',
        'screens_templates',
        'dataqueries',
        'datawidgets',
        'metadata',
        'users',
        'dataqueries_categories',
        'dataqueries_services',
        'datawidgets_categories',
        'resources',
        'trash',
        'auth_providers',
        'db_drivers',
        'application_builds',
        'environments_map'
    ];

    Q.all(collectionsToDelete.map(function (collectionName) {
        if ((collectionName === 'auth_providers') || (collectionName === 'db_drivers')) {
            return mdbw.rm(
                collectionName,
                req.session.tenant.id,
                {application: applicationName}
            );
        } else if (collectionName === 'applications') {
            return mdbw.rm(
                DB_TENANTS_PREFIX + req.session.tenant.id,
                collectionName,
                {name: applicationName}
            );
        } else if (collectionName === 'environments_map') {
            return mdbw.rm(
                DB_TENANTS_PREFIX + req.session.tenant.id,
                collectionName,
                {app_name: applicationName}
            );
        }
        else {
            return mdbw.rm(
                DB_TENANTS_PREFIX + req.session.tenant.id,
                collectionName,
                {application: applicationName}
            );
        }
    })).done(function () {
        roles.rebuildCache(req.session.tenant.id).then(function () {
            var filePath = path.join(RESOURCES_DEV_PATH, req.session.tenant.id, applicationName);
            QFS.removeTree(filePath);
            callback();
        });
    });
};

Application.getNewJSON = function (req, callback) {
    fs.readFile(path.join(__dirname, '..', 'templates/static_json/blanks/application.json'), 'utf8', function (err, data) {
        if (err) log.error(err);
        callback(err, JSON.parse(data));
    });
};

Application._getScreenItem = function (name, screens_tree) {
    var item = null,
        i;
    for (i = 0; i < screens_tree.length; i++) {
        if (screens_tree[i].name == name) {
            item = screens_tree[i];
            break;
        } else if (screens_tree[i].children.length > 0) {
            item = Application._getScreenItem(name, screens_tree[i].children);
            if (item != null) {
                break;
            }
        }
    }
    return item;
};

Application.addDefaultGithub = function (appname, tenantid, callback) {
    set(appname, {
        github: {
            "token":      "",
            "username":   "",
            "repository": ""
        }
    }, tenantid, callback);
};

Application.setDefaultPhoneGap = function (appname, tenantid, callback) {
    set(appname, {
        phonegap: {
            "token":         "",
            "applicationId": ""
        }
    }, tenantid, callback);
};

Application.getMenuItemsConfigurationList = function (appname, req, callback) {
    mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'application_configuration', {
        application: appname,
        type:        'menu-item'
    }).then(function (app_config) {
        callback(app_config ? app_config : {});
    });
};

Application.getCompsConfigurationList = function (appname, req, callback) {
    mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'application_configuration', {
        application: appname,
        type:        'gcontrol'
    }).then(function (app_config) {
        callback(app_config ? app_config : {});
    });
};

Application.getConfiguration = function (appname, req, data, callback) {
    data.application = appname;
    mdbw.getOne(DB_TENANTS_PREFIX + req.session.tenant.id, 'application_configuration', data).then(function (app_config) {
        callback(app_config ? app_config : {});
    });
};

/**
 * Used only by the compiler
 */
Application.getConfigurationAsPromise = function (appname, req) {
    return mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'application_configuration', {
        application: appname
    }).then(function (app_config) {
        return app_config ? app_config : [];
    });
};

Application.updateConfiguration = function (appname, req, data, callback) {
    var filter         = _.clone(data, true);
    filter.application = appname;
    delete filter['attributes'];
    mdbw.exists(DB_TENANTS_PREFIX + req.session.tenant.id, 'application_configuration', filter).then(function (exists) {
        if (exists) {
            mdbw.update(DB_TENANTS_PREFIX + req.session.tenant.id, 'application_configuration', filter, {$set: {attributes: data.attributes}})
                .then(callback())
                .fail(function(err){
                    callback(err) ;
                });
        } else {
            mdbw.put(DB_TENANTS_PREFIX + req.session.tenant.id, 'application_configuration', data)
                .then(callback())
                .fail(function(err){
                    callback(err)
                });
        }
    }).done(function(){
        versioning.setModifyStatusToApp(appname, req);
    });
};

Application.getLogo = function(req, res) {
    var cookie = parseCookies(req);
    var appName;
    var tenantId;
    if (!cookie['X-DREAMFACE-TENANT'] || !cookie['app_name']){
        const RGX_PARSE_REFERER = /\/deploy\/([^\/]+)\/([^\/]+)\/([^\/]+)\/([^\/]+)\//;
        var referer = req.headers.referer;
        var parse = RGX_PARSE_REFERER.exec(referer);
        if ( !parse ) {
            log.error('can not parse asset\'s referer : ' + referer);
        } else {
            result = {
                tenantId : parse[1],
                appName  : parse[2],
                build    : parse[3],
                build_number : parse[4]
            }
            tenantId = result.tenantId;
            appName = result.appName;
        }
    } else {
        tenantId = cookie['X-DREAMFACE-TENANT'];
        appName = cookie['app_name'];
    }

    if (tenantId || appName) {
        mdbw.get(DB_TENANTS_PREFIX + tenantId, 'applications', {'name':appName}).then(function(app){
            app = app[0];
            var url = "/assets/" + app.logo.split('/')[app.logo.split('/').length -1];
            res.redirect(url);
        }).fail(function(err){
            res.status(404).send(err);
        })
    } else {
        var errorText = 'Can not parse tenantId and appName! TenantId -'  + tenantId + ', App name - ' + appName;
        log.error(errorText);
        res.status(404).send(errorText);
    }
};

var parseCookies = function(request) {
    var list = {},
        rc = request.headers.cookie;

    rc && rc.split(';').forEach(function (cookie) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
};

Application.getSnapshot = function (appname, req, callback) {
    Application.getPlatform(appname, req, function (platform) {
        mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'application_configuration', {application: appname})
            .then(function (docs) {
                var roles         = [],
                    snapshot      = {};
                snapshot.props    = {};
                _.each(docs, function (doc) {
                    var role = doc.role,
                        name,
                        link,
                        parameters,
                        propId,
                        propValue;
                    if (!_.contains(roles, role)) {
                        roles.push(role);
                    }
                    _.each(doc.attributes, function (e) {
                        propId    = doc.name + '_' + e.name;
                        propValue = e.value;
                        if (propValue) {
                            if (doc.type == 'menu-item') {
                                propId     = doc.name + '_' + e.name;
                                propValue  = e.value;
                                name       = 'Menu item: ' + doc.name + '; Attribute: ' + e.name + ';';
                                link       = '#!/catalog/application/' + appname + '/menu/' + doc.name + '/role';
                                parameters = {
                                    name:      doc.name,
                                    attribute: e.name
                                };
                            } else if (doc.type == 'gcontrol') {
                                propId     = doc.name + '_' + doc.id + '_' + doc.screen + '_' + doc.widget + '_' + doc.widgetid + '_' + e.name;
                                propValue  = e.value;
                                name       = 'Graphical control: ' + doc.name +
                                '; Graphical control ID: ' + doc.id +
                                '; Screen: ' + doc.screen +
                                '; Widget: ' + doc.widget +
                                '; Widget ID: ' + doc.widgetid +
                                '; Attribute: ' + e.name + ';';
                                parameters = {
                                    name:      doc.name,
                                    attribute: e.name,
                                    id:        doc.id,
                                    screen:    doc.screen,
                                    widget:    doc.widget,
                                    widgetid:  doc.widgetid
                                };
                                //link = '#!/catalog/application/' + appname + '/screens/' + doc.screen + '/control/' + doc.name + '/id/' + doc.id + '/widget/' + doc.widget + '/widgetid/' + doc.widgetid + '/role';
                            }
                            if (typeof snapshot.props[propId] == 'undefined') {
                                snapshot.props[propId] = {};
                            }
                            snapshot.props[propId].name       = name;
                            snapshot.props[propId].link       = link;
                            snapshot.props[propId].type       = doc.type;
                            snapshot.props[propId].parameters = parameters;
                            snapshot.props[propId][role]      = propValue;
                        }
                    });
                });
                snapshot.roles    = roles;
                snapshot.platform = platform;
                callback(snapshot);
            });
    });
};

Application.getGeneratedEnvironment = function(parsed){
    return mdbw.getOne(DB_TENANTS_PREFIX + parsed.req.session.tenant.id, 'environments_map', {app_name: parsed.req.params.applicationName})
}

module.exports = Application;
