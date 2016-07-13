/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/* GC Web Tabs */

var gc_web_wizard = {
    "label": "Wizard",
    "category": "layout",
    "default_classes": "dfx_visual_editor_draggable dfx_visual_editor_gc_draggable wizard",
    "attributeDefinition": {
        "categories": [
            {"id": "main_props",
                "label": "Main Properties",
                "expanded": true,
                "properties": [
                    { "id": "name", "label": "Name:", "type": "value", "default": "wzdWizard", "propType": "input" },
                    { "id": "controller", "label": "Controller:", "type": "value", "default": "", "propType": "input" },
                    { "id": "layoutElements", "label": "Steps:", "type": "wizard-steps", "default": [
                        {"header": {"value":"Step 1"},
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
                        {"header": {"value":"Step 2"},
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
            {"id": "rules_props",
                "label": "Presentation Rules",
                "expanded": false,
                "properties": [
                    { "id": "display", "label": "Display Rule:", "type": "value", "default": "true", "propType": "input-picker", "picker": "exp" },
                    { "id": "title", "label": "Title:", "type": "value", "default": "My Wizard", "propType": "input-picker", "picker": "exptext" },
                    { "id": "titleVisible", "label": "Title Visible:", "type": "value", "default": "yes", "propType": "select", "selectOptions": "yesNo" }
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
                    { "id": "nextClick", "label": "On Click Next:", "type": "value", "default": "", "propType": "input-picker", "picker": "evt" },
                    { "id": "backClick", "label": "On Click Back:", "type": "value", "default": "", "propType": "input-picker", "picker": "evt" },
                    { "id": "onSelect", "label": "On Select:", "type": "value", "default": "", "propType": "input-picker", "picker": "evt" }
                ]
            }
        ]
    },
    "createDefinition": function( component_id, container_id ) {
        var default_attributes = gc_factory.getDefaultAttributes( gc_web_wizard.attributeDefinition );

        return {
            id: component_id,
            type: "wizard",
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

        var lenSteps = attributes.layoutElements.length, fragment_html, component_instance;

        fragment_html = '<div id="' + component.id + '"  gc-role="control" gc-type="wizard" ' +
            'style="display:inline-block;position:relative;' + attributes.containerStyle.value  + ';' + containerCss + '" ' +
            'class="' + gc_web_wizard.default_classes + (attributes.containerClasses.value != '' ? ' '+attributes.containerClasses.value : '') + '">' +
            '<div id="' + component.id + '_wizard" class="'+ attributes.classes.value + '" style="'+ attributes.style.value + ';' + css + '">' +
            '<h3 id="' + component.id + '_title" style="display:'+(attributes.titleVisible.value=='yes' ? 'block' :'none')+'">'+attributes.title.value+'</h3>' +
            '<div class="steps" id="' + component.id + '_steps">';

        for (i=0; i<lenSteps; i++) {
            fragment_html += '<a'+(i==0 ? ' class="active"' : '')+' data-target="#'+component.id+'_'+(i)+'"><span class="badge'+(i==0 ? ' badge-info' : '')+'">'+(i+1)+'</span> ' + attributes.layoutElements[i].header.value + '</a>';
        }

        fragment_html +=  '</div>';
        fragment_html +=  '<div class="step-content" id="' + component.id + '_content" class="'+ attributes.classes.value + '" style="'+ attributes.style.value + ';' + css + '">';

        for (i=0; i<lenSteps; i++) {
            fragment_html += '<div class="step-pane'+(i==0 ? ' active' : '')+'" id="'+component.id+'_'+i+'">';
            // layout
            fragment_html += gc_web_layout.renderDesign(attributes.layoutElements[i].layout, component.id, i);
            fragment_html += '</div>';
        }

        fragment_html +=  '</div>';
        fragment_html +=  '<div class="action">'+
        '<button type="button" class="btn btn-default btn-prev" id="btnWizardPrev"><i class="icon-arrow-left"></i> Back</button>'+
        '<button type="button" class="btn btn-primary btn-next" id="btnWizardNext">Next <i class="icon-arrow-right"></i></button>'+
        '</div></div></div>';

        component_instance = {
            "id": component.id,
            "fragment": fragment_html,
            "callback": function(component) {
                $('#'+component.id).wizard();
            }
        };
        return component_instance;
    },
    "loadPropertyPanel": function(gc_component_definition) {
        CustomModal.init('wizard', gc_component_definition.attributes);


        $( '#gc_wizard_attr_id').val( gc_component_definition.id );
        $( '#gc_wizard_attr_layoutElements').val(JSON.stringify(gc_component_definition.attributes.layoutElements));

        gc_factory.generatePropertyPanel( gc_web_wizard.attributeDefinition, gc_component_definition );

        $('#main_props > div:nth-of-type(3) > div').append('<a id="dfx_edit_wizard_steps" data-toggle="modal" data-target="#wizardModal" href="#">Edit...</a>');

        $('.dfx_visual_editor_property_input').change( function(e) {
            DfxVisualBuilder.propertyPanelChanged();
        });
    },
    "savePropertyPanel": function() {
        var i, id = $( '#gc_wizard_attr_id').val(),
            fragment_html='',
            exists_html,
            layoutElements = $( '#gc_wizard_attr_layoutElements').val();

        var attributes = gc_factory.getPropertiesFromPanel( gc_web_wizard.attributeDefinition );
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
            'class': gc_web_wizard.default_classes + ' ' + attributes.containerClasses.value,
            'style': 'display:inline-block;position:relative;' + attributes.containerStyle.value + ';' + containerCss
        });

        $('#'+id+'_wizard').attr( {
            'class': attributes.classes.value,
            'style': attributes.style.value + ';' + css
        });

        $( '#'+id+'_title' ).text(attributes.title.value).css('display', ( attributes.titleVisible.value=='yes' ? 'block' : 'none'));

        attributes.layoutElements = JSON.parse(layoutElements);

        for (i=0; i < attributes.layoutElements.length; i++) {
            fragment_html += '<a'+(i==0 ? ' class="active"' : '')+' data-target="#'+id+'_'+(i)+'"><span class="badge">'+(i+1)+'</span> ' + attributes.layoutElements[i].header.value + '</a>';
        }
        $('#'+id+'_steps').html(fragment_html);
        fragment_html = '';
        for (i=0; i < attributes.layoutElements.length; i++) {
            exists_html = '';
            if($('#'+id +'_layout_'+i).length){
                exists_html = $('#'+id +'_'+i).html();
            } else {
                exists_html = gc_web_layout.renderDesign(attributes.layoutElements[i].layout, id, i);
            }
            fragment_html += '<div class="step-pane'+(i==0 ? ' active' : '')+'" id="'+id+'_'+i+'">'+exists_html+'</div>';
        }
        $('#'+id+'_content').html(fragment_html);
        DfxVisualBuilder.initGraphicalControls();
        $('#'+id).wizard('reloadProps');

        var editor = ace.edit( 'dfx_src_editor' );
        var wgt_definition = JSON.parse( editor.getValue() );
        DfxVisualBuilder.findComponentAndUpdateAttributes( id, wgt_definition.definition, attributes, false );
        editor.setValue( JSON.stringify( wgt_definition, null, '\t' ), 0 );
        editor.gotoLine(1);

        var el = $( '#'+id );
        DfxVisualBuilder.updateSelectedBox(el);
    }
}