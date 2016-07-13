/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var  Q = require('q');

exports.description = 'Inserting field `active` and rename `requestDate` in `application` collections';

exports.run = function (cfg, opts) {
    const
        DB_TENANTS_PREFIX = opts.SETTINGS.databases_tenants_name_prefix,
        db = cfg.db;

    return db.get(
        'dreamface_sysdb',
        'tenants'
    )
        .then(function( result ) {
            var tenants = result.map(function(res){
                return res.id;
            });

            var d = Q(1);
            tenants.forEach(function(tenant){
                d = d.then(function(){
                    return db.update(
                        DB_TENANTS_PREFIX + tenant,
                        'applications',
                        {},
                        {
                            $set : {active: true},
                            $rename : {"requestDate" : "creationDate"}
                        }
                    );
                });
            });

        });
};
