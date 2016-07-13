/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/* GC Web Number Field */

var gc_web_number_field = {
    "label": "Number Field",
    "category": "default",
    "createDefinition": function( component_id, container_id ) {
        return {
            id: component_id,
            type: "numberfield",
            attributes: {
                "name": { "value": "fldNumberField" },
                "property": { "value": "" },
                "propertyInit": { "value": "" },
                "display": { "value": "" },
                "label": { "value": "Label" },
                "labelVisible": { "value": true },
                "disabled": { "value": "" },
                "min": { "value": "" },
                "max": { "value": "" },
                "step": { "value": "" },
                "defaultValue": { "value": "" },
                "required": { "value": false },
                "error": {
                    "required": { "value": "" }
                },
                "style": { "value": "width:200px" },
                "classes": { "value": "" },
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
                "label": { "value": "Label" },
                "labelVisible": { "value": true },
                "disabled": { "value": "" },
                "min": { "value": "" },
                "max": { "value": "" },
                "step": { "value": "" },
                "defaultValue": { "value": "" },
                "required": { "value": false },
                "error": {
                    "required": { "value": "" }
                },
                "style": { "value": "width:200px" },
                "classes": { "value": "" },
                "onchange": { "value": "" }
            };
        }
        var instance_id = component.id;
        var fragment_html = '<div id="' + instance_id + '"  gc-role="control" gc-type="numberfield" class="dfx_visual_editor_draggable dfx_visual_editor_gc_draggable form-group">'
            + '<label id="' + instance_id + '_label" for="' + instance_id + '_field" style="display:'+(component.attributes.labelVisible.value ? 'block' :'none')+'">' + component.attributes.label.value +'</label>'
            + '<input id="' + instance_id + '_field" type="number" min="' + component.attributes.min.value + '" max="' + component.attributes.max.value + '" value="' + component.attributes.defaultValue.value + '"  class="form-control ' + ((component.attributes.classes.value) ? component.attributes.classes.value : '') + '" style="' + component.attributes.style.value +'" />'
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
            min = gc_component_definition.attributes.min ? gc_component_definition.attributes.min.value : "",
            max = gc_component_definition.attributes.max ? gc_component_definition.attributes.max.value : "",
            step = gc_component_definition.attributes.step ? gc_component_definition.attributes.step.value : "",
            defaultValue = gc_component_definition.attributes.defaultValue ? gc_component_definition.attributes.defaultValue.value : "",
            required = (gc_component_definition.attributes.required.value) ? 'yes' : 'no',
            error_required = gc_component_definition.attributes.error ? gc_component_definition.attributes.error.required.value : "",
            style = gc_component_definition.attributes.style ? gc_component_definition.attributes.style.value : "",
            classes = gc_component_definition.attributes.classes ? gc_component_definition.attributes.classes.value : "",
            onchange = gc_component_definition.attributes.onchange ? gc_component_definition.attributes.onchange.value : "";

        $( '#gc_numberfield_attr_id').val( id );
        $( '#gc_numberfield_attr_name').val( name );
        $( '#gc_numberfield_attr_property').val( property );
        $( '#gc_numberfield_attr_propertyInit').val( propertyInit );
        $( '#gc_numberfield_attr_display').val( display );
        $( '#gc_numberfield_attr_label').val( label ).focus();
        $( '#gc_numberfield_attr_labelVisible').val( labelVisible );
        $( '#gc_numberfield_attr_disabled').val( disabled  );
        $( '#gc_numberfield_attr_min').val( min );
        $( '#gc_numberfield_attr_max').val( max );
        $( '#gc_numberfield_attr_step').val( step );
        $( '#gc_numberfield_attr_defaultValue').val( defaultValue );
        $( '#gc_numberfield_attr_required').val( required );
        $( '#gc_numberfield_attr_error_required').val( error_required );
        $( '#gc_numberfield_attr_style').val( style );
        $( '#gc_numberfield_attr_classes').val( classes );
        $( '#gc_numberfield_attr_onchange').val( onchange );
    },
    "savePropertyPanel": function() {
        var id = $( '#gc_numberfield_attr_id').val(),
            name = $( '#gc_numberfield_attr_name').val(),
            property = $( '#gc_numberfield_attr_property').val(),
            propertyInit = $( '#gc_numberfield_attr_propertyInit').val(),
            display = $( '#gc_numberfield_attr_display').val(),
            label = $( '#gc_numberfield_attr_label').val(),
            labelVisible =  !!(($( '#gc_numberfield_attr_labelVisible').val() == "yes")),
            disabled = $( '#gc_numberfield_attr_disabled').val(),
            required = !!(($( '#gc_numberfield_attr_required').val() == "yes")),
            mmin = $( '#gc_numberfield_attr_min').val(),
            mmax = $( '#gc_numberfield_attr_max').val(),
            step = $( '#gc_numberfield_attr_step').val(),
            defaultValue = $( '#gc_numberfield_attr_defaultValue').val(),
            error_required = $( '#gc_numberfield_attr_error_required').val(),
            style = $( '#gc_numberfield_attr_style').val(),
            classes = $( '#gc_numberfield_attr_classes').val(),
            onchange = $( '#gc_numberfield_attr_onchange').val();

        $( '#'+id+ '_label' )
        .text( label)
        .css( 'display', (labelVisible ? 'block' : 'none') );

        $( '#'+id+ '_field')
        .attr( {'style': style, 'class': (classes == '' ? 'form-control': 'form-control '+classes)});

        var attributes = {
            "name": { "value": name },
            "property": { "value": property },
            "propertyInit": { "value": propertyInit },
            "display": { "value": display },
            "label": { "value": label },
            "labelVisible": { "value": labelVisible },
            "disabled": { "value": disabled },
            "min": { "value": mmin },
            "max": { "value": mmax },
            "step": { "value": step },
            "defaultValue": { "value": defaultValue },
            "required": { "value": required },
            "error": {
                "required": { "value": error_required }
            },
            "style": { "value": style },
            "classes": { "value": classes },
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