/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/* GC Mobile Layout */

var gc_mobile_layout = {
    "label": "Layout",
    "category": "default",
    "subcontrol": true,
    "createDefinition": function( component_id, container_id ) {
        return {
            id: component_id,
            type: "layout",
            attributes: {
                rows: [{
                    classes: {value: ''},
                    dynamicClasses: {value: ''},
                    style: {value: ''}
                }]
            },
            children: [],
            container: container_id
        };
    },
    "renderDesign": function( component_attributes, container_id, child_index ) {
        var i;
        if (!component_attributes) {
            component_attributes = {
                rows: [{
                    classes: {value: ''},
                    dynamicClasses: {value: ''},
                    style: {value: ''}
                }]
            };
        }
        var fragment_html = '<div id="' + container_id + '_layout_'+child_index+'" gc-control-id="'+container_id + '" gc-role="control-child" gc-type="layout" gc-child-index="'+child_index+'"'
            + ' class="" style="min-height:10px;height:auto;">';

        for (i=0; i<component_attributes.rows.length; i++) {
            fragment_html += gc_mobile_layout_row.renderDesign(component_attributes.rows[i], container_id, i, child_index);
        }

        fragment_html += '</div>';

        return fragment_html;
    },
    "loadPropertyPanel": function(gc_component_definition, gc_control_child_id) {
        var i, j, fragment_html='';
        var layout_definition;
        var layoutIndex = 0;

        if (gc_component_definition.attributes.layoutElements) {
            layoutIndex = $('#'+gc_control_child_id).attr( 'gc-child-index' );
            layout_definition = gc_component_definition.attributes.layoutElements[layoutIndex].layout;
        } else {
            layout_definition = gc_component_definition.attributes.layout;
        }


        $( '#gc_layout_attr_id').val( gc_component_definition.id+'_layout_'+layoutIndex );
        $( '#layout_container_link' ).text(gc_component_definition.type.charAt(0).toUpperCase() + gc_component_definition.type.slice(1));
        $( '#layout_container_link' ).attr( 'layout-container-id', gc_component_definition.id );
        $( '#layout_container_link' ).click( function() {
            var layout_container_id = $(this).attr('layout-container-id');
            $( '#'+layout_container_id).click();
        });

        for (i=0; i<layout_definition.rows.length; i++) {
            fragment_html += '<div class="row" style="padding:0px">';
            fragment_html += '<div class="thirteen wide column" style="padding:0;border:3px #008cba solid;';
            if (i>0) {
                fragment_html += 'border-top:0px;';
            }
            fragment_html += 'background: #c6c9ce"><div class="ui grid" style="margin:0px">';
            for (j=0; j<layout_definition.rows[i].cols.length; j++) {
                /*fragment_html += '<div class="col-md-'
                    + (parseInt(layout_definition.rows[i].cols[j].width.value))*/
                fragment_html += '<div class="sixteen wide column '
                    + ' text-center" style="cursor:pointer;border:1px #000 solid;';
                if (j>0) {
                    fragment_html += 'border-left:0px;';
                }
                fragment_html += 'color:#fff;line-height:12px;padding:8px;background: #8BC9FC"';
                fragment_html +=' layout-column-id="'+gc_component_definition.id+'_layout_'+layoutIndex+'_row_'+i+'_column_'+j+'">';
                fragment_html += (parseInt(layout_definition.rows[i].cols[j].width.value));
                fragment_html += '</div>';
            }
            fragment_html += '</div></div>';
            fragment_html += '<div class="two wide column">';
            fragment_html += '<a href="javascript:void(0);"';
            fragment_html += ' layout-row-id="'+gc_component_definition.id+'_layout_'+layoutIndex+'_row_'+i+'"';
            fragment_html += ' class="pull-left"><span class="fa fa-edit"></span></a>';
            fragment_html += '</div>';
            fragment_html += '</div>';
        }
        fragment_html += '<div class="row"><div class="sixteen wide column"><a id="layout_manager_add_row" href="javascript:void(0);" container-id="'+gc_component_definition.id+'"><span class="fa fa-plus-circle" style="margin-right: 5px"></span>Add row</a></div></div>';
        $( '#layout_manager' ).html(fragment_html);
        $('a[layout-row-id]').click( function() {
            var layout_row_id = $(this).attr('layout-row-id');
            $( '#'+layout_row_id).click();
        });
        $('div[layout-column-id]').click( function() {
            var layout_column_id = $(this).attr('layout-column-id');
            $( '#'+layout_column_id).click();
        });
        $('#layout_manager_add_row').click( function() {
            var container_id = $(this).attr('container-id');
            gc_mobile_layout.addRow(container_id);
        });
    },
    "savePropertyPanel": function() {
        var id = $( '#gc_layout_attr_id').val();

        var el = $( '#'+id+'_layout' );

        // re-select the component
        el.click();
    },
    "removeComponent": function() {
        // do nothing
    },
    "addRow": function (container_id) {
        var layout_id = $( '#gc_layout_attr_id').val();
        var editor = ace.edit( 'dfx_src_editor' );
        var wgt_definition = JSON.parse( editor.getValue() );

        var container = DfxVisualBuilder.getComponentDefinition( container_id, wgt_definition );

        var container_object = $('#'+container_id);
        var parent_id = $(container_object).parent().closest('[gc-role=control]').attr('id');
        var parent_def = (parent_id==null) ? null : {"id": parent_id };

        var layout_definition;
        var layoutIndex = 0;

        if (container.attributes.layoutElements) {
            layoutIndex = $('#'+layout_id).attr( 'gc-child-index' );
            layout_definition = container.attributes.layoutElements[layoutIndex].layout;
        } else {
            layout_definition = container.attributes.layout;
        }

        var rows = layout_definition.rows;

        rows.push({cols: [{
            width: {value: '12'},
            orientation: {value: 'vertical'},
            alignment: {value: 'start'},
            disposition: {value: 'space_around'},
            classes: {value: ''},
            dynamicClasses: {value: ''},
            style: {value: ''}
        }],
            classes: {value: ''},
            dynamicClasses: {value: ''},
            style: {value: ''}
        });

        editor.setValue( JSON.stringify( wgt_definition, null, '\t' ), 0 );
        editor.gotoLine(1);

        $('#' + container_id).remove();
        DfxVisualBuilder.addComponents([container], parent_def);
        DfxVisualBuilder.initGraphicalControls();
        // re-select the layout
        var el = $('#'+container_id+'_layout_'+layoutIndex);
        DfxVisualBuilder.updateSelectedBox(el);
    }
};
