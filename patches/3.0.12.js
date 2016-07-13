const Q = require('q');
var QFS        = require('q-io/fs');
var path       = require('path');

exports.description = 'it add default login page for WEB and Mobile to all tenants applications';

exports.run = function (cfg, opts) {
    const
        DB_TENANTS_PREFIX = opts.SETTINGS.databases_tenants_name_prefix,
        db = cfg.db;
    return QFS.read(path.join(__dirname, '..', 'src', 'packages', 'templates', 'default_login_page.html')).then(function (file_content) {
        return QFS.read(path.join(__dirname, '..', 'src', 'packages', 'templates', 'default_login_page_mobile.html')).then(function (file_content_mobile) {
            return db.get(
                'dreamface_sysdb',
                'tenants'
            )
                .then(function (tenants) {
                    return Q.all(tenants.map(function (tenant) {
                        return db.get(DB_TENANTS_PREFIX + tenant.id, 'applications').then(function (apps) {
                            return Q.all(apps.map(function (app) {
                                var data = file_content.replace(/##appName/g, app.name);
                                data = data.replace(/##tenant/g, tenant.id);

                                var deploymentServerUrl = 'http://' + opts.SETTINGS.deployment_server_host + ':' + opts.SETTINGS.deployment_server_port;
                                var data_mobile = file_content_mobile.replace(/##appName/g, app.name);
                                data_mobile = data_mobile.replace(/##tenant/g, tenant.id);
                                data_mobile = data_mobile.replace(/##server/g, deploymentServerUrl);

                                return db.update(
                                    DB_TENANTS_PREFIX + tenant.id,
                                    'applications',
                                    {"name": app.name},
                                    {$set: {'templates': {
                                        'login_page_web': data,
                                        'login_page_mobile': data_mobile
                                    }}},
                                    {multi: true, upsert: false}
                                );
                            }));
                        });
                    }));
                });
        });
    });
};

