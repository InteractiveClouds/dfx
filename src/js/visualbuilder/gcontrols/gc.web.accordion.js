/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/* GC Web Data Grid */

var gc_web_accordion = {
    "label": "Accordion",
    "category": "layout",
    "default_classes": "dfx_visual_editor_draggable dfx_visual_editor_gc_draggable",
    "attributeDefinition": {
        "categories": [
            {"id": "main_props",
                "label": "Main Properties",
                "expanded": true,
                "properties": [
                    { "id": "name", "label": "Name:", "type": "value", "default": "pnlAccordion", "propType": "input" },
                    { "id": "controller", "label": "Controller:", "type": "value", "default": "", "propType": "input" },
                    { "id": "layoutElements", "label": "Panes:", "type": "pane-steps", "default": [
                        {"header": {"value":"Title 1"}, "opened": {"value":"yes"},
                            "layout": {
                                rows: [{
                                    cols: [{
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
                                }],
                                classes: {value: ''},
                                dynamicClasses: {value: ''},
                                style: {value: ''}
                            }},
                        {"header": {"value":"Title 2"}, "opened": {"value":"no"},
                            "layout": {
                                rows: [{
                                    cols: [{
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
                                }],
                                classes: {value: ''},
                                dynamicClasses: {value: ''},
                                style: {value: ''}
                            }}], "propType": "wizard-steps" }
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
                "label": "Presentation Rules",
                "expanded": false,
                "properties": [
                    { "id": "display", "label": "Display Rule:", "type": "value", "default": "true", "propType": "input-picker", "picker": "exp" }
                ]
            },
            {"id": "container_props",
                "label": "Container CSS",
                "expanded": false,
                "properties": [
                    { "id": "containerClasses", "label": "Classes:", "type": "value", "default": "", "propType": "input-picker", "picker": "class" },
                    { "id": "containerDynamicClasses", "label": "Dynamic Classes:", "type": "value", "default": "", "propType": "input-picker", "picker": "exp" },
                    { "id": "containerCss", "type": "css", "propType": "input-css", "default": {"width": "100%"}, "cssOptions": [ "width", "height", "color", "background", "padding", "margin", "text-align" ] },
                    { "id": "containerStyle", "label": "Custom CSS:", "type": "value", "default": "", "propType": "input" }
                ]
            },
            {"id": "component_props",
                "label": "Component CSS",
                "expanded": false,
                "properties": [
                    { "id": "classes", "label": "Classes:", "type": "value", "default": "panel-default", "propType": "input-picker", "picker": "class" },
                    { "id": "dynamicClasses", "label": "Dynamic Classes:", "type": "value", "default": "", "propType": "input-picker", "picker": "exp" },
                    { "id": "css", "type": "css", "propType": "input-css", "cssOptions": [ "width", "height", "color", "background" ] },
                    { "id": "style", "label": "Custom CSS:", "type": "value", "default": "", "propType": "input" }
                ]
            }
        ]
    },
    "createDefinition": function( component_id, container_id ) {
        var default_attributes = gc_factory.getDefaultAttributes( gc_web_accordion.attributeDefinition );

        return {
            id: component_id,
            type: "accordion",
            attributes: default_attributes,
            children: [],
            container: container_id
        };
    },
    "renderDesign": function( component ) {
        var i;

        var attributes;
        if (!component.attributes) {
            attributes = gc_factory.getDefaultAttributes( gc_web_accordion.attributeDefinition );
        } else {
            attributes = gc_factory.migrateAttributes( gc_web_accordion.attributeDefinition, component.attributes );
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


        var fragment_html = '<div id="' + component.id + '"  gc-role="control" gc-type="accordion" ' +
            'style="display:inline-block;position:relative;' + attributes.containerStyle.value  + ';' + containerCss + '" ' +
            'class="' + gc_web_accordion.default_classes + (attributes.containerClasses.value != '' ? ' '+attributes.containerClasses.value : '') + '">' +
            '<div id="' + component.id + '_accordion" class="panel-group">';

        for (i=0; i<attributes.layoutElements.length; i++) {
            fragment_html += '<div id="' + component.id + '_pane_'+i+'" class="panel '+ attributes.classes.value + '" style="'+ attributes.style.value + ';' + css + '">' +
                '<div class="panel-heading">' +
                '<h4 class="panel-title"><a data-toggle="collapse" data-parent="'+component.id+'_accordion" href="' + component.id + '_group_'+i+'" onclick="showAccordion(event)">' +
                attributes.layoutElements[i].header.value + '</a></h4></div>' +
                '<div id="' + component.id + '_group_'+i+'" class="panel-collapse collapse'+(i==0 ? ' in' : '')+'">';
            fragment_html += gc_web_layout.renderDesign(attributes.layoutElements[i].layout, component.id, i);
            fragment_html += '</div></div>';
        }

        fragment_html += '</div></div>';

        var component_instance = {
            "id": component.id,
            "fragment": fragment_html
        };
        return component_instance;
    },
    "loadPropertyPanel": function(gc_component_definition) {
        CustomModal.init('accordion', gc_component_definition.attributes);

        $( '#gc_accordion_attr_id').val( gc_component_definition.id );
        $( '#gc_accordion_attr_layoutElements').val(JSON.stringify(gc_component_definition.attributes.layoutElements));

        gc_factory.generatePropertyPanel( gc_web_accordion.attributeDefinition, gc_component_definition );

        $('#main_props > div:nth-of-type(3) > div').append('<a id="dfx_edit_accordion_steps" data-toggle="modal" data-target="#accordionModal" href="#">Edit...</a>');

        $('.dfx_visual_editor_property_input').change( function(e) {
            DfxVisualBuilder.propertyPanelChanged();
        });
    },
    "savePropertyPanel": function() {
        var i, id = $( '#gc_accordion_attr_id').val(),
            fragment_html='',
            exists_html,
            layoutElements = $( '#gc_accordion_attr_layoutElements').val();

        var attributes = gc_factory.getPropertiesFromPanel( gc_web_accordion.attributeDefinition );
        attributes.layoutElements = JSON.parse( layoutElements );

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
            'class': gc_web_accordion.default_classes + ' ' + attributes.containerClasses.value,
            'style': 'display:inline-block;position:relative;' + attributes.containerStyle.value + ';' + containerCss
        });

        for (i=0; i < attributes.layoutElements.length; i++) {
            fragment_html += '<div id="' + id + '_pane_'+i+'" class="panel '+ attributes.classes.value + '" style="'+ attributes.style.value + ';' + css + '">' +
                '<div class="panel-heading">' +
                '<h4 class="panel-title"><a data-toggle="collapse" data-parent="'+id+'_accordion" href="' + id + '_group_'+i+'" onclick="showAccordion(event)">' +
                attributes.layoutElements[i].header.value + '</a></h4></div>' +
                '<div id="' + id + '_group_'+i+'" class="panel-collapse collapse'+(i==0 ? ' in' : '')+'">';
            exists_html = '';
            if($('#'+id +'_layout_'+i).length){
                exists_html = $('#'+id +'_group_'+i).html();
            } else {
                exists_html = gc_web_layout.renderDesign(attributes.layoutElements[i].layout, id, i);
            }
            fragment_html += exists_html;
            fragment_html += '</div></div>';
        }

        $('#'+id+'_accordion').html( fragment_html );

        var editor = ace.edit( 'dfx_src_editor' );
        var wgt_definition = JSON.parse( editor.getValue() );
        DfxVisualBuilder.findComponentAndUpdateAttributes( id, wgt_definition.definition, attributes, false );
        editor.setValue( JSON.stringify( wgt_definition, null, '\t' ), 0 );
        editor.gotoLine(1);

        var el = $( '#'+id );
        DfxVisualBuilder.updateSelectedBox(el);
    }
};

function showAccordion(e){
    e.preventDefault();
    var targetCollapse = $(e.target).attr('href'),
        el = $(e.target).closest('[gc-type=accordion]');
    $('.in', el).collapse('toggle');
    $('#'+targetCollapse).collapse('toggle');
    el.on('hidden.bs.collapse', function () {
        DfxVisualBuilder.updateSelectedBox(el);
    });
    el.on('shown.bs.collapse', function () {
        DfxVisualBuilder.updateSelectedBox(el);
    });
} ;