var Q = require('q');

var out = {},
    storage,
    crypt,
    log,
    tenants,
    possibleFields = [ 'id', 'uri', 'pass', 'dn' ];

exports.init = function ( o ) {
    storage = o.storage;
    crypt   = o.crypt;
    log     = o.log;
    tenants = o.tenants;

    delete exports.init;

    return out;
};


out.storage = {};

out.storage.put = function ( o ) {
    var errors = [];

    if ( !o.fields.uri ) errors.push('"uri" is required');
    if ( !o.tenant )     errors.push('"tenant" is required');

    for ( key in o.fields ) {
        if ( !~possibleFields.indexOf(key) ) {
            errors.push('unknown field "' + key + '"');
        }
    }
    //TODO other checks

    if ( errors.length ) {
        return Q.reject(errors.toString());
    }

    return tenants.exists(o.tenant)
        .then(
            function(){

                return Q.when(
                    encryptCreds(o.fields),
                    function(){
                        return storage.put(o).then(function(){});
                    }
                );
            },
            function () {

                return Q.reject('unknown tenant');
            }
        )
};

out.storage.update = function ( o ) {
    var errors = [];

    for ( key in o.fields ) {
        if ( !~possibleFields.indexOf(key) ) {
            errors.push('unknown field "' + key + '"');
        }
    }
    if ( !o.tenant )     errors.push('"tenant" is required');
    //TODO other checks

    if ( errors.length ) {
        return Q.reject(log.error(errors.toString()));
    }

    return tenants.exists(o.tenant)
        .then(
            function(){

                return Q.when(
                    encryptCreds(o.fields),
                    function(){
                            return storage.update(o)
                    }
                );
            },
            function () {

                return Q.reject('unknown tenant');
            }
        );
};


out.storage.get = function ( o ) {
    var errors = [];

    if ( !o.tenant )     errors.push('"tenant" is required');
    //TODO other checks

    if ( errors.length ) {
        return Q.reject(log.error(errors.toString()));
    }

    return storage.get(o)
    .then(function(d){
        return Q.when(crypt.decrypt(d.pass), function(decrypted){
            d.pass = decrypted;
            return d;
        })
    })
};

out.storage.list = function ( o ) {
    var errors = [];

    if ( !o.tenant )     errors.push('"tenant" is required');

    if ( errors.length ) {
        return Q.reject(log.error(errors.toString()));
    }

    return storage.get(o)
    .then(function(d){
        return d.map(function(e){
            delete e.pass;
            return e;
        });
    })
};

out.storage.rm = function ( o ) {
    // TODO remove ldap-users of this provider
    return storage.rm(o);
};


out.endpoint = function ( o ) {

    return !out.storage.hasOwnProperty(o.action)
        ? Q.reject(log.error('unknown action'))
        : out.storage[o.action](o)
            .then(function(data){
                if ( o.action === 'get' ) delete data.pass;
                return Q(data)
            });
};


function encryptCreds ( obj ) {

    return obj.pass &&
        crypt.encrypt(obj.pass)
        .then(function(encrypted){ obj.pass = encrypted });
}
