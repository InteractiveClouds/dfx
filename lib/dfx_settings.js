/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var path = require('path');

module.exports = {
    studio_version: 3,

    sharedCatalogName: 'dfx-common-components',

    useLdapModule: false,

    customUrls: [],
    templates: {
        "Basic": {
            "name":      "Basic",
            "platform":  "web",
            "path":      path.resolve(__dirname, '..', 'src', 'packages', 'basic'),
            "short_name" : 'basic',
            "widget" :   path.resolve(__dirname, '..', 'templates', 'standard_web_widget.jade'),
            "login":     path.resolve(__dirname, '..', 'src', 'packages', 'basic', 'basic_login.jade'),
            "index":     path.resolve(__dirname, '..', 'src', 'packages', 'basic', 'basic_index.jade'),
            "screen":    path.resolve(__dirname, '..', 'src', 'packages', 'basic', 'basic_page.jade')
        },
        "Standard": {
            "name":      "Standard",
            "platform":  "web",
            "path":      path.resolve(__dirname, '..', 'src', 'packages', 'std'),
            "short_name" : 'std',
            "widget" :   path.resolve(__dirname, '..', 'templates', 'standard_web_widget.jade'),
            "login":     path.resolve(__dirname, '..', 'templates', 'standard_web_login.jade'),
            "index":     path.resolve(__dirname, '..', 'templates', 'standard_web_index.jade'),
            "screen":    path.resolve(__dirname, '..', 'templates', 'standard_web.jade')
        },
        "SampleGallery":   {
            "name":      "SampleGallery",
            "platform":  "web",
            "path":      path.resolve(__dirname, '..', 'src', 'packages', 'sg'),
            "short_name" : 'sg',
            "widget" :   path.resolve(__dirname, '..', 'templates', 'standard_web_widget.jade'),
            "login":     path.resolve(__dirname, '..', 'src', 'packages', 'sg', 'sg_web_login.jade'),
            "index":     path.resolve(__dirname, '..', 'src', 'packages', 'sg', 'sg_web_index.jade'),
            "screen":    path.resolve(__dirname, '..', 'src', 'packages', 'sg', 'sg_web.jade')
        }
    },

    // TODO remove after loading the version to npmjs.org
    dfx_as_module_path: '',

    mdbw_options: {
        user: '',
        pass: '',
        host: 'localhost',
        port: 27017,
        maxOpenedConnections : 200,
    },
    server:       {host: '', port: ''}, // reserved

    studioSessionExpiresIn:        60 * 60 * 1000, // an hour
    consoleSessionExpiresIn:       30 * 60 * 1000, // half an hour

    // length of token for accessing through database-url-api
    database_token_length:         32, // symbols in token

    // for tenant's databases and tenant's repository USE NEXT prefix. This one is old.
    databases_name_prefix:         'dreamface_',

    // prefix for all tenant's databases and tenant's repository
    databases_tenants_name_prefix: 'dreamface_tenant_',

    // where mongo is running, the default settings (can be changed at dfx.js)
    mongo_host:                    'localhost',
    mongo_port:                    27017, // where mongo is running

    mongostore_clear_interval:   5 * 60,

    // path to templates for tenant's databases editor (path from 'lib' folder) // TODO rm
    path_to_databases_templates: 'templates/studio/databases/',

    path_to_templates:                        'templates/studio/',

    // where dfx.js is running
    server_host:                              'localhost',
    server_port:                              3000,

    // dfx-server address over the Internet
    external_server_host:                     'localhost',
    external_server_port:                     3000,

    // dfx deployment server: it's where application will be deployed/hosted
    // and where application will send request for DataQueries etc.
    deployment_server_host:                   'localhost',
    deployment_server_port:                   3000,

    // system database
    system_database_name:                     'dreamface_sysdb',
    system_database_sessions_collection_name: 'dreamface.sessions',
    system_database_tenants_collection_name:  'tenants',
    system_database_roles_collection_name:    'roles',
    system_database_rights_collection_name:   'rights',

    authProviders_database_name: 'auth_providers',
    dbDrivers_database_name:     'db_drivers',

    default_user: {
        // the user what is generated when new tenant is created
        // the user is unremovable
        id:         'admin',
        roles_list: ['admin'] // first one will be set as default role
    },

    default_app_user: {
        // the user what is generated when new app is created
        id:         'appuser',
        roles_list: ["guest"],
        password : '12345'
    },

    default_limits: {
        users:        0,
        applications: 0
    },

    auto_generated_roles: {
        // this roles will be generated for each new tenant
        // the roles are unremovable
        // id : description
        admin:     'autogenerated, staff, tenant admin',
        developer: 'autogenerated, staff'
    },

    roles_allowed_to_start_studio: ['admin', 'developer'],
    dfx_last_login_cookie_max_age: 365 * 24 * 60 * 60 * 1000, // one year

    sysadmin_username:         'sys',
    sysadmin_default_password: 'admin',

    minPassStrengthLevel: {
        sysadmin:    20,
        tenantAdmin: 20, // TODO
        user:        20 // TODO
    },

    // application token

    appToken_maxCallsPerToken:  200,
    appToken_loginTokenExpires: 1000 * 60, // a minute
    appToken_EpiresTime:        1000 * 60 * 60, // an hour

    // logging

    logging: {

        file: {
            path:    'logs', // from root of the dfx project
            watch:   ['debug', 'info', 'ok', 'warn', 'error', 'fatal'], // if ommited === watch for all
            rotate:  3, // how many old log files to store
            stackOn: ['error', 'fatal'] // to print stack trace for this ones
        },

        stdout: {
            watch:   ['debug', 'info', 'ok', 'warn', 'error', 'fatal'], // if ommited === watch for all
            stackOn: ['error', 'fatal'] // ERROR, FATAL is default (print stack trace for this ones)
        },

        server: {
            watch:   ['debug', 'info', 'ok', 'warn', 'error', 'fatal'], // if ommited === watch for all
            stackOn: ['error', 'fatal'] // ERROR, FATAL is default (print stack trace for this ones)
        }
    },

    log_pmx: false,

    authSchema:               'default',
    default_password:         '123456',
    authSiteminderHeaderName: 'sm-auth',

    staffRoles: {

        // ATTENTION!
        //
        // DO NOT put here any right-name that can be renamed,
        // like rights for executing dataqueries or applications
        // for example, 'DATAQUERY::someQuery', etc.

        admin: {
            description: 'staff role',
            rights:      {
                'accessRealm::studio': true,

                'manageUsers::CustomUsers': true,  // create, remove, update, list
                'manageUsers::StaffUsers':  true, // create, remove, update, list users with the staff roles
                'listUsers::CustomUsers':   true,
                'listUsers::StaffUsers':    true,

                'executeAny::dataquery': true,

                'assignAny::CustomRoles':     true,
                'assignAny::StaffRoles':      true,
                'assignStaffRole::admin':     true,
                'assignStaffRole::developer': true,

                'manageRoles::CustomRoles': true, // create, remove, update, list

                'assignRight::accessRealm':                true,
                'assignRight::DATAQUERY':                  true, // execute specific dataquery
                'assignRight::executeAny::dataquery':      true,
                'assignRight::manageUsers::CustomUsers':   true,
                'assignRight::listUsers::CustomUsers':     true,
                'assignRight::listUsers::StaffUsers':      true,
                'assignRight::assignAny::CustomRoles':     true,
                'assignRight::assignAny::StaffRoles':      true,
                'assignRight::assignStaffRole::admin':     true,
                'assignRight::assignStaffRole::developer': true,
                'assignRight::manageRoles::CustomRoles':   true
            }
        },

        developer: {
            description: 'staff role',
            rights:      {
                'accessRealm::studio': true,

                'manageUsers::CustomUsers': true,
                'listUsers::CustomUsers':   true,
                'listUsers::StaffUsers':    false,

                'executeAny::dataquery': true,

                'assignAny::CustomRoles': true,

                'manageRoles::CustomRoles': true,

                'assignRight::accessRealm':           true,
                'assignRight::DATAQUERY':             true,
                'assignRight::executeAny::dataquery': true
            }
        }
    },

    cacheTemplates : true,

    compiler : {
        host: 'localhost',
        port: 3100,
        schema: {
            web: 'web',
            mobile: 'mobile'
        },
        logFile: 'log1.txt'
    },

    // server edition, can be 'deployment' or 'development'
    edition: 'development',
    // data storage, can be 'file' or 'mongod'
    storage: 'mongod',


    // ABSOLUTE path to dir where compiled zipped apps
    // what must be deployed at start moment are stored.
    // Be aware -- the zipped apps will be deleted then
    // to avoid redeploy on next start.
    // Mostly the feature is done for creating docker images.
    deploy_on_start_apps_from : '',

    // to turn the dockerization ON set either
    // 'useDefaultSettings' to true
    // or set it manually
    docker_daemon : {
        useDefaultSettings : false,
        host : '',
        port : '',
        ca   : '',
        cert : '',
        key  : ''
    },

    docker_registry_auth : {
        username: '',
        password: '',
        auth: '',
        email: '',
        serveraddress: ''
    },

    tenant_settings_collection_name : 'settings',
    debug_BM_CF : false,

    selectRedisDatabase : 0,
    api_route_wizard : {
        path : path.resolve(__dirname, '..', 'src','catalog','apiRouteWizard.js')
    },

    loadBalancing : {
        pendingRequestsTimeOut : 1000 * 30, // milliseconds
        disabledRequestsStatus : 406
    },

    // Additional directories
    auth_conf_path : '',            // For example path.resolve(__dirname, './lib/auth/.auth.conf')
    tempDirForTemplates : '',       // For example 'temp'
    tempDir : '',                   // For example 'tmp'
    resources_deploy_path: '',      // For example 'resources'
    resources_development_path: '', // For example path.resolve(__dirname, '..', './resources')
    fsdb_path: '',                  // For example path.resolve(__dirname, '..', './app_fsdb')
    deploy_path: '',                // For example path.resolve(__dirname, '..', './deploy')
    app_build_path: ''              // For example path.resolve(__dirname, '..', './app_builds')
};
