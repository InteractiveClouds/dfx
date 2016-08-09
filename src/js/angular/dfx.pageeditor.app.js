var dfxPageEditorApp = angular.module("dfxPageEditorApp", ['ngMaterial', 'dfxStudioApi']);

dfxPageEditorApp.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('altTheme')
        .primaryPalette('blue') // specify primary color, all
    // other color intentions will be inherited
    // from default
    $mdThemingProvider.setDefaultTheme('altTheme');
});

dfxPageEditorApp.controller("dfx_main_controller", [ '$scope', '$rootScope', '$q', '$http', '$mdDialog', '$mdSidenav', 'dfxViews', function($scope, $rootScope, $q, $http, $mdDialog, $mdSidenav, dfxViews) {
	$scope.application_name = $('#dfx-page-editor-body').attr('data-application');
    $scope.page_name = $('#dfx-page-editor-body').attr('data-page');
    $scope.page_platform = $('#dfx-page-editor-body').attr('data-platform');
    $scope.app_view_catalog = {};


    dfxViews.getByApp( $scope, $scope.application_name, $scope.page_platform )
    .then( function(data) {
        for (var i=0; i<data.views.length; i++) {
            if ($scope.app_view_catalog[data.views[i].category]==null) {
                $scope.app_view_catalog[data.views[i].category] = [];
            }
            $scope.app_view_catalog[data.views[i].category].push(data.views[i]);
        }
    });

	$scope.loadPage = function() {
        return '/studio/screen/editui/' + $scope.application_name + '/' + $scope.page_name + '/' + $scope.page_platform;
    };
}]);

dfxPageEditorApp.controller("dfx_page_editor_controller", [ '$scope', '$rootScope', '$compile', '$timeout', '$mdDialog', '$mdToast', '$log', '$mdSidenav', '$window', 'dfxPages','dfxTemplates', 'dfxMessaging', function($scope, $rootScope, $compile, $timeout, $mdDialog, $mdToast, $log, $mdSidenav, $window, dfxPages, dfxTemplates, dfxMessaging) {

    $scope.palette_visible = true;
    $scope.property_visible = true;
    $scope.selected_page = null;
    $scope.selected_template = null;
    $scope.templatePropertyEditMode = false;
    $scope.templates = [];
    $scope.design_visible = true;
    $scope.script_visible = false;
    $scope.design_view_mode = 'Design';
    $scope.script_theme = (localStorage.getItem('DFX_script_theme')!=null) ? localStorage.getItem('DFX_script_theme') : 'monokai';
    $scope.preview_wait_icon_visible = false;

    if ($scope.page_platform=='web') {
        $('#dfx_page_editor_workspace').css( 'width', '100%' );
    } else {
        $('#dfx_page_editor_workspace').css( 'width', '316px' );
        $('#dfx_page_editor_workspace').css( 'margin-top', '110px' );
        $('#dfx_page_editor_workspace').css( 'margin-bottom', '24px' );
        $('#dfx_page_editor_workspace').css( 'max-height', '564px' );
        $('#dfx_page_editor_container').css( 'background', 'url("/images/iphone_5_320x568.png") no-repeat' );
        $('#dfx_page_editor_container').css( 'background-position-x', '50%' );
    }

    $scope.toggleLeft = function() {
        $scope.palette_visible = !$scope.palette_visible;
        if ($scope.palette_visible) {
            $('#dfx-pe-toggle-palette-icon').addClass('fa-angle-double-left');
            $('#dfx-pe-toggle-palette-icon').removeClass('fa-angle-double-right');
            $('#dfx-pe-palette-title').removeClass('dfx-pe-palette-title-collapsed');
            $('#dfx-pe-palette-title-text').removeClass('dfx-pe-palette-title-text-collapsed');
        } else {
            $('#dfx-pe-palette-title').addClass('dfx-pe-palette-title-collapsed');
            $('#dfx-pe-palette-title-text').addClass('dfx-pe-palette-title-text-collapsed');
            $('#dfx-pe-toggle-palette-icon').removeClass('fa-angle-double-left');
            $('#dfx-pe-toggle-palette-icon').addClass('fa-angle-double-right');
        }
    };
    $scope.toggleRight = function() {
        $scope.property_visible = !$scope.property_visible;
        if ($scope.property_visible) {
            $('#dfx-pe-toggle-property-icon').removeClass('fa-angle-double-left');
            $('#dfx-pe-toggle-property-icon').addClass('fa-angle-double-right');
            $('#dfx-pe-property-title').removeClass('dfx-pe-property-title-collapsed');
            $('#dfx-pe-property-title-text').removeClass('dfx-pe-property-title-text-collapsed');
        } else {
            $('#dfx-pe-property-title').addClass('dfx-pe-property-title-collapsed');
            $('#dfx-pe-property-title-text').addClass('dfx-pe-property-title-text-collapsed');
            $('#dfx-pe-toggle-property-icon').addClass('fa-angle-double-left');
            $('#dfx-pe-toggle-property-icon').removeClass('fa-angle-double-right');
        }
    };

    $scope.exitPageEditor = function(ev) {
        var confirm = $mdDialog.confirm()
          .title('Exit')
          .textContent('Do you confirm you want to exit the editor?')
          .ariaLabel('Exit')
          .targetEvent(ev)
          .ok('OK')
          .cancel('Cancel');
        $mdDialog.show(confirm).then(function() {
          $window.close();
        }, function() {
          // do nothing
        });
    };

    $scope.loadPageDefinition = function() {
        dfxPages.getOne( $scope, $scope.application_name, $scope.page_name, $scope.page_platform )
        .then( function(page) {
            $scope.selected_page = page;
            $scope.loadPageTemplate(page.template);

            var htmlTextArea = document.getElementById('dfx_pe_script_editor');
            var src_editor = CodeMirror( function (elt) {
                htmlTextArea.parentNode.replaceChild(elt, htmlTextArea);
                },
                {
                    lineNumbers: true,
                    value: $('#dfx_pe_script_editor').text(),
                    mode: {name: 'application/json', globalVars: true},
                    matchBrackets: true,
                    highlightSelectionMatches: {showToken: /\w/},
                    styleActiveLine: true,
                    viewportMargin : Infinity,
                    extraKeys: {"Alt-F": "findPersistent", "Ctrl-Space": "autocomplete"}
                });
            $(src_editor.getWrapperElement()).attr('id', 'dfx_pe_script_editor');
            src_editor.setValue(page.script);
            src_editor.setSize(null, window.innerHeight - 59);
            src_editor.refresh();
        });
    };

    $scope.loadPageTemplates = function() {
        dfxTemplates.getAll( $scope, $scope.application_name )
        .then( function(templates) {
            $scope.templates = templates;
        });
    };

    $scope.loadPageTemplate = function(template) {
        dfxTemplates.getOne( $scope, $scope.application_name, template )
        .then( function(template) {
            $scope.selected_template = template;
            var snippet = '<div layout="column" flex dfx-page-template="' + template.name + '"></div>';
            $('#dfx_page_editor_workspace').empty();
            angular.element(document.getElementById('dfx_page_editor_workspace')).append($compile(snippet)($scope));
        });
    };

    $scope.changePageTemplate = function() {
        $scope.loadPageTemplate($scope.selected_page.template);
    }

    $scope.changeViewMode = function (view_mode) {
        if (view_mode=='design') {
            $scope.design_view_mode = 'Design';
            $scope.showDesign();
        } else if (view_mode=='script') {
            $scope.design_view_mode = 'Script';
            $scope.showScript();
        }
    };

    $scope.showDesign = function() {
        $scope.design_visible = true;
        $scope.script_visible = false;
        $('#dfx_pe_script_editor').css('display', 'none');
    };
    $scope.showScript = function() {
        $scope.design_visible = false;
        $scope.script_visible = true;
        $('#dfx_pe_script_editor').css('display', 'block');
        $timeout( function() {
            var editor = $('#dfx_pe_script_editor')[0].CodeMirror;
            editor.scrollTo(0, 0);
            editor.refresh();
            $('#dfx_pe_script_editor').click();
        }, 0);
    };

    $scope.addLayoutRow = function() {
        $scope.selected_page.layout.rows.push( {"columns": [{ "width":"100", "views":[] }] } );
    };

    $scope.deleteLayoutRow = function(row_id) {
        $scope.selected_page.layout.rows.splice( row_id, 1 );
    };

    $scope.addLayoutColumn = function(row_id) {
        $scope.selected_page.layout.rows[row_id].columns.push( { "width":"25", "views":[] } );
    };

    $scope.deleteLayoutColumn = function(row_id, col_id) {
        $scope.selected_page.layout.rows[row_id].columns.splice( row_id, 1 );
    };

    $scope.editTemplateProperty = function() {
         $scope.templatePropertyEditMode = true;
    };

    $scope.saveTemplateProperty = function() {
        dfxTemplates.update( $scope, $scope.selected_template )
            .then( function(template) {
               dfxMessaging.showMessage( 'The template ' + $scope.selected_template.name + ' has been updated' );
            });
        $scope.templatePropertyEditMode = false;
    };

    $scope.saveTemplatePropertyAs = function($event) {
        var parentEl = angular.element(document.body);

        $mdDialog.show({
            parent: parentEl,
            targetEvent: $event,
            clickOutsideToClose: true,
            scope: $scope.$new(),
            templateUrl: '/studio/studioviews/saveas_page_template.html',
            controller: DialogController
        });

        function DialogController($scope, $mdDialog) {
            $scope.template = {
                "name":   ''
            }


            $scope.saveAsTemplate = function() {
                var nameExp = /([\\/\-+(){}[\]=<>*~`?\! '\"',.;:$@#])/ig,
                    nameRes = nameExp.exec( $scope.template.name );

                if ( !nameRes && $scope.template.name !== '' ) {
                    $scope.selected_template.name = $scope.template.name;
                    $scope.selected_page.template = $scope.template.name;
                    dfxTemplates.create( $scope, $scope.selected_template )
                        .then( function(template) {
                           dfxMessaging.showMessage( 'The template ' + $scope.template.name + ' has been created' );
                           $scope.loadPageTemplates();
                        });
                    $scope.templatePropertyEditMode = false;
                    $scope.closeDialog();
                } else {
                    dfxMessaging.showWarning('Not a valid Template Name');
                }
            }

            $scope.closeDialog = function() {
                $mdDialog.hide();
            }
        }

    };

    $scope.cancelTemplateProperty = function() {
         $scope.templatePropertyEditMode = false;
    };

    $scope.editContent = function(ev, property) {
        $('#pagebody').css('z-index', '0');
        $mdDialog.show({
            scope: $scope.$new(),
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            templateUrl: '/gcontrols/web/page_html_editor_template.html',
            onComplete:function(scope){
                var myTextArea = document.getElementById('dfx_html_editor');
                var scriptEditor = CodeMirror(function (elt) {
                        myTextArea.parentNode.replaceChild(elt, myTextArea);
                    },
                    {
                        lineNumbers: true,
                        value: (scope.selected_template.layout[property].content.value),
                        mode: {name: "xml", globalVars: true},
                        matchBrackets: true,
                        highlightSelectionMatches: {showToken: /\w/},
                        styleActiveLine: true,
                        viewportMargin : Infinity,
                        extraKeys: {"Alt-F": "findPersistent", "Ctrl-Space": "autocomplete"},
                        lineWrapping: true
                    });
                scriptEditor.setSize(800, 400);
                $(scriptEditor.getWrapperElement()).attr("id", "dfx_html_editor");
            },
            controller: function(scope){
                scope.closeDialog = function() {
                    $mdDialog.hide();
                    $('#pagebody').css('z-index', '51');
                }
                scope.saveDialog = function() {
                    var editor = $('#dfx_html_editor.CodeMirror')[0].CodeMirror;
                    scope.selected_template.layout[property].content.value = editor.getValue();
                    $mdDialog.hide();
                    $('#pagebody').css('z-index', '51');
                }
            }
        })
    };

    $scope.savePageDefinition = function() {
        var editor = $('#dfx_pe_script_editor')[0].CodeMirror;
        $scope.selected_page.script = editor.getValue();
        dfxPages.update( $scope, $scope.selected_page ).then( function(data) {
            dfxMessaging.showMessage( 'The page ' + $scope.selected_page.name + ' has been saved' );
        });
    };

    $scope.openPreview = function() {
        $scope.preview_wait_icon_visible = true;
        dfxPages.preview('/studio/screen/preview/' + $scope.application_name + '/' + $scope.page_name + '/' + $scope.page_platform)
            .then(function(response){
                $scope.preview_wait_icon_visible = false;
                if (response.data.indexOf('http') > -1) {
                    $window.open(response.data, '_blank');
                } else {
                    dfxMessaging.showWarning(response.data);
                }
            },function(err){
                $scope.preview_wait_icon_visible = false;
                dfxMessaging.showWarning("Unable to call DreamFace Compiler");
            })
    };

    $scope.moveView = function(item, view_id, view_name, from_row_id, from_col_id) {
        $timeout( function() {
            var target = item.parentElement;
            if (from_row_id>-1) {
                var arr_ref = $scope.selected_page.layout.rows[from_row_id].columns[from_col_id].views;
                for (var i=0; i<arr_ref.length; i++) {
                    if (arr_ref[i].id==view_id) {
                        arr_ref.splice(i, 1);
                        break;
                    }
                }
            }
            $('div', target).each( function(idx) {
                if ($(this).attr('data-view-id')==view_id) {
                    if (from_row_id==-1) {
                        $(this).remove();
                    }
                    var row_id = parseInt($(target).attr('data-row'));
                    var col_id = parseInt($(target).attr('data-column'));
                    $scope.selected_page.layout.rows[row_id].columns[col_id].views.splice(idx, 0, {"id": view_id, "name": view_name});
                    // The following line forces to recalculate the ng-repeat
                    $scope.selected_page.layout.rows[row_id].columns[col_id].views = angular.copy($scope.selected_page.layout.rows[row_id].columns[col_id].views);
                }
            });
        }, 0);
    };

    $scope.loadViewMenu = function($event, row_id, col_id, view_id) {
        $event.stopImmediatePropagation();
        $scope.closeViewMenu();
        var snippet = '<md-whiteframe style="left:'+($event.x-5)+'px;top:'+($event.y-5)+'px;width:175px;" class="md-whiteframe-4dp dfx-view-menu" ng-mouseleave="closeViewMenu()">';
        snippet += '<div><a ng-click="removeView(' + row_id + ', ' + col_id + ', ' + view_id + ')">Remove the view</a></div>';
        snippet += '</md-whiteframe>';
        angular.element(document.getElementById('dfx_page_editor')).append($compile(snippet)($scope));
    };

    $scope.closeViewMenu = function($event) {
        $('.dfx-view-menu').remove();
    };

    $scope.removeView = function(row_id, col_id, view_id) {
        $scope.closeViewMenu();
        $timeout( function() {
            var arr_ref = $scope.selected_page.layout.rows[row_id].columns[col_id].views;
            for (var i=0; i<arr_ref.length; i++) {
                if (arr_ref[i].id==view_id) {
                    arr_ref.splice(i, 1);
                    break;
                }
            }
            // The following line forces to recalculate the ng-repeat
            $scope.selected_page.layout.rows[row_id].columns[col_id].views = angular.copy($scope.selected_page.layout.rows[row_id].columns[col_id].views);
        }, 0);
    };

    $scope.loadPageTemplates();
    $scope.loadPageDefinition();
}]);

dfxPageEditorApp.directive( 'dfxPageIncludeTemplate', function($compile) {
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

dfxPageEditorApp.directive('dfxPageTemplate', ['$compile', '$mdSidenav', function($compile, $mdSidenav) {
    return {
        restrict: 'A',
        link: function($scope, $element, $attrs) {
            var tpl_snippet = '';

            // Header
            tpl_snippet = '<div layout="row" ng-show="selected_template.layout.header.display==\'true\'"><div layout-align="{{selected_template.layout.header.halignment}} {{selected_template.layout.header.valignment}}" flex="100" style="height:{{selected_template.layout.header.height}};{{selected_template.layout.header.style}}" dfx-page-include-template="header"></div></div>';

            // Middle Section Start
            tpl_snippet += '<div layout="row" style="position:relative;{{selected_template.layout.body.style}}" flex>';

            // Left
            tpl_snippet += '<div id="dfxpageleft" ng-show="selected_template.layout.left.display==\'true\'" style="width:{{selected_template.layout.left.width}};{{selected_template.layout.left.style}};z-index:50;" class="{{selected_template.layout.left.whiteframe}}"><md-content layout="column" layout-align="{{selected_template.layout.left.halignment}} {{selected_template.layout.left.valignment}}" style="background:inherit" dfx-page-include-template="left"></md-content></div>';

            // Body
            tpl_snippet += '<div layout="column" style="background:inherit;z-index: 51;border:1px #37474F solid;overflow:auto;" layout-padding class="content-wrapper" flex id="pagebody">';

            tpl_snippet += '<div layout="row" style="" flex="{{selected_page.autoHeight != true ? row.height : \'\'}}" ng-repeat="row in selected_page.layout.rows">';
            tpl_snippet += '<div layout="column" flex="{{col.width}}" class="dfx-page-droppable-column" dfx-page-droppable-column data-row="{{$parent.$index}}" data-column="{{$index}}" ng-repeat="col in row.columns" style="border:1px #999 solid;">';
            tpl_snippet += '<div ng-repeat="view in col.views" dfx-page-sortable-view class="{{(view.fit==\'content\') ? \'\' : \'flex\'}} md-whiteframe-3dp" style="letter-spacing:0.2em;background:#4cd5f3;color:#383838;cursor:pointer;" layout="row" layout-align="center center" data-view-id="{{view.id}}" data-view="{{view.name}}"><div class= "dfx-pe-view-menu"><span>{{view.name}}</span><a ng-click="loadViewMenu($event, $parent.$parent.$index, $parent.$index, view.id)" class="dfx-pe-view-menu-item"><i class="fa fa-gear"></i></a></div></div>';
            tpl_snippet += '</div>';
            tpl_snippet += '</div>';

            tpl_snippet += '</div>';

            // Right
            tpl_snippet += '<div id="dfxpageright" ng-show="selected_template.layout.right.display==\'true\'" style="width:{{selected_template.layout.right.width}};{{selected_template.layout.right.style}};z-index:50;" class="{{selected_template.layout.right.whiteframe}}"><md-content layout layout-align="{{selected_template.layout.right.halignment}} {{selected_template.layout.right.valignment}}" style="background:inherit" dfx-page-include-template="right"></md-content></div>';

            // Middle Section End
            tpl_snippet += '</div>';

            // Footer
            tpl_snippet += '<div layout="row" ng-show="selected_template.layout.footer.display==\'true\'"><div layout layout-align="{{selected_template.layout.footer.halignment}} {{selected_template.layout.footer.valignment}}" flex="100" style="height:{{selected_template.layout.footer.height}};{{selected_template.layout.footer.style}}"  dfx-page-include-template="footer"></div></div>';

            $element.append($compile(tpl_snippet)($scope));
        }
    }
}]);

dfxPageEditorApp.directive('dfxPageDraggableView', [function() {
    return {
        restrict: 'A',
        controller: function($scope, $element, $attrs) {
            $($element).draggable({
                appendTo:          "body",
                cursorAt:          {top: 5, left: 20},
                cursor:            "move",
                helper: function(event) {
                    var helper_snippet = '<div class="md-whiteframe-z2" style="width:120px;height:50px;letter-spacing: 0.2em;color:#383838;background:#4cd5f3;line-height:50px;text-align:center;vertical-align:middle;white-space: nowrap;text-overflow: ellipsis; overflow: hidden; padding: 0 5px;">' + $element.text() + '</div>';
                    return helper_snippet;
                },
                zIndex: 2000,
                connectToSortable: ".dfx-page-droppable-column"
            });

        }
    }
}]);

dfxPageEditorApp.directive('dfxPageSortableView', [function() {
    return {
        restrict: 'A',
        controller: function($scope, $element, $attrs) {

        }
    }
}]);

dfxPageEditorApp.directive('dfxPageDroppableColumn', [function() {
    return {
        restrict: 'A',
        controller: function($scope, $element, $attrs) {
           $($element).sortable({
                appendTo: "body",
                connectWith: ".dfx-page-droppable-column",
                cursor: "move",
                helper: function(event) {
                    var width = $(event.toElement).css( 'width' );
                    var height = $(event.toElement).css( 'height' );
                    var snippet = '<div class="md-whiteframe-z2 layout-align-center-center layout-row" style="letter-spacing: 0.2em;color:#fff;background:#455A64;width:' + width + ';height:' + height + '"><span>' + $(event.toElement).text() + '</span></div>';
                    return snippet;
                },
                start: function (event, ui) {
                    $(ui.placeholder).html('<div style="border:3px #00c3f3 dashed;min-width:50px;height:30px;"></div>');
                },
                stop: function (event, ui) {
                    var draggable_view = ui.item[0];
                    if ($(draggable_view).attr('dfx-page-draggable-view')==null) {
                        var view_id = $(draggable_view).attr('data-view-id');
                        var view_name = $(draggable_view).attr('data-view');
                        var row_id = parseInt($(event.target).attr('data-row'));
                        var col_id = parseInt($(event.target).attr('data-column'));
                        $scope.moveView( draggable_view, view_id, view_name, row_id, col_id );
                    } else {
                        var view_id = Math.floor(Math.random() * 100000);
                        $(draggable_view).css('display', 'none');
                        $(draggable_view).attr('data-view-id', view_id);
                        var view_name = $(draggable_view).text();
                        var row_id = -1;
                        var col_id = -1;
                        $scope.moveView( draggable_view, view_id, view_name, row_id, col_id );
                    }
                }
            });
        }
    }
}]);

dfxPageEditorApp.directive('dfxPageProperties', [ function() {
    return {
        restrict: 'A',
        templateUrl: function( el, attrs ) {
            return '/studio/studioviews/page_properties_edit.html';
        },
        link: function(scope, element, attrs) {
        }
    }
}]);


dfxPageEditorApp.controller("dfx_view_controller", [ '$scope', function($scope) {

}]);

dfxPageEditorApp.directive('dfxView', [ '$http', '$timeout', function($http, $timeout) {
    return {
        restrict: 'A',
        controller: function($scope, $element, $attrs) {
            $element.html( '<div style="width:100%;height:100%;background:#8EC3F1;color:#000;text-align:center"><span style="vertical-align:middle">' + $attrs.dfxView + '</span></div>' );
        }
    }
}]);
