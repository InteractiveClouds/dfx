/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/* GC Web Rating */

var gc_web_rating = {
    "label": "Rating",
    "category": "default",
    "default_classes": "dfx_visual_editor_draggable dfx_visual_editor_gc_draggable",
    "attributeDefinition": {
        "categories": [
            {"id": "main_props",
                "label": "Main Properties",
                "expanded": true,
                "properties": [
                    { "id": "name", "label": "Name:", "type": "value", "default": "rtRating", "propType": "input" },
                    { "id": "label", "label": "Label:", "type": "value", "default": "Label", "propType": "input-picker", "picker": "exptext" },
                    { "id": "labelVisible", "label": "Label Visible:", "type": "value", "default": "yes", "propType": "select", "selectOptions": "yesNo" },
                    { "id": "labelPosition", "label": "Label Position:", "type": "value", "default": "center", "propType": "select", "selectOptions": "horizontalPosition" },
                    { "id": "tooltip", "label": "Tooltip:", "type": "value", "default": "", "propType": "input-picker", "picker": "exptext" },
                    { "id": "tooltipPosition", "label": "Tooltip Position:", "type": "value", "default": "", "propType": "select", "selectOptions": "tooltipPosition" },
                    { "id": "min", "label": "Min:", "type": "value", "default": 0, "propType": "input" },
                    { "id": "max", "label": "Max:", "type": "value", "default": 5, "propType": "input" },
                    { "id": "step", "label": "Step:", "type": "value", "default": 1, "propType": "input" },
                    { "id": "symbol", "label": "Symbol:", "type": "object", "default": {"name": "star", "value": "&#57350;"}, "propType": "input-symbol" },
                    { "id": "symbolsNumber", "label": "Number of Symbols:", "type": "value", "default": 5, "propType": "input" },
                    { "id": "caption", "label": "Caption:", "type": "value", "default": "", "propType": "input-picker", "picker": "exptext" },
                    { "id": "captionVisible", "label": "Caption Visible:", "type": "value", "default": "no", "propType": "select", "selectOptions": "yesNo" },
                    { "id": "clearVisible", "label": "Clear Button Visible:", "type": "value", "default": "no", "propType": "select", "selectOptions": "yesNo" }
                ]
            },
            {"id": "data_props",
                "label": "Data & Binding options",
                "expanded": false,
                "properties": [
                    { "id": "property", "label": "Variable:", "type": "value", "default": "", "propType": "input-picker", "picker": "bind" },
                    { "id": "propertyInit", "label": "Initialize:", "type": "value", "default": "", "propType": "input-picker", "picker": "exp" }
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
                    { "id": "css", "type": "css", "propType": "input-css", "cssOptions": [ "size", "color", "background" ] },
                    { "id": "style", "label": "Custom CSS:", "type": "value", "default": "", "propType": "input" }
                ]
            },
            {"id": "event_props",
                "label": "Events",
                "expanded": false,
                "properties": [
                    { "id": "onchange", "label": "On Change:", "type": "value", "default": "", "propType": "input-picker", "picker": "evt" }
                ]
            }
        ]
    },
    "createDefinition": function( component_id, container_id ) {
        var default_attributes = gc_factory.getDefaultAttributes( gc_web_rating.attributeDefinition );
        return {
            id: component_id,
            type: "rating",
            attributes: default_attributes,
            children: [],
            container: container_id
        };
    },
    "renderDesign": function( component ) {
        var attributes;
        if (!component.attributes) {
            attributes = gc_factory.getDefaultAttributes( gc_web_rating.attributeDefinition );
        } else {
            attributes = gc_factory.migrateAttributes( gc_web_rating.attributeDefinition, component.attributes );
        }

        var containerCss = '';
        $.each(attributes.containerCss, function(key, value) {
            if (value!='') {
                containerCss += key + ':' + value + ';';
            }
        });

        var label_text = dfx_gc_common_helpers.showAsExpression(attributes.label.value),
            labelVisible = (attributes.labelVisible.value == "yes" ? true : false),
            clearVisible = (attributes.clearVisible.value == "yes" ? true : false),
            captionVisible = (attributes.captionVisible.value == "yes" ? true : false),
            size = attributes.css.size || "xs",
            color = attributes.css.color || '#fde16d',
            bgcolor = attributes.css.background || '#e3e3e3';

        var fragment_html = '<div id="' + component.id + '"  gc-role="control" gc-type="rating" ' +
            'style="display:inline-block;position:relative;' + attributes.containerStyle.value + ';' + containerCss + '" ' +
            'class="' + gc_web_rating.default_classes + (attributes.containerClasses.value != '' ? ' '+attributes.containerClasses.value : '') + '">';

        var labelPosition = attributes.labelPosition && attributes.labelPosition.value ? 'text-align:'+attributes.labelPosition.value: '';
        fragment_html += '<label id="' + component.id + '_label" for="' + component.id + '_rating"' +
            ' style="display:' + (labelVisible ? 'block' : 'none') + ';' + labelPosition + '">' + label_text + '</label>';

        fragment_html += '<input id="' + component.id + '_rating" style="' + (attributes.style ? attributes.style.value : '') +
            '" class="' + (attributes.classes.value != "" ? attributes.classes.value : '') +
            '" type="number" class="rating" value="3">' +
            '</div>';

        var dynamicProps = {
            readonly: true,
            min: parseInt(attributes.min.value),
            max: parseInt(attributes.max.value),
            step: parseInt(attributes.min.value),
            symbol: this.decodeHtmlEntity(attributes.symbol.value || "&#57350;"),
            stars: parseInt(attributes.symbolsNumber.value || 5),
            rtl: false,
            showClear: attributes.clearVisible.value == "yes" ? true : false,
            showCaption: attributes.captionVisible.value == "yes" ? true : false,
            size: attributes.css.size || "md"
        };

        var component_instance = {
            "id": component.id,
            "fragment": fragment_html,
            "callback": function(comp_inst) {
                $("#" + comp_inst.id + "_rating").rating(dynamicProps);
                $(".rating-stars", "#" + comp_inst.id).css({"color": color});
                $(".rating-container", "#" + comp_inst.id).css({"color": bgcolor});
                $("#" + comp_inst.id + "_rating").rating("refresh", {"readonly": true, "showClear": clearVisible, "showCaption": captionVisible});
            }
        };
        return component_instance;
    },
    "loadPropertyPanel": function(gc_component_definition) {
        // default component size and colors
        if (! gc_component_definition.attributes.css.size) gc_component_definition.attributes.css.size = "md";
        if (! gc_component_definition.attributes.css.color) gc_component_definition.attributes.css.color = "#fde16d";
        if (! gc_component_definition.attributes.css.background) gc_component_definition.attributes.css.background = "#e3e3e3";

        $( '#gc_rating_attr_id').val( gc_component_definition.id );
        gc_factory.generatePropertyPanel( gc_web_rating.attributeDefinition, gc_component_definition );

        PickerImageModal.icons.fillModal('iconSymbolsModal');

        $('.dfx_visual_editor_property_input').change( function(e) {
            DfxVisualBuilder.propertyPanelChanged();
        });
    },
    "savePropertyPanel": function() {
        var id = $('#gc_rating_attr_id').val();
        var el = $('#'+id);

        var attributes = gc_factory.getPropertiesFromPanel( gc_web_rating.attributeDefinition );

        attributes.symbol.name = $('#gc_component_attr_symbol_name').val() || "star";
        attributes.symbol.value = $('#gc_component_attr_symbol_value').val() || "&#57350;";

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

        el.attr( {
            'class': gc_web_chart.default_classes + ' ' + attributes.containerClasses.value,
            'style': 'display:inline-block;position:relative;' + attributes.containerStyle.value + ';' + containerCss
        });

        var label_text = dfx_gc_common_helpers.showAsExpression(attributes.label.value);
        var labelPosition = attributes.labelPosition && attributes.labelPosition.value ? 'text-align:'+attributes.labelPosition.value : '';
        var labelVisible = attributes.labelVisible.value != 'no' ? 'display:block;' : 'display:none;';
        $('#'+id+'_label').attr( {
            'style': labelVisible + labelPosition
        });
        $('#'+id+'_label').text(label_text);

        $('#'+id+'_rating').attr( {
            'class': attributes.classes.value,
            'style': attributes.style.value
        });

        var dynamicProps = {
            readonly: true,
            min: parseInt(attributes.min.value),
            max: parseInt(attributes.max.value),
            step: parseInt(attributes.min.value),
            symbol: this.decodeHtmlEntity(attributes.symbol.value),
            stars: parseInt(attributes.symbolsNumber.value),
            rtl: false,
            showClear: attributes.clearVisible.value == "yes" ? true : false,
            showCaption: attributes.captionVisible.value == "yes" ? true : false,
            size: attributes.css.size || "md"
        };

        $('#'+id+'_rating').rating("refresh", dynamicProps);
        $('.rating-stars', '#' + id).css({'color': (attributes.css.color || "#fde16d")});
        $('.rating-container', '#' + id).css({'color': (attributes.css.background || "#e3e3e3")});

        var editor = ace.edit( 'dfx_src_editor' );
        var wgt_definition = JSON.parse( editor.getValue() );

        DfxVisualBuilder.findComponentAndUpdateAttributes( id, wgt_definition.definition, attributes, false );

        editor.setValue( JSON.stringify( wgt_definition, null, '\t' ), 0 );
        editor.gotoLine(1);

        DfxVisualBuilder.initPropertyPanelChange();
        DfxVisualBuilder.updateSelectedBox(el);
    },
    decodeHtmlEntity: function(str){
        return str.replace(/&#(\d+);/g, function(match, dec) {
            return String.fromCharCode(dec);
        });
    }
}