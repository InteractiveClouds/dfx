/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/* GC Mobile Button */

var gc_mobile_button = {
    "label": "Button",
    "category": "default",
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
                { "id": "size", "label": "Size:", "type": "value", "default": "", "propType": "select", "selectOptions": "mobileSizes" },
                { "id": "fluid", "label": "Fluid:", "type": "value", "default": "no", "propType": "select", "selectOptions": "yesNo" },
                { "id": "circular", "label": "Circular:", "type": "value", "default": "no", "propType": "select", "selectOptions": "yesNo" }
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
        var default_attributes = gc_factory.getDefaultAttributes( gc_mobile_button.attributeDefinition );
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
            attributes = gc_factory.getDefaultAttributes( gc_mobile_button.attributeDefinition );
        } else {
            attributes = gc_factory.migrateAttributes( gc_mobile_button.attributeDefinition, component.attributes );
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

        var width = (attributes.style && attributes.style.value.indexOf('width') > -1) ? '' : 'width:100%;';

        var fragment_html;

        var semantic_classes = 'ui button';

        if (attributes.label.value != '' && attributes.icon.value != '') {
            semantic_classes += ' labeled';
        }
        if (attributes.icon.value != '') {
            semantic_classes += ' icon';
        }
        if (attributes.fluid.value == 'yes') {
            semantic_classes += ' fluid';
        }
        if (attributes.size.value == '') {
            semantic_classes += attributes.icon.size;
        }

        fragment_html = '<div id="' + component.id + '"  gc-role="control" gc-type="button" ' +
            'style="position:relative;' + attributes.containerStyle.value + ';' + containerCss + '" ' +
            'class="' + gc_mobile_button.default_classes + ' ' + (attributes.containerClasses.value != '' ? ' '+attributes.containerClasses.value : '') + '">';

        var add_label = (attributes.icon.value)
            ? ( attributes.iconPosition && attributes.iconPosition.value =='left' )
                ? '<i class="'+attributes.icon.value+' icon"></i><span>'+attributes.label.value+'</span>'
                    : '<span>'+attributes.label.value+'</span><i class="'+attributes.icon.value+' icon"></span>'
                : attributes.label.value;

        fragment_html += '<div id="' + component.id + '_button" type="button" class="' + semantic_classes + ' ' +
            attributes.classes.value + '"' +
            ' style="' + ((attributes.style) ? attributes.style.value : '') + ';' + width + css + '">' +
            add_label +
            '</div>';


        var component_instance = {
            "id": component.id,
            "fragment": fragment_html
        };
        return component_instance;
    },
    "loadPropertyPanel": function(gc_component_definition) {

        $( '#gc_button_attr_id').val( gc_component_definition.id );
        gc_factory.generatePropertyPanel( gc_mobile_button.attributeDefinition, gc_component_definition );

        PickerImageModal.icons.fillModal('iconsModal');
    },
    "savePropertyPanel": function() {
        var attributes = gc_factory.getPropertiesFromPanel( gc_mobile_button.attributeDefinition );

        var id = $( '#gc_button_attr_id').val();
        var semantic_classes = 'ui button';

        if (attributes.label.value != '' && attributes.icon.value != '') {
            semantic_classes += ' labeled';
        }
        if (attributes.icon.value != '') {
            semantic_classes += ' icon';
        }
        if (attributes.fluid.value == 'yes') {
            semantic_classes += ' fluid';
        }
        if (attributes.size.value == '') {
            semantic_classes += attributes.icon.size;
        }

        var el = $( '#'+id+'_button' );
        if(attributes.icon.value != ''){
            el.text('');
            if(attributes.iconPosition.value == 'left'){
                el.append('<i class="'+attributes.icon.value+' icon"></i><span>'+attributes.label.value+'</span>');
            } else {
                el.append('<span>'+attributes.label.value+'</span><i class="'+attributes.icon.value+' icon"></i>');
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
            'class': gc_mobile_button.default_classes + ' ' + attributes.containerClasses.value,
            'style': 'position:relative;' + attributes.containerStyle.value + ';' + containerCss
        });

        var width = (attributes.style && attributes.style.value.indexOf('width') > -1) ? '' : 'width:100%;';

        $('#'+id+'_button').attr( {
            'class': semantic_classes+' '+attributes.classes.value,
            'style': attributes.style.value + ';' + width + css
        });

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
