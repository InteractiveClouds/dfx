var dfxSystemModules = ['ngRoute', 'ngMaterial', 'dfxAppServices', 'dfxStudioApi', 'nvd3'];
if (typeof dfxAppRuntimeModules != 'undefined')
    dfxSystemModules = dfxSystemModules.concat(dfxAppRuntimeModules);
var dfxAppRuntime = angular.module('dfxAppRuntime', dfxSystemModules);

dfxAppRuntime
    .config( function($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                controller: 'dfx_page_controller',
                templateUrl: 'page.html'
            })
            .otherwise({
				controller: 'dfx_page_controller',
                templateUrl: 'page.html'
            });
    })
    .config( function($mdThemingProvider) {
        $mdThemingProvider.theme('altTheme')
            .primaryPalette('blue')
        $mdThemingProvider.setDefaultTheme('altTheme');
    });

dfxAppRuntime
	.run(['$rootScope', '$route', '$timeout', function($rootScope, $route, $timeout) {
		$rootScope.$on('$routeChangeStart', function (event, next, current) {

		});
	}]);

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
    $scope.tenant_id = $('body').attr('dfx-tenant');
    $scope.gc_types = {};
    $rootScope.page_name = 'Home';
	$rootScope.fullscreen = false;
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
                'padding-bottom': '109px'
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
                'padding-bottom': '120px'
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
    $scope.design_selected_device = $scope.design_devices[1];
    $scope.design_device_orientation = 'Portrait';

    $scope.getGCDefaultAttributes = function( type ) {
		var cached_gc_types = sessionStorage.getItem('DFX_gc_types');
		if (cached_gc_types===null) {
			cached_gc_types = {};
		} else {
			cached_gc_types = JSON.parse(cached_gc_types);
		}
        var deferred = $q.defer();
		if (cached_gc_types[type]!=null) {
			deferred.resolve( cached_gc_types[type] );
		} else {
            $http.get( '/gcontrols/web/' + type + '.json' ).success( function(data) {
                cached_gc_types[type] = data;
				sessionStorage.setItem('DFX_gc_types', JSON.stringify(cached_gc_types));
                deferred.resolve( data );
            });
        }
        return deferred.promise;
    }

    $scope.logout = function() {
        authRequest.removeToken();
    }

    $scope.refreshDevice = function() {
        var dfx_ve_platform = $('div[dfx-ve-platform]');
        var dfx_view_preview_main_container = $('#dfx_view_preview_main_container');
        if ($scope.design_device_orientation=='Portrait') {
            dfx_ve_platform.css('width', $scope.design_selected_device.portrait['width']);
            dfx_ve_platform.css('height', $scope.design_selected_device.portrait['height']);
            dfx_ve_platform.css('padding-top', $scope.design_selected_device.portrait['padding-top']);
            dfx_ve_platform.css('padding-left', $scope.design_selected_device.portrait['padding-left']);
            dfx_ve_platform.css('padding-right', $scope.design_selected_device.portrait['padding-right']);
            dfx_ve_platform.css('padding-bottom', $scope.design_selected_device.portrait['padding-bottom']);
            dfx_view_preview_main_container.css( 'background', 'url(/images/' + $scope.design_selected_device.portrait['image'] + ')' );
        } else {
            dfx_ve_platform.css('width', $scope.design_selected_device.landscape['width']);
            dfx_ve_platform.css('height', $scope.design_selected_device.landscape['height']);
            dfx_ve_platform.css('padding-top', $scope.design_selected_device.landscape['padding-top']);
            dfx_ve_platform.css('padding-left', $scope.design_selected_device.landscape['padding-left']);
            dfx_ve_platform.css('padding-right', $scope.design_selected_device.landscape['padding-right']);
            dfx_ve_platform.css('padding-bottom', $scope.design_selected_device.landscape['padding-bottom']);
            dfx_view_preview_main_container.css( 'background', 'url(/images/' + $scope.design_selected_device.landscape['image'] + ')' );
        }
        dfx_view_preview_main_container.css( 'background-position-x', 'center' );
        dfx_view_preview_main_container.css( 'background-repeat', 'no-repeat' );
        dfx_view_preview_main_container.css( 'height', '' );
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

dfxAppRuntime.controller('dfx_page_template_controller', [ '$scope', '$rootScope', '$location', function( $scope, $rootScope, $location ) {
	$scope.selected_template = {
		"layout": {
			"header": {
				"display": "false",
				"height": "0px",
				"halignment": "",
				"valignment": "",
				"content": ""
			},
			"left": {
				"display": "false",
				"height": "0px",
				"content": ""
			},
			"right": {
				"display": "false",
				"width": "0px",
				"content": ""
			},
			"footer": {
				"display": "false",
				"height": "0px",
				"halignment": "",
				"valignment": "",
				"content": ""
			}
		}
	};

	$scope.routeToPage = function(page_name) {
		/* check if user is not trying to go on the same page, then apply animation and route to targeted page */
		if (page_name != $rootScope.page_name) {
			$('#pagebody').addClass('animated slideOutLeft').one('animationend', function(eventOne) {
				$rootScope.page_name = page_name;
				$location.url('/'+$rootScope.page_name);
				$scope.$apply();
			});
		}
    };

	/* Toggle Fullscreen - remove/restore template elements with animation */
	$scope.toggleFullScreen = function() {
		if (!$rootScope.fullscreen) {
			if ($('#pageheader').css('display')!=='none') {
				$('#pageheader').removeClass('slideInDown');
				$('#pageheader').addClass('slideOutUp').one('animationend', function(eventOne) {
					var height = $('#pageheader').css('height');
					$('#pageheader').attr('dfx-saved-height', height);
					$('#pageheader').css('height', 0);
					$('#pageheader').css('min-height', 0);
				});
			}
			if ($('#pagefooter').css('display')!=='none') {
				$('#pagefooter').removeClass('slideInUp');
				$('#pagefooter').addClass('slideOutDown').one('animationend', function(eventOne) {
					var height = $('#pagefooter').css('height');
					$('#pagefooter').attr('dfx-saved-height', height);
					$('#pagefooter').css('height', 0);
					$('#pagefooter').css('min-height', 0);
				});
			}
			if ($('#pageleft').css('display')!=='none') {
				$('#pageleft').removeClass('slideInLeft');
				$('#pageleft').addClass('slideOutLeft').one('animationend', function(eventOne) {
					var width = $('#pageleft').css('width');
					$('#pageleft').attr('dfx-saved-width', width);
					$('#pageleft').css('width', 0);
					$('#pageleft').css('min-width', 0);
				});
			}
			if ($('#pageright').css('display')!=='none') {
				$('#pageright').removeClass('slideInRight');
				$('#pageright').addClass('slideOutRight').one('animationend', function(eventOne) {
					var width = $('#pageright').css('width');
					$('#pageright').attr('dfx-saved-width', width);
					$('#pageright').css('width', 0);
					$('#pageright').css('min-width', 0);
				});
			}
		} else {
			if ($('#pageheader').css('display')!=='none') {
				var header_height = $('#pageheader').attr('dfx-saved-height');
				$('#pageheader').css('height', header_height);
				$('#pageheader').css('min-height', header_height);
				$('#pageheader').removeClass('slideOutUp');
				$('#pageheader').addClass('slideInDown');
			}
			if ($('#pageleft').css('display')!=='none') {
				var left_width = $('#pageleft').attr('dfx-saved-width');
				$('#pageleft').css('width', left_width);
				$('#pageleft').css('min-width', left_width);
				$('#pageleft').removeClass('slideOutLeft');
				$('#pageleft').addClass('slideInLeft');
			}
			if ($('#pageright').css('display')!=='none') {
				var right_width = $('#pageright').attr('dfx-saved-width');
				$('#pageright').css('width', right_width);
				$('#pageright').css('min-width', right_width);
				$('#pageright').removeClass('slideOutRight');
				$('#pageright').addClass('slideInRight');
			}
			if ($('#pagefooter').css('display')!=='none') {
				var footer_height = $('#pagefooter').attr('dfx-saved-height');
				$('#pagefooter').css('height', footer_height);
				$('#pagefooter').css('min-height', footer_height);
				$('#pagefooter').removeClass('slideOutDown');
				$('#pagefooter').addClass('slideInUp');
			}

		}
		$rootScope.fullscreen = !$rootScope.fullscreen;
	}
}]);

dfxAppRuntime.controller('dfx_page_controller', [ '$scope', '$rootScope', 'dfxAuthRequest', '$q', '$http', '$compile', '$routeParams', '$location', 'dfxPages', function( $scope, $rootScope, dfxAuthRequest, $q, $http, $compile, $routeParams, $location, dfxPages) {

    $scope.page_preview = false;
    $rootScope.page_name = ($location.path()!=='/') ? $location.path().substr(1) : 'Home';

    if ($location.search().preview=='true') {
        $scope.page_preview = true;
    }

    $scope.loadPageDefinition = function(snippet) {
        if ($scope.page_preview) {
            $http({
                method: 'GET',
                url: '/studio/screen/item/' + $rootScope.page_name + '/' + $scope.app_name + '/' + 'web'
            }).then(function successCallback(response) {
                $scope.selected_page = response.data.screen;
				var current_template = $('body').attr('dfx-page-template');
				if (current_template!=response.data.screen.template) {
                	$scope.loadPageTemplate(response.data.screen.template);
				} else {
					var snippet = '<div layout="column" flex dfx-page-template="' + request.data.template + '"></div>';
	                angular.element(document.getElementById('dfx_page_content')).append($compile(snippet)($scope));
				}
            });
        } else {
            $http({
                method: 'GET',
                url: 'pages/' + $rootScope.page_name + '.json'
            }).then(function successCallback(request) {
                $scope.selected_page = request.data;
				var current_template = $('body').attr('dfx-page-template');
				if (current_template!=request.data.template) {
                	$scope.loadPageTemplate(request.data.template);
				} else {
					var snippet = '<div layout="column" flex dfx-page-template="' + request.data.template + '"></div>';
	                angular.element(document.getElementById('dfx_page_content')).append($compile(snippet)($scope));
				}
            }, function errorCallback(response) {
				$scope.selected_page = {};
				$http({
	                method: 'GET',
	                url: '/commons/views/ui-route-error.html'
	            }).then(function successCallback(request) {
					var snippet = request.data;
					angular.element(document.getElementById('dfx_page_content')).append($compile(snippet)($scope));
	            });
			});
        }
    };

    $scope.loadPageTemplate = function(template) {
		$('body').attr('dfx-page-template', template);
        if ($scope.page_preview) {
            $http({
                method: 'GET',
                url: '/studio/screentemplates/item/' + template + '/' + $scope.app_name
            }).then(function successCallback(request) {
                $scope.$parent.selected_template = request.data.screenTemplate;
                var snippet = '<div layout="column" flex dfx-page-template="' + template + '"></div>';
                angular.element(document.getElementById('dfx_page_content')).append($compile(snippet)($scope));
            });
        } else {
            $http({
                method: 'GET',
                url: 'templates/' + template + '.json'
            }).then(function successCallback(request) {
                $scope.$parent.selected_template = request.data;
                var snippet = '<div layout="column" flex dfx-page-template="' + template + '"></div>';
                angular.element(document.getElementById('dfx_page_content')).append($compile(snippet)($scope));
            });
        }
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
        if ($(element).parent().attr('dfx-gcc-renderer')!=null) {
            var component_id = $(element).parent().attr('component-id');
            var column_id = $(element).parent().attr('column-id');
            var row_id = $(element).parent().attr('row-id');
            var component = $scope.gc_instances[component_id].attributes.columns.value[column_id].renderer;
            component.id = $(element).attr('id');
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
        $scope.gc_instances[component.id] = component;
        //var component_instance = $scope.gc_instances[component.id] = component;//$scope.renderGraphicalControl(component, parent_id, view_id);
        /*$timeout(function() {
            if (component.container==null) {
                $('#' + container_component.id).append(component_instance.fragment);
            } else {
                $('#' + container_component.id + '_' + component.container).append(component_instance.fragment);
            }
        }, 0);*/
    };

    // Render GControls
    $scope.renderGraphicalControl = function( component, parent_id, view_id ) {
        $scope.gc_instances[component.id] = component;
        var gc_instance = {};
        var flex_container_attr = (component.attributes.flex!=null) ? ' flex="{{attributes.flex.value}}"' : '';

        var gc_layout = ((component.type == 'panel' || component.type == 'tabs' || component.type == 'wizard') &&
            (!component.attributes.autoHeight ||  component.attributes.autoHeight.value != true)) ?
                ' style="height:100%;" layout="column" ' : ' layout="column" ';

        gc_instance.fragment = $compile(
            '<div id="' + component.id +
            '" dfx-gc-web-base dfx-gc-web-' + component.type +
            ' gc-role="control" gc-parent="' + parent_id +
            '" view-id="' + view_id +
            '"' + flex_container_attr +
            gc_layout +
            '></div>')($scope);
        gc_instance.id = component.id;
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
            $('#dfx_view_preview_main_container').css( 'background', 'url(/images/' + $scope.design_selected_device.portrait['image'] + ')' );
        } else {
            $('#dfx_view_preview_container').css('width', $scope.design_selected_device.landscape['width']);
            $('#dfx_view_preview_container').css('height', $scope.design_selected_device.landscape['height']);
            $('#dfx_view_preview_container').css('padding-top', $scope.design_selected_device.landscape['padding-top']);
            $('#dfx_view_preview_container').css('padding-left', $scope.design_selected_device.landscape['padding-left']);
            $('#dfx_view_preview_container').css('padding-right', $scope.design_selected_device.landscape['padding-right']);
            $('#dfx_view_preview_container').css('padding-bottom', $scope.design_selected_device.landscape['padding-bottom']);
            $('#dfx_view_preview_main_container').css( 'background', 'url(/images/' + $scope.design_selected_device.landscape['image'] + ')' );
        }
        $('#dfx_view_preview_main_container').css( 'background-position-x', 'center' );
        $('#dfx_view_preview_main_container').css( 'background-repeat', 'no-repeat' );
        $('#dfx_view_preview_main_container').css( 'height', '' );
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

dfxAppRuntime.directive( 'dfxIncludePageTemplate', function($compile) {
    return{
        restrict: 'A',
        link: function(scope, element, attributes) {
            scope.$watch('selected_template', function(new_value) {
				var tpl_content = scope.selected_template.layout[attributes.dfxIncludePageTemplate].content.value;
                element.html(tpl_content);
				switch (attributes.dfxIncludePageTemplate) {
					case 'header':
						element.addClass('slideInDown');
						break;
					case 'left':
						element.addClass('slideInLeft');
						break;
					case 'right':
						element.addClass('slideInRight');
						break;
					case 'footer':
						element.addClass('slideInUp');
						break;
				}
                $compile(element.contents())(scope);
            });
        }
    }
});

dfxAppRuntime.directive('dfxPageTemplate', ['$compile', '$mdSidenav', '$timeout', function($compile, $mdSidenav, $timeout) {
    return {
        restrict: 'A',
        link: function($scope, $element, $attrs) {
            var tpl_snippet = '',
                page_auto_height = $scope.selected_page.autoHeight,
                flex_row = (page_auto_height != true) ? '{{row.height}}' : '',
                flex_view = (page_auto_height != true) ? '{{view.height}}' : '';

            // Dynamic HTML construction of Page Body
            tpl_snippet += '<div ng-controller="' + $scope.selected_page.name + 'PageController" layout="column" style="background:inherit;overflow:auto;" flex id="pagebody" dfx-flex="' + flex_row + '" dfx-flex-view="' + flex_view + '">';

            tpl_snippet += '<div layout="row" flex="' + flex_row + '" style="" ng-repeat="row in selected_page.layout.rows">';
            tpl_snippet += '<div layout="column" flex="{{col.width}}" data-row="{{$parent.$index}}" data-column="{{$index}}" ng-repeat="col in row.columns">';
            tpl_snippet += '<div layout="column" flex="' + flex_view + '" ng-repeat="view in col.views">';

            tpl_snippet += '<div id="wrapper" dfx-view-wrapper="view.name" dfx-view-wrapper-id="view.id" flex="100" layout="column">';
            tpl_snippet += '</div>';
            tpl_snippet += '</div>';
            tpl_snippet += '</div>';
            tpl_snippet += '</div>';

            tpl_snippet += '</div>';

            $element.append($compile(tpl_snippet)($scope));
        }
    }
}]);

dfxAppRuntime.filter("sanitize", ['$sce', function($sce) {
    return function(htmlCode){
        return $sce.trustAsHtml(htmlCode);
    }
}]);

dfxAppRuntime.directive('dfxViewPreviewCompiled', ['$compile', function($compile) {
    return {
        restrict: 'A',
        controller: function($scope, $element, $attrs) {
            $scope.view_id = $attrs.id;
            $scope.$parent.dfxViewCard = $attrs.dfxViewCard;
            var widget_definition = JSON.parse(window.localStorage.getItem( 'dfx_' + $attrs.dfxViewPreviewCompiled ));
            $scope.$watch('dfxViewCard', function(new_card, old_card) {
                if (new_card!=null) {
					var view_compiled = window.localStorage.getItem( 'DFX_view_compiled_' + $attrs.dfxViewPreviewCompiled + '_' + new_card );
                  	var animation = (widget_definition.definition[new_card][0].animation) ? widget_definition.definition[new_card][0].animation : {
                    	in: 'zoomIn',
                    	out: 'slideOutLeft'
                  	};
                	$('#dfx_view_preview_container').removeClass().addClass('animated ' + animation.out).one('animationend', function(eventOne) {
	                    angular.element($('#dfx_view_preview_container')).html('');
	                    $('#dfx_view_preview_container').removeClass().addClass('animated ' + animation.in);
	                    $scope.addComponents( widget_definition.definition, { "id": "dfx_view_preview_container" }, '', new_card, 'dfx_view_preview_container' );
	                    angular.element($('#dfx_view_preview_container')).html(view_compiled);
	                    $compile(angular.element($('#dfx_view_preview_container')).contents())($scope);
                	});
                }
            });

            $scope.$parent_scope = $scope.$parent;
        }
    }
}]);

dfxAppRuntime.directive('dfxViewPreviewInDialog', [ '$http', '$timeout', '$compile', function( $http, $timeout, $compile ) {
    return {
        restrict: 'A',
        controller: function($scope, $element, $attrs) {
            var renderHtmlForRuntime = function() {
                $http.get( 'views/' + $attrs.dfxViewPreviewInDialog+'/' + $attrs.dfxViewPreviewInDialog + '_' + $attrs.dfxCard+ '.html' ).success(function(response) {
                    angular.element($("#dfx_view_preview_container_in_dialog_" + component_id)).html(response);
                    $compile(angular.element($("#dfx_view_preview_container_in_dialog_" + component_id)).contents())($scope);
                });
            }
            var renderHtmlForPreview = function() {
                var response = window.localStorage.getItem( 'DFX_view_compiled_' + $attrs.dfxViewPreviewInDialog + '_' + $attrs.dfxCard );
                angular.element($("#dfx_view_preview_container_in_dialog_" + component_id)).html(response);
                $compile(angular.element($("#dfx_view_preview_container_in_dialog_" + component_id)).contents())($scope);
            }
            var view_object = $('#' + $scope.$parent._view_id)[0];
            var component_id = $('div:first',view_object).attr('id');
            var widget_definition = window.localStorage.getItem('dfx_' + $attrs.dfxViewPreviewInDialog);
            if (widget_definition) {
                $scope.addComponents( JSON.parse(widget_definition).definition, { "id": "dfx_view_preview_container_in_dialog_" + component_id  }, '', $attrs.dfxCard, 'dfx_view_preview_container_in_dialog_' + component_id  );
                $timeout(function(){
                    renderHtmlForPreview();
                },0);
            } else {
                $http.get('views/' + $attrs.dfxViewPreviewInDialog + '/' + $attrs.dfxViewPreviewInDialog + '.json').then(function (response) {
                    $scope.addComponents( JSON.parse(response.data.src).definition, { "id": "dfx_view_preview_container_in_dialog_" + component_id  }, '', $attrs.dfxCard, 'dfx_view_preview_container_in_dialog_' + component_id  );
                    $timeout(function(){
                        renderHtmlForRuntime();
                    },0);
                }, function (err) {
                    console.log("Can't get view " + $attrs.dfxViewPreviewInDialog + " defintion");
                });
            }

            $scope.$parent_scope = $scope.$parent;
        }
    }
}]);

dfxAppRuntime.directive('dfxViewPreviewInSidenav', [ '$http', '$compile', '$timeout', function( $http, $compile, $timeout ) {
    return {
        restrict: 'A',
        controller: function($scope, $element, $attrs) {
            var renderHtmlForRuntime = function() {
                $http.get( 'views/' + $attrs.dfxViewPreviewInSidenav+'/' + $attrs.dfxViewPreviewInSidenav + '_' + $attrs.dfxCard+ '.html' ).success(function(response) {
                    angular.element($("#dfx_view_preview_container_in_sidenav_" + component_id)).html(response);
                    $compile(angular.element($("#dfx_view_preview_container_in_sidenav_" + component_id)).contents())($scope);
                });
            }
            var renderHtmlForPreview = function() {
                var response = window.localStorage.getItem( 'DFX_view_compiled_' + $attrs.dfxViewPreviewInSidenav + '_' + $attrs.dfxCard );
                angular.element($("#dfx_view_preview_container_in_sidenav_" + component_id)).html(response);
                $compile(angular.element($("#dfx_view_preview_container_in_sidenav_" + component_id)).contents())($scope);
            }
            var view_object = $('#' + $scope.$parent._view_id)[0];
            var component_id = $('div:first',view_object).attr('id');
            var widget_definition = window.localStorage.getItem('dfx_' + $attrs.dfxViewPreviewInSidenav);
            if (widget_definition) {
                $scope.addComponents( JSON.parse(widget_definition).definition, { "id": "dfx_view_preview_container_in_sidenav_" + component_id }, '', $attrs.dfxCard, 'dfx_view_preview_container_in_sidenav_' + component_id );
                $timeout(function(){
                    renderHtmlForPreview();
                },0);
            } else {
                $http.get('views/' + $attrs.dfxViewPreviewInSidenav + '/' + $attrs.dfxViewPreviewInSidenav + '.json').then(function (response) {
                    $scope.addComponents( JSON.parse(response.data.src).definition, { "id": "dfx_view_preview_container_in_sidenav_" + component_id }, '', $attrs.dfxCard, 'dfx_view_preview_container_in_sidenav_' + component_id );
                    $timeout(function(){
                        renderHtmlForRuntime();
                    },0);
                }, function (err) {
                    console.log("Can't get view " + $attrs.dfxViewPreviewInSidenav + " defintion");
                });
            }

            $scope.$parent_scope = $scope.$parent;
        }
    }
}]);

dfxAppRuntime.directive('dfxViewPreviewInBottom', [ '$http', '$timeout', '$compile', function( $http, $timeout, $compile ) {
    return {
        restrict: 'A',
        controller: function($scope, $element, $attrs) {
            var renderHtmlForRuntime = function() {
                $http.get( 'views/' + $attrs.dfxViewPreviewInBottom+'/' + $attrs.dfxViewPreviewInBottom + '_' + $attrs.dfxCard+ '.html' ).success(function(response) {
                    angular.element($("#dfx_view_preview_container_in_bottom_" + component_id)).html(response);
                    $compile(angular.element($("#dfx_view_preview_container_in_bottom_" + component_id)).contents())($scope);
                });
            }
            var renderHtmlForPreview = function() {
                var response = window.localStorage.getItem( 'DFX_view_compiled_' + $attrs.dfxViewPreviewInBottom + '_' + $attrs.dfxCard );
                angular.element($("#dfx_view_preview_container_in_bottom_" + component_id)).html(response);
                $compile(angular.element($("#dfx_view_preview_container_in_bottom_" + component_id)).contents())($scope);
            }
            var view_object = $('#' + $scope.$parent._view_id)[0];
            var component_id = $('div:first',view_object).attr('id');
            var widget_definition = window.localStorage.getItem('dfx_' + $attrs.dfxViewPreviewInBottom);
            if (widget_definition) {
                $scope.addComponents( JSON.parse(widget_definition).definition, { "id": "dfx_view_preview_container_in_bottom_" + component_id  }, '', $attrs.dfxCard, 'dfx_view_preview_container_in_bottom_' + component_id  );
                $timeout(function(){
                    renderHtmlForPreview();
                },0);
            } else {
                $http.get('views/' + $attrs.dfxViewPreviewInBottom + '/' + $attrs.dfxViewPreviewInBottom + '.json').then(function (response) {
                    $scope.addComponents( JSON.parse(response.data.src).definition, { "id": "dfx_view_preview_container_in_bottom_" + component_id  }, '', $attrs.dfxCard, 'dfx_view_preview_container_in_bottom_' + component_id  );
                    $timeout(function(){
                        renderHtmlForRuntime();
                    },0);
                }, function (err) {
                    console.log("Can't get view " + $attrs.dfxViewPreviewInBottom + " defintion");
                });
            }

            $scope.$parent_scope = $scope.$parent;
        }
    }
}]);

dfxAppRuntime.directive('dfxViewPreviewWithCard', [ '$http', '$timeout', '$compile', function( $http, $timeout, $compile ) {
    return {
        restrict: 'A',
        controller: function($scope, $element, $attrs) {
            var renderHtmlForRuntime = function() {
                $http.get( 'views/' + $attrs.dfxViewPreviewWithCard+'/' + $attrs.dfxViewPreviewWithCard + '_' + $attrs.dfxCard+ '.html' ).success(function(response) {
                    angular.element($("#dfx_view_preview_with_card_content_" + component_id)).html(response);
                    $compile(angular.element($("#dfx_view_preview_with_card_content_" + component_id)).contents())($scope);
                });
            }
            var renderHtmlForPreview = function() {
                var response = window.localStorage.getItem( 'DFX_view_compiled_' + $attrs.dfxViewPreviewWithCard + '_' + $attrs.dfxCard );
                angular.element($("#dfx_view_preview_with_card_content_" + component_id)).html(response);
                $compile(angular.element($("#dfx_view_preview_with_card_content_" + component_id)).contents())($scope);
            }
            var view_object = $('#' + $scope.$parent._view_id)[0];
            var component_id = $('div:first',view_object).attr('id');
            var widget_definition = window.localStorage.getItem('dfx_' + $attrs.dfxViewPreviewWithCard);
            if (widget_definition) {
                $scope.addComponents( JSON.parse(widget_definition).definition, { "id": "dfx_view_preview_with_card_content_" + component_id  }, '', $attrs.dfxCard, 'dfx_view_preview_with_card_content_' + component_id  );
                $timeout(function(){
                    renderHtmlForPreview();
                },0);
            } else {
                $http.get('views/' + $attrs.dfxViewPreviewWithCard + '/' + $attrs.dfxViewPreviewWithCard + '.json').then(function (response) {
                    $scope.addComponents( JSON.parse(response.data.src).definition, { "id": "dfx_view_preview_with_card_content_" + component_id  }, '', $attrs.dfxCard, 'dfx_view_preview_with_card_content_' + component_id  );
                    $timeout(function(){
                        renderHtmlForRuntime();
                    },0);
                }, function (err) {
                    console.log("Can't get view " + $attrs.dfxViewPreviewWithCard + " defintion");
                });
            }

            $scope.$parent_scope = $scope.$parent;
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
            var wrapper_snippet = '<div id="' + $scope.wrapper_view_id + '" dfx-view="' + (($scope.wrapper_view_name==null) ? $attrs.dfxViewWrapper : $scope.wrapper_view_name) + '" dfx-view-card="default" ng-controller="dfx_view_controller" class="flex-100" style="width:100%" layout="column" flex="100"></div>';
            $element.attr('ng-controller', (($scope.wrapper_view_name==null) ? $attrs.dfxViewWrapper : $scope.wrapper_view_name) + 'Controller');
            $element.append(wrapper_snippet);
            $element.removeAttr('dfx-view-wrapper');
            $element.attr('id', $scope.wrapper_view_id + '-wrapper');
            /*var page_scope = $scope.$parent.$parent.$parent.$parent;
            if (page_scope.page_preview) {
                $.getScript( '/studio/widget/script/' + page_scope.$parent.app_name + '/' + $scope.wrapper_view_name + '/' + page_scope.$parent.platform )
                    .done(function( script, textStatus ) {
                        $compile($element)($scope);
                    })
            } else {
                $compile($element)($scope);
            }*/
			$compile($element)($scope);
        }
    }
}]);

dfxAppRuntime.directive('dfxView', [ '$http', '$timeout', '$compile', function($http, $timeout, $compile) {
    return {
        restrict: 'A',
        controller: function($scope, $element, $attrs) {
            var renderHtml = function() {
                $http.get( 'views/' + $attrs.dfxView +'/' + $attrs.dfxView + '_' + $scope.dfxViewCard + '.html' ).success(function(response) {
                    angular.element($('#'+ $scope.view_id)).html(response);
                    $compile(angular.element($('#'+ $scope.view_id)).contents())($scope);
                });
            }
            $timeout( function() {
                $scope.view_id = $attrs.id;
                $scope.$parent.view_id = $attrs.id;
                $scope.$parent.dfxViewCard = $attrs.dfxViewCard;
                $scope.$watch('dfxViewCard', function(new_card, old_card) {
                    if (new_card!=null) {
                        var page_scope = $scope.$parent.$parent.$parent.$parent;
                        if (page_scope && page_scope.page_preview) {
                            $http.get( '/studio/widget/item/' + page_scope.$parent.app_name + '/' + $attrs.dfxView + '/' + page_scope.$parent.platform ).success(function(response) {
                                var view_definition = JSON.parse(response.src);
                                var animation = (view_definition.definition[new_card][0].animation) ? view_definition.definition[new_card][0].animation : {
                                  in: 'fadeIn',
                                  out: 'slideOutLeft'
                                };
                                $('#' + $scope.view_id).removeClass().addClass('animated ' + animation.out).one('animationend', function(eventOne) {
                                  angular.element($('#' + $scope.view_id)).html('');
                                  $('#' + $scope.view_id).removeClass().addClass('animated ' + animation.in);
                                  $scope.addComponents( view_definition.definition, { "id": $scope.view_id }, '', $scope.dfxViewCard, $scope.view_id );
                                });
                            });
                        } else {
                            $http.get( 'views/' + $attrs.dfxView + '/' + $attrs.dfxView + '.json' ).success(function(response) {
                                var view_definition = JSON.parse(response.src);
                                var animation = (view_definition.definition[new_card][0].animation) ? view_definition.definition[new_card][0].animation : {
                                  in: 'fadeIn',
                                  out: 'slideOutLeft'
                                };
                                $('#' + $scope.view_id).removeClass().addClass('animated ' + animation.out + ' flex-100 layout-column').one('animationend', function(eventOne) {
                                  angular.element($('#' + $scope.view_id)).html('');
                                  $('#' + $scope.view_id).removeClass().addClass('animated ' + animation.in + ' flex-100 layout-column');
                                  $scope.addComponents( view_definition.definition, { "id": $scope.view_id }, '', $scope.dfxViewCard, $scope.view_id );

                                  renderHtml();

                                });
                            });
                        }
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
            var gc_ng_hide = '';
            if ( component.attributes.display && component.attributes.display.value !=='' ) {
                gc_ng_hide = ' ng-class="' + component.attributes.display.value + ' ? \'\' : \'ng-hide\'" ';
            }

            if ( component.attributes.repeat_title && component.attributes.repeat_title.value ) {
                var inherited = {
                    "halignment": $scope.$parent.col.halignment.value,
                    "orientation": $scope.$parent.col.orientation.value,
                    "valignment": $scope.$parent.col.valignment.value,
                    "width": $scope.$parent.col.width.value
                };
                var gc_height = ((component.type == 'panel' || component.type == 'tabs' || component.type == 'wizard') &&
                    (!component.attributes.autoHeight || component.attributes.autoHeight.value != true)) ?
                        ' height:100%;' : '';
                var ifLayout = ( $scope.$parent.col.orientation.value === 'row' ) ? ' layout="row" style="flex-wrap: wrap;' : ' style="width:100%;max-height:100%;flex-direction: column;display: flex;';
                ifLayout = ifLayout + gc_height + '"';
                var angular_snippet = $compile(
                    '<div id="'+$attrs.id+
                    '" dfx-gc-web-base dfx-gc-web-'+$attrs.dfxGcWeb+
                    ' gc-role="control" gc-parent="'+$attrs.gcParent+
                    '" view-id="'+$attrs.viewId + gc_ng_hide +
                    '" flex="100"' +
                    ifLayout +
                    '" layout-align="' + inherited.halignment + ' ' + inherited.valignment +
                    '"></div>')($scope);
            } else {
                var flex_container_attr = '', container_style = '';
                if (component.attributes.flex != null) {
                    if ($scope.$parent.col.orientation.value == 'row') {
                        flex_container_attr = ' flex="{{attributes.flex.value}}"';
                    } else if ($scope.$parent.col.orientation.value == 'column') {
                        container_style = 'width:{{attributes.flex.value}}%;';
                    }
                }

                var gc_layout = '';
                if (!component.attributes.autoHeight || component.attributes.autoHeight.value != true) {
                    if (component.type == 'panel') {
                        container_style += 'height:100%;';
                    } else if (component.type == 'tabs' || component.type == 'wizard') {
                        container_style += 'height:100%;';
                        gc_layout = ' layout="column" ';
                    }
                }
                var angular_snippet = $compile('<div id="'+$attrs.id+'" dfx-gc-web-base dfx-gc-web-'+$attrs.dfxGcWeb+' gc-role="control" gc-parent="'+$attrs.gcParent+'" view-id="'+$attrs.viewId+'"' + flex_container_attr + gc_ng_hide + ' style="' + container_style + '" ' + gc_layout + '></div>')($scope);
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
