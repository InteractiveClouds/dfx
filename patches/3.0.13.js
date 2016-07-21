const
    Q = require('q'),
    widgets = require('../lib/dfx_widgets.js');

exports.description = 'it removes all not overridden attributes from view JSON definition';

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

                                var isAttributeMandatory = function (attr_name) {
                                    if (attr_name == 'name' || attr_name == 'flex') {
                                        return true;
                                    }
                                    return false;
                                };

                                var removeNotOverriddenAttributes = function (attributes, gc_type) {
                                    for (var attribute in attributes) {
                                        if (attributes.hasOwnProperty(attribute)) {
                                            if (attribute != 'value' && attribute != 'status' && !Array.isArray(attributes[attribute])) {

                                                if (attributes[attribute] !== null && typeof attributes[attribute] === 'object') {
                                                    if (attributes[attribute] && attributes[attribute].status != 'overridden' && !isAttributeMandatory(attribute)) {
                                                        delete attributes[attribute];
                                                    }
                                                    removeNotOverriddenAttributes(attributes[attribute], gc_type);
                                                }
                                            }
                                        }
                                    }
                                };

                                var treatChildrenGCs = function (children) {
                                    for (var i = 0; i < children.length; i++) {
                                        removeNotOverriddenAttributes(children[i].attributes, children[i].type);
                                        treatChildrenGCs( children[i].children );
                                    }
                                };

                                //if (datawidget.name == 'Z12_old') {
                                //    console.log(datawidget);
                                //}

                                var wgt_src_json = JSON.parse(datawidget.src);
                                var wgt_definition = wgt_src_json.definition;
                                for (var definition in wgt_definition) {
                                    if (wgt_definition.hasOwnProperty(definition)) {
                                        removeNotOverriddenAttributes(wgt_definition[definition][0].attributes, wgt_definition[definition][0].type);
                                        treatChildrenGCs( wgt_definition[definition][0].children );
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
