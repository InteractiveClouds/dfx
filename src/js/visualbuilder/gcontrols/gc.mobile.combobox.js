/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/* GC Mobile Combobox Field */

var gc_mobile_combobox = {
    "label": "Combobox",
    "category": "default",
    "default_classes": "dfx_visual_editor_draggable dfx_visual_editor_gc_draggable",
    "attributeDefinition": {
        "categories": [
            {"id": "main_props",
                "label": "Main Properties",
                "expanded": true,
                "properties": [
                    { "id": "name", "label": "Name:", "type": "value", "default": "fldCombobox", "propType": "input" },
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
                    { "id": "propertyInit", "label": "Initialize:", "type": "value", "default": "", "propType": "input-picker", "picker": "exp" },
                    { "id": "propertyOptions", "label": "Bind Options using:", "type": "value", "default": "", "propType": "input-picker", "picker": "bind" },
                    { "id": "displayValue", "label": "Display Property", "type": "value", "default": "", "propType": "input" },
                    { "id": "dataValue", "label": "Data Property", "type": "value", "default": "", "propType": "input" }
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
                    { "id": "css", "type": "css", "propType": "input-css", "default": {"width": "100%"}, "cssOptions": [ "width", "height", "color", "background", "padding", "margin", "text-align" ] },
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
        var default_attributes = gc_factory.getDefaultAttributes( gc_mobile_combobox.attributeDefinition );

        return {
            id: component_id,
            type: "combobox",
            attributes: default_attributes,
            children: [],
            container: container_id
        };

    },
    "renderDesign": function( component ) {
        var attributes;
        if (!component.attributes) {
            attributes = gc_factory.getDefaultAttributes( gc_mobile_combobox.attributeDefinition );
        } else {
            attributes = gc_factory.migrateAttributes( gc_mobile_combobox.attributeDefinition, component.attributes );
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

        var fragment_html = '<div id="' + component.id + '"  gc-role="control" gc-type="combobox" ' +
            'style="position:relative;' + attributes.containerStyle.value  + ';' + containerCss + '" ' +
            'class="' + gc_mobile_combobox.default_classes + (attributes.containerClasses.value != '' ? ' '+attributes.containerClasses.value : '') + '">';

        /*fragment_html += '<a href="#myPopover">' +
        '<h1 class="title">' +
        'Tap title' +
        '<span class="icon icon-caret"></span>' +
        '</h1>' +
        '</a>';

        fragment_html += '<div id="myPopover" class="popover">' +
        '<header class="bar bar-nav">' +
        '<h1 class="title">Popover title</h1>' +
        '</header>' +
        '<ul class="table-view">' +
        '<li class="table-view-cell">Item1</li>' +
        '<li class="table-view-cell">Item2</li>' +
        '<li class="table-view-cell">Item3</li>' +
        '<li class="table-view-cell">Item4</li>' +
        '<li class="table-view-cell">Item5</li>' +
        '<li class="table-view-cell">Item6</li>' +
        '<li class="table-view-cell">Item7</li>' +
        '<li class="table-view-cell">Item8</li>' +
        '</ul>' +
        '</div>';

        fragment_html += '</div>';*/


        fragment_html += '<div id="' + component.id + '_form_group" ' +
            'style="width:100%">' +
            '<label id="' + component.id + '_label" for="' + component.id + '_field" style="'+(attributes.labelVisible.value=='yes' ? '' :'display:none')+'">' + label_text +'</label>' +
            '<select id="' + component.id + '_field" class=" ' + ((attributes.classes.value != '') ? attributes.classes.value : '') + '" ' +
            'style="' + (attributes.style ? attributes.style.value : '') + ';' + css + '"></select>';

        fragment_html += '</div></div>';

        var component_instance = {
            "id": component.id,
            "fragment": fragment_html
        };
        return component_instance;
    },
    "loadPropertyPanel": function(gc_component_definition) {
        $( '#gc_combobox_attr_id').val( gc_component_definition.id );
        gc_factory.generatePropertyPanel( gc_mobile_combobox.attributeDefinition, gc_component_definition );

        $('.dfx_visual_editor_property_input').change( function(e) {
            DfxVisualBuilder.propertyPanelChanged();
        });
    },
    "savePropertyPanel": function() {
        var id = $( '#gc_combobox_attr_id').val()
        var el =  $( '#'+id);

        var attributes = gc_factory.getPropertiesFromPanel( gc_mobile_combobox.attributeDefinition );

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
            'class': gc_mobile_combobox.default_classes + ' ' + attributes.containerClasses,
            'style': 'position:relative;' + attributes.containerStyle + ';' + containerCss
        });

        $('#'+id+'_field').attr( {
            'class': attributes.classes.value,
            'style': attributes.style.value + ';' + css
        });

        var label_text = (attributes.label.value.indexOf('{{')>-1 && attributes.label.value.indexOf('}}')>-1) ? '{{expression}}' : attributes.label.value;
        $('#'+id+'_label').text(label_text);

        if (attributes.labelVisible.value=='yes') {
            $('#'+id+'_label').css( 'display', 'block' );
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