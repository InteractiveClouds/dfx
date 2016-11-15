const Q = require('q');
var QFS        = require('q-io/fs');
var path       = require('path');

exports.description = 'update page controller definition on all applications';

exports.run = function (cfg, opts) {
    const
		DB_TENANTS_PREFIX = opts.SETTINGS.databases_tenants_name_prefix,
    	db = cfg.db;
    return db.get(
        'dreamface_sysdb',
        'tenants'
    )
    .then(function (tenants) {
        return Q.all(tenants.map(function (tenant) {
            return db.get(DB_TENANTS_PREFIX + tenant.id, 'screens').then(function (screens) {
                return Q.all(screens.map(function (screen) {
					/* prepare script */
					var re_ctrl = /(dfxAppRuntime.controller)(.*)(\[)/g;
                    var patched_script = (screen.script == null || screen.script == '')
						? 'dfxAppPages.controller(\'' + screen.name + 'PageController\', [ \'$scope\', \'$rootScope\', function( $scope, $rootScope) {\n\t// Insert your code here\n}]);'
						: screen.script.replace(re_ctrl, 'dfxAppPages.controller(\'' + screen.name + 'PageController\', [');

					/* update collection*/
					return db.update(
                        DB_TENANTS_PREFIX + tenant.id,
                        'screens',
                        {"name": screen.name, "application": screen.application, "platform": screen.platform},
                        {$set: {'script': patched_script}},
                        {multi: true, upsert: false}
                    );

                }));
            });
        }));
    });
};
