var dfxGcTemplateEditorApp = angular.module("dfxGcTemplateEditorApp", ['ngMaterial', 'ngMdIcons', 'dfxGControls', 'dfxStudioApi', 'nsPopover']);

dfxGcTemplateEditorApp.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('altTheme')
        .primaryPalette('blue') // specify primary color, all
    // other color intentions will be inherited
    // from default
    $mdThemingProvider.setDefaultTheme('altTheme');
});

dfxGcTemplateEditorApp.controller("dfx_main_gc_template_controller", [ '$scope', '$rootScope', '$q', '$http', '$mdDialog', '$compile', function($scope, $rootScope, $q, $http, $mdDialog, $compile) {
    $rootScope.message = "Welcome to the GC Template Editor";
    $scope.is_gc_template_editor = true;
    $scope.application_name = $('#dfx-view-editor-body').attr('data-application');
    $scope.view_platform = $('#dfx-view-editor-body').attr('data-platform');
    $scope.gc_template_name = $('#dfx-view-editor-body').attr('data-gctemplate');
    $scope.gc_types = {};

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
    };

    $scope.initContainers = function() {};

    $scope.loadGcTemplate = function() {
        return '/studio/gctemplates/editui/' + $scope.application_name + '/' + $scope.gc_template_name + '/' + $scope.view_platform;
    };

}]);

dfxGcTemplateEditorApp.controller("dfx_gc_template_editor_controller", [ '$scope', '$rootScope', '$compile', '$timeout', '$mdDialog', '$mdToast', '$mdSidenav', '$log', '$mdMedia', '$window', '$http', 'dfxMessaging', 'dfxGcTemplates', function($scope, $rootScope, $compile, $timeout, $mdDialog, $mdToast, $mdSidenav, $log, $mdMedia, $window, $http, dfxMessaging, dfxGcTemplates) {

    $scope.property_visible = true;
    $scope.design_visible = true;
    $scope.source_visible = false;
    $scope.design_view_mode = 'Design';

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

    $scope.toggleRight = function() {
        $scope.property_visible = !$scope.property_visible;
        if ($scope.property_visible) {
            $('#dfx-ve-toggle-property-icon').removeClass('fa-angle-double-left');
            $('#dfx-ve-toggle-property-icon').addClass('fa-angle-double-right');
            $('#dfx-ve-property-title').removeClass('dfx-ve-property-title-collapsed');
            $('#dfx-ve-property-title-text').removeClass('dfx-ve-property-title-text-collapsed');
        } else {
            $('#dfx-ve-property-title').addClass('dfx-ve-property-title-collapsed');
            $('#dfx-ve-property-title-text').addClass('dfx-ve-property-title-text-collapsed');
            $('#dfx-ve-toggle-property-icon').addClass('fa-angle-double-left');
            $('#dfx-ve-toggle-property-icon').removeClass('fa-angle-double-right');
        }
    };
    $scope.changeViewMode = function (view_mode) {
        if (view_mode=='design') {
            $scope.design_view_mode = 'Design';
            $scope.showDesign();
        } else if (view_mode=='source') {
            $scope.design_view_mode = 'Source';
            $scope.showSource();
        }
    };

    $scope.showDesign = function() {
        $scope.design_visible = true;
        $scope.script_visible = false;
        $scope.style_visible = false;
        $scope.source_visible = false;
        $('#dfx_styles_editor').css('display', 'none');
        $('#dfx_src_editor').css('display', 'none');
        $('#dfx_script_editor').css('display', 'none');
        $('.dfx-ve-toolbar-button').removeClass('dfx-ve-toolbar-button-selected');
        $('.dfx-ve-toolbar-button-design').addClass('dfx-ve-toolbar-button-selected');
    };
    $scope.showSource = function() {
        var editor = $('#dfx_src_editor')[0].CodeMirror;

        for (var key in $scope.gc_instances) {
            var component = angular.copy($scope.gc_instances[key]);
            for (attribute in component.attributes) {
                if (component.attributes[attribute].status!='overridden') {
                    delete component.attributes[attribute];
                }
            }
            var gc_template_definition = JSON.parse(editor.getValue());
            DfxGcTemplateBuilder.findComponentAndUpdateAttributes(gc_template_definition, component.attributes);
            editor.setValue(JSON.stringify(gc_template_definition, null, '\t'));
            editor.scrollTo(0, 0);
            editor.refresh();
        }

        $scope.design_visible = false;
        $scope.source_visible = true;
        $scope.script_visible = false;
        $scope.style_visible = false;
        $('#dfx_styles_editor').css('display', 'none');
        $('#dfx_script_editor').css('display', 'none');
        $('#dfx_src_editor').css('display', 'block');
        $('.dfx-ve-toolbar-button').removeClass('dfx-ve-toolbar-button-selected');
        $('.dfx-ve-toolbar-button-source').addClass('dfx-ve-toolbar-button-selected');

        editor.refresh();
    };

    $scope.refreshDevice = function() {
        if ($scope.design_device_orientation=='Portrait') {
            $('#dfx-ve-platform').css('width', $scope.design_selected_device.portrait['width']);
            $('#dfx-ve-platform').css('height', $scope.design_selected_device.portrait['height']);
            $('#dfx-ve-platform').css('padding-top', $scope.design_selected_device.portrait['padding-top']);
            $('#dfx-ve-platform').css('padding-left', $scope.design_selected_device.portrait['padding-left']);
            $('#dfx-ve-platform').css('padding-right', $scope.design_selected_device.portrait['padding-right']);
            $('#dfx-ve-platform').css('padding-bottom', $scope.design_selected_device.portrait['padding-bottom']);
            $('#dfx-ve-platform').css( 'background', 'url(/images/' + $scope.design_selected_device.portrait['image'] + ') no-repeat' );
        } else {
            $('#dfx-ve-platform').css('width', $scope.design_selected_device.landscape['width']);
            $('#dfx-ve-platform').css('height', $scope.design_selected_device.landscape['height']);
            $('#dfx-ve-platform').css('padding-top', $scope.design_selected_device.landscape['padding-top']);
            $('#dfx-ve-platform').css('padding-left', $scope.design_selected_device.landscape['padding-left']);
            $('#dfx-ve-platform').css('padding-right', $scope.design_selected_device.landscape['padding-right']);
            $('#dfx-ve-platform').css('padding-bottom', $scope.design_selected_device.landscape['padding-bottom']);
            $('#dfx-ve-platform').css( 'background', 'url(/images/' + $scope.design_selected_device.landscape['image'] + ') no-repeat' );
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

    $scope.exitViewEditor = function(ev) {
        $(ev.srcElement).animateCss('pulse');
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

    $scope.updateAttributes = function() {
        var editor = $('#dfx_src_editor.CodeMirror')[0].CodeMirror;
        for (var key in $scope.gc_instances) {
            var component = angular.copy($scope.gc_instances[key]);
            for (attribute in component.attributes) {
                if (component.attributes[attribute].status != 'overridden') {
                    delete component.attributes[attribute];
                }
            }
            var gc_template_definition = JSON.parse(editor.getValue());
            DfxGcTemplateBuilder.findComponentAndUpdateAttributes(gc_template_definition, component.attributes);
            editor.setValue(JSON.stringify(gc_template_definition, null, '\t'), 0);
        }
    };


    var platform = $('#dfx_visual_editor').attr('platform');
    $('.dfx_visual_editor_gc_cat_item').empty();

    var item_fragment = '';
    var comp_idx = 0;

    // Initialize Graphical Controls
    // gc_instances     List of Graphical Controls
    // gc_selected      Current selected Graphical Control
    $scope.gc_instances = {};

    $scope.getComponent = function( element ) {
        var id = $(element).attr('id');
        if ($(element).attr('dfx-gc-renderer-content')!=null) {
            var component_id = $(element).parent().attr('component-id');
            var column_id = $(element).parent().attr('column-id');
            return $scope.gc_instances[component_id].attributes.columns.value[column_id].renderer;
        } else {
            return $scope.gc_instances[id];
        }
    };

    $scope.setComponent = function( component ) {
        // update widget definition
        var parent_id = $('#'+component.id).parent().attr('gc-parent');
        var container_id = $('#'+component.id).parent().attr('gc-container');
        component.container = container_id;
        $scope.gc_instances[ component.id ] = component;
        DfxGcTemplateBuilder.addComponentToDefinition(component.id, parent_id, component, $scope.view_card_selected);
    };

    // Add a component
    $scope.addComponent = function(component, callback) {
        var component_instance = $scope.renderGraphicalControl(component, function(clonedElement) {
            $('#dfx_visual_editor_workspace_default').append(clonedElement);
        });
    };

    // Render GControls
    $scope.renderGraphicalControl = function( component, callback ) {
        $scope.gc_instances[component.id] = component;
        var gc_instance = {};
        var flex_container_attr = (component.flex=='true' || (component.attributes!=null && component.attributes.flex!=null)) ? ' flex="{{attributes.flex.value}}"' : '';

        var gc_layout = ((component.type == 'panel' || component.type == 'tabs' || component.type == 'wizard') &&
            component.attributes && (!component.attributes.autoHeight || component.attributes.autoHeight.value != true)) ?
                ' layout="column" ' : '';

        var gc_html_template = '<div id="' + component.id + '" dfx-gc-web-base dfx-gc-web-' + component.type + ' dfx-gc-design gc-type="' + component.type + '" gc-role="control"' + flex_container_attr + gc_layout + '></div>';

        gc_instance.fragment = $compile(gc_html_template)($scope, function(clonedElement) {
            if (callback) callback(clonedElement); // sometimes, especially when doing reloadPropertyPanel(), must wait until compilation is completed
        });
        gc_instance.id = component.id;

        return gc_instance;
    };

    // Load Property Panel
    $scope.loadPropertyPanel = function( component_id ) {
        var component = $scope.gc_instances[ component_id ];
        if ($scope.gc_selected != null) {
            $('#'+$scope.gc_selected.id).css('border', '0px');
        }
        $scope.gc_selected = $scope.gc_instances[component_id];
        $('#'+$scope.gc_selected.id).css('border', '2px #000 solid');

        // Destroy GC Property Panel scope and clean up DOM bindings
        var gc_property_panel_scope = angular.element( $('#dfx_visual_editor_property_panel').children('div') ).scope();
        if (gc_property_panel_scope) {
            gc_property_panel_scope.$destroy();
        }
        $('#dfx_visual_editor_property_panel').empty();

        // Load Property Panel for new selected element
        var gc_property_panel = $compile('<div id="' + component.id + '" dfx-gc-web-base dfx-gc-web-' + component.type + ' dfx-gc-edit></div>')($scope);
        $('#dfx_visual_editor_property_panel').empty();
        $('#dfx_visual_editor_property_panel').append(gc_property_panel);

        $('#dfx-ve-property-title-selected-gc').css('display', 'inline-block');
        $('#dfx-ve-property-title-selected-gc-text').text(component.attributes.name.value);
        $('#dfx-ve-property-title-selected-gc-text').attr('component-id', component.id);

        $scope.loadGcTemplatesByType();
    };

    $scope.reloadPropertyPanel = function() {
        $('#dfx-ve-property-title-selected-renderer').css('display', 'none');
        var id = $('#dfx-ve-property-title-selected-gc-text').attr('component-id');
        $scope.loadPropertyPanel(id);
    };

    $scope.overrideAttribute = function(attribute_name) {
        function setAttibutesChainStatus(path, obj) {
            var schema = obj,
                pList = path.split('.');

            for (var i = 0; i < pList.length; i++) {
                var elem = pList[i];
                if (!schema[elem] && schema[elem] !== '') {
                    schema[elem] = {};
                }
                schema = schema[elem];
                if (schema !== null && typeof schema === 'object') {
                    schema.status = 'overridden';
                }
            }
        }

        setAttibutesChainStatus(attribute_name, $scope.gc_selected.attributes);
    };

    // Functions to work with GC Templates - START
    $scope.saveGcTemplate = function(event) {
        $(event.srcElement).animateCss('pulse');

        var prepareAttributes = function(gc_template) {
            delete gc_template.attributes.name; // remove because it's always overridden anyway

            Object.keys(gc_template.attributes).forEach(function(key, index) {
                gc_template.attributes[key].locked = gc_template.attributes[key].locked || false;
            });
        };

        var gc_selected = angular.copy($scope.gc_selected);
        DfxGcTemplateBuilder.removeNotOverriddenAttributes(gc_selected.attributes, gc_selected.type);

        var gc_template = {
            name: $scope.gc_template_name,
            platform: $scope.view_platform,
            application: $scope.application_name,
            attributes: gc_selected.attributes
        };

        prepareAttributes(gc_template);

        dfxGcTemplates.update( $scope, gc_template )
            .then( function() {
               dfxMessaging.showMessage( 'The template ' + $scope.gc_template_name + ' has been updated' );
            });
    };

    $scope.loadGcTemplatesByType = function() {
        $scope.gc_templates_by_type = {};
        dfxGcTemplates.getByType( $scope, $scope.application_name, $scope.gc_selected.type, $scope.view_platform )
            .then( function(gc_templates) {
                gc_templates = gc_templates || {};
                gc_templates.unshift({ 'name': 'default' });
                $scope.gc_templates_by_type = gc_templates;
            });
    };

    $scope.isGcAttributeVisible = function() {
        return true; // all attributes are always visible in gc template editor
    };
    $scope.isGcSpecialAttributeVisible = function() {
        return false;
    };
    // Functions to work with GC Templates - END

    DfxGcTemplateBuilder.init($timeout, $scope);
}]);

dfxGcTemplateEditorApp.controller("dfx_view_editor_property_panel_controller", ['$scope', function($scope) {
    // This is a placeholder for GC Property Panel Controller, can not be removed
}]);

dfxGcTemplateEditorApp.directive('dfxGcExtendedProperty', [function() {
    return {
        restrict: 'A',
        templateUrl: function( el, attrs ) {
            return '/gcontrols/web/extended_props.html';
        },
        controller: function($scope, $element, $attrs) {
            $scope.addExtendedDirective = function() {
                var component = $scope.$parent.gc_selected;
                if (component.attributes.ext_directives==null) {
                    component.attributes.ext_directives = [{'directive':'','value':''}];
                } else {
                    component.attributes.ext_directives.push({'directive':'','value':''});
                }
            };
        }
    }
}]);

dfxGcTemplateEditorApp.directive('dfxGcRendererDesign', ['$compile', '$timeout', function($compile, $timeout) {
    return {
        restrict: 'A',
        link: function($scope, $element, $attrs) {
            $timeout(function() {
                var angular_snippet = $compile('<div id="'+$attrs.componentId+'_renderer_'+$attrs.columnId+'" dfx-gc-web-base dfx-gc-web-'+$attrs.dfxGcRendererDesign+' dfx-gc-design dfx-gc-renderer-content="'+$attrs.componentId+'"></div>')($scope);
                $element.append(angular_snippet);
            }, 0);
        }
    }
}]);

dfxGcTemplateEditorApp.directive('dfxVePickerIcon', ['$q', '$http', '$mdDialog', '$timeout', '$compile', '$filter', function($q, $http, $mdDialog, $timeout, $compile, $filter) {
    return {
        restrict: 'A',
        transclude: true,
        replace: true,
        link: function(scope, element, attrs) {
            scope.showFontIcons = function(ev, iconObj) {
                //scope.$parent.cacheAttributeOldValue(attrs.dfxPickerProperty);// needed for UNDO functionality

                scope.iconObj = iconObj;
                scope.faIcons = [];
                scope.svgCategories = [];
                scope.svgIcons = [];
                scope.faLoaded = $http.get('/gcontrols/web/picker_icon.json').then(function(res){
                    for ( var i = 0; i < res.data.faClasses.length; i++ ) {
                        var faResIcon = { "value": res.data.faClasses[i], "category": "'fa-icons'", "type": "fa-icon" };
                        scope.faIcons.push( faResIcon );
                    }
                });
                scope.svgLoaded = $http.get('/gcontrols/web/mdicons.json').then(function(res){
                    for ( var i = 0; i < res.data.length; i++ ) {
                        scope.svgCategories.push( res.data[i].type );
                        for ( var j = 0; j < res.data[i].items.length; j++ ) {
                            var svgResIcon = { "value": res.data[i].items[j], "category": "'"+res.data[i].type+"', 'svg-icons'", "type": "svg-icon" };
                            scope.svgIcons.push( svgResIcon );
                        }
                    }
                    scope.dfxIconsList = scope.svgIcons.concat(scope.faIcons);
                    scope.dfxFilteredIconsList = scope.dfxIconsList;
                });
                $q.all([scope.faLoaded, scope.svgLoaded]).then(function(){
                    $('body').append('<div class="dfx-ve-dialog"></div>');
                    $('.dfx-ve-dialog').load('/gcontrols/web/picker_icon_list.html', function(){
                        $compile($('.dfx-ve-dialog').contents())(scope);
                        $('.sp-container').remove();
                        $timeout(function() {
                            $('.dfx-ve-icons-dialog').addClass('active');
                        }, 250);
                    });
                });
            }
            scope.iconsCategory = '';
            scope.chooseIconsCategory = function( iconCategory, ev ) {
                scope.dfxIconsList = $filter('filter')(scope.dfxFilteredIconsList, "'"+iconCategory+"'", 'strict');
                switch ( iconCategory ) {
                    case 'svg-icons': scope.iconsCategory = '/ ' + 'SVG Icons'; break;
                    case 'fa-icons': scope.iconsCategory = '/ ' + 'Font Awesome Icons'; break;
                    default: scope.iconsCategory = '/ ' + iconCategory;
                }
                $(".dfx-ve-icons-categories span").removeClass('active');
                $(ev.target).addClass('active');
            }
            scope.searchIcons = function( icon ) {
                scope.dfxIconsList = $filter('filter')(scope.dfxFilteredIconsList, icon, 'strict');
                scope.iconsCategory = '| ' + icon;
                $(".dfx-ve-icons-categories span").removeClass('active');
            }
            scope.setDfxIcon = function(icon, type) {
                scope.iconObj.value = "'"+icon+"'";
                scope.iconObj.type = type;
                scope.closeVeIconsDialog();

                //scope.$parent.cacheAttributeNewValue(attrs.dfxPickerProperty);// needed for UNDO functionality
            }
            scope.closeVeIconsDialog = function(){
                $('.dfx-ve-icons-dialog').removeClass('active');
                $timeout(function(){
                    angular.element($('.dfx-ve-dialog')).remove();
                    $('.sp-container').remove();
                }, 250);
            }
        }
    }
}]);

dfxGcTemplateEditorApp.directive('dfxVeCssStyle', ['$timeout', '$compile', function($timeout, $compile) {
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        templateUrl: function( el, attrs ) {
            return '/gcontrols/web/css_style.html';
        },
        link: function(scope, element, attrs) {
            scope.showCssStyles = function(ev) {
                scope.attributes.style.status = "overridden"; // must be here, no need to override before clicking on the picker
                var dfxCssStyleDialog = '<div class="dfx-ve-dialog"></div>';
                $('body').append(dfxCssStyleDialog);
                $('.dfx-ve-dialog').load('/gcontrols/web/css_styles_tree.html', function(response,status,xhr){
                    $compile($('.dfx-ve-dialog').contents())(scope);
                    $('.sp-container').remove();
                    scope.preview = {};
                    $timeout(function() {
                        $('.dfx-ve-css-style-editor').addClass('active');
                        scope.inputStyle = $(".css-style");
                        scope.targetStyles = ev.target;
                        scope.targetElement = $(scope.targetStyles).parent().children('input');
                        scope.targetValue = angular.element(scope.targetElement).data('$ngModelController').$viewValue;
                        scope.cssStyles = scope.targetValue.split(";");
                        scope.previewBox = {};
                        var ifButtonGc = scope.attributes.name.value;
                        var isButtonGc = ifButtonGc.indexOf("Button");
                        if ( isButtonGc >= 0 ) {
                            $(".dfx-css-style-preview-inner").addClass('md-raised md-primary md-altTheme-theme glyph md-button');
                        }
                        $(".dfx-css-style-preview-inner").css('opacity',1);
                        var newStyle = '',
                            styleRules = {},
                            otherStyles = [],
                            styleItem = '',
                            styleName = '',
                            styleValue = '';
                        for (var i = 0; i < scope.cssStyles.length; i++) {
                            var styleRule = scope.cssStyles[i].split(':'),
                                styleRuleName = String(styleRule[0]).replace(/(^\s+|\s+$)/g,''),
                                styleRuleValue = String(styleRule[1]).replace(/(^\s+|\s+$)/g,'');
                            if (styleRule.length === 2 && styleRuleName !== '' && styleRuleValue !== '' ) {
                                styleRule[0] = styleRuleName;
                                styleRule[1] = styleRuleValue;
                                switch(styleRule[0]) {
                                    case 'background': $(".css-style.background").val(styleRule[1]); break;
                                    case 'background-attachment': $(".css-style.background-attachment").val(styleRule[1]); break;
                                    case 'background-color': $(".css-style.background-color").val(styleRule[1]); scope.previewBox.BackgroundColor = styleRule[1]; break;
                                    case 'background-image': $(".css-style.background-image").val(styleRule[1]); break;
                                    case 'background-position': $(".css-style.background-position").val(styleRule[1]); break;
                                    case 'background-repeat': $(".css-style.background-repeat").val(styleRule[1]); break;
                                    case 'background-size': $(".css-style.background-size").val(styleRule[1]); break;
                                    case 'border': $(".css-style.border").val(styleRule[1]); break;
                                    case 'border-style': $(".css-style.border-style").val(styleRule[1]); scope.previewBox.BorderStyle = styleRule[1]; break;
                                    case 'border-width': $(".css-style.border-width").val(styleRule[1]); scope.previewBox.BorderWidth = styleRule[1]; break;
                                    case 'border-color': $(".css-style.border-color").val(styleRule[1]); scope.previewBox.BorderColor = styleRule[1]; break;
                                    case 'border-top': $(".css-style.border-top").val(styleRule[1]); scope.previewBox.BorderTop = styleRule[1]; break;
                                    case 'border-right': $(".css-style.border-right").val(styleRule[1]); scope.previewBox.BorderRight = styleRule[1]; break;
                                    case 'border-bottom': $(".css-style.border-bottom").val(styleRule[1]); scope.previewBox.BorderBottom = styleRule[1]; break;
                                    case 'border-left': $(".css-style.border-left").val(styleRule[1]); scope.previewBox.BorderLeft = styleRule[1]; break;
                                    case 'border-radius': $(".css-style.border-radius").val(styleRule[1]); scope.previewBox.BorderRadius = styleRule[1]; break;
                                    case 'box-sizing': $(".css-style.box-sizing").val(styleRule[1]); break;
                                    case 'box-shadow': $(".css-style.box-shadow").val(styleRule[1]); scope.previewBox.BoxShadow = styleRule[1]; break;
                                    case 'cursor': $(".css-style.cursor").val(styleRule[1]); scope.previewBox.Cursor = styleRule[1]; break;
                                    case 'direction': $(".css-style.direction").val(styleRule[1]); break;
                                    case 'display': $(".css-style.display").val(styleRule[1]); break;
                                    case 'flex': $(".css-style.flex").val(styleRule[1]); break;
                                    case 'flex-basis': $(".css-style.flex-basis").val(styleRule[1]); break;
                                    case 'flex-direction': $(".css-style.flex-direction").val(styleRule[1]); break;
                                    case 'flex-flow': $(".css-style.flex-flow").val(styleRule[1]); break;
                                    case 'flex-grow': $(".css-style.flex-grow").val(styleRule[1]); break;
                                    case 'flex-shrink': $(".css-style.flex-shrink").val(styleRule[1]); break;
                                    case 'flex-wrap': $(".css-style.flex-wrap").val(styleRule[1]); break;
                                    case 'justify-content': $(".css-style.justify-content").val(styleRule[1]); break;
                                    case 'float': $(".css-style.float").val(styleRule[1]); break;
                                    case 'clear': $(".css-style.clear").val(styleRule[1]); break;
                                    case 'font-family': $(".css-style.font-family").val(styleRule[1]); scope.previewBox.FontFamily = styleRule[1]; break;
                                    case 'font-size': $(".css-style.font-size").val(styleRule[1]); scope.previewBox.FontSize = styleRule[1]; break;
                                    case 'color': $(".css-style.color").val(styleRule[1]); scope.previewBox.Color = styleRule[1]; break;
                                    case 'font-style': $(".css-style.font-style").val(styleRule[1]); scope.previewBox.FontStyle = styleRule[1]; break;
                                    case 'font-weight': $(".css-style.font-weight").val(styleRule[1]); scope.previewBox.FontWeight = styleRule[1]; break;
                                    case 'line-height': $(".css-style.line-height").val(styleRule[1]); scope.previewBox.LineHeight = styleRule[1]; break;
                                    case 'letter-spacing': $(".css-style.letter-spacing").val(styleRule[1]); scope.previewBox.LetterSpacing = styleRule[1]; break;
                                    case 'text-align': $(".css-style.text-align").val(styleRule[1]); scope.previewBox.TextAlign = styleRule[1]; break;
                                    case 'text-transform': $(".css-style.text-transform").val(styleRule[1]); scope.previewBox.TextTransform = styleRule[1]; break;
                                    case 'text-shadow': $(".css-style.text-shadow").val(styleRule[1]); scope.previewBox.TextShadow = styleRule[1]; break;
                                    case 'vertical-align': $(".css-style.vertical-align").val(styleRule[1]); break;
                                    case 'white-space': $(".css-style.white-space").val(styleRule[1]); break;
                                    case 'word-spacing': $(".css-style.word-spacing").val(styleRule[1]); break;
                                    case 'word-wrap': $(".css-style.word-wrap").val(styleRule[1]); break;
                                    case 'height': $(".css-style.height").val(styleRule[1]); break;
                                    case 'min-height': $(".css-style.min-height").val(styleRule[1]); break;
                                    case 'max-height': $(".css-style.max-height").val(styleRule[1]); break;
                                    case 'list-style': $(".css-style.list-style").val(styleRule[1]); break;
                                    case 'list-style-position': $(".css-style.list-style-position").val(styleRule[1]); break;
                                    case 'list-style-type': $(".css-style.list-style-type").val(styleRule[1]); break;
                                    case 'margin': $(".css-style.margin").val(styleRule[1]); break;
                                    case 'margin-top': $(".css-style.margin-top").val(styleRule[1]); break;
                                    case 'margin-right': $(".css-style.margin-right").val(styleRule[1]); break;
                                    case 'margin-bottom': $(".css-style.margin-bottom").val(styleRule[1]); break;
                                    case 'margin-left': $(".css-style.margin-left").val(styleRule[1]); break;
                                    case 'opacity': $(".css-style.opacity").val(styleRule[1]); scope.previewBox.Opacity = styleRule[1]; break;
                                    case 'padding': $(".css-style.padding").val(styleRule[1]); break;
                                    case 'padding-top': $(".css-style.padding-top").val(styleRule[1]); break;
                                    case 'padding-right': $(".css-style.padding-right").val(styleRule[1]); break;
                                    case 'padding-bottom': $(".css-style.padding-bottom").val(styleRule[1]); break;
                                    case 'padding-left': $(".css-style.padding-left").val(styleRule[1]); break;
                                    case 'position': $(".css-style.position").val(styleRule[1]); break;
                                    case 'top': $(".css-style.top").val(styleRule[1]); break;
                                    case 'right': $(".css-style.right").val(styleRule[1]); break;
                                    case 'bottom': $(".css-style.bottom").val(styleRule[1]); break;
                                    case 'Left': $(".css-style.Left").val(styleRule[1]); break;
                                    case 'z-index': $(".css-style.z-index").val(styleRule[1]); break;
                                    case 'transition': $(".css-style.transition").val(styleRule[1]); break;
                                    case 'width': $(".css-style.width").val(styleRule[1]); break;
                                    case 'min-width': $(".css-style.min-width").val(styleRule[1]); break;
                                    case 'max-width': $(".css-style.max-width").val(styleRule[1]); break;
                                    default: newStyle = styleRule[0] + ':' + styleRule[1]; otherStyles.push(newStyle); break;
                                }
                            }
                        }
                        scope.otherStyles = otherStyles.join(";");
                    }, 250);
                });
            }
            scope.saveStyles = function() {
                var savedStyles = [];
                for (var i = 0; i < scope.inputStyle.length; i++) {
                    if (scope.inputStyle[i].value !== '') {
                        savedStyle = scope.inputStyle[i].name + ':' + scope.inputStyle[i].value;
                        savedStyles.push(savedStyle);
                    }
                }
                savedStyles.push(scope.otherStyles);
                scope.targetElement.val(savedStyles.join(";"));
                angular.element(scope.targetElement).data('$ngModelController').$setViewValue(scope.targetElement.val());
                scope.closeCssDialog();
            }
            scope.closeCssDialog = function(){
                $('.dfx-ve-css-style-editor').removeClass('active');
                $timeout(function(){
                    angular.element($('.dfx-ve-dialog')).remove();
                    $('.sp-container').remove();
                }, 250);
            }
        }
    }
}]);

dfxGcTemplateEditorApp.directive('dfxVePickerColumn', [ '$compile', '$mdDialog', function($compile, $mdDialog) {
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        templateUrl: function( el, attrs ) {
            return '/gcontrols/web/picker_column.html';
        },
        link: function(scope, element, attrs) {
            scope.editRendererProperties = function(ev, column_idx) {
                var component = scope.gc_selected;
                $('#dfx_visual_editor_property_panel div:first-child').css( 'display', 'none' );
                var renderer = { "id": (component.id + '_renderer_'  + column_idx), "type": component.attributes.columns.value[column_idx].renderer.name, "attributes": component.attributes.columns.value[column_idx].renderer.attributes, "children":[] };
                scope.gc_instances[component.id + '_renderer_' + column_idx] = renderer;
                scope.gc_selected = scope.gc_instances[component.id + '_renderer_' + column_idx];
                scope.attributes = renderer.attributes;
                scope.children = [];
                scope.renderer = renderer;
                var column_idx_label = parseInt(column_idx)+1;
                $('#dfx-ve-property-title-selected-renderer').css('display','inline-block');
                $('#dfx-ve-property-title-selected-renderer-text').text( component.attributes.columns.value[column_idx].name );
                $('#dfx_visual_editor_property_help').attr('href', 'http://www.interactive-clouds.com');
                var gc_property_panel = $compile('<div id="' + renderer.id + '" dfx-gc-web-base dfx-gc-web-' + renderer.type + ' dfx-gc-edit></div>')(scope);
                $('#dfx_visual_editor_property_panel').append(gc_property_panel);
            };

            scope.overrideAttribute = function(attribute_name) {
                scope.gc_selected.attributes[attribute_name].status = 'overridden';
            };
        }

    }
}]);

dfxGcTemplateEditorApp.directive('dfxVeColorPicker', ['$timeout', function($timeout) {
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        require: 'ngModel',
        templateUrl: function( $el, $attrs ) {
            return '/gcontrols/web/color_picker.html';
        },
        controller: function($scope, $element, $attrs) {
            $timeout(function(){
                var element_id = $scope.component_id + '_' + $attrs.name + '_color_picker';
                $element.attr('id', element_id);
                $("#"+element_id).spectrum({
                    preferredFormat: "hex",
                    showAlpha: true,
                    showInput: true,
                    allowEmpty: true,
                    clickoutFiresChange: false
                }).show().on('change', function(){
                    angular.element($element).data('$ngModelController').$setViewValue($element.val());
                });
                $scope.setColor = function() {
                    var inputColor = $("input#"+element_id).val();
                    if (inputColor) {
                        $("#"+element_id).spectrum("set", inputColor);
                    }
                }
                setTimeout($scope.setColor, 500);
            }, 0);
        }
    }
}]);

dfxGcTemplateEditorApp.directive('dfxVePickerImage', (function($mdDialog, $timeout, $compile) {
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        templateUrl: function( el, attrs ) {
            return '/gcontrols/web/picker_image.html';
        },
        link: function(scope, element, attrs) {
            if ( !$(element).hasClass('dfx-carousel-image-picker') ) {
                scope.attributes.src.status = "overridden";
            }
            scope.isCreate = false;
            scope.showImages = function(ev) {
                DfxStudio.Resources.getWidgetImageResources(function(res){
                    scope.appImages = [];
                    scope.sharedImages = [];

                    var resAppImages = [],
                        resSharedImages = [];

                    if ((! res) || res.length == 0) return; // no images
                    if (res[0] && res[0].application) resAppImages = res[0].images;
                    if (res[0] && (! res[0].application)) resSharedImages = res[0].images;
                    if (res[1] && res[1].application) resAppImages = res[1].images;
                    if (res[1] && (! res[1].application)) resSharedImages = res[1].images;

                    var appPath = (resAppImages.length > 0) ? resAppImages[0].path.indexOf("/assets/") : 0;
                    var sharedPath = (resSharedImages.length > 0) ? resSharedImages[0].path.indexOf("/_shared/") : 0;

                    for (var i = resAppImages.length-1; i >= 0; i--) {
                        var appImg = resAppImages[i].path.substr(appPath);
                        scope.appImages.push(appImg);
                    }
                    for (var i = resSharedImages.length-1; i >= 0; i--) {
                        var sharedImg = resSharedImages[i].path.substr(sharedPath);
                        scope.sharedImages.push(sharedImg);
                    }
                });
                if ( !$(element).hasClass('dfx-carousel-image-picker') ) {
                    $mdDialog.show({
                        scope: scope.$new(),
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose: true,
                        ariaLabel: 'picker-images',
                        templateUrl: '/gcontrols/web/picker_images_form.html',
                        controller: function(){
                            scope.setImage = function(src) {
                                scope.attributes[attrs.dfxPickerProperty].value = "'"+src+"'";
                                $mdDialog.hide();
                            }
                            scope.closeDialog = function(){
                                $mdDialog.hide();
                            }
                        }
                    });
                } else {
                    $timeout(function(){
                        $('#' + scope.component_id + '_md_dialog .second-dialog-box').load('/gcontrols/web/carousel_images_picker.html');
                        $timeout(function(){
                            $compile($('#' + scope.component_id + '_md_dialog .second-dialog-box').contents())(scope);
                            $('#' + scope.component_id + '_md_dialog .second-dialog').fadeIn(500);
                        }, 250);
                    }, 250);
                }
            };
        }
    }
}));

dfxGcTemplateEditorApp.filter('checkExpression', [ function() {
    return function( input ) {
        var regexp = /(^\')(.*)(\'$)/gm,
            filtered = regexp.exec( input );

        if ( input && ( input.indexOf('+') >= 0 ) ) {
            filtered = false;
        }

        return filtered ? input : '{expression}';
    };
}]);
/*
dfxGcTemplateEditorApp.directive('dfxVeExpressionEditor', [ '$mdDialog', function($mdDialog) {
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        require: '?ngModel',
        templateUrl: function( el, attrs ) {
            return '/gcontrols/web/label_picker.html';
        },
        link: function(scope, element, attrs) {
            var re = /(\$scope\.)(\w*)/g;
            var str = $('#dfx_script_editor.CodeMirror')[0].CodeMirror.getValue();
            var m;
            scope.scopeVars = [];
            while ((m = re.exec(str)) !== null) {
                if (m.index === re.lastIndex) {
                    re.lastIndex++;
                }
                if (scope.scopeVars.indexOf(m[2]) == -1) {
                    scope.scopeVars.push(m[2]);
                }
            }
            scope.scopeVars.sort();
            scope.showExpressionEditor = function(ev) {
                $mdDialog.show({
                    scope: scope.$new(),
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    ariaLabel: 'label-editor',
                    templateUrl: '/gcontrols/web/label_editor.html',
                    onComplete: function() {
                        scope.targetLabel = ev.target;
                        scope.targetLabelField = $(scope.targetLabel).parent().children('input');
                        scope.targetLabelValue = angular.element(scope.targetLabelField).data('$ngModelController').$viewValue;
                        $("textarea.expression-textarea").val(scope.targetLabelValue);
                        if (scope.attributes.label) { scope.attributes.label.status = "overridden"; }
                        if (scope.attributes.display) { scope.attributes.display.status = "overridden"; }
                        if (scope.attributes.disabled) { scope.attributes.disabled.status = "overridden"; }
                    },
                    controller: function() {
                        scope.addVariable = function(ev) {
                            var cursorPos = document.getElementById(scope.component_id+"_expression_textarea").selectionStart,
                                areaValue = $("#"+scope.component_id+"_expression_textarea").val(),
                                expressionLength = $("#"+scope.component_id+"_expression_textarea").val().length,
                                varName = ev.target.textContent;
                            $("#"+scope.component_id+"_expression_textarea").val(areaValue.substring(0, cursorPos) + varName + areaValue.substring(cursorPos));
                        }
                        scope.setLabel = function() {
                            var oldExpression = scope.targetLabelField.val();// needed for UNDO functionality
                            scope.$parent.cacheAttributeOldValue(null, null, oldExpression);// needed for UNDO functionality

                            scope.newExpression = $("textarea.expression-textarea").val();
                            scope.targetLabelField.val(scope.newExpression);
                            angular.element(scope.targetLabelField).data('$ngModelController').$setViewValue(scope.newExpression);
                            $(scope.targetLabelField).focus().blur();
                            $mdDialog.hide();
                        }
                        scope.clearLabel = function() {
                            $("textarea.expression-textarea").val('');
                        }
                        scope.closeDialog = function(){
                            $mdDialog.hide();
                        }
                    }
                })
            };
        }
    }
}]);
*/
dfxGcTemplateEditorApp.directive('dfxVeMenuEditor', [ '$mdDialog', '$mdToast', '$http', '$timeout', '$compile', function($mdDialog, $mdToast, $http, $timeout, $compile) {
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        templateUrl: function( el, attrs ) {
            return '/gcontrols/web/picker_menu.html';
        },
        link: function(scope, element, attrs) {
            if(attrs.side){
                if(attrs.side==='left'){
                    $(element).attr('side','left');
                    $(element).find('span').attr('side','left');
                    $(element).find('md-icon').attr('side','left');
                } else {
                    $(element).attr('side','right');
                    $(element).find('span').attr('side','right');
                    $(element).find('md-icon').attr('side','right');
                }
            }
            scope.menuItemsType = {"value":"static"};
            scope.menuItemNames = {"value":""};
            scope.dialogGcType = '';
            scope.showMenuEditor = function(ev) {
                scope.menu = {};
                if(scope.attributes.layoutType.value === 'none' ){
                    scope.attributes.menuItems.status = "overridden";
                }
                scope.menuEditorTabs = {"activeTab": 0};
                scope.statable = {"value": false};
                scope.waitable = {"value": false};
                scope.waitableItem = { "value": false};
                scope.isFabToolbar = {"value": false};
                if (scope.attributes.layoutType.value === 'wizard' || scope.attributes.layoutType.value === 'tabs' || scope.attributes.layoutType.value === 'panel'){
                    scope.toolbarSide = $(ev.target).attr('side');
                    if (scope.toolbarSide === 'left'){
                        scope.menuItemsType.value = scope.attributes.toolbar.leftMenu.menuItemsType.value;
                        scope.menuItemNames.value = scope.attributes.toolbar.leftMenu.menuItemNames.value;
                        scope.menuItems = scope.attributes.toolbar.leftMenu.menuItems;
                        scope.$parent.overrideAttribute('toolbar.leftMenu.menuItems');
                        scope.$parent.overrideAttribute('toolbar.leftMenu.menuItemsType');
                        scope.$parent.overrideAttribute('toolbar.leftMenu.menuItemNames');
                        if (scope.attributes.toolbar.leftMenu.type.value === 'Icon Bar'){
                            scope.statable.value = true;
                            scope.waitable.value = false;
                            scope.isFabToolbar.value = false;
                            scope.dialogGcType = 'iconbar';
                        } else if (scope.attributes.toolbar.leftMenu.type.value === 'Buttons') {
                            scope.statable.value = false;
                            scope.waitable.value = true;
                            scope.isFabToolbar.value = false;
                            scope.dialogGcType = 'button';
                        } else if (scope.attributes.toolbar.leftMenu.type.value === 'Fab') {
                            scope.statable.value = false;
                            scope.waitable.value = false;
                            scope.isFabToolbar.value = true;
                            scope.dialogGcType = 'fab';
                        }
                    } else {
                        scope.menuItemsType.value = scope.attributes.toolbar.rightMenu.menuItemsType.value;
                        scope.menuItemNames.value = scope.attributes.toolbar.rightMenu.menuItemNames.value;
                        scope.menuItems = scope.attributes.toolbar.rightMenu.menuItems;
                        scope.$parent.overrideAttribute('toolbar.rightMenu.menuItems');
                        scope.$parent.overrideAttribute('toolbar.rightMenu.menuItemsType');
                        scope.$parent.overrideAttribute('toolbar.rightMenu.menuItemNames');
                        if (scope.attributes.toolbar.rightMenu.type.value === 'Icon Bar'){
                            scope.statable.value = true;
                            scope.waitable.value = false;
                            scope.isFabToolbar.value = false;
                            scope.dialogGcType = 'iconbar';
                        } else if (scope.attributes.toolbar.rightMenu.type.value === 'Buttons') {
                            scope.statable.value = false;
                            scope.waitable.value = true;
                            scope.isFabToolbar.value = false;
                            scope.dialogGcType = 'button';
                        } else if (scope.attributes.toolbar.rightMenu.type.value === 'Fab') {
                            scope.statable.value = false;
                            scope.waitable.value = false;
                            scope.isFabToolbar.value = true;
                            scope.dialogGcType = 'fab';
                        }
                    }
                } else {
                    scope.menuItems = scope.attributes.menuItems;
                    scope.gc_selected.type === 'iconbar' ? scope.statable.value = true : scope.statable.value = false;
                    scope.menuItemNames.value = scope.attributes.menuItemNames.value;
                    scope.dialogGcType = scope.gc_selected.type;
                }
                $mdDialog.show({
                    scope: scope.$new(),
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose:true,
                    ariaLabel: 'menu-editor',
                    templateUrl: '/gcontrols/web/menu_editor.html',
                    onComplete: function() {
                        $timeout(function(){
                            if(scope.menuItems.value.length>0) {
                                scope.menu = scope.menuItems.value[0];
                                scope.indexMenuItem = '';
                                if ( scope.menu ) {
                                    scope.ifShowMenuIconTypes(scope.menu.icon.value);
                                    scope.setMenuItemType();
                                    scope.waitableItem.value = scope.menu.hasOwnProperty('waiting') ? true : false;
                                }
                                if ( scope.statable.value && scope.menu.state && scope.menu.state.value ) {
                                    scope.ifShowMenuIconTypes( scope.menu.state.checkedIcon.value, 'checked' );
                                    scope.ifShowMenuIconTypes( scope.menu.state.uncheckedIcon.value, 'unchecked' );
                                    $timeout(function() {
                                        scope.menuEditorTabs.activeTab = 1;
                                    }, 100);
                                }
                                if ( scope.waitable.value && scope.menu.waiting && scope.menu.waiting.value ) {
                                    scope.ifShowMenuIconTypes( scope.menu.waiting.icon.value, 'waiting' );
                                    $timeout(function() {
                                        scope.menuEditorTabs.activeTab = 1;
                                    }, 100);
                                }
                            }
                        }, 0);
                        $timeout(function() {
                            scope.indexMenuItem = 0;
                            scope.arrayElement = scope.menuItems.value;
                            scope.gcMenuItems = $("md-content.menu-structure").find('li');
                            $("md-content.menu-structure > ul > li:first-child").addClass('active');
                            scope.parentMenuItem = $("md-content.menu-structure").find('li.active');
                        }, 0);
                    },
                    controller: function(){
                        scope.menuEditorItem = {};
                        scope.setMenuItemsType = function( type ){
                            if(scope.toolbarSide === 'left'){
                                scope.attributes.toolbar.leftMenu.menuItemsType.value = type;
                                scope.$parent.overrideAttribute('toolbar.leftMenu.menuItemsType');
                            }else if(scope.toolbarSide === 'right'){
                                scope.attributes.toolbar.rightMenu.menuItemsType.value = type;
                                scope.$parent.overrideAttribute('toolbar.rightMenu.menuItemsType');
                            } else {
                                scope.attributes.menuItemsType.value = type;
                                scope.$parent.overrideAttribute('menuItemsType');
                            }
                        }
                        scope.checkMenuIconTypes = function() {
                            if ( scope.statable.value && scope.menu.state && scope.menu.state.value ) {
                                scope.ifShowMenuIconTypes( scope.menu.state.checkedIcon.value, 'checked' );
                                scope.ifShowMenuIconTypes( scope.menu.state.uncheckedIcon.value, 'unchecked' );
                            }
                            if ( scope.waitable.value && scope.menu.waiting && scope.menu.waiting.value ) {
                                scope.ifShowMenuIconTypes( scope.menu.waiting.icon.value, 'waiting' );
                            }
                        }
                        scope.selectMenuItem = function(ev, menuItem) {
                            scope.menu = menuItem;
                            scope.selectedMenuItem = ev.target,
                            scope.selfParents = $(scope.selectedMenuItem).parents('li.menu-tree-item'),
                            scope.levelMenuItem = scope.selfParents.length,
                            scope.parentMenuItem = $(scope.selectedMenuItem).parent();
                            scope.indexMenuItem = scope.parentMenuItem.index();
                            scope.indexParentMenuItem = '';
                            scope.gcMenuItems = $("md-content.menu-structure").find('li');
                            scope.arrayElement = '';
                            scope.bridge = '.menuItems.value';
                            scope.indentPath = '';
                            scope.outdentPath = '';
                            scope.gcMenuItems.removeClass('active');
                            scope.parentMenuItem.addClass('active');
                            scope.selfParents.each(function(index, element){
                                if (index === 0) {
                                    scope.arrayElement = scope.bridge;
                                    scope.indexParentMenuItem = $(element).attr('parent-index');
                                    var indendIndex = $(element).attr('self-index') - 1;
                                    scope.indentPath = scope.bridge + '[' + indendIndex + ']' + scope.bridge;
                                    if ($(element).attr('self-index') > 0) {
                                        scope.canIndent = true;
                                    } else {
                                        scope.canIndent = false;
                                    }
                                } else if (index === 1) {
                                    scope.indentPath = scope.bridge + '[' + $(element).attr('self-index') + ']' + scope.indentPath;
                                    scope.outdentPath = scope.bridge;
                                    scope.arrayElement = scope.bridge + '[' + $(element).attr('self-index') + ']' + scope.arrayElement;

                                } else {
                                    scope.arrayElement = scope.bridge + '[' + $(element).attr('self-index') + ']' + scope.arrayElement;
                                    scope.indentPath = scope.bridge + '[' + $(element).attr('self-index') + ']' + scope.indentPath;
                                    scope.outdentPath = scope.bridge + '[' + $(element).attr('self-index') + ']' + scope.outdentPath;
                                }
                            })
                            scope.arrayElement = eval('scope' + scope.arrayElement);
                            scope.outdentPath = eval('scope' + scope.outdentPath);
                            scope.ifShowMenuIconTypes(scope.menu.icon.value);
                            if ( scope.statable.value && scope.menu.state && scope.menu.state.value ) {
                                scope.ifShowMenuIconTypes( scope.menu.state.checkedIcon.value, 'checked' );
                                scope.ifShowMenuIconTypes( scope.menu.state.uncheckedIcon.value, 'unchecked' );
                                $timeout(function() {
                                    scope.menuEditorTabs.activeTab = 1;
                                }, 100);
                            }
                            // if ( scope.menuEditorTabs.activeTab !== 0 ) { scope.menuEditorTabs.activeTab = 0; }
                            scope.setMenuItemType();
                            scope.waitableItem.value = scope.menu.hasOwnProperty('waiting') ? true : false;
                            if ( scope.waitable.value && scope.menu.waiting && scope.menu.waiting.value ) {
                                scope.ifShowMenuIconTypes( scope.menu.waiting.icon.value, 'waiting' );
                            }
                        }
                        scope.addMenuItem = function() {
                            var menuItemTemplate = {
                                "label": "'New item'",
                                "shortcut": "",
                                "divider": false,
                                "icon": { "value": "'home'", "type": "svg-icon" },
                                "notification": "",
                                "display": "true",
                                "disabled": "false",
                                "onclick": "",
                                "menuItems": { "value": [] }
                            }
                            if ( scope.menuItems.value.length > 0 ) {
                                angular.forEach(scope.arrayElement, function(obj, index){
                                    if (index === scope.indexMenuItem) {
                                        scope.arrayElement.splice(index+1, 0, menuItemTemplate);
                                        return;
                                    };
                                });
                                $timeout(function() {
                                    scope.indexMenuItem = scope.indexMenuItem + 1;
                                    scope.menu = scope.arrayElement[scope.indexMenuItem];
                                    var currentItem = $("md-content.menu-structure").find('li.active');
                                    $("md-content.menu-structure").find('li').removeClass('active');
                                    currentItem.next().addClass('active');
                                    scope.parentMenuItem = scope.parentMenuItem.next();
                                }, 0);
                            } else {
                                scope.menuItems.value.push(menuItemTemplate);
                                $timeout(function() {
                                    scope.arrayElement = scope.menuItems.value;
                                    scope.indexMenuItem = 0;
                                    scope.parentMenuItem = $("md-content.menu-structure li.menu-tree-item");
                                    $(scope.parentMenuItem).addClass('active');
                                    scope.menu = scope.menuItems.value[0];
                                }, 0);
                            }
                            scope.menuEditorItem.type = 'standard';
                            $timeout(function() {
                                scope.waitableItem.value = scope.menu.hasOwnProperty('waiting') ? true : false;
                            }, 250);
                        }
                        scope.deleteMenuItem = function() {
                            if ( scope.menuItems.value.length > 0 ) {
                                if ( scope.arrayElement.length > 1 ) {
                                    $timeout(function() {
                                        if ( scope.arrayElement.length === scope.indexMenuItem + 1 ) {
                                            scope.parentMenuItem = $("md-content.menu-structure").find('li.active').prev();
                                            scope.arrayElement.splice(scope.indexMenuItem, 1);
                                            scope.indexMenuItem = scope.indexMenuItem - 1;
                                            scope.menu = scope.arrayElement[scope.indexMenuItem];
                                            $("md-content.menu-structure").find('li').removeClass('active');
                                            scope.parentMenuItem.addClass('active');
                                            scope.setMenuItemType();
                                        } else {
                                            scope.arrayElement.splice(scope.indexMenuItem, 1);
                                            scope.menu = scope.arrayElement[scope.indexMenuItem];
                                            scope.setMenuItemType();
                                        }
                                    }, 0);
                                } else {
                                    scope.arrayElement.splice(scope.indexMenuItem, 1);
                                    scope.parents = $(scope.parentMenuItem).parents('li.menu-tree-item');
                                    scope.menuLevel = scope.parents.length;
                                    scope.parentMenuItem = scope.parents.first();
                                    scope.indexMenuItem = scope.parentMenuItem.index();
                                    scope.parentMenuItem.addClass('active');
                                    scope.arrayElement = '';
                                    scope.parents.each(function(index, element){
                                        if ( index === 0 ) {
                                            scope.arrayElement = scope.bridge;
                                        } else {
                                            scope.arrayElement = scope.bridge + '[' + $(element).attr('self-index') + ']' + scope.arrayElement;
                                        }
                                    });
                                    scope.arrayElement = eval('scope' + scope.arrayElement);
                                    scope.menu = scope.arrayElement[scope.indexMenuItem];
                                }
                            }
                            $timeout(function() {
                                if (scope.menu) {
                                    scope.waitableItem.value = scope.menu.hasOwnProperty('waiting') ? true : false;
                                }
                            }, 250);
                        }
                        Array.prototype.move = function(from,to){
                            scope.gcMenuItems.removeClass('active');
                            this.splice(to,0,this.splice(from,1)[0]);
                            return this;
                        };
                        scope.moveUpMenuItem = function() {
                            if ( scope.indexMenuItem > 0 ) {
                                $timeout(function() {
                                    scope.arrayElement.move(scope.indexMenuItem - 1,scope.indexMenuItem).join(',');
                                    scope.indexMenuItem = scope.indexMenuItem - 1;
                                    $("md-content.menu-structure").find('li').removeClass('active');
                                    scope.parentMenuItem = scope.parentMenuItem.prev();
                                    scope.parentMenuItem.addClass('active');
                                    scope.setMenuItemType();
                                }, 0);
                            }
                        }
                        scope.moveDownMenuItem = function() {
                            if ( scope.indexMenuItem !== scope.arrayElement.length-1 && angular.isNumber(scope.indexMenuItem) === true ) {
                                scope.arrayElement.move(scope.indexMenuItem,scope.indexMenuItem + 1).join(',');
                                scope.indexMenuItem = scope.indexMenuItem + 1;
                                $("md-content.menu-structure").find('li').removeClass('active');
                                scope.parentMenuItem = scope.parentMenuItem.next();
                                scope.parentMenuItem.addClass('active');
                                scope.setMenuItemType();
                            }
                        }
                        scope.indentMenuItem = function() {
                            if ( scope.gc_selected.type !== 'fab' && !scope.isFabToolbar.value ) {
                                if ( scope.parentMenuItem.index() > 0 ) {
                                    scope.arrayElement[scope.parentMenuItem.index()-1].menuItems.value.push(scope.arrayElement[scope.parentMenuItem.index()]);
                                    var toSplice = scope.parentMenuItem.index();
                                    scope.parentMenuItem = $(scope.parentMenuItem).prev();
                                    scope.arrayElement.splice(toSplice, 1);
                                    scope.arrayElement = scope.arrayElement[toSplice-1].menuItems.value;
                                    $timeout(function() {
                                        $("md-content.menu-structure").find('li').removeClass('active');
                                        scope.indexMenuItem = scope.arrayElement.length - 1;
                                        $(scope.parentMenuItem).children('ul').find('li').last().addClass('active');
                                        scope.parentMenuItem = $("md-content.menu-structure").find('li.active');
                                        scope.setMenuItemType();
                                        $timeout(function() {
                                            scope.waitableItem.value = scope.menu.hasOwnProperty('waiting') ? true : false;
                                        }, 250);
                                    }, 0);
                                }
                            } else {
                                $mdToast.show(
                                    $mdToast.simple()
                                        .theme('warn-toast')
                                        .textContent("FAB items can't be indented")
                                        .position('top right')
                                        .hideDelay(3000)
                                );
                            }
                        }
                        scope.outdentMenuItem = function() {
                            if ( scope.gc_selected.type !== 'fab' && !scope.isFabToolbar.value ) {
                                scope.parents = $(scope.parentMenuItem).parents('li.menu-tree-item');
                                if ( scope.parents.length > 0 ) {
                                    scope.outdentElement = scope.arrayElement[scope.indexMenuItem];
                                    scope.arrayElement.splice(scope.indexMenuItem, 1);
                                    scope.arrayElement = '';
                                    scope.bridge = '.menuItems.value';
                                    scope.parents.each(function(index, element){
                                        if ( index === 0 ) {
                                            scope.arrayElement = scope.bridge;
                                            scope.parentMenuItem = $(element);
                                            scope.indexMenuItem = $(scope.parentMenuItem).index() + 1;
                                        } else {
                                            scope.arrayElement = scope.bridge + '[' + $(element).attr('self-index') + ']' + scope.arrayElement;
                                        }
                                    });
                                    $("md-content.menu-structure").find('li').removeClass('active');
                                    scope.arrayElement = eval('scope' + scope.arrayElement);
                                    scope.arrayElement.splice(scope.indexMenuItem, 0, scope.outdentElement);
                                    $timeout(function() {
                                        scope.parentMenuItem = $(scope.parentMenuItem).next();
                                        $(scope.parentMenuItem).addClass('active');
                                        scope.setMenuItemType();
                                        $timeout(function() {
                                            scope.waitableItem.value = scope.menu.hasOwnProperty('waiting') ? true : false;
                                        }, 250);
                                    }, 0);
                                }
                            } else {
                                $mdToast.show(
                                    $mdToast.simple()
                                        .theme('warn-toast')
                                        .textContent("FAB items can't be outdented")
                                        .position('top right')
                                        .hideDelay(3000)
                                );
                            }
                        }
                        scope.ifShowMenuIconTypes = function( icon, type ) {
                            var regexp = /(^\')(.*)(\'$)/gm, filtered = regexp.exec( icon );
                            if ( icon && ( icon.indexOf('+') >= 0 ) ) { filtered = false; }
                            if ( icon === '' ) { filtered = true; }
                            if ( icon.indexOf("'") === 0 && icon.indexOf('+') === -1 && icon.charAt(icon.length-1) === "'" && !type ) {
                                icon.indexOf("'fa-") === 0 ? scope.menu.icon.type = 'fa-icon' : scope.menu.icon.type = 'svg-icon';
                            } else if ( icon.indexOf("'") === 0 && icon.indexOf('+') === -1 && icon.charAt(icon.length-1) === "'" && type !== '' ) {
                                switch ( type ) {
                                    case 'checked': icon.indexOf("'fa-") === 0 ? scope.menu.state.checkedIcon.type = 'fa-icon' : scope.menu.state.checkedIcon.type = 'svg-icon'; break;
                                    case 'unchecked': icon.indexOf("'fa-") === 0 ? scope.menu.state.uncheckedIcon.type = 'fa-icon' : scope.menu.state.uncheckedIcon.type = 'svg-icon'; break;
                                    case 'waiting': icon.indexOf("'fa-") === 0 ? scope.menu.waiting.icon.type = 'fa-icon' : scope.menu.waiting.icon.type = 'svg-icon'; break;
                                }
                            }
                            if ( !type ) {
                                scope.showIconTypes = filtered ? false : true;
                            } else if ( type !== '' ) {
                                switch ( type ) {
                                    case 'checked': scope.showCheckedIconTypes = filtered ? false : true; break;
                                    case 'unchecked': scope.showUncheckedIconTypes = filtered ? false : true; break;
                                    case 'waiting': scope.showWaitingIconTypes = filtered ? false : true; break;
                                }
                            }
                        }
                        scope.setMenuItemType = function( menuType ) {
                            $timeout(function() {
                                if ( menuType ) {
                                    switch ( menuType ) {
                                        case 'title':
                                            scope.menu.title = true;
                                            scope.menu.divider = false;
                                            if(scope.menu.state){scope.menu.state.value = false;}
                                            break;
                                        case 'divider':
                                            scope.menu.title = false;
                                            scope.menu.divider = true;
                                            if(scope.menu.state){scope.menu.state.value = false;}
                                            break;
                                        case 'selection':
                                            scope.menu.title = false;
                                            scope.menu.divider = false;
                                            if(scope.menu.state){scope.menu.state.value = true;}
                                            scope.menuEditorTabs.activeTab = 1;
                                            break;
                                        default:
                                            scope.menu.title = false;
                                            scope.menu.divider = false;
                                            if(scope.menu.state){scope.menu.state.value = false;}
                                    }
                                } else {
                                    scope.menuEditorItem = { "type": "" };
                                    if ( scope.menu.title === true ) { scope.menuEditorItem.type = 'title'; }
                                    else if ( scope.menu.divider === true ) { scope.menuEditorItem.type = 'divider'; }
                                    else if ( scope.statable.value && scope.menu.state && scope.menu.state.value === true ) { scope.menuEditorItem.type = 'selection'; scope.menuEditorTabs.activeTab = 1; }
                                    else { scope.menuEditorItem.type = 'standard'; }
                                }
                            }, 0);
                        }
                        scope.showSamples = function(){
                            console.log(scope.dialogGcType);
                            $('#' + scope.component_id + '_md_dialog .second-dialog-box').load('/gcontrols/web/gcs_json_samples.html');
                            $timeout(function() {
                                $compile($('.second-dialog-box').contents())(scope);
                                $('#' + scope.component_id + '_md_dialog .second-dialog').fadeIn(250);
                            }, 250);
                        }
                        scope.closeDialog = function() {
                            $mdDialog.hide();
                        }
                        scope.closeSamples = function() {
                            $(".second-dialog").fadeOut('250', function() { $(this).remove(); });
                        }
                    }
                })
            };
        }
    }
}]);

dfxGcTemplateEditorApp.directive('dfxVeMenuIcons', [ '$http', '$timeout', '$compile', '$filter', function($http, $timeout, $compile, $filter) {
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        templateUrl: function(el, attrs) {
            return '/gcontrols/web/picker_menu_icon.html';
        },
        controller: function($scope, $element, $attrs) {
            $scope.faIcons = [];
            $http.get('/gcontrols/web/picker_icon.json').then(function(res){
                for ( var i = 0; i < res.data.faClasses.length; i++ ) {
                    var faResIcon = { "value": res.data.faClasses[i], "category": "'fa-icons'", "type": "fa-icon" };
                    $scope.faIcons.push( faResIcon );
                }
            });
            $scope.svgCategories = [];
            $scope.svgIcons = [];
            $http.get('/gcontrols/web/mdicons.json').then(function(res){
                for ( var i = 0; i < res.data.length; i++ ) {
                    $scope.svgCategories.push( res.data[i].type );
                    for ( var j = 0; j < res.data[i].items.length; j++ ) {
                        var svgResIcon = { "value": res.data[i].items[j], "category": "'"+res.data[i].type+"','svg-icons'", "type": "svg-icon" };
                        $scope.svgIcons.push( svgResIcon );
                    }
                }
            });
            $timeout(function(){
                $scope.dfxIconsList = $scope.svgIcons.concat($scope.faIcons);
                $scope.dfxFilteredIconsList = $scope.dfxIconsList;
            }, 250);
            $scope.targetItem = {};
            $scope.iconsCategory = '';
            $scope.chooseIconsCategory = function( iconCategory, ev ) {
                $scope.dfxIconsList = $filter('filter')($scope.dfxFilteredIconsList, "'"+iconCategory+"'", 'strict');
                switch ( iconCategory ) {
                    case 'svg-icons': $scope.iconsCategory = '/ ' + 'SVG Icons'; break;
                    case 'fa-icons': $scope.iconsCategory = '/ ' + 'Font Awesome Icons'; break;
                    default: $scope.iconsCategory = '/ ' + iconCategory;
                }
                $(".dfx-ve-icons-categories span").removeClass('active');
                $(ev.target).addClass('active');
            }
            $scope.searchIcons = function( icon ) {
                $scope.dfxIconsList = $filter('filter')($scope.dfxFilteredIconsList, icon, 'strict');
                $scope.iconsCategory = '| ' + icon;
                $(".dfx-ve-icons-categories span").removeClass('active');
            }
            $scope.showMenuIcons = function(ev, menuItem) {
                $scope.targetItem = menuItem;

                var dfxCssStyleDialog = '<div class="dfx-ve-dialog"></div>';
                $('body').append(dfxCssStyleDialog);
                $('.dfx-ve-dialog').load('/gcontrols/web/menu_dialog_icons.html', function(response,status,xhr){
                    $compile($('.dfx-ve-dialog').contents())($scope);
                    $('.sp-container').remove();
                    // $timeout(function() {
                    //     $('.dfx-ve-css-style-editor').addClass('active');
                    // $('#' + $scope.component_id + '_md_dialog .second-dialog-box').load('/gcontrols/web/menu_dialog_icons.html');
                    $timeout(function() {
                        // $compile($('.second-dialog-box').contents())($scope);
                        $('#' + $scope.component_id + '_md_dialog .second-dialog').delay(500).fadeIn(500);
                    }, 0);
                });
            }
            $scope.setDfxIcon = function(icon, type) {
                if ( !$attrs.dfxMenuState ) {
                    $scope.targetItem.icon = { "value": "'" + icon + "'", type: type }
                } else {
                    switch ( $attrs.dfxMenuState ) {
                        case 'checked':
                            $scope.targetItem.state.checkedIcon.value = "'" + icon + "'";
                            $scope.targetItem.state.checkedIcon.type = type;
                            break;
                        case 'unchecked':
                            $scope.targetItem.state.uncheckedIcon.value = "'" + icon + "'";
                            $scope.targetItem.state.uncheckedIcon.type = type;
                            break;
                    }
                }
                $timeout(function(){
                    $($scope.targetMenuIcon).focus().blur();
                }, 0);
                $(".second-dialog").fadeOut('250', function() { $(this).remove(); });
            }
            $scope.closeMenuIcon = function() {
                $(".second-dialog").fadeOut('250', function() { $(this).remove(); });
            }
        }
    }
}]);

dfxGcTemplateEditorApp.directive('dfxVeMenuExpression', [ '$timeout', '$compile', function($timeout, $compile) {
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        templateUrl: function(el, attrs) {
            return '/gcontrols/web/picker_menu_expression.html';
        },
        controller: function($scope, $element, $attrs) {
            $scope.showMenuExpression = function(ev) {
                $('#' + $scope.component_id + '_md_dialog .second-dialog-box').load('/gcontrols/web/menu_dialog_expression.html');
                $timeout(function() {
                    $compile($('.second-dialog-box').contents())($scope);
                    $scope.targetMenuExprPicker = ev.target;
                    $scope.targetMenuExpression = $($scope.targetMenuExprPicker).parent().children('input');
                    $scope.targetMenuExpValue = angular.element($scope.targetMenuExpression).data('$ngModelController').$viewValue;
                    $("textarea.expression-textarea").val($scope.targetMenuExpValue);
                    $('#' + $scope.component_id + '_md_dialog .second-dialog').fadeIn(250);
                }, 250);
            }
            $scope.addExpression = function(ev) {
                var cursorPos = document.getElementById($scope.component_id+"_expression_textarea").selectionStart,
                areaValue = $("#"+$scope.component_id+"_expression_textarea").val(),
                expressionLength = $("#"+$scope.component_id+"_expression_textarea").val().length,
                varName = ev.target.textContent;
                $("#"+$scope.component_id+"_expression_textarea").val(areaValue.substring(0, cursorPos) + varName + areaValue.substring(cursorPos));
            }
            $scope.saveMenuExpression = function() {
                var newMenuExpression = $("textarea.expression-textarea").val();
                $scope.targetMenuExpression.val(newMenuExpression);
                angular.element($scope.targetMenuExpression).data('$ngModelController').$setViewValue(newMenuExpression);
                $($scope.targetMenuExpression).focus().blur();
                $(".second-dialog").fadeOut('250', function() { $(this).remove(); });
            }
            $scope.clearMenuExpression = function() {
                $("textarea.expression-textarea").val('');
            }
            $scope.closeMenuExpression = function() {
                $(".second-dialog").fadeOut('250', function() { $(this).remove(); });
            }
        }
    }
}]);

dfxGcTemplateEditorApp.directive('dfxVeTreeEditor', [ '$mdDialog', '$mdToast', '$http', '$timeout', function($mdDialog, $mdToast, $http, $timeout) {
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        templateUrl: function( el, attrs ) {
            return '/gcontrols/web/treeview_picker.html';
        },
        link: function(scope, element, attrs) {
            scope.showTreeEditor = function(ev) {
                scope.attributes.static.status = "overridden";
                $mdDialog.show({
                    scope: scope.$new(),
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose:true,
                    ariaLabel: 'tree-view-editor',
                    templateUrl: '/gcontrols/web/treeview_editor.html',
                    onComplete: function() {
                        scope.children = scope.attributes.static.value;
                        scope.tree = scope.children[0];
                        $timeout(function() {
                            scope.indexTreeItem = 0;
                            scope.arrayElement = scope.children;
                            scope.gcTreeItems = $("md-content.tree-structure").find('li');
                            $("md-content.tree-structure > ul > li:first-child").addClass('active');
                            scope.parentTreeItem = $("md-content.tree-structure").find('li.active');
                        }, 0);
                    },
                    controller: function(){
                        scope.selectTreeItem = function(ev, treeItem) {
                            scope.tree = treeItem;
                            scope.selectedTreeItem = ev.target,
                            scope.selfParents = $(scope.selectedTreeItem).parents('li.tree-view-item'),
                            scope.levelTreeItem = scope.selfParents.length,
                            scope.parentTreeItem = $(scope.selectedTreeItem).parent();
                            scope.indexTreeItem = scope.parentTreeItem.index();
                            scope.indexParentTreeItem = '';
                            scope.gcTreeItems = $("md-content.tree-structure").find('li');
                            scope.arrayElement = '';
                            scope.bridge = '.children';
                            scope.indentPath = '';
                            scope.outdentPath = '';
                            scope.gcTreeItems.removeClass('active');
                            scope.parentTreeItem.addClass('active');
                            scope.selfParents.each(function(index, element){
                                if (index === 0) {
                                    scope.arrayElement = scope.bridge;
                                    scope.indexParentTreeItem = $(element).attr('parent-index');
                                    var indendIndex = $(element).attr('self-index') - 1;
                                    scope.indentPath = scope.bridge + '[' + indendIndex + ']' + scope.bridge;
                                    if ($(element).attr('self-index') > 0) {
                                        scope.canIndent = true;
                                    } else {
                                        scope.canIndent = false;
                                    }
                                } else if (index === 1) {
                                    scope.indentPath = scope.bridge + '[' + $(element).attr('self-index') + ']' + scope.indentPath;
                                    scope.outdentPath = scope.bridge;
                                    scope.arrayElement = scope.bridge + '[' + $(element).attr('self-index') + ']' + scope.arrayElement;

                                } else {
                                    scope.arrayElement = scope.bridge + '[' + $(element).attr('self-index') + ']' + scope.arrayElement;
                                    scope.indentPath = scope.bridge + '[' + $(element).attr('self-index') + ']' + scope.indentPath;
                                    scope.outdentPath = scope.bridge + '[' + $(element).attr('self-index') + ']' + scope.outdentPath;
                                }
                            })
                            scope.arrayElement = eval('scope' + scope.arrayElement);
                            scope.outdentPath = eval('scope' + scope.outdentPath);
                        }
                        scope.addTreeItem = function() {
                            var treeItemTemplate = {
                                "name": "'New item'",
                                "children": []
                            }
                            if ( scope.children.length > 0 ) {
                                angular.forEach(scope.arrayElement, function(obj, index){
                                    if (index === scope.indexTreeItem) {
                                        scope.arrayElement.splice(index+1, 0, treeItemTemplate);
                                        return;
                                    }
                                });
                                $timeout(function() {
                                    scope.indexTreeItem = scope.indexTreeItem + 1;
                                    scope.tree = scope.arrayElement[scope.indexTreeItem];
                                    var currentItem = $("md-content.tree-structure").find('li.active');
                                    $("md-content.tree-structure").find('li').removeClass('active');
                                    currentItem.next().addClass('active');
                                    scope.parentTreeItem = scope.parentTreeItem.next();
                                }, 0);
                            } else {
                                scope.children.push(treeItemTemplate);
                                $timeout(function() {
                                    scope.arrayElement = scope.children;
                                    scope.indexTreeItem = 0;
                                    scope.parentTreeItem = $("md-content.tree-structure li.tree-view-item");
                                    $(scope.parentTreeItem).addClass('active');
                                    scope.tree = scope.children[0];
                                }, 0);
                            }
                        }
                        scope.deleteTreeItem = function() {
                            if ( scope.children.length > 0 ) {
                                if ( scope.arrayElement.length > 1 ) {
                                    $timeout(function() {
                                        if ( scope.arrayElement.length === scope.indexTreeItem + 1 ) {
                                            scope.parentTreeItem = $("md-content.tree-structure").find('li.active').prev();
                                            scope.arrayElement.splice(scope.indexTreeItem, 1);
                                            scope.indexTreeItem = scope.indexTreeItem - 1;
                                            scope.tree = scope.arrayElement[scope.indexTreeItem];
                                            $("md-content.tree-structure").find('li').removeClass('active');
                                            scope.parentTreeItem.addClass('active');
                                        } else {
                                            scope.arrayElement.splice(scope.indexTreeItem, 1);
                                            scope.tree = scope.arrayElement[scope.indexTreeItem];
                                        }
                                    }, 0);
                                } else {
                                    scope.arrayElement.splice(scope.indexTreeItem, 1);
                                    scope.parents = $(scope.parentTreeItem).parents('li.tree-view-item');
                                    scope.treeLevel = scope.parents.length;
                                    scope.parentTreeItem = scope.parents.first();
                                    scope.indexTreeItem = scope.parentTreeItem.index();
                                    scope.parentTreeItem.addClass('active');
                                    scope.arrayElement = '';
                                    scope.parents.each(function(index, element){
                                        if ( index === 0 ) {
                                            scope.arrayElement = scope.bridge;
                                        } else {
                                            scope.arrayElement = scope.bridge + '[' + $(element).attr('self-index') + ']' + scope.arrayElement;
                                        }
                                    });
                                    scope.arrayElement = eval('scope' + scope.arrayElement);
                                    scope.tree = scope.arrayElement[scope.indexTreeItem];
                                }
                            }
                        }
                        Array.prototype.move = function(from,to){
                            scope.gcTreeItems.removeClass('active');
                            this.splice(to,0,this.splice(from,1)[0]);
                            return this;
                        }
                        scope.moveUpTreeItem = function() {
                            if ( scope.indexTreeItem > 0 ) {
                                $timeout(function() {
                                    scope.arrayElement.move(scope.indexTreeItem - 1,scope.indexTreeItem).join(',');
                                    scope.indexTreeItem = scope.indexTreeItem - 1;
                                    $("md-content.tree-structure").find('li').removeClass('active');
                                    scope.parentTreeItem = scope.parentTreeItem.prev();
                                    scope.parentTreeItem.addClass('active');
                                }, 0);
                            }
                        }
                        scope.moveDownTreeItem = function() {
                            if ( scope.indexTreeItem !== scope.arrayElement.length-1 && angular.isNumber(scope.indexTreeItem) === true ) {
                                scope.arrayElement.move(scope.indexTreeItem,scope.indexTreeItem + 1).join(',');
                                scope.indexTreeItem = scope.indexTreeItem + 1;
                                $("md-content.tree-structure").find('li').removeClass('active');
                                scope.parentTreeItem = scope.parentTreeItem.next();
                                scope.parentTreeItem.addClass('active');
                            }
                        }
                        scope.indentTreeItem = function() {
                            if ( scope.parentTreeItem.index() > 0 ) {
                                scope.arrayElement[scope.parentTreeItem.index()-1].children.push(scope.arrayElement[scope.parentTreeItem.index()]);
                                var toSplice = scope.parentTreeItem.index();
                                scope.parentTreeItem = $(scope.parentTreeItem).prev();
                                scope.arrayElement.splice(toSplice, 1);
                                scope.arrayElement = scope.arrayElement[toSplice-1].children;
                                $timeout(function() {
                                    $("md-content.tree-structure").find('li').removeClass('active');
                                    scope.indexTreeItem = scope.arrayElement.length - 1;
                                    $(scope.parentTreeItem).children('ul').find('li').last().addClass('active');
                                    scope.parentTreeItem = $("md-content.tree-structure").find('li.active');
                                }, 0);
                            }
                        }
                        scope.outdentTreeItem = function() {
                            scope.parents = $(scope.parentTreeItem).parents('li.tree-view-item');
                            if ( scope.parents.length > 0 ) {
                                scope.outdentElement = scope.arrayElement[scope.indexTreeItem];
                                scope.arrayElement.splice(scope.indexTreeItem, 1);
                                scope.arrayElement = '';
                                scope.bridge = '.children';
                                scope.parents.each(function(index, element){
                                    if ( index === 0 ) {
                                        scope.arrayElement = scope.bridge;
                                        scope.parentTreeItem = $(element);
                                        scope.indexTreeItem = $(scope.parentTreeItem).index() + 1;
                                    } else {
                                        scope.arrayElement = scope.bridge + '[' + $(element).attr('self-index') + ']' + scope.arrayElement;
                                    }
                                });
                                $("md-content.tree-structure").find('li').removeClass('active');
                                scope.arrayElement = eval('scope' + scope.arrayElement);
                                scope.arrayElement.splice(scope.indexTreeItem, 0, scope.outdentElement);
                                $timeout(function() {
                                    scope.parentTreeItem = $(scope.parentTreeItem).next();
                                    $(scope.parentTreeItem).addClass('active');
                                }, 0);
                            }
                        }
                        scope.closeDialog = function() {
                            $mdDialog.hide();
                        }
                    }
                });
            }
        }
    }
}]);

dfxGcTemplateEditorApp.directive('dfxGcToolbarDesign', function($sce, $compile, $timeout, $mdMenu, $filter) {
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        templateUrl: function( el, attrs) {
            return '/gcontrols/web/toolbar_design.html';
        },
        link: function(scope, element, attrs) {
            var singleMenuItem ='', toolbarType='', iconbarMenuItem = '<md-menu-item ng-if="{{itemDisplay}}">';
            var rebuildIcons = function( menuItems ) {
                for ( var i = 0; i < menuItems.length; i++ ) {
                    if ( typeof menuItems[i].icon === 'string' ) {
                        var tempIco = menuItems[i].icon;
                        menuItems[i].icon = {
                            "value": tempIco,
                            "type": menuItems[i].hasOwnProperty('iconType') ? menuItems[i].iconType : 'fa-icon'
                        }
                    }
                    if ( menuItems[i].menuItems.value.length > 0 ) {
                        rebuildIcons( menuItems[i].menuItems.value );
                    }
                }
            }

            scope.cleanFabClasses = function( fab ){
                if ( fab.class.indexOf('md-fab') > -1 ) { fab.class = fab.class.replace('md-fab', ""); }
                if ( fab.class.indexOf('md-raised') > -1 ) { fab.class = fab.class.replace('md-raised', ""); }
                if ( fab.class.indexOf('md-primary') > -1 ) { fab.class = fab.class.replace('md-primary', ""); }
                if ( fab.class.indexOf('md-mini') > -1 ) { fab.class = fab.class.replace('md-mini', ""); }
            }

            $timeout(function() {
                if(scope.attributes.toolbar.leftMenu.hasOwnProperty('menuItemsType')){
                    scope.attributes.toolbar.rightMenu.menuItemsType = { "value": "static" };
                }
                if(scope.attributes.toolbar.rightMenu.hasOwnProperty('menuItemsType')){
                    scope.attributes.toolbar.rightMenu.menuItemsType = { "value": "static" };
                }
                rebuildIcons( scope.attributes.toolbar.leftMenu.menuItems.value );
                rebuildIcons( scope.attributes.toolbar.rightMenu.menuItems.value );
                scope.cleanFabClasses(scope.attributes.toolbar.leftMenu.fab.triggerButton);
                scope.cleanFabClasses(scope.attributes.toolbar.leftMenu.fab.actionButton);
                scope.cleanFabClasses(scope.attributes.toolbar.rightMenu.fab.triggerButton);
                scope.cleanFabClasses(scope.attributes.toolbar.rightMenu.fab.actionButton);

                if ( !scope.attributes.toolbar.leftMenu.fab.triggerButton.icon.hasOwnProperty('size') ) {
                    scope.attributes.toolbar.leftMenu.fab.triggerButton.label = "";
                    scope.attributes.toolbar.leftMenu.fab.triggerButton.style = "";
                    scope.attributes.toolbar.leftMenu.fab.triggerButton.tooltip = { "direction": "top", "style": "", "class": "" };
                    scope.attributes.toolbar.leftMenu.fab.triggerButton.icon = { "size" : 24, "style": "", "class": "", "value": "'fa-bars'", "type" : "fa-icon" }
                }
                if ( !scope.attributes.toolbar.rightMenu.fab.triggerButton.icon.hasOwnProperty('size') ) {
                    scope.attributes.toolbar.rightMenu.fab.triggerButton.label = "";
                    scope.attributes.toolbar.rightMenu.fab.triggerButton.style = "";
                    scope.attributes.toolbar.rightMenu.fab.triggerButton.tooltip = { "direction": "top", "style": "", "class": "" };
                    scope.attributes.toolbar.rightMenu.fab.triggerButton.icon = { "size" : 24, "style": "", "class": "", "value": "'fa-bars'", "type" : "fa-icon" }
                }
                if ( !scope.attributes.toolbar.leftMenu.fab.actionButton.icon.hasOwnProperty('size') ) {
                    scope.attributes.toolbar.leftMenu.fab.actionButton.style = "";
                    scope.attributes.toolbar.leftMenu.fab.actionButton.icon = { "size" : 20, "style": "", "class": "" };
                    scope.attributes.toolbar.leftMenu.fab.actionButton.tooltip = { "direction": "top", "style": "", "class": "" };
                }
                if ( !scope.attributes.toolbar.rightMenu.fab.actionButton.icon.hasOwnProperty('size') ) {
                    scope.attributes.toolbar.rightMenu.fab.actionButton.style = "";
                    scope.attributes.toolbar.rightMenu.fab.actionButton.icon = { "size" : 20, "style": "", "class": "" };
                    scope.attributes.toolbar.rightMenu.fab.actionButton.tooltip = { "direction": "top", "style": "", "class": "" };
                }

                if ( !scope.attributes.toolbar.leftMenu.hasOwnProperty('iconBar') ) {
                    scope.attributes.toolbar.leftMenu.iconBar = {
                        "triggerButton": { "style": "", "class": "", "icon": { "size": 24, "style": "", "class": "" } },
                        "actionButton": { "style": "", "class": "", "icon": { "size": 16, "style": "", "class": "" } }
                    }
                    scope.attributes.toolbar.leftMenu.buttons = {
                        "triggerButton": { "style": "", "class": "", "icon": { "size": 20, "style": "", "class": "" } },
                        "actionButton": { "style": "", "class": "", "icon": { "size": 16, "style": "", "class": "" } }
                    }
                    delete scope.attributes.toolbar.leftMenu.buttonStyle;
                    delete scope.attributes.toolbar.leftMenu.iconStyle;
                }
                if ( !scope.attributes.toolbar.rightMenu.hasOwnProperty('iconBar') ) {
                    scope.attributes.toolbar.rightMenu.iconBar = {
                        "triggerButton": { "style": "", "class": "", "icon": { "size": 24, "style": "", "class": "" } },
                        "actionButton": { "style": "", "class": "", "icon": { "size": 16, "style": "", "class": "" } }
                    }
                    scope.attributes.toolbar.rightMenu.buttons = {
                        "triggerButton": { "style": "", "class": "", "icon": { "size": 20, "style": "", "class": "" } },
                        "actionButton": { "style": "", "class": "", "icon": { "size": 16, "style": "", "class": "" } }
                    }
                    delete scope.attributes.toolbar.rightMenu.buttonStyle;
                    delete scope.attributes.toolbar.rightMenu.iconStyle;
                }
            }, 250);

            var buildNextLevel = function ( nextLevel, road ) {
                for ( var i = 0; i < nextLevel.length; i++ ) {
                    if ( nextLevel[i].menuItems.value.length > 0 ) {
                        var iconbarItem = iconbarMenuItem.replace('{{itemDisplay}}', true);
                        scope.iconBar = scope.iconBar + iconbarItem + '<md-menu>';
                        createDfxMenuItem( nextLevel[i], 'singleMenuItem', road, i );
                        buildNextLevel( nextLevel[i].menuItems.value, road + ',' + i );
                        scope.iconBar = scope.iconBar + '</md-menu-content></md-menu></md-menu-item>';
                    } else {
                        if ( nextLevel[i].divider === true ) {
                            scope.iconBar = scope.iconBar + '<md-menu-divider></md-menu-divider>';
                        } else if ( nextLevel[i].title === true ) {
                            scope.iconBar = scope.iconBar + '<md-menu-item class="tree-menu-title"><div>'+'{{'+nextLevel[i].label+' | checkExpression}}'+'</div></md-menu-item>';
                        } else {
                            var iconbarItem = iconbarMenuItem.replace('{{itemDisplay}}', true);
                            scope.iconBar = scope.iconBar + iconbarItem;
                            createDfxMenuItem( nextLevel[i], 'singleMenuItem', road, i );
                        }
                    }
                }
            }

            var createDfxMenuItem = function( dfxMenuItem, type, level, index ) {
                if ( typeof dfxMenuItem.icon === 'string' ) {
                    var tempIcon = dfxMenuItem.icon;
                    dfxMenuItem.icon = {
                        "value": tempIcon,
                        "type":  dfxMenuItem.hasOwnProperty('iconType') ? dfxMenuItem.iconType : 'fa-icon'
                    }
                }
                var tempPropObject = {};
                tempPropObject.faIcon =                 dfxMenuItem.icon.value.indexOf("'") == -1 ? 'fa-home' : eval(dfxMenuItem.icon.value);
                tempPropObject.svgIcon =                dfxMenuItem.icon.value.indexOf("'") == -1 ? 'home' : eval(dfxMenuItem.icon.value);
                tempPropObject.faItemIndex =            level >= 0 ? level + ',' + index : index;
                tempPropObject.svgItemIndex =           level >= 0 ? level + ',' + index : index;
                tempPropObject.itemDisabled =           dfxMenuItem.disabled;
                tempPropObject.itemDisplay =            true;
                tempPropObject.itemLabel =              $filter('checkExpression')(dfxMenuItem.label);
                tempPropObject.itemClick =              dfxMenuItem.menuItems.value.length > 0 ? '$mdOpenMenu();'+dfxMenuItem.onclick : 'unfocusButton($event);'+dfxMenuItem.onclick;
                if ( type === 'singleMenuItem' ) {
                    tempPropObject.itemShortcut =       dfxMenuItem.shortcut;
                    tempPropObject.ifItemNotification = dfxMenuItem.notification.length > 0 ? true : false;
                    tempPropObject.itemNotification =   dfxMenuItem.notification;
                }
                if ( toolbarType==='iconBar' ) {
                    if ( dfxMenuItem.hasOwnProperty('waiting')) { delete dfxMenuItem.waiting; }
                    if ( !dfxMenuItem.hasOwnProperty('state') ) {
                        dfxMenuItem.state = {
                            "value":           false,
                            "binding":         "true",
                            "checkedIcon":   { "value": "'thumb_up'", "type": "svg-icon", "style": "", "class": "" },
                            "uncheckedIcon": { "value": "'thumb_down'", "type": "svg-icon", "style": "", "class": "" }
                        };
                    }
                    tempPropObject.ifFaIcon =               dfxMenuItem.icon.value.length > 0 && dfxMenuItem.icon.type === 'fa-icon' && !dfxMenuItem.state.value ? true : false;
                    tempPropObject.ifSvgIcon =              dfxMenuItem.icon.value.length > 0 && dfxMenuItem.icon.type === 'svg-icon' && !dfxMenuItem.state.value ? true : false;
                    tempPropObject.ifStateFaIcon =          dfxMenuItem.state.checkedIcon.value.length > 0 && dfxMenuItem.state.checkedIcon.type === 'fa-icon' && dfxMenuItem.state.value ? true : false;
                    tempPropObject.ifStateSvgIcon =         dfxMenuItem.state.checkedIcon.value.length > 0 && dfxMenuItem.state.checkedIcon.type === 'svg-icon' && dfxMenuItem.state.value ? true : false;
                    tempPropObject.stateFaIcon =            dfxMenuItem.state.checkedIcon.value.indexOf("'") == -1 ? 'fa-thumbs-up' : eval(dfxMenuItem.state.checkedIcon.value);
                    tempPropObject.stateSvgIcon =           dfxMenuItem.state.checkedIcon.value.indexOf("'") == -1 ? 'thumb_up' : eval(dfxMenuItem.state.checkedIcon.value);
                    tempPropObject.stateFaIconStyle =       dfxMenuItem.state.checkedIcon.style;
                    tempPropObject.stateSvgIconStyle =      dfxMenuItem.state.checkedIcon.style;
                    tempPropObject.stateFaIconClass =       dfxMenuItem.state.checkedIcon.class;
                    tempPropObject.stateSvgIconClass =      dfxMenuItem.state.checkedIcon.class;
                } else if (  toolbarType==='buttons' ) {
                    scope.waitableItem = { "value": false };
                    if ( dfxMenuItem.hasOwnProperty('state')) { delete dfxMenuItem.state; }
                    if ( typeof level === 'undefined' ) {
                        scope.waitableItem.value = true;
                        if ( !dfxMenuItem.hasOwnProperty('waiting') ) {
                            dfxMenuItem.waiting = {
                                "value": "", "autoDisabled": false,
                                "icon": { "value": "'fa-spinner'", "type": "fa-icon", "style": "", "class": "fa-pulse" }
                            }
                        }
                    } else {
                        scope.waitableItem.value = false;
                        if ( dfxMenuItem.hasOwnProperty('waiting')) { delete dfxMenuItem.waiting; }
                    }
                    if ( type === 'singleMenuItem' ) {
                        tempPropObject.ifFaIcon =              dfxMenuItem.icon.value.length > 0 && dfxMenuItem.icon.type === 'fa-icon' ? true : false;
                        tempPropObject.ifSvgIcon =             dfxMenuItem.icon.value.length > 0 && dfxMenuItem.icon.type === 'svg-icon' ? true : false;
                    } else {
                        tempPropObject.ifFaIcon =              dfxMenuItem.icon.value.length > 0 && dfxMenuItem.icon.type === 'fa-icon' && dfxMenuItem.waiting.value !=='true' ? true : false;
                        tempPropObject.ifSvgIcon =             dfxMenuItem.icon.value.length > 0 && dfxMenuItem.icon.type === 'svg-icon' && dfxMenuItem.waiting.value !=='true' ? true : false;
                        tempPropObject.ifWaitFaIcon =          dfxMenuItem.icon.value.length > 0 && dfxMenuItem.icon.type === 'fa-icon' && dfxMenuItem.waiting.value ==='true' ? true : false;
                        tempPropObject.ifWaitSvgIcon =         dfxMenuItem.icon.value.length > 0 && dfxMenuItem.icon.type === 'svg-icon' && dfxMenuItem.waiting.value ==='true' ? true : false;
                        tempPropObject.waitFaIcon =            dfxMenuItem.waiting.icon.value.indexOf("'") == -1 ? 'fa-spinner' : eval(dfxMenuItem.waiting.icon.value);
                        tempPropObject.waitSvgIcon =           dfxMenuItem.waiting.icon.value.indexOf("'") == -1 ? 'track_changes' : eval(dfxMenuItem.waiting.icon.value);
                        tempPropObject.waitFaIconStyle =       dfxMenuItem.waiting.icon.style;
                        tempPropObject.waitSvgIconStyle =      dfxMenuItem.waiting.icon.style;
                        tempPropObject.waitFaIconClass =       dfxMenuItem.waiting.icon.class;
                        tempPropObject.waitSvgIconClass =      dfxMenuItem.waiting.icon.class;
                    }
                }
                var tempMenu = '';
                if ( type === 'singleMenuItem' ) {
                    tempMenu = singleMenuItem
                        .replace('{{ifFaIcon}}',           tempPropObject.ifFaIcon )
                        .replace('{{ifSvgIcon}}',          tempPropObject.ifSvgIcon )
                        .replace('{{ifStateFaIcon}}',      tempPropObject.ifStateFaIcon )
                        .replace('{{ifStateSvgIcon}}',     tempPropObject.ifStateSvgIcon )
                        .replace('{{faIcon}}',             tempPropObject.faIcon )
                        .replace('{{svgIcon}}',            tempPropObject.svgIcon )
                        .replace('{{stateFaIcon}}',        tempPropObject.stateFaIcon )
                        .replace('{{stateSvgIcon}}',       tempPropObject.stateSvgIcon )
                        .replace('{{stateFaIconStyle}}',   tempPropObject.stateFaIconStyle )
                        .replace('{{stateSvgIconStyle}}',  tempPropObject.stateSvgIconStyle )
                        .replace('{{stateFaIconClass}}',   tempPropObject.stateFaIconClass )
                        .replace('{{stateSvgIconClass}}',  tempPropObject.stateSvgIconClass )
                        .replace('{{itemLabel}}',          tempPropObject.itemLabel )
                        .replace('{{itemShortcut}}',       tempPropObject.itemShortcut )
                        .replace('{{ifItemNotification}}', tempPropObject.ifItemNotification )
                        .replace('{{itemNotification}}',   tempPropObject.itemNotification )
                        .replace('{{itemIndex}}',          tempPropObject.itemIndex )
                        .replace('{{itemDisplay}}',        tempPropObject.itemDisplay )
                        .replace('{{itemDisabled}}',       tempPropObject.itemDisabled )
                        .replace('{{itemClick}}',          tempPropObject.itemClick );
                } else {
                    tempMenu = scope.rootMenuItem
                        .replace('{{ifFaIcon}}',           tempPropObject.ifFaIcon )
                        .replace('{{ifSvgIcon}}',          tempPropObject.ifSvgIcon )
                        .replace('{{ifStateFaIcon}}',      tempPropObject.ifStateFaIcon )
                        .replace('{{ifStateSvgIcon}}',     tempPropObject.ifStateSvgIcon )
                        .replace('{{ifWaitFaIcon}}',       tempPropObject.ifWaitFaIcon )
                        .replace('{{ifWaitSvgIcon}}',      tempPropObject.ifWaitSvgIcon )
                        .replace('{{faIcon}}',             tempPropObject.faIcon )
                        .replace('{{svgIcon}}',            tempPropObject.svgIcon )
                        .replace('{{stateFaIcon}}',        tempPropObject.stateFaIcon )
                        .replace('{{stateSvgIcon}}',       tempPropObject.stateSvgIcon )
                        .replace('{{stateFaIconStyle}}',   tempPropObject.stateFaIconStyle )
                        .replace('{{stateSvgIconStyle}}',  tempPropObject.stateSvgIconStyle )
                        .replace('{{stateFaIconClass}}',   tempPropObject.stateFaIconClass )
                        .replace('{{stateSvgIconClass}}',  tempPropObject.stateSvgIconClass )
                        .replace('{{waitFaIcon}}',         tempPropObject.waitFaIcon )
                        .replace('{{waitSvgIcon}}',        tempPropObject.waitSvgIcon )
                        .replace('{{waitFaIconStyle}}',    tempPropObject.waitFaIconStyle )
                        .replace('{{waitSvgIconStyle}}',   tempPropObject.waitSvgIconStyle )
                        .replace('{{waitFaIconClass}}',    tempPropObject.waitFaIconClass )
                        .replace('{{waitSvgIconClass}}',   tempPropObject.waitSvgIconClass )
                        .replace('{{itemLabel}}',          tempPropObject.itemLabel )
                        .replace('{{itemIndex}}',          tempPropObject.itemIndex )
                        .replace('{{itemDisplay}}',        tempPropObject.itemDisplay )
                        .replace('{{itemDisabled}}',       tempPropObject.itemDisabled )
                        .replace('{{itemClick}}',          tempPropObject.itemClick );
                }
                if ( dfxMenuItem.menuItems.value.length > 0 ) {
                    scope.iconBar = scope.iconBar + tempMenu +'<md-menu-content width="4">';
                } else {
                    if ( type === 'singleMenuItem' ) {
                        scope.iconBar = scope.iconBar + tempMenu + '</md-menu-item>';
                    } else {
                        scope.iconBar = scope.iconBar + tempMenu + '<md-menu-content width="4"></md-menu-content>';
                    }
                }
            }

            scope.unfocusButton = function( event ){
                var target = $(event.target);
                if ( target.is( "button" ) ) {
                    target.blur();
                } else {
                    $(target.parent()[0]).blur();
                }
            }

            scope.iconbarBuilder = function( side ) {
                $timeout(function() {
                    if ( side === 'left' ) {
                        if ( scope.attributes.toolbar.leftMenu.type.value === 'Icon Bar' ) {
                            toolbarType='iconBar';
                            scope.leftRootMenuItem = '<button ng-click="{{itemClick}}" ng-show="{{itemDisplay}}" menu-index="{{itemIndex}}" ng-disabled="{{itemDisabled}}" style="{{attributes.toolbar.leftMenu.iconBar.triggerButton.style}}" aria-label="md-icon-button" class="md-icon-button {{attributes.toolbar.leftMenu.iconBar.triggerButton.class}}">'+
                            '<md-icon ng-if="{{ifFaIcon}}" class="fa {{faIcon}} dfx-core-gc-toolbar-left-menu-iconbar {{attributes.toolbar.leftMenu.iconBar.triggerButton.icon.class}}" style="font-size:{{attributes.toolbar.leftMenu.iconBar.triggerButton.icon.size}}px; {{attributes.toolbar.leftMenu.iconBar.triggerButton.icon.style}}"></md-icon>'+
                            '<ng-md-icon ng-if="{{ifSvgIcon}}" icon="{{svgIcon}}" size="{{attributes.toolbar.leftMenu.iconBar.triggerButton.icon.size}}" class="dfx-core-gc-toolbar-left-menu-iconbar {{attributes.toolbar.leftMenu.iconBar.triggerButton.icon.class}}" style="{{attributes.toolbar.leftMenu.iconBar.triggerButton.icon.style}}"></ng-md-icon>'+
                            '<md-icon ng-if="{{ifStateFaIcon}}" class="fa {{stateFaIcon}} dfx-core-gc-toolbar-left-menu-iconbar {{attributes.toolbar.leftMenu.iconBar.triggerButton.icon.class}} {{stateFaIconClass}}" style="font-size:{{attributes.toolbar.leftMenu.iconBar.triggerButton.icon.size}}px; {{attributes.toolbar.leftMenu.iconBar.triggerButton.icon.style}} {{stateFaIconStyle}}"></md-icon>'+
                            '<ng-md-icon ng-if="{{ifStateSvgIcon}}" icon="{{stateSvgIcon}}" size="{{attributes.toolbar.leftMenu.iconBar.triggerButton.icon.size}}" class="dfx-core-gc-toolbar-left-menu-iconbar {{attributes.toolbar.leftMenu.iconBar.triggerButton.icon.class}} {{stateSvgIconClass}}" style="{{attributes.toolbar.leftMenu.iconBar.triggerButton.icon.style}} {{stateSvgIconStyle}}"></ng-md-icon>'+
                            '</button>';
                            singleMenuItem ='<md-button ng-show="{{itemDisplay}}" ng-disabled="{{itemDisabled}}" menu-index="{{itemIndex}}" ng-click="{{itemClick}}" '+
                            'class="dfx-menu-button {{attributes.toolbar.leftMenu.iconBar.actionButton.class}}" style="{{attributes.toolbar.leftMenu.iconBar.actionButton.style}}" aria-label="iconbar-button" >'+
                            '<md-icon ng-if="{{ifFaIcon}}" class="fa {{faIcon}} dfx-menu-button-icon {{attributes.toolbar.leftMenu.iconBar.actionButton.icon.class}}" style="font-size:{{attributes.toolbar.leftMenu.iconBar.actionButton.icon.size}}px; {{attributes.toolbar.leftMenu.iconBar.actionButton.icon.style}}"></md-icon>'+
                            '<ng-md-icon ng-if="{{ifSvgIcon}}" icon="{{svgIcon}}" size="{{attributes.toolbar.leftMenu.iconBar.actionButton.icon.size}}" class="dfx-menu-button-icon {{attributes.toolbar.leftMenu.iconBar.actionButton.icon.class}}" style="{{attributes.toolbar.leftMenu.iconBar.actionButton.icon.style}}"></ng-md-icon>'+
                            '<i><md-icon ng-if="{{ifStateFaIcon}}" class="fa {{stateFaIcon}} dfx-menu-button-icon {{attributes.toolbar.leftMenu.iconBar.actionButton.icon.class}} {{stateFaIconClass}}" style="font-size:{{attributes.toolbar.leftMenu.iconBar.actionButton.icon.size}}px; {{attributes.toolbar.leftMenu.iconBar.actionButton.icon.style}} {{stateFaIconStyle}}"></md-icon>'+
                            '<ng-md-icon ng-if="{{ifStateSvgIcon}}" icon="{{stateSvgIcon}}" size="{{attributes.toolbar.leftMenu.iconBar.actionButton.icon.size}}" class="dfx-menu-button-icon {{attributes.toolbar.leftMenu.iconBar.actionButton.icon.class}} {{stateFaIconClass}}" style="{{attributes.toolbar.leftMenu.iconBar.actionButton.icon.style}} {{stateSvgIconStyle}}"></ng-md-icon></i>'+
                            '<span>{{itemLabel}}</span>'+
                            '<span class="md-alt-text">{{itemShortcut}}</span>'+
                            '<small ng-if="{{ifItemNotification}}">{{itemNotification}}</small>'+
                            '</md-button>';

                        } else if ( scope.attributes.toolbar.leftMenu.type.value === 'Buttons' ) {
                            toolbarType='buttons';
                            scope.leftRootMenuItem = '<button aria-label="left_buttons" ng-click="{{itemClick}}" style="width: 100%; {{attributes.toolbar.leftMenu.buttons.triggerButton.style}}"' +
                            'class="dfx-core-gc-toolbar-left-buttons md-button md-raised md-altTheme-theme glyph {{attributes.toolbar.leftMenu.buttons.triggerButton.class}}">'+
                            '<div ng-if="{{ifFaIcon}}">'+
                                '<md-icon class="fa {{faIcon}} dfx-core-gc-toolbar-left-menu-icon {{attributes.toolbar.leftMenu.buttons.triggerButton.icon.class}}" style="font-size: {{attributes.toolbar.leftMenu.buttons.triggerButton.icon.size}}px; width: {{attributes.toolbar.leftMenu.buttons.triggerButton.icon.size}}px; height: {{attributes.toolbar.leftMenu.buttons.triggerButton.icon.size}}px; {{attributes.toolbar.leftMenu.buttons.triggerButton.icon.style}}"></md-icon>'+
                            '</div>'+
                            '<div ng-if="{{ifSvgIcon}}">'+
                                '<ng-md-icon icon="{{svgIcon}}" size="{{attributes.toolbar.leftMenu.buttons.triggerButton.icon.size}}" class="dfx-core-gc-toolbar-left-menu-icon {{attributes.toolbar.leftMenu.buttons.triggerButton.icon.class}}" style="width: {{attributes.toolbar.leftMenu.buttons.triggerButton.icon.size}}px; height: {{attributes.toolbar.leftMenu.buttons.triggerButton.icon.size}}px;{{attributes.toolbar.leftMenu.buttons.triggerButton.icon.style}}"></ng-md-icon>'+
                            '</div>'+
                            '<div ng-if="{{ifWaitFaIcon}}">'+
                                '<md-icon class="fa {{waitFaIcon}} dfx-core-gc-toolbar-left-menu-icon {{attributes.toolbar.leftMenu.buttons.triggerButton.icon.class}} {{waitFaIconClass}}" style="font-size: {{attributes.toolbar.leftMenu.buttons.triggerButton.icon.size}}px; width: {{attributes.toolbar.leftMenu.buttons.triggerButton.icon.size}}px; height: {{attributes.toolbar.leftMenu.buttons.triggerButton.icon.size}}px;{{attributes.toolbar.leftMenu.buttons.triggerButton.icon.style}}; {{waitFaIconStyle}}"></md-icon>'+
                            '</div>'+
                            '<div ng-if="{{ifWaitSvgIcon}}">'+
                                '<ng-md-icon icon="{{waitSvgIcon}}" size="{{attributes.toolbar.leftMenu.buttons.triggerButton.icon.size}}" class="dfx-core-gc-toolbar-left-menu-icon {{attributes.toolbar.leftMenu.buttons.triggerButton.icon.class}} {{waitSvgIconClass}}" style="width: {{attributes.toolbar.leftMenu.buttons.triggerButton.icon.size}}px; height: {{attributes.toolbar.leftMenu.buttons.triggerButton.icon.size}}px;{{attributes.toolbar.leftMenu.buttons.triggerButton.icon.style}}; {{waitSvgIconStyle}}"></ng-md-icon>'+
                            '</div>'+
                            '<span style="line-height: 20px;">{{itemLabel}}</span>'+
                            '</button>';
                            singleMenuItem ='<md-button ng-show="{{itemDisplay}}" ng-disabled="{{itemDisabled}}" menu-index="{{itemIndex}}" ng-click="{{itemClick}}" '+
                            'class="dfx-menu-button {{attributes.toolbar.leftMenu.buttons.actionButton.class}}" style="{{attributes.toolbar.leftMenu.buttons.actionButton.style}}" aria-label="buttons-button" >'+
                            '<md-icon ng-if="{{ifFaIcon}}" class="fa {{faIcon}} dfx-menu-button-icon {{attributes.toolbar.leftMenu.buttons.actionButton.icon.class}}" style="font-size:{{attributes.toolbar.leftMenu.buttons.actionButton.icon.size}}px; {{attributes.toolbar.leftMenu.buttons.actionButton.icon.style}}"></md-icon>'+
                            '<ng-md-icon ng-if="{{ifSvgIcon}}" icon="{{svgIcon}}" size="{{attributes.toolbar.leftMenu.buttons.actionButton.icon.size}}" class="dfx-menu-button-icon {{attributes.toolbar.leftMenu.buttons.actionButton.icon.class}}" style="{{attributes.toolbar.leftMenu.buttons.actionButton.icon.style}}"></ng-md-icon>'+
                            '<span>{{itemLabel}}</span>'+
                            '<span class="md-alt-text">{{itemShortcut}}</span>'+
                            '<small ng-if="{{ifItemNotification}}">{{itemNotification}}</small>'+
                            '</md-button>';
                        }
                        scope.iconbarArray = scope.attributes.toolbar.leftMenu.menuItems.value;
                        scope.rootMenuItem = scope.leftRootMenuItem;
                        if ( scope.attributes.toolbar.leftMenu.type.value === 'Buttons' ) {
                            scope.iconBar = '<md-menu-bar style="padding: 0">';
                        } else {
                            scope.iconBar = '<md-menu-bar>';
                        }
                    } else if ( side === 'right' ) {
                        if ( scope.attributes.toolbar.rightMenu.type.value === 'Icon Bar' ) {
                            toolbarType='iconBar';
                            scope.rightRootMenuItem = '<button ng-click="{{itemClick}}" ng-show="{{itemDisplay}}" menu-index="{{itemIndex}}" ng-disabled="{{itemDisabled}}" style="{{attributes.toolbar.rightMenu.iconBar.triggerButton.style}}" aria-label="md-icon-button" class="md-icon-button {{attributes.toolbar.rightMenu.iconBar.triggerButton.class}}">'+
                            '<md-icon ng-if="{{ifFaIcon}}" class="fa {{faIcon}} dfx-core-gc-toolbar-right-menu-iconbar {{attributes.toolbar.rightMenu.iconBar.triggerButton.icon.class}}" style="font-size:{{attributes.toolbar.rightMenu.iconBar.triggerButton.icon.size}}px; {{attributes.toolbar.rightMenu.iconBar.triggerButton.icon.style}}"></md-icon>'+
                            '<ng-md-icon ng-if="{{ifSvgIcon}}" icon="{{svgIcon}}" size="{{attributes.toolbar.rightMenu.iconBar.triggerButton.icon.size}}" class="dfx-core-gc-toolbar-right-menu-iconbar {{attributes.toolbar.rightMenu.iconBar.triggerButton.icon.class}}" style="{{attributes.toolbar.rightMenu.iconBar.triggerButton.icon.style}}"></ng-md-icon>'+
                            '<md-icon ng-if="{{ifStateFaIcon}}" class="fa {{stateFaIcon}} dfx-core-gc-toolbar-right-menu-iconbar {{attributes.toolbar.rightMenu.iconBar.triggerButton.icon.class}} {{stateFaIconClass}}" style="font-size:{{attributes.toolbar.rightMenu.iconBar.triggerButton.icon.size}}px; {{attributes.toolbar.rightMenu.iconBar.triggerButton.icon.style}} {{stateFaIconStyle}}"></md-icon>'+
                            '<ng-md-icon ng-if="{{ifStateSvgIcon}}" icon="{{stateSvgIcon}}" size="{{attributes.toolbar.rightMenu.iconBar.triggerButton.icon.size}}" class="dfx-core-gc-toolbar-right-menu-iconbar {{attributes.toolbar.rightMenu.iconBar.triggerButton.icon.class}} {{stateSvgIconClass}}" style="{{attributes.toolbar.rightMenu.iconBar.triggerButton.icon.style}} {{stateSvgIconStyle}}"></ng-md-icon>'+
                            '</button>';
                            singleMenuItem ='<md-button ng-show="{{itemDisplay}}" ng-disabled="{{itemDisabled}}" menu-index="{{itemIndex}}" ng-click="{{itemClick}}" '+
                            'class="dfx-menu-button {{attributes.toolbar.rightMenu.iconBar.actionButton.class}}" style="{{attributes.toolbar.rightMenu.iconBar.actionButton.style}}" aria-label="iconbar-button" >'+
                            '<md-icon ng-if="{{ifFaIcon}}" class="fa {{faIcon}} dfx-menu-button-icon {{attributes.toolbar.rightMenu.iconBar.actionButton.icon.class}}" style="font-size:{{attributes.toolbar.rightMenu.iconBar.actionButton.icon.size}}px; {{attributes.toolbar.rightMenu.iconBar.actionButton.icon.style}}"></md-icon>'+
                            '<ng-md-icon ng-if="{{ifSvgIcon}}" icon="{{svgIcon}}" size="{{attributes.toolbar.rightMenu.iconBar.actionButton.icon.size}}" class="dfx-menu-button-icon {{attributes.toolbar.rightMenu.iconBar.actionButton.icon.class}}" style="{{attributes.toolbar.rightMenu.iconBar.actionButton.icon.style}}"></ng-md-icon>'+
                            '<i><md-icon ng-if="{{ifStateFaIcon}}" class="fa {{stateFaIcon}} dfx-menu-button-icon {{attributes.toolbar.rightMenu.iconBar.actionButton.icon.class}} {{stateFaIconClass}}" style="font-size:{{attributes.toolbar.rightMenu.iconBar.actionButton.icon.size}}px; {{attributes.toolbar.rightMenu.iconBar.actionButton.icon.style}} {{stateFaIconStyle}}"></md-icon>'+
                            '<ng-md-icon ng-if="{{ifStateSvgIcon}}" icon="{{stateSvgIcon}}" size="{{attributes.toolbar.rightMenu.iconBar.actionButton.icon.size}}" class="dfx-menu-button-icon {{attributes.toolbar.rightMenu.iconBar.actionButton.icon.class}} {{stateFaIconClass}}" style="{{attributes.toolbar.rightMenu.iconBar.actionButton.icon.style}} {{stateSvgIconStyle}}"></ng-md-icon></i>'+
                            '<span>{{itemLabel}}</span>'+
                            '<span class="md-alt-text">{{itemShortcut}}</span>'+
                            '<small ng-if="{{ifItemNotification}}">{{itemNotification}}</small>'+
                            '</md-button>';
                        } else if ( scope.attributes.toolbar.rightMenu.type.value === 'Buttons' ) {
                            toolbarType='buttons';
                            scope.rightRootMenuItem = '<button aria-label="right_buttons" ng-click="{{itemClick}}" style="width: 100%; {{attributes.toolbar.rightMenu.buttons.triggerButton.style}}" ' +
                            'class="dfx-core-gc-toolbar-right-buttons md-button md-raised md-altTheme-theme glyph {{attributes.toolbar.rightMenu.buttons.triggerButton.class}}">'+
                            '<div ng-if="{{ifFaIcon}}">'+
                                '<md-icon class="fa {{faIcon}} dfx-core-gc-toolbar-right-menu-icon {{attributes.toolbar.rightMenu.buttons.triggerButton.icon.class}}" style="font-size: {{attributes.toolbar.rightMenu.buttons.triggerButton.icon.size}}px; width: {{attributes.toolbar.rightMenu.buttons.triggerButton.icon.size}}px; height: {{attributes.toolbar.rightMenu.buttons.triggerButton.icon.size}}px; {{attributes.toolbar.rightMenu.buttons.triggerButton.icon.style}}"></md-icon>'+
                            '</div>'+
                            '<div ng-if="{{ifSvgIcon}}">'+
                                '<ng-md-icon icon="{{svgIcon}}" size="{{attributes.toolbar.rightMenu.buttons.triggerButton.icon.size}}" class="dfx-core-gc-toolbar-right-menu-icon {{attributes.toolbar.rightMenu.buttons.triggerButton.icon.class}}" style="width: {{attributes.toolbar.rightMenu.buttons.triggerButton.icon.size}}px; height: {{attributes.toolbar.rightMenu.buttons.triggerButton.icon.size}}px;{{attributes.toolbar.rightMenu.buttons.triggerButton.icon.style}}"></ng-md-icon>'+
                            '</div>'+
                            '<div ng-if="{{ifWaitFaIcon}}">'+
                                '<md-icon class="fa {{waitFaIcon}} dfx-core-gc-toolbar-right-menu-icon {{attributes.toolbar.rightMenu.buttons.triggerButton.icon.class}} {{waitFaIconClass}}" style="font-size: {{attributes.toolbar.rightMenu.buttons.triggerButton.icon.size}}px; width: {{attributes.toolbar.rightMenu.buttons.triggerButton.icon.size}}px; height: {{attributes.toolbar.rightMenu.buttons.triggerButton.icon.size}}px;{{attributes.toolbar.rightMenu.buttons.triggerButton.icon.style}}; {{waitFaIconStyle}}"></md-icon>'+
                            '</div>'+
                            '<div ng-if="{{ifWaitSvgIcon}}">'+
                                '<ng-md-icon icon="{{waitSvgIcon}}" size="{{attributes.toolbar.rightMenu.buttons.triggerButton.icon.size}}" class="dfx-core-gc-toolbar-right-menu-icon {{attributes.toolbar.rightMenu.buttons.triggerButton.icon.class}} {{waitSvgIconClass}}" style="width: {{attributes.toolbar.rightMenu.buttons.triggerButton.icon.size}}px; height: {{attributes.toolbar.rightMenu.buttons.triggerButton.icon.size}}px;{{attributes.toolbar.rightMenu.buttons.triggerButton.icon.style}}; {{waitSvgIconStyle}}"></ng-md-icon>'+
                            '</div>'+
                            '<span style="line-height: 20px;">{{itemLabel}}</span></button>';
                            singleMenuItem ='<md-button ng-show="{{itemDisplay}}" ng-disabled="{{itemDisabled}}" menu-index="{{itemIndex}}" ng-click="{{itemClick}}" '+
                            'class="dfx-menu-button {{attributes.toolbar.rightMenu.buttons.actionButton.class}}" style="{{attributes.toolbar.rightMenu.buttons.actionButton.style}}" aria-label="buttons-button" >'+
                            '<md-icon ng-if="{{ifFaIcon}}" class="fa {{faIcon}} dfx-menu-button-icon {{attributes.toolbar.rightMenu.buttons.actionButton.icon.class}}" style="font-size:{{attributes.toolbar.rightMenu.buttons.actionButton.icon.size}}px; {{attributes.toolbar.rightMenu.buttons.actionButton.icon.style}}"></md-icon>'+
                            '<ng-md-icon ng-if="{{ifSvgIcon}}" icon="{{svgIcon}}" size="{{attributes.toolbar.rightMenu.buttons.actionButton.icon.size}}" class="dfx-menu-button-icon {{attributes.toolbar.rightMenu.buttons.actionButton.icon.class}}" style="{{attributes.toolbar.rightMenu.buttons.actionButton.icon.style}}"></ng-md-icon>'+
                            '<span>{{itemLabel}}</span>'+
                            '<span class="md-alt-text">{{itemShortcut}}</span>'+
                            '<small ng-if="{{ifItemNotification}}">{{itemNotification}}</small>'+
                            '</md-button>';
                        }
                        scope.iconbarArray = scope.attributes.toolbar.rightMenu.menuItems.value;
                        scope.rootMenuItem = scope.rightRootMenuItem;
                        if ( scope.attributes.toolbar.rightMenu.type.value === 'Buttons' ) {
                            scope.iconBar = '<md-menu-bar style="padding: 0">';
                        } else {
                            scope.iconBar = '<md-menu-bar>';
                        }
                    }

                    for ( var item = 0; item < scope.iconbarArray.length; item++ ) {
                        if ( side === 'left' ) {
                            if ( scope.attributes.toolbar.leftMenu.type.value === 'Buttons' ) {
                                scope.iconBar = scope.iconBar + '<md-menu class="toolbar-button" style="padding: 1px">';
                            } else {
                                scope.iconBar = scope.iconBar + '<md-menu>';
                            }
                        } else {
                            if ( scope.attributes.toolbar.rightMenu.type.value === 'Buttons' ) {
                                scope.iconBar = scope.iconBar + '<md-menu class="toolbar-button" style="padding: 1px">';
                            } else {
                                scope.iconBar = scope.iconBar + '<md-menu>';
                            }
                        }
                        if ( scope.iconbarArray[item].menuItems.value.length > 0 ) {
                            createDfxMenuItem( scope.iconbarArray[item], 'rootMenuItem', undefined, item );
                            buildNextLevel( scope.iconbarArray[item].menuItems.value, item);
                            scope.iconBar = scope.iconBar + '</md-menu-content>';
                        } else {
                            createDfxMenuItem( scope.iconbarArray[item], 'rootMenuItem', undefined, item );
                        }
                        scope.iconBar = scope.iconBar + '</md-menu>';
                    };
                    scope.iconBar = scope.iconBar + '</md-menu-bar>';
                    scope.iconBarMenu = scope.iconBar;
                    if ( side==='left' ) {
                        if ( scope.attributes.toolbar.leftMenu.type.value === 'Icon Bar' ) {
                            $('#' + scope.component_id + '_left_menu_bar').html(scope.iconBarMenu);
                            $compile($('#' + scope.component_id + '_left_menu_bar').contents())(scope);
                        } else if ( scope.attributes.toolbar.leftMenu.type.value === 'Buttons' ) {
                            $('#' + scope.component_id + '_left_buttons_menu').html(scope.iconBarMenu);
                            $compile($('#' + scope.component_id + '_left_buttons_menu').contents())(scope);
                        }
                        scope.setButtonsWidth(scope.attributes.toolbar.leftMenu.equalButtonSize.value, 'left');
                    } else if ( side==='right' ) {
                        if ( scope.attributes.toolbar.rightMenu.type.value === 'Icon Bar' ) {
                            $('#' + scope.component_id + '_right_menu_bar').html(scope.iconBarMenu);
                            $compile($('#' + scope.component_id + '_right_menu_bar').contents())(scope);
                        } else if ( scope.attributes.toolbar.rightMenu.type.value === 'Buttons' ) {
                            $('#' + scope.component_id + '_right_buttons_menu').html(scope.iconBarMenu);
                            $compile($('#' + scope.component_id + '_right_buttons_menu').contents())(scope);
                        }
                        scope.setButtonsWidth(scope.attributes.toolbar.rightMenu.equalButtonSize.value, 'right');
                    }
                }, 0);
            };

            scope.snippetTrustAsHtml = function( snippet ) {
                return $sce.trustAsHtml(snippet);
            };

            scope.$watch( "attributes.toolbar.title.isHtml.value", function( newValue ) {
                if ( newValue ) {
                    $timeout(function(){
                        var html_title = '#' + scope.component_id + '_toolbar_bindingHtml';
                        $compile($(html_title).contents())(scope);
                    }, 0);
                }
            });

            scope.closeOthers = function() {
                $mdMenu.hide(null, { closeAll: true });
            }

            scope.setButtonsWidth = function(isEqual, side){
                $timeout(function(){
                    if(side==='right'){
                        var parentDiv = '#' + scope.component_id + '_toolbar_right_menu';
                    }else{
                        var parentDiv = '#' + scope.component_id + '_toolbar_left_menu';
                    }

                if(isEqual && side==='right'){
                        var counter = 0;
                        for(var i =0; i < scope.attributes.toolbar.rightMenu.menuItems.value.length; i++){
                            if(!scope.attributes.toolbar.rightMenu.menuItems.value[i].divider){
                                counter++;
                            }
                        }
                        var percentValue = Math.floor(100/counter);
                        if(percentValue > 5){
                            $(parentDiv).css('width', '100%');
                            $($(parentDiv).find('md-menu-bar')[0]).children().css('width', (percentValue+'%'));
                        }else{
                            $(parentDiv).css('width', '');
                            $($(parentDiv).find('md-menu-bar')[0]).children().css('width', '');
                        }
                }else if(isEqual && side==='left'){
                    var counter = 0;
                    for(var i =0; i < scope.attributes.toolbar.leftMenu.menuItems.value.length; i++){
                        if(!scope.attributes.toolbar.leftMenu.menuItems.value[i].divider){
                            counter++;
                        }
                    }
                    var percentValue = Math.floor(100/counter);
                    if(percentValue > 5){
                        $(parentDiv).css('width', '100%');
                        $($(parentDiv).find('md-menu-bar')[0]).children().css('width', (percentValue+'%'));
                    }
                    }else{
                        $(parentDiv).css('width', '');
                        $($(parentDiv).find('md-menu-bar')[0]).children().css('width', '');
                }
                }, 0);
            };

            scope.rightFabClick = function(){
                scope.attributes.toolbar.rightMenu.initialClick.value = true;
            };
            scope.leftFabClick = function(){
                scope.attributes.toolbar.leftMenu.initialClick.value = true;
            };
            scope.checkIconType = function( menuList ) {
                for (var i = 0; i < menuList.length; i++) {
                    if ( !menuList[i].hasOwnProperty('iconType') ) { menuList[i].iconType = 'fa-icon'; }
                }
            }

            scope.ifShowToolbarIconTypes = function( icon, side, type ) {
                var regexp = /(^\')(.*)(\'$)/gm, filtered = regexp.exec( icon ), iconType = '';
                if ( icon && ( icon.indexOf('+') >= 0 ) ) { filtered = false; }
                if ( icon === '' ) { filtered = true; }
                if ( icon.indexOf("'") === 0 && icon.indexOf('+') === -1 && icon.charAt(icon.length-1) === "'" ) {
                    icon.indexOf("'fa-") === 0 ? iconType = 'fa-icon' : iconType = 'svg-icon';
                }
                if ( side === 'leftSide' ) {
                    switch ( type ) {
                        case 'fabTrigger':
                            if (iconType!=='') { scope.attributes.toolbar.leftMenu.fab.triggerButton.icon.type = iconType; }
                            if ( filtered ) {
                                if (!$("#toolbarLeftFabTrigger").hasClass('ng-hide')){$("#toolbarLeftFabTrigger").addClass('ng-hide');}
                            } else {
                                $("#toolbarLeftFabTrigger").removeClass('ng-hide');
                            }
                            break;
                    }
                } else if ( side === 'rightSide' ){
                    switch ( type ) {
                        case 'fabTrigger':
                            if (iconType!=='') { scope.attributes.toolbar.rightMenu.fab.triggerButton.icon.type = iconType; }
                            if ( filtered ) {
                                if (!$("#toolbarRightFabTrigger").hasClass('ng-hide')){$("#toolbarRightFabTrigger").addClass('ng-hide');}
                            } else {
                                $("#toolbarRightFabTrigger").removeClass('ng-hide');
                            }
                            break;
                    }
                }
            }

            scope.$watch("attributes.toolbar.rightMenu.type.value", function(newValue){
                if(newValue){
                    $timeout(function(){
                        var parentDiv = '#' + scope.component_id + '_toolbar_right_menu';
                        if(newValue === 'Icon Bar'){
                            $(parentDiv).css('width', '');
                            scope.attributes.toolbar.rightMenu.equalButtonSize.value = false;
                            scope.iconbarBuilder('right');
                        }else if (newValue === 'Fab') {
                            $(parentDiv).css('width', '');
                            scope.attributes.toolbar.rightMenu.equalButtonSize.value = false;
                            scope.checkIconType( scope.attributes.toolbar.rightMenu.menuItems.value );
                        }else if(newValue === 'Buttons'){
                            scope.iconbarBuilder('right');
                        }
                    },0);
                }

            });

            scope.$watch("attributes.toolbar.leftMenu.type.value", function(newValue){
                if(newValue) {
                    $timeout(function () {
                        var parentDiv = '#' + scope.component_id + '_toolbar_left_menu';
                        if(newValue === 'Icon Bar'){
                            $(parentDiv).css('width', '');
                            scope.attributes.toolbar.leftMenu.equalButtonSize.value = false;
                            scope.iconbarBuilder('left');
                        }else if (newValue === 'Fab') {
                            $(parentDiv).css('width', '');
                            scope.attributes.toolbar.leftMenu.equalButtonSize.value = false;
                            scope.checkIconType( scope.attributes.toolbar.leftMenu.menuItems.value );
                        }else if(newValue === 'Buttons'){
                            scope.iconbarBuilder('left');
                        }
                    }, 0);
                }
            });

            scope.$watch('attributes.toolbar.leftMenu.fab.triggerButton.icon.value', function(newValue){
                if (newValue) {
                    scope.ifShowToolbarIconTypes( newValue, 'leftSide', 'fabTrigger' );
                }
            }, true);

            scope.$watch('attributes.toolbar.rightMenu.fab.triggerButton.icon.value', function(newValue){
                if (newValue) {
                    scope.ifShowToolbarIconTypes( newValue, 'rightSide', 'fabTrigger' );
                }
            }, true);

            scope.$watch('attributes.toolbar.leftMenu.menuItems.value', function(newVal, oldVal) {
                if(newVal){
                    if (newVal != null && !angular.equals(newVal, oldVal)) {
                        $timeout(function() {
                            if(scope.attributes.toolbar.leftMenu.type.value !== 'Fab'){
                                scope.iconbarBuilder('left');
                            }
                        }, 0);
                    }
                }
            }, true);

            scope.$watch('attributes.toolbar.rightMenu.menuItems.value', function(newVal, oldVal) {
                if(newVal){
                    if (newVal != null && !angular.equals(newVal, oldVal)) {
                        $timeout(function() {
                            if(scope.attributes.toolbar.rightMenu.type.value !== 'Fab') {
                                scope.iconbarBuilder('right');
                            }
                        }, 0);
                    }
                }
            }, true);

            scope.$watch("attributes.toolbar.leftMenu.equalButtonSize.value", function(newValue){
                if(newValue){
                    scope.setButtonsWidth(newValue, 'left');
                }
            });

            scope.$watch("attributes.toolbar.rightMenu.equalButtonSize.value", function(newValue){
                if(newValue){
                    scope.setButtonsWidth(newValue, 'right');
                }
            });
            scope.$watch("attributes.toolbar.leftMenu.dynamic.value", function(newValue){
                if(newValue){
                    $timeout(function(){
                        if (scope.attributes.toolbar.leftMenu.dynamicPresent==null) {
                            scope.attributes.toolbar.leftMenu.dynamicPresent = { "value": "" };
                            scope.attributes.toolbar.leftMenu.dynamic = { "value": "" };
                        }
                        if(typeof newValue !== "undefined" && newValue !== null && newValue !== ""){
                            scope.attributes.toolbar.leftMenu.dynamicPresent.value = true;
                        }else{
                            scope.attributes.toolbar.leftMenu.dynamicPresent.value = false;
                        }
                    }, 0);
                }

            });
            scope.$watch("attributes.toolbar.rightMenu.dynamic.value", function(newValue){
                if(newValue){
                    $timeout(function(){
                        if (scope.attributes.toolbar.rightMenu.dynamicPresent==null) {
                            scope.attributes.toolbar.rightMenu.dynamicPresent = { "value": "" };
                            scope.attributes.toolbar.rightMenu.dynamic = { "value": "" };
                        }
                        if(typeof newValue !== "undefined" && newValue !== null && newValue !== ""){
                            scope.attributes.toolbar.rightMenu.dynamicPresent.value = true;
                        }else{
                            scope.attributes.toolbar.rightMenu.dynamicPresent.value = false;
                        }
                    }, 0);
                }
            });
            scope.$watch('attributes.toolbar.leftMenu.visible.value', function(newValue){
                if(newValue){
                    if(newValue !== '' && newValue !== 'false' && scope.attributes.toolbar.leftMenu.type.value !== 'Fab' ){
                        scope.iconbarBuilder('left');
                    }
                }
            });
            scope.$watch('attributes.toolbar.rightMenu.visible.value', function(newValue){
                if(newValue){
                    if(newValue !== '' && newValue !== 'false' && scope.attributes.toolbar.rightMenu.type.value !== 'Fab' ){
                        scope.iconbarBuilder('right');
                    }
                }
            });
        }
    }
});

dfxGcTemplateEditorApp.directive('dfxGcToolbarProperty', function($mdDialog) {
    return {
        restrict: 'A',
        templateUrl: function( el, attrs) {
            return '/gcontrols/web/toolbar_props.html';
        },
        link: function(scope, element, attrs) {
            scope.showCodemirror = function(ev) {
                $mdDialog.show({
                    scope: scope.$new(),
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose:true,
                    templateUrl: '/gcontrols/web/html_editor_template.html',
                    onComplete:function(scope){
                        var myTextArea = document.getElementById('dfx_html_editor');
                        var scriptEditor = CodeMirror(function (elt) {
                                myTextArea.parentNode.replaceChild(elt, myTextArea);
                            },
                            {
                                lineNumbers: true,
                                value: (scope.attributes.toolbar.title.content.value !== '') ? scope.attributes.toolbar.title.content.value : $('#dfx_html_editor').text(),
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
                        }
                        scope.saveDialog = function() {
                            var editor = $('#dfx_html_editor.CodeMirror')[0].CodeMirror;
                            scope.attributes.toolbar.title.content.value = editor.getValue();
                            $mdDialog.hide();
                        }
                    }
                })
            };
        }
    }
});

dfxGcTemplateEditorApp.directive('dfxVePlatform', function() {
    return {
        restrict: 'A',
        scope: false,
        link: function(scope, element, attrs) {
            if (scope.view_platform == 'mobile') {
                scope.refreshDevice();
            } else {
                element.css('width', '100%');
            }
        }
    }
});


dfxGcTemplateEditorApp.directive('dfxViewCompiled', [ '$compile', function($compile) {
    return {
        restrict: 'A',
        controller: function($scope, $element, $attrs) {
            $scope.view_id = $attrs.dfxViewCompiled;
            var gc_template_definition = JSON.parse(window.localStorage.getItem( 'dfx_' + $attrs.dfxViewCompiled ));
            $scope.addCompiledComponents( gc_template_definition, { 'id': 'dfx-ve-compiled' }, 'default' );
        }
    }
}]);
