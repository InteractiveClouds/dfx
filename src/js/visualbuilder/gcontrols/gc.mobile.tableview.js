/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/* GC Mobile Table View */

var gc_mobile_tableview = {
    "label": "Table View",
    "category": "default",
    "default_classes": "dfx_visual_editor_draggable dfx_visual_editor_gc_draggable",
    "attributeDefinition": {
        "categories": [
            {"id": "main_props",
                "label": "Main Properties",
                "expanded": true,
                "properties": [
                    { "id": "name", "label": "Name:", "type": "value", "default": "tblTableView", "propType": "input" }
                ]
            },
            {"id": "data_props",
                "label": "Data & Binding options",
                "expanded": false,
                "properties": [
                    { "id": "property", "label": "Variable:", "type": "value", "default": "", "propType": "input-picker", "picker": "bind" },
                    { "id": "dynamicOptions", "label": "Dynamic:", "type": "dynamicBindOptionsTableView", "default": "no", "propType": "input-dynamicBindOptionsTableView" },
                    { "id": "staticOptions", "label": "Static:", "type": "staticBindOptionsTableView", "propType": "popup-staticBindOptionsTableView" }
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
                    { "id": "containerCss", "type": "css", "propType": "input-css", "cssOptions": [ "width", "height", "color", "background", "padding", "margin", "text-align" ] },
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
                    { "id": "onclick", "label": "On Click:", "type": "value", "default": "", "propType": "input-picker", "picker": "evt" }
                ]
            }
        ]
    },
    "createDefinition": function( component_id, container_id ) {
        var default_attributes = gc_factory.getDefaultAttributes( gc_mobile_tableview.attributeDefinition );
        return {
            id: component_id,
            type: "tableview",
            attributes: default_attributes,
            children: [],
            container: container_id
        };
    },
    "renderDesign": function( component ) {
        var attributes = (component.attributes) ? component.attributes : gc_factory.getDefaultAttributes( gc_mobile_tableview.attributeDefinition );;

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
        fragment_html = '<div id="' + component.id + '"  gc-role="control" gc-type="tableview" ' +
        'style="position:relative;' + attributes.containerStyle.value + ';' + containerCss + '" ' +
        'class="' + gc_mobile_tableview.default_classes + ' ' + (attributes.containerClasses.value != '' ? ' '+attributes.containerClasses.value : '') + '">';

        fragment_html += '<ul id="' + component.id + '_tableview" type="tableview" class="table-view ' +
        attributes.classes.value + '"' +
        ' style="' + ((attributes.style) ? attributes.style.value : '') + ';' + css + '">';

        if (attributes.dynamicOptions.value) {
            fragment_html += gc_mobile_tableview._private.getDynamicHtml(attributes.propertyOptionsFields);
        } else {
            fragment_html += gc_mobile_tableview._private.getStaticHtml(attributes.staticOptions);
        }
        fragment_html += '</ul>';

        var component_instance = {
            "id": component.id,
            "fragment": fragment_html
        };
        return component_instance;
    },
    "loadPropertyPanel": function(gc_component_definition) {
        if ( !gc_component_definition.attributes.staticOptions ) {
            gc_component_definition.attributes.staticOptions = [{ "value": "Item 1", "icon": "icon-pages", "chevron": '' }];
        }
        if ( !gc_component_definition.attributes.propertyOptionsFields ) {
            gc_component_definition.attributes.propertyOptionsFields = {
                "value": "value",
                "icon": "icon",
                "chevron":"chevron"
            };
        }

        $( '#gc_tableview_attr_id').val( gc_component_definition.id );
        gc_factory.generatePropertyPanel( gc_mobile_tableview.attributeDefinition, gc_component_definition );

        var attr = gc_component_definition.attributes;
        attr.type = 'tableview';

        CustomModal.init('tableView', attr);

        $('.dfx_visual_editor_property_input').change( function(e) {
            DfxVisualBuilder.propertyPanelChanged();
        });

        PickerImageModal.icons.fillModal('iconsModal');
    },
    "savePropertyPanel": function() {
        var id = $( '#gc_tableview_attr_id').val();

        var attributes = gc_factory.getPropertiesFromPanel( gc_mobile_tableview.attributeDefinition );

        var dynamicOptions = $('#gc_component_attr_dynamicOptions').is(':checked'),
            style = attributes.style.value || '',
            classes = attributes.classes.value || 'table-view',
            el = $('#'+id),
            fragment_html = '';

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
            'class': gc_mobile_tableview.default_classes + ' ' + attributes.containerClasses.value,
            'style': 'position:relative;' + attributes.containerStyle.value + ';' + containerCss
        });

        $('#'+id+'_label').attr( {
            'class': classes,
            'style': style + ';' + css
        });

        if (attributes.onclick.value) {
            attributes.onclick.value = attributes.onclick.value.replace(/\(.*?\)/g, "");
        }

        if (dynamicOptions) {
            fragment_html += gc_mobile_tableview._private.getDynamicHtml(attributes.propertyOptionsFields);
        } else {
            fragment_html += gc_mobile_tableview._private.getStaticHtml(attributes.staticOptions);
        }
        el.find('ul').html(fragment_html);

        var editor = ace.edit( 'dfx_src_editor' );
        var wgt_definition = JSON.parse( editor.getValue() );

        DfxVisualBuilder.findComponentAndUpdateAttributes( id, wgt_definition.definition, attributes, false );

        editor.setValue( JSON.stringify( wgt_definition, null, '\t' ), 0 );
        editor.gotoLine(1);

        DfxVisualBuilder.initPropertyPanelChange();
        DfxVisualBuilder.updateSelectedBox(el);
    },
    "_private": {
        "getDynamicHtml": function(propertyOptionsFields) {
            var dynamic_html = '';
            var chevrons_html_start = (propertyOptionsFields.chevron) ? '<a class="navigate-right">' : '';
            var chevrons_html_end = (propertyOptionsFields.chevron) ? '</a>' : '';

            if (propertyOptionsFields.icon) {
                dynamic_html += '<li class="table-view-cell media">' + chevrons_html_start + '<span class="media-object pull-left icon icon-trash"></span><div class="media-body">Item 1</div>' + chevrons_html_end + '</li>';
                dynamic_html += '<li class="table-view-cell media">' + chevrons_html_start + '<span class="media-object pull-left icon icon-gear"></span><div class="media-body">Item 2</div>' + chevrons_html_end + '</li>';
                dynamic_html += '<li class="table-view-cell media">' + chevrons_html_start + '<span class="media-object pull-left icon icon-pages"></span><div class="media-body">Item 3</div>' + chevrons_html_end + '</li>';
            } else {
                dynamic_html += '<li class="table-view-cell">' + chevrons_html_start + 'Item 1' + chevrons_html_end + '</li>';
                dynamic_html += '<li class="table-view-cell">' + chevrons_html_start + 'Item 2' + chevrons_html_end + '</li>';
                dynamic_html += '<li class="table-view-cell">' + chevrons_html_start + 'Item 3' + chevrons_html_end + '</li>';
            }
            return dynamic_html;
        },
        "getStaticHtml": function(staticOptions) {
            var static_html = '';
            for (var i= 0, len = staticOptions.length; i<len; i++) {
                static_html += '<li class="table-view-cell media">';
                var valueToShow = (staticOptions[i].label) ? staticOptions[i].label : staticOptions[i].value;
                if (staticOptions[i].icon) {
                    static_html += (staticOptions[i].chevron)
                        ?   '<a class="navigate-right">' +
                                '<span class="media-object pull-left icon icon-' + staticOptions[i].icon + '"></span>' +
                                '<div class="media-body">' + valueToShow + '</div>' +
                            '</a>'
                        :   '<span class="media-object pull-left icon icon-' + staticOptions[i].icon + '"></span>' +
                            '<div class="media-body">' + valueToShow + '</div>';
                } else {
                    static_html += (staticOptions[i].chevron) ? '<a class="navigate-right">' + valueToShow + '</a>' : staticOptions[i].value;
                }
                static_html += '</li>';
            }
            return static_html;
        }
    }
};