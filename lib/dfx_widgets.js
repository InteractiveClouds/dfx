/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var SETTINGS          = require('./dfx_settings'),
    archiver          = require('archiver'),
    path              = require('path'),
    Q                 = require('q'),
    QFS               = require('q-io/fs'),
    fs                = require('graceful-fs'),
    mdbw              = require('./mdbw')(SETTINGS.mdbw_options),
    log               = new (require('./utils/log')).Instance({label: "DFX_Widgets"}),
    versioning        = require('./dfx_widgets_versioning'),
    tenants           = require('./dfx_sysadmin').tenant,
    endpoints         = require('./utils/endpoints'),
    ziper             = require('./utils/zip'),
    _                 = require('underscore'),
    mongo             = require('mongodb'),
    jade              = require('jade'),
    repositoryPrefix  = SETTINGS.databases_tenants_name_prefix,
    sharedCatalogName = SETTINGS.sharedCatalogName;

var Widget = {};

var api = {
    create:              function (parsed) {
        var D = Q.defer();
        Widget.createNew(parsed.widgetsParameters, parsed.req, function (err, data) {
            return err
                ? D.reject(err)
                : D.resolve('View created!');
        });
        return D.promise;
    },
    'create-from-model': function (parsed) {
        var D = Q.defer();
        Widget.createFromModel(parsed.widgetsParameters, parsed.req, function (err, data) {
            return err
                ? D.reject(err)
                : D.resolve('View created!');
        });
        return D.promise;
    },
    'create-predefined': function (parsed) {
        var D = Q.defer();
        Widget.createPredefined(parsed.widgetsParameters.wgtparams, parsed.req, function (err, data) {
            return err
                ? D.reject(err)
                : D.resolve('View created!');
        });
        return D.promise;
    },
    update:              function (parsed) {
        var D = Q.defer();
        Widget.set(parsed.widgetName, parsed.applicationName, parsed.widgetsParameters.change, parsed.req, function (err, data) {
            return !data
                ? D.reject(err.errmsg || err)
                : D.resolve("View " + parsed.widgetName + " has been successfully updated");
        });
        return D.promise;
    },
    delete:              function (parsed) {
        var D = Q.defer();
        Widget.delete(parsed.widgetsParameters.widgetName, parsed.widgetsParameters.applicationName, parsed.widgetsParameters.platform, parsed.req, function (err, data) {
            return err
                ? D.reject(err)
                : D.resolve("View " + parsed.widgetsParameters.widgetName + " has been successfully deleted");
        });
        return D.promise;
    },
    saveas:              function (parsed) {
        var D = Q.defer();
        Widget.saveAs(parsed.widgetName, parsed.widgetsParameters.change, parsed.req, function (err, data) {
            return err
                ? D.resolve(err)
                : D.resolve("View created!");
        });
        return D.promise;
    },
    recover:             function (parsed) {
        var D = Q.defer();
        Widget.recover(parsed.widgetsParameters.name, parsed.req, function (err, data) {
            return err
                ? D.reject(err)
                : D.resolve('View was recovered!');
        });
        return D.promise;
    },
    createCategory:      function (parsed) {
        var D = Q.defer();
        Widget.createNewCat(parsed.widgetsParameters, parsed.req, function (err, data) {
            return err
                ? D.resolve(err)
                : D.resolve('Category has been successfully created');
        });
        return D.promise;
    },
    updateCategory:      function (parsed) {
        var D = Q.defer();
        Widget.setCat(parsed.categoryName, parsed.widgetsParameters, parsed.req, function (err, data) {
            return err
                ? D.resolve(err)
                : D.resolve('Category has been successfully updated');
        });
        return D.promise;
    },
    removeCategory:      function (parsed) {
        var D = Q.defer();
        Widget.deleteCat(parsed.widgetsParameters, parsed.req, function () {
            return D.resolve('Category ' + parsed.widgetsParameters.name + ' has been successfully deleted');
        });
        return D.promise;
    },
    exportView:          function (parsed) {
        var D = Q.defer();
        Widget.download_view(parsed.req, function (err, data) {
            return err
                ? D.resolve(err)
                : D.resolve(data);
        });        
        return D.promise;
    }   
};

Widget.api = endpoints.json({
    parser: function (req) {
        return {
            action: req.params.action,
            data:   {
                widgetName:        req.params.widgetName,
                categoryName:      req.params.nameWidgetCat,
                applicationName:   req.params.applicationName,
                platform:          req.params.platform,
                widgetsParameters: req.body,
                req:               req
            }
        }
    },
    action: api,
    log:    log
});

Widget.index = function (req, res, storage, version) {
    tenants.get(req.session.tenant.id).then(function(tenant){
        var googleMapAPIKey;
        var loadGoogleMap = false
        if (tenant.googleAPIKey) {
            googleMapAPIKey = tenant.googleAPIKey;
            loadGoogleMap = true;
        }
        res.render('studio/widget-editui-' + req.params.platform + '-index.jade', {
            "tenantid":      req.session.tenant.id,
            "username":      req.session.user.id,
            "applicationName": req.params.applicationName,
            "widgetName":      req.params.widgetName,
            "platform" :       req.params.platform || widget.platform,
            "documentation": storage.documentation,
            "version":       version,
            "googleMapAPIKey" : googleMapAPIKey,
            "loadGoogleMap" : loadGoogleMap
        });
    });
};

Widget.search = function (req, res) {
    Widget.getAllWithFilter({'name': {$regex: req.query.q, $options: 'i'}}, req, function (arr_widgets) {
        if (!arr_widgets) {
            return res.end("{widget:[]}");
        }
        res.end(JSON.stringify({
            widgets: arr_widgets
        }));
    });
};

/**
 * To use ONLY for search widgets from search page
 * @param req
 * @param res
 */
Widget.searchByApp = function (req, res) {
    var applicationDbName = getAppDbName(req.params.applicationName),
        filter            = {},
        $or               = [
            {
                name: {
                    $regex:   req.query.q,
                    $options: 'i'
                }
            },
            {
                description: {
                    $regex:   req.query.q,
                    $options: 'i'
                }
            }
        ];
    if (applicationDbName) {
        filter.$and = [{$or: $or}, {$or: [{application: applicationDbName}, {application: ''}]}];
    } else {
        filter.$or         = $or;
        filter.application = applicationDbName;
    }
    if (req.params.platform) {
        filter.platform = req.params.platform;
    }

    if (applicationDbName && (!req.params.platform)) {
        delete filter.$or;
        filter.application = applicationDbName;
    }

    var doSearch = function () {
        Widget.getAllWithFilter(filter, req, function (arr_widgets) {
            if (!arr_widgets) {
                return res.end("{widget:[]}");
            }
            res.end(JSON.stringify({
                widgets: arr_widgets
            }));
        });
    };

    if ((!filter.platform) && applicationDbName) {
        var applications = require('./dfx_applications');
        applications.getPlatform(applicationDbName, req, function (platform) {
            filter.platform = platform;
            doSearch();
        });
    } else {
        doSearch();
    }
};

Widget.view = function (req, res) {
    Widget.get(req.params.widgetName, req, function (widget) {
        fs.readFile(path.join(__dirname, '..', 'templates/studio/widgets/index.jade'), 'utf8', function (err, data) {
            if (err) throw err;
            var fn   = jade.compile(data);
            var body = fn({
                widget: widget
            });
            res.setHeader('Content-Type', 'text/html');
            res.setHeader('Content-Length', body.length);
            res.end(body);
        });
    });
};

Widget.migrate = function (req, res) {
    Widget.get(req.params.widgetName, req, function (widget) {
        fs.readFile(path.join(__dirname, '..', 'templates/studio/widgets/migrate.jade'), 'utf8', function (err, data) {
            if (err) throw err;
            var fn   = jade.compile(data);
            var body = fn({
                widget: widget
            });
            res.setHeader('Content-Type', 'text/html');
            res.setHeader('Content-Length', body.length);
            res.end(body);
        });
    });
};


Widget.getItem = function (req, res) {
    Widget.get(req.params.widgetName, req.params.applicationName, req.params.platform, req, function (widget) {
        res.end(JSON.stringify({
            widget: widget
        }));
    });
};

Widget.getScript = function (req, res) {
    Widget.get(req.params.widgetName, req.params.applicationName, req.params.platform, req, function (widget) {
        res.end(widget.src_script);
    });
};

Widget.editui = function (req, res) {
    Widget.get(req.params.widgetName, req.params.applicationName, req.params.platform, req, function (widget) {
        // put app name in cookie when opening widget builder
        Widget.cookieData.set(res, widget.application);

        widget.source = 'test';
        fs.readFile(path.join(__dirname, '..', 'templates/studio/widgets/view_visual_editor.jade'), 'utf8', function (err, data) {
            if (err) throw err;
            var fn   = jade.compile(data, {
                filename: path.join(__dirname, '..', 'templates/studio/widgets/view_visual_editor.jade')
            });
            var body = fn({
                widget: widget
            });
            res.setHeader('Content-Type', 'text/html');
            res.setHeader('Content-Length', body.length);
            res.end(body);
        });
    });
};

Widget.previewAuth = function (req, res) {
    var applicationDbName = getAppDbName(req.params.applicationName);
    try {
        fs.readFile(path.join(__dirname, '..', 'templates/widget_preview_auth.jade'), 'utf8', function (err, data) {
            if (err) throw err;

            var fn   = jade.compile(data, {
                filename: path.join(__dirname, '..', 'templates/widget_preview_auth.jade')
            });
            var body = fn({
                "ispreview":   '_preview',
                "appname":     applicationDbName,
                "server":      req.protocol + '://' + req.hostname + ':' + SETTINGS.server_port,
                "tenantid":    req.session.tenant.id,
                "wclass":      {"name": req.params.widgetName},
                "platform":    req.params.platform,
                "device":      req.params.device,
                jade_compiler: jade
            });
            res.setHeader('Content-Type', 'text/html');
            res.setHeader('Content-Length', body.length);
            res.end(body);
        });
    } catch (error) {
        var error_body = '<h1>Error in widget preview authentication</h1>'
            + error;
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Length', error_body.length);
        res.end(error_body);
    }
};

Widget.getWidgetScreens = function (req, res) {
    Widget.getGraphicalComponents(req.params.applicationName, req.params.widgetName, req.params.platform, req, function (gc) {
        var data = JSON.stringify(gc, null, 0);
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Content-Length', data.length);
        res.end(data);
    });
};

Widget.preview = function (req, res, resources) {
    Widget.get(req.params.widgetName, req.params.applicationName, req.params.platform, req, function (widget) {
        resources.getWidgetResourceItems(widget, req.session.tenant.id, function (arrayOfResourceItems) {
            fs.readFile(path.join(__dirname, '..', 'templates/widget_preview_web.jade'), 'utf8', function (err, data) {
                if (err) throw err;
                var fn = jade.compile(data, {
                    filename: path.join(__dirname, '..', 'templates/widget_preview_web.jade')
                });
                tenants.get(req.session.tenant.id).then(function(tenant){
                    var googleMapAPIKey;
                    var loadGoogleMap = false
                    if (tenant.googleAPIKey) {
                        googleMapAPIKey = tenant.googleAPIKey;
                        loadGoogleMap = true;
                    }
                    res.render('studio/widget-editui-' + req.params.platform + '-index.jade', {
                        "tenantid":      req.session.tenant.id,
                        "username":      req.session.user.id,
                        "applicationName": req.params.applicationName,
                        "widgetName":      req.params.widgetName,
                        "platform" :       req.params.platform || widget.platform,
                        "documentation": storage.documentation,
                        "version":       version,
                        "googleMapAPIKey" : googleMapAPIKey,
                        "loadGoogleMap" : loadGoogleMap
                    });
                });

                try {
                    var openDialogWidgetNames = getOpenDialogWidgetNames(widget.src_script);
                    tenants.get(req.session.tenant.id).then(function(tenant) {
                        var googleMapAPIKey;
                        var loadGoogleMap = false
                        if (tenant.googleAPIKey) {
                            googleMapAPIKey = tenant.googleAPIKey;
                            loadGoogleMap = true;
                        }

                        var obj = {
                            "appname": req.params.applicationName,
                            "platform": req.params.platform || widget.platform,
                            "appname_in_preview": widget.application,
                            "server": req.protocol + '://' + req.hostname + ':' + SETTINGS.server_port,
                            "tenantid": req.session.tenant.id,
                            "wclass": {"name": widget.name, "definition": widget},
                            resources: arrayOfResourceItems,
                            "dialog_widget_names": openDialogWidgetNames.widgetNames,
                            "dialog_widget_names_str": openDialogWidgetNames.widgetNamesStr,
                            jade_compiler: jade,
                            device: req.params.device,
                            googleMapAPIKey : googleMapAPIKey,
                            loadGoogleMap : loadGoogleMap
                        };

                        var body = fn(obj);
                        body = body.replace('{{source_styles}}', widget.src_styles);
                        body = body.replace('{{source_script}}', widget.src_script);


                        res.setHeader('Content-Type', 'text/html');
                        res.setHeader('Content-Length', body.length);
                        res.end(body);
                    });
                } catch (error) {
                    var error_body = '<h1 style="color:#d3393c">Error in widget compilation</h1>'
                        + '<pre>' + error + '</pre>'
                        + '<pre style="background: #d5e8f2; border: 1px #329fda solid;padding: 10px">' + widget.src.replace('\n', '\r', 'gi') + '</pre>';
                    res.setHeader('Content-Type', 'text/html');
                    res.setHeader('Content-Length', error_body.length);
                    console.log('here8');
                    res.end(error_body);
                }
            });
        });
    });
};

var getOpenDialogWidgetNames = function (widget_src_script) {
    var widgetNames = [], widgetNamesStr = '';

    // get all indexes of "widgetName" string
    var regex = /widgetName/gi, result, indices = [];
    while ((result = regex.exec(widget_src_script))) {
        indices.push(result.index);
    }

    var chooseNextPos = function (firstSymbolPos, secondSymbolPos) {
        var rightSymbolPos = -1;
        if (firstSymbolPos == -1) {
            rightSymbolPos = secondSymbolPos;
        } else if (secondSymbolPos == -1) {
            rightSymbolPos = firstSymbolPos;
        } else {
            rightSymbolPos = (firstSymbolPos < secondSymbolPos) ? firstSymbolPos : secondSymbolPos;
        }
        return rightSymbolPos;
    };

    // get all "widgetName" values
    for (var i = 0; i < indices.length; i++) {
        try {
            var nextColumn = widget_src_script.indexOf(':', indices[i]);
            var nextEqual  = widget_src_script.indexOf('=', indices[i]);
            var assignPos  = chooseNextPos(nextColumn, nextEqual);
            if (assignPos == -1) {
                continue;
            }

            var nextSingleQuotes   = widget_src_script.indexOf("'", assignPos);
            var nextDoubleQuotes   = widget_src_script.indexOf('"', assignPos);
            var widgetNameStartPos = chooseNextPos(nextSingleQuotes, nextDoubleQuotes);
            var widgetNameEndPos   = (widget_src_script.substring(widgetNameStartPos, widgetNameStartPos + 1) == "'")
                ? widget_src_script.indexOf("'", nextSingleQuotes + 1) : widget_src_script.indexOf('"', nextDoubleQuotes + 1);

            if (assignPos == -1 || widgetNameStartPos == -1 || widgetNameEndPos == -1) {
                continue;
            }

            var widgetName = widget_src_script.substring(widgetNameStartPos + 1, widgetNameEndPos);
            widgetNames.push(widgetName);
            widgetNamesStr += ",'" + widgetName + "'";
        } catch (parsingError) {
            log.error(parsingError);
        }
    }
    return {widgetNames: widgetNames, widgetNamesStr: widgetNamesStr};
};

Widget.getGcontrols = function (req, res) {
    fs.readFile(path.join(__dirname, '..', 'templates/studio/gcontrols/', req.params.wgt_platform, '/property/', req.params.gc_type + '.jade'), 'utf8', function (err, data) {
        if (err) throw err;
        var fn       = jade.compile(data, {
            filename: path.join(__dirname, '..', 'templates/studio/gcontrols/property/', req.params.gc_type + '.jade')
        });
        var body     = fn();
        var json_def = JSON.stringify({"name": req.params.gc_type, "fragment": body}, null, 0);
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Content-Length', json_def.length);
        res.end(json_def);
    });
};

Widget.getAll = function (req, callback) {
    var filter = versioning.getNotDeletedFilter(req);
    mdbw.get(repositoryPrefix + req.session.tenant.id, 'datawidgets', filter)
        .then(function (docs) {
            callback(docs);
        });
};

Widget.list = function (req, res) {
    Widget.select({platform: req.params.platform}, ['name'], req, function (arr_widgets) {
        res.end(JSON.stringify({
            widgets: arr_widgets
        }));
    });
};

Widget.listQuery = function (req, res) {
    var applicationDbName = getAppDbName(req.params.applicationName),
        filter            = {
            platform: req.params.platform
        };

    if (req.params.search) {
        filter.name = {$regex: req.params.search, $options: 'i'};
    }
    if (applicationDbName) {
        filter.$or = [{application: applicationDbName}, {application: ''}];
    } else {
        filter.application = applicationDbName;
    }

    Widget.select(filter, ['name', 'application'], req, function (arr_widgets) {
        res.end(JSON.stringify({
            widgets: arr_widgets
        }));
    });
};

Widget.selectAll = function (fields, req, callback) {
    var filter = versioning.getNotCommittedFilter(req);
    mdbw.select(repositoryPrefix + req.session.tenant.id, 'datawidgets', filter, fields)
        .then(function (docs) {
            callback(docs);
        });
};

Widget.select = function (query, fields, req, callback) {
    var filter = _.extend(query, versioning.getNotDeletedFilter(req));
    mdbw.select(repositoryPrefix + req.session.tenant.id, 'datawidgets', filter, fields)
        .then(function (docs) {
            callback(docs);
        });
};

Widget.selectAllbyApp = function (applicationName, platform, fields, req) {
    var applicationDbName = getAppDbName(applicationName);

    var filter         = versioning.getNotDeletedFilter(req);
    filter.application = applicationDbName;
    filter.platform = platform;

    return mdbw.select(repositoryPrefix + req.session.tenant.id, 'datawidgets', filter, fields)
        .then(function (docs) {
            return docs;
        });
};

Widget.getAllbyApp = function (applicationName, req, callback) {
    var applicationDbName = getAppDbName(applicationName);

    Widget.getAllWithFilter({application: applicationDbName}, req, callback);
};

Widget.getAllWithFilter = function (filter, req, callback) {
    var mainFilter = versioning.getNotDeletedFilter(req);
    _.extend(filter, mainFilter);
    mdbw.get(repositoryPrefix + req.session.tenant.id, 'datawidgets', filter)
        .then(function (docs) {
            callback(docs);
        });
};

Widget.get = function (widgetName, applicationName, platform, req, callback) {
    var applicationDbName = getAppDbName(applicationName),
        filter            = versioning.getNotDeletedFilterWithName(req, widgetName);

    // first, look for a widget in the application and then, look for it in the shared catalog
    if (applicationDbName) {
        filter.$or = [{application: applicationDbName}, {application: ''}];
    } else {
        filter.application = applicationDbName;
    }
    filter.platform = platform;

    Widget.getAllCat(req).then(function (cats) {
        mdbw.get(repositoryPrefix + req.session.tenant.id, 'datawidgets', filter).then(function (widgets) {

            // can find 2 widgets with the same name - one from app and another from shared catalog,
            // but we need to choose the one from app as a priority and only if it does not exist,
            // choose another one from shared catalog
            if (widgets.length > 0) {
                var widget = (widgets.length == 1) ? widgets[0]
                    : widgets[0].application ? widgets[0] : widgets[1];

                // if this is shared catalog widget, filter categories by widget platform
                if (!widget.application) {
                    var filteredCats  = cats.filter(function (cat) {
                        return cat.platform == widget.platform;
                    });
                    widget.widgetcats = filteredCats;
                } else {
                    widget.widgetcats = cats;
                }

                callback(widget);
            } else {
                return callback(widgets);
            }
        });
    });
};

Widget.getByApp = function (applicationName, widgetName, req, callback) {
    var filter         = versioning.getNotDeletedFilterWithName(req, widgetName);
    filter.application = applicationName;
    mdbw.getOne(repositoryPrefix + req.session.tenant.id, 'datawidgets', filter).then(function (doc) {
        callback(doc);
    });
};

/**
 * Used ONLY by compiler.
 */
Widget.getAsPromise = function (widgetName, applicationName, req) {
    var applicationDbName = getAppDbName(applicationName),
        filter            = versioning.getNotDeletedFilterWithName(req, widgetName);

    // first, look for a widget in the application and then, look for it in the shared catalog
    if (applicationDbName) {
        filter.$or = [{application: applicationDbName}, {application: ''}];
    } else {
        filter.application = applicationDbName;
    }

    return Widget.getAllCat(req)
        .then(function (cats) {
            return mdbw.get(repositoryPrefix + req.session.tenant.id, 'datawidgets', filter)
                .then(function (widgets) {
                    // can find 2 widgets with the same name - one from app and another from shared catalog,
                    // but we need to choose the one from app as a priority and only if it does not exist,
                    // choose another one from shared catalog
                    if (widgets.length > 0) {
                        var widget = (widgets.length == 1) ? widgets[0]
                            : widgets[0].application ? widgets[0] : widgets[1];

                        widget.widgetcats = cats;
                        return widget;
                    } else {
                        return {};
                    }
                });
        });
};

Widget.getWidgetAppNames = function (widgetName, req) {
    var Screens = require('./dfx_screens');
    return Screens.getAllByTenant(req)
        .then(function (screen_items) {
            var i = 0, widgetApps = [];

            for (i = 0; i < screen_items.length; i++) {
                if (widgetApps.indexOf(screen_items[i].application) > -1) {
                    continue;
                }
                var screenWidgets = Screens.getScreenWidgetNames(screen_items[i]);
                if (screenWidgets.indexOf(widgetName) > -1) {
                    widgetApps.push(screen_items[i].application);
                }
            }
            return widgetApps;
        });
};

Widget.getGraphicalComponents = function (applicationName, widgetName, req, callback) {
    mdbw.getOne(repositoryPrefix + req.session.tenant.id, 'datawidgets', {
        application: applicationName,
        name:        widgetName
    }).then(function (data) {
        var src = JSON.parse(data.src),
            gcs = [];
        src.definition.forEach(function (def) {
            Widget.getGraphicalComponentsAttributes.call(gcs, def);
        });
        //Widget.getGraphicalComponentsAttributes.call(gcs, src.definition[0]);
        //console.log('GCS Data:', gcs);
        callback(gcs);
    });
};

Widget.getGraphicalComponentsAttributes = function (def) {
    var gcs = this;
    def.children.forEach(function (gc) {
        var attrs = {};
        try {
            for (var element in gc.attributes) {
                if (element.match(/^display|disabled|labelVisible$/)) {
                    attrs[element] = gc.attributes[element];
                }
            }
            gcs.push({
                id:         gc.id,
                type:       gc.type,
                name:       gc.attributes.name.value,
                attributes: attrs
            });
            if (gc.children.length) {
                Widget.getGraphicalComponentsAttributes.call(gcs, gc.children);
            }
        } catch (error) {
            log.error(error);
        }
    });
};

Widget.countByApp = function (req, res) {
    var applicationDbName = getAppDbName(req.params.applicationName);
    Widget.count({application: applicationDbName}, req, function (quantity) {
        res.end(JSON.stringify({
            nbwidgets: quantity
        }));
    });
};

Widget.count = function (query, req, callback) {
    var filter = versioning.getNotDeletedFilter(req);
    _.extend(query, filter);
    mdbw.count(repositoryPrefix + req.session.tenant.id, 'datawidgets', query)
        .then(function (quantity) {
            callback(quantity);
        })
        .fail(function (error) {
            log.error(error);
        });
};

Widget.recover = function (widgetName, req, callback) {
    var filter = versioning.getRecoverFilter(req);
    mdbw.update(repositoryPrefix + req.session.tenant.id, 'datawidgets', {name: widgetName}, {$set: filter})
        .then(function (quantity) {
            callback(null, quantity);
        })
        .fail(function (err) {
            callback(err, null);
            log.error(err);
        });
};

Widget.set = function (widgetName, applicationName, datawidget, req, callback) {
    var appDbName          = getAppDbName(applicationName || datawidget.application);
    datawidget.application = getAppDbName(datawidget.application);
    datawidget.category    = datawidget.category || 'Default';
    if ((datawidget.name) &&  (datawidget.name != widgetName)) {
        datawidget.src_script = datawidget.src_script.replace(new RegExp(widgetName,'g'), datawidget.name);
    }

    versioning.setWidget(widgetName, appDbName, datawidget.platform, req, function () {
        datawidget.requestDate = new Date();
        mdbw.update(repositoryPrefix + req.session.tenant.id, 'datawidgets', {
            name:        widgetName,
            application: appDbName,
            platform : datawidget.platform
        }, {$set: datawidget})
            .then(function (quantity) {
                callback(null, quantity);
            })
            .fail(function (err) {
                callback(err, null);
            });
    });
};

Widget.saveAs = function (widgetName, datawidget, req, callback) {
    var appDbName       = getAppDbName(datawidget.application);
    var appTargetDbName = getAppDbName(datawidget.applicationTarget);
    var categoryTarget  = datawidget.categoryTarget;
    var that            = this;

    var appNameToUse = (datawidget.applicationTarget) ? appTargetDbName : appDbName;
    var widgetFilter = versioning.getSaveAsFilter(req, widgetName, appNameToUse);

    var current_widget_name = datawidget.current_widget_name;
    delete datawidget.current_widget_name;
    delete datawidget.applicationTarget;
    delete datawidget.categoryTarget;

    datawidget.name        = widgetName;
    datawidget.requestDate = new Date();

    mdbw.rm(repositoryPrefix + req.session.tenant.id, 'datawidgets', widgetFilter)
        .then(function () {
            that.get(current_widget_name, datawidget.application, req, function (widget) {
                // get some data from the current widget
                datawidget.ownerId     = datawidget.ownerId || widget.ownerId;
                datawidget.description = datawidget.description || widget.description;
                datawidget.platform    = widget.platform;
                datawidget.wtype       = widget.wtype;
                datawidget.application = appNameToUse;

                if (!datawidget.category) {
                    if (categoryTarget == '' || categoryTarget) {
                        datawidget.category = categoryTarget;
                    } else {
                        datawidget.category = widget.category;
                    }
                }

                // save as - save new widget
                mdbw.put(repositoryPrefix + req.session.tenant.id, 'datawidgets', datawidget)
                    .then(function (widget_id) {
                        versioning.addWidget(widget_id, req, function () {
                            callback(null, widget_id);
                        });
                    }).fail(function (err) {
                        if (err.code == 11000) {
                            callback('View with name "' + widgetName + '" already exists', null);
                        } else {
                            callback('Unknown error', null);
                        }
                    });
            });
        });
};

Widget.createNew = function (widgetParameters, req, callback) {
    var appDbName = getAppDbName(widgetParameters.application);

    Widget.getNewJSON(req.session.tenant.id, function (err, json) {
        if (err) return callback(err, null);
        json.name        = widgetParameters.name;
        json.application = appDbName;
        json.ownerId     = widgetParameters.ownerId;
        json.description = widgetParameters.description;
        json.requestDate = new Date();
        json.category    = widgetParameters.category;
        json.wtype       = widgetParameters.wtype;
        json.platform    = widgetParameters.platform;
        json.src         = widgetParameters.src;
        json.src_script  = widgetParameters.src_script ||
            '// this line should not be removed\r\nvar ' + widgetParameters.name + ' = angular.module("' + widgetParameters.name + '",[\'dfxAppServices\']);' +
            '\r\n\r\n' + widgetParameters.name + '.controller( "' + widgetParameters.name + 'Controller", [ \'$scope\', function( $scope ) {\n\t\n}]);\n';
        json.src_styles  = widgetParameters.src_styles || '';
        var widgetFilter = versioning.getSaveAsFilter(req, widgetParameters.name, appDbName);
        mdbw.rm(repositoryPrefix + req.session.tenant.id, 'datawidgets', widgetFilter)
            .then(function () {
                mdbw.put(repositoryPrefix + req.session.tenant.id, 'datawidgets', json)
                    .then(function (widget_id) {
                        versioning.addWidget(widget_id, req, function () {
                            callback(null, widget_id);
                        });
                    })
                    .fail(function (err) {
                        if (err.code == 11000) {
                            callback('View with name "' + widgetParameters.name + '" already exists', null);
                        } else {
                            callback('Unknown error', null);
                        }
                    });
            });
    });
};

Widget.getCatList = function (req, res) {
    req.params.application = getAppDbName(req.params.applicationName);
    Widget.getAllCat(req).then(function (cats) {
        result = {"web":[],"tablet":[],"mobile":[]};
        cats.forEach(function (category) {
            result[category.platform].push(category);
        });
            res.end(JSON.stringify(result));
    });
};

// collection: datawidgets_categories
Widget.getAllCat = function (req, callback) {
    var application = req.params.hasOwnProperty('applicationName') ? req.params.applicationName : req.params.application;

    return mdbw.get(repositoryPrefix + req.user.tenantid, 'datawidgets_categories', {
        application: getAppDbName(application),
        platform: req.params.platform
    }).then(function (docs) {
        if (callback) {
            callback(docs);
        } else {
            return docs;
        }
    });
};

Widget.getTenantCategories = function (req, callback) {
    return mdbw.get(repositoryPrefix + req.user.tenantid, 'datawidgets_categories').then(function (docs) {
        if (callback) {
            callback(docs);
        } else {
            return docs;
        }
    });
};

Widget.createWidget = function (req, res) {
    Widget.getAllCat(req)
        .then(function (cats) {
            fs.readFile(path.join(__dirname, '..', 'templates/studio/create-widget.jade'), 'utf8', function (err, data) {
                if (err) throw err;
                var fn   = jade.compile(data);
                var body = fn({
                    widgetcats: cats
                });
                res.setHeader('Content-Type', 'text/html');
                res.setHeader('Content-Length', body.length);
                res.end(body);
            });
        });
};

Widget.getNewJSON = function (req, callback) {
    fs.readFile(path.join(__dirname, '..', 'templates/static_json/blanks/widget.json'), 'utf8', function (err, data) {
        if (err) log.error(err);
        callback(err, JSON.parse(data));
    });
};

/*
 * Creates widget from a model
 */
Widget.createFromModel = function (widgetParameters, req, callback) {
    var appDbName = getAppDbName(widgetParameters.application);

    var json_main_def = widgetParameters;
    json_main_def.requestDate = new Date();

    var widgetFilter = versioning.getSaveAsFilter(req, widgetParameters.name, appDbName, widgetParameters.platform);
    mdbw.rm(repositoryPrefix + req.session.tenant.id, 'datawidgets', widgetFilter)
        .then(function () {
            mdbw.put(repositoryPrefix + req.session.tenant.id, 'datawidgets', json_main_def)
                .then(function (widget_id) {
                    versioning.addWidget(widget_id, req, function () {
                        callback(null, widget_id);
                    });
                }).fail(function (err) {
                    if (err.code == 11000) {
                        callback('Widget with name "' + widgetParameters.name + '" already exists', null);
                    } else {
                        callback('Unknown error', null);
                    }
                });
        });
};

/*
 * Creates predefined widget of one of the types: chart, datagrid, form.
 */
Widget.createPredefined = function (widgetParameters, req, callback) {
    var appDbName = getAppDbName(widgetParameters.application);

    Widget.getPredefinedDefinition(req, widgetParameters.predefinedType, widgetParameters.platform, function (err, json_main_def, json_source, script) {
        if (err) return callback(err, null);
        // main properties
        json_main_def.name        = widgetParameters.name;
        json_main_def.ownerId     = widgetParameters.ownerId;
        json_main_def.description = widgetParameters.description;
        json_main_def.requestDate = new Date();
        json_main_def.category    = widgetParameters.category;
        json_main_def.platform    = widgetParameters.platform;
        json_main_def.wtype       = 'visual';
        json_main_def.application = appDbName;

        // source and script
        var controllerName                                    = widgetParameters.name + 'Controller';
        var formName                                          = widgetParameters.name + 'Form';
        json_source.definition[0].attributes.controller.value = controllerName;
        json_source.definition[0].attributes.form.value       = formName;
        json_main_def.src                                     = JSON.stringify(json_source, null, '\t');

        if (json_main_def.platform == 'mobile') {
            json_main_def.src_script = widgetParameters.src_script ||
                '// this line should not be removed\r\nvar ' + widgetParameters.name + ' = angular.module("' + widgetParameters.name + '",[]);' +
                '\r\n\r\n' + widgetParameters.name + '.controller( "' + controllerName + '", ["$scope", "DFXMobile", function( $scope, DFXMobile ) {\n' +
                script +
                '\n}]);\n';
        } else {
            json_main_def.src_script = widgetParameters.src_script ||
                '// this line should not be removed\r\nvar ' + widgetParameters.name + ' = angular.module("' + widgetParameters.name + '",[]);' +
                '\r\n\r\n' + widgetParameters.name + '.controller( "' + controllerName + '", function( $scope ) {\n' +
                script +
                '\n});\n';
        }

        // add to the database
        var widgetFilter = versioning.getSaveAsFilter(req, widgetParameters.name, appDbName);
        mdbw.rm(repositoryPrefix + req.session.tenant.id, 'datawidgets', widgetFilter)
            .then(function () {
                mdbw.put(repositoryPrefix + req.session.tenant.id, 'datawidgets', json_main_def)
                    .then(function (widget_id) {
                        versioning.addWidget(widget_id, req, function () {
                            callback(null, widget_id);
                        });
                    }).fail(function (err) {
                        if (err.code == 11000) {
                            callback('Widget with name "' + widgetParameters.name + '" already exists', null);
                        } else {
                            callback('Unknown error', null);
                        }
                    });
            });
    });
};

Widget.getPredefinedDefinition = function (req, predefinedType, platform, callback) {
    Widget.getNewJSON(req.session.tenant.id, function (err, json_main_def) {
        var prefix = (platform == 'mobile') ? '_mobile' : '';
        fs.readFile(path.join(__dirname, '..', 'templates/static_json/predefined/widget_' + predefinedType + '_source' + prefix + '.json'), 'utf8', function (err, source) {
            fs.readFile(path.join(__dirname, '..', 'templates/static_json/predefined/widget_' + predefinedType + '_script' + prefix + '.js'), 'utf8', function (err, script) {
                if (err) log.error(err);
                callback(err, json_main_def, JSON.parse(source), script);
            });
        });
    });
};

Widget.render = function (wclass, req, res) {
    Widget.get(wclass, req, function (widget_item) {
        renderWidgetFrame(widget_item, res, req);
    });
};

Widget.renderWidgetFrame = function (datawidget, res, req) {

    fs.readFile(path.join(__dirname, '..', 'templates/dw/widget_frame.jade'), 'utf8', function (err, data) {
        if (err) {
            log.error(err);
            return res.end("0");
        }
        var fn   = jade.compile(data, {
            filename: path.join(__dirname, '..', 'templates/dw/widget_frame.jade')
        });
        var body = fn({
            widgetname: datawidget.name,
            children:   datawidget.parameters.widgetDefinition.definition[0].children
        });
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Length', body.length);
        res.end(body);
    });

};

Widget.delete = function (widgetName, applicationName, platform, req, callback) {
    var appDbName = getAppDbName(applicationName);

    versioning.moveToTrash({
            tenantId:    req.session.tenant.id,
            name:        widgetName,
            application: appDbName,
            platform: platform
        }
    )
        .then(function () {
            mdbw.rm(repositoryPrefix + req.session.tenant.id, 'datawidgets', {name: widgetName, application: appDbName, platform: platform})
                .then(function (quantity_app) {
                    callback();
                });
        });
};

/*
 Widget Category
 */
Widget.getNewJSONCat = function (req, callback) {
    fs.readFile(path.join(__dirname, '..', 'templates/static_json/blanks/widget_categories.json'), 'utf8', function (err, data) {
        if (err) log.error(err);
        callback(err, JSON.parse(data));
    });
};

Widget.createNewCat = function (widgetParameters, req, callback) {
    var appDbName = getAppDbName(widgetParameters.application);
    var userId    = req.session.user.id;

    var filter = {
        name:        widgetParameters.name,
        application: appDbName,
        platform : widgetParameters.platform
    };
    if (!appDbName) filter.platform = widgetParameters.platform;

    Widget.getNewJSONCat(req.user.tenantid, function (err, json) {
        if (err && callback) return callback(err, null);
        mdbw.exists(repositoryPrefix + req.user.tenantid, 'datawidgets_categories', filter).then(function (result) {
            if (!result) {
                json.ownerId     = widgetParameters.ownerId;
                json.name        = widgetParameters.name;
                json.application = appDbName;
                json.requestDate = new Date();
                json.visibility  = "visible";
                json.versioning  = {
                    "status":      'added',
                    "user":        userId,
                    "last_action": (new Date() / 1000).toFixed()
                };
                if (widgetParameters.platform) json.platform = widgetParameters.platform;
                mdbw.put(repositoryPrefix + req.user.tenantid, 'datawidgets_categories', json)
                    .then(function (widgetcat_id) {
                        mdbw.rm(repositoryPrefix + req.user.tenantid, 'trash', {
                            name:        widgetParameters.name,
                            application: appDbName,
                            platform : widgetParameters.platform,
                            type:        'datawidgets_categories'
                        }).then(function () {
                            if (callback) callback(null, widgetcat_id);
                        });
                    });
            } else {
                if (callback) callback("Current category name already exists");
            }
        });
    });
};

Widget.deleteCat = function (widgetParameters, req, callback) {
    var appDbName = getAppDbName(widgetParameters.application),
        userId    = req.session.user.id,
        tenantId  = req.user.tenantid;

    var filter = {
        name:        widgetParameters.name,
        application: appDbName,
        platform: widgetParameters.platform
    };

    mdbw.getOne(repositoryPrefix + tenantId, 'datawidgets_categories', filter).then(function (category) {
        category.type       = "datawidgets_categories";
        category.versioning = {
            "status":      'deleted',
            "user":        userId,
            "last_action": (new Date() / 1000).toFixed()
        };
        mdbw.put(repositoryPrefix + tenantId, 'trash', category).then(function () {
            mdbw.rm(repositoryPrefix + tenantId, 'datawidgets_categories', filter).then(function (quantity_wgts) {
                updateCategoryNameInWidgets(tenantId, appDbName, widgetParameters.name, 'Default', quantity_wgts, callback);
            });
        });
    }).fail(function (err) {
        log.error('Widget Category Deleting Error: ', err);
    });
};

Widget.setCat = function (currentCatName, widgetParameters, req, callback) {
    var newCatName = widgetParameters.name,
        appDbName  = getAppDbName(widgetParameters.application),
        tenantId   = req.user.tenantid,
        userId     = req.session.user.id;

    var filterGet   = {
        name:        currentCatName,
        application: appDbName,
        platform: widgetParameters.platform
    };
    var filterExist = {
        name:        newCatName,
        application: appDbName,
        platform: widgetParameters.platform
    };

    mdbw.getOne(repositoryPrefix + tenantId, 'datawidgets_categories', filterGet).then(function (categories) {
        mdbw.exists(repositoryPrefix + tenantId, 'datawidgets_categories', filterExist).then(function (result) {
            if (!result) {
                var status;
                (categories.versioning.status === 'committed') ? status = "modified" : status = categories.versioning.status;
                mdbw.update(repositoryPrefix + tenantId, 'datawidgets_categories', filterGet, {
                    $set: {
                        name: newCatName, versioning: {
                            "status":      status,
                            "user":        userId,
                            "last_action": (new Date() / 1000).toFixed()
                        }
                    }
                }).then(function (quantity_wgts) {
                    updateCategoryNameInWidgets(tenantId, appDbName, currentCatName, newCatName, quantity_wgts, callback);
                }).fail(function (err) {
                    log.error(err);
                });
            } else {
                callback("Current category name already exists");
            }
        });
    });
};

Widget.create_compiled_view = function (req, callback) {
    var view_renderer = require('./dfx_view_renderer'),    
        view_source_parsed = {
            "body": {
                "view_source": JSON.parse(req)
            }
        },
        view_compiled = view_renderer.render(view_source_parsed);
    callback(view_compiled);
}

Widget.create_view_zip = function (view_name, view_data, callback) {
    var dir_path = path.join(__dirname, '../../..', 'devTmp/', view_name);
    QFS.makeTree(dir_path).then( function(){
        for (var view_prop in view_data) {
            var file_path = path.join(dir_path, view_data[view_prop].name);
            fs.writeFile(file_path, view_data[view_prop].value);
        }
        var view_zip = {
            "folderPath": dir_path,
            "outputPath": dir_path+'.zip'
        }
        ziper.compress(view_zip).then(function(){
            callback(dir_path+'.zip');                    
        });
    });
}

Widget.download_view = function (req, callback) {
    var view_config = {"input": [], "output": [], "context":[]};

    mdbw.getOne(repositoryPrefix + req.session.tenant.id, 'datawidgets', {
        application: req.params.applicationName,
        name:        req.params.viewName
    }).then(function (data) {
        Widget.create_compiled_view(data.src, function (cards) {
            var view_data = {
                "src": {
                    "name": data.name+'.json', 
                    "value": data.src
                },
                "scripts": {
                    "name": data.name+'.js', 
                    "value": data.src_script
                },
                "styles": {
                    "name": data.name+'.css', 
                    "value": data.src_styles
                },
                "config": {
                    "name": data.name+'.config.json', 
                    "value": JSON.stringify(view_config, null, '\t')
                }
            };

            for (var card in cards) {
                var card_container_tpl = '<link rel="stylesheet" type="text/css" href="/'+data.name+'.css" />'+
                        '<div ng-controller="'+data.name+'Controller">'+
                            '<div id="'+card+'" ng-controller="dfx_view_controller" dfx-view="'+data.name+'" '+
                            'dfx-view-card="'+card+'"></div>'+
                        '</div>';
                view_data[card + '_tpl'] = {
                    "name": data.name + '_' + card+'.html', 
                    "value": card_container_tpl
                };
                view_data[card + '_compiled'] = {
                    "name": data.name + '_' + card+'_compiled.html', 
                    "value": cards[card]
                };
            };

            Widget.create_view_zip(data.name, view_data, function (view_zip_path) {
                callback(view_zip_path);
            });
        });
    }).fail(function (err) {
        log.error(err);
    });
}

Widget.get_view_archive = function (req, res) {
    var view_zip_name = req.params.viewName + '.zip',
        view_zip_path = req.query.path;

    if (!req.query.path) {
        res.status(404).end('You need to specify path to zip file into "path" variable');
    } else {
        fs.exists(view_zip_path, function (exist) {
            if (exist) {
                res.download(view_zip_path, view_zip_name);
            } else {
                res.status(404).end("File with path - " + view_zip_path + " doesn't exists");
            }
        })
    }
};

var updateCategoryNameInWidgets = function (tenantId, applicationName, currentCatName, newCatName, quantity_wgts, callback) {
    // update this category name in all the widgets
    mdbw.update(repositoryPrefix + tenantId, 'datawidgets',
        {application: applicationName, category: currentCatName},
        {$set: {category: newCatName}}
    ).then(function (quantity_wgts) {
            callback(null, quantity_wgts);
        }).fail(function (err) {
            log.error(err);
        });
};

Widget.cookieData = (function (){
    var MAX_AGE                = SETTINGS.dfx_last_login_cookie_max_age,
        COOKIE_NAME = 'app_name';

    return {

        set : function ( res, appName ) {
            res.cookie(COOKIE_NAME, appName, {
                maxAge: MAX_AGE,
                httpOnly: true
            });
        },

        get : function ( req ) {
            var cookie = req.cookies[COOKIE_NAME],
                obj = {appName : ''};

            if ( !cookie ) return obj;

            obj.appName = cookie;

            return obj;
        }
    };
})();

var getAppDbName = function (applicationName) {
    return ((!applicationName) || applicationName == sharedCatalogName) ? '' : applicationName;
};

module.exports = Widget;
