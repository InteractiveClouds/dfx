var Q = require('q');

exports.init = function ( o ) {
    
    var Ldap    = o.Ldap,
        storage = o.storage;


    /**
     * if there is o.creds it is used for binding,
     * otherwise creds from `provider` is used
     */
    function bind ( o ) {
        // TODO checks
        return storage.get({
            tenant : o.tenant,
            id     : o.provider
        }).then(function(p){
            
            var ldap = new Ldap.Instance({
                uri            : p.uri,
                version        : p.version || 3,
                starttls       : !!p.tls,
                connecttimeout : 1,
                reconnect      : true
            });

            return ldap.open()
                .then(function(){
                    return ldap.simplebind({
                        binddn   : o.creds ? o.creds.dn   : p.dn,
                        password : o.creds ? o.creds.pass : p.pass
                    });
                })
                .then(function(){
                    return ldap;
                })
        })
    }

    function check ( o ) {
        return bind(o).then(function(ldap){
            ldap.close();
            return Q.resolve();
        })
    }


    exports.bind  = bind;
    exports.check = check;

    delete exports.init;


    return exports;
};

