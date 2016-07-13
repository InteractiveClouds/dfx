/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var Q                 = require('q'),
    log               = new (require('./utils/log')).Instance({label: 'USER_DEFINITION'}),
    SETTINGS          = require('./dfx_settings'),
    MDBW,
    DB_TENANTS_PREFIX = SETTINGS.databases_tenants_name_prefix;

if ( SETTINGS.studio ) {
    var sysadmin      = require('./dfx_sysadmin');
}

var userLib = null;

var api = {};

api.init = function( o ) {
    MDBW = o.storage;
    userLib = o.userLib;

    delete api.init;
};

api.getUserDefinition = function (req, res) {
    sysadmin.tenant.userDefinition.fetch(req, res, function (data) {
        res.send(JSON.stringify(data.metadata));
    });
};

api.updateUserDefinition = function (req, res) {
    sysadmin.tenant.userDefinition.update(req.body, req, function () {
        return res.end(JSON.stringify({
            success: 1,
            error:   null
        }));
    });
};

/*
 * This function is to be called from the studio, via endpoint in dfx_proxy.
 */
api.getForStudio = function (req, res) {
    api.getUser({ req: req, userId: req.session.user.id, tenantId: req.session.tenant.id, ignoreSession: true })
        .then(function (user) {
            res.end(JSON.stringify(user, null, '\t'));
        });
};
/*
 * This function is to be called from the application, from client side, via endpoint in dfx_proxy.
 */
api.get = function (req, res) {
    api.getUser({ req: req, userId: req.session.user.id, tenantId: req.session.tenant.id })
        .then(function (user) {
            var applications = require('./dfx_applications');
            applications.getCompsConfigurationList(req.session.app.id, req, function (app_conf) {
                var app_env = {"user": user, "app_conf": app_conf};
                res.end(JSON.stringify(app_env));
            });
        });
};

/**
 * This function is to be called from the server side to get the user object.
 */
api.getUser = function (options) {
    var req = options.req,
        userId = options.userId || ''
        tenantId = options.tenantId,
        ignoreSession = options.ignoreSession,
        applicationName = ((req.session) && (req.session.app)) ? req.session.app.id : options.applicationName;
        //_app = (req.session && req.session.app) ? req.session.app.id : null;


    if ((!ignoreSession) && req.session && req.session.userDefinition) {
        return Q.fcall(function () {
            log.info("getting user object from session");
            return req.session.userDefinition;
        });
    } else if (!userId) {
        return Q.fcall(function () {
            log.info("can not get user object because userId is undefined");
            return {};
        });
    } else {
        log.info("trying to get user object from db");
        return Q.all([
            getCurrentUser(userId, tenantId, applicationName),//pass app only in run time
            getUserDefinition(tenantId, applicationName)//pass app in run time AND in studio
        ])
            .spread(function (current_user, user_definition) {
                log.info("securing user object received from db");
                var clientSideUser = mergeCurrentUserAndDefinition(current_user, user_definition);
                clientSideUser     = removeHiddenProperties(clientSideUser, user_definition);
                if (req.session) {
                    req.session.userDefinition = clientSideUser;
                }
                return clientSideUser;
            });
    }
};

var getCurrentUser = function (user_login, tenant_id, applicationName) {
    return userLib.get(tenant_id, user_login, false, applicationName)
        .then(function (user) {
            return user;
        });
};

var getUserDefinition = function (tenant_id, applicationName) {
    var filter = (applicationName)
        ? {document: 'userDefinition', application: applicationName}
        : {document: 'userDefinition'};

    return MDBW.get(DB_TENANTS_PREFIX + tenant_id, 'metadata', filter)
        .then(function (data) {
            return data;
        });

    // TODO: more accurate would be to use like in comments below, via sysadmin,
    // and pass req/res to this function, but need to change DQs for that...

    //req.params.applicationName = req.session.app.id;
    //    return sysadmin.tenant.userDefinition.fetch(req, res, function (data) {
    //    return data;
    //});
};

var mergeCurrentUserAndDefinition = function (current_user, user_definition) {
    if ((!user_definition) || (!user_definition[0]) || (!user_definition[0].metadata)) {
        return current_user;
    }

    var user_def_metadata = user_definition[0].metadata;
    for (var user_def_prop in user_def_metadata) {
        if (user_def_metadata.hasOwnProperty(user_def_prop)) {
            setDefaultValues(current_user, user_def_prop, user_def_metadata[user_def_prop]);
        }
    }
    return current_user;
};

var setDefaultValues = function (current_user, prop_name, prop_def) {
    var defaultValues = getNewUserProperty(prop_def);
    if (prop_name == 'name') {
        if (!current_user.firstName) current_user.firstName = defaultValues.first;
        if (!current_user.lastName) current_user.lastName = defaultValues.last;
    } else if (prop_name == 'credentials') {
        if (!current_user.login) current_user.login = defaultValues.login;
        if (!current_user.pass) current_user.pass = defaultValues.pass;
        if (!current_user.password) current_user.password = defaultValues.pass;
    } else {
        if (!current_user[prop_name]) current_user[prop_name] = defaultValues;
    }
};

var getNewUserProperty = function (new_prop_def) {
    if (new_prop_def.type === 'subdocument') {
        return parseStructureTypeProperty(new_prop_def.structure);
    } else if (new_prop_def.type === 'array') {
        //TODO: check the type of each element here
        return new_prop_def.defaults;
    } else {
        return new_prop_def.defaults;
    }
};

var parseStructureTypeProperty = function (structure_prop_def) {
    var result = {};
    for (var structure_prop in structure_prop_def) {
        //TODO: check the type here
        result[structure_prop] = structure_prop_def[structure_prop].defaults;
    }
    return result;
};

var removeHiddenProperties = function (client_side_user, user_definition) {
    // remove internal reserved properties, never pass it to the client
    delete client_side_user['_id'];
    delete client_side_user['access_token'];
    delete client_side_user['pass'];
    delete client_side_user['password'];
    delete client_side_user['kind'];
    delete client_side_user['type'];
    delete client_side_user['rights'];

    // if user_definition collection is empty
    if ((!user_definition) || (!user_definition[0]) || (!user_definition[0].metadata)) {
        return client_side_user;
    }

    var user_def_metadata = user_definition[0].metadata;
    for (var user_def_prop in user_def_metadata) {
        if (user_def_metadata.hasOwnProperty(user_def_prop)) {
            if (user_def_metadata[user_def_prop].pass !== "true") {
                delete client_side_user[user_def_prop]; // delete general property

                if (user_def_prop == 'credentials') { // delete login/pass
                    delete client_side_user['login'];
                    delete client_side_user['pass'];
                    delete client_side_user['password'];
                }
                if (user_def_prop == 'name') {
                    delete client_side_user['firstName'];
                    delete client_side_user['lastName'];
                }
            }
        }
    }
    return client_side_user;
};

exports.api = api;
