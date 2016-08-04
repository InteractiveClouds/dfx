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
    widgets           = require('./dfx_widgets'),
    jade              = require('jade'),
    fs                = require('graceful-fs'),
    request           = require('request'),
    path              = require('path'),
    unzip             = require('./utils/unzip.js'),
    tenants           = require('./dfx_sysadmin').tenant,
    resources         = require('./dfx_resources');
    endpoints         = require('./utils/endpoints'),
    versioning        = require('./dfx_applications_versioning'),
    replace           = require("replace"),
    log               = new (require('./utils/log')).Instance({label: "SCREENS"}),
    DB_TENANTS_PREFIX = SETTINGS.databases_tenants_name_prefix;

var Screen = {};

var api = {
    create: function (parsed) {
        var D = Q.defer();
        Screen.createNew(parsed.screenParameters, parsed.req, function (err, data) {
            return err
                ? D.reject(err)
                : D.resolve('Page created!')
        });
        return D.promise;
    },

    getByView: function (parsed) {
      return Screen.getByView(parsed);
    },

    delete: function (parsed) {
        var D = Q.defer();
        Screen.deleteScreen(parsed.screenParameters.screenName, parsed.screenParameters.screenID, parsed.screenParameters.applicationName, parsed.screenParameters.platform, parsed.req, function (err, data) {
            return err
                ? D.reject(err)
                : D.resolve("Page " + parsed.screenParameters.screenName + " was successfully deleted!");
        });
        return D.promise;
    },

    update: function (parsed) {
        var D = Q.defer();
        Screen.set(parsed.screenParameters.change, parsed.req, function (err, data) {
            return err
                ? D.reject("Something went wrong during editing page " + parsed.screenParameters.change.name)
                : D.resolve("Page " + parsed.screenParameters.change.name + " has been successfully updated");
        });
        return D.promise;
    }
};

Screen.api = endpoints.json({
    parser: function (req) {
        return {
            action: req.params.action,
            data:   {
                screenParameters: req.body,
                req:              req
            }
        }
    },
    action: api,
    log:    log
});

Screen.index = function (req, res, storage, version) {
    res.render('studio/pages/index.jade', {
        "tenantid":      req.session.tenant.id,
        "username":      req.session.user.id,
        "applicationName": req.params.applicationName,
        "pageName":      req.params.screenName,
        "pagePlatform":  req.params.platform,
        "documentation": storage.documentation,
        "version":       version
    });
};

Screen.editui = function (req, res) {
    Screen.get(req.params.screenName, req.params.applicationName, req.params.platform, req, function (screen) {

        fs.readFile(path.join(__dirname, '..', 'templates/studio/pages/page_visual_editor.jade'), 'utf8', function (err, data) {
            if (err) throw err;
            var fn   = jade.compile(data, {
                filename: path.join(__dirname, '..', 'templates/studio/pages/page_visual_editor.jade')
            });
            var body = fn({
                screen: screen
            });
            res.setHeader('Content-Type', 'text/html');
            res.setHeader('Content-Length', body.length);
            res.end(body);
        });
    });
};

Screen.getByView = function(o) {
    var filter = {'layout.rows':{$elemMatch:{'columns.views':{$elemMatch:{"name": o.screenParameters.viewName}}}},'application': o.screenParameters.applicationName};
    return mdbw.get(DB_TENANTS_PREFIX + o.req.session.tenant.id, 'screens', filter)
}

Screen.preview = function (req, res) {
    var url = "http://" + SETTINGS.compiler.host + ":" + SETTINGS.compiler.port + "/compile?server=" + SETTINGS.serverinfo['server-uuid'] +
                    "&tenant=" + req.session.tenant.id +
                    "&appid=" + req.params.applicationName +
                    "&platform=" + req.params.platform +
                    "&build=1.0.0" +
                    "&schemaId=" + req.params.platform +
                    "&deployto=29cd8260-e168-11e4-905f-e91235c968e0";
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var obj = {
                path      : path.join(SETTINGS.app_build_path, req.session.tenant.id , req.params.platform , req.params.applicationName + '_1.0.0' , req.params.applicationName + '_1.0.0.zip'  ),
                dest_path : path.join(__dirname, '..', SETTINGS.tempDir, 'deploy', req.session.tenant.id , req.params.applicationName)
            };
            unzip.decompress(obj)
                .then(function () {
                    var url = 'http://' + SETTINGS.server_host + ':' + SETTINGS.server_port + '/' + SETTINGS.tempDir + '/deploy/' + req.session.tenant.id + '/' + req.params.applicationName + '/app/login.html';
                    replace({
                        regex: '\'index.html\'',
                        replacement: "window.location.href.replace('login.html', '#/page.html?name=" + req.params.screenName + "')",
                        paths: [path.join(__dirname, '..', SETTINGS.tempDir, 'deploy', req.session.tenant.id , req.params.applicationName, 'app', 'login.html')],
                        recursive: true,
                        silent: true
                    });
                    res.send(url);
                })
        } else {
            res.send("Something went wrong. See server logs for more info. May be compiler not reachable");
            log.error(arguments);
        }
    });
};

Screen.screenList = function (req, res) {
    Screen.selectAll(req.params.applicationName, ['name'], req, function (arr_screens) {
        res.end(JSON.stringify({
            screens: arr_screens
        }));
    });
};

Screen.screenListSearch = function (req, res) {
    Screen.select(req.params.applicationName, {
        name: {
            $regex:   req.params.search,
            $options: 'i'
        }
    }, ['name'], req, function (arr_screens) {
        res.end(JSON.stringify({
            screens: arr_screens
        }));
    });
};

Screen.screenItem = function (req, res) {
    Screen.get(req.params.screenName, req.params.applicationName, req.params.platform, req, function (screen) {
        res.end(JSON.stringify({
            screen: screen
        }));
    });
};

Screen.getScreenWidgetsInAppConf = function (req, res) {
    Screen.getWidgets(req.params.screenName, req.params.applicationName, req, function (widgets) {
        var data = JSON.stringify(widgets, null, 0);
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Content-Length', data.length);
        res.end(data);
    });
};

Screen.render = function (screenname, req, res) {
    Screen.get(screenname, req.params.appname, req, function (screen_item) {
        var arrayOfWidgets = Screen.getScreenWidgets(screen_item);
        fs.readFile(path.join(__dirname, '..', 'templates/default.jade'), 'utf8', function (err, data) {
            if (err) throw err;
            var fn = jade.compile(data);
            var body = fn({
                apptitle:    item_screen.application,
                screentitle: item_screen.title,
                widgets:     arrayOfWidgets
            });
            res.setHeader('Content-Type', 'text/html');
            res.setHeader('Content-Length', body.length);
            res.end(body);
        });
    });
};

/*
 * Gets screen widgets as array of names
 */
Screen.getScreenWidgetNames = function (screen_item) {
    return getScreenWidgetsAsArray(screen_item, true);
};

/*
 * Gets screen widgets as array of objects {id, name}
 */
Screen.getScreenWidgets = function (screen_item) {
    return getScreenWidgetsAsArray(screen_item, false);
};

function getScreenWidgetsAsArray(screen_item, only_names) {
    var i = 0,
        j = 0,
        k = 0,
        arrayOfWidgets = [];
    for (i = 0; i < screen_item.layout.rows.length; i++) {
        var row = screen_item.layout.rows[i];
        for (j = 0; j < row.columns.length; j++) {
            var col = row.columns[j];
            for (k = 0; k < col.views.length; k++) {
                if (only_names) {
                    arrayOfWidgets.push(col.views[k].name);
                } else {
                    arrayOfWidgets.push(col.views[k]);
                }
            }
        }
    }
    return arrayOfWidgets;
}

Screen.generate = function (appname, directives, platform, screenname, template, app_widgets_map, req, callback) {
    Screen.get(screenname, appname, req, function (screen_item) {
        var arrayOfWidgets = Screen.getScreenWidgets(screen_item);
        Screen.loadWidgetClassesFromMemory(arrayOfWidgets, app_widgets_map);
        var template_name = '';
        if (template == null) {
            template_name = (platform == 'web') ? path.join(__dirname, '..', 'templates/standard_web.jade') : path.join(__dirname, '..', 'templates/default_offline.jade');
        } else {
            template_name = (platform == 'web') ? path.join(__dirname, '..', SETTINGS.templates[template].screen) : path.join(__dirname, '..', 'templates/default_offline.jade');
        }
        fs.readFile(template_name, 'utf8', function (err, data) {
            if (err) throw err;
            try {
                var fn = jade.compile(data, {
                    filename: path.join(__dirname, '..', SETTINGS.templates[template].screen)
                });
                var body = fn({
                    "server":      req.protocol + '://' + req.hostname + ':' + SETTINGS.server_port,
                    "tenantid":    req.session.tenant.id,
                    "appname":     appname,
                    "directives":  directives,
                    apptitle:      screen_item.application,
                    screen:        screen_item,
                    wclasses:      arrayOfWidgets,
                    jade_compiler: jade
                });
                callback(null, body);
            } catch (compile_error) {
                log.error(compile_error);
                callback(compile_error, body);
            }
        });
    });
};

Screen.generateMobile = function (appname, directives, platform, menu_item, template, req, callback) {
    if (menu_item.action.type !== 'widget' || !menu_item.action.value) {
        return;
    }
    var widgetname = menu_item.action.value;
    widgets.get(widgetname, req, function (widget) {
        var template_name = '';
        if (template === null) {
            template_name = path.join(__dirname, '..', 'templates/standard_mobile.jade');
        } else {
            template_name = path.join(__dirname, '..', SETTINGS.templates[template].screen);
        }
        fs.readFile(template_name, 'utf8', function (err, data) {
            if (err) throw err;
            try {
                var fn = jade.compile(data, {
                    filename: path.join(__dirname, '..', SETTINGS.templates[template].screen)
                });
                var body = fn({
                    "server":      req.protocol + '://' + req.hostname + ':' + SETTINGS.server_port,
                    "tenantid":    req.session.tenant.id,
                    "appname":     appname,
                    "directives":  directives,
                    //apptitle:      screen_item.application,
                    wclasses:      [widget],
                    jade_compiler: jade
                });
                callback(null, body);
            } catch (compile_error) {
                log.error(compile_error);
                callback(compile_error, body);
            }
        });
    });
};

Screen.loadWidgetClassesFromMemory = function (arr_widgets, app_widgets_map) {
    for (var i = 0; i < arr_widgets.length; i++) {
        arr_widgets[i].definition = app_widgets_map[arr_widgets[i].name];
    }
};

Screen.loadWidgetClassesFromDB = function (index, arr_widgets, req, appname) {
    if (arr_widgets.length == 0) {
        return Q.fcall(function () {
            return [];
        });
    }
    var wclassesPromises = [];
    for (var i = 0; i < arr_widgets.length; i++) {
        var widgetClosure = function (next_widget) {
            wclassesPromises.push(
                widgets.getAsPromise(next_widget.name, appname, req)
                    .then(function (widget) {
                        next_widget.definition = widget;
                    })
            );
        };
        widgetClosure(arr_widgets[i]);
    }
    return Q.all(wclassesPromises);
};

Screen.createNew = function (screenParameters, req, callback) {
    Screen.getNewJSON(function (json) {
        json.title = screenParameters.title;
        json.name = screenParameters.name;
        json.requestDate = new Date();
        json.ownerId = screenParameters.ownerId;
        json.layout = screenParameters.layout || {};
        json.template = screenParameters.template;
        json.script = screenParameters.script;
        json.platform = screenParameters.platform;
        json.application = screenParameters.application;
        if (screenParameters.parentname != null && screenParameters.parentname != '') {
            json.parentname = screenParameters.parentname;
        }
        if (screenParameters.category) {
            json.category = screenParameters.category;
        }
        mdbw.exists(DB_TENANTS_PREFIX + req.session.tenant.id, 'screens', {
            'name':        screenParameters.name,
            'application': screenParameters.application,
            'platform':    screenParameters.platform
        }).then(function (exists) {
            if (!exists) {
                mdbw.rm(DB_TENANTS_PREFIX + req.session.tenant.id, 'trash',{
                    'name':        screenParameters.name,
                    'application': screenParameters.application,
                    'type' : 'screens'
                }).then(function(){
                    mdbw.put(DB_TENANTS_PREFIX + req.session.tenant.id, 'screens', json)
                        .then(function (screen_id) {
                            if ((screenParameters.title != "Home") && (screenParameters.name != "Home")) {
                                versioning.setModifyStatusToApp(screenParameters.application, req);
                            }
                            callback(null, screen_id);
                        });
                });
            } else {
                callback('Page with name "' + screenParameters.name + '" already exists', null);
            }
        });
    });
};

Screen.set = function (screen, req, callback) {
    screen.requestDate = new Date();
    mdbw.update(DB_TENANTS_PREFIX + req.session.tenant.id, 'screens', {
        name:        screen.name,
        application: screen.application,
        platform: screen.platform
    }, {$set: screen})
        .then(function (quantity) {
            versioning.setModifyStatusToApp(screen.application, req);
            callback(null, quantity);
        })
        .fail(function (err) {
            log.error(err);
        });
};

Screen.getNewJSON = function (callback) {
    fs.readFile(path.join(__dirname, '..', 'templates/static_json/blanks/screen.json'), 'utf8', function (err_log, data) {
        callback(JSON.parse(data));
    });
};

Screen.searchByApp = function (req, res) {
    var filter = {
        $or:         [
            {
                name: {
                    $regex:   req.query.q,
                    $options: 'i'
                }
            },
            {
                title: {
                    $regex:   req.query.q,
                    $options: 'i'
                }
            }
        ],
        application: req.params.applicationName
    };
    Screen.getAllWithFilter(filter, req, function (arr_screens) {
        if (!arr_screens) {
            return res.end("{screens:[]}");
        }
        res.end(JSON.stringify({
            screens: arr_screens
        }));
    });
};

Screen.countByApp = function (req, res) {
    Screen.count(req.params.applicationName, req, function (count) {
        count     = count || [];
        var data = JSON.stringify({nbscreens: count}, null, 0);
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Content-Length', data.length);
        res.end(data);
    });
};

Screen.getAll = function (applicationName, req, platform, callback) {
    var filter = {application: applicationName, platform: platform};
    mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'screens', filter)
        .then(function (docs) {
            callback(docs);
        });
};

Screen.count = function (applicationName, req, callback) {
    var filter = {application: applicationName};
    mdbw.count(DB_TENANTS_PREFIX + req.session.tenant.id, 'screens', filter)
        .then(function (count) {
            callback(count);
        });
};

Screen.getAllWithFilter = function (filter, req, callback) {
    mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'screens', filter)
        .then(function (docs) {
            callback(docs);
        });
};

Screen.getEntireSet = function (req, callback) {
    mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'screens', {})
        .then(function (docs) {
            callback(docs);
        });
};

Screen.getAllAsPromise = function (applicationName, platform, req) {
    return mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'screens', {application: applicationName, platform: platform});
};

Screen.getAllByTenant = function (req) {
    return mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'screens');
};

Screen._select = function (applicationName, filter, fields, req, callback) {
    mdbw.select(DB_TENANTS_PREFIX + req.session.tenant.id, 'screens', filter, fields)
        .then(function (docs) {
            callback(docs);
        });
};

Screen.select = function (applicationName, query, fields, req, callback) {
    query.application = applicationName;
    mdbw.select(DB_TENANTS_PREFIX + req.session.tenant.id, 'screens', query, fields)
        .then(function (docs) {
            callback(docs);
        });
};

Screen.selectAll = function (applicationName, fields, req, callback) {
    var filter = {application: applicationName};
    mdbw.select(DB_TENANTS_PREFIX + req.session.tenant.id, 'screens', filter, fields)
        .then(function (docs) {
            callback(docs);
        });
};

Screen.get = function (screenName, applicationName, platform, req, callback) {
    var filter = {application: applicationName, name: screenName, platform: platform};
    mdbw.getOne(DB_TENANTS_PREFIX + req.session.tenant.id, 'screens', filter)
        .then(function (doc) {
            callback(doc);
        });
};

Screen.getWidgets = function (screenName, applicationName, req, callback) {
    var filter = {application: applicationName, name: screenName};
    mdbw.getOne(DB_TENANTS_PREFIX + req.session.tenant.id, 'screens', filter)
        .then(function (data) {
            var widgets = [];
            data.layout.rows.forEach(function (row) {
                row.columns.forEach(function (col) {
                    col.widgets.forEach(function (wgt) {
                        widgets.push(wgt);
                    });
                });
            });
            callback(widgets);
        });
};

Screen.deleteScreen = function (screenName, screenID, appName, platform, req, callback) {
    var moveToTrash = function(o) {
        return mdbw.get(DB_TENANTS_PREFIX + o.tenantId, 'screens', {name: o.name, application: o.application, platform: o.platform})
            .then(function(screen){
                screen[0].type = "screens";
                return mdbw.put(DB_TENANTS_PREFIX + o.tenantId, 'trash',screen[0]);
            });
    };
    moveToTrash({
        tenantId : req.session.tenant.id,
        name : screenName,
        application : appName,
        platform: platform
    })
        .then(function(){
            mdbw.rm(DB_TENANTS_PREFIX + req.session.tenant.id, 'screens', {name: screenName, application: appName, platform: platform})
                .then(function () {
                    versioning.setModifyStatusToApp(appName, req);
                    callback()
                });
    });

};

var getAppDbName = function (applicationName) {
    return ((!applicationName) || applicationName == sharedCatalogName) ? '' : applicationName;
};

module.exports = Screen;
