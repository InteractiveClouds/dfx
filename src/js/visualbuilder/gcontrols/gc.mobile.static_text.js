/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/* GC Mobile Static Text */

var gc_mobile_statictext = {
    "label": "Static Text",
    "category": "default",
    "default_classes": "dfx_visual_editor_draggable dfx_visual_editor_gc_draggable",
    "attributeDefinition": {
        "categories": [
            {"id": "main_props",
                "label": "Main Properties",
                "expanded": true,
                "properties": [
                    { "id": "name", "label": "Name:", "type": "value", "default": "txtText", "propType": "input" },
                    { "id": "text", "label": "Text:", "type": "value", "default": "", "propType": "input-picker", "picker": "exptext" },
                    { "id": "tooltip", "label": "Tooltip:", "type": "value", "default": "", "propType": "input-picker", "picker": "exptext" },
                    { "id": "tooltipPosition", "label": "Tooltip Position:", "type": "value", "default": "top", "propType": "select", "selectOptions": "tooltipPosition" }
                ]
            },
            {"id": "data_props",
                "label": "Data & Binding options",
                "expanded": false,
                "properties": [
                    { "id": "bind", "label": "Variable:", "type": "value", "default": "", "propType": "input-picker", "picker": "bind" }
                ]
            },
            {"id": "counter_props",
                "label": "Counter",
                "expanded": false,
                "properties": [
                    { "id": "counter", "label": "Counter:", "type": "counter", "propType": "input-counter" }
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
                    { "id": "classes", "label": "Classes:", "type": "value", "default": "btn-primary", "propType": "input-picker", "picker": "class" },
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
        return {
            id: component_id,
            type: "statictext",
            attributes: {
                "name": { "value": "txtStaticText" },
                "bind": { "value": "" },
                "text": { "value": "Sample Text" },
                "display": { "value": "true" },
                "tooltip": {"value": ""},
                "tooltipPosition": {"value": "top"},
                "counter":{
                    "bind": { "value": "" },
                    "onclick": { "value": "" },
                    "position": { "value": "" }
                },
                "containerClasses": { "value": "" },
                "containerDynamicClasses": { "value": "" },
                "containerStyle": { "value": "" },
                "containerCss": {
                    "width": "",
                    "height": "",
                    "color": "",
                    "background": "",
                    "padding": "",
                    "margin": "",
                    "text-align": ""
                },
                "css": {
                    "width": "",
                    "height": "",
                    "color": "",
                    "background": "",
                    "padding": "",
                    "margin": "",
                    "text-align": ""
                },
                "classes": { "value": "" },
                "dynamicClasses": { "value": "" },
                "style": { "value": "" },
                "onclick": { "value": "" }
            },
            children: [],
            container: container_id
        };
    },
    "renderDesign": function( component ) {
        if (!component.attributes) {
            component.attributes = {
                "name": { "value": "" },
                "bind": { "value": "" },
                "text": { "value": "Sample Text" },
                "display": { "value": "true" },
                "tooltip": {"value": ""},
                "tooltipPosition": {"value": "top"},
                "counter":{
                    "bind": { "value": "" },
                    "onclick": { "value": "" },
                    "position": { "value": "" }
                },
                "containerClasses": { "value": "" },
                "containerDynamicClasses": { "value": "" },
                "containerStyle": { "value": "" },
                "containerCss": {
                    "width": "",
                    "height": "",
                    "color": "",
                    "background": "",
                    "padding": "",
                    "margin": "",
                    "text-align": ""
                },
                "css": {
                    "width": "",
                    "height": "",
                    "color": "",
                    "background": "",
                    "padding": "",
                    "margin": "",
                    "text-align": ""
                },
                "classes": { "value": "" },
                "dynamicClasses": { "value": "" },
                "style": { "value": "" },
                "onclick": { "value": "" }
            }
        }

        /* For Migration Only, must be removed in the next release */
        if (!component.attributes.containerClasses) component.attributes.containerClasses = { "value": "" };
        if (!component.attributes.containerDynamicClasses) component.attributes.containerDynamicClasses = { "value": "" };
        if (!component.attributes.containerStyle) component.attributes.containerStyle = { "value": "" };
        if (!component.attributes.onclick) component.attributes.onclick = { "value": "" };
        if (!component.attributes.containerCss) {
            component.attributes.containerCss = {
                "width": "",
                "height": "",
                "color": "",
                "background": "",
                "padding": "",
                "margin": "",
                "text-align": ""
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
        /* End: Migration */

        var containerCss = '';
        $.each(component.attributes.containerCss, function(key, value) {
            if (value!='') {
                containerCss += key + ':' + value + ';';
            }
        });

        var css = '';
        $.each(component.attributes.css, function(key, value) {
            if (value!='') {
                css += key + ':' + value + ';';
            }
        });

        var fragment_html;
        fragment_html = '<div id="' + component.id + '"  gc-role="control" gc-type="statictext" ' +
            'style="position:relative;' + (component.attributes.containerStyle ? component.attributes.containerStyle.value : '') + ';' + containerCss + '" ' +
            'class="' + gc_mobile_statictext.default_classes + (component.attributes.containerClasses.value != "" ? ' '+component.attributes.containerClasses.value : '') + '">';
        if (component.attributes.counter && component.attributes.counter.bind.value) {
            if (component.attributes.counter.position.value == 'left') {
                fragment_html += '<span class="badge" style="margin-right:5px">3</span>';
            }
        }
        var text_value;
        if (component.attributes.bind && component.attributes.bind.value!='') {
            text_value = '{{'+component.attributes.bind.value+'}}';
        } else {
            if (component.attributes.text.value.indexOf('{{')>-1 && component.attributes.text.value.indexOf('}}')>-1) {
                text_value = '{{expression}}';
            } else {
                text_value = component.attributes.text.value;
            }
        }
        fragment_html += '<div id="' + component.id + '_text" ' +
            'style="' + (component.attributes.style ? component.attributes.style.value : '') + ';' + css + '" ' +
            'class="' + (component.attributes.classes.value != "" ? ' '+component.attributes.classes.value : '') + '">' +
            text_value +
            '</div>';
        if (component.attributes.counter && component.attributes.counter.bind.value) {
            if (component.attributes.counter.position.value == 'right') {
                fragment_html += '<span class="badge" style="margin-left:5px">3</span>';
            }
        }
        fragment_html += '</div>';

        return {
            "id": component.id,
            "fragment": fragment_html
        };

    },
    "loadPropertyPanel": function(gc_component_definition) {
        /* For Migration Only, must be removed in the next release */
        if (!gc_component_definition.attributes.containerClasses) gc_component_definition.attributes.containerClasses = { "value": "" };
        if (!gc_component_definition.attributes.containerDynamicClasses) gc_component_definition.attributes.containerDynamicClasses = { "value": "" };
        if (!gc_component_definition.attributes.containerStyle) gc_component_definition.attributes.containerStyle = { "value": "" };
        if (!gc_component_definition.attributes.onclick) gc_component_definition.attributes.onclick = { "value": "" };
        if (!gc_component_definition.attributes.containerCss) {
            gc_component_definition.attributes.containerCss = {
                "width": "",
                "height": "",
                "color": "",
                "background": "",
                "padding": "",
                "margin": "",
                "text-align": ""
            };
        }
        if (!gc_component_definition.attributes.css) {
            gc_component_definition.attributes.css = {
                "width": "",
                "height": "",
                "color": "",
                "background": "",
                "padding": "",
                "margin": "",
                "text-align": ""
            };
        }
        /* End: Migration */

        $( '#gc_statictext_attr_id').val( gc_component_definition.id );
        $( '#gc_statictext_attr_name').val( gc_component_definition.attributes.name.value );
        $( '#gc_statictext_attr_bind').val( gc_component_definition.attributes.bind.value );
        $( '#gc_statictext_attr_text').val( gc_component_definition.attributes.text.value ).focus();
        $( '#gc_statictext_attr_display').val( gc_component_definition.attributes.display && gc_component_definition.attributes.display.value || '');
        $( '#gc_statictext_attr_counterBind').val(gc_component_definition.attributes.counter ? gc_component_definition.attributes.counter.bind.value : '');
        $( '#gc_statictext_attr_counterOnClick').val(gc_component_definition.attributes.counter ? gc_component_definition.attributes.counter.onclick.value : '');
        $( '#gc_statictext_attr_counterPosition').val(gc_component_definition.attributes.counter ? gc_component_definition.attributes.counter.position.value : 'right');
        $( '#gc_statictext_attr_tooltip').val( gc_component_definition.attributes.tooltip ? gc_component_definition.attributes.tooltip.value : "" );
        $( '#gc_statictext_attr_tooltipPosition').val( gc_component_definition.attributes.tooltipPosition ? gc_component_definition.attributes.tooltipPosition.value : "top" );

        $( '#gc_container_attr_classes').val( gc_component_definition.attributes.containerClasses.value );
        $( '#gc_container_attr_dynamicClasses').val( gc_component_definition.attributes.containerDynamicClasses ? gc_component_definition.attributes.containerDynamicClasses.value : "" );
        $( '#gc_container_attr_style').val( gc_component_definition.attributes.style ? gc_component_definition.attributes.style.value : "");
        $( '#gc_container_attr_css_width').val( gc_component_definition.attributes.containerCss.width );
        $( '#gc_container_attr_css_height').val( gc_component_definition.attributes.containerCss.height );
        $( '#gc_container_attr_css_color').val( gc_component_definition.attributes.containerCss.color );
        $( '#gc_container_attr_css_background').val( gc_component_definition.attributes.containerCss.background );
        $( '#gc_container_attr_css_padding').val( gc_component_definition.attributes.containerCss.padding );
        $( '#gc_container_attr_css_margin').val( gc_component_definition.attributes.containerCss.margin );
        $( '#gc_container_attr_css_alignment').val( gc_component_definition.attributes.containerCss["text-align"] );

        $( '#gc_component_attr_classes').val( gc_component_definition.attributes.classes.value );
        $( '#gc_component_attr_dynamicClasses').val( gc_component_definition.attributes.dynamicClasses ? gc_component_definition.attributes.dynamicClasses.value : "" );
        $( '#gc_component_attr_style').val( gc_component_definition.attributes.style ? gc_component_definition.attributes.style.value : "");
        $( '#gc_component_attr_css_width').val( gc_component_definition.attributes.css.width );
        $( '#gc_component_attr_css_height').val( gc_component_definition.attributes.css.height );
        $( '#gc_component_attr_css_color').val( gc_component_definition.attributes.css.color );
        $( '#gc_component_attr_css_background').val( gc_component_definition.attributes.css.background );
        $( '#gc_component_attr_css_padding').val( gc_component_definition.attributes.css.padding );
        $( '#gc_component_attr_css_margin').val( gc_component_definition.attributes.css.margin );
        $( '#gc_component_attr_css_alignment').val( gc_component_definition.attributes.css["text-align"] );

        $( '#gc_statictext_attr_onclick').val(gc_component_definition.attributes.onclick ? gc_component_definition.attributes.onclick.value : "")

        $('#containerCssColorPicker').colorpicker({'container':'#containerCssColorPicker'});
        $('#containerCssBgcolorPicker').colorpicker({'container':'#containerCssBgcolorPicker'});
        $('#componentCssColorPicker').colorpicker({'container':'#componentCssColorPicker'});
        $('#componentCssBgcolorPicker').colorpicker({'container':'#componentCssBgcolorPicker'});

        $('.dfx_visual_editor_property_input').change( function(e) {
            DfxVisualBuilder.propertyPanelChanged();
        });

    },
    "savePropertyPanel": function() {
        var id = $( '#gc_statictext_attr_id').val(),
            name = $( '#gc_statictext_attr_name').val(),
            bind = $( '#gc_statictext_attr_bind').val(),
            text = $( '#gc_statictext_attr_text').val(),
            display = $( '#gc_statictext_attr_display').val(),
            counterBind = $( '#gc_statictext_attr_counterBind').val(),
            counterOnClick = $( '#gc_statictext_attr_counterOnClick').val(),
            counterPosition = $( '#gc_statictext_attr_counterPosition').val(),
            tooltip = $( '#gc_statictext_attr_tooltip').val(),
            tooltipPosition = $( '#gc_statictext_attr_tooltipPosition').val() || 'top',
            classes = $( '#gc_component_attr_classes').val(),
            dynClasses = $( '#gc_component_attr_dynamicClasses').val(),
            style = $( '#gc_component_attr_style').val(),
            cssWidth = $( '#gc_component_attr_css_width').val(),
            cssHeight = $( '#gc_component_attr_css_height').val(),
            cssColor = $( '#gc_component_attr_css_color').val(),
            cssBackground = $( '#gc_component_attr_css_background').val(),
            cssPadding = $( '#gc_component_attr_css_padding').val(),
            cssMargin = $( '#gc_component_attr_css_margin').val(),
            cssAlignment = $( '#gc_component_attr_css_alignment').val(),
            containerClasses = $( '#gc_container_attr_classes').val(),
            containerDynClasses = $( '#gc_container_attr_dynamicClasses').val(),
            containerStyle = $( '#gc_container_attr_style').val(),
            containerCssWidth = $( '#gc_container_attr_css_width').val(),
            containerCssHeight = $( '#gc_container_attr_css_height').val(),
            containerCssColor = $( '#gc_container_attr_css_color').val(),
            containerCssBackground = $( '#gc_container_attr_css_background').val(),
            containerCssPadding = $( '#gc_container_attr_css_padding').val(),
            containerCssMargin = $( '#gc_container_attr_css_margin').val(),
            containerCssAlignment = $( '#gc_container_attr_css_alignment').val(),
            onclick = $( '#gc_statictext_attr_onclick').val(),
            el = $('#' + id);

        var attributes = {
            "name": { "value": name },
            "bind": { "value": bind },
            "text": { "value": text },
            "display": { "value": display },
            "tooltip": {"value": tooltip},
            "tooltipPosition": {"value": tooltipPosition},
            "counter":{
                "bind": { "value": counterBind },
                "onclick": { "value": counterOnClick },
                "position": { "value": counterPosition }
            },
            "onclick": { "value": onclick },
            "classes": { "value": classes },
            "dynamicClasses": { "value": dynClasses },
            "style": { "value": style },
            "css": {
                "width": cssWidth,
                "height": cssHeight,
                "color": cssColor,
                "background": cssBackground,
                "padding": cssPadding,
                "margin": cssMargin,
                "text-align": cssAlignment
            },
            "containerClasses": { "value": containerClasses },
            "containerDynamicClasses": { "value": containerDynClasses },
            "containerStyle": { "value": containerStyle },
            "containerCss": {
                "width": containerCssWidth,
                "height": containerCssHeight,
                "color": containerCssColor,
                "background": containerCssBackground,
                "padding": containerCssPadding,
                "margin": containerCssMargin,
                "text-align": containerCssAlignment
            }
        };

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
            'class': gc_mobile_statictext.default_classes + ' ' + containerClasses,
            'style': 'position:relative;' + containerStyle + ';' + containerCss
        });

        $('#'+id+'_text').attr( {
            'class': classes,
            'style': style + ';' + css
        });

        var text_value;
        if (attributes.bind && attributes.bind.value!='') {
            text_value = '{{'+attributes.bind.value+'}}';
        } else {
            if (attributes.text.value.indexOf('{{')>-1 && attributes.text.value.indexOf('}}')>-1) {
                text_value = '{{expression}}';
            } else {
                text_value = attributes.text.value;
            }
        }
        $('#'+id+'_text').text( text_value );

        $('#'+id + ' > span.badge').remove();

        if (counterBind) {
            if (counterPosition == 'left'){
                $('#'+id).prepend('<span class="badge" style="margin-right:5px">3</span>');
            } else {
                $('#'+id).append('<span class="badge" style="margin-left:5px">3</span>');
            }
        }

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