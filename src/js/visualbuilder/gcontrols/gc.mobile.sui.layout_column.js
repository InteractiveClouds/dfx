/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/* GC Mobile Layout Column */

var gc_mobile_layout_column = {
    "label": "Layout Column",
    "category": "default",
    "subcontrol": true,
    "renderDesign": function( component_attributes, container_id, index_row, index_child, index_layout ) {
        if (index_layout==null) {
            index_layout=0;
        }
        if (!component_attributes) {
            component_attributes = {
                width: {value: 'sixteen'},
                classes: {value: ''},
                dynamicClasses: {value: ''},
                style: {value: ''},
                css: {
                    "color": "",
                    "background": "",
                    "padding": "",
                    "text-align": ""
                },
                orientation: {value: 'vertical'},
                alignment: {value: 'start'},
                disposition: {value: 'space_around'}
            };
        }

        /* For Migration Only, must be removed in the next release */
        if (!component_attributes.css) {
            component_attributes.css = {
                "color": "",
                "background": "",
                "padding": "",
                "text-align": ""
            };
        }
        /* End: Migration */

        var columnCss = '';
        $.each(component_attributes.css, function(key, value) {
            if (value!='') {
                columnCss += key + ':' + value + ';';
            }
        });

        var fragment_html = '<div id="' + container_id + '_layout_'+index_layout+'_row_'+index_row+'_column_'+index_child+'_frame class="sixteen wide column">'
            + '<div id="' + container_id + '_layout_'+index_layout+'_row_'+index_row+'_column_'+index_child+'"  gc-control-id="'+container_id + '" gc-parent="'+container_id + '" gc-role="control-child" gc-type="layout-column" gc-container="layout_'+index_layout+'_row_'+index_row+'_column_'+index_child+'" gc-layout-index="'+index_layout+'" gc-row-index="'+index_row+'" gc-child-index="'+index_child+'" class="'
            + 'dfx_visual_editor_gc_layout_col dfx_visual_editor_draggable dfx_visual_editor_gc_draggable dfx_visual_editor_droppable '
            + ((component_attributes.orientation) ? 'gc_w_column_layout ' : '')
            + ((component_attributes.orientation) ? 'gc_w_column_orientation_' + component_attributes.orientation.value + ' ' : '')
            + ((component_attributes.orientation) ? 'gc_w_column_align_' + component_attributes.alignment.value + ' ' : '')
            + ((component_attributes.orientation) ? 'gc_w_column_disposition_' + component_attributes.disposition.value + ' ' : '')
            + component_attributes.classes.value + '"'
            + ' style="min-height:30px;' + ((component_attributes.style) ? component_attributes.style.value : '') + ';' + columnCss + '">';

        fragment_html += '</div></div>';

        return fragment_html;
    },
    "loadPropertyPanel": function(gc_component_definition, gc_control_child_id) {
        var layout_index = parseInt($('#'+gc_control_child_id).attr( 'gc-layout-index' ));
        var row_index = parseInt($('#'+gc_control_child_id).attr( 'gc-row-index' ));
        var column_index = parseInt($('#'+gc_control_child_id).attr( 'gc-child-index' ));
        var column_def;

        if (gc_component_definition.attributes.layoutElements) {
            column_def = gc_component_definition.attributes.layoutElements[layout_index].layout.rows[row_index].cols[column_index];
        } else {
            column_def = gc_component_definition.attributes.layout.rows[row_index].cols[column_index];
        }

        /* For Migration Only, must be removed in the next release */
        if (!column_def.css) {
            column_def.css = {
                "color": "",
                "background": "",
                "padding": "",
                "text-align": ""
            };
        }
        if (!column_def.orientation) {
            column_def.orientation = {"value": "vertical"};
            column_def.alignment = {"value": "start"};
            column_def.disposition = {"value": "space_around"};
        }
        /* End: Migration */

        $( '#gc_layout_column_attr_container_id').val( gc_component_definition.id );
        $( '#gc_layout_column_attr_index').val( column_index );
        $( '#gc_layout_column_attr_row_index').val( row_index );
        $( '#gc_layout_column_attr_layout_index').val( layout_index );
        $( '#gc_layout_column_attr_width').val( column_def.width.value );

        $( '#gc_layout_column_attr_orientation').val( column_def.orientation.value );
        $( '#gc_layout_column_attr_alignment').val( column_def.alignment.value );
        $( '#gc_layout_column_attr_disposition').val( column_def.disposition.value );

        $( '#gc_layout_column_attr_classes').val( column_def.classes.value );
        $( '#gc_layout_column_attr_style').val( column_def.style.value );
        $( '#gc_layout_column_attr_dynamicClasses').val( column_def.dynamicClasses ? column_def.dynamicClasses.value : "" );

        $( '#gc_layout_column_attr_css_color').val( column_def.css.color );
        $( '#gc_layout_column_attr_css_background').val( column_def.css.background );
        $( '#gc_layout_column_attr_css_padding').val( column_def.css.padding );
        $( '#gc_layout_column_attr_css_alignment').val( column_def.css["text-align"] );

        $( '#layout_container_link' ).text(gc_component_definition.type.charAt(0).toUpperCase() + gc_component_definition.type.slice(1));
        $( '#layout_container_link' ).attr( 'layout-container-id', gc_component_definition.id );
        $( '#layout_container_link' ).click( function() {
            var layout_container_id = $(this).attr('layout-container-id');
            $( '#'+layout_container_id).click();
        });
        $( '#layout_link' ).attr( 'layout-id', gc_component_definition.id+'_layout_'+layout_index );
        $( '#layout_link' ).click( function() {
            var layout_id = $(this).attr('layout-id');
            $( '#'+layout_id).click();
        });
        $( '#layout_row_link' ).attr( 'layout-row-id', gc_component_definition.id+'_layout_'+layout_index+'_row_'+row_index );
        $( '#layout_row_link' ).click( function() {
            var layout_row_id = $(this).attr('layout-row-id');
            $( '#'+layout_row_id).click();
        });

        $('#layoutColumnColorPicker').colorpicker({'container':'#layoutColumnColorPicker'});
        $('#layoutColumnBgcolorPicker').colorpicker({'container':'#layoutColumnBgcolorPicker'});

        $('.dfx_visual_editor_property_input').change( function() {
            DfxVisualBuilder.propertyPanelChanged();
        });
    },
    "savePropertyPanel": function() {
        var container_id = $( '#gc_layout_column_attr_container_id').val(),
            column_index = parseInt($( '#gc_layout_column_attr_index').val()),
            row_index = parseInt($( '#gc_layout_column_attr_row_index').val()),
            layoutIndex = $( '#gc_layout_column_attr_layout_index').val(),
            width = $( '#gc_layout_column_attr_width').val(),
            orientation = $( '#gc_layout_column_attr_orientation').val(),
            alignment = $( '#gc_layout_column_attr_alignment').val(),
            disposition = $( '#gc_layout_column_attr_disposition').val(),
            classes = $( '#gc_layout_column_attr_classes').val(),
            style = $( '#gc_layout_column_attr_style').val(),
            dynClasses = $( '#gc_layout_column_attr_dynamicClasses').val(),
            cssColor = $( '#gc_layout_column_attr_css_color').val(),
            cssBackground = $( '#gc_layout_column_attr_css_background').val(),
            cssPadding = $( '#gc_layout_column_attr_css_padding').val(),
            cssAlignment = $( '#gc_layout_column_attr_css_alignment').val();

        var attributes = {
            width: {value: width},
            "classes": { "value": classes },
            "dynamicClasses": { "value": dynClasses },
            "style": { "value": style },
            "orientation": { "value": orientation},
            "alignment": { "value": alignment},
            "disposition": { "value": disposition},
            "css": {
                "color": cssColor,
                "background": cssBackground,
                "padding": cssPadding,
                "text-align": cssAlignment
            }
        };

        var columnCss = '';
        $.each(attributes.css, function(key, value) {
            if (value!='') {
                columnCss += key + ':' + value + ';';
            }
        });

        var el = $( '#'+container_id+'_layout_'+layoutIndex+'_row_'+row_index+'_column_'+column_index );
        el.attr({
            'class': 'dfx_visual_editor_gc_layout_col sixteen wide column dfx_visual_editor_draggable dfx_visual_editor_gc_draggable dfx_visual_editor_droppable '+classes,
            'style': 'min-height:30px; ' + style + ';' + columnCss
        });

        /* Clean the arrangement attributes/classes */
        $(el).addClass('gc_w_column_layout');
        $(el).addClass('gc_w_column_orientation_'+orientation);
        $(el).addClass('gc_w_column_align_'+alignment);
        $(el).addClass('gc_w_column_disposition_'+disposition);

        var editor = ace.edit( 'dfx_src_editor' );
        var wgt_definition = JSON.parse( editor.getValue() );

        var container = DfxVisualBuilder.getComponentDefinition( container_id, wgt_definition );
        var layout_definition;

        if (container.attributes.layoutElements) {
            layout_definition = container.attributes.layoutElements[layoutIndex].layout;
        } else {
            layout_definition = container.attributes.layout;
        }

        layout_definition.rows[row_index].cols[column_index] = attributes;

        editor.setValue( JSON.stringify( wgt_definition, null, '\t' ), 0 );
        editor.gotoLine(1);

        // re-select the component
        DfxVisualBuilder.initPropertyPanelChange();
        DfxVisualBuilder.updateSelectedBox(el);
    },
    "removeComponent": function (container_id, column_index, parent_definition) {
        var row_index = parseInt($( '#gc_layout_column_attr_row_index').val());
        var container = DfxVisualBuilder.getComponentDefinition( container_id, parent_definition );

        var layout_definition;
        var layoutIndex = $( '#gc_layout_column_attr_layout_index').val();

        if (container.attributes.layoutElements) {
            layout_definition = container.attributes.layoutElements[layoutIndex].layout;
        } else {
            layout_definition = container.attributes.layout;
        }

        column_index = parseInt(column_index);

        var cols = layout_definition.rows[row_index].cols;
        if (column_index>0 || cols.length>1) {
            var width = parseInt(cols[column_index].width.value);
            if (column_index==0) {
                width = parseInt(cols[column_index+1].width.value)+width;
                cols[column_index+1].width.value = width;

            } else {
                width = parseInt(cols[column_index-1].width.value)+width;
                cols[column_index-1].width.value = width;
            }
            layout_definition.rows[row_index].cols.splice(column_index, 1);

            gc_web_layout_column.updateChildPosition( container, column_index, row_index, layoutIndex );


            $( '#'+container_id + '_layout_'+layoutIndex+'_row_' + row_index + '_column_' + column_index).remove();

            var container_object = $('#'+container_id);
            var parent_id = $(container_object).parent().closest('[gc-role=control]').attr('id');
            var parent_def = (parent_id==null) ? null : {"id": parent_id };

            $( '#'+container_id ).remove();
            DfxVisualBuilder.addComponents([container], parent_def);
            DfxVisualBuilder.initGraphicalControls();
        }
    },
    "updateChildPosition": function (container, column_index, row_index, layout_index) {
        var i;
        column_index = parseInt(column_index);
        row_index = parseInt(row_index);
        for (i=0; i<container.children.length; i++) {
            if (container.children[i].container=='layout_'+layout_index+'_row_'+row_index+'_column_'+column_index) {
                if (column_index>0) {
                    container.children[i].container = 'layout_'+layout_index+'_row_' + row_index + '_column_' + (column_index - 1);
                }
            } else {
                if (container.children[i].container.indexOf('layout_'+layout_index+'_row_' + row_index + '_')>-1) {
                    var current_col = parseInt(container.children[i].container.substring(container.children[i].container.indexOf( '_column_' ) + 8 ));
                    if (current_col>column_index) {
                        container.children[i].container = 'layout_'+layout_index+'_row_'+row_index+'_column_'+(current_col-1);
                    }
                }
            }
        }
    }
};
