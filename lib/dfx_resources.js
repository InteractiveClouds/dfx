/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

// Declaration of main modules
var Q          = require('q');
var QFS        = require('q-io/fs');
var path       = require('path');
var formidable = require('formidable');
var SETTINGS   = require('./dfx_settings');

if ( SETTINGS.studio ) {
    var screens = require('./dfx_screens');
    var widgets = require('./dfx_widgets');
    var util    = require('./auth/utils');
}

var endpoints  = require('./utils/endpoints');
var log        = new (require('./utils/log')).Instance({label: 'RESOURCES'});
var MDBW;
var fs         = require('graceful-fs');
var _          = require('underscore');
var mime       = require('mime');
var uuid       = require('node-uuid');

var DB_TENANTS_PREFIX       = SETTINGS.databases_tenants_name_prefix,
    DB_SORT_ASC             = 1,
    DB_SORT_DESC            = -1,
    sharedCatalogName       = SETTINGS.sharedCatalogName,
    APP_RUN_TIME_PATH       = 'resources',
    RESOURCES_DEV_PATH      = SETTINGS.resources_development_path,
    APP_DEPLOY_DIR          = SETTINGS.deploy_path,
    SHARED_RESOURCES_FOLDER = '_shared',
    RESOURCES_COLLECTION    = 'resources';

var api = {};

api.init = function( o ) {
    MDBW = o.storage;

    delete api.init;
};

api.upload = function (req, res) {
    var form              = new formidable.IncomingForm(),
        files             = [],
        applicationDbName = getAppDbName(req.params.applicationName),
        resource_path     = applicationDbName ?
            path.join(RESOURCES_DEV_PATH, req.session.tenant.id, applicationDbName, req.params.resource_name) :
            path.join(RESOURCES_DEV_PATH, req.session.tenant.id, SHARED_RESOURCES_FOLDER, req.params.resource_name);

    QFS.makeTree(resource_path)
        .then(function () {
            // Formidable uploads to operating systems tmp dir by default, so, set upload directory
            form.uploadDir      = resource_path;
            form.keepExtensions = true;//keep file extension

            form.on('file', function (field, file) {
                files.push(file);
            });
            form.parse(req, function (err) {
                // Formidable changes the name of the uploaded file, so, rename the file to its original name
                renameUploadedFiles(resource_path, files);
                res.json({"message": "File(s) uploaded"});
            });
        })
        .fail(function (error) {
            console.log(error);
        });
};

api.simulate_upload = function (req, res) {
    var form              = new formidable.IncomingForm(),
        files             = [],
        applicationDbName = getAppDbName(req.params.applicationName),
        resource_path     = applicationDbName ?
            path.join(RESOURCES_DEV_PATH, req.session.tenant.id, applicationDbName, req.params.resource_name) :
            path.join(RESOURCES_DEV_PATH, req.session.tenant.id, SHARED_RESOURCES_FOLDER, req.params.resource_name);

    QFS.makeTree(resource_path)
        .then(function () {
            // Formidable uploads to operating systems tmp dir by default, so, set upload directory
            form.uploadDir      = resource_path;
            form.keepExtensions = true;//keep file extension

            form.on('file', function (field, file) {
                files.push(file);
            });
            form.parse(req, function (err) {
                // Formidable changes the name of the uploaded file, so, rename the file to its original name
                renameUploadedFiles(resource_path, files);
                files.forEach(function(file){
                    var o = {
                        "file" : file.name,
                        "type" : file.type,
                        "size" : file.size,
                        "name" : req.params.resource_name,
                        "tenant" : req.session.tenant.id,
                        "application" : req.params.applicationName
                    }
                    api.simulate_put(o);
                });
                res.json({"message": "File(s) uploaded"});
            });
        })
        .fail(function (error) {
            console.log(error);
        });
};

api.simulate_put = function(p) {
    var applicationDbName = getAppDbName(p.application);
    return MDBW.getOne(DB_TENANTS_PREFIX + p.tenant, RESOURCES_COLLECTION, { name : p.name, application : applicationDbName } )
        .then(function(res){
            res.items.forEach(function (r, index) {
                if (r.path == p.file) {
                    res.items.splice(index, 1);
                }
            });
            res.items.push({
                "path": p.file,
                "type": p.type,
                "size": p.size,
                "is_uploaded": false
            });
            return MDBW.update(DB_TENANTS_PREFIX + p.tenant, RESOURCES_COLLECTION, {
                    name: p.name,
                    application: applicationDbName
                },
                {
                    $set: {
                        application: applicationDbName,
                        items: res.items,
                        versioning: {
                            "status": "added",
                            "user": p.user,
                            "last_action": (new Date() / 1000).toFixed()
                        }
                    }
                },
                {upsert: true}
            );
        });
}

var renameUploadedFiles = function (resource_path, files) {
    for (var i = 0; i < files.length; i++) {
        var fileFullPath           = getFileFullPath(resource_path, files[i].name);
        var fileNameWithoutFolders = getOnlyFileName(files[i].name);
        renameFile(files[i], fileFullPath, fileNameWithoutFolders);
    }
};

var getFileFullPath = function (resource_path, file_name) {
    var subFolders = '';
    if (file_name.indexOf('/') > 0) {
        subFolders = file_name.substring(0, file_name.lastIndexOf('/'));
    }
    return path.join(resource_path, subFolders);
};

var getOnlyFileName = function (file_name) {
    var fileNameWithoutFolders = file_name;
    if (file_name.indexOf('/') > 0) {
        fileNameWithoutFolders = file_name.substring(file_name.lastIndexOf('/') + 1);
    }
    return fileNameWithoutFolders;
};

var renameFile = function (file, fileFullPath, fileName) {
    QFS.makeTree(fileFullPath)
        .then(function () {
            return QFS.rename(file.path, path.join(fileFullPath, fileName));
        })
        .fail(function (error) {
            console.log(error);
        });
};

var removeFile = function(o) {
    var filePath     = o.application ?
        path.join(RESOURCES_DEV_PATH, o.tenant, o.application, o.name, o.file) :
        path.join(RESOURCES_DEV_PATH, o.tenant, SHARED_RESOURCES_FOLDER, o.name, o.file);
    return QFS.remove(filePath);
}


api.put = function (p) {
    var applicationDbName = getAppDbName(p.application);
    return MDBW.getOne(DB_TENANTS_PREFIX + p.tenant, RESOURCES_COLLECTION, { name : p.name, application : applicationDbName } )
        .then(function(res){
            return MDBW.exists(DB_TENANTS_PREFIX + p.tenant, RESOURCES_COLLECTION, { name : p.name, application : applicationDbName } )
                .then(function(exists){
                    var status = "added";
                    if (p.pull) {
                        status = "committed";
                    } else if ((res) && (res.versioning)
                        && ((res.versioning.status === 'committed')
                        || (res.versioning.status === 'modified'))) {
                        status = "modified";
                    }
                    var dbFiles = [];
                    var actualFiles = [];

                    if ((res) && (res.items)) {
                        actualFiles = res.items.map(function (i) {
                            return i.path;
                        });
                    }
                    if ((p) && (p.items)) {
                        dbFiles = p.items.map(function (i) {
                            return i.path;
                        });
                    }

                    var diff = _.difference(actualFiles, dbFiles);

                    return Q.all(diff.map(function(file){
                        var obj = {
                            tenant : p.tenant,
                            application : applicationDbName,
                            file : file,
                            name : p.name

                        }
                        return removeFile(obj);
                    })).then(function(){
                        if (p.items) {
                            return MDBW.update(DB_TENANTS_PREFIX + p.tenant, RESOURCES_COLLECTION, {
                                    name: p.name,
                                    application: applicationDbName
                                },
                                {
                                    $set: {
                                        application: applicationDbName,
                                        items: p.items,
                                        versioning: {
                                            "status": status,
                                            "user": p.user,
                                            "last_action": (new Date() / 1000).toFixed()
                                        }
                                    }
                                },
                                {upsert: true}
                            );
                        } else {
                            return MDBW.rm(DB_TENANTS_PREFIX + p.tenant, RESOURCES_COLLECTION, {
                                name: p.name,
                                application: applicationDbName
                            });
                        }
                    });
                });
        });
};

api.get = function (p) {
    var error             = ( !p.name && 'need resource name' ) || false,
        applicationDbName = getAppDbName(p.application);

    return error
        ? Q.reject(new Error(error))
        : MDBW.get(DB_TENANTS_PREFIX + p.tenant, RESOURCES_COLLECTION, {name: p.name, application: applicationDbName})
        .then(function (data) {
            return (!data.length) ? undefined : data;
        });
};

api.list = function (p) {
    var applicationDbName = getAppDbName(p.applicationName),
        filter            = {application: applicationDbName};
    if (p.include_commons && applicationDbName) {
        filter = {$or: [{application: applicationDbName}, {application: ''}]};
    }

    return MDBW.get(DB_TENANTS_PREFIX + p.tenant, RESOURCES_COLLECTION, filter, {name: DB_SORT_ASC})
        .then(function (docs) {
            return !docs
                ? undefined
                : docs.map(function (e) {
                return {
                    'name':            e.name,
                    'description':     e.description,
                    'application':     e.application,
                    'items':           e.items,
                    'studio_res_path': getDeployedResourcePath({
                        tenantid:    p.tenant,
                        application: e.application
                    }) + e.name
                };
            });
        });
};

api.remove = function (p) {
    var error             = ( !p.name && 'need resource name' ) || false,
        applicationDbName = getAppDbName(p.application);

    return error
        ? Q.reject(new Error(error))
        : MDBW.get(DB_TENANTS_PREFIX + p.tenant, RESOURCES_COLLECTION, {
        name:        p.name,
        application: applicationDbName
    }).then(function (result) {

        QFS.removeTree(path.join(RESOURCES_DEV_PATH, p.tenant + '/' + result[0].name));
        MDBW.rm(DB_TENANTS_PREFIX + p.tenant, RESOURCES_COLLECTION, {name: p.name, application: applicationDbName});

    });
};

api.addImageFromModel = function() {
    var form              = new formidable.IncomingForm(),
        applicationDbName = getAppDbName(req.params.applicationName),
        resource_path     = applicationDbName ?
            path.join(RESOURCES_DEV_PATH, req.session.tenant.id, applicationDbName, req.params.resource_name) :
            path.join(RESOURCES_DEV_PATH, req.session.tenant.id, SHARED_RESOURCES_FOLDER, req.params.resource_name);

    QFS.makeTree(resource_path)
        .then(function () {
            // Formidable uploads to operating systems tmp dir by default, so, set upload directory
            form.uploadDir      = resource_path;
            form.keepExtensions = true; //keep file extension

            form.on('field', function (name, value) {
                if (name=='') {
                }
            });
            form.parse(req, function (err, fields, files) {
                // Formidable changes the name of the uploaded file, so, rename the file to its original name
                res.json({"message": "Image uploaded"});
            });
        })
        .fail(function (error) {
            console.log(error);
        });
};

/*
 * Used to preview only one widget.
 */
api.getWidgetResourceItems = function (widget, tenant_id, callback) {
    var filter = (widget.application) ? {
        "tenant":          tenant_id,
        "applicationName": widget.application,
        "include_commons": true
    }
        : {"tenant": tenant_id};

    this.list(filter)
        .then(function (tenant_resources) {
            var arrayOfResourceItems = [];

            if (widget.src && widget.wtype != 'jade') {
                tenant_resources     = addDeployedResourcePathToItems(tenant_resources, tenant_id, true);
                arrayOfResourceItems     = getOnlyResourceItems(tenant_resources);
            }
            callback(arrayOfResourceItems);
        });
};

/*
 * Used to build and deploy application.
 */
api.getAppResourceItemsAsPromise = function (app_name, app_widgets_map, tenant_id) {
    return this.list({"tenant": tenant_id, "applicationName": app_name, "include_commons": true})
        .then(function (tenant_resources) {
            if (!Array.isArray(app_widgets_map)) {
                app_widgets_map = Object.keys(app_widgets_map).map(function (key) {
                    return app_widgets_map[key];
                });
            }

            tenant_resources = addDeployedResourcePathToItems(tenant_resources);
            var arrayOfResourceItems = getOnlyResourceItems(tenant_resources);

            // add unique _id field to every resource - need for compiler
            arrayOfResourceItems.forEach(function(resourceItem) {
                resourceItem._id = uuid.v4();
            });

            return arrayOfResourceItems;
        });
};

var addDeployedResourcePathToItems = function (tenant_resources, tenant_id, widget_preview) {
    for (var i = 0; i < tenant_resources.length; i++) {
        if (tenant_resources[i].items) {
            for (var j = 0; j < tenant_resources[i].items.length; j++) {
                var deployedResourcePathParams = {
                    "tenantid":    tenant_id,
                    "application": tenant_resources[i].application
                    },
                    deployedResourcePath = widget_preview
                        ? getDeployedResourcePathForWidgetPreview(deployedResourcePathParams)
                        : getDeployedResourcePath(deployedResourcePathParams);

                tenant_resources[i].items[j].path = deployedResourcePath
                    + tenant_resources[i].name + '/'
                    + tenant_resources[i].items[j].path;
            }
        }
    }
    return tenant_resources;
};

var getDeployedResourcePath = function (p) {
    if (p.tenantid) {
        return 'resources/' + p.tenantid + '/' + (p.application ? p.application : SHARED_RESOURCES_FOLDER) + '/';
    } else {
        return APP_RUN_TIME_PATH + '/' + (p.application ? p.application : SHARED_RESOURCES_FOLDER) + '/';
    }
};

var getDeployedResourcePathForWidgetPreview = function (p) {
    return 'resources/development/' + p.tenantid + '/' + (p.application ? p.application : SHARED_RESOURCES_FOLDER) + '/';
};

var getOnlyResourceItems = function (resources_array) {
    var resource_items = [];

    for (var i = 0; i < resources_array.length; i++) {
        if (resources_array[i].items) {
            resource_items = resource_items.concat(resources_array[i].items);
        }
    }
    return resource_items;
};

api.getTile = function (req, res) {
    setTimeout(function(){
        getImage(req, function (err, img, mimeType) {

            if ( err || !img ) return redirectToStandardTile(res);

            res.contentType(mimeType);
            res.end(img, 'binary');
        });
    }, 2000);
};

function redirectToStandardTile(res) {
    res.redirect('/studio/images/no_image_available.png');
}

function getImage(req, callback) {
    var filename = (req.params.applicationName ?
                path.join(RESOURCES_DEV_PATH, req.session.tenant.id, req.params.applicationName, req.params.resource_name) :
                path.join(RESOURCES_DEV_PATH, req.session.tenant.id, SHARED_RESOURCES_FOLDER, req.params.resource_name)
        ) + '/' + req.params.filename;
    fs.readFile(filename, function (err, data) {
        if (!err) {
            var mimeType = mime.lookup(filename);
            callback(null, data, mimeType);
        } else {
            callback(err, null);
        }
    });
}

//Get content of resource file
api.getResourceContent = function(o) {
    return MDBW.getOne(DB_TENANTS_PREFIX + o.tenant, RESOURCES_COLLECTION, {
        application : sharedCatalogName === o.applicationName ? '' : o.applicationName,
        name : o.name
    })
        .then(function(res){
            o.applicationName = sharedCatalogName === o.applicationName ? '_shared' : o.applicationName;

            var fileName = (res.items[o.number] && res.items[o.number].path) ? res.items[o.number].path : '';
            var filePath = path.join(RESOURCES_DEV_PATH, o.tenant, o.applicationName, o.name, fileName);

            return QFS.read(filePath)
                .then(function(content){
                    return Q.resolve({
                        content : content,
                        fileName : fileName
                    });
                });
        })
};

// Update resource file
api.updateResourceFile = function(o) {
    // Set modify status
    return MDBW.getOne(DB_TENANTS_PREFIX + o.tenant, RESOURCES_COLLECTION, {
        application : sharedCatalogName === o.applicationName ? '' : o.applicationName,
        name : o.name
    }).then(function(res){
        if ( ( res ) && ( res.versioning ) && ( res.versioning.status === 'committed' ) ) {
            return MDBW.update(DB_TENANTS_PREFIX + o.tenant, RESOURCES_COLLECTION, {
                    name:        o.name,
                    application: sharedCatalogName === o.applicationName ? '' : o.applicationName
                },
                {
                    $set: {
                        versioning :{
                            "status": 'modified',
                            "user": o.user,
                            "last_action": (new Date() / 1000).toFixed()
                        }
                    }
                }
            );
        }
    })
        .then(function(){
            o.applicationName = sharedCatalogName === o.applicationName ? '_shared' : o.applicationName;
            var filePath = path.join(RESOURCES_DEV_PATH, o.tenant, o.applicationName, o.name, o.fileName);
            return QFS.write(filePath, o.content);
        });
};

// Create resource file
api.createResourceFile = function(o) {
    var newItem = {
        path : o.fileName,
        type : (o.name === 'javascript') ? "JavaScript" : "CSS",
        size : null
    };
    return MDBW.getOne(DB_TENANTS_PREFIX + o.tenant, RESOURCES_COLLECTION, {
        application : sharedCatalogName === o.applicationName ? '' : o.applicationName,
        name : o.name
    }).then(function(res){
        if (res) {
            var status =  (res.versioning.status === 'committed') ? 'modified' : res.versioning.status
            var items = res.items;
            items.push(newItem);
            var query = {
                items : items,
                versioning: {
                    "status": status,
                    "user": o.user,
                    "last_action": (new Date() / 1000).toFixed()
                }
            }
        } else {
            var query = {
                items : [ newItem ],
                versioning: {
                    "status": 'added',
                    "user": o.user,
                    "last_action": (new Date() / 1000).toFixed()
                }
            }
        }
        return MDBW.update(DB_TENANTS_PREFIX + o.tenant, RESOURCES_COLLECTION, {
                name:        o.name,
                application: sharedCatalogName === o.applicationName ? '' : o.applicationName
            },
            { $set : query },
            {upsert: true}
        );
    })
        .then(function(){

            o.applicationName = sharedCatalogName === o.applicationName ? '_shared' : o.applicationName;

            var dirPath = path.join(RESOURCES_DEV_PATH, o.tenant, o.applicationName, o.name);
            var filePath = path.join(dirPath, o.fileName);
            return QFS.makeTree(dirPath).then( function(){
                return QFS.write( filePath, o.content );
            });
        });
};

/**
 * Used to get the application asset by its relative path,
 * like '/assets/my_asset.png'.
 */
api.getAppAsset = function (req, res) {
    getAsset(req, res, false);
};

/**
 * Used to get the shared asset by its relative path,
 * like '/_shared/assets/my_asset.png'.
 */
api.getSharedAsset = function (req, res) {
    getAsset(req, res, true);
};

var getAsset = (function(){
    const
        RGX_PARSE_REFERER = /\/deploy\/([^\/]+)\/([^\/]+)\/([^\/]+)\/([^\/]+)\//;
    const tempDirName = 'tmp';

    function getAppAndTenantFromUrl  (referer, req) {
        var result = {},
            parse;

        if (referer.indexOf('/studio/widget/') > -1) {
            // widget preview
            var temp = referer.substring(referer.indexOf('/preview/') + 1);
            temp = temp.substring(temp.indexOf('/') + 1);

            result.appName = temp.substring(0, temp.indexOf('/')) || widgets.cookieData.get(req).appName;
            result.tenantId = util.lastLoginCookie.get(req).tenantid;
        } else if (referer.indexOf('/' + tempDirName + '/') > -1) {
            // page preview
            const PAGE_PREVIEW_PARSE_REFERER = new RegExp("\/" + tempDirName + "\/deploy\/([^\/]+)\/([^\/]+)\/([^\/]+)\/");
            parse = PAGE_PREVIEW_PARSE_REFERER.exec(referer);
            if ( !parse ) log.error('can not parse assest\'s referer : ' + referer);
            result = {
                tenantId : parse[1],
                appName  : parse[2]
            }
        } else if (referer.indexOf('/studio/screen/') > -1) {
            // page preview
            var temp = referer.substring(referer.indexOf('/screen/') + 8);
            temp = temp.substring(0, temp.indexOf('/'));

            result.appName = temp;
            result.tenantId = util.lastLoginCookie.get(req).tenantid;
        } else {
            // app runtime
            parse = RGX_PARSE_REFERER.exec(referer);
            if ( !parse ) log.error('can not parse assest\'s referer : ' + referer);
            result = {
                tenantId : parse[1],
                appName  : parse[2],
                build    : parse[3],
                build_number : parse[4]
            }
        }
        return result;
    };


    return function (req, res, isShared) {
        var assetName = req.params.assetName,
            referer = req.header('Referer');

        var appAndTenant = getAppAndTenantFromUrl(referer, req),
            tenantId = appAndTenant.tenantId,
            appName = appAndTenant.appName,
            resSubfolder = isShared ? '_shared' : appName,
            filePath = null;
             if (referer.indexOf('/studio/widget/') > -1){
                 filePath = path.join(RESOURCES_DEV_PATH, tenantId, resSubfolder, 'assets', assetName);
             } else if (referer.indexOf('/studio/screen/') > -1){
                 filePath = path.join(RESOURCES_DEV_PATH, tenantId, resSubfolder, 'assets', assetName);
             } else if (referer.indexOf('/' + tempDirName + '/') > -1) {
                 filePath = path.join(RESOURCES_DEV_PATH, tenantId, resSubfolder, 'assets', assetName);
             } else {
                 filePath = path.join(APP_DEPLOY_DIR, tenantId, appName, appAndTenant.build, appAndTenant.build_number, APP_RUN_TIME_PATH, resSubfolder, 'assets', assetName);
             }

        res.sendFile( path.resolve(filePath) );
    };
})();

var getAppDbName = function (applicationName) {
    return ((!applicationName) || applicationName == sharedCatalogName) ? '' : applicationName;
};

exports.api      = api;
exports.endpoint = endpoints.json({
    parser: function (req) {

        var parsed = req.body || {};

        parsed.tenant = req.session.tenant.id;
        parsed.user = req.session.user.id;

        return {
            action: parsed.action,
            data:   parsed
        };
    },
    action: api,
    log:    log
});
