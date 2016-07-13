/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var CRYPTO = require('crypto-js');


/**
 * @param {String} str string to encrypt
 * @returns {String} encrypted
 */
exports.encrypt = function ( str, pass ) {
    return CRYPTO.TripleDES.encrypt(str, pass).toString();
}


/**
 * @param {String} str string to decrypt
 * @returns {String} decrypted
 */
exports.decrypt = function ( str, pass ) {
    return CRYPTO.TripleDES.decrypt(str, pass).toString(CRYPTO.enc.Utf8);
}
