/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/* GC Web Button */

var gc_web_button = {
    "label": "Button",
    "category": "default",
    "styles_palette": "gc_web_button",
    "default_classes": "dfx_visual_editor_draggable dfx_visual_editor_gc_draggable",
    "attributeDefinition": {
        "categories": [
            {"id": "main_props",
                "label": "Main Properties",
                "expanded": true,
                "properties": [
                    { "id": "name", "label": "Name:", "type": "value", "default": "btnButton", "propType": "input" },
                    { "id": "label", "label": "Label:", "type": "value", "default": "OK", "propType": "input-picker", "picker": "exptext" },
                    { "id": "icon", "label": "Icon:", "type": "value", "default": "", "propType": "input-icon" },
                    { "id": "iconPosition", "label": "Icon Position:", "type": "value", "default": "", "propType": "select", "selectOptions": "iconPosition" },
                    { "id": "tooltip", "label": "Tooltip:", "type": "value", "default": "", "propType": "input-picker", "picker": "exptext" },
                    { "id": "tooltipPosition", "label": "Tooltip Position:", "type": "value", "default": "", "propType": "select", "selectOptions": "tooltipPosition" }
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
                    { "id": "classes", "label": "Classes:", "type": "value", "default": "btn-primary", "propType": "input-picker", "picker": "class" },
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
        var default_attributes = gc_factory.getDefaultAttributes( gc_web_button.attributeDefinition );
        return {
            id: component_id,
            type: "button",
            attributes: default_attributes,
            children: [],
            container: container_id
        };
    },
    "renderDesign": function( component ) {
        var attributes;
        if (!component.attributes) {
            attributes = gc_factory.getDefaultAttributes( gc_web_button.attributeDefinition );
        } else {
            attributes = gc_factory.migrateAttributes( gc_web_button.attributeDefinition, component.attributes );
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
        fragment_html = '<div id="' + component.id + '"  gc-role="control" gc-type="button" ' +
            'style="display:inline-block;position:relative;' + attributes.containerStyle.value + ';' + containerCss + '" ' +
            'class="' + gc_web_button.default_classes + ' ' + (attributes.containerClasses.value != '' ? ' '+attributes.containerClasses.value : '') + '">';


        var add_label = (attributes.icon.value)
            ? ( attributes.iconPosition && attributes.iconPosition.value =='left' )
                ? '<span class="glyphicon glyphicon-'+attributes.icon.value+'"></span><span style="padding-left:5px">'+attributes.label.value+'</span>'
                    : '<span style="padding-right:5px">'+attributes.label.value+'</span><span class="glyphicon glyphicon-'+attributes.icon.value+'"></span>'
                : attributes.label.value;

        fragment_html += '<a id="' + component.id + '_button" type="button" class="btn ' +
            attributes.classes.value + '"' +
            ' style="' + ((attributes.style) ? attributes.style.value : '') + ';' + css + '">' +
            add_label +
            '</a>';


        var component_instance = {
            "id": component.id,
            "fragment": fragment_html
        };
        return component_instance;
    },
    "loadPropertyPanel": function(gc_component_definition) {
        $( '#gc_button_attr_id').val( gc_component_definition.id );
        gc_factory.generatePropertyPanel( gc_web_button.attributeDefinition, gc_component_definition );

        /*var gc_extensions = gc_component_definition.attributes['gc_extensions'];
        if (gc_extensions!=null) {
            for (gc_extended_attribute in gc_extensions) {
                $('[gc-extended-attribute='+gc_extended_attribute+']').val( gc_extensions[gc_extended_attribute] );
            }
        }*/
        PickerImageModal.icons.fillModal('iconsModal');
    },
    "savePropertyPanel": function() {
        var attributes = gc_factory.getPropertiesFromPanel( gc_web_button.attributeDefinition );

        var id = $( '#gc_button_attr_id').val()

        var el = $( '#'+id+'_button' );
        if(attributes.icon.value != ''){
            el.text('');
            if(attributes.iconPosition.value == 'left'){
                el.append('<span class="glyphicon glyphicon-'+attributes.icon.value+'"></span><span style="padding-left:5px">'+attributes.label.value+'</span>');
            } else {
                el.append('<span style="padding-right:5px">'+attributes.label.value+'</span><span class="glyphicon glyphicon-'+attributes.icon.value+'"></span>');
            }
        } else {
            el.text( attributes.label.value );
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

        $('#'+id).attr( {
            'class': gc_web_button.default_classes + ' ' + attributes.containerClasses.value,
            'style': 'display:inline-block;position:relative;' + attributes.containerStyle.value + ';' + containerCss
        });

        $('#'+id+'_button').attr( {
            'class': 'btn '+attributes.classes.value,
            'style': attributes.style.value + ';' + css
        });



        /*var gc_extensions = {};
        $('[gc-extended-attribute]').each( function(i) {
            var gc_ext_attr = $(this).attr('gc-extended-attribute');
            gc_extensions[gc_ext_attr] = $(this).val();
        });
        attributes.gc_extensions = gc_extensions;*/

        var editor = ace.edit( 'dfx_src_editor' );
        var wgt_definition = JSON.parse( editor.getValue() );

        DfxVisualBuilder.findComponentAndUpdateAttributes( id, wgt_definition.definition, attributes, false );

        editor.setValue( JSON.stringify( wgt_definition, null, '\t' ), 0 );
        editor.gotoLine(1);

        // re-select the component
        DfxVisualBuilder.initPropertyPanelChange();
        DfxVisualBuilder.updateSelectedBox(el);
    }
};
