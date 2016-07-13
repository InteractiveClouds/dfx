exports.init = function ( o ) {
    
    var bind = o.bind;


    function search ( o ) {
        console.log(o);
        // TODO checks
        return bind(o)
            .then(function(ldap){
                return ldap.search({
                    base   : o.base,
                    filter : o.filter,
                    attrs  : o.attrs
                })
                .then(function(d){
                    ldap.close();
                    return d[0];
                })
            })
    }


    exports.search   = search;
    exports.endpoint = search;

    delete exports.init;


    return exports;
};
