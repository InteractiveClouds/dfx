var SETTINGS  = require('../dfx_settings'),
    endpoints = require('../utils/endpoints'),
    log = new (require('../utils/log')).Instance({label:'API_INDEX'});

if ( SETTINGS.studio ) {
    exports.tenant    = require('./tenant');
    exports.user      = require('./user');
    exports.apps      = require('./apps');
    exports.screens   = require('./screens');
    exports.templates = require('./templates');
    exports.dataquery = require('./dataquery');
    exports.resources = require('./resources');
    exports.samples	  = require('./samples');
}

exports.server    = require('./server');

exports.ping = function (req, res) { res.end('pong') };
