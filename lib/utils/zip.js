/*
 This notice must be untouched at all times.

 DreamFace Compiler
 Version: 2.1.8
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var fs = require('fs');
var archiver = require('archiver');
var Q = require('q');
var SETTINGS   = require('../dfx_settings');
var log = new (require('../utils/log')).Instance({label: "Utils_zip"});
var QFS = require('q-io/fs');
var request = require('request');
var FormData = require('form-data');
var path  = require('path');

var engine = {};

engine.getTemplatesZip = function(req, res) {
    engine.makeTempDirWithTemplates()
        .then(function() {
            return engine.compress({fileName: 'templates.zip'})
                .then(function(){
                    var filePath = path.join(__dirname, '..','..','tmp', 'templates.zip');
                    res.sendFile(filePath);
                });
        });
};

engine.getResourcesZip = function(req, res) {
    engine.makeTempDirWithResources(req.query.appname, req.query.tenantid)
        .then(function() {
            engine.compress({fileName: 'resources.zip', folderPath: path.join(__dirname,'..','..','tmp','resources')})
                .then(function() {
                    var filePath = path.join(__dirname,'..','..','tmp','resources.zip');
                    res.sendFile(filePath);
                });
        }).done();
};

engine.makeTempDirWithTemplates = function() {
    var relPath = path.join(__dirname,'..','..');
    return QFS.makeTree( path.join(relPath, SETTINGS.tempDirForTemplates ))
        .then(function(){
       return QFS.copyTree(path.join(relPath,'build'), path.join(relPath, SETTINGS.tempDirForTemplates, 'build'))
           .then(function(){
                var templates = SETTINGS.templates;
                   return Q.all(Object.keys(templates).map(function(k){
                       return QFS.makeTree(path.join(relPath, SETTINGS.tempDirForTemplates, 'templates',  templates[k].name))
                           .then(function(){
                               return QFS.exists(templates[k].path)
                                   .then(function(res){
                                       return res ? QFS.copyTree(templates[k].path, path.join(relPath, SETTINGS.tempDirForTemplates, 'templates',templates[k].name))
                                                  : Q.resolve();
                                   });
                           })
                           .then(function(){
                               return QFS.exists(templates[k].widget)
                                   .then(function(res){
                                       return res ? QFS.copy(templates[k].widget, path.join(relPath, SETTINGS.tempDirForTemplates, 'templates', templates[k].name, 'view.jade'))
                                                  : Q.resolve();
                                   });
                           })
                           .then(function(){
                               return QFS.exists(templates[k].login)
                                   .then(function(res){
                                       return res ? QFS.copy(templates[k].login, path.join(relPath, SETTINGS.tempDirForTemplates, 'templates', templates[k].name, 'login.jade'))
                                                  : Q.resolve();
                                   });
                           })
                           .then(function(){
                               return QFS.exists(templates[k].index)
                                   .then(function(res){
                                       return res ? QFS.copy(templates[k].index, path.join(relPath, SETTINGS.tempDirForTemplates, 'templates', templates[k].name, 'index.jade'))
                                                  : Q.resolve();
                                   });
                           })
                           .then(function(){
                               return QFS.exists(templates[k].screen)
                                   .then(function(res){
                                       return res ? QFS.copy(templates[k].screen, path.join(relPath, SETTINGS.tempDirForTemplates, 'templates', templates[k].name, 'page.jade'))
                                                  : Q.resolve();
                                   });
                           })
                   }));
           });
    });
};

engine.makeTempDirWithResources = function(appName, tenantId) {
    var tmpResourcesPath = path.join(__dirname, '..', '..', 'tmp', 'resources');

    return QFS.removeTree(tmpResourcesPath)
        .then(function () {
                return Q.all([
                    QFS.makeTree( path.join(tmpResourcesPath, '_shared') ),
                    QFS.makeTree( path.join(tmpResourcesPath, appName) )
                ])
            }, function (error) {
                return Q.all([
                    QFS.makeTree( path.join(tmpResourcesPath, '_shared') ),
                    QFS.makeTree( path.join(tmpResourcesPath, appName) )
            ])
        }).then(function () {
            return Q.allSettled([
                QFS.copyTree(path.join(SETTINGS.resources_development_path, tenantId, '_shared'), path.join(tmpResourcesPath, '_shared')),
                QFS.copyTree(path.join(SETTINGS.resources_development_path, tenantId, appName), path.join(tmpResourcesPath, appName))
            ]);
        }).then(function(results) {
            results.forEach(function (result) {
                if (result.state !== "fulfilled") {
                    //log.error( result.reason );
                }
            });
            return "completed";
        });
};

engine.compress = function(o) {
    var D = Q.defer();
    var zipArchive = archiver('zip');
    var inputFiles = o.folderPath || path.join(__dirname,'..','..','temp');

    fs.readdir(inputFiles, function (err, files) {
        if (files.length > 0) {
            var outputPath = o.outputPath || path.join(__dirname,'..','..','tmp', o.fileName);
            var output = fs.createWriteStream(outputPath);

            output.on('close', function() {
                // IMPORTANT: we can NOT remove files here because it's does not return promise
                // and for resources it removes files before engine finished copying
                //deleteFolderRecursive(inputFiles);
                D.resolve();
            });

            zipArchive.pipe(output);

            zipArchive.bulk([
                { src: [ '**/*' ], cwd: inputFiles, expand: true }
            ]);

            zipArchive.finalize(function(err, bytes) {
                if(err) {
                    throw D.reject(err);
                }
            });
        } else {
            D.resolve();
        }
    });


    return D.promise;
};

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


module.exports = engine;







