/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/* GC Web Knob */

var gc_web_knob = {
    "label": "Knob",
    "category": "default",
    "default_classes": "dfx_visual_editor_draggable dfx_visual_editor_gc_draggable",
    "attributeDefinition": {
        "categories": [
            {"id": "main_props",
                "label": "Main Properties",
                "expanded": true,
                "properties": [
                    { "id": "name", "label": "Name:", "type": "value", "default": "knKnob", "propType": "input" },
                    { "id": "label", "label": "Label:", "type": "value", "default": "Label", "propType": "input-picker", "picker": "exptext" },
                    { "id": "labelVisible", "label": "Label Visible:", "type": "value", "default": "yes", "propType": "select", "selectOptions": "yesNo" },
                    { "id": "labelPosition", "label": "Label Position:", "type": "value", "default": "center", "propType": "select", "selectOptions": "horizontalPosition" },
                    { "id": "tooltip", "label": "Tooltip:", "type": "value", "default": "", "propType": "input-picker", "picker": "exptext" },
                    { "id": "tooltipPosition", "label": "Tooltip Position:", "type": "value", "default": "", "propType": "select", "selectOptions": "tooltipPosition" },
                    { "id": "min", "label": "Min:", "type": "value", "default": 0, "propType": "input" },
                    { "id": "max", "label": "Max:", "type": "value", "default": 150, "propType": "input" },
                    { "id": "step", "label": "Step:", "type": "value", "default": 1, "propType": "input" },
                    { "id": "symbol", "label": "Symbol:", "type": "value", "default": "", "propType": "input" },
                    { "id": "symbolPosition", "label": "Symbol Position:", "type": "value", "default": "left", "propType": "select", "selectOptions": "leftRightPosition" }
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
                    { "id": "css", "type": "css", "propType": "input-css", "cssOptions": [ "width", "height", "color", "background" ] },
                    { "id": "style", "label": "Custom CSS:", "type": "value", "default": "", "propType": "input" }
                ]
            },
            {"id": "event_props",
                "label": "Events",
                "expanded": false,
                "properties": [
                    { "id": "onclickLabel", "label": "On Label Click:", "type": "value", "default": "", "propType": "input-picker", "picker": "evt" },
                    { "id": "onchange", "label": "On Change:", "type": "value", "default": "", "propType": "input-picker", "picker": "evt" }
                ]
            }
        ]
    },
    "createDefinition": function( component_id, container_id ) {
        var default_attributes = gc_factory.getDefaultAttributes( gc_web_knob.attributeDefinition );
        return {
            id: component_id,
            type: "knob",
            attributes: default_attributes,
            children: [],
            container: container_id
        };
    },
    "renderDesign": function( component ) {
        var attributes;
        if (!component.attributes) {
            attributes = gc_factory.getDefaultAttributes( gc_web_knob.attributeDefinition );
        } else {
            attributes = gc_factory.migrateAttributes( gc_web_knob.attributeDefinition, component.attributes );
        }

        var containerCss = '';
        $.each(attributes.containerCss, function(key, value) {
            if (value!='') {
                containerCss += key + ':' + value + ';';
            }
        });

        // default component width and height
        if (! attributes.css.width) attributes.css.width = 100;
        if (! attributes.css.height) attributes.css.height = 100;

        var width = this._private.parseSize(attributes.css.width);
        var height = this._private.parseSize(attributes.css.height);

        var dynamicProps = {
            "min": Number(attributes.min.value),
            "max": Number(attributes.max.value),
            "width": Number(width),
            "height": Number(height),
            "bgColor": attributes.css.background || "#eeeeee",
            "fgColor": attributes.css.color || "#87ceeb"
        };

        var fragment_html;
        fragment_html = '<div id="' + component.id + '"  gc-role="control" gc-type="knob" ' +
            'style="display:inline-block;position:relative;' + attributes.containerStyle.value + ';' + containerCss + '" ' +
            'class="' + gc_web_knob.default_classes + (attributes.containerClasses.value != '' ? ' '+attributes.containerClasses.value : '') + '">';

        var label_text = dfx_gc_common_helpers.showAsExpression(attributes.label.value);
        var labelCursor = attributes.onclickLabel.value != '' ? 'cursor:pointer;' : 'cursor:default;';
        var labelPosition = attributes.labelPosition && attributes.labelPosition.value ? 'text-align:'+attributes.labelPosition.value: '';
        var labelVisible = attributes.labelVisible.value != 'no' ? 'display:block;' : 'display:none;';
        fragment_html += '<label id="' + component.id + '_label" style="' + labelCursor + labelVisible + labelPosition + '">' + label_text + '</label>';

        fragment_html += '<input id="' + component.id + '_knob" data-readOnly="true" style="' + (attributes.style ? attributes.style.value : '') + '"' +
            '" class="' + (attributes.classes.value != "" ? ' ' + attributes.classes.value : '') +
            '" type="text" class="knob" value="75">';
        fragment_html += '</div>';

        var component_instance = {
            "id": component.id,
            "fragment": fragment_html,
            "callback": function(comp_inst) {
                $('#' + comp_inst.id + '_knob').knob(dynamicProps);
            }
        };
        return component_instance;
    },
    "loadPropertyPanel": function(gc_component_definition) {
        // default component width and height
        if (! gc_component_definition.attributes.css.width) gc_component_definition.attributes.css.width = "100";
        if (! gc_component_definition.attributes.css.height) gc_component_definition.attributes.css.height = "100";

        $( '#gc_knob_attr_id').val( gc_component_definition.id );
        gc_factory.generatePropertyPanel( gc_web_knob.attributeDefinition, gc_component_definition );

        $('.dfx_visual_editor_property_input').change( function(e) {
            DfxVisualBuilder.propertyPanelChanged();
        });
    },
    "savePropertyPanel": function() {
        var id = $( '#gc_knob_attr_id').val();
        var el = $('#'+id);

        var attributes = gc_factory.getPropertiesFromPanel( gc_web_knob.attributeDefinition );

        // remove brackets from function name, but only for onchange, because it's used by Knob plugin
        if (attributes.onchange.value) {
            attributes.onchange.value = attributes.onchange.value.replace(/\(.*?\)/g, "");
        }
        // on the opposite, ADD brackets to onclickLabel, because it's used in ng-click and it needs brackets
        if (attributes.onclickLabel.value && attributes.onclickLabel.value.indexOf('(') == -1) {
            attributes.onclickLabel.value = attributes.onclickLabel.value + '()';
        }

        var containerCss = '';
        $.each(attributes.containerCss, function(key, value) {
            if (value!='') {
                containerCss += key + ':' + value + ';';
            }
        });

        el.attr( {
            'class': gc_web_knob.default_classes + ' ' + attributes.containerClasses.value,
            'style': 'display:inline-block;position:relative;' + attributes.containerStyle.value + ';' + containerCss
        });

        var label_text = dfx_gc_common_helpers.showAsExpression(attributes.label.value);
        var labelCursor = attributes.onclickLabel.value != '' ? 'cursor:pointer;' : 'cursor:default;';
        var labelPosition = attributes.labelPosition && attributes.labelPosition.value ? 'text-align:'+attributes.labelPosition.value: '';
        var labelVisible = attributes.labelVisible.value != 'no' ? 'display:block;' : 'display:none;';
        $('#'+id+'_label').attr( {
            'style': labelCursor + labelVisible + labelPosition
        });
        $('#'+id+'_label').text(label_text);

        $('#'+id+'_knob').attr( {
            'class': attributes.classes.value,
            'style': attributes.style.value
        });

        attributes.css.width = this._private.parseSize(attributes.css.width);
        attributes.css.height = this._private.parseSize(attributes.css.height);

        var dynamicProps = {
            "min": Number(attributes.min.value),
            "max": Number(attributes.max.value),
            "width": Number(attributes.css.width),
            "height": Number(attributes.css.height),
            "bgColor": attributes.css.background || "#eeeeee",
            "fgColor": attributes.css.color || "#87ceeb",
            "draw": function() {
                if (attributes.symbolPosition.value && attributes.symbol.value) {
                    var res = '';
                    if (attributes.symbolPosition.value == 'left'){
                        res = attributes.symbol.value + $(this.i).val();
                    } else if(attributes.symbolPosition.value == 'right') {
                        res = $(this.i).val() + attributes.symbol.value;
                    }

                    $(this.i).val(res);
                }
            }
        };
        $('#'+id+'_knob').trigger('configure', dynamicProps);

        var editor = ace.edit( 'dfx_src_editor' );
        var wgt_definition = JSON.parse( editor.getValue() );

        DfxVisualBuilder.findComponentAndUpdateAttributes( id, wgt_definition.definition, attributes, false );

        editor.setValue( JSON.stringify( wgt_definition, null, '\t' ), 0 );
        editor.gotoLine(1);

        DfxVisualBuilder.initPropertyPanelChange();
        DfxVisualBuilder.updateSelectedBox(el);
    },
    "_private": {
        "parseSize": function(value) {
            var result = value;
            if (result) {
                result = Number(result);
                if (! result) {
                    var pxPos = value.indexOf('px');
                    if (pxPos > -1) {
                        result = value.substring(0, pxPos);
                    }
                }
            }
            return result;
        }
    }
}
