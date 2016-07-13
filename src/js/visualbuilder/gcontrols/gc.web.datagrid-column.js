/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/* GC Web Data Grid Column */

var gc_web_datagrid_column = {
    "label": "DataGrid Column",
    "subcontrol": true,
    "attributeDefinition": {
        "categories": [
            {"id": "main_props",
                "label": "Main Properties",
                "expanded": true,
                "properties": [
                    { "id": "header", "label": "Header:", "type": "value", "default": "Column", "propType": "input" },
                    { "id": "width", "label": "Width:", "type": "value", "default": "", "propType": "select", "selectOptions": "oneToTwelve" },
                    { "id": "property", "label": "Property:", "type": "value", "default": "", "propType": "input-picker", "picker": "bind" },
                    { "id": "type", "label": "Type:", "type": "value", "default": "", "propType": "select", "selectOptions": "gridColumnTypes", "change": "gc_web_datagrid_column.displayColumnTypeAttributes();" },
                    { "id": "html", "label": "HTML Content:", "type": "value", "default": "", "propType": "input-html" }
                ]
            },
            {"id": "component_props",
                "label": "Component CSS",
                "expanded": false,
                "properties": [
                    { "id": "classes", "label": "Classes:", "type": "value", "default": "", "propType": "input-picker", "picker": "class" },
                    { "id": "css", "type": "css", "propType": "input-css", "cssOptions": [ "width", "height", "color", "background", "padding", "margin", "text-align" ] },
                    { "id": "style", "label": "Custom CSS:", "type": "value", "default": "", "propType": "input" }
                ]
            },
            {"id": "event_props",
                "label": "Events",
                "expanded": false,
                "properties": [
                    { "id": "callbackFunction", "label": "On Click:", "type": "value", "default": "", "propType": "input-picker", "picker": "evt" }
                ]
            }
        ]
    },
    "displayColumnTypeAttributes": function() {
        var type = $('#gc_component_attr_type').val();

        if (type=='html') {
            $('#gc_component_attr_html').closest('div.form-group').css('display', 'block');
        } else {
            $('#gc_component_attr_html').closest('div.form-group').css('display', 'none');
        }

    },
    "renderDesign": function( gc_child_component_definition, component_id, child_index ) {

        var attributes;
        if (gc_child_component_definition==null) {
            attributes = gc_factory.getDefaultAttributes( gc_web_datagrid_column.attributeDefinition );
        } else {
            attributes = gc_factory.migrateAttributes( gc_web_datagrid_column.attributeDefinition, gc_child_component_definition );
        }

        var css = '';
        $.each(attributes.css, function(key, value) {
            if (value!='') {
                css += key + ':' + value + ';';
            }
        });

        var fragment_html = '<td class="col-md-'+attributes.width.value +
            '"><div id="'+component_id + '_col' + child_index + '" gc-control-id="'+component_id + '" class="gc_w_design_grid_' +
            attributes.type.value + '  col-lg-12 ' + attributes.classes.value + '" style="height:auto;min-height:35px;' + attributes.style.value + ';' + css + '" gc-role="control-child" gc-type="datagrid-column" gc-child-index="'+child_index+'">';
        if (attributes.type.value=='text') {
            fragment_html += attributes.property.value;
        } else if (attributes.type.value=='link') {
            fragment_html += '<a href="javascript:void(0);">' + attributes.property.value + '</a>';
        } else if (attributes.type.value=='image') {
            fragment_html += attributes.property.value;
        } else if (attributes.type.value=='html') {
            fragment_html += attributes.html.value;
        }

        fragment_html += '</div></td>';
        return fragment_html;
    },
    "loadPropertyPanel": function (gc_component_definition, gc_control_child_id) {
        var column_index = parseInt($('#'+gc_control_child_id).attr( 'gc-child-index' ));
        var column_def = gc_component_definition.attributes.gridColumns[column_index];

        $('#gc_datagridcol_attr_id').val( gc_component_definition.id );
        $('#gc_datagridcol_attr_index').val( column_index );

        gc_factory.generatePropertyPanel( gc_web_datagrid_column.attributeDefinition, { "attributes": column_def } );

        $('.dfx_visual_editor_property_input').change( function(e) {
            DfxVisualBuilder.propertyPanelChanged();
        });

        gc_web_datagrid_column.displayColumnTypeAttributes();
        CustomModal.init('html', ((column_def.html) ? column_def.html.value : ''));
    },
    "savePropertyPanel": function() {
        var id = $('#gc_datagridcol_attr_id').val(),
            column_index = $('#gc_datagridcol_attr_index').val();
        var i, fragment_html;
        var attributes = gc_factory.getPropertiesFromPanel( gc_web_datagrid_column.attributeDefinition );

        var editor = ace.edit( 'dfx_src_editor' );
        var wgt_definition = JSON.parse( editor.getValue() );

        var updated_gridColumns = DfxVisualBuilder.findChildComponentAndUpdateAttributes(id, 'gridColumns', column_index, wgt_definition.definition, attributes, false );

        editor.setValue( JSON.stringify( wgt_definition, null, '\t' ), 0 );
        editor.gotoLine(1);

        fragment_html = '<tr>';
        for (i=0; i<updated_gridColumns.length; i++) {
            fragment_html += '<th>' + updated_gridColumns[i].header.value + '</th>';
        }
        fragment_html += '</tr>';
        $('thead','#'+id+'_table').html(fragment_html);

        fragment_html = '<tr>';
        for (i=0; i<updated_gridColumns.length; i++) {
            fragment_html += gc_web_datagrid_column.renderDesign(updated_gridColumns[i], id, i);
        }
        fragment_html += '</tr>';
        $('tbody','#'+id+'_table').html(fragment_html);

        DfxVisualBuilder.initGraphicalControls();

        // re-select the component
        DfxVisualBuilder.initPropertyPanelChange();
        var el = $( '#'+id+'_col'+column_index );
        DfxVisualBuilder.updateSelectedBox(el);

    },
    "removeComponent": function (component_id, child_index, parent_definition) {
        var  i, fragment_html;
        var updated_definition = DfxVisualBuilder.findChildComponentAndRemoveComponent( component_id, 'gridColumns', child_index, parent_definition, false );
        DfxVisualBuilder.findComponentAndUpdateAttributes( component_id, parent_definition, updated_definition.attributes, false );

        fragment_html = '<tr>';
        for (i=0; i<updated_definition.attributes.gridColumns.length; i++) {
            fragment_html += '<th>' + updated_definition.attributes.gridColumns[i].header.value + '</th>';
        }
        fragment_html += '</tr>';
        $('thead','#'+component_id+'_table').html(fragment_html);

        fragment_html = '<tr>';
        for (i=0; i<updated_definition.attributes.gridColumns.length; i++) {
            fragment_html += gc_web_datagrid_column.renderDesign(updated_definition.attributes.gridColumns[i], component_id, i);
        }
        fragment_html += '</tr>';
        $('tbody','#'+component_id+'_table').html(fragment_html);

        DfxVisualBuilder.initGraphicalControls();
    },
    "typeChanged": function () {
        var type = $('#gc_datagridcol_attr_type').val();
        if (type=='link' || type=='image') {
            $('#tr_callbackFunction').css( 'display', 'table-row' );
        } else {
            $('#tr_callbackFunction').css( 'display', 'none' );
        }
    }
}