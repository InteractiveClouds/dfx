/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

// Declaration of main modules
var Q          = require('q'),
    fs         = require('graceful-fs'),
    QFS        = require('q-io/fs'),
    path       = require('path'),
    endpoints  = require('./utils/endpoints'),
    log        = new (require('./utils/log')).Instance({label: 'PREDEFINED_GC'}),
    SETTINGS   = require('./dfx_settings');

var api = {};

api.save = function (req, res) {
    var predefinedGc = req.body.data,
        predefinedGcType = predefinedGc.styles_palette,
        predefinedGcFile = path.join(__dirname, '..', 'templates/palette_styles_definitions/' + predefinedGcType + '.json');

    predefinedGc.id = Math.floor(Math.random() * 100000);

    fs.readFile(predefinedGcFile, 'utf8', function (err, data) {
        var predefined_gcs = JSON.parse(data);

        if ( nameAlreadyExists(predefinedGc.name, predefined_gcs.definitions) ) {
            res.json({"message": "Template with this name already exists", "status": "failed"});
        } else {
            predefined_gcs.definitions.push(predefinedGc);
            QFS.write(predefinedGcFile, new Buffer( JSON.stringify(predefined_gcs, null, '\t') ));

            res.json({"message": "New template is saved"});
        }
    });
};

function nameAlreadyExists(name, gc_definitions) {
    return gc_definitions.some(function(gc_definition) {
        return gc_definition.name == name;
    });
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
