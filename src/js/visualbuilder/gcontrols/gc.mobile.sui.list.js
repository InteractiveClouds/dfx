/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/* GC Mobile SUI List */

var gc_mobile_list = {
    "label": "List",
    "category": "default",
    "default_classes": "dfx_visual_editor_draggable dfx_visual_editor_gc_draggable",
    "attributeDefinition": {
        "categories": [
            {"id": "main_props",
                "label": "Main Properties",
                "expanded": true,
                "properties": [
                    { "id": "name", "label": "Name:", "type": "value", "default": "listList", "propType": "input" },
                    { "id": "size", "label": "Size:", "type": "value", "default": "", "propType": "select", "selectOptions": "mobileSizes" }
                ]
            },
            {"id": "data_props",
                "label": "Data & Binding options",
                "expanded": false,
                "properties": [
                    { "id": "property", "label": "Variable:", "type": "value", "default": "", "propType": "input-picker", "picker": "bind" },
                    { "id": "header", "label": "Header:", "type": "value", "default": "", "propType": "input-picker", "picker": "exptext" },
                    { "id": "description", "label": "Description:", "type": "value", "default": "", "propType": "input-picker", "picker": "exptext" },
                    { "id": "icon", "label": "Icon:", "type": "value", "default": "", "propType": "input" },
                    { "id": "image", "label": "Image:", "type": "value", "default": "", "propType": "input" }
                ]
            },
            {"id": "rbutton_props",
                "label": "Right button options",
                "expanded": false,
                "properties": [
                    { "id": "rbdisplay", "label": "Visible:", "type": "value", "default": "no", "propType": "select", "selectOptions": "yesNo" },
                    { "id": "rblabel", "label": "Label:", "type": "value", "default": "OK", "propType": "input-picker", "picker": "exptext" },
                    { "id": "rbicon", "label": "Icon:", "type": "value", "default": "", "propType": "input-icon" },
                    { "id": "rbsize", "label": "Size:", "type": "value", "default": "", "propType": "select", "selectOptions": "mobileSizes" },
                    { "id": "rbcircular", "label": "Circular:", "type": "value", "default": "no", "propType": "select", "selectOptions": "yesNo" },
                    { "id": "rbstyle", "label": "CSS:", "type": "value", "default": "", "propType": "input" }
                ]
            },
            {"id": "rules_props",
                "label": "Presentation Rules",
                "expanded": false,
                "properties": [
                    { "id": "display", "label": "Display Rule:", "type": "value", "default": "true", "propType": "input-picker", "picker": "exp" },
                    { "id": "disabled", "label": "Disabled Rule:", "type": "value", "default": "false", "propType": "input-picker", "picker": "exp" }
                ]
            },
            {"id": "container_props",
                "label": "Container CSS",
                "expanded": false,
                "properties": [
                    { "id": "containerClasses", "label": "Classes:", "type": "value", "default": "", "propType": "input-picker", "picker": "class" },
                    { "id": "containerDynamicClasses", "label": "Dynamic Classes:", "type": "value", "default": "", "propType": "input-picker", "picker": "exp" },
                    { "id": "containerCss", "type": "css", "default": {"width": "100%"}, "propType": "input-css", "cssOptions": [ "width", "height", "color", "background", "padding", "margin", "text-align" ] },
                    { "id": "containerStyle", "label": "Custom CSS:", "type": "value", "default": "", "propType": "input" }
                ]
            },
            {"id": "component_props",
                "label": "Component CSS",
                "expanded": false,
                "properties": [
                    { "id": "classes", "label": "Classes:", "type": "value", "default": "", "propType": "input-picker", "picker": "class" },
                    { "id": "dynamicClasses", "label": "Dynamic Classes:", "type": "value", "default": "", "propType": "input-picker", "picker": "exp" },
                    { "id": "css", "type": "css", "propType": "input-css", "cssOptions": [ "width", "height", "color", "background", "padding", "margin", "text-align" ] },
                    { "id": "style", "label": "Custom CSS:", "type": "value", "default": "", "propType": "input" }
                ]
            },
            {"id": "event_props",
                "label": "Events",
                "expanded": false,
                "properties": [
                    { "id": "onclick", "label": "On Click:", "type": "value", "default": "", "propType": "input-picker", "picker": "evt" },
                    { "id": "onrbclick", "label": "On Click Button:", "type": "value", "default": "", "propType": "input-picker", "picker": "evt" }
                ]
            }
        ]
    },
    "createDefinition": function( component_id, container_id ) {
        var default_attributes = gc_factory.getDefaultAttributes( gc_mobile_list.attributeDefinition );
        return {
            id: component_id,
            type: "list",
            attributes: default_attributes,
            children: [],
            container: container_id
        };
    },
    "renderDesign": function( component ) {
        var attributes;
        if (!component.attributes) {
            attributes = gc_factory.getDefaultAttributes( gc_mobile_list.attributeDefinition );
        } else {
            attributes = gc_factory.migrateAttributes( gc_mobile_list.attributeDefinition, component.attributes );
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

        var fragment_html;


        fragment_html = '<div id="' + component.id + '"  gc-role="control" gc-type="list" ' +
            'style="position:relative;' + attributes.containerStyle.value + ';' + containerCss + '" ' +
            'class="' + gc_mobile_list.default_classes + ' ' + (attributes.containerClasses.value != '' ? ' '+attributes.containerClasses.value : '') + '">';

        var semantic_classes = 'ui list';
        var attr_size = (attributes.size.value=='') ? '' : ' '+attributes.size.value;
        var attr_header = (attributes.header.value=='') ? 'Header' : attributes.header.value;
        var attr_description = (attributes.description.value=='') ? 'Description' : attributes.description.value;
        var attr_icon = (attributes.icon.value=='') ? '' : '<i class="' + attributes.icon.value + ' icon" />';
        var attr_image = (attributes.image.value=='') ? '' : '<div class="ui avatar image" style="width:50px"><img src="/images/dfx_gc_image.png" /></div>';

        var attr_rb = '';
        if (attributes.rbdisplay.value=='yes') {
            var rb_circular = (attributes.rbcircular.value=='yes') ? ' circular' : '';
            if (attributes.rbicon.value=='') {
                attr_rb += '<div class="right floated compact ' + rb_circular + ' ui button" style="' + attributes.rbstyle.value + '">' + attributes.rblabel.value + '</div>';
            } else {
                attr_rb += '<div class="ui right floated button icon' + rb_circular + ' small" style="' + attributes.rbstyle.value + '"><i class="' + attributes.rbicon.value + ' icon" /></div>';
            }
        }

        var list_item = '<div class="item">' + attr_rb;
        if (attr_icon!='') {
            list_item += attr_icon;
        } else if (attr_image!='') {
            list_item += attr_image;
        }
        list_item += '<div class="content"><a class="header">' + attr_header + '</a><div class="description">' + attr_description + '</div></div></div>';

        fragment_html += '<div id="' + component.id + '_list" type="list" class="' + semantic_classes + attr_size + ' ' +
            attributes.classes.value + '"' +
            ' style="' + ((attributes.style) ? attributes.style.value : '') + ';'  + css + '">' +
            list_item +
            '</div>';


        var component_instance = {
            "id": component.id,
            "fragment": fragment_html
        };
        return component_instance;
    },
    "loadPropertyPanel": function(gc_component_definition) {

        $( '#gc_list_attr_id').val( gc_component_definition.id );
        gc_factory.generatePropertyPanel( gc_mobile_list.attributeDefinition, gc_component_definition );

        PickerImageModal.icons.fillModal('iconsModal');
    },
    "savePropertyPanel": function() {
        var attributes = gc_factory.getPropertiesFromPanel( gc_mobile_list.attributeDefinition );

        var id = $( '#gc_list_attr_id').val();

        var semantic_classes = 'ui list';
        var attr_size = (attributes.size.value=='') ? '' : ' '+attributes.size.value;
        var attr_header = (attributes.header.value=='') ? 'Header' : attributes.header.value;
        var attr_description = (attributes.description.value=='') ? 'Description' : attributes.description.value;
        var attr_icon = (attributes.icon.value=='') ? '' : '<i class="' + attributes.icon.value + ' icon" />';
        var attr_image = (attributes.image.value=='') ? '' : '<div class="ui avatar image" style="width:50px"><img src="/images/dfx_gc_image.png" /></div>';

        var attr_rb = '';
        if (attributes.rbdisplay.value=='yes') {
            var rb_circular = (attributes.rbcircular.value=='yes') ? ' circular' : '';
            if (attributes.rbicon.value=='') {
                attr_rb += '<div class="right floated compact ' + rb_circular + ' ui button" style="' + attributes.rbstyle.value + '">' + attributes.rblabel.value + '</div>';
            } else {
                attr_rb += '<div class="ui right floated button icon' + rb_circular + ' small" style="' + attributes.rbstyle.value + '"><i class="' + attributes.rbicon.value + ' icon" /></div>';
            }
        }

        var list_item = '<div class="item">' + attr_rb;
        if (attr_icon!='') {
            list_item += attr_icon;
        } else if (attr_image!='') {
            list_item += attr_image;
        }
        list_item += '<div class="content"><a class="header">' + attr_header + '</a><div class="description">' + attr_description + '</div></div></div>';

        var el = $( '#'+id+'_list' );

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
            'class': gc_mobile_list.default_classes + ' ' + attributes.containerClasses.value,
            'style': 'position:relative;' + attributes.containerStyle.value + ';' + containerCss
        });

        $('#'+id+'_list').attr( {
            'class': semantic_classes+attr_size+' '+attributes.classes.value,
            'style': attributes.style.value + ';' + css
        });
        $('#'+id+'_list').html( list_item );

        var editor = ace.edit( 'dfx_src_editor' );
        var wgt_definition = JSON.parse( editor.getValue() );

        DfxVisualBuilder.findComponentAndUpdateAttributes( id, wgt_definition.definition, attributes, false );

        editor.setValue( JSON.stringify( wgt_definition, null, '\t' ), 0 );
        editor.gotoLine(1);

        // re-select the component
        DfxVisualBuilder.initPropertyPanelChange();
        DfxVisualBuilder.updateSelectedBox(el);
    }
};
