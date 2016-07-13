/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/* GC Web List */

var gc_web_list = {
    "label": "List",
    "category": "default",
    "createDefinition": function( component_id, container_id ) {
        return {
            id: component_id,
            type: "list",
            attributes: {
                name: { value: "lstList" },
                controller: { value: "" },
                model: { value: "" },
                modelinit: { value: "" },
                title: { value: "My List" },
                titleVisible: { value: true },
                classes: { value: "" },
                style: { value: "" },
                display: { value: "" }
            },
            children: [],
            container: container_id
        };
    },
    "renderDesign": function( component ) {
        var list_items = [ {label: "Item 1"} ];

        if (!component.attributes) {
            component.attributes = {
                name: { value: "" },
                controller: { value: "" },
                model: { value: "" },
                modelinit: { value: "" },
                title: { value: "My List" },
                titleVisible: { value: true },
                classes: { value: "" },
                style: { value: "" },
                display: { value: "" }
            };
        }

        var fragment_html = '<div id="' + component.id + '"  gc-role="control" gc-type="list" class="panel panel-primary dfx_visual_editor_draggable dfx_visual_editor_gc_draggable">'
            + '<div id="' + component.id + '_title" class="panel-heading" style="display:'+(component.attributes.titleVisible.value ? 'block' :'none')+'">'+component.attributes.title.value+'</div>'
        //+ '<ul id="' + component.id + '_list" class="list-group">';
            + '<div class="panel-body">'
            + '<div id="' + component.id + '_list" class="list-group">';
        for (var i=0; i<list_items.length; i++) {
            //fragment_html += '<li class="list-group-item">' + list_items[i].label + '</li>';
            //<div id="' + component.id + '_litem'+i+'" class="gc_w_design_panel_col dfx_visual_editor_droppable col-lg-12" style="height:auto;min-height:50px" gc-parent="' + component.id + '" gc-container="col'+i+'" gc-role="column" gc-column="'+i+'"></div>
            fragment_html += '<div class="list-group-item panel-body"><div id="' + component.id + '_col'+i+'" class="gc_w_design_panel_col dfx_visual_editor_droppable col-lg-12" style="height:auto;min-height:50px" gc-parent="' + component.id + '" gc-container="col'+i+'" gc-role="column" gc-column="'+i+'"></div></div>';
        }
        fragment_html +=  '</div></div></div>';
        var component_instance = {
            "id": component.id,
            "fragment": fragment_html
        };
        return component_instance;
    },
    "loadPropertyPanel": function(gc_component_definition) {
        var titlevisible = (gc_component_definition.attributes.titleVisible.value) ? 'yes' : 'no';
        $( '#gc_list_attr_id').val( gc_component_definition.id );
        $( '#gc_list_attr_name').val( gc_component_definition.attributes.name.value );
        $( '#gc_list_attr_controller').val( gc_component_definition.attributes.controller.value ).focus();
        $( '#gc_list_attr_model').val( gc_component_definition.attributes.model.value );
        $( '#gc_list_attr_modelinit').val( gc_component_definition.attributes.modelinit.value );
        $( '#gc_list_attr_title').val( gc_component_definition.attributes.title.value );
        $( '#gc_list_attr_titleVisible').val( titlevisible );
        $( '#gc_list_attr_classes').val( gc_component_definition.attributes.classes.value );
        $( '#gc_list_attr_style').val( gc_component_definition.attributes.style.value );
        $( '#gc_list_attr_display').val( gc_component_definition.attributes.display.value );
    },
    "savePropertyPanel": function() {
        var id = $( '#gc_list_attr_id').val(),
            name = $( '#gc_list_attr_name').val(),
            controller = $( '#gc_list_attr_controller').val(),
            model = $( '#gc_list_attr_model').val(),
            modelinit = $( '#gc_list_attr_modelinit').val(),
            title = $( '#gc_list_attr_title').val(),
            titleVisible = !!(($( '#gc_list_attr_titleVisible').val()=="yes")),
            classes = $( '#gc_list_attr_classes').val(),
            nstyle = $( '#gc_list_attr_style').val(),
            display = $( '#gc_list_attr_display').val(),
            attributes = {
                "name": { value: name},
                "controller": { value: controller },
                "model": { value: model },
                "modelinit": { value: modelinit },
                "title": { value: title },
                "titleVisible": { value: titleVisible },
                "classes": { value: classes },
                "style": { value: nstyle },
                "display": { value: display }
            };
        $( '#'+id+'_title' )
        .text( title )
        .css( 'display', (titleVisible ? 'block' : 'none') );

        var editor = ace.edit( 'dfx_src_editor' );
        var wgt_definition = JSON.parse( editor.getValue() );

        DfxVisualBuilder.findComponentAndUpdateAttributes( id, wgt_definition.definition, attributes, false );

        editor.setValue( JSON.stringify( wgt_definition, null, '\t' ), 0 );
        editor.gotoLine(1);

        var el = $( '#'+id);
        DfxVisualBuilder.updateSelectedBox(el);
    }
}