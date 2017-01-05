const Q = require('q');

exports.description = 'it sets default ENV for all applications';

exports.run = function (cfg, opts) {
    const
        DB_TENANTS_PREFIX = opts.SETTINGS.databases_tenants_name_prefix,
        db = cfg.db;

    return db.get(
        'dreamface_sysdb',
        'tenants'
    )
        .then(function (tenants) {
            return Q.all(tenants.map(function ( tenant ) {
                db.get(DB_TENANTS_PREFIX + tenant.id,'applications').then(function( apps ){
                    return Q.all(apps.map(function ( app ) {
                        var source_script = (app.script != null) ? app.script :
                            'dfxApplication.controller(\'' + app.name+ 'ApplicationController'\', [ \'$scope\', function ($scope) {\n\t\n}]);';
                        var source_scriptMobile = (app.scriptMobile != null) ? app.scriptMobile :
                            'dfxApplication.controller(\'' + app.name+ 'ApplicationController'\', [ \'$scope\', function ($scope) {\n\t\n}]);';
                        /* update collection*/
                        return db.update(
                            DB_TENANTS_PREFIX + tenant.id,
                            'applications',
                            {"name": app.name},
                            {$set: {'script': source_script, 'scriptMobile': source_scriptMobile}},
                            {multi: true, upsert: false}
                        );
                    }));
                })

            }));
        });
};
