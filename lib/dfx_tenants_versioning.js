/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

// Declaration of main modules
var GitHubApi           = require('github'),
    fs                  = require('graceful-fs'),
    path                = require('path'),
    Q                   = require('q'),
    log                 = new (require('./utils/log')).Instance({label: "DFX_Tenants_Versioning"}),
    mongo               = require('mongodb'),
    SETTINGS            = require('./dfx_settings'),
    _                   = require('underscore'),
    jade                = require('jade'),
    mdbw                = require('./mdbw')(SETTINGS.mdbw_options),
    async               = require('async'),
    applications        = require('./dfx_applications'),
    widgets             = require('./dfx_widgets'),
    queries             = require('./dfx_queries'),
    endpoints           = require('./utils/endpoints'),
    usersModule         = require('./dfx_sysadmin').tenant.user,
    authProvidersModule = require('./dfx_sysadmin/authProviders.js'),
    dbDriveModule       = require('.//dfx_sysadmin/dbDrivers.js'),
    roles               = require('./dfx_sysadmin').tenant.role,
    screens             = require('./dfx_screens'),
    sockets             = require('./dfx_sockets'),
    QFS                 = require('q-io/fs');

var DB_TENANTS_PREFIX = SETTINGS.databases_tenants_name_prefix,
    RESOURCES_DEV_PATH = SETTINGS.resources_development_path;

var Versioning = {};

var eventStart = false;

var api = {
    saveSettings: function (parsed) {
        var D = Q.defer();
        Versioning.saveSettings(parsed.versioningParameters, parsed.req, function (err, data) {
            return err
                ? D.reject(err)
                : D.resolve('Settings successfully saved!')
        });
        return D.promise;
    },

    clearRepository: function (parsed) {
        var D = Q.defer();
        Versioning.clearRepository(parsed.req, function (err, data) {
            return err
                ? D.reject('Something went wrong or repository is already empty!')
                : D.resolve('Repository was cleared successfully!')
        });
        return D.promise;
    },

    add: function (parsed) {
        return Versioning.add(parsed.versioningParameters, parsed.req.session);
    },

    sync: function (parsed) {
        var D = Q.defer();
        Versioning.sync(parsed.req.session, function (err, data) {
            return err
                ? D.reject(err)
                : D.resolve(data)
        });
        return D.promise;
    },

    get: function (parsed) {
        var D = Q.defer();
        Versioning.get(parsed.req.session, parsed.versioningParameters.overwrite, parsed.versioningParameters.useSettings, function (err, data) {
            return err
                ? D.reject(err)
                : D.resolve(data)
        });
        return D.promise;
    },

    'import-all': function (parsed) {
        var D                      = Q.defer();
        parsed.req.session.appName = parsed.req.params.applicationName;
        Versioning.get(parsed.req.session, 'true', 'true', function (err, data) {
            return err
                ? D.reject(err)
                : D.resolve(data)
        });
        return D.promise;
    },

    'export-all': function (parsed) {
        return Versioning.addNew(parsed.req);
    },

    'status': function (parsed) {
        return Versioning.status(parsed.req);
    },

    'ajax-status': function (parsed) {
        return Versioning.ajaxStatus(parsed.req);
    }
};

Versioning.api = endpoints.json({
    parser: function (req) {
        return {
            action: req.params.action,
            data:   {
                versioningParameters: req.body,
                req:                  req
            }
        }
    },
    action: api,
    log:    log
});

function getSettingsData(o) {
    return mdbw.get(DB_TENANTS_PREFIX + o.tenant, 'users', {'credentials.login': o.user})
        .then(function (users) {
            return mdbw.get(DB_TENANTS_PREFIX + o.tenant, 'versioning_providers', {"provider": o.provider})
                .then(function (providers) {
                    if (providers[0]) {
                        var providers = providers[0].repositories.filter(function (r) {
                            return r.application === o.application;
                        });
                    }
                    return {
                        'accessToken' : users[0].credentials.access_token || '',
                        'repository' : (providers[0]) ? providers[0].reponame : '',
                        'username' : (providers[0]) ? providers[0].username : ''
                    }
                });
        });
}

Versioning.clearRepository = function (req, cb) {
    var o = {
        "user" : req.session.user.id,
        "tenant" : req.session.tenant.id,
        "application": req.body.applicationName,
        "provider" : "github"
    }
    return getSettingsData(o)
        .then(function(data){
            var message = "clear datas";
            clearRepository(data.accessToken, data.username, data.repository, message, o, function (err, data) {
                if (err) {
                    cb(err);
                } else {
                    cb(null, data);
                }
            });
        })
};

Versioning.settingsScreen = function (req, res) {
    if (!req.session.screen) {
        req.session.screen = {name: 'git-settings'};
    } else {
        req.session.screen.name = "git-settings";
    }
    mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'users', {'credentials.login': req.session.user.id})
        .then(function (users) {
            mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'versioning_providers', {'provider': 'github'})
                .then(function (providers) {
                    fs.readFile(path.join(__dirname, '..', 'templates/studio/settings/github-settings.jade'), 'utf8', function (err, data) {
                        if (err) throw err;
                        var user     = users[0];
                        var provider = providers[0];

                        var fn   = jade.compile(data);
                        var body = fn({
                            'access_token': undefined !== user && user.hasOwnProperty('access_token') ? user.access_token : '',
                            'username':     undefined !== provider && provider.hasOwnProperty('username') ? provider.username : '',
                            'repository':   undefined !== provider && provider.hasOwnProperty('repository') ? provider.repository : '',
                            'repositories': undefined !== provider && provider.hasOwnProperty('repositories') ? provider.repositories : ''
                        });

                        res.setHeader('Content-Type', 'text/html');
                        res.setHeader('Content-Length', body.length);
                        res.end(body);
                    });
                })
                .fail(function (err) {
                    log.error(err);
                });
        })
        .fail(function (err) {
            log.error(err);
        });
};

Versioning.getSettings = function (req, res) {
    var o = {
        "user" : req.session.user.id,
        "tenant" : req.session.tenant.id,
        "application": req.params.applicationName,
        "provider" : "github"
    }
    return getSettingsData(o)
        .then(function(data){
            res.end(JSON.stringify({
                access_token: data.accessToken || '',
                reponame: data.repository || '',
                username: data.username || ''
            }));
        }).fail(function (err) {
            log.error(err);
        });
};

// Old realization
/*
 Versioning.getSettings = function (req, res) {
 console.log(req.params);
 mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'users', {
 'credentials.login': req.session.user.id
 }).then(function (users) {
 mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'versioning_providers', {
 'provider': 'github'
 }).then(function (providers) {
 res.end(JSON.stringify({
 userLogin:   users[0].credentials.login,
 accessToken: users[0].access_token,
 providers:   providers
 }));
 }).fail(function (err) {
 log.error(err);
 });
 }).fail(function (err) {
 log.error(err);
 });
 };
 */

Versioning.selectComponentsScreen = function (req, res) {
    var D = Q(1);
    applications.selectAll({}, req, function (app_results) {
        widgets.selectAll({}, req, function (widgets_results) {
            queries.selectAll({}, req, function (queries_results) {
                // Get settings data
                var roles          = {};
                var users          = {};
                var auth_providers = {};
                var db_drivers     = {};
                var db_resources   = {};
                D.then(function () {
                    return mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'roles').then(function (data) {
                        roles = data;
                    });
                }).then(function () {
                    return mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'users').then(function (data) {
                        users = data;
                    });
                }).then(function () {
                    return mdbw.get('auth_providers', req.session.tenant.id).then(function (data) {
                        auth_providers = data;
                    });
                }).then(function () {
                    return mdbw.get('db_drivers', req.session.tenant.id).then(function (data) {
                        db_drivers = data;
                    });
                }).then(function () {
                    return mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'resources').then(function (data) {
                        db_resources = data;
                    });
                }).then(function () {
                    fs.readFile(path.join(__dirname, '..', 'templates/studio/select-components.jade'), 'utf8', function (err, data) {
                        if (err) throw err;

                        var fn   = jade.compile(data);
                        var body = fn({
                            'applications_results': app_results,
                            'widgets_results':      widgets_results,
                            'queries_results':      queries_results,
                            'activeRepository':     req.session.activeRepository,
                            'users':                users,
                            'roles':                roles,
                            'auth_providers':       auth_providers,
                            'db_drivers':           db_drivers,
                            'db_resources':         db_resources
                        });

                        res.setHeader('Content-Type', 'text/html');
                        res.setHeader('Content-Length', body.length);
                        res.end(body);
                    });
                }).done();
            });
        });
    });
};

Versioning.saveSettings = function (settings_data, req, callback) {
    var data = {
        "application": settings_data.application,
        "username" : settings_data.repositories[0].username,
        "reponame" : settings_data.repositories[0].reponame
    };
    mdbw.update(DB_TENANTS_PREFIX + req.session.tenant.id, 'users', {'credentials.login': req.session.user.id}, {$set: {'credentials.access_token': settings_data.access_token}})
        .then(function () {
            mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'versioning_providers', {"provider": "github"})
                .then(function (providers) {
                    var repos = [];
                    if (!providers[0]) {
                        repos.push(data);
                    } else {
                        var index = null;
                        repos = providers[0].repositories;
                        repos.forEach(function(val,i){
                            if (val.application === settings_data.application) {
                                index = i;
                            }
                        });
                        if (index !== null) {
                            repos[index].application =  settings_data.application;
                            repos[index].username =  settings_data.repositories[0].username,
                                repos[index].reponame =  settings_data.repositories[0].reponame
                        } else {
                            repos.push(data);
                        }
                    }

                    mdbw.exists(DB_TENANTS_PREFIX + req.session.tenant.id, 'versioning_providers', {'provider': "github"}).then(function (exists) {
                        if (exists) {
                            mdbw.update(DB_TENANTS_PREFIX + req.session.tenant.id, 'versioning_providers', {'provider': "github"}, {$set: {"repositories": repos}})
                                .then(
                                function () {
                                    var data = {};
                                    repos.forEach(function(r){
                                        data[r.application] = r
                                    });
                                    req.session.activeRepository = data;
                                    callback(null, true);
                                },
                                function (error) {
                                    callback(error, null);
                                }).done();
                        } else {
                            mdbw.put(DB_TENANTS_PREFIX + req.session.tenant.id, 'versioning_providers', {"provider": "github","repositories": repos})
                                .then(
                                function () {
                                    var data = {};
                                    repos.forEach(function(r){
                                        data[r.application] = r
                                    });
                                    req.session.activeRepository = data;
                                    callback(null, true);
                                },
                                function (error) {
                                    callback(error, null);
                                }).done();
                        }
                    });
                });
        });
};

//Old realization
/*
 Versioning.saveSettings = function (settings_data, req, callback) {
 mdbw.update(DB_TENANTS_PREFIX + req.session.tenant.id, 'users', {'credentials.login': req.session.user.id}, {$set: {'access_token': settings_data.access_token}})
 .then(function () {
 delete settings_data.access_token;
 mdbw.exists(DB_TENANTS_PREFIX + req.session.tenant.id, 'versioning_providers', {'provider': settings_data.provider}).then(function (exists) {
 if (exists) {
 if (!settings_data.repository) settings_data.repository = '';
 if (!settings_data.repositories) settings_data.repositories = '';

 mdbw.update(DB_TENANTS_PREFIX + req.session.tenant.id, 'versioning_providers', {'provider': settings_data.provider}, {$set: settings_data})
 .then(
 function () {
 req.session.activeRepository = settings_data.repository;
 callback(null, true);
 },
 function (error) {
 callback(error, null);
 }).done();
 } else {
 mdbw.put(DB_TENANTS_PREFIX + req.session.tenant.id, 'versioning_providers', settings_data)
 .then(
 function () {
 req.session.activeRepository = settings_data.repository;
 callback(null, true);
 },
 function (error) {
 callback(error, null);
 }).done();
 }
 });
 })
 .fail(function (err) {
 callback(error, null);
 });
 };
 */

function getApplicationDefinition(data) {
    var appName  = (data.params.applicationName !== SETTINGS.sharedCatalogName) ? data.params.applicationName : "";
    var tenantId = data.session.tenant.id;
    var result   = {
        "applications":   {},
        "dataqueries":    {},
        "widgets":        {},
        "users":          {},
        "roles":          {},
        "db_resources":   {},
        "auth_providers": {},
        "db_drivers":     {}
    };
    return mdbw.get(DB_TENANTS_PREFIX + tenantId, 'applications', {'name': appName})
        .then(function (res) {
            res.forEach(function (r) {
                result.applications[r.name] = r._id.toString();
            });
            return mdbw.get(DB_TENANTS_PREFIX + tenantId, 'dataqueries', {'application': appName})
                .then(function (res) {
                    res.forEach(function (r) {
                        result.dataqueries[r.name] = r._id.toString();
                    });
                    return mdbw.get(DB_TENANTS_PREFIX + tenantId, 'datawidgets', {'application': appName})
                        .then(function (res) {
                            res.forEach(function (r) {
                                result.widgets[r.name] = r._id.toString();
                            });
                            return mdbw.get(DB_TENANTS_PREFIX + tenantId, 'users', {'application': appName})
                                .then(function (res) {
                                    res.forEach(function (r) {
                                        result.users[r.credentials.login] = r._id.toString();
                                    });
                                    return mdbw.get(DB_TENANTS_PREFIX + tenantId, 'roles', {'application': appName})
                                        .then(function (res) {
                                            res.forEach(function (r) {
                                                result.roles[r.name] = r._id.toString();
                                            });
                                            return mdbw.get(DB_TENANTS_PREFIX + tenantId, 'resources', {'application': appName})
                                                .then(function (res) {
                                                    res.forEach(function (r) {
                                                        result.db_resources[r.name] = r._id.toString();
                                                    });
                                                    return mdbw.get('db_drivers', tenantId, {'application': appName})
                                                        .then(function (res) {
                                                            res.forEach(function (r) {
                                                                result.db_drivers[r.nameDriver] = r._id.toString();
                                                            });
                                                            return mdbw.get('auth_providers', tenantId, {'application': appName})
                                                                .then(function (res) {
                                                                    res.forEach(function (r) {
                                                                        result.auth_providers[r.provider] = r._id.toString();
                                                                    });
                                                                    return result;
                                                                });
                                                        });
                                                });
                                        });
                                });
                        });
                });
        });
}

Versioning.ajaxStatus = function (data) {
    var getDate = function(t) {
        var now = (new Date() / 1000).toFixed();
        if ((now - t) < 86400) {
            return "Today";
        }else if ((now - t) < 86400*2) {
            return "Yesterday";
        } else {
            return new Date(t*1000).toDateString();
        }
    };
    if (!data.session.activeRepository) return JSON.stringify('{}');
    var appName          = data.params.applicationName;
    var tenantId         = data.session.tenant.id;
    if (appName === SETTINGS.sharedCatalogName) appName = "";
    var result           = {
        "applications": {},
        "dataqueries":  {},
        "datawidgets":      {},
        "auth_providers" : {},
        "db_drivers" : {},
        "users" : {},
        "roles" : {},
        "resources" : {},
        "metadata" : {},
        "datawidgets_categories" : {},
        "dataqueries_categories" : {},
        "screens_categories" : {}
    };
    var tasks = [];
    var collectionNames = [];
    for (var collection in result) {
        collectionNames.push(collection);
        if ((collection === 'auth_providers') || (collection === 'db_drivers')) {
            tasks.push(mdbw.get(collection, tenantId, {'application': appName}));
        } else {
            if (collection === 'applications') {
                tasks.push(mdbw.get(DB_TENANTS_PREFIX + tenantId, collection, {'name': appName}));
            } else {
                tasks.push(mdbw.get(DB_TENANTS_PREFIX + tenantId, collection, {'application': appName}));
            }

        }
    }
    return Q.all(tasks)
        .spread(function(){
            for (var collection in arguments) {
                if (collection) {
                    result[collectionNames[collection]] = arguments[collection].filter(function (r) {
                        return r.versioning.status !== 'committed';
                    });
                }
            }
        })
        .then(function(){
            return mdbw.get(DB_TENANTS_PREFIX + tenantId, 'trash', {'application': appName})
                .then(function (trash) {
                    var trashObjects = trash.filter(function (o) {
                        return o.application == appName;
                    });
                    var retval = {
                        "applications": {},
                        "dataqueries": {},
                        "datawidgets": {},
                        "auth_providers": {},
                        "db_drivers": {},
                        "users": {},
                        "roles": {},
                        "resources" : {},
                        "metadata" : {},
                        "datawidgets_categories" : {},
                        "dataqueries_categories" : {},
                        "screens_categories" : {}
                    };
                    for (var collection in result) {
                        result[collection].forEach(function (data) {
                            var name = (collection === 'users') ?
                                data.credentials.login :
                                (collection === 'auth_providers') ?
                                    data.provider :
                                    (collection === 'db_drivers') ?
                                        data.nameDriver :
                                    data.name || 'User definition';
                            retval[collection][name] = {
                                action: data.versioning.status,
                                user: data.versioning.user,
                                date: getDate(data.versioning.last_action)
                            }
                        });
                    }


                    if (trashObjects.length > 0) {
                        trashObjects.forEach(function (o) {
                            switch (o.type) {
                                case "db_drivers" :
                                    retval.db_drivers[o.nameDriver] = {
                                        action: o.versioning.status,
                                        user: o.versioning.user,
                                        date: getDate(o.versioning.last_action)
                                    };
                                    break;
                                case "auth_providers" :
                                    retval.auth_providers[o.provider] = {
                                        action: o.versioning.status,
                                        user: o.versioning.user,
                                        date: getDate(o.versioning.last_action)
                                    };
                                    break;
                                case "datawidgets" :
                                    retval.datawidgets[o.name] = {
                                        action: o.versioning.status,
                                        user: o.versioning.user,
                                        date: getDate(o.versioning.last_action)
                                    };
                                    break;
                                case "datawidgets_categories" :
                                    retval.datawidgets_categories[o.name] = {
                                        action: o.versioning.status,
                                        user: o.versioning.user,
                                        date: getDate(o.versioning.last_action)
                                    };
                                    break;
                                case "dataqueries_categories" :
                                    retval.dataqueries_categories[o.name] = {
                                        action: o.versioning.status,
                                        user: o.versioning.user,
                                        date: getDate(o.versioning.last_action)
                                    };
                                    break;
                                case "screens_categories" :
                                    retval.screens_categories[o.name] = {
                                        action: o.versioning.status,
                                        user: o.versioning.user,
                                        date: getDate(o.versioning.last_action)
                                    };
                                    break;
                                case "dataqueries" :
                                    retval.dataqueries[o.name] = {
                                        action: o.versioning.status,
                                        user: o.versioning.user,
                                        date: getDate(o.versioning.last_action)
                                    };
                                    break;
                                case "users" :
                                    retval.users[o.credentials.login] = {
                                        action: o.versioning.status,
                                        user: o.versioning.user,
                                        date: getDate(o.versioning.last_action)
                                    };
                                    break;
                                case "roles" :
                                    retval.roles[o.name] = {
                                        action: o.versioning.status,
                                        user: o.versioning.user,
                                        date: getDate(o.versioning.last_action)
                                    };
                                    break;
                            }

                        })
                    }
                    // Delete guest roles
                    if (retval.roles.guest) delete retval.roles.guest;

                    for (var key in retval) {
                        if (_.isEmpty(retval[key])) {
                            delete retval[key];
                        }
                    }
                    //console.log(retval);
                    return JSON.stringify(retval);
                });
        });
};

Versioning.addNew = function (data) {
    return getApplicationDefinition(data)
        .then(function (selection) {
            return Versioning.add({"selectComponentsForm": selection}, data.session, data.params.applicationName);
        });
};

Versioning.add = function (selection, data, currentApplication) {
    var M = Q.defer();
    if (_.isEmpty(selection)) throw("Do not select any object to export");
    if ((!data.tenant.id) || (!data.user.id)) throw("Can't get tenant id or user id from session");

    var o = {
        "user" : data.user.id,
        "tenant" : data.tenant.id,
        "application": currentApplication,
        "provider" : "github"
    }
    getSettingsData(o)
        .then(function(s){
            if (currentApplication === SETTINGS.sharedCatalogName) currentApplication = "";
            var accessToken =  s.accessToken || '';
            var repository = s.repository || '';
            var username = s.username || '';

            if ((accessToken=='') || (repository=='') || (username=='')) return Q.reject("Can't read versioning_providers settings");

            var tenantID    = data.tenant.id;
            var userID      = data.user.id;
            var DB_NAME     = 'dreamface_tenant_' + tenantID;
            var date        = Math.round(+(new Date() / 1000));
            var socketKey = tenantID + '_' + userID + '_' + currentApplication;
            log.info("Export start");

            sockets.sendMessage(socketKey,{value:"Starting to push changes", progress:0});

            async.series([
                    function (callback) {
                        sockets.sendMessage(socketKey, {value:"Pushing Application", progress:8});
                        mdbw.get(DB_NAME, 'applications').then(function (docs) {
                            var newData    = filter(selection.selectComponentsForm.applications, docs);

                            var body = {};
                            _.each(newData, function (data) {
                                data.versioning.status = "committed";
                                var path   = 'applications/' + data.name + '.json';
                                body[path] = JSON.stringify(data, null, '\t');
                            });

                            var temp = _.invert(selection.selectComponentsForm.applications);
                            // Set "commited" status to objects
                            _.each(newData, function (row) {
                                if (_.has(temp, row._id)) {
                                    setStatusToObject('applications', row._id, userID, tenantID, "committed");
                                }

                            });


                            writeToGitHub(accessToken, repository, username, body, tenantID + ' tenant applications dump ' + date, function (err) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    if (newData.length != 0) {
                                        // Export application screens, menus and screens_categories
                                        async.each(newData, function (data, cb) {
                                                mdbw.get(DB_TENANTS_PREFIX + tenantID, 'screens', {application: data.name})
                                                    .then(function (screens) {
                                                        mdbw.get(DB_TENANTS_PREFIX + tenantID, 'application_menus', {application: data.name})
                                                            .then(function (menus) {
                                                                _.each(screens, function (scr) {
                                                                    var path   = 'screens/' + data.name + '-' + scr.name + '.json';
                                                                    body[path] = JSON.stringify(scr, null, '\t');
                                                                });
                                                                _.each(menus, function (menu) {
                                                                    var path   = 'appMenus/' + data.name + '-' + menu.name + '.json';
                                                                    body[path] = JSON.stringify(menu, null, '\t');
                                                                });
                                                                cb();

                                                            });
                                                    });
                                            },
                                            function () {
                                                writeToGitHub(accessToken, repository, username, body, tenantID + ' tenant dump ' + date, function (err) {
                                                    if (err) {
                                                        log.error(err);
                                                        log.info("Applications export was failed");
                                                        callback(err);
                                                    } else {
                                                        log.info("Applications export completed");
                                                        callback(null, []);
                                                    }
                                                });
                                            });
                                    } else {
                                        log.info("Applications export completed");
                                        callback(null, []);
                                    }
                                }
                            });
                        })
                            .fail(function (err) {
                                log.error(err);
                                log.info("Applications export completed");
                                callback(null, []);
                            });
                    },
                    function (callback) {
                        sockets.sendMessage(socketKey,{value:"Pushing DataQueries", progress:16});
                        mdbw.get(DB_NAME, 'dataqueries').then(function (docs) {

                            var newData    = filter(selection.selectComponentsForm.dataqueries, docs);
                            var deleted = getDeleted(docs, selection.selectComponentsForm.dataqueries);

                            //log.info(deleted);
                            //return null;

                            //log.error(selection.selectComponentsForm.dataqueries);
                            //log.error(data);

                            var body = {};
                            _.each(newData, function (data) {
                                data.versioning.status = "committed";
                                var path   = 'dataqueries/' + data.name + '.json';
                                body[path] = JSON.stringify(data, null, '\t');
                            });

                            var temp = _.invert(selection.selectComponentsForm.dataqueries);
                            // Set "commited" status to objects
                            _.each(newData, function (row) {
                                if (_.has(temp, row._id)) {
                                    setStatusToObject('dataqueries', row._id, userID, tenantID, "committed");
                                }

                            });

                            writeToGitHub(accessToken, repository, username, body, tenantID + ' tenant dataqueries dump ' + date, function (err) {
                                if (err) {
                                    log.info("Dataqueries export was failed");
                                    callback(err, null);
                                } else {
                                    // Delete object from DB
                                    _.each(deleted, function (row) {
                                        mdbw.rm(DB_TENANTS_PREFIX + tenantID, 'dataqueries', {_id: new mongo.ObjectID(row._id)})
                                            .fail(function (err) {
                                                log.error(err);
                                            });
                                    });
                                    log.info("Dataqueries export completed");
                                    callback(null, deleted);
                                }
                            });
                        })
                            .fail(function (err) {
                                log.error(err);
                                log.info("Dataqueries export completed");
                                callback(null, []);
                            });
                    },
                    function (callback) {
                        sockets.sendMessage(socketKey,{value:"Pushing DataWidgets", progress:24});
                        mdbw.get(DB_NAME, 'datawidgets').then(function (docs) {
                            var newData    = filter(selection.selectComponentsForm.widgets, docs);
                            var deleted = getDeleted(docs, selection.selectComponentsForm.widgets);

                            //log.info(deleted);
                            //return null;

                            //log.error(selection.selectComponentsForm.widgets);
                            //return null;

                            var body = {};
                            _.each(newData, function (data) {
                                data.versioning.status = "committed";
                                var path   = 'datawidgets/' + data.name + '.json';
                                body[path] = JSON.stringify(data, null, '\t');
                            });

                            // Set "commited" status to objects
                            var temp = _.invert(selection.selectComponentsForm.widgets);
                            _.each(newData, function (row) {
                                if (_.has(temp, row._id)) {
                                    setStatusToObject('datawidgets', row._id, userID, tenantID, "committed");

                                }
                            });

                            writeToGitHub(accessToken, repository, username, body, tenantID + ' tenant datawidgets dump ' + date, function (err) {
                                if (err) {
                                    log.info("Datawidgets export was failed");
                                    callback(err, null);
                                } else {


                                    // Delete object from DB
                                    _.each(deleted, function (row) {
                                        mdbw.rm(DB_TENANTS_PREFIX + tenantID, 'datawidgets', {_id: new mongo.ObjectID(row._id)})
                                            .fail(function (err) {
                                                log.error(err);
                                            });
                                    });
                                    log.info("Datawidgets export completed");
                                    callback(null, deleted);
                                }
                            });
                        })
                            .fail(function (err) {
                                log.error(err);
                                log.info("Datawidgets export completed");
                                callback(null, deleted);
                            });
                    },

                    function (callback) {
                        sockets.sendMessage(socketKey,{value:"Pushing DataQuery Categories", progress:32});
                        mdbw.get(DB_NAME, 'dataqueries_categories').then(function (docs) {
                            var body = {};
                            docs.map(function(doc){
                                return mdbw.update(DB_NAME,'dataqueries_categories',{application: doc.application},{$set : {versioning : {
                                    status:   'committed',
                                    "user":        userID,
                                    "last_action": (new Date() / 1000).toFixed()
                                }}});
                            });

                            _.each(docs, function (data) {
                                var path   = 'dataquerie_categories/' + data.name + '.json';
                                data.versioning.status = "committed";
                                body[path] = JSON.stringify(data, null, '\t');
                            });

                            writeToGitHub(accessToken, repository, username, body, tenantID + ' tenant dataqueries_categories dump ' + date, function (err) {
                                if (err) {
                                    log.info("Dataqueries categories export was failed");
                                    callback(err, null);
                                } else {
                                    log.info("Dataqueries categories export completed");
                                    callback(null, []);
                                }
                            });
                        })
                            .fail(function (err) {
                                log.error(err);
                                log.info("Dataqueries categories export completed");
                                callback(null, []);
                            });
                    },
                    function (callback) {
                        sockets.sendMessage(socketKey,{value:"Pushing Screen Categories", progress:36});
                        mdbw.get(DB_NAME, 'screens_categories').then(function (docs) {
                            var body = {};
                            docs.map(function(doc){
                                return mdbw.update(DB_NAME,'screens_categories',{application: doc.application},{$set : {versioning : {
                                    status:   'committed',
                                    "user":        userID,
                                    "last_action": (new Date() / 1000).toFixed()
                                }}});
                            });

                            _.each(docs, function (data) {
                                var path   = 'screen_categories/' + data.name + '.json';
                                data.versioning.status = "committed";
                                body[path] = JSON.stringify(data, null, '\t');
                            });

                            writeToGitHub(accessToken, repository, username, body, tenantID + ' tenant screens_categories dump ' + date, function (err) {
                                if (err) {
                                    log.info("Screens categories export was failed");
                                    callback(err, null);
                                } else {
                                    log.info("Screens categories export completed");
                                    callback(null, []);
                                }
                            });
                        })
                            .fail(function (err) {
                                log.error(err);
                                log.info("Screens categories export completed");
                                callback(null, []);
                            });
                    },

                    /*
                     function (callback) {
                     if (currentApplication!=='') {
                     mdbw.get(DB_NAME, 'rights').then(function (docs) {
                     var body = {};
                     _.each(docs, function (data) {
                     if (_.contains(_.toArray(_.values(selection.selectComponentsForm.rights)), data._id.toString())) {
                     var path = 'rights/' + data.name + '.json';
                     body[path] = JSON.stringify(data, null, '\t');
                     }
                     });
                     writeToGitHub(accessToken, repository, username, body, tenantID + ' tenant rights dump ' + date, function (err) {
                     if (err) {
                     log.info("Rights export was failed");
                     callback(err, null);
                     } else {
                     log.info("Rights export completed");
                     callback(null, []);
                     }
                     });
                     })
                     .fail(function (err) {
                     log.error(err);
                     log.info("Rights export completed");
                     callback(null, []);
                     });
                     } else {
                     log.info("Rights export completed");
                     callback(null, []);
                     }
                     },
                     */

                    function (callback) {
                        sockets.sendMessage(socketKey,{value:"Pushing User Roles", progress:40});
                        if (currentApplication!=='') {
                            mdbw.get(DB_NAME, 'roles').then(function (docs) {
                                var body = {};

                                docs.map(function(doc){
                                    return mdbw.update(DB_NAME,'roles',{name: doc.name , application: doc.application},{$set : {versioning : {
                                        status:   'committed',
                                        "user":        userID,
                                        "last_action": (new Date() / 1000).toFixed()
                                    }}});
                                });

                                _.each(docs, function (data) {
                                    if (_.contains(_.toArray(_.values(selection.selectComponentsForm.roles)), data._id.toString())) {
                                        if (data.name !== 'guest') {
                                            data.versioning.status = "committed";
                                            var path = 'roles/' + data.name + '.json';
                                            body[path] = JSON.stringify(data, null, '\t');
                                        }
                                    }
                                });
                                writeToGitHub(accessToken, repository, username, body, tenantID + ' tenant roles dump ' + date, function (err) {
                                    if (err) {
                                        log.info("Roles export was failed");
                                        callback(err, null);
                                    } else {
                                        log.info("Roles export completed");
                                        callback(null, []);
                                    }
                                });
                            })
                                .fail(function (err) {
                                    log.error(err);
                                    log.info("Roles export completed");
                                    callback(null, []);
                                });
                        } else {
                            log.info("Roles export completed");
                            callback(null, []);
                        }
                    },
                    function (callback) {
                        sockets.sendMessage(socketKey,{value:"Pushing Users", progress:48});
                        if (currentApplication!=='') {
                            var app = currentApplication || null;
                            usersModule.list(tenantID, true, null, app).then(function (docs) {
                                var body = {};

                                docs.map(function(doc){
                                    return mdbw.update(DB_NAME,'users',{'credentials.login': doc.login , application: doc.application},{$set : {versioning : {
                                        status:   'committed',
                                        "user":        userID,
                                        "last_action": (new Date() / 1000).toFixed()
                                    }}});
                                });

                                _.each(docs, function (data) {
                                    if (_.contains(_.toArray(_.values(selection.selectComponentsForm.users)), data._id.toString())) {
                                        if ((!selection.selectComponentsForm.users.passwords) && (app === null))
                                            delete data.pass;
                                        if (data.password)
                                            delete data.password;
                                        data.versioning.status = "committed";
                                        var path = 'users/' + data.login + '.json';
                                        body[path] = JSON.stringify(data, null, '\t');
                                    }
                                });
                                writeToGitHub(accessToken, repository, username, body, tenantID + ' tenant users dump ' + date, function (err) {
                                    if (err) {
                                        log.info("Users export was failed");
                                        callback(err, null);
                                    } else {
                                        log.info("Users export completed");
                                        callback(null, []);
                                    }
                                });
                            })
                                .fail(function (err) {
                                    log.error(err);
                                    log.info("Users export completed");
                                    callback(null, []);
                                });
                        } else {
                            log.info("Users export completed");
                            callback(null, []);
                        }
                    },

                    function (callback) {
                        sockets.sendMessage(socketKey,{value:"Pushing Auth Providers", progress:56});
                        mdbw.get('auth_providers', tenantID).then(function (docs) {
                            var body = {};
                            var app = currentApplication;
                            async.each(docs, function (data, cb) {
                                // Set committed status
                                if (_.contains(_.toArray(_.values(selection.selectComponentsForm.auth_providers)), data._id.toString())) {
                                    mdbw.update('auth_providers',tenantID,{provider:data.provider},{$set:{"versioning.status":"committed"}});
                                    var path  = 'auth_providers/' + data.provider + '.json';
                                    var query = {tenant: tenantID, provider: data.provider, applicationName : app}
                                    authProvidersModule.get(query).then(function (data) {
                                        if (typeof data !== 'undefined') {
                                            data.versioning.status = "committed";
                                            body[path] = JSON.stringify(data, null, '\t');
                                            cb();
                                        } else {
                                            cb();
                                        }
                                    });
                                } else {
                                    cb();
                                }
                            }, function () {
                                writeToGitHub(accessToken, repository, username, body, tenantID + ' tenant auth providers dump ' + date, function (err) {
                                    if (err) {
                                        log.info("Auth providers export was failed");
                                        callback(err, null);
                                    } else {
                                        log.info("Auth providers export completed");
                                        callback(null, []);
                                    }
                                });
                            });
                        })
                            .fail(function (err) {
                                log.info("No auth providers for export");
                                callback(null, []);
                            });
                    },
                    function (callback) {
                        sockets.sendMessage(socketKey,{value:"Pushing Database Drivers", progress:64});
                        mdbw.get('db_drivers', tenantID).then(function (docs) {
                            var body = {};
                            var app = currentApplication;
                            async.each(docs, function (data, cb) {
                                if (_.contains(_.toArray(_.values(selection.selectComponentsForm.db_drivers)), data._id.toString())) {
                                    mdbw.update('db_drivers',tenantID,{nameDriver:data.nameDriver},{$set:{"versioning.status":"committed"}});
                                    var path  = 'db_drivers/' + data.nameDriver + '.json';
                                    var query = {tenant: tenantID, nameDriver: data.nameDriver, applicationName : app};
                                    dbDriveModule.get(query).then(function (data) {
                                        if (typeof data !== 'undefined'){
                                            body[path] = JSON.stringify(data, null, '\t');
                                            cb();
                                        } else {
                                            cb();
                                        }
                                    });
                                } else {
                                    cb();
                                }
                            }, function () {
                                writeToGitHub(accessToken, repository, username, body, tenantID + ' tenant db_drivers dump ' + date, function (err) {
                                    if (err) {
                                        log.info("DB_drivers export was failed");
                                        callback(err, null);
                                    } else {
                                        log.info("DB_drivers export completed");
                                        callback(null, []);
                                    }
                                });
                            });
                        })
                            .fail(function (err) {
                                log.info("No DB_drivers for export");
                                callback(null, []);
                            });
                    },

                    function (callback) {
                        sockets.sendMessage(socketKey,{value:"Pushing DataQuery Services", progress:72});
                        mdbw.get(DB_NAME, 'dataqueries_services').then(function (docs) {
                            var body = {};
                            _.each(docs, function (data) {
                                var path   = 'dataquerie_services/' + data.name + '.json';
                                body[path] = JSON.stringify(data, null, '\t');
                            });
                            writeToGitHub(accessToken, repository, username, body, tenantID + ' tenant dataqueries_services dump ' + date, function (err) {
                                if (err) {
                                    log.info("Dataqueries services export was failed");
                                    callback(err, null);
                                } else {
                                    log.info("Dataqueries services export completed");
                                    callback(null, []);
                                }
                            });
                        })
                            .fail(function (err) {
                                log.error(err);
                                log.info("Dataqueries services export completed");
                                callback(null, []);
                            });
                    },

                    function (callback) {
                        var app = currentApplication || null;
                        sockets.sendMessage(socketKey,{value:"Pushing Resources", progress:80});
                        mdbw.get(DB_NAME, 'resources').then(function (docs) {
                            var body       = {};
                            var files_body = {};
                            try {
                                _.each(docs, function (data) {
                                    if (_.contains(_.toArray(_.values(selection.selectComponentsForm.db_resources)), data._id.toString())) {
                                        var res_path   = 'resources/' + data.name + '.json';
                                        mdbw.update(DB_NAME, 'resources', {name:data.name,application:currentApplication},{$set:{"versioning.status":"committed"}});
                                        data.versioning.status = "committed";
                                        body[res_path] = JSON.stringify(data, null, '\t');

                                        var items = data.items || {};
                                        _.each(items, function (item) {
                                            // temp fix
                                            var filePath = "";
                                            if (app !== null)
                                                filePath = path.join(RESOURCES_DEV_PATH, tenantID + '/' + currentApplication + '/' + data.name + '/' + item.path);
                                            else
                                                filePath = path.join(RESOURCES_DEV_PATH, tenantID + '/' + data.name + '/' + item.path);
                                            fs.readFile(filePath, "binary", function (err, res) {
                                                if (err) {
                                                    log.error(err);
                                                } else {
                                                    var file_path         = 'files/' + data.name + '/' + item.path;
                                                    files_body[file_path] = res;
                                                }
                                            });
                                        });
                                    }

                                });
                            } catch (e) {
                                log.error(e);
                            }
                            writeToGitHub(accessToken, repository, username, body, tenantID + ' tenant resources dump ' + date, function (err) {
                                if (err) {
                                    log.info("Resources export was failed");
                                    callback(err, null);
                                } else {
                                    writeToGitHub(accessToken, repository, username, files_body, tenantID + ' tenant resources files dump ' + date, function (err) {
                                        if (err) {
                                            log.info("Resources export completed");
                                            callback(err, null);
                                        }
                                        log.info("Resources export completed");
                                        callback(null, []);
                                    });
                                }
                            });
                        })
                            .fail(function (err) {
                                log.error(err);
                                log.info("Resources export completed");
                                callback(null, []);
                            });
                    },

                    function (callback) {
                        sockets.sendMessage(socketKey,{value:"Pushing DataWidget Categories", progress:88});
                        mdbw.get(DB_NAME, 'datawidgets_categories').then(function (docs) {
                            var body = {};
                            docs.map(function(doc){
                                return mdbw.update(DB_NAME,'datawidgets_categories',{application: doc.application},{$set : {versioning : {
                                    status:   'committed',
                                    "user":        userID,
                                    "last_action": (new Date() / 1000).toFixed()
                                }}});
                            });
                            _.each(docs, function (data) {
                                var path   = 'datawidget_categories/' + data.name + '.json';
                                data.versioning.status = "committed";
                                body[path] = JSON.stringify(data, null, '\t');
                            });
                            writeToGitHub(accessToken, repository, username, body, tenantID + ' tenant datawidgets_categories dump ' + date, function (err) {
                                if (err) {
                                    log.info("Datawidgets categories export was failed");
                                    callback(err, null);
                                } else {
                                    log.info("Datawidgets categories export completed");
                                    callback(null, []);
                                }
                            });
                        })
                            .fail(function (err) {
                                log.error(err);
                                log.info("Datawidgets categories export completed");
                                callback(null, []);
                            });
                    },
                    function (callback) {
                        sockets.sendMessage(socketKey,{value:"Pushing Application Configuration", progress:96});
                        mdbw.get(DB_NAME, 'application_configuration').then(function (docs) {
                            var body = {};
                            _.each(docs, function (data) {
                                var path   = 'application_configurations/' + data.name + '-' + data.role + '-' + data.type + '.json';
                                body[path] = JSON.stringify(data, null, '\t');
                            });
                            writeToGitHub(accessToken, repository, username, body, tenantID + ' tenant application configurations dump ' + date, function (err) {
                                if (err) {
                                    log.info("Application configuration export was failed");
                                    callback(err, null);
                                } else {
                                    log.info("Application configuration export completed");
                                    callback(null, []);
                                }
                            });
                        })
                            .fail(function (err) {
                                log.error(err);
                                log.info("Application configuration export completed");
                                callback(null, []);
                            });
                    },
                    function (callback) {
                        sockets.sendMessage(socketKey,{value:"Pushing User Definition", progress:99});
                        mdbw.get(DB_NAME, 'metadata').then(function (docs) {
                            var body = {};
                            docs.map(function(doc){
                                return mdbw.update(DB_NAME,'metadata',{application: doc.application},{$set : {versioning : {
                                    status:   'committed',
                                    "user":        userID,
                                    "last_action": (new Date() / 1000).toFixed()
                                }}});
                            });
                            _.each(docs, function (data) {
                                if (data.application === currentApplication) {
                                    data.versioning.status = "committed";
                                    var path = 'metadata/userDefinition.json';
                                    body[path] = JSON.stringify(data, null, '\t');
                                }
                            });
                            writeToGitHub(accessToken, repository, username, body, tenantID + ' tenant metadata dump ' + date, function (err) {
                                if (err) {
                                    log.info("Metadata export was failed");
                                    callback(err, null);
                                } else {
                                    log.info("Metadata export completed");
                                    callback(null, []);
                                }
                            });
                        })
                            .fail(function (err) {
                                log.error(err);
                                log.info("Metadata export completed");
                                callback(null, []);
                            });
                    }],
                function (err, result) {

                    var message = tenantID + ' tenant delete object action ' + date;
                    mdbw.get(DB_NAME, 'trash')
                        .then(function(datas){
                            var tasks   = _.map(datas, function (data) {
                                var path = "";
                                switch (data.type) {
                                    case "screens" : path = data.type + '/' + data.application + '-' + data.name + '.json'; break;
                                    case "appMenus" : path = data.type + '/' + data.application + '-' + data.name + '.json'; break;
                                    case "auth_providers" : path = data.type + '/' + data.provider + '.json'; break;
                                    case "db_drivers" : path = data.type + '/' + data.nameDriver + '.json'; break;
                                    case "users" : path = data.type + '/' + data.credentials.login + '.json'; break;
                                    case "dataqueries_categories" : path = 'dataquerie_categories/' + data.name + '.json'; break;
                                    case "datawidgets_categories" : path = 'datawidget_categories/' + data.name + '.json'; break;
                                    case "screens_categories" : path = 'screen_categories/' + data.name + '.json'; break;
                                    default : path = data.type + '/' + data.name + '.json'; break;
                                }
                                return delTasks(accessToken, username, repository, path, message);
                            });
                            async.series(tasks, function () {
                            });
                        })
                        .then(function(){
                            mdbw.rm(DB_NAME, 'trash',{application : currentApplication})
                                .then(function(){
                                    if (err) {
                                        log.error(err);
                                        log.info("Export has failed")
                                        M.reject("Export has failed");
                                    } else {
                                        log.info("Git push has been completed successfully");
                                        //sockets.sendMessage(socketKey,{value:"Export was successfully completed", progress:100});
                                        M.resolve("Git push has been completed successfully");
                                    }
                                })
                        });
                });


        })
        .fail(function (err) {
            log.error(err);
            M.reject(err);
        });

    return M.promise;


};

function delTasks(accessToken, userID, repository, path, message) {
    return function (callback) {
        deleteFileFromGitHub(accessToken, userID, repository, path, message, function () {
            callback();
        });
    }
}

/*
 Versioning.sync = function (data, callback) {
 var that = this;
 if ((!data.tenant.id) || (!data.user.id)) return callback("Can't get tenant id or user id from session");
 else {
 async.parallel([
 function (callback) {
 mdbw.get(DB_TENANTS_PREFIX + data.tenant.id, 'users', {'credentials.login': data.user.id}).then(function (docs) {
 callback(null, docs);
 })
 .fail(function (err) {
 log.error(err);
 });
 },
 function (callback) {
 mdbw.get(DB_TENANTS_PREFIX + data.tenant.id, 'versioning_providers', {"provider": "github"}).then(function (docs) {
 callback(null, docs);
 })
 .fail(function (err) {
 log.error(err);
 });
 }],
 function (err, result) {
 var res1 = result[0][0];
 var res2 = result[1][0];

 if ((!res2) || (!res1))  return callback("Can't read settings from versioning_providers or users collection");
 if (!res1.access_token)  return callback("Can't read access_token from users collection");

 var accessToken = res1.access_token;
 var repository  = res2.repository;

 var username = res2.repositories.filter(function (repo) {
 return (repository === repo.reponame)
 })[0]['username'];

 var tenantID = data.tenant.id;
 var DB_NAME  = 'dreamface_tenant_' + tenantID;
 var userID   = data.user.id;
 var date     = Math.round(+(new Date() / 1000));


 async.series([
 function (callback) {
 readFromGitHub(accessToken, username, repository, 'applications', 0, function (err, data) {
 if ((err) && (err.code !== 404)) {
 log.error(err);
 callback(err, null);
 }

 callback(null, data);
 });
 },
 function (callback) {
 readFromGitHub(accessToken, username, repository, 'dataqueries', 0, function (err, data) {
 if ((err) && (err.code !== 404)) {
 log.error(err);
 callback(err, null);
 }

 callback(null, data);
 });

 },
 function (callback) {
 readFromGitHub(accessToken, username, repository, 'datawidgets', 0, function (err, data) {
 if ((err) && (err.code !== 404)) {
 log.error(err);
 callback(err, null);
 }

 callback(null, data);
 });
 },
 function (callback) {
 readFromGitHub(accessToken, username, repository, 'users', 0, function (err, data) {
 if ((err) && (err.code !== 404)) {
 log.error(err);
 callback(err, null);
 }

 callback(null, data);
 });
 },
 function (callback) {
 readFromGitHub(accessToken, username, repository, 'roles', 0, function (err, data) {
 if ((err) && (err.code !== 404)) {
 log.error(err);
 callback(err, null);
 }

 callback(null, data);
 });
 },
 function (callback) {
 readFromGitHub(accessToken, username, repository, 'resources', 0, function (err, data) {
 if ((err) && (err.code !== 404)) {
 log.error(err);
 callback(err, null);
 }

 callback(null, data);
 });
 },
 function (callback) {
 readFromGitHub(accessToken, username, repository, 'db_drivers', 0, function (err, data) {
 if ((err) && (err.code !== 404)) {
 log.error(err);
 callback(err, null);
 }

 callback(null, data);
 });
 },
 function (callback) {
 readFromGitHub(accessToken, username, repository, 'auth_providers', 0, function (err, data) {
 if ((err) && (err.code !== 404)) {
 log.error(err);
 callback(err, null);
 }

 callback(null, data);
 });
 }],
 function (err, result) {
 if (err) {
 log.error(err);
 return callback("Synchronization has failed");
 }
 //log.info(result);
 //return null;
 var applications   = result[0];
 var queries        = result[1];
 var widgets        = result[2];
 var users          = result[3];
 var roles          = result[4];
 var resources      = result[5];
 var db_drivers     = result[6];
 var auth_providers = result[7];


 // Find modified and new objects in GitHub response
 var modifiedApp           = [];
 var modifiedQue           = [];
 var modifiedWid           = [];
 var modifiedUsers         = [];
 var modifiedRoles         = [];
 var modifiedRes           = [];
 var modifiedDbDrivers     = [];
 var modifiedAuthProviders = [];

 var newApps          = [];
 var newQues          = [];
 var newWids          = [];
 var newUsers         = [];
 var newRoles         = [];
 var newRes           = [];
 var newDbDrivers     = [];
 var newAuthProviders = [];

 var emptyRes = {"modified": [], "added": []};

 async.parallel(
 [
 function (callback) {
 if ((applications != null) && (applications.length > 0)) {
 mdbw.get(DB_NAME, 'applications').then(function (docs) {
 _.each(docs, function (app) {
 if ((app.versioning) && (app.versioning[repository])) {
 var appVersioning = app.versioning[repository];
 _.each(applications, function (gitApp) {
 if (gitApp.name === app.name) {

 var obj1 = JSON.parse(JSON.stringify(gitApp));
 var obj2 = JSON.parse(JSON.stringify(app));
 obj1     = _.omit(obj1, 'versioning', 'requestDate');
 obj2     = _.omit(obj2, 'versioning', 'requestDate');

 if (!_.isEqual(obj1, obj2)) {
 modifiedApp.push(app.name);
 }
 }
 });
 }
 });
 var appsArr    = [];
 var gitAppsArr = [];
 _.each(docs, function (app) {
 appsArr.push(app.name);
 });
 _.each(applications, function (gitApp) {
 gitAppsArr.push(gitApp.name);
 });

 newApps = _.difference(gitAppsArr, appsArr);

 var res      = {};
 res.modified = modifiedApp;
 res.added    = newApps;

 callback(null, res);
 })
 .fail(function (err) {
 log.error(err);
 })
 } else {
 callback(null, emptyRes);
 }
 },
 function (callback) {
 if ((widgets != null) && (widgets.length > 0)) {
 mdbw.get(DB_NAME, 'datawidgets').then(function (docs) {
 _.each(docs, function (app) {
 if ((app.versioning) && (app.versioning[repository])) {
 var appVersioning = app.versioning[repository];
 _.each(widgets, function (gitApp) {
 if (gitApp.name === app.name) {

 var obj1 = JSON.parse(JSON.stringify(gitApp));
 var obj2 = JSON.parse(JSON.stringify(app));
 obj1     = _.omit(obj1, 'versioning', 'requestDate');
 obj2     = _.omit(obj2, 'versioning', 'requestDate');

 if (!_.isEqual(obj1, obj2)) {
 modifiedWid.push(app.name);
 }
 } else {
 newWids.push(app.name);
 }
 });
 }
 });

 var wArr    = [];
 var gitWArr = [];
 _.each(docs, function (app) {
 wArr.push(app.name);
 });
 _.each(widgets, function (gitApp) {
 gitWArr.push(gitApp.name);
 });

 newWids = _.difference(gitWArr, wArr);

 var res      = {};
 res.modified = modifiedWid;
 res.added    = newWids;

 callback(null, res);
 })
 .fail(function (err) {
 log.error(err);
 })
 } else {
 callback(null, emptyRes);
 }
 },
 function (callback) {
 if ((queries != null) && (queries.length > 0)) {
 mdbw.get(DB_NAME, 'dataqueries').then(function (docs) {
 _.each(docs, function (app) {
 if ((app.versioning) && (app.versioning[repository])) {
 var appVersioning = app.versioning[repository];
 _.each(queries, function (gitApp) {
 if (gitApp.name === app.name) {

 var obj1 = JSON.parse(JSON.stringify(gitApp));
 var obj2 = JSON.parse(JSON.stringify(app));
 obj1     = _.omit(obj1, 'versioning', 'requestDate');
 obj2     = _.omit(obj2, 'versioning', 'requestDate');

 if (!_.isEqual(obj1, obj2)) {
 modifiedQue.push(app.name);
 }
 } else {
 newQues.push(app.name);
 }
 });
 }
 });

 var qArr    = [];
 var gitQArr = [];
 _.each(docs, function (app) {
 qArr.push(app.name);
 });
 _.each(queries, function (gitApp) {
 gitQArr.push(gitApp.name);
 });
 newQues     = _.difference(gitQArr, qArr);

 var res      = {};
 res.modified = modifiedQue;
 res.added    = newQues;

 callback(null, res);
 })
 .fail(function (err) {
 log.info(err);
 log.error(err);
 })
 } else {
 callback(null, emptyRes);
 }
 },
 function (callback) {
 if ((users != null) && (users.length > 0)) {
 mdbw.get(DB_NAME, 'users').then(function (docs) {
 var appsArr    = [];
 var gitAppsArr = [];

 _.each(docs, function (app) {
 appsArr.push(app.credentials.login.toString());
 });
 _.each(users, function (gitApp) {
 gitAppsArr.push(gitApp.login.toString());
 });

 newUsers = _.difference(gitAppsArr, appsArr);

 var res      = {};
 res.modified = modifiedUsers;
 res.added    = newUsers;

 callback(null, res);
 })
 .fail(function (err) {
 log.info(err);
 log.error(err);
 })
 } else {
 callback(null, emptyRes);
 }
 },
 function (callback) {
 if ((roles != null) && (roles.length > 0)) {
 mdbw.get(DB_NAME, 'roles').then(function (docs) {
 var appsArr    = [];
 var gitAppsArr = [];
 _.each(docs, function (app) {
 appsArr.push(app.name.toString());
 });
 _.each(roles, function (gitApp) {
 gitAppsArr.push(gitApp.name.toString());
 });

 newRoles = _.difference(gitAppsArr, appsArr);

 var res      = {};
 res.modified = modifiedRoles;
 res.added    = newRoles;

 callback(null, res);
 })
 .fail(function (err) {
 log.error(err);
 })
 } else {
 callback(null, emptyRes);
 }
 },
 function (callback) {
 if ((resources != null) && (resources.length > 0)) {
 mdbw.get(DB_NAME, 'resources').then(function (docs) {
 var appsArr    = [];
 var gitAppsArr = [];
 _.each(docs, function (app) {
 appsArr.push(app.name.toString());
 });
 _.each(resources, function (gitApp) {
 gitAppsArr.push(gitApp.name.toString());
 });

 newRes = _.difference(gitAppsArr, appsArr);

 var res      = {};
 res.modified = modifiedRes;
 res.added    = newRes;

 callback(null, res);
 })
 .fail(function (err) {
 log.info(err);
 log.error(err);
 })
 } else {
 callback(null, emptyRes);
 }
 },
 function (callback) {
 if ((db_drivers != null) && (db_drivers.length > 0)) {
 mdbw.get('db_drivers', tenantID).then(function (docs) {
 var appsArr    = [];
 var gitAppsArr = [];
 _.each(docs, function (app) {
 appsArr.push(app.nameDriver.toString());
 });
 _.each(db_drivers, function (gitApp) {
 gitAppsArr.push(gitApp.nameDriver.toString());
 });

 newDbDrivers = _.difference(gitAppsArr, appsArr);

 var res      = {};
 res.modified = modifiedDbDrivers;
 res.added    = newDbDrivers;

 callback(null, res);
 })
 .fail(function (err) {
 log.error(err);
 })
 } else {
 callback(null, emptyRes);
 }
 },
 function (callback) {
 if ((auth_providers != null) && (auth_providers.length > 0)) {
 mdbw.get('auth_providers', tenantID).then(function (docs) {
 var appsArr      = [];
 var gitAppsArr   = [];
 _.each(docs, function (app) {
 appsArr.push(app.provider.toString());
 });
 _.each(auth_providers, function (gitApp) {
 gitAppsArr.push(gitApp.provider.toString());
 });
 newAuthProviders = _.difference(gitAppsArr, appsArr);

 var res      = {};
 res.modified = modifiedAuthProviders;
 res.added    = newAuthProviders;

 callback(null, res);
 })
 .fail(function (err) {
 log.error(err);
 })
 } else {
 callback(null, emptyRes);
 }
 }
 ],
 function (err, response) {
 // log.info(response);
 //log.error(response);
 var apps_list    = (response[0].modified.length > 0) ? response[0].modified : "Not found",
 widgets_list = (response[1].modified.length > 0) ? response[1].modified : "Not found",
 queries_list = (response[2].modified.length > 0) ? response[2].modified : "Not found",
 str_response = '<strong>To be imported:</strong>' +
 '<br>Applications: ' + response[0].added.length +
 '<br>Widgets: ' + response[1].added.length +
 '<br>Queries: ' + response[2].added.length +
 '<br>Users: ' + response[3].added.length +
 '<br>Roles: ' + response[4].added.length +
 '<br>Resources: ' + response[5].added.length +
 '<br>DB Drivers: ' + response[6].added.length +
 '<br>Auth Providers: ' + response[7].added.length +
 '<br><hr>' +
 '<strong>Changed objects list:</strong>' +
 '<br>Applications: ' + apps_list +
 '<br>Widgets: ' + widgets_list +
 '<br>Queries: ' + queries_list +
 '<br>' +
 '<div class="checkbox"><label><input type="checkbox" id="cbx" name="is_need_settings"> use users, roles, rights, db_drivers and auth_providers</label></div>' +
 '<br>' +
 '<strong>Do you want to copy the data or rewrite your DB?</strong><br><br>';
 callback(null, str_response);
 });
 });
 });
 }
 };
 */

Versioning.get = function (data, overwrite, useSettings, callback) {
    var currentApp = data.appName || null;
    if (currentApp === SETTINGS.sharedCatalogName) currentApp="";
    if ((!data.tenant.id) || (!data.user.id)) return callback("Can't get tenant id or user id from session");
    else {
        var o = {
            "user" : data.user.id,
            "tenant" : data.tenant.id,
            "application": data.appName,
            "provider" : "github"
        }
        getSettingsData(o)
            .then(function(s){
                var accessToken =  s.accessToken || '';
                var repository = s.repository || '';
                var username = s.username || '';
                if ((accessToken=='') || (repository=='') || (username=='')) {
                    callback("Can't read versioning_providers settings");
                }
                var tenantIDForImport = data.tenant.id;


                var tenantID = data.tenant.id;
                var DB_NAME  = 'dreamface_tenant_' + tenantID;
                var userID   = data.user.id;
                //var REPO_DB_NAME = 'dreamface_tenant_' + tenantIDForImport;
                var date = Math.round(+(new Date() / 1000));
                log.info("Import start");
                var socketKey = tenantID + '_' + userID + '_' + currentApp;

                sockets.sendMessage(socketKey,{value : "Import start", progress : 1});
                async.series([
                        function (callback) {
                            sockets.sendMessage(socketKey,{value : "Pulling Application", progress : 6});
                            readFromGitHub(accessToken, username, repository, 'applications', 0, function (err, data) {
                                if ((err) && (err.code !== 404)) {
                                    log.error(err);
                                    callback(err, null);
                                }

                                var counter = 0;
                                if (!data) {
                                    return callback(null, 0);
                                }
                                if (currentApp !== null) {
                                    var appNames = data.filter(function (row) {
                                        return row.name == currentApp;
                                    });
                                    if (appNames.length === 0) return callback("No found information about application '" + currentApp + "' in repository '" + repository + "'");

                                }

                                async.each(data, function (row, cb) {
                                    mdbw.exists(DB_NAME, 'applications', {name: row.name}).then(function (exists) {
                                        if ((!exists) || (overwrite === 'true')) {
                                            if ((currentApp === null) || (row.name === currentApp)) {
                                                if (row.name === currentApp) {
                                                    mdbw.rm(DB_NAME, 'applications', {name: currentApp})
                                                        .then(function () {
                                                            mdbw.put(DB_NAME, 'applications', row)
                                                                .then(function () {
                                                                    counter++;
                                                                    cb();
                                                                })
                                                                .fail(function (err) {
                                                                    if (err) {
                                                                        log.error(err);
                                                                    }
                                                                });
                                                        });
                                                } else {
                                                    mdbw.put(DB_NAME, 'applications', row)
                                                        .then(function () {
                                                            counter++;
                                                            cb();
                                                        })
                                                        .fail(function (err) {
                                                            if (err) {
                                                                log.error(err);
                                                            }
                                                        });
                                                }
                                            } else {
                                                cb();
                                            }
                                        } else {
                                            cb();
                                        }
                                    })
                                        .fail(function (err) {
                                            log.error(err);
                                            cb();
                                        });
                                }, function () {
                                    log.info("Applications import completed");
                                    callback(null, counter);
                                });
                            });
                        },
                        function (callback) {
                            var counter = 0;
                            sockets.sendMessage(socketKey,{value : "Pulling Screens", progress : 12});
                            readFromGitHub(accessToken, username, repository, 'screens', 0, function (err, data) {
                                if ((err) && (err.code !== 404)) {
                                    log.error(err);
                                    callback(err, null);
                                }
                                _.each(data, function (row) {
                                    mdbw.exists(DB_NAME, 'screens', {_id: new mongo.ObjectID(row._id)}).then(function (exists) {
                                        if ((!exists) || (overwrite === 'true')) {
                                            if ((currentApp === null) || (row.application === currentApp)) {
                                                if (row.name == "Home") {
                                                    mdbw.rm(DB_NAME, 'screens', {name: 'Home'})
                                                        .then(function () {
                                                            mdbw.put(DB_NAME, 'screens', row)
                                                                .then(function () {
                                                                    counter++;
                                                                })
                                                                .fail(function (err) {
                                                                    if (err) {
                                                                        log.error(err);
                                                                    }
                                                                });
                                                        });
                                                } else {
                                                    mdbw.put(DB_NAME, 'screens', row)
                                                        .then(function () {
                                                            counter++;
                                                        })
                                                        .fail(function (err) {
                                                            if (err) {
                                                                log.error(err);
                                                            }
                                                        });
                                                }
                                            }
                                        }
                                    })
                                        .fail(function (err) {
                                            log.error(err);
                                        });
                                });
                                log.info("Screens import completed");
                                callback(null, counter);
                            });

                        },
                        function (callback) {
                            var counter = 0;
                            sockets.sendMessage(socketKey,{value : "Pulling Application Menus", progress : 18});
                            readFromGitHub(accessToken, username, repository, 'appMenus', 0, function (err, data) {
                                if ((err) && (err.code !== 404)) {
                                    log.error(err);
                                    callback(err, null);
                                }
                                _.each(data, function (row) {
                                    mdbw.exists(DB_NAME, 'application_menus', {_id: new mongo.ObjectID(row._id)}).then(function (exists) {
                                        if ((!exists) || (overwrite === 'true')) {
                                            if ((currentApp === null) || (row.application === currentApp)) {
                                                // temp fix
                                                if (row.name == "Home") {
                                                    mdbw.rm(DB_NAME, 'application_menus', {name: 'Home'})
                                                        .then(function () {
                                                            mdbw.put(DB_NAME, 'application_menus', row)
                                                                .then(function () {
                                                                    counter++;
                                                                })
                                                                .fail(function (err) {
                                                                    if (err) {
                                                                        log.error(err);
                                                                    }
                                                                });
                                                        });
                                                } else {
                                                    mdbw.put(DB_NAME, 'application_menus', row)
                                                        .then(function () {
                                                            counter++;
                                                        })
                                                        .fail(function (err) {
                                                            if (err) {
                                                                log.error(err);
                                                            }
                                                        });
                                                }
                                            }
                                        }
                                    })
                                        .fail(function (err) {
                                            log.error(err);
                                        });
                                });
                                log.info("Applications menus import completed");
                                callback(null, counter);
                            });

                        },
                        function (callback) {
                            var counter = 0;
                            sockets.sendMessage(socketKey,{value :"Pulling Application Configuration", progress : 24});
                            readFromGitHub(accessToken, username, repository, 'application_configurations', 0, function (err, data) {
                                if ((err) && (err.code !== 404)) {
                                    log.error(err);
                                    callback(err, null);
                                }
                                _.each(data, function (row) {
                                    if ((currentApp === null) || (row.application === currentApp)) {
                                        applications.updateConfiguration(row.application, {session: {tenant: {id: tenantID}}}, row);
                                        counter++;
                                    }
                                });
                                log.info("Application configurations import completed");
                                callback(null, counter);
                            });

                        },
                        function (callback) {
                            var counter = 0;
                            sockets.sendMessage(socketKey,{value :"Pulling User Definition", progress : 30});
                            readFromGitHub(accessToken, username, repository, 'metadata', 0, function (err, data) {
                                if ((err) && (err.code !== 404)) {
                                    log.error(err);
                                    callback(err, null);
                                }
                                _.each(data, function (row) {
                                    if ((currentApp === null) || (row.application === currentApp)) {
                                        mdbw.put(DB_NAME, 'metadata', row)
                                            .then(function () {
                                                counter++;
                                            })
                                            .fail(function (err) {
                                                if (err) {
                                                    log.error(err);
                                                }
                                            });
                                    }
                                });
                                log.info("Application metadata import completed");
                                callback(null, counter);
                            });

                        },
                        function (callback) {
                            var counter = 0;
                            sockets.sendMessage(socketKey,{value :"Pulling Screen Categories", progress : 36});
                            readFromGitHub(accessToken, username, repository, 'screen_categories', 0, function (err, data) {
                                if ((err) && (err.code !== 404)) {
                                    log.error(err);
                                    callback(err, null);
                                }
                                _.each(data, function (row) {
                                    mdbw.exists(DB_NAME, 'screens_categories', {_id: new mongo.ObjectID(row._id)}).then(function (exists) {
                                        if ((!exists) || (overwrite === 'true')) {
                                            if ((currentApp === null) || (row.application === currentApp)) {
                                                mdbw.put(DB_NAME, 'screens_categories', row)
                                                    .then(function () {
                                                        counter++;
                                                    })
                                                    .fail(function (err) {
                                                        if (err) {
                                                            log.error(err);
                                                        }
                                                    });
                                            }
                                        }
                                    })
                                        .fail(function (err) {
                                            log.error(err);
                                        });
                                });
                                log.info("Screens categories import completed");
                                callback(null, counter);
                            });

                        },
                        function (callback) {
                            sockets.sendMessage(socketKey,{value :"Pulling DataQueries", progress : 42});
                            readFromGitHub(accessToken, username, repository, 'dataqueries', 0, function (err, data) {
                                if ((err) && (err.code !== 404)) {
                                    log.error(err);
                                    callback(err, null);
                                }
                                var counter = 0;
                                if (!data) {
                                    return callback(null, 0);
                                }
                                async.each(data, function (row, cb) {
                                    mdbw.exists(DB_NAME, 'dataqueries', {name: row.name}).then(function (exists) {
                                        if ((!exists) || (overwrite === 'true')) {
                                            if ((currentApp === null) || (row.application === currentApp)) {
                                                mdbw.put(DB_NAME, 'dataqueries', row)
                                                    .fail(function (err) {
                                                        if (err) {
                                                            log.error(err);
                                                        }
                                                    })
                                                    .then(function () {
                                                        counter++;
                                                        cb();
                                                    });
                                            } else {
                                                cb();
                                            }
                                        } else {
                                            cb();
                                        }
                                    })
                                        .fail(function (err) {
                                            log.error(err);
                                            cb();
                                        });
                                }, function () {
                                    log.info("Dataqueries import completed");
                                    callback(null, counter);
                                });
                            });

                        },
                        function (callback) {
                            sockets.sendMessage(socketKey,{value :"Pulling DataWidgets", progress : 48});
                            readFromGitHub(accessToken, username, repository, 'datawidgets', 0, function (err, data) {
                                if ((err) && (err.code !== 404)) {
                                    log.error(err);
                                    callback(err, null);
                                }
                                var counter = 0;
                                if (!data) {
                                    return callback(null, 0);
                                }
                                async.each(data, function (row, cb) {
                                    mdbw.exists(DB_NAME, 'datawidgets', {name: row.name}).then(function (exists) {
                                        if ((!exists) || (overwrite === 'true')) {
                                            if ((currentApp === null) || (row.application === currentApp)) {
                                                mdbw.put(DB_NAME, 'datawidgets', row)
                                                    .fail(function (err) {
                                                        if (err) {
                                                            log.error(err);
                                                        }
                                                    })
                                                    .then(function () {
                                                        counter++;
                                                        cb();
                                                    });
                                            } else {
                                                cb();
                                            }
                                        } else {
                                            cb();
                                        }
                                    })
                                        .fail(function (err) {
                                            log.error(err);
                                            cb();
                                        });
                                }, function () {
                                    log.info("Datawidgets import completed");
                                    callback(null, counter);
                                });
                            });
                        },
                        function (callback) {
                            sockets.sendMessage(socketKey,{value :"Pulling Users", progress : 54});
                            if (useSettings === 'true') {
                                readFromGitHub(accessToken, username, repository, 'users', 0, function (err, data) {
                                    if ((err) && (err.code !== 404)) {
                                        log.error(err);
                                        callback(err, null);
                                    }
                                    var counter = 0;
                                    if (!data) {
                                        return callback(null, 0);
                                    }
                                    async.each(data, function (row, cb) {
                                        if ((currentApp === null) || (row.application === currentApp)) {
                                            row.tenant = tenantID;
                                            if (!row.pass)
                                                row.pass = SETTINGS.default_password;
                                            row.pull = true;
                                            usersModule.create(row)
                                                .fail(function (err) {
                                                    log.info(err);
                                                    if (counter >= 0) counter--;
                                                    cb();
                                                })
                                                .then(function () {
                                                    counter++;
                                                    cb();
                                                });
                                        } else {
                                            cb();
                                        }

                                    }, function () {
                                        log.info("Users import completed");
                                        if (counter < 0) counter = 0;
                                        callback(null, counter);
                                    });
                                });
                            } else {
                                callback(null, 0);
                            }

                        },
                        function (callback) {
                            var counter = 0;
                            sockets.sendMessage(socketKey,{value :"Pulling DataQuery Categories", progress : 60});
                            readFromGitHub(accessToken, username, repository, 'dataquerie_categories', 0, function (err, data) {
                                if ((err) && (err.code !== 404)) {
                                    log.error(err);
                                    callback(err, null);
                                }
                                _.each(data, function (row) {
                                    mdbw.exists(DB_NAME, 'dataqueries_categories', {name: row.name}).then(function (exists) {
                                        if ((!exists) || (overwrite === 'true')) {
                                            if ((currentApp === null) || (row.application === currentApp)) {
                                                mdbw.put(DB_NAME, 'dataqueries_categories', row)
                                                    .then(function () {
                                                        counter++;
                                                    })
                                                    .fail(function (err) {
                                                        if (err) {
                                                            log.error(err);
                                                        }
                                                    });
                                            }
                                        }
                                    })
                                        .fail(function (err) {
                                            log.error(err);
                                        });
                                });
                                log.info("Dataqueries categories import completed");
                                callback(null, counter);
                            });

                        },
                        function (callback) {
                            var counter = 0;
                            sockets.sendMessage(socketKey,{value :"Pulling Resources", progress : 66});
                            readFromGitHub(accessToken, username, repository, 'resources', 0, function (err, data) {
                                if ((err) && (err.code !== 404)) {
                                    log.error(err);
                                    callback(err, null);
                                }
                                var counter = 0;
                                if (!data) {
                                    return callback(null, 0);
                                }
                                async.each(data, function (row, cb) {
                                    mdbw.exists(DB_NAME, 'resources', {name: row.name}).then(function (exists) {
                                        if ((!exists) || (overwrite === 'true')) {
                                            if ((currentApp === null) || (row.application === currentApp)) {
                                                mdbw.put(DB_NAME, 'resources', row)
                                                    .fail(function (err) {
                                                        if (err) {
                                                            log.error(err);
                                                            cb();
                                                        }
                                                    })
                                                    .then(function () {
                                                        counter++;
                                                        cb();
                                                    })
                                            } else {
                                                cb();
                                            }

                                        } else {
                                            cb();
                                        }
                                    })
                                        .fail(function (err) {
                                            log.error(err);
                                            cb();
                                        });
                                }, function () {
                                    log.info("Resources import completed");
                                    callback(null, counter);
                                });
                            });

                        },
                        function (callback) {
                            var counter = 0;
                            sockets.sendMessage(socketKey,{value :"Pulling Resource Files", progress : 72});
                            readFromGitHub(accessToken, username, repository, 'files', 1, function (err, data) {
                                if ((err) && (err.code !== 404)) {
                                    // log.error(err);
                                    callback(err, null);
                                }

                                function getFileDirectory(filePath) {
                                    if (filePath.indexOf("/") == -1) { // windows
                                        return filePath.substring(0, filePath.lastIndexOf('\\'));
                                    }
                                    else { // unix
                                        return filePath.substring(0, filePath.lastIndexOf('/'));
                                    }
                                }

                                if (!data) {
                                    return callback(null, 0);
                                }

                                async.each(data, function (res, cb) {
                                    if (currentApp === null)
                                        var file_path = path.join(RESOURCES_DEV_PATH, tenantID + '/' + res.path);
                                    else
                                        var file_path = path.join(RESOURCES_DEV_PATH, tenantID + '/' + currentApp + '/' + res.path);
                                    var folder_tree_path = getFileDirectory(file_path);

                                    if ((!fs.existsSync(file_path)) || (overwrite === 'true')) {
                                        QFS.makeTree(folder_tree_path).then(function () {

                                            if (path.extname(file_path) === ".json") {
                                                res.content = JSON.stringify(res.content, null, 4);
                                            }

                                            fs.writeFile(file_path, res.content, 'binary', function (err) {
                                                if (err) {
                                                    log.error(err);
                                                }
                                                cb();
                                                counter++;
                                            });
                                        });

                                    } else {
                                        cb();
                                    }
                                }, function () {
                                    log.info("Files import completed");
                                    callback(null, counter);
                                });
                            });

                        },
                        function (callback) {
                            var counter = 0;
                            sockets.sendMessage(socketKey,{value :"Pulling DataQuery Services", progress : 78});
                            readFromGitHub(accessToken, username, repository, 'dataquerie_services', 0, function (err, data) {
                                if ((err) && (err.code !== 404)) {
                                    log.error(err);
                                    callback(err, null);
                                }
                                _.each(data, function (row) {
                                    mdbw.exists(DB_NAME, 'dataqueries_services', {name: row.name}).then(function (exists) {
                                        if ((!exists) || (overwrite === 'true')) {
                                            if ((currentApp === null) || (row.application === currentApp)) {
                                                mdbw.put(DB_NAME, 'dataqueries_services', row)
                                                    .then(function () {
                                                        counter++;
                                                    })
                                                    .fail(function (err) {
                                                        if (err) {
                                                            log.error(err);
                                                        }
                                                    });
                                            }

                                        }
                                    })
                                        .fail(function (err) {
                                            log.error(err);
                                        });
                                });
                                log.info("Dataqueries services import completed");
                                callback(null, counter);
                            });

                        },
                        function (callback) {
                            var counter = 0;
                            sockets.sendMessage(socketKey,{value :"Pulling DataWidget Categories", progress : 84});
                            readFromGitHub(accessToken, username, repository, 'datawidget_categories', 0, function (err, data) {
                                if ((err) && (err.code !== 404)) {
                                    log.error(err);
                                    callback(err, null);
                                }
                                _.each(data, function (row) {
                                    mdbw.exists(DB_NAME, 'datawidgets_categories', {name: row.name}).then(function (exists) {
                                        if ((!exists) || (overwrite === 'true')) {
                                            if ((currentApp === null) || (row.application === currentApp)) {
                                                mdbw.put(DB_NAME, 'datawidgets_categories', row)
                                                    .then(function () {
                                                        counter++;
                                                    })
                                                    .fail(function (err) {
                                                        if (err) {
                                                            log.error(err);
                                                        }
                                                    });
                                            }
                                        }
                                    })
                                        .fail(function (err) {
                                            log.error(err);
                                        });
                                });
                                log.info("Datawidgets categories import completed");
                                callback(null, counter);
                            });

                        },
                        /*
                         function (callback) {
                         var counter = 0;
                         if (useSettings === 'true') {
                         readFromGitHub(accessToken, username, repository, 'rights', 0, function (err, data) {
                         if ((err) && (err.code !== 404)) {
                         log.error(err);
                         callback(err, null);
                         }
                         _.each(data, function (row) {
                         mdbw.exists(DB_NAME, 'rights', {name: row.name}).then(function (exists) {
                         if ((!exists) || (overwrite === 'true')) {
                         if ((currentApp === null) || (row.application === currentApp)) {
                         mdbw.put(DB_NAME, 'rights', row)
                         .then(function () {
                         counter++;
                         })
                         .fail(function (err) {
                         if (err) {
                         log.error(err);
                         }
                         });
                         }
                         }
                         })
                         .fail(function (err) {
                         log.error(err);
                         });
                         });
                         callback(null, counter);
                         });
                         } else {
                         callback(null, 0);
                         }
                         },
                         */
                        function (callback) {
                            sockets.sendMessage(socketKey,{value :"Pulling User Roles", progress : 90});
                            if (useSettings === 'true') {
                                readFromGitHub(accessToken, username, repository, 'roles', 0, function (err, data) {
                                    if ((err) && (err.code !== 404)) {
                                        log.error(err);
                                        callback(err, null);
                                    }
                                    var counter = 0;
                                    if (!data) {
                                        return callback(null, 0);
                                    }
                                    async.each(data, function (row, cb) {
                                        mdbw.exists(DB_NAME, 'roles', {name: row.name}).then(function (exists) {
                                            if ((!exists) || (overwrite === 'true')) {
                                                if ((currentApp === null) || (row.application === currentApp)) {
                                                    mdbw.put(DB_NAME, 'roles', row)
                                                        .fail(function (err) {
                                                            if (err) {
                                                                log.error(err);
                                                                cb();
                                                            }
                                                        })
                                                        .then(function () {
                                                            counter++;
                                                            cb();
                                                        });
                                                } else {
                                                    cb();
                                                }
                                            } else {
                                                cb();
                                            }
                                        })
                                            .fail(function (err) {
                                                log.error(err);
                                                cb();
                                            });
                                    }, function () {
                                        log.info("Roles import completed");
                                        callback(null, counter);
                                    });
                                });
                            } else {
                                callback(null, 0);
                            }
                        },
                        function (callback) {
                            sockets.sendMessage(socketKey,{value :"Pulling Auth Providers", progress : 96});
                            if (useSettings === 'true') {
                                readFromGitHub(accessToken, username, repository, 'auth_providers/', 0, function (err, data) {
                                    if ((err) && (err.code !== 404)) {
                                        log.error(err);
                                        callback(err, null);
                                    }
                                    var counter = 0;
                                    if (!data) {
                                        return callback(null, 0);
                                    }
                                    async.each(data, function (row, cb) {
                                        row.applicationName = row.application;
                                        delete row._id;
                                        row.tenant          = tenantID;
                                        row.user = userID;
                                        row.pull = true;
                                        if ((currentApp === null) || (row.application === currentApp)) {
                                            mdbw.exists('auth_providers').then(function (exists) {
                                                if (!exists) {
                                                    authProvidersModule.put(row)
                                                        .fail(function (err) {
                                                            if (err) {
                                                                log.error(err);
                                                                cb();
                                                            }
                                                        })
                                                        .then(function () {
                                                            counter++;
                                                            cb();
                                                        });
                                                } else {
                                                    mdbw.exists('auth_providers', tenantID, {provider: row.provider}).then(function (exists) {
                                                        if ((!exists) || (overwrite === 'true')) {
                                                            authProvidersModule.put(row)
                                                                .fail(function (err) {
                                                                    if (err) {
                                                                        log.error(err);
                                                                        cb();
                                                                    }
                                                                })
                                                                .then(function () {
                                                                    if (!exists) counter++;
                                                                    cb();
                                                                });
                                                        } else {
                                                            cb();
                                                        }
                                                    });
                                                }

                                            })
                                                .fail(function (err) {
                                                    log.error(err);
                                                    cb();
                                                });
                                        } else {
                                            cb();
                                        }
                                    }, function () {
                                        log.info("Auth providers import completed");
                                        callback(null, counter);
                                    });
                                });
                            } else {
                                callback(null, 0);
                            }
                        },
                        function (callback) {
                            sockets.sendMessage(socketKey,{value :"Pulling Database Drivers", progress : 99});
                            if (useSettings === 'true') {
                                readFromGitHub(accessToken, username, repository, 'db_drivers/', 0, function (err, data) {
                                    if ((err) && (err.code !== 404)) {
                                        log.error(err);
                                        callback(err, null);
                                    }
                                    var counter = 0;
                                    if (!data) {
                                        return callback(null, 0);
                                    }
                                    async.each(data, function (row, cb) {
                                        delete row._id;
                                        row.tenant = tenantID;
                                        row.pull = true;
                                        row.applicationName = row.application;
                                        if ((currentApp === null) || (row.application === currentApp)) {
                                            mdbw.exists('db_drivers').then(function (exists) {
                                                if (!exists) {
                                                    dbDriveModule.put(row)
                                                        .fail(function (err) {
                                                            if (err) {
                                                                log.error(err);
                                                                cb();
                                                            }
                                                        })
                                                        .then(function () {
                                                            counter++;
                                                            cb();
                                                        });

                                                } else {
                                                    mdbw.exists('db_drivers', tenantID, {nameDriver: row.nameDriver}).then(function (exists) {
                                                        if ((!exists) || (overwrite === 'true')) {
                                                            dbDriveModule.put(row)
                                                                .fail(function (err) {
                                                                    if (err) {
                                                                        log.error(err);
                                                                        cb();
                                                                    }
                                                                })
                                                                .then(function () {
                                                                    if (!exists) counter++;
                                                                    cb();
                                                                });
                                                        } else {
                                                            cb();
                                                        }
                                                    });
                                                }
                                            })
                                                .fail(function (err) {
                                                    log.error(err);
                                                    cb();
                                                });
                                        } else {
                                            cb();
                                        }
                                    }, function () {
                                        log.info("Database drivers import completed");
                                        callback(null, counter);
                                    });
                                });
                            } else {
                                callback(null, 0);
                            }
                        }
                    ],
                    function (err, result) {
                        // log.info(result);
                        _.map(result, function (res) {
                            return parseInt(res);
                        });
                        var counter = 0;
                        _.each(result, function (res) {
                            counter += res;
                        });
                        if (err) {
                            log.error(err);
                            return callback("Import has failed!\n" + err);
                        }
                        roles.rebuildCache().then(function () {
                            log.info("Git pull has been completed successfully");
                            //sockets.sendMessage(socketKey,{value :"Import was completed", progress : 100});
                            var message = "Git pull has been completed successfully";
                            return callback(null, message);
                        });
                    });
            });
    }
};

function task(app, req) {
    return function (callback) {
        screens.selectAll(app.name, {}, req, function (scr) {
            callback(null, scr);
        });
    };
}

function setStatusToObject(collection, ObjectID, userID, tenantID, status) {
    D = Q.defer();
    mdbw.get(DB_TENANTS_PREFIX + tenantID, collection, {_id: new mongo.ObjectID(ObjectID)}).then(function (result) {
        if (result[0].versioning) {
            mdbw.update(DB_TENANTS_PREFIX + tenantID, collection, {_id: new mongo.ObjectID(ObjectID)}, {$set: {"versioning.status":status}}).then(function () {
                D.resolve();
            });
        }
        else {
            var data = {"versioning":{}};
            data.versioning.last_action = (new Date() / 1000).toFixed();
            data.versioning.status = status;
            data.versioning.user = userID;
            mdbw.update(DB_TENANTS_PREFIX + tenantID, collection, {_id: new mongo.ObjectID(ObjectID)}, {$set: data}).then(function () {
                D.resolve();
            });
        }
    });
    return D.promise;
};



function filter(selectComponentsFormResponse, docs) {
    var objects = [];
    _.each(selectComponentsFormResponse, function (row) {
        objects.push(row);
    });
    if (objects.length > 0) {
        var res = _.filter(docs, function (doc) {
            var res = false;
            _.each(objects, function (row) {
                if (row == doc._id.toString()) {
                    res = true;
                }
            });
            return res;
        });
    }
    var deleted = getDeletedIds(docs);

    var res = _.filter(res, function (val) {
        if (!_.contains(deleted, val._id)) {
            return true;
        }
    });


    return res;
}

function getDeletedIds(docs) {
    var deleted = [];
    var res     = _.filter(docs, function (doc) {
        if ((doc.versioning) && (doc.versioning.status) && ((doc.versioning.status) == 'deleted')) {
            deleted.push(doc._id);
            return false;
        } else {
            return true;
        }
    });
    return deleted;
}

function getDeletedNames(docs, selection) {
    var deleted = [];
    var res     = _.filter(docs, function (doc) {
        if ((doc.versioning)  && (doc.versioning.status) && ((doc.versioning.status) == 'deleted') && (_.indexOf(_.values(selection), doc._id.toString()) > -1)) {
            deleted.push(doc.name.toString());
            return false;
        } else {
            return true;
        }
    });
    return deleted;
}

function getDeleted(docs, selection) {
    var deleted = [];
    var res     = _.filter(docs, function (doc) {
        if ((doc.versioning)  && (doc.versioning.status) && ((doc.versioning.status) == 'deleted') && (_.indexOf(_.values(selection), doc._id.toString()) > -1)) {
            deleted.push(doc);
            return false;
        } else {
            return true;
        }
    });
    return deleted;
}

function deleteFileFromGitHub(accessToken, userName, repoName, path, message, callback) {
    var github = new GitHubApi({
        version: "3.0.0"
    });

    github.authenticate({
        type:  "oauth",
        token: accessToken
    });

    var data = {
        "user": userName,
        "repo": repoName,
        "ref":  "heads/master"
    };

    github.gitdata.getReference(data, function (err, ref) {
        if (err) {
            log.info("delete getReference")
            log.info(err);
            return callback(err);
        }
        var data = {
            "user":      userName,
            "repo":      repoName,
            "sha":       ref.object.sha,
            "recursive": true
        };
        github.gitdata.getTree(data, function (err, ref) {
            if (err) {
                log.info("delete getTree")
                log.info(err);
                return callback(err);
            }

            var file = _.select(ref.tree, function (file) {
                return (('blob' === file.type) && (0 == file.path.indexOf(path)));
            })[0];

            if ((!file) || (file.length == 0)) {
                return callback(null, "Not found - " + path)
            } else {
                var data = {
                    "user":    userName,
                    "repo":    repoName,
                    "sha":     file.sha,
                    "message": message,
                    "path":    path
                };

                github.repos.deleteFile(data, function (err, ref) {
                    if (err) {
                        log.info("delete File")
                        log.info(err);
                        return callback(err);
                    }
                    else callback(null, ref);
                });
            }
        });
    });
}

function readFromGitHub(accessToken, userName, repoName, dir, type, callback) {
    var github = new GitHubApi({
        version: "3.0.0"
    });

    github.authenticate({
        type:  "oauth",
        token: accessToken
    });

    var data = {
        "user": userName,
        "repo": repoName,
        "ref":  "heads/master"
    };

    github.gitdata.getReference(data, function (err, ref) {
        if (err) return callback(err);
        var data = {
            "user":      userName,
            "repo":      repoName,
            "sha":       ref.object.sha,
            "recursive": true
        };
        github.gitdata.getTree(data, function (err, ref) {
            if (err) return callback(err);
            var file = _.select(ref.tree, function (file) {
                return (('blob' === file.type) && (0 == file.path.indexOf(dir)));
            });

            if (file.length === 0) return callback(null, null);

            var tasks = _.map(file, function (data) {
                return gitTask(accessToken, userName, repoName, data.sha);
            });
            async.parallel(tasks, function (err, data) {
                if (err) return callback(err);
                if (data) {

                    _.each(data, function (val, key) {
                        if (_.isEmpty(val)) data.splice(key, 1);
                    });
                    if (type == 1) {
                        _.each(data, function (val, key) {
                            data[key] = JSON.parse('{"content":' + JSON.stringify(val) + ',"path":"' + file[key].path.replace("files/", "") + '"}');
                        });
                    }

                    callback(null, data);
                }
            });
        });
    });
}

function gitTask(accessToken, userName, repoName, sha) {
    return function (callback) {
        var github = new GitHubApi({
            version: "3.0.0"
        });

        github.authenticate({
            type:  "oauth",
            token: accessToken
        });

        var data = {
            "user": userName,
            "repo": repoName,
            "sha":  sha
        };
        github.gitdata.getBlob(data, function (err, ref) {
            if (err) return callback(err);
            else {
                var response = new Buffer(ref.content, ref.encoding).toString('utf-8');
                try {
                    response = JSON.parse(response);
                } catch (e) {
                    //response = {};
                }
                callback(null, response);
            }
        });
    };
}

function writeToGitHub(accessToken, repoName, userName, body, message, callback) {
    if (_.isEmpty(body)) {
        return callback(null, null);
    }
    var github = new GitHubApi({
        version: "3.0.0"
    });

    github.authenticate({
        type:  "oauth",
        token: accessToken
    });
    var data   = {
        "user": userName,
        "repo": repoName,
        "ref":  "heads/master"
    };

    github.gitdata.getReference(data, function (err, ref) {
        if (err) return callback(err);
        var data = {
            "user": userName,
            "repo": repoName,
            "sha":  ref.object.sha
        };
        github.gitdata.getCommit(data, function (err, tree) {
            if (err) return callback(err);

            var arr = [];
            _.each(body, function (key, val) {
                arr.push({"path": val, "mode": "100644", "type": "blob", "content": key});
            });

            var data = {
                "user":      userName,
                "repo":      repoName,
                "base_tree": tree.tree.sha,
                "tree":      arr
            };
            github.gitdata.createTree(data, function (err, res) {
                if (err) return callback(err);
                var data = {
                    "user":    userName,
                    "repo":    repoName,
                    "message": message,
                    "tree":    res.sha,
                    "parents": [ref.object.sha]
                };
                github.gitdata.createCommit(data, function (err, res) {
                    var data = {
                        "user":  userName,
                        "repo":  repoName,
                        "ref":   "heads/master",
                        "sha":   res.sha,
                        "force": true
                    };
                    github.gitdata.updateReference(data, function (err, res) {
                        if (err) return callback(err);
                        else callback(null, res);
                    });
                });
            })
        });
    });
}

function clearRepository(accessToken, userName, repoName, message, o, callback) {
    var github = new GitHubApi({
        version: "3.0.0"
    });

    github.authenticate({
        type:  "oauth",
        token: accessToken
    });

    var data = {
        "user": userName,
        "repo": repoName,
        "ref":  "heads/master"
    };

    github.gitdata.getReference(data, function (err, ref) {
        if (err) {
            return callback(err);
        }
        var data = {
            "user":      userName,
            "repo":      repoName,
            "sha":       ref.object.sha,
            "recursive": true
        };
        github.gitdata.getTree(data, function (err, ref) {
            if (err) {
                return callback(err);
            }

            var tasks = _.map(ref.tree, function (data) {
                return gitClearTask(accessToken, userName, repoName, data, message, o);
            });

            async.series(tasks, function (err, response) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, 'success');
                }
            });
        });
    });
}

function gitClearTask(accessToken, userName, repoName, datas, message, o) {
    return function (cb) {
        if (datas.type == 'blob') {

            var github = new GitHubApi({
                version: "3.0.0"
            });

            github.authenticate({
                type:  "oauth",
                token: accessToken
            });

            var data = {
                "user":    userName,
                "repo":    repoName,
                "sha":     datas.sha,
                "message": message,
                "path":    datas.path,
                "branch":  "master"
            };


            github.repos.deleteFile(data, function (err, ref) {
                if (err) {
                    cb(err);
                } else {
                    var socketKey = o.tenant + '_' + o.user + '_' + o.application;
                    sockets.sendMessage(socketKey,{value :"Removing file " + data.path, progress : 100});
                    cb(null, 'success');
                }
            });

        } else {
            cb(null, 'success');
        }
    }
};

module.exports = Versioning;