/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/* GC Web Data Grid */

var gc_web_html = {
    "label": "HTML",
    "category": "default",
    "default_classes": "dfx_visual_editor_draggable dfx_visual_editor_gc_draggable",
    "attributeDefinition": {
        "categories": [
            {"id": "main_props",
                "label": "Main Properties",
                "expanded": true,
                "properties": [
                    { "id": "name", "label": "Name:", "type": "value", "default": "fieldTextArea", "propType": "input" },
                    { "id": "html", "label": "HTML Content:", "type": "value", "default": "<p>Lorem <em>ipsum</em> dolor sit amet</p>", "propType": "input-html" }
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
                    { "id": "css", "type": "css", "propType": "input-css", "cssOptions": [ "width", "height", "color", "background", "padding", "margin", "text-align" ] },
                    { "id": "style", "label": "Custom CSS:", "type": "value", "default": "", "propType": "input" }
                ]
            },
            {"id": "event_props",
                "label": "Events",
                "expanded": false,
                "properties": [
                    { "id": "onclick", "label": "On Click:", "type": "value", "default": "", "propType": "input-picker", "picker": "evt" }
                ]
            }
        ]
    },
    "createDefinition": function( component_id, container_id ) {
        var default_attributes = gc_factory.getDefaultAttributes( gc_web_html.attributeDefinition );
        return {
            id: component_id,
            type: "html",
            attributes: default_attributes,
            children: [],
            container: container_id
        };
    },
    "renderDesign": function( component ) {
        var attributes;
        if (!component.attributes) {
            attributes = gc_factory.getDefaultAttributes( gc_web_html.attributeDefinition );
        } else {
            attributes = gc_factory.migrateAttributes( gc_web_html.attributeDefinition, component.attributes );
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

        var fragment_html;
        fragment_html = '<div id="' + component.id + '"  gc-role="control" gc-type="html" ' +
            'style="display:inline-block;position:relative;' + attributes.containerStyle.value  + ';' + containerCss + '" ' +
            'class="' + gc_web_html.default_classes + (attributes.containerClasses.value != '' ? ' '+attributes.containerClasses.value : '') + '">';

        fragment_html += '<div id="' + component.id + '_html" ' +
            'style="' + (attributes.style ? attributes.style.value : '') + ';' + css + '" ' +
            'class="' + (attributes.classes.value != '' ? ' '+attributes.classes.value : '') + '" >';

        if (attributes.property.value=='') {
            if (attributes.html.value=='') {
                fragment_html += '<p>Lorem <em>ipsum</em> dolor sit amet</p>';
            } else {
                fragment_html += attributes.html.value;
            }
        } else {
            fragment_html += '{{'+attributes.property.value+'}}';
        }

        fragment_html += '</div>';

        var component_instance = {
            "id": component.id,
            "fragment": fragment_html
        };
        return component_instance;

    },
    "loadPropertyPanel": function(gc_component_definition) {
        $( '#gc_html_attr_id').val( gc_component_definition.id );
        gc_factory.generatePropertyPanel( gc_web_html.attributeDefinition, gc_component_definition );

        $('.dfx_visual_editor_property_input').change( function(e) {
            DfxVisualBuilder.propertyPanelChanged();
        });

        CustomModal.init('html',gc_component_definition.attributes.html.value);
    },
    "savePropertyPanel": function() {
        var id = $( '#gc_html_attr_id').val()
        var el =  $( '#'+id);

        var attributes = gc_factory.getPropertiesFromPanel( gc_web_html.attributeDefinition );

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
            'class': gc_web_html.default_classes + ' ' + attributes.containerClasses,
            'style': 'display:inline-block;position:relative;' + attributes.containerStyle + ';' + containerCss
        });

        $('#'+id+'_html').attr( {
            'class': attributes.classes,
            'style': attributes.style + ';' + css
        });

        if (attributes.property.value=='') {
            if (attributes.html.value=='') {
                $('#' + id + '_html').html('<p>Lorem <em>ipsum</em> dolor sit amet</p>');
            } else {
                $('#' + id + '_html').html(attributes.html.value);
            }
        } else {
            $('#' + id + '_html').html('{{'+attributes.property.value+'}}');
        }

        var editor = ace.edit( 'dfx_src_editor' );
        var wgt_definition = JSON.parse( editor.getValue() );

        DfxVisualBuilder.findComponentAndUpdateAttributes( id, wgt_definition.definition, attributes, false );

        editor.setValue( JSON.stringify( wgt_definition, null, '\t' ), 0 );
        editor.gotoLine(1);

        DfxVisualBuilder.initPropertyPanelChange();
        DfxVisualBuilder.updateSelectedBox(el);
    }
};
