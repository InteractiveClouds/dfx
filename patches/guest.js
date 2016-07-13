var SETTINGS  = require('../lib/dfx_settings'),
    Q = require('q');

try {
    overwriteSettings( SETTINGS, require('../lib/dfx_settings.local.js') );
} catch (e) {}

var db               = require('../lib/mdbw')(SETTINGS.mdbw_options),

    sysdbName        = SETTINGS.system_database_name,
    tenantsClName    = SETTINGS.system_database_tenants_collection_name,
    repositoryPrefix = SETTINGS.databases_tenants_name_prefix;

console.log( 'Connecting using: ' + JSON.stringify(SETTINGS.mdbw_options) );

db.get(sysdbName, tenantsClName).then(function(tenants){
    var ids = tenants.map(function(e){return e.id});

    var tasks0 = [];
    ids.forEach(function(tenant){
        var tenantDB = repositoryPrefix + tenant;
        tasks0.push(db.get(tenantDB, 'roles').then(function(roles) {
            var rolesNames = roles.map(function(role){ return role.name });
            if ( !!~rolesNames.indexOf('guest') ) {
                console.log('added unremovable flag to "guest" role for ' + tenant);
                return db.update(tenantDB, 'roles', {name:'guest'}, {$set: {unremovable:true}})
            } else {

                console.log('added "guest" role for ' + tenant);
                return db.put(tenantDB, 'roles', {
                    'name'        : 'guest',
                    'rights'      : [],
                    'type'        : '',
                    'unremovable' : true,
                    'description' : ''
                });
            }
        })
        .then(function(){
            return db.get(tenantDB, 'users').then(function(users){
                var tasks2 = [];
                users.forEach(function(user){
                    var fullName = tenant + ':' + user.credentials.login,
                        hasAnyRole = !!user.roles.list.length,
                        isAppUser  = user.kind === 'application';
        
        
                    if ( !hasAnyRole && isAppUser ) {
                        tasks2.push(
                            db.update(tenantDB, 'users', {_id : user._id}, {$addToSet : { 'roles.list' : 'guest' }})
                        );
                        console.log(fullName + ' is granted with role "guest"');
                    }
        
                });
                return Q.all(tasks2);
            });
        }));
    });
    return Q.all(tasks0)
})
.then(
    function(){console.log('success'); process.exit()},
    function(error){console.log('failed', error)}
)
.done();


function overwriteSettings ( a, b, path ) {

    path = path || [];

    for ( var param in b ) {

        if ( !a.hasOwnProperty(param) ) {
            throw('Unknown parameter ' + path.concat(param).join('.'));
        }

        if ( typeof b[param] !== 'object' || b[param] instanceof Array ) {
            a[param] = b[param];
        } else {
            overwriteSettings(a[param], b[param], path.concat(param));
        }
    }
}
