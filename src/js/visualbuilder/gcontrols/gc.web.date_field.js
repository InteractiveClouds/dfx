/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/* GC Web Input Field */

var gc_web_date_field = {
    "label": "Date Field",
    "category": "default",
    "createDefinition": function( component_id, container_id ) {
        return {
            id: component_id,
            type: "datefield",
            attributes: {
                "name": { "value": "fldDateField" },
                "property": { "value": "" },
                "propertyInit": { "value": "" },
                "label": { "value": "Label" },
                "labelVisible": { "value": true },
                "display": { "value": "" },
                "disabled": { "value": "" },
                "required": { "value": false },
                "error": {
                    "date": { "value": "" }
                },
                "format": { "value": "" },
                "mindate": { "value": "" },
                "maxdate": { "value": "" },
                "classes": { "value": "" },
                "style": { "value": "width:200px;" },
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
                "label": { "value": "Label" },
                "labelVisible": { "value": true },
                "display": { "value": "" },
                "disabled": { "value": "" },
                "required": { "value": false },
                "error": {
                    "date": { "value": "" }
                },
                "format": { "value": "" },
                "mindate": { "value": "" },
                "maxdate": { "value": "" },
                "classes": { "value": "" },
                "style": { "value": "width:200px;" },
                "onchange": { "value": "" }
            };
        }
        var instance_id = component.id;
        var fragment_html = '<div id="' + instance_id + '"  gc-role="control" gc-type="datefield" class="dfx_visual_editor_draggable dfx_visual_editor_gc_draggable form-group">'
            + '<label id="' + instance_id + '_label" for="' + instance_id + '_field" style="display:'+(component.attributes.labelVisible.value ? 'block' :'none')+'">' + component.attributes.label.value +'</label>'
            + '<div id="' + instance_id + '_group" class="input-group ' + ((component.attributes.classes) ? component.attributes.classes.value : '') + '" style="' + component.attributes.style.value +'">'
            + '<input id="' + instance_id + '_field" type="text"'
            + ' class="form-control" />'
            + '<span class="input-group-btn">'
            + '<button type="button" class="btn btn-default">'
            + '<span class="glyphicon glyphicon-calendar"></span>'
            + '</button></span>'
            + '</div></div>';

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
            error_date = gc_component_definition.attributes.error ? gc_component_definition.attributes.error.date.value : "",
            format = gc_component_definition.attributes.format ? gc_component_definition.attributes.format.value : "",
            mindate = gc_component_definition.attributes.mindate ? gc_component_definition.attributes.mindate.value : "",
            maxdate = gc_component_definition.attributes.maxdate ? gc_component_definition.attributes.maxdate.value : "",
            classes = gc_component_definition.attributes.classes ? gc_component_definition.attributes.classes.value : "",
            nstyle = gc_component_definition.attributes.style ? gc_component_definition.attributes.style.value : "",
            onchnge = gc_component_definition.attributes.onchange ? gc_component_definition.attributes.onchange.value : "";

        $( '#gc_datefield_attr_id').val( id );
        $( '#gc_datefield_attr_name').val( name );
        $( '#gc_datefield_attr_property').val( property );
        $( '#gc_datefield_attr_propertyInit').val( propertyInit );
        $( '#gc_datefield_attr_display').val( display );
        $( '#gc_datefield_attr_label').val( label ).focus();
        $( '#gc_datefield_attr_labelVisible').val( labelVisible );
        $( '#gc_datefield_attr_disabled').val( disabled  );
        $( '#gc_datefield_attr_required').val( required );
        $( '#gc_datefield_attr_error_date').val( error_date );
        $( '#gc_datefield_attr_format').val( format );
        $( '#gc_datefield_attr_mindate').val( mindate );
        $( '#gc_datefield_attr_maxdate').val( maxdate );
        $( '#gc_datefield_attr_classes').val( classes );
        $( '#gc_datefield_attr_style').val( nstyle );
        $( '#gc_datefield_attr_onchange').val( onchnge );
    },
    "savePropertyPanel": function() {
        var id = $( '#gc_datefield_attr_id').val(),
            name = $( '#gc_datefield_attr_name').val(),
            property = $( '#gc_datefield_attr_property').val(),
            propertyInit = $( '#gc_datefield_attr_propertyInit').val(),
            display = $( '#gc_datefield_attr_display').val(),
            label = $( '#gc_datefield_attr_label').val(),
            labelVisible =  !!(($( '#gc_datefield_attr_labelVisible').val() == "yes")),
            disabled = $( '#gc_datefield_attr_disabled').val(),
            required = !!(($( '#gc_datefield_attr_required').val() == "yes")),
            error_date = $( '#gc_datefield_attr_error_date').val(),
            format = $( '#gc_datefield_attr_format').val(),
            mindate = $( '#gc_datefield_attr_mindate').val(),
            maxdate = $( '#gc_datefield_attr_maxdate').val(),
            classes = $( '#gc_datefield_attr_classes').val(),
            style = $( '#gc_datefield_attr_style').val(),
            onchange = $( '#gc_datefield_attr_onchange').val();

        $( '#'+id+ '_label' )
        .text( label)
        .css( 'display', (labelVisible ? 'block' : 'none') );

        $( '#'+id+ '_field')
        .val( (property != '') ? '{' + property + '}' : '');

        $( '#'+id+ '_group')
        .attr( {'style': style, 'class': (classes == '' ? 'input-group': 'input-group '+classes)});

        var attributes = {
            "name": { "value": name },
            "property": { "value": property },
            "propertyInit": { "value": propertyInit },
            "label": { "value": label },
            "labelVisible": { "value": labelVisible },
            "display": { "value": display },
            "disabled": { "value": disabled },
            "required": { "value": required },
            "error": {
                "date": { "value": error_date }
            },
            "format": { "value": format },
            "mindate": { "value": mindate },
            "maxdate": { "value": maxdate },
            "classes": { "value": classes },
            "style": { "value": style },
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