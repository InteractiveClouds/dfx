var dfxSystemModules = ['ngRoute', 'ngMaterial', 'dfxGControls', 'dfxAppServices', 'dfxStudioApi', 'nvd3'];
if (typeof dfxAppRuntimeModules != 'undefined')
    dfxSystemModules = dfxSystemModules.concat(dfxAppRuntimeModules);
var dfxAppRuntime = angular.module('dfxAppRuntime', dfxSystemModules);

dfxAppRuntime
    .config( function($routeProvider) {
        $routeProvider
        .when('/page.html', {
            controller: 'dfx_page_controller',
            templateUrl: 'page.html'
        })
        .otherwise({
            redirectTo: '/page.html'
        });
    })
    .config( function($mdThemingProvider) {
        $mdThemingProvider.theme('altTheme')
        .primaryPalette('blue')
        $mdThemingProvider.setDefaultTheme('altTheme');
    });

dfxAppRuntime.controller('dfx_login_controller', [ '$scope', '$rootScope', function( $scope, $rootScope) {
    $scope.uid = '';
    $scope.pwd = '';

    $scope._dfx_server = sessionStorage.dfx_server;

    sessionStorage.setItem( 'applicationToken', '' );

    $('#username').focus();

    /*$scope.login = function() {
        $http({
            method: 'POST',
            url: sessionStorage.dfx_server + '/app/login',
            data: {
                tenantid  : sessionStorage.dfx_tenantid,
                appid     : sessionStorage.dfx_appname,
                ispreview : sessionStorage.dfx_ispreview,
                userid    : $scope.uid
            }
        }).then(function successCallback(response) {

        });
    };*/
}]);

dfxAppRuntime.controller('dfx_app_controller', [ '$scope', '$rootScope', 'dfxAuthRequest', '$q', '$http', '$compile', 'dfxPages', function( $scope, $rootScope, dfxAuthRequest, $q, $http, $compile, dfxPages) {
	$scope.app_name = $('body').attr('dfx-app');
    $scope.platform = $('body').attr('dfx-platform');
    $scope.gc_types = {};
    $scope.page_name = 'Home';
    $scope.app_user = $user;

    $scope.design_devices = [
        {
            'name':     'iphone5',
            'label':    '320x568 (Apple iPhone 5)',
            'portrait' : {
                'image':  'iphone_5_320x568.png',
                'width':  '376px',
                'height': '794px',
                'padding-top': '110px',
                'padding-left': '30px',
                'padding-right': '30px',
                'padding-bottom': '120px'
            },
            'landscape': {
                'image':  'iphone_5_landscape_320x568.png',
                'width':  '794px',
                'height': '376px',
                'padding-top': '30px',
                'padding-left': '110px',
                'padding-right': '120px',
                'padding-bottom': '30px'
            }
        },
        {
            'name':     'iphone6',
            'label':    '375x667 (Apple iPhone 6)',
            'portrait' : {
                'image':  'iphone_6_375x667.png',
                'width':  '432px',
                'height': '880px',
                'padding-top': '109px',
                'padding-left': '31px',
                'padding-right': '30px',
                'padding-bottom': '30px'
            },
            'landscape': {
                'image':  'iphone_6_landscape_375x667.png',
                'width':  '880px',
                'height': '432px',
                'padding-top': '30px',
                'padding-left': '109px',
                'padding-right': '108px',
                'padding-bottom': '30px'
            }
        },
        {
            'name':     'iphone6plus',
            'label':    '414x736 (Apple iPhone 6+)',
            'portrait' : {
                'image':  'iphone_6plus_414x736.png',
                'width':  '471px',
                'height': '955px',
                'padding-top': '103px',
                'padding-left': '31px',
                'padding-right': '30px',
                'padding-bottom': '30px'
            },
            'landscape': {
                'image':  'iphone_6plus_landscape_414x736.png',
                'width':  '955px',
                'height': '471px',
                'padding-top': '30px',
                'padding-left': '103px',
                'padding-right': '120px',
                'padding-bottom': '30px'
            }
        }
    ];
    $scope.design_selected_device = $scope.design_devices[0];
    $scope.design_device_orientation = 'Portrait';

    $scope.getGCDefaultAttributes = function( type ) {
        var deferred = $q.defer();
        if ($scope.gc_types[type] != null) {
            deferred.resolve( $scope.gc_types[type] );
        } else {
            $http.get( '/gcontrols/web/' + type + '.json' ).success( function(data) {
                $scope.gc_types[type] = data;
                deferred.resolve( data );
            });
        }
        return deferred.promise;
    }

    $scope.logout = function() {
        authRequest.removeToken();

    }
}]);

dfxAppRuntime.controller('dfx_page_controller', [ '$scope', '$rootScope', 'dfxAuthRequest', '$q', '$http', '$compile', '$routeParams', '$location', 'dfxPages', function( $scope, $rootScope, dfxAuthRequest, $q, $http, $compile, $routeParams, $location, dfxPages) {

    $scope.page_preview = false;
    $scope.page_name = ($routeParams.name) ? $routeParams.name : 'Home';

    if ($location.search().preview=='true') {
        $scope.page_preview = true;
    }

    $scope.loadPageDefinition = function() {
        if ($scope.page_preview) {
            $http({
                method: 'GET',
                url: '/studio/screen/item/' + $scope.page_name + '/' + $scope.app_name + '/' + 'web'
            }).then(function successCallback(response) {
                $scope.selected_page = response.data.screen;
                $scope.loadPageTemplate(response.data.screen.template);
            });
        } else {
            $http({
                method: 'GET',
                url: 'pages/' + $scope.page_name + '.json'
            }).then(function successCallback(request) {
                $scope.selected_page = request.data;
                $scope.loadPageTemplate(request.data.template);
            });
        }
    };

    $scope.loadPageTemplate = function(template) {
        /*dfxTemplates.getOne( $scope, $scope.app_name, template )
        .then( function(template) {
            $scope.selected_template = template;
            var snippet = '<div layout="column" flex dfx-page-template="' + template.name + '"></div>';
            $('#dfx_page_content').empty();
            angular.element(document.getElementById('dfx_page_content')).append($compile(snippet)($scope));
        });*/
        if ($scope.page_preview) {
            $http({
                method: 'GET',
                url: '/studio/screentemplates/item/' + template + '/' + $scope.app_name
            }).then(function successCallback(request) {
                $scope.selected_template = request.data.screenTemplate;
                var snippet = '<div layout="column" flex dfx-page-template="' + template + '"></div>';
                $('#dfx_page_content').empty();
                angular.element(document.getElementById('dfx_page_content')).append($compile(snippet)($scope));
            });
        } else {
            $http({
                method: 'GET',
                url: 'templates/' + template + '.json'
            }).then(function successCallback(request) {
                $scope.selected_template = request.data;
                var snippet = '<div layout="column" flex dfx-page-template="' + template + '"></div>';
                $('#dfx_page_content').empty();
                angular.element(document.getElementById('dfx_page_content')).append($compile(snippet)($scope));
            });
        }
    };

    $scope.routeToPage = function(page_name) {
        $location.search( 'name', page_name );
        //$scope.$apply();
    };

    $scope.toggleLeftSide = function() {
        if ($scope.selected_template.layout.left.display=='true') {
            $scope.selected_template.layout.left.display='false';
        } else {
            $scope.selected_template.layout.left.display='true';
        }
    };

    $scope.changeDevice = function(index) {
        $scope.design_selected_device = $scope.design_devices[index];
        $scope.refreshDevice();
    };

    $scope.loadPageDefinition();
}]);

dfxAppRuntime.controller('dfx_view_controller', [ '$scope', '$rootScope', '$compile', '$timeout', '$element', function($scope, $rootScope, $compile, $timeout, $element) {
    $scope.gc_instances = ($scope.gc_instances) ? $scope.gc_instances : {};
    $scope.$parent._view_id = $element.attr('id');

    $scope.view_platform = $element.attr('dfxVePlatorm');

    

    $scope.callViewControllerFunction = function( function_name, parameters ) {
        return $scope.gc_instances[$(element).attr('id')];
    };

    $scope.getComponent = function( element ) {
        var id = $(element).attr('id');
        if ($(element).attr('dfx-gc-renderer-content')!=null) {
            var component_id = $(element).parent().attr('component-id');
            var column_id = $(element).parent().attr('column-id');
            var row_id = $(element).parent().attr('row-id');
            var component = $scope.gc_instances[component_id].attributes.columns.value[column_id].renderer;
            component.id = component_id + '_renderer_' + row_id + '_' + column_id;
            return component;
        } else {
            return $scope.gc_instances[id];
        }
    };
    
    $scope.addComponents = function( components, container_component, parent_id, card, view_id ) {
        var idx = 0;
        var ref_components = (card!=null) ? components[card] : components;
        for (idx = 0; idx < ref_components.length; idx++) {
            var component = ref_components[idx];
            $scope.registerChildren( component );
            $scope.addComponent(component, container_component, parent_id, view_id);
        }
    };

    $scope.registerChildren = function( component ) {
        var idx_child = 0;
        for (idx_child = 0; idx_child < component.children.length; idx_child++) {
            $scope.gc_instances[component.children[idx_child].id] = component.children[idx_child];
            if (component.children[idx_child].children.length>0) {
                $scope.registerChildren(component.children[idx_child]);
            }
        }
    }

    // Add a component
    $scope.addComponent = function( component, container_component, parent_id, view_id) {
        var component_instance = $scope.renderGraphicalControl(component, parent_id, view_id);
        $timeout(function() {
        	if (component.container==null) {
        		$('#' + container_component.id).append(component_instance.fragment);
        	} else {
            	$('#' + container_component.id + '_' + component.container).append(component_instance.fragment);
            }
	    }, 0);
    };

    // Render GControls
    $scope.renderGraphicalControl = function( component, parent_id, view_id ) {
        $scope.gc_instances[component.id] = component;
        var gc_instance = {};
        var flex_container_attr = (component.attributes.flex!=null) ? ' flex="{{attributes.flex.value}}"' : '';

        var panel_layout = (component.type == 'panel' && (!component.attributes.autoHeight ||  component.attributes.autoHeight.value != true)) ? ' style="height:100%;" layout="column" ' : '';

        gc_instance.fragment = $compile(
            '<div id="' + component.id +
            '" dfx-gc-web-base dfx-gc-web-' + component.type +
            ' gc-role="control" gc-parent="' + parent_id +
            '" view-id="' + view_id +
            '"' + flex_container_attr +
            panel_layout +
            '></div>')($scope);
        gc_instance.id = component.id;
        if (gc_instance.id == '2019') console.log(gc_instance);
        return gc_instance;
    };

    $scope.refreshDevice = function() {
        if ($scope.design_device_orientation=='Portrait') {
            $('#dfx_view_preview_container').css('width', $scope.design_selected_device.portrait['width']);
            $('#dfx_view_preview_container').css('height', $scope.design_selected_device.portrait['height']);
            $('#dfx_view_preview_container').css('padding-top', $scope.design_selected_device.portrait['padding-top']);
            $('#dfx_view_preview_container').css('padding-left', $scope.design_selected_device.portrait['padding-left']);
            $('#dfx_view_preview_container').css('padding-right', $scope.design_selected_device.portrait['padding-right']);
            $('#dfx_view_preview_container').css('padding-bottom', $scope.design_selected_device.portrait['padding-bottom']);
            $('#dfx_view_preview_container').css( 'background', 'url(/images/' + $scope.design_selected_device.portrait['image'] + ') no-repeat' );
        } else {
            $('#dfx_view_preview_container').css('width', $scope.design_selected_device.landscape['width']);
            $('#dfx_view_preview_container').css('height', $scope.design_selected_device.landscape['height']);
            $('#dfx_view_preview_container').css('padding-top', $scope.design_selected_device.landscape['padding-top']);
            $('#dfx_view_preview_container').css('padding-left', $scope.design_selected_device.landscape['padding-left']);
            $('#dfx_view_preview_container').css('padding-right', $scope.design_selected_device.landscape['padding-right']);
            $('#dfx_view_preview_container').css('padding-bottom', $scope.design_selected_device.landscape['padding-bottom']);
            $('#dfx_view_preview_container').css( 'background', 'url(/images/' + $scope.design_selected_device.landscape['image'] + ') no-repeat' );
        }
    };

    $scope.changeDevice = function(index) {
        $scope.design_selected_device = $scope.design_devices[index];
        $scope.refreshDevice();
    };

    $scope.changeDeviceOrientation = function() {
        $scope.design_device_orientation = ($scope.design_device_orientation=='Portrait') ? 'Landscape' : 'Portrait';
        $scope.refreshDevice();
    };


}]);

dfxAppRuntime.directive( 'dfxPageIncludeTemplate', function($compile) {
    return{
        restrict: 'A',
        link: function(scope, element, attributes) {
            scope.$watch('selected_template.layout.' + attributes.dfxPageIncludeTemplate + '.content.value', function(new_value) {
                element.html(new_value); 
                $compile(element.contents())(scope);
            });
        }
    }
});

dfxAppRuntime.directive('dfxPageTemplate', ['$compile', '$mdSidenav', function($compile, $mdSidenav) {
    return {
        restrict: 'A',
        link: function($scope, $element, $attrs) {
            var tpl_snippet = '';

            // Header
            tpl_snippet = '<div layout="row" ng-show="selected_template.layout.header.display==\'true\'" style="min-height:{{selected_template.layout.header.height}}"><div layout layout-align="{{selected_template.layout.header.halignment}} {{selected_template.layout.header.valignment}}" flex="100" style="height:{{selected_template.layout.header.height}};{{selected_template.layout.header.style}}" dfx-page-include-template="header"></div></div>';

            // Middle Section Start
            tpl_snippet += '<div layout="row" flex layout-fill style="overflow:auto;{{selected_template.layout.body.style}}">';
            
            // Left
            tpl_snippet += '<div id="dfxpageleft" ng-show="selected_template.layout.left.display==\'true\'" style="width:{{selected_template.layout.left.width}};{{selected_template.layout.left.style}}" class="{{selected_template.layout.left.whiteframe}}"><md-content layout layout-align="{{selected_template.layout.left.halignment}} {{selected_template.layout.left.valignment}}" style="background:inherit" dfx-page-include-template="left"></md-content></div>';

            // Body
            tpl_snippet += '<div layout="column" style="background:inherit;overflow:auto" layout-padding flex id="pagebody">';
            
            tpl_snippet += '<div layout="row" flex="{{row.height}}" style="" ng-repeat="row in selected_page.layout.rows">';
            tpl_snippet += '<div layout="column" flex="{{col.width}}" data-row="{{$parent.$index}}" data-column="{{$index}}" ng-repeat="col in row.columns" style="padding:5px">';
            tpl_snippet += '<div layout="column" flex ng-repeat="view in col.views">';
            tpl_snippet += '<div id="wrapper" dfx-view-wrapper="view.name" dfx-view-wrapper-id="view.id" flex layout="column">';
            tpl_snippet += '</div>';
            tpl_snippet += '</div>';
            tpl_snippet += '</div>';
            tpl_snippet += '</div>';

            tpl_snippet += '</div>';
            
            // Right
            tpl_snippet += '<div id="dfxpageright" ng-show="selected_template.layout.right.display==\'true\'" style="width:{{selected_template.layout.right.width}};{{selected_template.layout.right.style}}" class="{{selected_template.layout.right.whiteframe}}"><md-content layout layout-align="{{selected_template.layout.right.halignment}} {{selected_template.layout.right.valignment}}" style="background:inherit" dfx-page-include-template="right"></md-content></div>';

            // Middle Section End
            tpl_snippet += '</div>';

            // Footer
            tpl_snippet += '<div layout="row" ng-show="selected_template.layout.footer.display==\'true\'" style="min-height:{{selected_template.layout.footer.height}}"><div layout layout-align="{{selected_template.layout.footer.halignment}} {{selected_template.layout.header.valignment}}" flex="100" style="height:{{selected_template.layout.footer.height}};{{selected_template.layout.footer.style}}" dfx-page-include-template="footer"></div></div>';

            $element.append($compile(tpl_snippet)($scope));
        }
    }
}]);

dfxAppRuntime.filter("sanitize", ['$sce', function($sce) {
    return function(htmlCode){
        return $sce.trustAsHtml(htmlCode);
    }
}]);

dfxAppRuntime.directive('dfxViewPreview', function() {
	return {
    	restrict: 'A',
        controller: function($scope, $element, $attrs) {
                $scope.view_id = $attrs.id;
                $scope.$parent.dfxViewCard = $attrs.dfxViewCard;
                var widget_definition = JSON.parse(window.localStorage.getItem( 'dfx_' + $attrs.dfxViewPreview ));
                $scope.$watch('dfxViewCard', function() {
                    angular.element($('#dfx_view_preview_container')).html('');
                    $scope.addComponents( widget_definition.definition, { "id": "dfx_view_preview_container" }, '', $scope.dfxViewCard, 'dfx_view_preview_container' );
                });
        }
    }
});

dfxAppRuntime.directive('dfxViewPreviewInDialog', [ '$http', function( $http ) {
    return {
        restrict: 'A',
        controller: function($scope, $element, $attrs) {
            var view_object = $('#' + $scope.$parent._view_id)[0];
            var component_id = $('div:first',view_object).attr('id');
            var widget_definition = window.localStorage.getItem('dfx_' + $attrs.dfxViewPreviewInDialog);
            if (widget_definition) {
                $scope.addComponents( JSON.parse(widget_definition).definition, { "id": "dfx_view_preview_container_in_dialog_" + component_id  }, '', $attrs.dfxCard, 'dfx_view_preview_container_in_dialog_' + component_id  );
            } else {
                $http.get('views/' + $attrs.dfxViewPreviewInDialog + '.json').then(function (response) {
                    $scope.addComponents( JSON.parse(response.data.src).definition, { "id": "dfx_view_preview_container_in_dialog_" + component_id  }, '', $attrs.dfxCard, 'dfx_view_preview_container_in_dialog_' + component_id  );
                }, function (err) {
                    console.log("Can't get view " + $attrs.dfxViewPreviewInDialog + " defintion");
                });
            }
        }
    }
}]);

dfxAppRuntime.directive('dfxViewPreviewInSidenav', [ '$http', function( $http ) {
    return {
        restrict: 'A',
        controller: function($scope, $element, $attrs) {
            var view_object = $('#' + $scope.$parent._view_id)[0];
            var component_id = $('div:first',view_object).attr('id');
            var widget_definition = window.localStorage.getItem('dfx_' + $attrs.dfxViewPreviewInSidenav);
            if (widget_definition) {
                $scope.addComponents( JSON.parse(widget_definition).definition, { "id": "dfx_view_preview_container_in_sidenav_" + component_id }, '', $attrs.dfxCard, 'dfx_view_preview_container_in_sidenav_' + component_id );
            } else {
                $http.get('views/' + $attrs.dfxViewPreviewInSidenav + '.json').then(function (response) {
                    $scope.addComponents( JSON.parse(response.data.src).definition, { "id": "dfx_view_preview_container_in_sidenav_" + component_id }, '', $attrs.dfxCard, 'dfx_view_preview_container_in_sidenav_' + component_id );
                }, function (err) {
                    console.log("Can't get view " + $attrs.dfxViewPreviewInSidenav + " defintion");
                });
            }
        }
    }
}]);

dfxAppRuntime.directive('dfxViewPreviewInBottom', [ '$http', function( $http ) {
    return {
        restrict: 'A',
        controller: function($scope, $element, $attrs) {
            var view_object = $('#' + $scope.$parent._view_id)[0];
            var component_id = $('div:first',view_object).attr('id');
            var widget_definition = window.localStorage.getItem('dfx_' + $attrs.dfxViewPreviewInBottom);
            if (widget_definition) {
                $scope.addComponents( JSON.parse(widget_definition).definition, { "id": "dfx_view_preview_container_in_bottom_" + component_id  }, '', $attrs.dfxCard, 'dfx_view_preview_container_in_bottom_' + component_id  );
            } else {
                $http.get('views/' + $attrs.dfxViewPreviewInBottom + '.json').then(function (response) {
                    $scope.addComponents( JSON.parse(response.data.src).definition, { "id": "dfx_view_preview_container_in_bottom_" + component_id  }, '', $attrs.dfxCard, 'dfx_view_preview_container_in_bottom_' + component_id  );
                }, function (err) {
                    console.log("Can't get view " + $attrs.dfxViewPreviewInBottom + " defintion");
                });
            }
        }
    }
}]);

dfxAppRuntime.directive('dfxViewPreviewWithCard', [ '$http', function( $http ) {
    return {
        restrict: 'A',
        controller: function($scope, $element, $attrs) {
            var view_object = $('#' + $scope.$parent._view_id)[0];
            var component_id = $('div:first',view_object).attr('id');
            var widget_definition = window.localStorage.getItem('dfx_' + $attrs.dfxViewPreviewWithCard);
            if (widget_definition) {
                $scope.addComponents( JSON.parse(widget_definition).definition, { "id": "dfx_view_preview_with_card_content_" + component_id  }, '', $attrs.dfxCard, 'dfx_view_preview_with_card_content_' + component_id  );
            } else {
                $http.get('views/' + $attrs.dfxViewPreviewWithCard + '.json').then(function (response) {
                    $scope.addComponents( JSON.parse(response.data.src).definition, { "id": "dfx_view_preview_with_card_content_" + component_id  }, '', $attrs.dfxCard, 'dfx_view_preview_with_card_content_' + component_id  );
                }, function (err) {
                    console.log("Can't get view " + $attrs.dfxViewPreviewInBottom + " defintion");
                });
            }
        }
    }
}]);

dfxAppRuntime.directive('dfxViewWrapper', [ '$http', '$compile', function($http, $compile) {
    return {
        restrict: 'A',
        scope: {
          wrapper_view_name: '=dfxViewWrapper',
          wrapper_view_id: '=dfxViewWrapperId'
        },
        priority: 100000,
        link: function($scope, $element, $attrs) {
            var wrapper_snippet = '<div id="' + $scope.wrapper_view_id + '" dfx-view="' + $scope.wrapper_view_name + '" dfx-view-card="default" ng-controller="dfx_view_controller" style="width:100%" layout="column" flex></div>';
            $element.attr('ng-controller', $scope.wrapper_view_name + 'Controller');
            $element.append(wrapper_snippet);
            $element.removeAttr('dfx-view-wrapper');
            $element.attr('id', $scope.wrapper_view_id + '-wrapper');
            var page_scope = $scope.$parent.$parent.$parent.$parent;
            if (page_scope.page_preview) {
                $.getScript( '/studio/widget/script/' + page_scope.$parent.app_name + '/' + $scope.wrapper_view_name + '/' + page_scope.$parent.platform )
                    .done(function( script, textStatus ) {
                        $compile($element)($scope);
                    })
            } else {
                $compile($element)($scope);
            }
        }
    }
}]);

dfxAppRuntime.directive('dfxView', [ '$http', '$timeout', function($http, $timeout) {
	return {
    	restrict: 'A',
        controller: function($scope, $element, $attrs) {
        	$timeout( function() {
                $scope.view_id = $attrs.id;
                $scope.$parent.view_id = $attrs.id;
                $scope.$parent.dfxViewCard = $attrs.dfxViewCard;
                $scope.$watch('dfxViewCard', function() {
                    angular.element($('#' + $scope.view_id)).html('');
                    var page_scope = $scope.$parent.$parent.$parent.$parent;
                    if (page_scope && page_scope.page_preview) {
                        $http.get( '/studio/widget/item/' + page_scope.$parent.app_name + '/' + $attrs.dfxView + '/' + page_scope.$parent.platform ).success(function(response) {
                            $scope.addComponents( (JSON.parse(response.src)).definition, { "id": $scope.view_id }, '', $scope.dfxViewCard, $scope.view_id );
                        });
                    } else {
                        $http.get( 'views/' + $attrs.dfxView + '.json' ).success(function(response) {
                            $scope.addComponents( (JSON.parse(response.src)).definition, { "id": $scope.view_id }, '', $scope.dfxViewCard, $scope.view_id );
                        });
                    }
                });
            }, 0);
        }
    }
}]);

dfxAppRuntime.directive('dfxGcWeb', ['$compile', function($compile) {
    return {
        restrict: 'A',
        link: function($scope, $element, $attrs) {
            var component = $scope.gc_instances[$attrs.id];

            if ( component.attributes.repeat_title && component.attributes.repeat_title.value ) {
                var inherited = {
                    "halignment": $scope.$parent.col.halignment.value,
                    "orientation": $scope.$parent.col.orientation.value,
                    "valignment": $scope.$parent.col.valignment.value,
                    "width": $scope.$parent.col.width.value
                };
                var ifLayout = ( $scope.$parent.col.orientation.value === 'row' ) ? ' layout="row" style="flex-wrap: wrap;' : ' style="width:100%;max-height:100%;flex-direction: column;display: flex;"';
                var angular_snippet = $compile(
                    '<div id="'+$attrs.id+
                    '" dfx-gc-web-base dfx-gc-web-'+$attrs.dfxGcWeb+
                    ' gc-role="control" gc-parent="'+$attrs.gcParent+
                    '" view-id="'+$attrs.viewId+
                    '" flex="100"' +
                    ifLayout +
                    '" layout-align="' + inherited.halignment + ' ' + inherited.valignment +
                    '"></div>')($scope);
            } else {
                var flex_container_attr = (component.attributes.flex!=null) ? ' flex="{{attributes.flex.value}}"' : '';
                var angular_snippet = $compile('<div id="'+$attrs.id+'" dfx-gc-web-base dfx-gc-web-'+$attrs.dfxGcWeb+' gc-role="control" gc-parent="'+$attrs.gcParent+'" view-id="'+$attrs.viewId+'"' + flex_container_attr + '></div>')($scope);
            }
            $element.replaceWith(angular_snippet);
        }
    }
}]);

dfxAppRuntime.directive('dfxGcRenderer', ['$compile', function($compile) {
    return {
        restrict: 'A',
        link: function($scope, $element, $attrs) {
            var viewId = $('#'+$attrs.componentId).attr('view-id');
            var angular_snippet = $compile('<div id="'+$attrs.componentId+'_renderer_'+$attrs.rowId+'_'+$attrs.columnId+'" dfx-gc-web-base dfx-gc-web-'+$attrs.dfxGcRenderer+' dfx-gc-renderer-content="'+$attrs.componentId+'" view-id="' + viewId + '"></div>')($scope);
            $element.append(angular_snippet);
            if ($attrs.id == '2019') console.log('2.angular_snippet: ', angular_snippet);
        }
    }
}]);

dfxAppRuntime.directive('dfxRepeatablePanel', [ function() {
    return {
        restrict: 'A',
        scope: true,
        controller: function($scope, $element, $attrs) {
            $scope.$dfx_index = $scope.$index;
            $scope.$dfx_first = $scope.$first;
            $scope.$dfx_odd = $scope.$odd;
            $scope.$dfx_even = $scope.$even;
            $scope.$dfx_last = $scope.$last;
            $scope.$dfxGetParentIndex = function() {
                var parent_elem = $($element).parents('div[dfx-repeatable-panel]:first');
                if (parent_elem) {
                    return parseInt($(parent_elem).attr('dfx-repeatable-panel'));
                } else {
                    return null;
                }
            };
            $scope.$dfxGetParentIndexes = function() {
                var parent_indexes = [];
                var parent_elements = $($element).parents('div[dfx-repeatable-panel]');
                for (var i=0; i<parent_elements.length; i++) {
                    parent_indexes.push( parseInt($(parent_elements[i]).attr('dfx-repeatable-panel')) );
                }
                return parent_indexes;
            };
        }
    }
}]);

dfxAppRuntime.directive('dfxDatatable', [ function() {
    return {
        restrict: 'A',
        scope: true,
        controller: function($scope, $element, $attrs) {
            $scope.$dfx_index = $scope.$index;
            $scope.$dfx_first = $scope.$first;
            $scope.$dfx_odd = $scope.$odd;
            $scope.$dfx_even = $scope.$even;
            $scope.$dfx_last = $scope.$last;
            $scope.$dfxGetParentIndex = function() {
                var parent_elem = $($element).parents('div[dfx-repeatable-panel]:first');
                if (parent_elem) {
                    return parseInt($(parent_elem).attr('dfx-repeatable-panel'));
                } else {
                    return null;
                }
            };
            $scope.$dfxGetParentIndexes = function() {
                var parent_indexes = [];
                var parent_elements = $($element).parents('div[dfx-repeatable-panel]');
                for (var i=0; i<parent_elements.length; i++) {
                    parent_indexes.push( parseInt($(parent_elements[i]).attr('dfx-repeatable-panel')) );
                }
                return parent_indexes;
            };
        }
    }
}]);

dfxAppRuntime.directive('dfxGcCompiled', [ '$rootScope', '$compile', function($rootScope, $compile) {
    return {
        restrict: 'A',
        priority:1500,
        terminal:true,
        link: function($scope, $element, $attrs) {
            if ($scope.attributes == null) {
                var unregister = $rootScope.$on($scope.component_id + '_attributes_loaded', function(event, attributes) {
                    try {
                        var gc_attributes = attributes; //(attributes.columns!=null && $attrs.dfxGcCompiled!='parent-renderer') ? attributes.columns.value[$scope.$index].renderer.attributes : attributes;
                        var regexp = /(^\')(.*)(\'$)/gm;
                        for (var attribute in $attrs) {
                            if (attribute.startsWith('dfxNg')) {
                                var attribute_value = $attrs[attribute];
                                var attribute_instance = attribute_value.split(',');
                                $element.removeAttr('dfx-'+attribute_instance[0]);
                                if (gc_attributes[attribute_instance[1]].value !='') {
                                    var expression = regexp.exec( gc_attributes[attribute_instance[1]].value );
                                    if ( expression!=null && ( gc_attributes[attribute_instance[1]].value.indexOf('+') >= 0 ) ) {
                                        expression = null;
                                    }
                                    if (expression!=null) {
                                        if (attribute_instance[0]=='ng-bind') {
                                            $element.attr( attribute_instance[0], gc_attributes[attribute_instance[1]].value );
                                        } else {
                                            $element.attr( attribute_instance[0], gc_attributes[attribute_instance[1]].value.substr( 1, gc_attributes[attribute_instance[1]].value.length-2 ) );
                                        }
                                    } else if (attribute_instance[0]=='ng-src') {
                                        $element.attr( attribute_instance[0], '{{' + gc_attributes[attribute_instance[1]].value + '}}' );
                                    } else {
                                        $element.attr( attribute_instance[0], gc_attributes[attribute_instance[1]].value );
                                    }
                                }
                            }
                        }
                        if ($('[dfx-gc-compiled-child]',$element).size() >0) {
                            $('[dfx-gc-compiled-child]',$element).each( function(i, child_element) {
                                var regexp_child = /(^\')(.*)(\'$)/gm;
                                $.each(this.attributes, function(j, attrib) {
                                    if (attrib!=null && attrib.name.startsWith('dfx-ng')) {
                                        var attribute_instance = attrib.value.split(',');
                                        $(child_element).removeAttr(attrib.name);
                                        if (gc_attributes[attribute_instance[1]].value !='') {
                                            var expression = regexp_child.exec( gc_attributes[attribute_instance[1]].value );

                                            if ( expression && ( gc_attributes[attribute_instance[1]].value.indexOf('+') >= 0 ) ) {
                                                expression = null;
                                            }
                                            if (expression!=null) {
                                                if (attribute_instance[0]=='ng-bind') {
                                                    $(child_element).attr( attribute_instance[0], gc_attributes[attribute_instance[1]].value );
                                                } else {
                                                    $(child_element).attr( attribute_instance[0], gc_attributes[attribute_instance[1]].value.substr( 1, gc_attributes[attribute_instance[1]].value.length-2 ) );
                                                }
                                            } else if (attribute_instance[0]=='ng-src') {
                                                $(child_element).attr( attribute_instance[0], '{{' + gc_attributes[attribute_instance[1]].value + '}}' );
                                            } else {
                                                $(child_element).attr( attribute_instance[0], gc_attributes[attribute_instance[1]].value );
                                            }
                                        }
                                    }
                                });
                                $(child_element).removeAttr('dfx-gc-compiled-child');
                            });
                        }
                        $element.removeAttr('dfx-gc-compiled');
                        $compile($element)($scope);
                        unregister();
                    } catch (e) {
                        console.log(e);
                    }
                });
            } else {
                var gc_attributes = ($scope.attributes.columns!=null) ? $scope.attributes.columns.value[$scope.$index].renderer.attributes : $scope.attributes;
                for (var attribute in $attrs) {
                    if (attribute.startsWith('dfxNg')) {
                        var attribute_value = $attrs[attribute];
                        var attribute_instance = attribute_value.split(',');
                        $element.removeAttr('dfx-'+attribute_instance[0]);
                        if (gc_attributes[attribute_instance[1]].value !='') {
                            $element.attr( attribute_instance[0], gc_attributes[attribute_instance[1]].value );
                        }
                    }
                }
                $element.removeAttr('dfx-gc-compiled');
                $compile($element)($scope);
            }
        }
    }
}]);


function routeToPage(page_name) {
    var element = document.getElementById('dfx_page_content');
    if (element != null) {
        var $scope = angular.element(element).scope()
        $scope.routeToPage(page_name);
    } else {
        alert( 'routeToPage() can\'t be called from preview mode' );
    }
};