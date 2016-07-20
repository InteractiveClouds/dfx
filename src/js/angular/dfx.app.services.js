var dfxAppServices = angular.module('dfxAppServices',[]);

dfxAppServices.factory('dfxAuthRequest', function() {

    var aut_request = {};

    aut_request.send = function( config, callback) {
        authRequest( config ).then( function(data) {
            callback(data);
        });
    };
    
    return aut_request;
});

dfxAppServices.factory('dfxDialog', [ '$mdDialog', '$mdToast', function($mdDialog, $mdToast) {

    var dialog = {};

    dialog.showMessage = function (message) {
        $mdToast.show(
          $mdToast.simple()
            .textContent(message)
            .theme('success-toast')
            .position('top right')
            .hideDelay(3000)
        );
    };

    dialog.showWarning = function (message) {
        $mdToast.show(
          $mdToast.simple()
            .textContent(message)
            .theme('warn-toast')
            .position('top right')
            .hideDelay(3000)
        );
    };

    dialog.showError = function (message) {
        $mdToast.show(
          $mdToast.simple()
            .textContent(message)
            .theme('error-toast')
            .position('top right')
            .hideDelay(3000)
        );
    };

    dialog.showWaitingMessage = function( data ) {
        var content = (data.type && data.type === 'progress') ? '<md-progress-linear md-mode="indeterminate"></md-progress-linear>'
            : '<i class="fa fa-spinner fa-spin fa-3x fa-fw"></i>';
        if (!data.message) data.message = '';
        var template = '<md-dialog aria-label="textarea" ng-cloak flex="' + data.flexWidth +'">'
            + '<md-dialog-content style="padding:10px 10px; height: ' + data.height +';">'
            + '<h2 align="center">'  + data.message  + '</h2>'
            +  '<div align="center">' + content + '</div>'
            + '</md-dialog-content>'
            + '</md-dialog>';

        $mdDialog.show({
            parent : angular.element(document.body),
            clickOutsideToClose: false,
            escapeToClose: false,
            template: template
        });
        return $mdDialog;
    };

    dialog.showHTML = function( data ) {
        var generateButtonsContent = function() {
            var content = "";
            data.buttons.forEach(function(button) {
                content += '<md-button class="md-primary" ng-click="' + button.action + '">' + button.name + '</md-button>';
            });
            return content;
        }
            var template = '<md-dialog aria-label="textarea" ng-cloak flex="' + data.flexWidth +'">'
                    + '<form>'
                    + '<md-toolbar><div class="md-toolbar-tools">'
                    + '<h2>' + data.title +'</h2>'
                    + '</div></md-toolbar>'
                    + '<md-dialog-content style="padding:10px 10px; height: ' + data.height +';">'
                    +  data.html
                    + '</md-dialog-content>'
                    + '<div class="md-actions">'
                    + generateButtonsContent()
                    + '</div>'
                    + '</form>'
                    + '</md-dialog>';


            $mdDialog.show({
                parent : angular.element(document.body),
                clickOutsideToClose: true,
                escapeToClose: true,
                scope : data.scope,
                preserveScope : true,
                template: template
            });
        return $mdDialog;
    };

    dialog.showView = function( data ) {
        var view_object = $('#' + data.scope._view_id)[0];
        var component_id = $('div:first',view_object).attr('id');

        var generateButtonsContent = function() {
            var content = "";
            data.buttons.forEach(function(button) {
                content += '<md-button class="md-primary" ng-click="' + button.action + '">' + button.name + '</md-button>';
            });
            return content;
        }
        var template = '<md-dialog aria-label="textarea" ng-cloak flex="' + data.flexWidth +'">'
            + '<form>'
            + '<md-toolbar><div class="md-toolbar-tools">'
            + '<h2>' + data.title +'</h2>'
            + '</div></md-toolbar>'
            + '<md-dialog-content style="padding:10px 10px; height: ' + data.height +';">'
            + '<div dfx-view-preview-in-dialog="' + data.viewName +'" dfx-card = "' + data.cardName +'" id="' + data.scope._view_id +'" ng-controller="dfx_view_controller">'
            + '<div id="dfx_view_preview_container_in_dialog_' + component_id + '"></div>'
            + '</div>'
            + '</md-dialog-content>'
            + '<div class="md-actions">'
            + generateButtonsContent()
            + '</div>'
            + '</form>'
            + '</md-dialog>';


        $mdDialog.show({
            parent : angular.element(document.body),
            clickOutsideToClose: true,
            escapeToClose: true,
            scope : data.scope,
            preserveScope : true,
            template: template
        });
        return $mdDialog;
    }

    return dialog;
}]);

dfxAppServices.factory('dfxSidenav', [ '$mdSidenav', '$compile', '$timeout', function( $mdSidenav, $compile, $timeout) {

    var sideNav = {};

    sideNav.showView = function(data) {
        var view_object = $('#' + data.scope._view_id)[0];
        var component_id = $('div:first',view_object).attr('id');


        var side_nav_id = component_id + "-" + ((data.position == 'left') ? 'sidenav-left' : 'sidenav-right');
        var side_nav_width = data.width ? data.width : '300px';
        $( "md-sidenav[md-component-id='" + component_id + "-sidenav-left']" ).html("");
        $( "md-sidenav[md-component-id='" + component_id + "-sidenav-right']" ).html("");

        var template = '<md-content layout-padding style="padding:0px;">'
            + '<div dfx-view-preview-in-sidenav="' + data.viewName +'" dfx-card = "' + data.cardName +'" ng-controller="dfx_view_controller" id="' + data.scope._view_id +'" style="padding:0px;">'
            + '<div id="dfx_view_preview_container_in_sidenav_' + component_id +'" style="padding:0px;"></div>'
            + '</div>'
            + '</md-content>';

        var compiled = $compile(template)(data.scope);

        $( "md-sidenav[md-component-id='" + side_nav_id + "']").html(compiled);
        $( "md-sidenav[md-component-id='" + side_nav_id + "']").css({'min-width': side_nav_width, 'max-width': side_nav_width , 'width': side_nav_width});



        var sideNavInstance = $mdSidenav(side_nav_id);
        sideNavInstance.toggle();
        return sideNavInstance;

    }

    sideNav.showHTML = function(data) {
        var view_object = $('#' + data.scope._view_id)[0];
        var component_id = $('div:first',view_object).attr('id');

        var side_nav_id = component_id + "-" + ((data.position == 'left') ? 'sidenav-left' : 'sidenav-right');
        var side_nav_width = data.width ? data.width : '300px';
        $( "md-sidenav[md-component-id='" + component_id + "-sidenav-left']" ).html("");
        $( "md-sidenav[md-component-id='" + component_id + "-sidenav-right']" ).html("");

        var template = '<md-content layout-padding>'
            + data.html
            + '</md-content>';

        var compiled = $compile(template)(data.scope);
        var sideNavInstance = $mdSidenav(side_nav_id);
        $timeout(function(){
            $( "md-sidenav[md-component-id='" + side_nav_id + "']").html(compiled);
            $( "md-sidenav[md-component-id='" + side_nav_id + "']").css({'min-width': side_nav_width, 'max-width': side_nav_width , 'width': side_nav_width});
            sideNavInstance.toggle();
        },false);



        return sideNavInstance;


    }

    return sideNav;
}]);

dfxAppServices.directive('dfxSidenavAndBottomsheet', [ '$compile', '$timeout', function( $compile, $timeout) {
    return {
        restrict: 'A',
        controller: function($scope, $element, $attrs) {
            $timeout(function(){
                var component_id = $attrs.dfxSidenavAndBottomsheet;
                var content = '<md-sidenav md-component-id="' + component_id +'-sidenav-left"  class="md-sidenav-left" > </md-sidenav>'
                    + '<md-sidenav md-component-id="' + component_id +'-sidenav-right"  class="md-sidenav-right" > </md-sidenav>'
                    + '<div id="' + component_id +'-bottom-sheet"> </div>';
                var compiled_content = $compile(content)($scope);
                $element.append(compiled_content);
            },1000);
        }
    }
}]);

dfxAppServices.factory('dfxBottomSheet', [ '$mdBottomSheet', function($mdBottomSheet) {

    var bottomSheet = {};

    bottomSheet.showHTML = function( data ) {
        var view_object = $('#' + data.scope._view_id)[0];
        var component_id = $('div:first',view_object).attr('id');

        $("#" + component_id + "-bottom-sheet").html("");
        var template = '<md-bottom-sheet style="bottom:80px;" ng-cloak>'
            + data.html
            + '</md-bottom-sheet>';
        $mdBottomSheet.show({
            clickOutsideToClose: true,
            escapeToClose: true,
            scope : data.scope,
            preserveScope : true,
            template: template,
            parent : angular.element($("#" + component_id + "-bottom-sheet"))
        });
        return $mdBottomSheet;
    };

    bottomSheet.showView = function( data ) {
        var view_object = $('#' + data.scope._view_id)[0];
        var component_id = $('div:first',view_object).attr('id');

        $("#" + component_id + "-bottom-sheet").html("");
        var template = '<md-bottom-sheet style="padding:0px; bottom:80px;" ng-cloak>'
            + '<div dfx-view-preview-in-bottom="' + data.viewName +'" dfx-card = "' + data.cardName +'" ng-controller="dfx_view_controller" id = "' + data.scope._view_id +'" style="padding:0px;">'
            + '<div id="dfx_view_preview_container_in_bottom_' + component_id + '" style="padding:0px;"></div>'
            + '</div>'
            + '</md-bottom-sheet>';


        $mdBottomSheet.show({
            clickOutsideToClose: true,
            escapeToClose: true,
            scope : data.scope,
            preserveScope : true,
            template: template,
            parent : angular.element($("#" + component_id + "-bottom-sheet"))
        });
        return $mdBottomSheet;
    }

    return bottomSheet;
}]);

// Deprecated, replaced by dfxApiServices
dfxAppServices.factory('dfxApiRoutes', [ 'dfxUtil', function(dfxUtil) {

    var api_route = {};

    api_route.get = function( scope, route, req_data, callback, object_path, assigned_variable ) {
        requestAPIRoute({
            url:route,
            type:'get',
            data:req_data || {}
        })
            .then(function(res){
                if (object_path!=null) {
                    var arr_props = (object_path=='') ? [] : object_path.split('.');
                    var ref_prop = res.data;
                    for (var i=0; i<arr_props.length; i++) {
                        ref_prop = ref_prop[arr_props[i]];
                    }
                    try {
                        scope.$apply( function() {
                            dfxUtil.arrayAppend( assigned_variable, ref_prop );
                        });
                    } catch(err) {
                        console.log( 'API Route Call: Bad assigned variable or object path');
                    }
                }
                callback(res.data);
            })
    };

    api_route.post = function( scope, route, req_params, req_body, callback ) {
        requestAPIRoute({
            url:route,
            type:'post',
            data:{
                params : req_params || {},
                body : req_body || {}
            }
        })
            .then(function(res){
                callback(res.data);
            })
    };
    return api_route;
}]);

dfxAppServices.factory('dfxApiServices', [ 'dfxApiServiceObjects',  function( dfxApiServiceObjects ) {

    var api_services = {};

    api_services.get = function( scope, route, req_data, cache) {
        if (cache) req_data.cache = cache;
        return requestAPIRoute({
            url:route,
            type:'get',
            data: {
                data  : req_data || {},
                cache : cache ? cache : null
            }
        });
    };

    api_services.post = function( scope, route, req_params, req_body, cache) {
        return requestAPIRoute({
            url:route,
            type:'post',
            data:{
                params : req_params || {},
                body : req_body || {},
                cache : cache ? cache : null
            }
        });
    };

    api_services.clearCache = function(o) {
        var obj = {
            type : o.type,
            application : o.application,
            name : o.name
        };
        return dfxApiServiceObjects.clearCache(obj);
    }

    return api_services;
}]);

dfxAppServices.factory('dfxChangeCard', [ '$compile', '$timeout',  function( $compile, $timeout ) {
    var obj = {};
    obj.showCard = function( data ) {
        $timeout(function(){
            data.scope.dfxViewCard = data.cardName;
        },0);
    }
    return obj;
}]);

dfxAppServices.factory('dfxUtil', [ function() {

    var api_util = {};

    api_util.arrayAppend = function( array_one, array_two ) {
        if (array_one == null) {
            array_one = [];
        } else {
            array_one.splice( 0, array_one.length );
        }
        for (var i=0; i<array_two.length; i++) {
            array_one.push(array_two[i]);
        }
    };

    return api_util;
}]);