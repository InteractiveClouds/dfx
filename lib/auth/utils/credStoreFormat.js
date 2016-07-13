/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var UTIL = require('./index'),
    Q    = require('q');

var log = new (require('../../utils/log')).Instance({label:'CREDSTOREFORMAT'});

var NONCE_LENGTH = 64;
    TYPE_LENGTH = 6, // 'OBJECT' || 'STRING'


exports.pack = function ( cred ) {

    return Q.when(UTIL.random(NONCE_LENGTH), function(nonce) {

        var type = ( typeof cred === 'string' && cred.length )
            ? 'STRING'
            : ( typeof cred === 'object' && Object.keys(cred).length )
                ? 'OBJECT'
                : '';

        if  ( !type ) return Q.reject(log.error('Credential must be either not empty string, or object.'));

        var content = type === 'STRING'
                ? cred
                : JSON.stringify(cred);
        
        return Q(nonce + type + content);
    });
};


exports.unpack = function ( box ) {

    if  ( !box || typeof box !== 'string' ) return Q.reject(log.error('String is expected.'));

    var type    = box.slice(NONCE_LENGTH, NONCE_LENGTH + TYPE_LENGTH),
        content = box.slice(NONCE_LENGTH + TYPE_LENGTH);

    if  ( ! /^(?:STRING|OBJECT)$/.test(type) || !content ) return Q.reject(log.error('Wrong format.'));

    return Q( type === 'OBJECT' ? JSON.parse(content) : content );
};
