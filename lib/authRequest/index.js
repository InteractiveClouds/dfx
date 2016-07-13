/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/**
 * returns ready for use request object
 * if credentials is specified
 * it will use credentials.schema for authentication each request
 *
 * @param {Object} [credentials]
 * @param {String} [credentials.schema]
 * @param {String} [credentials.user]
 * @param {String} [credentials.pass]
 *      or other credentials options if required
 * @retrurns {Object} instance
 */
exports.getRequestInstance = function ( credentials ) {
    var schema,
        schemaName = ( credentials && credentials.schema ) || 'no-auth';

    try { schema = require('./lib/auth-schemas/' + schemaName + '.js'); }
    catch (error) {
        throw( new Error( // TODO throw?
            'Not implemented authentication schema: ' + schemaName + '\n' + error
        ));
    };

    return new schema.Constructor(credentials);
}
