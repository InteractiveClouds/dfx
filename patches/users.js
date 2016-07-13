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

    var tasks1 = [];
    ids.forEach(function(tenant){
        var tenantDB = repositoryPrefix + tenant;
        tasks1.push(db.get(tenantDB, 'users').then(function(users){
            var tasks2 = [];
            users.forEach(function(user){
                var isAdmin     = !!~user.roles.list.indexOf('admin'),
                    isDeveloper = !!~user.roles.list.indexOf('developer'),
                    fullName = tenant + ':' + user.credentials.login,
                    newRoles,
                    changes = {};

                if ( user.type === 'staff' ) changes.type = '';

                if ( isAdmin || isDeveloper ) {
                    changes.kind = 'system';
                    newRoles = [];
                    if ( isAdmin )     newRoles.push('admin');
                    if ( isDeveloper ) newRoles.push('developer');
                } else {
                    changes.kind = 'application';
                    newRoles = user.roles.list || [];
                }

                changes['roles.list'] = newRoles;
                changes['roles.default'] = newRoles[0] || '';

                console.log('\n\n', fullName);
                console.log(changes);


                tasks2.push(
                    db.update(tenantDB, 'users', {_id : user._id}, {$set: changes} )
                );
            });
            return Q.all(tasks2);
        }));
    });
    return Q.all(tasks1);
})
.then(
    function(){console.log('success')},
    function(error){console.log('failed'); console.log(error);}
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
