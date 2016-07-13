/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var CLASS = require('../class'),
    NOAUTH = require('./no-auth');

var Constr = new CLASS.create(NOAUTH.Constructor);

exports.Constructor = Constr;

Constr.include({

    init : function ( o ) {
        this._creds = {
            user : o.credentials.username,
            pass : o.credentials.password,
        };
    }, 

    _send : function (params) {
        params.headers.Authorization = 'Basic '
            + new Buffer( this._creds.user + ':' + this._creds.pass).toString('base64');
        return this._sendQioRequest(params);
    }
});
