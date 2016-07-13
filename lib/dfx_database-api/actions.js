/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var SETTINGS = require('../dfx_settings'),
    MDBW = require('../mdbw')(SETTINGS.mdbw_options),
    U = require('./utils');

exports.get = function (p) {
    return MDBW.get(p.dbName, p.clName, p.query)
    .then(function(dbs){
        return !p.dbName
            ? U.filterWithTenant(dbs, p.tenant)
            : dbs;
    })
};

exports.getOne = function (p) {
    return MDBW.getOne(p.dbName, p.clName, p.query)
};

exports.exists = function (p) {
    return MDBW.exists(p.dbName, p.clName, p.query)
};

exports.put = function (p) {
    return MDBW.put(p.dbName, p.clName, p.document)
};

exports.update = function (p) {
    return MDBW.update(p.dbName, p.clName, p.query, p.fields)
};

exports.rm = function (p) {
    return MDBW.rm(p.dbName, p.clName, p.query)
};

exports.count = function (p) {
    return MDBW.count(p.dbName, p.clName, p.query)
};
