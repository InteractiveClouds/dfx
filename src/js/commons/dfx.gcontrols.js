/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var gc_factory         = null;

require([
    "/js/visualbuilder/gcontrols/gc.web.panel.min.js",
    "/js/visualbuilder/gcontrols/gc.web.button.min.js",
    "/js/visualbuilder/gcontrols/gc.web.input_field.min.js",
    "/js/visualbuilder/gcontrols/gc.web.static_text.min.js",
    "/js/visualbuilder/gcontrols/gc.web.link.min.js",
    "/js/visualbuilder/gcontrols/gc.web.datagrid.min.js",
    "/js/visualbuilder/gcontrols/gc.web.datagrid-column.min.js",
    //"/js/visualbuilder/gcontrols/gc.web.list.min.js",
    "/js/visualbuilder/gcontrols/gc.web.image.min.js",
    "/js/visualbuilder/gcontrols/gc.web.checkbox.min.js",
    "/js/visualbuilder/gcontrols/gc.web.radio.min.js",
    "/js/visualbuilder/gcontrols/gc.web.combobox.min.js",
    "/js/visualbuilder/gcontrols/gc.web.textarea.min.js",
    "/js/visualbuilder/gcontrols/gc.web.tabs.min.js",
    "/js/visualbuilder/gcontrols/gc.web.chart.min.js",
    "/js/visualbuilder/gcontrols/gc.web.accordion.min.js",
    "/js/visualbuilder/gcontrols/gc.web.wizard.min.js",
    //"js/gcontrols/gc.web.tree.min.js",
    "/js/visualbuilder/gcontrols/gc.web.html.min.js",
    "/js/visualbuilder/gcontrols/gc.web.rating.min.js",
    "/js/visualbuilder/gcontrols/gc.web.slider.min.js",
    "/js/visualbuilder/gcontrols/gc.web.knob.min.js",
    "/js/visualbuilder/gcontrols/gc.web.radio_toggle.min.js",
    "/js/visualbuilder/gcontrols/gc.web.checkbox_toggle.min.js",
    "/js/visualbuilder/gcontrols/gc.web.carousel.min.js",
    "/js/visualbuilder/gcontrols/gc.web.layout.min.js",
    "/js/visualbuilder/gcontrols/gc.web.layout_row.min.js",
    "/js/visualbuilder/gcontrols/gc.web.layout_column.min.js",
    "/js/visualbuilder/gcontrols/gc.mobile.sui.panel.min.js",
    "/js/visualbuilder/gcontrols/gc.mobile.sui.layout.min.js",
    "/js/visualbuilder/gcontrols/gc.mobile.sui.layout_row.min.js",
    "/js/visualbuilder/gcontrols/gc.mobile.sui.layout_column.min.js",
    "/js/visualbuilder/gcontrols/gc.mobile.sui.button.min.js",
    "/js/visualbuilder/gcontrols/gc.mobile.sui.input_field.min.js",
    "/js/visualbuilder/gcontrols/gc.mobile.sui.image.min.js",
    "/js/visualbuilder/gcontrols/gc.mobile.sui.list.min.js"
    //"/js/visualbuilder/gcontrols/gc.mobile.panel.min.js",
    //"/js/visualbuilder/gcontrols/gc.mobile.static_text.min.js",
    //"/js/visualbuilder/gcontrols/gc.mobile.button.min.js",
    //"/js/visualbuilder/gcontrols/gc.mobile.image.min.js",
    //"/js/visualbuilder/gcontrols/gc.mobile.input_field.min.js",
    //"/js/visualbuilder/gcontrols/gc.mobile.textarea.min.js",
    //"/js/visualbuilder/gcontrols/gc.mobile.checkbox.min.js",
    //"/js/visualbuilder/gcontrols/gc.mobile.combobox.min.js",
    //"/js/visualbuilder/gcontrols/gc.mobile.tableview.min.js",
    //"/js/visualbuilder/gcontrols/gc.mobile.chart.min.js",
    //"/js/visualbuilder/gcontrols/gc.mobile.slider.min.js"
], function (util) {
    gc_factory = {
        "controls":               {
            "web":    {
                "statictext":      gc_web_statictext,
                "link":            gc_web_link,
                "button":          gc_web_button,
                "image":           gc_web_image,
                "inputfield":      gc_web_input_field,
                "textarea":        gc_web_textarea,
                "checkbox":        gc_web_checkbox,
                "radio":           gc_web_radio,
                "combobox":        gc_web_combobox,
                //"list": gc_web_list,
                "datagrid":        gc_web_datagrid,
                "datagrid-column": gc_web_datagrid_column,
                "chart":           gc_web_chart,
                "panel":           gc_web_panel,
                "tabs":            gc_web_tabs,
                "accordion":       gc_web_accordion,
                "wizard":          gc_web_wizard,
                //"tree": gc_web_tree,
                "html":            gc_web_html,
                "rating":          gc_web_rating,
                "slider":          gc_web_slider,
                "knob":            gc_web_knob,
                "radiotoggle":     gc_web_radio_toggle,
                "checkboxtoggle":  gc_web_checkbox_toggle,
                "carousel":        gc_web_carousel,
                "layout":          gc_web_layout,
                "layout-row":      gc_web_layout_row,
                "layout-column":   gc_web_layout_column
            },
            "mobile": {
                /*"statictext": gc_web_statictext,
                 "inputfield": gc_web_input_field,
                 "button": gc_web_button,
                 //"list": gc_web_list,
                 "image": gc_web_image,
                 "layout":     gc_mobile_layout,
                 "layout-row": gc_mobile_layout_row,
                 "statictext": gc_mobile_statictext,
                 "image":      gc_mobile_image,
                 "inputfield": gc_mobile_input_field,
                 "textarea":   gc_mobile_textarea,
                 "checkbox":   gc_mobile_checkbox,
                 //"combobox":   gc_mobile_combobox,
                 "tableview":  gc_mobile_tableview,
                 "chart":      gc_mobile_chart,
                 "slider":     gc_mobile_slider*/
                "panel":      gc_mobile_panel,
                "button":     gc_mobile_button,
                "inputfield": gc_mobile_input_field,
                "image":      gc_mobile_image,
                "list":      gc_mobile_list,
                "layout":     gc_mobile_layout,
                "layout-row": gc_mobile_layout_row,
                "layout-column": gc_mobile_layout_column

            }
        },
        'icons':                  {
            'web':    {
                'statictext':      'icon-uniE605',
                'link':            'icon-uniE602',
                'button':          'icon-danielbruce',
                'image':           'icon-image-outline',
                'inputfield':      'icon-type',
                'numberfield':     'icon-input-number',
                'amountfield':     'icon-input-Amount',
                'datefield':       'icon-calendar',
                'textarea':        'icon-TextArea',
                'checkbox':        'icon-input-checked',
                'radio':           'icon-cd',
                'combobox':        'icon-box',
                //'list': 'icon-list',
                'datagrid':        'icon-grid',
                'datagrid-column': 'xxx',
                'chart':           'icon-chart-pie',
                'panel':           'icon-th-large-outline',
                'tabs':            'icon-tabs-outline',
                'accordion':       'icon-accordion',
                'wizard':          'fa fa-huge fa-magic',
                //'tree': 'fa fa-huge fa-sitemap',
                'html':            'icon-align-left',
                'rating':          'icon-star',
                'slider':          'icon-settings',
                'knob':            'icon-knob',
                'radiotoggle':     'icon-toggle',
                'checkboxtoggle':  'icon-toggle',
                'carousel':        'icon-view-carousel',
                'layout':          'xxx',
                'layout-row':      'xxx',
                'layout-column':   'xxx'
            },
            'mobile': {
                /*'statictext': 'icon-uniE605',
                 'inputfield': 'icon-type',
                 'button': 'icon-danielbruce',
                 'list': 'icon-list',
                 'image': 'icon-image-outline',*/
                'panel':      'icon-th-large-outline',
                'layout':     'xxx',
                'layout-row': 'xxx',
                'layout-column': 'xxx',
                'statictext': 'icon-uniE605',
                'button':     'icon-danielbruce',
                'image':      'icon-image-outline',
                'list':       'icon-list',
                'inputfield': 'icon-type',
                'textarea':   'icon-TextArea',
                'checkbox':   'icon-input-checked',
                //'combobox':   'icon-box',
                'tableview':  'icon-grid',
                'chart':      'icon-chart-pie',
                'slider':     'icon-settings'
            }
        },
        "createDefinition":       function (gc_type, gc_id, gc_container_id) {
            var platform = $('#dfx_visual_editor').attr('platform');
            return gc_factory.controls[platform][gc_type].createDefinition(gc_id, gc_container_id);
        },
        "renderDesign":           function (gc_type, gc_definition, gc_already_dropped) {
            var platform = $('#dfx_visual_editor').attr('platform');
            return gc_factory.controls[platform][gc_type].renderDesign(gc_definition, gc_already_dropped);
        },
        "loadPropertyPanel":      function (gc_type, gc_control_id, gc_control_child_id) {
            var platform      = $('#dfx_visual_editor').attr('platform');
            var prop_panel    = localStorage.getItem('gc_' + platform + '_' + gc_type);
            var gc_extensions = localStorage.getItem('gc_extensions');
            gc_extensions     = (gc_extensions != null) ? JSON.parse(gc_extensions) : {};

            var prop_extensions_panel = '';
            if (gc_extensions[gc_type] != null) {
                for (var extension_attr in gc_extensions[gc_type]) {
                    prop_extensions_panel += '<tr><td class="field-label dfx_visual_editor_property col-md-4">'
                    + '<label class="dfx_visual_editor_property_label">' + extension_attr + '</label></td>'
                    + '<td><input id="gc_' + gc_type + '_attr_' + extension_attr + '" gc-extended-attribute="' + extension_attr + '" class="form-control" type="text" /></td></tr>';
                    /*
                     tr
                     td.field-label.dfx_visual_editor_property
                     label.dfx_visual_editor_property_label Label:
                     td
                     input#gc_button_attr_label.form-control(type="text")
                     */
                }
            }

            var _loadPanel = function () {
                $('.dfx_bars_property_panel').empty();// empty mobile widget title/tab bars property panels
                $('#dfx_visual_editor_property_panel').empty();
                $('#dfx_visual_editor_property_panel').append(prop_panel);
                $('#dfx_visual_editor_property_panel > table > tbody').append(prop_extensions_panel);
                $('#dfx_visual_editor_property_title').text(gc_factory.controls[platform][gc_type].label);
                if (gc_factory.controls[platform][gc_type].help) {
                    $('#dfx_visual_editor_property_help').attr('href', 'http://www.interactive-clouds.com/documentation/'+gc_factory.controls[platform][gc_type].help);
                    $('#dfx_visual_editor_property_help').css('display', 'block');
                } else {
                    $('#dfx_visual_editor_property_help').css('display', 'none');
                }
                if (gc_factory.controls[platform][gc_type].styles_palette) {
                    DfxVisualBuilder.loadStylesPalette(gc_factory.controls[platform][gc_type].styles_palette);
                    $('#dfx_visual_editor_styles_palette').css('display', 'block');
                    $('#dfx_visual_editor_save_predefined').css('display', 'block');
                } else {
                    DfxVisualBuilder.stylesPalette = undefined;
                    $('#dfx_visual_editor_styles_palette').css('display', 'none');
                    $('#dfx_visual_editor_save_predefined').css('display', 'none');
                }
                var editor                  = $('#dfx_src_editor.CodeMirror')[0].CodeMirror;
                var wgt_definition          = JSON.parse(editor.getValue());
                var gc_component_definition = DfxVisualBuilder.getComponentDefinition(gc_control_id, wgt_definition.definition);

                if (gc_component_definition && gc_control_child_id == null) {
                    return gc_factory.controls[platform][gc_type].loadPropertyPanel(gc_component_definition);
                } else if (gc_component_definition) {
                    return gc_factory.controls[platform][gc_type].loadPropertyPanel(gc_component_definition, gc_control_child_id);
                }
            };

            if (DfxVisualBuilder.isPropertyPanelChanged()) {
                DfxStudio.confirmDialog({
                    prompt:           "Do you want to apply your changes before editing another control?",
                    positiveCallback: function () {
                        DfxVisualBuilder.initPropertyPanelChange();
                        var gc_current_type = $('#dfx_visual_editor_property_panel_apply').attr('gc-type');
                        gc_factory.controls[platform][gc_current_type].savePropertyPanel();
                    },
                    negativeCallback: function () {
                        DfxVisualBuilder.initPropertyPanelChange();
                        _loadPanel();
                    }
                });
            } else {
                _loadPanel();
            }
        },
        "initializeControls":     function () {
            var platform = $('#dfx_visual_editor').attr('platform');
            $('.dfx_visual_editor_gc_cat_item').empty();

            for (gc_type in gc_factory.controls[platform]) {
                if (gc_factory.controls[platform][gc_type].subcontrol != true) {
                    var item_fragment = '<li class="dfx_visual_editor_draggable dfx_visual_editor_gc_cat_item_draggable" gc-type="' + gc_type + '">'
//                        + '<img src="/studio/images/vb/icons/dfx_' + platform + '_' + gc_type + '.png" style="float:left"/>'
                        + '<span class="' + gc_factory.icons[platform][gc_type] + ' pull-left"></span>'
                        + '<span>' + gc_factory.controls[platform][gc_type].label + '</span></li>';

                    $('ul[gc-cat=' + gc_factory.controls[platform][gc_type].category + ']').append(item_fragment);
                }
                var cached_item = localStorage.getItem('gc_' + platform + '_' + gc_type);
                //!cached_item &&
                //if (gc_type=='button') {
                h.getFromServer('/studio/widget/gcontrols/' + platform + '/property/' + gc_type, {}).then(function (data) {
                    localStorage.setItem('gc_' + platform + '_' + data.name, data.fragment);
                });
                //}
            }

            h.getFromServer('/studio/gc_extensions/directives').then(function (data) {
                var gc_parsed_extensions = JSON.parse(data);
                var gc_extensions        = (gc_parsed_extensions['data']) ? gc_parsed_extensions['data']['extensions'] : [];
                var gc_extensions_obj    = {};
                var i;

                for (i = 0; i < gc_extensions.length; i++) {
                    if (!gc_extensions_obj[gc_extensions[i].gcname]) {
                        gc_extensions_obj[gc_extensions[i].gcname] = {};
                    }
                    gc_extensions_obj[gc_extensions[i].gcname][gc_extensions[i].attribute] = '';
                }
                localStorage.setItem('gc_extensions', JSON.stringify(gc_extensions_obj));
            });

            PickerValueModal.init();
        },
        "removeChildComponent":   function (gc_type, gc_component_id, gc_child_index, definition) {
            var platform = $('#dfx_visual_editor').attr('platform');
            gc_factory.controls[platform][gc_type].removeComponent(gc_component_id, gc_child_index, definition);
        },
        "generatePropertyPanel":  function (definition, gc_component_def) {
            var i, j, k;
            var selectOptions = {
                "leftRightPosition":  [{"value": "left", "label": "left"}, {"value": "right", "label": "right"}],
                "horizontalPosition": [{"value": "left", "label": "left"}, {
                    "value": "center",
                    "label": "center"
                }, {"value": "right", "label": "right"}],
                "iconPosition":       [{"value": "left", "label": "left"}, {"value": "right", "label": "right"}],
                "tooltipPosition":    [{"value": "top", "label": "top"}, {
                    "value": "right",
                    "label": "right"
                }, {"value": "left", "label": "left"}, {"value": "bottom", "label": "bottom"}],
                "captionPosition":    [{"value": "default", "label": "default"}, {
                    "value": "top_middle",
                    "label": "top middle"
                }, {"value": "top_left", "label": "top left"}, {"value": "top_right", "label": "top right"},
                    {"value": "center_middle", "label": "center middle"}, {
                        "value": "bottom_middle",
                        "label": "bottom middle"
                    }, {"value": "bottom_left", "label": "bottom left"}, {
                        "value": "bottom_right",
                        "label": "bottom right"
                    }],
                "inputTypes":         [{"value": "text", "label": "text"}, {
                    "value": "password",
                    "label": "password"
                }, {"value": "date", "label": "date"}, {"value": "number", "label": "number"}, {
                    "value": "money",
                    "label": "money"
                }],
                "chartTypes":         [{"value": "pie", "label": "Pie"}, {
                    "value": "bar",
                    "label": "Bar"
                }, {"value": "line", "label": "Line"}, {"value": "point", "label": "Point"}, {
                    "value": "area",
                    "label": "Area"
                }],
                "yesNo":              [{"value": "yes", "label": "yes"}, {"value": "no", "label": "no"}],
                "oneToTwelve":        [{"value": "1", "label": "1"}, {"value": "2", "label": "2"}, {
                    "value": "3",
                    "label": "3"
                }, {"value": "4", "label": "4"}, {"value": "5", "label": "5"},
                    {"value": "6", "label": "6"}, {"value": "7", "label": "7"}, {
                        "value": "8",
                        "label": "8"
                    }, {"value": "9", "label": "9"}, {"value": "10", "label": "10"},
                    {"value": "11", "label": "11"}, {"value": "12", "label": "12"}],
                "oneToSixteen": [
                    {"value": "one", "label": "1"},
                    {"value": "two", "label": "2"},
                    {"value": "three", "label": "3"},
                    {"value": "four", "label": "4"},
                    {"value": "five", "label": "5"},
                    {"value": "six", "label": "6"},
                    {"value": "seven", "label": "7"},
                    {"value": "height", "label": "8"},
                    {"value": "nine", "label": "9"},
                    {"value": "ten", "label": "10"},
                    {"value": "eleven", "label": "11"},
                    {"value": "twelve", "label": "12"},
                    {"value": "thirteen", "label": "13"},
                    {"value": "fourteen", "label": "14"},
                    {"value": "fifteen", "label": "15"},
                    {"value": "sixteen", "label": "16"}
                ],
                "gridColumnTypes":    [{"value": "text", "label": "text"}, {
                    "value": "image",
                    "label": "image"
                }, {"value": "link", "label": "link"}, {"value": "html", "label": "html"}],
                "connectEdges":       [{"value": "", "label": "none"}, {
                    "value": "lower",
                    "label": "lower for one handle"
                }, {"value": "upper", "label": "upper for one handle"}, {
                    "value": "true",
                    "label": "true between edges"
                }, {"value": "false", "label": "false between edges"}],
                "direction":          [{"value": "ltr", "label": "ltr"}, {"value": "rtl", "label": "rtl"}],
                "orientation":        [{"value": "horizontal", "label": "horizontal"}, {
                    "value": "vertical",
                    "label": "vertical"
                }],
                "behaviour":          [{"value": "tap", "label": "tap"}, {
                    "value": "drag",
                    "label": "drag"
                }, {"value": "drag-fixed", "label": "drag-fixed"}, {"value": "drag-tap", "label": "drag-tap"}],
                "pause":              [{"value": "hover", "label": "hover"}, {"value": "no", "label": "no"}],
                "mobileSizes": [
                    {"value": "", "label": ""},
                    {"value": "mini", "label": "Mini"},
                    {"value": "tiny", "label": "Tiny"},
                    {"value": "small", "label": "Small"},
                    {"value": "medium", "label": "Medium"},
                    {"value": "large", "label": "Large"},
                    {"value": "big", "label": "Big"},
                    {"value": "huge", "label": "Huge"},
                    {"value": "massive", "label": "Massive"},
                ],
                "labeledPosition": [
                    {"value": "", "label": ""},
                    {"value": "left", "label": "left"},
                    {"value": "right", "label": "right"}
                ]
            }
            var cssPropLabels = {
                "width":           "Width",
                "height":          "Height",
                "color":           "Color",
                "background":      "Background",
                "handleColor":     "Handle Color",
                "padding":         "Padding",
                "margin":          "Margin",
                "text-align":      "Text-Alignment",
                "size":            "Size",
                "onColor":         "On Color",
                "offColor":        "Off Color",
                "centralWidth":    "Central Width",
                "handleWidth":     "Handle Width",
                "toggleSize":      "Size",
                "captionFontSize": "Caption Font Size"
            };
            var colorPickers  = [];

            // Panel generation
            for (i = 0; i < definition.categories.length; i++) {
                var cat_fragment = '';
                var cat          = definition.categories[i];
                if (cat.dynamic == true) {
                    cat_fragment = '<span id="' + cat.id + '_dynamic" dynamicPanel="true">';
                }
                cat_fragment += '<legend id="' + cat.id + '_cat">' +
                '<a class="dfx_visual_editor_property_collapsible_btn' + (cat.expanded ? '' : ' collapsed') + '" data-toggle="collapse" data-target="#' + cat.id + '">' +
                cat.label + '</a></legend>' +
                '<div id="' + cat.id + '" class="collapse ' + (cat.expanded ? 'in' : '') + '">';

                for (j = 0; j < cat.properties.length; j++) {
                    var prop = cat.properties[j];
                    if (prop.propType == 'hidden') {
                        continue;
                    }

                    var prop_fragment;
                    if (prop.propType != 'input-css' && prop.propType != 'input-counter' && prop.propType != 'input-grid-columns'
                        && prop.propType != 'input-dynamicBindOptionsCheckbox' && prop.propType != 'popup-staticBindOptionsCheckbox'
                        && prop.propType != 'input-dynamicBindOptionsRadio' && prop.propType != 'popup-staticBindOptionsRadio'
                        && prop.propType != 'input-dynamicBindOptionsCarousel' && prop.propType != 'input-staticBindOptionsCarousel'
                        && prop.propType != 'input-dynamicBindOptionsTableView' && prop.propType != 'popup-staticBindOptionsTableView') {
                        prop_fragment = '<div class="form-group">' +
                        '<label class="col-xs-4 control-label">' + prop.label + '</label>' +
                        '<div class="col-xs-8">';

                        if (prop.propType == 'input') {
                            prop_fragment += '<input id="gc_component_attr_' + prop.id + '" class="input-xs dfx_visual_editor_property_input" type="text" />';
                        } else if (prop.propType == 'input-picker') {
                            if (prop.resourcePicker) {
                                prop_fragment += '<div class="input-group">' +
                                '<input id="gc_component_attr_' + prop.id + '" class="form-control input-xs dfx_visual_editor_property_input" type="text" />' +
                                '<span class="input-group-btn">' +
                                '<a id="btnPick' + prop.id + '" class="btn btn-default" href="#" data-toggle="modal" data-target="#imgsModal" data-vb-picker="' + prop.picker + '" data-vb-picker-target="gc_component_attr_' + prop.id + '">...</a>' +
                                '</span>';
                            } else {
                                prop_fragment += '<div class="input-group">' +
                                '<input id="gc_component_attr_' + prop.id + '" class="form-control input-xs dfx_visual_editor_property_input" type="text" />' +
                                '<span class="input-group-btn">' +
                                '<a id="btnPick' + prop.id + '" class="btn btn-default" href="#" data-toggle="modal" data-target="#pickerValueModal" data-vb-picker="' + prop.picker + '" data-vb-picker-target="gc_component_attr_' + prop.id + '">...</a>' +
                                '</span>';
                            }
                            prop_fragment += '</div>';
                        } else if (prop.propType == 'input-date-format') {
                            prop_fragment += '<div class="input-group">' +
                            '<input id="gc_component_attr_' + prop.id + '" class="form-control input-xs dfx_visual_editor_property_input" type="text" />' +
                            '<span class="input-group-btn">' +
                            '<a id="btnPick' + prop.id + '" class="btn btn-default" href="#" data-toggle="modal" data-target="#pickerValueModal" data-vb-picker="dateFormat" data-vb-picker-target="gc_component_attr_' + prop.id + '">...</a>' +
                            '</span></div>';
                        } else if (prop.propType == 'input-html') {
                            prop_fragment += '<div class="input-group">' +
                            '<input id="gc_component_attr_' + prop.id + '" class="form-control input-xs dfx_visual_editor_property_input" style="display:none" type="text" />' +
                            '<span class="input-group-btn">' +
                            '<a id="btnPick' + prop.id + '" class="btn btn-default" href="#" data-toggle="modal" data-target="#htmlModal">Edit HTML</a>' +
                            '</span></div>';
                        } else if (prop.propType == 'input-icon') {
                            prop_fragment += '<div class="input-group">' +
                            '<input id="gc_component_attr_' + prop.id + '" class="form-control input-xs dfx_visual_editor_property_input" type="text" />' +
                            '<span class="input-group-btn">' +
                            '<a id="btnPick' + prop.id + '" class="btn btn-default" href="#" data-toggle="modal" data-target="#iconsModal" data-vb-picker-target="gc_component_attr_' + prop.id + '">...</a>' +
                            '</span></div>';
                        } else if (prop.propType == 'input-symbol') {
                            prop_fragment += '<div class="input-group">' +
                            '<input id="gc_component_attr_' + prop.id + '_name" class="form-control input-xs dfx_visual_editor_property_input" type="text" />' +
                            '<input id="gc_component_attr_' + prop.id + '_value" class="form-control input-xs dfx_visual_editor_property_input" type="hidden" />' +
                            '<span class="input-group-btn">' +
                            '<a id="btnPick' + prop.id + '" class="btn btn-default" href="#" data-toggle="modal" data-target="#iconSymbolsModal" data-vb-picker-target="gc_component_attr_' + prop.id + '">...</a>' +
                            '</span></div>';
                        } else if (prop.propType == 'select') {
                            prop_fragment += '<select id="gc_component_attr_' + prop.id + '" class="input-xs dfx_visual_editor_property_input" size="1"';
                            if (prop.change) {
                                prop_fragment += ' onchange="' + prop.change + '"'
                            }
                            prop_fragment += '>';
                            for (k = 0; k < selectOptions[prop.selectOptions].length; k++) {
                                prop_fragment += '<option value="' + selectOptions[prop.selectOptions][k].value + '">' + selectOptions[prop.selectOptions][k].label + '</option>';
                            }
                            prop_fragment += '</select>';
                        }
                        prop_fragment += '</div></div>';
                        cat_fragment += prop_fragment;
                    } else if (prop.propType == 'input-counter') {
                        // Bind
                        prop_fragment = '<div class="form-group">' +
                        '<label class="col-xs-4 control-label">Bind Counter using:</label>' +
                        '<div class="col-xs-8">';
                        prop_fragment += '<div class="input-group">' +
                        '<input id="gc_component_attr_' + prop.id + '_bind" class="form-control input-xs dfx_visual_editor_property_input" type="text" />' +
                        '<span class="input-group-btn">' +
                        '<a id="btnPick' + prop.id + '_bind" class="btn btn-default" href="#" data-toggle="modal" data-target="#pickerValueModal" data-vb-picker="bind" data-vb-picker-target="gc_component_attr_' + prop.id + '_bind">...</a>' +
                        '</span></div>';
                        prop_fragment += '</div></div>';
                        // Click
                        prop_fragment += '<div class="form-group">' +
                        '<label class="col-xs-4 control-label">On Click:</label>' +
                        '<div class="col-xs-8">';
                        prop_fragment += '<div class="input-group">' +
                        '<input id="gc_component_attr_' + prop.id + '_onclick" class="form-control input-xs dfx_visual_editor_property_input" type="text" />' +
                        '<span class="input-group-btn">' +
                        '<a id="btnPick' + prop.id + '_onclick" class="btn btn-default" href="#" data-toggle="modal" data-target="#pickerValueModal" data-vb-picker="evt" data-vb-picker-target="gc_component_attr_' + prop.id + '_onclick">...</a>' +
                        '</span></div>';
                        prop_fragment += '</div></div>';
                        // Position
                        prop_fragment += '<div class="form-group">' +
                        '<label class="col-xs-4 control-label">Position:</label>' +
                        '<div class="col-xs-8">';
                        prop_fragment += '<div class="input-group">' +
                        '<select id="gc_component_attr_' + prop.id + '_position" class="form-control input-xs dfx_visual_editor_property_input" size="1">' +
                        '<option value="left">left</option><option value="right">right</option>' +
                        '</select></div>';
                        prop_fragment += '</div></div>';
                        cat_fragment += prop_fragment;
                    } else if (prop.propType == 'input-css') {
                        for (k = 0; k < prop.cssOptions.length; k++) {
                            var css_prop  = prop.cssOptions[k];
                            prop_fragment = '<div class="form-group">' +
                            '<label class="col-xs-4 control-label">' + cssPropLabels[css_prop] + ':</label>' +
                            '<div class="col-xs-8">';
                            if (css_prop == 'width' || css_prop == 'height' || css_prop == 'padding' || css_prop == 'margin' || css_prop == 'centralWidth' || css_prop == 'handleWidth' || css_prop == 'captionFontSize') {
                                prop_fragment += '<input id="gc_component_attr_' + prop.id + '_' + css_prop + '" class="input-xs dfx_visual_editor_property_input" type="text" />';
                            } else if (css_prop == 'onColor' || css_prop == 'offColor') {
                                prop_fragment += '<select id="gc_component_attr_' + prop.id + '_' + css_prop + '" class="input-xs dfx_visual_editor_property_input" size="1">' +
                                '<option value=""></option>' +
                                '<option value="primary">primary</option>' +
                                '<option value="info">info</option>' +
                                '<option value="success">success</option>' +
                                '<option value="warning">warning</option>' +
                                '<option value="default">default</option>' +
                                '<option value="danger">danger</option>' +
                                '</select>';
                            } else if (css_prop == 'color' || css_prop == 'background' || css_prop == 'handleColor') {
                                prop_fragment += '<div id="css_' + prop.id + '_' + css_prop + 'Picker" class="input-group fgcolor">' +
                                '<span class="input-group-addon color-picker" style="padding:3px"><i style="border:1px solid #b0b0b0"></i></span>' +
                                '<input id="gc_component_attr_' + prop.id + '_' + css_prop + '" class="input-xs dfx_visual_editor_property_input" type="text" style="width:80px"/>' +
                                '</div>';
                                colorPickers.push('css_' + prop.id + '_' + css_prop + 'Picker');
                            } else if (css_prop == 'text-align') {
                                prop_fragment += '<select id="gc_component_attr_' + prop.id + '_' + css_prop + '" class="input-xs dfx_visual_editor_property_input" size="1">' +
                                '<option value=""></option>' +
                                '<option value="left">left</option>' +
                                '<option value="center">center</option>' +
                                '<option value="right">right</option>' +
                                '</select>';
                            } else if (css_prop == 'size') {
                                prop_fragment += '<select id="gc_component_attr_' + prop.id + '_' + css_prop + '" class="input-xs dfx_visual_editor_property_input" size="1">' +
                                '<option value="xs">mini</option>' +
                                '<option value="sm">small</option>' +
                                '<option value="md">normal</option>' +
                                '<option value="lg">large</option>' +
                                '<option value="xl">extra large</option>' +
                                '</select>';
                            } else if (css_prop == 'toggleSize') {
                                prop_fragment += '<select id="gc_component_attr_' + prop.id + '_' + css_prop + '" class="input-xs dfx_visual_editor_property_input" size="1">' +
                                '<option value=""></option>' +
                                '<option value="mini">mini</option>' +
                                '<option value="small">small</option>' +
                                '<option value="normal">normal</option>' +
                                '<option value="large">large</option>' +
                                '</select>';
                            }
                            prop_fragment += '</div></div>';
                            cat_fragment += prop_fragment;
                        }
                    } else if (prop.propType == 'input-grid-columns') {
                        prop_fragment = '<div class="form-group">' +
                        '<label class="col-xs-4 control-label">' + prop.label + '</label>' +
                        '<div class="col-xs-8">';
                        prop_fragment += '<a href="javascript:gc_web_datagrid.addColumn();">Add a column</a>';
                        prop_fragment += '</div></div>';
                        cat_fragment += prop_fragment;
                    } else if (prop.propType == 'popup-staticBindOptionsCheckbox') {
                        prop_fragment = '<div class="form-group">' +
                        '<label style="margin-top: 0px;margin-bottom: 0px;margin-left: 46px;" class="radio">' +
                        '<input id="gc_component_attr_staticOptions" type="radio" name="radioUseMD" style="margin-top:6px;" checked="checked">' +
                        '<a id="dfxModal" onclick="$(\'#gc_component_attr_staticOptions\').click();" style="font-size:12px;" data-toggle="modal" data-target="#checkboxModal" ' +
                        'data-vb-picker-target="gc_component_attr_staticOptions" data-vb-picker-change="gc_component_attr_changeRadio" class="btn btn-link">Static</a>' +
                        '</label>' +
                        '<textarea id="gc_component_attr_staticOptions" style="display:none" class="form-control"></textarea>' +
                        '<input id="gc_component_attr_changeRadio" type="hidden"></div>';
                        cat_fragment += prop_fragment;
                    } else if (prop.propType == 'popup-staticBindOptionsRadio') {
                        prop_fragment = '<div class="form-group">' +
                        '<label style="margin-top: 0px;margin-bottom: 0px;margin-left: 46px;" class="radio">' +
                        '<input id="gc_component_attr_staticOptions" type="radio" name="radioUseMD" style="margin-top:6px;" checked="checked">' +
                        '<a id="dfxModal" onclick="$(\'#gc_component_attr_staticOptions\').click();" style="font-size:12px;" data-toggle="modal" data-target="#radioModal" ' +
                        'data-vb-picker-target="gc_component_attr_staticOptions" data-vb-picker-change="gc_component_attr_changeRadio" class="btn btn-link">Static</a>' +
                        '</label>' +
                        '<textarea id="gc_component_attr_staticOptions" style="display:none" class="form-control"></textarea>' +
                        '<input id="gc_component_attr_changeRadio" type="hidden"></div>';
                        cat_fragment += prop_fragment;
                    } else if (prop.propType == 'popup-staticBindOptionsTableView') {
                        prop_fragment = '<div class="form-group">' +
                        '<label style="margin-top: 0px;margin-bottom: 0px; margin-left: 46px;" class="radio">' +
                        '<input id="gc_component_attr_staticOptions" type="radio" name="radioUseMD" style="margin-top:6px;" checked="checked">' +
                        '<a id="dfxModal" onclick="$(\'#gc_component_attr_staticOptions\').click();" style="font-size:12px;" data-toggle="modal" data-target="#tableViewModal" ' +
                        'data-vb-picker-target="gc_component_attr_staticOptions" data-vb-picker-change="gc_component_attr_changeRadio" class="btn btn-link" data-ignore="push">Static</a>' +
                        '</label>' +
                        '<textarea id="gc_component_attr_staticOptions" style="display:none" class="form-control"></textarea>' +
                        '<input id="gc_component_attr_changeRadio" type="hidden"></div>';
                        cat_fragment += prop_fragment;
                    } else if (prop.propType == 'input-dynamicBindOptionsCheckbox') {
                        // Choose dynamic options radio button
                        prop_fragment = '<div class="form-group">' +
                        '<label style="margin-top: 0px; margin-bottom: 0px; margin-left: 46px;" class="radio">' +
                        '<input id="gc_component_attr_dynamicOptions" type="radio" name="radioUseMD" style="margin-top:6px;">' +
                        '<a id="btnSelectFields" data-toggle="collapse" data-target="#listFieldsName" style="font-size:12px;" class="btn btn-link">Dynamic</a></label></div>';

                        // Dynamic options container
                        prop_fragment += '<div id="listFieldsName" class="list-unstyled collapse">';
                        // Bind options using
                        prop_fragment += '<div class="form-group">' +
                        '<label class="col-xs-4 control-label">Bind Options Using:</label>' +
                        '<div class="col-xs-8">';
                        prop_fragment += '<div class="input-group">' +
                        '<input id="gc_component_attr_propertyOptions" type="text" class="form-control input-xs dfx_visual_editor_property_input" type="text"">' +
                        '<span class="input-group-btn">' +
                        '<a id="btnPickCollection" class="btn btn-default" href="#" data-toggle="modal" data-target="#pickerValueModal" data-vb-picker="bind" data-vb-picker-target="gc_component_attr_propertyOptions">...</a>' +
                        '</span></div></div></div>';
                        // Label (display value)
                        prop_fragment += '<div class="form-group">' +
                        '<label class="col-xs-4 control-label">Label:</label>' +
                        '<div class="col-xs-8">';
                        prop_fragment += '<div class="input-group">' +
                        '<input id="gc_component_attr_displayValue" type="text" class="form-control input-xs dfx_visual_editor_property_input" type="text"">' +
                        '</div></div></div>';
                        // Checked Value
                        prop_fragment += '<div class="form-group">' +
                        '<label class="col-xs-4 control-label">Checked Value:</label>' +
                        '<div class="col-xs-8">';
                        prop_fragment += '<div class="input-group">' +
                        '<input id="gc_component_attr_checkedValue" type="text" class="form-control input-xs dfx_visual_editor_property_input" type="text"">' +
                        '</div></div></div>';
                        // Unchecked Value
                        prop_fragment += '<div class="form-group">' +
                        '<label class="col-xs-4 control-label">Unchecked Value:</label>' +
                        '<div class="col-xs-8">';
                        prop_fragment += '<div class="input-group">' +
                        '<input id="gc_component_attr_uncheckedValue" type="text" class="form-control input-xs dfx_visual_editor_property_input" type="text"">' +
                        '</div></div></div>';
                        // Disabled
                        prop_fragment += '<div class="form-group">' +
                        '<label class="col-xs-4 control-label">Disabled:</label>' +
                        '<div class="col-xs-8">';
                        prop_fragment += '<div class="input-group">' +
                        '<input id="gc_component_attr_disabled" type="text" class="form-control input-xs dfx_visual_editor_property_input" type="text"">' +
                        '</div></div></div>';

                        prop_fragment += '</div>';
                        cat_fragment += prop_fragment;
                    } else if (prop.propType == 'input-dynamicBindOptionsRadio') {
                        // Choose dynamic options radio button
                        prop_fragment = '<div class="form-group">' +
                        '<label style="margin-top: 0px;margin-bottom: 0px;margin-left: 46px;" class="radio">' +
                        '<input id="gc_component_attr_dynamicOptions" type="radio" name="radioUseMD" style="margin-top:6px;">' +
                        '<a id="btnSelectFields" data-toggle="collapse" data-target="#listFieldsName" style="font-size:12px;" class="btn btn-link">Dynamic</a></label></div>';

                        // Dynamic options container
                        prop_fragment += '<div id="listFieldsName" class="list-unstyled collapse">';
                        // Bind options using
                        prop_fragment += '<div class="form-group">' +
                        '<label class="col-xs-4 control-label">Bind Options Using:</label>' +
                        '<div class="col-xs-8">';
                        prop_fragment += '<div class="input-group">' +
                        '<input id="gc_component_attr_propertyOptions" type="text" class="form-control input-xs dfx_visual_editor_property_input" type="text"">' +
                        '<span class="input-group-btn">' +
                        '<a id="btnPickCollection" class="btn btn-default" href="#" data-toggle="modal" data-target="#pickerValueModal" data-vb-picker="bind" data-vb-picker-target="gc_component_attr_propertyOptions">...</a>' +
                        '</span></div></div></div>';
                        // Label (display value)
                        prop_fragment += '<div class="form-group">' +
                        '<label class="col-xs-4 control-label">Label:</label>' +
                        '<div class="col-xs-8">';
                        prop_fragment += '<div class="input-group">' +
                        '<input id="gc_component_attr_displayValue" type="text" class="form-control input-xs dfx_visual_editor_property_input" type="text"">' +
                        '</div></div></div>';
                        // Data Value
                        prop_fragment += '<div class="form-group">' +
                        '<label class="col-xs-4 control-label">Data Value:</label>' +
                        '<div class="col-xs-8">';
                        prop_fragment += '<div class="input-group">' +
                        '<input id="gc_component_attr_dataValue" type="text" class="form-control input-xs dfx_visual_editor_property_input" type="text"">' +
                        '</div></div></div>';
                        // Disabled
                        prop_fragment += '<div class="form-group">' +
                        '<label class="col-xs-4 control-label">Disabled:</label>' +
                        '<div class="col-xs-8">';
                        prop_fragment += '<div class="input-group">' +
                        '<input id="gc_component_attr_disabled" type="text" class="form-control input-xs dfx_visual_editor_property_input" type="text"">' +
                        '</div></div></div>';

                        prop_fragment += '</div>';
                        cat_fragment += prop_fragment;
                    } else if (prop.propType == 'input-dynamicBindOptionsCarousel') {
                        // Choose dynamic options radio button
                        prop_fragment = '<div class="form-group">' +
                        '<label style="margin-top: 0px;margin-bottom: 0px;margin-left: 46px;" class="radio">' +
                        '<input id="gc_component_attr_dynamicOptions" type="radio" name="radioUseMD" style="margin-top:6px;">' +
                        '<a id="btnSelectFields" data-toggle="collapse" data-target="#listFieldsName" style="font-size:12px;" class="btn btn-link"' +
                        'onclick="$(\'#listStaticFieldsName\').removeClass(\'in\')">Dynamic</a></label></div>';

                        // Dynamic options container
                        prop_fragment += '<div id="listFieldsName" class="list-unstyled collapse">';
                        // Bind options using
                        prop_fragment += '<div class="form-group">' +
                        '<label class="col-xs-4 control-label">Bind Options Using:</label>' +
                        '<div class="col-xs-8">';
                        prop_fragment += '<div class="input-group">' +
                        '<input id="gc_component_attr_propertyOptions" type="text" class="form-control input-xs dfx_visual_editor_property_input" type="text"">' +
                        '<span class="input-group-btn">' +
                        '<a id="btnPickCollection" class="btn btn-default" href="#" data-toggle="modal" data-target="#pickerValueModal" data-vb-picker="bind" data-vb-picker-target="gc_component_attr_propertyOptions" data-ignore="push">...</a>' +
                        '</span></div></div></div>';
                        // Image Value
                        prop_fragment += '<div class="form-group">' +
                        '<label class="col-xs-4 control-label">Image Value:</label>' +
                        '<div class="col-xs-8">';
                        prop_fragment += '<div class="input-group">' +
                        '<input id="gc_component_attr_imgValue" type="text" class="form-control input-xs dfx_visual_editor_property_input" type="text"">' +
                        '</div></div></div>';
                        // Caption Value
                        prop_fragment += '<div class="form-group">' +
                        '<label class="col-xs-4 control-label">Caption Value:</label>' +
                        '<div class="col-xs-8">';
                        prop_fragment += '<div class="input-group">' +
                        '<input id="gc_component_attr_captionValue" type="text" class="form-control input-xs dfx_visual_editor_property_input" type="text"">' +
                        '</div></div></div>';

                        prop_fragment += '</div>';
                        cat_fragment += prop_fragment;
                    } else if (prop.propType == 'input-staticBindOptionsCarousel') {
                        // Choose static options radio button
                        prop_fragment = '<div class="form-group">' +
                        '<label style="margin-top: 0px;margin-bottom: 0px;margin-left: 46px;" class="radio">' +
                        '<input id="gc_component_attr_staticOptions" type="radio" name="radioUseMD" style="margin-top:6px;">' +
                        '<a id="btnSelectFieldsStatic" data-toggle="collapse" data-target="#listStaticFieldsName" style="font-size:12px;" class="btn btn-link"' +
                        'onclick="$(\'#listFieldsName\').removeClass(\'in\')">Static</a></label></div>';

                        // Static options container
                        prop_fragment += '<div id="listStaticFieldsName" class="list-unstyled collapse">';

                        // Static Options
                        prop_fragment +=
                            '<div id="staticImgsBlock" class="carousel-static-img">' +
                            '<a href="javascript:" onclick="gc_web_carousel.removeImgBlock(event)" style="margin-top:-5px;margin-right:-5px;display:none" class="btn btn-link pull-right remove-img">' +
                            '<i style="font-size:11px" class="fa fa-times"></i></a>' +
                            '<ul style="margin:5px;background-color: #f7f7f9;border: 1px solid #e1e1e8;padding: 9px 14px;font-size: 12px;" class="list-unstyled">' +
                            '<li><label class="col-xs-4 control-label">Image Src:</label>' +
                            '<div class="input-group col-xs-8">' +
                            '<input id="gc_component_attr_imgSrc" type="text" class="form-control input-xs dfx_visual_editor_property_input">' +
                            '<span class="input-group-btn">' +
                            '<a id="btnPickImg" class="btn btn-default" href="#" data-toggle="modal" data-target="#pickerValueModal" data-vb-picker="bind" data-vb-picker-target="gc_component_attr_imgSrc">...</a>' +
                            '</span>' +
                            '</div>' +
                            '<span class="col-xs-4"></span>' +
                            '<a id="btnPickImg" href="#" class="col-xs-8" data-toggle="modal" data-target="#imgsModal" data-vb-picker-target="gc_component_attr_imgSrc" data-ignore="push">Pick from resources...</a>' +
                            '</li>' +
                            '<li><label class="col-xs-4 control-label">Caption:</label>' +
                            '<div class="input-group col-xs-8">' +
                            '<input id="gc_component_attr_caption" type="text" style="font-size: 12px;height: 28px;" class="form-control input-xs dfx_visual_editor_property_input">' +
                            '</div></li>' +
                            '</ul>' +
                            '</div>';

                        prop_fragment +=
                            '<a id="btnAddImgBlock" onclick="gc_web_carousel.appendImgBlock()" style="margin-top:10px" class="btn btn-default pull-right">' +
                            '<span class="fa fa-plus"></span><span style="padding-left:5px">Add Image</span></a>';

                        prop_fragment += '</div>';
                        cat_fragment += prop_fragment;
                    } else if (prop.propType == 'input-dynamicBindOptionsTableView') {
                        // Choose dynamic options radio button
                        prop_fragment = '<div class="form-group">' +
                        '<label style="margin-top: 0px;margin-bottom: 0px;margin-left: 46px;" class="radio">' +
                        '<input id="gc_component_attr_dynamicOptions" type="radio" name="radioUseMD" style="margin-top:6px;">' +
                        '<a id="btnSelectFields" data-toggle="collapse" data-target="#listFieldsName" style="font-size:12px;" class="btn btn-link">Dynamic</a></label></div>';

                        // Dynamic options container
                        prop_fragment += '<div id="listFieldsName" class="list-unstyled collapse">';
                        // Bind options using
                        prop_fragment += '<div class="form-group">' +
                        '<label class="col-xs-4 control-label">Bind Options Using:</label>' +
                        '<div class="col-xs-8">';
                        prop_fragment += '<div class="input-group">' +
                        '<input id="gc_component_attr_propertyOptions" type="text" class="form-control input-xs dfx_visual_editor_property_input" type="text"">' +
                        '<span class="input-group-btn">' +
                        '<a id="btnPickCollection" class="btn btn-default" href="#" data-toggle="modal" data-target="#pickerValueModal" data-vb-picker="bind" data-vb-picker-target="gc_component_attr_propertyOptions" data-ignore="push">...</a>' +
                        '</span></div></div></div>';
                        // Label
                        prop_fragment += '<div class="form-group">' +
                        '<label class="col-xs-4 control-label">Label:</label>' +
                        '<div class="col-xs-8">';
                        prop_fragment += '<div class="input-group">' +
                        '<input id="gc_component_attr_label" type="text" class="form-control input-xs dfx_visual_editor_property_input" type="text"">' +
                        '</div></div></div>';
                        // Value
                        prop_fragment += '<div class="form-group">' +
                        '<label class="col-xs-4 control-label">Value:</label>' +
                        '<div class="col-xs-8">';
                        prop_fragment += '<div class="input-group">' +
                        '<input id="gc_component_attr_value" type="text" class="form-control input-xs dfx_visual_editor_property_input" type="text"">' +
                        '</div></div></div>';
                        // Icon
                        prop_fragment += '<div class="form-group">' +
                        '<label class="col-xs-4 control-label">Icon:</label>' +
                        '<div class="col-xs-8">';
                        prop_fragment += '<div class="input-group">' +
                        '<input id="gc_component_attr_icon" type="text" class="form-control input-xs dfx_visual_editor_property_input" type="text"">' +
                        '</div></div></div>';
                        // Chevron
                        prop_fragment += '<div class="form-group">' +
                        '<label class="col-xs-4 control-label">Chevron:</label>' +
                        '<div class="col-xs-8">';
                        prop_fragment += '<div class="input-group">' +
                        '<input id="gc_component_attr_chevron" type="text" class="form-control input-xs dfx_visual_editor_property_input" type="text"">' +
                        '</div></div></div>';

                        prop_fragment += '</div>';
                        cat_fragment += prop_fragment;
                    }
                }

                cat_fragment += '</div>';
                if (cat.dynamic == true) {
                    cat_fragment += '</span>';
                }
                $('#dfx_visual_editor_property_panel_attributes').append(cat_fragment);
            }

            // Initialization
            for (i = 0; i < definition.categories.length; i++) {
                var cat = definition.categories[i];
                for (j = 0; j < cat.properties.length; j++) {
                    var prop = cat.properties[j];
                    if (prop.type == 'value') {
                        if (gc_component_def.attributes[prop.id])
                            $('#gc_component_attr_' + prop.id).val(gc_component_def.attributes[prop.id].value);
                    } else if (prop.type == 'css') {
                        for (k = 0; k < prop.cssOptions.length; k++) {
                            var css_prop = prop.cssOptions[k];
                            if (gc_component_def.attributes[prop.id] && gc_component_def.attributes[prop.id][css_prop])
                                $('#gc_component_attr_' + prop.id + '_' + css_prop).val(gc_component_def.attributes[prop.id][css_prop]);
                        }
                    } else if (prop.type == 'counter') {
                        $('#gc_component_attr_' + prop.id + '_bind').val(gc_component_def.attributes[prop.id]['bind']);
                        $('#gc_component_attr_' + prop.id + '_onclick').val(gc_component_def.attributes[prop.id]['onclick']);
                        $('#gc_component_attr_' + prop.id + '_position').val(gc_component_def.attributes[prop.id]['position']);
                    } else if (prop.type == 'object') {
                        $('#gc_component_attr_' + prop.id + '_name').val(gc_component_def.attributes[prop.id]['name']);
                        $('#gc_component_attr_' + prop.id + '_value').val(gc_component_def.attributes[prop.id]['value']);
                    } else if (prop.type == 'staticBindOptionsCheckbox' || prop.type == 'staticBindOptionsRadio' || prop.type == 'staticBindOptionsTableView') {
                        $('input[id="gc_component_attr_staticOptions"]').val(JSON.stringify(gc_component_def.attributes[prop.id]));
                    } else if (prop.type == 'dynamicBindOptionsCheckbox') {
                        var dynamicOptions = gc_component_def.attributes.dynamicOptions ? gc_component_def.attributes.dynamicOptions.value : 0;
                        if (dynamicOptions) {
                            $('#gc_component_attr_dynamicOptions').attr('checked', 'checked');
                        } else {
                            $('#gc_component_attr_staticOptions').attr('checked', 'checked');
                        }
                        $('#gc_component_attr_propertyOptions').val(gc_component_def.attributes.propertyOptions.value);
                        $('#gc_component_attr_displayValue').val(gc_component_def.attributes.propertyOptionsFields.displayValue);
                        $('#gc_component_attr_checkedValue').val(gc_component_def.attributes.propertyOptionsFields.checkedValue);
                        $('#gc_component_attr_uncheckedValue').val(gc_component_def.attributes.propertyOptionsFields.uncheckedValue);
                        $('#gc_component_attr_disabled').val(gc_component_def.attributes.propertyOptionsFields.disabled);
                    } else if (prop.type == 'dynamicBindOptionsRadio') {
                        var dynamicOptions = gc_component_def.attributes.dynamicOptions ? gc_component_def.attributes.dynamicOptions.value : 0;
                        if (dynamicOptions) {
                            $('#gc_component_attr_dynamicOptions').attr('checked', 'checked');
                        } else {
                            $('#gc_component_attr_staticOptions').attr('checked', 'checked');
                        }
                        $('#gc_component_attr_propertyOptions').val(gc_component_def.attributes.propertyOptions.value);
                        $('#gc_component_attr_displayValue').val(gc_component_def.attributes.propertyOptionsFields.displayValue);
                        $('#gc_component_attr_dataValue').val(gc_component_def.attributes.propertyOptionsFields.dataValue);
                        $('#gc_component_attr_disabled').val(gc_component_def.attributes.propertyOptionsFields.disabled);
                    } else if (prop.type == 'dynamicBindOptionsTableView') {
                        var dynamicOptions = gc_component_def.attributes.dynamicOptions ? gc_component_def.attributes.dynamicOptions.value : 0;
                        if (dynamicOptions) {
                            $('#gc_component_attr_dynamicOptions').attr('checked', 'checked');
                        } else {
                            $('#gc_component_attr_staticOptions').attr('checked', 'checked');
                        }
                        $('#gc_component_attr_propertyOptions').val(gc_component_def.attributes.propertyOptions.value);
                        $('#gc_component_attr_label').val(gc_component_def.attributes.propertyOptionsFields.label);
                        $('#gc_component_attr_value').val(gc_component_def.attributes.propertyOptionsFields.value);
                        $('#gc_component_attr_icon').val(gc_component_def.attributes.propertyOptionsFields.icon);
                        $('#gc_component_attr_chevron').val(gc_component_def.attributes.propertyOptionsFields.chevron);
                    }
                }
            }

            // Initialize color pickers
            for (k = 0; k < colorPickers.length; k++) {
                $('#' + colorPickers[k]).colorpicker({'container': '#' + colorPickers[k]});
            }
        },
        "getPropertiesFromPanel": function (definition) {
            var i, j, k;
            var return_definition = new Object();
            for (i = 0; i < definition.categories.length; i++) {
                var cat = definition.categories[i];
                for (j = 0; j < cat.properties.length; j++) {
                    var prop = cat.properties[j];
                    if (prop.type == 'value') {
                        var val                    = $('#gc_component_attr_' + prop.id).val();
                        return_definition[prop.id] = {"value": val};
                    } else if (prop.type == 'object') {
                        var name = $('#gc_component_attr_' + prop.id).val();
                        var val  = "&#57350;";//$('#gc_component_attr_' + prop.id).val();
                        return_definition[prop.id] = {"name": name, "value": val};
                    } else if (prop.type == 'css') {
                        return_definition[prop.id] = {};
                        for (k = 0; k < prop.cssOptions.length; k++) {
                            var css_prop                         = prop.cssOptions[k];
                            var val                              = $('#gc_component_attr_' + prop.id + '_' + css_prop).val();
                            return_definition[prop.id][css_prop] = val;
                        }
                    } else if (prop.type == 'counter') {
                        var bind                   = $('#gc_component_attr_' + prop.id + '_bind').val();
                        var onclick                = $('#gc_component_attr_' + prop.id + '_onclick').val();
                        var position               = $('#gc_component_attr_' + prop.id + '_position').val();
                        return_definition[prop.id] = {"bind": bind, "onclick": onclick, "position": position};
                    } else if (prop.type == 'object') {
                        var name                   = $('#gc_component_attr_' + prop.id + '_name').val();
                        var val                    = $('#gc_component_attr_' + prop.id + '_value').val();
                        return_definition[prop.id] = {"name": name, "value": val};
                    } else if (prop.type == 'staticBindOptionsCheckbox' || prop.type == 'staticBindOptionsRadio' || prop.type == 'staticBindOptionsTableView') {
                        var val                    = $('input[id="gc_component_attr_staticOptions"]').val();
                        return_definition[prop.id] = JSON.parse(val);
                    } else if (prop.type == 'dynamicBindOptionsCheckbox') {
                        var dynamicOptions = $('#gc_component_attr_dynamicOptions').is(':checked');

                        if (dynamicOptions) {
                            return_definition['dynamicOptions'] = {"value": true};
                        }
                        else {
                            return_definition['dynamicOptions'] = {"value": false};
                        }

                        return_definition['propertyOptions']       = {"value": $('#gc_component_attr_propertyOptions').val()};
                        return_definition['propertyOptionsFields'] = {
                            "displayValue":   $('#gc_component_attr_displayValue').val(),
                            "checkedValue":   $('#gc_component_attr_checkedValue').val(),
                            "uncheckedValue": $('#gc_component_attr_uncheckedValue').val(),
                            "disabled":       $('#gc_component_attr_disabled').val()
                        };
                    } else if (prop.type == 'dynamicBindOptionsRadio') {
                        var dynamicOptions = $('#gc_component_attr_dynamicOptions').is(':checked');

                        if (dynamicOptions) {
                            return_definition['dynamicOptions'] = {"value": true};
                        }
                        else {
                            return_definition['dynamicOptions'] = {"value": false};
                        }

                        return_definition['propertyOptions']       = {"value": $('#gc_component_attr_propertyOptions').val()};
                        return_definition['propertyOptionsFields'] = {
                            "displayValue": $('#gc_component_attr_displayValue').val(),
                            "dataValue":    $('#gc_component_attr_dataValue').val(),
                            "disabled":     $('#gc_component_attr_disabled').val()
                        };
                    } else if (prop.type == 'dynamicBindOptionsTableView') {
                        var dynamicOptions = $('#gc_component_attr_dynamicOptions').is(':checked');

                        if (dynamicOptions) {
                            return_definition['dynamicOptions'] = {"value": true};
                        }
                        else {
                            return_definition['dynamicOptions'] = {"value": false};
                        }

                        return_definition['propertyOptions']       = {"value": $('#gc_component_attr_propertyOptions').val()};
                        return_definition['propertyOptionsFields'] = {
                            "label":   $('#gc_component_attr_label').val(),
                            "value":   $('#gc_component_attr_value').val(),
                            "icon":    $('#gc_component_attr_icon').val(),
                            "chevron": $('#gc_component_attr_chevron').val()
                        };
                    }
                }
            }
            return return_definition;
        },
        "getDefaultAttributes":   function (definition) {
            var i, j, k;
            var return_definition = new Object();
            for (i = 0; i < definition.categories.length; i++) {
                var cat = definition.categories[i];
                for (j = 0; j < cat.properties.length; j++) {
                    var prop = cat.properties[j];
                    if (prop.type == 'value') {
                        return_definition[prop.id] = {"value": prop.default};
                    } else if (prop.type == 'object') {
                        return_definition[prop.id] = {"name": prop.default.name, "value": prop.default.value};
                    } else if (prop.type == 'css') {
                        return_definition[prop.id] = {};
                        for (k = 0; k < prop.cssOptions.length; k++) {
                            var css_prop = prop.cssOptions[k];
                            var css_val  = '';
                            if (prop.default && prop.default[css_prop])
                                css_val = prop.default[css_prop];
                            return_definition[prop.id][css_prop] = css_val;
                        }
                    } else if (prop.type == 'counter') {
                        return_definition[prop.id] = {"bind": "", "onclick": "", "position": "left"};
                    } else if (prop.type == 'gridColumns') {
                        return_definition[prop.id] = prop.default;
                    } else if (prop.type == 'staticBindOptionsCheckbox') {
                        return_definition[prop.id] = [
                            {
                                "displayValue":   "Label",
                                "checkedValue":   "",
                                "uncheckedValue": "",
                                "disabled":       false
                            }
                        ];
                    } else if (prop.type == 'staticBindOptionsRadio') {
                        return_definition[prop.id] = [
                            {
                                "displayValue": "Label",
                                "dataValue":    "",
                                "disabled":     false
                            }
                        ];
                    } else if (prop.type == 'staticBindOptionsTableView') {
                        return_definition[prop.id] = [
                            {
                                "label":   "Item 1",
                                "value":   "Item1",
                                "icon":    "trash",
                                "chevron": ''
                            },
                            {
                                "label":   "Item 2",
                                "value":   "Item2",
                                "icon":    "gear",
                                "chevron": ''
                            },
                            {
                                "label":   "Item 3",
                                "value":   "Item3",
                                "icon":    "pages",
                                "chevron": ''
                            }
                        ];
                    } else if (prop.type == 'dynamicBindOptionsCheckbox') {
                        return_definition['dynamicOptions']        = {"value": false};
                        return_definition['propertyOptions']       = {"value": ""};
                        return_definition['propertyOptionsFields'] = {
                            "displayValue":   "label",
                            "checkedValue":   "value",
                            "uncheckedValue": "uncheckedValue",
                            "disabled":       "disabled"
                        };
                    } else if (prop.type == 'dynamicBindOptionsRadio') {
                        return_definition['dynamicOptions']        = {"value": false};
                        return_definition['propertyOptions']       = {"value": ""};
                        return_definition['propertyOptionsFields'] = {
                            "displayValue": "label",
                            "dataValue":    "value",
                            "disabled":     "disabled"
                        };
                    } else if (prop.type == 'dynamicBindOptionsTableView') {
                        return_definition['dynamicOptions']        = {"value": false};
                        return_definition['propertyOptions']       = {"value": ""};
                        return_definition['propertyOptionsFields'] = {
                            "label":   "label",
                            "value":   "value",
                            "icon":    "icon",
                            "chevron": "chevron"
                        };
                    } else if (prop.type == 'hidden') {
                        return_definition[prop.id] = {"value": prop.default};
                    } else {
                        return_definition[prop.id] = prop.default;
                    }
                }
            }
            return return_definition;
        },
        "migrateAttributes":      function (definition, gc_component_def) {
            var i, j, k;
            var return_definition = new Object();
            for (i = 0; i < definition.categories.length; i++) {
                var cat = definition.categories[i];
                for (j = 0; j < cat.properties.length; j++) {
                    var prop = cat.properties[j];
                    if (gc_component_def[prop.id] == null) {
                        if (prop.type == 'value') {
                            return_definition[prop.id] = {"value": prop.default};
                        } else if (prop.type == 'object') {
                            return_definition[prop.id] = {"name": prop.default.name, "value": prop.default.value};
                        } else if (prop.type == 'css') {
                            for (k = 0; k < prop.cssOptions.length; k++) {
                                var css_prop = prop.cssOptions[k];
                                var css_val  = '';
                                if (prop.default && prop.default[css_prop])
                                    css_val = prop.default[css_prop];
                                if ( return_definition[prop.id] ) {
                                    return_definition[prop.id][css_prop] = css_val;
                                }
                            }
                        } else if (prop.type == 'counter') {
                            return_definition[prop.id] = {"bind": "", "onclick": "", "position": "left"};
                        } else if (prop.type == 'staticBindOptionsCheckbox') {
                            return_definition[prop.id] = [
                                {
                                    "displayValue":   "Label",
                                    "checkedValue":   "",
                                    "uncheckedValue": "",
                                    "disabled":       false
                                }
                            ];
                        } else if (prop.type == 'staticBindOptionsRadio') {
                            return_definition[prop.id] = [
                                {
                                    "displayValue": "Label",
                                    "dataValue":    "",
                                    "disabled":     false
                                }
                            ];
                        } else if (prop.type == 'dynamicBindOptionsCheckbox') {
                            return_definition['dynamicOptions']        = {"value": false};
                            return_definition['propertyOptions']       = {"value": ""};
                            return_definition['propertyOptionsFields'] = {
                                "displayValue":   "label",
                                "checkedValue":   "value",
                                "uncheckedValue": "uncheckedValue",
                                "disabled":       "disabled"
                            };
                        } else if (prop.type == 'dynamicBindOptionsRadio') {
                            return_definition['dynamicOptions']        = {"value": false};
                            return_definition['propertyOptions']       = {"value": ""};
                            return_definition['propertyOptionsFields'] = {
                                "displayValue": "label",
                                "dataValue":    "value",
                                "disabled":     "disabled"
                            };
                        } else if (prop.type == 'hidden') {
                            return_definition[prop.id] = {"value": prop.default};
                        }
                    } else {
                        return_definition[prop.id] = gc_component_def[prop.id];
                    }
                }
            }
            return return_definition;
        }
    };

    // publish an event that gc_factory is ready
    $(document).trigger('gc_factory_ready');

});

var PickerImageModal   = {};
PickerImageModal.icons = (function () {
    var getGlyphIcons = function () {
        return {
            'glyphicon-adjust':                 'adjust',
            'glyphicon-align-center':           'align-center',
            'glyphicon-align-justify':          'align-justify',
            'glyphicon-align-left':             'align-left',
            'glyphicon-align-right':            'align-right',
            'glyphicon-arrow-down':             'arrow-down',
            'glyphicon-arrow-left':             'arrow-left',
            'glyphicon-arrow-right':            'arrow-right',
            'glyphicon-arrow-up':               'arrow-up',
            'glyphicon-asterisk':               'asterisk',
            'glyphicon-backward':               'backward',
            'glyphicon-ban-circle':             'ban-circle',
            'glyphicon-barcode':                'barcode',
            'glyphicon-bell':                   'bell',
            'glyphicon-bold':                   'bold',
            'glyphicon-book':                   'book',
            'glyphicon-bookmark':               'bookmark',
            'glyphicon-briefcase':              'briefcase',
            'glyphicon-bullhorn':               'bullhorn',
            'glyphicon-calendar':               'calendar',
            'glyphicon-camera':                 'camera',
            'glyphicon-certificate':            'certificate',
            'glyphicon-check':                  'check',
            'glyphicon-chevron-down':           'chevron-down',
            'glyphicon-chevron-left':           'chevron-left',
            'glyphicon-chevron-right':          'chevron-right',
            'glyphicon-chevron-up':             'chevron-up',
            'glyphicon-circle-arrow-down':      'circle-arrow-down',
            'glyphicon-circle-arrow-left':      'circle-arrow-left',
            'glyphicon-circle-arrow-right':     'circle-arrow-right',
            'glyphicon-circle-arrow-up':        'circle-arrow-up',
            'glyphicon-cloud':                  'cloud',
            'glyphicon-cloud-download':         'cloud-download',
            'glyphicon-cloud-upload':           'cloud-upload',
            'glyphicon-cog':                    'cog',
            'glyphicon-collapse-down':          'collapse-down',
            'glyphicon-collapse-up':            'collapse-up',
            'glyphicon-comment':                'comment',
            'glyphicon-compressed':             'compressed',
            'glyphicon-copyright-mark':         'copyright-mark',
            'glyphicon-credit-card':            'credit-card',
            'glyphicon-cutlery':                'cutlery',
            'glyphicon-dashboard':              'dashboard',
            'glyphicon-download':               'download',
            'glyphicon-download-alt':           'download-alt',
            'glyphicon-earphone':               'earphone',
            'glyphicon-edit':                   'edit',
            'glyphicon-eject':                  'eject',
            'glyphicon-envelope':               'envelope',
            'glyphicon-euro':                   'euro',
            'glyphicon-exclamation-sign':       'exclamation-sign',
            'glyphicon-expand':                 'expand',
            'glyphicon-export':                 'export',
            'glyphicon-eye-close':              'eye-close',
            'glyphicon-eye-open':               'eye-open',
            'glyphicon-facetime-video':         'facetime-video',
            'glyphicon-fast-backward':          'fast-backward',
            'glyphicon-fast-forward':           'fast-forward',
            'glyphicon-file':                   'file',
            'glyphicon-film':                   'film',
            'glyphicon-filter':                 'filter',
            'glyphicon-fire':                   'fire',
            'glyphicon-flag':                   'flag',
            'glyphicon-flash':                  'flash',
            'glyphicon-floppy-disk':            'floppy-disk',
            'glyphicon-floppy-open':            'floppy-open',
            'glyphicon-floppy-remove':          'floppy-remove',
            'glyphicon-floppy-save':            'floppy-save',
            'glyphicon-floppy-saved':           'floppy-saved',
            'glyphicon-folder-close':           'folder-close',
            'glyphicon-folder-open':            'folder-open',
            'glyphicon-font':                   'font',
            'glyphicon-forward':                'forward',
            'glyphicon-fullscreen':             'fullscreen',
            'glyphicon-gbp':                    'gbp',
            'glyphicon-gift':                   'gift',
            'glyphicon-glass':                  'glass',
            'glyphicon-globe':                  'globe',
            'glyphicon-hand-down':              'hand-down',
            'glyphicon-hand-left':              'hand-left',
            'glyphicon-hand-right':             'hand-right',
            'glyphicon-hand-up':                'hand-up',
            'glyphicon-hd-video':               'hd-video',
            'glyphicon-hdd':                    'hdd',
            'glyphicon-header':                 'header',
            'glyphicon-headphones':             'headphones',
            'glyphicon-heart':                  'heart',
            'glyphicon-heart-empty':            'heart-empty',
            'glyphicon-home':                   'home',
            'glyphicon-import':                 'import',
            'glyphicon-inbox':                  'inbox',
            'glyphicon-indent-left':            'indent-left',
            'glyphicon-indent-right':           'indent-right',
            'glyphicon-info-sign':              'info-sign',
            'glyphicon-italic':                 'italic',
            'glyphicon-leaf':                   'leaf',
            'glyphicon-link':                   'link',
            'glyphicon-list':                   'list',
            'glyphicon-list-alt':               'list-alt',
            'glyphicon-lock':                   'lock',
            'glyphicon-log-in':                 'log-in',
            'glyphicon-log-out':                'log-out',
            'glyphicon-magnet':                 'magnet',
            'glyphicon-map-marker':             'map-marker',
            'glyphicon-minus':                  'minus',
            'glyphicon-minus-sign':             'minus-sign',
            'glyphicon-move':                   'move',
            'glyphicon-music':                  'music',
            'glyphicon-new-window':             'new-window',
            'glyphicon-off':                    'off',
            'glyphicon-ok':                     'ok',
            'glyphicon-ok-circle':              'ok-circle',
            'glyphicon-ok-sign':                'ok-sign',
            'glyphicon-open':                   'open',
            'glyphicon-paperclip':              'paperclip',
            'glyphicon-pause':                  'pause',
            'glyphicon-pencil':                 'pencil',
            'glyphicon-phone':                  'phone',
            'glyphicon-phone-alt':              'phone-alt',
            'glyphicon-picture':                'picture',
            'glyphicon-plane':                  'plane',
            'glyphicon-play':                   'play',
            'glyphicon-play-circle':            'play-circle',
            'glyphicon-plus':                   'plus',
            'glyphicon-plus-sign':              'plus-sign',
            'glyphicon-print':                  'print',
            'glyphicon-pushpin':                'pushpin',
            'glyphicon-qrcode':                 'qrcode',
            'glyphicon-question-sign':          'question-sign',
            'glyphicon-random':                 'random',
            'glyphicon-record':                 'record',
            'glyphicon-refresh':                'refresh',
            'glyphicon-registration-mark':      'registration-mark',
            'glyphicon-remove':                 'remove',
            'glyphicon-remove-circle':          'remove-circle',
            'glyphicon-remove-sign':            'remove-sign',
            'glyphicon-repeat':                 'repeat',
            'glyphicon-resize-full':            'resize-full',
            'glyphicon-resize-horizontal':      'resize-horizontal',
            'glyphicon-resize-small':           'resize-small',
            'glyphicon-resize-vertical':        'resize-vertical',
            'glyphicon-retweet':                'retweet',
            'glyphicon-road':                   'road',
            'glyphicon-save':                   'save',
            'glyphicon-saved':                  'saved',
            'glyphicon-screenshot':             'screenshot',
            'glyphicon-sd-video':               'sd-video',
            'glyphicon-search':                 'search',
            'glyphicon-send':                   'send',
            'glyphicon-share':                  'share',
            'glyphicon-share-alt':              'share-alt',
            'glyphicon-shopping-cart':          'shopping-cart',
            'glyphicon-signal':                 'signal',
            'glyphicon-sort':                   'sort',
            'glyphicon-sort-by-alphabet':       'sort-by-alphabet',
            'glyphicon-sort-by-alphabet-alt':   'sort-by-alphabet-alt',
            'glyphicon-sort-by-attributes':     'sort-by-attributes',
            'glyphicon-sort-by-attributes-alt': 'sort-by-attributes-alt',
            'glyphicon-sort-by-order':          'sort-by-order',
            'glyphicon-sort-by-order-alt':      'sort-by-order-alt',
            'glyphicon-sound-5-1':              'sound-5-1',
            'glyphicon-sound-6-1':              'sound-6-1',
            'glyphicon-sound-7-1':              'sound-7-1',
            'glyphicon-sound-dolby':            'sound-dolby',
            'glyphicon-sound-stereo':           'sound-stereo',
            'glyphicon-star':                   'star',
            'glyphicon-star-empty':             'star-empty',
            'glyphicon-stats':                  'stats',
            'glyphicon-step-backward':          'step-backward',
            'glyphicon-step-forward':           'step-forward',
            'glyphicon-stop':                   'stop',
            'glyphicon-subtitles':              'subtitles',
            'glyphicon-tag':                    'tag',
            'glyphicon-tags':                   'tags',
            'glyphicon-tasks':                  'tasks',
            'glyphicon-text-height':            'text-height',
            'glyphicon-text-width':             'text-width',
            'glyphicon-th':                     'th',
            'glyphicon-th-large':               'th-large',
            'glyphicon-th-list':                'th-list',
            'glyphicon-thumbs-down':            'thumbs-down',
            'glyphicon-thumbs-up':              'thumbs-up',
            'glyphicon-time':                   'time',
            'glyphicon-tint':                   'tint',
            'glyphicon-tower':                  'tower',
            'glyphicon-transfer':               'transfer',
            'glyphicon-trash':                  'trash',
            'glyphicon-tree-conifer':           'tree-conifer',
            'glyphicon-tree-deciduous':         'tree-deciduous',
            'glyphicon-unchecked':              'unchecked',
            'glyphicon-upload':                 'upload',
            'glyphicon-usd':                    'usd',
            'glyphicon-user':                   'user',
            'glyphicon-volume-down':            'volume-down',
            'glyphicon-volume-off':             'volume-off',
            'glyphicon-volume-up':              'volume-up',
            'glyphicon-warning-sign':           'warning-sign',
            'glyphicon-wrench':                 'wrench',
            'glyphicon-zoom-in':                'zoom-in',
            'glyphicon-zoom-out':               'zoom-out'
        };
    };

    var getGlyphIconsSymbol = function () {
        return [
            {'class': 'glyphicon-asterisk', name: 'asterisk', 'symbol': '&amp;#42;'},
            {'class': 'glyphicon-flag', name: 'flag', 'symbol': '&amp;#57396;'},
            {'class': 'glyphicon-heart', name: 'heart', 'symbol': '&amp;#57349;'},
            {'class': 'glyphicon-heart-empty', name: 'heart-empty', 'symbol': '&amp;#57667;'},
            {'class': 'glyphicon-leaf', name: 'leaf', 'symbol': '&amp;#57603;'},
            {'class': 'glyphicon-star', name: 'star', 'symbol': '&amp;#57350;'},
            {'class': 'glyphicon-star-empty', name: 'star-empty', 'symbol': '&amp;#57351;'},
            {'class': 'glyphicon-bell', name: 'bell', 'symbol': '&amp;#57635;'}
        ];
    };

    var getRatchetIcons = function () {
        return {
            'icon-back':          'back',
            'icon-bars':          'bars',
            'icon-caret':         'caret',
            'icon-check':         'check',
            'icon-close':         'close',
            'icon-code':          'code',
            'icon-compose':       'compose',
            'icon-download':      'download',
            'icon-edit':          'edit',
            'icon-forward':       'forward',
            'icon-gear':          'gear',
            'icon-home':          'home',
            'icon-info':          'info',
            'icon-list':          'list',
            'icon-more-vertical': 'more-vertical',
            'icon-more':          'more',
            'icon-pages':         'pages',
            'icon-pause':         'pause',
            'icon-person':        'person',
            'icon-play':          'play',
            'icon-plus':          'plus',
            'icon-refresh':       'refresh',
            'icon-search':        'search',
            'icon-share':         'share',
            'icon-sound':         'sound',
            'icon-sound2':        'sound2',
            'icon-sound3':        'sound3',
            'icon-sound4':        'sound4',
            'icon-star-filled':   'star-filled',
            'icon-star':          'star',
            'icon-stop':          'stop',
            'icon-trash':         'trash',
            'icon-up-nav':        'up-nav',
            'icon-up':            'up',
            'icon-right-nav':     'right-nav',
            'icon-right':         'right',
            'icon-down-nav':      'down-nav',
            'icon-down':          'down',
            'icon-left-nav':      'left-nav',
            'icon-left':          'left'
        };
    };

    var fillContent = function (idTab, idModal) {
        var glyphIcons = ( idModal == 'iconsModal' ) ? getGlyphIcons() : getGlyphIconsSymbol(),
            i          = 0,
            content    =
                '<table id="winModalTbl" class="dfx_visual_editor_property_modal_table table table-condensed">\
                 <tbody id="winModalTblBody"><tr>';
        if (idModal == 'iconsModal') {
            for (var pr in glyphIcons) {
                content +=
                    '<td align="center" width="12,5%" class="iconBlock" style="cursor:pointer;height:80px;">' +
                    '<span class="glyphicon ' + pr + '"></span><br />' +
                    '<span class="glyphicon-class">' + glyphIcons[pr] + '</span>' +
                    '</td>';
                if (i % 8 == 7) {
                    content += '</tr><tr>';
                }
                i++;
            }
        } else if (idModal == 'iconSymbolsModal') {
            for (var j = 0, len = glyphIcons.length; j < len; j++) {
                content +=
                    '<td align="center" width="12,5%" class="iconBlock" style="cursor:pointer;height:80px;">' +
                    '<span class="glyphicon ' + glyphIcons[j].class + '"></span><br />' +
                    '<span class="glyphicon-class">' + glyphIcons[j].name + '</span>' +
                    '<input type="hidden" class="glyphicon-unicode" value="' + glyphIcons[j].symbol + '" />' +
                    '</td>';
                if (j % 8 == 7) {
                    content += '</tr><tr>';
                }

            }

        }
        content += '</tr></tbody></table>';

        // fill tab
        $('#' + idTab + 'Div', '#' + idModal)
            .css({'height': '500px', 'overflow': 'auto'}).empty().append(content);

        $('.iconBlock').on('click', function (e) {
            var rel_elem   = CustomModal.settings().relElement,
                parent     = $(rel_elem).closest('.input-group'),
                el_update  = null,
                val_update = $('.glyphicon-class', this).text();
            if (rel_elem && $(rel_elem).length) {
                el_update = $(rel_elem).attr('data-vb-picker-target');
                $('#' + el_update, parent).val(val_update);
                if (idModal == 'iconSymbolsModal') {
                    $('#gc_component_attr_symbol_name').val(val_update);
                    $('#gc_component_attr_symbol_value').val($('.glyphicon-unicode', this).val());
                }
            }
            $('.closeModal').click();
        }).hover(
            function () {
                $(this).css({'background-color': '#563d7c', 'color': '#fff'});
            },
            function () {
                $(this).css({'background-color': '#fff', 'color': '#333'});
            }
        );
    };

    var fillRatchContent = function (idTab, idModal) {
        var ratchicons = getRatchetIcons(),
            i          = 0,
            content    = '<table id="winModalTbl" class="dfx_visual_editor_property_modal_table table table-condensed">' +
                '<tbody id="winModalTblBody"><tr>';
        for (var pr in ratchicons) {
            content +=
                '<td align="center" width="12,5%" class="iconBlockRatchet" style="cursor:pointer;height:80px;">' +
                '<span class="icon ' + pr + '"></span><br />' +
                '<span class="ratchicon-class">' + ratchicons[pr] + '</span>' +
                '</td>';
            if (i % 8 == 7) {
                content += '</tr><tr>';
            }
            i++;
        }
        content += '</tr></tbody></table>';

        // fill tab
        $('#' + idTab + 'Div', '#' + idModal)
            .css({'height': '500px', 'overflow': 'auto'}).addClass('ratchet').empty().append(content);

        $('.iconBlockRatchet').on('click', function (e) {
            var rel_elem   = CustomModal.settings().relElement,
                parent     = $(rel_elem).closest('.input-group'),
                el_update  = null,
                val_update = $('.ratchicon-class', this).text();
            if (rel_elem && $(rel_elem).length) {
                el_update = $(rel_elem).attr('data-vb-picker-target');
                $('#' + el_update, parent).val(val_update);
                if (idModal == 'iconSymbolsModal') {
                    $('#gc_component_attr_symbol_name').val(val_update);
                    $('#gc_component_attr_symbol_value').val($('.glyphicon-unicode', this).val());
                }
            }
            $('.closeModal').click();
        })
            .hover(
            function () {
                $(this).css({'background-color': '#563d7c', 'color': '#fff'});
            },
            function () {
                $(this).css({'background-color': '#fff', 'color': '#333'});
            }
        );
    };
    return {
        fillModal: function (idModal, platform) {
            platform = platform ? platform : platform = $('#dfx_visual_editor').attr('platform');
            CustomModal.icons = function () {
                this.decorate = function () {
                    var idTab = 'iconTab';
                    if (!$('#' + idModal).length) {
                        this.icons.prototype.decorateTabs(
                            idModal,
                            'Icons',
                            '<button type="button" class="btn btn-default closeModal" data-dismiss="modal">Close</button>',
                            {'width': '800px'}
                        );
                        this.settings().addTab(idModal, idTab, 'Glyphicons', platform == 'web', platform == 'web');
                        fillContent(idTab, idModal);
                        this.settings().addTab(idModal, 'ratchiconsTab', 'Ratchicons', platform != 'web', platform != 'web');
                        fillRatchContent('ratchiconsTab', idModal);
                    } else {
                        $('#iconTab, #ratchiconsTab').parent().removeClass('active').hide();
                        $('#iconTabDiv, #ratchiconsTabDiv').removeClass('active');
                        var tabId = platform == 'web' ? 'iconTab' : 'ratchiconsTab';
                        $('#' + tabId).parent().addClass('active').show();
                        $('#' + tabId + 'Div').addClass('active');
                    }
                };
            };
            CustomModal.getDecorator('icons').decorate();
        }
    }
})();

PickerImageModal.imgs = (function () {

    var buildTree   = function (branches) {
        var token, branch, imgs,
            html = [], html_imgs = '', url, filename, size;
        for (var i = 0, l = branches.length; i < l; i++) {
            branch = branches[i];
            token  = Math.random().toString(36).substr(2, 16);

            if (branch.name) {
                html.push({
                    label: '<span class="clname" id="' + token + '">' + (branch.application ? 'Application Resources' : 'Shared Resources') + '</span>'
                });
            }

            if (branch.images) {
                html_imgs += '<div class="col-lg-12 imgDiv dropzone" style="display: none; background-image: none; background: none; border: none;" id="' + token + 'Div">';
                imgs = branch.images;
                for (var j = 0, len = imgs.length; j < len; j++) {
                    url      = imgs[j].path.replace(/\/[^/]+\/common/, '/common');
                    size     = imgs[j].size;
                    filename = url.substring(url.lastIndexOf('/') + 1);
                    html_imgs += '<div data-item-type="Image" class="dz-preview dz-image-preview iconBlock">' +
                    '<div class="dz-details">' +
                    '<div class="dz-filename">' +
                    '<span data-dz-name="">' + filename + '</span>' +
                    '</div>' +
                    '<div data-dz-size="" class="dz-size">' + size + '</div>' +
                    '<img shared="' + (branch.application ? 'no' : 'yes') + '" data-toggle="tooltip" data-placement="bottom" class="img-class" data-dz-thumbnail="" alt="' + filename + '" data-src="' + url + '" src="/studio' + url.replace(/resources\/[^/]*/, 'resources/preview') + '">' +
                    '</div>' +
                    '<div class="dz-success-mark"><span>V</span></div></div>';
                }
                html_imgs += '<div id="image-attributes' + (branch.application ? '' : '-shared') + '" style="display: none; margin-top: 20px;">' +
                '<p><strong>File URL: </strong><span id="file-url' + (branch.application ? '' : '-shared') + '"></span></p>' +
                    //'<p>File size: <span id="file-size"></span></p>' +
                '</div>' +
                '</div>';
            }
        }
        return [html, html_imgs];
    };
    var fillContent = function (idModal) {
        DfxStudio.Resources.getWidgetImageResources(function (resources) {
            var leftHTML = '',
                arrHTML  = [];

            arrHTML  = buildTree(resources);
            leftHTML = '<div id="wb-resources-treeview" style="margin: 15px 0;"></div>';

            $('#leftImgSideBar', '#' + idModal).empty().append(leftHTML);
            $('#centerImgContainer', '#' + idModal).empty().append(arrHTML[1]);

            $('#wb-resources-treeview').tree({
                data:       arrHTML[0],
                autoEscape: false,
                autoOpen:   0
            });

            $('.clname').on('click', function (e) {
                var id = $(this).attr('id');
                $('.imgDiv').hide();
                $('#' + id + 'Div').show();
            });
            $('.iconBlock').on('click', function (e) {
                var rel_elem   = CustomModal.settings().relElement,
                    parent     = $(rel_elem).closest('.input-group'),
                    el_update  = $(rel_elem).attr('data-vb-picker-target'),
                    isShared   = $('[data-src]', $(this)).attr('shared'),
                    val_update = $('.img-class', this).data('src').replace(/\/resources\/[^/]*/, '');

                if (isShared == 'no') {
                    val_update = val_update.replace(/\/[^/]*/, '');
                }/* else {
                    val_update = '.' + val_update;
                }*/

                if (rel_elem && $(rel_elem).length && el_update && el_update.length) {
                    $('#' + el_update, parent).val(val_update);
                    if ($(rel_elem).parent().attr("class") != "input-group") {
                        $(rel_elem).parent().find('#' + el_update).val(val_update);
                    }
                } else {
                    $('#gc_image_attr_src').val(val_update);
                }
                $('.closeModal').click();
            }).hover(
                function () {
                    var $this    = $(this);
                    $this.css({'background-color': '#B2F3FF', 'color': '#223957'});
                    var isShared = $('[data-src]', $this).attr('shared');
                    if (isShared == 'yes') {
                        $('#file-url-shared').text($('[data-src]', $this).attr('data-src').replace(/\/resources\/[^/]*/, ''));
                        $('#image-attributes-shared').show();
                    } else {
                        $('#file-url').text($('[data-src]', $this).attr('data-src').replace(/\/resources\/[^/]*\/[^/]*/, ''));
                        $('#image-attributes').show();
                    }
                },
                function () {
                    var $this    = $(this);
                    $this.css({'background-color': '#fff', 'color': '#333'});
                    var isShared = $('[data-src]', $this).attr('shared');
                    $('#image-attributes' + (isShared == 'yes' ? '-shared' : '')).hide();
                }
            );
        });
    };
    return {
        fillModal: function (idModal) {
            CustomModal.imgs = function () {
                this.decorate = function () {
                    var idTab   = 'imgTab',
                        content = '<div class="col-lg-12" style="border-bottom: 1px solid #eee; padding: 0;">' +
                            '<div class="col-lg-3" id="leftImgSideBar" style="height:550px; overflow:auto; border-right:1px solid #eee; background: #e1e1e1; padding: 0;">' +
                            '</div><div class="col-lg-9" id="centerImgContainer" style="height:550px; overflow:auto;"></div></div>';
                    if (!$('#' + idModal).length) {
                        this.imgs.prototype.decorateCustom(
                            idModal,
                            'Images',
                            '<button type="button" class="btn btn-default closeModal" data-dismiss="modal" style="margin-top: 10px;">Close</button>',
                            content,
                            {'width': '930px'}
                        );
                        fillContent(idModal);
                    }
                }
            };

            CustomModal.getDecorator('imgs').decorate();
        }
    }
})();

PickerImageModal.___imgs = (function () {

    var buildTree   = function (branches) {
        var token, branch, imgs,
            html = [], html_imgs = '', url, filename, size;
        for (var i = 0, l = branches.length; i < l; i++) {
            branch = branches[i];
            token  = Math.random().toString(36).substr(2, 16);

            if (branch.name) {
                html.push({
                    label: '<span class="clname" id="' + token + '">' + (branch.application ? 'Application Resources' : 'Shared Resources') + '</span>'
                });
            }

            if (branch.images) {
                html_imgs += '<div class="col-lg-12 imgDiv dropzone" style="display: none; background-image: none; background: none; border: none;" id="' + token + 'Div">';
                imgs = branch.images;
                for (var j = 0, len = imgs.length; j < len; j++) {
                    url      = imgs[j].path.replace(/\/[^/]+\/common/, '/common');
                    size     = imgs[j].size;
                    filename = url.substring(url.lastIndexOf('/') + 1);
                    html_imgs += '<div data-item-type="Image" class="dz-preview dz-image-preview iconBlock">' +
                        '<div class="dz-details">' +
                        '<div class="dz-filename">' +
                        '<span data-dz-name="">' + filename + '</span>' +
                        '</div>' +
                        '<div data-dz-size="" class="dz-size">' + size + '</div>' +
                        '<img shared="' + (branch.application ? 'no' : 'yes') + '" data-toggle="tooltip" data-placement="bottom" class="img-class" data-dz-thumbnail="" alt="' + filename + '" data-src="' + url + '" src="/studio' + url.replace(/resources\/[^/]*/, 'resources/preview') + '">' +
                        '</div>' +
                        '<div class="dz-success-mark"><span>V</span></div></div>';
                }
                html_imgs += '<div id="image-attributes' + (branch.application ? '' : '-shared') + '" style="display: none; margin-top: 20px;">' +
                    '<p><strong>File URL: </strong><span id="file-url' + (branch.application ? '' : '-shared') + '"></span></p>' +
                        //'<p>File size: <span id="file-size"></span></p>' +
                    '</div>' +
                    '</div>';
            }
        }
        return [html, html_imgs];
    };
    var fillContent = function (idTab, idModal) {
        DfxStudio.Resources.getWidgetImageResources(function (resources) {
            var leftHTML = '',
                arrHTML  = [];

            //arrHTML  = buildTree(resources);
            //leftHTML = '<div id="wb-resources-treeview" style="margin: 15px 0;"></div>';

            //$('#leftImgSideBar', '#' + idModal).empty().append(leftHTML);
            //$('#centerImgContainer', '#' + idModal).empty().append(arrHTML[1]);

            /*$('#wb-resources-treeview').tree({
                data:       arrHTML[0],
                autoEscape: false,
                autoOpen:   0
            });*/
            var content    =
                '<table id="winModalTbl" class="dfx_visual_editor_property_modal_table table table-condensed">\
                 <tbody id="winModalTblBody"><tr>';
                //for (var pr in glyphIcons) {
                    content +=
                        '<td align="center" width="12,5%" class="iconBlock" style="cursor:pointer;height:80px;">' +
                        //'<span class="glyphicon ' + pr + '"></span><br />' +
                        //'<span class="glyphicon-class">' + glyphIcons[pr] + '</span>' +
                        '</td>';
                    if (i % 8 == 7) {
                        content += '</tr><tr>';
                    }
                    i++;
                //}

            content += '</tr></tbody></table>';

            // fill tab
            $('#' + idTab + 'Div', '#' + idModal)
                .css({'height': '500px', 'overflow': 'auto'}).empty().append(content);
/*
            $('.iconBlock').on('click', function (e) {
                var rel_elem   = CustomModal.settings().relElement,
                    parent     = $(rel_elem).closest('.input-group'),
                    el_update  = null,
                    val_update = $('.glyphicon-class', this).text();
                if (rel_elem && $(rel_elem).length) {
                    el_update = $(rel_elem).attr('data-vb-picker-target');
                    $('#' + el_update, parent).val(val_update);
                    if (idModal == 'iconSymbolsModal') {
                        $('#gc_component_attr_symbol_name').val(val_update);
                        $('#gc_component_attr_symbol_value').val($('.glyphicon-unicode', this).val());
                    }
                }
                $('.closeModal').click();
            }).hover(
                function () {
                    $(this).css({'background-color': '#563d7c', 'color': '#fff'});
                },
                function () {
                    $(this).css({'background-color': '#fff', 'color': '#333'});
                }
            );

*/
        });
    };
    return {
        fillModal: function (idModal) {
            CustomModal.imgs = function () {
                this.decorate = function () {
                    var idTab = 'appResTab',
                        idSharedTab = 'sharedResTab';
                    if (!$('#' + idModal).length) {
                        this.imgs.prototype.decorateTabs(
                            idModal,
                            'Images',
                            '<button type="button" class="btn btn-default closeModal" data-dismiss="modal">Close</button>',
                            {'width': '800px'}
                        );
                        this.settings().addTab(idModal, idTab, 'Application Resources');
                        fillContent(idTab, idModal);
                        //this.settings().addTab(idModal, idSharedTab, 'Shared Resources');
                        //fillSharedContent(idSharedTab, idModal);
                    }
                };
            };
            CustomModal.getDecorator('imgs').decorate();
        }
    }
})();

var StylesPaletteModal = (function () {

    var fillContent = function (idModal) {
        var templateStart = '<td align="center" width="25%" class="iconBlock" data-component-id="%blockId%" title="%blockTitle%" style="cursor:pointer;height:80px;">',
            templateEnd = '<div style="margin-top: 15px;">%blockDescription%</div><br></td>',
            content = '<table id="winModalTbl" class="dfx_visual_editor_property_modal_table table table-condensed">' +
                '<tbody id="winModalTblBody"><tr>';

        DfxVisualBuilder.stylesPalette.definitions.forEach(function (gc_definition, index) {
            var temp = templateStart.replace(/%blockId%/gi, gc_definition.id).replace(/%blockTitle%/gi, gc_definition.name) +
                    gc_factory.renderDesign(DfxVisualBuilder.stylesPalette.type, gc_definition).fragment +
                    templateEnd.replace(/%blockDescription%/gi, gc_definition.description);

            content += temp;
            if (index % 4 == 3) {
                content += '</tr><tr>';
            }
        });

        content += '</tr></tbody></table>';
        $('#componentsContainer', '#' + idModal).css({'height': '500px', 'overflow': 'auto'}).empty().append(content);
        $('.iconBlock').on('click', function (e) {
            e.stopPropagation();

            var $e          = $(this),
                componentId = $e.data('component-id'),
                definition  = DfxVisualBuilder.stylesPalette.definitions.find(function (e) {
                    return e.id == componentId;
                });
            for (var property in definition.attributes) {
                if (definition.attributes.hasOwnProperty(property)) {
                    $('#gc_component_attr_' + property).val( definition.attributes[property].value );
                }
            }
            $('#dfx_visual_editor_property_panel_apply').click();
            $('.closeModal').click();
        }).hover(
            function () {
                var $this = $(this);
                $this.css({'background-color': '#B2F3FF', 'color': '#223957'});
            },
            function () {
                var $this = $(this);
                $this.css({'background-color': '#fff', 'color': '#333'});
            }
        );
    };

    return {
        fillModal: function (idModal) {
            // remove old modals
            $('#styles-palette-modal-window').remove();

            CustomModal.stylesPalette = function () {
                this.decorate = function () {
                    var idTab   = 'imgTab',
                        content = '<div  id="componentsContainer" class="col-lg-12" style="border-bottom: 1px solid #eee; padding: 0;">' +
                            '</div>';
                    if (!$('#' + idModal).length) {
                        this.stylesPalette.prototype.decorateCustom(
                            idModal,
                            DfxVisualBuilder.stylesPalette.title,
                            '<button type="button" class="btn btn-default closeModal" data-dismiss="modal" style="margin-top: 10px;">Close</button>',
                            content,
                            {'width': '930px'}
                        );
                        fillContent(idModal);
                    }
                };
            };
            CustomModal.getDecorator('stylesPalette').decorate();
        },
        reloadModal: function () {
            // modal window MUST be removed after closing, otherwise it adds to the DOM
            // new window every time we open it for another GC type
            $('#styles-palette-modal-window').remove();

            // and reload the modal window with new content from the file
            var platform = $('#dfx_visual_editor').attr('platform');
            DfxVisualBuilder.loadStylesPalette(gc_factory.controls[platform][ DfxVisualBuilder.stylesPalette.type ].styles_palette);
        }
    };
})();

var CustomModal = (function () {
    var _private = {
        trHidden:            null,
        trHead:              null,
        footer:              null,
        relElement:          null,
        winModal:            '<div class="modal fade customModal" tabindex="-1" role="dialog" style="z-index:9999">\
              <div class="modal-dialog modal-dialog-center">\
                <div class="modal-content dfx_visual_editor_property_modal">\
                  <div class="modal-body" style="margin-bottom:0;padding-bottom:0">\
                    <h4 class="modal-title">Modal title</h4>\
                    <div class="modalBodyFixed">\
                     <table id="winModalTbl" class="dfx_visual_editor_property_modal_table table table-condensed">\
                      <thead></thead>\
                      <tbody id="winModalTblBody"></tbody>\
                     </table>\
                    </div>\
                  </div>\
                  <div class="modal-footer" style="margin-top:0;">\
                  </div>\
                </div>\
              </div>\
            </div>',
        setCustomWinTabs:    function (idModal, title, footer, css) {
            var el = '#' + idModal;
            if (!$(el).length) {
                this.setFooter(footer);
                // append modal to body
                this.appendWinModal(idModal, title);
                $(el).find('.modal-dialog').css(css);
                $(el).find('.modalBodyFixed').empty().append(this.getTabs());
            }
        },
        setCustomWinContent: function (idModal, title, footer, content, css) {
            var el = '#' + idModal;
            if (!$(el).length) {
                this.setFooter(footer);
                // append modal to body
                this.appendWinModal(idModal, title);
                $(el).find('.modal-dialog').css(css);
                $(el).find('.modalBodyFixed').css({'margin-top': '20px'}).empty().append(content);
            }

        },
        getTabs:             function () {
            return '<ul class="nav nav-tabs" role="tablist" style="margin-top:20px"></ul>\
                    <div class="tab-content"></div>';
        },
        addTab:              function (idWinModal, idTab, title, isActive, isVisible) {
            $('.nav-tabs', '#' + idWinModal)
                .append('<li' + ( isActive ? ' class="active"' : '') + ( isVisible ? '' : ' style="display: none;"' ) + '>' +
                '<a href="#' + idTab + 'Div" role="tab" data-toggle="tab" id="' + idTab + '">' + title + '</a></li>');
            $('.tab-content', '#' + idWinModal)
                .append('<div class="tab-pane' + (isActive ? ' fade in active' : '') + '" id="' + idTab + 'Div"></div>');
        },
        setHiddenTr:         function (str) {
            this.trHidden = str;
        },
        setHeadTbl:          function (str) {
            this.trHead = str;
        },
        setFooter:           function (str) {
            this.footer = str;
        },
        setTitle:            function (str, idWinModal) {
            $('.modal-title', '#' + idWinModal).text(str);
        },
        appendWinModal:      function (idWinModal, titleModal) {
            var el   = '#' + idWinModal,
                self = this;
            if (!$(el).length) {

                // append modal win to body
                var winModal = $(this.winModal);
                $('body').append(winModal);

                winModal.attr('id', idWinModal);

                // insert thead tr
                if (this.trHead) {
                    $('thead', el).empty().append($(this.trHead));
                }

                // insert hidden tr
                if (this.trHidden) {
                    $('tbody', el).empty().append($(this.trHidden));
                }

                // insert footer
                if (this.footer) {
                    $('.modal-footer', el).empty().append($(this.footer));
                }

                // set Title
                this.setTitle(titleModal, idWinModal);
                $(el).on('show.bs.modal', function (e) {
                    self.relElement = e.relatedTarget;
                });
            }
            //return this;
        }
    };
    return {
        settings:       function () {
            return _private;
        },
        init:           function (item, attr) {
            CustomModal[item + 'Modal'].init(item, attr);
        },
        decorateTabs:   function (idModal, titleModal, footer, css) {
            _private.setCustomWinTabs(idModal, titleModal, footer, css);
        },
        decorateCustom: function (idModal, titleModal, footer, content, css) {
            _private.setCustomWinContent(idModal, titleModal, footer, content, css);
        },
        getDecorator:   function (deco) {
            CustomModal[deco].prototype = this;
            return new CustomModal[deco];
        },
        // common functions
        addTblParams:   function (name, idModal) {
            var hiddentr = _private.trHidden;
            hiddentr     = $(hiddentr);
            hiddentr.appendTo('#' + idModal + 'Modal #winModalTblBody').attr({'id': '', 'name': name}).show();
        },
        deleteTblTr:    function (e) {
            $(e.target).parents('tr').remove();
        }
    };
})();

CustomModal.tabsModal      = (function () {
    var settings   = CustomModal.settings(),
        idModal    = 'tabsModal',
        elBody     = '#' + idModal + ' #winModalTblBody',
        titleModal = 'Tabs Definition',
        idRow      = 'rowTab';
    return {
        init:              function (item, attr) {
            // set thead tr
            settings.setHeadTbl('<tr><th>Tab Title</th><th>Disabled</th><th></th></tr>');

            // set hidden tr to tbody, which will be clone
            settings.setHiddenTr(
                '<tr id="rowHidden" style="display:none">\
                    <td><input type="text" class="form-control" name="tbsTitle" /><input type="hidden" class="form-control" name="tbsLayout" /></td>\
                    <td>\
                        <select name="tbsEnable" class="form-control">\
                           <option value="no">no</option>\
                           <option value="yes">yes</option>\
                        </select>\
                    </td>\
                        <td><button type="button" onclick="CustomModal.deleteTblTr(event)" class="btn btn-link deleteRow"><span class="glyphicon glyphicon-trash"></span></button></td>\
                 </tr>');

            // set footer
            settings.setFooter(
                '<button type="button" class="btn btn-success" onclick="CustomModal.addTblParams(\'' + idRow + '\', \'' + item + '\')">Add Tab</button>\
                 <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\
                 <button type="button" class="btn btn-primary" onclick="CustomModal.tabsModal.saveTabsTblParams();">Save changes</button>'
            )

            // append modal to body
            settings.appendWinModal(idModal, titleModal);
            CustomModal.tabsModal.fillTabsTbl(attr);
        },
        fillTabsTbl:       function (attr) {
            var elTab    = null,
                hiddentr = null,
                tr, tds;

            hiddentr = $('tr#rowHidden', '#' + idModal);
            $('tr[id!="rowHidden"]', elBody).remove();
            for (var i = 0, len = attr.layoutElements.length; i < len; i++) {
                elTab = attr.layoutElements[i];
                tr    = hiddentr.clone().appendTo(elBody).attr({'id': '', 'name': 'rowTab'}).show();
                tds   = $('td', tr);
                if (i == 0) {
                    $(tds[2]).empty();
                }
                $(tds[0]).find('input[type=text]').val(elTab.header.value);
                $(tds[0]).find('input[type=hidden]').val(JSON.stringify(elTab.layout));
                $(tds[1]).find('select').val(elTab.disabled.value);
            }
        },
        saveTabsTblParams: function () {
            var tabColumns = [],
                trs        = $('tr[name="rowTab"]', elBody), tr, tds;

            if (trs.length) {
                for (var i = 0, len = trs.length; i < len; i++) {
                    tr               = trs[i];
                    tds              = $('td', tr);
                    var new_tab      = {};
                    new_tab.header   = {"value": $(tds[0]).find('input[type=text]').val()};
                    new_tab.disabled = {"value": $(tds[1]).find('select').val()};
                    if ($(tds[0]).find('input[type=hidden]').val() == '') {
                        new_tab.layout = {
                            rows:           [{
                                cols:           [{
                                    width:          {value: '12'},
                                    orientation:    {value: 'vertical'},
                                    alignment:      {value: 'start'},
                                    disposition:    {value: 'space_around'},
                                    classes:        {value: ''},
                                    dynamicClasses: {value: ''},
                                    style:          {value: ''}
                                }],
                                classes:        {value: ''},
                                dynamicClasses: {value: ''},
                                style:          {value: ''}
                            }],
                            classes:        {value: ''},
                            dynamicClasses: {value: ''},
                            style:          {value: ''}
                        };
                    } else {
                        new_tab.layout = JSON.parse($(tds[0]).find('input[type=hidden]').val());
                    }

                    tabColumns.push(new_tab);
                }
                $('#gc_tabs_attr_layoutElements').val(JSON.stringify(tabColumns));
                $('#' + idModal).modal('hide');
            }
        }
    }
})();

CustomModal.accordionModal = (function () {
    var settings   = CustomModal.settings(),
        idModal    = 'accordionModal',
        elBody     = '#' + idModal + ' #winModalTblBody',
        titleModal = 'Accordion Item Definition',
        idRow      = 'rowAccord';
    return {
        init:                   function (item, attr) {
            // set thead tr
            settings.setHeadTbl('<tr><th>Accordion Title</th><th>Opened</th><th></th></tr>');

            // set hidden tr to tbody, which will be clone
            settings.setHiddenTr(
                '<tr id="rowHidden" style="display:none">\
                    <td><input type="text" class="form-control" name="accordTitle" /><input type="hidden" class="form-control" name="accordLayout" /></td>\
                    <td>\
                        <select name="accordOpened" class="form-control">\
                           <option value="no">no</option>\
                           <option value="yes">yes</option>\
                        </select>\
                    </td>\
                        <td><button type="button" onclick="CustomModal.deleteTblTr(event)" class="btn btn-link deleteRow"><span class="glyphicon glyphicon-trash"></span></button></td>\
                 </tr>');

            // set footer
            settings.setFooter(
                '<button type="button" class="btn btn-success" onclick="CustomModal.addTblParams(\'' + idRow + '\', \'' + item + '\')">Add Pane</button>\
                 <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\
                 <button type="button" class="btn btn-primary" onclick="CustomModal.accordionModal.saveAccordionTblParams();">Save changes</button>'
            )

            // append modal to body
            settings.appendWinModal(idModal, titleModal);
            CustomModal.accordionModal.fillAccordionTbl(attr);
        },
        fillAccordionTbl:       function (attr) {
            var elGroups = null,
                hiddentr = null,
                tr, tds, cmbBox;
            hiddentr     = $('tr#rowHidden', elBody);
            $('tr[id!="rowHidden"]', elBody).remove();
            for (var i = 0, len = attr.layoutElements.length; i < len; i++) {
                elGroups = attr.layoutElements[i];
                tr       = hiddentr.clone().appendTo(elBody).attr({'id': '', 'name': 'rowAccord'}).show();
                tds      = $('td', tr);
                if (i == 0) {
                    $(tds[2]).empty();
                }
                $(tds[0]).find('input[type=text]').val(elGroups.header.value);
                $(tds[0]).find('input[type=hidden]').val(JSON.stringify(elGroups.layout));
                $(tds[1]).find('select').val(elGroups.opened.value);
            }
        },
        saveAccordionTblParams: function () {
            var accordGroups = [],
                trs          = $('tr[name="' + idRow + '"]', elBody), tr, tds;

            if (trs.length) {
                for (var i = 0, len = trs.length; i < len; i++) {
                    tr              = trs[i];
                    tds             = $('td', tr);
                    var new_pane    = {};
                    new_pane.header = {"value": $(tds[0]).find('input[type=text]').val()};
                    new_pane.opened = {"value": $(tds[1]).find('select').val()};
                    if ($(tds[0]).find('input[type=hidden]').val() == '') {
                        new_pane.layout = {
                            rows:           [{
                                cols:           [{
                                    width:          {value: '12'},
                                    orientation:    {value: 'vertical'},
                                    alignment:      {value: 'start'},
                                    disposition:    {value: 'space_around'},
                                    classes:        {value: ''},
                                    dynamicClasses: {value: ''},
                                    style:          {value: ''}
                                }],
                                classes:        {value: ''},
                                dynamicClasses: {value: ''},
                                style:          {value: ''}
                            }],
                            classes:        {value: ''},
                            dynamicClasses: {value: ''},
                            style:          {value: ''}
                        };
                    } else {
                        new_pane.layout = JSON.parse($(tds[0]).find('input[type=hidden]').val());
                    }

                    accordGroups.push(new_pane);
                }
            }
            $('#gc_accordion_attr_layoutElements').val(JSON.stringify(accordGroups));
            $('#' + idModal).modal('hide');
        }
    }
})();

CustomModal.wizardModal = (function () {
    var settings   = CustomModal.settings(),
        idModal    = 'wizardModal',
        elBody     = '#' + idModal + ' #winModalTblBody',
        titleModal = 'Steps Definition',
        idRow      = 'rowTab';
    return {
        init:                function (item, attr) {
            // set thead tr
            settings.setHeadTbl('<tr><th>Step Title</th><th></th></tr>');

            // set hidden tr to tbody, which will be clone
            settings.setHiddenTr(
                '<tr id="rowHidden" style="display:none">\
                    <td><input type="text" class="form-control" name="stepTitle" /><input type="hidden" class="form-control" name="stepLayout" /></td>\
                    <td><button type="button" onclick="CustomModal.deleteTblTr(event)" class="btn btn-link deleteRow"><span class="glyphicon glyphicon-trash"></span></button></td>\
                 </tr>');

            // set footer
            settings.setFooter(
                '<button type="button" class="btn btn-success" onclick="CustomModal.addTblParams(\'' + idRow + '\', \'' + item + '\')">Add Step</button>\
                 <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\
                 <button type="button" class="btn btn-primary" onclick="CustomModal.wizardModal.saveWizardTblParams();">Save changes</button>'
            )

            // append modal to body
            settings.appendWinModal(idModal, titleModal);
            CustomModal.wizardModal.fillWizardTbl(attr);
        },
        fillWizardTbl:       function (attr) {
            var elStep   = null,
                hiddentr = null,
                tr, tds, cmbBox;

            hiddentr = $('tr#rowHidden', elBody);
            $('tr[id!="rowHidden"]', elBody).remove();
            for (var i = 0, len = attr.layoutElements.length; i < len; i++) {
                elStep = attr.layoutElements[i];
                tr     = hiddentr.clone().appendTo(elBody).attr({'id': '', 'name': 'rowTab'}).show();
                tds    = $('td', tr);
                if (i == 0) {
                    $(tds[1]).empty();
                }
                $(tds[0]).find('input[type=text]').val(elStep.header.value);
                $(tds[0]).find('input[type=hidden]').val(JSON.stringify(elStep.layout));
            }
        },
        saveWizardTblParams: function () {
            var stepColumns = [],
                trs         = $('tr[name="rowTab"]', elBody), tr, tds;

            if (trs.length) {
                for (var i = 0, len = trs.length; i < len; i++) {
                    tr              = trs[i];
                    tds             = $('td', tr);
                    var new_step    = {};
                    new_step.header = {'value': $(tds[0]).find('input[type=text]').val()};
                    if ($(tds[0]).find('input[type=hidden]').val() == '') {
                        new_step.layout = {
                            rows:           [{
                                cols:           [{
                                    width:          {value: '12'},
                                    orientation:    {value: 'vertical'},
                                    alignment:      {value: 'start'},
                                    disposition:    {value: 'space_around'},
                                    classes:        {value: ''},
                                    dynamicClasses: {value: ''},
                                    style:          {value: ''}
                                }],
                                classes:        {value: ''},
                                dynamicClasses: {value: ''},
                                style:          {value: ''}
                            }],
                            classes:        {value: ''},
                            dynamicClasses: {value: ''},
                            style:          {value: ''}
                        };
                    } else {
                        new_step.layout = JSON.parse($(tds[0]).find('input[type=hidden]').val());
                    }
                    stepColumns.push(new_step);
                }
            }
            $('#gc_wizard_attr_layoutElements').val(JSON.stringify(stepColumns));
            $('#' + idModal).modal('hide');
        }
    }
})();

CustomModal.checkboxModal = (function () {
    var settings   = CustomModal.settings(),
        idModal    = 'checkboxModal',
        elBody     = '#' + idModal + ' #winModalTblBody',
        titleModal = 'Checkbox Definition',
        idRow      = 'rowCheckbox';
    return {
        init:          function (item, attr) {
            // set thead tr
            var headTbl = '<tr><th>Display Value</th>';
            headTbl += '<th>Checked Value</th><th>Unchecked Value</th><th width="88">Disabled</th><th></th></tr>';
            settings.setHeadTbl(headTbl);

            // set hidden tr to tbody, which will be clone
            var hiddenTrContent =
                    '<tr id="rowHidden" style="display:none">' +
                    '<td><input type="text" class="form-control input-sm" name="checkboxLabel" /></td>' +
                    '<td><input type="text" class="form-control input-sm" name="checkboxCheckedValue" /></td>' +
                    '<td><input type="text" class="form-control input-sm" name="checkboxUncheckedValue" /></td>' +
                    '<td>' +
                    '<select name="checkboxDisabled" class="form-control input-sm">' +
                    '<option value="0">no</option>' +
                    '<option value="1">yes</option>' +
                    '</select>' +
                    '</td>' +
                    '<td><button type="button" onclick="CustomModal.deleteTblTr(event)" class="btn btn-link btn-xs deleteRow"><span class="glyphicon glyphicon-trash"></span></button></td>' +
                    '</tr>';
            settings.setHiddenTr(hiddenTrContent);

            // set footer
            settings.setFooter(
                '<button type="button" id="modalAddRow" class="btn btn-success" onclick="CustomModal.addTblParams(\'' + idRow + '\', \'' + item + '\')">Add Checkbox Button</button>' +
                '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>' +
                '<button type="button" class="btn btn-info" onclick="CustomModal.checkboxModal.saveTblParams(\'' + attr.type + '\');">Save changes</button>'
            )

            // append modal to body
            settings.appendWinModal(idModal, titleModal);
            CustomModal.checkboxModal.fillTbl(attr);
        },
        fillTbl:       function (attr) {
            var element  = null,
                hiddentr = null,
                tr, tds, cmbDisabled, cmbLabelShow,
                textAdd  = 'Add Checkbox Button';

            $('#modalAddRow').text(textAdd);

            hiddentr = $('tr#rowHidden', elBody);
            $('tr[id!="rowHidden"]', elBody).remove();
            for (var i = 0, len = attr.staticOptions.length; i < len; i++) {
                element = attr.staticOptions[i];
                tr      = hiddentr.clone().appendTo(elBody).attr({'id': '', 'name': 'rowCheckbox'}).show();
                tds     = $('td', tr);
                if (i == 0) {
                    $(tds[tds.length - 1]).empty();
                }
                tr.find('input[name="checkboxLabel"]').val(element.displayValue);
                if (element.checkedValue) {
                    tr.find('input[name="checkboxCheckedValue"]').val(element.checkedValue);
                }
                if (element.uncheckedValue) {
                    tr.find('input[name="checkboxUncheckedValue"]').val(element.uncheckedValue);
                }

                cmbDisabled = tr.find('select[name="checkboxDisabled"]');
                $('option[value="' + (element.disabled ? '1' : '0') + '"]', cmbDisabled).attr('selected', true);
            }
        },
        saveTblParams: function (attr_type) {
            var columns = [], rel_elem = settings.relElement,
                trs     = $('tr[name="rowCheckbox"]', elBody), tr, tds, elOpts, elChange;
            if (trs.length) {
                for (var i = 0, len = trs.length; i < len; i++) {
                    tr = trs[i];
                    //tds = $('td', tr);
                    var columnsToPush            = {
                        'displayValue': $(tr).find('input[name="checkboxLabel"]').val(),
                        'disabled':     !!parseInt($(tr).find('select[name="checkboxDisabled"]').val())
                    };
                    columnsToPush.checkedValue   = $(tr).find('input[name="checkboxCheckedValue"]').val();
                    columnsToPush.uncheckedValue = $(tr).find('input[name="checkboxUncheckedValue"]').val();

                    columns.push(columnsToPush);
                }
            }
            elOpts   = $('#' + $(rel_elem).attr('data-vb-picker-target'));
            elChange = $('#' + $(rel_elem).attr('data-vb-picker-change'));
            elOpts.val(JSON.stringify(columns));
            elChange.val('1');

            $('#' + idModal).modal('hide');
        }
    }
})();

CustomModal.radioModal = (function () {
    var settings   = CustomModal.settings(),
        idModal    = 'radioModal',
        elBody     = '#' + idModal + ' #winModalTblBody',
        titleModal = 'Radio Buttons Definition',
        idRow      = 'rowRadio';
    return {
        init:          function (item, attr) {
            // set thead tr
            var headTbl = '<tr><th>Display Value</th>';
            headTbl += '<th>Data Value</th><th width="88">Disabled</th><th></th></tr>';
            settings.setHeadTbl(headTbl);

            // set hidden tr to tbody, which will be clone
            var hiddenTrContent =
                    '<tr id="rowHidden" style="display:none">' +
                    '<td><input type="text" class="form-control input-sm" name="radioLabel" /></td>' +
                    '<td><input type="text" class="form-control input-sm" name="radioValue" /></td>' +
                    '<td>' +
                    '<select name="radioDisabled" class="form-control input-sm">' +
                    '<option value="0">no</option>' +
                    '<option value="1">yes</option>' +
                    '</select>' +
                    '</td>' +
                    '<td><button type="button" onclick="CustomModal.deleteTblTr(event)" class="btn btn-link btn-xs deleteRow"><span class="glyphicon glyphicon-trash"></span></button></td>' +
                    '</tr>';
            settings.setHiddenTr(hiddenTrContent);

            // set footer
            settings.setFooter(
                '<button type="button" id="modalAddRow" class="btn btn-success" onclick="CustomModal.addTblParams(\'' + idRow + '\', \'' + item + '\')">Add Radio Button</button>' +
                '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>' +
                '<button type="button" class="btn btn-info" onclick="CustomModal.radioModal.saveTblParams(\'' + attr.type + '\');">Save changes</button>'
            )

            // append modal to body
            settings.appendWinModal(idModal, titleModal);
            CustomModal.radioModal.fillTbl(attr);
        },
        fillTbl:       function (attr) {
            var elRadio  = null,
                hiddentr = null,
                tr, tds, cmbDisabled, cmbLabelShow,
                textAdd  = 'Add Radio Button';

            $('#modalAddRow').text(textAdd);

            hiddentr = $('tr#rowHidden', elBody);
            $('tr[id!="rowHidden"]', elBody).remove();
            for (var i = 0, len = attr.staticOptions.length; i < len; i++) {
                elRadio     = attr.staticOptions[i];
                tr          = hiddentr.clone().appendTo(elBody).attr({'id': '', 'name': 'rowRadio'}).show();
                tds         = $('td', tr);
                if (i == 0) {
                    $(tds[tds.length - 1]).empty();
                }
                tr.find('input[name="radioLabel"]').val(elRadio.displayValue);
                tr.find('input[name="radioValue"]').val(elRadio.dataValue);
                cmbDisabled = tr.find('select[name="radioDisabled"]');
                $('option[value="' + (elRadio.disabled ? '1' : '0') + '"]', cmbDisabled).attr('selected', true);
            }
        },
        saveTblParams: function (attr_type) {
            var radioColumns = [], rel_elem = settings.relElement,
                trs          = $('tr[name="rowRadio"]', elBody), tr, tds, elOpts, elChange;
            if (trs.length) {
                for (var i = 0, len = trs.length; i < len; i++) {
                    tr = trs[i];
                    //tds = $('td', tr);
                    var columnsToPush       = {
                        'displayValue': $(tr).find('input[name="radioLabel"]').val(),
                        'disabled':     !!parseInt($(tr).find('select[name="radioDisabled"]').val())
                    };
                    columnsToPush.dataValue = $(tr).find('input[name="radioValue"]').val();

                    radioColumns.push(columnsToPush);
                }
            }
            elOpts   = $('#' + $(rel_elem).attr('data-vb-picker-target'));
            elChange = $('#' + $(rel_elem).attr('data-vb-picker-change'));
            elOpts.val(JSON.stringify(radioColumns));
            elChange.val('1');

            $('#' + idModal).modal('hide');
        }
    }
})();

CustomModal.tableViewModal = (function () {
    var settings   = CustomModal.settings(),
        idModal    = 'tableViewModal',
        elBody     = '#' + idModal + ' #winModalTblBody',
        titleModal = 'Table View Definition',
        idRow      = 'rowTableView';
    return {
        init:          function (item, attr) {
            // set thead tr
            var headTbl = '<tr><th>Label</th><th>Value</th><th>Icon</th><th>Chevron</th><th></th></tr>';
            settings.setHeadTbl(headTbl);

            // set hidden tr to tbody, which will be clone
            var hiddenTrContent =
                    '<tr id="rowHidden" style="display:none">' +
                    '<td><input type="text" class="form-control input-sm" name="tableViewLabel" /></td>' +
                    '<td><input type="text" class="form-control input-sm" name="tableViewValue" /></td>' +
                    '<td><input type="text" class="form-control input-sm" name="tableViewIcon" /></td>' +
                    '<td><input type="text" class="form-control input-sm" name="tableViewChevron" /></td>' +
                    '<td><button type="button" onclick="CustomModal.deleteTblTr(event)" class="btn btn-link btn-xs deleteRow"><span class="glyphicon glyphicon-trash"></span></button></td>' +
                    '</tr>';
            settings.setHiddenTr(hiddenTrContent);

            // set footer
            settings.setFooter(
                '<button type="button" id="modalAddRow" class="btn btn-success" onclick="CustomModal.addTblParams(\'' + idRow + '\', \'' + item + '\')">Add Item</button>' +
                '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>' +
                '<button type="button" class="btn btn-info" onclick="CustomModal.tableViewModal.saveTblParams(\'' + attr.type + '\');">Save changes</button>'
            )

            // append modal to body
            settings.appendWinModal(idModal, titleModal);
            CustomModal.tableViewModal.fillTbl(attr);
        },
        fillTbl:       function (attr) {
            var element  = null,
                hiddentr = null,
                tr, tds,
                textAdd  = 'Add Item';

            $('#modalAddRow').text(textAdd);

            hiddentr = $('tr#rowHidden', elBody);
            $('tr[id!="rowHidden"]', elBody).remove();
            for (var i = 0, len = attr.staticOptions.length; i < len; i++) {
                element = attr.staticOptions[i];
                tr      = hiddentr.clone().appendTo(elBody).attr({'id': '', 'name': 'rowTableView'}).show();
                tds     = $('td', tr);
                if (i == 0) {
                    $(tds[tds.length - 1]).empty();
                }
                tr.find('input[name="tableViewLabel"]').val(element.label);
                tr.find('input[name="tableViewValue"]').val(element.value);
                if (element.icon) {
                    tr.find('input[name="tableViewIcon"]').val(element.icon);
                }
                tr.find('input[name="tableViewChevron"]').val(element.chevron);
            }
        },
        saveTblParams: function (attr_type) {
            var columns = [], rel_elem = settings.relElement,
                trs     = $('tr[name="rowTableView"]', elBody), tr, tds, elOpts, elChange;
            if (trs.length) {
                for (var i = 0, len = trs.length; i < len; i++) {
                    tr = trs[i];
                    //tds = $('td', tr);
                    var columnsToPush  = {
                        'label':   $(tr).find('input[name="tableViewLabel"]').val(),
                        'value':   $(tr).find('input[name="tableViewValue"]').val(),
                        'chevron': $(tr).find('input[name="tableViewChevron"]').val()
                    };
                    columnsToPush.icon = $(tr).find('input[name="tableViewIcon"]').val();

                    columns.push(columnsToPush);
                }
            }
            elOpts   = $('#' + $(rel_elem).attr('data-vb-picker-target'));
            elChange = $('#' + $(rel_elem).attr('data-vb-picker-change'));
            elOpts.val(JSON.stringify(columns));
            elChange.val('1');

            $('#' + idModal).modal('hide');
        }
    }
})();

var PickerValueModal = (function () {
    var _private = {
        winModal:             $(
            '<div id="pickerValueModal" class="modal fade" tabindex="-1" role="dialog" style="z-index:9999">\
              <div class="modal-dialog modal-dialog-center" style="height: 500px;width: 800px;">\
                <div class="modal-content" style="height: 500px;">\
                  <div class="modal-body" style="margin-bottom:0;padding-bottom:0">\
                    <h4 class="modal-title">Modal title</h4>\
                    <div class="modalBodyFixed" style="height: 380px;overflow-x: hidden">\
                    </div>\
                  </div>\
                  <div class="modal-footer" style="margin-top:0;">\
                    <button id="btnPickerValueModalSave" type="button" class="btn btn-info" style="display:none" onclick="PickerValueModal.settings().saveExpression();">\
                        <span class="fa fa-lg fa-check" />\
                        <span style="padding-left:5px">Apply</span>\
                    </button>\
                    <button id="btnPickerValueModalClose" type="button" class="btn btn-default" data-dismiss="modal">Close</button>\
                  </div>\
                </div>\
              </div>\
            </div>'),
        setTitle:             function (str) {
            $('.modal-title', '#pickerValueModal').text(str);
        },
        showScopeVariables:   function (rel_elem) {
            var re_f = /(scope\W(?:\w+\W+){1,2}?function)/gi
            var re_v = /scope\.\w+/g;
            var m, a = [], a_f = [], u = [];

            this.setTitle('Select a property defined in the Model');
            $('.modalBodyFixed', '#pickerValueModal').html('<input id="pickerScopeVariablesRelElement" type="hidden" value="' + $(rel_elem).attr('data-vb-picker-target') + '" /><ul id="pickerScopeVariablesList" class="col-md-4" style="margin-top: 20px;list-style-type: none"></ul>');

            var editor = $('#dfx_script_editor.CodeMirror')[0].CodeMirror;
            var script = editor.getValue();

            // Functions
            while ((m = re_f.exec(script)) != null) {
                if (m.index === re_f.lastIndex) {
                    re_f.lastIndex++;
                }

                var clean_name = m[0].substring(6);
                clean_name     = clean_name.match(/(\w+)/g);
                a_f.push(clean_name[0]);
            }

            // Variables
            while ((m = re_v.exec(script)) != null) {
                if (m.index === re_v.lastIndex) {
                    re.lastIndex++;
                }
                var clean_name = m[0].substring(6);
                if ($.inArray(clean_name, a_f) == -1) a.push(clean_name);
            }
            $.each(a, function (i, el) {
                if ($.inArray(el, u) === -1) u.push(el);
            });

            $.each(u, function (i, el) {
                $('#pickerScopeVariablesList').append('<li><a href="javascript:void(0);" onclick="PickerValueModal.settings().selectScopeVariable(this);" data-selected-value="' + el + '">' + el + '</a></li>');
            });

        },
        showExpression:       function (rel_elem, isTextExpression) {
            var re_isT = /[\{]{2}(.*)[\}\}]{2}/gi
            var re_f   = /(scope\W(?:\w+\W+){1,2}?function)/gi
            var re_f2  = /(scope\W(?:\w+\W+){1,2}?function(.*)\))/gi
            var re_v   = /scope\.\w+/g;
            var m, a   = [], a_f = [], u = [];
            var target = $(rel_elem).attr('data-vb-picker-target');

            this.setTitle('Write your Expression');

            var html_fragment = '<input id="pickerExpressionRelElement" type="hidden" value="' + target + '" />\
                                    \<input id="pickerExpressionIsText" type="hidden" value="' + isTextExpression + '" />\
                                    \<div>\
                                        \<div class="col-md-12">\
                                            \<textarea id="pickerExpressionText" rows="4" class="form-field" style="width:100%;margin-top:20px"></textarea>\
                                        \</div>\
                                        \<div class="col-md-12" style="margin-top:20px">\
                                            \<ul class="nav nav-tabs" role="tablist" id="tabPickerExpression">\
                                                \<li class="active"><a href="#tabPExpVariables" role="tab" data-toggle="tab">Model Properties</a></li>\
                                                \<li><a href="#tabPExpValues" role="tab" data-toggle="tab">Boolean</a></li>\
                                                \<li><a href="#tabPExpFunctions" role="tab" data-toggle="tab">Functions</a></li>\
                                                \<li><a href="#tabPExpControls" role="tab" data-toggle="tab">Graphical Controls</a></li>\
                                                \<li><a href="#tabPExpAngular" role="tab" data-toggle="tab">Angular</a></li>\
                                            \</ul>\
                                            \<div class="tab-content">\
                                                \<div class="tab-pane active" id="tabPExpVariables">\
                                                    <ul id="pickerScopeVariablesList" style="list-style-type:none;padding:0px;margin:10px;"></ul>\
                                                \</div>\
                                                \<div class="tab-pane" id="tabPExpValues">\
                                                    <ul id="pickerValuesList" style="list-style-type:none;padding:0px;margin:10px;"></ul>\
                                                \</div>\
                                                \<div class="tab-pane" id="tabPExpFunctions">\
                                                    <ul id="pickerScopeFunctionsList" style="list-style-type:none;padding:0px;margin:10px;"></ul>\
                                                \</div>\
                                                \<div class="tab-pane" id="tabPExpControls">\
                                                    <ul id="pickerControlList" style="list-style-type:none;padding:0px;margin:10px;"></ul>\
                                                \</div>\
                                                \<div class="tab-pane" id="tabPExpAngular">\
                                                    <ul id="pickerAngularList" style="list-style-type:none;padding:0px;margin:10px;"></ul>\
                                                \</div>\
                                            \</div>\
                                        \</div>\
                                    \</div>';
            $('.modalBodyFixed', '#pickerValueModal').html(html_fragment);
            $('#tabPickerExpression a:first').tab('show');
            $('#btnPickerValueModalSave').css('display', 'inline-block');

            var target_value = $('#' + target).val();

            if (isTextExpression) {
                while ((m = re_isT.exec(target_value)) != null) {
                    if (m.index === re_isT.lastIndex) {
                        re_isT.lastIndex++;
                    }

                    target_value = m[1];
                }
            }

            $('#pickerExpressionText').val(target_value);

            var editor = $('#dfx_script_editor.CodeMirror')[0].CodeMirror;
            var script = editor.getValue();

            // Array of Functions
            while ((m = re_f.exec(script)) != null) {
                if (m.index === re_f.lastIndex) {
                    re_f.lastIndex++;
                }

                var clean_name = m[0].substring(6);
                clean_name     = clean_name.match(/(\w+)/g);
                a_f.push(clean_name[0]);
            }

            // Values
            u = ['true', 'false'];
            $.each(u, function (i, el) {
                $('#pickerValuesList').append('<li><a href="javascript:void(0);" onclick="PickerValueModal.settings().selectItemExpression(this);" data-selected-value="' + el + '">' + el + '</a></li>');
            });

            // Variables
            u = [];
            while ((m = re_v.exec(script)) != null) {
                if (m.index === re_v.lastIndex) {
                    re.lastIndex++;
                }
                var clean_name = m[0].substring(6);
                if ($.inArray(clean_name, a_f) == -1) a.push(clean_name);
            }
            $.each(a, function (i, el) {
                if ($.inArray(el, u) === -1) u.push(el);
            });

            $.each(u, function (i, el) {
                $('#pickerScopeVariablesList').append('<li><a href="javascript:void(0);" onclick="PickerValueModal.settings().selectItemExpression(this);" data-selected-value="' + el + '">' + el + '</a></li>');
            });

            // Functions
            a_f = [];
            while ((m = re_f2.exec(script)) != null) {
                if (m.index === re_f2.lastIndex) {
                    re_f2.lastIndex++;
                }

                var clean_name = m[0].substring(6);
                clean_name     = clean_name.match(/(\w+)/g);
                var args       = m[0].substring(6);
                args           = args.match(/\([^\)]*\)/);
                a_f.push({"name": clean_name[0], "args": args});
            }

            u = [];
            $.each(a_f, function (i, el) {
                if ($.inArray(el.name, u) === -1) u.push(el);
            });

            $.each(u, function (i, el) {
                $('#pickerScopeFunctionsList').append('<li><a href="javascript:void(0);" onclick="PickerValueModal.settings().selectItemExpression(this);" data-selected-value="' + el.name + el.args + '">' + el.name + el.args + '</a></li>');
            });

            // Angular
            u = ['$invalid', '$valid', '$error', '$error.required', '$error.pattern', '$dirty', '$pristine'];
            $.each(u, function (i, el) {
                $('#pickerAngularList').append('<li><a href="javascript:void(0);" onclick="PickerValueModal.settings().selectItemExpression(this);" data-selected-value=".' + el + '">' + el + '</a></li>');
            });

            // Elements
            var editor_src = $('#dfx_src_editor.CodeMirror')[0].CodeMirror;
            var source     = editor_src.getValue();
            var source_obj = JSON.parse(source);

            this.addPickerControl(source_obj.definition);

        },
        addPickerControl:     function (controls) {
            var i;
            for (i = 0; i < controls.length; i++) {
                if (controls[i].attributes.name && controls[i].attributes.name.value != '') {
                    $('#pickerControlList').append('<li><a href="javascript:void(0);" onclick="PickerValueModal.settings().selectItemExpression(this);" data-selected-value="' + controls[i].attributes.name.value + '">' + controls[i].attributes.name.value + ' (' + controls[i].type + ')</a></li>');
                }
                if (controls[i].attributes.form != null && controls[i].attributes.form.value != '') {
                    $('#pickerControlList').append('<li><a href="javascript:void(0);" onclick="PickerValueModal.settings().selectItemExpression(this);" data-selected-value="' + controls[i].attributes.form.value + '">' + controls[i].attributes.form.value + ' (form)</a></li>');
                }
                if (controls[i].children.length > 0) {
                    this.addPickerControl(controls[i].children);
                }
            }
        },
        showScopeFunctions:   function (rel_elem) {
            var re_f = /(scope\W(?:\w+\W+){1,2}?function(.*)\))/gi
            var m, a = [], a_f = [], u = [];

            this.setTitle('Select a function defined in the Controller');

            $('.modalBodyFixed', '#pickerValueModal').html('<input id="pickerScopeFunctionsRelElement" type="hidden" value="' + $(rel_elem).attr('data-vb-picker-target') + '" /><ul id="pickerScopeFunctionsList" class="col-md-4" style="margin-top: 20px;list-style-type: none"></ul>');

            var editor = $('#dfx_script_editor.CodeMirror')[0].CodeMirror;
            var script = editor.getValue();

            // Functions
            while ((m = re_f.exec(script)) != null) {
                if (m.index === re_f.lastIndex) {
                    re_f.lastIndex++;
                }

                var clean_name = m[0].substring(6);
                clean_name     = clean_name.match(/(\w+)/g);
                var args       = m[0].substring(6);
                args           = args.match(/\([^\)]*\)/);
                a_f.push({"name": clean_name[0], "args": args});
            }

            $.each(a_f, function (i, el) {
                if ($.inArray(el.name, u) === -1) u.push(el);
            });

            $.each(u, function (i, el) {
                $('#pickerScopeFunctionsList').append('<li><a href="javascript:void(0);" onclick="PickerValueModal.settings().selectScopeFunction(this);" data-selected-value="' + el.name + el.args + '">' + el.name + el.args + '</a></li>');
            });

        },
        showClasses:          function (rel_elem) {
            var target = $(rel_elem).attr('data-vb-picker-target');
            this.setTitle('Select from pre-defined classes');

            var html_fragment = '<input id="pickerExpressionRelElement" type="hidden" value="' + target + '" />\
                                    \<div>\
                                        \<div class="col-md-12">\
                                            \<div class="input-group" style="margin-top:20px">\
                                                \<input id="pickerExpressionText" type="text" class="form-control"  />\
                                                \<span class="input-group-btn">\
                                                    \<button class="btn btn-danger" type="button" onclick="PickerValueModal.settings().clearClasses();">\
                                                        \<span class="fa fa-trash-o"></span>\
                                                    \</button>\
                                                \</span>\
                                            \</div>\
                                        \</div>\
                                        \<div class="col-md-12" style="margin-top:20px">\
                                            \<ul class="nav nav-tabs" role="tablist" id="tabPickerClasses">\
                                                \<li class="active"><a href="#tabPCBootstrap" role="tab" data-toggle="tab">Bootstrap</a></li>\
                                            \</ul>\
                                            \<div class="tab-content">\
                                                \<div class="tab-pane active" id="tabPCBootstrap">\
                                                    \<div class="col-md-4">\
                                                        \<ul style="list-style-type:none;padding:0px;margin:10px;">\
                                                            \<li>\
                                                                \<span>Contextual colors</span>\
                                                                \<ul>\
                                                                    \<li><a href="javascript:void(0);" onclick="PickerValueModal.settings().selectClass(this);" class="text-primary">text-primary</a></li>\
                                                                    \<li><a href="javascript:void(0);" onclick="PickerValueModal.settings().selectClass(this);" class="text-success">text-success</a></li>\
                                                                    \<li><a href="javascript:void(0);" onclick="PickerValueModal.settings().selectClass(this);" class="text-info">text-info</a></li>\
                                                                    \<li><a href="javascript:void(0);" onclick="PickerValueModal.settings().selectClass(this);" class="text-warning">text-warning</a></li>\
                                                                    \<li><a href="javascript:void(0);" onclick="PickerValueModal.settings().selectClass(this);" class="text-danger">text-danger</a></li>\
                                                                    \<li><a href="javascript:void(0);" onclick="PickerValueModal.settings().selectClass(this);" class="text-muted">text-muted</a></li>\
                                                                \</ul>\
                                                            \</li>\
                                                        \</ul>\
                                                        \<ul style="list-style-type:none;padding:0px;margin:10px;">\
                                                            \<li>\
                                                                \<span>Panel colors</span>\
                                                                \<ul>\
                                                                    \<li><a href="javascript:void(0);" onclick="PickerValueModal.settings().selectClass(this);" class="bg-primary">panel-primary</a></li>\
                                                                    \<li><a href="javascript:void(0);" onclick="PickerValueModal.settings().selectClass(this);" class="bg-success">panel-success</a></li>\
                                                                    \<li><a href="javascript:void(0);" onclick="PickerValueModal.settings().selectClass(this);" class="bg-info">panel-info</a></li>\
                                                                    \<li><a href="javascript:void(0);" onclick="PickerValueModal.settings().selectClass(this);" class="bg-warning">panel-warning</a></li>\
                                                                    \<li><a href="javascript:void(0);" onclick="PickerValueModal.settings().selectClass(this);" class="bg-danger">panel-danger</a></li>\
                                                                \</ul>\
                                                            \</li>\
                                                        \</ul>\
                                                    \</div>\
                                                    \<div class="col-md-4">\
                                                        \<ul style="list-style-type:none;padding:0px;margin:10px;">\
                                                            \<li>\
                                                                \<span>Contextual backgrounds</span>\
                                                                \<ul>\
                                                                    \<li><a href="javascript:void(0);" onclick="PickerValueModal.settings().selectClass(this);" class="bg-primary">bg-primary</a></li>\
                                                                    \<li><a href="javascript:void(0);" onclick="PickerValueModal.settings().selectClass(this);" class="bg-success">bg-success</a></li>\
                                                                    \<li><a href="javascript:void(0);" onclick="PickerValueModal.settings().selectClass(this);" class="bg-info">bg-info</a></li>\
                                                                    \<li><a href="javascript:void(0);" onclick="PickerValueModal.settings().selectClass(this);" class="bg-warning">bg-warning</a></li>\
                                                                    \<li><a href="javascript:void(0);" onclick="PickerValueModal.settings().selectClass(this);" class="bg-danger">bg-danger</a></li>\
                                                                \</ul>\
                                                            \</li>\
                                                        \</ul>\
                                                    \</div>\
                                                    \<div class="col-md-4">\
                                                        \<ul style="list-style-type:none;padding:0px;margin:10px;">\
                                                            \<li>\
                                                                \<span>Alignments</span>\
                                                                \<ul>\
                                                                    \<li><a href="javascript:void(0);" onclick="PickerValueModal.settings().selectClass(this);">pull-left</a></li>\
                                                                    \<li><a href="javascript:void(0);" onclick="PickerValueModal.settings().selectClass(this);">pull-right</a></li>\
                                                                    \<li><a href="javascript:void(0);" onclick="PickerValueModal.settings().selectClass(this);">center-block</a></li>\
                                                                \</ul>\
                                                            \</li>\
                                                        \</ul>\
                                                    \</div>\
                                                \</div>\
                                        \</div>\
                                    \</div>';

            $('.modalBodyFixed', '#pickerValueModal').html(html_fragment);
            $('#btnPickerValueModalSave').css('display', 'inline-block');
            var target_value  = $('#' + target).val();
            $('#pickerExpressionText').val(target_value);
        },
        showDateFormat:       function (rel_elem) {
            var target = $(rel_elem).attr('data-vb-picker-target');
            this.setTitle('Date Formats');

            var html_fragment = '<input id="pickerExpressionRelElement" type="hidden" value="' + target + '" />\
                                     <div>\
                                        <div class="col-md-12">\
                                             <div class="input-group" style="margin-top:20px">\
                                                 <input id="pickerExpressionText" type="text" class="form-control"  />\
                                                 <span class="input-group-btn">\
                                                     <button class="btn btn-danger" type="button" onclick="PickerValueModal.settings().clearClasses();">\
                                                         <span class="fa fa-trash-o"></span>\
                                                     </button>\
                                                 </span>\
                                             </div>\
                                        </div>\
                                        <div class="col-md-12" style="margin-top:20px">\
                                            <div class="col-md-4">\
                                                <ul style="list-style-type:none;padding:0px;margin:10px;">\
                                                    <li>\
                                                        <span>with Slash "/" </span>\
                                                        <ul>\
                                                            <li><a href="javascript:void(0);" onclick="PickerValueModal.settings().setInputText(this);" class="text-primary">dd/mm/yyyy</a></li>\
                                                            <li><a href="javascript:void(0);" onclick="PickerValueModal.settings().setInputText(this);" class="text-primary">mm/dd/yyyy</a></li>\
                                                            <li><a href="javascript:void(0);" onclick="PickerValueModal.settings().setInputText(this);" class="text-primary">yyyy/mm/dd</a></li>\
                                                            <li><a href="javascript:void(0);" onclick="PickerValueModal.settings().setInputText(this);" class="text-primary">dd/mm/yy</a></li>\
                                                            <li><a href="javascript:void(0);" onclick="PickerValueModal.settings().setInputText(this);" class="text-primary">mm/dd/yy</a></li>\
                                                            <li><a href="javascript:void(0);" onclick="PickerValueModal.settings().setInputText(this);" class="text-primary">yy/mm/dd</a></li>\
                                                        </ul>\
                                                    </li>\
                                                </ul>\
                                            </div>\
                                            <div class="col-md-4">\
                                                <ul style="list-style-type:none;padding:0px;margin:10px;">\
                                                    <li>\
                                                        <span>with Dots "." </span>\
                                                        <ul>\
                                                            <li><a href="javascript:void(0);" onclick="PickerValueModal.settings().setInputText(this);" class="text-primary">dd.mm.yyyy</a></li>\
                                                            <li><a href="javascript:void(0);" onclick="PickerValueModal.settings().setInputText(this);" class="text-primary">mm.dd.yyyy</a></li>\
                                                            <li><a href="javascript:void(0);" onclick="PickerValueModal.settings().setInputText(this);" class="text-primary">yyyy.mm.dd</a></li>\
                                                            <li><a href="javascript:void(0);" onclick="PickerValueModal.settings().setInputText(this);" class="text-primary">dd.mm.yy</a></li>\
                                                            <li><a href="javascript:void(0);" onclick="PickerValueModal.settings().setInputText(this);" class="text-primary">mm.dd.yy</a></li>\
                                                            <li><a href="javascript:void(0);" onclick="PickerValueModal.settings().setInputText(this);" class="text-primary">yy.mm.dd</a></li>\
                                                        </ul>\
                                                    </li>\
                                                </ul>\
                                            </div>\
                                            <div class="col-md-4">\
                                                <ul style="list-style-type:none;padding:0px;margin:10px;">\
                                                    <li>\
                                                        <span>with Dashes "-" </span>\
                                                        <ul>\
                                                            <li><a href="javascript:void(0);" onclick="PickerValueModal.settings().setInputText(this);" class="text-primary">yyyy-mm-dd</a></li>\
                                                            <li><a href="javascript:void(0);" onclick="PickerValueModal.settings().setInputText(this);" class="text-primary">dd-mm-yyyy</a></li>\
                                                            <li><a href="javascript:void(0);" onclick="PickerValueModal.settings().setInputText(this);" class="text-primary">mm-dd-yyyy</a></li>\
                                                        </ul>\
                                                    </li>\
                                                </ul>\
                                            </div>\
                                        </div>\
                                     </div>';

            $('.modalBodyFixed', '#pickerValueModal').html(html_fragment);
            $('#btnPickerValueModalSave').css('display', 'inline-block');
            var target_value  = $('#' + target).val();
            $('#pickerExpressionText').val(target_value);

        },
        showPattern:          function (rel_elem) {
            var target = $(rel_elem).attr('data-vb-picker-target');
            this.setTitle('Patterns');

            var html_fragment = '<input id="pickerExpressionRelElement" type="hidden" value="' + target + '" />\
                                     <div>\
                                         <div class="col-md-12">\
                                             <div class="input-group" style="margin-top:20px">\
                                                 <input id="pickerExpressionText" type="text" class="form-control"  />\
                                                 <span class="input-group-btn">\
                                                     <button class="btn btn-danger" type="button" onclick="PickerValueModal.settings().clearClasses();">\
                                                         <span class="fa fa-trash-o"></span>\
                                                     </button>\
                                                 </span>\
                                             </div>\
                                         </div>\
                                         <div class="col-md-12" style="margin-top:20px">\
                                             <h6>The most useful patterns</h6>\
                                             <ul style="list-style-type:none;padding:0px;margin:10px;">\
                                                 <li><span style="width:100px;display: inline-block">Only Numbers:</span> <a href="javascript:void(0);" onclick="PickerValueModal.settings().setInputText(this);" class="text-primary">/^\\d+$/</a></li>\
                                                 <li><span style="width:100px;display: inline-block">Email:</span> <a href="javascript:void(0);" onclick="PickerValueModal.settings().setInputText(this);" class="text-primary">/^([a-z0-9_\\.-]+)@([\\da-z\\.-]+)\\.([a-z\\.]{2,6})$/</a></li>\
                                                 <li><span style="width:100px;display: inline-block">URL:</span> <a href="javascript:void(0);" onclick="PickerValueModal.settings().setInputText(this);" class="text-primary">/^(https?:\/\/)?([\\da-z\\.-]+)\\.([a-z\\.]{2,6})([\/\\w \\.-]*)*\/?$/</a></li>\
                                                 <li><span style="width:100px;display: inline-block">IP Address:</span> <a href="javascript:void(0);" onclick="PickerValueModal.settings().setInputText(this);" class="text-primary">/^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$/</a></li>\
                                                 <li><span style="width:100px;display: inline-block">Zip Code:</span> <a href="javascript:void(0);" onclick="PickerValueModal.settings().setInputText(this);" class="text-primary">/^\\d{5}(?:[-\\s]\\d{4})?$/</a></li>\
                                                 <li><span style="width:100px;display: inline-block">Credit Card:</span> <a href="javascript:void(0);" onclick="PickerValueModal.settings().setInputText(this);" class="text-primary">/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\\d{3})\\d{11})$/</a></li>\
                                                 <li><span style="width:100px;display: inline-block">Phone Number:</span> <a href="javascript:void(0);" onclick="PickerValueModal.settings().setInputText(this);" class="text-primary">/^[0-9\\-\\+]{9,15}$/</a></li>\
                                                 <li><span style="width:100px;display: inline-block">User Name:</span> <a href="javascript:void(0);" onclick="PickerValueModal.settings().setInputText(this);" class="text-primary">/^[a-z0-9_-]{3,18}$/</a></li>\
                                             </ul>\
                                         </div>\
                                     </div>';

            $('.modalBodyFixed', '#pickerValueModal').html(html_fragment);
            $('#btnPickerValueModalSave').css('display', 'inline-block');
            var target_value  = $('#' + target).val();
            $('#pickerExpressionText').val(target_value);

        },
        selectScopeVariable:  function (elem) {
            var selected_value = $(elem).attr('data-selected-value');
            var rel_elem       = $('#pickerScopeVariablesRelElement').val();
            $('#' + rel_elem).val(selected_value);
            $('#btnPickerValueModalClose').click();
        },
        selectScopeFunction:  function (elem) {
            var selected_value = $(elem).attr('data-selected-value');
            var rel_elem       = $('#pickerScopeFunctionsRelElement').val();
            $('#' + rel_elem).val(selected_value);
            $('#btnPickerValueModalClose').click();
        },
        selectItemExpression: function (elem) {
            var selected_text = $(elem).attr('data-selected-value');
            var text          = $('#pickerExpressionText').val();
            var startPos      = $('#pickerExpressionText').prop("selectionStart");
            var endPos        = $('#pickerExpressionText').prop("selectionEnd");

            var new_text = text.substring(0, startPos) +
                selected_text +
                text.substring(endPos, text.length);

            $('#pickerExpressionText').val(new_text);
            $('#pickerExpressionText').prop("selectionStart", (startPos + selected_text.length));
            $('#pickerExpressionText').prop("selectionEnd", (startPos + selected_text.length));
            $('#pickerExpressionText').focus();
        },
        selectClass:          function (elem) {
            var selected_text = $(elem).text();
            var text          = $('#pickerExpressionText').val();
            var startPos      = $('#pickerExpressionText').prop("selectionStart");
            var endPos        = $('#pickerExpressionText').prop("selectionEnd");

            if (startPos > 0 && (text.substr(startPos - 1, 1) != ' ')) {
                selected_text = ' ' + selected_text;
            }

            var new_text = text.substring(0, startPos) +
                selected_text +
                text.substring(endPos, text.length);

            $('#pickerExpressionText').val(new_text);
            $('#pickerExpressionText').prop("selectionStart", (startPos + selected_text.length));
            $('#pickerExpressionText').prop("selectionEnd", (startPos + selected_text.length));
            $('#pickerExpressionText').focus();
        },
        setInputText:         function (elem) {
            var selected_text = $(elem).text();
            $('#pickerExpressionText').val(selected_text).focus();
        },
        saveExpression:       function () {
            var exp       = $('#pickerExpressionText').val();
            var target    = $('#pickerExpressionRelElement').val();
            var isTextExp = $('#pickerExpressionIsText').val();
            if (isTextExp == 'true') {
                $('#' + target).val('{{' + exp + '}}');
            } else {
                $('#' + target).val(exp);
            }
            $('#btnPickerValueModalClose').click();
        },
        clearClasses:         function () {
            $('#pickerExpressionText').val('');
        },
        appendWinModal:       function () {
            if ($('#pickerValueModal').size() == 0) {

                // append modal win to body
                $('body').append(this.winModal);
                var modal_window = this;
                $('#pickerValueModal').on('show.bs.modal', function (e) {
                    var rel_elem = e.relatedTarget;
                    if (rel_elem != null) {
                        var type = $('#' + rel_elem.id).attr('data-vb-picker');
                        if (type == 'bind') {
                            modal_window.showScopeVariables(rel_elem);
                        } else if (type == 'evt') {
                            modal_window.showScopeFunctions(rel_elem);
                        } else if (type == 'exp') {
                            modal_window.showExpression(rel_elem, false);
                        } else if (type == 'exptext') {
                            modal_window.showExpression(rel_elem, true);
                        } else if (type == 'class') {
                            modal_window.showClasses(rel_elem);
                        } else if (type == 'dateFormat') {
                            modal_window.showDateFormat(rel_elem);
                        } else if (type == 'pattern') {
                            modal_window.showPattern(rel_elem);
                        }
                    }
                })
            }
        }
    };
    return {
        settings: function () {
            return _private;
        },
        init:     function () {
            this.settings().appendWinModal();
        }
    };
})();

CustomModal.htmlModal = (function () {
    var settings   = CustomModal.settings(),
        idModal    = 'htmlModal',
        elBody     = '#' + idModal + ' #winModalTblBody',
        titleModal = 'HTML',
        idRow      = 'rowHTML';
    return {
        init:              function (item, html) {
            // set thead tr
            settings.setHeadTbl('<tr><th></th></tr>');

            // set hidden tr to tbody, which will be clone
            settings.setHiddenTr(
                '<tr id="rowHidden" style="display:none">\
                    <td><textarea class="form-control" name="htmlText" style="width:100%;" rows="6"></textarea></td>\
                 </tr>');
            // set footer
            settings.setFooter(
                '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\
                 <button type="button" class="btn btn-primary" onclick="CustomModal.htmlModal.saveHTMLTblParams();">Save changes</button>'
            )

            // append modal to body
            settings.appendWinModal(idModal, titleModal);
            CustomModal.htmlModal.fillHTMLTbl(html);
        },
        fillHTMLTbl:       function (html) {
            var hiddentr = $('tr#rowHidden', elBody),
                tr, tds;

            $('tr[id!="rowHidden"]', elBody).remove();
            tr           = hiddentr.clone().appendTo(elBody).attr({'id': '', 'name': idRow}).show();
            tds          = $('td', tr);
            $(tds[0]).find('textarea').val(html);
        },
        saveHTMLTblParams: function () {
            var newHTML = '',
                trs     = $('tr[name="' + idRow + '"]', elBody), tr, tds;
            if (trs.length) {
                tr      = trs[0];
                tds     = $('td', tr);
                newHTML = $(tds[0]).find('textarea').val();
            }
            $('#gc_component_attr_html').val(newHTML);
            $('#gc_html_attr_changeHtml').val('1');
            $('#' + idModal).modal('hide');
        }
    }
})();