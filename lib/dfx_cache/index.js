exports.init = function ( o ) {
    const client = o.useRedis ? useRedis(o) : useMemoryStorage(o);

    delete exports.init;

    return client;
}

function useRedis ( o ) {
    const
        redis = require('redis'),
        client = redis.createClient(),
        log = new o.Log.Instance({label:'CACHE'});

    client.on('error', log.error.bind(log));

    // TODO promises

    return client;
}

function useMemoryStorage ( o ) {
    return new (require('../auth/utils/storage/memoryStorage').Constructor)({});
}
