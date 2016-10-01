var activator = require('../lib/utils/activator');
var roles      = require('../lib/dfx_sysadmin').tenant.role;

exports.description = 'it put active tenants into Redis';

exports.run = function (cfg) {
    const db = cfg.db;

    return db.get(
        'dreamface_sysdb',
        'tenants'
    )
        .then(function (tenants) {
            var list = tenants.map(function(tenant){
                            return tenant.id
            });
            return activator.init(list).then(function(){
                roles.rebuildCache();
            });
        });
};
