/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var jade               = require('jade');
var fs                 = require('graceful-fs');
var path               = require('path');
var _                  = require('underscore');
var Q                  = require('q');
var SETTINGS           = require('./dfx_settings');
var applications       = require('./dfx_applications');
var compiler          = require('./dfx_compiler');
var widgets            = require('./dfx_widgets');
var queries            = require('./dfx_queries');
var screens            = require('./dfx_screens');
var screens_categories = require('./dfx_screens_categories');
var sysadmin           = require('./dfx_sysadmin');
var menus              = require('./dfx_menus');
var users              = require('./dfx_sysadmin').tenant.user;
var roles              = require('./dfx_sysadmin').tenant.role;
var log                = new (require('./utils/log')).Instance({label: 'STUDIO'});
var mdbw               = require('./mdbw')(SETTINGS.mdbw_options);
var DB_TENANTS_PREFIX  = SETTINGS.databases_tenants_name_prefix;
//var sessionUtil = require('./dfx_sessions');
// var newsfeed = require('./dfx_newsfeed'); // is used nowhere TODO remove?

var Studio = {};

// Get all tenant builds separate by apps
Studio.getBuilds = function(req, res) {
    applications.getAllSorted(req, function (apps) {
        var applications = apps.map(function(app){
            return app.name;
        });
        var tasks = []
        applications.forEach(function(app){
            tasks.push((function () {
                var result = {};
                var D = Q.defer();
                     mdbw.get(
                        DB_TENANTS_PREFIX + req.session.tenant.id,
                        'application_builds',
                        {application: app}
                    ).then(function(res){
                             result[app] = res;
                             return D.resolve(result);
                        });
                return D.promise;
            })());
        });

        Q.all(tasks).then(function(response){
            res.send(response);
        });


    });
};

// Get app tree
Studio.tree = function(req, res) {
    if (_.isEmpty(req.query)) {
        applications.getAllSorted(req, function (apps) {
            res.send(apps);
        });
    }

    var application = req.query.application || '';
    var tenantid = req.session.tenant.id;
    var userid = req.session.user.id;
    var tasks = [];
    tasks.push(sysadmin.tenant.role.list({tenant: tenantid}).then(function (roles) {
        return roles.filter(function (role) {
            return role.application == application;
        }).sort(function (first, second) {
            return first.name.localeCompare(second.name);
        }).map(function (roles) {
            return roles.name;
        });
    }));

    tasks.push((function () {
        var D = Q.defer();
        var result = {};
        screens_categories.getTenantCategories(req, function (scrn_cats_data) {
            var categories = scrn_cats_data.filter(function (category) {
                return category.application == application;
            });
            screens.getEntireSet(req, function (screens_data) {
                var screens = screens_data.filter(function (screen) {
                    return (screen.application == application);
                });
                result = {"web":{},"tablet":{},"mobile":{}};
                categories.forEach(function (category) {
                    result[category.platform][category.name] = screens.filter(function (screen) {
                        return (screen.category == category.name) && (screen.platform == category.platform);
                    }).map(function (screen) {
                        return { "name" : screen.name, "title" : screen.title};
                    });
                });
                return D.resolve(result);
            });
        });
        return D.promise;
    })());

    tasks.push((function () {
        var D = Q.defer();
        var result = {};
        widgets.getTenantCategories(req, function (wgt_cats_data) {
            var categories = wgt_cats_data.filter(function (category) {
                return category.application == application;
            });
            widgets.getAll(req, function (wgt_data) {
                var widgets = wgt_data.filter(function (wgt) {
                    return (wgt.application == application);
                }).sort(function (first, second) {
                    return first.name.localeCompare(second.name);
                });
                result = {"web":{},"tablet":{},"mobile":{}};
                categories.forEach(function (category) {
                    result[category.platform][category.name] = widgets.filter(function (widget) {
                        return (widget.category == category.name) && (widget.platform == category.platform);
                    }).map(function (widget) {
                        return  {"name" : widget.name, description : widget.description};
                    })
                });
                return D.resolve(result);
            });
        });
        return D.promise;
    })());

    tasks.push((function () {
        var D = Q.defer();
        var result = {};
        queries.getTenantCategories(req, function (q_cats_data) {
            var categories = q_cats_data.filter(function (category) {
                return category.application == application;
            });
            queries.getAll(req, function (q_data) {
                var queries = q_data.filter(function (q) {
                    return (q.application == application);
                }).sort(function (first, second) {
                    return first.name.localeCompare(second.name);
                });
                categories.forEach(function (category) {
                    result[category.name] = queries.filter(function (query) {
                        return query.category == category.name;
                    }).map(function (query) {
                        return {"name" : query.name, "description" : query.description, "services" : Object.keys(query.apiRoutes)};
                    })
                });
                return D.resolve(result);
            });
        });
        return D.promise;
    })());

    Q.all(tasks).then(function (result) {
        var resultData = {
            "roles": result[0],
            "pages": result[1],
            "views": result[2],
            "apiServices": result[3]
        };
        if (!req.cb) {
            res.send(resultData);
        } else {
            req.cb(resultData);
        }
    });
};

// Get app main stats
Studio.mainStats = function(req, res) {
    var tasks = [];
    var tenantid = req.session.tenant.id;

    tasks.push((function () {
        var D = Q.defer();
        applications.getAllSorted(req, function (applications) {
            return D.resolve(applications);
        });
        return D.promise;
    })());

    tasks.push((function () {
        var D = Q.defer();
        screens_categories.getTenantCategories(req, function (categories) {
            return D.resolve(categories);
        });
        return D.promise;
    })());

    tasks.push((function(){
        var D = Q.defer();
        screens.getEntireSet(req, function (screens) {
            return D.resolve(screens);
        });
        return D.promise;
    })());

    tasks.push((function(){
        var D = Q.defer();
        queries.getTenantCategories(req, function (categories) {
            return D.resolve(categories);
        });
        return D.promise;
    })());

    tasks.push((function () {
        var D = Q.defer();
        queries.getAll(req, function (queries) {
            return D.resolve(queries);
        });
        return D.promise;
    })());

    tasks.push((function(){
        var D = Q.defer();
        widgets.getTenantCategories(req, function (categories) {
            return D.resolve(categories);
        });
        return D.promise;
    })());

    tasks.push((function () {
        var D = Q.defer();
        widgets.getAll(req, function (widgets) {
            return D.resolve(widgets);
        });
        return D.promise;
    })());

    tasks.push(sysadmin.tenant.role.list({tenant: tenantid}));

    tasks.push((function(){
        var D = Q.defer();
        applications.getAllSorted(req, function (applications) {
            var tasks = [];
            applications.map(function(app){
                tasks.push(sysadmin.tenant.user.list(tenantid, false, null, app.name));
            });
            Q.all(tasks).then(function(res){
                var result = [];
                res.forEach(function(r){
                    result = result.concat(r);
                });
                return D.resolve(result);
            });
        });
        return D.promise;
    })());

    Q.all(tasks).then(function (result) {
        var applications = result[0];
        var screens_categories = result[1];
        var screens = result[2];
        var queries_categories = result[3];
        var queries = result[4];
        var widgets_categories = result[5];
        var widgets = result[6];
        var roles = result[7];
        var users = result[8];
        var response = { "apps": [] };
        if (applications.length > 0) {
            applications.push({"name": ""});

            applications.forEach(function (app) {
                response.apps.push({
                    "name": (app.name) ? app.name : 'Shared Catalog',
                    "title": (app.title) ? app.title: 'Components shared accross applications',
                    "pages": {
                        "count": screens.filter(function (screen) {
                            return screen.application == app.name
                        }).length,
                        "categories": screens_categories.filter(function (category) {
                            return category.application == app.name
                        }).map(function (category) {
                            return {
                                "name": category.name, "count": screens.filter(function (screen) {
                                    return category.name == screen.category && screen.application == category.application;
                                }).length
                            };
                        })
                    },
                    "views": {
                        "count": widgets.filter(function (widget) {
                            return widget.application == app.name
                        }).length,
                        "categories": widgets_categories.filter(function (category) {
                            return category.application == app.name
                        }).map(function (category) {
                            return {
                                "name": category.name, "count": widgets.filter(function (widget) {
                                    return category.name == widget.category && widget.application == category.application;
                                }).length
                            };
                        })
                    },
                    "apiServices": {
                        "count": queries.filter(function (query) {
                            return query.application == app.name
                        }).length,
                        "categories": queries_categories.filter(function (category) {
                            return category.application == app.name
                        }).map(function (category) {
                            return {
                                "name": category.name, "count": queries.filter(function (query) {
                                    return category.name == query.category && query.application == category.application;
                                }).length
                            };
                        })
                    },
                    "users": {
                        "count": users.filter(function (user) {
                            return user.application == app.name
                        }).length,
                        "roles": roles.filter(function (role) {
                            return role.application == app.name
                        }).map(function (role) {
                            return {
                                "name": role.name, "count": users.filter(function (user) {
                                    return user.application == role.application && user.roles.default == role.name;
                                }).length
                            };
                        })
                    }
                });
            });

            res.send(response);
        } else {
            res.send({});
        }
    });
};

Studio.landing = function (req, res, storage, version, tenants, dockerization_isOFF) {
    var tenantid = req.session.tenant.id,
        userid   = req.session.user.id,
        o        = {
            "tenantid":          tenantid,
            "username":          userid,
            "documentation":     storage.documentation,
            "version":           version,
            "sharedCatalogName": SETTINGS.sharedCatalogName,
            "deploymentUrl": 'http://' + SETTINGS.deployment_server_host + ':' + SETTINGS.deployment_server_port,
            "dockerization": !dockerization_isOFF
        };

    tenants.get(tenantid).then(function (tenant) {
        o.logoutURL = tenant.partner && tenant.partner.redirect.logoutUrlTempl
            ? tenant.partner.redirect.logoutUrlTempl + userid
            : '/studio/' + tenantid + '/login';

        o.sysUserManagmentUrl = tenant.partner && tenant.partner.redirect.sysUserManagmentUrl
            ? tenant.partner.redirect.sysUserManagmentUrl
            : '';

        res.render('studio/main/landing', o);
    });
};

Studio.index = function (req, res, storage, version, tenants, dockerization_isOFF) {

    var tenantid = req.session.tenant.id,
        userid   = req.session.user.id,
        o        = {
            "tenantid":          tenantid,
            "username":          userid,
            "documentation":     storage.documentation,
            "version":           version,
            "sharedCatalogName": SETTINGS.sharedCatalogName,
            "deploymentUrl": 'http://' + SETTINGS.deployment_server_host + ':' + SETTINGS.deployment_server_port,
            "dockerization": !dockerization_isOFF
        };

    tenants.get(tenantid).then(function (tenant) {
        o.logoutURL = tenant.partner && tenant.partner.redirect.logoutUrlTempl
            ? tenant.partner.redirect.logoutUrlTempl + userid
            : '/studio/' + tenantid + '/login';

        o.sysUserManagmentUrl = tenant.partner && tenant.partner.redirect.sysUserManagmentUrl
            ? tenant.partner.redirect.sysUserManagmentUrl
            : '';

        var index_template = (SETTINGS.studio_version==2) ? 'studio/index' : 'studio/main/index';
        res.render(index_template, o);
    });
};

Studio.getAuthProviders = function (req, res, sysadmin) {
    var o    = req.body || {};
    o.tenant = req.session.tenant.id;
    o.user   = req.session.user.id;

    (function () {
        return !o.action || !sysadmin.provider[o.action]
            ? Q.reject(new Error('unknown action: "' + o.action + '"'))
            : sysadmin.provider[o.action](o)
    })()
        .then(function (data) {
            return {data: data}
        })
        .fail(function (error) {
            return {error: error.message}
        })
        .then(function (data) {
            data = JSON.stringify(data, null, 0);
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('Content-Length', data.length);
            res.end(data);
        })
        .done();
};

Studio.getDbProviders = function (req, res, sysadmin) {
    var o    = req.body || {};
    o.tenant = req.session.tenant.id;
    o.dbDriverUser = o.user;
    o.user   = req.session.user.id;


    //log.dbg('request for /studio/db_drivers: ', o, 'session', req.session);

    (function () {
        return !o.action || !sysadmin.dbDriver[o.action]
            ? Q.reject(new Error('unknown action: "' + o.action + '"'))
            : sysadmin.dbDriver[o.action](o)
    })()
        .then(function (data) {
            data.min               = data.min || '1';
            data.max               = data.max || '10';
            data.idleTimeoutMillis = data.idleTimeoutMillis || '100';
            return {data: data}
        })
        .then(
        function (data) {
            res.json(data);
        },
        function (error) {

            var message;

            if (typeof error === 'string') {
                message = error;
                res.status(400);
            } else {
                message = 'server error';
                res.status(500);
            }

            log.error('[/studio/db_drivers] ', error.toString() || error);

            res.end(message);
        }
    );
};

Studio.initialize = function (app) {
};

Studio.dashboard = function (req, res) {
    req.session.screen = {
        name: "dashboard"
    };
//	sessionUtil.touch(req);
    queries.count({}, req, function (queries_quantity) {
        widgets.count({}, req, function (widgets_quantity) {
            applications.getAll(req, function (app_results) {
                fs.readFile(path.join(__dirname, '..', 'templates/studio/dashboard.jade'), 'utf8', function (err, data) {
                    if (err) throw err;

                    var fn   = jade.compile(data);
                    var body = fn({
                        "applications": app_results,
                        "nbwidgets":    widgets_quantity,
                        "nbqueries":    queries_quantity
                    });
                    res.setHeader('Content-Type', 'text/html');
                    res.setHeader('Content-Length', body.length);
                    res.end(body);
                });
            });
        });
    });
};

Studio.home = function (req, res) {
    var home_template = (SETTINGS.studio_version==2) ? '/templates/studio/home.jade' : '/templates/studio/main/home.jade';

    fs.readFile(path.join(__dirname, '..', home_template), 'utf8', function (err, data) {
        if (err) throw err;

        var fn   = jade.compile(data);
        var body = fn({});
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Length', body.length);
        res.end(body);
    });
};

Studio.searchComponents = function (req, res) {
    var retval = {};
    widgets.getAllWithFilter({name: {$regex: req.query.q, $options: 'i'}}, req, function (arr_widgets) {
        retval.widgets = arr_widgets || [];
        queries.getAllWithFilter({name: {$regex: req.query.q, $options: 'i'}}, req, function (arr_queries) {
            retval.queries = arr_queries || [];
            screens.getAllWithFilter({name: {$regex: req.query.q, $options: 'i'}}, req, function (arr_screens) {
                retval.screens = arr_screens || [];
                menus.getAllWithFilter({name: {$regex: req.query.q, $options: 'i'}}, req, function (arr_menu_items) {
                    retval.menu_items = arr_menu_items || [];
                    //users.list(req.session.tenant.id, false, req.user, '', {
                    //    kind:                'application',
                    //    'credentials.login': {
                    //        $regex:   req.query.q,
                    //        $options: 'i'
                    //    }
                    //}).then(function (arr_users) {
                    //    retval.users = arr_users || [];

                    var result = JSON.stringify(retval);
                    res.setHeader('Content-Type', 'application/json');
                    //res.setHeader('Content-Length', result.length);
                    res.end(result);
                    //}).fail(function(err){
                    //    console.log('Error: ', err);
                    //});
                });
            });
        });
    });
};

Studio.getTreeData = function (req, res) {
    applications.getAllSorted(req, function (apps) {
        if (apps.length) {
            widgets.getAll(req, function (wgt_data) {
                widgets.getTenantCategories(req, function (wgt_cats_data) {
                    queries.getAll(req, function (qry_data) {
                        queries.getTenantCategories(req, function (qry_cats_data) {
                            screens.getEntireSet(req, function (screens_data) {
                                screens_categories.getTenantCategories(req, function (scrn_cats_data) {
                                    sysadmin.tenant.role.list({tenant: req.session.tenant.id}).then(function (roles) {
                                        menus.getAllForAllApps(req, function (menuItemsData) {

                                            function getAppWgts(appname) {
                                                return wgt_data.filter(function (wgt) {
                                                    return wgt.application == appname;
                                                }).sort(function (first, second) {
                                                    return first.name.localeCompare(second.name);
                                                });
                                            }

                                            function getPlatformAppWgts(appname, platform) {
                                                return wgt_data.filter(function (wgt) {
                                                    return wgt.application == appname && wgt.platform == platform;
                                                }).sort(function (first, second) {
                                                    return first.name.localeCompare(second.name);
                                                });
                                            }

                                            function getAppQrys(appname) {
                                                return qry_data.filter(function (qry) {
                                                    return qry.application == appname;
                                                }).sort(function (first, second) {
                                                    return first.name.localeCompare(second.name);
                                                });
                                            }

                                            function getAppScreens(appname) {
                                                return screens_data.filter(function (screen) {
                                                    return screen.application == appname;
                                                });
                                            }

                                            function getAppMenuItems(appname) {
                                                return menuItemsData.filter(function (menuItem) {
                                                    return menuItem.application == appname;
                                                });
                                            }

                                            function getAppRoles(appname) {
                                                return roles.filter(function (role) {
                                                    return role.application == appname;
                                                }).sort(function (first, second) {
                                                    return first.name.localeCompare(second.name);
                                                });
                                            }

                                            var appsData = apps.map(function (app) {
                                                return Studio.getApplicationSubtree({
                                                    applicationId:   app._id,
                                                    applicationName: app.name,
                                                    platform:        app.platform,
                                                    application:     app,
                                                    widgets:         getAppWgts(app.name),
                                                    wgt_cats_data:   wgt_cats_data,
                                                    queries:         getAppQrys(app.name),
                                                    qry_cats_data:   qry_cats_data,
                                                    roles:           getAppRoles(app.name),
                                                    authsProvs:      [],
                                                    dbProvs:         [],
                                                    screens:         getAppScreens(app.name),
                                                    scrn_cats_data:  scrn_cats_data,
                                                    menuItems:       getAppMenuItems(app.name)
                                                });
                                            });

                                            var catalogData = Studio.getCatalogSubtree({
                                                applicationName: '',
                                                authsProvs:      [],
                                                dbProvs:         [],
                                                webWidgets:      getPlatformAppWgts('', 'web'),
                                                mobileWidgets:   getPlatformAppWgts('', 'mobile'),
                                                wgt_cats_data:   wgt_cats_data,
                                                queries:         getAppQrys(''),
                                                qry_cats_data:   qry_cats_data
                                            });

                                            res.end(JSON.stringify(appsData.concat([catalogData])));
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        } else {
            var data = [];
            res.end(JSON.stringify(data));
        }
    });
};

Studio.getApplicationSubtree = function (options) {
    var widgetsSubtree                 = Studio.getWidgetsSubtree(options.widgets, options.applicationId, options.applicationName, options.wgt_cats_data, options.platform),
        dataqueriesSubtree             = Studio.getDataqueriesSubtree(options.queries, options.applicationId, options.applicationName, options.qry_cats_data),
        appConfigSubtree               = Studio.getApplicationConfigurationSubtree(options.roles, options.applicationId, options.platform),
        screensSubtree                 = Studio.getScreensSubtree(options.screens, options.applicationId, options.applicationName, options.scrn_cats_data),
        authenticationProvidersSubtree = Studio.getAuthenticationProvidersSubtree(options.authsProvs),
        databaseProvidersSubtree       = Studio.getDatabaseProvidersSubtree(options.dbProvs),
        menuItemsSubtree               = Studio.getMenuItemsSubtree(options.menuItems);

    // Chnage order of appConfigSubtree
    var tmp = appConfigSubtree[0];
     appConfigSubtree[0] = appConfigSubtree[2];
     appConfigSubtree[2] = tmp;

    var appSubtree = {
        label:    '<span data-application-id="' + options.applicationId + '">' + options.applicationName + '</span>',
        id:       options.applicationId,
        children: [
            {
                label:    'Application Settings',
                id:       'conf_' + options.applicationId,
                children: [
                    '<a style="margin-left: -23px; padding: 1px; padding-left: 5px;" href="javascript:DfxStudio.Dispatcher.run(\'#!/home/{{application}}/settings\');"><span>►&nbsp;&nbsp;General Configuration</span></a>',
                    {
                        label:    'Security Providers',
                        children: [
                            {
                                label:    '<a href="javascript:DfxStudio.Dispatcher.run(\'#!/home/{{application}}/authentication-providers\');"><span>Authentication Providers</span></a>' +
                                          '<a  class="app-tree-icon pull-right" style="margin-right: 15px;" href="javascript:void(0);"' +
                                          ' onclick="DfxStudio.Home.AuthenticationProviders.create(\'{{application}}\');"' +
                                          ' title="Create Authentication Provider">' +
                                          '<span class="fa fa-plus"></span>' +
                                          '</a>',
                                children: authenticationProvidersSubtree
                            },
                            {
                                label:    '<a href="javascript:DfxStudio.Dispatcher.run(\'#!/home/{{application}}/database-providers\');"><span>Database Providers</span></a>' +
                                          '<a  class="app-tree-icon pull-right" style="margin-right: 15px;" href="javascript:void(0);"' +
                                          ' onclick="DfxStudio.Home.DatabaseProviders.create(\'{{application}}\');"' +
                                          ' title="Create Database Provider">' +
                                          '<span class="fa fa-plus"></span>' +
                                          '</a>',
                                children: databaseProvidersSubtree
                            }
                        ]
                    },
                    {
                        label:    'Resources',
                        children: [
                            '<a href="javascript:DfxStudio.Dispatcher.run(\'#!/home/{{application}}/resources/javascript\');"><span>JavaScript</span></a>',
                            '<a href="javascript:DfxStudio.Dispatcher.run(\'#!/home/{{application}}/resources/stylesheets\');"><span>CSS</span></a>',
                            '<a href="javascript:DfxStudio.Dispatcher.run(\'#!/home/{{application}}/resources/assets\');"><span>Images & Assets</span></a>'
                        ]
                    },
                    {
                        label:    'Personalization',
                        children: appConfigSubtree,
                        id:       'p13n_' + options.applicationId
                    },
                    {
                        label: '<a style="margin-left: -23px; padding: 1px; padding-left: 5px;" href="javascript:DfxStudio.Dispatcher.run(\'#!/home/{{application}}/deployment\');"><span>►&nbsp;&nbsp;Deployment</span></a>'
                    }
                ]
            },
            {
                label:    'Application Components',
                id:       'comp_' + options.applicationId,
                children: [
                    {
                        label:    '<a href="javascript:DfxStudio.Dispatcher.run(\'#!/home/{{application}}/menu-items\');" ' +
                        'data-component-name="" data-root-component-type="menu" data-application-name="{{application}}"><span>Navigation Menu</span></a>' +
                        '<a  class="app-tree-icon pull-right" style="margin-right: 15px;" href="javascript:void(0);"' +
                        ' onclick="DfxStudio.Home.MenuItems.create(\'{{application}}\');"' +
                        ' title="Create Navigation Menu Item">' +
                        '<span class="fa fa-plus"></span>' +
                        '</a>',
                        id:       'nav_' + options.applicationId,
                        children: menuItemsSubtree
                    },
                    {
                        label:    '<a href="javascript:DfxStudio.Dispatcher.run(\'#!/home/{{application}}/screens\');"><span>Pages</span></a>' +
                        '<a  class="app-tree-icon pull-right" style="margin-right: 15px;" href="javascript:void(0);"' +
                        ' onclick="DfxStudio.Screens.createScreen({application:\'{{application}}\'});"' +
                        ' title="Create Page">' +
                        '<span class="fa fa-plus"></span>' +
                        '</a>' +
                        '<span class="separator pull-right">|</span>' +
                        '<a  class="app-tree-icon pull-right" style="margin-right: 15px;" href="javascript:void(0);" ' +
                        'onclick="DfxStudio.Home.Screens.createCategory(\'{{application}}\');"' +
                        ' title="Create Pages Category">' +
                        '<span class="fa fa-tag"></span>' +
                        '<span class="badge badge-important">' +
                        '<span class="fa fa-plus"></span>' +
                        '</span>' +
                        '</a>',
                        id:       'scrns_' + options.applicationId,
                        children: screensSubtree,
                        visible:  (options.platform == 'web')
                    },
                    {
                        label:    '<a href="javascript:DfxStudio.Dispatcher.run(\'#!/home/{{application}}/widgets\');"><span>Views</span></a>' +
                                  '<a  class="app-tree-icon pull-right" style="margin-right: 15px;" href="javascript:DfxStudio.Dispatcher.run(\'#!/home/{{application}}/widgets/create\');"' +
                                  ' title="Create View">' +
                                  '<span class="fa fa-plus"></span>' +
                                  '</a>' +
                                  '<span class="separator pull-right">|</span>' +
                                  '<a  class="app-tree-icon pull-right" style="margin-right: 15px;" href="javascript:void(0);" ' +
                                  'onclick="DfxStudio.Home.Widgets.createCategory(\'{{application}}\');"' +
                                  ' title="Create View Category">' +
                                  '<span class="fa fa-tag"></span>' +
                                  '<span class="badge badge-important">' +
                                  '<span class="fa fa-plus"></span>' +
                                  '</span>' +
                                  '</a>',
                        id:       'wgts_' + options.applicationId,
                        children: widgetsSubtree
                    },
                    {
                        label:    '<a href="javascript:DfxStudio.Dispatcher.run(\'#!/home/{{application}}/queries\');"><span>API Services</span></a>' +
                                  '<a  class="app-tree-icon pull-right" style="margin-right: 15px;" href="javascript:DfxStudio.Dispatcher.run(\'#!/home/{{application}}/queries/create\');"' +
                                  ' title="Create API Route">' +
                                  '<span class="fa fa-plus"></span>' +
                                  '</a>' +
                                  '<span class="separator pull-right">|</span>' +
                                  '<a  class="app-tree-icon pull-right" style="margin-right: 15px;" href="javascript:void(0);" ' +
                                  'onclick="DfxStudio.Home.Dataqueries.createCategory(\'{{application}}\');"' +
                                  ' title="Create API Route Category">' +
                                  '<span class="fa fa-tag"></span>' +
                                  '<span class="badge badge-important">' +
                                  '<span class="fa fa-plus"></span>' +
                                  '</span>' +
                                  '</a>',
                        id:       'qrys_' + options.applicationId,
                        children: dataqueriesSubtree
                    }
                ]
            }
        ]
    };

    return Studio.getSubtree(options.applicationName, appSubtree);
};

Studio.getCatalogSubtree = function (options) {
    var webWidgetsSubtree    = Studio.getWidgetsSubtree(options.webWidgets, options.applicationId, options.applicationName, options.wgt_cats_data, 'web'),
        mobileWidgetsSubtree = Studio.getWidgetsSubtree(options.mobileWidgets, options.applicationId, options.applicationName, options.wgt_cats_data, 'mobile'),
        dataqueriesSubtree   = Studio.getDataqueriesSubtree(options.queries, options.applicationId, options.applicationName, options.qry_cats_data);

    var catSubtree = {
        label:    '<span>Shared Catalog</span>',
        id:       'catalog',
        children: [
            {
                label:    'System Configuration & Settings',
                id:       'conf_common_components',
                children: [
                    '<a href="javascript:DfxStudio.Dispatcher.run(\'#!/home/' + SETTINGS.sharedCatalogName + '/settings\');"><span>General Settings</span></a>',
                    {
                        label:    'Security Providers',
                        children: [
                            {
                                label:    '<a href="javascript:DfxStudio.Dispatcher.run(\'#!/home/' + SETTINGS.sharedCatalogName + '/authentication-providers\');"><span>Authentication Providers</span></a>' +
                                          '<a  class="app-tree-icon pull-right" style="margin-right: 15px;" href="javascript:void(0);"' +
                                          ' onclick="DfxStudio.Home.AuthenticationProviders.create(\'' + SETTINGS.sharedCatalogName + '\');"' +
                                          ' title="Create Authentication Provider">' +
                                          '<span class="fa fa-plus"></span>' +
                                          '</a>',
                                children: options.authsProvs
                            },
                            {
                                label:    '<a href="javascript:DfxStudio.Dispatcher.run(\'#!/home/' + SETTINGS.sharedCatalogName + '/database-providers\');"><span>Database Providers</span></a>' +
                                          '<a  class="app-tree-icon pull-right" style="margin-right: 15px;" href="javascript:void(0);"' +
                                          ' onclick="DfxStudio.Home.DatabaseProviders.create(\'' + SETTINGS.sharedCatalogName + '\');"' +
                                          ' title="Create Database Provider">' +
                                          '<span class="fa fa-plus"></span>' +
                                          '</a>',
                                children: options.dbProvs
                            }
                        ]
                    },
                    {
                        label:    'Resources',
                        id:       'shared_resources',
                        children: [
                            '<a href="javascript:DfxStudio.Dispatcher.run(\'#!/home/' + SETTINGS.sharedCatalogName + '/resources/javascript\');"><span>JavaScript</span></a>',
                            '<a href="javascript:DfxStudio.Dispatcher.run(\'#!/home/' + SETTINGS.sharedCatalogName + '/resources/stylesheets\');"><span>CSS</span></a>',
                            '<a href="javascript:DfxStudio.Dispatcher.run(\'#!/home/' + SETTINGS.sharedCatalogName + '/resources/assets\');"><span>Images & Assets</span></a>'
                        ]
                    }
                ]
            },
            {
                label:    'Common Components',
                id:       'comp_catalog',
                children: [
                    {
                        label:    '<a href="javascript:DfxStudio.Dispatcher.run(\'#!/home/' + SETTINGS.sharedCatalogName + '/widgets\');"><span>Views</span></a>' +
                                  '<a  class="app-tree-icon pull-right" style="margin-right: 15px;" href="javascript:DfxStudio.Dispatcher.run(\'#!/home/' + SETTINGS.sharedCatalogName + '/widgets/create\');"' +
                                  ' title="Create View">' +
                                  '<span class="fa fa-plus"></span>' +
                                  '</a>'/* +
                     '<span class="separator pull-right">|</span>' +
                     '<a  class="app-tree-icon pull-right" style="margin-right: 15px;" href="javascript:void(0);" ' +
                     'onclick="DfxStudio.Home.Widgets.createCategory(\'' + SETTINGS.sharedCatalogName + '\');"' +
                     ' title="Create Widget Category">' +
                     '<span class="fa fa-tag"></span>' +
                     '<span class="badge badge-important">' +
                     '<span class="fa fa-plus"></span>' +
                     '</span>' +
                     '</a>'*/,
                        id:       'shared_wgts_' + options.applicationId,
                        children: [
                            {
                                label:    'Web' +
                                          '<a class="app-tree-icon pull-right" style="margin-right: 15px;" href="javascript:void(0);" ' +
                                          'onclick="DfxStudio.Home.Widgets.createCategory(\'' + SETTINGS.sharedCatalogName + '\', \'web\');"' +
                                          ' title="Create Web View Category">' +
                                          '<span class="fa fa-tag"></span>' +
                                          '<span class="badge badge-important">' +
                                          '<span class="fa fa-plus"></span>' +
                                          '</span>' +
                                          '</a>',
                                id:       'web_wgts_' + options.applicationId,
                                children: webWidgetsSubtree
                            },
                            {
                                label:    'Mobile' +
                                          '<a class="app-tree-icon pull-right" style="margin-right: 15px;" href="javascript:void(0);" ' +
                                          'onclick="DfxStudio.Home.Widgets.createCategory(\'' + SETTINGS.sharedCatalogName + '\', \'mobile\');"' +
                                          ' title="Create Mobile View Category">' +
                                          '<span class="fa fa-tag"></span>' +
                                          '<span class="badge badge-important">' +
                                          '<span class="fa fa-plus"></span>' +
                                          '</span>' +
                                          '</a>',
                                id:       'mobile_wgts_' + options.applicationId,
                                children: mobileWidgetsSubtree
                            }
                        ]
                    },
                    {
                        label:    '<a href="javascript:DfxStudio.Dispatcher.run(\'#!/home/' + SETTINGS.sharedCatalogName + '/queries\');"><span>API Services</span></a>' +
                                  '<a  class="app-tree-icon pull-right" style="margin-right: 15px;" href="javascript:DfxStudio.Dispatcher.run(\'#!/home/{{application}}/queries/create\');"' +
                                  ' title="Create API Route">' +
                                  '<span class="fa fa-plus"></span>' +
                                  '</a>' +
                                  '<span class="separator pull-right">|</span>' +
                                  '<a  class="app-tree-icon pull-right" style="margin-right: 15px;" href="javascript:void(0);" ' +
                                  'onclick="DfxStudio.Home.Dataqueries.createCategory(\'' + SETTINGS.sharedCatalogName + '\');"' +
                                  ' title="Create API Route Category">' +
                                  '<span class="fa fa-tag"></span>' +
                                  '<span class="badge badge-important">' +
                                  '<span class="fa fa-plus"></span>' +
                                  '</span>' +
                                  '</a>',
                        id:       'shared_qrys_' + options.applicationId,
                        children: dataqueriesSubtree
                    }
                ]
            }
        ]
    };

    return Studio.getSubtree(options.applicationName, catSubtree);
};

Studio.getWidgetsSubtree = function (widgets, applicationId, applicationName, wgt_cats_data, platform) {
    //if (widgets.length === 0) return [];
    var subtree = {},
        prefix  = platform ? platform + '|' : '',
        html    = '<a href="javascript:DfxStudio.Dispatcher.run(\'#!/home/{{application}}/widgets/{{wgt_name}}/edit\');" data-component-platform="{{platform_name}}" data-component-type="widget" data-component-name="{{wgt_name}}" data-application-name="{{application}}">' +
            '<span>{{wgt_name}}</span>' +
            '</a>' +
            '<a class="app-tree-icon pull-right" style="margin-right: 15px;" ' +
            'title="Delete View" ' +
            'href="javascript: void(0);" onclick="DfxStudio.deleteWidget({widgetName:\'{{wgt_name}}\',applicationName:\'{{application_name}}\'});">' +
            '<span class="fa fa-trash-o"></span>' +
            '</a>' +
            '<a class="app-tree-icon pull-right" style="margin-right: 5px;" ' +
            'title="Copy View" ' +
            'href="javascript: void(0)" onclick="DfxStudio.Home.Widgets.copy(\'{{application_name}}\', \'{{wgt_name}}\', \'{{platform_name}}\');">' +
            '<span style="margin-top: 4px;" class="fa fa-files-o"></span>' +
            '</a>' +
            '<a class="app-tree-icon pull-right" style="margin-right: 5px;" ' +
            'title="Open View Editor" ' +
            'href="/studio/widget/{{platform_name}}/{{application}}/{{wgt_name}}/index.html" target="_blank">' +
            '<span style="margin-top: 4px;" class="fa fa-pencil-square-o"></span>' +
            '</a>';
    wgt_cats_data.forEach(function (category) {
        var cat = category.name;
        if ((category.application && category.application == applicationName && (!subtree.hasOwnProperty(cat)))
            || ((!category.application && !applicationName) && platform && platform == category.platform)) {
            cat          = prefix ? prefix + cat : cat;
            subtree[cat] = [];
        }
    });
    widgets.forEach(function (widget) {
        var cat = widget.category ? prefix + widget.category : prefix + 'Default';
        if (!subtree.hasOwnProperty(cat)) {
            subtree[cat] = [];
        }
        var modified_html = html.replace(/\{\{wgt_name\}\}/g, widget.name);
        modified_html     = modified_html.replace(/\{\{platform_name\}\}/g, widget.platform);
        modified_html     = modified_html.replace(/\{\{application_name\}\}/g, widget.application || SETTINGS.sharedCatalogName);
        subtree[cat].push(
            modified_html
        );
    });
    return Studio.transformStructure(subtree, 'widget', applicationId, platform);
};

Studio.getDataqueriesSubtree = function (queries, applicationId, applicationName, qry_cats_data) {
    //if (queries.length === 0) return [];
    var subtree = {}
        html    = '<a href="javascript:DfxStudio.Dispatcher.run(\'#!/home/{{application}}/queries/{{qry_name}}/edit\');" data-component-type="dataquery" data-component-name="{{qry_name}}" data-application-name="{{application}}">' +
            '<span>{{qry_name}}</span>' +
            '</a>' +
            '<a class="app-tree-icon pull-right" style="margin-right: 15px;" ' +
            'title="Delete API Route" ' +
            'href="javascript: void(0);" onclick="DfxStudio.Dashboard.deleteQuery({queryName:\'{{qry_name}}\', applicationName:\'{{application_name}}\'});">' +
            '<span class="fa fa-trash-o"></span>' +
            '</a>' +
            '<a class="app-tree-icon pull-right" style="margin-right: 5px;" ' +
            'title="Copy API Route" ' +
            'href="javascript: void(0)" onclick="DfxStudio.Home.Dataqueries.copy(\'{{application_name}}\', \'{{qry_name}}\');">' +
            '<span style="margin-top: 4px;" class="fa fa-files-o"></span>' +
            '</a>';
    qry_cats_data.forEach(function (category) {
        var cat = category.name;
        if (category.application == applicationName && (!subtree.hasOwnProperty(cat))) {
            subtree[cat] = [];
        }
    });
    queries.forEach(function (query) {
        var cat = query.category ? query.category : 'Default';
        if (!subtree.hasOwnProperty(cat)) {
            subtree[cat] = [];
        }
        var html_for_push = {};
        var modified_html = html.replace(/\{\{qry_name\}\}/g, query.name);
        modified_html     = modified_html.replace(/\{\{application_name\}\}/g, query.application || SETTINGS.sharedCatalogName);

        html_for_push.label = modified_html;
        html_for_push.id = 'api_route_' + query.name + '_' + applicationId;
        html_for_push.children = [];

        Object.keys(query.apiRoutes).forEach(function(apiRouteName){
            var label = '<a title=' + apiRouteName + ' style="width: 170px;text-overflow: ellipsis;overflow: hidden;white-space: nowrap;display: inline-block;padding: 0px;margin-bottom: -4px;" ' +
                        'onclick="javascript:DfxStudio.Home.Dataqueries.getApiRouteFromTree(\'' + apiRouteName + '\',\'' + (query.application || SETTINGS.sharedCatalogName) + '\',' +
                        '\'' + query.name + '\')">' + apiRouteName + '</a>' +
                        '<a class="app-tree-icon pull-right" style="margin-right: 15px;" ' +
                        'title="Delete API Route item" href="javascript: void(0);" onclick="javascript:DfxStudio.Home.Dataqueries.deleteApiRouteItemFromTree(\'' + apiRouteName + '\',\'' + (query.application || SETTINGS.sharedCatalogName) + '\',' +
                        '\'' + query.name + '\')"><span class="fa fa-trash-o"></span></a>';

            html_for_push.children.push({
                label : label,
                id : 'api_route_' + query.name + '_' + apiRouteName + '_' + applicationId,
                children : []
            })
        });

        subtree[cat].push(
            html_for_push
        );
    });

    return Studio.transformStructure(subtree, 'dataquery', applicationId);
};

Studio.getScreensSubtree = function (screens, applicationId, applicationName, scrn_cats_data) {
    //if (screens.length === 0) return [];
    var subtree = {},
        html    = '<a href="javascript:DfxStudio.Dispatcher.run(\'#!/home/{{application}}/screens/{{screen_name}}/edit\');" ' +
            'data-component-type="screen" data-component-name="{{screen_name}}" data-application-name="{{application}}">' +
            '<span>{{screen_name}}</span>' +
            '</a>' +
            '<a class="app-tree-icon pull-right" style="margin-right: 15px;" ' +
            'title="Delete Page" ' +
            'href="javascript: void(0);" onclick="DfxStudio.Screens.deleteScreen({applicationName:\'{{application}}\', screenName:\'{{screen_name}}\'});">' +
            '<span class="fa fa-trash-o"></span>' +
            '</a>';
    scrn_cats_data.forEach(function (category) {
        var cat = category.name;
        if ((category.application && category.application == applicationName && (!subtree.hasOwnProperty(cat)))) {
            subtree[cat] = [];
        }
    });
    screens.forEach(function (screen) {
        var cat = screen.category ? screen.category : 'zzzzzz';
        if (!subtree.hasOwnProperty(cat)) {
            subtree[cat] = [];
        }
        subtree[cat].push(
            html.replace(/\{\{screen_name\}\}/g, screen.name)
        );
    });
    return Studio.transformStructure(subtree, 'screen', applicationId);
};

Studio.getMenuItemsSubtree = function (menuItems) {
    if (menuItems.length === 0) return [];
    var subtree = [],
        html    = '<a href="javascript:DfxStudio.Dispatcher.run(\'#!/home/{{application}}/menu-items/{{menu_item_name}}/edit\');" ' +
            'item-order="{{item_order}}" data-component-type="menu" data-component-name="{{menu_item_name}}" data-application-name="{{application}}">' +
            '<span>{{menu_item_name}}</span>' +
            '</a>' +
            '<a class="app-tree-icon pull-right" style="margin-right: 15px;" ' +
            'title="Delete Menu Item" ' +
            'href="javascript: DfxStudio.Dispatcher.run(\'#!/home/{{application}}/menu-items/{{menu_item_name}}/remove\');">' +
            '<span class="fa fa-trash-o"></span>' +
            '</a>';
    menuItems.forEach(function (menuItem) {
        var node   = {};
        node.label = html.replace(/\{\{menu_item_name\}\}/g, menuItem.name).replace(/\{\{item_order\}\}/g, menuItem.order).replace(/\{\{application\}\}/g, menuItem.application);
        node.id    = menuItem._id;
        if (menuItem.children.length !== 0) {
            node.children = Studio.getMenuItemsSubtree(menuItem.children);
        }
        subtree.push(node);
    });
    return subtree;
};

Studio.getApplicationConfigurationSubtree = function (roles, applicationId, applicationPlatform) {
    var rolesSubtree = {
        label:    '<a href="javascript:DfxStudio.Dispatcher.run(\'#!/home/{{application}}/application-roles\');"><span>Application Roles</span></a>' +
                  '<a  class="app-tree-icon pull-right" style="margin-right: 15px;" href="javascript: void(0);"' +
                  ' onclick="DfxStudio.Home.ApplicationRoles.create(\'{{application}}\');"' +
                  ' title="Create Application Role">' +
                  '<span class="fa fa-plus"></span>' +
                  '</a>',
        id:       'roles_' + applicationId,
        children: roles.filter(function (role) {
            return role.type != 'staff';
        }).map(function (role) {//ApplicationRoles
            var trashIconVisibility = role.name == 'guest' ? 'display:none;' : '';
            return {
                label:    '<a href="javascript:DfxStudio.Dispatcher.run(\'#!/home/{{application}}/application-roles/{{role_name}}/edit\');"><span>{{role_name}}</span></a>'.replace(/\{\{role_name\}\}/g, role.name) +
                          '<a class="app-tree-icon pull-right" title="Delete Application Role" ' +
                          'style="margin-right: 15px;' + trashIconVisibility + '" ' +
                          'href="javascript: void(0);" onclick="DfxStudio.Home.ApplicationRoles.remove(\'{{application}}\', \'' + role.name + '\');">' +
                          '<span class="fa fa-trash-o"></span>' +
                          '</a>',
                id:       'roles_' + applicationId + '_' + role.name,
                children: [
                    'mi_' + applicationId + '_' + role.name + '|<a href="javascript:DfxStudio.Dispatcher.run(\'#!/home/{{application}}/configuration/{{role_name}}/menu\');"><span>Menu Items</span></a>'.replace(/\{\{role_name\}\}/g, role.name),
                    'gc_' + applicationId + '_' + role.name + '|<a href="javascript:DfxStudio.Dispatcher.run(\'#!/home/{{application}}/configuration/{{role_name}}/controls\');"><span>Graphical Controls</span></a>'.replace(/\{\{role_name\}\}/g, role.name)
                ]
            };
        })
    };
    return [rolesSubtree].concat([
        'users_' + applicationId + '|<a href="javascript:DfxStudio.Dispatcher.run(\'#!/home/{{application}}/application-users\');"><span>Application Users</span></a>' +
        '<a  class="app-tree-icon pull-right" style="margin-right: 15px;" href="javascript: void(0);"' +
        ' onclick="DfxStudio.Home.ApplicationUsers.create(\'{{application}}\');"' +
        ' title="Create Application User">' +
        '<span class="fa fa-plus"></span>' +
        '</a>',
        'userdef_' + applicationId + '|<a href="javascript:DfxStudio.Dispatcher.run(\'#!/home/{{application}}/user-definition\');"><span>User Definition</span></a>',
        'accrghts_' + applicationId + '|<a href="javascript:DfxStudio.Dispatcher.run(\'#!/home/{{application}}/configuration\');"><span>User Access Rights</span></a>'
    ]);
};

Studio.getAuthenticationProvidersSubtree = function (authsProvs) {

    return [];
};

Studio.getDatabaseProvidersSubtree = function (dbProvs) {
    return [];
};

Studio.transformStructure = function (structure, type, applicationId, applicationPlatform) {
    var retval         = [],
        keys           = Object.keys(structure),
        platform       = '',
        platformToPass = '',
        idx, cat, chunks, createHref, title;

    keys.sort();

    for (var i = 0; i < keys.length; i++) {
        idx = keys[i];
        if (idx.indexOf('|') > -1) {
            chunks         = idx.split('|');
            cat            = chunks[1] == 'zzzzzz' ? 'Default' : chunks[1];
            platform       = chunks[0] + '_';
            platformToPass = chunks[0];
        } else {
            cat = idx == 'zzzzzz' ? 'Default' : idx;
        }

        switch (type) {
            case 'screen':
                createHref = 'javascript: DfxStudio.Screens.createScreen({application:\'{{application}}\', category:\'' + cat + '\'});';
                title      = 'Create Page in category ' + cat;
                break;
            case 'widget':
                if (platformToPass)
                    createHref = 'javascript: DfxStudio.Dispatcher.run(\'#!/home/{{application}}/widgets/' + cat + '/create' + (platformToPass == 'web' ? 'Web' : 'Mobile') + '\');';
                else
                    createHref = 'javascript: DfxStudio.Dispatcher.run(\'#!/home/{{application}}/widgets/' + cat + '/create\');';
                title = 'Create View in category ' + cat;
                break;
            case 'dataquery':
                createHref = 'javascript: DfxStudio.Dispatcher.run(\'#!/home/{{application}}/queries/' + cat + '/create\');';
                title      = 'Create API Route in category ' + cat;
                break;
        }

        retval.push({
            label:    (structure[idx].length ? '' : '<i class="jqtree-toggler empty-tree-category">►</i>') +
                      '<span data-component-category="' + type + '" ' +
                          //'" data-category-name="' + (cat === 'Default' ? '' : cat) +
                      (applicationPlatform ? '" data-category-platform="' + applicationPlatform + '" ' : '') +
                      'data-category-name="' + cat +
                      '" data-application-name="{{application}}">' + cat + '</span>' +
                      '<a  class="app-tree-icon pull-right" style="margin-right: 15px;" ' +
                          //'href="javascript: DfxStudio.Dispatcher.run(\'#!/home/{{application}}/' + (type == 'dataquery' ? 'queries' : 'widgets') + '/' + cat + '/create' + (type == 'widget' && platformToPass ? (platformToPass == 'web' ? 'Web' : 'Mobile') : '') + '\');"' +
                      'href="' + createHref + '"' +
                      ' title="' + title + '">' +
                      '<span class="fa fa-plus"></span>' +
                      '</a>' +
                      (type != 'screen' && cat != 'Default' ?
                      '<span class="separator pull-right">|</span>' +
                      '<a  class="app-tree-icon pull-right" style="margin-right: 13px;" href="javascript:void(0);" ' +
                      'onclick="DfxStudio.Home.' + (type == 'dataquery' ? 'Dataqueries' : 'Widgets') + '.removeCategory(\'{{application}}\', \'' + cat + '\', \'' + platformToPass + '\');" ' +
                      'title="Delete ' + (type == 'dataquery' ? 'API Route' : 'View') + ' Category">' +
                      '<span class="fa fa-tag"></span>' +
                      '<span class="badge badge-important">' +
                      '<span class="fa fa-trash-o"></span>' +
                      '</span>' +
                      '</a>' +
                      '<a  class="app-tree-icon pull-right" style="margin-right: 13px;" href="javascript:void(0);" ' +
                      'onclick="DfxStudio.Home.' + (type == 'dataquery' ? 'API Routes' : 'Widgets') + '.editCategory(\'{{application}}\', \'' + cat + '\', \'' + platformToPass + '\');" ' +
                      ' title="Edit ' + (type == 'dataquery' ? 'API Route' : 'View') + ' Category">' +
                      '<span class="fa fa-tag"></span>' +
                      '<span class="badge badge-important">' +
                      '<span class="fa fa-pencil"></span>' +
                      '</span>' +
                      '</a>' : '') +
                      (type == 'screen' && cat != 'Default' ?
                      '<span class="separator pull-right">|</span>' +
                      '<a  class="app-tree-icon pull-right" style="margin-right: 13px;" href="javascript:void(0);" ' +
                      'onclick="DfxStudio.Home.Screens.removeCategory(\'{{application}}\', \'' + cat + '\');" ' +
                      'title="Delete Page Category">' +
                      '<span class="fa fa-tag"></span>' +
                      '<span class="badge badge-important">' +
                      '<span class="fa fa-trash-o"></span>' +
                      '</span>' +
                      '</a>' +
                      '<a  class="app-tree-icon pull-right" style="margin-right: 13px;" href="javascript:void(0);" ' +
                      'onclick="DfxStudio.Home.Screens.editCategory(\'{{application}}\', \'' + cat + '\');" ' +
                      ' title="Edit Page Category">' +
                      '<span class="fa fa-tag"></span>' +
                      '<span class="badge badge-important">' +
                      '<span class="fa fa-pencil"></span>' +
                      '</span>' +
                      '</a>' :
                          ''),
            id:       platform + type + '_' + (applicationId || 'shared') + '_cat_' + cat.replace(/[_-\s]+/g, ''),
            children: structure[idx]
        });

    }

    return retval;
};

Studio.getSubtree = function (applicationName, structure) {
    var subtree = {};
    if (structure.hasOwnProperty('visible') && !structure.visible) {
        return subtree;
    }

    subtree.label = structure.label.replace(/\{\{application\}\}/g, applicationName);

    if (structure.hasOwnProperty('id')) {
        subtree.id = structure.id;
    }

    if (structure.hasOwnProperty('children') && structure.children.length) {
        subtree.children = [];
        structure.children.forEach(function (child) {
            if ('object' == typeof child) {
                var childTree = Studio.getSubtree(applicationName, child);
                if (!_.isEmpty(childTree)) {
                    subtree.children.push(childTree);
                }
            } else {
                if (child.indexOf('|') > -1) {
                    var chunks = child.split('|');
                    subtree.children.push({
                        label: chunks[1].replace(/\{\{application\}\}/g, applicationName),
                        id:    chunks[0]
                    });
                } else {
                    subtree.children.push({
                        label: child.replace(/\{\{application\}\}/g, applicationName)
                    });
                }
            }
        });
    }
    return subtree;
};

Studio.sessions = function (req, res) {
    console.log("Sessions requested...");
    log.error('`get sessions` is not working now');
    res.end('get sessions is not working now');

//  req.session.screen = {
//  	name: 'sessions'
//  };
//  sessionUtil.touch(req);
//  
//  sessionUtil.getAll(req, function(err, session_results) {
//  	fs.readFile(path.join(__dirname, '..', 'templates/studio/sessions.jade'), 'utf8', function(err, data) {
//  		if (err) throw err;
//  
//  		var fn = jade.compile(data);
//  		var body = fn({
//  			sessions: session_results
//  		});
//  		res.setHeader('Content-Type', 'text/html');
//  		res.setHeader('Content-Length', body.length);
//  		res.end(body);
//  	});
//  });
};

Studio.feedback = function (req, res) {
//	sessionUtil.touch(req);
    fs.readFile(path.join(__dirname, '..', 'templates/studio/feedback.jade'), 'utf8', function (err, data) {
        if (err) throw err;

        var fn   = jade.compile(data);
        var body = fn({});
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Length', body.length);
        res.end(body);
    });
};

Studio.workflow = function (req, res) {
//	sessionUtil.touch(req);
    fs.readFile(path.join(__dirname, '..', 'templates/studio/workflow.jade'), 'utf8', function (err, data) {
        if (err) throw err;

        var fn   = jade.compile(data);
        var body = fn({});
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Length', body.length);
        res.end(body);
    });
};

Studio.create = function (req, res, what) {
    console.log("Creating " + what);
    if (what == 'query') {
        queries.createQuery(req, res);
    } else if (what == 'widget') {
        widgets.createWidget(req, res);
    } else {
        fs.readFile(path.join(__dirname, '..', 'templates/studio/create-' + what + '.jade'), 'utf8', function (err, data) {
            if (err) throw err;
            //console.log(data)
            var fn   = jade.compile(data);
            var body = fn({});
            res.setHeader('Content-Type', 'text/html');
            res.setHeader('Content-Length', body.length);
            res.end(body);
        });
    }
};

module.exports = Studio;
