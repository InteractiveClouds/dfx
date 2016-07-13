/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/* GC Web Input Field */

var gc_web_textarea = {
    "label": "Textarea",
    "category": "default",
    "default_classes": "dfx_visual_editor_draggable dfx_visual_editor_gc_draggable",
    "attributeDefinition": {
        "categories": [
            {"id": "main_props",
                "label": "Main Properties",
                "expanded": true,
                "properties": [
                    { "id": "name", "label": "Name:", "type": "value", "default": "fieldTextArea", "propType": "input" },
                    { "id": "label", "label": "Label:", "type": "value", "default": "Label", "propType": "input-picker", "picker": "exptext" },
                    { "id": "labelVisible", "label": "Label Visible:", "type": "value", "default": "yes", "propType": "select", "selectOptions": "yesNo" },
                    { "id": "tooltip", "label": "Tooltip:", "type": "value", "default": "", "propType": "input-picker", "picker": "exptext" },
                    { "id": "tooltipPosition", "label": "Tooltip Position:", "type": "value", "default": "", "propType": "select", "selectOptions": "tooltipPosition" }
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
                    { "id": "disabled", "label": "Disabled Rule:", "type": "value", "default": "false", "propType": "input-picker", "picker": "exp" },
                    { "id": "required", "label": "Required", "type": "value", "default": "no", "propType": "select", "selectOptions": "yesNo" },
                    { "id": "errorRequired", "label": "Error Required:", "type": "value", "default": "", "propType": "input" }
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
                    { "id": "css", "type": "css", "propType": "input-css", "cssOptions": [ "width", "height", "color", "background", "padding", "margin", "text-align" ] },
                    { "id": "style", "label": "Custom CSS:", "type": "value", "default": "", "propType": "input" }
                ]
            },
            {"id": "event_props",
                "label": "Events",
                "expanded": false,
                "properties": [
                    { "id": "onchange", "label": "On Change:", "type": "value", "default": "", "propType": "input-picker", "picker": "evt" }
                ]
            }
        ]
    },
    "createDefinition": function( component_id, container_id ) {
        var default_attributes = gc_factory.getDefaultAttributes( gc_web_textarea.attributeDefinition );

        return {
            id: component_id,
            type: "textarea",
            attributes: default_attributes,
            children: [],
            container: container_id
        };
    },
    "renderDesign": function( component ) {

        var attributes;
        if (!component.attributes) {
            attributes = gc_factory.getDefaultAttributes( gc_web_textarea.attributeDefinition );
        } else {
            attributes = gc_factory.migrateAttributes( gc_web_textarea.attributeDefinition, component.attributes );
        }

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

        var label_text = (attributes.label.value.indexOf('{{')>-1 && attributes.label.value.indexOf('}}')>-1) ? '{{expression}}' : attributes.label.value;

        var fragment_html;
        fragment_html = '<div id="' + component.id + '"  gc-role="control" gc-type="textarea" ' +
            'style="display:inline-block;position:relative;' + attributes.containerStyle.value  + ';' + containerCss + '" ' +
            'class="' + gc_web_textarea.default_classes + (attributes.containerClasses.value != '' ? ' '+attributes.containerClasses.value : '') + '">';

        fragment_html += '<div id="' + component.id + '_form_group" ' +
            'class="form-group" style="width:100%">' +
            '<label id="' + component.id + '_label" for="' + component.id + '_field" style="display:'+(attributes.labelVisible.value=='yes' ? 'inline-block' :'none')+'">' + label_text +'</label>';

        fragment_html += '<textarea id="' + component.id + '_field" ' +
            'class="form-control ' + ((attributes.classes.value != '') ? attributes.classes.value : '') + '" ' +
            'style="' + (attributes.style ? attributes.style.value : '') + ';' + css + '" ' +
            'value="' + ((attributes.property.value!='') ? '{{'+attributes.property.value+'}}' : '' ) + '" />';

        var component_instance = {
            "id": component.id,
            "fragment": fragment_html
        };
        return component_instance;
    },
    "loadPropertyPanel": function(gc_component_definition) {
        $( '#gc_textarea_attr_id').val( gc_component_definition.id );
        gc_factory.generatePropertyPanel( gc_web_textarea.attributeDefinition, gc_component_definition );

        $('.dfx_visual_editor_property_input').change( function(e) {
            DfxVisualBuilder.propertyPanelChanged();
        });
    },
    "savePropertyPanel": function() {
        var id = $( '#gc_textarea_attr_id').val()
        var el =  $( '#'+id);

        var attributes = gc_factory.getPropertiesFromPanel( gc_web_textarea.attributeDefinition );

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

        $('#'+id).attr( {
            'class': gc_web_textarea.default_classes + ' ' + attributes.containerClasses,
            'style': 'display:inline-block;position:relative;' + attributes.containerStyle + ';' + containerCss
        });

        $('#'+id+'_field').attr( {
            'class': 'form-control '+attributes.classes.value,
            'style': attributes.style.value + ';' + css
        });

        var label_text = (attributes.label.value.indexOf('{{')>-1 && attributes.label.value.indexOf('}}')>-1) ? '{{expression}}' : attributes.label.value;
        $('#'+id+'_label').text(label_text);

        if (attributes.labelVisible.value=='yes') {
            $('#'+id+'_label').css( 'display', 'inline-block' );
        } else {
            $('#'+id+'_label').css( 'display', 'none' );
        }

        if (attributes.property.value=='') {
            $('#' + id + '_field').val('');
        } else {
            $('#' + id + '_field').val('{{'+attributes.property.value+'}}');
        }

        var editor = ace.edit( 'dfx_src_editor' );
        var wgt_definition = JSON.parse( editor.getValue() );

        DfxVisualBuilder.findComponentAndUpdateAttributes( id, wgt_definition.definition, attributes, false );

        editor.setValue( JSON.stringify( wgt_definition, null, '\t' ), 0 );
        editor.gotoLine(1);

        DfxVisualBuilder.initPropertyPanelChange();
        DfxVisualBuilder.updateSelectedBox(el);
    }
}