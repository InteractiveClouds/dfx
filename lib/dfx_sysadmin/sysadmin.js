/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var Q         = require('q'),
    SETTINGS  = require('../dfx_settings'),
    credCrypt = require('../auth/utils/credCrypt'),
    db        = require('../mdbw')(SETTINGS.mdbw_options),
    log       = new (require('../utils/log')).Instance({label:'SYSADMIN_SYSADMIN'}),
    version   = require('../../package.json').version,
    utils     = require('../auth/utils');

var SYSDB_NAME     = SETTINGS.system_database_name,
    DEFAULT_PASS   = SETTINGS.sysadmin_default_password,
    MIN_PASS_LEVEL = SETTINGS.minPassStrengthLevel.sysadmin;


exports.changeSysAdminsPasswordPage = function (req, res, next) {

    res.render('changeSysAdminsPassword', {version:version});
};

exports.changeSysAdminsPassword = function (req, res, next) {

    var oldPass = req.body.oldPassword,
        newPass = req.body.newPassword;


    Q.when(db.get(SYSDB_NAME, 'settings', {'name':'sysadmin'}), function(docs){

        return Q.when(credCrypt.decrypt(docs[0].password), function (truePass) {
            if ( truePass !== oldPass ) {

                req.session.sysadmin = false;

                return Q.reject({
                    reason   : 'wrong current password',
                    redirect : '/console/login'
                });
            }

            var passLevel = utils.passwordStrenght(newPass),
                error = (oldPass === newPass   && 'passwords are equal'              ) ||
                        (newPass === DEFAULT_PASS  && 'default password is forbidden') ||
                        (passLevel < MIN_PASS_LEVEL && 'password is too weak'        );

            if ( error ) {
                return Q.reject({ reason : error });
            }

            return Q.when(credCrypt.encrypt(newPass), function (hash) {
                docs[0].password = hash;

                return db.update(
                    SYSDB_NAME,
                    'settings',
                    {_id : docs[0]._id},
                    docs[0],
                    {multi:false}
                );
            })
        })

    })
    .then(
        function () {
            log.info('Sysadmin\'s password was changed.');

            res.setHeader('Content-type', 'application/json');
            res.json({
                result   : 'success',
                redirect : '/console'
            });
        },
        function (error) {
            if ( !error || !error.reason ) {
                //res.status(500);
                log.error('Failed attempt to change sysadmin\'s password SERVER ERROR: ' + error.toString());
                error = { reason : 'server error' }
            } else {
                log.warn('Failed attempt to change sysadmin\'s password: ' + error.reason);
            }

            error.result = 'failed';

            res.setHeader('Content-type', 'application/json');
            res.json(error);
        }
    ).done();
};
