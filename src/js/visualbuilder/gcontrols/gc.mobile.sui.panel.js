/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/* GC Mobile SUI Panel */

var gc_mobile_panel = {
    "label": "Panel",
    "category": "layout",
    "subcontrol": true,
    "attributeDefinition": {
        "categories": [
            {"id": "main_props",
                "label": "Main Properties",
                "expanded": true,
                "properties": [
                    { "id": "name", "label": "Name:", "type": "value", "default": "pnlPanel", "propType": "input" },
                    { "id": "controller", "label": "Controller:", "type": "value", "default": "", "propType": "input-picker", "picker": "input" },
                    { "id": "form", "label": "Form:", "type": "value", "default": "frmForm", "propType": "input" }
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
                    { "id": "bodyClasses", "label": "Classes:", "type": "value", "default": "", "propType": "input-picker", "picker": "class" },
                    { "id": "bodyDynamicClasses", "label": "Dynamic Classes:", "type": "value", "default": "", "propType": "input-picker", "picker": "exp" },
                    { "id": "bodyCss", "type": "css", "propType": "input-css", "cssOptions": [ "width", "height", "color", "background", "padding", "margin", "text-align" ] },
                    { "id": "bodyStyle", "label": "Custom CSS:", "type": "value", "default": "", "propType": "input" }
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
            }
        ]
    },
    "createDefinition": function( component_id, container_id ) {
        return {
            id: component_id,
            type: "panel",
            attributes: {
                "name": { "value": "pnlPanel1" },
                "controller": { "value": "" },
                "form": { "value": "" },
                "classes": { "value": "" },
                "css": {
                    "color": "",
                    "background": "",
                    "padding": "",
                    "margin": "",
                    "text-align": ""
                },
                "bodyClasses": { "value": "" },
                "bodyDynamicClasses": { "value": "" },
                "bodyCss": {
                    "width": "",
                    "height": "",
                    "color": "",
                    "background": "",
                    "padding": "",
                    "margin": "",
                    "text-align": ""
                },
                "style": { "value": "" },
                "display": { "value": "" }
            },
            children: [],
            container: container_id
        };
    },
    "renderDesign": function( component ) {
        if (!component.attributes) {
            component.attributes = {
                "name": { "value": "pnlPanel1" },
                "controller": { "value": "" },
                "form": { "value": "" },
                "classes": { "value": "" },
                "style": { "value": "" },
                "display": { "value": "" }
            };
        }

        /* For Migration Only, must be removed in the next release */
        if (!component.attributes.layout) {
            component.attributes.layout = {
                rows: [{
                    classes: {value: ''},
                    dynamicClasses: {value: ''},
                    style: {value: ''}
                }],
                classes: {value: ''},
                dynamicClasses: {value: ''},
                style: {value: ''}
            };
        }
        if (!component.attributes.css) {
            component.attributes.css = {
                "width": "",
                "height": "",
                "color": "",
                "background": "",
                "padding": "",
                "margin": "",
                "text-align": ""
            };
        }
        if (!component.attributes.bodyCss) {
            component.attributes.bodyCss = {
                "width": "",
                "height": "",
                "color": "",
                "background": "",
                "padding": "",
                "margin": "",
                "text-align": ""
            };
        }
        if (!component.attributes.bodyClasses) {
            component.attributes.bodyClasses = { "value": "" };
        }
        if (!component.attributes.bodyDynamicClasses) {
            component.attributes.bodyDynamicClasses = { "value": "" };
        }
        /* End: Migration */

        var panelCss = '';
        $.each(component.attributes.css, function(key, value) {
            if (value!='') {
                panelCss += key + ':' + value + ';';
            }
        });

        var bodyCss = component.attributes.style.value + ';';
        $.each(component.attributes.bodyCss, function(key, value) {
            if (value!='') {
                bodyCss += key + ':' + value + ';';
            }
        });

        var instance_id = component.id,
            attr = component.attributes,
            top_offset = (instance_id=='root') ? 'margin-top:118px;' : '',
            left_offset = (instance_id=='root') ? 'margin-left:38px;' : '',
            right_offset = (instance_id=='root') ? 'margin-right:38px;' : '',
            fragment_html = '<div id="' + instance_id + '" class="' + attr.classes.value + '" style="' + top_offset + left_offset + right_offset + panelCss + '" gc-role="control" gc-type="panel">';

        fragment_html += '<div id="' + instance_id + '_body" class="ui segment ' + attr.bodyClasses.value + '" style="' + bodyCss + '">';

        // layout
        fragment_html += gc_mobile_layout.renderDesign(component.attributes.layout, component.id, 0);

        fragment_html += '</div></div>';

        var component_instance = {
            "id": instance_id,
            "fragment": fragment_html
        };
        return component_instance;
    },
    "loadPropertyPanel": function(gc_component_definition) {
        var id = gc_component_definition.id,
            attr = gc_component_definition.attributes;

        /* For Migration Only, must be removed in the next release */
        if (!attr.layout) {
            attr.layout = {
                rows: [],
                classes: {value: ''},
                dynamicClasses: {value: ''},
                style: {value: ''}
            };
        }
        if (!attr.css) {
            attr.css = {
                "width": "",
                "height": "",
                "color": "",
                "background": "",
                "padding": "",
                "margin": "",
                "text-align": ""
            };
        }
        if (!attr.bodyCss) {
            attr.bodyCss = {
                "width": "",
                "height": "",
                "color": "",
                "background": "",
                "padding": "",
                "margin": "",
                "text-align": ""
            };
        }
        if (!attr.bodyClasses) {
            attr.bodyClasses = { "value": "" };
        }
        if (!attr.bodyDynamicClasses) {
            attr.bodyDynamicClasses = { "value": "" };
        }
        /* End: Migration */

        var name = attr.name ? attr.name.value : "",
            controller = attr.controller ? attr.controller.value : "",
            form = attr.form ? attr.form.value : "",
            classes = attr.classes ? attr.classes.value : "",
            bodyClasses = attr.bodyClasses ? attr.bodyClasses.value : "",
            bodyDynamicClasses = attr.bodyDynamicClasses ? attr.bodyDynamicClasses.value : "",
            css = attr.css,
            bodyCss = attr.bodyCss,
            style = attr.style ? attr.style.value : "",
            display = attr.display ? attr.display.value : "";

        $( '#gc_panel_attr_id').val( id );
        $( '#gc_panel_attr_name').val( name );
        $( '#gc_panel_attr_controller').val( controller).focus();
        $( '#gc_panel_attr_form').val( form );
        $( '#gc_panel_attr_classes').val( classes );
        $( '#gc_panel_body_attr_classes').val( bodyClasses );
        $( '#gc_panel_body_attr_dynamicClasses').val( bodyDynamicClasses );
        $( '#gc_panel_attr_css_width').val( css.width );
        $( '#gc_panel_attr_css_height').val( css.height );
        $( '#gc_panel_attr_css_color').val( css.color );
        $( '#gc_panel_attr_css_background').val( css.background );
        $( '#gc_panel_attr_css_padding').val( css.padding );
        $( '#gc_panel_attr_css_margin').val( css.margin );
        $( '#gc_panel_attr_css_alignment').val( css["text-align"] );
        $( '#gc_panel_body_attr_css_width').val( bodyCss.width );
        $( '#gc_panel_body_attr_css_height').val( bodyCss.height );
        $( '#gc_panel_body_attr_css_color').val( bodyCss.color );
        $( '#gc_panel_body_attr_css_background').val( bodyCss.background );
        $( '#gc_panel_body_attr_css_padding').val( bodyCss.padding );
        $( '#gc_panel_body_attr_css_margin').val( bodyCss.margin );
        $( '#gc_panel_body_attr_css_alignment').val( bodyCss["text-align"] );
        $( '#gc_panel_attr_style').val( style );
        $( '#gc_panel_attr_display').val( display );
        $( '#gc_panel_attr_layout').val(JSON.stringify(gc_component_definition.attributes.layout));
        $( '#gc_panel_attr_layout_link' ).click( function () {
            $( '#' +gc_component_definition.id + '_layout_0' ).click();
        });

        $('#panelCssColorPicker').colorpicker({'container':'#panelCssColorPicker'});
        $('#panelCssBgcolorPicker').colorpicker({'container':'#panelCssBgcolorPicker'});
        $('#panelBodyCssColorPicker').colorpicker({'container':'#panelBodyCssColorPicker'});
        $('#panelBodyCssBgcolorPicker').colorpicker({'container':'#panelBodyCssBgcolorPicker'});

        $('.dfx_visual_editor_property_input').change( function() {
            DfxVisualBuilder.propertyPanelChanged();
        });
    },
    "savePropertyPanel": function() {
        var id = $( '#gc_panel_attr_id').val(),
            name = $( '#gc_panel_attr_name').val(),
            controller = $( '#gc_panel_attr_controller').val(),
            form = $( '#gc_panel_attr_form').val(),
            classes = $( '#gc_panel_attr_classes').val(),
            style = $( '#gc_panel_attr_style').val(),
            display = $( '#gc_panel_attr_display').val(),
            layout = $( '#gc_panel_attr_layout').val(),
            cssWidth = $( '#gc_panel_attr_css_width').val(),
            cssHeight = $( '#gc_panel_attr_css_height').val(),
            cssColor = $( '#gc_panel_attr_css_color').val(),
            cssBackground = $( '#gc_panel_attr_css_background').val(),
            cssPadding = $( '#gc_panel_attr_css_padding').val(),
            cssMargin = $( '#gc_panel_attr_css_margin').val(),
            cssAlignment = $( '#gc_panel_attr_css_alignment').val(),
            bodyCssWidth = $( '#gc_panel_body_attr_css_width').val(),
            bodyCssHeight = $( '#gc_panel_body_attr_css_height').val(),
            bodyCssColor = $( '#gc_panel_body_attr_css_color').val(),
            bodyCssBackground = $( '#gc_panel_body_attr_css_background').val(),
            bodyCssPadding = $( '#gc_panel_body_attr_css_padding').val(),
            bodyCssMargin = $( '#gc_panel_body_attr_css_margin').val(),
            bodyCssAlignment = $( '#gc_panel_body_attr_css_alignment').val(),
            bodyClasses = $( '#gc_panel_body_attr_classes').val(),
            bodyDynamicClasses = $( '#gc_panel_body_attr_dynamicClasses').val(),
            elIsChange = $('#gc_panel_attr_changePanel'),
            el = $( '#'+id),
            attributes = {
                "name": { "value": name },
                "controller": { "value": controller },
                "form": { "value": form },
                "classes": { "value": classes },
                "display": { "value": display },
                "css": {
                    "width": cssWidth,
                    "height": cssHeight,
                    "color": cssColor,
                    "background": cssBackground,
                    "padding": cssPadding,
                    "margin": cssMargin,
                    "text-align": cssAlignment
                },
                "bodyCss": {
                    "width": bodyCssWidth,
                    "height": bodyCssHeight,
                    "color": bodyCssColor,
                    "background": bodyCssBackground,
                    "padding": bodyCssPadding,
                    "margin": bodyCssMargin,
                    "text-align": bodyCssAlignment
                },
                "bodyClasses": { "value": bodyClasses },
                "bodyDynamicClasses": { "value": bodyDynamicClasses },
                "style": { "value": style }
            };

        if(layout){
            attributes.layout = JSON.parse(layout);
        }

        var panelCss = '';
        $.each(attributes.css, function(key, value) {
            if (value!='') {
                panelCss += key + ':' + value + ';';
            }
        });
        var top_offset = (id=='root') ? 'margin-top:118px;' : '',
            left_offset = (id=='root') ? 'margin-left:38px;' : '',
            right_offset = (id=='root') ? 'margin-right:38px;' : '';
        panelCss += top_offset + left_offset + right_offset;

        var bodyCss = style+';';

        $.each(attributes.bodyCss, function(key, value) {
            if (value!='') {
                bodyCss += key + ':' + value + ';';
            }
        });

        if(elIsChange.val() == '1'){

            //$( '.panel-body',el).html(fragment_html);
            //DfxVisualBuilder.initGraphicalControls();
            elIsChange.val("");
        }
        el.attr({ 'class': classes, 'style': panelCss });

        $( '#'+id+ '_body').attr('style', bodyCss );
        $( '#'+id+ '_body').attr('class', 'ui segment ' + bodyClasses );

        var editor = ace.edit( 'dfx_src_editor' );
        var wgt_definition = JSON.parse( editor.getValue() );

        DfxVisualBuilder.findComponentAndUpdateAttributes( id, wgt_definition.definition, attributes, false );

        editor.setValue( JSON.stringify( wgt_definition, null, '\t' ), 0 );
        editor.gotoLine(1);

        // re-select the component
        DfxVisualBuilder.initPropertyPanelChange();
        DfxVisualBuilder.updateSelectedBox(el);
    }
}