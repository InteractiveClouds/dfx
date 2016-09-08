var dfxGCC = angular.module('dfxGCC',['ngMaterial', 'ngMdIcons', 'ngMessages', 'ngSanitize', 'ngAnimate', 'nvd3', 'ngQuill', 'jkAngularCarousel', 'ui.knob']);

dfxGCC.directive('dfxGccWebBase', ['$rootScope', '$http', '$compile', '$injector', '$mdToast', '$q', function($rootScope, $http, $compile, $injector, $mdToast, $q) {
    return {
        controller: function($element) {
            var base = this;

            var storeGcTemplate = function (gc_type, gc_template) {
                sessionStorage.setItem('dfx_' + gc_type, JSON.stringify(gc_template));
            };

            var mergeArrayTypeAttribute = function (default_array_attribute, updated_array_attribute) {
                for (var i = 0; i < updated_array_attribute.length; i++) {
                    if (i > 0) {// default_attributes array contains only one, first array element, so, clone it first
                        default_array_attribute.push(angular.copy(default_array_attribute[0]));
                    }
                    mergeWithOverriddenAttributes(default_array_attribute[i], updated_array_attribute[i]);
                }
            };
            var mergeWithOverriddenAttributes = function (default_attributes, updated_attributes) {
                for (var updated_attribute in updated_attributes) {
                    if (updated_attributes.hasOwnProperty(updated_attribute)) {
                        if (updated_attribute != 'value' && updated_attribute != 'status' &&
                            (default_attributes[updated_attribute] || default_attributes[updated_attribute] === ''))
                        {

                            if ( Array.isArray(updated_attributes[updated_attribute]) ) {
                                //mergeArrayTypeAttribute(default_attributes[updated_attribute], updated_attributes[updated_attribute]);
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
