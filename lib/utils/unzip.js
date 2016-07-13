/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */
var DecompressZip = require('decompress-zip');
var Q = require('q');
var fs = require('fs');
var formidable = require('formidable');
var path  = require('path');
var fsUtil = require('mkdirp');
var path  = require('path');
var SETTINGS = require('../dfx_settings');
var APP_BUILD_DIR = SETTINGS.app_build_path;
var log = new (require('./log')).Instance({label: "DFX_UNZIP_UTIL"});

var engine = function(req, res) {
    verifyPath(APP_BUILD_DIR)
        .then(function() {
            var form = new formidable.IncomingForm();
            form.uploadDir = path.join(APP_BUILD_DIR);
            form.keepExtensions = true;
            form.parse(req, function(err, fields, files) {
                                var newZipPath = path.join(APP_BUILD_DIR, fields.tenant, fields.platform, fields.app + '_' + fields.build);
                                var newZipPathWithFile = path.join(APP_BUILD_DIR, fields.tenant, fields.platform, fields.app + '_' + fields.build, fields.app + '_' + fields.build + '.zip');
                                var oldZipPath = files.file.path;

                                var oldLogPath = files.logFile.path;
                                var newLogPath = path.join(APP_BUILD_DIR, fields.tenant,fields.platform, fields.app + '_' + fields.build, files.logFile.name);

                                verifyPath(newZipPath)
                                    .then(function(){
                                        var tasks = [];
                                        tasks.push((function(){
                                            var zipStream = fs.createReadStream(oldZipPath);
                                            zipStream.pipe(fs.createWriteStream(newZipPathWithFile));

                                            var zip_had_error = false;
                                            zipStream.on('error', function (err) {
                                                zip_had_error = true;
                                                return Q.reject(err);
                                            });
                                            zipStream.on('close', function () {
                                                if (!zip_had_error) {
                                                    fs.unlinkSync(oldZipPath);
                                                    return Q.resolve();
                                                }
                                            });
                                        })());
                                        tasks.push((function(){
                                            var logStream = fs.createReadStream(oldLogPath);
                                            logStream.pipe(fs.createWriteStream(newLogPath));

                                            var log_had_error = false;
                                            logStream.on('error', function (err) {
                                                log_had_error = true;
                                                return Q.reject(err);
                                            });
                                            logStream.on('close', function () {
                                                if (!log_had_error) {
                                                    fs.unlinkSync(oldLogPath);
                                                    return Q.resolve();
                                                }
                                            });
                                        })());

                                        return Q.all(tasks);
                                    })
                                    .then(function(){
                                        res.send("OK");
                                    })
                                    .fail(function(e){
                                        res.status(500).send(e);
                                    })

                });
        })
}

var verifyPath = function(p) {
    var D = Q.defer();
    fs.exists(p, function (exists) {
        if (!exists) {
            fsUtil.mkdirp(p, function(err){
                if (err) {
                    D.reject(err);
                } else {
                    D.resolve();
                }
            });
        } else {
            D.resolve();
        }
    });
    return D.promise;
}

var decompress = function(o) {
    var D = Q.defer();
    fs.exists(o.path, function (exists) {
        if (exists) {
            var unzipper = new DecompressZip(o.path);
            unzipper.on('error', function (err) {
                // console.log(err);
                D.reject(err);
            });

            unzipper.on('extract', function (log) {
                D.resolve('Finished extracting files');
            });

            verifyPath(o.dest_path)
                .then(function(){
                    unzipper.extract({
                        path: o.dest_path,
                        filter: function (file) {
                            return file.type !== "SymbolicLink";
                        }
                    });
                })
                .fail(function(e){
                    D.reject(e);
                });
        } else {
            return D.resolve();
        }
    });

    return D.promise;
}

var getLogFile = function(o) {
    var D = Q.defer();
    var buildVersion = o.applicationName + '_' + o.applicationVersion + '.' + o.buildNumber;
    var pathToLog = path.join(APP_BUILD_DIR, o.tenant, o.platform, buildVersion, o.file);
    fs.readFile(pathToLog, function (err, data) {
        err ? D.reject(err)
            : D.resolve(data.toString('utf8'));
    });
    return D.promise;
}

module.exports = {
    engine : engine,
    getLogFile : getLogFile,
    decompress : decompress
}
