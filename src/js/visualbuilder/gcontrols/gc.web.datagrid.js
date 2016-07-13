/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/* GC Web Data Grid */

var gc_web_datagrid = {
    "label": "DataGrid",
    "category": "default",
    "default_classes": "dfx_visual_editor_draggable dfx_visual_editor_gc_draggable",
    "attributeDefinition": {
        "categories": [
            {"id": "main_props",
                "label": "Main Properties",
                "expanded": true,
                "properties": [
                    { "id": "name", "label": "Name:", "type": "value", "default": "gridDataGrid", "propType": "input" },
                    { "id": "gridColumns", "label": "Columns:", "type": "gridColumns", "propType": "input-grid-columns", "default": [
                        {
                            "header": { "value": "Column a"},
                            "width": {"value": "4"},
                            "property": {"value": ""},
                            "type": {"value": "text"},
                            "html": {"value": ""},
                            "classes": {"value": ""},
                            "css": {"width": "",
                                "height": "",
                                "color": "",
                                "background": "",
                                "padding": "",
                                "margin": "",
                                "text-align": ""
                            },
                            "style": {"value": ""},
                            "callbackFunction": {"value": ""}
                        },{
                            "header": { "value": "Column b"},
                            "width": {"value": "4"},
                            "property": {"value": ""},
                            "type": {"value": "text"},
                            "html": {"value": ""},
                            "classes": {"value": ""},
                            "css": {"width": "",
                                "height": "",
                                "color": "",
                                "background": "",
                                "padding": "",
                                "margin": "",
                                "text-align": ""
                            },
                            "style": {"value": ""},
                            "callbackFunction": {"value": ""}
                        },{
                            "header": { "value": "Column c"},
                            "width": {"value": "4"},
                            "property": {"value": ""},
                            "type": {"value": "text"},
                            "html": {"value": ""},
                            "classes": {"value": ""},
                            "css": {"width": "",
                                "height": "",
                                "color": "",
                                "background": "",
                                "padding": "",
                                "margin": "",
                                "text-align": ""
                            },
                            "style": {"value": ""},
                            "callbackFunction": {"value": ""}
                        }]
                    }
                ]
            },
            {"id": "data_props",
                "label": "Data & Binding options",
                "expanded": false,
                "properties": [
                    { "id": "property", "label": "Variable:", "type": "value", "default": "", "propType": "input-picker", "picker": "bind" }
                ]
            },
            {"id": "rules_props",
                "label": "Layout & Presentation Rules",
                "expanded": false,
                "properties": [
                    { "id": "title", "label": "Title:", "type": "value", "default": "My Grid", "propType": "input-picker", "picker": "exptext" },
                    { "id": "titleVisible", "label": "Title Visible:", "type": "value", "default": "yes", "propType": "select", "selectOptions": "yesNo" },
                    { "id": "display", "label": "Display Rule:", "type": "value", "default": "true", "propType": "input-picker", "picker": "exp" },
                    { "id": "filter", "label": "Filter:", "type": "value", "default": "yes", "propType": "select", "selectOptions": "yesNo" },
                    { "id": "paging", "label": "Paging:", "type": "value", "default": "yes", "propType": "select", "selectOptions": "yesNo" },
                    { "id": "bordered", "label": "Bordered:", "type": "value", "default": "yes", "propType": "select", "selectOptions": "yesNo" },
                    { "id": "striped", "label": "Striped:", "type": "value", "default": "yes", "propType": "select", "selectOptions": "yesNo" },
                    { "id": "condensed", "label": "Condensed:", "type": "value", "default": "yes", "propType": "select", "selectOptions": "yesNo" }
                ]
            },
            {"id": "container_props",
                "label": "Container CSS",
                "expanded": false,
                "properties": [
                    { "id": "containerClasses", "label": "Classes:", "type": "value", "default": "", "propType": "input-picker", "picker": "class" },
                    { "id": "containerDynamicClasses", "label": "Dynamic Classes:", "type": "value", "default": "", "propType": "input-picker", "picker": "exp" },
                    { "id": "containerCss", "type": "css", "propType": "input-css", "cssOptions": [ "width", "height", "color", "background", "padding", "margin", "text-align" ], "default": {"width": "100%"} },
                    { "id": "containerStyle", "label": "Custom CSS:", "type": "value", "default": "", "propType": "input" }
                ]
            },
            {"id": "component_props",
                "label": "Component CSS",
                "expanded": false,
                "properties": [
                    { "id": "classes", "label": "Classes:", "type": "value", "default": "panel panel-default", "propType": "input-picker", "picker": "class" },
                    { "id": "dynamicClasses", "label": "Dynamic Classes:", "type": "value", "default": "", "propType": "input-picker", "picker": "exp" },
                    { "id": "css", "type": "css", "propType": "input-css", "cssOptions": [ "width", "height", "color", "background", "padding", "margin", "text-align" ] },
                    { "id": "style", "label": "Custom CSS:", "type": "value", "default": "", "propType": "input" }
                ]
            },
            {"id": "event_props",
                "label": "Events",
                "expanded": false,
                "properties": [
                    { "id": "ondataloaded", "label": "On Data Loaded:", "type": "value", "default": "", "propType": "input-picker", "picker": "evt" }
                ]
            }
        ]
    },
    "createDefinition": function( component_id, container_id ) {
        var default_attributes = gc_factory.getDefaultAttributes( gc_web_datagrid.attributeDefinition );

        return {
            id: component_id,
            type: "datagrid",
            attributes: default_attributes,
            children: [],
            container: container_id
        };

    },
    "renderDesign": function( component ) {
        var i;

        var attributes;
        if (!component.attributes) {
            attributes = gc_factory.getDefaultAttributes( gc_web_datagrid.attributeDefinition );
        } else {
            attributes = gc_factory.migrateAttributes( gc_web_datagrid.attributeDefinition, component.attributes );
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

        var fragment_html = '<div id="' + component.id + '"  gc-role="control" gc-type="datagrid" ' +
            'style="display:inline-block;position:relative;' + attributes.containerStyle.value  + ';' + containerCss + '" ' +
            'class="' + gc_web_datagrid.default_classes + (attributes.containerClasses.value != '' ? ' '+attributes.containerClasses.value : '') + '">';

        fragment_html += '<div id="' + component.id + '_grid" class="'+ attributes.classes.value + '" style="'+ attributes.style.value + ';' + css + '">';

        fragment_html += '<div id="' + component.id + '_title" class="panel-heading"';
        if (attributes.titleVisible.value=='no') {
            fragment_html += ' style="display:none"';
        }
        fragment_html += '><h4 class="panel-title">'+attributes.title.value+'</h4></div>';

        fragment_html += '<div class="panel-body">';

        // Filter
        fragment_html += '<div id="' + component.id + '_filter" class="dataTables_filter"';
        if (attributes.filter.value=='no') {
            fragment_html += ' style="display:none"';
        }
        fragment_html += '><label><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span>'
        + '<input class="form-control" style="height: 32px;"></label></div>';

        // Paging
        fragment_html += '<div id="' + component.id + '_paging" class="dataTables_length"';
        if (attributes.paging.value=='no') {
            fragment_html += ' style="display:none"';
        }
        fragment_html += '><label><select class="form-control"><option value="10">10</option></select></label></div>';

        // Main table component
        fragment_html += '<table id="' + component.id + '_table"';

        fragment_html += ' class="table table-hover dataTable no-footer';

        // Striped
        if (attributes.striped.value=='yes') {
            fragment_html += ' table-striped';
        }

        // Condensed
        if (attributes.condensed.value=='yes') {
            fragment_html += ' table-condensed';
        }

        // Classes
        if (attributes.classes!=null) {
            fragment_html += ' '+attributes.classes.value;
        }

        // Bordered
        if (attributes.bordered.value=='yes') {
            fragment_html += ' table-bordered"><thead><tr>';
        } else {
            fragment_html += '"><thead><tr style="background:transparent">';
        }

        // Columns
        for (i=0; i<attributes.gridColumns.length; i++) {
            fragment_html += '<th class="sorting">' + attributes.gridColumns[i].header.value + '</th>';
        }
        fragment_html +=  '</tr></thead><tbody><tr>';
        for (i=0; i<attributes.gridColumns.length; i++) {
            fragment_html += gc_web_datagrid_column.renderDesign(attributes.gridColumns[i], component.id, i);
        }
        fragment_html +=  '</tr></tbody></table></div></div></div>';

        var component_instance = {
            "id": component.id,
            "fragment": fragment_html
        };
        return component_instance;
    },
    "loadPropertyPanel": function(gc_component_definition) {
        $( '#gc_datagrid_attr_id').val( gc_component_definition.id );
        $( '#gc_datagrid_attr_gridColumns').val(JSON.stringify(gc_component_definition.attributes.gridColumns));

        gc_factory.generatePropertyPanel( gc_web_datagrid.attributeDefinition, gc_component_definition );

        $('.dfx_visual_editor_property_input').change( function(e) {
            DfxVisualBuilder.propertyPanelChanged();
        });
    },
    "savePropertyPanel": function() {
        var sys_classes = 'table table-hover dataTable no-footer'
        var id = $( '#gc_datagrid_attr_id').val(),
            gridColumns = $( '#gc_datagrid_attr_gridColumns').val();
        var el =  $( '#'+id);

        var attributes = gc_factory.getPropertiesFromPanel( gc_web_datagrid.attributeDefinition );
        attributes.gridColumns = JSON.parse( gridColumns );

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
            'class': gc_web_datagrid.default_classes + ' ' + attributes.containerClasses.value,
            'style': 'display:inline-block;position:relative;' + attributes.containerStyle.value + ';' + containerCss
        });

        $('#'+id+'_grid').attr( {
            'class': attributes.classes.value,
            'style': attributes.style.value + ';' + css
        });

        $('#'+id+'_title > .panel-title').text(attributes.title.value);


        if (attributes.titleVisible.value=='yes') {
            $( '#'+id+'_title' ).css( 'display', 'block' );
        } else {
            $( '#'+id+'_title' ).css( 'display', 'none' );
        }

        if (attributes.filter.value=='yes') {
            $( '#'+id+'_filter' ).css( 'display', 'block' );
        } else {
            $( '#'+id+'_filter' ).css( 'display', 'none' );
        }

        if (attributes.paging.value=='yes') {
            $( '#'+id+'_paging' ).css( 'display', 'block' );
        } else {
            $( '#'+id+'_paging' ).css( 'display', 'none' );
        }

        var compiled_classes = sys_classes;

        if (attributes.bordered.value=='yes') {
            compiled_classes += ' table-bordered';
            $( '#'+id+'_table > thead > tr' ).css('background', '');
        } else {
            $( '#'+id+'_table > thead > tr' ).css('background', 'transparent');
        }

        if (attributes.striped.value) {
            compiled_classes += ' table-striped';
        }

        if (attributes.condensed.value) {
            compiled_classes += ' table-condensed';
        }

        $( '#'+id+'_table' ).attr( 'class', compiled_classes );

        var editor = ace.edit( 'dfx_src_editor' );
        var wgt_definition = JSON.parse( editor.getValue() );

        DfxVisualBuilder.findComponentAndUpdateAttributes( id, wgt_definition.definition, attributes, false );

        editor.setValue( JSON.stringify( wgt_definition, null, '\t' ), 0 );
        editor.gotoLine(1);

        DfxVisualBuilder.initPropertyPanelChange();
        DfxVisualBuilder.updateSelectedBox(el);
    },
    "addColumn": function () {
        var  i, fragment_html;
        var grid_column = {
            "header": { "value": "Column"},
            "width": {"value": "4"},
            "property": {"value": ""},
            "type": {"value": "text"},
            "html": {"value": ""},
            "classes": {"value": ""},
            "css": {"width": "",
                "height": "",
                "color": "",
                "background": "",
                "padding": "",
                "margin": "",
                "text-align": ""
            },
            "style": {"value": ""},
            "callbackFunction": {"value": ""}
        };
        var id = $( '#gc_datagrid_attr_id' ).val();

        var editor = ace.edit( 'dfx_src_editor' );
        var wgt_definition = JSON.parse( editor.getValue() );

        var updated_gridColumns = DfxVisualBuilder.addChildComponent(id, 'gridColumns', wgt_definition.definition, grid_column, false );

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
        $( '#'+id+'_col'+(updated_gridColumns.length-1) ).click();
    }
}