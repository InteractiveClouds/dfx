const uuid = require('node-uuid');

exports.description = 'it sets server uuid';

exports.run = function (cfg, opts) {
    return cfg.db.update(
        'dreamface_sysdb',
        'settings',
        { 'name' : 'sysdb' },
        { $set : { 'server-uuid' : uuid.v1() } }
    );
};

