/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/* base class for auh-requests-classes */

var CLASS = require('../class'),
    HTTP = require('q-io/http'),
    Q = require('q');

var Constr = new CLASS.create;

exports.Constructor = Constr;

Constr.include({

    /**
     * @param {Object} params
     * @param {String} params.url
     * @param {String} params.body
     * @param {Object} [params.headers]
     */
    post : function ( params ) {
        if ( ! params || !params.url ) {
            return Q.reject(new Error('URL is required. Nothing done.'));
        }
        var reqObject = this._normalizeRequest(params.url);
        for ( var p in params.headers ) reqObject.headers[p] = params.headers[p];
        reqObject.method = 'POST';
        reqObject.headers['Content-Length'] = 0;

        if ( params.body ) convertBody(params, reqObject);

        return this._send(reqObject)
    },


    /**
     * @param {Object} params
     * @param {String} params.url
     * @param {String} params.body
     * @param {Object} [params.headers]
     */
    put : function ( params ) {
        if ( ! params || !params.url ) {
            return Q.reject(new Error('URL is required. Nothing done.'));
        }
        var reqObject = this._normalizeRequest(params.url);
        for ( var p in params.headers ) reqObject.headers[p] = params.headers[p];
        reqObject.method = 'PUT';
        reqObject.headers['Content-Length'] = 0;

        if ( params.body ) convertBody(params, reqObject);

        return this._send(reqObject)
    },


    /**
     * @param {Object} params
     * @param {String} params.url
     * @param {Object} [params.headers] you can specify any headers you want
     */
    get : function ( params ) {
        if ( ! params || !params.url ) {
            return Q.reject(new Error('URL is required. Nothing done.'));
        }
        var reqObject = this._normalizeRequest(params.url);
        for ( var p in params.headers ) reqObject.headers[p] = params.headers[p];
        reqObject.method = 'GET';
        return this._send(reqObject);
        
    },


    /**
     * @param {Object} params
     * @param {String} params.url
     * @param {Object} [params.headers] you can specify any headers you want
     */
    delete : function ( params ) {
        if ( ! params || !params.url ) {
            return Q.reject(new Error('URL is required. Nothing done.'));
        }
        var reqObject = this._normalizeRequest(params.url);
        for ( var p in params.headers ) reqObject.headers[p] = params.headers[p];
        reqObject.method = 'DELETE';
        return this._send(reqObject);
        
    },

    // TODO OPTIONS, HEAD, etc.

    
    /**
     * Q-IO/http 'request' wrapper
     * sends request and reads response body
     * is used via this._send
     *
     * @param {Object} params q-io/http request object
     */
    _sendQioRequest : function ( params ) {
        return HTTP.request(params)
        .then(function (response) {
            return response.body.read()
            .then(function (body) {
                response.body = body;
                return response;
            })
        })
    },


    /**
     * Q-IO/http method
     */
    _normalizeRequest : HTTP.normalizeRequest,


    /**
     * it should be redeterminate via auth-schemas 
     * to include logic for sending authorization requests.
     * It is used via public methods 'post', 'get', etc.
     */
    _send : function (params) {
        return this._sendQioRequest(params);
    },

});


function convertBody ( params, reqObject ) {
    // TODO if there is a buffer, or stream ?
    if ( typeof params.body !== 'string') params.body = JSON.stringify(params.body);
    reqObject.headers['Content-Length'] = params.body.length;
    reqObject._entireBody = params.body; // for qop="auth-int"
    // TODO check size of params.body (may be it should be chunked)
    reqObject.body = {
        forEach: function(write){
            write(params.body);
        }
    };
}
