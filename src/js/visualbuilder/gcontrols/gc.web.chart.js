/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/* GC Web Chart */
var gc_web_chart = {
    "label": "Chart",
    "category": "default",
    "default_classes": "dfx_visual_editor_draggable dfx_visual_editor_gc_draggable",
    "attributeDefinition": {
        "categories": [
            {"id": "main_props",
                "label": "Main Properties",
                "expanded": true,
                "properties": [
                    { "id": "name", "label": "Name:", "type": "value", "default": "chChart", "propType": "input" },
                    { "id": "label", "label": "Label:", "type": "value", "default": "Label", "propType": "input-picker", "picker": "exptext" },
                    { "id": "labelVisible", "label": "Label Visible:", "type": "value", "default": "yes", "propType": "select", "selectOptions": "yesNo" },
                    { "id": "tooltips", "label": "Tooltips:", "type": "value", "default": "yes", "propType": "select", "selectOptions": "yesNo" },
                    { "id": "type", "label": "Type:", "type": "value", "default": "line", "propType": "select", "selectOptions": "chartTypes" },
                    { "id": "labelsDataPoints", "label": "Labels for Data Points:", "type": "value", "default": "no", "propType": "select", "selectOptions": "yesNo" },
                    { "id": "innerRadius", "label": "Inner Radius (Pie chart):", "type": "value", "default": "", "propType": "input" },
                    { "id": "legendVisible", "label": "Legend Visible:", "type": "value", "default": "no", "propType": "select", "selectOptions": "yesNo" },
                    { "id": "legendPosition", "label": "Legend Position:", "type": "value", "default": "left", "propType": "select", "selectOptions": "leftRightPosition" }
                ]
            },
            {"id": "data_props",
                "label": "Data & Binding options",
                "expanded": false,
                "properties": [
                    { "id": "property", "label": "Variable:", "type": "value", "default": "", "propType": "input-picker", "picker": "bind" }
                ]
            },
            {"id": "rules_props",
                "label": "Presentation Rules",
                "expanded": false,
                "properties": [
                    { "id": "display", "label": "Display Rule:", "type": "value", "default": "true", "propType": "input-picker", "picker": "exp" }
                ]
            },
            {"id": "container_props",
                "label": "Container CSS",
                "expanded": false,
                "properties": [
                    { "id": "containerClasses", "label": "Classes:", "type": "value", "default": "", "propType": "input-picker", "picker": "class" },
                    { "id": "containerDynamicClasses", "label": "Dynamic Classes:", "type": "value", "default": "", "propType": "input-picker", "picker": "exp" },
                    { "id": "containerCss", "type": "css", "propType": "input-css", "cssOptions": [ "width", "height", "color", "background", "padding", "margin", "text-align" ] },
                    { "id": "containerStyle", "label": "Custom CSS:", "type": "value", "default": "", "propType": "input" }
                ]
            },
            {"id": "component_props",
                "label": "Component CSS",
                "expanded": false,
                "properties": [
                    { "id": "classes", "label": "Classes:", "type": "value", "default": "", "propType": "input-picker", "picker": "class" },
                    { "id": "dynamicClasses", "label": "Dynamic Classes:", "type": "value", "default": "", "propType": "input-picker", "picker": "exp" },
                    { "id": "css", "type": "css", "propType": "input-css", "default": {"width": "400px", "height": "200px"}, "cssOptions": [ "width", "height" ] },
                    { "id": "style", "label": "Custom CSS:", "type": "value", "default": "", "propType": "input" }
                ]
            },
            {"id": "event_props",
                "label": "Events",
                "expanded": false,
                "properties": [
                    { "id": "onclick", "label": "On Click:", "type": "value", "default": "", "propType": "input-picker", "picker": "evt" },
                    { "id": "onmouseover", "label": "On Mouseover:", "type": "value", "default": "", "propType": "input-picker", "picker": "evt" },
                    { "id": "onmouseout", "label": "On Mouseout:", "type": "value", "default": "", "propType": "input-picker", "picker": "evt" }
                ]
            }
        ]
    },
    "createDefinition": function( component_id, container_id ) {
        var default_attributes = gc_factory.getDefaultAttributes( gc_web_chart.attributeDefinition );
        return {
            id: component_id,
            type: "chart",
            attributes: default_attributes,
            children: [],
            container: container_id
        };
    },
    "renderDesign": function( component, already_dropped ) {
        var attributes;
        if (!component.attributes) {
            attributes = gc_factory.getDefaultAttributes( gc_web_chart.attributeDefinition );
        } else {
            attributes = gc_factory.migrateAttributes( gc_web_chart.attributeDefinition, component.attributes );
        }

        var containerCss = '';
        $.each(attributes.containerCss, function(key, value) {
            if (value!='') {
                containerCss += key + ':' + value + ';';
            }
        });

        // default component width and height
        if (! attributes.css.width) attributes.css.width = "400px";
        if (! attributes.css.height) attributes.css.height = "200px";

        var css = '';
        $.each(attributes.css, function(key, value) {
            if (value!='') {
                css += key + ':' + value + ';';
            }
        });

        var instance_id = component.id;
        var module_name = 'dfx_chart_module_' + instance_id;
        var controller_name = 'dfx_chart_controller_' + instance_id;

        var chart_type = (attributes.type.value ? attributes.type.value : 'line');
        var label_text = dfx_gc_common_helpers.showAsExpression(attributes.label.value);
        var labels_data_points = (attributes.labelsDataPoints.value == "yes" ? true : false);
        var tooltips = (attributes.tooltips.value == "yes" ? true : false);
        var inner_radius = (attributes.innerRadius.value ? attributes.innerRadius.value : '');
        var legend_visible = (attributes.legendVisible.value == "yes" ? true : false);
        var legend_position = attributes.legendPosition.value;

        var fragment_html = '<div id="' + instance_id + '"  gc-role="control" gc-type="chart" '
            //+ 'style="display:inline-block;position:relative;' + attributes.containerStyle.value + ';' + containerCss + '" '
            + 'style="position:relative;' + attributes.containerStyle.value + ';' + containerCss + '" '
            + 'class="' + gc_web_chart.default_classes + (attributes.containerClasses.value != '' ? ' '+attributes.containerClasses.value : '') + '" '
            + 'ng-controller="' + controller_name + '">';

        fragment_html += '<div id="' + instance_id + '_chart" class="' + ((attributes.classes.value) ? attributes.classes.value : '') + '"'
            + ' style="' + css + attributes.style.value + ';"'
            + ' value="' + ((attributes.property.value!='') ? '{'+attributes.property.value+'}' : '' ) + '"'
            + ' data-ac-data="product" data-ac-config="config" '
            + ' data-ac-chart="chartType">'
            + '</div>'
            + '</div>';

        var component_instance = {
            "id": instance_id,
            "fragment": fragment_html,
            "callback": function(comp_inst) {
                angular.element(document).ready(function() {
                    var my_chart_module = angular.module(module_name, ["angularCharts"]);// dynamic way
                    my_chart_module.controller(controller_name, ['$scope', function($scope) {
                        $scope.chartType = chart_type;
                        $scope.config = {
                            'title': (attributes.labelVisible.value == "yes" ? label_text : ''),
                            'tooltips': tooltips,
                            'labels': labels_data_points,
                            'innerRadius': inner_radius,
                            'legend': {
                                'display': legend_visible,
                                'position': legend_position
                            }
                        };
                        $scope.product = {
                            'series': ["Sales", "Income", "Expense"],
                            'data': [{
                                'x': "Laptops",
                                'y': [100, 500, 210],
                                'tooltip': "this is tooltip"
                            }, {
                                'x': "Desktops",
                                'y': [300, 100, 100]
                            }, {
                                'x': "Mobiles",
                                'y': [351, 150, 78]
                            }, {
                                'x': "Tablets",
                                'y': [54, 580, 879]
                            }]
                        };
                    }]);
                    // do not bootstrap chart app if component is not yet dropped,
                    // it can not be caught with angular.element(document).ready because html is ready, just component was not dropped
                    if (already_dropped === true) {
                        angular.bootstrap(document.getElementById(instance_id), [module_name]);// dynamic way
                    }
                });
            }
        };
        return component_instance;
    },
    "loadPropertyPanel": function(gc_component_definition) {
        // default component width and height
        if (! gc_component_definition.attributes.css.width) gc_component_definition.attributes.css.width = "400px";
        if (! gc_component_definition.attributes.css.height) gc_component_definition.attributes.css.height = "200px";

        $( '#gc_chart_attr_id').val( gc_component_definition.id );
        gc_factory.generatePropertyPanel( gc_web_chart.attributeDefinition, gc_component_definition );

        $('.dfx_visual_editor_property_input').change( function(e) {
            DfxVisualBuilder.propertyPanelChanged();
        });
    },
    "savePropertyPanel": function() {
        var id = $('#gc_chart_attr_id').val();
        var el = $('#'+id);

        var attributes = gc_factory.getPropertiesFromPanel( gc_web_chart.attributeDefinition );

        var containerCss = '';
        $.each(attributes.containerCss, function(key, value) {
            if (value!='') {
                containerCss += key + ':' + value + ';';
            }
        });

        var css = '';
        $.each(attributes.css, function(key, value) {
            if (value!='') {
                css += key + ':' + value + ';';
            }
        });

        el.attr( {
            'class': gc_web_chart.default_classes + ' ' + attributes.containerClasses.value,
            //'style': 'display:inline-block;position:relative;' + attributes.containerStyle.value + ';' + containerCss
            'style': 'position:relative;' + attributes.containerStyle.value + ';' + containerCss
        });

        $('#'+id+'_chart').attr( {
            'class': attributes.classes.value,
            'style': attributes.style.value + ';' + css
        });

        var editor = ace.edit( 'dfx_src_editor' );
        var wgt_definition = JSON.parse( editor.getValue() );

        DfxVisualBuilder.findComponentAndUpdateAttributes( id, wgt_definition.definition, attributes, false );

        editor.setValue( JSON.stringify( wgt_definition, null, '\t' ), 0 );
        editor.gotoLine(1);

        // refresh chart scope properties after clicking 'apply new attributes'
        dfxChartsPrivateApi.refreshChartModels(id, attributes);

        DfxVisualBuilder.initPropertyPanelChange();
        DfxVisualBuilder.updateSelectedBox(el);
    }
};

var dfxChartsPrivateApi = (function() {
    var refreshChartModels = function(instance_id, attributes) {
        var scope = angular.element($( '#' + instance_id )).scope();
        if (scope) {
            scope.$apply(function () {
                var label_text = dfx_gc_common_helpers.showAsExpression(attributes.label.value);

                scope.chartType = attributes.type.value;
                scope.config.title = (attributes.labelVisible.value == "yes") ? label_text : '';
                scope.config.labels = (attributes.labelsDataPoints.value == "yes" ? true : false);
                scope.config.tooltips = (attributes.tooltips.value == "yes" ? true : false);
                scope.config.innerRadius = attributes.innerRadius.value;
                scope.config.legend.display = (attributes.legendVisible.value == "yes" ? true : false);
                scope.config.legend.position = attributes.legendPosition.value;

                // trigger 'resize' event on the angular window element,
                // not on usual or jQuery window - and use angular triggerHandler()
                var angular_window = angular.element($(window));
                angular_window.triggerHandler('resize');
            });
        }
    };

    return {
        refreshChartModels : refreshChartModels
    };
})();