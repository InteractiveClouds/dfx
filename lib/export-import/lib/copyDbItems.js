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

    return Q.all([
        xerox.copy({
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
        }),
        xerox.copy({
            db    : 'dreamface_sysdb',
            cl    : 'tenants',
            query : {id : tenant}
        }),
        xerox.copy({
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
        }),
        xerox.copy({
            db : tenantDB,
            cl : 'trash'
        }),
        xerox.copy({
            db : tenantDB,
            cl : 'settings'
        }),
        xerox.copy({
            db : tenantDB,
            cl : 'screens_templates'
        }),
        xerox.copy({
            db : tenantDB,
            cl : 'screens_categories'
        }),
        xerox.copy({
            db : tenantDB,
            cl : 'screens'
        }),
        xerox.copy({
            db : tenantDB,
            cl : 'roles'
        }),
        xerox.copy({
            db : tenantDB,
            cl : 'resources'
        }),
        xerox.copy({
            db : tenantDB,
            cl : 'metadata'
        }),
        xerox.copy({
            db : tenantDB,
            cl : 'datawidgets_categories'
        }),
        xerox.copy({
            db : tenantDB,
            cl : 'datawidgets'
        }),
        xerox.copy({
            db : tenantDB,
            cl : 'dataqueries_categories'
        }),
        xerox.copy({
            db : tenantDB,
            cl : 'dataqueries'
        }),
        xerox.copy({
            db : tenantDB,
            cl : 'applications'
        }),
        xerox.copy({
            db : tenantDB,
            cl : 'application_menus'
        }),
        xerox.copy({
            db : tenantDB,
            cl : 'application_builds'
        }),
        xerox.copy({
            db : tenantDB,
            cl : 'BlueMixCF'
        }),
    ]);
};
