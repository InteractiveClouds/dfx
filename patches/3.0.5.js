const
    Q = require('q'),
    screen_categories = require('../lib/dfx_screens_categories.js'),
    widgets = require('../lib/dfx_widgets.js'),
    screens = require('../lib/dfx_screens.js');

exports.description = 'it sets default platform data to all applications';

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
                'applications'
            )
            .then(function(applications){
                var req = {"session": {"user": {"id": "admin"}, "tenant": {"id": tenant}}};
                var widget_req = {"session": {"user": {"id": "admin"}}, "user" :{"tenantid": tenant}};
                var tasks = [];

                applications.forEach(function(application){

                    tasks.push((function () {
                        const D = Q.defer();
                        var screen_category_definition = {
                            "title": "Default",
                            "ownerId": "",
                            "name": "Default",
                            "application": application.name,
                            "requestDate": new Date(),
                            "visibility": "visible",
                            "versioning": {
                                "status": "added",
                                "user": req.session.user.id,
                                "last_action": (new Date() / 1000).toFixed()
                            }
                        }
                        var defaultScreen = {
                            "title":       "Home",
                            "name":        "Home",
                            "ownerId":     "",
                            "application": application.name,
                            "template"   : "basic",
                            "layout" : {
                                "width" : "100%",
                                "backgroundcolor" : "white",
                                "rows" : [
                                    {
                                        "columns" : [
                                            {
                                                "width" : 100,
                                                "views" : []
                                            }
                                        ]
                                    }
                                ]
                            },
                            "script"     : "dfxAppRuntime.controller('dfx_page_controller', [ '$scope', '$rootScope', function( $scope, $rootScope) {\n\t// Insert your code here\n}",
                            "category":    "Default"
                        };
                        screen_category_definition.platform = "web";
                        screen_categories.createNew(screen_category_definition, req, function () {
                            screen_category_definition.platform = "tablet";
                            screen_categories.createNew(screen_category_definition, req, function () {
                                screen_category_definition.platform = "mobile";
                                screen_categories.createNew(screen_category_definition, req, function () {
                                    defaultScreen.platform = "web";
                                    screens.createNew(defaultScreen, req, function(){
                                        defaultScreen.platform = "tablet";
                                        screens.createNew(defaultScreen, req, function(){
                                            defaultScreen.platform = "mobile";
                                            screens.createNew(defaultScreen, req, function(){
                                                D.resolve();
                                            });
                                        });
                                    });
                                });
                            });
                        });

                        return D.promise;
                    }()));

                    tasks.push((function () {
                        const D = Q.defer();
                        var widget_category_definition = {
                            ownerId: "",
                            name: 'Default',
                            "platform" : "web",
                            application: application.name
                        }
                        widget_category_definition.platform = "web";
                        widgets.createNewCat(widget_category_definition, widget_req, function(){
                            widget_category_definition.platform = "tablet";
                            widgets.createNewCat(widget_category_definition, widget_req, function(){
                                widget_category_definition.platform = "mobile";
                                widgets.createNewCat(widget_category_definition, widget_req, function(){
                                    D.resolve();
                                });
                            });
                        });

                        return D.promise;
                    }()));
                });
                return Q.all(tasks);
            });
        }));
    });
};
