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
var fsUtil = require('mkdirp');
var jade = require('jade');
var uuid = require('node-uuid');

var Q = require('q');
Q.longStackSupport = true;

var QFS = require('q-io/fs');
var formidable = require('formidable');
var FormData = require('form-data');

// Declaration of DFX modules
var SETTINGS = require('./dfx_settings');
var log = new (require('./utils/log')).Instance({label: "DFX_Deploy"});
var tmpDirTool = require('./utils/tempdir'),
    unzip = require('./utils/unzip.js');
var RGXP_HAS_LEAD_POINT = /^\./,
    util = require('util'),
    tools = require('./fileStorage/idbased')._tools,
    endpoints = require('./utils/endpoints'),
    zip = require('./utils/zip'),
    phoneGap;

if ( SETTINGS.studio ) {
    phoneGap = require('./dfx_phonegap_api');
    MDBW     = require('./mdbw')(SETTINGS.mdbw_options);
}

//var MDBW = require('./mdbw')(SETTINGS.mdbw_options);
var DB_TENANTS_PREFIX = SETTINGS.databases_tenants_name_prefix;


if ( SETTINGS.studio ) {
    var app_builds = require('./dfx_app_builds');
}

var APP_BUILD_DIR = SETTINGS.app_build_path;
var APP_FSDB_DIR = SETTINGS.fsdb_path;
var DPLY_DIR = SETTINGS.deploy_path;
var DB_TENANTS_PREFIX = SETTINGS.databases_tenants_name_prefix,
    DEP_SERVER_URL = 'http://' + SETTINGS.deployment_server_host + ':' +
        SETTINGS.deployment_server_port;

var storage;

var dep = {},
    dev = {};

exports.init = function( o ) {
    storage = o.storage;
    delete exports.init;
};

var rm_r = (function(){

    var cmd = require('child_process').exec;

    return function rm_r ( p ) {
        log.info('REMOVING ' + p);
        var D = Q.defer();

        cmd('rm -r ' + p, function(error, stdout, stderr){

            var _error = error || stderr;

            _error ? D.reject(_error) : D.resolve();
        })

        return D.promise;
    }
})();

if ( !SETTINGS.studio ) {
    var list = {};
    var isListReady = tools.lsStat(DPLY_DIR).then(function(tenants){
        var _tenants = [];
        tenants.forEach(function(stat){
            if ( !stat.isDirectory() || RGXP_HAS_LEAD_POINT.test(stat.name) ) return;
            var tenant = stat.name;
            list[tenant] = {};

            _tenants.push(tools.lsStat(path.join(DPLY_DIR, tenant))
            .then(function(apps){
                var _apps = [];
                apps.forEach(function(stat){
                    if ( !stat.isDirectory() || RGXP_HAS_LEAD_POINT.test(stat.name) ) return;
                    var app = stat.name;
                    list[tenant][app] = {};
                    _apps.push(tools.lsStat(path.join(DPLY_DIR, tenant, app))
                    .then(function(builds){
                        builds.forEach(function(stat){
                            if ( !stat.isDirectory() || RGXP_HAS_LEAD_POINT.test(stat.name) ) return;
                            var build = stat.name;
                            list[tenant][app][build] = true;
                        });
                    }));
                });
                return Q.all(_apps);
            }));
        });
        return Q.all(_tenants);
    })
    .fail(function(error){
        if ( error.code !== 'ENOENT' || error.path !== DPLY_DIR ) {
            log.error(error);
        } else {
            log.warn('no deploy dir ' + DPLY_DIR);
        }
        return Q.resolve({});
    })

    isListReady
    .then(function(){
        var _list = Object.keys(list).length ? list : 'EMPTY';
        log.dbg('builds list : ', _list)
    })
    .done();
}

dev.send = function (req, res) {
    var applicationName = req.body.applicationName,
        applicationVersion = req.body.applicationVersion,
        buildNumber = req.body.buildNumber,
        tenantId = req.body.tenantId,
        platform = req.body.platform,
        buildFolder = applicationName + '_' + applicationVersion + '.' + buildNumber,
        deploymentVersion = req.body.deploymentVersion,
        buildFile = buildFolder + '.zip';

    var sendResponse = function (data) {
        var result = JSON.stringify(data);
        res.setHeader('Content-Type', 'text/text');
        res.setHeader('Content-Length', result.length);
        res.end(result);
    };

    sendFile({
        deploymentUrl: DEP_SERVER_URL + '/deploys',
        srcFolderPath: path.join(APP_BUILD_DIR, tenantId, platform, buildFolder),
        srcFilePath: path.join(APP_BUILD_DIR, tenantId, platform, buildFolder, buildFile),
        buildFolder: buildFolder,
        platform: platform,
        tenantId: tenantId,
        applicationName: applicationName,
        deploymentVersion: deploymentVersion,
        buildNumber: buildNumber
    })
        .then(function (res) {
            return app_builds.api.deploy({
                application: applicationName,
                applicationVersion: applicationVersion,
                buildNumber: buildNumber,
                platform: platform,
                deploymentVersion: deploymentVersion.name,
                tenant: tenantId
            })
        })
        .then(function(){
                if ( platform=='mobile') {
                    var appDir   =  path.join(APP_BUILD_DIR, tenantId, platform, buildFolder, buildFile);
                    var destanationPath =  path.join(SETTINGS.tempDir,'appFiles');
                    return unzip.decompress({
                        path      : appDir,
                        dest_path : destanationPath
                    }).then(function(){
                        var o = {
                            folderPath: destanationPath + '/app',
                            fileName: 'app.zip',
                            outputPath: path.join(SETTINGS.tempDir,'app.zip')
                        }
                        return zip.compress(o).then(function () {
                            var o = {
                                title: applicationName,
                                version: buildNumber,
                                create_method: "file",
                                filePath: path.join(SETTINGS.tempDir,'app.zip'),
                                req: {"session": {"tenant": {"id": tenantId}}}
                            }
                            return phoneGap.createApp(o).then(function (response) {
                                try {
                                    response = JSON.parse(response);
                                } catch (e) {
                                    log.warn("Can't parse JSON from Phone Gap API");
                                }
                                if (response.id) {
                                    return MDBW.update(DB_TENANTS_PREFIX + tenantId, 'applications', {name:applicationName}, {$set : {"phonegap.applicationId" : response.id}}).then(function(){
                                        return QFS.remove(path.join(SETTINGS.tempDir,'app.zip')).then(function(){
                                            return rm_r(path.join(SETTINGS.tempDir,'appFiles'));
                                        })
                                    });
                                }

                            });
                        });
                    })
                } else {
                    return Q.resolve();
                }
        })
        .then(function(){
            sendResponse({result: "done"});
        })
        .fail(function(e){
            log.error(e);
            sendResponse({result: "done", status: "failed"});
        });
};

var sendFile = function(o) {
    var D = Q.defer();
        fs.readdir(o.srcFolderPath, function (err, files) {
            if (files && files.length > 0) {
                var form = new FormData();

                form.append('file', fs.createReadStream(o.srcFilePath));
                form.append('tenantId', o.tenantId);
                form.append('applicationName', o.applicationName);
                form.append('buildFolder', o.buildFolder);
                form.append('buildNumber', o.buildNumber);
                form.append('deploymentVersion', JSON.stringify(o.deploymentVersion));

                form.submit(o.deploymentUrl, function (err, res) {

                    // TODO the error handling
                    var error = err ||
                        (
                        res.statusCode !== 200 &&
                        'server answered with ' + res.statusCode +
                        ' HTTP status code.'
                        );

                    error
                        ? D.reject(error)
                        : D.resolve();
                });
            } else {
                D.resolve();
            }
        });
    return D.promise;
};

var authConf = require(SETTINGS.auth_conf_path),
    authRequest = require('./authRequest').getRequestInstance({
        schema : 'oAuthSimpleSigned',
        oauth_signature_method : 'HMAC-SHA1',
        oauth_version : '1.0',
        credentials : {
            consumer_key    : authConf.externalGate.consumer_key,
            consumer_secret : authConf.externalGate.consumer_secret
        }
    });

dev.delete = endpoints.json({
    log    : log,
    parser : function ( req ) {
        return {
            tenant : req.user.tenantid,
            app    : req.params.app,
            build  : req.params.build
        }
    },
    action : function( o ){
        return authRequest.delete({
            url : [DEP_SERVER_URL, 'deploys', o.tenant, o.app, o.build].join('/')
        })
        .then(function(response){

            if ( response.status === 200 ) {
                return;
            } else if ( response.status === 401 ) {
                return Error('dep server responsed 401');
            } else {
                return Error('dep server sent unsupported status code ' + response.status);
            }
        });
    }
});

dep.delete = function(req, res){

    var tenant = req.params.tenant,
        app    = req.params.app,
        build  = req.params.build;

    log.dbg(util.format(
        'deleting deploy for tenant: %s, app: %s, build: %s', tenant, app, build
    ));

    (function(){
        if ( list[tenant] && list[tenant][app] && list[tenant][app][build] ) {
            if ( Object.keys(list[tenant][app]).length === 1 ) {
                return QFS.removeTree(path.join(DPLY_DIR, tenant, app))
                .then(function(){ delete list[tenant][app] })
            } else {
                return QFS.removeTree(path.join(DPLY_DIR, tenant, app, build))
                .then(function(){ delete list[tenant][app][build] })
            }
        } else {
            return Q.resolve();
        }
    })()
    .then(function(){ res.end() })
    .fail(function(error){
        log.error(error)
        res.status(500).end();
    })
};

dev.list = endpoints.json({
    log : log,
    parser : function ( req ) { return { tenant : req.user.tenantid } },
    action : function( o ){
        return authRequest.get({
            url : DEP_SERVER_URL + '/deploys/' + o.tenant
        })
        .then(function(response){
            if ( response.status === 200 ) {
                return parseResponse(response.body.toString('utf-8'));
            } else if ( response.status === 401 ) {
                return Error('dep server responsed 401');
            } else {
                return Error('dep server sent unsupported status code');
            }
        }).fail(function(err){
                log.warn('deployment server doesn\'t respond');
            })
    }
});

function parseResponse ( _data ) {
    var data;

    try { data = JSON.parse(_data); }
    catch (error) {
        log.dbg('DATA TO PARSE : ', _data);
        return error;
    }

    return data;
}

dep.list = function(req, res){
    Q.when(isListReady, function(){
        res.json(list[req.params.tenant] || {});
    })
    .done();
};

dep.upload = function(req, res){

    return tmpDirTool.exec(function(wrkDir){
        var form = new formidable.IncomingForm(),
            D = Q.defer();

        form.uploadDir      = wrkDir;
        form.keepExtensions = true;

        form.parse(req, function(err, fields, files) {
            unpack({ zipPath: files.file.path, env: fields.deploymentVersion})
            .then(function () {
                res.send("OK");
                D.resolve();
            })
            .fail(function (error) {
                log.error(error);
                res.status(400).send(error);
                D.reject(error);
            });
        });

        return D.promise;
    });
};

dep.allowGuestSession = function(req, res){
    var tenantid = req.params.tenantId;
    var application = req.params.appname;
    var login = "guest";
    storage.get(SETTINGS.databases_tenants_name_prefix + tenantid, 'users', {
        login       : login,
        application : application
    })
        .then(function(user){
            if (user.length) {
                res.send(true);
            } else {
                res.send(false);
            }
        })
}

function getManifest ( wrkDir ) {
    var manifest,
        errors = [];

    try { manifest = require(path.join(wrkDir, 'manifest.json')) }
    catch (error) { return new Error('no manifest.json was found') }

    manifest.tenantId || errors.push('tenantId');
    manifest.appName  || errors.push('appName');
    manifest.build    || errors.push('build');

    if ( errors.length ) return new Error(
        'wrong format of app (required fields are absent): ' +
        JSON.stringify(errors)
    );

    return manifest;
}

function unpack ( o ) {

    log.info('trying to deploy: ' + o.zipPath);

    var clTmpDir,
        appDir,
        manifest;

    return tmpDirTool.exec(function(wrkDir){
        return unzip.decompress({
            path      : o.zipPath,
            dest_path : wrkDir
        })
        .then(function () {
            manifest = getManifest(wrkDir);

            if ( manifest instanceof Error ) return Q.reject(manifest);

            log.info( 'deploying : ' + JSON.stringify(manifest) );

            clTmpDir = path.join(wrkDir, DB_TENANTS_PREFIX + manifest.tenantId);
            appDir   = path.join(DPLY_DIR, manifest.tenantId, manifest.appName, manifest.platform, manifest.build);

            // Q.allSettled means here -- in any case after QFS.removeTree is done
            return Q.allSettled([
                QFS.removeTree(clTmpDir),
                QFS.removeTree(appDir)
            ])
        })
        .then(function () {
            return Q.all([
                QFS.makeTree(appDir)
                    .then(function () {
                        return QFS.move(path.join(wrkDir, 'app'), appDir);
                    })
                    .then(function(){
                        // Add Env variable file
                        try {
                            var env = JSON.parse(o.env);
                            var filePath = path.join(appDir, env.name + '.env');
                            return QFS.write(filePath, env.data);
                        } catch (err) {
                            log.error("Can't parse ENV JSON" );
                            return Q.resolve();
                        }
                    }),
                QFS.makeTree(clTmpDir)
                .then(function(){
                    return Q.all([
                        QFS.move(
                            path.join(wrkDir, 'application_configuration'),
                            path.join(clTmpDir, 'application_configuration')
                        ),
                        QFS.move(
                            path.join(wrkDir, 'dataqueries'),
                            path.join(clTmpDir, 'dataqueries')
                        ),
                        QFS.move(
                            path.join(wrkDir, 'metadata'),
                            path.join(clTmpDir, 'metadata')
                        ),
                        QFS.move(
                            path.join(wrkDir, 'roles'),
                            path.join(clTmpDir, 'roles')
                        ),
                        QFS.move(
                            path.join(wrkDir, 'users'),
                            path.join(clTmpDir, 'users')
                        ),
                        QFS.move(
                            path.join(wrkDir, 'gc_templates'),
                            path.join(clTmpDir, 'gc_templates')
                        ),
                        QFS.move(
                            path.join(wrkDir, 'applications'),
                            path.join(clTmpDir, 'applications')
                        )
                    ]);
                })
            ])
        })
        .then(function(){
            const
                dbName = DB_TENANTS_PREFIX + manifest.tenantId,
                dbFltr = { application: manifest.appName };

            return Q.all([
                storage.rm('auth_providers', manifest.tenantId,           dbFltr),
                storage.rm('db_drivers',     manifest.tenantId,           dbFltr),
                storage.rm(dbName,           'application_configuration', dbFltr),
                storage.rm(dbName,           'dataqueries',               dbFltr),
                storage.rm(dbName,           'metadata',                  dbFltr),
                storage.rm(dbName,           'roles',                     dbFltr),
                storage.rm(dbName,           'users',                     dbFltr),
                storage.rm(dbName,           'gc_templates',              dbFltr)
            ]);
        })
        .then(function () {
            return updateDB(wrkDir);
        })
        .then(function () {
            return dep.onUpdate();
        })
        .then(function () { return manifest })
    })
    .then(function (m) { // m === manifest
        return Q.when(isListReady, function(){
            list[m.tenantId] = list[m.tenantId] || {};
            list[m.tenantId][m.appName] = list[m.tenantId][m.appName] || {};
            list[m.tenantId][m.appName][m.build] = true;
            log.ok('DEPLOYED ', m);
        });
    })
};

function updateDB ( _path ) {
    return tools.lsStat(_path)
    .then(function(list){

        var tasks = [];

        list.forEach(function(stat){
            if (!stat.isDirectory() || RGXP_HAS_LEAD_POINT.test(stat.name)) return;

            var dbName = stat.name;

            tasks.push(

                tools.lsStat(path.join(_path, dbName))
                .then(function(list){

                    var tasks2 = [];

                    list.forEach(function(stat){
                        if (!stat.isDirectory() || RGXP_HAS_LEAD_POINT.test(stat.name)) return;

                        var clName = stat.name;

                        tasks2.push(tools.lsStat(path.join(_path, dbName, clName))
                        .then(function(list){

                            var tasks3 = [];

                            list.forEach(function(stat){
                                if ( !stat.isFile() ) return;

                                var docName = stat.name;

                                tasks3.push(
                                    QFS.read(path.join(_path, dbName, clName, docName))
                                    .then(function(buff){
                                        return storage.put(dbName, clName, JSON.parse( buff.toString('utf8') ));
                                    })
                                );
                            });

                            return Q.all(tasks3);

                        }));
                    });

                    return Q.all(tasks2);
                })
            );
        });

        return Q.all(tasks);
    })
};

function deployOnStart ( p ) {

    log.info('trying to deploy apps on start...');

    // TODO -- no path.isAbsolute in this node version?
    //if ( !path.isAbsolute(p) ) throw(log.error(
    //    'path to zipped apps to deploy at start moment must be an absolute, ' +
    //    'but got "' + p + '"'
    //));

    return tools.lsStat(p).then(function(list){
        return Q.all([list.map(function(stat){
            if ( stat.isFile() ) {
                return unpack({zipPath : path.join(p, stat.name)});
            }
        })]);
    });
}

dep.onUpdate = function(){};
dep.deployOnStart = deployOnStart;

exports.dev = dev;
exports.dep = dep;
exports.unpack = unpack;
