/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/* GC Web Amount Field */

var gc_web_amount_field = {
    "label": "Amount Field",
    "category": "default",
    "createDefinition": function( component_id, container_id ) {
        return {
            id: component_id,
            type: "amountfield",
            attributes: {
                "name": { "value": "fldAmountField" },
                "property": { "value": "" },
                "propertyInit": { "value": "" },
                "display": { "value": "" },
                "label": { "value": "Label" },
                "labelVisible": { "value": true },
                "disabled": { "value": "" },
                "required": { "value": false },
                "groupsep": { "value": "" },
                "decsep": { "value": "" },
                "digits": { "value": "" },
                "minlength": { "value": "" },
                "maxlength": { "value": "" },
                "pattern": { "value": "" },
                "error": {
                    "required": { "value": "" },
                    "minlength": { "value": "" },
                    "maxlength": { "value": "" },
                    "pattern": { "value": "" }
                },
                "placeholder": { "value": "" },
                "style": { "value": "width:200px" },
                "classes": { "value": "" },
                "mask": { "value": "decimal" },
                "onchange": { "value": "" }
            },
            children: [],
            container: container_id
        };
    },
    "renderDesign": function( component ) {
        if (!component.attributes) {
            component.attributes = {
                "name": { "value": "" },
                "property": { "value": "" },
                "propertyInit": { "value": "" },
                "display": { "value": "" },
                "label": {"value": "Label"},
                "labelVisible": { "value": true },
                "disabled": { "value": "" },
                "required": { "value": false },
                "groupsep": { "value": "" },
                "decsep": { "value": "" },
                "digits": { "value": "" },
                "minlength": { "value": "" },
                "maxlength": { "value": "" },
                "pattern": { "value": "" },
                "error": {
                    "required": { "value": "" },
                    "minlength": { "value": "" },
                    "maxlength": { "value": "" },
                    "pattern": { "value": "" }
                },
                "placeholder": { "value": "" },
                "style": { "value": "width:200px" },
                "classes": { "value": "" },
                "mask": { "value": "decimal" },
                "onchange": { "value": "" }
            };
        }
        var instance_id = component.id;
        var fragment_html = '<div id="' + instance_id + '"  gc-role="control" gc-type="amountfield" class="dfx_visual_editor_draggable dfx_visual_editor_gc_draggable form-group">'
            + '<label id="' + instance_id + '_label" for="' + instance_id + '_field" style="display:'+(component.attributes.labelVisible.value ? 'block' :'none')+'">' + component.attributes.label.value +'</label>'
            + '<input id="' + instance_id + '_field" type="text" class="form-control ' + ((component.attributes.classes.value) ? component.attributes.classes.value : '') + '"'
            + ' style="' + component.attributes.style.value + '"'
            + ' placeholder="' + component.attributes.placeholder.value + '"'
            + ' value="' + ((component.attributes.property.value!='') ? '{'+component.attributes.property.value+'}' : '' ) + '"'
            + ' />'
            + '</div>';
        var component_instance = {
            "id": instance_id,
            "fragment": fragment_html
        };
        return component_instance;
    },
    "loadPropertyPanel": function(gc_component_definition) {
        var id = gc_component_definition.id,
            name = gc_component_definition.attributes.name.value,
            property = gc_component_definition.attributes.property ? gc_component_definition.attributes.property.value : "",
            propertyInit = gc_component_definition.attributes.propertyInit ? gc_component_definition.attributes.propertyInit.value : "",
            display = gc_component_definition.attributes.display ? gc_component_definition.attributes.display.value : "",
            label = gc_component_definition.attributes.label.value,
            labelVisible = (gc_component_definition.attributes.labelVisible.value) ? 'yes' : 'no',
            disabled = gc_component_definition.attributes.disabled ? gc_component_definition.attributes.disabled.value : "",
            required = (gc_component_definition.attributes.required.value) ? 'yes' : 'no',
            groupsep = gc_component_definition.attributes.groupsep ? gc_component_definition.attributes.groupsep.value : "",
            decsep = gc_component_definition.attributes.decsep ? gc_component_definition.attributes.decsep.value : "",
            digits = gc_component_definition.attributes.digits ? gc_component_definition.attributes.digits.value : "",
            minlength = gc_component_definition.attributes.minlength ? gc_component_definition.attributes.minlength.value : "",
            maxlength = gc_component_definition.attributes.maxlength ? gc_component_definition.attributes.maxlength.value : "",
            pattern = gc_component_definition.attributes.pattern ? gc_component_definition.attributes.pattern.value : "",
            error_required = gc_component_definition.attributes.error ? gc_component_definition.attributes.error.required.value : "",
            error_minlength = gc_component_definition.attributes.error ? gc_component_definition.attributes.error.minlength.value : "",
            error_maxlength = gc_component_definition.attributes.error ? gc_component_definition.attributes.error.maxlength.value : "",
            error_pattern = gc_component_definition.attributes.error ? gc_component_definition.attributes.error.pattern.value : "",
            placeholder = gc_component_definition.attributes.placeholder ? gc_component_definition.attributes.placeholder.value : "",
            style = gc_component_definition.attributes.style ? gc_component_definition.attributes.style.value : "",
            classes = gc_component_definition.attributes.classes ? gc_component_definition.attributes.classes.value : "",
            //mask =  gc_component_definition.attributes.mask ? gc_component_definition.attributes.mask.value : "",
            onchange = gc_component_definition.attributes.onchange ? gc_component_definition.attributes.onchange.value : "";

        $( '#gc_amountfield_attr_id').val( id );
        $( '#gc_amountfield_attr_name').val( name );
        $( '#gc_amountfield_attr_property').val( property );
        $( '#gc_amountfield_attr_propertyInit').val( propertyInit );
        $( '#gc_amountfield_attr_display').val( display );
        $( '#gc_amountfield_attr_label').val( label ).focus();
        $( '#gc_amountfield_attr_labelVisible').val( labelVisible );
        $( '#gc_amountfield_attr_disabled').val( disabled  );
        $( '#gc_amountfield_attr_required').val( required );
        $( '#gc_amountfield_attr_groupsep').val( groupsep );
        $( '#gc_amountfield_attr_decsep').val( decsep );
        $( '#gc_amountfield_attr_digits').val( digits );
        $( '#gc_amountfield_attr_minlength').val( minlength );
        $( '#gc_amountfield_attr_maxlength').val( maxlength );
        $( '#gc_amountfield_attr_pattern').val( pattern );
        $( '#gc_amountfield_attr_error_required').val( error_required );
        $( '#gc_amountfield_attr_error_minlength').val( error_minlength );
        $( '#gc_amountfield_attr_error_maxlength').val( error_maxlength );
        $( '#gc_amountfield_attr_error_pattern').val( error_pattern );
        $( '#gc_amountfield_attr_style').val( style );
        $( '#gc_amountfield_attr_classes').val( classes );
        $( '#gc_amountfield_attr_placeholder').val( placeholder );
        //$( '#gc_amountfield_attr_mask').val( mask );
        $( '#gc_amountfield_attr_onchange').val( onchange );

    },
    "savePropertyPanel": function() {
        var id = $( '#gc_amountfield_attr_id').val(),
            name = $( '#gc_amountfield_attr_name').val(),
            property = $( '#gc_amountfield_attr_property').val(),
            propertyInit = $( '#gc_amountfield_attr_propertyInit').val(),
            display = $( '#gc_amountfield_attr_display').val(),
            label = $( '#gc_amountfield_attr_label').val(),
            labelVisible =  !!(($( '#gc_amountfield_attr_labelVisible').val() == "yes")),
            disabled = $( '#gc_amountfield_attr_disabled').val(),
            required = !!(($( '#gc_amountfield_attr_required').val() == "yes")),
            groupsep = $( '#gc_amountfield_attr_groupsep').val(),
            decsep = $( '#gc_amountfield_attr_decsep').val(),
            digits = $( '#gc_amountfield_attr_digits').val(),
            minlength = $( '#gc_amountfield_attr_minlength').val(),
            maxlength = $( '#gc_amountfield_attr_maxlength').val(),
            pattern = $( '#gc_amountfield_attr_pattern').val(),
            error_required = $( '#gc_amountfield_attr_error_required').val(),
            error_minlength = $( '#gc_amountfield_attr_error_minlength').val(),
            error_maxlength = $( '#gc_amountfield_attr_error_maxlength').val(),
            error_pattern = $( '#gc_amountfield_attr_error_pattern').val(),
            placeholder = $( '#gc_amountfield_attr_placeholder').val(),
            style = $( '#gc_amountfield_attr_style').val(),
            classes = $( '#gc_amountfield_attr_classes').val(),
            onchange = $( '#gc_amountfield_attr_onchange').val();

        $( '#'+id+ '_label' )
        .text( label)
        .css( 'display', (labelVisible ? 'block' : 'none') );

        $( '#'+id+ '_field')
        .val( (property != '') ? '{' + property + '}' : '')
        .attr( {'style': style, 'placeholder': placeholder, 'class': (classes == '' ? 'form-control': 'form-control '+classes)});

        var attributes = {
            "name": { "value": name },
            "property": { "value": property },
            "propertyInit": { "value": propertyInit },
            "display": { "value": display },
            "label": { "value": label },
            "labelVisible": { "value": labelVisible },
            "disabled": { "value": disabled },
            "required": { "value": required },
            "groupsep": { "value": groupsep },
            "decsep": { "value": decsep },
            "digits": { "value": digits },
            "minlength": { "value": minlength },
            "maxlength": { "value": maxlength },
            "pattern": { "value": pattern },
            "error": {
                "required": { "value": error_required },
                "minlength": { "value": error_minlength },
                "maxlength": { "value": error_maxlength },
                "pattern": { "value": error_pattern }
            },
            "placeholder": { "value": placeholder },
            "style": { "value": style },
            "classes": { "value": classes },
            "mask": { "value": "decimal"  },
            "onchange": { "value": onchange }
        };

        var editor = ace.edit( 'dfx_src_editor' );
        var wgt_definition = JSON.parse( editor.getValue() );

        DfxVisualBuilder.findComponentAndUpdateAttributes( id, wgt_definition.definition, attributes, false );

        editor.setValue( JSON.stringify( wgt_definition, null, '\t' ), 0 );
        editor.gotoLine(1);

        $( '#'+id).click();
    }
}