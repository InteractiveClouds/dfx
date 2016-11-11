var dfxStudioApp = angular.module("dfxStudioApp", ['ngRoute', 'ngMaterial', 'dfxStudioApi', 'nvd3', 'monospaced.qrcode', 'nsPopover']);

dfxStudioApp.config([ '$routeProvider', '$mdThemingProvider', function($routeProvider, $mdThemingProvider) {

    $routeProvider
        .when('/settings', {
            controller: 'dfx_studio_settings_controller',
            templateUrl: 'studioviews/settings.html'
        })
        .when('/home', {
            controller: 'dfx_studio_home_controller',
            templateUrl: 'studioviews/home.html'
        })
        .when('/release-notes', {
            controller: 'dfx_studio_release_notes_controller',
            templateUrl: 'studioviews/release_notes.html'
        })
        .when('/samples', {
            controller: 'dfx_studio_samples_controller',
            templateUrl: 'studioviews/samples.html'
        })
        .when('/support', {
            controller: 'dfx_studio_support_controller',
            templateUrl: 'studioviews/support.html'
        })
        .when('/contactus', {
            controller: 'dfx_studio_contactus_controller',
            templateUrl: 'studioviews/contactus.html'
        })
        .when('/stackoverflow', {
            controller: 'dfx_studio_stackoverflow_controller',
            templateUrl: 'studioviews/stackoverflow.html'
        })
        .when('/search/:searchquery', {
            controller: 'dfx_studio_search_controller',
            templateUrl: 'studioviews/search.html'
        })
        .when('/application/create', {
            controller: 'dfx_studio_new_application_controller',
            templateUrl: 'studioviews/create_app.html'
        })
        .when('/:appname/configuration/:settings', {
            controller: 'dfx_studio_configuration_controller',
            templateUrl: 'studioviews/configuration.html'
        })
        .when('/page/create/:appname/:platform', {
            controller: 'dfx_studio_page_create_controller',
            templateUrl: 'studioviews/page_create.html'
        })
        .when('/page/create/:appname/:platform/:categoryname', {
            controller: 'dfx_studio_page_create_controller',
            templateUrl: 'studioviews/page_create.html'
        })
        .when('/page/update/:appname/:platform/:pagename', {
            controller: 'dfx_studio_page_controller',
            templateUrl: 'studioviews/page.html'
        })
        .when('/pages_categories/:app_name/:platform', {
            controller: 'dfx_studio_page_category_controller',
            templateUrl: 'studioviews/pages_categories.html'
        })
        .when('/view/create/:appname/:platform', {
            controller: 'dfx_studio_view_create_controller',
            templateUrl: 'studioviews/view_create.html'
        })
        .when('/view/create/:appname/:platform/:categoryname', {
            controller: 'dfx_studio_view_create_controller',
            templateUrl: 'studioviews/view_create.html'
        })
        .when('/view/update/:appname/:platform/:viewname', {
            controller: 'dfx_studio_view_controller',
            templateUrl: 'studioviews/view.html'
        })
        .when('/views_categories/:app_name/:platform', {
            controller: 'dfx_studio_view_category_controller',
            templateUrl: 'studioviews/views_categories.html'
        })
        .when('/api_so/create/:appname', {
            controller: 'dfx_studio_api_so_controller',
            templateUrl: 'studioviews/api_so.html'
        })
        .when('/api_so/create/:appname/:categoryname', {
            controller: 'dfx_studio_api_so_controller',
            templateUrl: 'studioviews/api_so.html'
        })
        .when('/api_so/update/:appname/:api_so_name', {
            controller: 'dfx_studio_api_so_controller',
            templateUrl: 'studioviews/api_so.html'
        })
        .when('/api_so_categories/:appname', {
            controller: 'dfx_studio_api_so_category_controller',
            templateUrl: 'studioviews/api_so_categories.html'
        })
        .when('/category/pages/:appname/:platform', {
            controller: 'dfx_studio_category_controller',
            templateUrl: 'studioviews/category.html'
        })
        .when('/category/views/:appname/:platform', {
            controller: 'dfx_studio_category_controller',
            templateUrl: 'studioviews/category.html'
        })
        .when('/category/api_so/:appname', {
            controller: 'dfx_studio_category_controller',
            templateUrl: 'studioviews/category.html'
        })
        .when('/category/pages/:appname/:platform/:categoryname', {
            controller: 'dfx_studio_category_controller',
            templateUrl: 'studioviews/category.html'
        })
        .when('/category/views/:appname/:platform/:categoryname', {
            controller: 'dfx_studio_category_controller',
            templateUrl: 'studioviews/category.html'
        })
        .when('/category/api_so/:appname/:categoryname', {
            controller: 'dfx_studio_category_controller',
            templateUrl: 'studioviews/category.html'
        })
        .when('/platform/:section', {
            controller: 'dfx_studio_platform_controller',
            templateUrl: 'studioviews/platform.html'
        })
        .when('/categories/:entity/:appname', {
         controller: 'dfx_studio_home_controller',
         templateUrl: 'studioviews/views_pages_apiso.html'
         })
        .otherwise('/home', {
            controller: 'dfx_studio_home_controller',
            templateUrl: 'studioviews/home.html'
        })

    $mdThemingProvider.theme('altTheme')
        .primaryPalette('blue') // specify primary color, all
    // other color intentions will be inherited
    // from default
    $mdThemingProvider.setDefaultTheme('altTheme');
}]);

dfxStudioApp.controller("dfx_studio_controller", [ '$scope', '$rootScope', '$mdDialog', '$mdSidenav', '$mdMedia', '$location', '$window', '$compile', 'dfxApplications', 'dfxPages', 'dfxViews', 'dfxApiServiceObjects', 'dfxMessaging', '$routeParams', '$timeout', '$q', '$route', function($scope, $rootScope, $mdDialog, $mdSidenav, $mdMedia, $location, $window, $compile, dfxApplications, dfxPages, dfxViews, dfxApiServiceObjects, dfxMessaging, $routeParams, $timeout, $q, $route) {
    $scope.tenant_id = $('#dfx-studio-main-body').attr( 'data-tenantid' );
    $scope.studio_explorer_visible = true;
    $scope.dfx_version_major   = '3';
    $scope.dfx_version_minor   = '1';
    $scope.dfx_version_release = '1';

    $scope.initStudio = function() {
        return '/studio/home';
    };

    $scope.resourcesClick = function() {
        $scope.resourcesPath = "studioviews/resources.html";
        $scope.javascript = {};
        $scope.dictionary = {};
        $scope.stylesheets = {};
        $scope.assets = {};
    }

    $scope.loadStudioView = function(path) {
        $location.path(path);
    };

    $scope.redirectDocumentation = function(){
        $window.open("http://interactive-clouds.com/documentation/", "_blank") ;
    };

    $scope.signOut = function(path) {
        $window.location.href = '/studio/' + $scope.tenant_id + '/login';
    };

    $scope.refreshSupportForm = function(){
        var sup_scope = angular.element(document.getElementById('support-scope-id')).scope();
        if(sup_scope){
            sup_scope.refreshForm();
        }
    };

    $rootScope.$on('$routeChangeSuccess', function(scope, next, current){
        $scope.settings = $routeParams.settings;
        $scope.platform_section = $routeParams.section;
    });

    $rootScope.$on('$routeChangeStart', function(scope, next, current){
        $scope.settings = $routeParams.settings;
        $scope.platform_section = $routeParams.section;
    });

    $scope.getAll = function(){
        dfxApplications.getAll($scope).then(function(apps){
            $scope.applications = apps.data;
            $scope.appTrees = [];
            for(var i =0; i < $scope.applications.length; i++){
                $scope.appTrees.push({});
            }
            for(var j =0; j < $scope.applications.length; j++){
                (function(){
                    var local = j;
                    dfxApplications.getAppTree($scope, $scope.applications[local].name).then(function(appTree){
                        $scope.appTrees[local] = appTree;
                    })
                })();
            }
        });
        return $q.when($scope.applications);
    };
    $scope.getAll();

    $scope.toggleLeft = function() {
        $scope.studio_explorer_visible = !$scope.studio_explorer_visible;
        if ($scope.studio_explorer_visible) {
            $('#dfx-studio-toggle-explorer-icon').addClass('fa-angle-double-left');
            $('#dfx-studio-toggle-explorer-icon').removeClass('fa-angle-double-right');
            $('#dfx-studio-explorer-title').removeClass('dfx-studio-explorer-title-collapsed');
            $('#dfx-studio-explorer-title-text').removeClass('dfx-studio-explorer-title-text-collapsed');
        } else {
            $('#dfx-studio-explorer-title').addClass('dfx-studio-explorer-title-collapsed');
            $('#dfx-studio-explorer-title-text').addClass('dfx-studio-explorer-title-text-collapsed');
            $('#dfx-studio-toggle-explorer-icon').removeClass('fa-angle-double-left');
            $('#dfx-studio-toggle-explorer-icon').addClass('fa-angle-double-right');
        }
    };

    $scope.loadExplorerMenu = function($event, entity, element, category, type, name, platform) {
        $scope.platform = platform;
        $event.stopImmediatePropagation();
        $scope.closeExplorerMenu();
        $scope.isHomePage = false;
        var snippet = '<md-menu-content width="4" style="left:'+($event.x-5)+'px;top:'+($event.y-5)+'px;" layout="column" class="md-whiteframe-4dp dfx-studio-explorer-popmenu md-menu-bar-menu md-dense .md-button" ng-mouseleave="closeExplorerMenu()">';
        if (entity=='application') {
            snippet += '<md-menu-item><md-button ng-href="#/application/create"><md-icon class="fa fa-plus" aria-label="Create a new Application"></md-icon>Create a new Application</md-button></md-menu-item>';
        } else if (entity=='page') {
            snippet +=  '<md-menu-item><md-button ng-href="#/page/create/'+element+'/'+platform+'"><md-icon class="fa fa-plus" aria-label="Create Page"></md-icon>Create Page</md-button></md-menu-item><md-menu-item><md-button ng-href="#/pages_categories/'+element+'/'+platform+'"><md-icon class="fa fa-list" aria-label="Manage Categories"></md-icon>Manage Categories</md-button></md-menu-item>';
        } else if (entity=='view') {
            snippet +=  '<md-menu-item><md-button ng-href="#/view/create/'+element+'/'+platform+'"><md-icon class="fa fa-plus" aria-label="Create View"></md-icon>Create View</md-button></md-menu-item><md-menu-item><md-button ng-href="#/views_categories/'+element+'/'+platform+'"><md-icon class="fa fa-list" aria-label="Manage Categories"></md-icon>Manage Categories</md-button></md-menu-item>';
        } else if (entity=='api_so') {
            snippet +=  '<md-menu-item><md-button ng-href="#/api_so/create/'+element+'"><md-icon class="fa fa-plus" aria-label="Create API Service Object"></md-icon>Create API Service Object</md-button></md-menu-item><md-menu-item><md-button ng-href="#/api_so_categories/'+element+'"><md-icon class="fa fa-list" aria-label="Manage Categories"></md-icon>Manage Categories</md-button></md-menu-item>';
        } else if (entity=='category') {
            $scope.cat_app = element;
            $scope.cat_name = category;
            $scope.cat_type = type;
            $scope.cat_platform = platform;
            if ( category === 'Default' ) {
                switch ( type ) {
                    case 'page':  snippet += '<md-menu-item><md-button ng-href="#/category/pages/'+element+'/'+platform+'"><md-icon class="fa fa-list-alt" aria-label="List Pages"></md-icon>List Pages</md-button></md-menu-item>' +
                                             '<md-menu-item><md-button ng-href="#/page/create/'+element+'/'+platform+'"><md-icon class="fa fa-plus" aria-label="Create Page"></md-icon>Create Page</md-button></md-menu-item>' +
                                             '<md-menu-item><md-button ng-click="copyCatBtn($event)"><md-icon class="fa fa-copy" aria-label="Copy"></md-icon>Copy Category to ...</md-button></md-menu-item>'; break;
                    case 'view':  snippet += '<md-menu-item><md-button ng-href="#/category/views/'+element+'/'+platform+'"><md-icon class="fa fa-list-alt" aria-label="List Views"></md-icon>List Views</md-button></md-menu-item>' +
                                             '<md-menu-item><md-button ng-href="#/view/create/'+element+'/'+platform+'"><md-icon class="fa fa-plus" aria-label="Create View"></md-icon>Create View</md-button></md-menu-item>' +
                                             '<md-menu-item><md-button ng-click="copyCatBtn($event)"><md-icon class="fa fa-copy" aria-label="Copy"></md-icon>Copy Category to ...</md-button></md-menu-item>'; break;
                    case 'apiso': snippet += '<md-menu-item><md-button ng-href="#/category/api_so/'+element+'"><md-icon class="fa fa-list-alt" aria-label="List API SOs"></md-icon>List API SOs</md-button></md-menu-item>' +
                                             '<md-menu-item><md-button ng-href="#/api_so/create/'+element+'"><md-icon class="fa fa-plus" aria-label="Create API Service Object"></md-icon>Create API Service Object</md-button></md-menu-item>' +
                                             '<md-menu-item><md-button ng-click="copyCatBtn($event)"><md-icon class="fa fa-copy" aria-label="Copy"></md-icon>Copy Category to ...</md-button></md-menu-item>'; break;
                }
            } else {
                switch ( type ) {
                    case 'page':  snippet += '<md-menu-item><md-button ng-href="#/category/pages/'+element+'/'+platform+'/'+category+'"><md-icon class="fa fa-list-alt" aria-label="List Pages"></md-icon>List Pages</md-button></md-menu-item>' +
                                             '<md-menu-item><md-button ng-href="#/page/create/'+element+'/'+platform+'/'+category+'"><md-icon class="fa fa-plus" aria-label="Create Page"></md-icon>Create Page</md-button></md-menu-item>' +
                                             '<md-menu-item><md-button ng-click="renameCategoryBtn($event)"><md-icon class="fa fa-retweet" aria-label="Rename"></md-icon>Rename Category</md-button></md-menu-item>' +
                                             '<md-menu-item><md-button ng-click="copyCatBtn($event)"><md-icon class="fa fa-copy" aria-label="Copy"></md-icon>Copy Category to ...</md-button></md-menu-item>' +
                                             '<md-menu-item><md-button ng-click="confirmDelete($event)"><md-icon class="fa fa-trash" aria-label="Delete"></md-icon>Delete Category</md-button></md-menu-item>'; break;
                    case 'view':  snippet += '<md-menu-item><md-button ng-href="#/category/views/'+element+'/'+platform+'/'+category+'"><md-icon class="fa fa-list-alt" aria-label="List Views"></md-icon>List Views</md-button></md-menu-item>' +
                                             '<md-menu-item><md-button ng-href="#/view/create/'+element+'/'+platform+'/'+category+'"><md-icon class="fa fa-plus" aria-label="Create View"></md-icon>Create View</md-button></md-menu-item>' +
                                             '<md-menu-item><md-button ng-click="renameCategoryBtn($event)"><md-icon class="fa fa-retweet" aria-label="Rename"></md-icon>Rename Category</md-button></md-menu-item>' +
                                             '<md-menu-item><md-button ng-click="copyCatBtn($event)"><md-icon class="fa fa-copy" aria-label="Copy"></md-icon>Copy Category to ...</md-button></md-menu-item>' +
                                             '<md-menu-item><md-button ng-click="confirmDelete($event)"><md-icon class="fa fa-trash" aria-label="Delete"></md-icon>Delete Category</md-button></md-menu-item>'; break;
                    case 'apiso': snippet += '<md-menu-item><md-button ng-href="#/category/api_so/'+element+'/'+category+'"><md-icon class="fa fa-list-alt" aria-label="List API SOs"></md-icon>List API SOs</md-button></md-menu-item>' +
                                             '<md-menu-item><md-button ng-href="#/api_so/create/'+element+'/'+category+'"><md-icon class="fa fa-plus" aria-label="Create API Service Object"></md-icon>Create API Service Object</md-button></md-menu-item>' +
                                             '<md-menu-item><md-button ng-click="renameCategoryBtn($event)"><md-icon class="fa fa-retweet" aria-label="Rename"></md-icon>Rename Category</md-button></md-menu-item>' +
                                             '<md-menu-item><md-button ng-click="copyCatBtn($event)"><md-icon class="fa fa-copy" aria-label="Copy"></md-icon>Copy Category to ...</md-button></md-menu-item>' +
                                             '<md-menu-item><md-button ng-click="confirmDelete($event)"><md-icon class="fa fa-trash" aria-label="Delete"></md-icon>Delete Category</md-button></md-menu-item>'; break;
                }
            }
        } else if (entity === 'menuItem') {
            $scope.targetComponent = {
                "name":        name,
                "application": element,
                "category":    category,
                "type":        type,
                "platform":    platform
            }
            if ( name === 'Home' && category === 'Default' && type === 'page' ) {
                $scope.isHomePage = true;
            }
            switch (type) {
                case 'page':  snippet +=  '<md-menu-item><md-button ng-click="copyToBtn($event)"><md-icon class="fa fa-copy" aria-label="Copy"></md-icon>Copy to ...</md-button></md-menu-item>' +
                                          '<md-menu-item ng-if="!(isHomePage)"><md-button ng-click="moveToBtn($event)"><md-icon class="fa fa-exchange" aria-label="Move"></md-icon>Move to ...</md-button></md-menu-item>'; break;
                case 'view':  snippet +=  '<md-menu-item><md-button ng-click="renameViewBtn($event)"><md-icon class="fa fa-retweet" aria-label="Rename"></md-icon>Rename</md-button></md-menu-item>' +
                                          '<md-menu-item><md-button ng-click="copyToBtn($event)"><md-icon class="fa fa-copy" aria-label="Copy"></md-icon>Copy to ...</md-button></md-menu-item>' +
                                          '<md-menu-item><md-button ng-click="moveToBtn($event)"><md-icon class="fa fa-exchange" aria-label="Move"></md-icon>Move to ...</md-button></md-menu-item>'; break;
                case 'apiso':  snippet += '<md-menu-item><md-button ng-click="copyToBtn($event)"><md-icon class="fa fa-copy" aria-label="Copy"></md-icon>Copy to ...</md-button></md-menu-item>' +
                                          '<md-menu-item><md-button ng-click="moveToBtn($event)"><md-icon class="fa fa-exchange" aria-label="Move"></md-icon>Move to ...</md-button></md-menu-item>'; break;
            }

        }
        snippet += '</md-menu-content>';
        angular.element(document.getElementById('dfx-studio-main-body')).append($compile(snippet)($scope));
    };

    $scope.closeExplorerMenu = function($event) {
        $('.dfx-studio-explorer-popmenu').remove();
    };

    $scope.renameCategoryBtn = function($event) {
        var parentEl = angular.element(document.body);

        $mdDialog.show({
            parent: parentEl,
            targetEvent: $event,
            clickOutsideToClose: true,
            scope: $scope.$new(),
            templateUrl: 'studioviews/category_rename.html',
            controller: DialogController
        });

        function DialogController($scope, $mdDialog) {
            $scope.renameCategory = function( newName ) {
                if ( (newName !== '') && (/^[-a-zA-Z0-9_]+$/.test( newName )) ) {
                    if ( $scope.cat_type === 'page' ) {
                        dfxPages.editCategory( $scope, $scope.cat_name, newName, $scope.cat_app, $scope.cat_platform ).then(function( data ) {
                            if ( data.data.data !== 'Current category name already exists' ) {
                                dfxMessaging.showMessage(data.data.data);
                                $scope.getAll();
                                $route.reload();
                                $mdDialog.hide();
                            } else {
                                dfxMessaging.showWarning(data.data.data);
                            }
                        });
                    } else if ( $scope.cat_type === 'view' ) {
                        dfxViews.editCategory( $scope, $scope.cat_name, newName, $scope.cat_app, $scope.cat_platform ).then(function( data ) {
                            if ( data.data.data !== 'Current category name already exists' ) {
                                dfxMessaging.showMessage(data.data.data);
                                $scope.getAll();
                                $route.reload();
                                $mdDialog.hide();
                            } else {
                                dfxMessaging.showWarning(data.data.data);
                            }
                        });
                    } else if ( $scope.cat_type === 'apiso' ) {
                        dfxApiServiceObjects.editCategory( $scope, $scope.cat_name, newName, $scope.cat_app ).then(function( data ) {
                            if ( data.data.data !== 'Current category name already exists' ) {
                                dfxMessaging.showMessage(data.data.data);
                                $scope.getAll();
                                $route.reload();
                                $mdDialog.hide();
                            } else {
                                dfxMessaging.showWarning(data.data.data);
                            }
                        });
                    }
                } else {
                    dfxMessaging.showWarning('Not valid category name');
                }
            }

            $scope.closeDialog = function() {
                $mdDialog.hide();
            }
        }
    }

    $scope.deleteCategory = function() {
        if ( $scope.cat_type === 'page' ) {
            dfxPages.removeCategory( $scope, $scope.cat_name, $scope.cat_app, $scope.cat_platform ).then(function( data ) {
                if ( data.status && data.status === 200 ) {
                    dfxMessaging.showMessage(data.data.data);
                    $scope.getAll();
                    $route.reload();
                } else {
                    dfxMessaging.showWarning(data.data.data);
                }
            });
        } else if ( $scope.cat_type === 'view' ) {
            dfxViews.removeCategory( $scope, $scope.cat_name, $scope.cat_app, $scope.cat_platform ).then(function( data ) {
                if ( data.status && data.status === 200 ) {
                    dfxMessaging.showMessage(data.data.data);
                    $scope.getAll();
                    $route.reload();
                } else {
                    dfxMessaging.showWarning(data.data.data);
                }
            });
        } else if ( $scope.cat_type === 'apiso' ) {
            dfxApiServiceObjects.removeCategory( $scope, $scope.cat_name, $scope.cat_app ).then(function( data ) {
                if ( data.status && data.status === 200 ) {
                    dfxMessaging.showMessage(data.data.data);
                    $scope.getAll();
                    $route.reload();
                } else {
                    dfxMessaging.showWarning(data.data.data);
                }
            });
        }
    }

    $scope.confirmDelete = function($event) {
        var confirm = $mdDialog.confirm()
            .title('Are you sure you want to remove this category?')
            .textContent('Category will be removed from the repository')
            .ariaLabel('remove service')
            .targetEvent($event)
            .cancel('Cancel')
            .ok('OK');
        $mdDialog.show(confirm).then(function() {
            $scope.deleteCategory();
        }, function() {
        });
    }

    $scope.renameViewBtn = function($event) {
        var parentEl = angular.element(document.body);

        $mdDialog.show({
            parent: parentEl,
            targetEvent: $event,
            clickOutsideToClose: true,
            scope: $scope.$new(),
            templateUrl: 'studioviews/view_rename.html',
            controller: DialogController
        });

        function DialogController($scope, $mdDialog) {
            $scope.rename = function( newName ) {
                var testName = /^[-a-zA-Z0-9_]+$/.test( newName );

                if ( newName && testName ) {
                    dfxViews.getOne( $scope, $scope.targetComponent.application, $scope.targetComponent.name, $scope.targetComponent.platform ).then( function(data) {
                        var to_rename = {
                            "name": $scope.newName.value,
                            "oldname": data.name,
                            "application": data.application,
                            "category": data.category,
                            "platform": data.platform,
                            "src_script": data.src_script
                        }
                        dfxViews.rename( $scope, to_rename ).then( function(data) {
                            dfxMessaging.showMessage('View has been successfully renamed');
                            $scope.getAll();
                            $mdDialog.hide();
                            if ( $location.$$path === ('/view/update/' + to_rename.application + '/' + to_rename.oldname) ) {
                                $location.path('/view/update/' + to_rename.application + '/' + to_rename.name);
                            }
                        }, function(data) {
                            dfxMessaging.showWarning('View with name "' + newName + '" already exists');
                        });
                    });
                } else {
                    dfxMessaging.showWarning('Not valid view name');
                }
            }

            $scope.closeDialog = function () {
                $mdDialog.hide();
            }

        }
    }

    $scope.copyToBtn = function($event, callback) {
        var parentEl = angular.element(document.body);

        $mdDialog.show({
            parent: parentEl,
            targetEvent: $event,
            clickOutsideToClose: true,
            scope: $scope.$new(),
            templateUrl: 'studioviews/copy_component_dialog.html',
            controller: DialogController
        });

        function DialogController($scope, $mdDialog) {
            $scope.toCopy = {
                "name":              $scope.targetComponent.name,
                "application":       $scope.targetComponent.application,
                "applicationTarget": $scope.targetComponent.application,
                "queryName":         $scope.targetComponent.name,
                "categoryTarget":    $scope.targetComponent.category,
                "type":              "",
                "platform":          $scope.targetComponent.platform
            }
            $scope.validPrefix = true;

            $scope.chooseCategories = function( appName ) {
                $scope.categories = [];
                $scope.appAllRoutes = [];
                dfxApplications.getAppTree( $scope, appName ).then(function( data ) {
                    switch ( $scope.targetComponent.type ) {
                        case 'page': for ( var cat in data.data['pages'][$scope.targetComponent.platform] ) { $scope.categories.push(cat); } break;
                        case 'view': for ( var cat in data.data['views'][$scope.targetComponent.platform] ) { $scope.categories.push(cat); } break;
                        case 'apiso':
                            for ( var cat in data.data['apiServices'] ) {
                                $scope.categories.push(cat);
                                for ( var i = 0; i < data.data['apiServices'][cat].length; i++ ) {
                                    for ( var j = 0; j < data.data['apiServices'][cat][i]['services'].length; j++ ) {
                                        $scope.appAllRoutes.push( data.data['apiServices'][cat][i]['services'][j] );
                                    }
                                }
                            }
                            break;
                    }
                    $scope.toCopy.categoryTarget = $scope.categories[0];
                });
            }

            $scope.chooseCategories( $scope.targetComponent.application );

            if ( $scope.targetComponent.type === 'apiso' ) {
                $scope.validPrefix = false;
                $scope.prefix = {
                    "value": $scope.targetComponent.name
                };
            }

            $scope.copyComponent = function() {
                var nameExp = /([\\/\-+(){}[\]=<>*~`?\! '\"',.;:$@#])/ig,
                    nameRes = nameExp.exec( $scope.toCopy.name);

                if ( $scope.targetComponent.type === 'apiso' ) {
                    var prefixRes = nameExp.exec( $scope.prefix.value );

                    if ( !prefixRes && $scope.prefix.value !=='' ) {
                        var prefixMatch = 0;
                        for ( var i=0; i < $scope.appAllRoutes.length; i++ ){
                            if ( $scope.appAllRoutes[i].indexOf($scope.prefix.value + '/') === 0 ) {
                                ++prefixMatch;
                            }
                        }
                        prefixMatch === 0 ? $scope.validPrefix = true : $scope.validPrefix = false;
                    }
                }

                if ( $scope.validPrefix && !nameRes && !prefixRes && $scope.toCopy.name !== '' ) {
                    switch ( $scope.targetComponent.type ) {
                        case 'page': $scope.toCopy.type = 'screen'; break;
                        case 'view': $scope.toCopy.type = 'widget'; break;
                        case 'apiso':
                            $scope.toCopy.type = 'dataquery';
                            $scope.toCopy.prefix = $scope.prefix.value;
                            break;
                    }

                    dfxApplications.copyObject( $scope, $scope.toCopy ).then(function( data ) {
                        if ( data.data.data.type === 'error' ) {
                            dfxMessaging.showWarning( data.data.data.message );
                        } else {
                            switch ( $scope.targetComponent.type ) {
                                case 'page': dfxMessaging.showMessage( 'Page ' + $scope.toCopy.name + ' has been successfully copied' ); break;
                                case 'view': dfxMessaging.showMessage( 'View ' + $scope.toCopy.name + ' has been successfully copied' ); break;
                                case 'apiso': dfxMessaging.showMessage( 'API service object ' + $scope.toCopy.name + ' has been successfully copied' ); break;
                            }
                            $scope.getAll();
                            if (callback != null) {
                                callback();
                            }
                            $mdDialog.hide();
                        }
                    });
                } else {
                    switch ( $scope.targetComponent.type ) {
                        case 'page': dfxMessaging.showWarning( 'Not valid page name' ); break;
                        case 'view': dfxMessaging.showWarning( 'Not valid view name' ); break;
                        case 'apiso':
                            if ( nameRes ) {
                                dfxMessaging.showWarning( 'Not valid API service object name' );
                                break;
                            } else if ( prefixRes || $scope.prefix.value === '' ) {
                                dfxMessaging.showWarning( 'Not valid API route prefix' );
                                break;
                            } else {
                                dfxMessaging.showWarning( 'API route prefix "' + $scope.prefix.value + '" already exists' );
                                break;
                            }
                    }
                }
            }

            $scope.closeDialog = function() {
                $mdDialog.hide();
            }
        }
    }

    $scope.moveToBtn = function($event) {
        var parentEl = angular.element(document.body);

        $mdDialog.show({
            parent: parentEl,
            targetEvent: $event,
            clickOutsideToClose: true,
            scope: $scope.$new(),
            templateUrl: 'studioviews/move_component_dialog.html',
            controller: DialogController
        });

        function DialogController($scope, $mdDialog) {
            $scope.categories = [];
            $scope.toMove = {};

            switch ( $scope.targetComponent.type ) {
                case 'page':
                    dfxPages.getOne( $scope, $scope.targetComponent.application, $scope.targetComponent.name, $scope.targetComponent.platform ).then(function( data ) {
                        $scope.toMove = data;
                    });
                    dfxPages.getCategories( $scope, $scope.targetComponent.application, $scope.targetComponent.platform ).then(function( data ) {
                        for ( var i = 0; i < data.data[$scope.targetComponent.platform].length; i++ ){
                            $scope.categories.push( data.data[$scope.targetComponent.platform][i].name );
                        }
                    });
                    break;
                case 'view':
                    dfxViews.getOne( $scope, $scope.targetComponent.application, $scope.targetComponent.name, $scope.targetComponent.platform ).then(function( data ) {
                        $scope.toMove = data;
                    });
                    dfxViews.getCategories( $scope, $scope.targetComponent.application, $scope.targetComponent.platform ).then(function( data ) {
                        for ( var i = 0; i < data.data[$scope.targetComponent.platform].length; i++ ){
                            $scope.categories.push( data.data[$scope.targetComponent.platform][i].name );
                        }
                    });
                    break;
                case 'apiso':
                    dfxApiServiceObjects.getOne( $scope, $scope.targetComponent.application, $scope.targetComponent.name ).then(function( data ) {
                        $scope.toMove = data.data.query;
                    });
                    dfxApiServiceObjects.getCategories( $scope, $scope.targetComponent.application ).then(function( data ) {
                        for ( var i = 0; i < data.data.querycats.length; i++ ){
                            $scope.categories.push( data.data.querycats[i].name );
                        }
                    });
                    break;
            }

            $scope.toMove.category = $scope.categories[0];

            $scope.moveComponent = function() {
                switch ( $scope.targetComponent.type ) {
                    case 'page':
                        dfxPages.update( $scope, $scope.toMove ).then(function( data ) {
                            data.result === 'success' ? dfxMessaging.showMessage('Page has been successfully moved') : dfxMessaging.showWarning('There was an error during moving page');
                            $scope.getAll();
                            $mdDialog.hide();
                            if ( $location.path() === '/page/update/' + $scope.targetComponent.application + '/' + $scope.targetComponent.name ) {
                                $route.reload();
                            }
                        });
                        break;
                    case 'view':
                        dfxViews.update( $scope, $scope.toMove ).then(function( data ) {
                            data.result === 'success' ? dfxMessaging.showMessage('View has been successfully moved') : dfxMessaging.showWarning('There was an error during moving view');
                            $scope.getAll();
                            $mdDialog.hide();
                            if ( $location.path() === '/view/update/' + $scope.targetComponent.application + '/' + $scope.targetComponent.name ) {
                                $route.reload();
                            }
                        });
                        break;
                    case 'apiso':
                        delete $scope.toMove._id;
                        var movedRoutes = [];
                        for ( var key in $scope.toMove.apiRoutes ) {
                            var movedRoute = {};
                            movedRoute.data = $scope.toMove.apiRoutes[key];
                            movedRoute.name = key;
                            movedRoutes.push( movedRoute );
                        }
                        $scope.toMove.apiRoutes = movedRoutes ;
                        dfxApiServiceObjects.updateSo( $scope, $scope.toMove ).then(function( data ) {
                            data.data.result === 'success' ? dfxMessaging.showMessage('API service object has been successfully moved') : dfxMessaging.showWarning('There was an error during moving API service object');
                            $scope.getAll();
                            $mdDialog.hide();
                            if ( $location.path() === '/api_so/update/' + $scope.targetComponent.application + '/' + $scope.targetComponent.name ) {
                                $route.reload();
                            }
                        });
                        break;
                }
            }

            $scope.closeDialog = function() {
                $mdDialog.hide();
            }
        }
    }

    $scope.copyCatBtn = function($event) {
        var parentEl = angular.element(document.body);

        $mdDialog.show({
            parent: parentEl,
            targetEvent: $event,
            clickOutsideToClose: true,
            scope: $scope.$new(),
            templateUrl: 'studioviews/copy_category_dialog.html',
            controller: DialogController
        });

        function DialogController($scope, $mdDialog) {
            $scope.categoryObject = {
                "applicationName":   $scope.cat_app,
                "applicationTarget": $scope.cat_app,
                "categoryName":      $scope.cat_name,
                "categoryTarget":    $scope.cat_name,
                "type":              ""
            }
            $scope.copyType = '';
            $scope.validPrefix = true;

            switch ( $scope.cat_type ) {
                case 'page': $scope.categoryObject.type = 'screen'; $scope.categoryObject.platform = $scope.cat_platform; $scope.categoryObject.ownerId = ''; $scope.copyType = 'pages'; break;
                case 'view': $scope.categoryObject.type = 'widget'; $scope.categoryObject.platform = $scope.cat_platform; $scope.categoryObject.ownerId = ''; $scope.copyType = 'views'; break;
                case 'apiso':
                    $scope.categoryObject.type = 'dataquery';
                    $scope.categoryObject.prefix = $scope.cat_name;
                    $scope.copyType = 'API Service Objects';
                    $scope.validPrefix = false;
                    break;
            }

            $scope.chooseApp = function( appName ) {
                $scope.categories = [];
                $scope.appAllRoutes = [];
                dfxApplications.getAppTree( $scope, appName ).then(function( data ) {
                    switch ( $scope.cat_type ) {
                        case 'page': for ( var cat in data.data['pages'] ) { $scope.categories.push(cat); } break;
                        case 'view': for ( var cat in data.data['views'] ) { $scope.categories.push(cat); } break;
                        case 'apiso':
                            //var hasServices = 0;
                            //$scope.showPrefix = false;
                            //
                            //if ( data.data.apiServices[$scope.cat_name].length > 0 ) {
                            //    for ( var i = 0; i < data.data.apiServices[$scope.cat_name].length; i++ ) {
                            //        if ( data.data.apiServices[$scope.cat_name][i].services.length > 0 ) {
                            //            ++hasServices;
                            //        }
                            //    }
                            //}
                            //
                            //if ( hasServices > 0 ) {
                            //    $scope.showPrefix = true;
                            //    $scope.validPrefix = false;
                            //} else {
                            //    $scope.validPrefix = true;
                            //}

                            for ( var cat in data.data['apiServices'] ) {
                                $scope.categories.push(cat);
                                for ( var i = 0; i < data.data['apiServices'][cat].length; i++ ) {
                                    for ( var j = 0; j < data.data['apiServices'][cat][i]['services'].length; j++ ) {
                                        $scope.appAllRoutes.push( data.data['apiServices'][cat][i]['services'][j] );
                                    }
                                }
                            }
                            break;
                    }
                });
            }

            $scope.chooseApp( $scope.cat_app );

            $scope.copyCat = function() {
                var nameExp = /([\\/\-+(){}[\]=<>*~`?\! '\"',.;:$@#])/ig,
                    nameRes = nameExp.exec( $scope.categoryObject.categoryTarget );

                if ( $scope.cat_type === 'apiso' ) {
                    var prefixRes = nameExp.exec( $scope.categoryObject.prefix );

                    if ( !prefixRes && $scope.categoryObject.prefix !=='' ) {
                        var prefixMatch = 0;
                        for ( var i=0; i < $scope.appAllRoutes.length; i++ ){
                            if ( $scope.appAllRoutes[i].indexOf($scope.categoryObject.prefix + '/') === 0 ) {
                                ++prefixMatch;
                            }
                        }
                        prefixMatch === 0 ? $scope.validPrefix = true : $scope.validPrefix = false;
                    }
                }

                if ( $scope.validPrefix && !nameRes && !prefixRes && $scope.categoryObject.categoryTarget !== '' ) {
                    dfxApplications.copyCategory( $scope, $scope.categoryObject ).then(function( data ) {
                        dfxMessaging.showMessage( 'Category ' + $scope.categoryObject.categoryTarget + ' has been successfully copied' );
                        $scope.getAll();
                        $mdDialog.hide();
                    }, function( data ) {
                        var errorData = data.data.error.message;
                        if ( errorData.indexOf('category') === -1 ) {
                            dfxMessaging.showMessage( 'Category ' + $scope.categoryObject.categoryTarget + ' has been successfully copied, but without existing ' + $scope.copyType );
                            $scope.getAll();
                            $mdDialog.hide();
                        } else {
                            dfxMessaging.showWarning( errorData );
                        }
                    });
                } else if ( $scope.cat_type !== 'apiso' || nameRes ) {
                    dfxMessaging.showWarning('Not valid category name');
                } else if ( prefixRes || $scope.categoryObject.prefix === '' ) {
                    dfxMessaging.showWarning( 'Not valid API route prefix' );
                } else {
                    dfxMessaging.showWarning( 'API route prefix "' + $scope.categoryObject.prefix + '" already exists' );
                }
            }

            $scope.closeDialog = function() {
                $mdDialog.hide();
            }
        }
    }
}]);

dfxStudioApp.controller("dfx_studio_search_controller", [ '$scope', '$routeParams', '$location', 'dfxApplications', function($scope, $routeParams, $location, dfxApplications) {
    var bodyHeight = parseFloat($("body").css('height')),
        searchResults = document.getElementById('search-results');
    $(searchResults).css('height', bodyHeight-110);

    $scope.runSearch = function() {
        if ( $routeParams.searchquery ) {
            dfxApplications.findAll( $routeParams.searchquery ).then( function( data ) {
                $scope.pagesArray = [];
                $scope.viewsArray = [];
                $scope.apiSoArray = [];
                if ( data.data.screens.length > 0 ) {
                    $scope.pagesArray = data.data.screens;
                }
                if ( data.data.widgets.length > 0 ) {
                    $scope.viewsArray = data.data.widgets;
                }
                if ( data.data.queries.length > 0 ) {
                    $scope.apiSoArray = data.data.queries;
                }
            });
        }
    }

    $scope.runSearch();

    $scope.editPage = function( app_name, page_platform, page_name ) {
        $location.path('/page/update/' + app_name + '/' + page_platform + '/' + page_name);
    }

    $scope.editView = function( app_name, view_platform, view_name ) {
        $location.path('/view/update/' + app_name + '/' + view_platform + '/' + view_name);
    }

    $scope.editApiSo = function( app_name, api_so_name ) {
        $location.path('/api_so/update/' + app_name + '/' + api_so_name);
    }
}]);

dfxStudioApp.controller("dfx_studio_category_controller", [ '$scope', '$routeParams', '$location', 'dfxApplications', function($scope, $routeParams, $location, dfxApplications) {
    if ( $location.$$path.indexOf('pages') === 10 ) {
        $scope.entity = 'pages';
    } else if ( $location.$$path.indexOf('views') === 10 ) {
        $scope.entity = 'views';
    } else if ( $location.$$path.indexOf('api_so') === 10  ) {
        $scope.entity = 'apiServices';
    }

    $scope.app_name = $routeParams.appname;
    if ( $routeParams.platform ) {
        $scope.cat_platform = $routeParams.platform;
    }
    $scope.category = $routeParams.categoryname ? $routeParams.categoryname : 'Default';
    $scope.table_data = [];

    dfxApplications.getAppTree( $scope, $scope.app_name ).then(function( data ) {
        if ( $scope.entity === 'apiServices' ) {
            for ( var cat in data.data['apiServices'] ) {
                if ( cat === $scope.category ) {
                    $scope.table_data = data.data['apiServices'][cat];
                }
            }
        } else if ( $scope.entity === 'pages' || $scope.entity === 'views' ) {
            $scope.table_data = data.data[$scope.entity][$scope.cat_platform][$scope.category];
        }
    });

    $scope.edit = function( name ) {
        switch ( $scope.entity ) {
            case 'pages':       $location.path('/page/update/' + $scope.app_name + '/' + $scope.cat_platform + '/'+ name); break;
            case 'views':       $location.path('/view/update/' + $scope.app_name + '/' + $scope.cat_platform + '/' + name); break;
            case 'apiServices': $location.path('/api_so/update/' + $scope.app_name + '/' + name); break;
        }
    };

    $scope.addEntity = function( name, platform ) {
        switch ( $scope.entity ) {
            case 'pages':       $location.path('/page/create/' + $scope.app_name + '/' + platform + '/' + name); break;
            case 'views':       $location.path('/view/create/' + $scope.app_name + '/' + platform + '/' + name); break;
            case 'apiServices': $location.path('/api_so/create/' + $scope.app_name + '/' + name); break;
        }
    };
}]);

dfxStudioApp.controller("dfx_studio_platform_controller", [ '$scope', '$mdSidenav', 'dfxMessaging', '$mdDialog', '$timeout', function($scope, $mdSidenav, dfxMessaging, $mdDialog, $timeout) {
    $scope.developers = {};
    $scope.cloud = {};
    $scope.$watch('$parent.platform_section', function(newVal){
        var platform_tabs = ['developers','cloud','settings'];
        if(platform_tabs.indexOf(newVal) !== -1){
            $scope.section = newVal;
            $timeout(function(){
                $scope.platformTabs = $('#dfx-studio-main-content > div > md-tabs > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper').children();
                $($scope.platformTabs[platform_tabs.indexOf(newVal)]).trigger('click');
            },0);
        }
    });

    $scope.defineSection = function(section){
        for(var i= 0; i < 2; i++){
            if($scope.platformTabs && $($scope.platformTabs[i]).hasClass('md-active')){
                $scope.section = section;
            }
        }
    };
}]);

dfxStudioApp.controller("dfx_studio_cloud_controller", [ '$scope', 'dfxPlatformBluemix', 'dfxPhoneGapProperties', '$mdSidenav', 'dfxMessaging', '$mdDialog', '$timeout', 'dfxDeployment', 'dfxApplications', function($scope, dfxPlatformBluemix, dfxPhoneGapProperties, $mdSidenav, dfxMessaging, $mdDialog, $timeout, dfxDeployment, dfxApplications) {
    var parentScope = $scope.$parent;
    parentScope.cloud = $scope;
    $scope.bluemix = {};
    $scope.bluemix.credentials = {
        email:                  "",
        password:               "",
        selected_organization:  "",
        selected_space:         ""
    };

    // PhoneGap
    var tenantId = $scope.$parent.$parent.tenant_id;
    dfxPhoneGapProperties.getData(tenantId).then(function(tenant){
        $scope.phoneGapLogin = tenant.phoneGapLogin;
        $scope.phoneGapPassword = tenant.phoneGapPassword;
    });
    $scope.savePhoneGapData = function() {
        var data = {"phoneGapLogin" : $('#phoneGapLogin').val(), "phoneGapPassword" : $('#phoneGapPassword').val()};
        dfxPhoneGapProperties.saveData(tenantId, data).then(function(){
            dfxMessaging.showMessage('PhoneGap properties has been successfully updated');
        });
    }

    GLOBAL_SOCKET.on('tenant_'+ $scope.tenant_id +'_bmImageBuild', function(data){
        if (data.result === 'success')  {
            $scope.$apply(function(){
                $scope.bluemix.images.map(function(image){
                    if ((image.clearImageName === data.clearImageName) && (image.version == data.version)){
                        image.created = (new Date).toISOString();
                        delete image.started;
                    }
                });
            })
        }
    });

    $scope.bluemix.toggleImageApps = function(index){
        if($scope.bluemix.images[index].show_apps){
            $scope.bluemix.images[index].show_apps = false ;
            $scope.bluemix.images_counter = $scope.bluemix.images_counter -1;
        }else{
            $scope.bluemix.images[index].show_apps = true ;
            $scope.bluemix.images_counter = $scope.bluemix.images_counter +1;
        }
    };

    $scope.bluemix.closeSidenav = function(){
        var sideNavInstance = $mdSidenav('side_nav_left');
        sideNavInstance.toggle();
    };

    $scope.getAppsBuilds = function(){
        dfxPlatformBluemix.getAppsBuilds().then(function(data){
            var apps = data.data;
            for(var i = 0; i < apps.length; i++){
                for(key in apps[i]){
                    $scope.bluemix.new_image.applications.push({
                        application_name: key,
                        builds: apps[i][key],
                        display_builds: false
                    });
                }
            }
            $scope.bluemix.builds_counter = 0;
        });
    };

    $scope.bluemix.saveImage = function(){
        $scope.bluemix.disabled_button = true ;
        $scope.bluemix.show_sidenav_content = false;
        var alert = '';
        if ($.isEmptyObject($scope.bluemix.new_image.name)) {
            alert = "Image name can't be empty";
        }else if (!/^[-a-zA-Z0-9]+$/.test($scope.bluemix.new_image.name)) {
            alert = "Image name can have only letters, numbers or dash symbols";
        }else if($.isEmptyObject($scope.bluemix.new_image.version)){
            alert = "Image version can't be empty";
        }else if (!/^[-a-zA-Z0-9]+$/.test($scope.bluemix.new_image.version)) {
            alert = "Image version can have only letters, numbers or dash symbols";
        }
        if(alert!==''){
            $scope.bluemix.disabled_button = false ;
            $scope.bluemix.show_sidenav_content = true;
            dfxMessaging.showWarning(alert) ;
            return;
        }
        var is_unique = true;
        for(var z = 0; z < $scope.bluemix.images.length; z++){
            if(($scope.bluemix.images[z].clearImageName + $scope.bluemix.images[z].version) === ($scope.bluemix.new_image.name + $scope.bluemix.new_image.version)){
                is_unique = false;
            }
        }
        if(is_unique){
            var result = [];
            var content = [];
            for(var i= 0; i < $scope.bluemix.new_image.applications.length; i++){
                for(var j= 0; j < $scope.bluemix.new_image.applications[i].builds.length; j++){
                    if($scope.bluemix.new_image.applications[i].builds[j].selected){
                        $scope.bluemix.new_image.applications[i].selected = true;
                        result.push({name: $scope.bluemix.new_image.applications[i].application_name,
                            build: ($scope.bluemix.new_image.applications[i].builds[j].app_version + '.' +  $scope.bluemix.new_image.applications[i].builds[j].build_number),
                            platform : $scope.bluemix.new_image.applications[i].builds[j].platform});
                    }
                }
            }

            for(var q= 0; q < $scope.bluemix.new_image.applications.length; q++){
                if($scope.bluemix.new_image.applications[q].selected){
                    content.push({
                        name: $scope.bluemix.new_image.applications[q].application_name,
                        builds: [],
                        display_builds: false
                    })
                    for(var t =0; t < $scope.bluemix.new_image.applications[q].builds.length; t++){
                        if($scope.bluemix.new_image.applications[q].builds[t].selected){
                            content[content.length - 1].builds.push($scope.bluemix.new_image.applications[q].builds[t].app_version + '.' + $scope.bluemix.new_image.applications[q].builds[t].build_number);
                        }
                    }
                }
            }
            $scope.bluemix.builds_counter = 0;

            dfxPlatformBluemix.saveImage($scope.bluemix.new_image.name, $scope.bluemix.new_image.version, result).then(function(){
                $scope.bluemix.disabled_button = false ;
                $scope.bluemix.show_sidenav_content = true;
                dfxMessaging.showMessage('Started creating Bluemix image');
                $scope.bluemix.images.push({
                    clearImageName:     $scope.bluemix.new_image.name,
                    version:            $scope.bluemix.new_image.version,
                    content:            content
                })
                var sideNavInstance = $mdSidenav('side_nav_left');
                sideNavInstance.toggle();
            }, function(){
                $scope.bluemix.disabled_button = false ;
                $scope.bluemix.show_sidenav_content = true;
            });
        }else{
            dfxMessaging.showWarning('Can\'t save, because image with such name and version already exists');
            $scope.bluemix.disabled_button = false ;
            $scope.bluemix.show_sidenav_content = true;
        }
    };

    $scope.bluemix.confirmImageDelete = function(ev, image, index) {
        var confirm = $mdDialog.confirm()
            .title('Are you sure you want to delete this image?')
            .textContent('Image will be removed from Bluemix.')
            .ariaLabel('remove image')
            .targetEvent(ev)
            .cancel('Cancel')
            .ok('OK');
        $mdDialog.show(confirm).then(function() {
            $scope.bluemix.deleteImage(image, index);
        }, function() {
        });
    };

    $scope.bluemix.deleteImage = function(image, index){
        dfxPlatformBluemix.deleteImage(image.clearImageName, image.version).then(function(){
            $scope.bluemix.images.splice(index, 1);
            dfxMessaging.showMessage('Image data has been successfully deleted');
        }, function(){
            dfxMessaging.showWarning('Can\'t delete image');
        });
    };

    $scope.bluemix.runImage = function(image){
        /*dfxPlatformBluemix.runImage().then(function(){

         });*/
    };

    $scope.bluemix.toggleNewImageBuilds = function(index, val){
        if($scope.bluemix.new_image.applications[index].display_builds){
            $scope.bluemix.new_image.applications[index].display_builds = false;
            $scope.bluemix.builds_counter = $scope.bluemix.builds_counter - 1;
        }else{
            $scope.bluemix.new_image.applications[index].display_builds = true;
            $scope.bluemix.builds_counter = $scope.bluemix.builds_counter + 1;
        }
    };

    $scope.initBluemixImage = function(){
        $scope.bluemix.show_sidenav_content = true;
        $scope.bluemix.new_image = {
            applications :      [],
            name:               "",
            version:            ""
        };
        $scope.getAppsBuilds();
        var sideNavInstance = $mdSidenav('side_nav_left');
        sideNavInstance.toggle();
    };

    dfxPlatformBluemix.getUser().then(function(res){
        var user = res.data.data ;
        if(user.email){
            $scope.bluemix.credentials.email = user.email ;
            $scope.bluemix.logged_in = true;
            $scope.bluemix.authenticated = false;
            $scope.bluemix.organizations_list = user.organizations ;
            $scope.bluemix.credentials.selected_organization = user.choosenOrg ;
            $scope.bluemix.space_list = user.spaces ;
            $scope.bluemix.credentials.selected_space = user.choosenSpace ;
            $scope.bluemix.space_spinner = true ;
                dfxPlatformBluemix.loginCF().then(function(){
                    dfxPlatformBluemix.remoteImagesList().then(function(images){
                        $scope.bluemix.images = images ;
                        for(var x = 0; x < $scope.bluemix.images.length; x++){
                            $scope.bluemix.images[x].show_apps = false ;
                        }
                        $scope.bluemix.images_counter = 0;
                        $scope.bluemix.space_spinner = false ;
                        $scope.bluemix.authenticated = true ;
                    });
                });
        }else{
            $scope.bluemix.logged_in = false;
            $scope.bluemix.authenticated = false ;
        }

    }, function(){

    });

    /*
    var data = {
        email : "vova@interactive-clouds.com",
        pass  : "anSp5G5zzy9guIkP1sKPy6Sd"
    };
   */

    $scope.bluemix.logout = function(){
        dfxPlatformBluemix.bluemixLogout().then(function(res){
            $scope.bluemix.credentials = {}
            $scope.bluemix.organizations_list = "" ;
            $scope.bluemix.space_list = "" ;
            $scope.bluemix.authenticated = false ;
            $scope.bluemix.logged_in = false ;
        });
    };

    $scope.bluemix.getOrgsList = function(){
        dfxPlatformBluemix.getOrgsList().then(function(res){
            $scope.bluemix.organizations_list = res.data.data;
            if(Object.keys($scope.bluemix.organizations_list).length === 1){
                $scope.bluemix.credentials.selected_organization = Object.keys($scope.bluemix.organizations_list)[0];
                $scope.bluemix.setChoosenOrg($scope.bluemix.credentials.selected_organization);
            }
        }, function(){
            $scope.bluemix.organization_spinner = false ;
        });
    };

    $scope.bluemix.setChoosenOrg = function(guid){
        $scope.bluemix.organization_spinner = true ;
        dfxPlatformBluemix.setChoosenOrg(guid).then(function(){
            $scope.bluemix.getSpacesList() ;
        }, function(){
            $scope.bluemix.organization_spinner = false ;
        });
    };

    $scope.bluemix.getSpacesList = function(){
        dfxPlatformBluemix.getSpacesList().then(function(res){
            $scope.bluemix.organization_spinner = false ;
            $scope.bluemix.space_list = res.data.data ;
            if(Object.keys($scope.bluemix.space_list).length === 1){
                $scope.bluemix.credentials.selected_space = Object.keys($scope.bluemix.space_list)[0];
                $scope.bluemix.setChoosenSpace($scope.bluemix.credentials.selected_space);
            }
        });
    };

    $scope.bluemix.setChoosenSpace = function(guid){
        $scope.bluemix.space_spinner = true ;
        dfxPlatformBluemix.setChoosenSpace(guid).then(function(){
            dfxPlatformBluemix.loginCF().then(function(){
                dfxPlatformBluemix.remoteImagesList().then(function(images){
                    $scope.bluemix.images = images ;
                    for(var x = 0; x < $scope.bluemix.images.length; x++){
                        $scope.bluemix.images[x].show_apps = false ;
                    }
                    $scope.bluemix.images_counter = 0;
                    $scope.bluemix.space_spinner = false ;
                    $scope.bluemix.authenticated = true ;
                });
            });
        });
    };

    $scope.bluemix.loginDialog = function() {
        $mdDialog.show({
            scope: $scope.$new(),
            controller: DialogController,
            templateUrl: 'studioviews/bluemix_login_dialog.html',
            parent: angular.element(document.body),
            clickOutsideToClose:true
        }).then(function() {

        }, function() {
            // if cancel
        });

        function DialogController($scope, $mdDialog) {
            $scope.bluemix.login = function(){
                if(!$scope.bluemix.logged_in){
                    $scope.bluemix.email_pass_spinner = true;
                    var data = {
                        email : $scope.bluemix.credentials.email,
                        pass  : $scope.bluemix.credentials.password
                    };
                    dfxPlatformBluemix.bluemixLogin(data).then(function(res){
                        $scope.bluemix.logged_in = true ;
                        $scope.bluemix.email_pass_spinner = false;
                        dfxMessaging.showMessage('You have logged in successfully. Choose organization and space in order to finish authentication.') ;
                        $scope.bluemix.getOrgsList();
                    }, function(){
                        $scope.bluemix.logged_in = false ;
                        $scope.bluemix.email_pass_spinner = false;
                        dfxMessaging.showWarning('The email address or password you entered is not valid') ;
                    });
                }
            };
            $scope.bluemix.hide = function() {
                $mdDialog.hide();
            };
            $scope.bluemix.cancel = function() {
                $mdDialog.cancel();
            };
        }
    };
}]);

dfxStudioApp.controller("dfx_studio_platform_settings_controller", [ '$scope', 'dfxGoogleMapProperties','dfxMessaging', function($scope, dfxGoogleMapProperties, dfxMessaging) {
    var tenantId = $scope.$parent.$parent.tenant_id;
    dfxGoogleMapProperties.getAPIKey(tenantId).then(function(tenant){
        $scope.googleAPIKey = tenant.googleAPIKey;
    });
    $scope.saveGoogleKey = function() {
        dfxGoogleMapProperties.putAPIKey(tenantId, $('#googleAPIKey').val()).then(function(){
            dfxMessaging.showMessage('Google API key has been successfully updated');
        });
    }
}]);

dfxStudioApp.controller("dfx_studio_developers_controller", [ '$scope', 'dfxPlatformDevelopers', '$mdSidenav', 'dfxMessaging', '$mdDialog', function($scope, dfxPlatformDevelopers, $mdSidenav, dfxMessaging, $mdDialog) {
    var parentScope = $scope.$parent;
    parentScope.developers = $scope;
    $scope.users = [];
    $scope.current_user = {};
    $scope.new_user = {};
    $scope.isSidenavOpen = false;

    $scope.initNewUser = function(){
        $scope.operation = 'create';
        $scope.new_user.login = "";
        $scope.new_user.firstName = "";
        $scope.new_user.lastName = "";
        $scope.new_user.email = "";
        $scope.new_user.pass = "";
        $scope.new_user.repeat_pass = "";
        $scope.new_user.pass_matching = false;
        $scope.new_user.roles = {};
        $scope.new_user.roles.default = 'admin';
        $scope.new_user.roles.list = [];
        $scope.new_user.admin_role = true;
        $scope.new_user.dev_role = false;
        $scope.new_user.show_pass_message = false;

        var sideNavInstance = $mdSidenav('side_nav_left');
        sideNavInstance.toggle();
    };

    $scope.getUsers = function(){
        dfxPlatformDevelopers.getUsers($scope.app_name).then(function(data){
            $scope.users = data;
        });
    };

    $scope.getUsers();

    $scope.editCurrentUser = function(user){
        $scope.operation = 'update';
        $scope.current_user = user;
        $scope.current_user.pass_changed = false;
        $scope.current_user.new_pass = "newpass";
        $scope.current_user.repeat_pass = "";
        $scope.current_user.pass_matching = false;
        $scope.current_user.show_pass_message = false;

        if(user.roles.list.indexOf('admin') !== -1){
            $scope.current_user.admin_role = true;
        }else{
            $scope.current_user.admin_role = false;
        }

        if(user.roles.list.indexOf('developer') !== -1){
            $scope.current_user.dev_role = true;
        }else{
            $scope.current_user.dev_role = false;
        }
        var sideNavInstance = $mdSidenav('side_nav_left');
        sideNavInstance.toggle();
    };

    $scope.closeSidenav = function(){
        var sideNavInstance = $mdSidenav('side_nav_left');
        sideNavInstance.toggle();
    };

    $scope.changePass = function(){
        $scope.current_user.pass_changed = true;
    };

    $scope.showPassMessage = function(user){
        user.show_pass_message = true;
    };

    $scope.updateUser = function(){
        var roles_list = [];
        if($scope.current_user.admin_role){
            roles_list.push('admin');
        }
        if($scope.current_user.dev_role){
            roles_list.push('developer');
        }
        if(roles_list.length !==0){
            $scope.current_user.roles.list = roles_list;
        }
        dfxPlatformDevelopers.updateUser($scope.current_user, $scope.current_user.new_pass, $scope.current_user.pass_changed).then(function(){
            var sideNavInstance = $mdSidenav('side_nav_left');
            sideNavInstance.toggle();
            dfxMessaging.showMessage('Developer data has been successfully updated');
        }, function(){
            dfxMessaging.showWarning('Can\'t update developer data');
        });
    };

    $scope.createUser = function(){
        var alert = '';
        if ($scope.new_user.login.indexOf(" ") != -1) {
            alert = "Login can't have empty spaces";
        }
        else if ($.isEmptyObject($scope.new_user.login)) {
            alert = "Login can't be empty";
        }
        else if (!/^[a-zA-Z0-9-_.]+$/.test($scope.new_user.login)) {
            alert = "Login can have only letters, numbers, underscore or dash symbols";
        }
        if (alert) {
            dfxMessaging.showWarning(alert);
        } else {
            var is_unique = true;
            for(var i=0; i < $scope.users.length; i++){
                if($scope.users[i].login === $scope.new_user.login){
                    is_unique = false;
                    break;
                }
            }
            if(is_unique){
                var roles_list = [];
                if($scope.new_user.admin_role){
                    roles_list.push('admin');
                }
                if($scope.new_user.dev_role){
                    roles_list.push('developer');
                }
                if(roles_list.length !==0){
                    $scope.new_user.roles.list = roles_list;
                }
                dfxPlatformDevelopers.createUser($scope.new_user).then(function(){
                    var sideNavInstance = $mdSidenav('side_nav_left');
                    var added_user = $scope.new_user;
                    $scope.new_user = {};
                    $scope.users.push(added_user);
                    sideNavInstance.toggle();
                    dfxMessaging.showMessage('New developer has been successfully created');
                }, function(res){
                    dfxMessaging.showWarning('Can\'t create new developer. ' + res.data.data);
                });
            }else{
                dfxMessaging.showWarning("Developer with such login already exists");
            }
        }
    };

    $scope.confirmUserDelete = function(ev, userlogin) {
        var confirm = $mdDialog.confirm()
            .title('Are you sure you want to delete this developer?')
            .textContent('Developer will be removed from the repository.')
            .ariaLabel('remove user')
            .targetEvent(ev)
            .cancel('Cancel')
            .ok('OK');
        $mdDialog.show(confirm).then(function() {
            $scope.deleteUser(userlogin);
        }, function() {
        });
    };

    $scope.deleteUser = function(userlogin){
        dfxPlatformDevelopers.deleteUser(userlogin).then(function(){
            for(var i =0; i < $scope.users.length; i++){
                if($scope.users[i].login === userlogin){
                    $scope.users.splice(i, 1);
                    break;
                }
            }
            dfxMessaging.showMessage('Developer data has been successfully deleted');
        });
    };

    $scope.$watch("current_user.repeat_pass", function(newValue){
        if(newValue){
            if(newValue===$scope.current_user.new_pass){
                $scope.current_user.pass_matching = true;
            }else{
                $scope.current_user.pass_matching = false;
            }
        }
    });

    $scope.$watch("new_user.repeat_pass", function(newValue){
        if(newValue){
            if(newValue===$scope.new_user.pass){
                $scope.new_user.pass_matching = true;
            }else{
                $scope.new_user.pass_matching = false;
            }
        }
    });

    $scope.$watch("current_user.roles.default", function(newValue){
        if(newValue){
            if(newValue === 'admin'){
                $scope.current_user.admin_role = true;
                $scope.current_user.admin_disabled = true;
            }else{
                $scope.current_user.admin_disabled = false;
            }
            if(newValue === 'developer'){
                $scope.current_user.dev_role = true;
                $scope.current_user.dev_disabled = true;
            }else{
                $scope.current_user.dev_disabled = false;
            }
        }
    });

    $scope.$watch("new_user.roles.default", function(newValue){
        if(newValue){
            if(newValue === 'admin'){
                $scope.new_user.admin_role = true;
                $scope.new_user.admin_disabled = true;
            }else{
                $scope.new_user.admin_disabled = false;
            }
            if(newValue === 'developer'){
                $scope.new_user.dev_role = true;
                $scope.new_user.dev_disabled = true;
            }else{
                $scope.new_user.dev_disabled = false;
            }
        }
    });

    $scope.$watch('isSidenavOpen', function(newValue){
        if(!newValue){
            $scope.getUsers();
        }
    });

}]);


dfxStudioApp.controller("dfx_studio_home_controller", [ '$scope', 'dfxStats', '$timeout', '$compile', '$window', '$route', '$routeParams', '$mdDialog', 'dfxApplications', 'dfxViews', 'dfxPages', 'dfxApiServiceObjects', 'dfxMessaging', '$location', function($scope, dfxStats, $timeout, $compile, $window, $route, $routeParams, $mdDialog, dfxApplications, dfxViews, dfxPages, dfxApiServiceObjects, dfxMessaging, $location) {
    $scope.display_activity_panel = false;
    $scope.platform_stats = {};
    $scope.chart_pages_data = [];
    $scope.chart_pages_option = {
        chart: {
            type: 'discreteBarChart',
            margin : {
                top: 20,
                right: 20,
                bottom: 50,
                left: 55
            },
            x: function(d){return d.label;},
            y: function(d){return d.value;},
            showValues:  true,
            valueFormat: function (d) {
                return d3.format(',.')(d);
            },
            duration:    500,
            xAxis:       {
                axisLabel: 'Components',
                axisLabelDistance: -5
            },
            yAxis:       {
                axisLabel: 'Count',
                axisLabelDistance: -5,
                tickFormat: function (d) {
                    return d3.format(',.')(d);
                }
            }
        },
        title: {
            text: 'App Statistics',
            enable: true
        }
    };

    dfxStats.getMain( $scope ).then( function(data) {
        if (data.apps != null) {
            for (var i=0; i<data.apps.length; i++) {
                data.apps[i].chartData = [
                    {
                        key: "Cumulative Components",
                        values: [
                            {
                                "label" : "Pages" ,
                                "value" : data.apps[i].pages.count
                            },
                            {
                                "label" : "Views" ,
                                "value" : data.apps[i].views.count
                            },
                            {
                                "label" : "API" ,
                                "value" : data.apps[i].apiServices.count
                            }
                        ]}
                ];
            }
        }
        $scope.platform_stats = data;
    });

    $scope.loadActivity = function(app_name, channel) {
        $scope.display_activity_panel = true;
    };

    $scope.navigateToApp = function(appname){
        if(appname!=='Shared Catalog'){
            $scope.loadStudioView(appname + '/configuration/general') ;
        }
    };

    $scope.entity = $routeParams.entity === 'api_so' ? 'apiServices' : $routeParams.entity;
    $scope.appname = $routeParams.appname ;

    if($scope.appname){
        $timeout(function(){
            dfxApplications.getAppTree( $scope, $scope.appname ).then(function( data ) {
                var entityData = data.data[$scope.entity];
                $scope.table_data = [];
                if ( $scope.entity === 'pages' || $scope.entity === 'views' ) {
                    for ( var platform in entityData ) {
                        for ( var cat in entityData[platform] ) {
                            for ( var i=0; i < entityData[platform][cat].length; i++ ) {
                                var table_data_item = entityData[platform][cat][i];
                                table_data_item.category = cat;
                                table_data_item.platform = platform;
                                $scope.table_data.push(table_data_item);
                            }
                        }
                    }
                } else if ( $scope.entity === 'apiServices' ) {
                    for(var k in entityData){
                        for(var n=0; n < entityData[k].length; n++){
                            $scope.table_data.push({
                                category    :  k,
                                name        :  entityData[k][n].name,
                                description :  entityData[k][n].description
                            });
                        }
                    }
                }
            });
        },0);
    }

    $scope.navigateToPages = function(appname){
        $scope.appname = appname;
        if(appname !== 'Shared Catalog'){
            var arr = $scope.platform_stats.apps ;
            for(var j=0; j < arr.length; j++){
                if(arr[j].name === appname && arr[j]){
                    $scope.loadStudioView('/categories/pages/' + appname);
                    break;
                }
            }
        }
    };

    $scope.navigateToViews = function(appname){
        $scope.appname = appname;
        if(appname !== 'Shared Catalog'){
            var arr = $scope.platform_stats.apps ;
            for(var j=0; j < arr.length; j++){
                if(arr[j].name === appname && arr[j]){
                    $scope.loadStudioView('/categories/views/' + appname);
                    break;
                }
            }
        }
    };

    $scope.navigateToApis = function(appname){
        $scope.appname = appname;
        if(appname !== 'Shared Catalog'){
            var arr = $scope.platform_stats.apps ;
            for(var j=0; j < arr.length; j++){
                if(arr[j].name === appname && arr[j]){
                    $scope.loadStudioView('/categories/api_so/' + appname);
                    break;
                }
            }
        }
    };

    $scope.addEntity = function() {
        switch ( $scope.entity ) {
            case 'pages':       $location.path('/page/create/' + $scope.appname + '/web/Default'); break;
            case 'views':       $location.path('/view/create/' + $scope.appname + '/web/Default'); break;
            case 'apiServices': $location.path('/api_so/create/' + $scope.appname + '/Default'); break;
        }
    };

    $scope.edit = function( item ) {
        switch ( $scope.entity ) {
            case 'pages':       $location.path('/page/update/' + $scope.appname + '/' + item.platform + '/' + item.name); break;
            //case 'views':       $location.path('/view/update/' + $scope.appname + '/' + item.platform + '/' + item.name); break;
            case 'views':
                window.localStorage.removeItem('pagePreviewName');
                $window.open( '/studio/widget/' + item.platform + '/' + $scope.appname + '/' + item.name + '/index.html', '_blank' );
                break;
            case 'apiServices': $location.path('/api_so/update/' + $scope.appname + '/' + item.name); break;
        }
    };

    $scope.copyEntity = function( item ) {
        $scope.$parent.targetComponent = {
            "name":        item.name,
            "application": $scope.appname,
            "category":    item.category,
        }
        if ($scope.entity=='views') {
            $scope.$parent.targetComponent.type = 'view';
            $scope.$parent.targetComponent.platform = item.platform;
        } else if ($scope.entity=='pages') {
            $scope.$parent.targetComponent.type = 'page';
            $scope.$parent.targetComponent.platform = item.platform;
        } else {
            $scope.$parent.targetComponent.type = 'apiso';
        }
        $scope.copyToBtn(null, function() {
            $route.reload();
        });
    };

    $scope.infoEntity = function( item ) {
        $location.path('/view/update/' + $scope.appname + '/' + item.platform + '/' + item.name);
    };


    $scope.removeEntity = function( item, ev ) {
        $scope.$parent.targetComponent = {
            "name":        item.name,
            "application": $scope.appname,
            "category":    item.category,
        }
        if ($scope.entity=='views') {
            $scope.$parent.targetComponent.type = 'view';
            $scope.$parent.targetComponent.platform = item.platform;
        } else if ($scope.entity=='pages') {
            $scope.$parent.targetComponent.type = 'page';
            $scope.$parent.targetComponent.platform = item.platform;
        } else {
            $scope.$parent.targetComponent.type = 'apiso';
        }
        var confirm = $mdDialog.confirm()
            .title('Are you sure you want delete this component?')
            .textContent('The component will be removed permanently from the repository.')
            .ariaLabel('delete component')
            .targetEvent(ev)
            .cancel('Cancel')
            .ok('OK');
        $mdDialog.show(confirm).then(function() {
            if ($scope.entity=='views') {
                dfxViews.delete( $scope, $scope.$parent.targetComponent ).then( function(data) {
                    dfxMessaging.showMessage( 'View has been successfully deleted' );
                    $scope.getAll();
                    $route.reload();
                });
            } else if ($scope.entity=='pages') {
                dfxPages.delete( $scope, $scope.$parent.targetComponent ).then( function(data) {
                    dfxMessaging.showMessage( 'Page has been successfully deleted' );
                    $scope.getAll();
                    $route.reload();
                });
            } else {
                dfxApiServiceObjects.deleteSo( $scope, $scope.$parent.targetComponent ).then( function(data) {
                    dfxMessaging.showMessage( 'API service object has been successfully deleted' );
                    $scope.getAll();
                    $route.reload();
                });
            }
        }, function() {
        });
    };

    $timeout(function(){
        var arr = $scope.platform_stats.apps;
        if (arr!=null) {
            for(var i =0; i < arr.length; i++ ){

                var bar = $('#chart_' + arr[i].name.replace(' ', '_') + ' > nvd3 > svg > g > g > g.nv-barsWrap.nvd3-svg > g > g > g > g > g:nth-child(1) > rect').parent();
                var barHtml = bar.html();
                if(barHtml){
                    barHtml = barHtml.replace('class="discreteBar"', 'class="discreteBar" ng-click="navigateToPages(\'' + arr[i].name.replace(' ', '_') + '\')" style="cursor: pointer;"') ;
                    bar.html(barHtml);
                    $compile(bar.contents())($scope);
                }

                var bar = $('#chart_' + arr[i].name.replace(' ', '_') + ' > nvd3 > svg > g > g > g.nv-barsWrap.nvd3-svg > g > g > g > g > g:nth-child(2) > rect').parent();
                var barHtml = bar.html();
                if(barHtml){
                    barHtml = barHtml.replace('class="discreteBar"', 'class="discreteBar" ng-click="navigateToViews(\'' + arr[i].name.replace(' ', '_') + '\')" style="cursor: pointer;"') ;
                    bar.html(barHtml);
                    $compile(bar.contents())($scope);
                }

                var bar = $('#chart_' + arr[i].name.replace(' ', '_') + ' > nvd3 > svg > g > g > g.nv-barsWrap.nvd3-svg > g > g > g > g > g:nth-child(3) > rect').parent();
                var barHtml = bar.html();
                if(barHtml){
                    barHtml = barHtml.replace('class="discreteBar"', 'class="discreteBar" ng-click="navigateToApis(\'' + arr[i].name.replace(' ', '_') + '\')" style="cursor: pointer;"') ;
                    bar.html(barHtml);
                    $compile(bar.contents())($scope);
                }
            }
        }
    }, 1000);

    var bodyHeight = parseFloat($("body").css('height'));
    $("#home-page-apps").css('height', bodyHeight - 59);
}]);

dfxStudioApp.controller("dfx_studio_stackoverflow_controller", [ '$scope', '$window', function($scope, $window) {
    $scope.serch_parameters = ['dreamface'] ;
    $scope.serchOnStackoverflow = function(){
        var parameters = $scope.serch_parameters.join('+') ;
        var path = 'http://stackoverflow.com/search?q=' + parameters;
        $window.open(path, "_blank") ;
    };
}]);

dfxStudioApp.controller("dfx_studio_samples_controller", [ '$scope', '$http', '$window', '$mdDialog', 'dfxMessaging', 'dfxSamples', 'dfxApplications', 'dfxViews', function($scope, $http, $window, $mdDialog, dfxMessaging, dfxSamples, dfxApplications, dfxViews) {

    $scope.categories = [];
    $scope.samples = [];
    $scope.isCategoriesLoaded = false;
    $scope.isCategoryLoaded = false;
    $scope.isSampleLoaded = false;

    dfxSamples.contents( $scope, '' ).then( function(contents) {
        if (contents.data != null) {
            for (var i=0; i<contents.data.length; i++) {
                if (contents.data[i].type=='dir') {
                    $scope.loadCategory( contents.data[i].name, contents.data[i].path );
                }
            }
        }
        $scope.isCategoriesLoaded = true;
    });

    $scope.loadCategory = function(cat_name, cat_path) {
        $scope.isCategoryLoaded = false;
        dfxSamples.contents( $scope, cat_path ).then( function(contents) {
            for (var i=0; i<contents.data.length; i++) {
                if (contents.data[i].type=='dir') {
                    $scope.loadSample( contents.data[i].name, contents.data[i].path, cat_name );
                } else {
                    dfxSamples.contents( $scope, contents.data[i].path ).then( function(file_contents) {
                        $scope.loadFile( file_contents.data.url, $scope.categories, cat_name );
                    });
                }
            }
            $scope.isCategoryLoaded = true;
        });
    };

    $scope.loadSample = function(sample_name, sample_path, cat_name) {
        $scope.isSampleLoaded = false;
        dfxSamples.contents( $scope, sample_path ).then( function(contents) {
            for (var i=0; i<contents.data.length; i++) {
                if (contents.data[i].type=='file') {
                    dfxSamples.contents( $scope, contents.data[i].path ).then( function(file_contents) {
                       $scope.loadFile( file_contents.data.url, $scope.samples, sample_name, cat_name );
                    });
                }
            }
            $scope.isSampleLoaded = true;
        });
    };

    $scope.loadFile = function(file_url, collection, property, cat_name) {
        $http.get( file_url ).then( function(file_contents) {
            var new_item = {
                'name': property,
                'content': JSON.parse(atob(file_contents.data.content)),
                'category': cat_name
            };
            if (new_item.content.thumbnail) {
                dfxSamples.isPathExists(new_item.content.thumbnail).then(function(exists){
                    if (!exists.data) delete new_item.content.thumbnail;
                })
            }
            collection.push(new_item);
        });
    };

    $scope.readDocumentation = function(sample) {
        $window.open( sample.content.documentation, '_blank' );
    };

    $scope.openInstallSample = function(sample) {
        $scope.selected_sample = sample;
        dfxApplications.getAll( $scope ).then( function(apps) {
            $scope.applications = apps.data;
            $mdDialog.show({
                scope: $scope.$new(),
                controller: DialogController,
                templateUrl: 'studioviews/samples_install_dialog.html',
                parent: angular.element(document.body),
                clickOutsideToClose:true
            }).then(function() {

            }, function() {
                // if cancel

            });
        });
    };

    function DialogController($scope, $mdDialog) {
        $scope.install = function() {
            $scope.installSample($scope.selected_application);
            $mdDialog.hide();
        };
        $scope.hide = function() {
            $mdDialog.hide();
        };
        $scope.cancel = function() {
            $mdDialog.cancel();
        };
    }

    $scope.installSample = function(app_name) {
        // Install View
        dfxSamples.contents( $scope, $scope.selected_sample.category + '/' + $scope.selected_sample.name + '/view/source.json' ).then( function(view_source) {
            dfxSamples.contents( $scope, $scope.selected_sample.category + '/' + $scope.selected_sample.name + '/view/script.js' ).then( function(view_script) {
                dfxSamples.contents( $scope, $scope.selected_sample.category + '/' + $scope.selected_sample.name + '/view/styles.css' ).then( function(view_styles) {
                    var new_view = {
                        'name': $scope.selected_sample.name,
                        'description': $scope.selected_sample.content.title,
                        'category': 'Default',
                        'wtype': 'visual',
                        'application': app_name,
                        'platform': 'web',
                        'src': atob(view_source.data.content),
                        'src_script': atob(view_script.data.content),
                        'src_styles': atob(view_styles.data.content)
                    }
                    dfxViews.createFromModel( $scope, new_view ).then( function(view) {
                        dfxMessaging.showMessage( $scope.selected_sample.content.title + ' has been successfully installed' );
                        $scope.getAll();
                    },function( err ){
                        dfxMessaging.showWarning( "Something went wrong or " + $scope.selected_sample.content.title + " was already installed" );
                        $scope.getAll();
                    });
                });
            });
        });

        // Install Resources
       dfxSamples.contents( $scope, $scope.selected_sample.category + '/' + $scope.selected_sample.name + '/resources' ).then( function(resources) {
            for (var i=0; i<resources.data.length; i++) {
                var mime_type;
                var resource_cat;
                var re = /[.]\w+$/;
                var m;

                if ((m = re.exec(resources.data[0].name)) !== null) {
                    if (m.index === re.lastIndex) {
                        re.lastIndex++;
                    }
                    switch (m[0]) {
                        case '.jpg':
                            mime_type = 'image/jpeg';
                            resource_cat = 'assets';
                            break;
                        case '.jpeg':
                            mime_type = 'image/jpeg';
                            resource_cat = 'assets';
                            break;
                        case '.png':
                            mime_type = 'image/png';
                            resource_cat = 'assets';
                            break;
                        case '.gif':
                            mime_type = 'image/gif';
                            resource_cat = 'assets';
                            break;
                        case '.pdf':
                            mime_type = 'application/pdf';
                            resource_cat = 'assets';
                            break;
                        case '.js':
                            mime_type = 'text/javascript';
                            resource_cat = 'javascript';
                            break;
                        case '.json':
                            mime_type = 'text/javascript';
                            resource_cat = 'javascript';
                            break;
                        case '.css':
                            mime_type = 'text/css';
                            resource_cat = 'javascript';
                            break;
                        default:
                            mime_type = 'text/javascript';
                            resource_cat = 'javascript';
                            break;
                    }
                }

                $scope.installSampleResource( resources.data[i].name, resources.data[i].path, mime_type, resource_cat );
            }
        });


    };

    $scope.installSampleResource = function(resource_name, resource_path, mime_type, resource_cat) {

        dfxSamples.contents( $scope, resource_path ).then( function(resource_content) {

            var form_data = new FormData();

            var bytes;

            if (resource_cat=='assets') {
                var binary = atob(resource_content.data.content);
                var array = [];
                for (var i = 0; i < binary.length; i++) {
                    array.push(binary.charCodeAt(i));
                }

                // Convert the string to bytes
                bytes = new Uint8Array(array);
            } else {
                // Convert the string to bytes
                bytes = atob(resource_content.data.content);
            }

            var blob = new Blob([bytes], { type: mime_type});
            form_data.append( 'file', blob, resource_content.data.name);

            $.ajax({
                url: '/studio/resources/simulate_upload/' + $scope.selected_application + '/' + resource_cat,
                type: 'POST',
                data: form_data,
                headers : {'X-DREAMFACE-TENANT' : $('body').attr('data-tenantid')},
                processData: false,
                contentType: false
            });

        });

    };

}]);

dfxStudioApp.controller("dfx_studio_release_notes_controller", [ '$scope', function($scope) {

}]);

dfxStudioApp.controller("dfx_studio_support_controller", [ '$scope', '$window', function($scope, $window) {
    $scope.openSupportPage = function () {
        $window.open( 'https://interactive-clouds.atlassian.net/servicedesk/customer/portal/1/user/login?destination=portal', '_blank' );
    };
}]);

dfxStudioApp.controller("dfx_studio_contactus_controller", [ '$scope', 'dfxEmail', 'dfxMessaging', 'dfxApplications', function($scope, dfxEmail, dfxMessaging, dfxApplications) {
    $scope.refreshForm = function(){
        $scope.contact_name = {value: ''};
        $scope.contact_email = {value: ''};
        $scope.contact_msg = {value: ''};
        $scope.subject = {value: 'Request for assistance'};
        $scope.show_form = true;

        dfxApplications.getUserInfo().then(function(data){
            if(data.email !== null && data.email !== ""){
                $scope.contact_email.value = data.email;
            }
            if(data.firstName!==""){
                $scope.contact_name.value = data.firstName + ' ' + data.lastName ;
            }else{
                $scope.contact_name.value = data.login ;
            }
        });
    };

    $scope.refreshForm();

    $scope.sendMail = function(){
        var data = {
            contact_name: $scope.contact_name.value,
            contact_email: $scope.contact_email.value,
            contact_msg: $scope.contact_msg.value,
            subject: $scope.subject.value
        };
        dfxEmail.sendMail(data).then(function(res){
            $scope.show_form = false;
        }, function(res){
            dfxMessaging.showWarning('An error occurred while trying to send your message');
        });
    };
}]);

dfxStudioApp.controller("dfx_studio_configuration_controller", [ '$rootScope', '$scope','dfxApplications', '$timeout', '$routeParams', function($rootScope, $scope, dfxApplications, $timeout, $routeParams) {
    $scope.general = {};
    $scope.devops = {};
    $scope.resources = {};
    $scope.api_sources = {};
    $scope.isSidenavOpen = false;
    if(!$scope.app_name){
        $scope.app_name = $routeParams.appname;
    }

    $scope.$watch('$parent.settings', function(newVal){
        var configurations = ['general','devops', 'api_sources', 'resources','users','personalization','deployment'];
        if(configurations.indexOf(newVal) !== -1){
            $scope.settings = newVal;
            $timeout(function(){
                $scope.configurationTabs = $('#dfx-studio-main-content > div > md-tabs > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper').children();
                $($scope.configurationTabs[configurations.indexOf(newVal)]).trigger('click');
            },0);
        }
    });

    $scope.logo_initialized = false;
    $scope.defineAppData = function(appname){
        if($scope.applications){
            for(var i =0; i < $scope.applications.length; i++){
                if($scope.applications[i].name === appname){
                    $scope.general.title = $scope.applications[i].title;
                    if($scope.applications[i].logo){
                        $scope.general.selected_logo_image = $scope.applications[i].logo ;
                    }else{
                        $scope.general.selected_logo_image = "/images/dfx_login_logo_black.png";
                    }
                    $scope.logo_initialized = true;
                    if($scope.applications[i].channel){
                        $scope.devops.channel = $scope.applications[i].channel;
                    }else{
                        $scope.devops.channel = "";
                    }
                }
            }
        }
    };

    $scope.getGithubData = function(){
        dfxApplications.getGithubData($scope.app_name).then(function(data){
            $scope.devops.repository = data.data.reponame;
            $scope.devops.access_token = data.data.access_token;
            $scope.devops.github_username = data.data.username ;
        });
    };

    $scope.defineSettings = function(tab){
        for(var i= 0; i < 7; i++){
            if($scope.configurationTabs && $($scope.configurationTabs[i]).hasClass('md-active')){
                $scope.settings = tab;                                                              // $scope.settings != $scope.$parent.settings
            }
        }
    };

    $scope.initApps = function(){
        dfxApplications.getAll($scope).then(function(apps){
            $scope.applications = apps.data;
            $scope.appTrees = [];
            for(var i =0; i < $scope.applications.length; i++){
                $scope.appTrees.push({});
            }
            $scope.defineAppData($scope.app_name);
            for(var j =0; j < $scope.applications.length; j++){
                (function(){
                    var local = j;
                    dfxApplications.getAppTree($scope, $scope.applications[local].name).then(function(appTree){
                        $scope.appTrees[local] = appTree;
                    })
                })();
            }
        });
    };
    $scope.initApps();
    $scope.getGithubData();
}]);


dfxStudioApp.controller("dfx_studio_new_application_controller", [ '$scope','dfxApplications', '$mdDialog', '$timeout', 'dfxMessaging', function($scope, dfxApplications, $mdDialog, $timeout, dfxMessaging) {
    $scope.current_date = new Date();
    $scope.appl_name = "";
    $scope.appl_title = "";
    $scope.selected_logo_image_input = "" ;
    $scope.isCreate = true;
    $scope.selected_logo_image = '/images/dfx_login_logo_black.png';
    $scope.isLogo = true;

    $timeout(function(){
        dfxApplications.getSharedImages($scope.app_name).then(function(images){
            $scope.sharedImages = images;
        });
    }, 0);

    $scope.createNewApp = function(){
        var alert = '';
        if ($scope.appl_name.indexOf(" ") != -1) {
            alert = "Application name can't have empty spaces";
        }
        else if ($.isEmptyObject($scope.appl_name)) {
            alert = "Application name can't be empty";
        }
        else if (!/^[a-zA-Z0-9-_.]+$/.test($scope.appl_name)) {
            alert = "Application name can have only letters, numbers, underscore or dash symbols";
        }
        if (alert) {
            dfxMessaging.showWarning(alert);
        } else {
            var is_unique = true;
            for(var i=0; i < $scope.applications.length; i++){
                if($scope.applications[i].name === $scope.appl_name){
                    is_unique = false;
                    break;
                }
            }
            if(is_unique){
                dfxApplications.createNewApp($scope.appl_name, $scope.appl_title, $scope.selected_logo_image).then(function(){
                    dfxMessaging.showMessage('New application has been successfully created');
                    $scope.getAll().then(function(){
                        $scope.loadStudioView($scope.appl_name + '/configuration/general') ;
                    });
                }, function(message){
                dfxMessaging.showWarning('Can\'t create new application. ' + message);
                });
            }else{
                dfxMessaging.showWarning("Application with such name already exists");
            }
        }
    };

    $scope.chooseLogoImage = function(ev){
        $mdDialog.show({
            scope: $scope.$new(),
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            ariaLabel: 'picker-images',
            templateUrl: '/gcontrols/web/picker_images_form.html',
            controller: function(){
                $scope.setImage = function(src) {
                    var fileName = src.split('/')[src.split('/').length -1];
                    if (fileName !== 'dfx_login_logo_black.png') {
                        $scope.selected_logo_image = "/assets/" + fileName;
                        $scope.selected_logo_image_input.value = "/assets/" + fileName;
                    } else {
                        $scope.selected_logo_image = src;
                        $scope.selected_logo_image_input.value = src;
                    }
                    $mdDialog.hide();
                }
                $scope.closeDialog = function(){
                    $mdDialog.hide();
                }
            }
        })
    };

    $scope.changeLogo = function(logo){
        if(logo === ''){
            $scope.selected_logo_image = '/images/dfx_login_logo_black.png';
        }else{
            $scope.selected_logo_image = logo;
        }
    };

}]);

dfxStudioApp.controller("dfx_studio_general_settings_controller", [ '$scope','dfxApplications', '$mdDialog', 'dfxMessaging', '$timeout', function($scope, dfxApplications, $mdDialog, dfxMessaging, $timeout) {
    var parentScope = $scope.$parent;
    parentScope.general = $scope;
    $scope.isCreate = false;
    $scope.selected_logo_image_input = {value: ""} ;
    $scope.isLogo = true;

    $scope.getGeneral = function(){
        dfxApplications.getGeneral($scope.app_name).then(function(general){
            $scope.general.creationDate = general.creationDate;
        });
    };

    $scope.chooseLogoImage = function(ev){
        $mdDialog.show({
            scope: $scope.$new(),
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            ariaLabel: 'picker-images',
            templateUrl: '/gcontrols/web/picker_images_form.html',
            controller: function(){
                $scope.setImage = function(src) {
                    var fileName = src.split('/')[src.split('/').length -1];
                    if (fileName !== 'dfx_login_logo_black.png') {
                        $scope.selected_logo_image = "/assets/" + fileName;
                        $scope.selected_logo_image_input.value = "/assets/" + fileName;
                    } else {
                        $scope.selected_logo_image = src;
                        $scope.selected_logo_image_input.value = src;
                    }
                    $mdDialog.hide();
                }
                $scope.closeDialog = function(){
                    $mdDialog.hide();
                }
            }
        })
    };

    $scope.$watch('$parent.logo_initialized', function(newVal){
        if(newVal){
            $scope.selected_logo_image_input.value = $scope.selected_logo_image ;
            $timeout(function(){
                dfxApplications.getImages($scope.app_name).then(function(images){
                    $scope.appImages = images;
                });
                dfxApplications.getSharedImages($scope.app_name).then(function(images){
                    $scope.sharedImages = images;
                });
            }, 0);
        }
    });

    $scope.changeLogo = function(logo){
        if(logo === ''){
            $scope.selected_logo_image = '/images/dfx_login_logo_black.png';
        }else{
            $scope.selected_logo_image = logo;
        }
    };

    $scope.getGeneral();

    $scope.saveGeneral = function(){
        dfxApplications.saveGeneral($scope.general.title, $scope.app_name, $scope.selected_logo_image).then(function(){
            $scope.initApps();
            dfxMessaging.showMessage("General application settings has been successfully updated");
        }, function(){
            dfxMessaging.showWarning("Can\'t save general application settings");
        });
    };

    $scope.deleteApp = function(){
        dfxApplications.deleteApp($scope.app_name).then(function(){
            $scope.getAll().then(function(){
                $scope.loadStudioView('/home') ;
            });
        });
    };

    $scope.confirmAppDelete = function(ev) {
        var confirm = $mdDialog.confirm()
            .title('Are you sure you want to delete this application?')
            .textContent('Application will be removed permanently from the repository.')
            .ariaLabel('remove app')
            .targetEvent(ev)
            .cancel('Cancel')
            .ok('OK');
        $mdDialog.show(confirm).then(function() {
            $scope.deleteApp();
        }, function() {
        });
    };

    $scope.loadLoginPage = function() {
        dfxApplications.getGeneral($scope.app_name).then(function(data){
            var editor_parent = document.getElementById('login_editor_web');
            $scope.login_editor_web = CodeMirror(function (elt) {
                    $(editor_parent).empty();
                    $(editor_parent).append(elt);
                },
                {
                    lineNumbers: true,
                    value: data.templates.login_page_web,
                    mode: {name: "xml", globalVars: true},
                    matchBrackets: true,
                    highlightSelectionMatches: {showToken: /\w/},
                    styleActiveLine: true,
                    viewportMargin : Infinity,
                    extraKeys: {"Alt-F": "findPersistent", "Ctrl-Space": "autocomplete"},
                    lineWrapping: true
                });
            $scope.login_editor_web.setSize(null, ($(window).height() - 400) + 'px');

            var editor_parent = document.getElementById('login_editor_mobile');
            $scope.login_editor_mobile = CodeMirror(function (elt) {
                    $(editor_parent).empty();
                    $(editor_parent).append(elt);
                },
                {
                    lineNumbers: true,
                    value: data.templates.login_page_mobile,
                    mode: {name: "xml", globalVars: true},
                    matchBrackets: true,
                    highlightSelectionMatches: {showToken: /\w/},
                    styleActiveLine: true,
                    viewportMargin : Infinity,
                    extraKeys: {"Alt-F": "findPersistent", "Ctrl-Space": "autocomplete"},
                    lineWrapping: true
                });
            $scope.login_editor_mobile.setSize(null, ($(window).height() - 400) + 'px')
        });
    };

    $scope.saveLoginPage = function() {
        var obj = {
            application : $scope.app_name,
            data : {
                templates : {
                    login_page_mobile : $scope.login_editor_mobile.getValue(),
                    login_page_web : $scope.login_editor_web.getValue()
                }
            }
        }
        dfxApplications.saveLoginPage(obj).then(function(){
            dfxMessaging.showMessage("Login page has been successfully saved");
        }, function(){
            dfxMessaging.showWarning("Can\'t save.");
        });
    }

}]);

dfxStudioApp.controller("dfx_studio_devops_controller", [ '$scope','dfxApplications', 'dfxMessaging', function($scope, dfxApplications, dfxMessaging) {
    var parentScope = $scope.$parent;
    parentScope.devops = $scope;

    $scope.saveCollaboration = function(){
        dfxApplications.saveCollaboration($scope.devops.channel, $scope.app_name).then(function(){
            $scope.initApps();
            dfxMessaging.showMessage("Collaboration data has been successfully saved");
        }, function(){
            dfxMessaging.showWarning("Can\'t save collaboration data");
        });
    };

    $scope.saveGithub = function(){
        var body = {
            "application": $scope.app_name,
            "provider": "github",
            "access_token": $scope.access_token,
            "repository": $scope.repository,
            "repositories": [
                {
                    "reponame": $scope.repository,
                    "username": $scope.github_username
                }
            ]
        };
        dfxApplications.saveGithub(body).then(function(){
            $scope.getGithubData();
            dfxMessaging.showMessage("Github data has been successfully saved");
        }, function(){
            dfxMessaging.showWarning("Can\'t save github data");
        });
    };
}]);

dfxStudioApp.controller("dfx_studio_api_sources_controller", [ '$scope','dfxAuthProviders', 'dfxMessaging', '$mdDialog', '$mdSidenav', 'dfxApiServiceObjects', '$timeout', function($scope, dfxAuthProviders, dfxMessaging, $mdDialog, $mdSidenav, dfxApiServiceObjects, $timeout) {
    var parentScope = $scope.$parent;
    parentScope.api_sources = $scope;
    $scope.auth_providers = [];
    $scope.operation = 'create' ;
    $scope.new_auth_provider = {} ;
    $scope.current_auth_provider = {} ;
    $scope.dataSources = [];
    $scope.schemas = [];
    $scope.schema_on_open = "init";
    $scope.schema_on_close = "init";
    $scope.type_on_open = "init";
    $scope.type_on_close = "init";
    dfxApiServiceObjects.getCatalog().then(function(data){
        var sources = data.data ;
        $scope.dataSources.push({name: 'REST', schemas:['none', 'basic','digest', 'oAuth1', 'oAuth2']}) ;
        $scope.dataSources.push({name: 'StrongLoop', schemas:['none','basic','digest']}) ;
        for(var key in sources){
            if(sources[key].auth){
                $scope.dataSources.push({
                    name: key,  schemas: sources[key].schemas
                }) ;
            }
        }
    });

    $scope.$watch('new_auth_provider.selected_data_source', function(newVal){
        if(newVal){
            for(var i = 0; i < $scope.dataSources.length; i++){
                if($scope.dataSources[i].name === newVal){
                    $scope.schemas = $scope.dataSources[i].schemas ;
                }
            }
        }
    });

    $scope.$watch('current_auth_provider.dataSource', function(newVal){
        if(newVal){
            for(var i = 0; i < $scope.dataSources.length; i++){
                if($scope.dataSources[i].name === newVal){
                    $scope.schemas = $scope.dataSources[i].schemas ;
                }
            }
        }
    });

    $scope.getProviders = function(){
        dfxAuthProviders.getProviders($scope.app_name).then(function(data){
            $scope.auth_providers = data;
        });
    };

    $scope.getProviders();

    var facebook_credentials = {
        type:               "facebook",
        access_token:       "",
        consumer_key:       "",
        consumer_secret:    "",
        authorize_path:     "https://www.facebook.com/dialog/oauth",
        access_token_path:  "https://graph.facebook.com/v2.3/oauth/access_token",
        response_type:      "code",
        scope:              ""
    };
    var google_credentials = {
        type:               "google",
        access_token:       "",
        base_provider_url:  "https://accounts.google.com",
        consumer_key:       "",
        consumer_secret:    "",
        authorize_path:     "/o/oauth2/auth",
        access_token_path:  "/o/oauth2/token",
        response_type:      "code",
        scope:              ""
    };

    $scope.initNewAuthProvider = function(){
        $scope.operation = 'create';
        $scope.schemas = ['none','basic','digest', 'oAuth1', 'oAuth2'];
        $scope.new_auth_provider = {
            provider:                    "",
            selected_data_source:        "REST",
            schema:                      "",
            ap_basic_digest:             {credentials: {username: "", password: ""}},
            ap_oAuth_1:                  {credentials: {selected_method: "HMAC-SHA1", consumer_key:"", consumer_secret:"", access_token:"", access_secret:""}},
            ap_oAuth_2:                  {selected_type: "", credentials: {}},
            rest:                         {credentials: {}, route: ""}
        };
        var sideNavInstance = $mdSidenav('side_nav_left');
        sideNavInstance.toggle();
    };

    $scope.saveProvider = function(){
        if($scope.operation === "create"){
            var alert = '';
            if ($scope.new_auth_provider.provider.indexOf(" ") != -1) {
                alert = "The name can't have empty spaces";
            }
            else if ($.isEmptyObject($scope.new_auth_provider.provider)) {
                alert = "The name can't be empty";
            }
            else if (!/^[a-zA-Z0-9-_.]+$/.test($scope.new_auth_provider.provider)) {
                alert = "The name can have only letters, numbers, underscore or dash symbols";
            }
            if (alert) {
                dfxMessaging.showWarning(alert);
            } else {
                var is_unique = true;
                for(var i=0; i < $scope.auth_providers.length; i++){
                    if($scope.auth_providers[i].provider === $scope.new_auth_provider.provider){
                        is_unique = false;
                        break;
                    }
                }
                if(is_unique){
                    dfxAuthProviders.createProvider($scope.new_auth_provider.schema, $scope.new_auth_provider, $scope.app_name).then(function(data){
                        $scope.auth_providers.push($scope.new_auth_provider);
                        dfxMessaging.showMessage("New API source data has been successfully created");
                        var sideNavInstance = $mdSidenav('side_nav_left');
                        sideNavInstance.toggle();
                    });
                }else{
                    dfxMessaging.showWarning("API source with such name already exists");
                }
            }
        }else if($scope.operation === "update"){
            dfxAuthProviders.saveProvider($scope.current_auth_provider.schema, $scope.current_auth_provider, $scope.app_name).then(function(data){
                $scope.getProviders();
                dfxMessaging.showMessage("API source data has been successfully saved");
                var sideNavInstance = $mdSidenav('side_nav_left');
                sideNavInstance.toggle();
            });
        }
    };

    $scope.closeSidenav = function(){
        var sideNavInstance = $mdSidenav('side_nav_left');
        sideNavInstance.toggle();
    };

    $scope.editAuthProvider = function(providername) {
        $scope.operation = "update" ;
        $scope.schema_on_open = "init";
        $scope.schema_on_close = "init";
        $scope.type_on_open = "init";
        $scope.type_on_close = "init";
        dfxAuthProviders.getProvider(providername, $scope.app_name).then(function (data) {
            $scope.current_auth_provider = data;
            if (!$scope.current_auth_provider.credentials.type) {
                $scope.current_auth_provider.selected_type = "";
            }
            for(var i = 0; i < $scope.dataSources.length; i++){
                if($scope.dataSources[i].name === $scope.current_auth_provider.dataSource){
                    $scope.schemas = $scope.dataSources[i].schemas ;
                }
            }

            var sideNavInstance = $mdSidenav('side_nav_left');
            sideNavInstance.toggle();
        });
    };

    $scope.confirmProviderRemove = function(ev, providername) {
        var confirm = $mdDialog.confirm()
            .title('Are you sure you want to delete this API source?')
            .textContent('API source will be removed from the repository.')
            .ariaLabel('remove api_source')
            .targetEvent(ev)
            .cancel('Cancel')
            .ok('OK');
        $mdDialog.show(confirm).then(function() {
            $scope.removeProvider(providername);
        }, function() {
        });
    };

    $scope.removeProvider = function(providername){
        dfxAuthProviders.removeProvider($scope.app_name, providername).then(function(){
            for(var i =0; i < $scope.auth_providers.length; i++){
                if($scope.auth_providers[i].provider === providername){
                    $scope.auth_providers.splice(i, 1);
                    break;
                }
            }
            dfxMessaging.showMessage('API source data has been successfully deleted');
        });
    };

    $scope.$watch('new_auth_provider.ap_oAuth_2.selected_type', function(newVal){
        if(newVal === 'facebook'){
            $scope.api_sources.new_auth_provider.ap_oAuth_2.credentials = facebook_credentials ;
        }else if(newVal === 'google'){
            $scope.api_sources.new_auth_provider.ap_oAuth_2.credentials = google_credentials ;
        }
    });

    $scope.setSchemaOnOpen = function(schema){
        $scope.schema_on_open = schema;
    };

    $scope.setSchemaOnClose = function(schema){
        $scope.schema_on_close = schema;
    };

    $scope.setTypeOnOpen = function(type){
        $scope.type_on_open = type;
    };

    $scope.setTypeOnClose = function(type){
        $scope.type_on_close = type;
    };

    $scope.$watch('current_auth_provider.schema',  function(newVal){
        if($scope.schema_on_open !== $scope.schema_on_close){
            if(newVal === 'basic' || newVal === 'digest'){
                $scope.current_auth_provider.credentials = {username: "", password: ""};
            }else if(newVal === 'oAuth1'){
                $scope.current_auth_provider.credentials = {
                    signature_method:       "HMAC-SHA1",
                    consumer_key:           "",
                    consumer_secret:        "",
                    access_token:           "",
                    access_secret :         ""
                };
            }else if(newVal === 'none'){
                $scope.current_auth_provider.route = "" ;
                $scope.current_auth_provider.credentials = {};
            }else if(newVal === 'oAuth2'){
                $scope.current_auth_provider.credentials = {
                    type:               "",
                    access_token:       "",
                    consumer_key:       "",
                    consumer_secret:    "",
                    authorize_path:     "",
                    base_site:          "",
                    access_token_path:  "",
                    response_type:      "",
                    scope:              ""
                };
            }
        }
    });

    $scope.$watch('current_auth_provider.credentials.type', function(newVal){
        if($scope.type_on_open !== $scope.type_on_close){
            if(newVal === 'facebook'){
                $scope.current_auth_provider.credentials = {
                    type:               "facebook",
                    access_token:       "",
                    consumer_key:       "",
                    consumer_secret:    "",
                    authorize_path:     "https://www.facebook.com/dialog/oauth",
                    access_token_path:  "https://graph.facebook.com/v2.3/oauth/access_token",
                    response_type:      "code",
                    scope:              ""
                };
            }else if(newVal === 'google'){
                $scope.current_auth_provider.credentials = {
                    type:               "google",
                    access_token:       "",
                    base_provider_url:  "https://accounts.google.com",
                    consumer_key:       "",
                    consumer_secret:    "",
                    authorize_path:     "/o/oauth2/auth",
                    access_token_path:  "/o/oauth2/token",
                    response_type:      "code",
                    scope:              ""
                };
            }
            $scope.current_auth_provider.selected_type = $scope.current_auth_provider.credentials.type ;
        }
    });

    /*$scope.$watch('new_auth_provider.schema', function(newVal){
     if(newVal){
     $scope.new_auth_provider.selected_data_source = "";
     if(newVal = 'public/rest'){
     $scope.new_auth_provider.rest.route = "";
     $scope.new_auth_provider.selected_data_source = "StrongLoop" ;
     $scope.new_auth_provider.credentials = {};
     }
     }
     });*/
}]);

//dfxStudioApp.controller("dfx_studio_resources_controller", [ '$scope', function($scope) {
//    $scope.click = function() {
//        $scope.path = "studioviews/resources.html";
//    }
//    $scope.javascript = {};
//    $scope.dictionary = {};
//    $scope.stylesheets = {};
//    $scope.assets = {};
//
//}]);

dfxStudioApp.directive('dropzone', ['dfxApplications','$timeout', '$mdDialog', 'dfxMessaging', '$compile', '$parse', function(dfxApplications, $timeout, $mdDialog, dfxMessaging, $compile, $parse) {
    return {
        restrict: 'C',
        scope: true,
        link: function(scope, element, attrs) {
            var mimeTypes = {
                dictionary:  '.json',
                javascript:  'text/javascript,application/javascript',
                stylesheets: 'text/css',
                assets:      'image/jpeg,image/png,image/gif,application/pdf,text/xml'
            };

            var dropzone_id = $(element[0]).attr("id");
            scope.resource_name = {value : ""};
            scope.dictionary_name = {value : ""};
            scope.current_resource_type = "javascript";
            scope.hide_areas = false;
            scope.create_new = true;

            switch(dropzone_id){
                case "dfx_resource_dictionary_folder_upload":
                    scope.current_resource_type = "dictionary";
                    break;
                case "dfx_resource_javascript_folder_upload":
                    scope.current_resource_type = "javascript";
                    break;
                case "dfx_resource_stylesheets_folder_upload":
                    scope.current_resource_type = "stylesheets";
                    break;
                case "dfx_resource_assets_folder_upload":
                    scope.current_resource_type = "assets";
            }

            var parentScope = scope.$parent;
            if(scope.current_resource_type === "dictionary"){
                parentScope.dictionary = scope;
            }else if (scope.current_resource_type === "javascript"){
                parentScope.javascript = scope;
            }else if(scope.current_resource_type === "stylesheets"){
                parentScope.stylesheets = scope;
            }else if(scope.current_resource_type === "assets"){
                parentScope.assets = scope;
            }

            if(!parentScope.dictionary.data){
                parentScope.dictionary.data = {
                    application: scope.app_name,
                    name: "dictionary",
                    description: '',
                    action: 'put',
                    items: []
                };
            }

            if(!parentScope.javascript.data){
                parentScope.javascript.data = {
                    application: scope.app_name,
                    name: "javascript",
                    description: '',
                    action: 'put',
                    items: []
                };
            }

            if(!parentScope.stylesheets.data){
                parentScope.stylesheets.data = {
                    application: scope.app_name,
                    name: "stylesheets",
                    description: '',
                    action: 'put',
                    items: []
                };
            }

            if(!parentScope.assets.data){
                parentScope.assets.data = {
                    application: scope.app_name,
                    name: "assets",
                    description: '',
                    action: 'put',
                    items: []
                };
            }

            scope.getResources = function(){
                dfxApplications.getResources(scope.app_name).then(function(response){
                    var arr = response.data.data;
                    for(var i =0; i < arr.length; i++){
                        if(arr[i].name === "javascript" && scope.current_resource_type === "javascript"){
                            parentScope.javascript.data.items = arr[i].items;
                            for(var j=0; j < parentScope.javascript.data.items.length; j++){
                                parentScope.javascript.data.items[j].is_uploaded = true;
                            }
                        }else if(arr[i].name === "stylesheets" && scope.current_resource_type === "stylesheets"){
                            parentScope.stylesheets.data.items = arr[i].items;
                            for(var j=0; j < parentScope.stylesheets.data.items.length; j++){
                                parentScope.stylesheets.data.items[j].is_uploaded = true;
                            }
                        }else if(arr[i].name === "assets" && scope.current_resource_type === "assets"){
                            parentScope.assets.data.items = arr[i].items;
                            for(var j=0; j < parentScope.assets.data.items.length; j++){
                                parentScope.assets.data.items[j].is_uploaded = true;
                            }
                        }
                    }
                }, function(){
                    dfxMessaging.showWarning("Can\'t get list of resources");
                });
            };

            scope.getDataDictionaries = function(){
                dfxApplications.getDataDictionaries(scope.app_name).then(function(response){
                    parentScope.dictionary.data.items = response.data.data;
                }, function(){
                    dfxMessaging.showWarning("Can\'t get list of data dictionaries");
                });
            };

            if(scope.current_resource_type === 'dictionary'){
                $timeout(function(){
                    scope.getDataDictionaries();
                },0);
            }else{
                scope.getResources();
            };

            scope.uploadResources = function(){
                dfxApplications.saveResources(scope.data).then(function(response){
                    for(var i =0; i < scope.data.items.length; i++){
                        scope.data.items[i].is_uploaded = true;
                    }
                    scope.processDropzone();
                    dfxMessaging.showMessage("Resources data has been successfully updated");
                }, function(){
                    dfxMessaging.showWarning("Can\'t save resources data");
                });
            };

            scope.confirmResourceDelete = function(ev, item) {
                var confirm = $mdDialog.confirm()
                    .title('Are you sure you want to delete this file?')
                    .textContent('The file will be removed permanently from the repository.')
                    .ariaLabel('remove file')
                    .targetEvent(ev)
                    .cancel('Cancel')
                    .ok('OK');
                $mdDialog.show(confirm).then(function() {
                    scope.deleteItem(item);
                }, function() {
                });
            };

            scope.confirmDictionaryDelete = function(ev, item) {
                var confirm = $mdDialog.confirm()
                    .title('Are you sure you want to delete this item?')
                    .textContent('This item will be removed permanently from the repository.')
                    .ariaLabel('remove dictionary')
                    .targetEvent(ev)
                    .cancel('Cancel')
                    .ok('OK');
                $mdDialog.show(confirm).then(function() {
                    scope.deleteDictionaryItem(item);
                }, function() {
                });
            };

            scope.deleteDictionaryItem = function(item){
                dfxApplications.removeDataDictionary(item.name, scope.app_name).then(function(){
                    scope.getDataDictionaries();
                    dfxMessaging.showMessage("Data dictionary " + item.name + " has been successfully deleted");
                });
            };

                scope.deleteItem = function(item){
                if(scope.current_resource_type === "javascript"){
                    for(var i=0; i < parentScope.javascript.data.items.length; i++){
                        if(parentScope.javascript.data.items[i].path === item.path){
                            parentScope.javascript.data.items.splice(i, 1);
                            $timeout(function(){
                                $('#upload-javascript-resources').trigger('click');
                            },0);
                            break;
                        }
                    }
                }else if(scope.current_resource_type === "stylesheets"){
                    for(var j=0; j < parentScope.stylesheets.data.items.length; j++){
                        if(parentScope.stylesheets.data.items[j].path === item.path){
                            parentScope.stylesheets.data.items.splice(j, 1);
                            $timeout(function(){
                                $('#upload-stylesheets-resources').trigger('click');
                            },0);
                            break;
                        }
                    }
                }else if(scope.current_resource_type === "assets"){
                    for(var j=0; j < parentScope.assets.data.items.length; j++){
                        if(parentScope.assets.data.items[j].path === item.path){
                            parentScope.assets.data.items.splice(j, 1);
                            $timeout(function(){
                                $('#upload-assets-resources').trigger('click');
                            },0);
                            break;
                        }
                    }
                }
            };

            scope.config = {
                maxFilesize: 100,
                paramName: "uploadfile",
                maxThumbnailFilesize: 10,
                url: '/studio/resources/upload/' + scope.app_name + '/' + scope.current_resource_type,
                acceptedFiles:    mimeTypes[scope.current_resource_type],
                uploadMultiple:   true,
                autoProcessQueue: false,
                maxFiles:         1000,
                parallelUploads:  1000
            };

            scope.dropzone = new Dropzone(element[0], scope.config);

            var eventHandlers = {
                'addedfile': function(file) {
                    var is_unique = true;
                    for(var i =0; i < scope.data.items.length; i++){
                        if(file.name === scope.data.items[i].path){
                            dfxMessaging.showWarning("Current file name " + file.name + " already exists");
                            is_unique = false;
                            this.removeFile(file);
                            break;
                        }
                    }
                    if(is_unique){
                        scope.data.items.push({
                            'path': file.name.replace(/ /g,'').replace(/-/g,'').replace(/:/g,''),
                            'type': file.type,
                            'size': (file.size/1000).toFixed(1),
                            'is_uploaded': false
                        });
                    }

                    if(scope.current_resource_type === "javascript"){
                        $( "#dfx_resource_javascript_folder_upload .dz-file-preview").remove();
                        $("#dfx_resource_javascript_folder_upload > div.dz-default.dz-message").css('opacity', '1');
                        $timeout(function(){
                            $('#upload-javascript-resources').trigger('click');
                        },0);
                    }else if(scope.current_resource_type === "stylesheets"){
                        $( "#dfx_resource_stylesheets_folder_upload .dz-file-preview" ).remove();
                        $("#dfx_resource_stylesheets_folder_upload > div.dz-default.dz-message").css('opacity', '1');
                        $timeout(function(){
                            $('#upload-stylesheets-resources').trigger('click');
                        },0);
                    }else if(scope.current_resource_type === "assets"){
                        $( "#dfx_resource_assets_folder_upload .dz-file-preview" ).remove();
                        $("#dfx_resource_assets_folder_upload > div.dz-default.dz-message").css('opacity', '1');
                        $timeout(function(){
                            $('#upload-assets-resources').trigger('click');
                        },0);
                    }
                },
                'success': function (file, response) {

                }
            };

            scope.createResource = function(ev) {
                scope.create_new = true;
                $mdDialog.show({
                    scope: scope.$new(),
                    controller: DialogController,
                    templateUrl: 'studioviews/create_resource_dialog.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose:true
                })
                    .then(function() {
                        var alert = '';
                        if(scope.current_resource_type === "dictionary"){
                            if (scope.dictionary_name.value.indexOf(" ") != -1) {
                                alert = "The name can't have empty spaces";
                            }
                            else if ($.isEmptyObject(scope.dictionary_name.value)) {
                                alert = "The name can't be empty";
                            }
                            else if (!/^[a-zA-Z0-9-_.]+$/.test(scope.dictionary_name.value)) {
                                alert = "The name can have only letters, numbers, underscore or dash symbols";
                            }
                        }else{
                            if (scope.resource_name.value.indexOf(" ") != -1) {
                                alert = "The name can't have empty spaces";
                            }
                            else if ($.isEmptyObject(scope.resource_name.value)) {
                                alert = "The name can't be empty";
                            }
                            else if (!/^[a-zA-Z0-9-_.]+$/.test(scope.resource_name.value)) {
                                alert = "The name can have only letters, numbers, underscore or dash symbols";
                            }
                        }

                        if (alert) {
                            dfxMessaging.showWarning(alert);
                        } else {
                            var is_unique = true;
                            if(scope.current_resource_type === "dictionary"){
                                for(var i =0; i < scope.data.items.length; i++){
                                    if((scope.dictionary_name.value) === scope.data.items[i].name){
                                        dfxMessaging.showWarning("Current item name " + scope.dictionary_name.value + " already exists");
                                        is_unique = false;
                                        break;
                                    }
                                }
                            }else if(scope.current_resource_type === "javascript"){
                                for(var i =0; i < scope.data.items.length; i++){
                                    if((scope.resource_name.value+'.js') === scope.data.items[i].path){
                                        dfxMessaging.showWarning("Current file name " + scope.resource_name.value + ".js already exists");
                                        is_unique = false;
                                        break;
                                    }
                                }
                            }else if(scope.current_resource_type === "stylesheets"){
                                for(var j =0; j < scope.data.items.length; j++){
                                    if((scope.resource_name.value+'.css') === scope.data.items[j].path){
                                        dfxMessaging.showWarning("Current file name " + scope.resource_name.value + ".css already exists");
                                        is_unique = false;
                                        break;
                                    }
                                }
                            }
                            if(is_unique){
                                if(scope.current_resource_type === 'dictionary'){
                                    scope.saveNewDictionary() ;
                                }else{
                                    scope.scriptEditorBuilder(scope.current_resource_type, "");
                                }
                            }
                        }

                    }, function() {
                        // if cancel
                    });

                function DialogController($scope, $mdDialog) {
                    $scope.hide = function() {
                        $mdDialog.hide();
                    };
                    $scope.cancel = function() {
                        scope.resource_name.value = "";
                        scope.dictionary_name.value = "";
                        $mdDialog.cancel();
                    };
                }
            };

            scope.editResource = function(filename, index){
                scope.create_new = false;
                var edited = {
                    applicationName: scope.app_name,
                    component: "resources",
                    name: scope.current_resource_type,
                    number: index,
                    action: "getResourceContent"
                };
                scope.resource_name.value = filename.substring(0, filename.lastIndexOf('.'));

                dfxApplications.getResourceContent(edited).then(function(data){
                    scope.scriptEditorBuilder(scope.current_resource_type, data.content);
                });
            };

            scope.editDataDictionary = function(item){
                scope.edited_dictionary_name = item.name;
                var temp = JSON.parse(item.content);
                scope.scriptEditorBuilder(scope.current_resource_type, JSON.stringify(temp, null, "\t"));
            };

            scope.scriptEditorBuilder = function(resource_type, value){
                $timeout(function() {
                    var editor_parent;
                    if(resource_type === "dictionary"){
                        editor_parent = document.getElementById('dd_code_mirror_parent');
                    } if(resource_type === "javascript"){
                        editor_parent = document.getElementById('js_code_mirror_parent');
                    }else if(resource_type === "stylesheets"){
                        editor_parent = document.getElementById('css_code_mirror_parent');
                    }
                    scope.script_editor = CodeMirror(function (elt) {
                            $(editor_parent).empty();
                            $(editor_parent).append(elt);
                        },
                        {
                            lineNumbers: true,
                            value: value,
                            mode: {name: resource_type, globalVars: true},
                            matchBrackets: true,
                            highlightSelectionMatches: {showToken: /\w/},
                            styleActiveLine: true,
                            viewportMargin : Infinity,
                            extraKeys: {"Alt-F": "findPersistent", "Ctrl-Space": "autocomplete"},
                            lineWrapping: true
                        });
                    scope.script_editor.setSize(null, ($(window).height() - 400) + 'px');
                    $timeout(function(){
                        scope.script_editor.refresh();
                        scope.script_editor.focus();
                    },0);
                    scope.hide_areas = true;
                }, 0);
            };

            scope.itemJsonEditor = function(value){
                $timeout(function() {
                    var editor_parent = document.getElementById('dd_editor_code_mirror_parent');
                    scope.dd_script_editor = CodeMirror(function (elt) {
                            $(editor_parent).empty();
                            $(editor_parent).append(elt);
                        },
                        {
                            lineNumbers: true,
                            value: value,
                            mode: {name: 'javascript', globalVars: true, json: true},
                            matchBrackets: true,
                            highlightSelectionMatches: {showToken: /\w/},
                            styleActiveLine: true,
                            viewportMargin : Infinity,
                            extraKeys: {"Alt-F": "findPersistent", "Ctrl-Space": "autocomplete"},
                            lineWrapping: true,
                            readOnly: true
                        });
                    scope.dd_script_editor.setSize(null, '340px');
                    $timeout(function(){
                        scope.dd_script_editor.refresh();
                    },0);
                }, 0);
            };

            scope.closeEditor = function(){
                scope.hide_areas = false;
                scope.resource_name.value = "";
                scope.dictionary_name.value = "";
            };

            scope.saveNewResource = function(){
                var content = scope.script_editor.getValue();
                var file_name = scope.resource_name.value + (scope.current_resource_type==="javascript"? ".js" :(scope.current_resource_type==="stylesheets"? ".css": ".json"));
                var body = {
                    action : "createResourceFile",
                    fileName : file_name,
                    content : content,
                    name : scope.current_resource_type,
                    applicationName : scope.app_name
                }
                dfxApplications.createResource(body).then(function(){
                    scope.getResources();
                    scope.closeEditor();
                    dfxMessaging.showMessage("File " + file_name + " has been successfully created");
                });
            };

            scope.saveNewDictionary = function(){
                var content = {Item: "empty"} ;
                var name = scope.dictionary_name.value;
                var data = {
                    name      : scope.dictionary_name.value,
                    content   : JSON.stringify(content)
                };
                dfxApplications.saveDictionary(scope.app_name, data).then(function(res){
                    scope.getDataDictionaries();
                    dfxMessaging.showMessage("Data dictionary " + name + " has been successfully created");
                });
            };

            scope.updateDictionary = function(){
                var content = scope.script_editor.getValue();
                var valid = true;
                try{
                    JSON.parse(content) ;
                }catch(e){
                    valid = false;
                    dfxMessaging.showMessage("Can\'t save, because JSON string is not valid");
                }
                if(valid){
                    var data = {
                        name      : scope.edited_dictionary_name,
                        content   : content
                    };
                    dfxApplications.saveDictionary(scope.app_name, data).then(function(res){
                        scope.getDataDictionaries();
                        scope.closeEditor();
                        dfxMessaging.showMessage("Data dictionary " + scope.edited_dictionary_name + " has been successfully saved");
                    });
                }
            };

            scope.updateResource = function(){
                var content = scope.script_editor.getValue();
                var file_name = scope.resource_name.value + (scope.current_resource_type==="javascript"? ".js" :(scope.current_resource_type==="stylesheets"? ".css": ".json"));
                var body = {
                    action : "updateResourceFile",
                    fileName : file_name,
                    content : content,
                    name : scope.current_resource_type,
                    applicationName : scope.app_name
                };
                dfxApplications.updateResource(body).then(function(){
                    scope.getResources();
                    scope.closeEditor();
                    dfxMessaging.showMessage("File " + file_name + " has been successfully saved");
                });
            };

            scope.iterate = function(obj, path) {
                scope.result += "<ul>" ;
                for (var property in obj) {
                    scope.result += "<li class='menu-tree-item' item-id='" + scope.counter + "' id='jsonitem_" + scope.counter + "'>" ;
                    scope.result += "<a style='cursor:pointer;' ng-click='selectItem(" + scope.counter + ")'>" + property+ "</a>";
                    if (obj.hasOwnProperty(property)) {
                        if (typeof obj[property] == "object" && obj[property].constructor !== Array) {
                            var path1 = path + "." + property;
                            scope.buffer.push({key: property, value: obj[property], itemId: scope.counter++, path: path1, type: "Object" });
                            scope.iterate(obj[property], path1);
                        }else if(obj[property].constructor === Array){
                            var path1 = path + "." + property;
                            scope.buffer.push({key: property, value: obj[property], itemId: scope.counter++, path: path1, type: "Array" });
                        }else{
                            var path1 = path + "." + property;
                            scope.buffer.push({key: property, value: obj[property], itemId: scope.counter++, path: path1, type: "String"});
                        }
                    }
                    scope.result += "</li>" ;
                }
                scope.result += "</ul>" ;
            };

            scope.refreshBuffer = function(){
                var obj = scope.obj;
                scope.buffer = [];
                scope.result = "";
                scope.counter = 0;
                scope.iterate(obj, "");
            };

            scope.buildStructure = function(){
                $('#items-list').html(scope.result);
                $compile($('#items-list').contents())(scope);
            };

            scope.graphicalEdit = function(ev, item){
                $mdDialog.show({
                    scope: scope.$new(),
                    templateUrl: 'studioviews/json_graphical_editor.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose:true,
                    onComplete: function() {

                        scope.saveDictionary = function(){
                            var temp = JSON.stringify(scope.obj);
                            var data = {
                                name      : item.name,
                                content   : temp
                            };
                            dfxApplications.saveDictionary(scope.app_name, data).then(function(res){
                                scope.getDataDictionaries();
                                scope.closeDialog();
                                dfxMessaging.showMessage("Data dictionary " + item.name + " has been successfully saved");
                            });
                        };

                        scope.selectItem = function(id){
                            scope.refreshBuffer();
                            scope.selectedItem = scope.buffer[id];
                            scope.selectedItem.displayValue = false;
                            if(scope.selectedItem.value.constructor === Array){
                                scope.selectedItem.displayValue = true;
                                scope.arrayValue = scope.selectedItem.value[0];
                            }else if(typeof scope.selectedItem.value !== "object"){
                                scope.selectedItem.displayValue = true;
                            }
                            $timeout(function(){
                                $($('#items-list').find('.active')[0]).removeClass('active');
                                $('#jsonitem_'+id).addClass('active');
                            },0);
                            scope.itemJsonEditor(JSON.stringify(scope.selectedItem.value, null, "\t"));

                            scope.parentItem = eval(('scope.obj' + scope.selectedItem.path).substring(0, ('scope.obj' + scope.selectedItem.path).lastIndexOf('.')));

                            scope.levelItems = Object.keys(scope.parentItem);
                            var levelHtmlList = $($('#jsonitem_'+id).parent()[0]).children();

                            scope.htmlLevelIds = [];
                            for(var i=0; i < levelHtmlList.length; i++){
                                var temp = parseInt($(levelHtmlList[i]).attr('item-id')) ;
                                scope.htmlLevelIds.push(temp) ;
                            }

                            scope.isTopLevel = false;

                            for(var j=0; j < scope.htmlLevelIds.length; j++){
                                if(scope.htmlLevelIds[j]=== 0){
                                    scope.isTopLevel = true;
                                    break;
                                }
                            }
                        };

                        scope.selectItem(0);

                        scope.addNewItem = function(){
                            var isKeyUnique = true;
                                for(var key in scope.obj){
                                    if(key === scope.keyName){
                                        isKeyUnique = false;
                                        dfxMessaging.showWarning('Can\'t add new item, because such key name already exists in this object');
                                        break;
                                    }
                                }
                                if(scope.keyName === ""){
                                    dfxMessaging.showWarning('Can\'t add new item, because it has empty key name');
                                    return;
                                }
                                if(isKeyUnique){
                                    if(scope.selectedItem === null){
                                    if(scope.defaultType === 'String'){
                                        scope.obj[scope.keyName] = "" ;
                                    }else if(scope.defaultType === 'Object'){
                                        scope.obj[scope.keyName] = {} ;
                                    }else if(scope.defaultType === 'Array'){
                                        scope.obj[scope.keyName] = [];
                                    }
                                }else{
                                        if(scope.defaultType === 'String'){
                                            eval("scope.obj" + scope.selectedItem.path.substring(0, scope.selectedItem.path.lastIndexOf('.')) + "[scope.keyName]=''");
                                        }else if(scope.defaultType === 'Object'){
                                            eval("scope.obj" + scope.selectedItem.path.substring(0, scope.selectedItem.path.lastIndexOf('.')) + "[scope.keyName]={}");
                                        }else if(scope.defaultType === 'Array'){
                                            eval("scope.obj" + scope.selectedItem.path.substring(0, scope.selectedItem.path.lastIndexOf('.')) + "[scope.keyName]=[]");
                                        }
                                    }
                            }
                            var parentCounter = 0;
                            var parentIndex = 0;
                            var parentIndexDefind = false;
                            var arr = scope.selectedItem.path.split('.');
                            arr.pop();
                            var path = arr.join('.') ;

                            for(var i = 0; i < scope.buffer.length; i++){
                                if(scope.buffer[i].path.indexOf(path)!== -1){
                                    if(!parentIndexDefind){
                                        parentIndex = i;
                                        parentIndexDefind = true;
                                    }
                                    parentCounter ++;
                                }
                            }
                            var index = parentIndex + parentCounter;
                            scope.refreshBuffer();
                            scope.buildStructure();
                            scope.selectItem(index);
                        };

                        scope.indent = function(){
                            for(var j =1; j < scope.htmlLevelIds.length; j++){
                                if(scope.htmlLevelIds[j] === scope.selectedItem.itemId){
                                    var index = scope.htmlLevelIds[j-1];
                                    var prevObj = scope.buffer[index] ;
                                }
                            }
                            if(prevObj){
                                if(prevObj.type==='Object'){
                                    var index = scope.selectedItem.itemId;
                                    eval('scope.obj' + prevObj.path + "[scope.selectedItem.key] = scope.selectedItem.value ;");
                                    scope.removeItem();
                                    scope.refreshBuffer();
                                    scope.buildStructure();
                                    scope.selectItem(index);
                                }
                            }
                        };

                        scope.outdent = function(){
                            if(!scope.isTopLevel){
                                    var itemCounter = 0;
                                    var parentCounter = 0;
                                    var parentIndex = 0;
                                    var parentIndexDefind = false;
                                    var arr = scope.selectedItem.path.split('.');
                                    arr.pop(); arr.pop();
                                    var path = arr.join('.') ;

                                    for(var i = 0; i < scope.buffer.length; i++){
                                        if(scope.buffer[i].path.indexOf(path)!== -1){
                                            if(!parentIndexDefind){
                                                parentIndex = i;
                                                parentIndexDefind = true;
                                            }
                                            parentCounter ++;
                                        }
                                    }

                                    for(var j = scope.selectedItem.itemId; j < scope.buffer.length; j++){
                                        if(scope.buffer[j].path.indexOf(scope.selectedItem.path)!== -1){
                                            itemCounter ++;
                                        }
                                    }
                                    var index = parentIndex + parentCounter - itemCounter;

                                eval('scope.obj' + path + "[scope.selectedItem.key] = scope.selectedItem.value ;");
                                scope.removeItem();
                                scope.refreshBuffer();
                                scope.buildStructure();
                                scope.selectItem(index);
                            }
                        };

                        scope.moveUp = function(){
                            var doModify = false;
                            for(var j =1; j < scope.htmlLevelIds.length; j++){
                                if(scope.htmlLevelIds[j] === scope.selectedItem.itemId){
                                    var index = scope.htmlLevelIds[j-1];
                                }
                            }
                            for(var i =1; i < scope.levelItems.length; i++){
                                if(scope.selectedItem.key === scope.levelItems[i]){
                                    doModify = true;
                                    var temp = scope.levelItems[i-1];
                                    scope.levelItems[i-1] = scope.levelItems[i];
                                    scope.levelItems[i] = temp;
                                    break;
                                }
                            }
                            if(doModify){
                                var modified = JSON.parse(JSON.stringify(scope.parentItem, scope.levelItems));
                                for(var key1 in modified){
                                    for(var key2 in scope.parentItem){
                                        if (key1 === key2){
                                            modified[key1] = scope.parentItem[key2];
                                        }
                                    }
                                }
                                eval(('scope.obj' + scope.selectedItem.path).substring(0, ('scope.obj' + scope.selectedItem.path).lastIndexOf('.')) + " = modified ;");
                                scope.refreshBuffer();
                                scope.buildStructure();
                                scope.selectItem(index);
                            }
                        };

                        scope.moveDown = function(){
                            var doModify = false;
                            var index = 0;
                            for(var j =0; j < scope.htmlLevelIds.length-1; j++){
                                if(scope.htmlLevelIds[j] === scope.selectedItem.itemId){
                                    var nextItemIndex = scope.htmlLevelIds[j+1];
                                }
                            }
                            if(nextItemIndex){
                                var nexItem = scope.buffer[nextItemIndex];
                                var nextItemLength = 0;
                                for(var n = nexItem.itemId; n < scope.buffer.length; n++){
                                    if(scope.buffer[n].path.indexOf(nexItem.path)!== -1){
                                        nextItemLength ++;
                                        continue ;
                                    }
                                    break;
                                }

                                index = scope.selectedItem.itemId + nextItemLength;
                            }

                            for(var i =0; i < scope.levelItems.length-1; i++){
                                if(scope.selectedItem.key === scope.levelItems[i]){
                                    doModify = true;
                                    var temp = scope.levelItems[i+1];
                                    scope.levelItems[i+1] = scope.levelItems[i];
                                    scope.levelItems[i] = temp;
                                    break;
                                }
                            }

                            if(doModify){
                                var modified = JSON.parse(JSON.stringify(scope.parentItem, scope.levelItems));
                                for(var key1 in modified){
                                    for(var key2 in scope.parentItem){
                                        if (key1 === key2){
                                            modified[key1] = scope.parentItem[key2];
                                        }
                                    }
                                }
                                eval(('scope.obj' + scope.selectedItem.path).substring(0, ('scope.obj' + scope.selectedItem.path).lastIndexOf('.')) + " = modified ;");
                                scope.refreshBuffer();
                                scope.buildStructure();
                                scope.selectItem(index);
                            }
                        };

                        scope.confirmRemoveItem = function() {
                            var confirm = $mdDialog.confirm()
                                .title('Are you sure you want to remove this ' + scope.selectedItem.type +'?')
                                .textContent(scope.selectedItem.type +  ' will be removed permanently from the data dictionary.')
                                .ariaLabel('remove property')
                                .targetEvent(ev)
                                .cancel('Cancel')
                                .ok('OK');
                            $mdDialog.show(confirm).then(function() {
                                scope.removeItem();
                            }, function() {
                            });
                        };

                        scope.removeItem = function(){
                            if(scope.selectedItem !== null){
                                var path = "obj" + scope.selectedItem.path;
                                var partials = path.split('.');
                                var deepKey = partials.pop();
                                var deepPath = partials.join('.');
                                var deep = $parse(deepPath);
                                delete deep(scope)[deepKey];
                                scope.refreshBuffer();
                                scope.buildStructure();
                                scope.selectedItem = null;
                            }
                        };

                        scope.addArrayItem = function(){
                            scope.selectedItem.value.push(scope.newArrayItem);
                            scope.arrayValue = scope.newArrayItem;
                            dfxMessaging.showMessage("New element has been successfully added to array");
                            scope.refreshBuffer();
                        };

                        scope.removeArrayItem = function(){
                            if(scope.selectedItem.value.length > 0){
                                for(var i = 0;  i < scope.selectedItem.value.length; i++){
                                    if(scope.selectedItem.value[i] === scope.arrayValue){
                                        if(i>0){
                                            scope.arrayValue = scope.selectedItem.value[i-1]
                                            scope.selectedItem.value.splice(i, 1);
                                            scope.refreshBuffer();
                                        }else if(i === 0 && scope.selectedItem.value.length > 1){
                                            scope.arrayValue = scope.selectedItem.value[i+1]
                                            scope.selectedItem.value.splice(0, 1);
                                            scope.refreshBuffer();
                                        }else if(i === 0 && scope.selectedItem.value.length === 1){
                                            scope.selectedItem.value.splice(0, 1);
                                            scope.refreshBuffer();
                                        }
                                        break;
                                    }
                                }
                                scope.newArrayItem = "";
                                dfxMessaging.showMessage("Array element has been successfully deleted");

                            }
                        };
                    },
                    controller: function() {
                        scope.selectedItem = null;
                            try{
                                scope.obj = JSON.parse(item.content);
                                var obj = JSON.parse(item.content);
                            }catch(e){
                                dfxMessaging.showWarning('JSON string is not valid');
                                var obj = {};
                            }
                            scope.buffer = [];
                            scope.counter = 0;
                            scope.result = "";
                            scope.iterate(obj, "");
                            $timeout(function(){
                                $('#items-list').html(scope.result);
                                $compile($('#items-list').contents())(scope);
                            },0)

                        scope.defaultType = "String" ;
                        scope.newJsonItem = {
                            itemName:          "newItem",
                            keyName:           "keyName",
                            value:             "value",
                            selectedType:      "String"
                        };
                        scope.keyName = "";

                        scope.closeDialog = function() {
                            $mdDialog.hide();
                        };

                        scope.updateValue = function(){
                                eval("scope.obj" + scope.selectedItem.path + " = scope.selectedItem.value ;");
                                scope.refreshBuffer();
                        };
                    }
                })

            };

            angular.forEach(eventHandlers, function(handler, event) {
                scope.dropzone.on(event, handler);
            });

            scope.processDropzone = function() {
                scope.dropzone.processQueue();
            };

        }
    }
}]);

dfxStudioApp.controller("dfx_studio_deployment_controller", [ '$scope', '$mdDialog', 'dfxDeployment', 'dfxMessaging', '$filter', '$timeout', '$location', function($scope, $mdDialog, dfxDeployment, dfxMessaging, $filter, $timeout, $location) {
    $scope.description = {value : ""};
    $scope.builds = {'web': [], 'mobile': []};
    $scope.application_version = "1.0";
    $scope.build_number = {};


    $scope.platform = 0;
    $scope.building_status = 'pending...';
    $scope.new_build = {};
    $scope.host_port = $('body').attr('deploymenturl') ;
    $scope.env_vars = [];


    $scope.getAppEnvVariables = function(app){
        dfxApplications.getGeneratedEnvironment({'app_name':app}).then(function(res) {
            var response = res.data.data[0];
            response.content.map(function(cont){
                cont.data = JSON.stringify(cont.data,null,4);
                cont.waitingMessage = false;
            })
            $scope.env_vars = response.content;
        });
    }

    $scope.showDeployments = function (build, platform){
        build.displayDeployments = true;
    }

    $scope.hideDeployments = function (build, platform){
        delete build.displayDeployments;
    }

    $scope.getAppBuilds = function(platform){
        dfxDeployment.getAppBuilds($scope.app_name, platform).then(function(data){
            $scope.builds[platform] = data.items;
            var max = 0;
            for(var i = 0; i < $scope.builds[platform].length; i++){
                $scope.builds[platform][i].logs = [];
                $scope.builds[platform][i].tenant_id = $scope.$parent.$parent.tenant_id;
                if(parseInt($scope.builds[platform][i].build_number) > max){
                    max = parseInt($scope.builds[platform][i].build_number);
                }
            }

            $scope.build_number[platform] = max;

            if(!$scope.compiler){
                $scope.compiler = data.compiler ;
            }
        });
    };

    $scope.getAppBuilds('web');
    $scope.getAppBuilds('mobile');
    $scope.getAppEnvVariables($scope.app_name);


    $scope.deployBuild = function(build, platform, env){
        env.waitingMessage = true;
        var body = {
            applicationName:        $scope.app_name,
            platform:               platform,
            applicationVersion:     build.app_version,
            buildNumber:            build.build_number,
            tenantId:               $scope.tenant_id,
            deploymentVersion :     env
        };
        dfxDeployment.deployBuild(body).then(function(data){
            env.waitingMessage = false;
            dfxMessaging.showMessage('Build has been successfully deployed on deployment server');
            build.deploymentVersion = env.name;
            build.link = $scope.host_port + '/deploy/' + $scope.tenant_id + '/' + $scope.app_name + '/' + platform + '/' + build.app_version + '.' + build.build_number + '/login.html';
        },function (err) {
            env.waitingMessage = false;
            dfxMessaging.showWarning('Build has been failed');
        });
    };

    $scope.doRebuild = function(build, platform) {
        for(var i =0; i < $scope.builds[platform].length; i++){
            if($scope.builds[platform][i].build_number === build.build_number && $scope.builds[platform][i].app_version === build.app_version){
                $scope.builds[platform][i].displayDeployments = false;
                $scope.builds[platform][i].status = "pending..." ;
            }
        }
        var removingBuildData = {
            applicationName:    $scope.app_name,
            platform:           platform,
            applicationVersion: build.app_version,
            buildNumber:        build.build_number
        };
        dfxDeployment.deleteBuild(removingBuildData).then(function(data){
            if(build.is_deployed && build.platfrom != 'mobile'){
                dfxDeployment.deleteDeployedBuild($scope.app_name, (build.app_version + "." + build.build_number)).then(function(){
                });
            }
            $scope.doCreateNew(build, platform);
        });
    };

    $scope.getBuildFile = function( ) {
        dfxMessaging.showMessage("Zip file has been successfully copied");
    }

    $scope.doCreateNew = function(new_build, platform){
        var isBuildSaved = false;
        var url = 'http://' + $scope.compiler.host + ':' + $scope.compiler.port + '/compile?server=' + $scope.compiler.serverInfo['server-uuid'] +
            '&tenant=' + $scope.tenant_id +
            '&appid=' + $scope.app_name +
            '&platform=' + new_build.platform +
            '&build=' + $scope.application_version + '.' + new_build.build_number +
            '&schemaId=' + platform +
            '&deployto=29cd8260-e168-11e4-905f-e91235c968e0';

        dfxDeployment.runCompilerTask(url).then(function(){
            /*if(!$scope.compilerSocket){*/
            try {
                $scope.compilerSocket = io(
                    'http://' + $scope.compiler.host + ':' + $scope.compiler.port + '/' +
                    $scope.compiler.serverInfo['server-uuid'] + '_' + $scope.tenant_id,
                    {
                        'force new connection': true
                    }
                );
            } catch(err) {
                /*console.log(err);*/
            }
            /*}*/


            $scope.compilerSocket.on('status', function (data) {
                var newBuildDataForSockets = new_build;
                $scope.description = {value : ""};

                var m = data.message,
                    s = JSON.parse(m.text);

                if (s.done == s.total) {
                    newBuildDataForSockets.error = parseInt(s.errors) != 0;
                    if (!isBuildSaved) {
                        isBuildSaved = true;
                        dfxDeployment.registerNewBuild(newBuildDataForSockets, $scope.app_name, platform).then(function (res) {
                            $scope.getAppBuilds(platform);
                        });
                    }
                }
            });

            $scope.compilerSocket.on('missedStatus', function (list) {
                var newBuildDataForSockets = new_build;
                $scope.description = {value : ""};

                var log = list.log;
                var m   = log[log.length - 1],
                    s   = JSON.parse(m.text);

                if (s.done == s.total) {
                    newBuildDataForSockets.error = parseInt(s.errors) != 0;
                    if (!isBuildSaved) {
                        isBuildSaved = true;
                        dfxDeployment.registerNewBuild(newBuildDataForSockets, $scope.app_name, platform).then(function (res) {
                            $scope.getAppBuilds(platform);
                        });
                    }
                }
            });

            $scope.compilerSocket.on('update', function (data) {
                for(var i = 0; i < $scope.builds[platform].length; i++){
                    if($scope.builds[platform][i].build === data.message.build) {
                        $scope.builds[platform][i].logs.push(data.message);
                    }
                }
            });

        },function(err){
            dfxMessaging.showWarning("Seems compiler is not reachable");
            $scope.getAppBuilds('web');
            $scope.getAppBuilds('mobile');
        })
    };

    $scope.buildDialog = function(ev, platform) {
        $mdDialog.show({
            scope: $scope.$new(),
            controller: DialogController,
            templateUrl: 'studioviews/create_build_dialog.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true
        }).then(function() {
            var alert = null;
            if ($scope.description.value.indexOf(" ") != -1) {
                alert = "The name can't have empty spaces";
            }
            else if ($.isEmptyObject($scope.description.value)) {
                alert = "The name can't be empty";
            }
            else if (!/^[a-zA-Z0-9-_.]+$/.test($scope.description.value)) {
                alert = "The name can have only letters, numbers, underscore or dash symbols";
            }
            if (alert) {
                dfxMessaging.showWarning(alert);
            } else {
                $scope.build_number[platform] = $scope.build_number[platform] + 1;
                $scope.new_build = {
                    application:        $scope.app_name,
                    platform:           platform,
                    deploymentVersion:  null,
                    app_version:        $scope.application_version,
                    build_number:       "" +  $scope.build_number[platform],
                    build:              ($scope.application_version + '.' + $scope.build_number),
                    deployed:           false,
                    description:        $scope.description.value,
                    release_notes:      "",
                    build_date:          $filter('date')(new Date(), 'EEE MMM dd yyyy HH:mm:ss') + ' GMT' + $filter('date')(new Date(), 'Z'),
                    displayLog:          false,
                    displayDeployments:  false,
                    logs:               [],
                    status:             'pending...'
                }
                $scope.builds[platform].push($scope.new_build);
                $scope.doCreateNew($scope.new_build, platform);

            }

        }, function() {
            // if cancel
        });

        function DialogController($scope, $mdDialog) {
            $scope.hide = function() {
                $mdDialog.hide();
            };
            $scope.cancel = function() {
                $mdDialog.cancel();
            };
        }
    };

    $scope.confirmDelete = function(ev, build, platform, index) {
        var confirm = $mdDialog.confirm()
            .title('Are you sure you want to remove this build?')
            .textContent('Build will be removed permanently from the repository.')
            .ariaLabel('remove build')
            .targetEvent(ev)
            .cancel('Cancel')
            .ok('OK');
        $mdDialog.show(confirm).then(function() {
            $scope.deleteBuild(build, platform, index);
        }, function() {
        });
    };

    $scope.deleteBuild = function(build, platform, index){
        var removingBuildData = {
            applicationName:    $scope.app_name,
            platform:           platform,
            applicationVersion: build.app_version,
            buildNumber:        build.build_number
        };
        dfxDeployment.deleteBuild(removingBuildData).then(function(data){
            $scope.builds[platform].splice(index, 1);
            $scope.getAppBuilds(platform);
            $scope.description = {value : ""};
            dfxMessaging.showMessage('Build data has been successfully deleted');
            if(build.is_deployed){
                $scope.deleteDeployedBuild(build.app_version + "." + build.build_number);
            }
        });
    };

    $scope.showBuildLog = function(build, platform, buildindex){
        if(build.status !== 'pending'){
            if(build.displayLog){
                build.displayLog = false;
            }else{
                var body = {
                    tenant:             $scope.tenant_id,
                    applicationName:    $scope.app_name,
                    platform:           platform,
                    applicationVersion: build.app_version,
                    buildNumber:        build.build_number,
                    file:               $scope.compiler.logFile
                };
                dfxDeployment.getLogFile(body).then(function(data){
                    var infoLines = data.match(/[^\r\n]+/g);
                    infoLines.forEach(function (infoLine, index) {
                        if (index > 0) {
                            var infoDetails    = infoLine.split('%%');
                            $scope.builds[platform][buildindex].logs.push({level: infoDetails[0], text: infoDetails[2], appid: $scope.app_name}) ;
                        }
                    });
                });
                build.displayLog = true;
            }
        }
    };

    $scope.deleteDeployedBuild = function(build_version){
        dfxDeployment.deleteDeployedBuild($scope.app_name, build_version).then(function(){
            dfxMessaging.showMessage('Build data has been successfully deleted from deployment server');
        }, function(){
            dfxMessaging.showWarning('Build data has not been deleted from deployment server') ;
        });
    };



    $scope.getDeployedQRCode = function(build) {
        dfxDeployment.getMobileApp(build).then( function(response) {
            console.log(response.data.referrer);
        });
    };

    $scope.navToCloud = function(ev) {
        $location.path( "/platform/cloud" );
    };
}]);

dfxStudioApp.controller("dfx_studio_view_controller", [ '$scope', '$routeParams', '$mdDialog', '$location', '$window', 'dfxMessaging', 'dfxViews', function($scope, $routeParams, $mdDialog, $location, $window, dfxMessaging, dfxViews) {
    $scope.app_name = $routeParams.appname;
    $scope.view_name = $routeParams.viewname;
    $scope.view_platform = $routeParams.platform;
    $scope.view = {};

    dfxViews.getOne( $scope, $scope.app_name, $scope.view_name, $scope.view_platform ).then( function(data) {
        $scope.view = data;
    });

    dfxViews.getCategories( $scope, $scope.app_name, $scope.view_platform ).then(function( data ) {
        $scope.app_categories = data.data[$scope.view_platform];
    });

    $scope.openViewDesigner = function() {
        window.localStorage.removeItem('pagePreviewName');
        $window.open( '/studio/widget/' + $scope.view_platform + '/' + $scope.app_name + '/' + $scope.view_name + '/index.html', '_blank' );
    };

    $scope.update = function() {
        dfxViews.update( $scope, $scope.view ).then(function( data ) {
            dfxMessaging.showMessage(data.data);
            $scope.getAll();
        });
    }

    $scope.delete = function(ev) {
        var confirm = $mdDialog.confirm()
            .title('Are you sure you want delete this view?')
            .textContent('The view will be removed permanently from the repository.')
            .ariaLabel('delete view')
            .targetEvent(ev)
            .cancel('Cancel')
            .ok('OK');
        $mdDialog.show(confirm).then(function() {
            dfxViews.delete( $scope, $scope.view ).then( function(data) {
                dfxMessaging.showMessage( 'View has been successfully deleted' );
                $scope.getAll();
                $location.path('/home');
            });
        }, function() {
        });
    };

    $scope.cancel = function( ev ) {
        var confirm = $mdDialog.confirm()
            .title('Are you sure to exit the View Editor?')
            .textContent('All changes will be lost.')
            .ariaLabel('leave Page')
            .targetEvent(ev)
            .cancel('Cancel')
            .ok('OK');
        $mdDialog.show(confirm).then(function() {
            $scope.getAll();
            $location.path('/home');
        }, function() {
        });
    };

}]);

dfxStudioApp.controller("dfx_studio_view_create_controller", [ '$scope', '$routeParams', '$mdDialog', '$location', '$window', 'dfxMessaging', 'dfxViews', 'dfxApplications', function($scope, $routeParams, $mdDialog, $location, $window, dfxMessaging, dfxViews, dfxApplications) {
    $scope.view = {
        "name": "NewView",
        "application": $routeParams.appname,
        "description": "",
        "wtype": "visual",
        "platform": $routeParams.platform,
        "category": "Default",
        "src": JSON.stringify({
            "properties": {},
            "definition": {
                "default": [
                    {
                        id: Math.floor(Math.random() * 1000),
                        type: "panel",
                        attributes: {
                            "name": { "value": "pnlPanel1", "status": "overridden" }
                        },
                        children:   []
                    }
                ]
            }
        }),
        "src_styles": ""
    };

    var sufix = '';
    for(var i = 0;  i < 3; i++) {
        sufix += Math.floor(Math.random() * 10);
    }
    $scope.view.name += sufix;

    dfxApplications.getUserInfo().then(function(data){
        $scope.view.owner = data.login ;
    });

    if ( $routeParams.categoryname ) {
        $scope.view.category = $routeParams.categoryname;
    }

    dfxViews.getCategories( $scope, $routeParams.appname, $routeParams.platform ).then(function( data ) {
        $scope.app_categories = data.data[$scope.view.platform];
    });

    $scope.save = function() {
        if ( /^[-a-zA-Z0-9_]+$/.test( $scope.view.name ) ) {
            dfxViews.create( $scope, $scope.view ).then( function(data) {
                dfxMessaging.showMessage('View has been successfully created');
                $scope.getAll();
                $location.path('/view/update/'+ $scope.view.application + '/' + $scope.view.platform + '/' + $scope.view.name);
            }, function( data ) {
                dfxMessaging.showWarning( data.data.error.message );
            });
        } else {
            dfxMessaging.showWarning('Not valid view name');
            $("#view-name").focus();
        }
    };

    $scope.cancel = function(ev) {
        var confirm = $mdDialog.confirm()
            .title('Are you sure you want cancel?')
            .textContent('The view won\'t be created.')
            .ariaLabel('cancel add view')
            .targetEvent(ev)
            .cancel('Cancel')
            .ok('OK');
        $mdDialog.show(confirm).then(function() {
            $scope.getAll();
            $location.path('/home');
        }, function() {
        });
    };

}]);

dfxStudioApp.controller("dfx_studio_view_category_controller", [ '$scope', '$routeParams', '$location', '$mdSidenav', '$mdDialog', '$timeout', 'dfxMessaging', 'dfxApplications', 'dfxAuthProviders', 'dfxViews', function( $scope, $routeParams, $location, $mdSidenav, $mdDialog, $timeout, dfxMessaging, dfxApplications, dfxAuthProviders, dfxViews) {
    $scope.app_name = $routeParams.app_name;
    $scope.view_platform = $routeParams.platform;

    dfxViews.getCategories( $scope, $scope.app_name, $scope.view_platform ).then(function( data ) {
        $scope.app_categories = [];
        for ( var i = 0; i < data.data[$scope.view_platform].length; i++ ) {
            $scope.app_categories.push(data.data[$scope.view_platform][i]);
        }
    });

    var bodyHeight = parseFloat($("body").css('height'));
    $timeout(function() {
        var scopeSourceTable = document.getElementById('scope-source-table');
        $(scopeSourceTable).css('max-height', bodyHeight-260);
    }, 0);

    $scope.addCategoryBtn = function() {
        $scope.scopeCategory = {};
        $scope.categoryMode = 'addCategory';
        var sideNavInstance = $mdSidenav('side_nav_view_category');
        sideNavInstance.toggle();
    }

    $scope.createCategory = function() {
        var regexp = /([a-z0-9_])(\w*)/gi;
        res = regexp.exec( $scope.scopeCategory.name );
        if ( res && $scope.scopeCategory.name && $scope.scopeCategory.name !== '' ) {
            dfxViews.createCategory( $scope, $scope.scopeCategory.name, $scope.app_name, $scope.view_platform ).then(function( data ) {
                if ( data.status && data.status === 200 && data.data.data !== 'Current category name already exists' ) {
                    dfxMessaging.showMessage(data.data.data);
                    $scope.app_categories = [];
                    dfxViews.getCategories( $scope, $scope.app_name, $scope.view_platform ).then(function( data ) {
                        for ( var i = 0; i < data.data[$scope.view_platform].length; i++ ) {
                            $scope.app_categories.push(data.data[$scope.view_platform][i]);
                        }
                        $scope.getAll();
                    });
                    var sideNavInstance = $mdSidenav('side_nav_view_category');
                    sideNavInstance.toggle();
                } else {
                    dfxMessaging.showWarning(data.data.data);
                }
            });
        } else {
            dfxMessaging.showWarning('Not valid category name');
        }
    }

    $scope.editCategoryBtn = function( category ) {
        $scope.categoryMode = 'editCategory';
        $scope.scopeCategory = category;
        $scope.toEdit = {};
        var sideNavInstance = $mdSidenav('side_nav_view_category');
        sideNavInstance.toggle();
    }

    $scope.editCategory = function( edited ) {
        var newName = edited.name;
        var regexp = /([a-z0-9_])(\w*)/gi;
        res = regexp.exec( newName );
        if ( res && newName && newName !== $scope.scopeCategory.name && newName !== '' ) {
            dfxViews.editCategory( $scope, $scope.scopeCategory.name, newName, $scope.app_name, $scope.view_platform ).then(function( data ) {
                if ( data.data.data !== 'Current category name already exists' ) {
                    dfxMessaging.showMessage(data.data.data);
                    $scope.app_categories = [];
                    dfxViews.getCategories( $scope, $scope.app_name, $scope.view_platform ).then(function( data ) {
                        for ( var i = 0; i < data.data[$scope.view_platform].length; i++ ) {
                            $scope.app_categories.push(data.data[$scope.view_platform][i]);
                        }
                        $scope.getAll();
                    });
                    var sideNavInstance = $mdSidenav('side_nav_view_category');
                    sideNavInstance.toggle();
                } else {
                    dfxMessaging.showWarning(data.data.data);
                }
            });
        } else if ( newName === $scope.scopeCategory.name ) {
            dfxMessaging.showWarning('Category with such name already exists');

        } else {
            dfxMessaging.showWarning('Not valid category name');
        }
    }

    $scope.deleteCategory = function( category_name ) {
        dfxViews.removeCategory( $scope, category_name, $scope.app_name, $scope.view_platform ).then(function( data ) {
            if ( data.status && data.status === 200 ) {
                dfxMessaging.showMessage(data.data.data);
                $scope.app_categories = [];
                dfxViews.getCategories( $scope, $scope.app_name, $scope.view_platform ).then(function( data ) {
                    for ( var i = 0; i < data.data[$scope.view_platform].length; i++ ) {
                        $scope.app_categories.push(data.data[$scope.view_platform][i]);
                    }
                    $scope.getAll();
                });
            } else {
                dfxMessaging.showWarning(data.data.data);
            }
        });
    }

    $scope.confirmDelete = function( ev, category_name ) {
        var confirm = $mdDialog.confirm()
            .title('Are you sure you want to remove this category?')
            .textContent('Category will be removed from the repository.')
            .ariaLabel('remove service')
            .targetEvent(ev)
            .cancel('Cancel')
            .ok('OK');
        $mdDialog.show(confirm).then(function() {
            $scope.deleteCategory( category_name );
        }, function() {
        });
    };

    $scope.closeSidenav = function() {
        var sideNavInstance = $mdSidenav('side_nav_view_category');
        sideNavInstance.toggle();
    }
}]);

dfxStudioApp.controller("dfx_studio_page_controller", [ '$scope', '$routeParams', '$mdDialog', '$location', '$window', 'dfxMessaging', 'dfxPages', function($scope, $routeParams, $mdDialog, $location, $window, dfxMessaging, dfxPages) {
    $scope.app_name = $routeParams.appname;
    $scope.page_platform = $routeParams.platform;
    $scope.page_name = $routeParams.pagename;
    $scope.page = {};

    dfxPages.getCategories( $scope, $routeParams.appname, $scope.page_platform ).then(function( data ) {
        $scope.app_categories = data.data[$scope.page_platform];
    });

    dfxPages.getOne( $scope, $scope.app_name, $scope.page_name, $scope.page_platform ).then( function(data) {
        $scope.page = data;
    });

    $scope.openPageDesigner = function() {
        $window.open( '/studio/screen/' + $scope.app_name + '/' + $scope.page_platform + '/' + $scope.page_name + '/index.html', '_blank' );
    };

    $scope.update = function() {
        dfxPages.update( $scope, $scope.page ).then( function(data) {
            dfxMessaging.showMessage(data.data);
            $scope.getAll();
        });
    }

    $scope.delete = function(ev) {
        var confirm = $mdDialog.confirm()
            .title('Are you sure you want delete this page?')
            .textContent('The page will be removed permanently from the repository.')
            .ariaLabel('delete page')
            .targetEvent(ev)
            .cancel('Cancel')
            .ok('OK');
        $mdDialog.show(confirm).then(function() {
            dfxPages.delete( $scope, $scope.page ).then( function(data) {
                dfxMessaging.showMessage( 'Page has been successfully deleted' );
                $scope.getAll();
                $location.path('/home');
            });
        }, function() {
        });
    };

    $scope.cancel = function( ev ) {
        var confirm = $mdDialog.confirm()
            .title('Are you sure to exit the Page Editor?')
            .textContent('All changes will be lost.')
            .ariaLabel('leave Page')
            .targetEvent(ev)
            .cancel('Cancel')
            .ok('OK');
        $mdDialog.show(confirm).then(function() {
            $scope.getAll();
            $location.path('/home');
        }, function() {
        });
    };

}]);

dfxStudioApp.controller("dfx_studio_page_create_controller", [ '$scope', '$routeParams', '$mdDialog', '$location', '$window', 'dfxMessaging', 'dfxPages', function($scope, $routeParams, $mdDialog, $location, $window, dfxMessaging, dfxPages) {
    $scope.page = {
        "name": "NewPage",
        "application": $routeParams.appname,
        "title": "",
        "autoHeight": false,
        "visibility": "visible",
        "platform" : "web",
        "template": "basic",
        "category": "Default",
        "script": "dfxAppRuntime.controller('dfx_page_controller', [ '$scope', '$rootScope', function( $scope, $rootScope) {\n\t// Insert your code here\n}]);",
        "layout": {
            "rows" : [ { "height" : "100", "columns" : [ {"width" : "100", "views" : []} ] } ]
        }
    };

    var sufix = '';
    for(var i = 0;  i < 3; i++) {
        sufix += Math.floor(Math.random() * 10);
    }
    $scope.page.name += sufix;

    if ( $routeParams.categoryname ) {
        $scope.page.category = $routeParams.categoryname;
    }

    if ( $routeParams.platform ) {
        $scope.page.platform = $routeParams.platform;
    }

    dfxPages.getCategories( $scope, $routeParams.appname, $scope.page.platform ).then(function( data ) {
        $scope.app_categories = data.data[$scope.page.platform];
    });

    //if (!$scope.platform) {
    //    $scope.page.platform = 'web';
    //    $scope.platformDisabled = false;
    //} else {
    //    $scope.page.platform = $scope.platform;
    //    $scope.platformDisabled = true;
    //}

    $scope.save = function() {
        if ( /^[-a-zA-Z0-9_]+$/.test( $scope.page.name ) ) {
            switch($scope.page.platform) {
                case 'Desktop' : $scope.page.platform = 'web'; break;
                case 'Tablet' : $scope.page.platform = 'tablet'; break;
                case 'Mobile' : $scope.page.platform = 'mobile'; break;
            }
            dfxPages.create( $scope, $scope.page ).then( function(data) {
                dfxMessaging.showMessage('Page has been successfully created');
                $scope.getAll();
                $location.path('/page/update/'+ $scope.page.application + '/' + $scope.page.platform + '/' + $scope.page.name);
            }, function( data ) {
                dfxMessaging.showWarning( data.data.error.message );
            });
        } else {
            dfxMessaging.showWarning('Not valid page name');
            $("#page-name").focus();
        }
    };

    $scope.cancel = function(ev) {
        var confirm = $mdDialog.confirm()
            .title('Are you sure you want cancel?')
            .textContent('The page won\'t be created.')
            .ariaLabel('cancel add page')
            .targetEvent(ev)
            .cancel('Cancel')
            .ok('OK');
        $mdDialog.show(confirm).then(function() {
            $scope.getAll();
            $location.path('/home');
        }, function() {
        });
    };

}]);

dfxStudioApp.controller("dfx_studio_page_category_controller", [ '$scope', '$routeParams', '$location', '$mdSidenav', '$mdDialog', '$timeout', 'dfxMessaging', 'dfxApplications', 'dfxAuthProviders', 'dfxPages', function( $scope, $routeParams, $location, $mdSidenav, $mdDialog, $timeout, dfxMessaging, dfxApplications, dfxAuthProviders, dfxPages) {
    $scope.app_name = $routeParams.app_name;
    $scope.page_platform = $routeParams.platform;

    dfxPages.getCategories( $scope, $scope.app_name, $scope.page_platform ).then(function( data ) {
        $scope.app_categories = [];
        for ( var i = 0; i < data.data[$scope.page_platform].length; i++ ) {
            $scope.app_categories.push(data.data[$scope.page_platform][i]);
        }
    });

    var bodyHeight = parseFloat($("body").css('height'));
    $timeout(function() {
        var scopeSourceTable = document.getElementById('scope-source-table');
        $(scopeSourceTable).css('max-height', bodyHeight-260);
    }, 0);

    $scope.addCategoryBtn = function() {
        $scope.scopeCategory = {};
        $scope.categoryMode = 'addCategory';
        var sideNavInstance = $mdSidenav('side_nav_page_category');
        sideNavInstance.toggle();
    }

    $scope.createCategory = function() {
        var regexp = /([a-z0-9_])(\w*)/gi;
        res = regexp.exec( $scope.scopeCategory.name );
        if ( res && $scope.scopeCategory.name && $scope.scopeCategory.name !== '' ) {
            dfxPages.createCategory( $scope, $scope.scopeCategory.name, $scope.app_name, $scope.page_platform ).then(function( data ) {
                if ( data.status && data.status === 200 && data.data.data !== 'Screens category with same name already exists' ) {
                    dfxMessaging.showMessage(data.data.data);
                    $scope.app_categories = [];
                    dfxPages.getCategories( $scope, $scope.app_name, $scope.page_platform ).then(function( data ) {
                        for ( var i = 0; i < data.data[$scope.page_platform].length; i++ ) {
                            $scope.app_categories.push(data.data[$scope.page_platform][i]);
                        }
                        $scope.getAll();
                    });
                    var sideNavInstance = $mdSidenav('side_nav_page_category');
                    sideNavInstance.toggle();
                } else {
                    dfxMessaging.showWarning('Current category name already exists');
                }
            });
        } else {
            dfxMessaging.showWarning('Not valid category name');
        }
    }

    $scope.editCategoryBtn = function( category ) {
        $scope.categoryMode = 'editCategory';
        $scope.scopeCategory = category;
        $scope.toEdit = {};
        var sideNavInstance = $mdSidenav('side_nav_page_category');
        sideNavInstance.toggle();
    }

    $scope.editCategory = function( edited ) {
        var newName = edited.name;
        var regexp = /([a-z0-9_])(\w*)/gi;
        res = regexp.exec( newName );
        if ( res && newName && newName !== $scope.scopeCategory.name && newName !== '' ) {
            dfxPages.editCategory( $scope, $scope.scopeCategory.name, newName, $scope.app_name, $scope.cat_platform ).then(function( data ) {
                if ( data.data.data !== 'Current category name already exists' ) {
                    dfxMessaging.showMessage(data.data.data);
                    $scope.app_categories = [];
                    dfxPages.getCategories( $scope, $scope.app_name, $scope.page_platform ).then(function( data ) {
                        for ( var i = 0; i < data.data[$scope.page_platform].length; i++ ) {
                            $scope.app_categories.push(data.data[$scope.page_platform][i]);
                        }
                        $scope.getAll();
                    });
                    var sideNavInstance = $mdSidenav('side_nav_page_category');
                    sideNavInstance.toggle();
                } else {
                    dfxMessaging.showWarning(data.data.data);
                }
            });
        } else if ( newName === $scope.scopeCategory.name ) {
            dfxMessaging.showWarning('Category with such name already exists');

        } else {
            dfxMessaging.showWarning('Not valid category name');
        }
    }

    $scope.deleteCategory = function( category_name ) {
        dfxPages.removeCategory( $scope, category_name, $scope.app_name, $scope.page_platform ).then(function( data ) {
            if ( data.status && data.status === 200 ) {
                dfxMessaging.showMessage(data.data.data);
                $scope.app_categories = [];
                dfxPages.getCategories( $scope, $scope.app_name, $scope.page_platform ).then(function( data ) {
                    for ( var i = 0; i < data.data[$scope.page_platform].length; i++ ) {
                        $scope.app_categories.push(data.data[$scope.page_platform][i]);
                    }
                    $scope.getAll();
                });
            } else {
                dfxMessaging.showWarning(data.data.data);
            }
        });
    }

    $scope.confirmDelete = function( ev, category_name ) {
        var confirm = $mdDialog.confirm()
            .title('Are you sure you want to remove this category?')
            .textContent('Category will be removed from the repository.')
            .ariaLabel('remove service')
            .targetEvent(ev)
            .cancel('Cancel')
            .ok('OK');
        $mdDialog.show(confirm).then(function() {
            $scope.deleteCategory( category_name );
        }, function() {
        });
    };

    $scope.closeSidenav = function() {
        var sideNavInstance = $mdSidenav('side_nav_page_category');
        sideNavInstance.toggle();
    }
}]);

dfxStudioApp.controller("dfx_studio_settings_controller", [ '$scope', function($scope) {

}]);

dfxStudioApp.controller("dfx_studio_app_roles_controller", [ '$scope', '$routeParams', '$mdDialog', '$mdSidenav', 'dfxAppRoles', 'dfxMessaging',
    function($scope, $routeParams, $mdDialog, $mdSidenav, dfxAppRoles, dfxMessaging)
{
    var parentScope = $scope.$parent.$parent;
    parentScope.app_roles = $scope;

    $scope.app_name = $routeParams.appname;

    dfxAppRoles.getAll($scope, $scope.app_name).then(function (data) {
        $scope.app_roles = data;
    });

    $scope.initNewRole = function() {
        dfxAppRoles.getAllRights($scope, $scope.app_name).then(function (rights) {
            $scope.operation = 'create';
            if ($scope.app_users) $scope.app_users.operation = '';

            $scope.new_app_role = {'name': '', 'description': ''};
            $scope.all_rights = rights;

            var sideNavInstance = $mdSidenav('side_nav_left');
            sideNavInstance.toggle();
        });
    };

    $scope.create = function() {
        var rights = $scope.all_rights.map(function(right) {
            return right.isChecked
                ? 'DATAQUERY::' + right.name
                : null;
        }).filter(function (right) {
            return right ? true : false;
        });

        var to_update = {
            name:        $scope.new_app_role.name,
            app_name:    $scope.app_name,
            rights:      rights,
            description: $scope.new_app_role.description
        };

        dfxAppRoles.create($scope, to_update).then(function success() {
            var sideNavInstance = $mdSidenav('side_nav_left');
            $scope.app_roles.push($scope.new_app_role);
            sideNavInstance.toggle();

            //update role because rights are not added when creating role
            dfxAppRoles.update($scope, to_update).then(function () {
                dfxMessaging.showMessage('Role has been successfully created');
            });
        }, function fail() {
            dfxMessaging.showWarning('This role already exists');
        });
    };

    $scope.edit = function(role_name) {
        dfxAppRoles.edit($scope, $scope.app_name, role_name).then(function (role) {
            $scope.operation = 'update';
            if ($scope.app_users) $scope.app_users.operation = '';

            $scope.current_app_role = role;
            $scope.all_rights = role.all_dataqueries.map(function(dataquery) {
                return role.rights.data.indexOf('DATAQUERY::' + dataquery.name) > -1
                    ? {'isChecked': true, 'name': dataquery.name}
                    : {'isChecked': false, 'name': dataquery.name};
            });

            var sideNavInstance = $mdSidenav('side_nav_left');
            sideNavInstance.toggle();
        });
    };

    $scope.update = function() {
        var rights = $scope.all_rights.map(function(right) {
            return right.isChecked
                ? 'DATAQUERY::' + right.name
                : null;
        }).filter(function (right) {
            return right ? true : false;
        });

        var to_update = {
            name:        $scope.current_app_role.data.name,
            app_name:    $scope.app_name,
            rights:      rights,
            description: $scope.current_app_role.data.description
        };

        dfxAppRoles.update($scope, to_update).then(function () {
            for (var i = 0; i < $scope.app_roles.length; i++) {
                if ($scope.app_roles[i].name === $scope.current_app_role.data.name) {
                    $scope.app_roles[i] = $scope.current_app_role.data;
                    break;
                }
            }
            var sideNavInstance = $mdSidenav('side_nav_left');
            sideNavInstance.toggle();
            dfxMessaging.showMessage('Role has been successfully updated');
        });
    };

    $scope.delete = function(role_name) {
        dfxAppRoles.delete($scope, $scope.app_name, role_name).then(function () {
            for (var i = 0; i < $scope.app_roles.length; i++) {
                if ($scope.app_roles[i].name === role_name){
                    $scope.app_roles.splice(i, 1);
                    break;
                }
            }
        });
    };

    $scope.closeSidenav = function(){
        var sideNavInstance = $mdSidenav('side_nav_left');
        sideNavInstance.toggle();
    };

    $scope.confirmDelete = function(ev, role) {
        var confirm = $mdDialog.confirm()
            .title('Are you sure you want to remove this role?')
            .textContent('Role will be removed from repository.')
            .ariaLabel('remove role')
            .targetEvent(ev)
            .cancel('Cancel')
            .ok('OK');
        $mdDialog.show(confirm).then(function() {
            $scope.delete(role.name);
        }, function() {
        });
    };
}]);

dfxStudioApp.controller("dfx_studio_app_users_controller", [ '$scope', '$compile', '$routeParams', '$mdSidenav', '$mdDialog', 'dfxMessaging', 'dfxAppUsers', 'dfxUserDefinition',
    function($scope, $compile, $routeParams, $mdSidenav, $mdDialog, dfxMessaging, dfxAppUsers, dfxUserDefinition)
{
    var parentScope = $scope.$parent.$parent;
    parentScope.app_users = $scope;

    $scope.app_name = $routeParams.appname;

    dfxAppUsers.getAll( $scope, $scope.app_name ).then(function ( data ) {
        $scope.users = data;
    });

    $scope.changePass = function() {
        $scope.current_app_user.pass_changed = true;
    };

    $scope.showPassMessage = function(user) {
        user.show_pass_message = true;
    };

    $scope.initNewUser = function() {
        dfxAppUsers.getAllRoles($scope, $scope.app_name).then(function (roles) {
            $scope.operation = 'create';
            if ($scope.app_roles) $scope.app_roles.operation = '';

            $scope.new_app_user = {'login': '', 'firstName': '', 'lastName': '', 'email': '', 'new_pass': ''};
            $scope.new_app_user.all_roles = roles;

            // check guest role by default
            $scope.new_app_user.default_role_updated = 'guest';
            $scope.app_users.new_app_user.roles_updated = {'guest': true};

            var sideNavInstance = $mdSidenav('side_nav_left');
            sideNavInstance.toggle().then(function () {
                // properties from user definition
                dfxUserDefinition.getUserDefinition($scope, $scope.app_name).then(function (user_def) {
                    $scope.user_definition = user_def;
                    addTree($scope.user_definition);
                });
            });
        });
    };

    $scope.create = function() {
        var to_create = {
            login:     $scope.new_app_user.login,
            app_name:  $scope.app_name,
            firstName: $scope.new_app_user.firstName,
            lastName:  $scope.new_app_user.lastName,
            email:     $scope.new_app_user.email,
            new_pass:  $scope.new_app_user.new_pass,
            roles:     {
                default: $scope.new_app_user.default_role_updated,
                list:    []
            }
        };

        // collect user roles
        if ($scope.app_users.new_app_user.roles_updated) {
            var props = Object.keys($scope.app_users.new_app_user.roles_updated);
            for (var i = 0; i < props.length; i++) {
                if ($scope.app_users.new_app_user.roles_updated[ props[i] ] == true) {
                    to_create.roles.list.push(props[i]);
                }
            }
        }

        var additionalProperties = {};
        collectAdditionalProperties($scope.user_definition, additionalProperties);
        to_create.properties = additionalProperties;

        dfxAppUsers.create($scope, to_create).then(function (user) {
            // update created user to store additional properties - to avoid re-write engine
            dfxAppUsers.update($scope, to_create).then(function () {
                $scope.users.push({
                    credentials: {login: user.login},
                    name: {first: user.firstName, last: user.lastName}
                });
                var sideNavInstance = $mdSidenav('side_nav_left');
                sideNavInstance.toggle();
                dfxMessaging.showMessage('User has been successfully created');
            });
        }, function fail(response) {
            dfxMessaging.showWarning(response.data.data);
        });
    };

    $scope.edit = function(user_login) {
        dfxAppUsers.edit($scope, $scope.app_name, user_login).then(function (user) {
            $scope.operation = 'update';
            if ($scope.app_roles) $scope.app_roles.operation = '';

            $scope.current_app_user = user;
            $scope.current_app_user.roles_updated = {};

            $scope.current_app_user.pass_changed = false;
            $scope.current_app_user.new_pass = "newpass";
            $scope.current_app_user.repeat_pass = "";
            $scope.current_app_user.pass_matching = false;
            $scope.current_app_user.show_pass_message = false;

            // show which roles are checked (checkboxes) and which is main (radio)
            $scope.current_app_user.default_role_updated = $scope.current_app_user.roles.default;

            for (var i = 0; i < $scope.current_app_user.roles.list.length; i++) {
                var nextCheckedRole = $scope.current_app_user.roles.list[i];
                $scope.app_users.current_app_user.roles_updated[nextCheckedRole] = true;
            }

            var sideNavInstance = $mdSidenav('side_nav_left');
            sideNavInstance.toggle().then(function () {
                // properties from user definition
                $scope.user_definition = user.user_def;
                addTree($scope.user_definition);
            });
        });
    };

    $scope.update = function() {
        var to_update = {
            login:     $scope.current_app_user.login,
            app_name:  $scope.app_name,
            firstName: $scope.current_app_user.firstName,
            lastName:  $scope.current_app_user.lastName,
            email:     $scope.current_app_user.email,
            roles:     {
                default: $scope.current_app_user.default_role_updated,
                list:    []
            }
        };

        // collect user roles
        if ($scope.app_users.current_app_user.roles_updated) {
            var props = Object.keys($scope.app_users.current_app_user.roles_updated);
            for (var i = 0; i < props.length; i++) {
                if ($scope.app_users.current_app_user.roles_updated[ props[i] ] == true) {
                    to_update.roles.list.push(props[i]);
                }
            }
        }

        var additionalProperties = {};
        collectAdditionalProperties($scope.user_definition, additionalProperties);
        to_update.properties = additionalProperties;

        dfxAppUsers.update($scope, to_update, $scope.current_app_user.new_pass, $scope.current_app_user.pass_changed).then(function () {
            for (var i = 0; i < $scope.users.length; i++) {
                if ($scope.users[i].credentials.login === $scope.current_app_user.login) {
                    $scope.users[i].name.first = $scope.current_app_user.firstName;
                    $scope.users[i].name.last = $scope.current_app_user.lastName;
                    break;
                }
            }
            var sideNavInstance = $mdSidenav('side_nav_left');
            sideNavInstance.toggle();
            dfxMessaging.showMessage('User has been successfully updated');
        });
    };

    $scope.delete = function(user_login) {
        dfxAppUsers.delete($scope, $scope.app_name, user_login).then(function () {
            for (var i = 0; i < $scope.users.length; i++) {
                if ($scope.users[i].credentials.login === user_login){
                    $scope.users.splice(i, 1);
                    break;
                }
            }
        });
    };

    $scope.confirmDelete = function(ev, user_login) {
        var confirm = $mdDialog.confirm()
            .title('Are you sure you want to remove this user?')
            .textContent('User will be removed from repository.')
            .ariaLabel('remove user')
            .targetEvent(ev)
            .cancel('Cancel')
            .ok('OK');
        $mdDialog.show(confirm).then(function() {
            $scope.delete(user_login);
        }, function() {
        });
    };

    $scope.closeSidenav = function(){
        var sideNavInstance = $mdSidenav('side_nav_left');
        sideNavInstance.toggle();
    };

    $scope.$watch("new_app_user.repeat_pass", function(newValue) {
        if (newValue) {
            if (newValue===$scope.new_app_user.new_pass) {
                $scope.new_app_user.pass_matching = true;
            }else{
                $scope.new_app_user.pass_matching = false;
            }
        }
    });

    $scope.$watch("new_app_user.default_role_updated", function(newValue) {
        if (newValue) {
            $scope.app_users.new_app_user.roles_updated = $scope.app_users.new_app_user.roles_updated || {};
            $scope.app_users.new_app_user.role_updated_disabled =  $scope.app_users.new_app_user.role_updated_disabled || {};

            $scope.app_users.new_app_user.roles_updated[newValue] = true;

            var props = Object.keys($scope.app_users.new_app_user.roles_updated);
            for (var i = 0; i < props.length; i++) {
                if (newValue == props[i]) {
                    $scope.app_users.new_app_user.role_updated_disabled[ props[i] ] = true;
                } else {
                    $scope.app_users.new_app_user.role_updated_disabled[ props[i] ] = false;
                }
            }
        }
    });

    $scope.$watch("current_app_user.repeat_pass", function(newValue) {
        if (newValue) {
            if (newValue===$scope.current_app_user.new_pass) {
                $scope.current_app_user.pass_matching = true;
            }else{
                $scope.current_app_user.pass_matching = false;
            }
        }
    });

    $scope.$watch("current_app_user.default_role_updated", function(newValue) {
        if (newValue) {
            $scope.app_users.current_app_user.roles_updated = $scope.app_users.current_app_user.roles_updated || {};
            $scope.app_users.current_app_user.role_updated_disabled =  $scope.app_users.current_app_user.role_updated_disabled || {};

            $scope.app_users.current_app_user.roles_updated[newValue] = true;

            var props = Object.keys($scope.app_users.current_app_user.roles_updated);
            for (var i = 0; i < props.length; i++) {
                if (newValue == props[i]) {
                    $scope.app_users.current_app_user.role_updated_disabled[ props[i] ] = true;
                } else {
                    $scope.app_users.current_app_user.role_updated_disabled[ props[i] ] = false;
                }
            }
        }
    });

    var buildTree = function(data, path, is_root_level) {
        var sub_tree = '<ul class="dfx-studio-explorer-treeview-content">';

        var props = Object.keys(data);
        for (var i = 0; i < props.length; i++) {
            if (data[ props[i] ].mandatory == 'true') continue;

            $scope.isThereOptionalProps = true;

            sub_tree += '<li>';

            var current_path = path + '.' + props[i];

            if (data[ props[i] ].type == 'subdocument') {
                sub_tree += '<input class="dfx-studio-explorer-treeview-button" type="checkbox" />' +
                    '<label ng-click="editUserDefinitionPropsNode(' + current_path + ', \'' + props[i] + '\',' + is_root_level + ', \'' + current_path + '\')">' + props[i] + '</label>';

                sub_tree += buildTree(data[ props[i]].structure, current_path + '.structure', false);
            } else {
                sub_tree += '<label ng-click="editUserDefinitionPropsNode(' + current_path + ', \'' + props[i] + '\',' + is_root_level + ', \'' + current_path + '\')">' + props[i] + '</label>';
            }

            sub_tree += '</li>';
        }
        sub_tree += '</ul>';

        return sub_tree;
    };

    var addTree = function(data) {
        $scope.isThereOptionalProps = false;
        var tree = buildTree(data, 'user_definition', true);

        var element = angular.element(tree);
        $compile(element.contents())($scope);
        $("#dfx_studio_user_properties_tree").html(element);
    };

    $scope.editUserDefinitionPropsNode = function(prop, prop_name, is_root_level, path_to_prop) {
        prop.defaults = getCurrentAppUserNodeValue(path_to_prop) || prop.defaults;

        $scope.user_definition.current_node = prop;
        $scope.user_definition.current_node_name = prop_name;
        $scope.user_definition.current_node_path = path_to_prop;
        $scope.user_definition.current_node_root_level = is_root_level;
    };

    var getCurrentAppUserNodeValue = function(user_def_path_to_prop) {
        var currentAppUserNodeValue = $scope.$parent.$parent.app_users.current_app_user || $scope.$parent.$parent.app_users.new_app_user;

        var splitPath = user_def_path_to_prop.split('.');
        for (var i = 0; i < splitPath.length; i++) {
            if (splitPath[i] == 'user_definition' || splitPath[i] == 'structure') continue;

            currentAppUserNodeValue = currentAppUserNodeValue ? currentAppUserNodeValue[ splitPath[i] ] : null;
        }
        return currentAppUserNodeValue;
    };

    function multiIndex(obj, is) {  // obj,['1','2','3'] -> ((obj['1'])['2'])['3']
        return is.length ? multiIndex(obj[is[0]], is.slice(1)) : obj
    }

    $scope.$watch("user_definition.current_node.defaults", function(newValue) {
        if (newValue) {
            var currentAppUser = $scope.$parent.$parent.app_users.current_app_user || $scope.$parent.$parent.app_users.new_app_user;

            var splitPath = $scope.user_definition.current_node_path.split('.').filter(function (elem) {
                return elem != 'user_definition' && elem != 'structure';
            });
            splitPath.splice(-1, 1);
            var currentAppUserNode = multiIndex(currentAppUser, splitPath);
            if (currentAppUserNode) currentAppUserNode[ $scope.user_definition.current_node_name ] = newValue;
        }
    });

    var collectAdditionalProperties = function(user_definition_data, app_user_data) {
        var props = Object.keys(user_definition_data);
        for (var i = 0; i < props.length; i++) {
            if (props[i].indexOf('current_node') == 0) continue;
            if (user_definition_data[ props[i] ].mandatory == 'true') continue;

            if (user_definition_data[ props[i] ].type == 'subdocument') {
                app_user_data[ props[i] ] = {};
                collectAdditionalProperties(user_definition_data[ props[i] ].structure, app_user_data[ props[i] ]);
            } else {
                app_user_data[ props[i] ] = user_definition_data[ props[i]].defaults;
            }
        }
    };
    //TODO:
    //1) drop-downs when editing user props for boolean etc (check if it's saved as "false" or false)
    //2) assign to variable as asked? already assigned normally
}]);

dfxStudioApp.controller("dfx_studio_user_definition_controller", [ '$scope', '$routeParams', '$mdDialog', '$compile', 'dfxMessaging', 'dfxUserDefinition',
    function($scope, $routeParams, $mdDialog, $compile, dfxMessaging, dfxUserDefinition)
{
    var parentScope = $scope.$parent.$parent;
    parentScope.user_definition = $scope;

    $scope.app_name = $routeParams.appname;

    function multiIndex(obj, is) {  // obj,['1','2','3'] -> ((obj['1'])['2'])['3']
        return is.length ? multiIndex(obj[is[0]], is.slice(1)) : obj
    }
    function pathIndex(obj, is) {   // obj,'1.2.3' -> multiIndex(obj,['1','2','3'])
        return multiIndex(obj, is.split('.'))
    }

    var buildTree = function(data, path, is_root_level) {
        var sub_tree = '<ul class="dfx-studio-explorer-treeview-content">';

        var props = Object.keys(data);
        for (var i = 0; i < props.length; i++) {
            if (props[i].indexOf('current_node') == 0) continue;

            sub_tree += '<li>';

            var current_path = path + '.' + props[i];

            if (data[ props[i] ].type == 'subdocument') {
                sub_tree += '<input class="dfx-studio-explorer-treeview-button" type="checkbox" />' +
                    '<label ng-click="editUserDefinitionNode(' + current_path + ', \'' + props[i] + '\',' + is_root_level + ', \'' + current_path + '\')">' + props[i] + '</label>';

                sub_tree += buildTree(data[ props[i]].structure, current_path + '.structure', false);
            } else {
                sub_tree += '<label ng-click="editUserDefinitionNode(' + current_path + ', \'' + props[i] + '\',' + is_root_level + ', \'' + current_path + '\')">' + props[i] + '</label>';
            }

            sub_tree += '</li>';
        }
        sub_tree += '</ul>';

        return sub_tree;
    };

    var addTree = function(data) {
        var tree = buildTree(data, 'user_definition', true);

        var element = angular.element(tree);
        $compile(element.contents())($scope);
        $("#dfx_studio_user_definition_tree").html(element);
    };

    var clearCurrentNode = function() {
        delete $scope.user_definition.current_node;
        delete $scope.user_definition.current_node_name;
        delete $scope.user_definition.current_node_path;
        delete $scope.user_definition.current_node_root_level;
    };

    dfxUserDefinition.getUserDefinition($scope, $scope.app_name).then(function (data) {
        $scope.user_definition = data;
        $scope.operation = 'update_user_definition';//to show properties area from the beginning
        addTree(data);
    });

    $scope.editUserDefinitionNode = function(prop, prop_name, is_root_level, path_to_prop) {
        $scope.operation = 'update_user_definition';
        $scope.user_definition.current_node = prop;
        $scope.user_definition.current_node_name = prop_name;
        $scope.user_definition.current_node_path = path_to_prop;
        $scope.user_definition.current_node_root_level = is_root_level;
    };

    $scope.unselectUserDefinitionNode = function() {
        $scope.operation = 'update_user_definition';
        clearCurrentNode();
    };

    var renameNode = function() {
        //TODO: check ALL nodes for renaming, not only current one - OR next solution -
        //TODO: call rename after each changes in node name? not too much to rebuild tree every time if typing too fast?

        // renaming node - remove node with old name and add same node with new name
        if ($scope.user_definition.current_node) {
            var lastPoint  = $scope.user_definition.current_node_path.lastIndexOf('.');
            var oldName    = $scope.user_definition.current_node_path.substring(lastPoint + 1);
            var parentPath = $scope.user_definition.current_node_path.substring(0, lastPoint);
            var parentObj  = pathIndex($scope, parentPath);
            if (oldName !== $scope.user_definition.current_node_name) {
                Object.defineProperty(parentObj, $scope.user_definition.current_node_name,
                    Object.getOwnPropertyDescriptor(parentObj, oldName));
                delete parentObj[oldName];
            }
            clearCurrentNode();
        }
    };

    $scope.updateUserDefinition = function() {
        renameNode();

        dfxUserDefinition.updateUserDefinition($scope, $scope.app_name, $scope.user_definition).then(function () {
            dfxMessaging.showMessage('User definition was successfully updated.');
            addTree($scope.user_definition);
        });
    };

    $scope.loadUserDefinitionCreationMenu = function($event) {
        $scope.closeUserDefinitionCreationMenu();
        var snippet = '<md-whiteframe style="left:'+($event.x-5)+'px;top:'+($event.y-5)+'px;width:200px" class="md-whiteframe-4dp dfx-studio-explorer-popmenu" ng-mouseleave="closeUserDefinitionCreationMenu()">';
        snippet += '<a href="" ng-click="addUserDefinitionObject()">Create Object</a><br>';
        snippet += '<a href="" ng-click="addUserDefinitionProperty()">Create Property</a>';
        snippet += '</md-whiteframe>';
        angular.element(document.getElementById('dfx-studio-main-body')).append($compile(snippet)($scope));
    };

    $scope.closeUserDefinitionCreationMenu = function($event) {
        $('.dfx-studio-explorer-popmenu').remove();
    };

    var subdocumentDef = {
        mandatory: 'false',
        pass: 'false',
        type: 'subdocument',
        structure: {}
    };

    var propertyDef = {
        defaults: '',
        mandatory: 'false',
        pass: 'false',
        title: 'property',
        type: 'string'
    };

    $scope.addUserDefinitionObject = function() {
        var subdocumentDefCopy = angular.copy(subdocumentDef);

        if ($scope.user_definition.current_node && $scope.user_definition.current_node.type == 'subdocument' && $scope.user_definition.current_node.mandatory == 'true')
        {
            dfxMessaging.showWarning($scope.user_definition.current_node_name + ' is a main property and can not be modified');
        }
        else if ($scope.user_definition.current_node && $scope.user_definition.current_node.type != 'subdocument') {
            dfxMessaging.showWarning('New object can be added only to another object');
        }
        else if ($scope.user_definition.current_node && $scope.user_definition.current_node.type == 'subdocument' &&
            $scope.user_definition.current_node.mandatory != 'true' && $scope.user_definition.current_node.structure.new_object)
        {
            dfxMessaging.showWarning('Object with that name already exists at this level');
        }
        else if (!$scope.user_definition.current_node && $scope.user_definition.new_object)
        {
            dfxMessaging.showWarning('Object with that name already exists at this level');
        }
        else if ($scope.user_definition.current_node && $scope.user_definition.current_node.type == 'subdocument' && $scope.user_definition.current_node.mandatory != 'true')
        {
            $scope.user_definition.current_node.structure.new_object = subdocumentDefCopy;
        }
        else if (! $scope.user_definition.current_node)
        {
            $scope.user_definition.new_object = subdocumentDefCopy;
        }

        addTree($scope.user_definition);
    };

    $scope.addUserDefinitionProperty = function() {
        var propertyDefCopy = angular.copy(propertyDef);

        if ($scope.user_definition.current_node && $scope.user_definition.current_node.type == 'subdocument' && $scope.user_definition.current_node.mandatory == 'true')
        {
            dfxMessaging.showWarning($scope.user_definition.current_node_name + ' is a main property and can not be modified');
        }
        else if ($scope.user_definition.current_node && $scope.user_definition.current_node.type != 'subdocument') {
            dfxMessaging.showWarning('New property can be added only to object');
        }
        else if ($scope.user_definition.current_node && $scope.user_definition.current_node.type == 'subdocument' &&
            $scope.user_definition.current_node.mandatory != 'true' && $scope.user_definition.current_node.structure.new_property)
        {
            dfxMessaging.showWarning('Property with that name already exists at this level');
        }
        else if (!$scope.user_definition.current_node && $scope.user_definition.new_property)
        {
            dfxMessaging.showWarning('Property with that name already exists at this level');
        }
        else if ($scope.user_definition.current_node && $scope.user_definition.current_node.type == 'subdocument' && $scope.user_definition.current_node.mandatory != 'true')
        {
            $scope.user_definition.current_node.structure.new_property = propertyDefCopy;
        }
        else if (! $scope.user_definition.current_node)
        {
            $scope.user_definition.new_property = propertyDefCopy;
        }

        addTree($scope.user_definition);
    };

    $scope.delete = function() {
        if ($scope.user_definition.current_node && $scope.user_definition.current_node.mandatory == 'true') {
            dfxMessaging.showWarning($scope.user_definition.current_node_name + ' is a main property and can not be removed');
            return;
        }

        var lastPoint = $scope.user_definition.current_node_path.lastIndexOf('.');
        var oldName = $scope.user_definition.current_node_path.substring(lastPoint + 1);
        var parentPath = $scope.user_definition.current_node_path.substring(0, lastPoint);
        var parentObj = pathIndex($scope, parentPath);
        delete parentObj[oldName];

        clearCurrentNode();
        addTree($scope.user_definition);
        dfxUserDefinition.updateUserDefinition($scope, $scope.app_name, $scope.user_definition);
    };

    $scope.confirmDelete = function(ev) {
        var confirm = $mdDialog.confirm()
            .title('Are you sure you want to remove this node?')
            .textContent('This node will be removed from repository.')
            .ariaLabel('remove node')
            .targetEvent(ev)
            .cancel('Cancel')
            .ok('OK');
        $mdDialog.show(confirm).then(function() {
            $scope.delete();
        }, function() {
        });
    };
}]);

dfxStudioApp.controller("dfx_studio_api_so_controller", [ '$rootScope', '$scope', '$routeParams', '$location', '$http', '$q', '$mdSidenav', '$mdDialog', '$timeout', 'dfxMessaging', 'dfxApplications', 'dfxAuthProviders', 'dfxApiServiceObjects', function($rootScope, $scope, $routeParams, $location, $http, $q, $mdSidenav, $mdDialog, $timeout, dfxMessaging, dfxApplications, dfxAuthProviders, dfxApiServiceObjects) {
    $scope.app_name = $routeParams.appname;
    $scope.api_so = {
        "application": $scope.app_name,
        "category": "Default",
        "name": "SampleService",
        "description": "This is a sample Service",
        "selector": "root",
        "visibility": "visible",
        "lock": { "status": "unlocked" },
        "apiRoutes": []
    };

    var sufix = '';
    for(var i = 0;  i < 3; i++) {
        sufix += Math.floor(Math.random() * 10);
    }
    $scope.api_so.name += sufix;

    $scope.serviceMode = 'serviceAdd';
    $scope.serviceModeBtn = 'serviceAdd';
    $scope.selected_tab = 0;
    
    if ( $routeParams.categoryname ) {
        $scope.api_so.category = $routeParams.categoryname;
    }

    if ( $routeParams.api_so_name ) {
        $scope.serviceMode = 'serviceEdit';
        $scope.serviceModeBtn = 'serviceEdit';
        $scope.api_so_name = $routeParams.api_so_name;
        dfxApiServiceObjects.getOne( $scope, $scope.app_name, $scope.api_so_name ).then( function( data ) {
            $scope.api_so = data.data.query;
            $scope.api_so.persistence = 'none';
            delete $scope.api_so._id;
            $scope.api_so.apiRoutes = data.data.apiRoutes;
        });
    }

    $timeout(function() {
        if($scope.serviceMode==='serviceAdd'){
            $('#api-so-name').focus();
        }else{
            $scope.selected_tab = 1;
        }

    }, 0);

    var unsaved = false;
    $scope.$on('$locationChangeStart', function($event, newUrl) {
        var newUrl = newUrl.split('#')[1];
        if ( !unsaved && $scope.serviceMode === 'serviceEdit' ) {
            var formatedRoutes = [];
            dfxApiServiceObjects.getOne( $scope, $scope.app_name, $scope.api_so_name ).then( function( data ) {
                if ( data.data.query ) {
                    var from_server = data.data.query;
                    delete from_server._id;
                    angular.forEach(from_server.apiRoutes, function (value, key) {
                        formatedRoutes.push({
                            "name": key,
                            "data": value
                        });
                    });
                    from_server.apiRoutes = formatedRoutes;
                    from_server.requestDate = $scope.api_so.requestDate;
                    from_server.persistence = $scope.api_so.persistence;

                    var equalApi = angular.equals($scope.api_so, from_server);

                    if ( !equalApi ) {
                        var confirm = $mdDialog.confirm()
                            .title('Are you sure to exit the API service object editor?')
                            .textContent('All changes will be lost.')
                            .ariaLabel('leave API SO')
                            .targetEvent(null)
                            .cancel('Cancel')
                            .ok('OK');
                        $mdDialog.show(confirm).then(function() {
                            unsaved = true;
                            $location.path(newUrl);
                        }, function() {
                        });
                    } else {
                        unsaved = true;
                        $location.path(newUrl);
                    }
                } else {
                    unsaved = true;
                    $location.path(newUrl);
                }
            });
            $event.preventDefault();
        } else if ( !unsaved && $scope.serviceMode === 'serviceAdd' ) {
            if ( $location.path() !== ('/api_so/update/' + $scope.app_name + '/' + $scope.api_so.name) ) {
                var confirm = $mdDialog.confirm()
                    .title('Are you sure to exit the API service object editor?')
                    .textContent('All changes will be lost.')
                    .ariaLabel('leave API SO')
                    .targetEvent(null)
                    .cancel('Cancel')
                    .ok('OK');
                $mdDialog.show(confirm).then(function() {
                    unsaved = true;
                    $location.path(newUrl);
                }, function() {
                });
                $event.preventDefault();
            } else {
                unsaved = true;
                $location.path(newUrl);
            }
        }
    });

    $scope.api_sources = [];
    var popupServices = document.getElementById('add-services'),
        popupServicesMask = document.getElementById('add-services-backdrop'),
        bodyHeight = parseFloat($("body").css('height'));
    $timeout(function() {
        var scopeSourceTable = document.getElementById('scope-source-table');
        $(scopeSourceTable).css('max-height', bodyHeight-320);
    }, 0);

    dfxApiServiceObjects.getAll( $scope, $scope.app_name ).then( function( data ) {
        $scope.strongLoopProvider = '';
        var rest_source = {"provider": "none", "dataSource": "REST"};
        $scope.api_sources.push(rest_source);
        for ( var i = 0; i < data.data.data.length; i++ ) {
            $scope.api_sources.push( data.data.data[i] );
        };
    });

    dfxApiServiceObjects.getCategories( $scope, $scope.app_name ).then( function( data ) {
        $scope.apiSoCategories = data.data.querycats;
    });

    dfxApiServiceObjects.getCatalog( $scope ).then( function( data ) {
        $scope.notAuthSources = [];
        $scope.catalogSources = data.data;
        for ( var key in $scope.catalogSources ) {
            if ( $scope.catalogSources[key].auth === false ) {
                $scope.notAuthSources.push({
                    "datasource": key,
                    "auth"      : $scope.catalogSources[key].auth,
                    "data"      : $scope.catalogSources[key].data
                });
            }
        }
        $scope.listSources = [];
    });

    $scope.validateServiceUrls = function() {
        $scope.urlErrors = [];
        var getPromise = function(i) {
            var deferred = $q.defer();

            dfxApiServiceObjects.validateSoUrl( $scope, $scope.api_so.apiRoutes[i].name, $scope.app_name, $scope.api_so.apiRoutes[i].data.uuid )
                .then(function( data ) {
                    if ( data.data.data ) {
                        $scope.notValidUrl = true;
                        $scope.notValidUrlName = $scope.api_so.apiRoutes[i].name;
                        var urlErrorItem = {
                            "index": i,
                            "errorUrl": $scope.api_so.apiRoutes[i].name,
                            "errorName": data.data.data
                        }
                        $scope.urlErrors.push(urlErrorItem);
                    }
                    deferred.resolve();
                });

            return deferred.promise;
        };

        $scope.notValidUrl = false;
        $scope.notValidUrlName = '';
        var total = $scope.api_so.apiRoutes.length;
        var promises = [];
        for (var i = 0; i < total; i++) {
            promises.push(getPromise(i));
        };

        return $q.all(promises);
    }

    $scope.saveApiSo = function() {
        $scope.api_so.application = $scope.app_name;
        $scope.renderRoutesFilters();
        if ( $scope.notRenderedFilters ) {
            dfxMessaging.showWarning("API route " + $scope.notRenderedFilterName + " filters name can't be empty");
        } else {
            $scope.validateServiceUrls().then(function () {
                $scope.urlErrors.sort(function (a, b) {
                    return a.index - b.index;
                });
                if ($scope.urlErrors.length > 0) {
                    switch ($scope.urlErrors[0].errorName) {
                        case 'Service url name incorrect':
                            dfxMessaging.showWarning('Service url name "' + $scope.urlErrors[0].errorUrl + '" is incorrect');
                            break;
                        case 'Current service url already exists':
                            dfxMessaging.showWarning('Service url "' + $scope.urlErrors[0].errorUrl + '" already exists');
                            break;
                    }
                } else {
                    if ($scope.api_so.name) {
                        dfxApiServiceObjects.createSo($scope, $scope.api_so).then(function (data) {
                            if (data.status && data.status === 200 && data.data.data === 'API Route created!') {
                                dfxMessaging.showMessage('API service object has been successfully created');
                                $scope.getAll();
                                $location.path('/api_so/update/' + $scope.api_so.application + '/' + $scope.api_so.name);
                            } else {
                                dfxMessaging.showWarning(data.data.data);
                            }
                        }, function (data) {
                            dfxMessaging.showWarning(data.data.error.message);
                        });
                    } else {
                        $scope.selected_tab = 0;
                        $scope.serviceNameError = "Service name can't be empty";
                        $scope.validNameResult = 'failed';
                        dfxMessaging.showWarning('There was an error trying to create the new API service object');
                    }
                }
            });
        }
    }

    $scope.updateApiSo = function(route_add) {
        $scope.renderFilters( $scope.scopeService );
        $scope.api_so.application = $scope.app_name;
        $scope.renderRoutesFilters();
        if ( $scope.notRenderedFilters ) {
            dfxMessaging.showWarning("API route " + $scope.notRenderedFilterName + " filters name can't be empty");
        } else {
            $scope.validateServiceUrls().then(function() {
                $scope.urlErrors.sort(function(a,b) {
                    return a.index - b.index;
                });
                if ( $scope.urlErrors.length > 0 ) {
                    switch ( $scope.urlErrors[0].errorName ) {
                        case 'Service url name incorrect': dfxMessaging.showWarning('Service url name "' + $scope.urlErrors[0].errorUrl + '" is incorrect'); break;
                        case 'Current service url already exists': dfxMessaging.showWarning('API Route URL "' + $scope.urlErrors[0].errorUrl + '" must be unique'); break;
                    }
                } else {
                    dfxApiServiceObjects.updateSo( $scope, $scope.api_so ).then(function( data ) {
                        if ( data.status && data.status === 200 ) {
                            dfxMessaging.showMessage('API service object has been successfully updated');
                            dfxApiServiceObjects.getOne( $scope, $scope.app_name, $scope.api_so_name ).then(function( data ) {
                                if ( data.data.apiRoutes ) {
                                    $scope.api_so.apiRoutes = data.data.apiRoutes;
                                    $scope.getAll().then(function(){
                                        $scope.refresh_scope_service(route_add);
                                    });
                                }
                            });
                        } else {
                            dfxMessaging.showWarning('There was an error trying to update API service object');
                        }
                    });
                }
            });
        }
    }

    $scope.renderRoutesFilters = function() {
        $scope.areEmptyFilterNames = [];
        $scope.notRenderedFilters = false;
        $scope.notRenderedFilterName = '';
        for ( var i = 0; i < $scope.api_so.apiRoutes.length; i++ ) {
            $scope.renderFilters( $scope.api_so.apiRoutes[i] );
            var isEmptyTemp = {
                "value": $scope.isEmptyFilterName,
                "name": $scope.api_so.apiRoutes[i].name
            };
            $scope.areEmptyFilterNames.push( isEmptyTemp );
        }
        for ( var i = 0; i < $scope.areEmptyFilterNames.length; i++ ) {
            if ( $scope.areEmptyFilterNames[i].value ) {
                $scope.notRenderedFilters = true;
                if ( $scope.notRenderedFilterName === '' ) {
                    $scope.notRenderedFilterName = $scope.areEmptyFilterNames[i].name;
                }
            }
        }
    }

    $scope.deleteApiSo = function() {
        dfxApiServiceObjects.deleteSo( $scope, $scope.api_so ).then(function( data ) {
            dfxMessaging.showMessage( data.data.data );
            $scope.getAll();
            unsaved = true;
            $location.path('/home');
        });
    }

    $scope.confirmApiSoDelete = function( ev ) {
        var confirm = $mdDialog.confirm()
            .title('Are you sure you want to remove this API service object?')
            .textContent('This API service object will be removed from repository.')
            .ariaLabel('remove API service object')
            .targetEvent(ev)
            .cancel('Cancel')
            .ok('OK');
        $mdDialog.show(confirm).then(function() {
            $scope.deleteApiSo();
        }, function() {
        });
    }

    $scope.addService = function() {
        $scope.validUrlResult = '';
        $scope.serviceUrlError = '';
        $scope.selected_service_tab = 0;
        $scope.scopeService = {};
        $scope.editFilterTitle = null;
        var dataSourceIcon = $(".dfx-api-so-sources");
        dataSourceIcon.hide();
        var api_so_route_snippet = {
            "name": "",
            "data": {
                "metadata": "",
                "settings": {
                    "source": "ext",
                    "connector": "http",
                    "postrequestbody": "",
                    "authentication": "none",
                    "auth_password": "",
                    "typerequest": "HTTP_GET",
                    "urlrandom": "0",
                    "auth_userid": "",
                    "cache":"none",
                    "cacheTimeExpiry" : 0,
                    "url": "",
                    "dbdriver": "",
                    "dbnames": { "database": "", "collection": "" }
                },
                "parameters": [],
                "precode": [],
                "postcode": [],
                "appexpr": [],
                "service": { "method": "" },
                "format": "json"
            }
        };
        $scope.scopeService = api_so_route_snippet;
        $scope.serviceModeBtn = 'serviceAdd';
        $scope.checkDatasource();
        $timeout(function() {
            $scope.isExecuted = false;
            $("#showResults").css('opacity',0);
            $("#executedResult").val();
        }, 0);

        var sideNavInstance = $mdSidenav('side_nav_add_service'),
            sidenav = $("md-sidenav[md-component-id='side_nav_add_service']"),
            sidenavHeight = sidenav.height();
        $timeout(function(){
            sidenav.find(".sidenav-service").css( "max-height", sidenavHeight-145 );
            sidenav.find("#dfx_filter_src_query_editor").css( "height", sidenavHeight-280 );
            var editor = $('#dfx_filter_src_query_editor.CodeMirror')[0].CodeMirror;
            editor.setValue('');
            $scope.isExecuted = false;
            $("#showResults").css('opacity',0);
            $("#executedResult").val();
            $scope.editorOpened = false;
        }, 0);
        sideNavInstance.toggle();
    }

    $scope.cloneService = function( service ) {
        //var cloned = JSON.parse(JSON.stringify(service));
        var cloned = angular.copy( service );

        $mdDialog.show({
            scope: $scope,
            preserveScope: true,
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            ariaLabel: 'api-so-clone',
            templateUrl: 'studioviews/apiSourceClone.html',
            onComplete: function() {
                $scope.clonedServiceName = cloned.name;
                $scope.allowClone = false;
                $scope.clonedServiceUrl = cloned.data.settings.url;
                $scope.closeDialog = function() {
                    $mdDialog.hide();
                }
                $scope.clonedServiceNameChangeAction = function() {
                    if ($scope.clonedServiceName !== cloned.name) {
                        $scope.allowClone = true;
                    } else {
                        $scope.allowClone = false;
                    }
                    $scope.validUrlResult = '';
                    $scope.serviceUrlError = '';
                    dfxApiServiceObjects.validateSoUrl( $scope, $scope.clonedServiceName, $scope.app_name ).then(function( data ) {
                        if ( data.data.data !== '' ) {
                            $scope.validUrlResult = 'failed';
                            $scope.serviceUrlError = data.data.data;
                            $scope.allowClone = false;
                        }
                    });
                }

                $scope.cloneServiceDo = function() {
                    cloned.name = $scope.clonedServiceName;
                    cloned.data.settings.url = $scope.clonedServiceUrl;
                    delete cloned.data.uuid;
                    $scope.api_so.apiRoutes.push( cloned );
                    $mdDialog.hide();
                }
            }
        })


    }

    $scope.addServices = function() {
        $scope.serviceModeBtn = 'addServices';
        $scope.servicesApiSource = 'none';
        var dataSourceIcon = $(".dfx-api-so-sources");
        dataSourceIcon.hide();
        $('#add-services').fadeIn(150).focus();
        $('#add-services-backdrop').fadeIn(150);
    }

    $('body #add-services-backdrop').on('click', function(){
        $('#add-services').fadeOut(150);
        $('body #add-services-backdrop').fadeOut(150);
    });

    $scope.singleGroup = function( ev ) {
        $timeout(function() {
            var element = ev.target,
                checked = $(element).parent().attr('aria-checked');
            if ( $scope.restSource === false ) {
                allCheckboxes = $(".service-checkbox");
            } else {
                allCheckboxes = $(element).parent().parent().siblings().find(".service-checkbox");
            }
            if ( checked === 'true' ) {
                angular.forEach(allCheckboxes, function(item) {
                    if ( $(item).attr('aria-checked') === 'false' ) {
                        angular.element(item).triggerHandler("click");
                    }
                });
            } else {
                angular.forEach(allCheckboxes, function(item) {
                    if ( $(item).attr('aria-checked') === 'true' ) {
                        angular.element(item).triggerHandler("click");
                    }
                });
            }
        }, 0);
    }

    $scope.pushServices = function() {
        if ( $scope.restSource === false ) {
            var checkedServices = $(".api-datasource .service-checkbox");
            for (var i = 0; i < checkedServices.length; i++) {
                var checkedAttr = $(checkedServices[i]).attr('aria-checked');
                if ( checkedAttr === 'true' ) {
                    var newRoute = $scope.listSources[i];
                    newRoute.data.settings.authentication = $scope.selectedDataSource;
                    if ( !newRoute.data.parameters ) newRoute.data.parameters = [];
                    if ( !newRoute.data.precode ) newRoute.data.precode = [];
                    if ( !newRoute.data.postcode ) newRoute.data.postcode = [];
                    if ( !newRoute.data.appexpr ) newRoute.data.appexpr = [];
                    $scope.api_so.apiRoutes.push(newRoute);
                }
            };
        } else {
            var restItems = $(".api-datasource .rest-item");
            for (var i = 0; i < restItems.length; i++) {
                var restItemCheckboxes = $(restItems[i]).find('.service-checkbox');
                for (var j = 0; j < restItemCheckboxes.length; j++) {
                    var checkedAttr = $(restItemCheckboxes[j]).attr('aria-checked');
                    if ( checkedAttr === 'true' ) {
                        var newRoute = $scope.strongLoopList[i].data[j];
                        newRoute.data.settings.authentication = $scope.selectedDataSource;
                        if ( !newRoute.data.parameters ) newRoute.data.parameters = [];
                        if ( !newRoute.data.precode ) newRoute.data.precode = [];
                        if ( !newRoute.data.postcode ) newRoute.data.postcode = [];
                        if ( !newRoute.data.appexpr ) newRoute.data.appexpr = [];
                        $scope.api_so.apiRoutes.push(newRoute);
                    }
                };
            };
        }
        $('#add-services').fadeOut(150);
        $('#add-services-backdrop').fadeOut(150);
        $scope.showListSources = false;
        $mdDialog.hide();
    }

    $scope.closeSources = function() {
        $('#add-services').fadeOut(150);
        $('#add-services-backdrop').fadeOut(150);
    }

    $scope.validateServiceName = function() {
        $scope.validNameResult = '';
        $scope.serviceNameError = '';
        dfxApiServiceObjects.validateSoName( $scope, $scope.api_so.name, $scope.app_name ).then(function( data ) {
            if ( data.data.data !== '' ) {
                $scope.validNameResult = 'failed';
                $scope.serviceNameError = data.data.data;
            }
        });
    }

    $scope.validateServiceUrl = function(serviceModeBtn) {
        $scope.validUrlResult = '';
        $scope.serviceUrlError = '';
        dfxApiServiceObjects.validateSoUrl( $scope, $scope.scopeService.name, $scope.app_name, $scope.scopeService.data.uuid ).then(function( data ) {
            if (( data.data.data !== '' ) && ($scope.currentEditingUrlName !== $scope.scopeService.name)) {
                $scope.validUrlResult = 'failed';
                $scope.serviceUrlError = data.data.data;
            } else if(serviceModeBtn) {
                $scope.checkKeyboardEvents(serviceModeBtn);
            }
        });
    }

    $scope.checkKeyboardEvents = function(serviceModeBtn){
        if (serviceModeBtn) {
            if(serviceModeBtn=='serviceAdd') $scope.saveApiSoService();
            if(serviceModeBtn=='serviceEdit') $scope.updateApiSo();
        }
    }

    $scope.saveApiSoService = function() {
        $scope.renderFilters( $scope.scopeService );
        if ( $scope.isEmptyFilterName ) {
            dfxMessaging.showWarning("Filter name can't be empty");
            $scope.selected_service_tab = 2;
        } else {
            if ($scope.api_so.apiRoutes.length === 0 && $scope.scopeService.name !== '') {
                $scope.api_so.apiRoutes.push($scope.scopeService);
                $scope.updateApiSo('add_new_route');
                //$scope.scopeService = {};
                // var sideNavInstance = $mdSidenav('side_nav_add_service');
                // sideNavInstance.toggle();
            } else if ($scope.api_so.apiRoutes.length > 0 && $scope.validUrlResult === '') {
                $scope.api_so.apiRoutes.push($scope.scopeService);
                $scope.updateApiSo('add_new_route');
                //$scope.scopeService = {};
                // var sideNavInstance = $mdSidenav('side_nav_add_service');
                // sideNavInstance.toggle();
            } else if ($scope.api_so.apiRoutes.length === 0 && $scope.scopeService.name === '') {
                $scope.validUrlResult = 'failed';
                $scope.serviceUrlError = 'Service url name can\'t be empty';
            }
        }
    }

    function get_route_index(route) {
        return angular.equals(route, $scope.scopeService);
    }

    $scope.refresh_scope_service = function(route_add){
        if(route_add && route_add === 'add_new_route'){
            var new_route = $scope.api_so.apiRoutes.filter(function(route){ return route.name === $scope.scopeService.name })[0];
            $scope.scopeService = new_route;            
        }else{
            var scope_service_index = $scope.api_so.apiRoutes.findIndex(get_route_index);
            $scope.scopeService = $scope.api_so.apiRoutes[scope_service_index];            
        }
        $scope.serviceModeBtn = 'serviceEdit';
    }

    $scope.checkDatasource = function() {
        for (var i = 0; i < $scope.api_sources.length; i++) {
            if ( $scope.scopeService.data.settings.authentication === $scope.api_sources[i].provider ) {
                if ( $scope.api_sources[i].schema === 'public/rest' ) {
                    $scope.restSource = true;
                } else {
                    $scope.restSource = false;
                }
                if ( $scope.scopeService.data.settings.authentication === 'none' ) {
                    $scope.listSources = $scope.notAuthSources;
                    $scope.dataSource = 'none';
                    $scope.selectedDataSource = 'none';
                } else {
                    $scope.dataSource = $scope.api_sources[i].dataSource;
                    if ($scope.catalogSources[$scope.dataSource]!=null) {
                        $scope.listSources = $scope.catalogSources[$scope.dataSource].data;
                    } else {
                        $scope.listSources = $scope.notAuthSources;
                    }
                    $scope.selectedDataSource = $scope.scopeService.data.settings.authentication;
                }
            }
        };
    }

    $scope.showCurl = function ( serviceItem ) {
        var currentAPIUrl = $scope.api_so.apiRoutes.filter(function(apiRoute){
            return apiRoute.name == serviceItem.name;
        });
        var parameters = currentAPIUrl[0].data.parameters;
        var body = currentAPIUrl[0].data.settings.postrequestbody;
        var queryString = {"params":{},"body":body}
        parameters.forEach(function(param){
            queryString.params[param.name] = param.value;
        });
        $scope.curlItemMessage = serviceItem.name;
        $scope.parameters = parameters;
        $scope.body = body;

        dfxApiServiceObjects.getTenant( $('body').attr('data-tenantid'))
            .then(function(tenant) {
                if (tenant.data.data.databaseTokens) {
                    var str = "curl -i ";
                        str += "-H 'Content-Type:application/json' ";
                        str += "-H 'Authorization:Basic " + btoa($('body').attr('data-tenantid') + ":" + Object.keys(tenant.data.data.databaseTokens)[0]) + "==' ";
                        str += "-d '{}' ";
                        str += window.location.origin + '/api/' + $scope.app_name + '/apiRoute/' + serviceItem.name;
                    $scope.curlItemContent = str;

                    var str = "curl -i ";
                    str += "-H 'Content-Type:application/json' ";
                    str += "-H 'Authorization:Basic " + btoa($('body').attr('data-tenantid') + ":" + Object.keys(tenant.data.data.databaseTokens)[0]) + "==' ";
                    str += "-d '" + JSON.stringify(queryString) + "' ";
                    str += window.location.origin + '/api/' + $scope.app_name + '/apiRoute/' + serviceItem.name;
                    $scope.curlItemContentWithParameters = str;

                    //console.log($scope.curlItemContentWithParameters);

                    $scope.postmanUrl = window.location.origin + '/api/' + $scope.app_name + '/apiRoute/' + serviceItem.name;
                    $scope.postmanUsername = $('body').attr('data-tenantid');
                    $scope.postmanPassword = Object.keys(tenant.data.data.databaseTokens)[0];
                } else {
                    $scope.curlItemContent = "Can't get tenant token from server";
                }

            },function(err) {
                $scope.curlItemContent = "Can't get tenant token from server." + err;
            });
        var sideNavInstance = $mdSidenav('side_nav_curl');
        $('#curl_content_span').hide();
        $('#curl_content_with_parameters_span').hide();
        sideNavInstance.toggle();
    }

    $scope.copyToClipboard = function(id) {
        $('#' + id).select();
        document.execCommand("copy");
        $('#' + id +'_span').show();
    }

    $scope.editService = function( serviceItem, index ) {
        $scope.selected_service_tab = 0;
        $scope.validUrlResult = '';
        $scope.serviceUrlError = '';
        $scope.scopeService = {};
        $scope.scopeService = serviceItem;
        $scope.scopeServiceIndex = index;
        $scope.editorOpened = false;
        $scope.editFilterTitle = null;
        if ( !serviceItem.data.parameters ) $scope.scopeService.data.parameters = [];
        if ( !serviceItem.data.precode ) $scope.scopeService.data.precode = [];
        if ( !serviceItem.data.postcode ) $scope.scopeService.data.postcode = [];
        if ( !serviceItem.data.appexpr ) $scope.scopeService.data.appexpr = [];
        $scope.currentEditingUrlName = !$scope.currentEditingUrlName ? serviceItem.name : $scope.currentEditingUrlName;
        $scope.checkDatasource();
        $scope.serviceModeBtn = 'serviceEdit';
        var sideNavInstance = $mdSidenav('side_nav_add_service');
        sidenav = $("md-sidenav[md-component-id='side_nav_add_service']"),
        sidenavHeight = sidenav.height();
        sideNavInstance.toggle();
        $timeout(function() {
            sidenav.find(".sidenav-service").css( "max-height", sidenavHeight-145 );
            sidenav.find("#dfx_filter_src_query_editor").css( "height", sidenavHeight-280 );
            var editor = $('#dfx_filter_src_query_editor.CodeMirror')[0].CodeMirror;
            editor.setValue('');
            $scope.isExecuted = false;
            $("#showResults").css('opacity',0);
            $("#executedResult").val();
        }, 0);
    }

    $scope.deleteService = function( index ) {
        $scope.api_so.apiRoutes.splice( index, 1 );
    }

    $scope.confirmDelete = function( ev, index ) {
        var confirm = $mdDialog.confirm()
            .title('Are you sure you want to remove this service?')
            .textContent('Service will be removed from API service object.')
            .ariaLabel('remove service')
            .targetEvent(ev)
            .cancel('Cancel')
            .ok('OK');
        $mdDialog.show(confirm).then(function() {
            $scope.deleteService(index);
        }, function() {
        });
    };

    dfxAuthProviders.getProviders( $scope.app_name );

    $scope.strongLoopData = function() {
        dfxAuthProviders.getProvider( $scope.selectedDataSource, $scope.app_name ).then(function( data ) {
            var serverRoute = data.route;
            dfxApiServiceObjects.getStrongLoop( $scope, data.route ).then(function( data ) {
                var strongLoop = data.data;
                $scope.strongLoopList = [];
                for ( var i = 0; i < strongLoop.tags.length; i++ ) {
                    var group = {
                        "auth": false,
                        "data": [],
                        "dataSource": '' + strongLoop.tags[i].name
                    }
                    var pathFilter = '/' + strongLoop.tags[i].name,
                        groupData = [];

                    for ( var path in strongLoop.paths ) {
                        if ( path.indexOf(pathFilter) === 0 ) {
                            for ( var subPath in strongLoop.paths[path] ) {
                                var groupItem = {
                                    "name": "",
                                    "summary": "",
                                    "data": {
                                        "metadata": "",
                                        "settings": {
                                            "source": "ext",
                                            "connector": "http",
                                            "postrequestbody": "",
                                            "authentication": "none",
                                            "auth_password": "",
                                            "typerequest": "HTTP_GET",
                                            "urlrandom": "0",
                                            "auth_userid": "",
                                            "url": "",
                                            "dbdriver": "",
                                            "dbnames": { "database": "", "collection": "" }
                                        },
                                        "parameters": [],
                                        "precode": [],
                                        "postcode": [],
                                        "appexpr": [],
                                        "service": { "method": "" },
                                        "format": "json"
                                    }
                                }
                                groupItemName = path.replace(/(\{)/g,'').replace(/(\})/g,'');
                                groupItem.name = subPath.toUpperCase()+'/'+groupItemName.slice(1);
                                groupItem.summary = strongLoop.paths[path][subPath].summary;
                                groupItem.data.settings.typerequest = 'HTTP_' + subPath.toUpperCase();
                                groupItem.data.settings.url = serverRoute + '/api' + path;
                                if ( strongLoop.paths[path][subPath].parameters.length > 0 ) {
                                    for (var j = 0; j < strongLoop.paths[path][subPath].parameters.length; j++) {
                                        var groupItemParameter = {
                                            "name": "",
                                            "alias": "",
                                            "operation": "eq",
                                            "value": "",
                                            "type": "request"
                                        }
                                        groupItem.data.parameters[j] = groupItemParameter;
                                        groupItem.data.parameters[j].name = strongLoop.paths[path][subPath].parameters[j].name;
                                        switch ( strongLoop.paths[path][subPath].parameters[j].in ) {
                                            case 'query': groupItem.data.parameters[j].type = 'request'; break;
                                            case 'path': groupItem.data.parameters[j].type = 'url'; break;
                                        }
                                    };
                                }
                                groupData.push(groupItem);
                            }
                        }
                    };
                    group.data = groupData;
                    $scope.strongLoopList.push(group);
                };
            });
        });
    };

    $scope.chooseDataSource = function( sourceProvider ) {
        $scope.selectedDataSource = sourceProvider.provider;
        $scope.dataSource = sourceProvider.dataSource;
        var dataSourceIcon = $(".dfx-api-so-sources");
        if ( $scope.dataSource !== 'REST' ) {
            dataSourceIcon.show();
            if ( $scope.serviceModeBtn === 'addServices' ) {
                $scope.servicesApiSource = sourceProvider.provider;
                if ( sourceProvider.schema === 'none' ) {
                    $scope.dataSource = sourceProvider.dataSource;
                    $scope.restSource = true;
                } else {
                    $scope.restSource = false;
                    if ( $scope.servicesApiSource === 'none' ) {
                        $scope.listSources = [];
                    } else {
                        $scope.listSources = $scope.catalogSources[$scope.dataSource].data;
                    }
                }
            } else {
                $scope.scopeService.data.settings.authentication = sourceProvider.provider;
                if ( sourceProvider.schema === 'none' ) {
                    $scope.dataSource = sourceProvider.dataSource;
                    $scope.restSource = true;
                } else {
                    $scope.restSource = false;
                    if ( $scope.scopeService.data.settings.authentication === 'none' ) {
                        $scope.listSources = [];
                    } else {
                        $scope.listSources = $scope.catalogSources[$scope.dataSource].data;
                    }
                }
            }
        }
    }

    $scope.addRow = function( tableArray, tableName ) {
        var parameterItem = {
                "name": "",
                "alias": "",
                "operation": "eq",
                "value": "",
                "type": "request"
            },
            preCodeItem = {
                "name": "pre_code_" + ( tableArray.length + 1 ),
                "code": ""
            },
            postCodeItem = {
                "name": "post_code_" + ( tableArray.length + 1 ),
                "code": ""
            },
            appExceptionItem = {
                "name": "exception_" + ( tableArray.length + 1 ),
                "regexp": ""
            },
            table_length = tableArray.length;

        switch ( tableName ) {
            case 'parameters': tableArray.push( parameterItem ); $timeout(function(){$('#parameter_name_'+table_length).focus()}, 100);  break;
            case 'pre_code': tableArray.push( preCodeItem );  $timeout(function(){$('#pre_code_name_'+table_length).focus()}, 100); break;
            case 'post_code': tableArray.push( postCodeItem );  $timeout(function(){$('#post_code_name_'+table_length).focus()}, 100); break;
            case 'appexpr': tableArray.push( appExceptionItem );  $timeout(function(){$('#appexpr_name_'+table_length).focus()}, 100); break;
        }
    }

    $scope.moveUp = function( index, element, tableArray ) {
        if ( index > 0 ) {
            tableArray.splice( index-1, 0, element );
            tableArray.splice( index+1, 1 );
        }
    }

    $scope.moveDown = function( index, element, tableArray ) {
        if ( index + 1 < tableArray.length ) {
            tableArray.splice( index, 1 );
            tableArray.splice( index+1, 0, element );
        }
    }

    $scope.deleteRow = function( tableArray, index ) {
        tableArray.splice( index, 1 );
    };

    $timeout(function() {
        var myTextArea = document.getElementById('dfx_filter_src_query_editor');
        var scriptEditor = CodeMirror(function (elt) {
                myTextArea.parentNode.replaceChild(elt, myTextArea);
            },
            {
                lineNumbers: true,
                value: $('#dfx_filter_src_query_editor').val(),
                mode: {name: "javascript", globalVars: true},
                matchBrackets: true,
                highlightSelectionMatches: {showToken: /\w/},
                styleActiveLine: true,
                viewportMargin : Infinity,
                extraKeys: {"Alt-F": "findPersistent", "Ctrl-Space": "autocomplete"},
                lineWrapping: true
            });
        var filterHeight = parseFloat($("md-sidenav[md-component-id='side_nav_add_service']").css('height')) - 272;
        scriptEditor.setSize(830, filterHeight);
        $(scriptEditor.getWrapperElement()).attr("id", "dfx_filter_src_query_editor");
        scriptEditor.refresh();
        scriptEditor.focus();
    }, 0);

    $scope.codeEditor = function( index, codeArray, arrayName ) {
        $scope.editorOpened = true;
        $scope.codeArrayItemIndex = index;
        $scope.codeArray = codeArray;
        $scope.codeArrayName = arrayName;
        var editor = $('#dfx_filter_src_query_editor.CodeMirror')[0].CodeMirror;
        switch( arrayName ) {
            case 'precode':
                $timeout(function(){
                    var helpMessage = "/*\n\tThis filter will be executed before the targeted API is called.\n\tUse 'params' to access/update/add/remove/manage parameters sent from the view.\n\tUse 'body' to access the request body sent by a post call.\n\tUse the 'Actions' menu to get assistance on coding.\n*/\n";
                        helpMessage += "var preExecutionFilter = function(params, body){\n\t// Filter code here\n\tterminateFilter();\n};\n"
                    var content = codeArray[index].code;
                    editor.focus();
                    editor.refresh();
                    editor.setValue( !content ? helpMessage : content );
                    $scope.editFilterTitle = "Pre execution filter : " + codeArray[index].name;
                    $scope.editFilterParameters = true;
                }, 0);
                break;
            case 'postcode':
                $timeout(function(){
                    var helpMessage = "/*\n\tThis filter will be executed after the targeted API is called.\n\tUse 'response' to manipulate (add/remove data) the JSON that will be sent to the client.\n\tUse the 'Actions' menu to get assistance on coding.\n*/\n";
                        helpMessage += "var postExecutionFilter = function(response){\n\t// Filter code here\n\tterminateFilter();\n};\n"
                    var content = codeArray[index].code;
                    editor.focus();
                    editor.refresh();
                    editor.setValue( !content ? helpMessage : content );
                    $scope.editFilterTitle = "Post execution filter : " + codeArray[index].name;
                    $scope.editFilterParameters = false;
                });
                break;
        }
    }

    $scope.setCodemirrorValue = function( data ) {
        var editor = $('#dfx_filter_src_query_editor.CodeMirror')[0].CodeMirror;
        editor.replaceSelection( data );
    }

    $scope.executeDataQuery =       'getService("sample/api/url", {"param" : "param content"}).then(function (res) {\n' +
        '    response.filterResult = res;\n' +
        '        terminateFilter();\n' +
        '});\n';
    $scope.executeDataQueryParams = 'postService("sample/api/url", {"param" : "param content"}, {"bodyParam" : "body Content"}).then(function (res) {\n' +
        '    response.filterResult = res;\n' +
        '        terminateFilter();\n' +
        '});\n';
    $scope.getParameter =  "getParameter('myParameter');\n";
    $scope.editParameter = "setParameter('myParameter', 'Hello world');\n";
    $scope.addParameter = "addParameter({\n" +
                          "'name' : 'myParameter',\n" +
                          "'alias' : 'myParameterAlias',\n" +
                          "'operation' : 'eq',\n" +
                          "'value' : 'Hello world',\n" +
                          "'type' : 'request'\n" +
        "});\n";
    $scope.setBody = "setBody({'myBodyParameter':'Hello world'});\n";

    $scope.saveActions = function() {
        var editor = $('#dfx_filter_src_query_editor.CodeMirror')[0].CodeMirror,
            codeValue = editor.getValue();

        $scope.renderFilters( $scope.scopeService );
        if ( $scope.isEmptyFilterName ) {
            dfxMessaging.showWarning("Filter name can't be empty");
            $scope.selected_service_tab = 2;
        } else {
            switch( $scope.codeArrayName ) {
                case 'precode': $scope.scopeService.data.precode[$scope.codeArrayItemIndex].code = codeValue; break;
                case 'postcode': $scope.scopeService.data.postcode[$scope.codeArrayItemIndex].code = codeValue; break;
            }
            if($scope.serviceModeBtn==='serviceAdd'){
                $scope.saveApiSoService();
                $scope.serviceModeBtn = 'serviceEdit';
            }else{
                $scope.updateApiSo();
            }
        }
        $scope.editorOpened = false;
        editor.setValue('');
        $scope.editFilterTitle = null;
    }

    $scope.closeActionsEditor = function() {
        if($scope.editorOpened){
            var editor = $('#dfx_filter_src_query_editor.CodeMirror')[0].CodeMirror;
                codeValue = editor.getValue();

            switch( $scope.codeArrayName ) {
                case 'precode': $scope.scopeService.data.precode[$scope.codeArrayItemIndex].code = codeValue; break;
                case 'postcode': $scope.scopeService.data.postcode[$scope.codeArrayItemIndex].code = codeValue; break;
            }
            $scope.editorOpened = false;
            editor.setValue('');
            $scope.editFilterTitle = null;
        }
    }

    $scope.execute = function( event ) {
        $("#showResults").css('opacity',0);
        $scope.isExecuted = false;
        var sideNavInstance = $mdSidenav('side_nav_add_service'),
            sidenav = $("md-sidenav[md-component-id='side_nav_add_service']"),
            sidenavHeight = sidenav.height();

        $scope.serviceTimeStamp = '' + event.timeStamp;
        var simulateService = {
            "queryName": "",
            "typeRequest": "GET",
            "source": "ext",
            "auth": { "auth": "none" },
            "url": "",
            "urlRandom": "",
            "reqbody": "",
            "dbnames": { "database": "", "collection": "" },
            "format": "json",
            "application": "",
            "_": ""
        }
        $scope.simulatedMeta = {};
        $scope.simulatedResult = {};
        $scope.simulatedRequest = {};
        if ( $scope.restSource === true ) {
            simulateService.auth.auth = 'none';
        } else {
            simulateService.auth.auth = $scope.scopeService.data.settings.authentication || 'none';
        }

        var filtered = $scope.api_sources.filter(function(source){
            return source.provider == $scope.scopeService.data.settings.authentication;
        });

        if (filtered && filtered[0] && (filtered[0].schema === 'none')) {
            simulateService.auth.auth = 'none';
        }

        simulateService.url = $scope.scopeService.data.settings.url;
        simulateService.name = $scope.scopeService.name;
        simulateService.cache = $scope.scopeService.data.settings.cache;
        simulateService.cacheTimeExpiry = $scope.scopeService.data.settings.cacheTimeExpiry;
        simulateService.typeRequest = $scope.scopeService.data.settings.typerequest.replace('HTTP_', '');
        simulateService.urlRandom = $scope.scopeService.data.settings.urlrandom;
        simulateService.reqbody = $scope.scopeService.data.settings.postrequestbody;
        if ( $scope.scopeService.data.parameters && $scope.scopeService.data.parameters.length > 0 ) { simulateService.data = $scope.scopeService.data.parameters; }
        if ( $scope.scopeService.data.precode && $scope.scopeService.data.precode.length > 0 ) { simulateService.precode = $scope.scopeService.data.precode; }
        if ( $scope.scopeService.data.postcode && $scope.scopeService.data.postcode.length > 0 ) { simulateService.postcode = $scope.scopeService.data.postcode; }
        simulateService.application = $scope.app_name;
        simulateService._ = $scope.serviceTimeStamp;

        $.ajax({
            url: '/studio/query/execute',
            data: simulateService,
            type: 'POST',
            headers : {'X-DREAMFACE-TENANT' : $('body').attr('data-tenantid')}
        })
            .then(function(data) {
                $scope.simulatedMeta = data.metadata;
                $scope.simulatedResult = data.data;
                $scope.simulatedRequest = data.requestData;
                $timeout(function() {
                    $scope.isExecuted = true;
                }, 0);
            }).fail(function(data) {
                $scope.simulatedMeta = data;
                $scope.simulatedResult = data.responseText;
                $scope.simulatedRequest = data;
                $timeout(function() {
                    $scope.isExecuted = true;
                }, 0);
            });

        var executedArea = document.getElementById('executedResult');
        // var executedMirror = CodeMirror(function (elt) {
        //         executedArea.parentNode.replaceChild(elt, executedArea);
        //     },
        //     {
        //         lineNumbers: true,
        //         value: '',
        //         mode: {name: 'application/json', globalVars: true, json: true},
        //         readOnly: true,
        //         matchBrackets: true,
        //         highlightSelectionMatches: {showToken: /\w/},
        //         styleActiveLine: true,
        //         viewportMargin : Infinity,
        //         extraKeys: {"Alt-F": "findPersistent", "Ctrl-Space": "autocomplete"}
        //     });
        // $(executedMirror.getWrapperElement()).attr("id", "executedResult");
        // $timeout(function() {
        //     scope.script_editor.focus();
        //     executedMirror.refresh();
        // }, 0);
        sidenav.find("#executedResult").css( "height", sidenavHeight-245 );
        var container = document.getElementById('executedResult'),
            options = { mode: 'code', modes: ['tree','form','code','text','view'], history: true }
        $timeout(function(){
            if(!$scope.dfxSampleJsonEditor) $scope.dfxSampleJsonEditor = new JSONEditor(container, options, $scope.simulatedResult);
        },0);
    }

    $scope.viewMetaData = function() {
        // var editor = $('#executedResult.CodeMirror')[0].CodeMirror;
        // editor.setValue( $scope.simulatedMeta );
        // $("#executedResult").val( $scope.simulatedMeta );
        $scope.dfxSampleJsonEditor.set($scope.simulatedMeta);
        $("#showResults").css('opacity',1);
    }

    $scope.viewResult = function() {
        // var editor = $('#executedResult.CodeMirror')[0].CodeMirror;
        // editor.setValue( $scope.simulatedResult );
        // $("#executedResult").val( $scope.simulatedResult );
        $scope.dfxSampleJsonEditor.set($scope.simulatedResult);
        // dfxApiServiceObjects.getSettings().then(function( response ){
        //     var settings = response.data;
        //     $scope.showFullResult = false;
        //     if ((settings.api_so_response_max_size == 0) || ($scope.simulatedResult.length < settings.api_so_response_max_size)) {
        //         $("#executedResult").val( $scope.simulatedResult );
        //     } else {
        //         $scope.showFullResult = true;
        //         $scope.numberOfCutedChars = settings.api_so_response_max_size;
        //         $("#executedResult").val( $scope.simulatedResult.slice(0,settings.api_so_response_max_size) );
        //     }
        // });
        $("#showResults").css('opacity',1);
    }

    // $scope.showFullResultAction = function() {
    //     $scope.showFullResult = false;
    //     $("#executedResult").val("") ;
    //     $("#executedResult").val( $scope.simulatedResult ) ;
    //     $("#showResults").css('opacity',1);
    // }

    $scope.viewRequest = function() {
        // var editor = $('#executedResult.CodeMirror')[0].CodeMirror;
        // editor.setValue( $scope.simulatedRequest );
        // $("#executedResult").val( $scope.simulatedRequest );
        $scope.dfxSampleJsonEditor.set($scope.simulatedRequest);
        $("#showResults").css('opacity',1);
    }

    $scope.renderFilters = function( renderedService ) {
        if (renderedService) {
            $scope.isEmptyFilterName = false;
            if ( renderedService.data.precode.length > 0 ) {
                for ( var i = 0; i < renderedService.data.precode.length; i++ ) {
                    if ( renderedService.data.precode[i].name === '' ) {
                        $scope.isEmptyFilterName = true;
                    }
                }
            }
            if ( renderedService.data.postcode.length > 0 ) {
                for ( var i = 0; i < renderedService.data.postcode.length; i++ ) {
                    if ( renderedService.data.postcode[i].name === '' ) {
                        $scope.isEmptyFilterName = true;
                    }
                }
            }
            if ( renderedService.data.appexpr.length > 0 ) {
                for ( var i = 0; i < renderedService.data.appexpr.length; i++ ) {
                    if ( renderedService.data.appexpr[i].name === '' ) {
                        $scope.isEmptyFilterName = true;
                    }
                }
            }
        };
    }

    $scope.closeServiceSidenav = function() {
        $scope.renderFilters( $scope.scopeService );
        if ( $scope.isEmptyFilterName && $scope.serviceModeBtn === 'serviceEdit' ) {
            dfxMessaging.showWarning("Filter name can't be empty");
            $scope.selected_service_tab = 2;
        } else {
            var sideNavInstance = $mdSidenav('side_nav_add_service');
            sideNavInstance.toggle();
            $scope.editFilterTitle = null;
        }
    };

    $scope.closeCurlSideNav = function() {
        var sideNavInstance = $mdSidenav('side_nav_curl');
        sideNavInstance.close();
    }

    $scope.goBackHome = function() {
        unsaved = true;
        $location.path('/home');
    }

    $scope.leaveApiSoEditor = function( ev, index ) {
        var confirm = $mdDialog.confirm()
            .title('Are you sure to exit the API service object editor?')
            .textContent('All changes will be lost.')
            .ariaLabel('leave API SO Editor')
            .targetEvent(ev)
            .cancel('Cancel')
            .ok('OK');
        $mdDialog.show(confirm).then(function() {
            $scope.goBackHome();
        }, function() {
        });
    };

    $scope.clearCache = function(type) {
        var obj = {type : type, application : $scope.app_name, name : $scope.scopeService.name};
        dfxApiServiceObjects.clearCache(obj).then(function(){
            dfxMessaging.showMessage("Сache has been successfully cleared");
        },function(err){
            dfxMessaging.showWarning(err);
        });
    }
}]);

dfxStudioApp.directive('dfxApiSoSources', ['$mdDialog', '$timeout', 'dfxApiServiceObjects', function($mdDialog, $timeout, dfxApiServiceObjects) {
    return {
        restrict: 'C',
        scope: true,
        link: function(scope, element, attrs) {
            scope.showApiSourceInfo = function(ev) {
                ev.stopImmediatePropagation();
                scope.singleGroup.checked = false;
                if ( scope.dataSource === 'StrongLoop' ) {
                    scope.restSource = true;
                    scope.strongLoopData();
                } else {
                    scope.restSource = false;
                }
                $mdDialog.show({
                    scope: scope.$new(),
                    parent: angular.element(document.body),
                    clickOutsideToClose: true,
                    ariaLabel: 'api-so-info',
                    templateUrl: 'studioviews/api_sources.html',
                    onComplete: function() {
                        scope.chooseRoute = function( route ) {
                            ev.stopImmediatePropagation();
                            scope.scopeService.name = route.name;
                            scope.scopeService.data = route.data;
                            if ( !route.data.parameters ) scope.scopeService.data.parameters = [];
                            if ( !route.data.precode ) scope.scopeService.data.precode = [];
                            if ( !route.data.postcode ) scope.scopeService.data.postcode = [];
                            if ( !route.data.appexpr ) scope.scopeService.data.appexpr = [];
                            scope.scopeService.data.settings.authentication = scope.selectedDataSource;
                            $mdDialog.hide();
                        }
                        scope.toggleInfo = function(ev) {
                            var triggerBtn = $(ev.target),
                                triggerConteiner = triggerBtn.parent().parent().siblings();
                            triggerBtn.toggleClass('opened');
                            triggerConteiner.slideToggle();
                        }
                        scope.triggerSource = function( ev ) {
                            var sourceElement = ev.target;
                            $(sourceElement).toggleClass('opened');
                            $(sourceElement).parent().siblings().slideToggle('opened');
                        }
                        scope.closeCatalog = function() {
                            scope.showListSources = false;
                            $mdDialog.hide();
                        }
                        scope.checkNodeName = function(ev){
                            return (ev.target.nodeName !='BUTTON' && ev.target.nodeName !='MD-CHECKBOX') ? true : false;
                        }
                    }
                })
            }
        }
    }
}]);

dfxStudioApp.controller("dfx_studio_api_so_category_controller", [ '$scope', '$routeParams', '$location', '$mdSidenav', '$mdDialog', '$timeout', 'dfxMessaging', 'dfxApplications', 'dfxAuthProviders', 'dfxApiServiceObjects', function( $scope, $routeParams, $location, $mdSidenav, $mdDialog, $timeout, dfxMessaging, dfxApplications, dfxAuthProviders, dfxApiServiceObjects) {
    $scope.app_name = $routeParams.appname;

    dfxApiServiceObjects.getCategories( $scope, $scope.app_name ).then(function( data ) {
        $scope.app_categories = data.data.querycats;
    });

    var bodyHeight = parseFloat($("body").css('height'));
    $timeout(function() {
        var scopeSourceTable = document.getElementById('scope-source-table');
        $(scopeSourceTable).css('max-height', bodyHeight-260);
    }, 0);

    $scope.addCategoryBtn = function() {
        $scope.scopeCategory = {};
        $scope.categoryMode = 'addCategory';
        var sideNavInstance = $mdSidenav('side_nav_api_category');
        sideNavInstance.toggle();
    }

    $scope.createCategory = function() {
        var regexp = /([a-z0-9_])(\w*)/gi;
        res = regexp.exec( $scope.scopeCategory.name );
        if ( res && $scope.scopeCategory.name && $scope.scopeCategory.name !== '' ) {
            dfxApiServiceObjects.createCategory( $scope, $scope.scopeCategory.name, $scope.app_name ).then(function( data ) {
                if ( data.status && data.status === 200 && data.data.data !== 'Current category name already exists' ) {
                    dfxMessaging.showMessage(data.data.data);
                    dfxApiServiceObjects.getCategories( $scope, $scope.app_name ).then(function( data ) {
                        $scope.app_categories = data.data.querycats;
                        $scope.getAll();
                    });
                    var sideNavInstance = $mdSidenav('side_nav_api_category');
                    sideNavInstance.toggle();
                } else {
                    dfxMessaging.showWarning("Current category name already exists");
                }
            });
        } else {
            dfxMessaging.showWarning('Not valid category name');
        }
    }

    $scope.editCategoryBtn = function( category ) {
        $scope.categoryMode = 'editCategory';
        $scope.scopeCategory = category;
        $scope.toEdit = {};
        var sideNavInstance = $mdSidenav('side_nav_api_category');
        sideNavInstance.toggle();
    }

    $scope.editCategory = function( edited ) {
        var newName = edited.name;
        var regexp = /([a-z0-9_])(\w*)/gi;
        res = regexp.exec( newName );
        if ( res && newName && newName !== $scope.scopeCategory.name ) {
            dfxApiServiceObjects.editCategory( $scope, $scope.scopeCategory.name, newName, $scope.app_name ).then(function( data ) {
                if ( data.data.data !== 'Current category name already exists' ) {
                    dfxMessaging.showMessage(data.data.data);
                    dfxApiServiceObjects.getCategories( $scope, $scope.app_name ).then(function( data ) {
                        $scope.app_categories = data.data.querycats;
                        $scope.getAll();
                    });
                    var sideNavInstance = $mdSidenav('side_nav_api_category');
                    sideNavInstance.toggle();
                } else {
                    dfxMessaging.showWarning("Current category name already exists");
                }
            });
        } else if ( newName === $scope.scopeCategory.name ) {
            dfxMessaging.showWarning('Category with such name already exists');

        } else {
            dfxMessaging.showWarning('Not valid category name');
        }
    }

    $scope.deleteCategory = function( category_name ) {
        dfxApiServiceObjects.removeCategory( $scope, category_name, $scope.app_name ).then(function( data ) {
            if ( data.status && data.status === 200 ) {
                dfxMessaging.showMessage(data.data.data);
                dfxApiServiceObjects.getCategories( $scope, $scope.app_name ).then(function( data ) {
                    $scope.app_categories = data.data.querycats;
                    $scope.getAll();
                });
            } else {
                dfxMessaging.showWarning(data.data.data);
            }
        });
    }

    $scope.confirmDelete = function( ev, category_name ) {
        var confirm = $mdDialog.confirm()
            .title('Are you sure you want to remove this category?')
            .textContent('Category will be removed from the repository.')
            .ariaLabel('remove service')
            .targetEvent(ev)
            .cancel('Cancel')
            .ok('OK');
        $mdDialog.show(confirm).then(function() {
            $scope.deleteCategory( category_name );
        }, function() {
        });
    };

    $scope.closeSidenav = function() {
        var sideNavInstance = $mdSidenav('side_nav_api_category');
        sideNavInstance.toggle();
    }
}]);
