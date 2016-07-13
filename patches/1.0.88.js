/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */
exports.description = 'inserting DFX-server version to db';

exports.run = function (cfg, opts) {
    const
        SETTINGS = opts.SETTINGS,
        db       = cfg.db;

    return db.exists(
        'dreamface_sysdb',
        'settings',
        {name: 'dfx version'}
    )
    .then(function( exists ) {
        if ( !exists ) return db.put(
            'dreamface_sysdb',
            'settings',
            {
                name: 'dfx version',
                version: '0.0.1'
            }
        );
    });
};
