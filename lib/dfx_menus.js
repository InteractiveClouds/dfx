/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var SETTINGS   = require('./dfx_settings'),
    mdbw,
    Q          = require('q'),
    jade       = require('jade'),
    fs         = require('graceful-fs'),
    endpoints  = require('./utils/endpoints'),
    path       = require('path'),
    log        = new (require('./utils/log')).Instance({label: "MENUS"}),
    _          = require('lodash');

var DB_TENANTS_PREFIX = SETTINGS.databases_tenants_name_prefix,
    DB_SORT_ASC       = 1,
    DB_SORT_DESC      = -1;

var Menus = {};

var api = {
    create: function (parsed) {
        var D = Q.defer();
        Menus.createNew(parsed.menuParameters, parsed.req, function (err, data) {
            return err
                ? D.resolve(err)
                : D.resolve('Menu item was created!')
        });
        return D.promise;
    },

    delete: function (parsed) {
        var D = Q.defer();
        Menus.deleteItem(parsed.menuParameters.menuItemName, parsed.menuParameters.applicationName, parsed.req, function () {
            return D.resolve('Menu item ' + parsed.menuParameters.menuItemName + ' has been deleted successfully!')
        });
        return D.promise;
    },

    update: function (parsed) {
        var D = Q.defer();
        Menus.set(parsed.menuParameters.menuItemName, parsed.menuParameters.applicationName, parsed.menuParameters.change, parsed.req, function (data) {
            return !data
                ? D.reject("Error during menu item update!")
                : D.resolve('Menu item ' + parsed.menuParameters.menuItemName + ' has been updated successfully!')
        });
        return D.promise;
    },

    updateOrder: function (parsed) {
        var D = Q.defer();
        Menus.setOrder(parsed.menuParameters.menuItemName, parsed.menuParameters.applicationName, parsed.menuParameters.change, parsed.menuParameters.items, parsed.req, function (data) {
            return !data
                ? D.reject("Error during menu items order update!")
                : D.resolve('Menu items order has been updated successfully!')
        });
        return D.promise;
    }
};

if ( SETTINGS.studio ) {
    var versioning = require('./dfx_applications_versioning');
}

Menus.init = function( o ) {
    mdbw = o.storage;

    delete Menus.init;
};

Menus.api = endpoints.json({
    parser: function (req) {
        return {
            action: req.params.action,
            data:   {
                menuParameters: req.body,
                req:            req
            }
        }
    },
    action: api,
    log:    log
});

Menus.getMenu = function (req, res) {
    Menus.get(req.params.itemName, req.params.applicationName, req, function (item) {
        res.end(JSON.stringify({
            item: item
        }));
    });
};

Menus.getList = function (req, res) {
    Menus.getAll(req, function (list) {
        res.end(JSON.stringify({
            items: list
        }));
    });
};

Menus.countByApp = function (req, res) {
    Menus.count({application: req.params.applicationName}, req, function (quantity) {
        res.end(JSON.stringify({
            nbmenuitems: quantity
        }));
    });
};

Menus.count = function (query, req, callback) {
    mdbw.count(DB_TENANTS_PREFIX + req.session.tenant.id, 'application_menus', query)
        .then(function (quantity) {
            callback(quantity);
        })
        .fail(function (error) {
            log.error(error);
        });
};

Menus.searchByApp = function (req, res) {
    var filter = {
        $or:         [
            {
                name: {
                    $regex:   req.query.q,
                    $options: 'i'
                }
            },
            {
                title: {
                    $regex:   req.query.q,
                    $options: 'i'
                }
            }
        ],
        application: req.params.applicationName
    };
    Menus.getAllWithFilter(filter, req, function (arr_menu_items) {
        if (!arr_menu_items) {
            return res.end("{menu_items:[]}");
        }
        res.end(JSON.stringify({
            menu_items: arr_menu_items
        }));
    });
};

Menus.getAllWithFilter = function (filter, req, callback) {
    mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'application_menus', filter)
        .then(function (docs) {
            callback(docs);
        });
};

Menus.getMobileMenu = function (req, res) {
    Menus.getMenuDefinition(req.params.tenantid, req.params.appname, req.params.menuname, req, function (menu) {
        res.end(JSON.stringify({
            definition: menu
        }));
    });
};

Menus.createNew = function (menuItemParameters, req, callback) {
    var self = this;
    Menus.getNewJSON(function (json) {
        json.title       = menuItemParameters.title;
        json.name        = menuItemParameters.name;
        json.requestDate = new Date();
        json.ownerId     = menuItemParameters.ownerId;
        json.application = menuItemParameters.application;
        json.order       = menuItemParameters.order;
        if (menuItemParameters.parentname != null && menuItemParameters.parentname != '') {
            json.parentname = menuItemParameters.parentname;
        }
        if (menuItemParameters.action != null && menuItemParameters.action != '') {
            json.action = menuItemParameters.action;
        }
        if (menuItemParameters.icon != null && menuItemParameters.icon != '') {
            json.icon = menuItemParameters.icon;
        }
        mdbw.exists(DB_TENANTS_PREFIX + req.session.tenant.id, 'application_menus', {
            'name':        menuItemParameters.name,
            'application': menuItemParameters.application
        }).then(function (exists) {
            if (!exists) {
                Menus.getAll(menuItemParameters.application, req, function (menuItems) {
                    var lastOne = menuItems.sort(function (a, b) {
                        return parseInt(b.order) - parseInt(a.order);
                    }).shift();
                    //console.log('177 lastOne: ', lastOne);
                    var order   = lastOne ? parseInt(lastOne.order) + 1 : 0;
                    json.order  = order.toString();
                    mdbw.rm(DB_TENANTS_PREFIX + req.session.tenant.id, 'trash',{
                        'name':        menuItemParameters.name,
                        'application': menuItemParameters.application,
                        'type' : 'appMenus'
                    }).then(function() {
                        mdbw.put(DB_TENANTS_PREFIX + req.session.tenant.id, 'application_menus', json)
                            .then(function (menu_item_id) {
                                versioning.setModifyStatusToApp(menuItemParameters.application, req);
                                callback(null, menu_item_id);
                            });
                    });
                });
            } else {
                callback('Menu item with same name already exists!', null);
            }
        });
    });
};

Menus.getNewJSON = function (callback) {
    fs.readFile(path.join(__dirname, '..', 'templates/static_json/blanks/menu-item.json'), 'utf8', function (err_log, data) {
        callback(JSON.parse(data));
    });
};

Menus.get = function (menuName, applicationName, req, callback) {
    var filter = {application: applicationName, name: menuName};
    mdbw.getOne(DB_TENANTS_PREFIX + req.session.tenant.id, 'application_menus', filter)
        .then(function (doc) {
            callback(doc);
        });
};

Menus.getAllItems = function (req, res) {
    Menus.getAll(req.params.applicationName, req, function (menuItems) {
        res.end(JSON.stringify({
            menuItems: menuItems
        }));
    });
};

Menus.getAll = function (applicationName, req, callback) {
    var filter = {application: applicationName};
    mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'application_menus', filter, {order: DB_SORT_ASC})
        .then(function (nodes) {
            var map   = {};
            nodes.forEach(function (node, idx) {
                node.order     = typeof node.order == 'undefined' ? '0' : node.order;
                map[node.name] = idx;
                node.children  = [];
            });
            nodes.forEach(function (node) {
                if (node.parentname) {
                    nodes[map[node.parentname]].children.push(node);
                }
            });
            var roots = nodes.filter(function (node) {
                return !node.parentname;
            });
            callback(roots);
        });
};

Menus.getAllForAllApps = function (req, callback) {
    mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'application_menus', {}, {order: DB_SORT_ASC})
        .then(function (nodes) {
            var map   = {};
            nodes.forEach(function (node, idx) {
                node.order = typeof node.order == 'undefined' ? '0' : node.order;
                if (!map.hasOwnProperty(node.application)) {
                    map[node.application] = {};
                }
                map[node.application][node.name] = idx;
                node.children                    = [];
            });
            nodes.forEach(function (node) {
                if (node.parentname && map[node.application][node.parentname]) {
                    nodes[map[node.application][node.parentname]].children.push(node);
                }
            });
            var roots = nodes.filter(function (node) {
                return !node.parentname;
            });
            callback(roots);
        });
};

Menus.getAllAsPromise = function (applicationName, req) {
    return mdbw.get(DB_TENANTS_PREFIX + req.session.tenant.id, 'application_menus', {application: applicationName}, {order: DB_SORT_ASC});
};

Menus.set = function (menuItemName, applicationName, menu, req, callback) {
    menu.requestDate = new Date();
    mdbw.update(DB_TENANTS_PREFIX + req.session.tenant.id, 'application_menus', {
        name:        menuItemName,
        application: applicationName
    }, {$set: menu})
        .then(function (quantity) {
            versioning.setModifyStatusToApp(applicationName, req);
            callback(quantity);
        })
        .fail(function (err) {
            console.log(err);
        });
};

Menus.setOrder = function (menuItemName, applicationName, menu, items, req, callback) {
    menu.requestDate = new Date();
    mdbw.update(DB_TENANTS_PREFIX + req.session.tenant.id, 'application_menus', {
        name:        menuItemName,
        application: applicationName
    }, {$set: menu}).then(function (quantity) {
        if (items.length !== 0) {
            _.forEach(items, function (item) {
                mdbw.update(DB_TENANTS_PREFIX + req.session.tenant.id, 'application_menus', {
                    name:        item.menuItemName,
                    application: applicationName
                }, {$set: {order: item.order}}).then(function (q) {
                    quantity += q;
                }).fail(function (err) {
                    console.log(err);
                });
            });
        }

        versioning.setModifyStatusToApp(applicationName, req);
        callback(quantity);
    }).fail(function (err) {
        console.log(err);
    });
};

Menus.deleteAll = function (applicationName, req, callback) {
    mdbw.rm(DB_TENANTS_PREFIX + req.session.tenant.id, 'application_menus', {application: applicationName})
        .then(function (quantity) {
            versioning.setModifyStatusToApp(applicationName, req);
            if (callback) {
                callback();
            }
        });
};

Menus.deleteItem = function (menuItemName, applicationName, req, callback) {
    // TODO: recursion for children
    var moveToTrash = function(o) {
        return mdbw.get(DB_TENANTS_PREFIX + o.tenantId, 'application_menus', {name: o.name, application: o.application})
            .then(function(menus){
                menus[0].type = "appMenus";
                return mdbw.put(DB_TENANTS_PREFIX + o.tenantId, 'trash',menus[0]);
            });
    };

    moveToTrash({
        tenantId : req.session.tenant.id,
        name : menuItemName,
        application : applicationName
    })
        .then(function(){
            Menus.get(menuItemName, applicationName, req, function (app_menu_item) {
                mdbw.rm(DB_TENANTS_PREFIX + req.session.tenant.id, 'application_menus', {
                    parentname:  app_menu_item.name,
                    application: applicationName
                })
                    .then(function (quantity) {
                        versioning.setModifyStatusToApp(applicationName, req);
                        mdbw.rm(DB_TENANTS_PREFIX + req.session.tenant.id, 'application_menus', {
                            name:        app_menu_item.name,
                            application: applicationName
                        });
                        if (callback) {
                            callback();
                        }
                    });
            });
        });
};

Menus.getMenuDefinition = function (tenantid, app_name, menu_name, req, callback) {
    var applications = require('./dfx_applications');
    applications.getMenuItemsConfigurationList(app_name, req, function (app_conf) {
        Menus.getAll(app_name, req, function (app_menu) {
            var idx  = 0,
                menu = [];
            for (idx = 0; idx < app_menu.length; idx++) {
                var menu_item = Menus.getMenuItem(app_menu[idx], app_conf, req.session.userDefinition);
                if (menu_item) {
                    menu.push(menu_item);
                }
            }
            callback(menu);
        }).fail(function (err) {
            console.log(err);
        });
    });
};

Menus.getMenuItem = function (app_menu_item, app_conf, userDefinition) {
    var child_idx = 0,
        menu_item = {};

    // apply application configuration
    if (!Menus.includeMenuItem(app_conf, userDefinition, app_menu_item)) {
        return null;
    }

    menu_item.label = (app_menu_item.title) ? app_menu_item.title : app_menu_item.name;
    if (app_menu_item.action.type == 'screen') {
        menu_item.action     = app_menu_item.action.value + '.html';
        menu_item.icon_class = 'glyphicon glyphicon-' + app_menu_item.icon;
    } else if (app_menu_item.action.type == 'widget') {
        menu_item.action     = app_menu_item.action.value + '.html';
        menu_item.widget     = app_menu_item.action.value;
        menu_item.icon_class = 'icon icon-' + app_menu_item.icon;
    } else {
        menu_item.action = '#';
    }

    menu_item.children = [];
    for (child_idx = 0; child_idx < app_menu_item.children.length; child_idx++) {
        var menu_item_children = Menus.getMenuItem(app_menu_item.children[child_idx], app_conf, userDefinition);
        if (menu_item_children) {
            menu_item.children.push(menu_item_children);
        }
    }
    return menu_item;
};

Menus.includeMenuItem = function (app_conf, userDefinition, app_menu_item) {
    for (var i = 0; i < app_conf.length; i++) {
        if (userDefinition.roles.list.indexOf(app_conf[i].role) > -1) {
            if (app_conf[i].name == app_menu_item.name) {
                for (var j = 0; j < app_conf[i].attributes.length; j++) {
                    var app_conf_attr = app_conf[i].attributes[j];
                    if (app_conf_attr.name == "visible" && app_conf_attr.value == "false") {
                        return false;
                    }
                }
            }
        }
    }
    return true;
};

module.exports = Menus;
