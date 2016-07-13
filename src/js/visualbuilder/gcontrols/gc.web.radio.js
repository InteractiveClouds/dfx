/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/* GC Web radio */
var gc_web_radio = {
    "label": "Radio",
    "category": "default",
    "default_classes": "dfx_visual_editor_draggable dfx_visual_editor_gc_draggable",
    "attributeDefinition": {
        "categories": [
            {"id": "main_props",
                "label": "Main Properties",
                "expanded": true,
                "properties": [
                    { "id": "name", "label": "Name:", "type": "value", "default": "fldRadio", "propType": "input" },
                    { "id": "orientation", "label": "Orientation:", "type": "value", "default": "vertical", "propType": "select", "selectOptions": "orientation" },
                    { "id": "tooltip", "label": "Tooltip:", "type": "value", "default": "", "propType": "input-picker", "picker": "exptext" },
                    { "id": "tooltipPosition", "label": "Tooltip Position:", "type": "value", "default": "", "propType": "select", "selectOptions": "tooltipPosition" }
                ]
            },
            {"id": "data_props",
                "label": "Data & Binding options",
                "expanded": false,
                "properties": [
                    { "id": "property", "label": "Variable:", "type": "value", "default": "", "propType": "input-picker", "picker": "bind" },
                    { "id": "dynamicOptions", "label": "Dynamic:", "type": "dynamicBindOptionsRadio", "default": "no", "propType": "input-dynamicBindOptionsRadio" },
                    { "id": "staticOptions", "label": "Static:", "type": "staticBindOptionsRadio", "propType": "popup-staticBindOptionsRadio" }
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
                    { "id": "onchange", "label": "On Change:", "type": "value", "default": "", "propType": "input-picker", "picker": "evt" }
                ]
            }
        ]
    },
    "createDefinition": function( component_id, container_id ) {
        var default_attributes = gc_factory.getDefaultAttributes( gc_web_radio.attributeDefinition );
        return {
            id: component_id,
            type: "radio",
            attributes: default_attributes,
            children: [],
            container: container_id
        };
    },
    "renderDesign": function( component ) {
        var attributes;
        if (!component.attributes) {
            attributes = gc_factory.getDefaultAttributes( gc_web_radio.attributeDefinition );
        } else {
            attributes = gc_factory.migrateAttributes( gc_web_radio.attributeDefinition, component.attributes );
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

        var classes = attributes.classes.value ? attributes.classes.value : 'radio';
        var style = attributes.style.value ? attributes.style.value : '';
        var staticOptions = attributes.staticOptions ? attributes.staticOptions : [{ "displayValue": "Label", "dataValue": "", "disabled": false }];
        var orientation = attributes.orientation && attributes.orientation.value == 'horizontal' ? 'display:inline-block;margin-right:12px;' : '';

        var fragment_html = '<div id="' + component.id + '" gc-role="control" gc-type="radio" ' +
            'style="display:inline-block;position:relative;' + attributes.containerStyle.value + ';' + containerCss + '" ' +
            'class="' + gc_web_radio.default_classes + (attributes.containerClasses.value != '' ? ' ' + attributes.containerClasses.value : '') + '">';

        for (var i= 0, len = staticOptions.length; i<len; i++) {
            var displayValue_text = dfx_gc_common_helpers.showAsExpression(staticOptions[i].displayValue);

            fragment_html +=
                '<label id="' + component.id + '_label" style="' + orientation + style + ';' + css + '" class="' + classes + '">' +
                '<input name="' + component.id + '_field" type="radio" style="position:relative;margin-left:0px;margin-top:2px;" '+(staticOptions[i].disabled ? 'disabled="disabled"' : '')+'/>' +
                '<span style="margin-left:5px">' + displayValue_text + '</span>' +
                '</label>';
        }

        fragment_html += '</div>';

        var component_instance = {
            "id": component.id,
            "fragment": fragment_html
        };
        return component_instance;
    },
    "loadPropertyPanel": function(gc_component_definition) {
        if ( !gc_component_definition.attributes.staticOptions ) {
            gc_component_definition.attributes.staticOptions = [{ "displayValue": "Label", "dataValue": "", "disabled": false }];
        }
        if ( !gc_component_definition.attributes.propertyOptionsFields ) {
            gc_component_definition.attributes.propertyOptionsFields = {
                "displayValue": "label",
                "dataValue": "value",
                "disabled":"disabled"
            };
        }

        $( '#gc_radio_attr_id').val( gc_component_definition.id );
        gc_factory.generatePropertyPanel( gc_web_radio.attributeDefinition, gc_component_definition );

        var attr = gc_component_definition.attributes;
        attr.type = 'radio';

        CustomModal.init('radio', attr);

        $('.dfx_visual_editor_property_input').change( function(e) {
            DfxVisualBuilder.propertyPanelChanged();
        });
    },
    "savePropertyPanel": function() {
        var id = $( '#gc_radio_attr_id').val();

        var attributes = gc_factory.getPropertiesFromPanel( gc_web_radio.attributeDefinition );

        var dynamicOptions = $('#gc_component_attr_dynamicOptions').is(':checked'),
            staticOptions = attributes.staticOptions.value,
            elIsChange = $('#gc_component_attr_changeRadio'),
            style = attributes.style.value || '',
            orientation = attributes.orientation && attributes.orientation.value == 'horizontal' ? 'display:inline-block;margin-right:12px;' : '',
            classes = attributes.classes.value || 'radio',
            onchange = attributes.onchange.value,
            el = $('#'+id),
            fragment_html = '';

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
            'class': gc_web_radio.default_classes + ' ' + attributes.containerClasses.value,
            'style': 'display:inline-block;position:relative;' + attributes.containerStyle.value + ';' + containerCss
        });

        $('#'+id+'_label').attr( {
            'class': classes,
            'style': style + ';' + css
        });

        if (onchange) {
            attributes.onchange.value = onchange.replace(/\(.*?\)/g, "");
        }
        if (dynamicOptions) {
            if (staticOptions) {
                //staticOptions = '';
                elIsChange.val('1');
            }
        }

        // apply to new checkboxes when changed from static to dynamic and vice versa
        if (elIsChange.val() == '1') {
            for (var i=0; i<attributes.staticOptions.length; i++) {
                var displayValue_text = dfx_gc_common_helpers.showAsExpression(attributes.staticOptions[i].displayValue);

                fragment_html +=
                    '<label id="' + id + '_label" class="'+classes+'" style="' + orientation + style + ';' + css + '">' +
                    '<input id="' + id + '_field" type="radio" style="position:relative;margin-left:0px;margin-top:2px;" '+(attributes.staticOptions[i].disabled ? 'disabled="disabled"' : '')+' />' +
                    '<span style="margin-left:5px">' + displayValue_text + '</span>' +
                    '</label>';
            }
            el.html(fragment_html);
        }
        // apply to already existed checkboxes
        if (el.find('label').attr('class') != classes) {
            el.find('label').attr('class', classes);
        }
        if (el.find('label').attr('style') != (orientation + style + ';' + css)) {
            el.find('label').attr('style', orientation + style + ';' + css);
        }

        var editor = $('#dfx_src_editor.CodeMirror')[0].CodeMirror;
        var wgt_definition = JSON.parse( editor.getValue() );

        DfxVisualBuilder.findComponentAndUpdateAttributes( id, wgt_definition.definition, attributes, false );

        editor.setValue( JSON.stringify( wgt_definition, null, '\t' ));

        DfxVisualBuilder.initPropertyPanelChange();
        DfxVisualBuilder.updateSelectedBox(el);
    }
}