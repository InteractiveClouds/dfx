const Q = require('q');

exports.description = 'changing datawidgets unique index';

exports.run = function (cfg, opts) {
    const
        DB_TENANTS_PREFIX = opts.SETTINGS.databases_tenants_name_prefix,
        db = cfg.db;

    if ( typeof db.native !== 'function' ) return Q.resolve(); // fsdb

    return db.get(
        'dreamface_sysdb',
        'tenants'
    ).then(function( result ) {
        var tenants = result.map(function(res){
            return res.id;
        });

        var d = Q(1);
        tenants.forEach(function(tenant){
            d = d.then(function () {
                return db.native(DB_TENANTS_PREFIX + tenant).then(function (ndb) {
                    var collection = ndb.collection('datawidgets');
                    collection.dropIndex('name_1', function(err, result) {
                        if (err) {
                            console.dir(err);

                            ndb.close();
                        } else {
                            collection.createIndex(
                                {name:1, application:1},
                                {unique:true},
                                function(err, indexName) {
                                    if (err) {
                                        console.log(err);
                                    }
                                    ndb.close();
                                }
                            );
                        }
                    });
                });
            });
        });
    });
};

