/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/* GC Mobile Toggle */
var gc_mobile_toggle = {
    "label": "Toggle",
    "category": "default",
    "default_classes": "dfx_visual_editor_draggable dfx_visual_editor_gc_draggable",
    "attributeDefinition": {
        "categories": [
            {"id": "main_props",
                "label": "Main Properties",
                "expanded": true,
                "properties": [
                    { "id": "name", "label": "Name:", "type": "value", "default": "fldCheckboxToggle", "propType": "input" },
                    { "id": "orientation", "label": "Orientation:", "type": "value", "default": "vertical", "propType": "select", "selectOptions": "orientation" },
                    { "id": "centralLabel", "label": "Central Label:", "type": "value", "default": "", "propType": "input-picker", "picker": "exptext" },
                    { "id": "onLabel", "label": "On Label:", "type": "value", "default": "ON", "propType": "input-picker", "picker": "exptext" },
                    { "id": "offLabel", "label": "Off Label:", "type": "value", "default": "OFF", "propType": "input-picker", "picker": "exptext" },
                    { "id": "centralIcon", "label": "Central Icon:", "type": "value", "default": "", "propType": "input-icon" },
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
                    { "id": "classes", "label": "Classes:", "type": "value", "default": "control-group", "propType": "input-picker", "picker": "class" },
                    { "id": "dynamicClasses", "label": "Dynamic Classes:", "type": "value", "default": "", "propType": "input-picker", "picker": "exp" },
                    { "id": "css", "type": "css", "propType": "input-css", "cssOptions": [ "toggleSize", "onColor", "offColor", "centralWidth", "handleWidth" ] },
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
        var default_attributes = gc_factory.getDefaultAttributes( gc_mobile_toggle.attributeDefinition );
        return {
            id: component_id,
            type: "checkboxtoggle",
            attributes: default_attributes,
            children: [],
            container: container_id
        };
    },
    "renderDesign": function( component, gc_already_dropped ) {
        var attributes;
        if (!component.attributes) {
            attributes = gc_factory.getDefaultAttributes( gc_mobile_toggle.attributeDefinition );
        } else {
            attributes = gc_factory.migrateAttributes( gc_mobile_toggle.attributeDefinition, component.attributes );
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

        var instance_id = component.id,
            classes = attributes.classes.value || 'control-group',
            style = attributes.style.value || '',
            centralLabel = attributes.centralLabel.value,
            centralIcon = attributes.centralIcon.value,
            centralWidth = attributes.css.centralWidth,
            handleWidth = attributes.css.handleWidth,
            size = attributes.css.toggleSize || 'normal',
            onLabel = attributes.onLabel.value || 'ON',
            offLabel = attributes.offLabel.value || 'OFF',
            onColor = attributes.css.onColor || 'primary',
            offColor = attributes.css.offColor || 'default',
            staticOptions = attributes.staticOptions ? attributes.staticOptions : [{ "displayValue": "Label", "checkedValue": "", "uncheckedValue": "", "disabled": false }],
            orientation = attributes.orientation && attributes.orientation.value == 'horizontal' ? 'display:inline-block;margin-right:12px;' : '';

        if (gc_already_dropped) {
            setTimeout('gc_mobile_toggle.setSwitch('+instance_id+', \'' + size + '\', \'' + onLabel + '\', \'' + offLabel + '\', \'' + onColor + '\', \'' + offColor + '\', \'' + centralLabel + '\', \'' + centralIcon + '\', \'' +
                gc_mobile_toggle._private.parseSize(centralWidth) + '\', \'' + gc_mobile_toggle._private.parseSize(handleWidth) + '\')', 20);
        }

        var fragment_html = '<div id="' + component.id + '" gc-role="control" gc-type="checkboxtoggle" ' +
            'style="display:inline-block;position:relative;' + attributes.containerStyle.value + ';' + containerCss + '" ' +
            'class="' + gc_mobile_toggle.default_classes + (attributes.containerClasses.value != '' ? ' ' + attributes.containerClasses.value : '') + '">';

        for (var i= 0, len = attributes.staticOptions.length; i<len; i++) {
            var displayValue_text = dfx_gc_common_helpers.showAsExpression(staticOptions[i].displayValue);

            fragment_html +=
                '<div class="dfx-form-group ' + classes + '" style="' + orientation + style + ';' + css + '">'+
                '<label name="' + instance_id + '_label" style="display:block;">' + displayValue_text + '</label>' +
                '<input name="' + instance_id + '_field" type="checkbox" '+(staticOptions[i].disabled ? 'disabled="disabled"' : '')+'/>' +
                '</div>';
            '</div>'
        }
        fragment_html += '</div>';

        var component_instance = {
            "id": component.id,
            "fragment": fragment_html,
            "callback": function(comp_inst) {
                if (! gc_already_dropped) {
                    setTimeout(gc_mobile_toggle.setSwitch(comp_inst.id, size, onLabel, offLabel, onColor, offColor, centralLabel, centralIcon,
                            gc_mobile_toggle._private.parseSize(centralWidth), gc_mobile_toggle._private.parseSize(handleWidth)), 20);
                }
            }
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

        $( '#gc_checkboxtoggle_attr_id').val( gc_component_definition.id );
        gc_factory.generatePropertyPanel( gc_mobile_toggle.attributeDefinition, gc_component_definition );

        var attr = gc_component_definition.attributes;
        attr.type = 'checkbox';

        CustomModal.init('checkbox', attr);
        PickerImageModal.icons.fillModal('iconsModal');

        $('.dfx_visual_editor_property_input').change( function(e) {
            DfxVisualBuilder.propertyPanelChanged();
        });
    },
    "savePropertyPanel": function() {
        var id = $( '#gc_checkboxtoggle_attr_id').val();

        var attributes = gc_factory.getPropertiesFromPanel( gc_mobile_toggle.attributeDefinition );

        var dynamicOptions = $('#gc_component_attr_dynamicOptions').is(':checked'),
            style = attributes.style.value || '',
            classes = attributes.classes.value || 'control-group',
            onchange = attributes.onchange.value,
            onLabel = attributes.onLabel.value || 'ON',
            offLabel = attributes.offLabel.value || 'OFF',
            centralLabel = attributes.centralLabel.value,
            centralIcon = attributes.centralIcon.value,
            size = attributes.css.toggleSize || 'normal',
            onColor = attributes.css.onColor || 'primary',
            offColor = attributes.css.offColor || 'default',
            centralWidth = attributes.css.centralWidth,
            handleWidth = attributes.css.handleWidth,
            orientation = attributes.orientation && attributes.orientation.value == 'horizontal' ? 'display:inline-block;margin-right:12px;' : '',
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
            'class': gc_mobile_toggle.default_classes + ' ' + attributes.containerClasses.value,
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
            fragment_html +=
                '<div class="dfx-form-group ' + classes + '" style="' + orientation + style + ';' + css + '">' +
                '<label name="' + id + '_label" style="display:block;">Label</label>' +
                '<input name="' + id + '_field" type="checkbox">' +
                '</div>';
        } else {
            for (var i = 0; i < attributes.staticOptions.length; i++) {
                var displayValue_text = dfx_gc_common_helpers.showAsExpression(attributes.staticOptions[i].displayValue);

                fragment_html +=
                    '<div class="dfx-form-group ' + classes + '" style="' + orientation + style + ';' + css + '">' +
                    '<label name="' + id + '_label" style="display:block;">' + displayValue_text + '</label>' +
                    '<input name="' + id + '_field" type="checkbox" ' + (attributes.staticOptions[i].disabled ? 'disabled="disabled"' : '') + '>' +
                    '</div>';
            }
        }
        el.html(fragment_html);

        this.setSwitch(id, size, onLabel, offLabel, onColor, offColor, centralLabel, centralIcon,
            this._private.parseSize(centralWidth), this._private.parseSize(handleWidth));

        var editor = ace.edit( 'dfx_src_editor' );
        var wgt_definition = JSON.parse( editor.getValue() );

        DfxVisualBuilder.findComponentAndUpdateAttributes( id, wgt_definition.definition, attributes, false );

        editor.setValue( JSON.stringify( wgt_definition, null, '\t' ), 0 );
        editor.gotoLine(1);

        DfxVisualBuilder.initPropertyPanelChange();
        DfxVisualBuilder.updateSelectedBox(el);
    },
    "setSwitch": function(id, size, onText, offText, onColor, offColor, labelText, icon, labelWidth, handleWidth) {
        var label = ( icon ) ? '<span class=\'glyphicon glyphicon-' + icon + '\'></span>' : labelText,
            opts = {"size":size, "onText": onText, "offText": offText, "onColor": onColor, "offColor": offColor, "readonly": true};
        if (label) {
            opts.labelText = label;
        }
        if (labelWidth) {
            opts.labelWidth = labelWidth+'px';
        }
        if (handleWidth) {
            opts.handleWidth = handleWidth+'px';
        }
        $('input[name="'+id+'_field"]', '#'+id).bootstrapSwitch(opts);
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