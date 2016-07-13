/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var SETTINGS = require('../dfx_settings');

exports.tenant          = require('./tenants');
exports.provider        = require('./authProviders');
exports.dbDriver        = require('./dbDrivers');

if (SETTINGS.studio) {
    exports.cloudRepository = require('./cloudRepository');
}
