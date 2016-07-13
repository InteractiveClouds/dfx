
/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

exports.description = 'Inserting default user limit = 0 (unlimit) to all system tenants';

exports.run = function (cfg, opts) {
    const
        limitValue = opts.SETTINGS.default_limits.users,
        db = cfg.db;

    return db.update(
        'dreamface_sysdb',
        'tenants',
        { "limits.users" : { $exists : false } },
        {
            $set : {"limits.users" : limitValue}
        }
    );
};
