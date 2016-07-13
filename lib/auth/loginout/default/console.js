/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var Q         = require('q'),
    SETTINGS  = require('../../../dfx_settings'),
    credCrypt = require('../../utils/credCrypt'),
    core      = require('../../core'),

    SYSDB_NAME     = SETTINGS.system_database_name;


function Constr ( o ) {
    core.Constructor.call(this, { users : o.users });

    this.log = o.log;
    this.sessionManager = o.sessionManager;
    this.db = o.db;

    this.use(this.parse);
    this.use(this.check);
    this.use(this.createSession);
}

Constr.fn = Constr.prototype = new core.Constructor;

Constr.fn.parse = function (req, success, fail, pocket, res) {
    pocket.username = req.body.username;
    pocket.password = req.body.password;

    success();
};

Constr.fn.check = function (req, success, fail, pocket, res) {
    if ( !pocket.username || !pocket.password ) return fail();

    this.db.get(SYSDB_NAME, 'settings', {'name':'sysadmin'})
    .then(function(docs){

        Q.when(credCrypt.decrypt(docs[0].password), function(truePass){

            pocket.truePass = truePass;

            if ( truePass !== pocket.password || docs[0].username !== pocket.username ) {
                fail();
            } else {
                success();
            }
        });
    });
};

Constr.fn.createSession = function (req, success, fail, pocket, res) {
    this.sessionManager.create(req, res)
    .then(success, fail);
};

Constr.fn.onFail = function (req, res, reason, httpStatus, pocket) {
    this.log.warn('Failed sysadmin login.');
    res.redirect('/console/login');
};

Constr.fn.onSuccess = function (req, res, next, pocket) {
    if ( pocket.truePass === SETTINGS.sysadmin_default_password ) {
        res.redirect('/console/changepassword');
        this.log.warn('Sysadmin has default password. Redirected to changepassword.');
    } else {
        res.redirect('/console');
        this.log.info('Sysadmin is logged in');
    }
};


Constr.fn.logout = function (req, res) {
    var that = this;

    this.sessionManager.rm(req, res)
    .then(function(){
        res.render('login_dialog_console', {});
    })
    .fail(that.log.error.bind(that.log));
};

Constr.fn.loginPage = function ( req, res ) {
    res.render('login_dialog_console', {});
};


exports.Constructor = Constr;
