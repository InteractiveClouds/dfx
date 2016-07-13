/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/* GC Web Carousel */

var gc_web_carousel = {
    "label": "Carousel",
    "category": "default",
    "default_classes": "dfx_visual_editor_draggable dfx_visual_editor_gc_draggable gc_w_design_image",
    "attributeDefinition": {
        "categories": [
            {"id": "main_props",
                "label": "Main Properties",
                "expanded": true,
                "properties": [
                    { "id": "name", "label": "Name:", "type": "value", "default": "crCarousel", "propType": "input" },
                    { "id": "tooltip", "label": "Tooltip:", "type": "value", "default": "", "propType": "input-picker", "picker": "exptext" },
                    { "id": "tooltipPosition", "label": "Tooltip Position:", "type": "value", "default": "", "propType": "select", "selectOptions": "tooltipPosition" },
                    { "id": "interval", "label": "Interval:", "type": "value", "default": "5000", "propType": "input" },
                    { "id": "pause", "label": "Pause:", "type": "value", "default": "", "propType": "select", "selectOptions": "pause" },
                    { "id": "wrap", "label": "Cycle Continuously:", "type": "value", "default": "yes", "propType": "select", "selectOptions": "yesNo" },
                    { "id": "captionPosition", "label": "Caption Position:", "type": "value", "default": "default", "propType": "select", "selectOptions": "captionPosition" },
                    { "id": "dotsPosition", "label": "Dots Position:", "type": "value", "default": "default", "propType": "select", "selectOptions": "captionPosition" },
                    { "id": "styleCaptionPos", "type": "hidden", "default": "", "propType": "hidden" },
                    { "id": "styleDotsPos", "type": "hidden", "default": "", "propType": "hidden" }
                ]
            },
            {"id": "data_props",
                "label": "Data & Binding options",
                "expanded": false,
                "properties": [
                    { "id": "property", "label": "Variable:", "type": "value", "default": "", "propType": "input-picker", "picker": "bind" },
                    { "id": "dynamicOptions", "label": "Dynamic:", "type": "dynamicBindOptionsCarousel", "default": "no", "propType": "input-dynamicBindOptionsCarousel" },
                    { "id": "staticOptions", "label": "Static:", "type": "staticBindOptionsCarousel", "propType": "input-staticBindOptionsCarousel" }
                ]
            },
            {"id": "rules_props",
                "label": "Presentation Rules",
                "expanded": false,
                "properties": [
                    { "id": "display", "label": "Display Rule:", "type": "value", "default": "true", "propType": "input-picker", "picker": "exp" },
                    { "id": "required", "label": "Required", "type": "value", "default": "no", "propType": "select", "selectOptions": "yesNo" }
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
                    { "id": "css", "type": "css", "propType": "input-css", "cssOptions": [ "width", "height", "color", "captionFontSize" ] },
                    { "id": "style", "label": "Custom CSS:", "type": "value", "default": "", "propType": "input" }
                ]
            },
            {"id": "event_props",
                "label": "Events",
                "expanded": false,
                "properties": [
                    { "id": "onclick", "label": "On Click:", "type": "value", "default": "", "propType": "input-picker", "picker": "evt" },
                    { "id": "onslide", "label": "On Slide:", "type": "value", "default": "", "propType": "input-picker", "picker": "evt" },
                    { "id": "onslid", "label": "Slide Completed:", "type": "value", "default": "", "propType": "input-picker", "picker": "evt" }
                ]
            }
        ]
    },
    "_private": {
        "addDefaultStaticDynamicOptions": function(default_attributes) {
            if (! default_attributes.staticOptions) default_attributes.staticOptions = [{ "imgSrc": "", "caption": "" }];
            if (! default_attributes.dynamicOptions) default_attributes.dynamicOptions = { "value": false };
            if (! default_attributes.propertyOptions) default_attributes.propertyOptions = { "value": "" };
            if (! default_attributes.propertyOptionsFields) default_attributes.propertyOptionsFields = { "imgValue": "img", "captionValue": "caption" };
            return default_attributes;
        },
        "addDefaultHiddenOptions": function(default_attributes) {
            if (! default_attributes.styleCaptionPos) default_attributes.styleCaptionPos = { "value": "" };
            if (! default_attributes.styleDotsPos) default_attributes.styleDotsPos = { "value": "" };
            return default_attributes;
        }
    },
    "createDefinition": function( component_id, container_id ) {
        var default_attributes = gc_factory.getDefaultAttributes( gc_web_carousel.attributeDefinition );
        default_attributes = this._private.addDefaultStaticDynamicOptions(default_attributes);
        default_attributes = this._private.addDefaultHiddenOptions(default_attributes);

        return {
            id: component_id,
            type: "carousel",
            attributes: default_attributes,
            children: [],
            container: container_id
        };
    },
    "renderDesign": function( component ) {
        var attributes;
        if (!component.attributes) {
            attributes = gc_factory.getDefaultAttributes( gc_web_carousel.attributeDefinition );
        } else {
            attributes = gc_factory.migrateAttributes( gc_web_carousel.attributeDefinition, component.attributes );
        }

        var containerCss = '';
        $.each(attributes.containerCss, function(key, value) {
            if (value!='') {
                containerCss += key + ':' + value + ';';
            }
        });

        if (! attributes.css.width) attributes.css.width = "200px";
        if (! attributes.css.height) attributes.css.height = "200px";

        var css = '';
        $.each(attributes.css, function(key, value) {
            if (value!='') {
                css += key + ':' + value + ';';
            }
        });

        var fgcolor = attributes.css.color || "#fff",
            captionFontSize = attributes.css.captionFontSize || '',
            style = attributes.style.value ? attributes.style.value : '',
            classes = attributes.classes.value ? attributes.classes.value : '',
            styleCaptionPos = attributes.styleCaptionPos ? attributes.styleCaptionPos.value : '',
            styleDotsPos = attributes.styleDotsPos ? attributes.styleDotsPos.value : '';

        var fragment_html =
            '<div id="' + component.id + '" gc-role="control" gc-type="carousel" ' +
            'style="display:inline-block;position:relative;' + attributes.containerStyle.value + ';' + containerCss + '" ' +
            'class="' + gc_web_carousel.default_classes + (attributes.containerClasses.value != '' ? ' ' + attributes.containerClasses.value : '') + '">';
        fragment_html +=
            '<div id="' + component.id + '_field" class="carousel slide ' + classes + '" style="' + style + ';' + css + '">' +
            '<div class="carousel-inner" role="listbox">' +
            '<ol class="carousel-indicators" style="'+styleDotsPos+';">' +
            '<li data-target="#carousel-example-generic" data-slide-to="0" class="active"></li>' +
            '</ol>' +
            '<div class="item active">' +
            '<img id="' + component.id + '_dfx_image" src="/images/dfx_image_blank.png" style="width:' + attributes.css.width + ';height' + attributes.css.height + ';background-color:#777;" />' +
            '<div class="carousel-caption" style="color:' + fgcolor + ';' + styleCaptionPos + ';' + (captionFontSize ? 'font-size:' + captionFontSize : '') + '">First Slide</div>' +
            '</div>' +
            '</div>' +
            '<a class="left carousel-control" href="javascript:void()" role="button" data-slide="prev">'+
            '<span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>' +
            '<span class="sr-only">Previous</span>' +
            '</a>'+
            '<a class="right carousel-control" href="javascript:void()" role="button" data-slide="next">' +
            '<span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>' +
            '<span class="sr-only">Next</span>' +
            '</a>' +
            '</div>';
        fragment_html += '</div>';

        var component_instance = {
            "id": component.id,
            "fragment": fragment_html
        };
        return component_instance;
    },
    "loadPropertyPanel": function(gc_component_definition) {
        gc_component_definition.attributes = this._private.addDefaultStaticDynamicOptions( gc_component_definition.attributes );
        gc_component_definition.attributes = this._private.addDefaultHiddenOptions( gc_component_definition.attributes );

        $('#gc_carousel_attr_id').val( gc_component_definition.id );
        gc_factory.generatePropertyPanel( gc_web_carousel.attributeDefinition, gc_component_definition );

        // fill static and dynamic options panel
        var staticOptions = gc_component_definition.attributes.staticOptions,
            curStaticBlock,
            fgcolor = gc_component_definition.attributes.css.color || '#fff';

        // static options
        if (staticOptions.length) {
            for (var i=0, len = staticOptions.length; i<len; i++) {
                if (i != 0) {
                    curStaticBlock = $('.carousel-static-img:first').clone().insertBefore('#btnAddImgBlock');
                    $('.remove-img', curStaticBlock).show();
                } else {
                    curStaticBlock = $('.carousel-static-img:first');
                }

                $('#gc_component_attr_imgSrc', curStaticBlock).val(staticOptions[i].imgSrc);
                $('#gc_component_attr_caption', curStaticBlock).val(staticOptions[i].caption);
            }
        }

        // dynamic options
        var dynamicOptions = gc_component_definition.attributes.dynamicOptions ? gc_component_definition.attributes.dynamicOptions.value : 0;
        if (dynamicOptions){
            $('#gc_component_attr_dynamicOptions').attr('checked','checked');
        } else {
            $('#gc_component_attr_staticOptions').attr('checked','checked');
        }
        $('#gc_component_attr_propertyOptions').val( gc_component_definition.attributes.propertyOptions.value );
        $('#gc_component_attr_imgValue').val( gc_component_definition.attributes.propertyOptionsFields.imgValue );
        $('#gc_component_attr_captionValue').val( gc_component_definition.attributes.propertyOptionsFields.captionValue );

        // init pickers
        $('#fgColorPicker').colorpicker('setValue', fgcolor);
        PickerImageModal.imgs.fillModal('imgsModal');

        $('.dfx_visual_editor_property_input').change( function(e) {
            DfxVisualBuilder.propertyPanelChanged();
        });
    },
    "savePropertyPanel": function() {
        var id = $( '#gc_carousel_attr_id').val();

        var attributes = gc_factory.getPropertiesFromPanel( gc_web_carousel.attributeDefinition );
        attributes = this._private.addDefaultHiddenOptions( attributes );

        var staticBlock = $('.carousel-static-img'),
            staticOptions = [], curStaticBlock, elStaticImg, elStaticCaption,
            el =  $( '#'+id),
            el_caption = $('.carousel-caption', el),
            el_dots = $('.carousel-indicators', el);

        // get dynamic options
        var dynamicOptions = $('#gc_component_attr_dynamicOptions').is(':checked');
        attributes.dynamicOptions = (dynamicOptions) ? { "value": true } : { "value": false };
        attributes.propertyOptions = { "value": $('#gc_component_attr_propertyOptions').val() };
        attributes.propertyOptionsFields = {
            "imgValue": $('#gc_component_attr_imgValue').val(),
            "captionValue": $('#gc_component_attr_captionValue').val()
        };

        // get static options
        for (var i= 0, len = staticBlock.length; i< len; i++) {
            curStaticBlock = $(staticBlock[i]);
            elStaticImg = $('#gc_component_attr_imgSrc', curStaticBlock);
            elStaticCaption = $('#gc_component_attr_caption', curStaticBlock);
            if (elStaticImg.val() != '') {
                staticOptions.push({"imgSrc": elStaticImg.val(),"caption": elStaticCaption.val()});
            }
        }
        attributes.staticOptions = staticOptions;
        if (attributes.staticOptions.length == 0) {
            attributes.staticOptions = [{ "imgSrc": "", "caption": "" }];
        }

        var containerCss = '';
        $.each(attributes.containerCss, function(key, value) {
            if (value!='') {
                containerCss += key + ':' + value + ';';
            }
        });

        if (! attributes.css.width) attributes.css.width = "200px";
        if (! attributes.css.height) attributes.css.height = "200px";

        var css = '';
        $.each(attributes.css, function(key, value) {
            if (value!='') {
                css += key + ':' + value + ';';
            }
        });

        $('#'+id).attr( {
            'class': gc_web_carousel.default_classes + ' ' + attributes.containerClasses.value,
            'style': 'display:inline-block;position:relative;' + attributes.containerStyle.value + ';' + containerCss
        });

        var style = attributes.style.value ? attributes.style.value : '',
            classes = attributes.classes.value ? attributes.classes.value : '';

        $('#'+id+"_field").attr( {
            'class': 'carousel slide ' + classes,
            'style': style + ';' + css
        });
        $('#'+id+"_dfx_image").attr( {
            'style': 'width:' + attributes.css.width + ';height:' + attributes.css.height + ';background-color:#777;'
        });

        // caption clear style
        el_caption.attr('style','');

        // dots clear style
        el_dots.attr('style','');

        // Caption
        // caption position
        var cssCaption = gc_web_carousel.setPosition(attributes.captionPosition.value, attributes.css.captionFontSize, 1);
        cssCaption.padding = '0';
        cssCaption.position = 'absolute';
        if (attributes.captionPosition.value != 'default') {
            el_caption.css(cssCaption);
            attributes.styleCaptionPos.value = el_caption.attr('style');
        }
        // caption color
        el_caption.css('color', attributes.css.color || "#fff");
        // caption font-size
        if (attributes.css.captionFontSize) {
            el_caption.css('font-size', attributes.css.captionFontSize);
        }
        // Dots
        // dots position
        var cssDots = gc_web_carousel.setPosition(attributes.dotsPosition.value, 14, 0);
        cssDots.padding = '0';
        cssDots.position = 'absolute';
        if (attributes.dotsPosition.value != 'default') {
            el_dots.css(cssDots);
            attributes.styleDotsPos.value = el_dots.attr('style');
        }

        var editor = ace.edit( 'dfx_src_editor' );
        var wgt_definition = JSON.parse( editor.getValue() );

        DfxVisualBuilder.findComponentAndUpdateAttributes( id, wgt_definition.definition, attributes, false );

        editor.setValue( JSON.stringify( wgt_definition, null, '\t' ), 0 );
        editor.gotoLine(1);

        DfxVisualBuilder.initPropertyPanelChange();
        DfxVisualBuilder.updateSelectedBox(el);
    },
    appendImgBlock: function(){
        var el=$('.carousel-static-img:first').clone().insertBefore('#btnAddImgBlock');
        el.find('input').val('');
        el.find('.remove-img').show();
    },
    removeImgBlock: function(e){
        var el = $(e.target).closest('.carousel-static-img');
        el.remove();
    },
    setPosition: function(captionPosition, lineHeight, isCaption){
        var cssCaption = {};
        switch(captionPosition) {
            case 'top_middle':
                cssCaption.top = '10px';
                cssCaption.left = '0';
                cssCaption.right = '0';
                cssCaption.marginLeft = 'auto';
                cssCaption.marginRight = 'auto';
                break;
            case 'top_left':
                cssCaption.top = '10px';
                cssCaption.right = '0';
                cssCaption.left = '10px';
                cssCaption.textAlign = 'left';
                cssCaption.margin = '0';
                break;
            case 'top_right':
                cssCaption.top = '10px';
                cssCaption.right = '10px';
                cssCaption.textAlign = 'right';
                if(!isCaption){
                    cssCaption.marginLeft = '0';
                    cssCaption.left = '0';
                    cssCaption.width = '98%'
                }
                break;
            case 'center_middle':
                cssCaption.margin = 'auto';
                cssCaption.top = '50%';
                cssCaption.left = '0';
                cssCaption.right = '0';
                cssCaption.marginTop = - lineHeight/2 +'px';
                break;
            case 'bottom_middle':
                cssCaption.bottom = '10px';
                cssCaption.left = '0';
                cssCaption.right = '0';
                cssCaption.marginLeft = 'auto';
                cssCaption.marginRight = 'auto';
                if(!isCaption){
                    cssCaption.marginBottom = '0';
                }
                break;
            case 'bottom_left':
                cssCaption.bottom = '10px';
                cssCaption.left = '10px';
                cssCaption.textAlign = 'left';
                cssCaption.margin = '0';
                break;
            case 'bottom_right':
                cssCaption.bottom = '10px';
                cssCaption.right = '10px';
                cssCaption.textAlign = 'right';
                cssCaption.margin = '0';
                if(!isCaption){
                    cssCaption.left = '0';
                    cssCaption.width = '98%'
                }
                break;
        }
        return cssCaption;
    },
    getSrcPath: function(attributes) {
        return (attributes.src_res && attributes.src_res.value && attributes.src_res.value.indexOf('{{') == -1)
            ? attributes.src_res.value
            : (attributes.src.value.indexOf('{{') != -1 ? '/images/dfx_image_blank.png' : attributes.src.value);
    }
}