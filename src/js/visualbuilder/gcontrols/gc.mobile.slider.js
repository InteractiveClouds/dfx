/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/* GC Mobile Slider */

var gc_mobile_slider = {
    "label": "Slider",
    "category": "default",
    "default_classes": "dfx_visual_editor_draggable dfx_visual_editor_gc_draggable",
    "attributeDefinition": {
        "categories": [
            {"id": "main_props",
                "label": "Main Properties",
                "expanded": true,
                "properties": [
                    { "id": "name", "label": "Name:", "type": "value", "default": "slSlider", "propType": "input" },
                    { "id": "label", "label": "Label:", "type": "value", "default": "Label", "propType": "input-picker", "picker": "exptext" },
                    { "id": "labelVisible", "label": "Label Visible:", "type": "value", "default": "yes", "propType": "select", "selectOptions": "yesNo" },
                    { "id": "labelPosition", "label": "Label Position:", "type": "value", "default": "center", "propType": "select", "selectOptions": "horizontalPosition" },
                    { "id": "tooltip", "label": "Tooltip:", "type": "value", "default": "", "propType": "input-picker", "picker": "exptext" },
                    { "id": "tooltipPosition", "label": "Tooltip Position:", "type": "value", "default": "", "propType": "select", "selectOptions": "tooltipPosition" },
                    { "id": "min", "label": "Min:", "type": "value", "default": 0, "propType": "input" },
                    { "id": "max", "label": "Max:", "type": "value", "default": 100, "propType": "input" },
                    { "id": "step", "label": "Step:", "type": "value", "default": 1, "propType": "input" },
                    { "id": "startMin", "label": "Start Min:", "type": "value", "default": 50, "propType": "input-picker", "picker": "exptext" },
                    { "id": "startMax", "label": "Start Max:", "type": "value", "default": "", "propType": "input-picker", "picker": "exptext" },
                    { "id": "connect", "label": "Connect Edges:", "type": "value", "default": "lower", "propType": "select", "selectOptions": "connectEdges" },
                    { "id": "direction", "label": "Direction:", "type": "value", "default": "ltr", "propType": "select", "selectOptions": "direction" },
                    { "id": "orientation", "label": "Orientation:", "type": "value", "default": "horizontal", "propType": "select", "selectOptions": "orientation" },
                    { "id": "behaviour", "label": "Behaviour:", "type": "value", "default": "tap", "propType": "select", "selectOptions": "behaviour" }
                ]
            },
            {"id": "data_props",
                "label": "Data & Binding options",
                "expanded": false,
                "properties": [
                    { "id": "property", "label": "Variable:", "type": "value", "default": "", "propType": "input-picker", "picker": "bind" },
                    { "id": "propertyInit", "label": "Initialize:", "type": "value", "default": "", "propType": "input-picker", "picker": "exp" }
                ]
            },
            {"id": "rules_props",
                "label": "Presentation Rules",
                "expanded": false,
                "properties": [
                    { "id": "display", "label": "Display Rule:", "type": "value", "default": "true", "propType": "input-picker", "picker": "exp" },
                    { "id": "disabled", "label": "Disabled Rule:", "type": "value", "default": "false", "propType": "input-picker", "picker": "exp" }
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
                    { "id": "css", "type": "css", "propType": "input-css", "cssOptions": [ "width", "height", "color", "background", "handleColor" ] },
                    { "id": "style", "label": "Custom CSS:", "type": "value", "default": "", "propType": "input" }
                ]
            },
            {"id": "event_props",
                "label": "Events",
                "expanded": false,
                "properties": [
                    { "id": "onslide", "label": "On Slide:", "type": "value", "default": "", "propType": "input-picker", "picker": "evt" },
                    { "id": "onset", "label": "On Set:", "type": "value", "default": "", "propType": "input-picker", "picker": "evt" }
                ]
            }
        ]
    },
    "createDefinition": function( component_id, container_id ) {
        var default_attributes = gc_factory.getDefaultAttributes( gc_mobile_slider.attributeDefinition );
        return {
            id: component_id,
            type: "slider",
            attributes: default_attributes,
            children: [],
            container: container_id
        };
    },
    "renderDesign": function( component ) {
        var attributes;
        if (!component.attributes) {
            attributes = gc_factory.getDefaultAttributes( gc_mobile_slider.attributeDefinition );
        } else {
            attributes = gc_factory.migrateAttributes( gc_mobile_slider.attributeDefinition, component.attributes );
        }

        var containerCss = '';
        $.each(attributes.containerCss, function(key, value) {
            if (value!='') {
                containerCss += key + ':' + value + ';';
            }
        });

        // default component width and height
        if (! attributes.css.width) attributes.css.width = '100%';
        if (! attributes.css.height) attributes.css.height = '200px';

        var width = attributes.css.width;
        var height = attributes.css.height;

        var dynamicProps = {range: {min: Number(attributes.min.value), max: Number(attributes.max.value)}, start: 50},
            style = attributes.style.value,
            fgcolor = attributes.css.color || '#3276b1',
            bgcolor = attributes.css.background || '#FAFAFA',
            handleColor = attributes.css.handleColor || '#FFF',
            label_text = dfx_gc_common_helpers.showAsExpression(attributes.label.value),
            divStyle = '',
            orientationStyle = '';

        if (attributes.startMin.value !== '' || attributes.startMax.value !== '') {
            dynamicProps.start = [];
            if (attributes.startMin.value !== '' && attributes.startMax.value !== ''){
                dynamicProps.start[0] = attributes.startMin.value;
                dynamicProps.start[1] = attributes.startMax.value;
            } else {
                if (attributes.startMin.value !== '') {
                    dynamicProps.start[0] = attributes.startMin.value;
                } else if(attributes.startMax.value !== '') {
                    dynamicProps.start[0] = attributes.startMax.value;
                }
            }
        }
        if (dynamicProps.start.length) {
            if (attributes.connect.value) {
                if (dynamicProps.start.length == 1) {
                    if (!(attributes.connect.value == 'lower' || attributes.connect.value == 'upper')) {
                        dynamicProps.connect = 'lower';
                    } else {
                        dynamicProps.connect = attributes.connect.value;
                    }
                } else if (dynamicProps.start.length == 2) {
                    if (attributes.connect.value == 'true' || attributes.connect.value == 'false') {
                        dynamicProps.connect = !!((attributes.connect.value == 'true'));
                    } else {
                        dynamicProps.connect = false;
                    }
                }
            }
        }

        dynamicProps.orientation = attributes.orientation.value;
        dynamicProps.direction = attributes.direction.value;
        if (attributes.orientation.value == 'horizontal') {
            style += ';width:'+width+';margin:0 auto';
            divStyle = 'min-height:50px;height:auto;width:'+(width)+'px;';
        } else {
            style += ';height:'+height+';margin:20px auto';
            divStyle = 'min-height:50px;height:auto;width:50px;';
            orientationStyle = 'display:inline-block;';
        }

        var fragment_html = '<div id="' + component.id + '"  gc-role="control" gc-type="slider" ' +
            'style="position:relative;' + orientationStyle + attributes.containerStyle.value + ';' + containerCss + '" ' +
            'class="' + gc_mobile_slider.default_classes + (attributes.containerClasses.value != '' ? ' '+attributes.containerClasses.value : '') + '">';

        var labelPosition = attributes.labelPosition && attributes.labelPosition.value ? 'text-align:'+attributes.labelPosition.value: '';
        var labelVisible = attributes.labelVisible.value != 'no' ? 'display:block;' : 'display:none;';
        fragment_html += '<div id="' + component.id + '_slider" style="'+divStyle+'">' +
            '<label id="' + component.id + '_label" for="' + component.id + '_field" style="'+labelVisible+labelPosition+'">' + label_text + '</label>' +
            '<div id="' + component.id + '_field" disabled="disabled" style="' + style + '"></div>' +
            '</div>';

        var component_instance = {
            "id": component.id,
            "fragment": fragment_html,
            "callback": function(comp_inst) {
                $('#' + comp_inst.id + '_field').noUiSlider(dynamicProps);
                $('.noUis-background', '#' + comp_inst.id + '_slider').css({'backgroundColor': bgcolor});
                $('.noUis-connect', '#' + comp_inst.id + '_slider').css({'backgroundColor': fgcolor});
                $('.noUis-handle', '#' + comp_inst.id + '_slider').css({'backgroundColor': handleColor});
            }
        };
        return component_instance;
    },
    "loadPropertyPanel": function(gc_component_definition) {
        // default component width and height
        if (! gc_component_definition.attributes.css.width) gc_component_definition.attributes.css.width = "100%";
        if (! gc_component_definition.attributes.css.height) gc_component_definition.attributes.css.height = "200px";

        $( '#gc_slider_attr_id').val( gc_component_definition.id );
        gc_factory.generatePropertyPanel( gc_mobile_slider.attributeDefinition, gc_component_definition );

        $('.dfx_visual_editor_property_input').change( function(e) {
            DfxVisualBuilder.propertyPanelChanged();
        });
    },
    "savePropertyPanel": function() {
        var id = $( '#gc_slider_attr_id').val();
        var el = $('#'+id);

        var attributes = gc_factory.getPropertiesFromPanel( gc_mobile_slider.attributeDefinition );

        var containerCss = '';
        $.each(attributes.containerCss, function(key, value) {
            if (value!='') {
                containerCss += key + ':' + value + ';';
            }
        });

        var onslide = attributes.onslide.value;
        if (onslide) {
            onslide = onslide.replace(/\(.*?\)/g, "");
        }
        var onset = attributes.onset.value;
        if (onset) {
            onset = onset.replace(/\(.*?\)/g, "");
        }

        var label_text = dfx_gc_common_helpers.showAsExpression(attributes.label.value);
        var labelPosition = attributes.labelPosition && attributes.labelPosition.value ? 'text-align:'+attributes.labelPosition.value: '';
        var labelVisible = attributes.labelVisible.value != 'no' ? 'display:block;' : 'display:none;';
        $('#'+id+'_label').attr( {
            'style': labelVisible + labelPosition
        });
        $('#'+id+'_label').text(label_text);

        var dynamicProps = {range: {min: Number(attributes.min.value), max: Number(attributes.max.value)}},
            divStyle = '', addStyle = '', orientationStyle = '',
            step = Number(attributes.step.value),
            width = attributes.css.width,
            height = attributes.css.height,
            bgcolor = attributes.css.background || "#FAFAFA",
            fgcolor = attributes.css.color || "#3276b1",
            handleColor = attributes.css.handleColor || "#FFF",
            startMin = attributes.startMin.value,
            startMax = attributes.startMax.value,
            connect = attributes.connect.value,
            orientation = attributes.orientation.value,
            direction = attributes.direction.value,
            style = attributes.style.value,
            classes = attributes.classes.value;

        if (startMin || startMax) {
            dynamicProps.start = [];
            if(startMin && startMax){
                dynamicProps.start[0] = Number(startMin);
                dynamicProps.start[1] = Number(startMax);
            } else {
                if(startMin){
                    dynamicProps.start[0] = Number(startMin);
                } else if(startMax) {
                    dynamicProps.start[0] = Number(startMax);
                }
            }
        }
        if (dynamicProps.start.length) {
            if (connect) {
                if (dynamicProps.start.length == 1) {
                    if (!(connect == 'lower' || connect == 'upper')) {
                        connect = 'lower';
                    }
                    dynamicProps.connect = connect;

                } else if (dynamicProps.start.length == 2) {
                    if(connect == 'true' || connect == 'false'){
                        dynamicProps.connect = !!((connect == 'true'));
                    } else {
                        dynamicProps.connect = false;
                        connect = '';
                    }
                }
            }
        }
        dynamicProps.orientation = orientation;
        dynamicProps.direction = direction;
        if (orientation == 'horizontal') {
            if (style.indexOf('height') > -1) {
                style = style.replace(/height:\s*([^;]+)/, "");
            }
            height = '';
            if (!width) {
                width = '100%';
            }
            addStyle = ';width:'+width+';margin:0 auto';
            divStyle = 'min-height:50px;height:auto;width:'+(width)+'px;';
        } else {
            if (style.indexOf('width') > -1) {
                style = style.replace(/width:\s*([^;]+)/, "");
            }
            width = '';
            if (!height) {
                height = '200px';
            }
            addStyle = ';height:'+height+';margin:20px auto';
            divStyle = 'min-height:50px;height:auto;width:50px;';
            orientationStyle = 'display:inline-block;';
        }

        el.attr( {
            'class': gc_mobile_slider.default_classes + ' ' + attributes.containerClasses.value,
            'style': 'position:relative;' + attributes.containerStyle.value + ';' + containerCss + orientationStyle
        });

        $( '#'+id + '_slider').attr('style',divStyle);
        $( '#'+id+'_field')
            .attr({'style':style+';'+addStyle,'class':classes})
            .noUiSlider(dynamicProps, true);
        $( '.noUis-background', '#' + id + '_slider').css({'backgroundColor': bgcolor});
        $( '.noUis-connect', '#' + id + '_slider').css({'backgroundColor': fgcolor});
        $( '.noUis-handle', '#' + id + '_slider').css({'backgroundColor': handleColor});
        if (startMin) {
            startMin = Number(startMin);
        }
        if (startMax) {
            startMax = Number(startMax);
        }

        attributes.startMin.value = startMin;
        attributes.startMax.value = startMax;

        var editor = ace.edit( 'dfx_src_editor' );
        var wgt_definition = JSON.parse( editor.getValue() );

        DfxVisualBuilder.findComponentAndUpdateAttributes( id, wgt_definition.definition, attributes, false );

        editor.setValue( JSON.stringify( wgt_definition, null, '\t' ), 0 );
        editor.gotoLine(1);

        DfxVisualBuilder.initPropertyPanelChange();
        DfxVisualBuilder.updateSelectedBox(el);
    }
}