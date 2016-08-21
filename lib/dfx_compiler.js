/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

// Declaration of main modules
var fs = require('graceful-fs');
var path = require('path');
var jade = require('jade');
var AdmZip = require('adm-zip');
var archiver = require('archiver');
var Q = require('q');
var QFS = require('q-io/fs');

// Declaration of DFX modules
var SETTINGS = require('./dfx_settings');
var applications = require('./dfx_applications');
var screens = require('./dfx_screens');
var widgets = require('./dfx_widgets');
var queries = require('./dfx_queries');
var menus = require('./dfx_menus');
var app_builds = require('./dfx_app_builds');
var endpoints = require('./utils/endpoints');
var unzip = require('./utils/unzip.js');

var mdbw = require('./mdbw')(SETTINGS.mdbw_options);
var resources = require('./dfx_resources').api;
var log = new (require('./utils/log')).Instance({label: "DFX_Compiler"});

var protocol      = !!process.env.DFX_HTTPS ? 'https' : 'http',
    host          = SETTINGS.external_server_host,
    port          = SETTINGS.external_server_port,
    serverAddress = protocol + '://' + host + ':' + port,
    serverAddressWithoutPort = protocol + '://' + host;

var compiler = {};

var WIDGET_SCRIPT_START = '/* Widget: widget_name */\r\n';
var WIDGET_SCRIPT_START_PREFIX = '/* Widget: ';
var APP_BUILD_DIR = SETTINGS.app_build_path;
var APP_FSDB_DIR = SETTINGS.fsdb_path;
var APP_DEPLOY_DIR = SETTINGS.deploy_path;

var api = {
    phonegap: function (parsed) {
        var D = Q.defer();
        compiler.zipApplication(parsed.req.params.applicationName, parsed.req, function (err, data) {
            return err
                ? D.reject(err)
                : D.resolve("Application " + parsed.req.params.applicationName + " was successfully exported!");
        });
        return D.promise;
    }
};

compiler.api = endpoints.json({
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

compiler.createAppBuild = function (req, res) {
    var tenantId = req.session.tenant.id,
        applicationName = req.params.applicationName,
        platform = req.params.platform,
        applicationVersion = req.body.applicationVersion,
        buildNumber = req.body.buildNumber,
        buildDescription = req.body.buildDescription,
        buildReleaseNotes = req.body.buildReleaseNotes,
        appBuildDir = getAppBuildDir(applicationName, applicationVersion, buildNumber, tenantId);

    var query = {
        tenantId: tenantId,
        app:      applicationName
    };
    applications.isActive(query).then(function (active) {
        if (! active) {
            log.error("You can't deploy not active application!!!");
        } else {
            log.info('Deploying application ' + applicationName + '...');

            compiler.deploy(applicationName, appBuildDir, req, function (error, data) {
                log.info('Compiler \'deploy\' completed');

                // register new app build
                app_builds.api.put({
                    application: applicationName,
                    applicationVersion: applicationVersion,
                    buildNumber: buildNumber,
                    platform: platform,
                    buildDescription: buildDescription,
                    buildReleaseNotes: buildReleaseNotes,
                    status: error ? "failed" : "success",
                    tenant: tenantId
                });

                // send response to client
                var dataToSend = {result: "done"};
                if (error) {
                    dataToSend.status = "failed";
                    if (error.compilationMessage) {
                        dataToSend.message = error.compilationMessage;
                    }
                }
                dataToSend = JSON.stringify(dataToSend);
                res.setHeader('Content-Type', 'text/text');
                res.setHeader('Content-Length', dataToSend.length);
                res.end(dataToSend);
            });
        }
    });
};
compiler.registerNewAppBuild = function (req, res) {
    var tenantId = req.session.tenant.id,
        applicationName = req.params.applicationName,
        platform = req.params.platform,
        applicationVersion = req.body.applicationVersion,
        buildNumber = req.body.buildNumber,
        buildDescription = req.body.buildDescription,
        buildReleaseNotes = req.body.buildReleaseNotes,
        error = req.body.error;

    // register new app build
    app_builds.api.put({
        application: applicationName,
        platform: platform,
        applicationVersion: applicationVersion,
        buildNumber: buildNumber,
        buildDescription: buildDescription,
        buildReleaseNotes: buildReleaseNotes,
        status: error && error != "false" ? "failed" : "success",
        tenant: tenantId
    })
    .done();

    // send response to client
    var dataToSend = {result: "done"};
    if (error && error != "false") {
        dataToSend.status = "failed";
        if (error.compilationMessage) {
            dataToSend.message = error.compilationMessage;
        }
    }
    dataToSend = JSON.stringify(dataToSend);
    res.setHeader('Content-Type', 'text/text');
    res.setHeader('Content-Length', dataToSend.length);
    res.end(dataToSend);
};

compiler.removeAppBuild = function (req, res) {
    var tenantId = req.session.tenant.id,
        applicationName = req.params.applicationName,
        platform = req.params.platform,
        applicationVersion = req.body.applicationVersion,
        buildNumber = req.body.buildNumber,
        appBuildDir = getAppBuildDir(applicationName, applicationVersion, buildNumber, tenantId, platform),
        appZipDirName = getAppZipDirName(applicationName, tenantId),
        appZipName = getAppZipName(applicationName, applicationVersion, buildNumber),
        appZipFullPath = appZipDirName + '/' + appZipName;

    app_builds.api.remove({
        application: applicationName,
        platform: platform,
        applicationVersion: applicationVersion,
        buildNumber: buildNumber,
        tenant: tenantId
    }).then(function () {
        deleteFolderRecursive(appBuildDir);
        return Q.resolve();
    }).then(function (error, data) {
        var dataToSend = {result: "done"};
        if (error) {
            dataToSend.status = "failed";
            if (error.compilationMessage) {
                dataToSend.message = error.compilationMessage;
            }
        }

        dataToSend = JSON.stringify(dataToSend);
        res.setHeader('Content-Type', 'text/text');
        res.setHeader('Content-Length', dataToSend.length);
        res.end(dataToSend);
    });
};

compiler.getAppBuildList = function (req, res) {
    app_builds.api.list({
        application: req.params.applicationName,
        platform: req.params.platform,
        tenant: req.session.tenant.id
    }).then(function (app_build_docs) {
        app_build_docs.compiler = SETTINGS.compiler;
        app_build_docs.compiler.serverInfo = SETTINGS.serverinfo;

        var data = JSON.stringify(app_build_docs);
        res.setHeader('Content-Type', 'text/text');
        res.setHeader('Content-Length', data.length);
        res.end(data);
    });
};

compiler.getCompilerSettings = function (req, res) {
    var data = {};
    data.compiler = SETTINGS.compiler;
    data.compiler.serverInfo = SETTINGS.serverinfo;

    var dataAsString = JSON.stringify(data);
    res.setHeader('Content-Type', 'text/text');
    res.setHeader('Content-Length', dataAsString.length);
    res.end(dataAsString);
};

compiler.deployAppBuild = function (req, res) {
    var applicationName = req.params.applicationName,
        platform = req.params.platform,
        applicationVersion = req.body.applicationVersion,
        buildNumber = req.body.buildNumber,
        tenantId = req.session.tenant.id,
        appBuildDir = getAppBuildDir(applicationName, applicationVersion, buildNumber, tenantId),
        appDeployDir = getDeployDir(applicationName, tenantId);

    var sendResponse = function (data) {
        var result = JSON.stringify(data);
        res.setHeader('Content-Type', 'text/text');
        res.setHeader('Content-Length', result.length);
        res.end(result);
    };

    QFS.removeTree(appDeployDir)
        .then(function () {
            return QFS.makeTree(appDeployDir);
        }, function (error) {
            log.error(error);
            return QFS.makeTree(appDeployDir);
        })
        .then(function () {
            QFS.copyTree(appBuildDir, appDeployDir);
        })
        .then(function () {
            return app_builds.api.deploy({
                application: applicationName,
                platform: platform,
                applicationVersion: applicationVersion,
                buildNumber: buildNumber,
                tenant: tenantId
            })
        })
        .then(function () {
            sendResponse({result: "done"});
        })
        .catch(function (error) {
            log.error(error);
            sendResponse({result: "done", status: "failed"});
        })
        .done();
};

compiler.deployAppBuildNew = function (req, res) {
    var applicationName = req.params.applicationName,
        applicationVersion = req.body.applicationVersion,
        buildNumber = req.body.buildNumber,
        tenantId = req.session.tenant.id,
        appBuildDir = getAppBuildDir(applicationName, applicationVersion, buildNumber, tenantId),
        appDeployDir = getDeployDir(applicationName, tenantId);

    var sendResponse = function (data) {
        var result = JSON.stringify(data);
        res.setHeader('Content-Type', 'text/text');
        res.setHeader('Content-Length', result.length);
        res.end(result);
    };

    var buildVersion = req.params.applicationName + '_' + req.body.applicationVersion + '.' + req.body.buildNumber;
    var o = {
        path: path.join(APP_BUILD_DIR, req.session.tenant.id, buildVersion, 'app',  buildVersion + '.zip'),
        dest_path: path.join(APP_DEPLOY_DIR, req.session.tenant.id, req.params.applicationName),
        tenant: req.session.tenant.id,
        app: req.params.applicationName,
        build : req.body.buildNumber,
        type : '',
        folder : 'deploy'
    }

    unzip.decompress(o)
        .then(function(){
            delete o.dest_path;
            o.folder = APP_FSDB_DIR;
            o.type = "application_menus";
            o.path = path.join(APP_BUILD_DIR, req.session.tenant.id, buildVersion, 'application_menus',  buildVersion + '.zip');
            return unzip.decompress(o);
        })
        .then(function(){
            delete o.dest_path;
            o.folder = APP_FSDB_DIR;
            o.type = "application_configuration";
            o.path = path.join(APP_BUILD_DIR, req.session.tenant.id, buildVersion, 'application_configuration',  buildVersion + '.zip');
            return unzip.decompress(o);
        })
        .then(function(){
            delete o.dest_path;
            o.folder = APP_FSDB_DIR;
            o.type = "dataqueries";
            o.path = path.join(APP_BUILD_DIR, req.session.tenant.id, buildVersion, 'dataqueries',  buildVersion + '.zip');
            return unzip.decompress(o);
        })
        .then(function(){
            o.folder = APP_FSDB_DIR;
            o.type = "users";
            o.path = path.join(APP_BUILD_DIR, req.session.tenant.id, buildVersion, 'users',  buildVersion + '.zip');
            return unzip.decompress(o);
        })
        .then(function(){
            o.folder = APP_FSDB_DIR;
            o.type = "roles";
            o.path = path.join(APP_BUILD_DIR, req.session.tenant.id, buildVersion, 'roles',  buildVersion + '.zip');
            return unzip.decompress(o);
        })
        .then(function(){
            o.folder = APP_FSDB_DIR;
            o.type = "metadata";
            o.path = path.join(APP_BUILD_DIR, req.session.tenant.id, buildVersion, 'metadata',  buildVersion + '.zip');
            return unzip.decompress(o);
        })
        .then(function(){
            o.folder = APP_FSDB_DIR;
            o.type = "auth_providers";
            o.path = path.join(APP_BUILD_DIR, req.session.tenant.id, buildVersion, 'auth_providers',  buildVersion + '.zip');
            o.dest_path = path.join(__dirname, '..', o.folder, o.type);
            return unzip.decompress(o);
        })
        .then(function(){
            o.folder = APP_FSDB_DIR;
            o.type = "db_drivers";
            o.path = path.join(APP_BUILD_DIR, req.session.tenant.id, buildVersion, 'db_drivers',  buildVersion + '.zip');
            o.dest_path = path.join(__dirname, '..', o.folder, o.type);
            return unzip.decompress(o);
        })
        .then(function () {
            return app_builds.api.deploy({
                application: applicationName,
                applicationVersion: applicationVersion,
                buildNumber: buildNumber,
                tenant: tenantId
            })
        })
        .then(function(res){
            sendResponse({result: "done"});
        })
        .fail(function(e){
            log.error(e);
            sendResponse({result: "done", status: "failed"});
        });
};

compiler.zipApplication = function (applicationName, req, cb) {
    var tenantId = req.session.tenant.id,
        applicationVersion = req.body.applicationVersion,
        buildNumber = req.body.buildNumber,
        appBuildDir = getAppBuildDir(applicationName, applicationVersion, buildNumber, tenantId),
        appZipDirName = getAppZipDirName(applicationName, tenantId),
        appZipName = getAppZipName(applicationName, applicationVersion, buildNumber);

    applications.get(applicationName, req, function (app_item) {
        var deploy_dir = appBuildDir,
            export_dir = appZipDirName;
        QFS.exists(deploy_dir)
            .then(function (deployDirExists) {
                if (deployDirExists) {
                    QFS.exists(export_dir)
                        .then(function (exportDirExists) {
                            var createZip = function() {
                                var output = fs.createWriteStream(export_dir + '/' + appZipName);
                                var archive = archiver('zip');

                                output.on('close', function () {
                                    console.log(archive.pointer() + ' total bytes');
                                    console.log('archiver has been finalized and the output file descriptor has closed.');

                                    cb();
                                });
                                archive.on('error', function (err) {
                                    throw err;
                                });
                                archive.pipe(output);
                                archive
                                    .directory(deploy_dir, app_item.name)
                                    .finalize();
                            };

                            if (!exportDirExists) {
                                QFS.makeTree(export_dir)
                                    .then(function () {
                                        createZip();
                                    });
                            } else {
                                createZip();
                            }
                        });
                } else {
                    cb('Can\'t find the deployed application.');
                }
            });
    });
};

compiler.downloadAppArchive = function (req, res) {
    var tenantId = req.session.tenant.id,
        applicationName = req.params.applicationName,
        platform = req.params.platform,
        applicationVersion = req.params.applicationVersion,
        buildNumber = req.params.buildNumber,
        appZipDirName = getAppZipDirName(applicationName, tenantId),
        appZipName = getAppZipName(applicationName, applicationVersion, buildNumber);

    applications.get(req.params.applicationName, req, function (app_item) {
        var export_dir = appZipDirName,
            archive_path = export_dir + '/' + appZipName;

        QFS.exists(archive_path)
            .then(function (exists) {
                if (exists) {
                    fs.readFile(archive_path, function (err, data) {
                        if (err) throw err;
                        res.setHeader('Content-Description', 'File Transfer');
                        res.setHeader('Content-Disposition', 'attachment; filename=' + appZipName);
                        res.setHeader('Content-Type', 'application/octet-stream');
                        res.setHeader('Content-Transfer-Encoding', 'binary');
                        res.setHeader('Expires', '0');
                        res.setHeader('Cache-Control', 'must-revalidate');
                        res.setHeader('Pragma', 'public');
                        res.setHeader('Content-Length', data.length);
                        res.end(data);
                    });
                } else {
                    var body = '<span style="color: red;">Can\'t find the application archive.</span>';
                    res.setHeader('Content-Type', 'text/html');
                    res.setHeader('Content-Length', body.length);
                    res.end(body);
                }
            });
    });
};

compiler.deploy = function (appname, appBuildDir, req, callback) {
    applications.get(appname, req, function (app_item) {
        var app_widgets_map = {},
            deploy_dir = appBuildDir,
            platform = app_item.platform;

        QFS.removeTree(deploy_dir)
            .then(function () {
                return QFS.makeTree(deploy_dir);
            }, function (error) {
                log.error(error);
                return QFS.makeTree(deploy_dir);
            })
            .then(function () {
                return Q.all([
                    QFS.makeTree(deploy_dir + '/fonts'),
                    QFS.makeTree(deploy_dir + '/img'),
                    QFS.makeTree(deploy_dir + '/css/lib'),
                    QFS.makeTree(deploy_dir + '/css/vendor'),
                    QFS.makeTree(deploy_dir + '/css/' + platform),
                    QFS.makeTree(deploy_dir + '/js/lib'),
                    QFS.makeTree(deploy_dir + '/js/vendor'),
                    QFS.makeTree(deploy_dir + '/js/commons'),
                    QFS.makeTree(deploy_dir + '/js/' + platform)
                ]);
            }, function (error) {
                log.error(error);
                return Q.all([
                    QFS.makeTree(deploy_dir + '/fonts'),
                    QFS.makeTree(deploy_dir + '/img'),
                    QFS.makeTree(deploy_dir + '/css/lib'),
                    QFS.makeTree(deploy_dir + '/css/vendor'),
                    QFS.makeTree(deploy_dir + '/css/' + platform),
                    QFS.makeTree(deploy_dir + '/js/lib'),
                    QFS.makeTree(deploy_dir + '/js/vendor'),
                    QFS.makeTree(deploy_dir + '/js/commons'),
                    QFS.makeTree(deploy_dir + '/js/' + platform)
                ]);
            })
            .then(function () {
                return Q.all([
                    QFS.copyTree(path.join(__dirname, '..', 'build/fonts'), deploy_dir + '/fonts'),
                    QFS.copyTree(path.join(__dirname, '..', 'build/img'), deploy_dir + '/img'),
                    QFS.copyTree(path.join(__dirname, '..', 'build/css/lib'), deploy_dir + '/css/lib'),
                    QFS.copyTree(path.join(__dirname, '..', 'build/css/vendor'), deploy_dir + '/css/vendor'),
                    QFS.copyTree(path.join(__dirname, '..', 'build/css/' + platform), deploy_dir + '/css/' + platform),
                    QFS.copyTree(path.join(__dirname, '..', 'build/js/lib'), deploy_dir + '/js/lib'),
                    QFS.copyTree(path.join(__dirname, '..', 'build/js/vendor'), deploy_dir + '/js/vendor'),
                    QFS.copyTree(path.join(__dirname, '..', 'build/js/commons'), deploy_dir + '/js/commons'),
                    QFS.copyTree(path.join(__dirname, '..', 'build/js/' + platform), deploy_dir + '/js/' + platform),
                    QFS.copyTree(path.join(__dirname, '..', SETTINGS.templates[app_item.personalization.template].path), deploy_dir + SETTINGS.templates[app_item.personalization.template].relpath)
                ]);
            })
            .then(function () {
                return Q.all([
                    QFS.makeTree(path.join(deploy_dir, 'resources', req.session.tenant.id)),
                    QFS.makeTree(path.join(deploy_dir, 'styles')),
                    QFS.makeTree(path.join(deploy_dir, 'widgets')),
                    QFS.makeTree(path.join(__dirname, '..', 'widgets', req.session.tenant.id))//create folder for widgets in preview
                ]);
            })
            .then(function () {
                var template_name = path.join(__dirname, '..', 'templates/standard_' + platform + '_widget.jade');
                return QFS.read(template_name)
                    .then(function (data) {
                        return applications.getApplicationWidgets(appname, req, platform)
                            .then(function (app_widgets) {
                                resources.getAppResourceItems(app_item.name, app_widgets, req.session.tenant.id, function (arrayOfResourceItems) {
                                    deployAppScriptAndStyles(app_widgets, appname, deploy_dir, platform);

                                    var deploy_dirs = [deploy_dir];
                                    for (var i = 0; i < app_widgets.length; i++) {
                                        if (platform == 'web') {
                                            deployWidget(template_name, data, app_widgets[i], deploy_dirs, req.session.tenant.id);
                                        } else {
                                            deployMobileWidgetScreen(app_item, req, template_name, data, app_widgets[i], arrayOfResourceItems, deploy_dirs);
                                        }
                                        app_widgets_map[app_widgets[i].name] = app_widgets[i].definition;//fill to use later in screen deployment
                                    }

                                    deployResources(appname, app_widgets, deploy_dir, req.session.tenant.id);
                                });
                            });
                    });
            })
            .then(function () {
                queries.getAll(req, function (dataqueries) {
                    var app_services_content = deployServices(dataqueries, appname);
                    QFS.write(path.join(deploy_dir, '/js/' + platform + '/app_services.js'), new Buffer(app_services_content));
                });
                fs.readFile(path.join(__dirname, '..', SETTINGS.templates[app_item.personalization.template].login), 'utf8', function (err, data) {
                    if (err) throw err;

                    var fn = jade.compile(data);
                    var body = fn({
                        'appname':  app_item.name,
                        'apptitle': app_item.title,
                        'tenantid': req.session.tenant.id,
                        'server':   serverAddress
                    });
                    // login page named differently depending on the platform, because PhoneGap asks to name start page index.html
                    if (platform == 'web') {
                        QFS.write(path.join(deploy_dir, 'login.html'), new Buffer(body));
                    } else {
                        QFS.write(path.join(deploy_dir, 'index.html'), new Buffer(body));
                    }

                    resources.getAppResourceItems(app_item.name, app_widgets_map, req.session.tenant.id, function (arrayOfResourceItems) {
                        fs.readFile(path.join(__dirname, '..', SETTINGS.templates[app_item.personalization.template].index), 'utf8', function (err, data_home) {
                            if (err) throw err;

                            if (platform == 'web') {
                                var fn = jade.compile(data_home, {filename: path.join(__dirname, '..', SETTINGS.templates[app_item.personalization.template].index)});
                                var body_home = fn({
                                    'appname': app_item.name,
                                    'apptitle': app_item.title,
                                    'tenantid': req.session.tenant.id,
                                    'resources': arrayOfResourceItems,
                                    'server': serverAddress
                                });
                                QFS.write(path.join(deploy_dir, 'index.html'), new Buffer(body_home));
                            }

                            fs.readFile(path.join(__dirname, '..', 'templates/config.jade'), 'utf8', function (err, data_cfg) {
                                if (err) throw err;

                                var fn_cfg = jade.compile(data_cfg);
                                var body_cfg = fn_cfg({
                                    application: app_item,
                                    server:      serverAddressWithoutPort
                                });
                                QFS.write(path.join(deploy_dir, 'config.xml'), new Buffer(body_cfg));
                                if (platform == 'web') {
                                    screens.getAll(appname, req, function (app_screens) {
                                        var template = (app_item.personalization == null || app_item.personalization.template == null || app_item.personalization.template == '') ? null : app_item.personalization.template;
                                        deployScreen(appname, app_item.directives, app_item.platform, template, app_screens, 0, app_widgets_map, deploy_dir, callback, req);
                                    });
                                } else {
                                    callback();
                                }
                            });
                        });
                    });
                });
            })
            .catch(function (error) {
                log.error(error);
                callback(error);
            })
            .done();
    });
};

function deployWidget(template_name, template_data, wclass, deploy_dirs, tenant_id) {
    try {
        var fn = jade.compile(template_data, {filename: template_name});
        var body = fn({wclass: wclass, jade_compiler: jade, tenantid: tenant_id, appname: wclass.definition.application});

        // create new HTML file for apps run time
        for (var i = 0; i < deploy_dirs.length; i++) {
            QFS.write(path.join(deploy_dirs[i], 'widgets/' + wclass.name + '.html'), new Buffer(body));
        }

        // create 2 files - HTML and JS for widget preview
        QFS.write(path.join(__dirname, '..', 'widgets', tenant_id, wclass.name + '.html'), new Buffer(body));
        QFS.write(path.join(__dirname, '..', 'widgets', tenant_id, wclass.name + '.js'), new Buffer(wclass.definition.src_script));
    } catch (compile_error) {
        log.warn('error compiling widget: ' + wclass.name);
        compile_error.compilationMessage = 'widget ' + wclass.name;
        throw compile_error;
    }
}

function deployMobileWidgetScreen(app_item, req, template_name, template_data, wclass, resource_items, deploy_dirs, update_app_js) {
    try {
        var fn = jade.compile(template_data, {filename: template_name});

        var body = fn({
            wclass:        wclass,
            jade_compiler: jade,
            appname:       app_item.name,
            apptitle:      app_item.title,
            resources:     resource_items,
            tenantid:      req.session.tenant.id,
            server:        serverAddress
        });

        menus.getAll(app_item.name, req, function (menu_items) {
            // find widget to which Home Menu points to and create Home.html from it
            for (var i = 0; i < menu_items.length; i++) {
                if (menu_items[i].name == 'Home' && menu_items[i].action.value == wclass.name) {
                    QFS.write(path.join(deploy_dirs[i], 'Home.html'), new Buffer(body));
                    break;
                }
            }

            // create new HTML file for apps run time
            for (var i = 0; i < deploy_dirs.length; i++) {
                QFS.write(path.join(deploy_dirs[i], wclass.name + '.html'), new Buffer(body));
                if (update_app_js) {//update existing JS file for apps run time, if it's a widget recompiling (not whole app)
                    updateAppJs(deploy_dirs[i], wclass.name, wclass.definition.src_script);
                }
            }
        });

    } catch (compile_error) {
        log.warn('error compiling widget: ' + wclass.name);
        compile_error.compilationMessage = 'widget ' + wclass.name;
        throw compile_error;
    }
}

function deployAppScriptAndStyles(app_widgets, appname, deploy_dir, platform) {
    var js_file_content = '/* Application Scripts */\r\n\r\n',
        app_styles = '',
        app_script = 'var ' + appname + ' = angular.module(\'' + appname + '\', [',
        widgets_script = '',
        widget_templates = '',
        mobile_push_listener = '';

    app_styles += '#mobile-menu {' +
    'position: absolute;' +
    'top: 44px;' +
    'left: 0;' +
    'bottom: 0;' +
    'width: 80%;' +
    'color: #FFF;' +
    'background-color: #223957;' +
    'z-index: 999;' +
    '}' +
    '#mobile-menu.collapsed {' +
    'left: -1000px;' +
    '}' +
    '#mobile-menu ul {' +
    'list-style: none;' +
    'padding-left: 0;' +
    '}' +
    '#mobile-menu ul > li {' +
    'padding: 11px 65px 11px 15px;' +
    'background-image: url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'100%\' height=\'1\'><rect fill=\'#FFFFFF\' x=\'0\' y=\'0\' width=\'100%\' height=\'0.5\'/></svg>");' +
    'background-repeat: no-repeat;' +
    'background-position: 15px 100%;' +
    'border-bottom: 0;' +
    '}' +
    '#mobile-menu ul > li a {' +
    'margin: -11px -65px -11px -15px;' +
    'padding-left: 30px;' +
    'color: #FFF;' +
    '}' +
    '.mobile-menu-shade {' +
    'position: absolute;' +
    'z-index: 998;' +
    'top: 44px;' +
    'width: 100%;' +
    'bottom: 0;' +
    'opacity: 0.75;' +
    'background-color: #000;' +
    '}' +
    '.content {' +
    'top: 44px !important;' +
    '}';

    // Loop over generated_widgets to produce a JS file.
    for (var i = 0; i < app_widgets.length; ++i) {
        app_script += '\'' + app_widgets[i].name + '\'' + ((i < (app_widgets.length - 1)) ? ', ' : '');

        widgets_script += '\r\n'
        + WIDGET_SCRIPT_START.replace('widget_name', app_widgets[i].name)
        + app_widgets[i].definition.src_script
        + '\r\n\r\n';
        app_styles += app_widgets[i].definition.src_styles;

        // used in the dfxOpenDialog() function
        if (platform != 'mobile') {
            widget_templates += "$scope.widget_template_" + app_widgets[i].name + " = 'widgets/" + app_widgets[i].name + ".html';";
        }
    }

    if (platform == 'mobile') {
        mobile_push_listener +=
            "window.addEventListener('push', function(event) {" +
            "   var paramsObj = dfxGetJsonFromUrl();" +
            "   var dfxPrevWidget = paramsObj.dfxPrevWidget;" +
            "   delete paramsObj.dfxPrevWidget;" +

            "   $scope.parameters = paramsObj;" +

            "   if (dfxPrevWidget) {" +
            "       $('#back-nav').attr('href', dfxPrevWidget + '.html');" +
            "       $('#main-menu-opener').toggle();" +
            "       $('#back-nav').toggle();" +
            "   } else {" +
            "       dfxMobileActivateMainMenu();" +
            "   }" +

            "   $compile(angular.element($('.content')))($scope);" +
            "});";
    }

    js_file_content += app_script + ',\'dfx.utils\',\'angularCharts\'])';

    js_file_content += '.run(function($rootScope) { $rootScope.user = $user; });\r\n\r\n';

    js_file_content += appname
        + ".controller('MainController', ['$scope', function($scope) { $scope.global = {}; } ]);\r\n\r\n";

    js_file_content += appname
    + ".controller('ScreenController', ['$scope', '$compile', function($scope, $compile) { " +
    widget_templates + mobile_push_listener +
    (platform == 'web' ? " dfScreenControllerDispatcher($scope);" : '') +
    " } ]);\r\n\r\n";

    js_file_content += appname
    + ".service('messageService', ['$rootScope', function($rootScope) {"
    + "    return {"
    + "        publish: function(name, parameters) {"
    + "            $rootScope.$emit(name, parameters);"
    + "        },"
    + "        subscribe: function(name, listener) {"
    + "            $rootScope.$on(name, listener);"
    + "        }"
    + "    };"
    + "}]);";

    js_file_content += appname + ".directive('bindCompiledHtml', function( $compile, $timeout) {\n\r"
    + "return { template: '<div></div>',scope: {rawHtml: '=bindCompiledHtml'},\n\r"
    + "link: function(scope, elem, attrs) {\n\r"
    + "scope.$watch('rawHtml', function(value) {\n\r"
    + "if (!value) return;\n\r"
    + "var new_elem = $compile(value)(scope.$parent);\n\r"
    + "elem.contents().remove();\n\r"
    + "elem.append(new_elem);\n\r"
    + "});\n\r"
    + "}\n\r"
    + "};\n\r"
    + "});\n\r\n\r";

    js_file_content += widgets_script;

    QFS.write(path.join(deploy_dir, 'js/' + platform + '/app.js'), new Buffer(js_file_content));//js/web/app.js
    QFS.write(path.join(deploy_dir, 'css/' + platform + '/app.css'), new Buffer(app_styles));
}

function deployScreen(appname, directives, platform, template, app_screens, idx, app_widgets_map, deploy_dir, end_callback, req) {
    screens.generate(appname, directives, platform, app_screens[idx].name, template, app_widgets_map, req, function (err, stream) {
        if (err) {
            end_callback(err);
            return;
        }

        QFS.write(path.join(deploy_dir, app_screens[idx].name + '.html'), new Buffer(stream));

        if (idx < (app_screens.length - 1)) {
            idx++;
            deployScreen(appname, directives, platform, template, app_screens, idx, app_widgets_map, deploy_dir, end_callback, req);
        } else {
            end_callback();
        }
    });
}

function deployResources(appname, app_widgets, deploy_dir, tenant_id) {
    var i = 0,
        resourceNames = resources.getResourceNames(app_widgets);

    // deploy current application resources
    QFS.copyTree(path.join(__dirname, '..', 'resources', tenant_id, appname),
        path.join(deploy_dir, 'resources', tenant_id, appname));

    // deploy shared resources
    for (i = 0; i < resourceNames.length; i++) {
        QFS.copyTree(path.join(__dirname, '..', 'resources', tenant_id, resourceNames[i].name),
            path.join(deploy_dir, 'resources', tenant_id, resourceNames[i].name));
    }
}

function deployServices(dataqueries, appname) {
    var i, j, k, is_new, app_services_content = '/* Comprehensive Service Models */\r\n\r\n';
    var app_services_array = new Array();
    for (i = 0; i < dataqueries.length; i++) {
        if (dataqueries[i].service != null && dataqueries[i].service.method != '') {
            is_new = true;
            for (j = 0; j < app_services_array.length; j++) {
                if (dataqueries[i].service.name == app_services_array[j].serviceName) {
                    app_services_array[j].methods.push({
                        "name":      dataqueries[i].service.method,
                        "dataquery": dataqueries[i]
                    });
                    is_new = false;
                    break;
                }
            }
            if (is_new) {
                app_services_array.push({
                    "serviceName": dataqueries[i].service.name,
                    "methods":     [{"name": dataqueries[i].service.method, "dataquery": dataqueries[i]}]
                });
            }
        }
    }
    for (i = 0; i < app_services_array.length; i++) {
        app_services_content += appname +
        ".service('" + app_services_array[i].serviceName + "', function() {\r\n";
        //"\tthis.parameters = new Object();\r\n";
        //for (j=0; j<app_services_array[i].parameters.length; j++) {
        //    app_services_content += "\tthis.parameters." + dataqueries[i].parameters[j].name + " = '';\r\n";
        //}
        for (j = 0; j < app_services_array[i].methods.length; j++) {
            app_services_content += "\tthis." + app_services_array[i].methods[j].name + " = function(params, callback) {\r\n\r\n";

            app_services_content +=
                "\t\tvar dq = new DataQuery('" + app_services_array[i].methods[j].dataquery.name + "');\r\n";

            if (app_services_array[i].methods[j].dataquery.connector == 'http' && app_services_array[i].methods[j].dataquery.settings.typerequest == 'HTTP_GET') {
                app_services_content += "\t\tif (params!=null) {\r\n" +
                "\t\t\tdq.setParameters( params );\r\n" +
                "\t\t}\r\n" +
                "\t\tdq.execute().\r\n" +
                "\t\t\tdone( function() {\r\n" +
                "\t\t\t\tcallback(dq.getData());\r\n" +
                "\t\t\t});\r\n" +
                "\t};\r\n\r\n";
            } else {
                app_services_content += "\t\tif (params!=null) {\r\n" +
                "\t\t\tdq.setReqBody( params );\r\n" +
                "\t\t}\r\n" +
                "\t\tdq.executePost().\r\n" +
                "\t\t\tdone( function() {\r\n" +
                "\t\t\t\tcallback(dq.getData());\r\n" +
                "\t\t\t});\r\n" +
                "\t};\r\n\r\n";
            }

            app_services_content += "\tthis." + app_services_array[i].methods[j].name + "Parameters = function() {\r\n" +
            "\t\tvar parameters = new Object();\r\n";
            for (k = 0; k < app_services_array[i].methods[j].dataquery.parameters.length; k++) {
                app_services_content += "\t\tthis.parameters." + app_services_array[i].methods[j].dataquery.parameters[k].name + " = '';\r\n";
            }
            app_services_content += "\t\treturn parameters;\r\n" +
            "\t}\r\n\r\n";

            app_services_content += "\tthis." + app_services_array[i].methods[j].name + "MetaData = function() {\r\n" +
            "\t\tvar metadata = " + app_services_array[i].methods[j].dataquery.metadata + ";\r\n" +
            "\t\treturn metadata;\r\n" +
            "\t}\r\n\r\n";
        }
        app_services_content += "});\r\n\r\n";
    }
    return app_services_content;
}

function getAppBuildDir(applicationName, applicationVersion, buildNumber, tenantId, platform) {
    var applicationDir = applicationName + '_' + applicationVersion + '.' + buildNumber;
    return path.join(APP_BUILD_DIR, tenantId, platform, applicationDir);
}

function getDeployDir(applicationName, tenantId, platform) {
    return path.join(APP_DEPLOY_DIR, tenantId, platform, applicationName);
}

function getAppZipDirName(applicationName, tenantId) {
    return path.join(__dirname, '..', 'phonegap-export', tenantId, applicationName);
}

function getAppZipName(applicationName, applicationVersion, buildNumber) {
    return applicationName + '_' + applicationVersion + '.' + buildNumber + '.zip';
}

var deleteFolderRecursive = function(path) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

module.exports = compiler;
