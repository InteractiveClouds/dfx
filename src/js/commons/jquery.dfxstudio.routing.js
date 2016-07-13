/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/**
 * HttpException
 * Handles HTTP errors and shows error screen
 * @param status HTTP status
 * @param message Error message
 * @constructor
 */
function HttpException(status, message) {
    this.constructor.prototype.__proto__ = Error.prototype;
    Error.captureStackTrace(this, this.constructor);
    this.name                            = this.constructor.name;
    this.status                          = status;
    this.message                         = message;
    this.handler                         = function () {
        switch (status) {
            case 404:
                DfxStudio.loadScreen({screenname: 'error404'});
                break;
            case 401:
                var tenantid = $('.label.label-info').html();
                $(".dfx_content").empty().append(DfxStudio.templates.errors['401']({tenantid: tenantid}));
                break;
            case 403:
                DfxStudio.loadScreen({screenname: 'error403'});
                break;
            case 500:
                DfxStudio.loadScreen({screenname: 'error500'});
                break;
            default:
                DfxStudio.loadScreen({screenname: 'error'});
                break;
        }
    };
}

DfxStudio.Dispatcher = (function ($, window, document, undefined) {

    var _private = {
            options: {},

            confirmNavigation: false,

            getHash: function () {
                return window.location.hash !== '' ? window.location.hash : window.location.hash = this.options.defaultRoute;
            },

            getLocation: function () {
                return window.location;
            },

            getRoute: function () {
                return this.options.route !== null ? this.options.route : this.options.route = this.getHash();
            },

            setHistory: function (route, state) {
                state        = state === undefined ? {} : state;
                var title    = '',
                    location = this.getLocation(),
                    url      = location.pathname +
                        route;
                return window.history.pushState(state, title, url);
            },

            loadTemplates: function () {
                h.loadTemplates('errors');
            },

            mapRoutes: function (mapping) {
                var self = this;
                mapping.forEach(function (e) {
                    var route = {
                        verb:     e[0],
                        path:     e[1],
                        callback: e[2],
                        regex:    self.getRegex(e[1]),
                        params:   self.getParams(e[1]),
                        menuItem: e[3]
                    };
                    self.options.mapping.push(route);
                });
            },

            getRegex: function (path) {
                var chunks = this.trimPath(path).split('/'),
                    re     = '^' + this.options.prefix.replace(/([!/])/g, function (m, c) {
                            return '\\' + c;
                        }) + chunks.map(function (c) {
                            return c.charAt(0) == ':' ? '([^/]*)' : c;
                        }).join('\\/') + '\\/?$';
                return new RegExp(re);
            },

            getParams: function (path) {
                var self    = this,
                    trimmed = self.trimPath(path),
                    chunks  = trimmed.split('/'),
                    params  = [];
                chunks.forEach(function (chunk) {
                    if (chunk.charAt(0) == ':') {
                        params.push(chunk.slice(1));
                    }
                });
                return params;
            },

            trimPath: function (path) {
                var trimmed = path.replace(this.options.prefix, '');
                if ('/' == trimmed.slice(-1)) {
                    trimmed = trimmed.slice(0, -1);
                }
                return trimmed;
            },

            lookupRoute: function (verb, route) {
                var obj;
                if (obj = this.options.mapping.find(function (e) {
                        return e.verb == verb && route.match(e.regex);
                    })) {
                    return obj;
                }
                try {
                    throw new HttpException(404, '');
                } catch (e) {
                    e.handler();
                }
            },

            runRoute: function (route, verb, data, nosave) {
                var params = {};
                if (nosave === undefined) {
                    this.setHistory(route, {state: route + '_' + Date.now().toString()});
                }
                var obj = this.lookupRoute(verb, route);
                if (obj.params.length != 0) {
                    var vals = route.match(obj.regex);
                    for (var i = 0; i < obj.params.length; i++) {
                        params[obj.params[i]] = vals[i + 1];
                    }
                }
                if (typeof obj.callback !== 'function') {
                    throw new TypeError('predicate must be a function');
                }
                obj.callback.call(this, params);
                this.toggleMenu(obj.menuItem);
            },

            attachHandlers: function () {
                var self = this;

                $(window).bind('popstate', function (e) {
                    var route = self.getHash(),
                        verb  = 'get';//,
//                        state = e.state;
                    if (self.options.init !== undefined && self.options.init) {
                        self.runRoute(route, verb, self.lookupRoute(verb, route), {});
                    }
                });

            },

            toggleMenu: function (menuItem) {
                var $menuItems = $('#dfxStudioMainMenu'),
                    $li        = $('[data-item=' + menuItem + ']', $menuItems);
                if (menuItem !== undefined && !$li.hasClass('active')) {
                    $('li', $menuItems).removeClass('active');
                    $li.addClass('active');
                }
            }

        },

        exports  = {

            routing: [
                ['get', '#!/home/', function () {
                    h.loadTemplates('app-config').then(function () {
                        DfxStudio.loadScreen({
                            screenname: 'home',
                            complete:   function () {
                                DfxStudio.recentActivity.init().show();
                                DfxStudio.Home.init();
                            }
                        });
                    });
                }, 'home'],
                ['get', '#!/home/cloud-platform/:action/', function (options) {
                    options.component = 'cloud-platform';
                    if (!DfxStudio.Home.isInitialized()) {
                        h.loadTemplates('app-config').then(function () {
                            DfxStudio.loadScreen({
                                screenname: 'home',
                                complete:   function () {
                                    DfxStudio.Home.init().run(options);
                                }
                            });
                        });
                    } else {
                        DfxStudio.Home.run(options);
                    }
                }, 'home'],
                // :action list|create|edit
                ['get', '#!/home/:applicationName/:component/:componentName/:action', function (options) {
                    if (!DfxStudio.Home.isInitialized()) {
                        h.loadTemplates('app-config', true).then(function () {
                            DfxStudio.loadScreen({
                                screenname: 'home',
                                complete:   function () {
                                    DfxStudio.Home.init().run(options);
                                }
                            });
                        });
                    } else {
                        DfxStudio.Home.init().run(options);
                    }
                }, 'home'],
                ['get', '#!/home/:applicationName/:component/:action', function (options) {
                    if (!DfxStudio.Home.isInitialized()) {
                        h.loadTemplates('app-config').then(function () {
                            DfxStudio.loadScreen({
                                screenname: 'home',
                                complete:   function () {
                                    DfxStudio.Home.init().run(options);
                                }
                            });
                        });
                    } else {
                        DfxStudio.Home.init().run(options);
                    }
                }, 'home'],
                ['get', '#!/home/:applicationName/:component', function (options) {
                    if (!DfxStudio.Home.isInitialized()) {
                        h.loadTemplates('app-config').then(function () {
                            DfxStudio.loadScreen({
                                screenname: 'home',
                                complete:   function () {
                                    DfxStudio.Home.init().run(options);
                                }
                            });
                        });
                    } else {
                        DfxStudio.Home.init().run(options);
                    }
                }, 'home'],
                ['get', '#!/catalog/', function () {
                    DfxStudio.loadScreen({
                        screenname: 'dashboard',
                        complete:   function () {
                            DfxStudio.Dashboard.init();
                        }
                    });
                }, 'catalog'],
                ['get', '#!/catalog/application/create/', function (options) {
                    DfxStudio.loadScreen({
                        screenname: 'application/create',
                        complete:   function () {
                            var $formInput = $('input,select', '#createApplicationForm');
                            $formInput.on('change', DfxStudio.Dashboard.formChanged);
                            DfxStudio.Dashboard.attachSaveNowHandler($('.save-now-submitter'));
                        }
                    });
                }, 'catalog'],
                ['get', '#!/catalog/widget/create/', function (options) {
                    DfxStudio.loadScreen({
                        screenname: 'widget/create',
                        complete:   function () {
                            var $formInput = $('input,select', '#createWidgetForm');
                            $formInput.on('change', DfxStudio.Dashboard.formChanged);
                            DfxStudio.Dashboard.attachSaveNowHandler($('.save-now-submitter'));
                        }
                    });
                }, 'catalog'],
                ['get', '#!/catalog/application/:applicationName/widget/create/', function (options) {
                    DfxStudio.loadScreen({
                        screenname: 'widget/create',
                        complete:   function () {
                            var $formInput = $('input,select', '#createWidgetForm');
                            $formInput.on('change', DfxStudio.Dashboard.formChanged);
                            DfxStudio.Dashboard.attachSaveNowHandler($('.save-now-submitter'));
                            $('#fldApplication').val(options.applicationName);
                        }
                    });
                }, 'catalog'],
                ['get', '#!/catalog/query/create/', function (options) {
                    DfxStudio.loadScreen({
                        screenname: 'query/create',
                        complete:   function () {
                            var $formInput = $('input,select', '#createDataqueryForm');
                            $formInput.on('change', DfxStudio.Dashboard.formChanged);
                            DfxStudio.Dashboard.attachSaveNowHandler($('.save-now-submitter'));
                        }
                    });
                }, 'catalog'],
                ['get', '#!/catalog/application/:applicationName/query/create/', function (options) {
                    DfxStudio.loadScreen({
                        screenname: 'query/create',
                        complete:   function () {
                            var $formInput = $('input,select', '#createDataqueryForm');
                            $formInput.on('change', DfxStudio.Dashboard.formChanged);
                            DfxStudio.Dashboard.attachSaveNowHandler($('.save-now-submitter'));
                            $('#queryApp').val(options.applicationName);
                        }
                    });
                }, 'catalog'],
                ['get', '#!/catalog/application/:applicationName/', function (options) {
                    DfxStudio.loadScreen({
                        screenname: 'application/view/' + options.applicationName,
                        complete:   function () {
                            var $formInput    = $('input,select:not(.role-selector)', '#applicationForm'),
                                $roleSelector = $('#role-selector', '#applicationForm');
                            $formInput.on('change', DfxStudio.Dashboard.formChanged);
                            $roleSelector.on('change', DfxStudio.Dashboard.onRoleSelect);
                            DfxStudio.Dashboard.attachSaveNowHandler($('.save-now-submitter'));
                        }
                    });
                }, 'catalog'],
                ['get', '#!/catalog/application/:applicationName/screens/', function (options) {
                    DfxStudio.loadScreen({
                        screenname: 'application/screens/' + options.applicationName,
                        complete:   function () {
                            DfxStudio.Screens.init();
                        }
                    });
                }, 'catalog'],
                ['get', '#!/catalog/application/:applicationName/menu/', function (options) {
                    DfxStudio.loadScreen({
                        screenname: 'application/menu/' + options.applicationName,
                        complete:   function () {
                            DfxStudio.Menu.init();
                        }
                    });
                }, 'catalog'],
                ['get', '#!/catalog/application/:applicationName/role/:role/screens/', function (options) {
                    DfxStudio.loadScreen({
                        screenname: 'application/screens/' + options.applicationName + '/role/' + options.role,
                        complete:   function () {
                            //DfxStudio.Menu.init();
                        }
                    });
                }, 'catalog'],
                ['get', '#!/catalog/application/:applicationName/screens/:screen/control/:control/id/:id/widget/:widget/widgetid/:widgetid/role/:role/', function (options) {
                    DfxStudio.loadScreen({
                        screenname: 'application/screens/' + options.applicationName + '/role/' + options.role,
                        complete:   function () {
                            DfxStudio.Dashboard.initConfigureGraphicalComponents(options);
                        }
                    });
                }, 'catalog'],
                ['get', '#!/catalog/application/:applicationName/snapshot/', function (options) {
                    DfxStudio.loadScreen({
                        screenname: 'application/snapshot/' + options.applicationName,
                        complete:   function () {
                            DfxStudio.Dashboard.initAppConfMatrix();
                        }

                    });
                }, 'catalog'],
                ['get', '#!/catalog/application/:applicationName/role/:role/menu/', function (options) {
                    DfxStudio.loadScreen({
                        screenname: 'application/menu/' + options.applicationName + '/role/' + options.role,
                        complete:   function () {
                            DfxStudio.Dashboard.initMenuItemsTree();
                        }
                    });
                }, 'catalog'],
                ['get', '#!/catalog/application/:applicationName/menu/:menuItem/role/:role/', function (options) {
                    DfxStudio.loadScreen({
                        screenname: 'application/menu/' + options.applicationName + '/role/' + options.role,
                        complete:   function () {
                            DfxStudio.Dashboard.initMenuItemsTree(options.menuItem);
                        }
                    });
                }, 'catalog'],
                ['get', '#!/catalog/query/:queryName/', function (options) {
                    DfxStudio.loadScreen({
                        screenname: 'query/view/' + options.queryName,
                        complete:   function () {
                            var $formInput = $('input,select', '#dataqueryForm');
                            $formInput.on('change', DfxStudio.Dashboard.formChanged);
                            DfxStudio.Dashboard.attachSaveNowHandler($('.save-now-submitter'));
                        }
                    });
                }, 'catalog'],
                ['get', '#!/catalog/widget/:widgetName/', function (options) {
                    DfxStudio.loadScreen({
                        screenname: 'widget/view/' + options.widgetName,
                        complete:   function () {
                            var $formInput = $('input,select', '#widgetForm');
                            $formInput.on('change', DfxStudio.Dashboard.formChanged);
                            DfxStudio.Dashboard.attachSaveNowHandler($('.save-now-submitter'));
                        }
                    });
                }, 'catalog'],
                ['get', '#!/catalog/widget-migrate/:widgetName/', function (options) {
                    DfxStudio.loadScreen({
                        screenname: 'widget/migrate/' + options.widgetName,
                        complete:   function () {
                            var $formInput = $('input,select', '#widgetForm');
                            $formInput.on('change', DfxStudio.Dashboard.formChanged);
                            DfxStudio.Dashboard.attachSaveNowHandler($('.save-now-submitter'));
                        }
                    });
                }, 'catalog'],
                ['get', '#!/catalog/:applicationName/widget/:widgetName/edit_ui/', function (options) {
                    //$('#dfx_visual_editor_include').attr('ng-include', '/studio/widget/editui/' + options.applicationName + '/' + options.widgetName);
                    $('.dfx_content').attr('application_name', options.applicationName);
                    $('.dfx_content').attr('view_name', options.widgetName);
                    angular.element(document.getElementById('dfx-studio-body')).scope().initView(options.applicationName, options.widgetName);
                    /*DfxStudio.loadScreen({
                        screenname: 'widget/editui/' + options.applicationName + '/' + options.widgetName,
                        complete:   function () {
                            var editor        = ace.edit('dfx_src_editor');
                            editor.setTheme('ace/theme/tomorrow');
                            editor.setShowPrintMargin(false);
                            editor.gotoLine(1);
                            var editor_script = ace.edit('dfx_script_editor');
                            editor_script.setTheme('ace/theme/tomorrow');
                            editor_script.getSession().setMode('ace/mode/javascript');
                            editor_script.setShowPrintMargin(false);
                            editor_script.gotoLine(1);
                            var editor_styles = ace.edit('dfx_styles_editor');
                            editor_styles.setTheme('ace/theme/tomorrow');
                            editor_styles.getSession().setMode('ace/mode/css');
                            editor_styles.setShowPrintMargin(false);
                            editor_styles.gotoLine(1);

                            var widget_type = $('#dfx_visual_editor').attr('widget-type');
                            if (widget_type == 'visual') {
                                editor.getSession().setMode('ace/mode/json');
                                DfxVisualBuilder.init();
                                $('#dfx_visual_editor_view_source').css('display', 'block');
                            } else {
                                editor.getSession().setMode('ace/mode/jade');
                                $('#dfx_src_editor').css('display', 'block');
                            }
                        }
                    });*/
                }, 'catalog'],
                ['get', '#!/databases/', function () {
                    DfxStudio.databases.init();
                }, 'databases'],
                ['get', '#!/dockerisation/', function () {
                    DfxStudio.dockerisation.init();
                }, 'dockerisation'],
                ['get', '#!/github/', function () {
                    DfxStudio.loadScreen({
                        screenname: 'github/select-components',
                        complete:   function () {
                            $('form').on('change', 'input[data-app]', function () {
                                var app = $(this).data('app');
                                $('form input[id^=selectComponentsForm_checkboxes_' + app + '_]').prop('checked', $(this).prop('checked'));
                            });
                        }
                    });
                }, 'github'],
                // DFX Studio Settings Module
                ['get', '#!/settings/', function () {
                    h.loadTemplates('settings').then(function () {
                        DfxStudio.Settings.init();
                    });
                }, 'settings'],
                ['get', '#!/settings/:submodule/', function (options) {
                    h.loadTemplates('settings').then(function () {
                        DfxStudio.Settings.init(options.submodule).run();
                    });
                }, 'settings'],
                ['get', '#!/settings/:submodule/:parameter/', function (options) {
                    h.loadTemplates('settings').then(function () {
                        DfxStudio.Settings.init(options.submodule).run(options.parameter);
                    });
                }, 'settings'],
                // DFX Studio Settings Module END
                ['get', '#!/feedback/', function () {
                    DfxStudio.loadScreen({screenname: 'feedback'});
                }, 'settings'],
                    ['get', '#!/catalog/:applicationName/:component/:name/:number/:action/', function (options) {
                    DfxStudio.Home.init().run(options);
                }, 'home']
            ],

            init: function (settings) {
                if (_private.options.init !== undefined && _private.options.init) {
                    console.log('Dispatcher is inited.');
                }
                var defaults          = {
                    route:        null,
                    prefix:       '#',
                    defaultRoute: '#',
                    error:        {
                        method: 'The method you called is not defined.'
                    },
                    mapping:      []
                };
                _private.options      = $.extend({}, defaults, settings);
                _private.mapRoutes(this.routing);
                _private.loadTemplates();
                _private.attachHandlers();
                _private.options.init = true;
                return this;
            },

            setHistory: function (route) {
                _private.setHistory(route, {state: route + '_' + Date.now().toString()});
            },

            run: function (route, verb, data, nosave) {
                route = route === undefined ? _private.getRoute() : route;
                verb  = verb === undefined ? 'get' : verb;
                data  = data === undefined ? {} : data;
                if (_private.confirmNavigation) {
                    DfxStudio.Dialogs.confirmDialog({
                        prompt:           'Confirm Navigation',
                        body:             'You have made changes.<br>Are you sure you want to navigate away and lose your changes?',
                        positiveButton:   'Yes',
                        negativeButton:   'No',
                        positiveCallback: function () {
                            _private.confirmNavigation = false;
                            $('.marker-form-changed').hide();
                            _private.runRoute(route, verb, data, nosave);
                        },
                        negativeCallback: function () {

                        }
                    });
                } else {
                    _private.runRoute(route, verb, data, nosave);
                }
            },

            setConfirmNavigation: function (status) {
                _private.confirmNavigation = status;
            },

            getConfirmNavigation: function () {
                return _private.confirmNavigation;
            }
        };

    return exports;

})(jQuery, window, document);
