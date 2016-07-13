/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/* GC Mobile Layout Row */

var gc_mobile_layout_row = {
    "label": "Layout Row",
    "category": "default",
    "subcontrol": true,
    "renderDesign": function( component_attributes, container_id, index_child, layout_index_child ) {
        if (layout_index_child==null) {
            layout_index_child = 0;
        }

        if (!component_attributes) {
            component_attributes = {
                classes: {value: ''},
                dynamicClasses: {value: ''},
                style: {value: ''},
                css: {
                    "height": "",
                    "color": "",
                    "background": ""
                },
                alignment: {value: 'start'}
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
        if (! component_attributes.alignment) {
            component_attributes.alignment = {"value": "start"};
        }
        /* End: Migration */

        var rowCss = '';
        $.each(component_attributes.css, function(key, value) {
            if (value!='') {
                rowCss += key + ':' + value + ';';
            }
        });

        var fragment_html = '<div id="' + container_id + '_layout_'+layout_index_child+'_row_'+index_child+'"  gc-control-id="'+container_id + '" gc-role="control-child" gc-type="layout-row" gc-child-index="' + index_child
            + '" gc-parent="'+container_id + '" gc-container="layout_'+layout_index_child+'_row_'+index_child
            + '" class="card ' + ' dfx_visual_editor_draggable dfx_visual_editor_gc_draggable dfx_visual_editor_droppable '
            + 'gc_w_row_align_' + component_attributes.alignment.value + ' '
            + component_attributes.classes.value + '"'
            + ' style="min-height:30px;height:auto;' + rowCss + ((component_attributes.style) ? component_attributes.style.value : '') + '">';

        fragment_html += '</div>';

        return fragment_html;
    },
    "loadPropertyPanel": function(gc_component_definition, gc_control_child_id) {
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
        if (! row_definition.css) {
            row_definition.css = {
                "height": "",
                "color": "",
                "background": ""
            };
        }
        if (! row_definition.alignment) {
            row_definition.alignment = {"value": "start"};
        }
        /* End: Migration */

        $( '#gc_layout_row_attr_layout_index').val( layoutIndex );
        $( '#gc_layout_row_attr_container_id').val( gc_component_definition.id );
        $( '#gc_layout_row_attr_index').val( row_index );
        $( '#gc_layout_row_attr_classes').val( row_definition.classes.value );
        $( '#gc_layout_row_attr_style').val( row_definition.style.value );
        $( '#gc_layout_row_attr_dynamicClasses').val( row_definition.dynamicClasses ? row_definition.dynamicClasses.value : '' );

        $( '#gc_layout_row_attr_alignment').val( row_definition.alignment.value );

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

        $('#layoutRowColorPicker').colorpicker({'container':'#layoutRowColorPicker'});
        $('#layoutRowBgcolorPicker').colorpicker({'container':'#layoutRowBgcolorPicker'});

        $('.dfx_visual_editor_property_input').change( function() {
            DfxVisualBuilder.propertyPanelChanged();
        });
    },
    "savePropertyPanel": function() {
        var container_id = $( '#gc_layout_row_attr_container_id').val(),
            layout_index = parseInt($( '#gc_layout_row_attr_layout_index').val()),
            row_index = parseInt($( '#gc_layout_row_attr_index').val()),
            classes = $( '#gc_layout_row_attr_classes').val(),
            style = $( '#gc_layout_row_attr_style').val(),
            dynClasses = $( '#gc_layout_row_attr_dynamicClasses').val(),
            alignment = $( '#gc_layout_row_attr_alignment').val();

        var css_height =  $( '#gc_layout_row_attr_css_height').val();
        var css_color =  $( '#gc_layout_row_attr_css_color').val();
        var css_background =  $( '#gc_layout_row_attr_css_background').val();

        var attributes = {
            "classes": { "value": classes },
            "dynamicClasses": { "value": dynClasses },
            "style": { "value": style },
            "alignment": { "value": alignment},
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

        var el = $( '#'+container_id+'_layout_' + layout_index + '_row_'+row_index );
        el.attr({'class': 'row '+classes, 'style': style + ';min-height:30px;height:auto;' + rowCss});

        $(el).addClass('gc_w_row_align_'+alignment);

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
            gc_mobile_layout_row.updateChildPosition(container, row_index, layoutIndex);
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
            if (container.children[i].container.indexOf('layout_'+layout_index+'_row_'+row_index)>-1) {
                if (row_index==0) {
                    container.children[i].container = 'layout_'+layout_index+'_row_' + (row_index + 1);
                } else {
                    container.children[i].container = 'layout_'+layout_index+'_row_' + (row_index - 1);
                }
            }
        }
        if (row_index<(layout.rows.length-1)) {
            for (i=0; i<container.children.length; i++) {
                var row_pos = container.children[i].container.indexOf('row_')+4;
                var container_row = parseInt(container.children[i].container.substring(row_pos));
                if (row_index<container_row) {
                    container.children[i].container = 'layout_'+layout_index+'_row_' + (container_row - 1);
                }
            }
        }
    }
};