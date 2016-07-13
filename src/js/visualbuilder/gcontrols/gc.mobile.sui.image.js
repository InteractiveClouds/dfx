/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/* GC Mobile Image */

var gc_mobile_image = {
    "label": "Image",
    "category": "default",
    "default_classes": "dfx_visual_editor_draggable dfx_visual_editor_gc_draggable gc_w_design_image",
    "attributeDefinition": {
        "categories": [
            {"id": "main_props",
                "label": "Main Properties",
                "expanded": true,
                "properties": [
                    { "id": "name", "label": "Name:", "type": "value", "default": "imgImage", "propType": "input" },
                    { "id": "src", "label": "External URL:", "type": "value", "default": "/images/dfx_gc_image.png", "propType": "input-picker", "picker": "exptext" },
                    { "id": "src_res", "label": "Local URL:", "type": "value", "default": "", "propType": "input-picker", "picker": "exptext", "resourcePicker": true },
                    { "id": "size", "label": "Size:", "type": "value", "default": "", "propType": "select", "selectOptions": "mobileSizes" },
                    { "id": "avatar", "label": "Mode Avatar:", "type": "value", "default": "no", "propType": "select", "selectOptions": "yesNo" },
                    { "id": "bordered", "label": "Bordered:", "type": "value", "default": "no", "propType": "select", "selectOptions": "yesNo" },
                    { "id": "rounded", "label": "Rounded:", "type": "value", "default": "no", "propType": "select", "selectOptions": "yesNo" },
                    { "id": "circular", "label": "Circular:", "type": "value", "default": "no", "propType": "select", "selectOptions": "yesNo" }

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
                    { "id": "containerCss", "type": "css", "propType": "input-css", "default": {"text-align": "center"}, "cssOptions": [ "width", "height", "color", "background", "padding", "margin", "text-align" ] },
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
        var default_attributes = gc_factory.getDefaultAttributes( gc_mobile_image.attributeDefinition );

        //default_attributes.css.width = '100%';

        return {
            id: component_id,
            type: "image",
            attributes: default_attributes,
            children: [],
            container: container_id
        };
    },
    "renderDesign": function( component ) {
        var attributes;
        if (!component.attributes) {
            attributes = gc_factory.getDefaultAttributes( gc_mobile_image.attributeDefinition );
        } else {
            attributes = gc_factory.migrateAttributes( gc_mobile_image.attributeDefinition, component.attributes );
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

        var semantic_classes = 'ui image';

        if (attributes.avatar.value == 'yes') {
            semantic_classes += ' avatar';
        }
        if (attributes.bordered.value == 'yes') {
            semantic_classes += ' bordered';
        }
        if (attributes.rounded.value == 'yes') {
            semantic_classes += ' rounded';
        }
        if (attributes.circular.value == 'yes') {
            semantic_classes += ' circular';
        }
        if (attributes.size.value != '') {
            semantic_classes += ' ' + attributes.size.value;
        }

        fragment_html = '<div id="' + component.id + '"  gc-role="control" gc-type="image" ' +
        'style="position:relative;' + attributes.containerStyle.value  + ';' + containerCss + '" ' +
        'class="' + gc_mobile_image.default_classes + (attributes.containerClasses.value != '' ? ' '+attributes.containerClasses.value : '') + '">';

        fragment_html += '<img id="' + component.id + '_image" ' +
        'src="' + gc_mobile_image.getSrcPath(attributes) + '" ' +
        'style="' + (attributes.style ? attributes.style.value : '') + ';' + css + '" ' +
        'class="' + semantic_classes + ' ' + (attributes.classes.value != "" ? ' '+attributes.classes.value : '') + '" />';

        fragment_html += '</div>';

        var component_instance = {
            "id": component.id,
            "fragment": fragment_html
        };
        return component_instance;
    },
    "loadPropertyPanel": function(gc_component_definition) {
        $( '#gc_image_attr_id').val( gc_component_definition.id );
        gc_factory.generatePropertyPanel( gc_mobile_image.attributeDefinition, gc_component_definition );

        PickerImageModal.imgs.fillModal('imgsModal');
    },
    "savePropertyPanel": function() {
        var id = $( '#gc_image_attr_id').val(),
        el =  $( '#'+id);

        var attributes = gc_factory.getPropertiesFromPanel( gc_mobile_image.attributeDefinition );

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

        var semantic_classes = 'ui image';

        if (attributes.avatar.value == 'yes') {
            semantic_classes += ' avatar';
        }
        if (attributes.bordered.value == 'yes') {
            semantic_classes += ' bordered';
        }
        if (attributes.rounded.value == 'yes') {
            semantic_classes += ' rounded';
        }
        if (attributes.circular.value == 'yes') {
            semantic_classes += ' circular';
        }
        if (attributes.size.value != '') {
            semantic_classes += ' ' + attributes.size.value;
        }

        $('#'+id).attr( {
            'class': gc_web_link.default_classes + ' ' + attributes.containerClasses,
            'style': 'position:relative;' + attributes.containerStyle + ';' + containerCss
        });

        $('#'+id+'_image').attr( {
            'class': semantic_classes + ' ' + attributes.classes,
            'style': attributes.style + ';' + css
        });


        $('#'+id+'_image').attr( 'src', gc_mobile_image.getSrcPath(attributes) );

        var editor = ace.edit( 'dfx_src_editor' );
        var wgt_definition = JSON.parse( editor.getValue() );

        DfxVisualBuilder.findComponentAndUpdateAttributes( id, wgt_definition.definition, attributes, false );

        editor.setValue( JSON.stringify( wgt_definition, null, '\t' ), 0 );
        editor.gotoLine(1);

        DfxVisualBuilder.initPropertyPanelChange();
        DfxVisualBuilder.updateSelectedBox($('#'+id+'_image'));
    },
    "getSrcPath": function(attributes) {
        return (attributes.src_res && attributes.src_res.value && attributes.src_res.value.indexOf('{{') == -1)
            ? attributes.src_res.value
            : (attributes.src.value.indexOf('{{') != -1 ? '/images/dfx_gc_image.png' : attributes.src.value);
    }
}