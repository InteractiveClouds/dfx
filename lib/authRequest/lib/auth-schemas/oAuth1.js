/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var CLASS = require('../class'),
    OAUTH = require('oauth').OAuth,
    Q = require('q');

var Constr = new CLASS.create();

exports.Constructor = Constr;

Constr.include({

    /**
     * @param {Objet} cr credentials
     */
    init : function (cr) {
        this._creds = cr = cr.credentials;
        this._oa= new OAUTH(
            '', //cr.url_request_token,
            '', //cr.url_access_token,
            cr.consumer_key,
            cr.consumer_secret,
            '1.0A', //cr.oauth_version,
            '', //cr.url_callback,
            cr.signature_method
        );
    }, 

    get : function ( params ) {
        return performRequest(params, this, 'get')
    },

    post : function ( params ) {
        return performRequest(params, this, 'post')
    },

    put : function ( params ) {
        return performRequest(params, this, 'put')
    },

    delete : function ( params ) {
        return performRequest(params, this, 'delete')
    }
});

function performRequest ( params, _this, method ) {
    var D = Q.defer();
    var options = [
        params.url,
        _this._creds.access_token,
        _this._creds.access_secret,
    ];
    if ( method !== 'get' ) {
        options.push(params.body || '');
        options.push(''); // post content type TODO
    }
    options.push(function(error, data){
        return error
            ? D.reject(JSON.stringify(error))
            : D.resolve({body: data});
    });
    _this._oa[method].apply(_this._oa, options);
    return D.promise;
}
