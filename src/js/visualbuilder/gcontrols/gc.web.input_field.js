/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/* GC Web Input Field */

var gc_web_input_field = {
    "label": "Input Field",
    "category": "default",
    "styles_palette": "gc_web_input_field",
    "default_classes": "dfx_visual_editor_draggable dfx_visual_editor_gc_draggable",
    "attributeDefinition": {
        "categories": [
            {"id": "main_props",
                "label": "Main Properties",
                "expanded": true,
                "properties": [
                    { "id": "name", "label": "Name:", "type": "value", "default": "fldInput", "propType": "input" },
                    { "id": "type", "label": "Type:", "type": "value", "default": "text", "propType": "select", "selectOptions": "inputTypes", "change": "gc_web_input_field.displayInputTypeAttributes();" },
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
            {"id": "text_props",
                "label": "Text Properties",
                "expanded": false,
                "dynamic": true,
                "properties": [
                    { "id": "textIcon", "label": "Icon:", "type": "value", "default": "", "propType": "input-icon" },
                    { "id": "textIconPosition", "label": "Icon Position:", "type": "value", "default": "", "propType": "select", "selectOptions": "iconPosition" },
                    { "id": "textMinlength", "label": "Min Length:", "type": "value", "default": "", "propType": "input" },
                    { "id": "textMaxlength", "label": "Max Length:", "type": "value", "default": "", "propType": "input" },
                    { "id": "textPattern", "label": "Pattern:", "type": "value", "default": "", "propType": "input" },
                    { "id": "textMask", "label": "Mask:", "type": "value", "default": "", "propType": "input" },
                    { "id": "textPlaceholder", "label": "Placeholder:", "type": "value", "default": "", "propType": "input" },
                    { "id": "textErrorMinlength", "label": "Error Min Length:", "type": "value", "default": "", "propType": "input" },
                    { "id": "textErrorMaxlength", "label": "Error Max Length:", "type": "value", "default": "", "propType": "input" },
                    { "id": "textErrorPattern", "label": "Error Pattern:", "type": "value", "default": "", "propType": "input" }
                ]
            },
            {"id": "password_props",
                "label": "Password Properties",
                "expanded": false,
                "dynamic": true,
                "properties": [
                    { "id": "passwordIcon", "label": "Icon:", "type": "value", "default": "", "propType": "input-icon" },
                    { "id": "passwordIconPosition", "label": "Icon Position:", "type": "value", "default": "", "propType": "select", "selectOptions": "iconPosition" },
                    { "id": "passwordMinlength", "label": "Min Length:", "type": "value", "default": "", "propType": "input" },
                    { "id": "passwordMaxlength", "label": "Max Length:", "type": "value", "default": "", "propType": "input" },
                    { "id": "passwordErrorMinlength", "label": "Error Min Length:", "type": "value", "default": "", "propType": "input" },
                    { "id": "passwordErrorMaxlength", "label": "Error Max Length:", "type": "value", "default": "", "propType": "input" }
                ]
            },
            {"id": "date_props",
                "label": "Date Properties",
                "expanded": false,
                "dynamic": true,
                "properties": [
                    { "id": "dateFormat", "label": "Format:", "type": "value", "default": "mm/dd/yyyy", "propType": "input-date-format" },
                    { "id": "dateMin", "label": "Min Length:", "type": "value", "default": "", "propType": "input" },
                    { "id": "dateMax", "label": "Max Length:", "type": "value", "default": "", "propType": "input" },
                    { "id": "dateErrorFormat", "label": "Error Format:", "type": "value", "default": "", "propType": "input" }
                ]
            },
            {"id": "money_props",
                "label": "Money Properties",
                "expanded": false,
                "dynamic": true,
                "properties": [
                    { "id": "moneyIcon", "label": "Icon:", "type": "value", "default": "", "propType": "input-icon" },
                    { "id": "moneyIconPosition", "label": "Icon Position:", "type": "value", "default": "", "propType": "select", "selectOptions": "iconPosition" },
                    { "id": "moneyThousandSeparator", "label": "Thousand Separator:", "type": "value", "default": ",", "propType": "input" },
                    { "id": "moneyDecimalSeparator", "label": "Decimal Separator:", "type": "value", "default": ".", "propType": "input" },
                    { "id": "moneyNumberDigits", "label": "Number of Digits:", "type": "value", "default": "2", "propType": "input" }
                ]
            },
            {"id": "number_props",
                "label": "Number Properties",
                "expanded": false,
                "dynamic": true,
                "properties": [
                    { "id": "numberIcon", "label": "Icon:", "type": "value", "default": "", "propType": "input-icon" },
                    { "id": "numberIconPosition", "label": "Icon Position:", "type": "value", "default": "", "propType": "select", "selectOptions": "iconPosition" },
                    { "id": "numberMin", "label": "Min:", "type": "value", "default": "0", "propType": "input" },
                    { "id": "numberMax", "label": "Max:", "type": "value", "default": "10", "propType": "input" },
                    { "id": "numberStep", "label": "Step:", "type": "value", "default": "1", "propType": "input" }
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
                    { "id": "containerCss", "type": "css", "propType": "input-css", default: {"width": "200px"}, "cssOptions": [ "width", "height", "color", "background", "padding", "margin", "text-align" ] },
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
        var default_attributes = gc_factory.getDefaultAttributes( gc_web_input_field.attributeDefinition );

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
            attributes = gc_factory.getDefaultAttributes( gc_web_input_field.attributeDefinition );
        } else {
            attributes = gc_factory.migrateAttributes( gc_web_input_field.attributeDefinition, component.attributes );
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
        fragment_html = '<div id="' + component.id + '"  gc-role="control" gc-type="inputfield" ' +
            'style="display:inline-block;position:relative;' + attributes.containerStyle.value  + ';' + containerCss + '" ' +
            'class="' + gc_web_input_field.default_classes + (attributes.containerClasses.value != '' ? ' '+attributes.containerClasses.value : '') + '">';

        fragment_html += '<div id="' + component.id + '_form_group" ' +
            'class="form-group">' +
            '<label id="' + component.id + '_input_label" for="' + component.id + '_input_field" style="display:'+(attributes.labelVisible.value=='yes' ? 'inline-block' :'none')+'">' + label_text +'</label>';

        if (attributes.type.value=='text') {
            fragment_html += '<div id="' + component.id + '_input_group" ' +
                'class="input-group" style="width:100%;">';

            if (attributes.textIcon.value!='' && attributes.textIconPosition.value =='left') {
                fragment_html += '<span class="input-group-addon left-icon" style="display:table-cell"><i class="glyphicon glyphicon-' + attributes.textIcon.value + '"></i></span>';
            }
            fragment_html += '<input id="' + component.id + '_field" type="text" ' +
                'placeholder="' + attributes.textPlaceholder.value + '" ' +
                'value="' + ((attributes.property.value!='') ? '{{'+attributes.property.value+'}}' : '' ) + '" ' +
                'class="form-control' + (attributes.classes.value != '' ? ' ' + attributes.classes.value : '') + '" ' +
                'style="' + (attributes.style ? attributes.style.value : '') + ';' + css + '"/>';
            if (attributes.textIcon.value!='' && attributes.textIconPosition.value =='right') {
                fragment_html += '<span class="input-group-addon left-icon" style="display:table-cell"><i class="glyphicon glyphicon-' + attributes.textIcon.value + '"></i></span>';
            }

        } else if (attributes.type.value=='password') {
            fragment_html += '<div id="' + component.id + '_input_group" ' +
                'class="input-group" style="width:100%;">';

            if (attributes.passwordIcon.value!='' && attributes.passwordIconPosition.value =='left') {
                fragment_html += '<span class="input-group-addon left-icon" style="display:table-cell"><i class="glyphicon glyphicon-' + attributes.passwordIcon.value + '"></i></span>';
            }
            fragment_html += '<input id="' + component.id + '_field" type="text" ' +
                'value="' + ((attributes.property.value!='') ? '{{'+attributes.property.value+'}}' : '' ) + '" ' +
                'class="form-control' + (attributes.classes.value != '' ? ' ' + attributes.classes.value : '') + '" ' +
                'style="' + (attributes.style ? attributes.style.value : '') + ';' + css + '"/>';
            if (attributes.passwordIcon.value!='' && attributes.passwordIconPosition.value =='right') {
                fragment_html += '<span class="input-group-addon left-icon" style="display:table-cell"><i class="glyphicon glyphicon-' + attributes.passwordIcon.value + '"></i></span>';
            }
        } else if (attributes.type.value=='date') {

            fragment_html += '<div id="' + component.id + '_input_group" ' +
                'class="input-group" style="width:100%;">';
            fragment_html += '<input id="' + component.id + '_field" type="text" ' +
                'value="' + ((attributes.property.value!='') ? '{{'+attributes.property.value+'}}' : '' ) + '" ' +
                'class="form-control' + (attributes.classes.value != '' ? ' ' + attributes.classes.value : '') + '" ' +
                'style="' + (attributes.style ? attributes.style.value : '') + ';' + css + '"/>';
            fragment_html += '<span class="input-group-btn"><button class="btn btn-default" type="button"><span class="fa fa-calendar"></span></button></span>';
        } else if (attributes.type.value=='money') {
            fragment_html += '<div id="' + component.id + '_input_group" ' +
                'class="input-group" style="width:100%;">';

            if (attributes.moneyIcon.value!='' && attributes.moneyIconPosition.value =='left') {
                fragment_html += '<span class="input-group-addon left-icon" style="display:table-cell"><i class="glyphicon glyphicon-' + attributes.moneyIcon.value + '"></i></span>';
            }
            fragment_html += '<input id="' + component.id + '_field" type="text" ' +
                'value="' + ((attributes.property.value!='') ? '{{'+attributes.property.value+'}}' : '' ) + '" ' +
                'class="form-control' + (attributes.classes.value != '' ? ' ' + attributes.classes.value : '') + '" ' +
                'style="' + (attributes.style ? attributes.style.value : '') + ';' + css + '"/>';
            if (attributes.moneyIcon.value!='' && attributes.moneyIconPosition.value =='right') {
                fragment_html += '<span class="input-group-addon left-icon" style="display:table-cell"><i class="glyphicon glyphicon-' + attributes.moneyIcon.value + '"></i></span>';
            }

        } else if (attributes.type.value=='number') {
            fragment_html += '<div id="' + component.id + '_input_group" ' +
                'class="input-group" style="width:100%;">';

            if (attributes.numberIcon.value!='' && attributes.numberIconPosition.value =='left') {
                fragment_html += '<span class="input-group-addon left-icon" style="display:table-cell"><i class="glyphicon glyphicon-' + attributes.numberIcon.value + '"></i></span>';
            }
            fragment_html += '<input id="' + component.id + '_field" type="number" ' +
                'value="' + ((attributes.property.value!='') ? '{{'+attributes.property.value+'}}' : '' ) + '" ' +
                'class="form-control' + (attributes.classes.value != '' ? ' ' + attributes.classes.value : '') + '" ' +
                'style="' + (attributes.style ? attributes.style.value : '') + ';' + css + '"/>';
            if (attributes.numberIcon.value!='' && attributes.numberIconPosition.value =='right') {
                fragment_html += '<span class="input-group-addon left-icon" style="display:table-cell"><i class="glyphicon glyphicon-' + attributes.numberIcon.value + '"></i></span>';
            }

        }
        fragment_html += '</div>';

        fragment_html += '</div>';

        var component_instance = {
            "id": component.id,
            "fragment": fragment_html
        };
        return component_instance;

        /*

        if (!component.attributes) {
            component.attributes = this.getDefaultAttributes();
        }
        var instance_id = component.id;
        var type = component.attributes.type ? component.attributes.type.value: 'text';
        var input_field = this.getInputTemplate(type, component.attributes, instance_id);
        var fragment_html = '<div id="' + instance_id + '"  gc-role="control" gc-type="inputfield" class="dfx_visual_editor_draggable dfx_visual_editor_gc_draggable form-group">'
            + '<label id="' + instance_id + '_label" for="' + instance_id + '_field" style="display:'+(component.attributes.labelVisible.value ? 'block' :'none')+'">' + component.attributes.label.value +'</label>'
            + input_field
            + '</div>';

        return {
            "id": instance_id,
            "fragment": fragment_html
        };*/
    },
    "loadPropertyPanel": function(gc_component_definition) {
        $( '#gc_inputfield_attr_id').val( gc_component_definition.id );
        gc_factory.generatePropertyPanel( gc_web_input_field.attributeDefinition, gc_component_definition );

        gc_web_input_field.displayInputTypeAttributes();

        PickerImageModal.icons.fillModal('iconsModal');

        $('.dfx_visual_editor_property_input').change( function(e) {
            DfxVisualBuilder.propertyPanelChanged();
        });

        /*var id_attr = 'gc_inputfield_attr',
            id = gc_component_definition.id,
            attributes = gc_component_definition.attributes,
            type  = attributes.type ? attributes.type.value : "text",
            typeAttr = ( attributes.propertyByType && attributes.propertyByType[type] ) ? attributes.propertyByType[type] : null;
        // common
        $( '#' + id_attr + '_id').val( id );
        $( '#' + id_attr + '_name').val( attributes.name.value );
        $( 'option[value="'+type+'"]','#' + id_attr + '_type').attr( 'selected', true );
        $( '#' + id_attr + '_property').val( attributes.property ? attributes.property.value : "" );
        $( '#' + id_attr + '_propertyInit').val( attributes.propertyInit ? attributes.propertyInit.value : "" );
        $( '#' + id_attr + '_display').val( attributes.display ? attributes.display.value : "" );
        $( '#' + id_attr + '_label').val( attributes.label.value ).focus();
        $( '#' + id_attr + '_labelVisible').val( attributes.labelVisible.value ? 'yes' : 'no' );
        $( '#' + id_attr + '_tooltip').val( attributes.tooltip ? attributes.tooltip.value : "" );
        $( 'option[value="'+(attributes.tooltipPosition ? attributes.tooltipPosition.value : 'top')+'"]','#' + id_attr + '_tooltipPosition').attr( 'selected', true );
        $( '#' + id_attr + '_disabled').val( attributes.disabled ? attributes.disabled.value : ""  );
        $( '#' + id_attr + '_required').val( attributes.required.value ? 'yes' : 'no' );
        $( '#' + id_attr + '_style').val( attributes.style ? attributes.style.value : "" );
        $( '#' + id_attr + '_classes').val( attributes.classes ? attributes.classes.value : "" );
        $( '#' + id_attr + '_dynamicClasses').val( attributes.dynamicClasses ? attributes.dynamicClasses.value : "" );
        $( '#' + id_attr + '_onchange').val( attributes.onchange ? attributes.onchange.value : "" );

        if(typeAttr){
            for(var pr in typeAttr){
                if(typeAttr.hasOwnProperty(pr)) {
                    if(pr == 'error') {
                        for(var errPr in typeAttr[pr]){
                            $( '#' + id_attr + '_'+pr+ '_'+errPr,'#gc_input_'+type).val(typeAttr[pr][errPr].value);
                        }
                    } else {
                        $( '#' + id_attr + '_'+pr,'#gc_input_'+type).val(typeAttr[pr].value);
                    }
                }
            }
        }

        if(type != 'text') {
            this.showNeedType(type);
        }
        if(type != 'number' && type != 'date') {
            PickerImageModal.icons.fillModal('iconsModal');
        }*/
    },
    "savePropertyPanel": function() {
        var id = $( '#gc_inputfield_attr_id').val()
        var el =  $( '#'+id);

        var attributes = gc_factory.getPropertiesFromPanel( gc_web_input_field.attributeDefinition );

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
            'class': gc_web_input_field.default_classes + ' ' + attributes.containerClasses.value,
            'style': 'display:inline-block;position:relative;' + attributes.containerStyle.value + ';' + containerCss
        });

        $('#'+id+'_field').attr( {
            'class': 'form-control '+attributes.classes.value,
            'style': attributes.style.value + ';' + css
        });

        if (attributes.labelVisible.value=='yes') {
            $('#'+id+'_input_label').css( 'display', 'inline-block' );
        } else {
            $('#'+id+'_input_label').css( 'display', 'none' );
        }

        var label_text = (attributes.label.value.indexOf('{{')>-1 && attributes.label.value.indexOf('}}')>-1) ? '{{expression}}' : attributes.label.value;
        $('#'+id+'_input_label').text(label_text);

        $('#'+id + '_input_group > span.input-group-addon').remove();
        $('#'+id + '_input_group > span.input-group-btn').remove();

        if (attributes.type.value=='text') {

            if (attributes.textIcon.value != '') {
                if (attributes.textIconPosition.value == 'left') {
                    $('#' + id + '_input_group').prepend('<span class="input-group-addon left-icon" style="display:table-cell"><i class="glyphicon glyphicon-' + attributes.textIcon.value + '"></i></span>');
                } else {
                    $('#' + id + '_input_group').append('<span class="input-group-addon left-icon" style="display:table-cell"><i class="glyphicon glyphicon-' + attributes.textIcon.value + '"></i></span>');
                }
            }

            //$('#' + id + '_field').attr('placeholder', attributes.textPlaceholder.value);

            if (attributes.property.value=='') {
                $('#' + id + '_field').val('');
            } else {
                $('#' + id + '_field').val('{{'+attributes.property.value+'}}');
            }

        } else if (attributes.type.value=='password') {
            if (attributes.passwordIcon.value != '') {
                if (attributes.passwordIconPosition.value == 'left') {
                    $('#' + id + '_input_group').prepend('<span class="input-group-addon left-icon" style="display:table-cell"><i class="glyphicon glyphicon-' + attributes.passwordIcon.value + '"></i></span>');
                } else {
                    $('#' + id + '_input_group').append('<span class="input-group-addon left-icon" style="display:table-cell"><i class="glyphicon glyphicon-' + attributes.passwordIcon.value + '"></i></span>');
                }
            }

            if (attributes.property.value=='') {
                $('#' + id + '_field').val('');
            } else {
                $('#' + id + '_field').val(attributes.property.value);
            }
        } else if (attributes.type.value=='date') {
            $('#' + id + '_input_group').append('<span class="input-group-btn"><button class="btn btn-default" type="button"><span class="fa fa-calendar"></span></button></span>');

            if (attributes.property.value == '') {
                $('#' + id + '_field').val('');
            } else {
                $('#' + id + '_field').val(attributes.property.value);
            }
        } else if (attributes.type.value=='money') {

            if (attributes.moneyIcon.value != '') {
                if (attributes.moneyIconPosition.value == 'left') {
                    $('#' + id + '_input_group').prepend('<span class="input-group-addon left-icon" style="display:table-cell"><i class="glyphicon glyphicon-' + attributes.moneyIcon.value + '"></i></span>');
                } else {
                    $('#' + id + '_input_group').append('<span class="input-group-addon left-icon" style="display:table-cell"><i class="glyphicon glyphicon-' + attributes.moneyIcon.value + '"></i></span>');
                }
            }

            if (attributes.property.value=='') {
                $('#' + id + '_field').val('');
            } else {
                $('#' + id + '_field').val('{{'+attributes.property.value+'}}');
            }

        } else if (attributes.type.value=='number') {

            if (attributes.numberIcon.value != '') {
                if (attributes.numberIconPosition.value == 'left') {
                    $('#' + id + '_input_group').prepend('<span class="input-group-addon left-icon" style="display:table-cell"><i class="glyphicon glyphicon-' + attributes.numberIcon.value + '"></i></span>');
                } else {
                    $('#' + id + '_input_group').append('<span class="input-group-addon left-icon" style="display:table-cell"><i class="glyphicon glyphicon-' + attributes.numberIcon.value + '"></i></span>');
                }
            }

            //$('#' + id + '_field').attr('placeholder', attributes.textPlaceholder.value);

            if (attributes.property.value=='') {
                $('#' + id + '_field').val('');
            } else {
                $('#' + id + '_field').val('{{'+attributes.property.value+'}}');
            }

        }

        $('#' + id + '_field').attr('placeholder', attributes.textPlaceholder.value);

        var editor = ace.edit( 'dfx_src_editor' );
        var wgt_definition = JSON.parse( editor.getValue() );

        DfxVisualBuilder.findComponentAndUpdateAttributes( id, wgt_definition.definition, attributes, false );

        editor.setValue( JSON.stringify( wgt_definition, null, '\t' ), 0 );
        editor.gotoLine(1);

        DfxVisualBuilder.initPropertyPanelChange();
        DfxVisualBuilder.updateSelectedBox(el);

        /*
        var id_attr = 'gc_inputfield_attr',
            id = $( '#' + id_attr + '_id').val(),
            type = $( '#' + id_attr + '_type').val(),
            property = $( '#' + id_attr + '_property').val(),
            label = $( '#' + id_attr + '_label').val(),
            labelVisible =  !!(($( '#' + id_attr + '_labelVisible').val() == "yes")),
            style = $( '#' + id_attr + '_style').val(),
            classes = $( '#' + id_attr + '_classes').val(),
            dynClasses = $( '#' + id_attr + '_dynamicClasses').val(),
            placeholder = $( '#' + id_attr + '_placeholder','#gc_input_'+type).val() || "",
            el_field = $( '#'+id+ '_field'),
            attributes = this.getDefaultAttributes(),
            typeAttr,
            container_class = '',
            icon = $( '#' + id_attr + '_icon', '#gc_input_'+type).val(),
            iconPosition = $( '#' + id_attr + '_iconPosition', '#gc_input_'+type).val();

        attributes.type.value = type;
        attributes.property.value = property;
        attributes.label.value = label;
        attributes.labelVisible.value = labelVisible;
        attributes.classes.value = classes;
        attributes.dynamicClasses.value = dynClasses;
        attributes.style.value = style;
        attributes.tooltip.value = $( '#' + id_attr + '_tooltip').val();
        attributes.tooltipPosition.value = $( '#' + id_attr + '_tooltipPosition').val();
        attributes.name.value = $( '#' + id_attr + '_name').val();
        attributes.propertyInit.value = $( '#' + id_attr + '_propertyInit').val();
        attributes.display.value = $( '#' + id_attr + '_display').val();
        attributes.disabled.value = $( '#' + id_attr + '_disabled').val();
        attributes.required.value = !!(($( '#' + id_attr + '_required').val() == "yes"));
        attributes.onchange.value = $( '#' + id_attr + '_onchange').val();

        attributes.propertyByType = {};
        attributes.propertyByType[type] = this.getAttributesByType(type);
        typeAttr = attributes.propertyByType[type];

        for(var pr in typeAttr){
            if(typeAttr.hasOwnProperty(pr)) {
                if(pr == 'error') {
                    for(var errPr in typeAttr[pr]) {
                        typeAttr[pr][errPr].value = $( '#' + id_attr + '_'+pr+ '_'+errPr,'#gc_input_'+type).val() || "";
                    }
                } else {
                    typeAttr[pr].value = $( '#' + id_attr + '_'+pr,'#gc_input_'+type).val() || "";
                }
            }
        }
        $( '#'+id+ '_label' )
            .text( label)
            .css( 'display', (labelVisible ? 'block' : 'none') );

        if(attributes.classes.value){
            if(attributes.classes.value){
                if(attributes.classes.value.indexOf('input-sm') > -1){
                    container_class = 'input-group-sm';
                } else if(attributes.classes.value.indexOf('input-lg') > -1) {
                    container_class = 'input-group-lg'
                }
            }
        }

        if(type == 'date'){
            el_field
                .attr( {'class': (classes == '' ? 'form-control': 'form-control '+classes)})
                .val( (property != '') ? '{' + property + '}' : '');

            $( '#'+id+ '_group')
                .attr( {'style': style, 'class': (classes == '' ? 'input-group': 'input-group '+container_class)})


        } else if(type == 'number') {

            $( '#'+id+ '_group').replaceWith(this.getInputTemplate(type, attributes, id));

        } else {
            var el_group = $( '#'+id+ '_group'),
                leftIconBlock = $('.left-icon', el_group),
                rightIconBlock = $('.right-icon', el_group);

            $('.input-group-addon', el_group).attr( {'style': 'display:none' });

            if(icon != ''){
                if(iconPosition == 'left'){
                    leftIconBlock.attr( {'style': 'display:table-cell' });
                    $('.glyphicon', leftIconBlock).attr('class','').addClass('glyphicon glyphicon-'+icon);
                } else {
                    rightIconBlock.attr( {'style': 'display:table-cell' });
                    $('.glyphicon', rightIconBlock).attr('class','').addClass('glyphicon glyphicon-'+icon);
                }
            }

            el_group
                .attr( {'style': style, 'class': (classes == '' ? 'input-group': 'input-group '+container_class)});

            el_field
                .val( (property != '') ? '{' + property + '}' : '')
                .attr( {'placeholder': placeholder, 'class': (classes == '' ? 'form-control': 'form-control '+classes)});
        }
        var editor = ace.edit( 'dfx_src_editor' );
        var wgt_definition = JSON.parse( editor.getValue() );

        DfxVisualBuilder.findComponentAndUpdateAttributes( id, wgt_definition.definition, attributes, false );

        editor.setValue( JSON.stringify( wgt_definition, null, '\t' ), 0 );
        editor.gotoLine(1);

        $('#'+id).click();*/
    },
    "displayInputTypeAttributes": function() {
        var type = $('#gc_component_attr_type').val();

        $('span[dynamicPanel]').css('display', 'none');
        $('#'+type+'_props_dynamic').css('display', 'block');
    },
    "getAttributesByType": function(type) {
        var res;
        var allAttrByType = {
            "text":{
                "minlength": { "value": "" },
                "maxlength": { "value": "" },
                "pattern": { "value": "" },
                "mask": {
                    "value": ""
                },
                "placeholder": { "value": "" },
                "icon": { "value": "" },
                "iconPosition": { "value": "" },
                "error": {
                    "required": { "value": "" },
                    "minlength": { "value": "" },
                    "maxlength": { "value": "" },
                    "pattern": { "value": "" }
                }
            },
            "password": {
                "minlength": { "value": "" },
                "maxlength": { "value": "" },
                "icon": { "value": "" },
                "iconPosition": { "value": "" },
                "error": {
                    "required": { "value": "" },
                    "minlength": { "value": "" },
                    "maxlength": { "value": "" }
                }
            },
            "date":{
                "format": { "value": "" },
                "mindate": { "value": "" },
                "maxdate": { "value": "" },
                "placeholder": { "value": "" },
                "error": {
                    "date": { "value": "" }
                }
            },
            "number": {
                "min": { "value": "" },
                "max": { "value": "" },
                "step": { "value": "" },
                "vertical": {"value": ""},
                "placeholder": { "value": "" },
                "error": {
                    "required": { "value": "" }
                }
            },
            "amount": {
                "groupsep": { "value": "" },
                "decsep": { "value": "" },
                "digits": { "value": "" },
                "minlength": { "value": "" },
                "maxlength": { "value": "" },
                "pattern": { "value": "" },
                "placeholder": { "value": "" },
                "icon": { "value": "" },
                "iconPosition": { "value": "" },
                "error": {
                    "required": { "value": "" },
                    "minlength": { "value": "" },
                    "maxlength": { "value": "" },
                    "pattern": { "value": "" }
                }
            }
        };
        if(type && allAttrByType[type]){
            res = allAttrByType[type];
        } else {
            res = allAttrByType;
        }
        return res;
    },
    "getDefaultAttributes": function() {
        return {
            "name": { "value": "fldInputField" },
            "type": {"value": "text"},
            "property": { "value": "" },
            "propertyInit": { "value": "" },
            "label": { "value": "Label" },
            "labelVisible": { "value": true },
            "tooltip": {"value": ""},
            "tooltipPosition": {"value": "top"},
            "display": { "value": "" },
            "disabled": { "value": "" },
            "required": { "value": false },
            "classes": { "value": "" },
            "dynamicClasses": { "value": "" },
            "style": { "value": "width:200px" },
            "onchange": { "value": "" } ,
            "propertyByType": {
                "text":{
                    "minlength": { "value": "" },
                    "maxlength": { "value": "" },
                    "pattern": { "value": "" },
                    "mask": {
                        "value": ""
                    },
                    "placeholder": { "value": "" },
                    "error": {
                        "required": { "value": "" },
                        "minlength": { "value": "" },
                        "maxlength": { "value": "" },
                        "pattern": { "value": "" }
                    }
                }
            }
        };
    },
    "getInputTemplate": function(type, attr, id) {
        var placeholder = '', container_class = '',
            visibleLeftIcon = false, visibleRightIcon =  false, typeAttr,
            icon = '', html = '';
        if(!attr.propertyByType){
            attr.propertyByType = {};
        }
        if(!attr.propertyByType[type]) {
            attr.propertyByType[type] = this.getAttributesByType(type);
        }
        typeAttr = attr.propertyByType[type];

        if(attr.classes.value){
            if(attr.classes.value){
                if(attr.classes.value.indexOf('input-sm') > -1){
                    container_class = 'input-group-sm';
                } else if(attr.classes.value.indexOf('input-lg') > -1) {
                    container_class = 'input-group-lg'
                }
            }
        }

        if(typeAttr.icon && typeAttr.icon.value){

            if(typeAttr.iconPosition.value == 'left'){
                visibleLeftIcon = true;
            } else if(typeAttr.iconPosition.value == 'right'){
                visibleRightIcon = true;
            }
            icon = typeAttr.icon.value;
        }

        if(type == 'text') {

            html = '<div id="' + id + '_group" ' +
                'class="input-group ' + container_class + '" ' +
                'style="' + attr.style.value +'">' +
                '<span class="input-group-addon left-icon" style="'+((visibleLeftIcon) ? 'display:table-cell' : 'display:none')+'"><i class="glyphicon glyphicon-'+icon+'"></i></span>'+
                '<input id="' + id + '_field" type="text" ' +
                'class="form-control ' + ((attr.classes.value) ? attr.classes.value : '' )+ '" ' +
                'placeholder="' + typeAttr.placeholder.value + '" ' +
                'value="' + ((attr.property.value!='') ? '{'+attr.property.value+'}' : '' ) + '" />' +
                '<span class="input-group-addon right-icon" style="'+((visibleRightIcon) ? 'display:table-cell' : 'display:none')+'"><i class="glyphicon glyphicon-'+icon+'"></i></span>'+
                '</div>';

        } else if(type == 'password') {

            html = '<div id="' + id + '_group" ' +
                'class="input-group ' + container_class + '" ' +
                'style="' + attr.style.value +'">' +
                '<span class="input-group-addon left-icon" style="'+((visibleLeftIcon) ? 'display:table-cell' : 'display:none')+'"><i class="glyphicon glyphicon-'+icon+'"></i></span>'+
                '<input id="' + id + '_field" type="password" ' +
                'class="form-control ' + ((attr.classes.value) ? attr.classes.value : '') + '" ' +
                'value="' + ((attr.property.value!='') ? '{'+attr.property.value+'}' : '' ) + '" />' +
                '<span class="input-group-addon right-icon" style="'+((visibleRightIcon) ? 'display:table-cell' : 'display:none')+'"><i class="glyphicon glyphicon-'+icon+'"></i></span>'+
                '</div>';

        } else if(type == 'date') {

            html = '<div id="' + id + '_group" ' +
                'class="input-group ' + container_class + '" ' +
                'style="' + attr.style.value +'">'+
                '<input id="' + id + '_field" type="text" ' +
                'value="' + ((attr.property.value!='') ? '{'+attr.property.value+'}' : '' ) + '" '+
                'class="form-control ' + ((attr.classes.value) ? attr.classes.value : '') + '" />' +
                '<span class="input-group-btn">'+
                '<button type="button" class="btn btn-default">'+
                '<span class="glyphicon glyphicon-calendar"></span>'+
                '</button>' +
                '</span>' +
                '</div>';

        } else if(type == 'number'){

            if( typeAttr.vertical && typeAttr.vertical.value == 'yes'){

                html = '<div id="' + id + '_group" ' +
                    'class="input-group  bootstrap-touchspin ' + container_class + '" ' +
                    'style="' + attr.style.value +'">' +
                    '<input id="' + id + '_field" ' +
                    'type="text" ' +
                    'value="' + ((attr.property.value!='') ? '{'+attr.property.value+'}' : '' ) + '" ' +
                    'class="form-control ' + ((attr.classes.value) ? attr.classes.value : '') + '" />' +
                    '<span class="input-group-btn-vertical"><button class="btn btn-default bootstrap-touchspin-up" type="button" disabled="disabled"><i class="fa fa-chevron-up"></i></button><button class="btn btn-default bootstrap-touchspin-down" type="button" disabled="disabled"><i class="fa fa-chevron-down"></i></button></span>' +
                    '</div>';

            } else {

                html = '<div id="' + id + '_group" ' +
                    'class="input-group  bootstrap-touchspin ' + container_class + '" ' +
                    'style="' + attr.style.value +'">' +
                    '<span class="input-group-btn"><button class="btn btn-default bootstrap-touchspin-down" type="button" disabled="disabled"><i class="fa fa-minus"></i></button></span>' +
                    '<input id="' + id + '_field" ' +
                    'type="text" ' +
                    'value="' + ((attr.property.value!='') ? '{'+attr.property.value+'}' : '' ) + '" ' +
                    'class="form-control ' + ((attr.classes.value) ? attr.classes.value : '') + '" />' +
                    '<span class="input-group-btn"><button class="btn btn-default bootstrap-touchspin-up" type="button" disabled="disabled"><i class="fa fa-plus"></i></button></span>' +
                    '</div>';

            }

        } else if(type == 'amount'){

            html = '<div id="' + id + '_group" ' +
                'class="input-group ' + container_class + '" ' +
                'style="' + attr.style.value +'">' +
                '<span class="input-group-addon left-icon" style="'+((visibleLeftIcon) ? 'display:table-cell' : 'display:none')+'"><i class="glyphicon glyphicon-'+icon+'"></i></span>'+
                '<input id="' + id + '_field" type="text" ' +
                'class="form-control ' + ((attr.classes.value) ? attr.classes.value : '') + '" ' +
                'placeholder="' + attr.propertyByType.amount.placeholder.value + '" '+
                'value="' + ((attr.property.value!='') ? '{'+attr.property.value+'}' : '' ) + '" />' +
                '<span class="input-group-addon right-icon" style="'+((visibleRightIcon) ? 'display:table-cell' : 'display:none')+'"><i class="glyphicon glyphicon-'+icon+'"></i></span>'+
                '</div>';
        }
        return html;
    },
    "dynamicRenderDesign" : function(id){
        var type = $('#gc_inputfield_attr_type').val();
        var editor = ace.edit( 'dfx_src_editor' );
        var wgt_definition = JSON.parse( editor.getValue() );
        var gc_component_definition = DfxVisualBuilder.getComponentDefinition( id, wgt_definition.definition );
        var input_field = this.getInputTemplate(type, gc_component_definition.attributes, gc_component_definition.id);
        var idd = ( $('#'+id+'_group').length ) ? id+'_group' : id+'_field';
        $('#'+idd).replaceWith(input_field);
        this.showNeedType(type);
    },
    "showNeedType" : function(type){
        $('.gc_input_type').hide();
        $('#gc_input_'+type).show();
    }
};
