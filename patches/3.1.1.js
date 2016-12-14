const
    Q = require('q'),
    widgets = require('../lib/dfx_widgets.js');

exports.description = 'it updates flex panel attributes to make them integer in view JSON definitions';

exports.run = function (cfg, opts) {
    const
        db = cfg.db,
        DB_TENANTS_PREFIX = opts.SETTINGS.databases_tenants_name_prefix;

    return db.get(
        'dreamface_sysdb',
        'tenants'
    )
        .then(function (result) {
            var tenants = result.map(function (res) {
                return res.id;
            });

            return Q.all(tenants.map(function (tenant) {
                return db.get(
                    DB_TENANTS_PREFIX + tenant,
                    'datawidgets'
                )
                    .then(function(datawidgets){
                        var tasks = [];

                        datawidgets.forEach(function(datawidget) {
                            tasks.push((function () {
                                const D = Q.defer();

                                var updatePanel = function (attributes, gc_type) {
                                    if (gc_type == 'panel' && attributes.flex) {
                                        attributes.flex.value = parseInt(attributes.flex.value);
                                    }
                                };

                                var treatChildrenGCs = function (children) {
                                    for (var i = 0; i < children.length; i++) {
                                        updatePanel(children[i].attributes, children[i].type);
                                        treatChildrenGCs( children[i].children );
                                    }
                                };

                                var wgt_src_json = JSON.parse(datawidget.src);
                                var wgt_definition = wgt_src_json.definition;
                                for (var definition in wgt_definition) {
                                    if (wgt_definition.hasOwnProperty(definition)) {
                                        var next_defs = wgt_definition[definition];
                                        for (var i = 0; i < next_defs.length; i++) {
                                            if (next_defs[i]) {
                                                updatePanel(next_defs[i].attributes, next_defs[i].type);
                                                treatChildrenGCs( next_defs[i].children );
                                            }
                                        }
                                    }
                                }

                                // update widget in database
                                var updated_widget = {
                                    src: JSON.stringify(wgt_src_json),
                                    application: datawidget.application,
                                    platform: datawidget.platform
                                };
                                var fakeReq = {
                                    session : {
                                        user : { id : 'admin' },
                                        tenant : { id : tenant }
                                    }
                                };

                                widgets.set(datawidget.name, datawidget.application, updated_widget, fakeReq, function (err, data) {
                                    D.resolve("View " + datawidget.name + " has been successfully updated");
                                });

                                return D.promise;
                            }()));
                        });
                        return Q.all(tasks);
                    });
            }));
        });
};
