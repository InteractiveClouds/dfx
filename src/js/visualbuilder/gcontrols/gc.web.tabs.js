/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/* GC Web Tabs */

var gc_web_tabs = {
    "label": "Tabs",
    "category": "layout",
    "default_classes": "dfx_visual_editor_draggable dfx_visual_editor_gc_draggable",
    "attributeDefinition": {
        "categories": [
            {"id": "main_props",
                "label": "Main Properties",
                "expanded": true,
                "properties": [
                    { "id": "name", "label": "Name:", "type": "value", "default": "pnlTabs", "propType": "input" },
                    { "id": "controller", "label": "Controller:", "type": "value", "default": "", "propType": "input" },
                    { "id": "layoutElements", "label": "Tabs:", "type": "tab-steps", "default": [
                        {"header": {"value":"Tab 1"}, "disabled": {"value":"no"},
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
                        {"header": {"value":"Tab 2"}, "disabled": {"value":"no"},
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
                    { "id": "classes", "label": "Classes:", "type": "value", "default": "", "propType": "input-picker", "picker": "class" },
                    { "id": "dynamicClasses", "label": "Dynamic Classes:", "type": "value", "default": "", "propType": "input-picker", "picker": "exp" },
                    { "id": "css", "type": "css", "propType": "input-css", "cssOptions": [ "width", "height", "color", "background" ] },
                    { "id": "style", "label": "Custom CSS:", "type": "value", "default": "", "propType": "input" }
                ]
            },
            {"id": "event_props",
                "label": "Events",
                "expanded": false,
                "properties": [
                    { "id": "onSelect", "label": "On Select:", "type": "value", "default": "", "propType": "input-picker", "picker": "evt" }
                ]
            }
        ]
    },
    "createDefinition": function( component_id, container_id ) {
        var default_attributes = gc_factory.getDefaultAttributes( gc_web_tabs.attributeDefinition );

        return {
            id: component_id,
            type: "tabs",
            attributes: default_attributes,
            children: [],
            container: container_id
        };
    },
    "renderDesign": function( component ) {
        var i;

        var attributes;
        if (!component.attributes) {
            attributes = gc_factory.getDefaultAttributes( gc_web_wizard.attributeDefinition );
        } else {
            attributes = gc_factory.migrateAttributes( gc_web_wizard.attributeDefinition, component.attributes );
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


        var fragment_html = '<div id="' + component.id + '"  gc-role="control" gc-type="tabs" ' +
            'style="display:inline-block;position:relative;' + attributes.containerStyle.value  + ';' + containerCss + '" ' +
            'class="' + gc_web_tabs.default_classes + (attributes.containerClasses.value != '' ? ' '+attributes.containerClasses.value : '') + '">' +
            '<ul id="' + component.id + '_tabs" class="nav nav-tabs '+ attributes.classes.value + '" style="'+ attributes.style.value + ';' + css + '">';

        for (i=0; i<attributes.layoutElements.length; i++) {
            fragment_html += '<li'+(i==0 ? ' class="active"' : '')+'><a href="#'+component.id+'_tab'+i+'" data-toggle="tab" name="component_tab" onclick="dfxVisualBuilderShowTab(event)">' + attributes.layoutElements[i].header.value + '</a></li>';
        }

        fragment_html +=  '</ul>';
        fragment_html +=  '<div class="tab-content" id="' + component.id + '_content" style="height:auto;overflow: hidden">';

        for (i=0; i<attributes.layoutElements.length; i++) {
            fragment_html += '<div class="tab-pane'+(i==0 ? ' active' : '')+'" id="'+component.id+'_tab'+i+'">';
            // layout
            fragment_html += gc_web_layout.renderDesign(attributes.layoutElements[i].layout, component.id, i);
            fragment_html += '</div>';
        }

        fragment_html +=  '</div></div>';

        var component_instance = {
            "id": component.id,
            "fragment": fragment_html
        };
        return component_instance;
    },
    "loadPropertyPanel": function(gc_component_definition) {
        CustomModal.init('tabs', gc_component_definition.attributes);

        $( '#gc_tabs_attr_id').val( gc_component_definition.id );
        $( '#gc_tabs_attr_layoutElements').val(JSON.stringify(gc_component_definition.attributes.layoutElements));

        gc_factory.generatePropertyPanel( gc_web_tabs.attributeDefinition, gc_component_definition );

        $('#main_props > div:nth-of-type(3) > div').append('<a id="dfx_edit_tabs_steps" data-toggle="modal" data-target="#tabsModal" href="#">Edit...</a>');

        $('.dfx_visual_editor_property_input').change( function(e) {
            DfxVisualBuilder.propertyPanelChanged();
        });
    },
    "savePropertyPanel": function() {
        var i, id = $( '#gc_tabs_attr_id').val(),
            fragment_html='',
            exists_html,
            layoutElements = $( '#gc_tabs_attr_layoutElements').val();

        var attributes = gc_factory.getPropertiesFromPanel( gc_web_tabs.attributeDefinition );
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
            'class': gc_web_tabs.default_classes + ' ' + attributes.containerClasses.value,
            'style': 'display:inline-block;position:relative;' + attributes.containerStyle.value + ';' + containerCss
        });

        $('#'+id+'_tabs').attr( {
            'class': 'nav nav-tabs '+attributes.classes.value,
            'style': attributes.style.value + ';' + css
        });

        attributes.layoutElements = JSON.parse(layoutElements);

        for (i=0; i < attributes.layoutElements.length; i++) {
            fragment_html += '<li'+(i==0 ? ' class="active"' : '')+'><a href="#'+id+'_tab'+i+'" data-toggle="tab" name="component_tab" onclick="dfxVisualBuilderShowTab(event)">' + attributes.layoutElements[i].header.value + '</a></li>';
        }
        $('#'+id+'_tabs').html(fragment_html);
        fragment_html = '';
        for (i=0; i < attributes.layoutElements.length; i++) {
            exists_html = '';
            if($('#'+id +'_layout_'+i).length){
                exists_html = $('#'+id +'_tab'+i).html();
            } else {
                exists_html = gc_web_layout.renderDesign(attributes.layoutElements[i].layout, id, i);
            }
            fragment_html += '<div class="tab-pane'+(i==0 ? ' active' : '')+'" id="'+id+'_tab'+i+'">'+exists_html+'</div>';
        }
        $('#'+id+'_content').html(fragment_html);
        DfxVisualBuilder.initGraphicalControls();


        var editor = ace.edit( 'dfx_src_editor' );
        var wgt_definition = JSON.parse( editor.getValue() );
        DfxVisualBuilder.findComponentAndUpdateAttributes( id, wgt_definition.definition, attributes, false );
        editor.setValue( JSON.stringify( wgt_definition, null, '\t' ), 0 );
        editor.gotoLine(1);

        var el = $( '#'+id );
        DfxVisualBuilder.updateSelectedBox(el);
    }
}
function dfxVisualBuilderShowTab(e){
    e.preventDefault();
    $(e.target).tab("show");
}
