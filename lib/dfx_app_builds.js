/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.1.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

// Declaration of main modules
var Q          = require('q'),
    QFS        = require('q-io/fs'),
    SETTINGS   = require('./dfx_settings'),
    endpoints  = require('./utils/endpoints'),
    log        = new (require('./utils/log')).Instance({label: 'APP_BUILDS'}),
    MDBW       = require('./mdbw')(SETTINGS.mdbw_options);

var DB_TENANTS_PREFIX = SETTINGS.databases_tenants_name_prefix,
    DB_SORT_ASC       = 1,
    DB_SORT_DESC      = -1,
    DB_COLLECTION     = 'application_builds';

var api = {};

api.put = function( p ) {
    return MDBW.update(DB_TENANTS_PREFIX + p.tenant, DB_COLLECTION,
        {
            application: p.application,
            app_version: p.applicationVersion,
            platform: p.platform,
            build_number: p.buildNumber
        },
        {
            application: p.application,
            app_version: p.applicationVersion,
            build_number: p.buildNumber,
            platform: p.platform,
            description: p.buildDescription,
            release_notes: p.buildReleaseNotes,
            requestDate: new Date(),
            status: p.status,
            deployed: false
        },
        {
            upsert: true,
            multi: false
        }
    );
};

api.list = function ( p ) {
    return MDBW.select(DB_TENANTS_PREFIX + p.tenant, 'applications', {name: p.application}, {name: true, platform: true, version: true})
        .then(function (app_doc) {
            return MDBW.get(DB_TENANTS_PREFIX + p.tenant, DB_COLLECTION, {application: p.application, platform: p.platform}, {build_number: DB_SORT_DESC})
                .then(function (build_docs) {
                    return !build_docs
                        ? undefined
                        : {
                            platform: p.platform,
                            version: app_doc[0].version,
                            items: build_docs.sort(function(a, b) {
                                // MDBW sorts by strings, but we need by numbers
                                if (a.app_version == b.app_version) {
                                    return parseInt(b.build_number) - parseInt(a.build_number);
                                } else {
                                    return 0;
                                }
                            })
                        };
                    });
                });
};

api.remove = function( p ) {
    var error = ( !p.application && 'need application name' ) || false;
    var searchCriteria = {application: p.application, app_version: p.applicationVersion, build_number: p.buildNumber, platform: p.platform};

    return error
        ? Q.reject(new Error(error))
        : MDBW.get(DB_TENANTS_PREFIX + p.tenant, DB_COLLECTION, searchCriteria)
        .then(function(build_doc) {
            //QFS.removeTree(path.join(__dirname, '..', 'resources/' + p.tenant + '/' + result[0].name));
            //TODO : if removed with current status = true...

            return MDBW.rm(DB_TENANTS_PREFIX + p.tenant, DB_COLLECTION, searchCriteria);
        });
};

api.deploy = function( p ) {
    var searchCriteria = {
        application: p.application,
        platform: p.platform,
        deployed: true
    };

    return MDBW.update(DB_TENANTS_PREFIX + p.tenant, DB_COLLECTION, searchCriteria, {$set: {deployed: false}})
        .then(function () {
            searchCriteria = {
                application: p.application,
                platform: p.platform,
                app_version: p.applicationVersion,
                build_number: p.buildNumber
            };
            return MDBW.update(DB_TENANTS_PREFIX + p.tenant, DB_COLLECTION, searchCriteria, {$set: {deployed: true}})
                .then(function (updated) {
                    log.ok('app_builds colleciton updated: ', updated);
                });
        });
};

exports.api = api;
exports.endpoint = endpoints.json({
    parser : function ( req ) {

        var parsed = req.body || {};

        parsed.tenant = req.session.tenant.id;

        return {
            action : parsed.action,
            data   : parsed
        };
    },
    action : api,
    log : log
});
