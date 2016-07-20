const
    Q     = require('q'),
    Xerox = require('./Xerox');

module.exports = function ( o ) {
    const
        tenant   = o.tenant,
        tenantDB = 'dreamface_tenant_' + tenant,
        decrypt  = o.decrypt,
        encrypt  = o.encrypt,
        xerox    = new Xerox(o);

    return onebyone([
        function () {
            return xerox.copy({
                db : 'auth_providers',
                cl : tenant,
                crypt : function (docs) {
                    return Q.all(docs.map(function(doc){
                        return Q.when(decrypt(doc.credentials), function(d){
                            return encrypt(d);
                        })
                        .then(function(encrypted){
                            doc.credentials = encrypted
                        })
                    }))
                    .then(function(){return docs})
                }
            });
        },
        function () {
            return xerox.copy({
                db    : 'dreamface_sysdb',
                cl    : 'tenants',
                query : {id : tenant}
            });
        },
        function () {
            return xerox.copy({
                db : tenantDB,
                cl : 'users',
                crypt : function (docs) {
                    debugger;
                    return Q.all(docs.map(function(doc){
                        return Q.when(decrypt(doc.credentials.pass), function(d){
                            return encrypt(d)
                        })
                        .then(function(encrypted){
                            doc.credentials.pass = encrypted
                        })
                    }))
                    .then(function(){return docs})
                }
            });
        },
        function () {
            return xerox.copy({
                db : tenantDB,
                cl : 'trash'
            });
        },
        function () {
            return xerox.copy({
                db : tenantDB,
                cl : 'settings'
            });
        },
        function () {
            return xerox.copy({
                db : tenantDB,
                cl : 'screens_templates'
            });
        },
        function () {
            return xerox.copy({
                db : tenantDB,
                cl : 'screens_categories'
            });
        },
        function () {
            return xerox.copy({
                db : tenantDB,
                cl : 'screens'
            });
        },
        function () {
            return xerox.copy({
                db : tenantDB,
                cl : 'roles'
            });
        },
        function () {
            return xerox.copy({
                db : tenantDB,
                cl : 'resources'
            });
        },
        function () {
            return xerox.copy({
                db : tenantDB,
                cl : 'metadata'
            });
        },
        function () {
            return xerox.copy({
                db : tenantDB,
                cl : 'datawidgets_categories'
            });
        },
        function () {
            return xerox.copy({
                db : tenantDB,
                cl : 'datawidgets'
            });
        },
        function () {
            return xerox.copy({
                db : tenantDB,
                cl : 'dataqueries_categories'
            });
        },
        function () {
            return xerox.copy({
                db : tenantDB,
                cl : 'dataqueries'
            });
        },
        function () {
            return xerox.copy({
                db : tenantDB,
                cl : 'applications'
            });
        },
        function () {
            return xerox.copy({
                db : tenantDB,
                cl : 'application_menus'
            });
        },
        function () {
            return xerox.copy({
                db : tenantDB,
                cl : 'application_builds'
            });
        },
        function () {
            return xerox.copy({
                db : tenantDB,
                cl : 'BlueMixCF'
            });
        }
    ]);
};

function onebyone ( funcs ) {
    var D = Q(true);

    funcs.forEach(function(func){
        D = D.then(func);
    });

    return D.promise;
}
