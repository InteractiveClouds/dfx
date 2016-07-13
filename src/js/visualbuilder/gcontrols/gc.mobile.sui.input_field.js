/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/* GC Mobile SUI Input Field */

var gc_mobile_input_field = {
    "label": "Input Field",
    "category": "default",
    "default_classes": "dfx_visual_editor_draggable dfx_visual_editor_gc_draggable",
    "attributeDefinition": {
        "categories": [
            {"id": "main_props",
                "label": "Main Properties",
                "expanded": true,
                "properties": [
                    { "id": "name", "label": "Name:", "type": "value", "default": "fldInput", "propType": "input" },
                    { "id": "label", "label": "Label:", "type": "value", "default": "Label", "propType": "input-picker", "picker": "exptext" },
                    { "id": "textPlaceholder", "label": "Placeholder:", "type": "value", "default": "", "propType": "input" }
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
            {"id": "label_props",
                "label": "Labeled Input Properties",
                "expanded": false,
                "properties": [
                    { "id": "labeledIcon", "label": "Icon:", "type": "value", "default": "", "propType": "input" },
                    { "id": "labeledText", "label": "Text:", "type": "value", "default": "", "propType": "input" },
                    { "id": "labeledPosition", "label": "Text:", "type": "value", "default": "", "propType": "select", "selectOptions": "labeledPosition" }
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
                    { "id": "css", "type": "css", "propType": "input-css", "default": {"padding": "2px 0"}, "cssOptions": [ "width", "height", "color", "background", "padding", "margin", "text-align" ] },
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
        var default_attributes = gc_factory.getDefaultAttributes( gc_mobile_input_field.attributeDefinition );
        return {
            id: component_id,
            type: "inputfield",
            attributes: default_attributes,
            children: [],
            container: container_id
        };
    },
    "renderDesign": function( component ) {
        var attributes;
        if (!component.attributes) {
            attributes = gc_factory.getDefaultAttributes( gc_mobile_input_field.attributeDefinition );
        } else {
            attributes = gc_factory.migrateAttributes( gc_mobile_input_field.attributeDefinition, component.attributes );
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

        var semantic_classes = 'ui input';

        fragment_html = '<div id="' + component.id + '"  gc-role="control" gc-type="inputfield" ' +
            'style="position:relative;' + attributes.containerStyle.value + ';' + containerCss + '" ' +
            'class="' + gc_mobile_input_field.default_classes + ' ' + (attributes.containerClasses.value != '' ? ' '+attributes.containerClasses.value : '') + '">';



        if (attributes.labeledPosition.value == 'right') {
            semantic_classes += ' ' + attributes.labeledPosition.value + ' labeled';
            fragment_html += '<div id="' + component.id + '_field" class="' + semantic_classes + ' ' +
                attributes.classes.value + '"' +
                ' style="' + ((attributes.style) ? attributes.style.value : '') + ';' + width + css + '">';
            fragment_html += '<input id="' + component.id + '_input" type="text" placeholder="' + attributes.textPlaceholder.value + '" />';
            if (attributes.labeledIcon.value != '') {
                fragment_html += '<div class="ui ' + attributes.labeledPosition.value + ' label"><i class="' + attributes.labeledIcon.value + ' icon"></i></div>';
            } else if (attributes.labeledText.value != '') {
                fragment_html += '<div class="ui ' + attributes.labeledPosition.value + ' label">' + attributes.labeledText.value + '</div>';
            }
            fragment_html += '</div></div>';
        } else if (attributes.labeledPosition.value == 'left') {
            semantic_classes += ' labeled';
            fragment_html += '<div id="' + component.id + '_field" class="' + semantic_classes + ' ' +
                attributes.classes.value + '"' +
                ' style="' + ((attributes.style) ? attributes.style.value : '') + ';' + width + css + '">';
            if (attributes.labeledIcon.value != '') {
                fragment_html += '<div class="ui label"><i class="' + attributes.labeledIcon.value + ' icon"></i></div>';
            } else if (attributes.labeledText.value != '') {
                fragment_html += '<div class="ui label">' + attributes.labeledText.value + '</div>';
            }
            fragment_html += '<input id="' + component.id + '_input" type="text" placeholder="' + attributes.textPlaceholder.value + '" />';
            fragment_html += '</div></div>';
        } else {
            fragment_html += '<div id="' + component.id + '_field" class="' + semantic_classes + ' ' +
                attributes.classes.value + '"' +
                ' style="' + ((attributes.style) ? attributes.style.value : '') + ';' + width + css + '">';
            fragment_html += '<input id="' + component.id + '_input" type="text" placeholder="' + attributes.textPlaceholder.value + '" />';
            fragment_html += '</div></div>';
        }


        var component_instance = {
            "id": component.id,
            "fragment": fragment_html
        };
        return component_instance;
    },
    "loadPropertyPanel": function(gc_component_definition) {
        $( '#gc_inputfield_attr_id').val( gc_component_definition.id );
        gc_factory.generatePropertyPanel( gc_mobile_input_field.attributeDefinition, gc_component_definition );

        PickerImageModal.icons.fillModal('iconsModal');

        $('.dfx_visual_editor_property_input').change( function(e) {
            DfxVisualBuilder.propertyPanelChanged();
        });
    },
    "savePropertyPanel": function() {
        var attributes = gc_factory.getPropertiesFromPanel( gc_mobile_input_field.attributeDefinition );

        var id = $( '#gc_inputfield_attr_id').val();
        var semantic_classes = 'ui input';

        if (attributes.labeledPosition.value != '') {
            semantic_classes += ' ' + attributes.labeledPosition.value + ' labeled';
        }

        var el =  $( '#'+id);

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
            'class': gc_mobile_input_field.default_classes + ' ' + attributes.containerClasses.value,
            'style': 'position:relative;' + attributes.containerStyle.value + ';' + containerCss
        });

        var width = (attributes.style && attributes.style.value.indexOf('width') > -1) ? '' : 'width:100%;';


        $('#'+id+'_field').remove();
        var fragment_html = '';

        if (attributes.labeledPosition.value == 'right') {
            semantic_classes += ' ' + attributes.labeledPosition.value + ' labeled';
            fragment_html += '<div id="' + id + '_field" class="' + semantic_classes + ' ' +
                attributes.classes.value + '"' +
                ' style="' + ((attributes.style) ? attributes.style.value : '') + ';' + width + css + '">';
            fragment_html += '<input id="' + id + '_input" type="text" placeholder="' + attributes.textPlaceholder.value + '" />';
            if (attributes.labeledIcon.value != '') {
                fragment_html += '<div class="ui ' + attributes.labeledPosition.value + ' label"><i class="' + attributes.labeledIcon.value + ' icon"></i></div>';
            } else if (attributes.labeledText.value != '') {
                fragment_html += '<div class="ui ' + attributes.labeledPosition.value + ' label">' + attributes.labeledText.value + '</div>';
            }
            fragment_html += '</div></div>';
        } else if (attributes.labeledPosition.value == 'left') {
            semantic_classes += ' labeled';
            fragment_html += '<div id="' + id + '_field" class="' + semantic_classes + ' ' +
                attributes.classes.value + '"' +
                ' style="' + ((attributes.style) ? attributes.style.value : '') + ';' + width + css + '">';
            if (attributes.labeledIcon.value != '') {
                fragment_html += '<div class="ui label"><i class="' + attributes.labeledIcon.value + ' icon"></i></div>';
            } else if (attributes.labeledText.value != '') {
                fragment_html += '<div class="ui label">' + attributes.labeledText.value + '</div>';
            }
            fragment_html += '<input id="' + id + '_input" type="text" placeholder="' + attributes.textPlaceholder.value + '" />';
            fragment_html += '</div></div>';
        } else {
            fragment_html += '<div id="' + id + '_field" class="' + semantic_classes + ' ' +
                attributes.classes.value + '"' +
                ' style="' + ((attributes.style) ? attributes.style.value : '') + ';' + width + css + '">';
            fragment_html += '<input id="' + id + '_input" type="text" placeholder="' + attributes.textPlaceholder.value + '" />';
            fragment_html += '</div></div>';
        }

        $('#'+id).append(fragment_html);

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
