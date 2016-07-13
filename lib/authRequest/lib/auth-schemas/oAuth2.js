/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var CLASS  = require('../class'),
    OAUTH2 = require('oauth').OAuth2,
    Q      = require('q'),

    util    = require('util'),
    request = require('request');


var Constr = new CLASS.create();

exports.Constructor = Constr;

Constr.include({

    /**
     * @param {Object} cr credentials
     */
    init : function (cr) {
        this._creds = cr = cr.credentials;
        this._oa= new OAUTH2(
            cr.consumer_key,
            cr.consumer_secret,
            cr.base_site,
            cr.authorize_path,
            cr.access_token_path,
            cr.custom_headers
        );

        this._oa.useAuthorizationHeaderforGET(true);
    }, 

    get : function ( params ) {
        return performRequest.call(this, params, 'get')
    },

    post : function ( params ) {
        return performRequest.call(this, params, 'post')
    },

    put : function ( params ) {
        return performRequest.call(this, params, 'put')
    }
});


function performRequest ( params, method ) {

    return !httpMethods.hasOwnProperty(method)
        ? Q.reject('method ' + method + ' is not implemented for oAuth2 schema')
        : httpMethods[method].call(this, params, method);
}

var httpMethods = {
    get : function ( params ) {

        var D = Q.defer(),
            now = (new Date).getTime(),
            _error = {};

        this._oa.get(params.url, this._creds.access_token, function(error, result, response){

            if ( error ) {
                if ( error.statusCode ) _error.status  = error.statusCode;
                if ( error.headers    ) _error.headers = error.headers;
                if ( error.data       ) _error.data    = error.data;

                return D.reject( Object.keys(_error).length ?  _error : error );
            } else {
                return D.resolve({
                    body    : result,
                    status  : response.statusCode,
                    headers : response.headers
                });
            }
        });

        return D.promise;
    },

    post : postOrPut,
    put  : postOrPut
};

function postOrPut( params, method ) {

    var D = Q.defer(),
        type = this._creds.token_type,
        access_token = this._creds.access_token;

    if ( type ) {
        if ( type !== 'bearer' ) return D.reject(
            'unknown token_type "' + type + '"'
        );
    } else {
        console.log('AUTH REQUEST WARN : old token version. ( not token type )');
    }

    request[method](
        params.url,
        {
            'auth': {
                'bearer': access_token
            }
        },
        function (error, response, result) {

            if ( error ) {

                console.log('error : ', error);
                if ( error.statusCode ) _error.status  = error.statusCode;
                if ( error.headers    ) _error.headers = error.headers;
                if ( error.data       ) _error.data    = error.data;

                return D.reject( Object.keys(_error).length ?  _error : error );
            } else {

                return D.resolve({
                    body    : result,
                    status  : response.statusCode,
                    headers : response.headers
                });
            }
        }
    );

    return D.promise;
}
