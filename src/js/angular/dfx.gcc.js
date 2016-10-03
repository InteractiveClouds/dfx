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
                    if (angular.isDefined(attrs.dfxGcDesign)) {
                        if (component.children.length >0) {
                            for (var i=0; i<component.children.length; i++) {
                                scope.rendering_children[component.children[i].id] = { 'rendered': false };
                            }
                            scope.$parent.addComponents(component.children, component, null, scope.component_id, attrs.viewId);
                        }
                    } else {
                        if (scope.parent_id!=null && scope.parent_id!='') {
                            $rootScope.$emit(scope.parent_id + '_child_rendered', scope.component_id);
                        }
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
                if(scope.attributes.hasOwnProperty('collapsible')){delete scope.attributes.collapsible;}
                if(scope.attributes.toolbar.leftMenu.hasOwnProperty('iconBarClass')){delete scope.attributes.toolbar.leftMenu.iconBarClass;}
                if(scope.attributes.toolbar.rightMenu.hasOwnProperty('iconBarClass')){delete scope.attributes.toolbar.rightMenu.iconBarClass;}
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
                        $('#' + scope.component_id).css('width', scope.attributes.flex.value + '%');
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

                scope.setCarouselDataSource = function() {
                    scope.carouselDataName = { "value": "" };
                    scope.carouselDataName.value = scope.attributes.optionsType.value === 'dynamic' ? scope.attributes.optionItemNames.value.source : 'attributes.static.value';
                }
                scope.compileSlides = function(){
                    if (!angular.isDefined(attrs.dfxGcDesign) && !angular.isDefined(attrs.dfxGcEdit)) {
                        $timeout(function(){
                            var screenSlides = $("#" + component.id + "_dfx_gc_web_carousel .dfx-carousel-item");
                            if ( scope.attributes.optionsType.value === 'dynamic' ) {
                                var slidesCount = scope.$parent_scope[scope.attributes.optionItemNames.value.source].length;
                                for ( var i = 0; i < slidesCount; i++ ) {
                                    $(screenSlides).eq(i+1).find('img').attr('ng-src', '{{'+scope.$parent_scope[scope.attributes.optionItemNames.value.source][i][scope.attributes.optionItemNames.value.src]+'}}');
                                    $(screenSlides).eq(i+1).find('.dfx-carousel-item-title').html(scope.$parent_scope[scope.attributes.optionItemNames.value.source][i][scope.attributes.optionItemNames.value.title]);
                                    $(screenSlides).eq(i+1).find('.dfx-carousel-item-description').html(scope.$parent_scope[scope.attributes.optionItemNames.value.source][i][scope.attributes.optionItemNames.value.description]);
                                    $(screenSlides).eq(i+1).find('img').attr('ng-click', scope.$parent_scope[scope.attributes.optionItemNames.value.source][i][scope.attributes.optionItemNames.value.onclick]);
                                    if(i===0){
                                        $(screenSlides).eq(slidesCount+1).find('img').attr('ng-src', '{{'+scope.$parent_scope[scope.attributes.optionItemNames.value.source][i][scope.attributes.optionItemNames.value.src]+'}}');
                                        $(screenSlides).eq(slidesCount+1).find('.dfx-carousel-item-title').html(scope.$parent_scope[scope.attributes.optionItemNames.value.source][i][scope.attributes.optionItemNames.value.title]);
                                        $(screenSlides).eq(slidesCount+1).find('.dfx-carousel-item-description').html(scope.$parent_scope[scope.attributes.optionItemNames.value.source][i][scope.attributes.optionItemNames.value.description]);
                                    }
                                    if(i===slidesCount-1){
                                        $(screenSlides).eq(0).find('img').attr('ng-src', '{{'+scope.$parent_scope[scope.attributes.optionItemNames.value.source][i][scope.attributes.optionItemNames.value.src]+'}}');
                                        $(screenSlides).eq(0).find('.dfx-carousel-item-title').html(scope.$parent_scope[scope.attributes.optionItemNames.value.source][i][scope.attributes.optionItemNames.value.title]);
                                        $(screenSlides).eq(0).find('.dfx-carousel-item-description').html(scope.$parent_scope[scope.attributes.optionItemNames.value.source][i][scope.attributes.optionItemNames.value.description]);
                                    }
                                }
                            } else {
                                for ( var i = 0; i < scope.attributes.static.value.length; i++ ) {
                                    $(screenSlides).eq(i+1).find('img').attr('ng-click', '$eval(attributes.static.value['+[i]+'].onclick)');
                                }
                            }
                            $compile($("#" + component.id + "_dfx_gc_web_carousel .dfx-carousel-item-image-container").contents())(scope);
                            $compile($("#" + component.id + "_dfx_gc_web_carousel .dfx-carousel-item-title").contents())(scope);
                            $compile($("#" + component.id + "_dfx_gc_web_carousel .dfx-carousel-item-description").contents())(scope);
                        }, 0);
                    }
                }
                scope.simpleCarousel = function() {
                    scope.setCarouselDataSource();
                    var simpleCarouselSnippet = '<jk-carousel data="<<carouselSource>>" item-template-url="\'<<carouselTemplate>>\'" max-width="<<carouselMaxWidth>>" max-height="<<carouselMaxHeight>>"></jk-carousel>',
                        parsedSimpleCarousel = simpleCarouselSnippet
                            .replace('<<carouselSource>>', scope.carouselDataName.value)
                            .replace('<<carouselTemplate>>', scope.attributes.optionsType.value === 'dynamic' && (!angular.isDefined(attrs.dfxGcDesign) && !angular.isDefined(attrs.dfxGcEdit)) ? '/gcontrols/web/carousel_item_dynamic.html' : '/gcontrols/web/carousel_item_static.html')
                            .replace('<<carouselMaxWidth>>', scope.attributes.maxWidth.value)
                            .replace('<<carouselMaxHeight>>', scope.attributes.maxHeight.value);
                    $timeout(function(){
                        $("#" + component.id + "_dfx_gc_web_carousel").empty().html(parsedSimpleCarousel);
                        $timeout(function(){
                            $compile($("#" + component.id + "_dfx_gc_web_carousel").contents())(scope);
                            scope.compileSlides();
                        }, 0);
                    }, 0);
                }
                scope.autoCarousel = function() {
                    scope.setCarouselDataSource();
                    var autoCarouselSnippet = '<jk-carousel data="<<carouselSource>>" item-template-url="\'<<carouselTemplate>>\'" auto-slide="<<carouselAutoSlide>>" auto-slide-time="<<carouselSlideInterval>>" max-width="<<carouselMaxWidth>>" max-height="<<carouselMaxHeight>>"></jk-carousel>',
                        parsedAutoCarousel = autoCarouselSnippet
                            .replace('<<carouselSource>>', scope.carouselDataName.value)
                            .replace('<<carouselTemplate>>', scope.attributes.optionsType.value === 'dynamic' && (!angular.isDefined(attrs.dfxGcDesign) && !angular.isDefined(attrs.dfxGcEdit)) ? '/gcontrols/web/carousel_item_dynamic.html' : '/gcontrols/web/carousel_item_static.html')
                            .replace('<<carouselAutoSlide>>', scope.attributes.autoSlide.value)
                            .replace('<<carouselSlideInterval>>', scope.attributes.slideInterval.value)
                            .replace('<<carouselMaxWidth>>', scope.attributes.maxWidth.value)
                            .replace('<<carouselMaxHeight>>', scope.attributes.maxHeight.value);
                    $timeout(function(){
                        $("#" + component.id + "_dfx_gc_web_carousel").empty().html(parsedAutoCarousel);
                        $timeout(function(){
                            $compile($("#" + component.id + "_dfx_gc_web_carousel").contents())(scope);
                            scope.compileSlides();
                        }, 0);
                    }, 0);
                }
                scope.parseSlideSrc = function() {
                    for ( var i = 0; i < scope.attributes.static.value.length; i++ ) {
                        var testSrc = scope.attributes.static.value[i].src;
                        if (testSrc.indexOf("'") == -1) {
                            scope.attributes.static.value[i].parsedSrc = scope.$gcscope[scope.attributes.static.value[i].src];
                        } else if (testSrc.indexOf("'") == 0 && testSrc.lastIndexOf("'") == (testSrc.length - 1) && testSrc.length > 2) {
                            var srcWithoutQuotes = testSrc.replace(/'/g, '');
                            scope.attributes.static.value[i].parsedSrc = srcWithoutQuotes;
                        } else {
                            scope.attributes.static.value[i].parsedSrc = scope.attributes.static.value[i].src;
                        }
                    }
                }
                scope.rebuildCarousel = function() {
                    if ( scope.attributes.optionsType.value === 'static' && scope.attributes.static.value.length > 0 ) {
                        scope.parseSlideSrc();
                    }
                    $timeout(function(){
                        scope.attributes.autoSlide.value === 'true' ? scope.autoCarousel() : scope.simpleCarousel();
                    }, 0);
                }

                if (!angular.isDefined(attrs.dfxGcDesign) && !angular.isDefined(attrs.dfxGcEdit)) {
                    if ( scope.attributes.optionsType.value === 'dynamic' ) {
                        scope.$watch('$parent_scope[attributes.optionItemNames.value.source]', function(newValue, oldValue) {
                            if ( newValue ) {
                                scope.rebuildCarousel();
                            }
                        }, true);
                        // basectrl.bindScopeVariable(scope, component.attributes.dynamic.value);
                    } else {
                        scope.$watch('attributes.static.value', function(newValue, oldValue) {
                            if ( newValue ) {
                                $timeout(function(){
                                    scope.rebuildCarousel();
                                }, 0, false);
                            }
                        }, true);
                    }
                }
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

                scope.getDynamicItems = function() {
                    return scope.$gcscope[scope.attributes.dynamic.value];
                };
                scope.getStaticItems = function() {
                    return scope.attributes.static.value;
                };
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
                    $('#' + scope.component_id).css('width', scope.attributes.flex.value + '%');

                    $timeout(function(){
                        var preview_wrapper = '#' + scope.component_id;
                        $(preview_wrapper).css('width', scope.attributes.flex.value + '%');

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
                scope.component_id = component.id;
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
                    var singleMenuItem = '<md-button ng-show="{{itemDisplay}}" ng-disabled="{{itemDisabled}}" ng-click="{{itemClick}}" class="dfx-menu-button {{attributes.singleMenu.class}}" style="{{attributes.singleMenu.style}}" aria-label="iconbar-button" >'+
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
                                    if (angular.isDefined(attrs.dfxGcEdit) || angular.isDefined(attrs.dfxGcDesign)) {
                                        var iconbarItem = iconbarMenuItem.replace('{{itemDisplay}}', true);
                                    } else {
                                        var iconbarItem = iconbarMenuItem.replace('{{itemDisplay}}', typeof nextLevel[i].display === 'string' ? nextLevel[i].display.replace(/"/g, '\'') : nextLevel[i].display);
                                    }
                                    scope.iconBar = scope.iconBar + iconbarItem + '<md-menu>';
                                    if (angular.isDefined(attrs.dfxGcEdit) || angular.isDefined(attrs.dfxGcDesign)) {
                                        var singleMenu = singleMenuItem
                                            .replace('{{ifFaIcon}}', nextLevel[i].icon.value.length > 0 && nextLevel[i].icon.type === 'fa-icon' ? true : false )
                                            .replace('{{ifSvgIcon}}', nextLevel[i].icon.value.length > 0 && nextLevel[i].icon.type === 'svg-icon' ? true : false )
                                            .replace('{{faIcon}}', nextLevel[i].icon.value.indexOf("'") == -1 ? 'fa-home' : eval(nextLevel[i].icon.value.replace(/"/g, '\'')) )
                                            .replace('{{svgIcon}}', nextLevel[i].icon.value.indexOf("'") == -1 ? 'home' : eval(nextLevel[i].icon.value.replace(/"/g, '\'')) )
                                            .replace('{{itemLabel}}', $filter('checkExpression')(nextLevel[i].label.replace(/"/g, '\'')))
                                            .replace('{{itemShortcut}}', nextLevel[i].shortcut.replace(/"/g, '\''))
                                            .replace('{{ifItemNotification}}', nextLevel[i].notification !=='' ? true : false )
                                            .replace('{{itemNotification}}', nextLevel[i].notification )
                                            .replace('{{itemDisplay}}', typeof nextLevel[i].display === 'string' ? nextLevel[i].display.replace(/"/g, '\'') : nextLevel[i].display)
                                            .replace('{{itemDisabled}}', typeof nextLevel[i].disabled === 'string' ? nextLevel[i].disabled.replace(/"/g, '\'') : nextLevel[i].disabled)
                                            .replace('{{itemClick}}', '$mdOpenMenu();'+nextLevel[i].onclick.replace(/"/g, '\''));
                                    } else {
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
                                    }
                                    scope.iconBar = scope.iconBar + singleMenu +'<md-menu-content width="4">';
                                    buildNextLevel(next, optionsType);
                                    scope.iconBar = scope.iconBar + '</md-menu-content></md-menu></md-menu-item>';
                                } else {
                                    if ( nextLevel[i].divider === true ) {
                                        scope.iconBar = scope.iconBar + '<md-menu-divider></md-menu-divider>';
                                    } else {
                                        if ( !nextLevel[i].hasOwnProperty('iconType') && !nextLevel[i].divider && !nextLevel[i].title) { nextLevel[i].iconType = 'fa-icon'; }
                                        if (angular.isDefined(attrs.dfxGcEdit) || angular.isDefined(attrs.dfxGcDesign)) {
                                            var iconbarItem = iconbarMenuItem.replace('{{itemDisplay}}', true);
                                        } else {
                                            var iconbarItem = iconbarMenuItem.replace('{{itemDisplay}}', typeof nextLevel[i].display === 'string' ? nextLevel[i].display.replace(/"/g, '\'') : nextLevel[i].display);
                                        }
                                        scope.iconBar = scope.iconBar + iconbarItem;
                                        if (angular.isDefined(attrs.dfxGcEdit) || angular.isDefined(attrs.dfxGcDesign)) {
                                            var singleMenu = singleMenuItem
                                                .replace('{{ifFaIcon}}', nextLevel[i].icon.value.length > 0 && nextLevel[i].icon.type === 'fa-icon' ? true : false )
                                                .replace('{{ifSvgIcon}}', nextLevel[i].icon.value.length > 0 && nextLevel[i].icon.type === 'svg-icon' ? true : false )
                                                .replace('{{faIcon}}', nextLevel[i].icon.value.indexOf("'") == -1 ? 'fa-home' : eval(nextLevel[i].icon.value.replace(/"/g, '\'')) )
                                                .replace('{{svgIcon}}', nextLevel[i].icon.value.indexOf("'") == -1 ? 'home' : eval(nextLevel[i].icon.value.replace(/"/g, '\'')) )
                                                .replace('{{itemLabel}}', $filter('checkExpression')(nextLevel[i].label.replace(/"/g, '\'')))
                                                .replace('{{itemShortcut}}', nextLevel[i].shortcut.replace(/"/g, '\''))
                                                .replace('{{ifItemNotification}}', nextLevel[i].notification !=='' ? true : false )
                                                .replace('{{itemNotification}}', nextLevel[i].notification )
                                                .replace('{{itemDisplay}}', true)
                                                .replace('{{itemDisabled}}', typeof nextLevel[i].disabled === 'string' ? nextLevel[i].disabled.replace(/"/g, '\'') : nextLevel[i].disabled)
                                                .replace('{{itemClick}}', nextLevel[i].onclick.replace(/"/g, '\''));
                                        } else {
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
                                        }
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
                                        .replace('{{faIcon}}', nextLevel[i][scope.itemNames.main.icon.value] && nextLevel[i][scope.itemNames.main.icon.value][scope.itemNames.main.icon.name] ? '{{'+nextLevel[i][scope.itemNames.main.icon.value][scope.itemNames.main.icon.name]+'}}' : '')
                                        .replace('{{svgIcon}}', nextLevel[i][scope.itemNames.main.icon.value] && nextLevel[i][scope.itemNames.main.icon.value][scope.itemNames.main.icon.name] ? '{{'+nextLevel[i][scope.itemNames.main.icon.value][scope.itemNames.main.icon.name]+'}}' : '' )
                                        .replace('{{itemLabel}}', '{{'+nextLevel[i][scope.itemNames.main.label]+'}}' )
                                        .replace('{{itemShortcut}}', nextLevel[i][scope.itemNames.main.shortcut])
                                        .replace('{{ifItemNotification}}', nextLevel[i][scope.itemNames.main.notification] !=='' ? true : false )
                                        .replace('{{itemNotification}}', '{{'+nextLevel[i][scope.itemNames.main.notification]+'}}' )
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
                                        scope.iconBar = scope.iconBar + '<md-menu-item class="tree-menu-title"><div>{{'+nextLevel[i][scope.itemNames.main.label]+'}}</div></md-menu-item>';
                                    } else {
                                        var iconbarItem = iconbarMenuItem.replace('{{itemDisplay}}', scope.itemNames.main.display !=='' ? nextLevel[i][scope.itemNames.main.display] : true);
                                        scope.iconBar = scope.iconBar + iconbarItem;
                                        var singleMenu = singleMenuItem
                                            .replace('{{ifFaIcon}}', nextLevel[i][scope.itemNames.main.icon.value] && nextLevel[i][scope.itemNames.main.icon.value][scope.itemNames.main.icon.name] && nextLevel[i][scope.itemNames.main.icon.value][scope.itemNames.main.icon.type] === 'fa-icon' ? true : false )
                                            .replace('{{ifSvgIcon}}', nextLevel[i][scope.itemNames.main.icon.value] && nextLevel[i][scope.itemNames.main.icon.value][scope.itemNames.main.icon.name] && nextLevel[i][scope.itemNames.main.icon.value][scope.itemNames.main.icon.type] === 'svg-icon' ? true : false )
                                            .replace('{{faIcon}}', nextLevel[i][scope.itemNames.main.icon.value] && nextLevel[i][scope.itemNames.main.icon.value][scope.itemNames.main.icon.name] ? '{{'+nextLevel[i][scope.itemNames.main.icon.value][scope.itemNames.main.icon.name]+'}}' : '')
                                            .replace('{{svgIcon}}', nextLevel[i][scope.itemNames.main.icon.value] && nextLevel[i][scope.itemNames.main.icon.value][scope.itemNames.main.icon.name] ? '{{'+nextLevel[i][scope.itemNames.main.icon.value][scope.itemNames.main.icon.name]+'}}' : '' )
                                            .replace('{{itemLabel}}', '{{'+nextLevel[i][scope.itemNames.main.label]+'}}' )
                                            .replace('{{itemShortcut}}', nextLevel[i][scope.itemNames.main.shortcut])
                                            .replace('{{ifItemNotification}}', nextLevel[i][scope.itemNames.main.notification] !=='' ? true : false )
                                            .replace('{{itemNotification}}', '{{'+nextLevel[i][scope.itemNames.main.notification]+'}}' )
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
                        if (!angular.isDefined(attrs.dfxGcEdit) && !angular.isDefined(attrs.dfxGcDesign)) {
                                if(scope.attributes.menuItemsType.value === 'dynamic'){
                                    scope.iconbarArray = scope.$parent_scope[scope.itemNames.main.source];
                                }else{
                                    scope.iconbarArray = scope.attributes.menuItems.value;
                                }
                            }else{
                                scope.iconbarArray = scope.attributes.menuItems.value;
                            }
                        if ( scope.iconbarArray.length > 0 ) {
                            scope.iconBar = '';
                            if (!angular.isDefined(attrs.dfxGcEdit) && !angular.isDefined(attrs.dfxGcDesign)){
                                buildNextLevel(scope.iconbarArray, scope.attributes.menuItemsType.value);
                            } else {
                                buildNextLevel(scope.iconbarArray, 'static');
                            }
                            $timeout(function() {
                                $('.' + scope.component_class + '_button_menu').empty();
                                if (!angular.isDefined(attrs.dfxGcEdit) && !angular.isDefined(attrs.dfxGcDesign)) {
                                    $('.' + scope.component_class + '_button_menu').load('/gcontrols/web/button_menu.html', function(){
                                        $('.' + scope.component_class + '_button_menu md-menu-content').html(scope.iconBarMenu);
                                        $compile($('.' + scope.component_class + '_button_menu').contents())(scope);
                                        $timeout(function() {
                                            scope.menuPosition();
                                        }, 0);
                                    });
                                } else {
                                    if ( scope.component_class.indexOf('renderer') === -1 ) {
                                        $('.' + scope.component_class + '_button_menu').load('/gcontrols/web/button_menu_design.html', function(){
                                            $('.' + scope.component_class + '_button_menu md-menu-content.root-content').html(scope.iconBarMenu);
                                            $compile($('.' + scope.component_class + '_button_menu').contents())(scope);
                                            $timeout(function() {
                                                scope.menuPosition();
                                            }, 0);
                                        });
                                    } else {
                                        $timeout(function() {
                                            var tableButtons = $('.' + scope.component_class + '_button_menu');
                                            $(tableButtons).each(function(index, element) {
                                                tableButtons.eq(index).empty().load('/gcontrols/web/button_menu_design.html', function() {
                                                    tableButtons.eq(index).find('md-menu-content.root-menu-container').html(scope.iconBarMenu);
                                                    $compile(tableButtons.eq(index).contents())(scope);
                                                    if(index===0) scope.menuPosition(element);
                                                });
                                            });
                                        }, 0, false);
                                    }
                                }
                            }, 0);
                        }
                    }
                    scope.changeWidth = function(){
                        if(scope.attributes.notFlex.value) {
                            $('#' + scope.component_id).css({
                                'flex': '0',
                                'width': 'auto',
                                'max-width': '100%'
                            });
                            if (!angular.isDefined(attrs.dfxGcDesign) && !angular.isDefined(attrs.dfxGcEdit)){
                                scope.attributes.flex.value = 'none';
                            }
                        }else{
                            $('#' + scope.component_id).css({
                                'flex': scope.attributes.flex.value + '%',
                                'width': scope.attributes.flex.value + '%',
                                'max-width': scope.attributes.flex.value + '%'
                            });
                        }
                    };
                    scope.menuPosition = function(button){
                        var buttonWidth;
                        $timeout(function() {
                            if(button){
                                buttonWidth = $(element).find('button.gc-btn-group-first').eq(0).css('width');
                            }else{
                                buttonWidth = $('#' + scope.component_id + ' button.gc-btn-group-first').eq(0).css('width');
                            }
                            buttonWidth = parseInt(buttonWidth);
                            if(buttonWidth > 220) scope.positionModeSide = 'right';
                        }, 0);
                    }
                    if (!angular.isDefined(attrs.dfxGcEdit)) {
                        scope.changeWidth();
                    }
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
        replace: true,
        transclude : true,
        templateUrl: function( el, attrs) {
            return '/gcontrols/web/toolbar_preview.html';
        },
        link: function(scope, element, attrs) {
            // scope.mainToolbarInitCounter = 0;
            // scope.toolbarInitCounter = 0;
            // scope.$gcscope = scope;
            // scope.$watch('$parent.gc_instances', function(newVal){
            //     if(newVal){
            //         var parentPanel = (newVal[Object.keys(newVal)[0]].attributes) ;
            //         if(parentPanel.initialized){
            //             if(parentPanel.initialized.value=== true && scope.mainToolbarInitCounter ===0){
            //                 scope.mainToolbarInitCounter++;
            //                 scope.runToolbar();
            //             }
            //         }
            //     }
            // }, true);
            // scope.$watch('$parent.gcontrol.attributes', function(newVal){
            //     if(newVal){
            //         if(newVal.initialized){
            //             if(newVal.initialized.value === true && scope.toolbarInitCounter ===0){
            //                 scope.toolbarInitCounter++;
            //                 scope.runToolbar();
            //             }
            //         }
            //     }
            // }, true);

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
            scope.runToolbar();

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
            }, 0);

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
                if (!angular.isDefined(attrs.dfxGcEdit) && !angular.isDefined(attrs.dfxGcDesign) && stateObject.binding !== '') {
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
                                scope.iconBar = scope.iconBar + '<md-menu-item class="tree-menu-title"><div>{{'+nextLevel[i][scope.itemNames.main.label]+'}}</div></md-menu-item>';
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
                    tempPropObject.faIcon =                 dfxMenuItem[scope.itemNames.main.icon.value] ? '{{'+dfxMenuItem[scope.itemNames.main.icon.value][scope.itemNames.main.icon.name]+'}}' : '';
                    tempPropObject.svgIcon =                dfxMenuItem[scope.itemNames.main.icon.value] ? '{{'+dfxMenuItem[scope.itemNames.main.icon.value][scope.itemNames.main.icon.name]+'}}' : '';
                    tempPropObject.faItemIndex =            level >= 0 ? level + ',' + index : index;
                    tempPropObject.itemLabel =              '{{'+dfxMenuItem[scope.itemNames.main.label]+'}}';
                    tempPropObject.itemIndex =              level || level >= 0 ? level + ',' + index : index;
                    tempPropObject.itemDisabled =           dfxMenuItem[scope.itemNames.main.disabled] ? dfxMenuItem[scope.itemNames.main.disabled] : false;
                    tempPropObject.itemDisplay =            dfxMenuItem[scope.itemNames.main.display] ? dfxMenuItem[scope.itemNames.main.display] : true;
                    tempPropObject.itemClick =              dfxMenuItem[scope.itemNames.main.scopeItems] && dfxMenuItem[scope.itemNames.main.scopeItems].length > 0 ? '$mdOpenMenu();'+(dfxMenuItem[scope.itemNames.main.onclick] ? dfxMenuItem[scope.itemNames.main.onclick] : '') : 'unfocusButton($event);'+(dfxMenuItem[scope.itemNames.main.onclick] ? dfxMenuItem[scope.itemNames.main.onclick] : '');
                    if ( type === 'singleMenuItem' ) {
                        tempPropObject.itemShortcut =       dfxMenuItem[scope.itemNames.main.shortcut];
                        tempPropObject.ifItemNotification = dfxMenuItem[scope.itemNames.main.notification] !=='' ? true : false;
                        tempPropObject.itemNotification =   '{{'+dfxMenuItem[scope.itemNames.main.notification]+'}}';
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
                            tempPropObject.trueStateFaIcon =        dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.checkedIcon.value] ? '{{'+dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.checkedIcon.value][scope.itemNames.state.checkedIcon.name]+'}}' : '';
                            tempPropObject.falseStateFaIcon =       dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.uncheckedIcon.value] ? '{{'+dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.uncheckedIcon.value][scope.itemNames.state.uncheckedIcon.name]+'}}' : '';
                            tempPropObject.trueStateSvgIcon =       dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.checkedIcon.value] ? '{{'+dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.checkedIcon.value][scope.itemNames.state.checkedIcon.name]+'}}' : '';
                            tempPropObject.falseStateSvgIcon =      dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.uncheckedIcon.value] ? '{{'+dfxMenuItem[scope.itemNames.state.name][scope.itemNames.state.uncheckedIcon.value][scope.itemNames.state.uncheckedIcon.name]+'}}' : '';
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
                            scope.iconBar = '<md-menu-bar style="display:flex;padding:0;">';
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
                            scope.iconBar = '<md-menu-bar style="display:flex;padding:0;">';
                        } else {
                            scope.iconBar = '<md-menu-bar style="display:flex;">';
                        }
                    }

                    if ( side === 'left' ) {
                        if(scope.attributes.toolbar.leftMenu.menuItemsType.value === 'static') {
                            for ( var item = 0; item < scope.iconbarArray.length; item++ ) {
                                if ( scope.attributes.toolbar.leftMenu.type.value === 'Buttons' ) {
                                    scope.iconBar = scope.iconBar + '<md-menu class="toolbar-button" style="padding: 1px">';
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
                                    scope.iconBar = scope.iconBar + '<md-menu class="toolbar-button" style="padding: 1px">';
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
                                    scope.iconBar = scope.iconBar + '<md-menu class="toolbar-button" style="padding: 1px">';
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
                                    scope.iconBar = scope.iconBar + '<md-menu class="toolbar-button" style="padding: 1px">';
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
                                $('.' + scope.component_id + '_left_menu_bar[dfx-repeatable-panel='+attrs.dfxRepeatablePanel+']').html(scope.iconBarMenu);
                                $compile($('.' + scope.component_id + '_left_menu_bar[dfx-repeatable-panel='+attrs.dfxRepeatablePanel+']').contents())(scope);
                            } else {
                                $('.' + scope.component_id + '_left_menu_bar').html(scope.iconBarMenu);
                                $compile($('.' + scope.component_id + '_left_menu_bar').contents())(scope);
                            }
                        }else if(scope.attributes.toolbar.leftMenu.type.value === 'Buttons'){
                            if ( scope.attributes.hasOwnProperty('repeat_in') && scope.attributes.repeat_title.value ) {
                                $('.' + scope.component_id + '_left_buttons_menu[dfx-repeatable-panel='+attrs.dfxRepeatablePanel+']').html(scope.iconBarMenu);
                                $compile($('.' + scope.component_id + '_left_buttons_menu[dfx-repeatable-panel='+attrs.dfxRepeatablePanel+']').contents())(scope);
                            } else {
                                $('.' + scope.component_id + '_left_buttons_menu').html(scope.iconBarMenu);
                                $compile($('.' + scope.component_id + '_left_buttons_menu').contents())(scope);
                            }
                        }
                        scope.setButtonsWidth(scope.attributes.toolbar.leftMenu.equalButtonSize.value, 'left');
                    }else if(side==='right'){
                        if(scope.attributes.toolbar.rightMenu.type.value === 'Icon Bar'){
                            if ( scope.attributes.hasOwnProperty('repeat_in') && scope.attributes.repeat_title.value ) {
                                $('.' + scope.component_id + '_right_menu_bar[dfx-repeatable-panel='+attrs.dfxRepeatablePanel+']').html(scope.iconBarMenu);
                                $compile($('.' + scope.component_id + '_right_menu_bar[dfx-repeatable-panel='+attrs.dfxRepeatablePanel+']').contents())(scope);
                            } else {
                                $('.' + scope.component_id + '_right_menu_bar').html(scope.iconBarMenu);
                                $compile($('.' + scope.component_id + '_right_menu_bar').contents())(scope);
                            }
                        }else if(scope.attributes.toolbar.rightMenu.type.value === 'Buttons'){
                            if ( scope.attributes.hasOwnProperty('repeat_in') && scope.attributes.repeat_title.value ) {
                                $('.' + scope.component_id + '_right_buttons_menu[dfx-repeatable-panel='+attrs.dfxRepeatablePanel+']').html(scope.iconBarMenu);
                                $compile($('.' + scope.component_id + '_right_buttons_menu[dfx-repeatable-panel='+attrs.dfxRepeatablePanel+']').contents())(scope);
                            } else {
                                $('.' + scope.component_id + '_right_buttons_menu').html(scope.iconBarMenu);
                                $compile($('.' + scope.component_id + '_right_buttons_menu').contents())(scope);
                            }
                        }
                        scope.setButtonsWidth(scope.attributes.toolbar.rightMenu.equalButtonSize.value, 'right');
                    }
                }, 0);
            }
            $timeout(function() {
                if (scope.attributes.toolbar.leftMenu.menuItemsType.value === 'static') {
                    scope.$watch('attributes.toolbar.leftMenu.menuItems.value', function(newVal, oldVal) {
                        if ( newVal != null && scope.attributes.toolbar.leftMenu.type.value !== 'Fab' ) {
                            $timeout(function() {
                                scope.iconbarBuilder('left');
                            }, 0);
                        }
                    }, true);
                }
                if (scope.attributes.toolbar.leftMenu.menuItemsType.value === 'dynamic'){
                    scope.$watch('$parent_scope.'+scope.attributes.toolbar.leftMenu.menuItemNames.value.main.source, function(newVal, oldVal) {
                        if ( newVal != null && scope.attributes.toolbar.leftMenu.type.value !== 'Fab' ) {
                            $timeout(function() {
                                scope.iconbarBuilder('left');
                            }, 0);
                        }
                    }, true);
                }
                if(scope.attributes.toolbar.rightMenu.menuItemsType.value === 'static') {
                    scope.$watch('attributes.toolbar.rightMenu.menuItems.value', function(newVal, oldVal) {
                        if ( newVal != null && scope.attributes.toolbar.rightMenu.type.value !== 'Fab' ) {
                            $timeout(function() {
                                scope.iconbarBuilder('right');
                            }, 0);
                        }
                    }, true);
                }
                if (scope.attributes.toolbar.rightMenu.menuItemsType.value === 'dynamic') {
                    scope.$watch('$parent_scope.'+scope.attributes.toolbar.rightMenu.menuItemNames.value.main.source, function(newVal, oldVal) {
                        if ( newVal != null && scope.attributes.toolbar.rightMenu.type.value !== 'Fab' ) {
                            $timeout(function() {
                                scope.iconbarBuilder('right');
                            }, 0);
                        }
                    }, true);
                }
            }, 0);
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

dfxGCC.directive('dfxGccWebRating', function() {
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
                    scope.attributes.binding.status = "overridden";
                    scope.attributes.maxValue.status = "overridden";
                    scope.attributes.icon.status = "overridden";
                    if ( !scope.attributes.icon.hasOwnProperty('type') ) { scope.attributes.icon.type = 'fa-icon'; }
                    if ( !scope.attributes.icon.hasOwnProperty('size') ) { scope.attributes.icon.size = 21; }
                    if ( scope.attributes.range.hasOwnProperty('values') ) {delete scope.attributes.range.values; }

                    scope.$gcscope = scope;
                    basectrl.bindScopeVariable(scope, component.attributes.binding.value);

                    function updateStars() {
                        scope.stars = [];
                        for (var i = 0; i < scope.attributes.range.value; i++) {
                            var rangeStep = scope.attributes.maxValue.value/scope.attributes.range.value;
                            scope.stars.push({
                                filled: i*rangeStep < scope.$gcscope[scope.attributes.binding.value]
                            });
                        }
                    };
                    scope.toggle = function(index) {
                        var rangeStep = scope.attributes.maxValue.value/scope.attributes.range.value;
                        scope.attributes.disabled.value === "false" ? scope.$gcscope[scope.attributes.binding.value] = index*rangeStep + rangeStep : index*rangeStep;
                        updateStars();
                    };
                    scope.$watch('attributes.binding.value', function(newValue) {
                        if (newValue) {
                            updateStars();
                        }
                    });
                    scope.$watch('attributes.range.value', function(newValue) {
                        if (newValue) {
                            updateStars();
                        }
                    });
                    scope.$watch('attributes.maxValue.value', function(newValue) {
                        if (newValue) {
                            updateStars();
                        }
                    });
                    scope.$watch('attributes.disabled.value', function(newValue) {
                        if (newValue) {
                            updateStars();
                        }
                    });
                    scope.$watch("$gcscope[attributes.binding.value]", function(newValue){
                        updateStars();
                    });
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
                scope.attributes.binding.status = 'overridden';
                if ( !scope.attributes.options.value.hasOwnProperty('size') ){
                    scope.attributes.options.value = {
                        "animate": {"enabled":true,"duration":1000,"ease":"bounce"},
                        "barCap": 20,
                        "barColor": "#e65d5d",
                        "barWidth": 40,
                        "bgColor": "",
                        "fontSize": "auto",
                        "displayInput": true,
                        "dynamicOptions": true,
                        "displayPrevious": false,
                        "size": 300,
                        "min": 0,
                        "max": 100,
                        "step": 1,
                        "startAngle": 0,
                        "endAngle": 360,
                        "textColor": "#222222",
                        "prevBarColor": "rgba(0,0,0,0)",
                        "trackColor": "#ffe6e6",
                        "trackWidth": 50,
                        "readOnly": false,
                        "unit": "%",
                        "subText": {"enabled":true, "text":"Sub text", "color":"#808080", "font":"auto"},
                        "skin": {"type":"tron","width":10,"color":"rgba(255,0,0,.5)","spaceWidth":5},
                        "scale": {"enabled":true,"type":"lines","color":"#808080","width":3,"quantity":20,"height":10,"spaceWidth":15}
                    };
                }
                scope.attributes.options.status = 'overridden';
                $timeout(function() {
                    scope.isRepeatable = {"value":false};
                    if(typeof scope.attributes.options.value.readOnly === 'string'){
                        switch(scope.attributes.options.value.readOnly){
                            case 'true': scope.attributes.options.value.readOnly = true; break;
                            case 'false': scope.attributes.options.value.readOnly = false; break;
                        }
                    }
                    if(scope.attributes.binding.value.indexOf('$dfx_item') >= 0) {
                        scope.isRepeatable.value = true;
                        scope.repeated_id = Math.floor(Math.random() * 100000);
                        var repeatedKnobId = component.id+'_dfx_ng_knob_'+scope.repeated_id;
                        $timeout(function() {
                            var repeatedKnob = angular.element(document.getElementById(repeatedKnobId));
                            repeatedKnob.attr('value', scope.attributes.binding.value);
                            scope = repeatedKnob.scope();
                            $injector = repeatedKnob.injector();
                            $injector.invoke(function($compile){
                                $compile(repeatedKnob)(scope);
                            })
                        }, 0);
                    } else {
                        $('.'+component.id+'_dfx_ng_knob').empty().html('<ui-knob value="' + scope.attributes.binding.value + '" options="attributes.options.value"></ui-knob>');
                        $timeout(function() {$compile($('.'+component.id+'_dfx_ng_knob').contents())(scope);}, 0);
                    }
                }, 0);
            });
        }
    }
}]);

var DfxGcChartUtil = (function () {
    var api = {};

    var removeBracketsFromEventListener = function(eventListener) {
        return (eventListener) ? eventListener.replace(/\(.*?\)/g, "") : eventListener;
    };
    var refreshChartToReflectFlexSize = function(scope, isDesignTime, $timeout, oldFlexValue) {
          $timeout(function() {
              if (scope[scope.attributes.name.value].refresh) {
                  oldFlexValue = oldFlexValue || 100;

                  // remove old flex class and add new manually because it's not done automatically after chart dropping
                  if (oldFlexValue) { $('#' + scope.component_id).removeClass('flex' + '-' + oldFlexValue); }
                  $('#' + scope.component_id).attr('flex', scope.attributes.flex.value);
                  $('#' + scope.component_id).addClass('flex' + '-' + scope.attributes.flex.value);

                  // for the case when panel column layout direction = column
                  $('#' + scope.component_id).css('width', scope.attributes.flex.value + '%');

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

    api.setRunTimeAttributes = function (scope, chartTypeDef, chartEventNames, $timeout) {
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

        refreshChartToReflectFlexSize(scope, false, $timeout);
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

    api.watchRunTimeAttributes = function (scope, $timeout) {
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
                refreshChartToReflectFlexSize(scope, false, $timeout, oldValue);
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
                refreshChartToReflectFlexSize(scope, false, $timeout, oldValue);
            });
        }
        if (scope.attributes.options.showLegend) {
            scope.$gcscope.$watch(scope.attributes.options.showLegend, function (newValue, oldValue) {
                scope.attributes.options.value.chart.showLegend = newValue;
                refreshChartToReflectFlexSize(scope, false, $timeout, oldValue);
            });
        }
        if (scope.attributes.options.stacked) {
            scope.$gcscope.$watch(scope.attributes.options.stacked, function (newValue, oldValue) {
                scope.attributes.options.value.chart.stacked = newValue;
                refreshChartToReflectFlexSize(scope, false, $timeout, oldValue);
            });
        }
        if (scope.attributes.options.useInteractiveGuideline) {
            scope.$gcscope.$watch(scope.attributes.options.useInteractiveGuideline, function (newValue, oldValue) {
                scope.attributes.options.value.chart.useInteractiveGuideline = newValue;
                refreshChartToReflectFlexSize(scope, false, $timeout, oldValue);
            });
        }
        if (scope.attributes.options.rescaleY) {
            scope.$gcscope.$watch(scope.attributes.options.rescaleY, function (newValue, oldValue) {
                scope.attributes.options.value.chart.rescaleY = newValue;
                refreshChartToReflectFlexSize(scope, false, $timeout, oldValue);
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

                    DfxGcChartUtil.setRunTimeAttributes(scope, 'stacked', eventsList, $timeout);
                    DfxGcChartUtil.watchRunTimeAttributes(scope, $timeout);
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

                    DfxGcChartUtil.setRunTimeAttributes(scope, 'discretebar', eventsList, $timeout);
                    DfxGcChartUtil.watchRunTimeAttributes(scope, $timeout);
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

                    DfxGcChartUtil.setRunTimeAttributes(scope, 'multibar', eventsList, $timeout);
                    DfxGcChartUtil.watchRunTimeAttributes(scope, $timeout);
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

                    DfxGcChartUtil.setRunTimeAttributes(scope, 'pie', eventsList, $timeout);
                    DfxGcChartUtil.watchRunTimeAttributes(scope, $timeout);
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

                    DfxGcChartUtil.setRunTimeAttributes(scope, 'pie', eventsList, $timeout);
                    DfxGcChartUtil.watchRunTimeAttributes(scope, $timeout);
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

                    DfxGcChartUtil.setRunTimeAttributes(scope, 'lines', eventsList, $timeout);
                    DfxGcChartUtil.watchRunTimeAttributes(scope, $timeout);
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

                    DfxGcChartUtil.setRunTimeAttributes(scope, 'interactiveLayer', eventsList, $timeout);
                    DfxGcChartUtil.watchRunTimeAttributes(scope, $timeout);
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
                    if (!angular.isDefined(attrs.dfxGcDesign) && !angular.isDefined(attrs.dfxGcEdit)) {
                        if(scope.attributes.binding.value !== ""){
                            var bindingString = scope.attributes.binding.value;
                            eval("scope." + bindingString + "= newValue ;");
                        }
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
                    $('#' + scope.component_id).css('width', scope.attributes.flex.value + '%');
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
            scope.$gcscope = scope;
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
                basectrl.bindScopeVariable(scope, component.attributes.binding.value);

                scope.attributes.bindEmptyModel = function() {
                    return scope.attributes.defaultArray.value;
                };

                scope.changeWidth = function(){
                    $('#' + scope.component_id).css('width', scope.attributes.flex.value + '%');
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
                    $('#' + scope.component_id).css('width', scope.attributes.flex.value + '%');
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
                    $('#' + scope.component_id).css('width', scope.attributes.flex.value + '%');
                };
                scope.changeWidth();
            });
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
                scope.parseStaticItemValue = function(value){
                    if(value!==''){
                        if(value==='true'){value = true;}
                        else if(value==='false'){value=false;}
                        else if(!isNaN(value)){value=Number(value);}
                    }
                }
                for (var i = 0; i < scope.attributes.staticArray.value.length; i++) {
                    scope.parseStaticItemValue(scope.attributes.staticArray.value[i].checked);
                    scope.parseStaticItemValue(scope.attributes.staticArray.value[i].unchecked);
                };
                scope.dfxGetSource = function(sourceType){
                    if(sourceType==='dynamic'){
                        if(scope.attributes.source.value !== ''){
                            var sourceString = '', sourceArray = '';
                            if(scope.attributes.source.value.indexOf('$dfx_item') === -1) sourceString = 'scope.$parent_scope.';
                            sourceArray = sourceString + scope.attributes.source.value;
                        }
                        return eval(sourceArray);
                    }else if(sourceType==='static'){
                        return scope.attributes.staticArray.value;
                    }
                }
                scope.dfxGetBinding = function() {
                    if(scope.attributes.binding.value !== ''){
                        var bindingString = '', bindingObject = '';
                        if(scope.attributes.binding.value.indexOf('$dfx_item') === -1) bindingString = 'scope.$parent_scope.';
                        bindingObject = bindingString + scope.attributes.binding.value;
                    }
                    return eval(bindingObject);
                }
                scope.dfxGetChecked = function(item){
                    return new Function('_', 'return _.' + scope.attributes.checkValue.trueCheckValue)(item);
                }
                scope.dfxGetUnchecked = function(item){
                    return new Function('_', 'return _.' + scope.attributes.checkValue.falseCheckValue)(item);
                }
                scope.dfxGetItemLabel = function(item){
                    return new Function('_', 'return _.' + scope.attributes.checkValue.label)(item);
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
                scope.parseStaticItemValue = function(value){
                    if(value!==''){
                        if(value==='true'){value = true;}
                        else if(value==='false'){value=false;}
                        else if(!isNaN(value)){value=Number(value);}
                    }
                }
                for (var i = 0; i < scope.attributes.staticArray.value.length; i++) {
                    scope.parseStaticItemValue(scope.attributes.staticArray.value[i].checked);
                    scope.parseStaticItemValue(scope.attributes.staticArray.value[i].unchecked);
                };
                scope.dfxGetSource = function(sourceType){
                    if(sourceType==='dynamic'){
                        if(scope.attributes.source.value !== ''){
                            var sourceString = '', sourceArray = '';
                            if(scope.attributes.source.value.indexOf('$dfx_item') === -1) sourceString = 'scope.$parent_scope.';
                            sourceArray = sourceString + scope.attributes.source.value;
                        }
                        return eval(sourceArray);
                    }else if(sourceType==='static'){
                        return scope.attributes.staticArray.value;
                    }
                }
                scope.dfxGetBinding = function() {
                    if(scope.attributes.binding.value !== ''){
                        var bindingString = '', bindingObject = '';
                        if(scope.attributes.binding.value.indexOf('$dfx_item') === -1) bindingString = 'scope.$parent_scope.';
                        bindingObject = bindingString + scope.attributes.binding.value;
                    }
                    return eval(bindingObject);
                }
                scope.dfxGetChecked = function(item){
                    return new Function('_', 'return _.' + scope.attributes.switchValue.trueSwitchValue)(item);
                }
                scope.dfxGetUnchecked = function(item){
                    return new Function('_', 'return _.' + scope.attributes.switchValue.falseSwitchValue)(item);
                }
                scope.dfxGetItemLabel = function(item){
                    return new Function('_', 'return _.' + scope.attributes.switchValue.label)(item);
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
            basectrl.init(scope, element, component, attrs, 'radio').then(function(){
                for (var i = 0; i < scope.attributes.radioItems.value.length; i++) {
                    if(scope.attributes.radioItems.value[i].value!==''){
                        if(scope.attributes.radioItems.value[i].value==='true'){scope.attributes.radioItems.value[i].value = true;}
                        else if(scope.attributes.radioItems.value[i].value==='false'){scope.attributes.radioItems.value[i].value=false;}
                        else if(!isNaN(scope.attributes.radioItems.value[i].value)){scope.attributes.radioItems.value[i].value=Number(scope.attributes.radioItems.value[i].value);}
                    }
                };
                scope.dfxGetSource = function(sourceType){
                    if(sourceType==='dynamic'){
                        if(scope.attributes.source.value !== ''){
                            var sourceString = '', sourceArray = '';
                            if(scope.attributes.source.value.indexOf('$dfx_item') === -1) sourceString = 'scope.$parent_scope.';
                            sourceArray = sourceString + scope.attributes.source.value;
                        }
                        return eval(sourceArray);
                    }else if(sourceType==='static'){
                        return scope.attributes.radioItems.value;
                    }
                }
                scope.dfxGetValue = function(item){
                    return new Function('_', 'return _.' + scope.attributes.bindingProperty.value)(item);
                }
                scope.dfxGetLabel = function(item){
                    return new Function('_', 'return _.' + scope.attributes.propToDisplay.value)(item);
                }
            });
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
                scope.isSimpleBinding = {"value": false};
                if(scope.attributes.binding.value.indexOf('$dfx_item') === -1 && scope.attributes.binding.value.indexOf('.') === -1 && scope.attributes.binding.value.indexOf('[') === -1){
                    scope.isSimpleBinding.value = true;
                }
                for (var i = 0; i < scope.attributes.staticOptions.value.length; i++) {
                    switch ( scope.attributes.staticOptions.value[i].value ) {
                        case 'true': scope.attributes.staticOptions.value[i].value = true; break;
                        case 'false': scope.attributes.staticOptions.value[i].value = false; break;
                    }
                }
                if(scope.attributes.currentItem.value==='true'){
                    scope.attributes.currentItem.value = true;
                } else if (scope.attributes.currentItem.value==='false'){
                    scope.attributes.currentItem.value = false;
                }
                scope.dfxGetSource = function(sourceType){
                    if(sourceType==='dynamic'){
                        if(scope.attributes.options.source !== ''){
                            var sourceString = '', sourceArray = '';
                            if(scope.attributes.options.source.indexOf('$dfx_item') === -1) sourceString = 'scope.$parent_scope.';
                            sourceArray = sourceString + scope.attributes.options.source;
                        }
                        return eval(sourceArray);
                    }else if(sourceType==='static'){
                        return scope.attributes.staticOptions.value;
                    }
                }
                scope.dfxGetValue = function(option){
                    return new Function('_', 'return _.' + scope.attributes.options.value)(option);
                }
                scope.dfxGetLabel = function(option){
                    return new Function('_', 'return _.' + scope.attributes.options.display)(option);
                }
                scope.changeWidth = function(){
                    $('#' + scope.component_id).css('width', scope.attributes.flex.value + '%');
                };
                if (!angular.isDefined(attrs.dfxGcEdit)) {
                    scope.changeWidth();
                }
                scope.hideWebGcSelectMask = function() {
                    $('body > md-backdrop, body > div.md-scroll-mask, body > div.md-select-menu-container.md-active').fadeOut(250);
                }
                $('body > md-backdrop').on('click', function(){ scope.hideWebGcSelectMask(); });
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
                    $('#' + scope.component_id).css('width', scope.attributes.flex.value + '%');
                };
                if (!angular.isDefined(attrs.dfxGcEdit)) {
                    scope.changeWidth();
                }
                var dfxRichText = '<ng-quill-editor name="'+scope.attributes.name.value+'" ';
                if (!angular.isDefined(attrs.dfxGcDesign) && !angular.isDefined(attrs.dfxGcEdit)) {
                    dfxRichText += scope.attributes.binding.value !== '' ? 'ng-model="'+scope.attributes.binding.value+'" ' : 'ng-model="attributes.bindedData.value" ';
                } else {
                    dfxRichText += 'ng-model="attributes.bindedData.value" ';
                }
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
