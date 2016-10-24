var dfxGCC = angular.module('dfxGCC',['ngMaterial', 'ngMdIcons', 'ngMessages', 'ngSanitize', 'ngAnimate', 'nvd3', 'ngQuill', 'jkAngularCarousel', 'ui.knob']);

dfxGCC.directive('dfxGccWebBase', ['$rootScope', '$http', '$compile', '$injector', '$mdToast', '$q', function($rootScope, $http, $compile, $injector, $mdToast, $q) {
    return {
        controller: function($element) {
            var base = this;

            var storeGcTemplate = function (gc_type, gc_template) {
                sessionStorage.setItem('dfx_' + gc_type, JSON.stringify(gc_template));
            };

            var mergeWithOverriddenAttributes = function (default_attributes, updated_attributes) {
                for (var updated_attribute in updated_attributes) {
                    if (updated_attributes.hasOwnProperty(updated_attribute)) {
                        if (updated_attribute != 'value' && updated_attribute != 'status' &&
                            (default_attributes[updated_attribute] || default_attributes[updated_attribute] === ''))
                        {

                            if ( Array.isArray(updated_attributes[updated_attribute]) ) {
                                default_attributes[updated_attribute] = updated_attributes[updated_attribute];// this is an array, without 'value'
                            } else {
                                if (updated_attributes[updated_attribute] !== null && typeof updated_attributes[updated_attribute] === 'object') {
                                    mergeWithOverriddenAttributes(default_attributes[updated_attribute], updated_attributes[updated_attribute]);
                                }

                                if (updated_attribute) {
                                    if (updated_attributes[updated_attribute] !== null && typeof updated_attributes[updated_attribute] === 'object') {
                                        default_attributes[updated_attribute].status = 'overridden';
                                        default_attributes[updated_attribute].value  = updated_attributes[updated_attribute].value;
                                    } else {
                                        default_attributes[updated_attribute] = updated_attributes[updated_attribute];//attribute is not object, ex: style = ""
                                    }
                                }
                            }
                        }
                    }
                }
            };

            this.init = function(scope, element, component, attrs, type) {
                if (!angular.isDefined(attrs.dfxGcEdit)) {
                    return base.initAttributes(scope, element, component, attrs, type);
                } else {
                    return base.initExistingComponent(scope, element, component, attrs);
                }
            };

            this.initAttributes = function(scope, element, component, attrs, type) {
                var app_body = angular.element(document.querySelector('body'));
                var app_scope = angular.element(app_body).scope();
                return app_scope.getGCDefaultAttributes( type ).then( function(default_attributes) {
                    var isExistingAttributes = (component.attributes==null) ? false : true;
                    var component_default_attributes = angular.copy(default_attributes);

                    storeGcTemplate(type, default_attributes);

                    if (isExistingAttributes) {
                        mergeWithOverriddenAttributes(component_default_attributes, component.attributes);
                    }
                    component.attributes = component_default_attributes;

                    if (isExistingAttributes && component.attributes.children!=null) {
                        component.children =  component.attributes.children.slice(0);
                        delete component.attributes.children;
                        base.initChildIDs(component.children);
                    } else {
                        if (component.children==null) {
                            component.children =  [];
                        }
                    }
                    if (!isExistingAttributes) {
                        scope.$parent.setComponent(component);
                    }
                    $rootScope.$emit(attrs.id + '_attributes_loaded', component.attributes);
                    base.initExistingComponent(scope, element, component, attrs);
                });
            };

            this.initChildIDs = function(child_elements) {
                var idx=0;
                for (idx=0; idx<child_elements.length; idx++) {
                    var uuid = Math.floor(Math.random() * 100000);
                    child_elements[idx].id = uuid;
                    if (child_elements[idx].children.length>0) {
                        base.initChildIDs(child_elements[idx].children);
                    }
                }
            };

            this.initExistingComponent = function(scope, element, component, attrs) {
                scope.component_id = component.id;
                scope.attributes = component.attributes;
                scope.children = {};
                scope.view_id = attrs.viewId;
                scope.parent_id = attrs.gcParent;
                scope.rendering_children = {};

                angular.element(document).ready(function() {

                    $rootScope.$on(scope.component_id + '_child_rendered', function(event, child_id) {
                        delete scope.rendering_children[child_id];
                        var count = 0;
                        for (key in scope.rendering_children) {
                            count++;
                        }
                        if (count==0) {
                            $rootScope.$emit(scope.component_id + '_rendering_completed');
                        }
                    });
                    if (scope.parent_id!=null && scope.parent_id!='') {
                        $rootScope.$emit(scope.parent_id + '_child_rendered', scope.component_id);
                    }
                });

                // adding children to their respective container
                for (var idx_child=0; idx_child<component.children.length; idx_child++) {
                    if (scope.children[component.children[idx_child].container]==null) {
                        scope.children[component.children[idx_child].container] = [];
                    }
                    scope.children[component.children[idx_child].container].push(component.children[idx_child]);
                }
                if (attrs.dfxGcRendererContent!=null) {
                    scope.$parent_scope = scope.$parent;
                } else {
                    //scope.$parent_scope = angular.element(document.getElementById(scope.view_id)).scope().$parent;
                    if (scope.$parent.view_id) {// TODO: still not sure about this solution
                        scope.$parent_scope = angular.element(document.getElementById(scope.$parent.view_id)).scope().$parent;
                        //console.log(scope);
                    }
                }

                return $q.when(component.id);
            };

            this.bindScopeVariable = function( scope, scope_variable_name ) {
                scope.$watch( scope_variable_name, function(newValue, oldValue) {
                    scope.$parent_scope[scope_variable_name] = newValue;
                });
                scope.$parent_scope.$watch( scope_variable_name, function(newValue, oldValue) {
                    scope[scope_variable_name] = newValue;
                });
            };

            this.changeWidth = function(scope) {
                var component = angular.element(document.querySelectorAll('[id="' + scope.component_id + '"]'));//for repeatable panels
                var parent_column_orientation = $('#' + scope.component_id).parent().attr('layout');
                if (parent_column_orientation == 'column') {
                    component.css('width', scope.attributes.flex.value + '%');
                } else {
                    component.removeClass('flex-100');
                    component.addClass('flex' + '-' + scope.attributes.flex.value);
                }
            };
        }
    }
}]);

dfxGCC.directive('dfxGccWebPanel', ['$timeout', '$compile', function($timeout, $compile) {
    return {
        restrict: 'A',
        require: '^dfxGccWebBase',
        replace: false,
        scope: true,
        link: function(scope, element, attrs, basectrl) {
            var component = scope.getComponent(element);
            basectrl.init(scope, element, component, attrs, 'panel').then(function(){
                scope.attributes.flex.status = "overridden";
                scope.attributes.layoutType = { "value": "panel" };
                scope.attributes.isMainPanel = { "value": false };
                scope.attributes.initialized = { "value": true };
                scope.attributes.toolbar.leftMenu.equalButtonSize = { "value": false };
                scope.attributes.toolbar.leftMenu.initialClick = { "value": false };
                scope.attributes.toolbar.leftMenu.dynamicPresent = { "value": false };
                scope.attributes.toolbar.rightMenu.equalButtonSize = { "value": false };
                scope.attributes.toolbar.rightMenu.initialClick = { "value": false };
                scope.attributes.toolbar.rightMenu.dynamicPresent = { "value": false };
                scope.dfx_rep_panels;
                var is_rep_title = (scope.attributes.repeat_in.value !=='' && scope.attributes.repeat_title.value) ? true : false,
                    is_rep_panel = scope.attributes.repeat_in.value !=='' ? true : false;

                scope.collapsePanelContent = function(ev, dfxIndex){
                    var toggle_btn_id = ev.target.id,
                        toggle_btn = $('#'+toggle_btn_id),
                        collapse_cont_id = toggle_btn_id.replace('toggling_', '');
                    if(!is_rep_title && !is_rep_panel){
                        var collapse_container = $('#'+collapse_cont_id);
                        if(collapse_container.hasClass('ng-hide')) collapse_container.css('display', 'none').removeClass('ng-hide');
                        toggle_btn.toggleClass('dfx-expanded');
                        collapse_container.slideToggle();
                    }
                    if(!is_rep_title && is_rep_panel && scope.dfx_rep_panels>0){
                        toggle_btn.toggleClass('dfx-expanded');
                        for (var i = 0; i < scope.dfx_rep_panels; i++) {
                            var item_collapse_cont = $('#'+collapse_cont_id+'_'+i);
                            if(item_collapse_cont.hasClass('ng-hide')) item_collapse_cont.css('display', 'none').removeClass('ng-hide');
                            toggle_btn.hasClass('dfx-expanded') ? item_collapse_cont.slideDown() : item_collapse_cont.slideUp();
                        }
                    }
                    if(is_rep_title && dfxIndex >=0 ){
                        var collapse_container = $('#'+collapse_cont_id);
                        if(collapse_container.hasClass('ng-hide')) collapse_container.css('display', 'none').removeClass('ng-hide');
                        toggle_btn.toggleClass('dfx-expanded');
                        collapse_container.slideToggle();
                    }
                }

                if (scope.attributes.repeat_in.value != '' && $(element).parent().attr('layout') == 'row') {
                    if (scope.attributes.repeat_title.value) {
                        $(element).addClass('layout-row');
                        $(element).css('flex-wrap', 'wrap');
                    }
                }

                scope.changeWidth = function(){
                    if ( !scope.attributes.repeat_title.value ) {
                        basectrl.changeWidth(scope);
                    }
                };
                scope.changeWidth();

                /* Repeatable Panel adaptation to parent layout orientation - START */
                var adaptRepeatableToParentOrientation = function() {
                    if (scope.attributes.repeat_in.value != '') {
                        var parent_orientation = $(element).parent().attr('layout');

                        if (parent_orientation == 'row' && scope.attributes.repeat_title.value) {
                            $(element).addClass('layout-row');
                            $(element).css('flex-wrap', 'wrap');
                        } else if (parent_orientation == 'column' && scope.attributes.repeat_title.value) {
                            $(element).css('width', scope.attributes.flex.value + '%');
                            $(element).children('div').removeClass('flex-' + scope.attributes.flex.value);
                            $(element).children('div').addClass('flex-100');
                            $(element).children('div').css('width', '100%');
                        }
                    }
                };
                adaptRepeatableToParentOrientation();
                /* Repeatable Panel adaptation to parent layout orientation - END */

                var titleString = '';
                if (scope.attributes.toolbar.title.bindingHtml.value.indexOf('$dfx_item')===-1) {
                    titleString = '$parent_scope.';
                }
                scope.htmlTitleObject = titleString + scope.attributes.toolbar.title.bindingHtml.value;
            });
        }
    }
}]);

dfxGCC.directive('dfxNgSrc', ['$timeout', function($timeout) {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, el, attr) {
            var src = attr.ngSrc;

            $timeout(function() {
                // if src value is URL within quotes, remove quotes
                if (src.indexOf("'") == 0 && src.lastIndexOf("'") == (src.length - 1) && src.length > 2) {
                    var src_without_quotes = src.replace(/'/g, '');
                    el.attr('src', src_without_quotes);
                }
            }, 0);
        }
    }
}]);

dfxGCC.directive('dfxGccWebHtml', function($sce, $compile, $parse, $timeout) {
    return {
        restrict: 'A',
        require: '^dfxGccWebBase',
        scope: true,
        link: {
            pre : function(scope, element, attrs, basectrl) {
                var component = scope.getComponent(element);
                scope.component_id = component.id;
                scope.attributes = null;
                var current_element = element;

                basectrl.init(scope, element, component, attrs, 'html').then(function(){
                    scope.attributes.flex.status = "overridden" ;

                    scope.gcSnippetTrustAsHtml = function(snippet) {
                        return $sce.trustAsHtml(snippet);
                    };
                    if (scope.attributes.binding.value) {
                        scope.attributes.content.value = '';
                    }
                    $timeout(function(){
                        var component_id = component.id,
                            htmlId = component_id + '_html';
                        $(current_element).find("div").attr("id", htmlId);
                        $compile($(current_element).find("div").contents())(scope);
                    }, 0);

                    scope.changeWidth = function(){
                        var component = angular.element(document.querySelectorAll('[id="' + scope.component_id + '"]'));//for repeatable panels
                        component.css('width', scope.attributes.flex.value + '%');
                    };
                    scope.changeWidth();
                });
            }
        }
    }
});

dfxGCC.directive('dfxGccWebCarousel', ['$http', '$sce', '$mdDialog', '$mdToast', '$timeout', '$compile', '$parse', '$q', function($http, $sce, $mdDialog, $mdToast, $timeout, $compile, $parse, $q) {
    return {
        restrict: 'A',
        require: '^dfxGccWebBase',
        scope: true,
        link: function(scope, element, attrs, basectrl) {
            var component = scope.getComponent(element);
            scope.$gcscope = scope;
            basectrl.init(scope, element, component, attrs, 'carousel').then(function() {
                scope.attributes.static.status = "overridden";
                scope.attributes.flex.status = "overridden";
                scope.attributes.maxWidth.status = "overridden";
                scope.attributes.maxHeight.status = "overridden";
                scope.attributes.dynamicPresent = { "value": false };
                scope.attributes.layoutType = { "value": "none" };
                if (!scope.attributes.hasOwnProperty('optionsType')){scope.attributes.optionsType = {"value": "static"};}
                scope.attributes.optionsType.status = 'overridden';
                scope.attributes.optionItemNames.status = 'overridden';
                var source_name = scope.attributes.optionItemNames.value.source,
                    src_name = scope.attributes.optionItemNames.value.src,
                    title_name = scope.attributes.optionItemNames.value.title,
                    description_name = scope.attributes.optionItemNames.value.description,
                    onclick_name = scope.attributes.optionItemNames.value.onclick;
                scope.setCarouselDataSource = function() {
                    scope.carouselDataName = { "value": "" };
                    scope.carouselDataName.value = scope.attributes.optionsType.value === 'dynamic' ? scope.attributes.optionItemNames.value.source : 'attributes.static.value';
                }
                scope.compileSlide = function( slide ){
                    $compile(slide)(scope);
                }
                scope.compileSlides = function(){
                    $timeout(function(){
                        var screenSlides = $("#" + component.id + "_dfx_gc_web_carousel .dfx-carousel-item");
                        if ( scope.attributes.optionsType.value === 'dynamic' ) {
                            var slidesCount = scope.$parent_scope[scope.attributes.optionItemNames.value.source].length;
                            for ( var i = 0; i < slidesCount; i++ ) {
                                $(screenSlides).eq(i+1).find('img').attr('ng-src', '{{\''+scope.$parent_scope[source_name][i][src_name]+'\'}}');
                                $(screenSlides).eq(i+1).find('.dfx-carousel-item-title').html(scope.$parent_scope[source_name][i][title_name]);
                                $(screenSlides).eq(i+1).find('.dfx-carousel-item-description').html(scope.$parent_scope[source_name][i][description_name]);
                                $(screenSlides).eq(i+1).attr('ng-click', scope.$parent_scope[source_name][i][onclick_name]);
                                if(i!==0 || i!==slidesCount-1){
                                    scope.compileSlide($(screenSlides).eq(i+1));
                                }
                                if(i===0){
                                    $(screenSlides).eq(slidesCount+1).find('img').attr('ng-src', '{{\''+scope.$parent_scope[source_name][i][src_name]+'\'}}');
                                    $(screenSlides).eq(slidesCount+1).find('.dfx-carousel-item-title').html(scope.$parent_scope[source_name][i][title_name]);
                                    $(screenSlides).eq(slidesCount+1).find('.dfx-carousel-item-description').html(scope.$parent_scope[source_name][i][description_name]);
                                    scope.compileSlide($(screenSlides).eq(slidesCount+1));
                                }
                                if(i===slidesCount-1){
                                    $(screenSlides).eq(0).find('img').attr('ng-src', '{{\''+scope.$parent_scope[source_name][i][src_name]+'\'}}');
                                    $(screenSlides).eq(0).find('.dfx-carousel-item-title').html(scope.$parent_scope[source_name][i][title_name]);
                                    $(screenSlides).eq(0).find('.dfx-carousel-item-description').html(scope.$parent_scope[source_name][i][description_name]);
                                    scope.compileSlide($(screenSlides).eq(0));
                                }
                            }
                        } else {
                            var slidesCount = scope.attributes.static.value.length;
                            for ( var i = 0; i < slidesCount; i++ ) {
                                $(screenSlides).eq(i+1).find('img').attr('ng-src', '{{'+scope.attributes.static.value[i].src+'}}');
                                $(screenSlides).eq(i+1).attr('ng-click', scope.attributes.static.value[i].onclick);
                                $(screenSlides).eq(i+1).find('.dfx-carousel-item-title').html(scope.attributes.static.value[i].title);
                                $(screenSlides).eq(i+1).find('.dfx-carousel-item-description').html(scope.attributes.static.value[i].description);
                                if(i!==0 || i!==slidesCount-1){
                                    scope.compileSlide($(screenSlides).eq(i+1));
                                }
                                if(i===0){
                                    $(screenSlides).eq(slidesCount+1).find('img').attr('ng-src', '{{'+scope.attributes.static.value[i].src+'}}');
                                    $(screenSlides).eq(slidesCount+1).find('.dfx-carousel-item-title').html(scope.attributes.static.value[i].title);
                                    $(screenSlides).eq(slidesCount+1).find('.dfx-carousel-item-description').html(scope.attributes.static.value[i].description);
                                    scope.compileSlide($(screenSlides).eq(slidesCount+1));
                                }
                                if(i===slidesCount-1){
                                    $(screenSlides).eq(0).find('img').attr('ng-src', '{{'+scope.attributes.static.value[i].src+'}}');
                                    $(screenSlides).eq(0).find('.dfx-carousel-item-title').html(scope.attributes.static.value[i].title);
                                    $(screenSlides).eq(0).find('.dfx-carousel-item-description').html(scope.attributes.static.value[i].description);
                                    scope.compileSlide($(screenSlides).eq(0));
                                }
                            }
                        }
                    }, 0);
                }
                scope.simpleCarousel = function() {
                    scope.setCarouselDataSource();
                    var simpleCarouselSnippet = '<jk-carousel data="<<carouselSource>>" item-template-url="\'<<carouselTemplate>>\'" max-width="<<carouselMaxWidth>>" max-height="<<carouselMaxHeight>>"></jk-carousel>',
                        parsedSimpleCarousel = simpleCarouselSnippet
                            .replace('<<carouselSource>>', scope.carouselDataName.value)
                            .replace('<<carouselTemplate>>', scope.attributes.optionsType.value === 'dynamic' ? '/gcontrols/web/carousel_item_dynamic.html' : '/gcontrols/web/carousel_item_static.html')
                            .replace('<<carouselMaxWidth>>', scope.attributes.maxWidth.value)
                            .replace('<<carouselMaxHeight>>', scope.attributes.maxHeight.value);
                    $timeout(function(){
                        $("#" + component.id + "_dfx_gc_web_carousel").empty().html(parsedSimpleCarousel).promise().done(function(){
                            $compile($("#" + component.id + "_dfx_gc_web_carousel").contents())(scope);
                        }).done(function(){
                            $timeout(function(){
                                scope.compileSlides();
                            }, 0);
                        });
                    }, 0);
                }
                scope.autoCarousel = function() {
                    scope.setCarouselDataSource();
                    var autoCarouselSnippet = '<jk-carousel data="<<carouselSource>>" item-template-url="\'<<carouselTemplate>>\'" auto-slide="<<carouselAutoSlide>>" auto-slide-time="<<carouselSlideInterval>>" max-width="<<carouselMaxWidth>>" max-height="<<carouselMaxHeight>>"></jk-carousel>',
                        parsedAutoCarousel = autoCarouselSnippet
                            .replace('<<carouselSource>>', scope.carouselDataName.value)
                            .replace('<<carouselTemplate>>', scope.attributes.optionsType.value === 'dynamic' ? '/gcontrols/web/carousel_item_dynamic.html' : '/gcontrols/web/carousel_item_static.html')
                            .replace('<<carouselAutoSlide>>', scope.attributes.autoSlide.value)
                            .replace('<<carouselSlideInterval>>', scope.attributes.slideInterval.value)
                            .replace('<<carouselMaxWidth>>', scope.attributes.maxWidth.value)
                            .replace('<<carouselMaxHeight>>', scope.attributes.maxHeight.value);
                    $timeout(function(){
                        $("#" + component.id + "_dfx_gc_web_carousel").empty().html(parsedAutoCarousel).promise().done(function(){
                            $compile($("#" + component.id + "_dfx_gc_web_carousel").contents())(scope);
                        }).done(function(){
                            $timeout(function(){
                                scope.compileSlides();
                            }, 0);
                        });
                    }, 0);
                }
                scope.rebuildCarousel = function() {
                    scope.attributes.autoSlide.value === 'true' ? scope.autoCarousel() : scope.simpleCarousel();
                }
                if ( scope.attributes.optionsType.value === 'dynamic' ) {
                    scope.$watch('$parent_scope[attributes.optionItemNames.value.source]', function(newValue, oldValue) {
                        if ( newValue ) {
                            scope.rebuildCarousel();
                        }
                    }, true);
                } else {
                    scope.$watch('attributes.static.value', function(newValue, oldValue) {
                        if ( newValue ) {
                            $timeout(function(){
                                scope.rebuildCarousel();
                            }, 0, false);
                        }
                    }, true);
                }
                scope.changeWidth = function(){//necessary to show carousel if parent orientation is column
                    var component = angular.element(document.querySelectorAll('[id="' + scope.component_id + '"]'));//for repeatable panels
                    component.css('width', scope.attributes.flex.value + '%');
                };
                scope.changeWidth();
            });
        }
    }
}]);

dfxGCC.directive('dfxGccWebTreeview', [ '$timeout', '$compile', '$q', '$http', '$mdDialog', '$filter', '$mdToast',  function($timeout, $compile, $q, $http, $mdDialog, $filter, $mdToast) {
    return {
        restrict: 'A',
        require: '^dfxGccWebBase',
        scope: true,
        link: function(scope, element, attrs, basectrl) {
            var component = scope.getComponent(element);
            scope.$gcscope = scope;
            basectrl.init(scope, element, component, attrs, 'treeview').then(function() {
                if ( !scope.attributes.hasOwnProperty('flex') ) { scope.attributes.flex = { "value": 100 }; }
                if ( !scope.attributes.hasOwnProperty('treeItemsType') ) { scope.attributes.treeItemsType = { "value": "static" }; }
                if ( !scope.attributes.hasOwnProperty('selected') ) { scope.attributes.selected = { "value": "" }; }
                scope.attributes.flex.status = "overridden";
                scope.attributes.dynamic.status = "overridden";
                scope.attributes.static.status = "overridden";
                scope.attributes.isOpened.status = "overridden";
                scope.attributes.isClosed.status = "overridden";
                if ( !scope.attributes.hasOwnProperty('iconType') ) {
                    scope.attributes.iconType = { "value": 'fa-icon' };
                    scope.attributes.isOpened.type = scope.attributes.iconType.value;
                    scope.attributes.isClosed.type = scope.attributes.iconType.value;
                    scope.attributes.iconType.status = "overridden";
                } else {
                    scope.attributes.iconType.status = "overridden";
                }

                scope.toggleNode = function( event, node ) {
                    node.expanded ? node.expanded = false : node.expanded = true;
                }
                scope.selectedArrayClone = [];
                scope.clearFromUnchecked = function( childItems, itemsType ){
                    for (var i = childItems.length-1; i>=0; i--) {
                        if(!childItems[i].isChecked){
                            childItems.splice(i, 1);
                        } else {
                            if(childItems[i].hasOwnProperty('expanded')) delete childItems[i].expanded;
                            if(childItems[i].hasOwnProperty('isChecked')) delete childItems[i].isChecked;
                            if(itemsType==='static'){
                                if(childItems[i].children && childItems[i].children.length>0){
                                    scope.clearFromUnchecked(childItems[i].children, 'static');
                                }
                            }else{
                                if(childItems[i][scope.attributes.repeatable_property.value] && childItems[i][scope.attributes.repeatable_property.value].length>0){
                                    scope.clearFromUnchecked(childItems[i][scope.attributes.repeatable_property.value], 'dynamic');
                                }
                            }
                        }
                    };
                }
                scope.rebuildSelectedArray = function( itemsType ){
                    for (var i = scope.selectedArrayClone.length-1; i>=0; i--) {
                        if(!scope.selectedArrayClone[i].isChecked){
                            scope.selectedArrayClone.splice(i, 1);
                        } else {
                            if(scope.selectedArrayClone[i].hasOwnProperty('expanded')) delete scope.selectedArrayClone[i].expanded;
                            if(scope.selectedArrayClone[i].hasOwnProperty('isChecked')) delete scope.selectedArrayClone[i].isChecked;
                            if(itemsType==='static'){
                                if(scope.selectedArrayClone[i].children && scope.selectedArrayClone[i].children.length>0){
                                    scope.clearFromUnchecked(scope.selectedArrayClone[i].children, 'static');
                                }
                            }else{
                                if(scope.selectedArrayClone[i][scope.attributes.repeatable_property.value] && scope.selectedArrayClone[i][scope.attributes.repeatable_property.value].length>0){
                                    scope.clearFromUnchecked(scope.selectedArrayClone[i][scope.attributes.repeatable_property.value], 'dynamic');
                                }
                            }
                        }
                    };
                    $q.all([ scope.rebuildSelectedArray, scope.clearFromUnchecked ]).then(function(){
                        scope.$parent_scope[scope.attributes.selected.value] = scope.selectedArrayClone;
                    });
                };
                scope.isSelectedItem = function( item ){
                    if(item.hasOwnProperty('isChecked')){
                        return item.isChecked ? true : false;
                    } else {
                        item.isChecked = false;
                        return false;
                    }
                }
                scope.selectNodeChildrens = function( childItems, isChecked, itemsType ){
                    for (var i = 0; i < childItems.length; i++) {
                        childItems[i].isChecked = isChecked;
                        if(itemsType==='static'){
                            if(childItems[i].children && childItems[i].children.length>0){
                                scope.selectNodeChildrens(childItems[i].children, isChecked, itemsType);
                            }
                        }else{
                            if(childItems[i][scope.attributes.repeatable_property.value] && childItems[i][scope.attributes.repeatable_property.value].length>0){
                                scope.selectNodeChildrens(childItems[i][scope.attributes.repeatable_property.value], isChecked, itemsType);
                            }
                        }
                    };
                }
                scope.toggleSelectedItem = function( item, nodeIndexes, itemsType ){
                    item.isChecked = !item.isChecked ? true : false;
                    var nodes = JSON.parse('['+nodeIndexes+']'),
                        rootLevel = itemsType==='static' ? 'scope.attributes.static.value' : 'scope.$parent_scope.'+scope.attributes.dynamic.value,
                        nodeLevel = '',
                        nodeBridge = itemsType==='static' ? '.children' : '.'+scope.attributes.repeatable_property.value;
                    if(item.isChecked){
                        for (var i = 0; i < nodes.length-1; i++) {
                            if(i===0){
                                nodeLevel = rootLevel+'['+nodes[i]+']';
                                eval(nodeLevel).isChecked = true;
                            }else{
                                nodeLevel += nodeBridge+'['+nodes[i]+']';
                                eval(nodeLevel).isChecked = true;
                            }
                        };
                        if(itemsType==='static'){
                            if(item.children && item.children.length>0){
                                scope.selectNodeChildrens(item.children, true, itemsType);
                            }
                        }else{
                            if(item[scope.attributes.repeatable_property.value] && item[scope.attributes.repeatable_property.value].length>0){
                                scope.selectNodeChildrens(item[scope.attributes.repeatable_property.value], true, itemsType);
                            }
                        }
                    }else{
                        if(itemsType==='static'){
                            if(item.children && item.children.length>0){
                                scope.selectNodeChildrens(item.children, false, itemsType);
                            }
                        }else{
                            if(item[scope.attributes.repeatable_property.value] && item[scope.attributes.repeatable_property.value].length>0){
                                scope.selectNodeChildrens(item[scope.attributes.repeatable_property.value], false, itemsType);
                            }
                        }
                    }
                    $q.all([ scope.toggleSelectedItem, scope.selectNodeChildrens, scope.isSelectedItem ]).then(function(){
                        scope.selectedArrayClone = [];
                        if(itemsType==='static'){
                            scope.selectedArrayClone = JSON.parse(JSON.stringify(scope.attributes.static.value));
                            scope.rebuildSelectedArray('static');
                        }else{
                            scope.selectedArrayClone = JSON.parse(JSON.stringify(scope.$parent_scope[scope.attributes.dynamic.value]));
                            scope.rebuildSelectedArray('dynamic');
                        }
                    });
                }

                if(scope.attributes.treeItemsType.value==='static'){
                    scope.selectedArrayClone = JSON.parse(JSON.stringify(scope.attributes.static.value));
                    scope.rebuildSelectedArray('static');
                }else{
                    scope.selectedArrayClone = JSON.parse(JSON.stringify(scope.$parent_scope[scope.attributes.dynamic.value]));
                    scope.rebuildSelectedArray('dynamic');
                }

                // scope.getDynamicItems = function() {
                //     return scope.$gcscope[scope.attributes.dynamic.value];
                // };
                // scope.getStaticItems = function() {
                //     return scope.attributes.static.value;
                // };
                scope.changeWidth = function(){
                    var component = angular.element(document.querySelectorAll('[id="' + scope.component_id + '"]'));//for repeatable panels
                    component.css('width', scope.attributes.flex.value + '%');
                };
                scope.changeWidth();
            });
        }
    }
}]);

dfxGCC.directive('dfxGccWebDatepicker', ['$timeout', function($timeout) {
    return {
        restrict: 'A',
        require: '^dfxGccWebBase',
        scope: true,
        link: function(scope, element, attrs, basectrl) {
            var component = scope.$parent.getComponent(element);
            scope.dp_input;
            scope.isLoaded = {"value": false};
            basectrl.init(scope, element, component, attrs, 'datepicker').then(function() {
                if ( !scope.attributes.hasOwnProperty('flex') ) { scope.attributes.flex = { "value": 20 }; }
                scope.attributes.bindingDate.status = "overridden";
                scope.attributes.ranged.status = "overridden";

                scope.attributes.designDate.value = new Date();

                if(scope.attributes.bindingExpression.value === ""){
                    scope.attributes.bindingDate.value = new Date();
                }else{
                    try{
                        scope.attributes.bindingDate.value = eval(scope.attributes.bindingExpression.value);
                    }catch(e){
                        scope.attributes.bindingDate.value = eval('scope.' + scope.attributes.bindingExpression.value);
                        scope.attributes.bindingDate.value = new Date(scope.attributes.bindingDate.value);
                    }
                }

                if(!scope.attributes.labelClass){
                    scope.attributes.labelClass = 'dp-label-focus-off';
                }
                scope.isLoaded.value = true;
                scope.$watch('attributes.ranged.monthsBefore', function(monthsBefore){
                    scope.minDate = new Date(
                        eval(scope.attributes.bindingDate.value).getFullYear(),
                        eval(scope.attributes.bindingDate.value).getMonth() - monthsBefore,
                        eval(scope.attributes.bindingDate.value).getDate());
                });

                scope.$watch('attributes.ranged.monthsAfter', function(monthsAfter){
                    scope.maxDate = new Date(
                        eval(scope.attributes.bindingDate.value).getFullYear(),
                        eval(scope.attributes.bindingDate.value).getMonth() + monthsAfter,
                        eval(scope.attributes.bindingDate.value).getDate());

                    scope.attributes.alignment.status = "overridden" ;
                });

                $timeout(function () {
                    try{
                        scope.dp_input = '#' + scope.component_id + ' > div > div > md-datepicker > div.md-datepicker-input-container > input';
                        $(scope.dp_input).focus(function(){
                            scope.attributes.labelClass = 'dp-label-focus-on';
                            scope.$apply(function(){
                            });
                        });
                        $(scope.dp_input).blur(function(){
                            scope.attributes.labelClass = 'dp-label-focus-off';
                            scope.$apply(function(){
                            });
                        });

                    }catch(e){
                        console.log(e.message);
                    }
                },0);

                scope.attributes.bindingDateModel = function() {
                    return scope.attributes.bindingDate.value;
                };

                scope.changeWidth = function() {
                    var component = angular.element(document.querySelectorAll('[id="' + scope.component_id + '"]'));//for repeatable panels
                    component.css('width', scope.attributes.flex.value + '%');

                    $timeout(function(){
                        var preview_wrapper = '#' + scope.component_id;
                        component.css('width', scope.attributes.flex.value + '%');

                        var dp_input = '#' + scope.component_id + ' > div > div > md-datepicker > div.md-datepicker-input-container > input' ;
                        $(dp_input).css('text-align', scope.attributes.alignment.value);
                    }, 0);
                };
                scope.changeWidth();
            });
        }
    }
}]);

dfxGCC.directive('dfxGccWebButton', ['$timeout', '$compile', '$filter', function($timeout, $compile, $filter) {
    return {
        restrict: 'A',
        require: '^dfxGccWebBase',
        scope: true,
        link: {
            pre: function(scope, element, attrs, basectrl) {
                var component = scope.getComponent(element);
				scope.component_id = ($(element).parent().attr('dfx-gcc-renderer')!=null) ? $(element).attr('id') : component.id;
                basectrl.init(scope, element, component, attrs, 'button').then(function() {
                    scope.attributes.dynamic.status = "overridden";
                    scope.attributes.icon.status = "overridden";
                    scope.attributes.layoutType = { "value": "none" };
                    scope.attributes.menuItemsType.status = "overridden";
                    scope.attributes.menuItemNames.status = "overridden";
                    scope.attributes.flex.status = "overridden";
                    scope.itemNames = scope.attributes.menuItemNames.value;
                    scope.component_class = attrs.id;
                    scope.positionModeSide = 'left';
                    scope.positionOffsetLeft = 0;

                    if ( typeof scope.attributes.icon === 'string' ) {
                        var tempIcon = scope.attributes.icon;
                        scope.attributes.icon = {
                            "value": tempIcon,
                            "type": scope.attributes.hasOwnProperty('iconType') ? scope.attributes.iconType : 'fa-icon'
                        }
                    }
                    if ( !scope.attributes.icon.hasOwnProperty('size') ) { scope.attributes.icon.size = 21; }

                    if ( !scope.attributes.icon.hasOwnProperty('position') ) {
                        scope.attributes.icon.position = scope.attributes.position ? scope.attributes.position.value : 'left';
                        scope.attributes.icon.style = "";
                        scope.attributes.icon.class = "";
                        scope.attributes.singleMenu = {"button": { "style": "", "class": "" }, "icon": { "size": 16, "style": "", "class": ""}}
                        delete scope.attributes.position;
                    }
                    if ( scope.attributes.classes.value.indexOf('md-raised') > -1 ) { scope.attributes.classes.value = scope.attributes.classes.value.replace('md-raised', ""); }
                    if ( scope.attributes.classes.value.indexOf('md-primary') > -1 ) { scope.attributes.classes.value = scope.attributes.classes.value.replace('md-primary', ""); }
                    scope.ifShowIconTypes = function( icon, type ) {
                        var regexp = /(^\')(.*)(\'$)/gm, filtered = regexp.exec( icon );
                        if ( icon && ( icon.indexOf('+') >= 0 ) ) { filtered = false; }
                        if ( icon === '' ) { filtered = true; }
                        if ( icon.indexOf("'") === 0 && icon.indexOf('+') === -1 && icon.charAt(icon.length-1) === "'" && !type ) {
                            icon.indexOf("'fa-") === 0 ? scope.attributes.icon.type = 'fa-icon' : scope.attributes.icon.type = 'svg-icon';
                        } else if ( icon.indexOf("'") === 0 && icon.indexOf('+') === -1 && icon.charAt(icon.length-1) === "'" && type !== '' ) {
                            switch ( type ) {
                                case 'checked': icon.indexOf("'fa-") === 0 ? scope.attributes.state.checkedIcon.type = 'fa-icon' : scope.attributes.state.checkedIcon.type = 'svg-icon'; break;
                                case 'unchecked': icon.indexOf("'fa-") === 0 ? scope.attributes.state.uncheckedIcon.type = 'fa-icon' : scope.attributes.state.uncheckedIcon.type = 'svg-icon'; break;
                                case 'waiting': icon.indexOf("'fa-") === 0 ? scope.attributes.waiting.icon.type = 'fa-icon' : scope.attributes.waiting.icon.type = 'svg-icon'; break;
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
                    scope.ifShowIconTypes(scope.attributes.icon.value);
                    var singleMenuItem = '<md-button ng-show="{{itemDisplay}}" ng-disabled="{{itemDisabled}}" ng-click="{{itemClick}}" class="dfx-menu-button {{attributes.singleMenu.button.class}}" style="{{attributes.singleMenu.button.style}}" aria-label="iconbar-button" >'+
                            '<md-icon ng-if="{{ifFaIcon}}" class="fa {{faIcon}} dfx-menu-button-icon {{attributes.singleMenu.icon.class}}" style="font-size:{{attributes.singleMenu.icon.size}}px; {{attributes.singleMenu.icon.style}}"></md-icon>'+
                            '<ng-md-icon ng-if="{{ifSvgIcon}}" icon="{{svgIcon}}" size="{{attributes.singleMenu.icon.size}}" class="dfx-menu-button-icon {{attributes.singleMenu.icon.class}}" style="{{attributes.singleMenu.icon.style}}"></ng-md-icon>'+
                            '<span>{{itemLabel}}</span>'+
                            '<span class="md-alt-text">{{itemShortcut}}</span>'+
                            '<small ng-if="{{ifItemNotification}}">{{itemNotification}}</small>'+
                        '</md-button>',
                        iconbarMenuItem =   '<md-menu-item ng-if="{{itemDisplay}}">';
                    var buildNextLevel = function (nextLevel, optionsType) {
                        if (optionsType === 'static' ) {
                            for (var i = 0; i < nextLevel.length; i++) {
                                if ( nextLevel[i].hasOwnProperty('icon') && typeof nextLevel[i].icon === 'string' ) {
                                    var tempIcon = nextLevel[i].icon;
                                    nextLevel[i].icon = {
                                        "value": tempIcon,
                                        "type": nextLevel[i].hasOwnProperty('iconType') ? nextLevel[i].iconType : 'fa-icon'
                                    }
                                }
                                if ( nextLevel[i].menuItems.value.length > 0 ) {
                                    next = nextLevel[i].menuItems.value;
                                    var iconbarItem = iconbarMenuItem.replace('{{itemDisplay}}', typeof nextLevel[i].display === 'string' ? nextLevel[i].display.replace(/"/g, '\'') : nextLevel[i].display);

                                    scope.iconBar = scope.iconBar + iconbarItem + '<md-menu>';

                                    var singleMenu = singleMenuItem
                                        .replace('{{ifFaIcon}}', nextLevel[i].icon.value.length > 0 && nextLevel[i].icon.type === 'fa-icon' ? true : false )
                                        .replace('{{ifSvgIcon}}', nextLevel[i].icon.value.length > 0 && nextLevel[i].icon.type === 'svg-icon' ? true : false )
                                        .replace('{{faIcon}}', nextLevel[i].icon.value.indexOf("'") == -1 ? '{{'+nextLevel[i].icon.value+'}}' : eval(nextLevel[i].icon.value.replace(/"/g, '\'')) )
                                        .replace('{{svgIcon}}', nextLevel[i].icon.value.indexOf("'") == -1 ? '{{'+nextLevel[i].icon.value+'}}' : eval(nextLevel[i].icon.value.replace(/"/g, '\'')) )
                                        .replace('{{itemLabel}}', '{{'+nextLevel[i].label.replace(/"/g, '\'')+'}}' )
                                        .replace('{{itemShortcut}}', nextLevel[i].shortcut)
                                        .replace('{{ifItemNotification}}', nextLevel[i].notification !=='' ? true : false )
                                        .replace('{{itemNotification}}', '{{'+nextLevel[i].notification+'}}' )
                                        .replace('{{itemDisplay}}', typeof nextLevel[i].display === 'string' ? nextLevel[i].display.replace(/"/g, '\'') : nextLevel[i].display)
                                        .replace('{{itemDisabled}}', typeof nextLevel[i].disabled === 'string' ? nextLevel[i].disabled.replace(/"/g, '\'') : nextLevel[i].disabled)
                                        .replace('{{itemClick}}', '$mdOpenMenu();'+nextLevel[i].onclick.replace(/"/g, '\''));

                                    scope.iconBar = scope.iconBar + singleMenu +'<md-menu-content width="4">';
                                    buildNextLevel(next, optionsType);
                                    scope.iconBar = scope.iconBar + '</md-menu-content></md-menu></md-menu-item>';
                                } else {
                                    if ( nextLevel[i].divider === true ) {
                                        scope.iconBar = scope.iconBar + '<md-menu-divider></md-menu-divider>';
                                    } else {
                                        if ( !nextLevel[i].hasOwnProperty('iconType') && !nextLevel[i].divider && !nextLevel[i].title) { nextLevel[i].iconType = 'fa-icon'; }
                                        var iconbarItem = iconbarMenuItem.replace('{{itemDisplay}}', true);

                                        scope.iconBar = scope.iconBar + iconbarItem;

                                        var singleMenu = singleMenuItem
                                            .replace('{{ifFaIcon}}', nextLevel[i].icon.value.length > 0 && nextLevel[i].icon.type === 'fa-icon' ? true : false )
                                            .replace('{{ifSvgIcon}}', nextLevel[i].icon.value.length > 0 && nextLevel[i].icon.type === 'svg-icon' ? true : false )
                                            .replace('{{faIcon}}', nextLevel[i].icon.value.indexOf("'") == -1 ? '{{'+nextLevel[i].icon.value+'}}' : eval(nextLevel[i].icon.value.replace(/"/g, '\'')) )
                                            .replace('{{svgIcon}}', nextLevel[i].icon.value.indexOf("'") == -1 ? '{{'+nextLevel[i].icon.value+'}}' : eval(nextLevel[i].icon.value.replace(/"/g, '\'')) )
                                            .replace('{{itemLabel}}', '{{'+nextLevel[i].label.replace(/"/g, '\'')+'}}' )
                                            .replace('{{itemShortcut}}', nextLevel[i].shortcut.replace(/"/g, '\''))
                                            .replace('{{ifItemNotification}}', nextLevel[i].notification !=='' ? true : false )
                                            .replace('{{itemNotification}}', '{{'+nextLevel[i].notification+'}}' )
                                            .replace('{{itemDisplay}}', typeof nextLevel[i].display === 'string' ? nextLevel[i].display.replace(/"/g, '\'') : nextLevel[i].display)
                                            .replace('{{itemDisabled}}', typeof nextLevel[i].disabled === 'string' ? nextLevel[i].disabled.replace(/"/g, '\'') : nextLevel[i].disabled)
                                            .replace('{{itemClick}}', nextLevel[i].onclick.replace(/"/g, '\''));

                                        scope.iconBar = scope.iconBar + singleMenu + '</md-menu-item>';
                                    }
                                }
                            };
                            scope.iconBarMenu = scope.iconBar;
                        } else {
                            for (var i = 0; i < nextLevel.length; i++) {
                                if ( nextLevel[i][scope.itemNames.main.scopeItems] && nextLevel[i][scope.itemNames.main.scopeItems].length > 0 ) {
                                    var iconbarItem = iconbarMenuItem.replace('{{itemDisplay}}', scope.itemNames.main.display !=='' ? nextLevel[i][scope.itemNames.main.display] : true);
                                    scope.iconBar = scope.iconBar + iconbarItem + '<md-menu>';
                                    var singleMenu = singleMenuItem
                                        .replace('{{ifFaIcon}}', nextLevel[i][scope.itemNames.main.icon.value] && nextLevel[i][scope.itemNames.main.icon.value][scope.itemNames.main.icon.name] && nextLevel[i][scope.itemNames.main.icon.value][scope.itemNames.main.icon.type] === 'fa-icon' ? true : false )
                                        .replace('{{ifSvgIcon}}', nextLevel[i][scope.itemNames.main.icon.value] && nextLevel[i][scope.itemNames.main.icon.value][scope.itemNames.main.icon.name] && nextLevel[i][scope.itemNames.main.icon.value][scope.itemNames.main.icon.type] === 'svg-icon' ? true : false )
                                        .replace('{{faIcon}}', nextLevel[i][scope.itemNames.main.icon.value] && nextLevel[i][scope.itemNames.main.icon.value][scope.itemNames.main.icon.name] ? '{{\''+nextLevel[i][scope.itemNames.main.icon.value][scope.itemNames.main.icon.name]+'\'}}' : '')
                                        .replace('{{svgIcon}}', nextLevel[i][scope.itemNames.main.icon.value] && nextLevel[i][scope.itemNames.main.icon.value][scope.itemNames.main.icon.name] ? '{{\''+nextLevel[i][scope.itemNames.main.icon.value][scope.itemNames.main.icon.name]+'\'}}' : '' )
                                        .replace('{{itemLabel}}', nextLevel[i][scope.itemNames.main.label] ? '{{\''+nextLevel[i][scope.itemNames.main.label]+'\'}}' : '' )
                                        .replace('{{itemShortcut}}', nextLevel[i][scope.itemNames.main.shortcut])
                                        .replace('{{ifItemNotification}}', nextLevel[i][scope.itemNames.main.notification] !=='' ? true : false )
                                        .replace('{{itemNotification}}', '{{\''+nextLevel[i][scope.itemNames.main.notification]+'\'}}' )
                                        .replace('{{itemDisplay}}', scope.itemNames.main.display !=='' ? nextLevel[i][scope.itemNames.main.display] : true)
                                        .replace('{{itemDisabled}}', scope.itemNames.main.disabled !=='' ? nextLevel[i][scope.itemNames.main.disabled] : false)
                                        .replace('{{itemClick}}', '$mdOpenMenu();'+ scope.itemNames.main.onclick !=='' ? nextLevel[i][scope.itemNames.main.onclick] : '');
                                    scope.iconBar = scope.iconBar + singleMenu +'<md-menu-content width="4">';
                                    buildNextLevel(nextLevel[i][scope.itemNames.main.scopeItems], optionsType);
                                    scope.iconBar = scope.iconBar + '</md-menu-content></md-menu></md-menu-item>';
                                } else {
                                    if ( nextLevel[i][scope.itemNames.main.type] === 'divider' ) {
                                        scope.iconBar = scope.iconBar + '<md-menu-divider></md-menu-divider>';
                                    } else if ( nextLevel[i][scope.itemNames.main.type] === 'title' ) {
                                        scope.iconBar = scope.iconBar + '<md-menu-item class="tree-menu-title"><div>{{\''+nextLevel[i][scope.itemNames.main.label]+'\'}}</div></md-menu-item>';
                                    } else {
                                        var iconbarItem = iconbarMenuItem.replace('{{itemDisplay}}', scope.itemNames.main.display !=='' ? nextLevel[i][scope.itemNames.main.display] : true);
                                        scope.iconBar = scope.iconBar + iconbarItem;
                                        var singleMenu = singleMenuItem
                                            .replace('{{ifFaIcon}}', nextLevel[i][scope.itemNames.main.icon.value] && nextLevel[i][scope.itemNames.main.icon.value][scope.itemNames.main.icon.name] && nextLevel[i][scope.itemNames.main.icon.value][scope.itemNames.main.icon.type] === 'fa-icon' ? true : false )
                                            .replace('{{ifSvgIcon}}', nextLevel[i][scope.itemNames.main.icon.value] && nextLevel[i][scope.itemNames.main.icon.value][scope.itemNames.main.icon.name] && nextLevel[i][scope.itemNames.main.icon.value][scope.itemNames.main.icon.type] === 'svg-icon' ? true : false )
                                            .replace('{{faIcon}}', nextLevel[i][scope.itemNames.main.icon.value] && nextLevel[i][scope.itemNames.main.icon.value][scope.itemNames.main.icon.name] ? '{{\''+nextLevel[i][scope.itemNames.main.icon.value][scope.itemNames.main.icon.name]+'\'}}' : '')
                                            .replace('{{svgIcon}}', nextLevel[i][scope.itemNames.main.icon.value] && nextLevel[i][scope.itemNames.main.icon.value][scope.itemNames.main.icon.name] ? '{{\''+nextLevel[i][scope.itemNames.main.icon.value][scope.itemNames.main.icon.name]+'\'}}' : '' )
                                            .replace('{{itemLabel}}', nextLevel[i][scope.itemNames.main.label] ? '{{\''+nextLevel[i][scope.itemNames.main.label]+'\'}}' : '')
                                            .replace('{{itemShortcut}}', nextLevel[i][scope.itemNames.main.shortcut])
                                            .replace('{{ifItemNotification}}', nextLevel[i][scope.itemNames.main.notification] !=='' ? true : false )
                                            .replace('{{itemNotification}}', '{{\''+nextLevel[i][scope.itemNames.main.notification]+'\'}}' )
                                            .replace('{{itemDisplay}}', scope.itemNames.main.display !=='' ? nextLevel[i][scope.itemNames.main.display] : true)
                                            .replace('{{itemDisabled}}', scope.itemNames.main.disabled !=='' ? nextLevel[i][scope.itemNames.main.disabled] : false)
                                            .replace('{{itemClick}}',  scope.itemNames.main.onclick !=='' ? nextLevel[i][scope.itemNames.main.onclick] : '');
                                        scope.iconBar = scope.iconBar + singleMenu + '</md-menu-item>';
                                    }
                                }
                            };
                            scope.iconBarMenu = scope.iconBar;
                        }
                    }
                    scope.buttonMenuBuilder = function() {
                        if(scope.attributes.menuItemsType.value === 'dynamic'){
                            scope.iconbarArray = scope.$parent_scope[scope.itemNames.main.source];
                        }else{
                            scope.iconbarArray = scope.attributes.menuItems.value;
                        }
                        if ( scope.iconbarArray.length > 0 ) {
                            scope.iconBar = '';
                            buildNextLevel(scope.iconbarArray, scope.attributes.menuItemsType.value);

                            $timeout(function() {
                                $('.' + scope.component_class + '_button_menu').empty();
                                $('.' + scope.component_class + '_button_menu').load('/gcontrols/web/button_menu.html', function(){
                                    $('.' + scope.component_class + '_button_menu md-menu-content').html(scope.iconBarMenu);
                                    $compile($('.' + scope.component_class + '_button_menu').contents())(scope);
                                    $timeout(function() {
                                        scope.menuPosition();
                                    }, 0);
                                });
                            }, 0);
                        }
                    }
                    scope.changeWidth = function(){
                        if(scope.attributes.notFlex.value) {
                            $(element).css({
                                'flex': '0',
                                'width': 'auto',
                                'max-width': '100%'
                            });
                            scope.attributes.flex.value = 'none';
                        }else{
                            $(element).css({
                                'flex': scope.attributes.flex.value + '%',
                                'width': scope.attributes.flex.value + '%',
                                'max-width': scope.attributes.flex.value + '%'
                            });
                        }
                    };
                    scope.menuPosition = function(button){
                        var buttonWidth;
                        $timeout(function() {
							buttonWidth = $(element).find('button.gc-btn-group-first').eq(0).css('width');
                            buttonWidth = parseInt(buttonWidth);
                            if(buttonWidth > 220) scope.positionModeSide = 'right';
                        }, 0);
                    }
                    scope.changeWidth();

                    scope.$watch('attributes.menuItems.value', function(newVal, oldVal) {
                        if ( newVal != null && !angular.equals(newVal, oldVal) ) {
                            $timeout(function() {
                                scope.buttonMenuBuilder();
                            }, 0, false);
                        }
                    }, true);

                    scope.buttonMenuBuilder();
                    if ( !scope.attributes.hasOwnProperty('waiting') ) {
                        scope.attributes.waiting = {
                            "value": "",
                            "icon": { "value": "'fa-spinner'", "type": "fa-icon", "style": "", "class": "fa-pulse" }
                        }
                    }
                });
            }
        }
    }
}]);

dfxGCC.directive('dfxGccWebStatictext', ['$timeout', function($timeout) {
    return {
        restrict: 'A',
        require: '^dfxGccWebBase',
        scope: true,
        link: {
            pre: function(scope, element, attrs, basectrl) {
                var component = scope.$parent.getComponent(element);
                scope.component_id = component.id;
                basectrl.init(scope, element, component, attrs, 'statictext').then(function(){

                });
            }
        }
    }
}]);

dfxGCC.directive('dfxGccWebToolbar', function($sce, $compile, $timeout) {
    return {
        restrict: 'A',
        terminal: true,
        priority: 1001,
        replace: true,
        transclude : true,
        scope: true,
        templateUrl: function( el, attrs) {
            return '/gcontrols/web/toolbar_preview.html';
        },
        link: {
            pre: function(scope, element, attrs) {
                var toolbar_panel_index = scope.$parent.$dfx_index;

                scope.runToolbar = function(){
                    $timeout(function(){
                        scope.attributes.toolbar.rightMenu.initialClick.value = false;
                        scope.attributes.toolbar.leftMenu.initialClick.value = false;
                        if(scope.attributes.layoutType.value === 'panel'){
                            var elem = '#' + scope.component_id;
                            var parent_column_orientation = $(elem).parent().attr('layout');
                            if (parent_column_orientation === 'row') {
                                $(elem).addClass('flex');
                            }
                        }
                        if(scope.attributes.toolbar.title.isHtml.value){
                            var html_title = '#' + scope.component_id + '_toolbar_bindingHtml';
                            $compile($(html_title).contents())(scope);
                        }
                        if(scope.attributes.toolbar.rightMenu.type.value === 'Icon Bar'){
                            scope.iconbarBuilder('right');
                        }else if(scope.attributes.toolbar.rightMenu.type.value === 'Buttons'){
                            scope.iconbarBuilder('right');
                        }
                        if(scope.attributes.toolbar.leftMenu.type.value === 'Icon Bar'){
                            scope.iconbarBuilder('left');
                        }else if(scope.attributes.toolbar.leftMenu.type.value === 'Buttons'){
                            scope.iconbarBuilder('left');
                        }
                    },0);
                };

                var toolbarAttrs = setInterval(function() {
                    if (typeof scope.attributes === 'undefined') return;
                    clearInterval(toolbarAttrs);
                    scope.runToolbar();
                }, 10);

                scope.setButtonsWidth = function(isEqual, side){
                    $timeout(function(){
                        if(side==='right'){
                            var parentDiv = '.' + scope.component_id + '_toolbar_right_menu';
                        }else{
                            var parentDiv = '.' + scope.component_id + '_toolbar_left_menu';
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
                var singleMenuItem = '', toolbarType='', iconbarMenuItem = '<md-menu-item ng-if="{{itemDisplay}}">';

                scope.changeState = function( itemIndexes, ev, side, optionsType ) {
                    var levels = JSON.parse('['+itemIndexes+']'),
                        stateElement = '',
                        stateObject = {},
                        bridge = '',
                        dynamicBridge = '',
                        scopeSource = '',
                        stateName = '',
                        stateBindingName = '';
                    switch ( side ) {
                        case 'left':
                            dynamicBridge = scope.attributes.toolbar.leftMenu.menuItemNames.value.main.scopeItems;
                            scopeSource = scope.attributes.toolbar.leftMenu.menuItemNames.value.main.source;
                            stateName = scope.attributes.toolbar.leftMenu.menuItemNames.value.state.name;
                            stateBindingName = scope.attributes.toolbar.leftMenu.menuItemNames.value.state.binding;
                            break;
                        case 'right':
                            dynamicBridge = scope.attributes.toolbar.rightMenu.menuItemNames.value.main.scopeItems;
                            scopeSource = scope.attributes.toolbar.rightMenu.menuItemNames.value.main.source;
                            stateName = scope.attributes.toolbar.rightMenu.menuItemNames.value.state.name;
                            stateBindingName = scope.attributes.toolbar.rightMenu.menuItemNames.value.state.binding;
                            break;
                    }
                    bridge = optionsType === 'static' ? '.menuItems.value' : '.'+dynamicBridge;
                    for ( var i = 0; i < levels.length; i++ ) {
                        if ( i === 0 ) {
                            stateElement = stateElement + '['+ levels[i] + ']';
                        } else {
                            stateElement = stateElement + bridge + '['+ levels[i] + ']';
                        }
                    }
                    switch ( side ) {
                        case 'left':
                            if ( optionsType === 'dynamic' ) {
                                stateObject = eval('scope.$parent_scope.'+scopeSource+stateElement+'.'+stateName);
                            } else {
                                stateObject = eval('scope.attributes.toolbar.leftMenu.menuItems.value'+stateElement).state;
                            }
                            break;
                        case 'right':
                            if ( optionsType === 'dynamic' ) {
                                stateObject = eval('scope.$parent_scope.'+scopeSource+stateElement+'.'+stateName);
                            } else {
                                stateObject = eval('scope.attributes.toolbar.rightMenu.menuItems.value'+stateElement).state;
                            }
                            break;
                    }
                    if (optionsType==='static') {
                        if ( stateObject.binding === 'true' || stateObject.binding === 'false' ) {
                            stateObject.binding = stateObject.binding === 'true' ? 'false' : 'true';
                        } else {
                            if ( scope.$parent_scope[stateObject.binding] === 'true' || scope.$parent_scope[stateObject.binding] === 'false' ) {
                                scope.$parent_scope[stateObject.binding] = scope.$parent_scope[stateObject.binding] === 'true' ? 'false' : 'true';
                            } else if ( typeof scope.$parent_scope[stateObject.binding] === 'boolean' ) {
                                scope.$parent_scope[stateObject.binding] = scope.$parent_scope[stateObject.binding] ? false : true;
                            }
                        }
                    } else {
                        scope.$parent_scope[stateObject[stateBindingName]] = scope.$parent_scope[stateObject[stateBindingName]] ? false : true;
                    }
                }

                var buildNextLevel = function( nextLevel, road, side, optionsType ) {
                    if ( optionsType === 'static' ) {
                        for ( var i = 0; i < nextLevel.length; i++ ) {
                            if ( nextLevel[i].menuItems.value.length > 0 ) {
                                var iconbarItem = iconbarMenuItem.replace('{{itemDisplay}}', typeof nextLevel[i].display === 'string' ? nextLevel[i].display.replace(/"/g, '\'') : nextLevel[i].display);
                                scope.iconBar = scope.iconBar + iconbarItem + '<md-menu>';
                                createDfxMenuItem( nextLevel[i], 'singleMenuItem', road, i, side, optionsType );
                                buildNextLevel( nextLevel[i].menuItems.value, road + ',' + i, side, optionsType );
                                scope.iconBar = scope.iconBar + '</md-menu-content></md-menu></md-menu-item>';
                            } else {
                                if ( nextLevel[i].divider === true ) {
                                    scope.iconBar = scope.iconBar + '<md-menu-divider></md-menu-divider>';
                                } else if ( nextLevel[i].title === true ) {
                                    scope.iconBar = scope.iconBar + '<md-menu-item class="tree-menu-title"><div>{{'+nextLevel[i].label+'}}'+'</div></md-menu-item>';
                                } else {
                                    var iconbarItem = iconbarMenuItem.replace('{{itemDisplay}}', typeof nextLevel[i].display === 'string' ? nextLevel[i].display.replace(/"/g, '\'') : nextLevel[i].display);
                                    scope.iconBar = scope.iconBar + iconbarItem;
                                    createDfxMenuItem( nextLevel[i], 'singleMenuItem', road, i, side, optionsType );
                                }
                            }
                        }
                    } else {
                        for ( var i = 0; i < nextLevel.length; i++ ) {
                            if ( nextLevel[i][scope.itemNames.main.scopeItems] && nextLevel[i][scope.itemNames.main.scopeItems].length > 0 ) {
                                var iconbarItem = iconbarMenuItem.replace('{{itemDisplay}}', nextLevel[i][scope.itemNames.main.display]);
                                scope.iconBar = scope.iconBar + iconbarItem + '<md-menu>';
                                createDfxMenuItem( nextLevel[i], 'singleMenuItem', road, i, side, optionsType );
                                buildNextLevel( nextLevel[i][scope.itemNames.main.scopeItems], road + ',' + i, side, optionsType );
                                scope.iconBar = scope.iconBar + '</md-menu-content></md-menu></md-menu-item>';
                            }else {
                                if ( nextLevel[i][scope.itemNames.main.type] === 'divider' ) {
                                    scope.iconBar = scope.iconBar + '<md-menu-divider></md-menu-divider>';
                                } else if ( nextLevel[i][scope.itemNames.main.type] === 'title' ) {
                                    scope.iconBar = scope.iconBar + '<md-menu-item class="tree-menu-title"><div>{{\''+nextLevel[i][scope.itemNames.main.label]+'\'}}</div></md-menu-item>';
                                } else {
                                    var iconbarItem = iconbarMenuItem.replace('{{itemDisplay}}', nextLevel[i][scope.itemNames.main.display]);
                                    scope.iconBar = scope.iconBar + iconbarItem;
                                    createDfxMenuItem( nextLevel[i], 'singleMenuItem', road, i, side, optionsType );
                                }
                            }
                        }
                    }
                }

                var createDfxMenuItem = function( dfxMenuItem, type, level, index, side, optionsType ) {
                    if (optionsType === 'static'){
                        if ( typeof dfxMenuItem.icon === 'string' ) {
                            var tempIcon = dfxMenuItem.icon;
                            dfxMenuItem.icon = {
                                "value": tempIcon,
                                "type":  dfxMenuItem.hasOwnProperty('iconType') ? dfxMenuItem.iconType : 'fa-icon'
                            }
                        }
                        var tempPropObject = {};
                        tempPropObject.faIcon =                 dfxMenuItem.icon.value.indexOf("'") == -1 ? '{{'+dfxMenuItem.icon.value+'}}' : eval(dfxMenuItem.icon.value);
                        tempPropObject.svgIcon =                dfxMenuItem.icon.value.indexOf("'") == -1 ? '{{'+dfxMenuItem.icon.value+'}}' : eval(dfxMenuItem.icon.value);
                        tempPropObject.faItemIndex =            level >= 0 ? level + ',' + index : index;
                        tempPropObject.itemLabel =              '{{'+dfxMenuItem.label+'}}';
                        tempPropObject.itemIndex =              level || level >= 0 ? level + ',' + index : index;
                        tempPropObject.itemDisabled =           dfxMenuItem.disabled;
                        tempPropObject.itemDisplay =            typeof dfxMenuItem.display === 'string' ? dfxMenuItem.display.replace(/"/g, '\'') : dfxMenuItem.display;
                        tempPropObject.itemClick =              dfxMenuItem.menuItems.value.length > 0 ? '$mdOpenMenu();'+dfxMenuItem.onclick : 'unfocusButton($event);'+dfxMenuItem.onclick;
                        if ( type === 'singleMenuItem' ) {
                            tempPropObject.itemShortcut =       dfxMenuItem.shortcut;
                            tempPropObject.ifItemNotification = dfxMenuItem.notification !=='' ? true : false;
                            tempPropObject.itemNotification =   '{{'+dfxMenuItem.notification+'}}';
                        }
                        if ( toolbarType==='iconBar' ) {
                            if ( dfxMenuItem.hasOwnProperty('waiting')) { delete dfxMenuItem.waiting; }
                            if ( !dfxMenuItem.state.value ) {
                                // dfxMenuItem.state = {
                                //     "value":           false,
                                //     "binding":         "true",
                                //     "checkedIcon":   { "value": "'thumb_up'", "type": "svg-icon", "style": "", "class": "" },
                                //     "uncheckedIcon": { "value": "'thumb_down'", "type": "svg-icon", "style": "", "class": "" }
                                // };
                                tempPropObject.notState =               true;
                                tempPropObject.isState =                false;
                                tempPropObject.ifFaIcon =               dfxMenuItem.icon.value !=='' && dfxMenuItem.icon.type === 'fa-icon' ? true : false;
                                tempPropObject.ifSvgIcon =              dfxMenuItem.icon.value !=='' && dfxMenuItem.icon.type === 'svg-icon' ? true : false;
                                if ( dfxMenuItem.menuItems.value.length > 0 ) {
                                    tempPropObject.itemClick = '$mdOpenMenu();'+dfxMenuItem.onclick;
                                } else {
                                    tempPropObject.itemClick = 'unfocusButton($event);'+dfxMenuItem.onclick;
                                }
                            } else {
                                tempPropObject.notState =                   false;
                                tempPropObject.isState =                    true;
                                tempPropObject.trueState =                  dfxMenuItem.state.binding;
                                tempPropObject.falseState =                 dfxMenuItem.state.binding;
                                tempPropObject.ifTrueStateFaIcon =          dfxMenuItem.state.checkedIcon.value.length > 0 && dfxMenuItem.state.checkedIcon.type === 'fa-icon' && dfxMenuItem.state.value ? true : false;
                                tempPropObject.ifFalseStateFaIcon =         dfxMenuItem.state.uncheckedIcon.value.length > 0 && dfxMenuItem.state.uncheckedIcon.type === 'fa-icon' && dfxMenuItem.state.value ? true : false;
                                tempPropObject.ifTrueStateSvgIcon =         dfxMenuItem.state.checkedIcon.value.length > 0 && dfxMenuItem.state.checkedIcon.type === 'svg-icon' && dfxMenuItem.state.value ? true : false;
                                tempPropObject.ifFalseStateSvgIcon =        dfxMenuItem.state.uncheckedIcon.value.length > 0 && dfxMenuItem.state.uncheckedIcon.type === 'svg-icon' && dfxMenuItem.state.value ? true : false;
                                tempPropObject.trueStateFaIcon =            dfxMenuItem.state.checkedIcon.value.indexOf("'") == -1 ? '{{'+dfxMenuItem.state.checkedIcon.value+'}}' : eval(dfxMenuItem.state.checkedIcon.value);
                                tempPropObject.falseStateFaIcon =           dfxMenuItem.state.uncheckedIcon.value.indexOf("'") == -1 ? '{{'+dfxMenuItem.state.uncheckedIcon.value+'}}' : eval(dfxMenuItem.state.uncheckedIcon.value);
                                tempPropObject.trueStateSvgIcon =           dfxMenuItem.state.checkedIcon.value.indexOf("'") == -1 ? '{{'+dfxMenuItem.state.checkedIcon.value+'}}' : eval(dfxMenuItem.state.checkedIcon.value);
                                tempPropObject.falseStateSvgIcon =          dfxMenuItem.state.uncheckedIcon.value.indexOf("'") == -1 ? '{{'+dfxMenuItem.state.uncheckedIcon.value+'}}' : eval(dfxMenuItem.state.uncheckedIcon.value);
                                tempPropObject.trueStateFaIconStyle =       dfxMenuItem.state.checkedIcon.style;
                                tempPropObject.falseStateFaIconStyle =      dfxMenuItem.state.uncheckedIcon.style;
                                tempPropObject.trueStateSvgIconStyle =      dfxMenuItem.state.checkedIcon.style;
                                tempPropObject.falseStateSvgIconStyle =     dfxMenuItem.state.uncheckedIcon.style;
                                tempPropObject.trueStateFaIconClass =       dfxMenuItem.state.checkedIcon.class;
                                tempPropObject.falseStateFaIconClass =      dfxMenuItem.state.uncheckedIcon.class;
                                tempPropObject.trueStateSvgIconClass =      dfxMenuItem.state.checkedIcon.class;
                                tempPropObject.falseStateSvgIconClass =     dfxMenuItem.state.uncheckedIcon.class;
                                if ( dfxMenuItem.menuItems.value.length > 0 ) {
                                    tempPropObject.itemClick = dfxMenuItem.state.value ? '$mdOpenMenu();changeState('+"'"+tempPropObject.itemIndex+"'"+', $event, '+"'"+side+"'"+', '+"'"+optionsType+"'"+');'+dfxMenuItem.onclick : '$mdOpenMenu();'+dfxMenuItem.onclick;
                                } else {
                                    tempPropObject.itemClick = dfxMenuItem.state.value ? 'changeState('+"'"+tempPropObject.itemIndex+"'"+', $event, '+"'"+side+"'"+', '+"'"+optionsType+"'"+');unfocusButton($event);'+dfxMenuItem.onclick : 'unfocusButton($event);'+dfxMenuItem.onclick;
                                }
                            }
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
                                tempPropObject.isAutoDisabled =        dfxMenuItem.waiting.autoDisabled.length>0 ? dfxMenuItem.waiting.autoDisabled : false;
                                tempPropObject.ifWaitClass =           dfxMenuItem.waiting.value.length>0 ? dfxMenuItem.waiting.value : false;
                                tempPropObject.ifNotWait =             dfxMenuItem.waiting.value.length>0 ? dfxMenuItem.waiting.value : false;
                                tempPropObject.ifWait =                dfxMenuItem.waiting.value.length>0 ? dfxMenuItem.waiting.value : false;
                                tempPropObject.ifFaIcon =              dfxMenuItem.icon.value.length > 0 && dfxMenuItem.icon.type === 'fa-icon' ? true : false;
                                tempPropObject.ifSvgIcon =             dfxMenuItem.icon.value.length > 0 && dfxMenuItem.icon.type === 'svg-icon' ? true : false;
                                tempPropObject.ifWaitFaIcon =          dfxMenuItem.waiting.icon.value.length > 0 && dfxMenuItem.waiting.icon.type === 'fa-icon' ? true : false;
                                tempPropObject.ifWaitSvgIcon =         dfxMenuItem.waiting.icon.value.length > 0 && dfxMenuItem.waiting.icon.type === 'svg-icon' ? true : false;
                                tempPropObject.waitFaIcon =            dfxMenuItem.waiting.icon.value.indexOf("'") == -1 ? 'fa-spinner' : eval(dfxMenuItem.waiting.icon.value);
                                tempPropObject.waitSvgIcon =           dfxMenuItem.waiting.icon.value.indexOf("'") == -1 ? 'track_changes' : eval(dfxMenuItem.waiting.icon.value);
                                tempPropObject.waitFaIconStyle =       dfxMenuItem.waiting.icon.style;
                                tempPropObject.waitSvgIconStyle =      dfxMenuItem.waiting.icon.style;
                                tempPropObject.waitFaIconClass =       dfxMenuItem.waiting.icon.class;
                                tempPropObject.waitSvgIconClass =      dfxMenuItem.waiting.icon.class;
                            }
                        }
                    } else {
                        var tempPropObject = {};
                        tempPropObject.faIcon =                 dfxMenuItem[scope.itemNames.main.icon.value] ? '{{\''+dfxMenuItem[scope.itemNames.main.icon.value][scope.itemNames.main.icon.name]+'\'}}' : '';
                        tempPropObject.svgIcon =                dfxMenuItem[scope.itemNames.main.icon.value] ? '{{\''+dfxMenuItem[scope.itemNames.main.icon.value][scope.itemNames.main.icon.name]+'\'}}' : '';
                        tempPropObject.faItemIndex =            level >= 0 ? level + ',' + index : index;
                        tempPropObject.itemLabel =              dfxMenuItem[scope.itemNames.main.label] ? '{{\''+dfxMenuItem[scope.itemNames.main.label]+'\'}}' : '';
                        tempPropObject.itemIndex =              level || level >= 0 ? level + ',' + index : index;
                        tempPropObject.itemDisabled =           dfxMenuItem[scope.itemNames.main.disabled] ? dfxMenuItem[scope.itemNames.main.disabled] : false;
                        tempPropObject.itemDisplay =            dfxMenuItem[scope.itemNames.main.display] ? dfxMenuItem[scope.itemNames.main.display] : true;
                        tempPropObject.itemClick =              dfxMenuItem[scope.itemNames.main.scopeItems] && dfxMenuItem[scope.itemNames.main.scopeItems].length > 0 ? '$mdOpenMenu();'+(dfxMenuItem[scope.itemNames.main.onclick] ? dfxMenuItem[scope.itemNames.main.onclick] : '') : 'unfocusButton($event);'+(dfxMenuItem[scope.itemNames.main.onclick] ? dfxMenuItem[scope.itemNames.main.onclick] : '');
                        if ( type === 'singleMenuItem' ) {
                            tempPropObject.itemShortcut =       dfxMenuItem[scope.itemNames.main.shortcut];
                            tempPropObject.ifItemNotification = dfxMenuItem[scope.itemNames.main.notification] !=='' ? true : false;
                            tempPropObject.itemNotification =   '{{\''+dfxMenuItem[scope.itemNames.main.notification]+'\'}}';
                        }
                        if ( toolbarType==='iconBar' ) {
                            // if ( dfxMenuItem.hasOwnProperty('waiting')) { delete dfxMenuItem.waiting; }
                            if ( scope.itemNames.state && dfxMenuItem.hasOwnProperty(scope.itemNames.state.name) ) {

                                tempPropObject.notState =               false;
                                tempPropObject.isState =                true;
                                tempPropObject.trueState =              dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.binding];
                                tempPropObject.falseState =             dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.binding];
                                tempPropObject.ifFaIcon =               false;
                                tempPropObject.ifSvgIcon =              false;
                                tempPropObject.ifTrueStateFaIcon =      dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.checkedIcon.value] && dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.checkedIcon.value][scope.itemNames.state.checkedIcon.name].length > 0 && dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.checkedIcon.value][scope.itemNames.state.checkedIcon.type] === 'fa-icon' ? true : false;
                                tempPropObject.ifTrueStateSvgIcon =     dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.checkedIcon.value] && dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.checkedIcon.value][scope.itemNames.state.checkedIcon.name].length > 0 && dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.checkedIcon.value][scope.itemNames.state.checkedIcon.type] === 'svg-icon' ? true : false;
                                tempPropObject.ifFalseStateFaIcon =     dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.uncheckedIcon.value] && dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.uncheckedIcon.value][scope.itemNames.state.uncheckedIcon.name].length > 0 && dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.uncheckedIcon.value][scope.itemNames.state.uncheckedIcon.type] === 'fa-icon' ? true : false;
                                tempPropObject.ifFalseStateSvgIcon =    dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.uncheckedIcon.value] && dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.uncheckedIcon.value][scope.itemNames.state.uncheckedIcon.name].length > 0 && dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.uncheckedIcon.value][scope.itemNames.state.uncheckedIcon.type] === 'svg-icon' ? true : false;
                                tempPropObject.trueStateFaIcon =        dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.checkedIcon.value] ? '{{\''+dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.checkedIcon.value][scope.itemNames.state.checkedIcon.name]+'\'}}' : '';
                                tempPropObject.falseStateFaIcon =       dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.uncheckedIcon.value] ? '{{\''+dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.uncheckedIcon.value][scope.itemNames.state.uncheckedIcon.name]+'\'}}' : '';
                                tempPropObject.trueStateSvgIcon =       dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.checkedIcon.value] ? '{{\''+dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.checkedIcon.value][scope.itemNames.state.checkedIcon.name]+'\'}}' : '';
                                tempPropObject.falseStateSvgIcon =      dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.uncheckedIcon.value] ? '{{\''+dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.uncheckedIcon.value][scope.itemNames.state.uncheckedIcon.name]+'\'}}' : '';
                                tempPropObject.trueStateFaIconStyle =   dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.checkedIcon.value] && dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.checkedIcon.value][scope.itemNames.state.checkedIcon.style];
                                tempPropObject.falseStateFaIconStyle =  dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.uncheckedIcon.value] && dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.uncheckedIcon.value][scope.itemNames.state.uncheckedIcon.style];
                                tempPropObject.trueStateSvgIconStyle =  dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.checkedIcon.value] && dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.checkedIcon.value][scope.itemNames.state.checkedIcon.style];
                                tempPropObject.falseStateSvgIconStyle = dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.uncheckedIcon.value] && dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.uncheckedIcon.value][scope.itemNames.state.uncheckedIcon.style];
                                tempPropObject.trueStateFaIconClass =   dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.checkedIcon.value] && dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.checkedIcon.value][scope.itemNames.state.checkedIcon.class];
                                tempPropObject.falseStateFaIconClass =  dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.uncheckedIcon.value] && dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.uncheckedIcon.value][scope.itemNames.state.uncheckedIcon.class];
                                tempPropObject.trueStateSvgIconClass =  dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.checkedIcon.value] && dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.checkedIcon.value][scope.itemNames.state.checkedIcon.class];
                                tempPropObject.falseStateSvgIconClass = dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.uncheckedIcon.value] && dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.uncheckedIcon.value][scope.itemNames.state.uncheckedIcon.class];
                                if ( dfxMenuItem[scope.itemNames.main.scopeItems] && dfxMenuItem[scope.itemNames.main.scopeItems].length > 0 ) {
                                    tempPropObject.itemClick = dfxMenuItem[scope.itemNames.state.binding] !=='' ? '$mdOpenMenu();changeState('+"'"+tempPropObject.itemIndex+"'"+', $event, '+"'"+side+"'"+', '+"'"+optionsType+"'"+');'+ (dfxMenuItem[scope.itemNames.main.onclick] ? dfxMenuItem[scope.itemNames.main.onclick] : '') : '$mdOpenMenu();'+(dfxMenuItem[scope.itemNames.main.onclick] ? dfxMenuItem[scope.itemNames.main.onclick] : '');
                                } else {
                                    tempPropObject.itemClick = dfxMenuItem[scope.itemNames.state.binding] !=='' ? 'changeState('+"'"+tempPropObject.itemIndex+"'"+', $event, '+"'"+side+"'"+', '+"'"+optionsType+"'"+');unfocusButton($event);'+(dfxMenuItem[scope.itemNames.main.onclick] ? dfxMenuItem[scope.itemNames.main.onclick] : '') : 'unfocusButton($event);'+(dfxMenuItem[scope.itemNames.main.onclick] ? dfxMenuItem[scope.itemNames.main.onclick] : '');
                                }
                            } else {
                                tempPropObject.notState =               true;
                                tempPropObject.isState =                false;
                                tempPropObject.ifFaIcon =               dfxMenuItem[scope.itemNames.main.icon.value] && dfxMenuItem[scope.itemNames.main.icon.value][scope.itemNames.main.icon.type] === 'fa-icon' ? true : false;
                                tempPropObject.ifSvgIcon =              dfxMenuItem[scope.itemNames.main.icon.value] && dfxMenuItem[scope.itemNames.main.icon.value][scope.itemNames.main.icon.type] === 'svg-icon' ? true : false;
                                tempPropObject.ifStateFaIcon =          false;
                                tempPropObject.ifStateSvgIcon =         false;
                                if ( dfxMenuItem[scope.itemNames.main.scopeItems] && dfxMenuItem[scope.itemNames.main.scopeItems].length > 0 ) {
                                    tempPropObject.itemClick = dfxMenuItem[scope.itemNames.main.onclick] ? '$mdOpenMenu();'+dfxMenuItem[scope.itemNames.main.onclick] : '$mdOpenMenu();';
                                } else {
                                    tempPropObject.itemClick = dfxMenuItem[scope.itemNames.main.onclick] ? 'unfocusButton($event);'+dfxMenuItem[scope.itemNames.main.onclick] : 'unfocusButton($event);';
                                }
                            }
                        } else if (  toolbarType==='buttons' ) {
                            scope.waitableItem = { "value": false };
                            // if ( dfxMenuItem.hasOwnProperty('state')) { delete dfxMenuItem.state; }
                            if ( typeof level === 'undefined' ) {
                                scope.waitableItem.value = true;
                            } else {
                                scope.waitableItem.value = false;
                                // if ( dfxMenuItem.hasOwnProperty('waiting')) { delete dfxMenuItem.waiting; }
                            }
                            tempPropObject.ifFaIcon =              dfxMenuItem[scope.itemNames.main.icon.value] && dfxMenuItem[scope.itemNames.main.icon.value][scope.itemNames.main.icon.name].length > 0 && dfxMenuItem[scope.itemNames.main.icon.value][scope.itemNames.main.icon.type] === 'fa-icon' ? true : false;
                            tempPropObject.ifSvgIcon =             dfxMenuItem[scope.itemNames.main.icon.value] && dfxMenuItem[scope.itemNames.main.icon.value][scope.itemNames.main.icon.name].length > 0 && dfxMenuItem[scope.itemNames.main.icon.value][scope.itemNames.main.icon.type] === 'svg-icon' ? true : false;
                            if ( type === 'rootMenuItem' ) {
                                if (dfxMenuItem.hasOwnProperty(scope.itemNames.waiting.name)) {
                                    tempPropObject.ifFaIcon =              dfxMenuItem[scope.itemNames.main.icon.value] && dfxMenuItem[scope.itemNames.main.icon.value][scope.itemNames.main.icon.name].length > 0 && dfxMenuItem[scope.itemNames.main.icon.value][scope.itemNames.main.icon.type] === 'fa-icon' ? true : false;
                                    tempPropObject.ifSvgIcon =             dfxMenuItem[scope.itemNames.main.icon.value] && dfxMenuItem[scope.itemNames.main.icon.value][scope.itemNames.main.icon.name].length > 0 && dfxMenuItem[scope.itemNames.main.icon.value][scope.itemNames.main.icon.type] === 'svg-icon' ? true : false;
                                    tempPropObject.isAutoDisabled =        dfxMenuItem[scope.itemNames.waiting.name][scope.itemNames.waiting.binding] && dfxMenuItem[scope.itemNames.waiting.name][scope.itemNames.waiting.autoDisabled] && dfxMenuItem[scope.itemNames.waiting.name][scope.itemNames.waiting.autoDisabled].length>0 ? dfxMenuItem[scope.itemNames.waiting.name][scope.itemNames.waiting.autoDisabled] : false;
                                    tempPropObject.ifWaitClass =           dfxMenuItem[scope.itemNames.waiting.name][scope.itemNames.waiting.binding] && dfxMenuItem[scope.itemNames.waiting.name][scope.itemNames.waiting.binding].length>0 ? dfxMenuItem[scope.itemNames.waiting.name][scope.itemNames.waiting.binding] : false;
                                    tempPropObject.ifNotWait =             dfxMenuItem[scope.itemNames.waiting.name][scope.itemNames.waiting.binding] && dfxMenuItem[scope.itemNames.waiting.name][scope.itemNames.waiting.binding].length>0 ? dfxMenuItem[scope.itemNames.waiting.name][scope.itemNames.waiting.binding] : false;
                                    tempPropObject.ifWait =                dfxMenuItem[scope.itemNames.waiting.name][scope.itemNames.waiting.binding] && dfxMenuItem[scope.itemNames.waiting.name][scope.itemNames.waiting.binding].length>0 ? dfxMenuItem[scope.itemNames.waiting.name][scope.itemNames.waiting.binding] : false;
                                    tempPropObject.ifWaitFaIcon =          dfxMenuItem[scope.itemNames.waiting.name][scope.itemNames.waiting.icon.value] && dfxMenuItem[scope.itemNames.waiting.name][scope.itemNames.waiting.icon.value][scope.itemNames.waiting.icon.name].length > 0 && dfxMenuItem[scope.itemNames.waiting.name][scope.itemNames.waiting.icon.value][scope.itemNames.waiting.icon.type] === 'fa-icon' ? true : false;
                                    tempPropObject.ifWaitSvgIcon =         dfxMenuItem[scope.itemNames.waiting.name][scope.itemNames.waiting.icon.value] && dfxMenuItem[scope.itemNames.waiting.name][scope.itemNames.waiting.icon.value][scope.itemNames.waiting.icon.name].length > 0 && dfxMenuItem[scope.itemNames.waiting.name][scope.itemNames.waiting.icon.value][scope.itemNames.waiting.icon.type] === 'svg-icon' ? true : false;
                                    tempPropObject.waitFaIcon =            dfxMenuItem[scope.itemNames.waiting.name][scope.itemNames.waiting.icon.value] && dfxMenuItem[scope.itemNames.waiting.name][scope.itemNames.waiting.icon.value][scope.itemNames.waiting.icon.name].indexOf("'") == -1 ? 'fa-spinner' : (dfxMenuItem[scope.itemNames.waiting.name][scope.itemNames.waiting.icon.value] ? eval(dfxMenuItem[scope.itemNames.waiting.name][scope.itemNames.waiting.icon.value][scope.itemNames.waiting.icon.name]) : '');
                                    tempPropObject.waitSvgIcon =           dfxMenuItem[scope.itemNames.waiting.name][scope.itemNames.waiting.icon.value] && dfxMenuItem[scope.itemNames.waiting.name][scope.itemNames.waiting.icon.value][scope.itemNames.waiting.icon.name].indexOf("'") == -1 ? 'track_changes' : (dfxMenuItem[scope.itemNames.waiting.name][scope.itemNames.waiting.icon.value] ? eval(dfxMenuItem[scope.itemNames.waiting.name][scope.itemNames.waiting.icon.value][scope.itemNames.waiting.icon.name]) : '');
                                    tempPropObject.waitFaIconStyle =       dfxMenuItem[scope.itemNames.waiting.name][scope.itemNames.waiting.icon.value] && dfxMenuItem[scope.itemNames.waiting.name][scope.itemNames.waiting.icon.value][scope.itemNames.waiting.icon.style];
                                    tempPropObject.waitSvgIconStyle =      dfxMenuItem[scope.itemNames.waiting.name][scope.itemNames.waiting.icon.value] && dfxMenuItem[scope.itemNames.waiting.name][scope.itemNames.waiting.icon.value][scope.itemNames.waiting.icon.style];
                                    tempPropObject.waitFaIconClass =       dfxMenuItem[scope.itemNames.waiting.name][scope.itemNames.waiting.icon.value] && dfxMenuItem[scope.itemNames.waiting.name][scope.itemNames.waiting.icon.value][scope.itemNames.waiting.icon.class];
                                    tempPropObject.waitSvgIconClass =      dfxMenuItem[scope.itemNames.waiting.name][scope.itemNames.waiting.icon.value] && dfxMenuItem[scope.itemNames.waiting.name][scope.itemNames.waiting.icon.value][scope.itemNames.waiting.icon.class];
                                }
                            }
                        }
                    }
                    var tempMenu = '';
                    if ( type === 'singleMenuItem' ) {
                        tempMenu = singleMenuItem
                            .replace('{{notState}}',                tempPropObject.notState )
                            .replace('{{isState}}',                 tempPropObject.isState )
                            .replace('{{trueState}}',               tempPropObject.trueState )
                            .replace('{{falseState}}',              tempPropObject.falseState )
                            .replace('{{ifFaIcon}}',                tempPropObject.ifFaIcon )
                            .replace('{{ifSvgIcon}}',               tempPropObject.ifSvgIcon )
                            .replace('{{ifTrueStateFaIcon}}',       tempPropObject.ifTrueStateFaIcon )
                            .replace('{{ifFalseStateFaIcon}}',      tempPropObject.ifFalseStateFaIcon )
                            .replace('{{ifTrueStateSvgIcon}}',      tempPropObject.ifTrueStateSvgIcon )
                            .replace('{{ifFalseStateSvgIcon}}',     tempPropObject.ifFalseStateSvgIcon )
                            .replace('{{faIcon}}',                  tempPropObject.faIcon )
                            .replace('{{svgIcon}}',                 tempPropObject.svgIcon )
                            .replace('{{trueStateFaIcon}}',         tempPropObject.trueStateFaIcon )
                            .replace('{{falseStateFaIcon}}',        tempPropObject.falseStateFaIcon )
                            .replace('{{trueStateSvgIcon}}',        tempPropObject.trueStateSvgIcon )
                            .replace('{{falseStateSvgIcon}}',       tempPropObject.falseStateSvgIcon )
                            .replace('{{trueStateFaIconStyle}}',    tempPropObject.trueStateFaIconStyle )
                            .replace('{{falseStateFaIconStyle}}',   tempPropObject.falseStateFaIconStyle )
                            .replace('{{trueStateSvgIconStyle}}',   tempPropObject.trueStateSvgIconStyle )
                            .replace('{{falseStateSvgIconStyle}}',  tempPropObject.falseStateSvgIconStyle )
                            .replace('{{trueStateFaIconClass}}',    tempPropObject.trueStateFaIconClass )
                            .replace('{{falseStateFaIconClass}}',   tempPropObject.falseStateFaIconClass )
                            .replace('{{trueStateSvgIconClass}}',   tempPropObject.trueStateSvgIconClass )
                            .replace('{{falseStateSvgIconClass}}',  tempPropObject.falseStateSvgIconClass )
                            .replace('{{itemLabel}}',               tempPropObject.itemLabel )
                            .replace('{{itemShortcut}}',            tempPropObject.itemShortcut )
                            .replace('{{ifItemNotification}}',      tempPropObject.ifItemNotification )
                            .replace('{{itemNotification}}',        tempPropObject.itemNotification )
                            .replace('{{itemIndex}}',               tempPropObject.itemIndex )
                            .replace('{{itemDisplay}}',             tempPropObject.itemDisplay )
                            .replace('{{itemDisabled}}',            tempPropObject.itemDisabled )
                            .replace('{{itemClick}}',               tempPropObject.itemClick );
                    } else {
                        tempMenu = scope.rootMenuItem
                            .replace('{{notState}}',                tempPropObject.notState )
                            .replace('{{isState}}',                 tempPropObject.isState )
                            .replace('{{trueState}}',               tempPropObject.trueState )
                            .replace('{{falseState}}',              tempPropObject.falseState )
                            .replace('{{ifFaIcon}}',                tempPropObject.ifFaIcon )
                            .replace('{{ifSvgIcon}}',               tempPropObject.ifSvgIcon )
                            .replace('{{ifTrueStateFaIcon}}',       tempPropObject.ifTrueStateFaIcon )
                            .replace('{{ifFalseStateFaIcon}}',      tempPropObject.ifFalseStateFaIcon )
                            .replace('{{ifTrueStateSvgIcon}}',      tempPropObject.ifTrueStateSvgIcon )
                            .replace('{{ifFalseStateSvgIcon}}',     tempPropObject.ifFalseStateSvgIcon )
                            .replace('{{ifWaitFaIcon}}',            tempPropObject.ifWaitFaIcon )
                            .replace('{{ifWaitSvgIcon}}',           tempPropObject.ifWaitSvgIcon )
                            .replace('{{faIcon}}',                  tempPropObject.faIcon )
                            .replace('{{svgIcon}}',                 tempPropObject.svgIcon )
                            .replace('{{trueStateFaIcon}}',         tempPropObject.trueStateFaIcon )
                            .replace('{{falseStateFaIcon}}',        tempPropObject.falseStateFaIcon )
                            .replace('{{trueStateSvgIcon}}',        tempPropObject.trueStateSvgIcon )
                            .replace('{{falseStateSvgIcon}}',       tempPropObject.falseStateSvgIcon )
                            .replace('{{trueStateFaIconStyle}}',    tempPropObject.trueStateFaIconStyle )
                            .replace('{{falseStateFaIconStyle}}',   tempPropObject.falseStateFaIconStyle )
                            .replace('{{trueStateSvgIconStyle}}',   tempPropObject.trueStateSvgIconStyle )
                            .replace('{{falseStateSvgIconStyle}}',  tempPropObject.falseStateSvgIconStyle )
                            .replace('{{trueStateFaIconClass}}',    tempPropObject.trueStateFaIconClass )
                            .replace('{{falseStateFaIconClass}}',   tempPropObject.falseStateFaIconClass )
                            .replace('{{trueStateSvgIconClass}}',   tempPropObject.trueStateSvgIconClass )
                            .replace('{{falseStateSvgIconClass}}',  tempPropObject.falseStateSvgIconClass )
                            .replace('{{isAutoDisabled}}',          tempPropObject.isAutoDisabled )
                            .replace('{{ifNotWait}}',               tempPropObject.ifNotWait )
                            .replace('{{ifWait}}',                  tempPropObject.ifWait )
                            .replace('{{ifWaitClass}}',             tempPropObject.ifWaitClass )
                            .replace('{{waitFaIcon}}',              tempPropObject.waitFaIcon )
                            .replace('{{waitSvgIcon}}',             tempPropObject.waitSvgIcon )
                            .replace('{{waitFaIconStyle}}',         tempPropObject.waitFaIconStyle )
                            .replace('{{waitSvgIconStyle}}',        tempPropObject.waitSvgIconStyle )
                            .replace('{{waitFaIconClass}}',         tempPropObject.waitFaIconClass )
                            .replace('{{waitSvgIconClass}}',        tempPropObject.waitSvgIconClass )
                            .replace('{{itemLabel}}',               tempPropObject.itemLabel )
                            .replace('{{itemIndex}}',               tempPropObject.itemIndex )
                            .replace('{{itemDisplay}}',             tempPropObject.itemDisplay )
                            .replace('{{itemDisabled}}',            tempPropObject.itemDisabled )
                            .replace('{{itemClick}}',               tempPropObject.itemClick );
                    }
                    if (optionsType === 'static'){
                        if ( dfxMenuItem.menuItems.value.length > 0 ) {
                            scope.iconBar = scope.iconBar + tempMenu +'<md-menu-content width="4">';
                        } else {
                            if ( type === 'singleMenuItem' ) {
                                scope.iconBar = scope.iconBar + tempMenu + '</md-menu-item>';
                            } else {
                                scope.iconBar = scope.iconBar + tempMenu + '<md-menu-content width="4"></md-menu-content>';
                            }
                        }
                    } else {
                        if ( dfxMenuItem[scope.itemNames.main.scopeItems] && dfxMenuItem[scope.itemNames.main.scopeItems].length > 0 ) {
                            scope.iconBar = scope.iconBar + tempMenu +'<md-menu-content width="4">';
                        } else {
                            if ( type === 'singleMenuItem' ) {
                                scope.iconBar = scope.iconBar + tempMenu + '</md-menu-item>';
                            } else {
                                scope.iconBar = scope.iconBar + tempMenu + '<md-menu-content width="4"></md-menu-content>';
                            }
                        }
                    }
                }

                scope.iconbarBuilder = function( side ) {
                    $timeout(function() {
                        if ( side === 'left' ) {
                            if ( scope.attributes.toolbar.leftMenu.menuItemsType.value === 'dynamic' ) {
                                scope.itemNames = scope.attributes.toolbar.leftMenu.menuItemNames.value;
                                scope.iconbarArray = scope.$parent_scope[scope.itemNames.main.source];
                            } else {
                                scope.iconbarArray = scope.attributes.toolbar.leftMenu.menuItems.value;
                            }
                            if ( scope.attributes.toolbar.leftMenu.type.value === 'Icon Bar' ) {
                                toolbarType='iconBar';
                                scope.leftRootMenuItem = '<button ng-click="{{itemClick}}" ng-show="{{itemDisplay}}" menu-index="{{itemIndex}}" ng-disabled="{{itemDisabled}}" style="{{attributes.toolbar.leftMenu.iconBar.triggerButton.style}}" aria-label="md-icon-button" class="md-icon-button {{attributes.toolbar.leftMenu.iconBar.triggerButton.class}}">'+
                                    '<i ng-if="{{notState}}">'+
                                        '<md-icon ng-if="{{ifFaIcon}}" class="fa {{faIcon}} dfx-core-gc-toolbar-left-menu-iconbar {{attributes.toolbar.leftMenu.iconBar.triggerButton.icon.class}}" style="font-size:{{attributes.toolbar.leftMenu.iconBar.triggerButton.icon.size}}px; {{attributes.toolbar.leftMenu.iconBar.triggerButton.icon.style}}"></md-icon>'+
                                        '<ng-md-icon ng-if="{{ifSvgIcon}}" icon="{{svgIcon}}" size="{{attributes.toolbar.leftMenu.iconBar.triggerButton.icon.size}}" class="dfx-core-gc-toolbar-left-menu-iconbar {{attributes.toolbar.leftMenu.iconBar.triggerButton.icon.class}}" style="{{attributes.toolbar.leftMenu.iconBar.triggerButton.icon.style}}"></ng-md-icon>'+
                                    '</i>'+
                                    '<i ng-if="{{isState}}">'+
                                        '<i ng-if="{{trueState}}">'+
                                            '<md-icon ng-if="{{ifTrueStateFaIcon}}" class="fa {{trueStateFaIcon}} dfx-core-gc-toolbar-left-menu-iconbar {{attributes.toolbar.leftMenu.iconBar.triggerButton.icon.class}} {{trueStateFaIconClass}}" style="font-size:{{attributes.toolbar.leftMenu.iconBar.triggerButton.icon.size}}px; {{attributes.toolbar.leftMenu.iconBar.triggerButton.icon.style}}; {{trueStateFaIconStyle}}"></md-icon>'+
                                            '<ng-md-icon ng-if="{{ifTrueStateSvgIcon}}" icon="{{trueStateSvgIcon}}" size="{{attributes.toolbar.leftMenu.iconBar.triggerButton.icon.size}}" class="dfx-core-gc-toolbar-left-menu-iconbar {{attributes.toolbar.leftMenu.iconBar.triggerButton.icon.class}} {{trueStateSvgIconClass}}" style="{{attributes.toolbar.leftMenu.iconBar.triggerButton.icon.style}}; {{trueStateSvgIconStyle}}"></ng-md-icon>'+
                                        '</i>'+
                                        '<i ng-if="!{{falseState}}">'+
                                            '<md-icon ng-if="{{ifFalseStateFaIcon}}" class="fa {{falseStateFaIcon}} dfx-core-gc-toolbar-left-menu-iconbar {{attributes.toolbar.leftMenu.iconBar.triggerButton.icon.class}} {{falseStateFaIconClass}}" style="font-size:{{attributes.toolbar.leftMenu.iconBar.triggerButton.icon.size}}px; {{attributes.toolbar.leftMenu.iconBar.triggerButton.icon.style}}; {{falseStateFaIconStyle}}"></md-icon>'+
                                            '<ng-md-icon ng-if="{{ifFalseStateSvgIcon}}" icon="{{falseStateSvgIcon}}" size="{{attributes.toolbar.leftMenu.iconBar.triggerButton.icon.size}}" class="dfx-core-gc-toolbar-left-menu-iconbar {{attributes.toolbar.leftMenu.iconBar.triggerButton.icon.class}} {{falseStateSvgIconClass}}" style="{{attributes.toolbar.leftMenu.iconBar.triggerButton.icon.style}}; {{falseStateSvgIconStyle}}"></ng-md-icon>'+
                                        '</i>'+
                                    '</i>'+
                                '</button>';
                                singleMenuItem ='<md-button ng-show="{{itemDisplay}}" ng-disabled="{{itemDisabled}}" menu-index="{{itemIndex}}" ng-click="{{itemClick}}" '+
                                'class="dfx-menu-button {{attributes.toolbar.leftMenu.iconBar.actionButton.class}}" style="{{attributes.toolbar.leftMenu.iconBar.actionButton.style}}" aria-label="iconbar-button" >'+
                                    '<i ng-if="{{notState}}">'+
                                        '<md-icon ng-if="{{ifFaIcon}}" class="fa {{faIcon}} dfx-menu-button-icon {{attributes.toolbar.leftMenu.iconBar.actionButton.icon.class}}" style="font-size:{{attributes.toolbar.leftMenu.iconBar.actionButton.icon.size}}px; {{attributes.toolbar.leftMenu.iconBar.actionButton.icon.style}}"></md-icon>'+
                                        '<ng-md-icon ng-if="{{ifSvgIcon}}" icon="{{svgIcon}}" size="{{attributes.toolbar.leftMenu.iconBar.actionButton.icon.size}}" class="dfx-menu-button-icon {{attributes.toolbar.leftMenu.iconBar.actionButton.icon.class}}" style="{{attributes.toolbar.leftMenu.iconBar.actionButton.icon.style}}"></ng-md-icon>'+
                                    '</i>'+
                                    '<i ng-if="{{isState}}">'+
                                        '<i ng-if="{{trueState}}">'+
                                            '<md-icon ng-if="{{ifTrueStateFaIcon}}" class="fa {{trueStateFaIcon}} dfx-menu-button-icon {{attributes.toolbar.leftMenu.iconBar.actionButton.icon.class}} {{trueStateFaIconClass}}" style="font-size:{{attributes.toolbar.leftMenu.iconBar.actionButton.icon.size}}px; {{attributes.toolbar.leftMenu.iconBar.actionButton.icon.style}}; {{trueStateFaIconStyle}}"></md-icon>'+
                                            '<ng-md-icon ng-if="{{ifTrueStateSvgIcon}}" icon="{{trueStateSvgIcon}}" size="{{attributes.toolbar.leftMenu.iconBar.actionButton.icon.size}}" class="dfx-menu-button-icon {{attributes.toolbar.leftMenu.iconBar.actionButton.icon.class}} {{trueStateSvgIconClass}}" style="{{attributes.toolbar.leftMenu.iconBar.actionButton.icon.style}}; {{trueStateSvgIconStyle}}"></ng-md-icon>'+
                                        '</i>'+
                                        '<i ng-if="!{{falseState}}">'+
                                            '<md-icon ng-if="{{ifFalseStateFaIcon}}" class="fa {{falseStateFaIcon}} dfx-menu-button-icon {{attributes.toolbar.leftMenu.iconBar.actionButton.icon.class}} {{falseStateFaIconClass}}" style="font-size:{{attributes.toolbar.leftMenu.iconBar.actionButton.icon.size}}px; {{attributes.toolbar.leftMenu.iconBar.actionButton.icon.style}}; {{falseStateFaIconStyle}}"></md-icon>'+
                                            '<ng-md-icon ng-if="{{ifFalseStateSvgIcon}}" icon="{{falseStateSvgIcon}}" size="{{attributes.toolbar.leftMenu.iconBar.actionButton.icon.size}}" class="dfx-menu-button-icon {{attributes.toolbar.leftMenu.iconBar.actionButton.icon.class}} {{falseStateSvgIconClass}}" style="{{attributes.toolbar.leftMenu.iconBar.actionButton.icon.style}}; {{falseStateSvgIconStyle}}"></ng-md-icon>'+
                                        '</i>'+
                                    '</i>'+
                                    '<span>{{itemLabel}}</span>'+
                                    '<span class="md-alt-text">{{itemShortcut}}</span>'+
                                    '<small ng-if="{{ifItemNotification}}">{{itemNotification}}</small>'+
                                '</md-button>';
                            } else if ( scope.attributes.toolbar.leftMenu.type.value === 'Buttons' ) {
                                toolbarType='buttons';
                                scope.leftRootMenuItem = '<button aria-label="left_buttons" ng-show="{{itemDisplay}}" ng-click="{{itemClick}}" style="width: 100%; {{attributes.toolbar.leftMenu.buttons.triggerButton.style}}"' +
                                'class="dfx-core-gc-button dfx-core-gc-toolbar-left-buttons md-button md-raised md-altTheme-theme glyph {{attributes.toolbar.leftMenu.buttons.triggerButton.class}} {{ {{ifWaitClass}} ? \'dfx-core-button-wait\' : \'\'}}" ng-disabled="{{itemDisabled}} || {{isAutoDisabled}}">'+
                                '<div ng-if="!{{ifNotWait}}">'+
                                    '<md-icon ng-if="{{ifFaIcon}}" class="fa {{faIcon}} dfx-core-gc-toolbar-left-menu-icon {{attributes.toolbar.leftMenu.buttons.triggerButton.icon.class}}" style="font-size: {{attributes.toolbar.leftMenu.buttons.triggerButton.icon.size}}px; width: {{attributes.toolbar.leftMenu.buttons.triggerButton.icon.size}}px; height: {{attributes.toolbar.leftMenu.buttons.triggerButton.icon.size}}px; {{attributes.toolbar.leftMenu.buttons.triggerButton.icon.style}}"></md-icon>'+
                                    '<ng-md-icon ng-if="{{ifSvgIcon}}" icon="{{svgIcon}}" size="{{attributes.toolbar.leftMenu.buttons.triggerButton.icon.size}}" class="dfx-core-gc-toolbar-left-menu-icon {{attributes.toolbar.leftMenu.buttons.triggerButton.icon.class}}" style="width: {{attributes.toolbar.leftMenu.buttons.triggerButton.icon.size}}px; height: {{attributes.toolbar.leftMenu.buttons.triggerButton.icon.size}}px;{{attributes.toolbar.leftMenu.buttons.triggerButton.icon.style}}"></ng-md-icon>'+
                                '</div>'+
                                '<div ng-if="{{ifWait}}">'+
                                    '<md-icon ng-if="{{ifWaitFaIcon}}" class="fa {{waitFaIcon}} dfx-core-gc-toolbar-left-menu-icon {{attributes.toolbar.leftMenu.buttons.triggerButton.icon.class}} {{waitFaIconClass}}" style="font-size: {{attributes.toolbar.leftMenu.buttons.triggerButton.icon.size}}px; width: {{attributes.toolbar.leftMenu.buttons.triggerButton.icon.size}}px; height: {{attributes.toolbar.leftMenu.buttons.triggerButton.icon.size}}px;{{attributes.toolbar.leftMenu.buttons.triggerButton.icon.style}}; {{waitFaIconStyle}}"></md-icon>'+
                                    '<ng-md-icon ng-if="{{ifWaitSvgIcon}}" icon="{{waitSvgIcon}}" size="{{attributes.toolbar.leftMenu.buttons.triggerButton.icon.size}}" class="dfx-core-gc-toolbar-left-menu-icon {{attributes.toolbar.leftMenu.buttons.triggerButton.icon.class}} {{waitSvgIconClass}}" style="width: {{attributes.toolbar.leftMenu.buttons.triggerButton.icon.size}}px; height: {{attributes.toolbar.leftMenu.buttons.triggerButton.icon.size}}px;{{attributes.toolbar.leftMenu.buttons.triggerButton.icon.style}}; {{waitSvgIconStyle}}"></ng-md-icon>'+
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
                            scope.rootMenuItem = scope.leftRootMenuItem;
                            if ( scope.attributes.toolbar.leftMenu.type.value === 'Buttons' ) {
                                scope.iconBar = '<md-menu-bar class="dfx_toolbar_menubar">';
                            } else {
                                scope.iconBar = '<md-menu-bar style="display:flex;">';
                            }
                        } else if ( side === 'right' ) {
                            if ( scope.attributes.toolbar.rightMenu.menuItemsType.value === 'dynamic' ) {
                                scope.itemNames = scope.attributes.toolbar.rightMenu.menuItemNames.value;
                                scope.iconbarArray = scope.$parent_scope[scope.itemNames.main.source];
                            } else {
                                scope.iconbarArray = scope.attributes.toolbar.rightMenu.menuItems.value;
                            }
                            if ( scope.attributes.toolbar.rightMenu.type.value === 'Icon Bar' ) {
                                toolbarType='iconBar';
                                scope.rightRootMenuItem = '<button ng-click="{{itemClick}}" ng-show="{{itemDisplay}}" menu-index="{{itemIndex}}" ng-disabled="{{itemDisabled}}" style="{{attributes.toolbar.rightMenu.iconBar.triggerButton.style}}" aria-label="md-icon-button" class="md-icon-button {{attributes.toolbar.rightMenu.iconBar.triggerButton.class}}">'+
                                    '<i ng-if="{{notState}}">'+
                                        '<md-icon ng-if="{{ifFaIcon}}" class="fa {{faIcon}} dfx-core-gc-toolbar-left-menu-iconbar {{attributes.toolbar.rightMenu.iconBar.triggerButton.icon.class}}" style="font-size:{{attributes.toolbar.rightMenu.iconBar.triggerButton.icon.size}}px; {{attributes.toolbar.rightMenu.iconBar.triggerButton.icon.style}}"></md-icon>'+
                                        '<ng-md-icon ng-if="{{ifSvgIcon}}" icon="{{svgIcon}}" size="{{attributes.toolbar.rightMenu.iconBar.triggerButton.icon.size}}" class="dfx-core-gc-toolbar-left-menu-iconbar {{attributes.toolbar.rightMenu.iconBar.triggerButton.icon.class}}" style="{{attributes.toolbar.rightMenu.iconBar.triggerButton.icon.style}}"></ng-md-icon>'+
                                    '</i>'+
                                    '<i ng-if="{{isState}}">'+
                                        '<i ng-if="{{trueState}}">'+
                                            '<md-icon ng-if="{{ifTrueStateFaIcon}}" class="fa {{trueStateFaIcon}} dfx-core-gc-toolbar-left-menu-iconbar {{attributes.toolbar.rightMenu.iconBar.triggerButton.icon.class}} {{trueStateFaIconClass}}" style="font-size:{{attributes.toolbar.rightMenu.iconBar.triggerButton.icon.size}}px; {{attributes.toolbar.rightMenu.iconBar.triggerButton.icon.style}}; {{trueStateFaIconStyle}}"></md-icon>'+
                                            '<ng-md-icon ng-if="{{ifTrueStateSvgIcon}}" icon="{{trueStateSvgIcon}}" size="{{attributes.toolbar.rightMenu.iconBar.triggerButton.icon.size}}" class="dfx-core-gc-toolbar-left-menu-iconbar {{attributes.toolbar.rightMenu.iconBar.triggerButton.icon.class}} {{trueStateSvgIconClass}}" style="{{attributes.toolbar.rightMenu.iconBar.triggerButton.icon.style}}; {{trueStateSvgIconStyle}}"></ng-md-icon>'+
                                        '</i>'+
                                        '<i ng-if="!{{falseState}}">'+
                                            '<md-icon ng-if="{{ifFalseStateFaIcon}}" class="fa {{falseStateFaIcon}} dfx-core-gc-toolbar-left-menu-iconbar {{attributes.toolbar.rightMenu.iconBar.triggerButton.icon.class}} {{falseStateFaIconClass}}" style="font-size:{{attributes.toolbar.rightMenu.iconBar.triggerButton.icon.size}}px; {{attributes.toolbar.rightMenu.iconBar.triggerButton.icon.style}}; {{falseStateFaIconStyle}}"></md-icon>'+
                                            '<ng-md-icon ng-if="{{ifFalseStateSvgIcon}}" icon="{{falseStateSvgIcon}}" size="{{attributes.toolbar.rightMenu.iconBar.triggerButton.icon.size}}" class="dfx-core-gc-toolbar-left-menu-iconbar {{attributes.toolbar.rightMenu.iconBar.triggerButton.icon.class}} {{falseStateSvgIconClass}}" style="{{attributes.toolbar.rightMenu.iconBar.triggerButton.icon.style}}; {{falseStateSvgIconStyle}}"></ng-md-icon>'+
                                        '</i>'+
                                    '</i>'+
                                '</button>';
                                singleMenuItem ='<md-button ng-show="{{itemDisplay}}" ng-disabled="{{itemDisabled}}" menu-index="{{itemIndex}}" ng-click="{{itemClick}}" '+
                                'class="dfx-menu-button {{attributes.toolbar.rightMenu.iconBar.actionButton.class}}" style="{{attributes.toolbar.rightMenu.iconBar.actionButton.style}}" aria-label="iconbar-button" >'+
                                    '<i ng-if="{{notState}}">'+
                                        '<md-icon ng-if="{{ifFaIcon}}" class="fa {{faIcon}} dfx-menu-button-icon {{attributes.toolbar.rightMenu.iconBar.actionButton.icon.class}}" style="font-size:{{attributes.toolbar.rightMenu.iconBar.actionButton.icon.size}}px; {{attributes.toolbar.rightMenu.iconBar.actionButton.icon.style}}"></md-icon>'+
                                        '<ng-md-icon ng-if="{{ifSvgIcon}}" icon="{{svgIcon}}" size="{{attributes.toolbar.rightMenu.iconBar.actionButton.icon.size}}" class="dfx-menu-button-icon {{attributes.toolbar.rightMenu.iconBar.actionButton.icon.class}}" style="{{attributes.toolbar.rightMenu.iconBar.actionButton.icon.style}}"></ng-md-icon>'+
                                    '</i>'+
                                    '<i ng-if="{{isState}}">'+
                                        '<i ng-if="{{trueState}}">'+
                                            '<md-icon ng-if="{{ifTrueStateFaIcon}}" class="fa {{trueStateFaIcon}} dfx-menu-button-icon {{attributes.toolbar.rightMenu.iconBar.actionButton.icon.class}} {{trueStateFaIconClass}}" style="font-size:{{attributes.toolbar.rightMenu.iconBar.actionButton.icon.size}}px; {{attributes.toolbar.rightMenu.iconBar.actionButton.icon.style}}; {{trueStateFaIconStyle}}"></md-icon>'+
                                            '<ng-md-icon ng-if="{{ifTrueStateSvgIcon}}" icon="{{trueStateSvgIcon}}" size="{{attributes.toolbar.rightMenu.iconBar.actionButton.icon.size}}" class="dfx-menu-button-icon {{attributes.toolbar.rightMenu.iconBar.actionButton.icon.class}} {{trueStateSvgIconClass}}" style="{{attributes.toolbar.rightMenu.iconBar.actionButton.icon.style}}; {{trueStateSvgIconStyle}}"></ng-md-icon>'+
                                        '</i>'+
                                        '<i ng-if="!{{falseState}}">'+
                                            '<md-icon ng-if="{{ifFalseStateFaIcon}}" class="fa {{falseStateFaIcon}} dfx-menu-button-icon {{attributes.toolbar.rightMenu.iconBar.actionButton.icon.class}} {{falseStateFaIconClass}}" style="font-size:{{attributes.toolbar.rightMenu.iconBar.actionButton.icon.size}}px; {{attributes.toolbar.rightMenu.iconBar.actionButton.icon.style}}; {{falseStateFaIconStyle}}"></md-icon>'+
                                            '<ng-md-icon ng-if="{{ifFalseStateSvgIcon}}" icon="{{falseStateSvgIcon}}" size="{{attributes.toolbar.rightMenu.iconBar.actionButton.icon.size}}" class="dfx-menu-button-icon {{attributes.toolbar.rightMenu.iconBar.actionButton.icon.class}} {{falseStateSvgIconClass}}" style="{{attributes.toolbar.rightMenu.iconBar.actionButton.icon.style}}; {{falseStateSvgIconStyle}}"></ng-md-icon>'+
                                        '</i>'+
                                    '</i>'+
                                    '<span>{{itemLabel}}</span>'+
                                    '<span class="md-alt-text">{{itemShortcut}}</span>'+
                                    '<small ng-if="{{ifItemNotification}}">{{itemNotification}}</small>'+
                                '</md-button>';
                            } else if ( scope.attributes.toolbar.rightMenu.type.value === 'Buttons' ) {
                                toolbarType='buttons';
                                scope.rightRootMenuItem = '<button aria-label="right_buttons" ng-show="{{itemDisplay}}" ng-click="{{itemClick}}" style="width: 100%; {{attributes.toolbar.rightMenu.buttons.triggerButton.style}}" ' +
                                'class="dfx-core-gc-button dfx-core-gc-toolbar-right-buttons md-button md-raised md-altTheme-theme glyph {{attributes.toolbar.rightMenu.buttons.triggerButton.class}} {{ {{ifWaitClass}} ? \'dfx-core-button-wait\' : \'\'}}" ng-disabled="{{itemDisabled}} || {{isAutoDisabled}}">'+
                                '<div ng-if="!{{ifNotWait}}">'+
                                    '<md-icon ng-if="{{ifFaIcon}}" class="fa {{faIcon}} dfx-core-gc-toolbar-right-menu-icon {{attributes.toolbar.rightMenu.buttons.triggerButton.icon.class}}" style="font-size: {{attributes.toolbar.rightMenu.buttons.triggerButton.icon.size}}px; width: {{attributes.toolbar.rightMenu.buttons.triggerButton.icon.size}}px; height: {{attributes.toolbar.rightMenu.buttons.triggerButton.icon.size}}px; {{attributes.toolbar.rightMenu.buttons.triggerButton.icon.style}}"></md-icon>'+
                                    '<ng-md-icon ng-if="{{ifSvgIcon}}" icon="{{svgIcon}}" size="{{attributes.toolbar.rightMenu.buttons.triggerButton.icon.size}}" class="dfx-core-gc-toolbar-right-menu-icon {{attributes.toolbar.rightMenu.buttons.triggerButton.icon.class}}" style="width: {{attributes.toolbar.rightMenu.buttons.triggerButton.icon.size}}px; height: {{attributes.toolbar.rightMenu.buttons.triggerButton.icon.size}}px;{{attributes.toolbar.rightMenu.buttons.triggerButton.icon.style}}"></ng-md-icon>'+
                                '</div>'+
                                '<div ng-if="{{ifWait}}">'+
                                    '<md-icon ng-if="{{ifWaitFaIcon}}" class="fa {{waitFaIcon}} dfx-core-gc-toolbar-right-menu-icon {{attributes.toolbar.rightMenu.buttons.triggerButton.icon.class}} {{waitFaIconClass}}" style="font-size: {{attributes.toolbar.rightMenu.buttons.triggerButton.icon.size}}px; width: {{attributes.toolbar.rightMenu.buttons.triggerButton.icon.size}}px; height: {{attributes.toolbar.rightMenu.buttons.triggerButton.icon.size}}px;{{attributes.toolbar.rightMenu.buttons.triggerButton.icon.style}}; {{waitFaIconStyle}}"></md-icon>'+
                                    '<ng-md-icon ng-if="{{ifWaitSvgIcon}}" icon="{{waitSvgIcon}}" size="{{attributes.toolbar.rightMenu.buttons.triggerButton.icon.size}}" class="dfx-core-gc-toolbar-right-menu-icon {{attributes.toolbar.rightMenu.buttons.triggerButton.icon.class}} {{waitSvgIconClass}}" style="width: {{attributes.toolbar.rightMenu.buttons.triggerButton.icon.size}}px; height: {{attributes.toolbar.rightMenu.buttons.triggerButton.icon.size}}px;{{attributes.toolbar.rightMenu.buttons.triggerButton.icon.style}}; {{waitSvgIconStyle}}"></ng-md-icon>'+
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
                            scope.rootMenuItem = scope.rightRootMenuItem;
                            if ( scope.attributes.toolbar.rightMenu.type.value === 'Buttons' ) {
                                scope.iconBar = '<md-menu-bar class="dfx_toolbar_menubar">';
                            } else {
                                scope.iconBar = '<md-menu-bar style="display:flex;">';
                            }
                        }

                        if ( side === 'left' ) {
                            if(scope.attributes.toolbar.leftMenu.menuItemsType.value === 'static') {
                                for ( var item = 0; item < scope.iconbarArray.length; item++ ) {
                                    if ( scope.attributes.toolbar.leftMenu.type.value === 'Buttons' ) {
                                        scope.iconBar = scope.iconBar + '<md-menu class="toolbar-button">';
                                    } else {
                                        scope.iconBar = scope.iconBar + '<md-menu style="display:flex;">';
                                    }
                                    if ( scope.iconbarArray[item].menuItems.value.length > 0 ) {
                                        createDfxMenuItem( scope.iconbarArray[item], 'rootMenuItem', undefined, item, side, 'static' );
                                        buildNextLevel( scope.iconbarArray[item].menuItems.value, item, side, 'static');
                                        scope.iconBar = scope.iconBar + '</md-menu-content>';
                                    } else {
                                        createDfxMenuItem( scope.iconbarArray[item], 'rootMenuItem', undefined, item, side, 'static' );
                                    }
                                    scope.iconBar = scope.iconBar + '</md-menu>';
                                }
                            } else {
                                for ( var item = 0; item < scope.iconbarArray.length; item++ ) {
                                    if ( scope.attributes.toolbar.leftMenu.type.value === 'Buttons' ) {
                                        scope.iconBar = scope.iconBar + '<md-menu class="toolbar-button">';
                                    } else {
                                        scope.iconBar = scope.iconBar + '<md-menu style="display:flex;">';
                                    }
                                    if ( scope.iconbarArray[item][scope.attributes.toolbar.leftMenu.menuItemNames.value.main.scopeItems] && scope.iconbarArray[item][scope.attributes.toolbar.leftMenu.menuItemNames.value.main.scopeItems].length > 0 ) {
                                        createDfxMenuItem( scope.iconbarArray[item], 'rootMenuItem', undefined, item, side, 'dynamic' );
                                        buildNextLevel( scope.iconbarArray[item][scope.attributes.toolbar.leftMenu.menuItemNames.value.main.scopeItems], item, side, 'dynamic');
                                        scope.iconBar = scope.iconBar + '</md-menu-content>';
                                    } else {
                                        createDfxMenuItem( scope.iconbarArray[item], 'rootMenuItem', undefined, item, side, 'dynamic' );
                                    }
                                    scope.iconBar = scope.iconBar + '</md-menu>';
                                }
                            }
                        } else {
                            if(scope.attributes.toolbar.rightMenu.menuItemsType.value === 'static') {
                                for ( var item = 0; item < scope.iconbarArray.length; item++ ) {
                                    if ( scope.attributes.toolbar.rightMenu.type.value === 'Buttons' ) {
                                        scope.iconBar = scope.iconBar + '<md-menu class="toolbar-button">';
                                    } else {
                                        scope.iconBar = scope.iconBar + '<md-menu style="display:flex;">';
                                    }
                                    if ( scope.iconbarArray[item].menuItems.value.length > 0 ) {
                                        createDfxMenuItem( scope.iconbarArray[item], 'rootMenuItem', undefined, item, side, 'static' );
                                        buildNextLevel( scope.iconbarArray[item].menuItems.value, item, side, 'static');
                                        scope.iconBar = scope.iconBar + '</md-menu-content>';
                                    } else {
                                        createDfxMenuItem( scope.iconbarArray[item], 'rootMenuItem', undefined, item, side, 'static' );
                                    }
                                    scope.iconBar = scope.iconBar + '</md-menu>';
                                }
                            } else {
                                for ( var item = 0; item < scope.iconbarArray.length; item++ ) {
                                    if ( scope.attributes.toolbar.rightMenu.type.value === 'Buttons' ) {
                                        scope.iconBar = scope.iconBar + '<md-menu class="toolbar-button">';
                                    } else {
                                        scope.iconBar = scope.iconBar + '<md-menu style="display:flex;">';
                                    }
                                    if ( scope.iconbarArray[item][scope.attributes.toolbar.rightMenu.menuItemNames.value.main.scopeItems] && scope.iconbarArray[item][scope.attributes.toolbar.rightMenu.menuItemNames.value.main.scopeItems].length > 0 ) {
                                        createDfxMenuItem( scope.iconbarArray[item], 'rootMenuItem', undefined, item, side, 'dynamic' );
                                        buildNextLevel( scope.iconbarArray[item][scope.attributes.toolbar.rightMenu.menuItemNames.value.main.scopeItems], item, side, 'dynamic');
                                        scope.iconBar = scope.iconBar + '</md-menu-content>';
                                    } else {
                                        createDfxMenuItem( scope.iconbarArray[item], 'rootMenuItem', undefined, item, side, 'dynamic' );
                                    }
                                    scope.iconBar = scope.iconBar + '</md-menu>';
                                }
                            }
                        }

                        scope.iconBar = scope.iconBar + '</md-menu-bar>';
                        scope.iconBarMenu = scope.iconBar;
                        if(side==='left'){
                            if(scope.attributes.toolbar.leftMenu.type.value === 'Icon Bar'){
                                if ( scope.attributes.hasOwnProperty('repeat_in') && scope.attributes.repeat_title.value ) {
                                    $('.' + scope.component_id + '_left_menu_bar[dfx-repeatable-panel='+toolbar_panel_index+']').html(scope.iconBarMenu);
                                    $compile($('.' + scope.component_id + '_left_menu_bar[dfx-repeatable-panel='+toolbar_panel_index+']').contents())(scope);
                                } else {
                                    $('.' + scope.component_id + '_left_menu_bar').html(scope.iconBarMenu);
                                    $compile($('.' + scope.component_id + '_left_menu_bar').contents())(scope);
                                }
                            }else if(scope.attributes.toolbar.leftMenu.type.value === 'Buttons'){
                                if ( scope.attributes.hasOwnProperty('repeat_in') && scope.attributes.repeat_title.value ) {
                                    $('.' + scope.component_id + '_left_buttons_menu[dfx-repeatable-panel='+toolbar_panel_index+']').html(scope.iconBarMenu);
                                    $compile($('.' + scope.component_id + '_left_buttons_menu[dfx-repeatable-panel='+toolbar_panel_index+']').contents())(scope);
                                } else {
                                    $('.' + scope.component_id + '_left_buttons_menu').html(scope.iconBarMenu);
                                    $compile($('.' + scope.component_id + '_left_buttons_menu').contents())(scope);
                                }
                            }
                            scope.setButtonsWidth(scope.attributes.toolbar.leftMenu.equalButtonSize.value, 'left');
                        }else if(side==='right'){
                            if(scope.attributes.toolbar.rightMenu.type.value === 'Icon Bar'){
                                if ( scope.attributes.hasOwnProperty('repeat_in') && scope.attributes.repeat_title.value ) {
                                    $('.' + scope.component_id + '_right_menu_bar[dfx-repeatable-panel='+toolbar_panel_index+']').html(scope.iconBarMenu);
                                    $compile($('.' + scope.component_id + '_right_menu_bar[dfx-repeatable-panel='+toolbar_panel_index+']').contents())(scope);
                                } else {
                                    $('.' + scope.component_id + '_right_menu_bar').html(scope.iconBarMenu);
                                    $compile($('.' + scope.component_id + '_right_menu_bar').contents())(scope);
                                }
                            }else if(scope.attributes.toolbar.rightMenu.type.value === 'Buttons'){
                                if ( scope.attributes.hasOwnProperty('repeat_in') && scope.attributes.repeat_title.value ) {
                                    $('.' + scope.component_id + '_right_buttons_menu[dfx-repeatable-panel='+toolbar_panel_index+']').html(scope.iconBarMenu);
                                    $compile($('.' + scope.component_id + '_right_buttons_menu[dfx-repeatable-panel='+toolbar_panel_index+']').contents())(scope);
                                } else {
                                    $('.' + scope.component_id + '_right_buttons_menu').html(scope.iconBarMenu);
                                    $compile($('.' + scope.component_id + '_right_buttons_menu').contents())(scope);
                                }
                            }
                            scope.setButtonsWidth(scope.attributes.toolbar.rightMenu.equalButtonSize.value, 'right');
                        }
                    }, 0);
                }
                // $timeout(function() {
                //     if (scope.attributes.toolbar.leftMenu.menuItemsType.value === 'static') {
                //         scope.$watch('attributes.toolbar.leftMenu.menuItems.value', function(newVal, oldVal) {
                //             if ( newVal != null && scope.attributes.toolbar.leftMenu.type.value !== 'Fab' ) {
                //                 // $timeout(function() {
                //                     scope.iconbarBuilder('left');
                //                 // }, 0);
                //             }
                //         }, true);
                //     }
                //     if (scope.attributes.toolbar.leftMenu.menuItemsType.value === 'dynamic'){
                //         scope.$watch('$parent_scope.'+scope.attributes.toolbar.leftMenu.menuItemNames.value.main.source, function(newVal, oldVal) {
                //             if ( newVal != null && scope.attributes.toolbar.leftMenu.type.value !== 'Fab' ) {
                //                 // $timeout(function() {
                //                     scope.iconbarBuilder('left');
                //                 // }, 0);
                //             }
                //         }, true);
                //     }
                //     if(scope.attributes.toolbar.rightMenu.menuItemsType.value === 'static') {
                //         scope.$watch('attributes.toolbar.rightMenu.menuItems.value', function(newVal, oldVal) {
                //             if ( newVal != null && scope.attributes.toolbar.rightMenu.type.value !== 'Fab' ) {
                //                 // $timeout(function() {
                //                     scope.iconbarBuilder('right');
                //                 // }, 0);
                //             }
                //         }, true);
                //     }
                //     if (scope.attributes.toolbar.rightMenu.menuItemsType.value === 'dynamic') {
                //         scope.$watch('$parent_scope.'+scope.attributes.toolbar.rightMenu.menuItemNames.value.main.source, function(newVal, oldVal) {
                //             if ( newVal != null && scope.attributes.toolbar.rightMenu.type.value !== 'Fab' ) {
                //                 // $timeout(function() {
                //                     scope.iconbarBuilder('right');
                //                 // }, 0);
                //             }
                //         }, true);
                //     }
                // }, 0);

                scope.unfocusButton = function(event){
                    var target = $(event.target);
                    target.is("button") ? target.blur() : $(target.parent()[0]).blur();
                };

                // deleted form toolbar_preview.html md-fab-actions: ng-show="attributes.toolbar.rightMenu.initialClick.value === true"
                scope.rightFabClick = function(){
                    //scope.attributes.toolbar.rightMenu.initialClick.value = true;
                };

                // deleted form toolbar_preview.html md-fab-actions: ng-show="attributes.toolbar.leftMenu.initialClick.value === true"
                scope.leftFabClick = function(){
                    //scope.attributes.toolbar.leftMenu.initialClick.value = true;
                };

                scope.snippetTrustAsHtml = function(snippet) {
                    return $sce.trustAsHtml(snippet);
                };
            }
        }
    }
});

dfxGCC.directive('dfxGccWebProgressbar', ['$timeout', function( $timeout ) {
    return {
        restrict: 'A',
        require: '^dfxGccWebBase',
        scope: true,
        link: function(scope, element, attrs, basectrl) {
            var component = scope.getComponent(element);
            basectrl.init(scope, element, component, attrs, 'progressbar').then(function() {
                scope.attributes.flex.status = "overridden";

                $timeout(function() {
                    element.css('width', scope.attributes.flex.value + '%');
                }, 0);
            });
        }
    }
}]);

dfxGCC.directive('dfxGccWebRating', function($timeout) {
    return {
        restrict: 'A',
        require: '^dfxGccWebBase',
        scope: true,
        link: {
            pre : function(scope, element, attrs, basectrl) {
                var component = scope.getComponent(element);
                scope.component_id = component.id;
                scope.attributes = null;
                basectrl.init(scope, element, component, attrs, 'rating').then(function(){
                    var rangeStep = scope.attributes.maxValue.value/scope.attributes.range.value,
                        newRating;
                    scope.isDfxRepeatableRating = false;
                    scope.dfxRepeatableRatingElement;
                    function updateStars(rating) {
                        scope.stars = [];
                        for (var i = 0; i < scope.attributes.range.value; i++) {
                            scope.stars.push({
                                filled: i*rangeStep < rating
                            });
                        }
                    };
                    scope.toggle = function(index) {
                        newRating = index*rangeStep + rangeStep;
                        updateStars(newRating);
                        return newRating;
                    };
                    scope.showDfxRatingElement = function(dfxItem){
                        scope.dfxRepeatableRatingElement = dfxItem;
                    }
                    if(scope.attributes.binding.value.indexOf('$dfx_item') > -1){
                        scope.isDfxRepeatableRating = true;
                        updateStars(0);
                        scope.$watch('dfxRepeatableRatingElement', function(newValue){
                            if (newValue) {
                                var tempRating = scope.attributes.binding.value.replace('$dfx_item', ''),
                                    newRate = eval('newValue' + tempRating);
                                updateStars(newRate);
                            }
                        }, true);
                    }else{
                        scope.$watch('$parent_scope.' + scope.attributes.binding.value, function(newValue){
                            if (newValue) {
                                updateStars(newValue);
                            }
                        });
                    }
                });
            }
        }
    }
});

dfxGCC.directive('dfxGccWebKnob', ['$timeout', '$compile', function($timeout, $compile) {
    return {
        restrict:    'A',
        require:     '^dfxGccWebBase',
        scope:       true,
        link: function (scope, element, attrs, basectrl) {
            var component = scope.$parent.getComponent(element);
            basectrl.init(scope, element, component, attrs, 'knob').then(function () {
                scope.isLoaded = {"value": false};
                if(typeof scope.attributes.options.value.readOnly === 'string'){
                    switch(scope.attributes.options.value.readOnly){
                        case 'true': scope.attributes.options.value.readOnly = true; break;
                        case 'false': scope.attributes.options.value.readOnly = false; break;
                    }
                }
                scope.isLoaded.value = true;
            });
        }
    }
}]);

var DfxGcChartUtil = (function () {
    var api = {};

    var removeBracketsFromEventListener = function(eventListener) {
        return (eventListener) ? eventListener.replace(/\(.*?\)/g, "") : eventListener;
    };
    var refreshChartToReflectFlexSize = function(scope, isDesignTime, basectrl, $timeout, oldFlexValue) {
          $timeout(function() {
              if (scope[scope.attributes.name.value].refresh) {
                  oldFlexValue = oldFlexValue || 100;

                  // remove old flex class manually because it's not done automatically after chart dropping
                  if (oldFlexValue) { $('#' + scope.component_id).removeClass('flex' + '-' + oldFlexValue); }

                  basectrl.changeWidth(scope);

                  scope[scope.attributes.name.value].refresh();
              }
          }, 0);
    };

    api.adjustContainerHeight = function(scope) {
        // adjust container height to include title height
        var containerHeight = $('#' + scope.component_id).find('.dfx-core-gc-chart').height();
        var chartTitleHeight = $('#' + scope.component_id).find('.title').height() * 1.5 || 30;
        $('#' + scope.component_id).height(containerHeight + chartTitleHeight);
    };

    api.setAttributesBeforeInit = function (scope, attrs, chartOptions, chartData) {
        //must set main chart options before reading json definition from file,
        //otherwise, chart is not constructed - and when attributes are reset from file - chart does not exist and nvd3.watch is useless
        scope.attributes = scope.attributes || { 'options': {} };
        scope.attributes.options = {value: chartOptions};

        scope.$gcscope = scope; //also, must set it here, before reading data from file
    };

    api.setRunTimeAttributes = function (scope, chartTypeDef, chartEventNames, basectrl, $timeout) {
        if (scope.attributes.title.value) {
            scope.attributes.options.value.title = {
                text: scope.attributes.title.value,
                enable: true
            };
        }
        if (scope.attributes.options.xAxisLabel) {
            scope.attributes.options.value.chart.xAxis.axisLabel = scope.attributes.options.xAxisLabel;
            scope.attributes.options.value.chart.yAxis.axisLabel = scope.attributes.options.yAxisLabel;
        }
        if (scope.attributes.options.xAxisLabelDistance) {
            scope.attributes.options.value.chart.xAxis.axisLabelDistance = scope.attributes.options.xAxisLabelDistance;
            scope.attributes.options.value.chart.yAxis.axisLabelDistance = scope.attributes.options.yAxisLabelDistance;
        }
        if (scope.attributes.options.duration) {
            scope.attributes.options.value.chart.duration = scope.attributes.options.duration;
        }
        if (scope.attributes.options.showValues) {
            scope.attributes.options.value.chart.showValues = scope.attributes.options.showValues;
        }
        if (scope.attributes.options.showXAxis) {
            scope.attributes.options.value.chart.showXAxis = scope.attributes.options.showXAxis;
            scope.attributes.options.value.chart.showYAxis = scope.attributes.options.showYAxis;
        }
        if (scope.attributes.options.showControls) {
            scope.attributes.options.value.chart.showControls = scope.attributes.options.showControls;
        }
        if (scope.attributes.options.showLegend) {
            scope.attributes.options.value.chart.showLegend = scope.attributes.options.showLegend;
        }
        if (scope.attributes.options.stacked) {
            scope.attributes.options.value.chart.stacked = scope.attributes.options.stacked;
        }
        if (scope.attributes.options.useInteractiveGuideline) {
            scope.attributes.options.value.chart.useInteractiveGuideline = scope.attributes.options.useInteractiveGuideline;
        }
        if (scope.attributes.options.rescaleY) {
            scope.attributes.options.value.chart.rescaleY = scope.attributes.options.rescaleY;
        }
        if (scope.attributes.options.labelSunbeamLayout) {
            scope.attributes.options.value.chart.labelSunbeamLayout = scope.attributes.options.labelSunbeamLayout;
        }
        if (scope.attributes.options.labelThreshold) {
            scope.attributes.options.value.chart.labelThreshold = scope.attributes.options.labelThreshold;
        }
        if (scope.attributes.options.donutLabelsOutside) {
            scope.attributes.options.value.chart.donutLabelsOutside = scope.attributes.options.donutLabelsOutside;
        }
        if (scope.attributes.options.showLabels) {
            scope.attributes.options.value.chart.showLabels = scope.attributes.options.showLabels;
        }
        if (scope.attributes.options.cornerRadius) {
            scope.attributes.options.value.chart.cornerRadius = scope.attributes.options.cornerRadius;
        }
        if (scope.attributes.options.growOnHover) {
            scope.attributes.options.value.chart.growOnHover = scope.attributes.options.growOnHover;
        }
        if (scope.attributes.options.donutRatio) {
            scope.attributes.options.value.chart.donutRatio = scope.attributes.options.donutRatio;
        }

        var assignEvent = function(eventName, dispatch) {
            if (scope.attributes[eventName] && scope.attributes[eventName].value) {
                var normalizedEvent = removeBracketsFromEventListener(scope.attributes[eventName].value);
                dispatch[ chartEventNames[eventName] ] = scope.$gcscope[normalizedEvent];
            }
        };
        // global chart dispatch
        var generalDispatch = {};
        assignEvent('onbeforeupdate', generalDispatch);
        assignEvent('onstatechange', generalDispatch);
        assignEvent('onrenderend', generalDispatch);
        scope.attributes.options.value.chart.dispatch = generalDispatch;

        // specific chart dispatch
        var specificDispatch = {};
        assignEvent('onclick', specificDispatch);
        assignEvent('ondblclick', specificDispatch);
        assignEvent('onmouseover', specificDispatch);
        assignEvent('onmouseleave', specificDispatch);
        assignEvent('onmousemove', specificDispatch);
        assignEvent('onareaclick', specificDispatch);
        assignEvent('onareamouseover', specificDispatch);
        assignEvent('onareamouseleave', specificDispatch);
        scope.attributes.options.value.chart[chartTypeDef] = { dispatch: specificDispatch };

        refreshChartToReflectFlexSize(scope, false, basectrl, $timeout);
    };
    api.setRunTimeChartNameVariable = function (scope, basectrl, component, $timeout) {
        $timeout(function() {
            //first, create variable with real chart name and assign to it the value from temp chart name
            scope[component.attributes.name.value] = scope.dfx_chart_api;

            //then, create this variable in parent scope (it does not exist there - not like other vars from attributes)
            scope.$parent_scope[component.attributes.name.value] = scope[component.attributes.name.value];

            //then, bind this scope variable
            basectrl.bindScopeVariable(scope, component.attributes.name.value);
        }, 0);
    };

    api.watchRunTimeAttributes = function (scope, basectrl, $timeout) {
        scope.$gcscope.$watch(scope.attributes.title.value, function(newValue) {
            scope.attributes.options.value.title.text = newValue;
        });
        if (scope.attributes.options.xAxisLabel) {
            scope.$gcscope.$watch(scope.attributes.options.xAxisLabel, function (newValue) {
                scope.attributes.options.value.chart.xAxis.axisLabel = newValue;
            });
            scope.$gcscope.$watch(scope.attributes.options.yAxisLabel, function (newValue) {
                scope.attributes.options.value.chart.yAxis.axisLabel = newValue;
            });
        }
        if (scope.attributes.options.xAxisLabelDistance) {
            scope.$gcscope.$watch(scope.attributes.options.xAxisLabelDistance, function (newValue) {
                scope.attributes.options.value.chart.xAxis.axisLabelDistance = newValue;
            });
            scope.$gcscope.$watch(scope.attributes.options.yAxisLabelDistance, function (newValue) {
                scope.attributes.options.value.chart.yAxis.axisLabelDistance = newValue;
            });
        }
        if (scope.attributes.options.duration) {
            scope.$gcscope.$watch(scope.attributes.options.duration, function (newValue) {
                scope.attributes.options.value.chart.duration = newValue;
            });
        }
        if (scope.attributes.options.showValues) {
            scope.$gcscope.$watch(scope.attributes.options.showValues, function (newValue, oldValue) {
                scope.attributes.options.value.chart.showValues = newValue;
                refreshChartToReflectFlexSize(scope, false, basectrl, $timeout, oldValue);
            });
        }
        if (scope.attributes.options.showXAxis) {
            scope.$gcscope.$watch(scope.attributes.options.showXAxis, function (newValue) {
                scope.attributes.options.value.chart.showXAxis = newValue;
            });
            scope.$gcscope.$watch(scope.attributes.options.showYAxis, function (newValue) {
                scope.attributes.options.value.chart.showYAxis = newValue;
            });
        }
        if (scope.attributes.options.showControls) {
            scope.$gcscope.$watch(scope.attributes.options.showControls, function (newValue, oldValue) {
                scope.attributes.options.value.chart.showControls = newValue;
                refreshChartToReflectFlexSize(scope, false, basectrl, $timeout, oldValue);
            });
        }
        if (scope.attributes.options.showLegend) {
            scope.$gcscope.$watch(scope.attributes.options.showLegend, function (newValue, oldValue) {
                scope.attributes.options.value.chart.showLegend = newValue;
                refreshChartToReflectFlexSize(scope, false, basectrl, $timeout, oldValue);
            });
        }
        if (scope.attributes.options.stacked) {
            scope.$gcscope.$watch(scope.attributes.options.stacked, function (newValue, oldValue) {
                scope.attributes.options.value.chart.stacked = newValue;
                refreshChartToReflectFlexSize(scope, false, basectrl, $timeout, oldValue);
            });
        }
        if (scope.attributes.options.useInteractiveGuideline) {
            scope.$gcscope.$watch(scope.attributes.options.useInteractiveGuideline, function (newValue, oldValue) {
                scope.attributes.options.value.chart.useInteractiveGuideline = newValue;
                refreshChartToReflectFlexSize(scope, false, basectrl, $timeout, oldValue);
            });
        }
        if (scope.attributes.options.rescaleY) {
            scope.$gcscope.$watch(scope.attributes.options.rescaleY, function (newValue, oldValue) {
                scope.attributes.options.value.chart.rescaleY = newValue;
                refreshChartToReflectFlexSize(scope, false, basectrl, $timeout, oldValue);
            });
        }
        if (scope.attributes.options.labelSunbeamLayout) {
            scope.$gcscope.$watch(scope.attributes.options.labelSunbeamLayout, function (newValue) {
                scope.attributes.options.value.chart.labelSunbeamLayout = newValue;
            });
        }
        if (scope.attributes.options.labelThreshold) {
            scope.$gcscope.$watch(scope.attributes.options.labelThreshold, function (newValue) {
                scope.attributes.options.value.chart.labelThreshold = newValue;
            });
        }
        if (scope.attributes.options.donutLabelsOutside) {
            scope.$gcscope.$watch(scope.attributes.options.donutLabelsOutside, function (newValue) {
                scope.attributes.options.value.chart.donutLabelsOutside = newValue;
            });
        }
        if (scope.attributes.options.showLabels) {
            scope.$gcscope.$watch(scope.attributes.options.showLabels, function (newValue) {
                scope.attributes.options.value.chart.showLabels = newValue;
            });
        }
        if (scope.attributes.options.cornerRadius) {
            scope.$gcscope.$watch(scope.attributes.options.cornerRadius, function (newValue) {
                scope.attributes.options.value.chart.cornerRadius = newValue;
            });
        }
        if (scope.attributes.options.growOnHover) {
            scope.$gcscope.$watch(scope.attributes.options.growOnHover, function (newValue) {
                scope.attributes.options.value.chart.growOnHover = newValue;
            });
        }
        if (scope.attributes.options.donutRatio) {
            scope.$gcscope.$watch(scope.attributes.options.donutRatio, function (newValue) {
                scope.attributes.options.value.chart.donutRatio = newValue;
            });
        }
    };

    return api;
}());

dfxGCC.directive('dfxGccWebAreachart', ['$timeout', '$filter', function($timeout, $filter) {
    return {
        restrict: 'A',
        require: '^dfxGccWebBase',
        scope: true,
        link: function(scope, element, attrs, basectrl) {
            var component = scope.getComponent(element);

            var chartData    = [
                {
                    "key" : "North America" ,
                    "values" : [ [ 1320033600000 , 26.672] , [ 1322629200000 , 27.297] , [ 1325307600000 , 20.174] , [ 1327986000000 , 19.631] , [ 1330491600000 , 20.366] , [ 1333166400000 , 19.284] , [ 1335758400000 , 19.157]]
                },
                {
                    "key" : "Europe" ,
                    "values" : [ [ 1320033600000 , 35.611] , [ 1322629200000 , 35.320] , [ 1325307600000 , 31.564] , [ 1327986000000 , 32.074] , [ 1330491600000 , 35.053] , [ 1333166400000 , 33.873] , [ 1335758400000 , 32.321]]
                },
                {
                    "key" : "Australia" ,
                    "values" : [ [ 1320033600000 , 5.453] , [ 1322629200000 , 7.672] , [ 1325307600000 , 8.014] , [ 1327986000000 , 0] , [ 1330491600000 , 0] , [ 1333166400000 , 0] , [ 1335758400000 , 0]]
                }
            ];
            var chartOptions = {
                chart: {
                    type: 'stackedAreaChart',
                    margin : {
                        top: 20,
                        right: 20,
                        bottom: 50,
                        left: 55
                    },
                    x: function(d){return d[0];},
                    y: function(d){return d[1];},
                    useVoronoi: false,
                    clipEdge: true,
                    duration: 100,
                    useInteractiveGuideline: true,
                    xAxis: {
                        showMaxMin: false,
                        tickFormat: function(d) {
                            return d3.time.format('%x')(new Date(d))
                        },
                        axisLabel: 'X Axis'
                    },
                    yAxis: {
                        tickFormat: function(d){
                            return d3.format(',.2f')(d);
                        }
                    }
                },
                title: {
                    text: 'Stacked Area Chart',
                    enable: true
                }
            };

            basectrl.init(scope, element, component, attrs, 'areachart').then(function () {
                if (scope.attributes.dynamicOptions) scope.attributes.dynamicOptions.status = "overridden";
                scope.attributes.flex.status = "overridden";

                DfxGcChartUtil.setRunTimeChartNameVariable(scope, basectrl, component, $timeout);

                basectrl.bindScopeVariable(scope, component.attributes.title.value);

                // dynamicOptions is a priority over all static options, title and events (ex. onclick)
                if (scope.attributes.dynamicOptions && scope.attributes.dynamicOptions.value) {
                    scope.attributes.options.value = scope[scope.attributes.dynamicOptions.value];
                } else {
                    scope.attributes.options.value = chartOptions;

                    var eventsList = {
                        onareaclick: 'areaClick',
                        onareamouseover: 'areaMouseover',
                        onareamouseleave: 'areaMouseout',
                        onstatechange: 'stateChange',
                        onrenderend: 'renderEnd'
                    };

                    DfxGcChartUtil.setRunTimeAttributes(scope, 'stacked', eventsList, basectrl, $timeout);
                    DfxGcChartUtil.watchRunTimeAttributes(scope, basectrl, $timeout);
                }

                DfxGcChartUtil.adjustContainerHeight(scope);
            });

            DfxGcChartUtil.setAttributesBeforeInit(scope, attrs, chartOptions, chartData);
        }
    }
}]);

dfxGCC.directive('dfxGccWebBarchart', ['$timeout', '$filter', function($timeout, $filter) {
    return {
        restrict: 'A',
        require: '^dfxGccWebBase',
        scope: true,
        link: function(scope, element, attrs, basectrl) {
            var component = scope.getComponent(element);

            var chartData    = [{
                key:    "Cumulative Return",
                values: [
                    {
                        "label": "A",
                        "value": -29.76
                    },
                    {
                        "label": "B",
                        "value": 32.80
                    },
                    {
                        "label": "C",
                        "value": 196.45
                    },
                    {
                        "label": "D",
                        "value": -98.07
                    },
                    {
                        "label": "E",
                        "value": -13.92
                    }
                ]
            }];
            var chartOptions = {
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
                        return d3.format(',.4f')(d);
                    },
                    duration:    500,
                    xAxis:       {
                        axisLabel: 'X Axis',
                        axisLabelDistance: -5
                    },
                    yAxis:       {
                        axisLabel: 'Y Axis',
                        axisLabelDistance: -5
                    }
                },
                title: {
                    text: 'Bar Chart',
                    enable: true
                }
            };

            basectrl.init(scope, element, component, attrs, 'barchart').then(function () {
                if (scope.attributes.dynamicOptions) scope.attributes.dynamicOptions.status = "overridden";
                scope.attributes.flex.status = "overridden";

                DfxGcChartUtil.setRunTimeChartNameVariable(scope, basectrl, component, $timeout);

                basectrl.bindScopeVariable(scope, component.attributes.title.value);

                // dynamicOptions is a priority over all static options, title and events (ex. onclick)
                if (scope.attributes.dynamicOptions && scope.attributes.dynamicOptions.value) {
                    scope.attributes.options.value = scope[scope.attributes.dynamicOptions.value];
                } else {
                    scope.attributes.options.value = chartOptions;

                    var eventsList = {
                        onclick: 'elementClick',
                        ondblclick: 'elementDblClick',
                        onmouseover: 'elementMouseover',
                        onmouseleave: 'elementMouseout',
                        onmousemove: 'elementMousemove',
                        onbeforeupdate: 'beforeUpdate',
                        onrenderend: 'renderEnd'
                    };

                    DfxGcChartUtil.setRunTimeAttributes(scope, 'discretebar', eventsList, basectrl, $timeout);
                    DfxGcChartUtil.watchRunTimeAttributes(scope, basectrl, $timeout);
                }

                DfxGcChartUtil.adjustContainerHeight(scope);
            });

            DfxGcChartUtil.setAttributesBeforeInit(scope, attrs, chartOptions, chartData);
        }
    }
}]);

dfxGCC.directive('dfxGccWebHzbarchart', ['$timeout', '$filter', function($timeout, $filter) {
    return {
        restrict: 'A',
        require: '^dfxGccWebBase',
        scope: true,
        link: function(scope, element, attrs, basectrl) {
            var component = scope.getComponent(element);

            var chartData = [
                {
                    "key": "Series1",
                    "color": "#d62728",
                    "values": [
                        {
                            "label" : "Group A" ,
                            "value" : -1.874
                        },
                        {
                            "label" : "Group B" ,
                            "value" : -8.096
                        },
                        {
                            "label" : "Group C" ,
                            "value" : -0.570
                        },
                        {
                            "label" : "Group D" ,
                            "value" : -2.417
                        },
                        {
                            "label" : "Group E" ,
                            "value" : -0.720
                        }
                    ]
                },
                {
                    "key": "Series2",
                    "color": "#1f77b4",
                    "values": [
                        {
                            "label" : "Group A" ,
                            "value" : 25.307
                        },
                        {
                            "label" : "Group B" ,
                            "value" : 16.756
                        },
                        {
                            "label" : "Group C" ,
                            "value" : 18.451
                        },
                        {
                            "label" : "Group D" ,
                            "value" : 8.614
                        },
                        {
                            "label" : "Group E" ,
                            "value" : 7.808
                        }
                    ]
                }
            ];
            var chartOptions = {
                chart: {
                    type: 'multiBarHorizontalChart',
                    margin : {
                        top: 20,
                        right: 20,
                        bottom: 50,
                        left: 55
                    },
                    x: function(d){return d.label;},
                    y: function(d){return d.value;},
                    showControls: true,
                    showValues:  true,
                    duration:    500,
                    xAxis:       {
                        showMaxMin: false,
                        axisLabel: ''
                    },
                    yAxis:       {
                        axisLabel: 'Values',
                        tickFormat: function(d) {
                            return d3.format(',.2f')(d);
                        }
                    }
                },
                title: {
                    text: 'Horizontal Bar Chart',
                    enable: true
                }
            };

            basectrl.init(scope, element, component, attrs, 'hzbarchart').then(function () {
                if (scope.attributes.dynamicOptions) scope.attributes.dynamicOptions.status = "overridden";
                scope.attributes.flex.status = "overridden";

                DfxGcChartUtil.setRunTimeChartNameVariable(scope, basectrl, component, $timeout);

                basectrl.bindScopeVariable(scope, component.attributes.title.value);

                // dynamicOptions is a priority over all static options, title and events (ex. onclick)
                if (scope.attributes.dynamicOptions && scope.attributes.dynamicOptions.value) {
                    scope.attributes.options.value = scope[scope.attributes.dynamicOptions.value];
                } else {
                    scope.attributes.options.value = chartOptions;

                    var eventsList = {
                        onclick: 'elementClick',
                        ondblclick: 'elementDblClick',
                        onmouseover: 'elementMouseover',
                        onmouseleave: 'elementMouseout',
                        onmousemove: 'elementMousemove',
                        onstatechange: 'stateChange',
                        onrenderend: 'renderEnd'
                    };

                    DfxGcChartUtil.setRunTimeAttributes(scope, 'multibar', eventsList, basectrl, $timeout);
                    DfxGcChartUtil.watchRunTimeAttributes(scope, basectrl, $timeout);
                }

                DfxGcChartUtil.adjustContainerHeight(scope);
            });

            DfxGcChartUtil.setAttributesBeforeInit(scope, attrs, chartOptions, chartData);
        }
    }
}]);

dfxGCC.directive('dfxGccWebPiechart', ['$timeout', '$filter', function($timeout, $filter) {
    return {
        restrict: 'A',
        require: '^dfxGccWebBase',
        scope: true,
        link: function(scope, element, attrs, basectrl) {
            var component = scope.getComponent(element);

            var chartData    = [
                {
                    key: "One",
                    y: 5
                },
                {
                    key: "Two",
                    y: 2
                },
                {
                    key: "Three",
                    y: 9
                },
                {
                    key: "Four",
                    y: 7
                },
                {
                    key: "Five",
                    y: 4
                }
            ];
            var chartOptions = {
                chart: {
                    type: 'pieChart',
                    margin : {
                        top: 20,
                        right: 20,
                        bottom: 50,
                        left: 55
                    },
                    x: function(d){return d.key;},
                    y: function(d){return d.y;},
                    showLabels: true,
                    duration: 500,
                    labelThreshold: 0.01,
                    labelSunbeamLayout: true,
                    legend: {
                        margin: {
                            top: 5,
                            right: 5,
                            bottom: 5,
                            left: 0
                        }
                    }
                },
                title: {
                    text: 'Pie Chart',
                    enable: true
                }
            };

            basectrl.init(scope, element, component, attrs, 'piechart').then(function () {
                if (scope.attributes.dynamicOptions) scope.attributes.dynamicOptions.status = "overridden";
                scope.attributes.flex.status = "overridden";

                DfxGcChartUtil.setRunTimeChartNameVariable(scope, basectrl, component, $timeout);

                basectrl.bindScopeVariable(scope, component.attributes.title.value);

                // dynamicOptions is a priority over all static options, title and events (ex. onclick)
                if (scope.attributes.dynamicOptions && scope.attributes.dynamicOptions.value) {
                    scope.attributes.options.value = scope[scope.attributes.dynamicOptions.value];
                } else {
                    scope.attributes.options.value = chartOptions;

                    var eventsList = {
                        onclick: 'elementClick',
                        ondblclick: 'elementDblClick',
                        onmouseover: 'elementMouseover',
                        onmouseleave: 'elementMouseout',
                        onmousemove: 'elementMousemove',
                        onstatechange: 'stateChange',
                        onrenderend: 'renderEnd'
                    };

                    DfxGcChartUtil.setRunTimeAttributes(scope, 'pie', eventsList, basectrl, $timeout);
                    DfxGcChartUtil.watchRunTimeAttributes(scope, basectrl, $timeout);
                }

                DfxGcChartUtil.adjustContainerHeight(scope);
            });

            DfxGcChartUtil.setAttributesBeforeInit(scope, attrs, chartOptions, chartData);
        }
    }
}]);

dfxGCC.directive('dfxGccWebDonutchart', ['$timeout', '$filter', function($timeout, $filter) {
    return {
        restrict: 'A',
        require: '^dfxGccWebBase',
        scope: true,
        link: function(scope, element, attrs, basectrl) {
            var component = scope.getComponent(element);

            var chartData    = [
                {
                    key: "One",
                    y: 5
                },
                {
                    key: "Two",
                    y: 2
                },
                {
                    key: "Three",
                    y: 9
                },
                {
                    key: "Four",
                    y: 7
                },
                {
                    key: "Five",
                    y: 4
                }
            ];
            var chartOptions = {
                chart: {
                    type: 'pieChart',
                    donut: true,
                    margin : {
                        top: 20,
                        right: 20,
                        bottom: 50,
                        left: 55
                    },
                    x: function(d){return d.key;},
                    y: function(d){return d.y;},
                    showLabels: true,
                    donutRatio: 0.35,//default
                    duration: 500,
                    legend: {
                        margin: {
                            top: 5,
                            right: 35,
                            bottom: 5,
                            left: 0
                        }
                    },
                    pie: {
                        startAngle: function(d) { return d.startAngle - Math.PI },
                        endAngle: function(d) { return d.endAngle - Math.PI }
                    }
                },
                title: {
                    text: 'Donut Chart',
                    enable: true
                }
            };

            basectrl.init(scope, element, component, attrs, 'donutchart').then(function () {
                if (scope.attributes.dynamicOptions) scope.attributes.dynamicOptions.status = "overridden";
                scope.attributes.flex.status = "overridden";

                DfxGcChartUtil.setRunTimeChartNameVariable(scope, basectrl, component, $timeout);

                basectrl.bindScopeVariable(scope, component.attributes.title.value);

                // dynamicOptions is a priority over all static options, title and events (ex. onclick)
                if (scope.attributes.dynamicOptions && scope.attributes.dynamicOptions.value) {
                    scope.attributes.options.value = scope[scope.attributes.dynamicOptions.value];
                } else {
                    scope.attributes.options.value = chartOptions;

                    var eventsList = {
                        onclick: 'elementClick',
                        ondblclick: 'elementDblClick',
                        onmouseover: 'elementMouseover',
                        onmouseleave: 'elementMouseout',
                        onmousemove: 'elementMousemove',
                        onstatechange: 'stateChange',
                        onrenderend: 'renderEnd'
                    };

                    DfxGcChartUtil.setRunTimeAttributes(scope, 'pie', eventsList, basectrl, $timeout);
                    DfxGcChartUtil.watchRunTimeAttributes(scope, basectrl, $timeout);
                }

                DfxGcChartUtil.adjustContainerHeight(scope);
            });

            DfxGcChartUtil.setAttributesBeforeInit(scope, attrs, chartOptions, chartData);
        }
    }
}]);

dfxGCC.directive('dfxGccWebLinechart', ['$timeout', '$filter', function($timeout, $filter) {
    return {
        restrict: 'A',
        require: '^dfxGccWebBase',
        scope: true,
        link: function(scope, element, attrs, basectrl) {
            var component = scope.getComponent(element);

            function lineChartDesignData() {
                var sin = [], sin2 = [],
                    cos = [];

                //Data is represented as an array of {x,y} pairs.
                for (var i = 0; i < 100; i++) {
                    sin.push({x: i, y: Math.sin(i / 10)});
                    sin2.push({x: i, y: i % 10 == 5 ? null : Math.sin(i / 10) * 0.25 + 0.5});
                    cos.push({x: i, y: .5 * Math.cos(i / 10 + 2) + Math.random() / 10});
                }

                //Line chart data should be sent as an array of series objects.
                return [
                    {
                        values: sin,      //values - represents the array of {x,y} data points
                        key:    'Sine Wave', //key  - the name of the series.
                        color:  '#ff7f0e'  //color - optional: choose your own line color.
                    },
                    {
                        values: cos,
                        key:    'Cosine Wave',
                        color:  '#2ca02c'
                    },
                    {
                        values: sin2,
                        key:    'Another sine wave',
                        color:  '#7777ff',
                        area:   true      //area - set to true if you want this line to turn into a filled area chart.
                    }
                ];
            };
            var chartData    = lineChartDesignData();

            var chartOptions = {
                chart: {
                    type: 'lineChart',
                    margin : {
                        top: 20,
                        right: 20,
                        bottom: 50,
                        left: 55
                    },
                    x: function(d){return d.x;},
                    y: function(d){return d.y;},
                    useInteractiveGuideline: true,
                    xAxis: {
                        axisLabel: 'X Axis'
                    },
                    yAxis: {
                        axisLabel: 'Y Axis',
                        axisLabelDistance: -10
                    }
                },
                title: {
                    text: 'Line Chart',
                    enable: true
                }
            };

            basectrl.init(scope, element, component, attrs, 'linechart').then(function () {
                if (scope.attributes.dynamicOptions) scope.attributes.dynamicOptions.status = "overridden";
                scope.attributes.flex.status = "overridden";

                DfxGcChartUtil.setRunTimeChartNameVariable(scope, basectrl, component, $timeout);

                basectrl.bindScopeVariable(scope, component.attributes.title.value);

                // dynamicOptions is a priority over all static options, title and events (ex. onclick)
                if (scope.attributes.dynamicOptions && scope.attributes.dynamicOptions.value) {
                    scope.attributes.options.value = scope[scope.attributes.dynamicOptions.value];
                } else {
                    scope.attributes.options.value = chartOptions;

                    var eventsList = {
                        onclick: 'elementClick',
                        onmouseover: 'elementMouseover',
                        onmouseleave: 'elementMouseout',
                        onstatechange: 'stateChange',
                        onrenderend: 'renderEnd'
                    };

                    DfxGcChartUtil.setRunTimeAttributes(scope, 'lines', eventsList, basectrl, $timeout);
                    DfxGcChartUtil.watchRunTimeAttributes(scope, basectrl, $timeout);
                }

                DfxGcChartUtil.adjustContainerHeight(scope);
            });

            DfxGcChartUtil.setAttributesBeforeInit(scope, attrs, chartOptions, chartData);
        }
    }
}]);

dfxGCC.directive('dfxGccWebCmlinechart', ['$timeout', '$filter', function($timeout, $filter) {
    return {
        restrict: 'A',
        require: '^dfxGccWebBase',
        scope: true,
        link: function(scope, element, attrs, basectrl) {
            var component = scope.getComponent(element);

            var chartData    = [
                {
                    key: "Long",
                    values: [ [ 1283227200000, 248.308], [ 1285819200000, 278.148], [ 1288497600000, 292.692], [ 1291093200000, 300.842], [ 1293771600000, 326.172]],
                    mean: 250
                },
                {
                    key: "Short",
                    values: [ [ 1283227200000, -85.397], [ 1285819200000, -94.738], [ 1288497600000, -98.661], [ 1291093200000, -99.609], [ 1293771600000, -103.570]],
                    mean: -60
                }
            ];
            var chartOptions = {
                chart: {
                    type: 'cumulativeLineChart',
                    margin : {
                        top: 20,
                        right: 20,
                        bottom: 50,
                        left: 55
                    },
                    x: function(d){ return d[0]; },
                    y: function(d){ return d[1]/100; },
                    average: function(d) { return d.mean/100; },

                    color: d3.scale.category10().range(),
                    duration: 300,
                    useInteractiveGuideline: true,
                    clipVoronoi: false,
                    interactive: true,
                    rescaleY: true,

                    xAxis: {
                        axisLabel: 'X Axis',
                        tickFormat: function(d) {
                            return d3.time.format('%m/%d/%y')(new Date(d))
                        },
                        showMaxMin: false,
                        staggerLabels: true
                    },

                    yAxis: {
                        tickFormat: function(d){
                            return d3.format(',.1%')(d);
                        },
                        axisLabelDistance: 20
                    }
                },
                title: {
                    text: 'Cumulative Line Chart',
                    enable: true
                }
            };

            basectrl.init(scope, element, component, attrs, 'cmlinechart').then(function () {
                if (scope.attributes.dynamicOptions) scope.attributes.dynamicOptions.status = "overridden";
                scope.attributes.flex.status = "overridden";

                DfxGcChartUtil.setRunTimeChartNameVariable(scope, basectrl, component, $timeout);

                basectrl.bindScopeVariable(scope, component.attributes.title.value);

                // dynamicOptions is a priority over all static options, title and events (ex. onclick)
                if (scope.attributes.dynamicOptions && scope.attributes.dynamicOptions.value) {
                    scope.attributes.options.value = scope[scope.attributes.dynamicOptions.value];
                } else {
                    scope.attributes.options.value = chartOptions;

                    var eventsList = {
                        onclick: 'elementClick',
                        onmouseover: 'elementMouseover',
                        onmouseleave: 'elementMouseout',
                        onstatechange: 'stateChange',
                        onrenderend: 'renderEnd'
                    };

                    DfxGcChartUtil.setRunTimeAttributes(scope, 'interactiveLayer', eventsList, basectrl, $timeout);
                    DfxGcChartUtil.watchRunTimeAttributes(scope, basectrl, $timeout);
                }

                DfxGcChartUtil.adjustContainerHeight(scope);
            });

            DfxGcChartUtil.setAttributesBeforeInit(scope, attrs, chartOptions, chartData);
        }
    }
}]);

dfxGCC.directive('dfxGccWebTextarea', ['$timeout', function($timeout) {
    return {
        restrict: 'A',
        require: '^dfxGccWebBase',
        scope: true,
        link: function(scope, element, attrs, basectrl) {
            var component = scope.$parent.getComponent(element);
            scope.$gcscope = scope;
            basectrl.init(scope, element, component, attrs, 'textarea').then(function(){
                scope.isMaxLength = function() {
                    return scope.attributes.maxlength.value ? true : false;
                };

                if ( !scope.attributes.hasOwnProperty('flex') ) { scope.attributes.flex = { "value": 50 }; }
                scope.attributes.flex.status = "overridden" ;
                scope.attributes.icon.status = "overridden" ;
                scope.$watch('attributes.rowsNumber.value', function(newValue){
                    scope.attributes.rowsNumber.value = parseInt(newValue);
                });
                scope.$watch("$gcscope[attributes.binding.value]", function(newValue){
                    if(scope.attributes.binding.value !== ""){
                        var bindingString = scope.attributes.binding.value;
                        eval("scope." + bindingString + "= newValue ;");
                    }
                });

                basectrl.bindScopeVariable( scope, component.attributes.binding.value );

                if ( typeof scope.attributes.icon === 'string' ) {
                    var tempIcon = scope.attributes.icon;
                    scope.attributes.icon = {
                        "value": tempIcon,
                        "type": scope.attributes.hasOwnProperty('iconType') ? scope.attributes.iconType : 'fa-icon'
                    }
                }
                if ( !scope.attributes.icon.hasOwnProperty('size') ) { scope.attributes.icon.size = 21; }

                scope.changeWidth = function(){
                    var component = angular.element(document.querySelectorAll('[id="' + scope.component_id + '"]'));//for repeatable panels
                    component.css('width', scope.attributes.flex.value + '%');
                };
                scope.changeWidth();
            });
        }
    }
}]);

dfxGCC.directive('dfxGccWebChips', ['$timeout', function($timeout) {
    return {
        restrict: 'A',
        require: '^dfxGccWebBase',
        scope: true,
        link: function(scope, element, attrs, basectrl) {
            var component = scope.$parent.getComponent(element);
            basectrl.init(scope, element, component, attrs, 'chips').then(function(){
                if(!scope.attributes.hasOwnProperty('isBindEmpty')){scope.attributes.isBindEmpty = { "value": true };}
                if(scope.attributes.hasOwnProperty('property1')){delete scope.attributes.property1;}
                if(scope.attributes.hasOwnProperty('property2')){delete scope.attributes.property2;}
                if(scope.attributes.hasOwnProperty('customItems')){delete scope.attributes.customItems;}

                scope.attributes.flex.status = "overridden" ;
                scope.attributes.binding.status = "overridden" ;
                scope.attributes.isBindEmpty.status = "overridden" ;
                scope.attributes.selectedInput.status = "overridden" ;
                scope.attributes.newItem = function(chip) {
                    return { name: chip, type: 'unknown' };
                };
                scope.$watch('attributes.binding.value', function(binding){
                    binding ? scope.attributes.isBindEmpty.value = false : scope.attributes.isBindEmpty.value = true;
                });
                scope.$watch('attributes.selectedInput.value', function(newValue){
                        $timeout(function () {
                            try{
                                scope.chips = '#' + scope.component_id + '> div > md-chips > md-chips-wrap';
                                $(scope.chips).css("padding-top", "8px");
                            }catch(e){
                                /*console.log(e.message);*/
                            }
                        },0);
                    scope.attributes.isBindEmpty.status = "overridden" ;
                });

                scope.attributes.bindEmptyModel = function() {
                    return scope.attributes.defaultArray.value;
                };

                scope.changeWidth = function(){
                    var component = angular.element(document.querySelectorAll('[id="' + scope.component_id + '"]'));//for repeatable panels
                    component.css('width', scope.attributes.flex.value + '%');
                };
                scope.changeWidth();
            });
        }
    }
}]);

dfxGCC.directive('dfxGccWebSlider', ['$timeout', '$mdDialog', '$q', '$http', '$mdToast', '$compile', function($timeout, $mdDialog, $q, $http, $mdToast, $compile) {
    return {
        restrict: 'A',
        require: '^dfxGccWebBase',
        scope: true,
        link: function(scope, element, attrs, basectrl) {
            var component = scope.getComponent(element);
            scope.$gcscope = scope;
            basectrl.init(scope, element, component, attrs, 'slider').then(function(){
                if(!scope.attributes.hasOwnProperty('isBindingPresent')){scope.attributes.isBindingPresent = { "value": "" };}
                if(!scope.attributes.hasOwnProperty('dynamicPresent')){scope.attributes.dynamicPresent = { "value": false };}
                if(!scope.attributes.hasOwnProperty('counterCheck')){scope.attributes.counterCheck = { "value": "" };}
                if(!scope.attributes.hasOwnProperty('selectedIndex')){scope.attributes.selectedIndex = { "value": "" };}
                if ( !scope.attributes.hasOwnProperty('flex') ) { scope.attributes.flex = { "value": 50 }; }
                scope.attributes.binding.status = "overridden";
                scope.attributes.isBindingPresent.status = "overridden";
                scope.attributes.flex.status = "overridden";
                scope.attributes.buttonClass.value = scope.attributes.buttonClass.value.replace("md-primary", "");

                if(scope.attributes.isBindingPresent.value){
                    if(scope.$gcscope[scope.attributes.binding.value] instanceof Array){
                        for(var i = 0; i < scope.$gcscope[scope.attributes.binding.value].length; i++){
                            if(!isNaN(scope.$gcscope[scope.attributes.binding.value][i][scope.attributes.displayValue.value])){
                                scope.$gcscope[scope.attributes.binding.value][i][scope.attributes.displayValue.value] = parseInt(scope.$gcscope[scope.attributes.binding.value][i][scope.attributes.displayValue.value]);
                            }else{
                                /*console.log('Values should be numeric.');*/
                                break;
                            }
                        }
                    }else{
                        /*console.log('Binding data should be an array.');*/
                    }
                }

                if(scope.attributes.inputVisible.value === ""){
                    scope.attributes.inputVisible.value = "true";
                    scope.attributes.discrete.value = false;
                    scope.attributes.selectedIndex.value = 0;
                    scope.attributes.counterCheck.value = 1;
                    scope.attributes.isBindingPresent.value = false;
                }

                scope.$watch('attributes.selectedIndex.value', function(newValue){
                    scope.attributes.selectedIndex.status = "overridden";
                    scope.attributes.selectedIndex.value = parseInt(newValue);
                });

                scope.$watch('attributes.binding.value', function(newValue){
                    if(newValue){
                        scope.attributes.isBindingPresent.value = true;
                    }else{
                        scope.attributes.isBindingPresent.value = false;
                    }
                });

                scope.$watch('attributes.source.value', function(newValue){
                    if(newValue){
                        scope.attributes.dynamicPresent.value = true;
                    }else{
                        scope.attributes.dynamicPresent.value = false;
                    }
                });

                basectrl.bindScopeVariable(scope, component.attributes.binding.value);
                basectrl.bindScopeVariable(scope, component.attributes.source.value);

                scope.getStaticItems = function() {
                    return scope.attributes.slidersArray.value;
                };

                scope.changeWidth = function(){
                    var component = angular.element(document.querySelectorAll('[id="' + scope.component_id + '"]'));//for repeatable panels
                    component.css('width', scope.attributes.flex.value + '%');
                };
                scope.changeWidth();
            });
        }
    }
}]);

dfxGCC.directive('dfxGccWebInput', ['$timeout', '$compile', function($timeout, $compile) {
    return {
        restrict: 'A',
        require: '^dfxGccWebBase',
        scope: true,
        link: function(scope, element, attrs, basectrl) {
            var component = scope.$parent.getComponent(element);
            scope.$gcscope = scope;
            basectrl.init(scope, element, component, attrs, 'input').then(function(){
                scope.attributes.binding.status = 'overridden';
                if ( !scope.attributes.hasOwnProperty('flex') ) { scope.attributes.flex = { "value": 50 }; }
                scope.attributes.flex.status = "overridden";
                scope.attributes.minlength.value = parseInt(scope.attributes.minlength.value);
                scope.attributes.maxlength.value = parseInt(scope.attributes.maxlength.value);
                scope.attributes.minNumber.value = parseInt(scope.attributes.minNumber.value);
                scope.attributes.maxNumber.value = parseInt(scope.attributes.maxNumber.value);

                scope.bindingType = {"value": "noBinding"};
                if(scope.attributes.binding.value!==''){
                    if(scope.attributes.binding.value.indexOf('$dfx_item') >-1 || scope.attributes.binding.value.indexOf('.') > -1 || scope.attributes.binding.value.indexOf('[') > -1) {
                        scope.bindingType.value = "complexBinding";
                    } else {
                        scope.bindingType.value = "simpleBinding";
                    }
                }
                scope.isSimpleIcon = {"value": true};
                if(scope.attributes.icon.value!==''){
                    if(scope.attributes.icon.value.indexOf('$dfx_item')>-1){
                        scope.isSimpleIcon.value = false;
                        scope.attributes.icon.value = '' + scope.attributes.icon.value;
                    }else if(scope.attributes.icon.value.indexOf(".")>-1 || scope.attributes.icon.value.indexOf("[")>-1){
                        scope.isSimpleIcon.value = false;
                        scope.attributes.icon.value = '$parent_scope.' + scope.attributes.icon.value;
                    }
                }
                $timeout(function() {
                    if(scope.attributes.selectedType.value!=='number'){
                        if (!scope.attributes.minlength.value){
                            $("#"+component.id+' input').removeAttr('minlength');
                        }
                        if (!scope.attributes.maxlength.value){
                            $("#"+component.id+' input').removeAttr('md-maxlength');
                        }
                    } else {
                        if (!scope.attributes.minNumber.value){
                            $("#"+component.id+' input').removeAttr('min');
                        }
                        if (!scope.attributes.maxNumber.value){
                            $("#"+component.id+' input').removeAttr('max');
                        }
                    }
                }, 0);

                if ( typeof scope.attributes.icon === 'string' ) {
                    var tempIcon = scope.attributes.icon;
                    scope.attributes.icon = {
                        "value": tempIcon,
                        "type": scope.attributes.hasOwnProperty('iconType') ? scope.attributes.iconType : 'fa-icon'
                    }
                }
                if ( !scope.attributes.icon.hasOwnProperty('size') ) { scope.attributes.icon.size = 21; }

                scope.changeWidth = function(){
                    var component = angular.element(document.querySelectorAll('[id="' + scope.component_id + '"]'));//for repeatable panels
                    component.css('width', scope.attributes.flex.value + '%');
                };
                scope.changeWidth();
            });
        }
    }
}]);

dfxGCC.directive('dfxGccWebFab', ['$timeout', function($timeout) {
	return {
        restrict: 'A',
        require: '^dfxGccWebBase',
        scope: true,
		link: {
			pre : function(scope, element, attrs, basectrl) {
				var component = scope.getComponent(element);
				scope.component_id = component.id;
				basectrl.init(scope, element, component, attrs, 'fab').then(function() {
					scope.attributes.dynamicPresent.status = "overridden";
					scope.attributes.dynamic.status = "overridden";
					scope.attributes.icon.status = "overridden";
					scope.attributes.menuItemsType.status = "overridden";
					scope.attributes.menuItemNames.status = "overridden";
					scope.itemNames = scope.attributes.menuItemNames.value;

					if(scope.attributes.dynamicPresent.value){
						scope.dynamicItems = eval('scope.' + scope.attributes.dynamic.value);
						try{
							if(scope.dynamicItems.constructor === Array ){
								if(scope.dynamicItems.length > 0){
									scope.attributes.dynamicPresent.value = true;
								}else{
									scope.attributes.dynamicPresent.value = false;
								}
							}else{
								scope.attributes.dynamicPresent.value = false;
							}
						}catch(e){
							scope.attributes.dynamicPresent.value = false;
						}
					}else{
						scope.attributes.dynamicPresent.value = false;
					}
					scope.cleanFabClasses = function( fab ){
						if ( fab.class.indexOf('md-fab') > -1 ) { fab.class = fab.class.replace('md-fab', ""); }
						if ( fab.class.indexOf('md-raised') > -1 ) { fab.class = fab.class.replace('md-raised', ""); }
						if ( fab.class.indexOf('md-mini') > -1 ) { fab.class = fab.class.replace('md-mini', ""); }
					}
					scope.cleanFabClasses(scope.attributes.triggerButton);
					scope.cleanFabClasses(scope.attributes.actionButton);
					if ( !scope.attributes.hasOwnProperty('label') ) {scope.attributes.label = {"value":""}}
					if ( !scope.attributes.triggerButton.hasOwnProperty('tooltip') ) {scope.attributes.triggerButton.tooltip = { "direction": "top", "style": "", "classes": "" }}
					if ( !scope.attributes.actionButton.hasOwnProperty('tooltip') ) {scope.attributes.actionButton.tooltip = { "direction": "top", "style": "", "classes": "" }}
					if ( !scope.attributes.icon.hasOwnProperty('size') ) { scope.attributes.icon.size = 24; }
					if ( !scope.attributes.actionButton.icon.hasOwnProperty('size') ) { scope.attributes.actionButton.icon.size = 20; }
					if ( !scope.attributes.icon.hasOwnProperty('type') ) { scope.attributes.icon.type = 'fa-icon'; }
					scope.ifShowIconTypes = function( icon ) {
						var regexp = /(^\')(.*)(\'$)/gm, filtered = regexp.exec( icon );
						if ( icon && ( icon.indexOf('+') >= 0 ) ) { filtered = false; }
						if ( icon === '' ) { filtered = true; }
						if ( icon.indexOf("'") === 0 && icon.indexOf('+') === -1 && icon.charAt(icon.length-1) === "'" ) {
							icon.indexOf("'fa-") === 0 ? scope.attributes.icon.type = 'fa-icon' : scope.attributes.icon.type = 'svg-icon';
						}
						scope.showIconTypes = filtered ? false : true;
					}
					scope.ifShowIconTypes(scope.attributes.icon.value);
					scope.checkIconType = function( menuList ) {
						for (var i = 0; i < menuList.length; i++) {
							if ( typeof menuList[i].icon === 'string' ) {
								var tempIcon = menuList[i].icon;
								menuList[i].icon = {
									"value": tempIcon,
									"type": menuList[i].hasOwnProperty('iconType') ? menuList[i].iconType : 'fa-icon'
								}
							}
						}
					}
					scope.checkIconType( scope.attributes.menuItems.value );
					if(scope.attributes.dynamicPresent.value){
						scope.attributes.menuItems.value = scope.dynamicItems;
					}
					scope.hideTooltip = function () {
						$('body md-tooltip').remove();
					}
					scope.hideTooltip();
				});
			}
		}
    }
}]);

dfxGCC.directive('dfxGccWebCheckbox', ['$timeout', '$compile', function($timeout, $compile) {
    return {
        restrict: 'A',
        require: '^dfxGccWebBase',
        scope: true,
        link: function(scope, element, attrs, basectrl) {
            var component = scope.$parent.getComponent(element);
            basectrl.init(scope, element, component, attrs, 'checkbox').then(function(){
                scope.dfxCheckValueType = function(val){
                    if(typeof val === 'string') val="'"+val+"'";
                    return val;
                }
            });
        }
    }
}]);

dfxGCC.directive('dfxGccWebSwitch', ['$timeout', '$compile', function($timeout, $compile) {
    return {
        restrict: 'A',
        require: '^dfxGccWebBase',
        scope: true,
        link: function(scope, element, attrs, basectrl) {
            var component = scope.$parent.getComponent(element);
            basectrl.init(scope, element, component, attrs, 'switch').then(function(){
                scope.dfxCheckValueType = function(val){
                    if(typeof val === 'string') val="'"+val+"'";
                    return val;
                }
            });
        }
    }
}]);

dfxGCC.directive('dfxGccWebRadio', ['$timeout', '$compile', function($timeout, $compile) {
    return {
        restrict: 'A',
        require: '^dfxGccWebBase',
        scope: true,
        link: function(scope, element, attrs, basectrl) {
            var component = scope.$parent.getComponent(element);
            basectrl.init(scope, element, component, attrs, 'radio').then(function(){});
        }
    }
}]);

dfxGCC.directive('dfxGccWebSelect', ['$timeout', '$compile', function($timeout, $compile) {
    return {
        restrict: 'A',
        require: '^dfxGccWebBase',
        scope: true,
        link: function(scope, element, attrs, basectrl) {
            var component = scope.$parent.getComponent(element);
            basectrl.init(scope, element, component, attrs, 'select').then(function(){
                scope.changeWidth = function(){
                    var component = angular.element(document.querySelectorAll('[id="' + scope.component_id + '"]'));//for repeatable panels
                    component.css('width', scope.attributes.flex.value + '%');
                };
                scope.changeWidth();
                scope.hideWebGcSelectMask = function() {
                    $('body > md-backdrop, body > div.md-scroll-mask, body > div.md-select-menu-container.md-active').fadeOut(250);
                }
                $('body > md-backdrop').on('click', function(){ scope.hideWebGcSelectMask(); });
            });
        }
    }
}]);

dfxGCC.directive('dfxGccWebList', ['$timeout', '$compile', function($timeout, $compile) {
    return {
        restrict:    'A',
        require:     '^dfxGccWebBase',
        scope:       true,
        link: function (scope, element, attrs, basectrl) {
            var component = scope.$parent.getComponent(element);
            basectrl.init(scope, element, component, attrs, 'list').then(function () {
                scope.togglingArray = [];
                scope.selected_items = [];
                scope.selected_indexes = [];
                scope.sourceList = {"value": []};
                scope.itemSelected = function(it){
                    return scope.selected_items.indexOf(it) > -1;
                }
                Array.prototype.max_value = function() {
                    return Math.max.apply(null, this);
                };
                Array.prototype.min_value = function() {
                    return Math.min.apply(null, this);
                };
                scope.toggleItem = function(e, it, curr_ind){
                    var it_is = scope.selected_items.indexOf(it),
                        min_ind = scope.selected_indexes.min_value(),
                        max_ind = scope.selected_indexes.max_value();
                    if(e.shiftKey && scope.selected_items.length>0) {
                        scope.selected_items = [];
                        scope.selected_indexes = [];
                        if(curr_ind > min_ind){
                            scope.selected_items = scope.togglingArray.slice(min_ind, curr_ind+1);
                        }else if(curr_ind < max_ind){
                            scope.selected_items = scope.togglingArray.slice(curr_ind, max_ind+1);
                        }
                        angular.forEach(scope.selected_items, function(obj, index){
                            var tempIndex = scope.togglingArray.indexOf(obj);
                            scope.selected_indexes.push(tempIndex);
                        });
                    }else{
                        if (it_is === -1) {
                            scope.selected_items.push(it);
                            scope.selected_indexes.push(curr_ind);
                        } else {
                            var delIndex = scope.selected_indexes.indexOf(curr_ind);
                            scope.selected_items.splice(it_is, 1);
                            scope.selected_indexes.splice(delIndex, 1);
                        }
                    }
                    scope.$parent_scope[scope.attributes.selected.value] = scope.selected_items;
                }
                if(scope.attributes.optionsType.value === 'dynamic'){
                    scope.togglingArray = scope.$parent_scope[scope.attributes.optionItemNames.value.source];
                }else{
                    scope.togglingArray = scope.attributes.static.value;
                }
                scope.changeWidth = function(){
                    var component = angular.element(document.querySelectorAll('[id="' + scope.component_id + '"]'));//for repeatable panels
                    component.css('width', scope.attributes.flex.value + '%');
                };
                scope.changeWidth();
            });
        }
    }
}]);

dfxGCC.directive('dfxGccWebRichtext', function($timeout, $compile) {
    return {
        restrict: 'A',
        require: '^dfxGccWebBase',
        scope: true,
        link: function(scope, element, attrs, basectrl) {
            var component = scope.getComponent(element);
            scope.$gcscope = scope;
            basectrl.init(scope, element, component, attrs, 'richtext').then(function() {
                scope.attributes.bindedData.status = "overridden";
                scope.attributes.toolbar.status = "overridden";
                scope.attributes.flex.status = "overridden";
                $(element).css('opacity', 0);
                scope.changeWidth = function(){
                    var component = angular.element(document.querySelectorAll('[id="' + scope.component_id + '"]'));//for repeatable panels
                    component.css('width', scope.attributes.flex.value + '%');
                };
                scope.changeWidth();

                var dfxRichText = '<ng-quill-editor name="'+scope.attributes.name.value+'" ';
                dfxRichText += scope.attributes.binding.value !== '' ? 'ng-model="'+scope.attributes.binding.value+'" ' : 'ng-model="attributes.bindedData.value" ';

                dfxRichText += 'toolbar-entries="<<toolbarEntries>>" toolbar="true" show-toolbar="'+scope.attributes.toolbar.visible.value+'" link-tooltip="true" image-tooltip="true" editor-required="true" required="" error-class="input-error" class="dfx-core-gc-richtext"';

                dfxRichText += scope.attributes.display.value !=='' ? 'ng-show="'+scope.attributes.display.value+'" ' : '';
                dfxRichText += scope.attributes.disabled.value !=='' ? 'read-only="'+scope.attributes.disabled.value+'" ' : '';
                dfxRichText += scope.attributes.dynamicClasses.value !=='' ? 'ng-class="'+scope.attributes.dynamicClasses.value+'" ' : '';
                dfxRichText += scope.attributes.onchange.value !=='' ? 'ng-change="'+scope.attributes.onchange.value+'" ' : '';
                dfxRichText += scope.attributes.onfocus.value !=='' ? 'ng-focus="'+scope.attributes.onfocus.value+'" ' : '';
                dfxRichText += scope.attributes.onblur.value !=='' ? 'ng-blur="'+scope.attributes.onblur.value+'" ' : '';
                dfxRichText += scope.attributes.onclick.value !=='' ? 'ng-click="'+scope.attributes.onclick.value+'" ' : '';
                dfxRichText += scope.attributes.ondblclick.value !=='' ? 'ng-dblclick="'+scope.attributes.ondblclick.value+'" ' : '';
                dfxRichText += scope.attributes.onkeypress.value !=='' ? 'ng-keypress="'+scope.attributes.onkeypress.value+'" ' : '';
                dfxRichText += scope.attributes.onkeydown.value !=='' ? 'ng-keydown="'+scope.attributes.onkeydown.value+'" ' : '';
                dfxRichText += scope.attributes.onkeyup.value !=='' ? 'ng-keyup="'+scope.attributes.onkeyup.value+'" ' : '';
                dfxRichText += scope.attributes.onmouseover.value !=='' ? 'ng-mouseover="'+scope.attributes.onmouseover.value+'" ' : '';
                dfxRichText += scope.attributes.onmouseenter.value !=='' ? 'ng-mouseenter="'+scope.attributes.onmouseenter.value+'" ' : '';
                dfxRichText += scope.attributes.onmousemove.value !=='' ? 'ng-mousemove="'+scope.attributes.onmousemove.value+'" ' : '';
                dfxRichText += scope.attributes.onmouseleave.value !=='' ? 'ng-mouseleave="'+scope.attributes.onmouseleave.value+'" ' : '';
                dfxRichText += scope.attributes.onmousedown.value !=='' ? 'ng-mousedown="'+scope.attributes.onmousedown.value+'" ' : '';
                dfxRichText += scope.attributes.onmouseup.value !=='' ? 'ng-mouseup="'+scope.attributes.onmouseup.value+'"' : '';

                dfxRichText += '></ng-quill-editor>';
                scope.rebuildQuillEditor = function(){
                    dfxRichText = dfxRichText.replace('<<toolbarEntries>>', scope.quillEditorEntries);
                    $("." + component.id + "_ng_quill_editor").html(dfxRichText);
                    $timeout(function(){
                        $compile($("." + component.id + "_ng_quill_editor").contents())(scope);
                    }, 0).then(function(){
                        $timeout(function() {
                            $(element).css('opacity', 1);
                        }, 250);
                    });
                };
                scope.rebuildQuillEntries = function(){
                    scope.quillEditorEntries = '';
                    for ( var i = 0; i < scope.attributes.toolbar.entries.value.length; i++ ) {
                        if ( scope.attributes.toolbar.entries.value[i].value === true ) {
                            for ( var j = 0; j < scope.attributes.toolbar.entries.value[i].entries.length; j++ ) {
                                scope.quillEditorEntries = scope.quillEditorEntries + ' ' + scope.attributes.toolbar.entries.value[i].entries[j];
                            }
                        }
                    }
                    scope.rebuildQuillEditor();
                };
                $timeout(function(){
                    scope.rebuildQuillEntries();
                }, 0);

                scope.$on("editorCreated", function (event, quillEditor) {
                    scope.$parent_scope.$watch('$parent_scope[attributes.binding.value]', function(newValue, oldValue) {
                        if ( newValue && angular.equals(newValue, oldValue) ) {
                            $timeout(function(){
                                quillEditor.setHTML(newValue);
                            }, 0);
                        }
                    }, true);
                });
                basectrl.bindScopeVariable( scope, component.attributes.binding.value );
            });
        }
    }
});

dfxGCC.directive('dfxGccWebJson', ['$http', '$sce', '$mdDialog', '$timeout', '$compile', '$parse', 'dfxMessaging', function($http, $sce, $mdDialog, $timeout, $compile, $parse, dfxMessaging) {
    return {
        restrict: 'A',
        require: '^dfxGccWebBase',
        scope: true,
        link: function(scope, element, attrs, basectrl) {
            var component = scope.getComponent(element);
            scope.$gcscope = scope;
            basectrl.init(scope, element, component, attrs, 'gc_json').then(function() {
                scope.attributes.flex.status = 'overridden';
                scope.attributes.type.status = 'overridden';
                scope.attributes.mode.status = 'overridden';
                if(scope.attributes.binding.value!==''){scope.attributes.binding.status = 'overridden';}
                if(scope.attributes.binding.value!==''){scope.attributes.binding.status = 'overridden';}
                if(!scope.attributes.hasOwnProperty('headerVisible')){scope.attributes.headerVisible = {"value":true};}
                scope.stringModel = {"value":""};
                scope.viewDialog = { "mode": false };
                scope.dfxJeOnChange = function(){
                    var dfxJeChanged = scope.dfxJsonEditor.get();
                    if(scope.attributes.binding.value!==''){
                        if(!angular.equals(scope.$gcscope[scope.attributes.binding.value], dfxJeChanged)){
                            scope.$gcscope[scope.attributes.binding.value] = dfxJeChanged;
                            scope.stringModel.value = angular.toJson(dfxJeChanged);
                            eval(scope.attributes.onchange.value);
                            // console.log('*******onChange******', scope.dfxJsonEditor.get());
                            // dfxMessaging.showMessage(scope.dfxJsonEditor.get());
                        }
                    }else{
                        if(!angular.equals(scope.attributes.content.value, dfxJeChanged)){
                            scope.attributes.content.value = dfxJeChanged;
                            scope.stringModel.value = angular.toJson(dfxJeChanged);
                            eval(scope.attributes.onchange.value);
                            // console.log('*******onChange******', scope.dfxJsonEditor.get());
                            // dfxMessaging.showMessage(scope.dfxJsonEditor.get());
                        }
                    }
                }
                scope.dfxJeOnModeChange = function( newMode, oldMode ){
                    eval(scope.attributes.onmodechange.value);
                    if (!scope.isDisabled){
                        scope.lastMode = newMode;
                    }
                    // console.log('*******onModeChange******', 'Mode switched from '+oldMode+' to '+newMode);
                    // dfxMessaging.showMessage('Mode switched from '+oldMode+' to '+newMode);
                }
                scope.dfxJeOnError = function( err ){
                    eval(scope.attributes.onerror.value);
                    // console.log('*******onError******', ''+err);
                    // dfxMessaging.showError(''+err);
                }
                scope.checkHeaderVisibility = function () {
                    var panelToolbar = $('#'+component.id+' md-toolbar.dfx-je-toolbar'),
                        panelBody = $('#'+component.id+' div.jsoneditor-outer');
                    if(!scope.attributes.headerVisible.value){
                        panelToolbar.hide();
                        panelBody.css({'margin':0,"padding":0});
                    }else{
                        panelToolbar.show();
                        panelBody.css({'margin':"-48px 0 0","padding":"48px 0 0"});
                    }
                }
                scope.runJsonEditor = function( container, mode, model ){
                    scope.dfxJsonEditor = null;
                    var options = {
                        mode:           mode,
                        modes:          ['tree','form','code','text','view'],
                        history:        true,
                        onChange:       function(){scope.dfxJeOnChange();},
                        onModeChange:   function(newMode, oldMode){scope.dfxJeOnModeChange(newMode,oldMode);},
                        onError:        function(err){scope.dfxJeOnError(err);}
                    }
                    $timeout(function() {
                        scope.dfxJsonEditor = new JSONEditor(container, options, model);
                        scope.checkHeaderVisibility();
                        scope.lastMode = mode;
                    }, 0);
                }
                scope.inputToJson = function(){
                    try {
                        if(JSON.parse(scope.stringModel.value)){
                            var inputJson = angular.fromJson(scope.stringModel.value);
                            if(scope.attributes.binding.value!==''){
                                if(!angular.equals(scope.$gcscope[scope.attributes.binding.value], inputJson)) {
                                    scope.$gcscope[scope.attributes.binding.value] = inputJson;
                                }
                            }else{
                                if(!angular.equals(scope.attributes.content.value, inputJson)) {
                                    scope.attributes.content.value = inputJson;
                                }
                            }
                            angular.element($('#'+component.id+'_scopeInput')).data('$ngModelController').$setValidity('editorInput', true);
                        }
                    }
                    catch(err) {
                        angular.element($('#'+component.id+'_scopeInput')).data('$ngModelController').$setValidity('editorInput', false);
                    }
                }
                scope.showJsonDialog = function(ev) {
                    $mdDialog.show({
                        scope: scope.$new(),
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose: true,
                        ariaLabel: 'dialog-json-editor',
                        templateUrl: '/gcontrols/web/gc_json_dialog.html',
                        onComplete: function() {
                            var container = document.getElementById(component.id+'_dfx_json_editor_dialog_panel');
                            if(container){
                                $(container).empty();
                                if (scope.attributes.binding.value!==''){
                                    scope.runJsonEditor(container, scope.attributes.mode.value, scope.$gcscope[scope.attributes.binding.value]);
                                } else {
                                    scope.runJsonEditor(container, scope.attributes.mode.value, scope.attributes.content.value);
                                }
                                $(".dfx-dialog-json-editor .dfx-web-gc-json-dialog-tab").fadeIn();
                            }
                        },
                        controller: function() {
                            scope.closeJsonDialog = function() {
                                $mdDialog.hide();
                            }
                        }
                    });
                }
                scope.buildJsonEditor = function(){
                    if(scope.attributes.type.value==='panel'){
                        $timeout(function() {
                            var container = document.getElementById(component.id+'_dfx_gc_web_json_panel');
                            if(container){
                                scope.runJsonEditor(container, scope.attributes.mode.value, scope.attributes.content.value);
                            }
                        }, 0);
                    }
                }

                if (scope.attributes.type.value==='panel') {
                    $timeout(function() {
                        var container = document.getElementById(component.id+'_dfx_gc_web_json_panel');
                        if (container){
                            $(container).empty();
                            if (scope.attributes.binding.value!==''){
                                scope.runJsonEditor(container, scope.attributes.mode.value, scope.$gcscope[scope.attributes.binding.value]);
                            } else {
                                scope.runJsonEditor(container, scope.attributes.mode.value, scope.attributes.content.value);
                            }
                            $timeout(function() {
                                if(eval('scope.'+scope.attributes.disabled.value)){
                                    scope.dfxJsonEditor.setMode('view');
                                    $timeout(function() {
                                        var initModeBtn = $("#" + component.id + "_dfx_gc_web_json_panel button.jsoneditor-modes");
                                        $(initModeBtn).attr('disabled', true);
                                    }, 0);
                                }else{
                                }
                                // $compile($('#'+component.id+'_dfx_gc_web_json_panel md-toolbar'))(scope);
                            }, 0);
                        }
                        scope.$watch(scope.attributes.disabled.value, function(newValue){
                            if(scope.dfxJsonEditor){
                                if(eval(newValue)){
                                    scope.isDisabled = true;
                                    scope.dfxJsonEditor.setMode('view');
                                    var modeBtn = $("#" + component.id + "_dfx_gc_web_json_panel button.jsoneditor-modes");
                                    $(modeBtn).attr('disabled',true);
                                } else {
                                    scope.isDisabled = false;
                                    scope.dfxJsonEditor.setMode(scope.lastMode);
                                    var modeBtn = $("#" + component.id + "_dfx_gc_web_json_panel button.jsoneditor-modes");
                                    $(modeBtn).attr('disabled',false);
                                }
                            }
                        }, true);
                    }, 0);
                } else {
                    if(scope.attributes.binding.value!==''){
                        scope.stringModel.value = angular.toJson(scope.$gcscope[scope.attributes.binding.value]);
                    }else{
                        scope.stringModel.value = angular.toJson(scope.attributes.content.value);
                    }
                }
                if(scope.attributes.binding.value!==''){
                    basectrl.bindScopeVariable(scope, component.attributes.binding.value);
                    scope.$watch('$gcscope[attributes.binding.value]', function(newValue){
                        if (newValue) {
                            if (scope.dfxJsonEditor) {
                                var editorData = scope.dfxJsonEditor.get();
                                if(!angular.equals(newValue, editorData)) {
                                    scope.dfxJsonEditor.set(newValue);
                                }
                            }
                            scope.stringModel.value = angular.toJson(newValue);
                        }
                    }, true);
                }

                scope.changeWidth = function(){
                    var component = angular.element(document.querySelectorAll('[id="' + scope.component_id + '"]'));//for repeatable panels
                    component.css('width', scope.attributes.flex.value + '%');
                };
                scope.changeWidth();
            });
        }
    }
}]);

dfxGCC.directive('dfxGccWebIconbar', ['$mdMenu', '$timeout', '$compile', '$filter', function($mdMenu, $timeout, $compile, $filter) {
    return {
        restrict: 'A',
        require: '^dfxGccWebBase',
        scope: true,
        link: function(scope, element, attrs, basectrl) {
            var component = scope.getComponent(element);
            basectrl.init(scope, element, component, attrs, 'iconbar').then(function(){
                scope.attributes.dynamicPresent = { "value": false };
                scope.attributes.dynamicPresent.status = "overridden";
                if (scope.attributes.dynamic.value.length>0){scope.attributes.dynamic.status = "overridden";}
                scope.attributes.layoutType = { "value": "none" };
                scope.attributes.statable = true;
                scope.attributes.menuItemsType.status = "overridden";
                scope.attributes.menuItemNames.status = "overridden";
                scope.itemNames = scope.attributes.menuItemNames.value;
                scope.attributes.dynamicPresent.value = scope.attributes.dynamic.value.length > 0 ? true : false;
                var rootMenuItem = '<button ng-click="{{itemClick}}" ng-show="{{itemDisplay}}" ng-disabled="{{itemDisabled}}" menu-index="{{itemIndex}}" aria-label="md-icon-button" style="{{attributes.rootMenu.button.style}}" class="dfx-core-gc-iconbar-button md-icon-button {{attributes.rootMenu.button.class}}">'+
                    '<i ng-if="{{notState}}">'+
                        '<md-icon ng-if="{{ifFaIcon}}" class="fa {{faIcon}} {{attributes.rootMenu.icon.class}}" style="font-size:{{attributes.rootMenu.icon.size}}px; {{attributes.rootMenu.icon.style}}"></md-icon>'+
                        '<ng-md-icon ng-if="{{ifSvgIcon}}" icon="{{svgIcon}}" size="{{attributes.rootMenu.icon.size}}" style="{{attributes.rootMenu.icon.style}}" class="{{attributes.rootMenu.icon.class}}"></ng-md-icon>'+
                    '</i>'+
                    '<i ng-if="{{isState}}">'+
                        '<i ng-if="{{trueState}}">'+
                            '<md-icon ng-if="{{ifTrueStateFaIcon}}" class="fa {{trueStateFaIcon}} {{attributes.rootMenu.icon.class}} {{trueStateFaIconClass}}" style="font-size:{{attributes.rootMenu.icon.size}}px; {{attributes.rootMenu.icon.style}}; {{trueStateFaIconStyle}}"></md-icon>'+
                            '<ng-md-icon ng-if="{{ifTrueStateSvgIcon}}" icon="{{trueStateSvgIcon}}" size="{{attributes.rootMenu.icon.size}}" style="{{attributes.rootMenu.icon.style}}; {{trueStateSvgIconStyle}}" class="{{attributes.rootMenu.icon.class}} {{trueStateSvgIconClass}}"></ng-md-icon>'+
                        '</i>'+
                        '<i ng-if="!{{falseState}}">'+
                            '<md-icon ng-if="{{ifFalseStateFaIcon}}" class="fa {{falseStateFaIcon}} {{attributes.rootMenu.icon.class}} {{falseStateFaIconClass}}" style="font-size:{{attributes.rootMenu.icon.size}}px; {{attributes.rootMenu.icon.style}}; {{falseStateFaIconStyle}}"></md-icon>'+
                            '<ng-md-icon ng-if="{{ifFalseStateSvgIcon}}" icon="{{falseStateSvgIcon}}" size="{{attributes.rootMenu.icon.size}}" style="{{attributes.rootMenu.icon.style}}; {{falseStateSvgIconStyle}}" class="{{attributes.rootMenu.icon.class}} {{falseStateSvgIconClass}}"></ng-md-icon>'+
                        '</i>'+
                    '</i>'+
                '</button>',
                singleMenuItem = '<md-button ng-show="{{itemDisplay}}" ng-disabled="{{itemDisabled}}" ng-click="{{itemClick}}" menu-index="{{itemIndex}}" class="dfx-menu-button {{attributes.singleMenu.button.class}}" aria-label="iconbar-button" style="{{attributes.singleMenu.button.style}}">'+
                    '<i ng-if="{{notState}}">'+
                        '<md-icon ng-if="{{ifFaIcon}}" class="fa {{faIcon}} dfx-menu-button-icon {{attributes.singleMenu.icon.class}}" style="font-size:{{attributes.singleMenu.icon.size}}px; {{attributes.singleMenu.icon.style}}"></md-icon>'+
                        '<ng-md-icon ng-if="{{ifSvgIcon}}" icon="{{svgIcon}}" size="{{attributes.singleMenu.icon.size}}" class="dfx-menu-button-icon {{attributes.singleMenu.icon.class}}" style="{{attributes.singleMenu.icon.style}}"></ng-md-icon>'+
                    '</i>'+
                    '<i ng-if="{{isState}}">'+
                        '<i ng-if="{{trueState}}">'+
                            '<md-icon ng-if="{{ifTrueStateFaIcon}}" class="fa {{trueStateFaIcon}} dfx-menu-button-icon {{attributes.singleMenu.icon.class}} {{trueStateFaIconClass}}" style="font-size:{{attributes.singleMenu.icon.size}}px; {{attributes.singleMenu.icon.style}}; {{trueStateFaIconStyle}}"></md-icon>'+
                            '<ng-md-icon ng-if="{{ifTrueStateSvgIcon}}" icon="{{trueStateSvgIcon}}" size="{{attributes.singleMenu.icon.size}}" class="dfx-menu-button-icon {{attributes.singleMenu.icon.class}} {{trueStateSvgIconClass}}" style="{{attributes.singleMenu.icon.style}}; {{trueStateSvgIconStyle}}"></ng-md-icon></i>'+
                        '</i>'+
                        '<i ng-if="!{{falseState}}">'+
                            '<md-icon ng-if="{{ifFalseStateFaIcon}}" class="fa {{falseStateFaIcon}} dfx-menu-button-icon {{attributes.singleMenu.icon.class}} {{falseStateFaIconClass}}" style="font-size:{{attributes.singleMenu.icon.size}}px; {{attributes.singleMenu.icon.style}}; {{falseStateFaIconStyle}}"></md-icon>'+
                            '<ng-md-icon ng-if="{{ifFalseStateSvgIcon}}" icon="{{falseStateSvgIcon}}" size="{{attributes.singleMenu.icon.size}}" class="dfx-menu-button-icon {{attributes.singleMenu.icon.class}} {{falseStateSvgIconClass}}" style="{{attributes.singleMenu.icon.style}}; {{falseStateSvgIconStyle}}"></ng-md-icon></i>'+
                        '</i>'+
                    '</i>'+
                    '<span>{{itemLabel}}</span>'+
                    '<span class="md-alt-text">{{itemShortcut}}</span>'+
                    '<small ng-if="{{ifItemNotification}}">{{itemNotification}}</small>'+
                '</md-button>',
                iconbarMenuItem =   '<md-menu-item ng-if="{{itemDisplay}}">';
                scope.changeState = function( itemIndexes, ev, optionsType ) {
                    var levels = JSON.parse('['+itemIndexes+']');
                    var bridge = optionsType === 'static' ? '.menuItems.value' : '.'+scope.itemNames.main.scopeItems,
                        stateElement = '',
                        stateObject = {};
                    for ( var i = 0; i < levels.length; i++ ) {
                        if ( i === 0 ) {
                            stateElement = stateElement + '['+ levels[i] + ']';
                        } else {
                            stateElement = stateElement + bridge + '['+ levels[i] + ']';
                        }
                    }
                    if ( optionsType === 'dynamic' ) {
                        stateObject = eval('scope.$parent_scope.'+scope.itemNames.main.source+stateElement+'.'+scope.itemNames.state.name);
                    } else {
                        stateObject = eval('scope.attributes.menuItems.value'+stateElement).state;
                    }
                    if ( stateObject.binding !== '') {
                        if (optionsType==='static') {
                            if ( stateObject.binding === 'true' || stateObject.binding === 'false' ) {
                                stateObject.binding = stateObject.binding === 'true' ? 'false' : 'true';
                            } else {
                                if ( scope.$parent_scope[stateObject.binding] === 'true' || scope.$parent_scope[stateObject.binding] === 'false' ) {
                                    scope.$parent_scope[stateObject.binding] = scope.$parent_scope[stateObject.binding] === 'true' ? 'false' : 'true';
                                } else if ( typeof scope.$parent_scope[stateObject.binding] === 'boolean' ) {
                                    scope.$parent_scope[stateObject.binding] = scope.$parent_scope[stateObject.binding] ? false : true;
                                }
                            }
                        } else {
                            scope.$parent_scope[stateObject[scope.itemNames.state.binding]] = scope.$parent_scope[stateObject[scope.itemNames.state.binding]] ? false : true;
                        }
                    }
                }

                var buildNextLevel = function ( nextLevel, road, optionsType ) {
                    if(optionsType==='static'){
                        for ( var i = 0; i < nextLevel.length; i++ ) {
                            if ( nextLevel[i].menuItems.value.length > 0 ) {
                                var iconbarItem = iconbarMenuItem.replace('{{itemDisplay}}', typeof nextLevel[i].display === 'string' ? nextLevel[i].display.replace(/"/g, '\'') : nextLevel[i].display);
                                scope.iconBar = scope.iconBar + iconbarItem + '<md-menu>';
                                createDfxMenuItem( nextLevel[i], 'singleMenuItem', road, i, optionsType );
                                buildNextLevel( nextLevel[i].menuItems.value, road + ',' + i, optionsType );
                                scope.iconBar = scope.iconBar + '</md-menu-content></md-menu></md-menu-item>';
                            } else {
                                if ( nextLevel[i].divider === true ) {
                                    scope.iconBar = scope.iconBar + '<md-menu-divider></md-menu-divider>';
                                } else if ( nextLevel[i].title === true ) {
                                    scope.iconBar = scope.iconBar + '<md-menu-item class="tree-menu-title"><div>{{'+nextLevel[i].label+'}}'+'</div></md-menu-item>';
                                } else {
                                    var iconbarItem = iconbarMenuItem.replace('{{itemDisplay}}', typeof nextLevel[i].display === 'string' ? nextLevel[i].display.replace(/"/g, '\'') : nextLevel[i].display);
                                    scope.iconBar = scope.iconBar + iconbarItem;
                                    createDfxMenuItem( nextLevel[i], 'singleMenuItem', road, i, optionsType );
                                }
                            }
                        }
                    } else {
                        for ( var i = 0; i < nextLevel.length; i++ ) {
                            if ( nextLevel[i][scope.itemNames.main.scopeItems] && nextLevel[i][scope.itemNames.main.scopeItems].length > 0 ) {
                                var iconbarItem = iconbarMenuItem.replace('{{itemDisplay}}', true);
                                scope.iconBar = scope.iconBar + iconbarItem + '<md-menu>';
                                createDfxMenuItem( nextLevel[i], 'singleMenuItem', road, i, optionsType );
                                buildNextLevel( nextLevel[i][scope.itemNames.main.scopeItems], road + ',' + i, optionsType );
                                scope.iconBar = scope.iconBar + '</md-menu-content></md-menu></md-menu-item>';
                            } else {
                                if ( nextLevel[i][scope.itemNames.main.type] === 'divider' ) {
                                    scope.iconBar = scope.iconBar + '<md-menu-divider></md-menu-divider>';
                                } else if ( nextLevel[i][scope.itemNames.main.type] === 'title' ) {
                                    scope.iconBar = scope.iconBar + '<md-menu-item class="tree-menu-title"><div>{{\''+nextLevel[i][scope.itemNames.main.label]+'\'}}</div></md-menu-item>';
                                } else {
                                    var iconbarItem = iconbarMenuItem.replace('{{itemDisplay}}', true);
                                    scope.iconBar = scope.iconBar + iconbarItem;
                                    createDfxMenuItem( nextLevel[i], 'singleMenuItem', road, i, optionsType );
                                }
                            }
                        }
                    }
                }
                var createDfxMenuItem = function( dfxMenuItem, type, level, index, optionsType ) {
                    if(optionsType==='static') {
                        var tempPropObject = {};
                        if ( typeof dfxMenuItem.icon === 'string' ) {
                            var tempIcon = dfxMenuItem.icon;
                            dfxMenuItem.icon = {
                                "value": tempIcon,
                                "type":  dfxMenuItem.hasOwnProperty('iconType') ? dfxMenuItem.iconType : 'fa-icon'
                            }
                        }
                        if ( !dfxMenuItem.hasOwnProperty('state') ) {
                            dfxMenuItem.state = {
                                "value":           false,
                                "binding":         "true",
                                "checkedIcon":   { "value": "'thumb_up'", "type": "svg-icon", "style": "", "class": "" },
                                "uncheckedIcon": { "value": "'thumb_down'", "type": "svg-icon", "style": "", "class": "" }
                            };
                        }
                        tempPropObject.isState =                    dfxMenuItem.state.value;
                        tempPropObject.notState =                   !dfxMenuItem.state.value;
                        tempPropObject.ifFaIcon =                   dfxMenuItem.icon.value.length > 0 && dfxMenuItem.icon.type === 'fa-icon' && !dfxMenuItem.state.value ? true : false;
                        tempPropObject.ifSvgIcon =                  dfxMenuItem.icon.value.length > 0 && dfxMenuItem.icon.type === 'svg-icon' && !dfxMenuItem.state.value ? true : false;
                        tempPropObject.ifTrueStateFaIcon =          dfxMenuItem.state.checkedIcon.value.length > 0 && dfxMenuItem.state.checkedIcon.type === 'fa-icon' && dfxMenuItem.state.value ? true : false;
                        tempPropObject.ifFalseStateFaIcon =         dfxMenuItem.state.uncheckedIcon.value.length > 0 && dfxMenuItem.state.uncheckedIcon.type === 'fa-icon' && dfxMenuItem.state.value ? true : false;
                        tempPropObject.ifTrueStateSvgIcon =         dfxMenuItem.state.checkedIcon.value.length > 0 && dfxMenuItem.state.checkedIcon.type === 'svg-icon' && dfxMenuItem.state.value ? true : false;
                        tempPropObject.ifFalseStateSvgIcon =        dfxMenuItem.state.uncheckedIcon.value.length > 0 && dfxMenuItem.state.uncheckedIcon.type === 'svg-icon' && dfxMenuItem.state.value ? true : false;
                        tempPropObject.itemIndex =                  level || level >= 0 ? level + ',' + index : index;
                        tempPropObject.itemDisabled =               dfxMenuItem.disabled;
                        tempPropObject.trueStateFaIconStyle =       dfxMenuItem.state.checkedIcon.style;
                        tempPropObject.falseStateFaIconStyle =      dfxMenuItem.state.uncheckedIcon.style;
                        tempPropObject.trueStateSvgIconStyle =      dfxMenuItem.state.checkedIcon.style;
                        tempPropObject.falseStateSvgIconStyle =     dfxMenuItem.state.uncheckedIcon.style;
                        tempPropObject.trueStateFaIconClass =       dfxMenuItem.state.checkedIcon.class;
                        tempPropObject.falseStateFaIconClass =      dfxMenuItem.state.uncheckedIcon.class;
                        tempPropObject.trueStateSvgIconClass =      dfxMenuItem.state.checkedIcon.class;
                        tempPropObject.falseStateSvgIconClass =     dfxMenuItem.state.uncheckedIcon.class;
                        tempPropObject.faIcon =                 dfxMenuItem.icon.value.indexOf("'") == -1 ? '{{'+dfxMenuItem.icon.value+'}}' : eval(dfxMenuItem.icon.value);
                        tempPropObject.svgIcon =                dfxMenuItem.icon.value.indexOf("'") == -1 ? '{{'+dfxMenuItem.icon.value+'}}' : eval(dfxMenuItem.icon.value);
                        tempPropObject.trueState =              dfxMenuItem.state.binding;
                        tempPropObject.falseState =             dfxMenuItem.state.binding;
                        tempPropObject.trueStateFaIcon =        dfxMenuItem.state.checkedIcon.value.indexOf("'") == -1 ? '{{'+dfxMenuItem.state.checkedIcon.value+'}}' : '{{'+dfxMenuItem.state.checkedIcon.value+'}}';
                        tempPropObject.falseStateFaIcon =       dfxMenuItem.state.uncheckedIcon.value.indexOf("'") == -1 ? '{{'+dfxMenuItem.state.uncheckedIcon.value+'}}' : '{{'+dfxMenuItem.state.uncheckedIcon.value+'}}';
                        tempPropObject.trueStateSvgIcon =       dfxMenuItem.state.checkedIcon.value.indexOf("'") == -1 ? '{{'+dfxMenuItem.state.checkedIcon.value+'}}' : '{{'+dfxMenuItem.state.checkedIcon.value+'}}';
                        tempPropObject.falseStateSvgIcon =      dfxMenuItem.state.uncheckedIcon.value.indexOf("'") == -1 ? '{{'+dfxMenuItem.state.uncheckedIcon.value+'}}' : '{{'+dfxMenuItem.state.uncheckedIcon.value+'}}';
                        tempPropObject.itemDisplay =            typeof dfxMenuItem.display === 'string' ? dfxMenuItem.display.replace(/"/g, '\'') : dfxMenuItem.display;
                        if ( type === 'singleMenuItem' ) {
                            tempPropObject.itemLabel =          '{{'+dfxMenuItem.label+'}}';
                            tempPropObject.itemShortcut =       dfxMenuItem.shortcut;
                            tempPropObject.ifItemNotification = dfxMenuItem.notification !=='' ? true : false;
                            tempPropObject.itemNotification =   '{{'+dfxMenuItem.notification+'}}';
                        }
                        if ( dfxMenuItem.menuItems.value.length > 0 ) {
                            tempPropObject.itemClick = dfxMenuItem.state.value ? '$mdOpenMenu();changeState('+"'"+tempPropObject.itemIndex+"'"+', $event, '+"'"+optionsType+"'"+');'+dfxMenuItem.onclick : '$mdOpenMenu();'+dfxMenuItem.onclick;
                        } else {
                            tempPropObject.itemClick = dfxMenuItem.state.value ? 'changeState('+"'"+tempPropObject.itemIndex+"'"+', $event, '+"'"+optionsType+"'"+');'+dfxMenuItem.onclick : dfxMenuItem.onclick;
                        }
                    } else {
                        var tempPropObject = {};
                        tempPropObject.itemIndex =                  level || level >= 0 ? level + ',' + index : index;
                        tempPropObject.ifFaIcon =               dfxMenuItem[scope.itemNames.main.icon.value] && dfxMenuItem[scope.itemNames.main.icon.value][scope.itemNames.main.icon.name].length > 0 && dfxMenuItem[scope.itemNames.main.icon.value][scope.itemNames.main.icon.type] === 'fa-icon' ? true : false;
                        tempPropObject.ifSvgIcon =              dfxMenuItem[scope.itemNames.main.icon.value] && dfxMenuItem[scope.itemNames.main.icon.value][scope.itemNames.main.icon.name].length > 0 && dfxMenuItem[scope.itemNames.main.icon.value][scope.itemNames.main.icon.type] === 'svg-icon' ? true : false;
                        tempPropObject.faIcon =                 dfxMenuItem[scope.itemNames.main.icon.value] && dfxMenuItem[scope.itemNames.main.icon.value][scope.itemNames.main.icon.name] ? '{{\''+dfxMenuItem[scope.itemNames.main.icon.value][scope.itemNames.main.icon.name]+'\'}}' : '';
                        tempPropObject.svgIcon =                dfxMenuItem[scope.itemNames.main.icon.value] && dfxMenuItem[scope.itemNames.main.icon.value][scope.itemNames.main.icon.name] ? '{{\''+dfxMenuItem[scope.itemNames.main.icon.value][scope.itemNames.main.icon.name]+'\'}}' : '';
                        tempPropObject.itemDisplay =            dfxMenuItem[scope.itemNames.main.display] ? dfxMenuItem[scope.itemNames.main.display] : true;
                        tempPropObject.itemDisabled =           dfxMenuItem[scope.itemNames.main.disabled] ? dfxMenuItem[scope.itemNames.main.disabled] : false;
                        if ( scope.itemNames.state && dfxMenuItem.hasOwnProperty(scope.itemNames.state.name) ) {
                            tempPropObject.isState =                    true;
                            tempPropObject.notState =                   false;
                            tempPropObject.trueState =                  dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.binding];
                            tempPropObject.falseState =                 dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.binding];
                            tempPropObject.ifTrueStateFaIcon =          dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.checkedIcon.value] && dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.checkedIcon.value][scope.itemNames.state.checkedIcon.name].length > 0 && dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.checkedIcon.value][scope.itemNames.state.checkedIcon.type] === 'fa-icon' ? true : false;
                            tempPropObject.ifFalseStateFaIcon =         dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.uncheckedIcon.value] && dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.uncheckedIcon.value][scope.itemNames.state.uncheckedIcon.name].length > 0 && dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.uncheckedIcon.value][scope.itemNames.state.uncheckedIcon.type ]=== 'fa-icon' ? true : false;
                            tempPropObject.ifTrueStateSvgIcon =         dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.checkedIcon.value] && dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.checkedIcon.value][scope.itemNames.state.checkedIcon.name].length > 0 && dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.checkedIcon.value][scope.itemNames.state.checkedIcon.type] === 'svg-icon' ? true : false;
                            tempPropObject.ifFalseStateSvgIcon =        dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.uncheckedIcon.value] && dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.uncheckedIcon.value][scope.itemNames.state.uncheckedIcon.name].length > 0 && dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.uncheckedIcon.value][scope.itemNames.state.uncheckedIcon.type ]=== 'svg-icon' ? true : false;
                            tempPropObject.trueStateFaIcon =            dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.checkedIcon.value] ? '{{\''+dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.checkedIcon.value][scope.itemNames.state.checkedIcon.name]+'\'}}' : '';
                            tempPropObject.falseStateFaIcon =           dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.uncheckedIcon.value] ? '{{\''+dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.uncheckedIcon.value][scope.itemNames.state.uncheckedIcon.name]+'\'}}' : '';
                            tempPropObject.trueStateSvgIcon =           dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.checkedIcon.value] ? '{{\''+dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.checkedIcon.value][scope.itemNames.state.checkedIcon.name]+'\'}}' : '';
                            tempPropObject.falseStateSvgIcon =          dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.uncheckedIcon.value] ? '{{\''+dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.uncheckedIcon.value][scope.itemNames.state.uncheckedIcon.name]+'\'}}' : '';
                            tempPropObject.trueStateFaIconStyle =       dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.checkedIcon.value] && dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.checkedIcon.value][scope.itemNames.state.checkedIcon.style];
                            tempPropObject.falseStateFaIconStyle =      dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.uncheckedIcon.value] && dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.uncheckedIcon.value][scope.itemNames.state.uncheckedIcon.style];
                            tempPropObject.trueStateSvgIconStyle =      dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.checkedIcon.value] && dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.checkedIcon.value][scope.itemNames.state.checkedIcon.style];
                            tempPropObject.falseStateSvgIconStyle =     dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.uncheckedIcon.value] && dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.uncheckedIcon.value][scope.itemNames.state.uncheckedIcon.style];
                            tempPropObject.trueStateFaIconClass =       dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.checkedIcon.value] && dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.checkedIcon.value][scope.itemNames.state.checkedIcon.class];
                            tempPropObject.falseStateFaIconClass =      dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.uncheckedIcon.value] && dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.uncheckedIcon.value][scope.itemNames.state.uncheckedIcon.class];
                            tempPropObject.trueStateSvgIconClass =      dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.checkedIcon.value] && dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.checkedIcon.value][scope.itemNames.state.checkedIcon.class];
                            tempPropObject.falseStateSvgIconClass =     dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.uncheckedIcon.value] && dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.uncheckedIcon.value][scope.itemNames.state.uncheckedIcon.class];
                            if ( dfxMenuItem[scope.itemNames.main.scopeItems] && dfxMenuItem[scope.itemNames.main.scopeItems].length > 0 ) {
                                tempPropObject.itemClick = dfxMenuItem[scope.itemNames.state.value] !=='' ? '$mdOpenMenu();changeState('+"'"+tempPropObject.itemIndex+"'"+', $event, '+"'"+optionsType+"'"+');'+dfxMenuItem[scope.itemNames.main.onclick] : '$mdOpenMenu();'+dfxMenuItem[scope.itemNames.main.onclick];
                            } else {
                                tempPropObject.itemClick = dfxMenuItem[scope.itemNames.state.value] !=='' ? 'changeState('+"'"+tempPropObject.itemIndex+"'"+', $event, '+"'"+optionsType+"'"+');'+dfxMenuItem[scope.itemNames.main.onclick] : dfxMenuItem[scope.itemNames.main.onclick];
                            }
                        } else {
                            tempPropObject.isState = false;
                            tempPropObject.notState = true;
                            if ( dfxMenuItem[scope.itemNames.main.scopeItems] && dfxMenuItem[scope.itemNames.main.scopeItems].length > 0 ) {
                                tempPropObject.itemClick = '$mdOpenMenu();'+dfxMenuItem[scope.itemNames.main.onclick];
                            } else {
                                tempPropObject.itemClick = dfxMenuItem[scope.itemNames.main.onclick];
                            }
                        }
                        if ( type === 'singleMenuItem' ) {
                            tempPropObject.itemLabel =          dfxMenuItem[scope.itemNames.main.label] ? '{{\''+dfxMenuItem[scope.itemNames.main.label]+'\'}}' : '';
                            tempPropObject.itemShortcut =       dfxMenuItem[scope.itemNames.main.shortcut];
                            tempPropObject.ifItemNotification = dfxMenuItem[scope.itemNames.main.notification] !=='' ? true : false;
                            tempPropObject.itemNotification =   '{{\''+dfxMenuItem[scope.itemNames.main.notification]+'\'}}';
                        }
                    }
                    var tempMenu = '';
                    if ( type === 'singleMenuItem' ) {
                        tempMenu = singleMenuItem
                            .replace('{{isState}}',                 tempPropObject.isState )
                            .replace('{{notState}}',                tempPropObject.notState )
                            .replace('{{trueState}}',               tempPropObject.trueState )
                            .replace('{{falseState}}',              tempPropObject.falseState )
                            .replace('{{ifFaIcon}}',                tempPropObject.ifFaIcon )
                            .replace('{{ifSvgIcon}}',               tempPropObject.ifSvgIcon )
                            .replace('{{ifTrueStateFaIcon}}',       tempPropObject.ifTrueStateFaIcon )
                            .replace('{{ifFalseStateFaIcon}}',      tempPropObject.ifFalseStateFaIcon )
                            .replace('{{ifTrueStateSvgIcon}}',      tempPropObject.ifTrueStateSvgIcon )
                            .replace('{{ifFalseStateSvgIcon}}',     tempPropObject.ifFalseStateSvgIcon )
                            .replace('{{faIcon}}',                  tempPropObject.faIcon )
                            .replace('{{svgIcon}}',                 tempPropObject.svgIcon )
                            .replace('{{trueStateFaIcon}}',         tempPropObject.trueStateFaIcon )
                            .replace('{{falseStateFaIcon}}',        tempPropObject.falseStateFaIcon )
                            .replace('{{trueStateSvgIcon}}',        tempPropObject.trueStateSvgIcon )
                            .replace('{{falseStateSvgIcon}}',       tempPropObject.falseStateSvgIcon )
                            .replace('{{trueStateFaIconStyle}}',    tempPropObject.trueStateFaIconStyle )
                            .replace('{{falseStateFaIconStyle}}',   tempPropObject.falseStateFaIconStyle )
                            .replace('{{trueStateSvgIconStyle}}',   tempPropObject.trueStateSvgIconStyle )
                            .replace('{{falseStateSvgIconStyle}}',  tempPropObject.falseStateSvgIconStyle )
                            .replace('{{trueStateFaIconClass}}',    tempPropObject.trueStateFaIconClass )
                            .replace('{{falseStateFaIconClass}}',   tempPropObject.falseStateFaIconClass )
                            .replace('{{trueStateSvgIconClass}}',   tempPropObject.trueStateSvgIconClass )
                            .replace('{{falseStateSvgIconClass}}',  tempPropObject.falseStateSvgIconClass )
                            .replace('{{itemLabel}}',               tempPropObject.itemLabel )
                            .replace('{{itemShortcut}}',            tempPropObject.itemShortcut )
                            .replace('{{ifItemNotification}}',      tempPropObject.ifItemNotification )
                            .replace('{{itemNotification}}',        tempPropObject.itemNotification )
                            .replace('{{itemIndex}}',               tempPropObject.itemIndex )
                            .replace('{{itemDisplay}}',             tempPropObject.itemDisplay )
                            .replace('{{itemDisabled}}',            tempPropObject.itemDisabled )
                            .replace('{{itemClick}}',               tempPropObject.itemClick );
                    } else {
                        tempMenu = rootMenuItem
                            .replace('{{isState}}',                 tempPropObject.isState )
                            .replace('{{notState}}',                tempPropObject.notState )
                            .replace('{{trueState}}',               tempPropObject.trueState )
                            .replace('{{falseState}}',              tempPropObject.falseState )
                            .replace('{{ifFaIcon}}',                tempPropObject.ifFaIcon )
                            .replace('{{ifSvgIcon}}',               tempPropObject.ifSvgIcon )
                            .replace('{{ifTrueStateFaIcon}}',       tempPropObject.ifTrueStateFaIcon )
                            .replace('{{ifFalseStateFaIcon}}',      tempPropObject.ifFalseStateFaIcon )
                            .replace('{{ifTrueStateSvgIcon}}',      tempPropObject.ifTrueStateSvgIcon )
                            .replace('{{ifFalseStateSvgIcon}}',     tempPropObject.ifFalseStateSvgIcon )
                            .replace('{{faIcon}}',                  tempPropObject.faIcon )
                            .replace('{{svgIcon}}',                 tempPropObject.svgIcon )
                            .replace('{{trueStateFaIcon}}',         tempPropObject.trueStateFaIcon )
                            .replace('{{falseStateFaIcon}}',        tempPropObject.falseStateFaIcon )
                            .replace('{{trueStateSvgIcon}}',        tempPropObject.trueStateSvgIcon )
                            .replace('{{falseStateSvgIcon}}',       tempPropObject.falseStateSvgIcon )
                            .replace('{{trueStateFaIconStyle}}',    tempPropObject.trueStateFaIconStyle )
                            .replace('{{falseStateFaIconStyle}}',   tempPropObject.falseStateFaIconStyle )
                            .replace('{{trueStateSvgIconStyle}}',   tempPropObject.trueStateSvgIconStyle )
                            .replace('{{falseStateSvgIconStyle}}',  tempPropObject.falseStateSvgIconStyle )
                            .replace('{{trueStateFaIconClass}}',    tempPropObject.trueStateFaIconClass )
                            .replace('{{falseStateFaIconClass}}',   tempPropObject.falseStateFaIconClass )
                            .replace('{{trueStateSvgIconClass}}',   tempPropObject.trueStateSvgIconClass )
                            .replace('{{falseStateSvgIconClass}}',  tempPropObject.falseStateSvgIconClass )
                            .replace('{{itemIndex}}',               tempPropObject.itemIndex )
                            .replace('{{itemDisplay}}',             tempPropObject.itemDisplay )
                            .replace('{{itemDisabled}}',            tempPropObject.itemDisabled )
                            .replace('{{itemClick}}',               tempPropObject.itemClick );
                    }
                    if(optionsType==='static') {
                        if ( dfxMenuItem.menuItems.value.length > 0 ) {
                            scope.iconBar = scope.iconBar + tempMenu +'<md-menu-content width="4">';
                        } else {
                            if ( type === 'singleMenuItem' ) {
                                scope.iconBar = scope.iconBar + tempMenu + '</md-menu-item>';
                            } else {
                                scope.iconBar = scope.iconBar + tempMenu + '<md-menu-content width="4"></md-menu-content>';
                            }
                        }
                    }else{
                        if ( dfxMenuItem[scope.itemNames.main.scopeItems] && dfxMenuItem[scope.itemNames.main.scopeItems].length > 0 ) {
                            scope.iconBar = scope.iconBar + tempMenu +'<md-menu-content width="4">';
                        } else {
                            if ( type === 'singleMenuItem' ) {
                                scope.iconBar = scope.iconBar + tempMenu + '</md-menu-item>';
                            } else {
                                scope.iconBar = scope.iconBar + tempMenu + '<md-menu-content width="4"></md-menu-content>';
                            }
                        }
                    }
                }
                scope.iconbarBuilder = function() {
                    scope.iconBar = '<md-menu-bar style="display:flex;">';
                    if ( scope.attributes.menuItemsType.value === 'dynamic' ){
                        scope.iconbarArray = scope.$parent_scope[scope.itemNames.main.source];
                        // scope.attributes.menuItems.value = scope.iconbarArray;
                        for ( var item = 0; item < scope.iconbarArray.length; item++ ) {
                            scope.iconBar = scope.iconBar + '<md-menu>';
                            if ( scope.iconbarArray[item][scope.itemNames.main.scopeItems] && scope.iconbarArray[item][scope.itemNames.main.scopeItems].length > 0 ) {
                                createDfxMenuItem( scope.iconbarArray[item], 'rootMenuItem', undefined, item, 'dynamic' );
                                buildNextLevel( scope.iconbarArray[item][scope.itemNames.main.scopeItems], item, 'dynamic');
                                scope.iconBar = scope.iconBar + '</md-menu-content>';
                            } else {
                                createDfxMenuItem( scope.iconbarArray[item], 'rootMenuItem', undefined, item, 'dynamic' );
                            }
                            scope.iconBar = scope.iconBar + '</md-menu>';
                        };
                    } else {
                        scope.iconbarArray = scope.attributes.menuItems.value;
                        // scope.attributes.menuItems.value = scope.iconbarArray;
                        for ( var item = 0; item < scope.iconbarArray.length; item++ ) {
                            scope.iconBar = scope.iconBar + '<md-menu>';
                            if ( scope.iconbarArray[item].menuItems.value.length > 0 ) {
                                createDfxMenuItem( scope.iconbarArray[item], 'rootMenuItem', undefined, item, 'static' );
                                buildNextLevel( scope.iconbarArray[item].menuItems.value, item, 'static');
                                scope.iconBar = scope.iconBar + '</md-menu-content>';
                            } else {
                                createDfxMenuItem( scope.iconbarArray[item], 'rootMenuItem', undefined, item, 'static' );
                            }
                            scope.iconBar = scope.iconBar + '</md-menu>';
                        };
                    }
                    scope.iconBar = scope.iconBar + '</md-menu-bar>';
                    scope.iconBarMenu = scope.iconBar;
                    $timeout(function() {
                        $('#' + component.id + '_menu_bar').html(scope.iconBarMenu).promise().done(function(){
                            $compile($('#' + component.id + '_menu_bar').contents())(scope);
                        });
                    }, 0);
                }
                scope.$watch('attributes.menuItems.value', function(newVal, oldVal) {
                    if ( newVal != null && !angular.equals(newVal, oldVal) ) {
                        $timeout(function() {
                            scope.iconbarBuilder();
                        }, 0);
                    }
                }, true);
                scope.iconbarBuilder();
            });
        }
    }
}]);

dfxGCC.directive('dfxGccWebHorizontalmenu', ['$mdMenu', '$timeout', '$compile', '$filter', function($mdMenu, $timeout, $compile, $filter) {
    return {
        restrict: 'A',
        require: '^dfxGccWebBase',
        scope: true,
        link: function(scope, element, attrs, basectrl) {
            var component = scope.getComponent(element);
            basectrl.init(scope, element, component, attrs, 'horizontalmenu').then(function(){
                scope.attributes.flex.status = "overridden";
                scope.attributes.dynamicPresent.status = "overridden";
                scope.attributes.dynamic.status = "overridden";
                scope.attributes.menuItemsType.status = "overridden";
                scope.attributes.menuItemNames.status = "overridden";
                scope.itemNames = scope.attributes.menuItemNames.value;
                scope.attributes.dynamicPresent.value = scope.attributes.dynamic.value.length > 0 ? true : false;
                var rootMenuItem = '<button ng-click="{{itemClick}}" ng-show="{{itemDisplay}}" ng-disabled="{{itemDisabled}}" style="{{attributes.rootMenu.button.style}}" aria-label="button" class="dfx-horizontalmenu-root-button {{attributes.rootMenu.button.class}}">'+
                        '<md-icon ng-if="{{ifFaIcon}}" style="font-size:{{attributes.rootMenu.icon.size}}px; {{attributes.rootMenu.icon.style}}" class="fa {{faIcon}} dfx-horizontalmenu-root-icon {{attributes.rootMenu.icon.class}}"></md-icon>'+
                        '<ng-md-icon ng-if="{{ifSvgIcon}}" icon="{{svgIcon}}" size="{{attributes.rootMenu.icon.size}}" style="{{attributes.rootMenu.icon.style}}" class="dfx-horizontalmenu-root-icon {{attributes.rootMenu.icon.class}}"></ng-md-icon>'+
                        '<span>{{itemLabel}}</span>'+
                        '<span ng-if="{{ifItemShortcut}}" style="margin:0 8px;">{{itemShortcut}}</span>'+
                        '<small ng-if="{{ifItemNotification}}">{{itemNotification}}</small>'+
                        '</button>',
                    singleMenuItem =    '<md-button ng-show="{{itemDisplay}}" ng-disabled="{{itemDisabled}}" ng-click="{{itemClick}}" aria-label="iconbar-button" style="{{attributes.singleMenu.button.style}}" class="dfx-horizontalmenu-button dfx-menu-button {{attributes.singleMenu.button.class}}">'+
                        '<md-icon ng-if="{{ifFaIcon}}" class="fa {{faIcon}} dfx-menu-button-icon {{attributes.singleMenu.icon.class}}" style="font-size:{{attributes.singleMenu.icon.size}}px; {{attributes.singleMenu.icon.style}}"></md-icon>'+
                        '<ng-md-icon ng-if="{{ifSvgIcon}}" icon="{{svgIcon}}" size="{{attributes.singleMenu.icon.size}}" class="dfx-menu-button-icon {{attributes.singleMenu.icon.class}}" style="{{attributes.singleMenu.icon.style}}"></ng-md-icon>'+
                        '<span>{{itemLabel}}</span>'+
                        '<span ng-if="{{ifItemShortcut}}" class="md-alt-text">{{itemShortcut}}</span>'+
                        '<small ng-if="{{ifItemNotification}}">{{itemNotification}}</small>'+
                        '</md-button>',
                    iconbarMenuItem =   '<md-menu-item ng-if="{{itemDisplay}}">';

                var buildNextLevel = function (nextLevel, item, optionsType) {
                    if(optionsType==='static'){
                        for (var i = 0; i < nextLevel.length; i++) {
                            if ( nextLevel[i].menuItems.value.length > 0 ) {
                                var iconbarItem = iconbarMenuItem.replace('{{itemDisplay}}', typeof nextLevel[i].display === 'string' ? nextLevel[i].display.replace(/"/g, '\'') : nextLevel[i].display);
                                scope.iconBar = scope.iconBar + iconbarItem + '<md-menu>';
                                createDfxMenuItem( nextLevel[i], 'singleMenuItem', optionsType);
                                buildNextLevel( nextLevel[i].menuItems.value, i, optionsType );
                                scope.iconBar = scope.iconBar + '</md-menu-content></md-menu></md-menu-item>';
                            } else {
                                if ( nextLevel[i].divider === true ) {
                                    scope.iconBar = scope.iconBar + '<md-menu-divider></md-menu-divider>';
                                } else if ( nextLevel[i].title === true ) {
                                    scope.iconBar = scope.iconBar + '<md-menu-item class="tree-menu-title"><div>{{'+nextLevel[i].label+'}}</div></md-menu-item>';
                                } else {
                                    var iconbarItem = iconbarMenuItem.replace('{{itemDisplay}}', typeof nextLevel[i].display === 'string' ? nextLevel[i].display.replace(/"/g, '\'') : nextLevel[i].display);
                                    scope.iconBar = scope.iconBar + iconbarItem;
                                    createDfxMenuItem( nextLevel[i], 'singleMenuItem', optionsType );
                                }
                            }
                        }
                    } else {
                        for (var i = 0; i < nextLevel.length; i++) {
                            if ( nextLevel[i][scope.itemNames.main.scopeItems] && nextLevel[i][scope.itemNames.main.scopeItems].length > 0 ) {
                                // next = nextLevel[i][scope.itemNames.main.scopeItems];
                                var iconbarItem = iconbarMenuItem.replace('{{itemDisplay}}', nextLevel[i][scope.itemNames.main.display] ? nextLevel[i][scope.itemNames.main.display] : true);
                                scope.iconBar = scope.iconBar + iconbarItem + '<md-menu>';
                                createDfxMenuItem( nextLevel[i], 'singleMenuItem', optionsType);
                                buildNextLevel( nextLevel[i][scope.itemNames.main.scopeItems], optionsType );
                                scope.iconBar = scope.iconBar + '</md-menu-content></md-menu></md-menu-item>';
                            } else {
                                if ( nextLevel[i][scope.itemNames.main.type] === 'divider' ) {
                                    scope.iconBar = scope.iconBar + '<md-menu-divider></md-menu-divider>';
                                } else if ( nextLevel[i][scope.itemNames.main.type] === 'title' ) {
                                    scope.iconBar = scope.iconBar + '<md-menu-item class="tree-menu-title"><div>{{\''+nextLevel[i][scope.itemNames.main.label]+'\'}}</div></md-menu-item>';
                                } else {
                                    var iconbarItem = iconbarMenuItem.replace('{{itemDisplay}}', nextLevel[i][scope.itemNames.main.display] ? nextLevel[i][scope.itemNames.main.display] : true);
                                    scope.iconBar = scope.iconBar + iconbarItem;
                                    createDfxMenuItem( nextLevel[i], 'singleMenuItem', optionsType );
                                }
                            }
                        }
                    }
                }
                var createDfxMenuItem = function( dfxMenuItem, type, optionsType ) {
                    if(optionsType==='static'){
                        if ( typeof dfxMenuItem.icon === 'string' ) {
                            var tempIcon = dfxMenuItem.icon;
                            dfxMenuItem.icon = {
                                "value": tempIcon,
                                "type":  dfxMenuItem.hasOwnProperty('iconType') ? dfxMenuItem.iconType : 'fa-icon'
                            }
                        }
                        var tempPropObject = {};
                        tempPropObject.ifFaIcon =                   dfxMenuItem.icon.value.length > 0 && dfxMenuItem.icon.type === 'fa-icon' ? true : false;
                        tempPropObject.ifSvgIcon =                  dfxMenuItem.icon.value.length > 0 && dfxMenuItem.icon.type === 'svg-icon' ? true : false;
                        tempPropObject.ifItemShortcut =             dfxMenuItem.shortcut.length > 0 ? true : false;
                        tempPropObject.itemShortcut =               dfxMenuItem.shortcut;
                        tempPropObject.ifItemNotification =         dfxMenuItem.notification.length > 0 ? true : false;
                        tempPropObject.itemDisabled =               dfxMenuItem.disabled;
                        tempPropObject.itemClick =                  dfxMenuItem.menuItems.value.length > 0 ? '$mdOpenMenu();'+dfxMenuItem.onclick : dfxMenuItem.onclick;
                        tempPropObject.faIcon =                 dfxMenuItem.icon.value.indexOf("'") == -1 ? '{{'+dfxMenuItem.icon.value+'}}' : eval(dfxMenuItem.icon.value);
                        tempPropObject.svgIcon =                dfxMenuItem.icon.value.indexOf("'") == -1 ? '{{'+dfxMenuItem.icon.value+'}}' : eval(dfxMenuItem.icon.value);
                        tempPropObject.itemLabel =              '{{'+dfxMenuItem.label+'}}';
                        tempPropObject.itemNotification =       '{{'+dfxMenuItem.notification+'}}';
                        tempPropObject.itemDisplay =            typeof dfxMenuItem.display === 'string' ? dfxMenuItem.display.replace(/"/g, '\'') : dfxMenuItem.display;
                    } else {
                        var tempPropObject = {};
                        tempPropObject.ifFaIcon =               dfxMenuItem[scope.itemNames.main.icon.value] && dfxMenuItem[scope.itemNames.main.icon.value][scope.itemNames.main.icon.name].length > 0 && dfxMenuItem[scope.itemNames.main.icon.value][scope.itemNames.main.icon.type] === 'fa-icon' ? true : false;
                        tempPropObject.ifSvgIcon =              dfxMenuItem[scope.itemNames.main.icon.value] && dfxMenuItem[scope.itemNames.main.icon.value][scope.itemNames.main.icon.name].length > 0 && dfxMenuItem[scope.itemNames.main.icon.value][scope.itemNames.main.icon.type] === 'svg-icon' ? true : false;
                        tempPropObject.ifItemShortcut =         dfxMenuItem[scope.itemNames.main.shortcut] && dfxMenuItem[scope.itemNames.main.shortcut].length > 0 ? true : false;
                        tempPropObject.itemShortcut =           dfxMenuItem[scope.itemNames.main.shortcut];
                        tempPropObject.ifItemNotification =     dfxMenuItem[scope.itemNames.main.notification] && dfxMenuItem[scope.itemNames.main.notification].length > 0 ? true : false;
                        tempPropObject.faIcon =                 dfxMenuItem[scope.itemNames.main.icon.value] && dfxMenuItem[scope.itemNames.main.icon.value][scope.itemNames.main.icon.name] ? '{{\''+dfxMenuItem[scope.itemNames.main.icon.value][scope.itemNames.main.icon.name]+'\'}}' : '';
                        tempPropObject.svgIcon =                dfxMenuItem[scope.itemNames.main.icon.value] && dfxMenuItem[scope.itemNames.main.icon.value][scope.itemNames.main.icon.name] ? '{{\''+dfxMenuItem[scope.itemNames.main.icon.value][scope.itemNames.main.icon.name]+'\'}}' : '';
                        tempPropObject.itemLabel =              dfxMenuItem[scope.itemNames.main.label] ? '{{\''+dfxMenuItem[scope.itemNames.main.label]+'\'}}' : '';
                        tempPropObject.itemNotification =       dfxMenuItem[scope.itemNames.main.notification] ? '{{\''+dfxMenuItem[scope.itemNames.main.notification]+'\'}}' : '';
                        tempPropObject.itemDisabled =           dfxMenuItem[scope.itemNames.main.disabled] ? dfxMenuItem[scope.itemNames.main.disabled] : false;
                        tempPropObject.itemDisplay =            dfxMenuItem[scope.itemNames.main.display] ? dfxMenuItem[scope.itemNames.main.display] : true;
                        tempPropObject.itemClick =              dfxMenuItem[scope.itemNames.main.scopeItems] && dfxMenuItem[scope.itemNames.main.scopeItems].length > 0 ? '$mdOpenMenu();'+(dfxMenuItem[scope.itemNames.main.onclick] ? dfxMenuItem[scope.itemNames.main.onclick] : '') : (dfxMenuItem[scope.itemNames.main.onclick] ? dfxMenuItem[scope.itemNames.main.onclick] : '');
                    }
                    var tempMenu = '';
                    if ( type === 'singleMenuItem' ) {
                        tempMenu = singleMenuItem
                            .replace('{{ifFaIcon}}',           tempPropObject.ifFaIcon )
                            .replace('{{ifSvgIcon}}',          tempPropObject.ifSvgIcon )
                            .replace('{{faIcon}}',             tempPropObject.faIcon )
                            .replace('{{svgIcon}}',            tempPropObject.svgIcon )
                            .replace('{{itemLabel}}',          tempPropObject.itemLabel )
                            .replace('{{ifItemShortcut}}',     tempPropObject.ifItemShortcut )
                            .replace('{{itemShortcut}}',       tempPropObject.itemShortcut )
                            .replace('{{ifItemNotification}}', tempPropObject.ifItemNotification )
                            .replace('{{itemNotification}}',   tempPropObject.itemNotification )
                            .replace('{{itemDisplay}}',        tempPropObject.itemDisplay )
                            .replace('{{itemDisabled}}',       tempPropObject.itemDisabled )
                            .replace('{{itemClick}}',          tempPropObject.itemClick );
                    } else {
                        tempMenu = rootMenuItem
                            .replace('{{ifFaIcon}}',           tempPropObject.ifFaIcon )
                            .replace('{{ifSvgIcon}}',          tempPropObject.ifSvgIcon )
                            .replace('{{faIcon}}',             tempPropObject.faIcon )
                            .replace('{{svgIcon}}',            tempPropObject.svgIcon )
                            .replace('{{itemLabel}}',          tempPropObject.itemLabel )
                            .replace('{{ifItemShortcut}}',     tempPropObject.ifItemShortcut )
                            .replace('{{itemShortcut}}',       tempPropObject.itemShortcut )
                            .replace('{{ifItemNotification}}', tempPropObject.ifItemNotification )
                            .replace('{{itemNotification}}',   tempPropObject.itemNotification )
                            .replace('{{itemDisplay}}',        tempPropObject.itemDisplay )
                            .replace('{{itemDisabled}}',       tempPropObject.itemDisabled )
                            .replace('{{itemClick}}',          tempPropObject.itemClick );
                    }
                    if(optionsType==='static'){
                        if ( dfxMenuItem.menuItems.value.length > 0 ) {
                            scope.iconBar = scope.iconBar + tempMenu +'<md-menu-content width="4">';
                        } else {
                            if ( type === 'singleMenuItem' ) {
                                scope.iconBar = scope.iconBar + tempMenu + '</md-menu-item>';
                            } else {
                                scope.iconBar = scope.iconBar + tempMenu + '<md-menu-content width="4"></md-menu-content>';
                            }
                        }
                    }else{
                        if ( dfxMenuItem[scope.itemNames.main.scopeItems] && dfxMenuItem[scope.itemNames.main.scopeItems].length > 0 ) {
                            scope.iconBar = scope.iconBar + tempMenu +'<md-menu-content width="4">';
                        } else {
                            if ( type === 'singleMenuItem' ) {
                                scope.iconBar = scope.iconBar + tempMenu + '</md-menu-item>';
                            } else {
                                scope.iconBar = scope.iconBar + tempMenu + '<md-menu-content width="4"></md-menu-content>';
                            }
                        }
                    }
                }
                scope.iconbarBuilder = function() {
                    scope.iconBar = '<md-menu-bar>';
                    if(scope.attributes.menuItemsType.value==='dynamic'){
                        scope.iconbarArray = scope.$parent_scope[scope.itemNames.main.source];
                        // scope.attributes.menuItems.value = scope.iconbarArray;
                        for (var item = 0; item < scope.iconbarArray.length; item++) {
                            scope.iconBar = scope.iconBar + '<md-menu>';
                            if ( scope.iconbarArray[item][scope.itemNames.main.scopeItems] && scope.iconbarArray[item][scope.itemNames.main.scopeItems].length > 0 ) {
                                createDfxMenuItem( scope.iconbarArray[item], 'rootMenuItem', 'dynamic' );
                                buildNextLevel( scope.iconbarArray[item][scope.itemNames.main.scopeItems], item, 'dynamic');
                                scope.iconBar = scope.iconBar + '</md-menu-content>';
                            } else {
                                createDfxMenuItem( scope.iconbarArray[item], 'rootMenuItem', 'dynamic' );
                            }
                            scope.iconBar = scope.iconBar + '</md-menu>';
                        };
                    }else{
                        scope.iconbarArray = scope.attributes.menuItems.value;
                        for (var item = 0; item < scope.iconbarArray.length; item++) {
                            scope.iconBar = scope.iconBar + '<md-menu>';
                            if ( scope.iconbarArray[item].menuItems.value.length > 0 ) {
                                createDfxMenuItem( scope.iconbarArray[item], 'rootMenuItem', 'static' );
                                buildNextLevel( scope.iconbarArray[item].menuItems.value, item, 'static');
                                scope.iconBar = scope.iconBar + '</md-menu-content>';
                            } else {
                                createDfxMenuItem( scope.iconbarArray[item], 'rootMenuItem', 'static' );
                            }
                            scope.iconBar = scope.iconBar + '</md-menu>';
                        };
                        // scope.attributes.menuItems.value = scope.iconbarArray;
                    }
                    scope.iconBar = scope.iconBar + '</md-menu-bar>';
                    scope.iconBarMenu = scope.iconBar;
                    $timeout(function() {
                        $('#' + component.id + '_menu_bar').html(scope.iconBarMenu);
                        $compile($('#' + component.id + '_menu_bar').contents())(scope);
                    }, 0);
                }

                scope.$watch('attributes.menuItems.value', function(newVal, oldVal) {
                    if ( newVal != null && !angular.equals(newVal, oldVal) ) {
                        $timeout(function() {
                            scope.iconbarBuilder();
                        }, 0);
                    }
                }, true);
                scope.iconbarBuilder();
                scope.changeWidth = function(){
                    var component = angular.element(document.querySelectorAll('[id="' + scope.component_id + '"]'));//for repeatable panels
                    component.addClass('flex' + '-' + scope.attributes.flex.value);
                };
                scope.changeWidth();
            });
        }
    }
}]);

dfxGCC.directive('dfxGccWebTreemenu', ['$timeout', '$compile', function($timeout, $compile) {
    return {
        restrict: 'A',
        require: '^dfxGccWebBase',
        scope: true,
        link: function(scope, element, attrs, basectrl) {
            var component = scope.$parent.getComponent(element),
                PADDING = 16;
            basectrl.init(scope, element, component, attrs, 'treemenu').then(function() {
                if(!scope.attributes.menuItemNames.value.hasOwnProperty('actions')){
                    scope.attributes.menuItemNames.value.actions = {
                        "actions": {
                        "name": "",
                        "icon": {"value":"","name":"","type":"","style":"","class":""},
                        "display": "",
                        "disabled": "",
                        "onclick": "",
                        "actionItems": {
                            "name": "",
                            "type": "",
                            "label": "",
                            "icon": {"value":"","name":"","type":"","style":"","class":""},
                            "display": "",
                            "disabled": "",
                            "onclick": ""
                        }
                    }
                    }
                }
                scope.attributes.dynamicPresent.value = scope.attributes.dynamic.value.length > 0 ? true : false;
                scope.attributes.menuItems.status = "overridden";
                scope.attributes.dynamicPresent.status = "overridden";
                scope.attributes.dynamic.status = "overridden";
                scope.attributes.menuItemsType.status = "overridden";
                scope.attributes.menuItemNames.status = "overridden";
                scope.itemNames = scope.attributes.menuItemNames.value;
                scope.menuToggle = function(ev) {
                    var clickedItem = ev.target,
                        treeButton = $(clickedItem);
                        clickedItemPadding = parseFloat($(clickedItem).css('padding-left')),
                        subMenu = $(clickedItem).parent().siblings(),
                        treeItem = $(clickedItem).parent();
                    treeButton.toggleClass('opened');
                    subMenu.toggleClass('opened');
                    subMenu.slideToggle();
                    if ( subMenu.hasClass('opened') ) {
                        subMenu.children().find('md-menu-item > button, md-menu-item > div').css('padding-left', clickedItemPadding + PADDING);
                    } else {
                        treeItem.parent().find('ul.opened').slideUp();
                        treeItem.parent().find('.opened').removeClass('opened');
                        subMenu.children().find('md-menu-item > button, md-menu-item > div').css('padding-left', clickedItemPadding);
                    }
                };
                $timeout(function() {
                    var btns = $('#' + component.id).find('button, div');
                    btns.each(function(index, element) {
                        if ( $(element).parents('.tree-menu-item').length > 1 ) {
                            var buttonPadding = PADDING * $(element).parents('.tree-menu-item').length - PADDING + 'px';
                            $(element).css('padding-left', buttonPadding);
                        }
                    });
                }, 0);
            });
        }
    }
}]);

dfxGCC.directive('dfxGccWebTabs', ['$timeout', '$compile', function($timeout, $compile) {
    return {
        restrict: 'A',
        require: '^dfxGccWebBase',
        scope: true,
        link: function(scope, element, attrs, basectrl) {
            var component = scope.$parent.getComponent(element);
            basectrl.init(scope, element, component, attrs, 'tabs').then(function(){
                scope.attributes.layoutType = { "value": "tabs" };
                scope.attributes.initialized = { "value": true };
                if(!scope.attributes.hasOwnProperty('tabIndex')){scope.attributes.tabIndex = { "value": "" }}
                if(!scope.attributes.toolbar.hasOwnProperty('collapsible')){scope.attributes.toolbar.collapsible = { "value": "false" }}
                if(!scope.attributes.toolbar.hasOwnProperty('collapsed')){scope.attributes.toolbar.collapsed = { "value": "false" }}
                scope.attributes.toolbar.leftMenu.equalButtonSize = { "value": false };
                scope.attributes.toolbar.leftMenu.initialClick = { "value": false };
                scope.attributes.toolbar.leftMenu.dynamicPresent = { "value": false };
                scope.attributes.toolbar.rightMenu.equalButtonSize = { "value": false };
                scope.attributes.toolbar.rightMenu.initialClick = { "value": false };
                scope.attributes.toolbar.rightMenu.dynamicPresent = { "value": false };
                if(scope.attributes.toolbar.leftMenu.hasOwnProperty('iconBarClass')){delete scope.attributes.toolbar.leftMenu.iconBarClass;}
                if(scope.attributes.toolbar.rightMenu.hasOwnProperty('iconBarClass')){delete scope.attributes.toolbar.rightMenu.iconBarClass;}
                if(scope.attributes.toolbar.leftMenu.hasOwnProperty('buttonClass')){delete scope.attributes.toolbar.leftMenu.buttonClass;}
                if(scope.attributes.toolbar.rightMenu.hasOwnProperty('buttonClass')){delete scope.attributes.toolbar.rightMenu.buttonClass;}
                scope.attributes.flex.status = "overridden" ;
                scope.attributes.tabs.status = "overridden" ;
                scope.attributes.centerTabs.status = "overridden" ;
                if(scope.attributes.tabIndex.value === ""){
                    scope.attributes.tabIndex.value = 0;
                }

                scope.setClasses = function(){
                    $timeout(function () {
                        try{
                            for(var k = 0; k < scope.attributes.tabs.value.length; k++){
                                var tabLayoutRows = $('#' + scope.component_id + '_tab_' + k).children();
                                for(var i = 0; i < tabLayoutRows.length; i++){
                                    var tabLayoutRowsCols = $(tabLayoutRows[i]).children() ;
                                    for(var j = 0; j < tabLayoutRowsCols.length; j++){
                                        if(scope.attributes.tabs.value[k].layout.rows[i].cols[j].orientation.value === 'row'){
                                            $(tabLayoutRowsCols[j]).removeClass('layout-column');
                                            $(tabLayoutRowsCols[j]).addClass('layout-row');
                                        }else{
                                            $(tabLayoutRowsCols[j]).removeClass('layout-row');
                                            $(tabLayoutRowsCols[j]).addClass('layout-column');
                                        }
                                        $(tabLayoutRowsCols[j]).addClass('flex' + '-' + scope.attributes.tabs.value[k].layout.rows[i].cols[j].width.value);
                                    }
                                }
                            }
                        }catch(e){
                            /*console.log(e.message);*/
                        }
                    },0);
                };

                scope.setWidth = function(rowIndex, colIndex){
                    $timeout(function () {
                        var tabLayoutRows = $('#' + scope.component_id + '_tab_' + scope.attributes.tabIndex.value).children();
                        var tabLayoutRowsCols = $(tabLayoutRows[rowIndex]).children();
                        if(scope.attributes.tabs.value[scope.attributes.tabIndex.value].layout.rows[rowIndex].cols[colIndex].orientation.value === 'row'){
                            $(tabLayoutRowsCols[colIndex]).removeClass('layout-column');
                            $(tabLayoutRowsCols[colIndex]).addClass('layout-row');

                        }else{
                            $(tabLayoutRowsCols[colIndex]).removeClass('layout-row');
                            $(tabLayoutRowsCols[colIndex]).addClass('layout-column');
                        }
                    },0);
                };

                scope.setTabWidth = function() {
                    $timeout(function () {
                        try{
                            var paginationWrapper = '#' + scope.component_id + '> div.flex > md-content > md-tabs > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper';
                            var inkBar = '#' + scope.component_id + '> div.flex > md-content > md-tabs > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-ink-bar';
                            $(paginationWrapper).css('width', '100%');
                            var temp = $($(paginationWrapper).children()[0]).css('width');
                            var stepWidth = parseInt(temp.substring(0, temp.length - 2));
                            var left = stepWidth * scope.attributes.tabIndex.value + 'px';
                            var right = stepWidth * (scope.attributes.tabs.value.length - 1 - scope.attributes.tabIndex.value) + 'px';
                            $(inkBar).css('left', left);
                            $(inkBar).css('right', right);
                        }catch(e){
                            /*console.log(e.message);*/
                        }
                    },0);
                };

                scope.$watchCollection('attributes.tabs.value[attributes.tabIndex.value].layout.rows', function(newValue){
                    scope.setClasses();
                 });

                scope.$watch('attributes.stretching.value', function(newValue){
                    if(newValue === 'always'){
                        scope.setTabWidth();
                    }
                });

                basectrl.changeWidth(scope);

                scope.collapsePanelBody = function(isCollapsed, index) {
                    if ( scope.attributes.repeat_title.value ) {
                        basectrl.bindScopeVariable( scope, component.attributes.repeat_in.value );
                    } else {
                        basectrl.bindScopeVariable( scope, component.attributes.toolbar.collapsed.value );
                    }
                    if ( scope.attributes.toolbar.collapsed.value == 'true' || scope.attributes.toolbar.collapsed.value == 'false' ) {
                        if ( isCollapsed ) {
                            scope.attributes.toolbar.collapsed.value = 'false';
                        } else {
                            scope.attributes.toolbar.collapsed.value = 'true';
                        }
                    } else {
                        if ( scope.attributes.repeat_title.value ) {
                            var collapsedEl = scope.attributes.toolbar.collapsed.value.replace("$dfx_item.", "");
                            if ( isCollapsed ) {
                                scope[scope.attributes.repeat_in.value][index][collapsedEl] = false;
                            } else {
                                scope[scope.attributes.repeat_in.value][index][collapsedEl] = true;
                            }
                        } else {
                            if ( isCollapsed ) {
                                scope.$parent_scope[scope.attributes.toolbar.collapsed.value] = false;
                            } else {
                                scope.$parent_scope[scope.attributes.toolbar.collapsed.value] = true;
                            }
                        }
                    }
                }

                scope.checkPanelBody = function() {
                    if ( scope.attributes.toolbar.collapsed.value == 'true' ) {
                        scope.attributes.toolbar.collapsed.designValue = true;
                    } else {
                        scope.attributes.toolbar.collapsed.designValue = false;
                    }
                }

                scope.checkCollapses = function() {
                    if ( !scope.attributes.toolbar.hasOwnProperty('collapsed') ) {
                        var addCollapsed = { "collapsed": { "value": "false" }};
                        scope.attributes.toolbar.collapsed = addCollapsed.collapsed;
                    }
                    if ( !scope.attributes.toolbar.hasOwnProperty('collapsible') ) {
                        var addCollapsible = { "collapsible": { "value": "false" }};
                        scope.attributes.toolbar.collapsible = addCollapsible.collapsible;
                    }
                    if ( !scope.attributes.hasOwnProperty('repeat_title') ) {
                        var addRepeatTitle = { "repeat_title": { "value": false }};
                        scope.attributes.repeat_title = addRepeatTitle.repeat_title;
                    }
                }

                scope.checkCollapses();

                var flexTabInRunTime = function() {
                    if (!scope.attributes.autoHeight || scope.attributes.autoHeight.value != true) {
                        $timeout(function () {
                            var $md_tab_content_wrapper = $('#' + scope.component_id + ' > div > md-content > md-tabs > md-tabs-content-wrapper');
                            $md_tab_content_wrapper.attr('flex', '100');
                            $md_tab_content_wrapper.addClass('flex-100');
                            $md_tab_content_wrapper.attr('layout', 'column');

                            var $md_tab_content = $md_tab_content_wrapper.children('md-tab-content');
                            $md_tab_content.attr('flex', '100');
                            $md_tab_content.css('height', '100%');
                            $md_tab_content.attr('layout', 'column');

                            var $md_tabs_template = $md_tab_content.children('div[md-tabs-template]');
                            $md_tabs_template.attr('flex', '100');
                            $md_tabs_template.css('height', '100%');
                            $md_tabs_template.attr('layout', 'column');
                        }, 0);
                    }
                };
                flexTabInRunTime();
            });
        }
    }
}]);

/* Directive for Dynamic ng-models */
dfxGCC.directive('dfxComplexNgModel', ['$timeout', '$compile', '$parse', function ($timeout, $compile, $parse) {
    return {
        restrict: 'A',
        terminal: true,
        priority: 100000,
        scope: true,
        link: function (scope, element) {
            var binding;
            if(scope.attributes.binding.value && scope.attributes.binding.value !==''){
                binding = scope.attributes.binding.value;
                if(binding.indexOf('$dfx_item')===-1) binding = '$parent_scope.'+binding;
                element.removeAttr('dfx-complex-ng-model');
                element.attr('ng-model', binding);
                $compile(element)(scope);
            }
        }
    };
}]);

/* Directive for Dynamic values */
dfxGCC.directive('dfxComplexValue', ['$timeout', '$compile', '$parse', function ($timeout, $compile, $parse) {
    return {
        restrict: 'A',
        terminal: true,
        priority: 100000,
        transclude: true,
        scope: true,
        link: function (scope, element) {
            var binding,
            interval = setInterval(function() {
                if (typeof scope.attributes.binding === 'undefined') return;
                clearInterval(interval);
                binding = scope.attributes.binding.value;
                if(binding !==''){
                    if(binding.indexOf('$dfx_item')===-1) binding = '$parent_scope.'+binding;
                    element.removeAttr('dfx-complex-value');
                    element.attr('value', binding);
                    $compile(element)(scope);
                }
            }, 10);
        }
    };
}]);

dfxGCC.directive('dfxGccWebWizard', ['$mdDialog', '$timeout', '$compile', function($mdDialog, $timeout, $compile) {
    return {
        restrict: 'A',
        require: '^dfxGccWebBase',
        scope: true,
        link: function(scope, element, attrs, basectrl) {
            var component = scope.$parent.getComponent(element);
            basectrl.init(scope, element, component, attrs, 'wizard').then(function(){
                scope.attributes.layoutType = {"value": "wizard"};
                scope.attributes.initialized = {"value": true};
                scope.attributes.stepIndex = {'value': 0};
                scope.attributes.steps.status = "overridden";
                scope.attributes.centerSteps.status = "overridden";
                scope.attributes.stepIndex.status = "overridden" ;
                scope.attributes.flex.status = "overridden";
                scope.attributes.toolbar.leftMenu.equalButtonSize = { "value": false };
                scope.attributes.toolbar.leftMenu.initialClick = { "value": false };
                scope.attributes.toolbar.leftMenu.dynamicPresent = { "value": false };
                scope.attributes.toolbar.rightMenu.equalButtonSize = { "value": false };
                scope.attributes.toolbar.rightMenu.initialClick = { "value": false };
                scope.attributes.toolbar.rightMenu.dynamicPresent = { "value": false };
                if(scope.attributes.toolbar.leftMenu.hasOwnProperty('iconStyle')){delete scope.attributes.toolbar.leftMenu.iconStyle;}
                if(scope.attributes.toolbar.leftMenu.hasOwnProperty('iconClass')){delete scope.attributes.toolbar.leftMenu.iconClass;}
                if(scope.attributes.toolbar.leftMenu.hasOwnProperty('iconBarClass')){delete scope.attributes.toolbar.leftMenu.iconBarClass;}
                if(scope.attributes.toolbar.leftMenu.hasOwnProperty('buttonStyle')){delete scope.attributes.toolbar.leftMenu.buttonStyle;}
                if(scope.attributes.toolbar.leftMenu.hasOwnProperty('buttonClass')){delete scope.attributes.toolbar.leftMenu.buttonClass;}
                if(scope.attributes.toolbar.rightMenu.hasOwnProperty('iconStyle')){delete scope.attributes.toolbar.rightMenu.iconStyle;}
                if(scope.attributes.toolbar.rightMenu.hasOwnProperty('iconClass')){delete scope.attributes.toolbar.rightMenu.iconClass;}
                if(scope.attributes.toolbar.rightMenu.hasOwnProperty('iconBarClass')){delete scope.attributes.toolbar.rightMenu.iconBarClass;}
                if(scope.attributes.toolbar.rightMenu.hasOwnProperty('buttonStyle')){delete scope.attributes.toolbar.rightMenu.buttonStyle;}
                if(scope.attributes.toolbar.rightMenu.hasOwnProperty('buttonClass')){delete scope.attributes.toolbar.rightMenu.buttonClass;}
                var previousButton = scope.attributes.previousButton.classes.value.replace("md-raised", "");
                    previousButton = previousButton.replace("md-primary", "");
                    scope.attributes.previousButton.classes.value = previousButton;
                var nextButton = scope.attributes.nextButton.classes.value.replace("md-raised", "");
                    nextButton = nextButton.replace("md-primary", "");
                    scope.attributes.nextButton.classes.value = nextButton;
                var submitButton = scope.attributes.submitButton.classes.value.replace("md-raised", "");
                    submitButton = submitButton.replace("md-primary", "");
                    scope.attributes.submitButton.classes.value = submitButton;

                for (var s = 0; s < scope.attributes.steps.value.length; s++) {
                    if(!scope.attributes.steps.value[s].hasOwnProperty('percent')){scope.attributes.steps.value[s].percent = { "value": 0 };}
                    if(!scope.attributes.steps.value[s].hasOwnProperty('isLast')){scope.attributes.steps.value[s].isLast = { "value": "" };}
                };

                $timeout(function () {
                    try{
                        scope.wizardForm = eval('scope.form_' + scope.component_id);
                        var formName = '#form_' + scope.component_id ;
                        var inputs = $(formName).find('md-input-container');
                        scope.totalInputsNumber = inputs.length;
                        if(scope.totalInputsNumber > 0){
                            for(var i =0; i < scope.attributes.steps.value.length; i++){
                                var stepFormName = '#form_' + scope.component_id + '_step_' + i;
                                var stepInputs = $(stepFormName).find('md-input-container');
                                scope.attributes.steps.value[i].percent.value =  100 * stepInputs.length/scope.totalInputsNumber;
                            }
                        }
                    }catch(e){
                        /*console.log(e.message);*/
                    }
                },0);

                var changeStepform = function() {
                    for(var i =0; i < scope.attributes.steps.value.length; i++){
                        if(i < scope.attributes.steps.value.length-1){
                            scope.attributes.steps.value[i].isLast.value = false;
                        }else{
                            scope.attributes.steps.value[scope.attributes.steps.value.length - 1].isLast.value = true;
                        }

                        var stepFormName = 'stepForm' + scope.attributes.stepIndex.value;
                        scope.stepForm = (scope.wizardForm[stepFormName]);
                    }
                };

                scope.incrIndex = function() {
                    scope.attributes.stepIndex.value++;// change selected step

                    changeStepform();

                    // change form validation
                    if(scope.stepForm.$valid){
                        scope.attributes.steps.value[ scope.attributes.stepIndex.value - 1 ].validDisabled.value = true;
                        scope.calcPercent();
                    }
                };

                scope.decrIndex = function(){
                    scope.attributes.stepIndex.value--;
                };

                scope.prevent = function(event){
                    event.preventDefault();
                    event.stopPropagation();
                };

                scope.calcPercent = function(){
                    scope.attributes.percentage.value = 0;
                    $timeout(function () {
                        for(var i =0; i < scope.attributes.steps.value.length; i++){
                             if(scope.wizardForm['stepForm'+i].$valid){
                                 scope.attributes.percentage.value = scope.attributes.percentage.value + scope.attributes.steps.value[i].percent.value ;
                             }
                        }
                        scope.attributes.percentage.value = Math.round(scope.attributes.percentage.value);
                    },0);
                };

                basectrl.changeWidth(scope);

                if (!scope.attributes.autoHeight || scope.attributes.autoHeight.value != true) {
                    $timeout(function () {
                        var $md_tab_content_wrapper = $('#' + scope.component_id + ' > div > div > md-content > form > md-tabs > md-tabs-content-wrapper');
                        $md_tab_content_wrapper.addClass('flex-100');
                        $md_tab_content_wrapper.addClass('layout-column');

                        var $md_tab_content = $md_tab_content_wrapper.children('md-tab-content');
                        $md_tab_content.addClass('flex-100');
                        $md_tab_content.css('height', '100%');
                        $md_tab_content.addClass('layout-column');

                        var $md_tabs_template = $md_tab_content.children('div[md-tabs-template]');
                        $md_tabs_template.addClass('flex-100');
                        $md_tabs_template.css('height', '100%');
                        $md_tabs_template.addClass('layout-column');
                    }, 0);
                }
            });
        }
    }
}]);

dfxGCC.directive('dfxGccWebIcon', ['$http', '$mdDialog', '$timeout', '$filter', function($http, $mdDialog, $timeout, $filter) {
    return {
        restrict: 'A',
        require: '^dfxGccWebBase',
        scope: true,
        link: function(scope, element, attrs, basectrl) {
            var component = scope.getComponent(element);
            basectrl.init(scope, element, component, attrs, 'icon').then(function() {
                scope.checkState = function( dfxIsState ){
                    if(scope.attributes.state.bindingType === 'boolean'){
                        scope.attributes.state.binding = scope.attributes.state.binding === 'true' ? 'false' : 'true';
                        return;
                    }
                    return !dfxIsState;
                }
            });
        }
    }
}]);

dfxGCC.directive('dfxGccWebDatatable', ['$timeout', '$mdDialog', '$filter', '$http', function($timeout, $mdDialog, $filter, $http) {
    return {
        restrict: 'A',
        require: '^dfxGccWebBase',
        scope: true,
        link: {
            pre : function(scope, element, attrs, basectrl) {
                var component = scope.getComponent(element);
                scope.component_id = component.id;
                var orderBy = $filter('orderBy');
                var filterBy = $filter('filter');
                scope.$gcscope = scope;
                scope._selectedAllRows=false;
                scope._selectedRows=[];
                scope.dynamicPresent = false;
                basectrl.init(scope, element, component, attrs, 'table').then(function(){
                    scope.attributes.rangeStart = { "value": 1 };
                    scope.attributes.tableRows = { "value": [] };
                    scope.attributes.columnIndex = { "value": "" };
                    scope.attributes.newId = { "value": "" };
                    if(!scope.attributes.hasOwnProperty('flex')){scope.attributes.flex = {"value": 100}}
                    if(!scope.attributes.hasOwnProperty('modulo')){scope.attributes.modulo = {"value":""}}

                    scope.attributes.bindingClone.value = [];//scope.$gcscope[scope.attributes.binding.value];
                    // scope.attributes.columnIndex.value = parseInt(scope.attributes.columnIndex.value);
                    scope.attributes.newId.value = scope.attributes.columns.value.length + 1;
                    scope.attributes.rowCount.value = parseInt(scope.attributes.rowCount.value);
                    scope.attributes.stepsNumber.value = 3;
                    scope.attributes.stepCounter.value = 1;
                    scope.attributes.rangeEnd.value = parseInt(scope.attributes.rowCount.value);
                    scope.attributes.rangeStart.value = 1;
                    scope.attributes.modulo.value = 0;
                    var originalBindingClone = [];

                    if ( !scope.attributes.hasOwnProperty('filterable') ) { scope.attributes.filterable = { "value": false } }
                    if ( !scope.attributes.hasOwnProperty('filterBy') ) { scope.attributes.filterBy = { "value": "" } }
                    if ( !scope.attributes.hasOwnProperty('headerVisible') ) { scope.attributes.filterBy = { "headerVisible": true } }

                    if (scope.attributes.checkBinding.value!='') {
                        scope.dynamicPresent = true;
                        scope._selectedRows = scope.$parent_scope[scope.attributes.checkBinding.value];
                        scope.$watch( '$parent_scope[attributes.checkBinding.value]', function( newValue ) {
                            if ( newValue ) {
                                scope._selectedRows = newValue;
                            }
                            if ( newValue.length!==0 && angular.equals( newValue, scope.attributes.bindingClone.value ) ) {
                                scope._selectedAllRows = true;
                            } else {
                                scope._selectedAllRows = false;
                            }
                        });
                    } else {
                        scope._selectedRows = [];
                    }

                    scope.$watch(scope.attributes.binding.value, function(value) {
                        var val = value || null;
                        if (val) {
                            if (scope.attributes.bindingClone.value == null) {
                                scope.attributes.bindingClone.value = [];
                            } else {
                                scope.attributes.bindingClone.value.splice( 0, scope.attributes.bindingClone.value.length );
                            }
                            for (var i=0; i<val.length; i++) {
                                scope.attributes.bindingClone.value.push(val[i]);
                            }
                            scope.attributes.stepsNumber.value = (scope.attributes.bindingClone.value.length - scope.attributes.bindingClone.value.length % scope.attributes.rowCount.value)/scope.attributes.rowCount.value;
                            originalBindingClone = scope.attributes.bindingClone.value;
                        }
                    }, true);

                    scope.plusStep = function(){
                        if(scope.attributes.stepCounter.value <= scope.attributes.stepsNumber.value){
                            scope.attributes.stepCounter.value++;
                            if(scope.attributes.stepCounter.value === scope.attributes.stepsNumber.value+1){
                                scope.attributes.rangeEnd.value = scope.attributes.bindingClone.value.length;
                                scope.attributes.modulo.value = scope.attributes.bindingClone.value.length % scope.attributes.rowCount.value ;
                                if(scope.attributes.modulo.value!==0){
                                    scope.attributes.rangeStart.value = scope.attributes.rangeEnd.value - scope.attributes.modulo.value + 1;
                                }else{
                                    return;
                                }
                            }else{
                                scope.attributes.modulo.value = 0;
                                scope.attributes.rangeEnd.value = scope.attributes.rowCount.value * scope.attributes.stepCounter.value;
                                scope.attributes.rangeStart.value = scope.attributes.rangeEnd.value - scope.attributes.rowCount.value + 1;
                            }
                        }
                    }

                    scope.minusStep = function(){
                        if(scope.attributes.stepCounter.value > 1){
                            scope.attributes.stepCounter.value-- ;
                            scope.attributes.rangeEnd.value = scope.attributes.rowCount.value * scope.attributes.stepCounter.value;
                            scope.attributes.rangeStart.value = scope.attributes.rangeEnd.value - scope.attributes.rowCount.value + 1;
                        }
                    }

                    scope.changeIndexAndSortDir = function(index){
                        scope.attributes.sortedBy.value = scope.attributes.columns.value[index].value;
                        if(scope.attributes.columns.value[index].value === scope.attributes.sortedBy.value){
                            if(scope.attributes.columns.value[index].isAscending === "true"){
                                scope.attributes.columns.value[index].isAscending = "false";
                            } else{
                                scope.attributes.columns.value[index].isAscending = "true";
                            }
                        }
                        scope.attributes.columnIndex.value = index;
                        scope.attributes.bindingClone.value = orderBy(scope.attributes.bindingClone.value, scope.attributes.sortedBy.value, scope.attributes.columns.value[index].isAscending === "true");
                        originalBindingClone = scope.attributes.bindingClone.value;
                    }

                    scope.isSelectedRows = function() {
                        return scope._selectedAllRows;
                    };

                    scope.isSelectedRow = function(item) {
                        return (scope._selectedRows.indexOf(item)>-1);
                    };

                    scope.toggleSelectRows = function() {
                        scope._selectedAllRows = !scope._selectedAllRows;
                        var nb_rows = scope.attributes.bindingClone.value.length;
                        scope._selectedRows.splice(0, scope._selectedRows.length);
                        if (scope._selectedAllRows) {
                            for (var i=0; i<nb_rows; i++) {
                                scope._selectedRows.push(scope.attributes.bindingClone.value[i]);
                            }
                        }
                    };

                    scope.toggleSelectRow = function(item) {
                        if (scope._selectedAllRows) {
                            scope._selectedAllRows = false;
                        }
                        var pos_index = scope._selectedRows.indexOf(item);
                        if (pos_index == -1) {
                            scope._selectedRows.push(item);
                        } else {
                            scope._selectedRows.splice(pos_index, 1);
                        }
                        if ( scope.dynamicPresent ) {
                            scope.$parent_scope[scope.attributes.checkBinding.value] = scope._selectedRows;
                        }
                    };

                    scope.$watch('attributes.rowCount.value', function(newValue, oldValue){
                        if (newValue!=null) {
                            // if (newValue !== oldValue) {
                                scope.attributes.stepsNumber.value = (scope.attributes.bindingClone.value.length - scope.attributes.bindingClone.value.length % newValue)/newValue;
                                scope.attributes.stepCounter.value = 1;
                                scope.attributes.rangeEnd.value = newValue;
                                scope.attributes.rangeStart.value = 1;
                            // }
                        }
                    });

                    scope.filterTableData = function( filterQuery ) {
                        if ( filterQuery !== '' ) {
                            scope.attributes.bindingClone.value = filterBy(originalBindingClone, filterQuery, 'strict');
                        } else {
                            scope.attributes.bindingClone.value = originalBindingClone;
                        }
                        $timeout(function(){
                            scope.attributes.rangeStart.value = 1;
                            scope.attributes.stepCounter.value = 1;
                            scope.attributes.rangeEnd.value = parseInt(scope.attributes.rowCount.value);
                        }, 0);
                    }

                    scope.changeWidth = function(){
                        var component = angular.element(document.querySelectorAll('[id="' + scope.component_id + '"]'));//for repeatable panels
                        component.css('width', scope.attributes.flex.value + '%');
                    };
                    scope.changeWidth();
                });
            }
        }
    }
}]);
