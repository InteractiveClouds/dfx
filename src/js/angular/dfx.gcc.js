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
                    //scope.$parent_scope = scope.$parent.$parent.$parent.$parent;
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
            console.log('attr: ', attr);
            console.log('attr.ngSrc: ', attr.ngSrc);
            console.log("el.attr('ng-src'): ", el.attr('ng-src'));
/*
            //TODO: get tenantId, appName, check normal URL, check why expression is moved to External URL...

            // watch the Image ng-src changes to transform resource URL
            var ngSrcInitial = el.attr('ng-src'),
                chunks = ngSrcInitial.match(/\{\{([^{}]*)\}\}/);

            if (chunks) {
                scope.$watch(
                    chunks[1],
                    function( newValue, oldValue ) {
                        console.log('oldValue: ', oldValue);
                        console.log('newValue: ', newValue);
                        var ngSrcVal = newValue,
                            tenantId = 'Examples',
                            applicationName = '';

                        //if (ngSrcVal && ngSrcVal.indexOf('./') == 0)
                        var resourceSrc = '/resources/' + tenantId + '/' + applicationName + ngSrcVal;
                        el.attr('ng-src', resourceSrc);
                        el.attr('src', resourceSrc);
                    }
                );
            }

            // transform resource URL from Image ng-src
            angular.element(document).ready(function() {
                $timeout(function () {
                    var ngSrcVal = el.attr('ng-src'),
                        tenantId = 'Examples',
                        applicationName = '';


                    //if (ngSrcVal && ngSrcVal.indexOf('./') == 0)
                    var resourceSrc = '/resources/' + tenantId + '/' + applicationName + ngSrcVal;
                    el.attr('ng-src', resourceSrc);
                    el.attr('src', resourceSrc);


                }, 0);
            });*/
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

console.log('1.attributes.static.value: ', scope.attributes.static.value);
                scope.test = function(test_param) {
                    console.log('2.test_param: ', test_param);
                };

                scope.ifShowIconTypes = function( icon, status ) {
                    var regexp = /(^\')(.*)(\'$)/gm, filtered = regexp.exec( icon );
                    if ( icon && ( icon.indexOf('+') >= 0 ) ) { filtered = false; }
                    if ( icon === '' ) { filtered = true; }
                    if ( icon.indexOf("'") === 0 && icon.indexOf('+') === -1 && icon.charAt(icon.length-1) === "'" ) {
                        if ( icon.indexOf("'fa-") === 0 ) {
                            switch ( status ) {
                                case 'isOpened': scope.attributes.isOpened.type = 'fa-icon'; break;
                                case 'isClosed': scope.attributes.isClosed.type = 'fa-icon'; break;
                            }
                        } else {
                            switch ( status ) {
                                case 'isOpened': scope.attributes.isOpened.type = 'svg-icon'; break;
                                case 'isClosed': scope.attributes.isClosed.type = 'svg-icon'; break;
                            }
                        }
                    }
                    if ( status === 'isOpened' ) {
                        scope.showOpenedIconTypes = filtered ? false : true;
                    } else {
                        scope.showClosedIconTypes = filtered ? false : true;
                    }

                }
                scope.ifShowIconTypes(scope.attributes.isOpened.value, 'isOpened');
                scope.ifShowIconTypes(scope.attributes.isClosed.value, 'isClosed');
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
                scope.gcJsonSample = {};
                scope.gcSamplesArray = {};
                scope.scriptSampleName = '';
                scope.scriptSampleNameValid = {"value": false};
                scope.focusSamples = function(){$timeout(function(){$("#samples-btn").focus();},100);}
                scope.runJsonEditor = function(model){
                    scope.dfxSampleJsonEditor = null;
                    var container = document.getElementById('dfx-ve-sample-json'),
                        options = { mode: 'code', modes: ['tree','form','code','text','view'], history: true };
                    $timeout(function(){scope.dfxSampleJsonEditor = new JSONEditor(container, options, model);}, 0);
                }
                scope.checkNames = function( propName ){
                    switch (propName) {
                        case 'name': scope.attributes.label.value = "name"; break;
                        case 'children': scope.attributes.repeatable_property.value = "children"; break;
                    }
                }
                scope.checkItemNames = function( item ) {
                    if(item.hasOwnProperty('name')){scope.checkNames('name');}
                    if(item.hasOwnProperty('children')){scope.checkNames('children');}
                }
                scope.fillPropertiesNames = function(sampleJson){for(var i = 0; i<sampleJson.length; i++){scope.checkItemNames(sampleJson[i]);};}
                scope.showSamples = function(){
                    scope.samplesLoaded = $http.get('/gcontrols/web/gcs_json_samples.json').then(function(res){
                        scope.gcSamplesArray = res.data['treeview'];
                        scope.gcJsonSample = scope.gcSamplesArray[0];
                    });
                    $q.all([scope.samplesLoaded]).then(function(){
                        $('body').append('<div class="dfx-ve-dialog"></div>');
                        $('.dfx-ve-dialog').load('/gcontrols/web/gcs_json_samples.html', function(){
                            $compile($('.dfx-ve-dialog').contents())(scope);
                            $('.sp-container').remove();
                            $('.dfx-ve-content-dialog').addClass('active');
                            $('#dfx-ve-gc-samples-dialog').keyup(function(e) {
                                if(e.which === 13) {
                                    var activeTagName = document.activeElement.tagName;
                                    if(activeTagName!=='TEXTAREA' && activeTagName!=='BUTTON') $('#dfx-copy-sample-btn').click();
                                }
                                if(e.which === 27) scope.closeSamples();
                                e.preventDefault();
                                e.stopPropagation();
                            });
                            $timeout(function(){
                                scope.runJsonEditor(scope.gcSamplesArray[0].value);
                                $(".dfx-ve-content-categories li").eq(0).find('span').addClass('active');
                                scope.scriptSampleName!=='' ? $("#dfx-copy-sample-btn").focus() : $("#dfx-json-sample-name").focus();
                            }, 250);
                        });
                    });
                }
                scope.selectSample = function(ev, sample) {
                    scope.gcJsonSample = sample;
                    scope.dfxSampleJsonEditor ? scope.dfxSampleJsonEditor.set(sample.value) : scope.runJsonEditor(sample.value);
                    $(".dfx-ve-content-categories span").removeClass('active');
                    $(ev.target).addClass('active');
                    scope.scriptSampleName!=='' ? $("#dfx-copy-sample-btn").focus() : $("#dfx-json-sample-name").focus();
                }
                scope.addSampleToScript = function(){
                    scope.fillPropertiesNames(scope.gcJsonSample.value);
                    var sampleGet = scope.dfxSampleJsonEditor.get(),
                        sampleStringified = JSON.stringify(sampleGet, null, '\t'),
                        sampleStringified = sampleStringified.split("\n").join("\n\t"),
                        scriptEditor = $('#dfx_script_editor.CodeMirror')[0].CodeMirror;
                    $q.all([ scope.fillPropertiesNames, scope.checkItemNames, scope.checkNames ]).then(function(){
                        scope.attributes.dynamic.value = scope.scriptSampleName;
                        scope.attributes.label.status = "overridden";
                        scope.attributes.repeatable_property.status = "overridden";
                        scope.closeDialog();
                        scope.closeSamples();
                        $timeout(function(){
                            scope.changeViewMode('script');
                            scriptEditor.focus();
                            scriptEditor.setCursor({line: 4, ch: 0});
                            var sampleToAdd = "\t$scope." + scope.scriptSampleName + " = " + sampleStringified + ";\n";
                            scriptEditor.replaceSelection(sampleToAdd);
                            scope.changeViewMode('design');
                            $mdToast.show(
                                $mdToast.simple()
                                .textContent('JSON Sample "'+scope.gcJsonSample.name+'" has been added to the Script.')
                                .theme('success-toast')
                                .position('top right')
                                .hideDelay(3000)
                            );
                            scope.closeDialog();
                        }, 250);
                    });
                }
                scope.closeSamples = function() {
                    $('.dfx-ve-content-dialog').removeClass('active');
                    angular.element($('.dfx-ve-dialog')).remove();
                    $('.sp-container').remove();
                    if($('#dfx-ve-menu-editor-dialog').length > 0) $('#dfx-ve-menu-editor-dialog').focus();
                }
                if (!angular.isDefined(attrs.dfxGcDesign) && !angular.isDefined(attrs.dfxGcEdit)) {
                    if(scope.attributes.treeItemsType.value==='static'){
                        scope.selectedArrayClone = JSON.parse(JSON.stringify(scope.attributes.static.value));
                        scope.rebuildSelectedArray('static');
                    }else{
                        scope.selectedArrayClone = JSON.parse(JSON.stringify(scope.$parent_scope[scope.attributes.dynamic.value]));
                        scope.rebuildSelectedArray('dynamic');
                    }
                }
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
