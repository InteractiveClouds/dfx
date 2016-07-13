/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/* GC Web Layout Row */

var gc_web_layout_row = {
    "label": "Layout Row",
    "category": "default",
    "subcontrol": true,
    "renderDesign": function( component_attributes, container_id, index_child, layout_index_child ) {
        var i;

        if (layout_index_child==null) {
            layout_index_child = 0;
        }

        if (!component_attributes) {
            component_attributes = {
                cols: [],
                classes: {value: ''},
                dynamicClasses: {value: ''},
                style: {value: ''},
                css: {
                    "height": "",
                    "color": "",
                    "background": ""
                }
            };
        }

        /* For Migration Only, must be removed in the next release */
        if (!component_attributes.css) {
            component_attributes.css = {
                "height": "",
                "color": "",
                "background": ""
            };
        }
        /* End: Migration */

        var rowCss = '';
        $.each(component_attributes.css, function(key, value) {
            if (value!='') {
                rowCss += key + ':' + value + ';';
            }
        });

        var fragment_html = '<div id="' + container_id + '_layout_'+layout_index_child+'_row_'+index_child+'"  gc-control-id="'+container_id + '" gc-role="control-child" gc-type="layout-row" gc-child-index="'+index_child+'" class="'
            + component_attributes.classes.value + ' row"'
            + ' style="min-height:30px;height:auto;margin:0;' + rowCss + ((component_attributes.style) ? component_attributes.style.value : '') +'">';

        for (i=0; i<component_attributes.cols.length; i++) {
            fragment_html += gc_web_layout_column.renderDesign(component_attributes.cols[i], container_id, index_child, i, layout_index_child);
        }

        fragment_html += '</div>';

        return fragment_html;
    },
    "loadPropertyPanel": function(gc_component_definition, gc_control_child_id) {
        var i, fragment_html='';
        var row_index = parseInt($('#'+gc_control_child_id).attr( 'gc-child-index' ));
        var row_definition;
        var layoutIndex = 0;

        if (gc_component_definition.attributes.layoutElements) {
            layoutIndex = $('#'+gc_control_child_id).parent().attr( 'gc-child-index' );
            row_definition = gc_component_definition.attributes.layoutElements[layoutIndex].layout.rows[row_index];
        } else {
            row_definition = gc_component_definition.attributes.layout.rows[row_index];
        }

        /* For Migration Only, must be removed in the next release */
        if (!row_definition.css) {
            row_definition.css = {
                "height": "",
                "color": "",
                "background": ""
            };
        }
        /* End: Migration */

        $( '#gc_layout_row_attr_layout_index').val( layoutIndex );
        $( '#gc_layout_row_attr_container_id').val( gc_component_definition.id );
        $( '#gc_layout_row_attr_index').val( row_index );
        $( '#gc_layout_row_attr_classes').val( row_definition.classes.value );
        $( '#gc_layout_row_attr_style').val( row_definition.style.value );
        $( '#gc_layout_row_attr_dynamicClasses').val( row_definition.dynamicClasses ? row_definition.dynamicClasses.value : '' );

        $( '#gc_layout_row_attr_css_height').val( row_definition.css.height );
        $( '#gc_layout_row_attr_css_color').val( row_definition.css.color );
        $( '#gc_layout_row_attr_css_background').val( row_definition.css.background );

        $( '#layout_container_link' ).text(gc_component_definition.type.charAt(0).toUpperCase() + gc_component_definition.type.slice(1));
        $( '#layout_container_link' ).attr( 'layout-container-id', gc_component_definition.id );
        $( '#layout_container_link' ).click( function() {
            var layout_container_id = $(this).attr('layout-container-id');
            $( '#'+layout_container_id).click();
        });
        $( '#layout_link' ).attr( 'layout-id', gc_component_definition.id+'_layout_'+layoutIndex );
        $( '#layout_link' ).click( function() {
            var layout_id = $(this).attr('layout-id');
            $( '#'+layout_id).click();
        });

        fragment_html += '<div class="row">';
        fragment_html += '<div class="col-md-10" style="padding:0;border:3px #008cba solid;';
        if (i>0) {
            fragment_html += 'border-top:0px;';
        }
        fragment_html += 'background: #c6c9ce">';
        for (i=0; i<row_definition.cols.length; i++) {
            fragment_html += '<div class="col-md-'
                + (parseInt(row_definition.cols[i].width.value))
                + ' text-center" style="cursor:pointer;border:1px #000 solid;';
            if (i>0) {
                fragment_html += 'border-left:0px;';
            }
            fragment_html += 'color:#fff;height:20px;background: #8BC9FC"';
            fragment_html +=' layout-column-id="'+gc_component_definition.id+'_layout_'+layoutIndex+'_row_'+row_index+'_column_'+i+'">';
            fragment_html += (parseInt(row_definition.cols[i].width.value));
            fragment_html += '</div>';
        }
        fragment_html += '</div>';
        fragment_html += '<div class="col-md-2">';
        fragment_html += '</div>';
        fragment_html += '</div>';
        fragment_html += '<div class="row"><a id="layout_manager_add_column" href="javascript:void(0);" container-id="'+gc_component_definition.id+'" row-index="'+row_index+'"><span class="fa fa-plus-circle" style="margin-right: 5px"></span>Add Column</a></div>';
        $( '#layout_manager' ).html(fragment_html);
        $('div[layout-column-id]').click( function() {
            var layout_column_id = $(this).attr('layout-column-id');
            $( '#'+layout_column_id).click();
        });
        $('#layout_manager_add_column').click( function() {
            var container_id = $(this).attr('container-id');
            var row_index = $(this).attr('row-index');
            gc_web_layout_row.addColumn(container_id, row_index);
        });

        $('#layoutRowColorPicker').colorpicker({'container':'#layoutRowColorPicker'});
        $('#layoutRowBgcolorPicker').colorpicker({'container':'#layoutRowBgcolorPicker'});

        $('.dfx_visual_editor_property_input').change( function() {
            DfxVisualBuilder.propertyPanelChanged();
        });
    },
    "savePropertyPanel": function() {

        var container_id = $( '#gc_layout_row_attr_container_id').val(),
            row_index = parseInt($( '#gc_layout_row_attr_index').val()),
            classes = $( '#gc_layout_row_attr_classes').val(),
            style = $( '#gc_layout_row_attr_style').val(),
            dynClasses = $( '#gc_layout_row_attr_dynamicClasses').val();

        var css_height =  $( '#gc_layout_row_attr_css_height').val();
        var css_color =  $( '#gc_layout_row_attr_css_color').val();
        var css_background =  $( '#gc_layout_row_attr_css_background').val();

        var attributes = {
            "classes": { "value": classes },
            "dynamicClasses": { "value": dynClasses },
            "style": { "value": style },
            "css": {
                "height": css_height,
                "color": css_color,
                "background": css_background
            }
        };

        var rowCss = '';
        $.each(attributes.css, function(key, value) {
            if (value!='') {
                rowCss += key + ':' + value + ';';
            }
        });

        var el = $( '#'+container_id+'_layout_row_'+row_index );
        el.attr({'class': 'row '+classes, 'style': style + ';min-height:30px;height:auto;margin:0;' + rowCss});

        var editor = ace.edit( 'dfx_src_editor' );
        var wgt_definition = JSON.parse( editor.getValue() );

        var container = DfxVisualBuilder.getComponentDefinition( container_id, wgt_definition );
        attributes.cols = container.attributes.layout.rows[row_index].cols;
        container.attributes.layout.rows[row_index] = attributes;

        editor.setValue( JSON.stringify( wgt_definition, null, '\t' ), 0 );
        editor.gotoLine(1);

        // re-select the component
        DfxVisualBuilder.initPropertyPanelChange();
        DfxVisualBuilder.updateSelectedBox(el);
    },
    "removeComponent": function (container_id, row_index, parent_definition) {
        var container = DfxVisualBuilder.getComponentDefinition( container_id, parent_definition );

        var layout_definition;
        var layoutIndex = $( '#gc_layout_row_attr_layout_index').val();

        if (container.attributes.layoutElements) {
            layout_definition = container.attributes.layoutElements[layoutIndex].layout;
        } else {
            layout_definition = container.attributes.layout;
        }

        var rows = layout_definition.rows;
        row_index = parseInt(row_index);

        var container_object = $('#'+container_id);
        var parent_id = $(container_object).parent().closest('[gc-role=control]').attr('id');
        var parent_object_def = (parent_id==null) ? null : {"id": parent_id };

        if (row_index>0 || rows.length>1) {
            gc_web_layout_row.updateChildPosition(container, row_index, layoutIndex);
            rows.splice(row_index, 1);

            $('#' + container_id).remove();
            DfxVisualBuilder.addComponents([container], parent_object_def);
            DfxVisualBuilder.initGraphicalControls();
        }
    },
    "updateChildPosition": function (container, row_index, layout_index) {
        var i;
        row_index = parseInt(row_index);
        var layout = (container.attributes.layoutElements) ? container.attributes.layoutElements[layout_index].layout : container.attributes.layout;
        for (i=0; i<container.children.length; i++) {
            if (container.children[i].container.indexOf('layout_'+layout_index+'_row_'+row_index+'_')>-1) {
                var col_index_pos = container.children[i].container.indexOf( '_column_' ) + 8;
                var col_index = parseInt(container.children[i].container.substr( col_index_pos ));
                if (row_index==0) {
                    if (col_index<layout.rows[row_index+1].cols.length) {
                        container.children[i].container = 'layout_'+layout_index+'_row_' + (row_index + 1) + '_column_' + (col_index);
                    } else {
                        container.children[i].container = 'layout_'+layout_index+'_row_' + (row_index + 1) + '_column_' + (layout.rows[row_index+1].cols.length-1);
                    }
                } else {
                    if (col_index<layout.rows[row_index-1].cols.length) {
                        container.children[i].container = 'layout_'+layout_index+'_row_' + (row_index - 1) + '_column_' + (col_index);
                    } else {
                        container.children[i].container = 'layout_'+layout_index+'_row_' + (row_index - 1) + '_column_' + (layout.rows[row_index-1].cols.length-1);
                    }
                }
            }
        }
        if (row_index<(layout.rows.length-1)) {
            for (i=0; i<container.children.length; i++) {
                var row_pos = container.children[i].container.indexOf('row_')+4;
                var col_pos = container.children[i].container.indexOf('_column');
                var container_row = parseInt(container.children[i].container.substring(row_pos, col_pos));
                if (row_index<container_row) {
                    container.children[i].container = 'layout_'+layout_index+'_row_' + (container_row - 1) + container.children[i].container.substr(col_pos);
                }
            }
        }
    },
    "addColumn": function (container_id, row_index) {
        var i, new_width, col_added = false;
        var editor = ace.edit( 'dfx_src_editor' );
        var wgt_definition = JSON.parse( editor.getValue() );

        row_index = parseInt(row_index);

        var container = DfxVisualBuilder.getComponentDefinition( container_id, wgt_definition );

        var layout_definition;
        var layoutIndex = $( '#gc_layout_row_attr_layout_index').val();

        if (container.attributes.layoutElements) {
            layout_definition = container.attributes.layoutElements[layoutIndex].layout;
        } else {
            layout_definition = container.attributes.layout;
        }

        var container_object = $('#'+container_id);
        var parent_id = $(container_object).parent().closest('[gc-role=control]').attr('id');
        var parent_def = (parent_id==null) ? null : {"id": parent_id };

        var cols = layout_definition.rows[row_index].cols;
        var last_col_width = parseInt(cols[cols.length-1].width.value);
        if (cols.length>1) {
            for (i=(cols.length-1); i>=0; i--) {
                last_col_width = parseInt(cols[i].width.value);
                if (last_col_width >= 4) {
                    new_width = (last_col_width - 2)
                    cols[i].width.value = new_width;
                    cols.push( {
                        width: {value: '2'},
                        orientation: {value: 'vertical'},
                        alignment: {value: 'start'},
                        disposition: {value: 'space_around'},
                        classes: {value: ''},
                        dynamicClasses: {value: ''},
                        style: {value: ''}
                    });
                    col_added = true;
                    break;
                }
            }
        } else {
            cols[0].width.value = '6';
            cols.push( {
                width: {value: '6'},
                orientation: {value: 'vertical'},
                alignment: {value: 'start'},
                disposition: {value: 'space_around'},
                classes: {value: ''},
                dynamicClasses: {value: ''},
                style: {value: ''}
            });
            col_added = true;
        }
        if (col_added) {
            editor.setValue( JSON.stringify( wgt_definition, null, '\t' ), 0 );
            editor.gotoLine(1);

            $('#' + container_id).remove();
            DfxVisualBuilder.addComponents([container], parent_def);
            DfxVisualBuilder.initGraphicalControls();
            // re-select the row
            $('#'+container_id+'_layout_'+layoutIndex+'_row_'+row_index).click();
        }
    }
};
