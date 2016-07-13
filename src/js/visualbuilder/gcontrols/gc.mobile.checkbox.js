/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/* GC Mobile Checkbox */
var gc_mobile_checkbox = {
    "label": "Checkbox",
    "category": "default",
    "default_classes": "dfx_visual_editor_draggable dfx_visual_editor_gc_draggable",
    "attributeDefinition": {
        "categories": [
            {"id": "main_props",
                "label": "Main Properties",
                "expanded": true,
                "properties": [
                    { "id": "name", "label": "Name:", "type": "value", "default": "fldCheckbox", "propType": "input" },
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
                    { "id": "dynamicOptions", "label": "Dynamic:", "type": "dynamicBindOptionsCheckbox", "default": "no", "propType": "input-dynamicBindOptionsCheckbox" },
                    { "id": "staticOptions", "label": "Static:", "type": "staticBindOptionsCheckbox", "propType": "popup-staticBindOptionsCheckbox" }
                ]
            },
            {"id": "rules_props",
                "label": "Presentation Rules",
                "expanded": false,
                "properties": [
                    { "id": "display", "label": "Display Rule:", "type": "value", "default": "true", "propType": "input-picker", "picker": "exp" },
                    { "id": "required", "label": "Required", "type": "value", "default": "no", "propType": "select", "selectOptions": "yesNo" }
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
        var default_attributes = gc_factory.getDefaultAttributes( gc_mobile_checkbox.attributeDefinition );
        return {
            id: component_id,
            type: "checkbox",
            attributes: default_attributes,
            children: [],
            container: container_id
        };
    },
    "renderDesign": function( component ) {
        var attributes;
        if (!component.attributes) {
            attributes = gc_factory.getDefaultAttributes( gc_mobile_checkbox.attributeDefinition );
        } else {
            attributes = gc_factory.migrateAttributes( gc_mobile_checkbox.attributeDefinition, component.attributes );
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

        var classes = attributes.classes.value ? attributes.classes.value : 'checkbox';
        var style = attributes.style.value ? attributes.style.value : '';
        var staticOptions = attributes.staticOptions ? attributes.staticOptions : [{ "displayValue": "Label", "checkedValue": "", "uncheckedValue": "", "disabled": false }];
        var orientation = attributes.orientation && attributes.orientation.value == 'horizontal' ? 'display:inline-block;margin-right:12px;' : 'display:block;';

        var fragment_html = '<div id="' + component.id + '" gc-role="control" gc-type="checkbox" ' +
            'style="position:relative;' + attributes.containerStyle.value + ';' + containerCss + '" ' +
            'class="' + gc_mobile_checkbox.default_classes + (attributes.containerClasses.value != '' ? ' ' + attributes.containerClasses.value : '') + '">';

        for (var i= 0, len = staticOptions.length; i<len; i++) {
            var displayValue_text = dfx_gc_common_helpers.showAsExpression(staticOptions[i].displayValue);

            fragment_html +=
                '<span id="' + component.id + '_label" style="' + orientation + style + ';' + css + '" class="' + classes + '" gc-label="checkbox">' +
                '<input name="' + component.id + '_field" type="checkbox" style="position:relative;margin-left:0px;margin-top:2px;" '+(staticOptions[i].disabled ? 'disabled="disabled"' : '')+'/>' +
                '<span style="margin-left:5px">' + displayValue_text + '</span>' +
                '</span>';
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
            gc_component_definition.attributes.staticOptions = [{ "displayValue": "Label", "checkedValue": "", "uncheckedValue": "", "disabled": false }];
        }
        if ( !gc_component_definition.attributes.propertyOptionsFields ) {
            gc_component_definition.attributes.propertyOptionsFields = {
                "displayValue": "label",
                "checkedValue": "checkedValue",
                "uncheckedValue": "uncheckedValue",
                "disabled":"disabled"
            };
        }

        $( '#gc_checkbox_attr_id').val( gc_component_definition.id );
        gc_factory.generatePropertyPanel( gc_mobile_checkbox.attributeDefinition, gc_component_definition );

        var attr = gc_component_definition.attributes;
        attr.type = 'checkbox';

        CustomModal.init('checkbox', attr);

        $('.dfx_visual_editor_property_input').change( function(e) {
            DfxVisualBuilder.propertyPanelChanged();
        });
    },
    "savePropertyPanel": function() {
        var id = $( '#gc_checkbox_attr_id').val();

        var attributes = gc_factory.getPropertiesFromPanel( gc_mobile_checkbox.attributeDefinition );

        var dynamicOptions = $('#gc_component_attr_dynamicOptions').is(':checked'),
            staticOptions = attributes.staticOptions.value,
            elIsChange = $('#gc_component_attr_changeRadio'),
            style = attributes.style.value || '',
            classes = attributes.classes.value || 'checkbox',
            orientation = attributes.orientation && attributes.orientation.value == 'horizontal' ? 'display:inline-block;margin-right:12px;' : 'display:block;',
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
            'class': gc_mobile_checkbox.default_classes + ' ' + attributes.containerClasses.value,
            'style': 'position:relative;' + attributes.containerStyle.value + ';' + containerCss
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
                    '<span id="' + id + '_label" class="'+classes+'" style="' + orientation + style + ';' + css + '" gc-label="checkbox">' +
                    '<input id="' + id + '_field" type="checkbox" style="position:relative;margin-left:0px;margin-top:2px;" '+(attributes.staticOptions[i].disabled ? 'disabled="disabled"' : '')+' />' +
                    '<span style="margin-left:5px">' + displayValue_text + '</span>' +
                    '</span>';

            }
            el.html(fragment_html);
        }
        // apply to already existed checkboxes
        if (el.find('[gc-label=checkbox]').attr('class') != classes) {
            el.find('[gc-label=checkbox]').attr('class', classes);
        }
        if (el.find('[gc-label=checkbox]').attr('style') != (orientation + style + ';' + css)) {
            el.find('[gc-label=checkbox]').attr('style', orientation + style + ';' + css);
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