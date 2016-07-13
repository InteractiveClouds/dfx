/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

// Declaration of main modules

var fs = require('graceful-fs'),
    path = require('path'),
    Q = require('q'),
    SETTINGS = require('./dfx_settings'),
    jade = require('jade'),
    mdbw = require('./mdbw')(SETTINGS.mdbw_options),
    async = require('async');

var DB_TENANTS_PREFIX = SETTINGS.databases_tenants_name_prefix;

var GCExtensions = function () {
};

GCExtensions.getDirectives = function(req, res) {
    GCExtensions.directives(req, function(arr_extensions) {
        res.end(JSON.stringify({
            data: arr_extensions
        }));
    });
};

GCExtensions.directives = function(req, callback) {
    mdbw.getOne(DB_TENANTS_PREFIX + req.session.tenant.id, 'gc_extensions', {'extension_type':'directives'})
        .then(function(docs){
            callback( docs );
        });
};

GCExtensions.settingsScreen = function (req, res) {
    req.session.screen = {
        name: "gc-extensions-settings"
    };

    async.parallel([
        function (callback) {
            mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'gc_extensions', {'extension_type': 'directives'}).then(function (docs) {
                callback(null, docs);
            });
        }],
        function (err, result) {
            fs.readFile(path.join(__dirname, '..', 'templates/studio/settings/gc-extensions-settings.jade'), 'utf8', function (err, data) {
                if (err) throw err;
                var gc_extensions = (result[0][0]!=null) ? result[0][0] : {"extension_type": "directives", "extensions": []};

                var fn = jade.compile(data);
                var body = fn({ "gc_extensions": gc_extensions.extensions
                });

                res.setHeader('Content-Type', 'text/html');
                res.setHeader('Content-Length', body.length);
                res.end(body);
            });
        });
};

GCExtensions.saveSettings = function (settings_data, req, res) {
    async.parallel([
            function (callback) {
                mdbw.update(DB_TENANTS_PREFIX + req.session.tenant.id, 'users', {'credentials.login': req.session.user.id}, {$set: {'access_token': settings_data.access_token}})
                    .then(
                    function () {
                        callback(null, true);
                    },
                    function (error) {
                        callback(error, null);
                    }
                ).done();
            },
            function (callback) {
                delete settings_data.access_token;
                mdbw.exists(DB_TENANTS_PREFIX + req.session.tenant.id, 'gc_extensions', {'extension_type': settings_data.extension_type}).then(function (exists) {
                    if (exists) {
                        if (! settings_data.extensions) settings_data.extensions = [];

                        mdbw.update(DB_TENANTS_PREFIX + req.session.tenant.id, 'gc_extensions', {'extension_type': settings_data.extension_type}, {$set: settings_data})
                            .then(
                            function () {
                                callback(null, true);
                            },
                            function (error) {
                                callback(error, null);
                            }).done();
                    } else {
                        mdbw.put(DB_TENANTS_PREFIX + req.session.tenant.id, 'gc_extensions', settings_data)
                            .then(
                            function () {
                                callback(null, true);
                            },
                            function (error) {
                                callback(error, null);
                            }).done();
                    }
                });
            }],
        function (err, result) {
            if (err) {
                res.setHeader('Content-type', 'application/json');
                res.status(500);
                res.end(JSON.stringify({
                    result: 'Failed to save settings',
                    reason: 'Server error'
                }));
            } else {
                res.setHeader('Content-type', 'application/json');
                res.end(JSON.stringify({
                    result: 'Settings successfully saved'
                }));
            }
        });
};

exports = module.exports = GCExtensions;