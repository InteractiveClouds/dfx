/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var actions = require('./actions.js'),
    U = require('./utils');

exports.action = function ( req, res ) {
    var action = req.params.action;

    if ( !actions.hasOwnProperty(action) ) return U.doAnswer( res, {error: 'unknown action: ' + action});

        var query = U.parseQuery(req.params.query);
        if ( query.error ) return U.doAnswer(res, { error: query.error.toString() });
        var body = req.body || {};

        actions[action]({
            clName   : body.collection || req.params.clName || '',
            tenant   : req.user.id,
            query    : body.query || query.data || '',
            document : body.document || '',
            fields   : body.fields || '',
            req      : req,
            dbName   : U.wrapWithTenant(req.params.dbName || body.database, req.user.id) || ''
        })
        .then(
            function(answer){ U.doAnswer(res, { data: answer }) },
            function(error){ U.doAnswer(res, { error: error.toString() }) }
        )
        .done();
}
