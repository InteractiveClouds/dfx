/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.1.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var bc_factory = null;

require([
    "/js/visualbuilder/bcontrols/bc.mobile.tabbar.min.js"
], function (util) {
    bc_factory = {
        "controls":               {
            "web":    {},
            "mobile": {
                "tabbar": bc_mobile_tabbar
            }
        },
        "createDefinition":       function (bc_type, bc_id, bc_container_id) {
            var platform = $('#dfx_visual_editor').attr('platform');
            return bc_factory.controls[platform][bc_type].createDefinition(bc_id, bc_container_id);
        },
        "renderDesign":           function (bc_type, bc_definition) {
            var platform = $('#dfx_visual_editor').attr('platform');
            return bc_factory.controls[platform][bc_type].renderDesign(bc_definition);
        },
        "loadPropertyPanel":      function (bc_type, bc_control_id, property_panel_id) {
            $('#' + property_panel_id).toggle();
            if ($('#' + property_panel_id).is(':hidden')) {
                console.log('hidden');
                return;
            }

            var platform = $('#dfx_visual_editor').attr('platform');

            var _loadPanel = function () {
                $('#' + property_panel_id).empty();
                //
                var editor = $('#dfx_src_editor.CodeMirror')[0].CodeMirror;
                var wgt_definition = JSON.parse(editor.getValue());
                var bc_component_definition = DfxVisualBuilder.getComponentDefinition(bc_control_id, wgt_definition.definition);

                return bc_factory.controls[platform][bc_type].loadPropertyPanel(bc_component_definition, property_panel_id);
            };
            _loadPanel();
        },
        "generatePropertyPanel":  function (definition, bc_component_def, property_panel_id) {
            var i, j;

            // Panel generation
            for (i = 0; i < definition.categories.length; i++) {
                var cat_fragment = '';
                var cat = definition.categories[i];
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
                    if (prop.propType !== 'input-tabsTabBar') {
                        prop_fragment = '<div class="form-group">' +
                        '<label class="col-xs-4 control-label">' + prop.label + '</label>' +
                        '<div class="col-xs-8">';

                        if (prop.propType == 'input-picker') {
                            prop_fragment += '<div class="input-group">' +
                            '<input id="bc_component_attr_' + prop.id + '" class="form-control input-xs dfx_visual_editor_property_input" type="text" />' +
                            '<span class="input-group-btn">' +
                            '<a id="btnPick' + prop.id + '" class="btn btn-default" href="#" data-toggle="modal" data-target="#pickerValueModal" data-vb-picker="' + prop.picker + '" data-vb-picker-target="bc_component_attr_' + prop.id + '">...</a>' +
                            '</span>';
                            prop_fragment += '</div>';
                        }
                        prop_fragment += '</div></div>';
                        cat_fragment += prop_fragment;
                    } else if (prop.propType == 'input-tabsTabBar') {
                        // Tabs container
                        prop_fragment = '<div id="listTabsName" class="list-unstyled">';

                        // Tab block
                        prop_fragment +=
                            '<div id="tabsBlock" class="dfx-bar-item">' +
                            '<a href="javascript:" onclick="bc_mobile_tabbar.removeTabBlock(event)" style="margin-top:-5px;margin-right:-5px;display:none" class="btn btn-link pull-right remove-img">' +
                            '<i style="font-size:11px" class="fa fa-times"></i>' +
                            '</a>' +
                            '<ul style="margin:5px;background-color: #f7f7f9;border: 1px solid #e1e1e8;padding: 9px 14px;font-size: 12px;" class="list-unstyled">' +
                            '<li>' +
                            '<label class="col-xs-4 control-label">Icon:</label>' +
                            '<div class="input-group col-xs-8">' +
                            '<input id="bc_component_attr_icon" type="text" class="form-control input-xs dfx_visual_editor_property_input">' +
                            '<span class="input-group-btn">' +
                            '<a id="btnPickImg" class="btn btn-default" href="#" data-toggle="modal" data-target="#iconsModal" data-vb-picker-target="bc_component_attr_icon">...</a>' +
                            '</span>' +
                            '</div>' +
                            '</li>' +
                            '<li>&nbsp;</li>' +
                            '<li>' +
                            '<label class="col-xs-4 control-label">Label:</label>' +
                            '<div class="input-group col-xs-8">' +
                            '<input id="bc_component_attr_label" type="text" style="font-size: 12px;height: 28px;" class="form-control input-xs dfx_visual_editor_property_input">' +
                            '</div>' +
                            '</li>' +
                            '<li>&nbsp;</li>' +
                            '<li>' +
                            '<label class="col-xs-4 control-label">Value:</label>' +
                            '<div class="input-group col-xs-8">' +
                            '<input id="bc_component_attr_value" type="text" style="font-size: 12px;height: 28px;" class="form-control input-xs dfx_visual_editor_property_input">' +
                            '</div>' +
                            '</li>' +
                            '</ul>' +
                            '</div>';

                        prop_fragment +=
                            '<a id="btnAddTabBlock" onclick="bc_mobile_tabbar.appendTabBlock()" style="margin-top:10px" class="btn btn-default pull-right">' +
                            '<span class="fa fa-plus"></span><span style="padding-left:5px">Add Tab</span></a>';

                        prop_fragment += '</div>';
                        cat_fragment += prop_fragment;
                    }
                }

                cat_fragment += '</div>';
                if (cat.dynamic == true) {
                    cat_fragment += '</span>';
                }
                $('#' + property_panel_id).append(cat_fragment);
            }

            // Initialization
            for (i = 0; i < definition.categories.length; i++) {
                var cat = definition.categories[i];
                for (j = 0; j < cat.properties.length; j++) {
                    var prop = cat.properties[j];
                    if (prop.type == 'value') {
                        if (bc_component_def.attributes[prop.id]) {
                            $('#bc_component_attr_' + prop.id).val(bc_component_def.attributes[prop.id].value);
                        }
                    }
                }
            }
        },
        "updateBarsDefinition":   function (wgt_definition) {
            bc_mobile_tabbar.savePropertyPanel(wgt_definition);
        },
        "getPropertiesFromPanel": function (definition) {
            var i, j;
            var return_definition = {};
            for (i = 0; i < definition.categories.length; i++) {
                var cat = definition.categories[i];
                for (j = 0; j < cat.properties.length; j++) {
                    var prop = cat.properties[j];
                    if (prop.type == 'value') {
                        var val = $('#bc_component_attr_' + prop.id).val();
                        return_definition[prop.id] = {"value": val};
                    }
                }
            }
            return return_definition;
        },
        "getDefaultAttributes":   function (definition) {
            var i, j;
            var return_definition = {};
            for (i = 0; i < definition.categories.length; i++) {
                var cat = definition.categories[i];
                for (j = 0; j < cat.properties.length; j++) {
                    var prop = cat.properties[j];
                    if (prop.type == 'value') {
                        return_definition[prop.id] = {"value": prop.default};
                    } else if (prop.type == 'tabsTabBar') {
                        return_definition[prop.id] = [
                            {
                                "label": {"value": "Home"},
                                "value": {"value": "Home"},
                                "icon":  {"value": "home"}
                            },
                            {
                                "label": {"value": "Profile"},
                                "value": {"value": "Profile"},
                                "icon":  {"value": "person"}
                            },
                            {
                                "label": {"value": "Settings"},
                                "value": {"value": "Settings"},
                                "icon":  {"value": "gear"}
                            }
                        ];
                    } else {
                        return_definition[prop.id] = prop.default;
                    }
                }
            }
            return return_definition;
        },
        "migrateAttributes":      function (definition, bc_component_def) {
            var i, j;
            var return_definition = {};
            for (i = 0; i < definition.categories.length; i++) {
                var cat = definition.categories[i];
                for (j = 0; j < cat.properties.length; j++) {
                    var prop = cat.properties[j];
                    if (bc_component_def[prop.id] == null) {
                        if (prop.type == 'value') {
                            return_definition[prop.id] = {"value": prop.default};
                        } else if (prop.type == 'tabsTabBar') {
                            return_definition[prop.id] = [
                                {
                                    "label": {"value": "Home"},
                                    "value": {"value": "Home"},
                                    "icon":  {"value": "home"}
                                },
                                {
                                    "label": {"value": "Profile"},
                                    "value": {"value": "Profile"},
                                    "icon":  {"value": "person"}
                                },
                                {
                                    "label": {"value": "Settings"},
                                    "value": {"value": "Settings"},
                                    "icon":  {"value": "gear"}
                                }
                            ];
                        }
                    } else {
                        return_definition[prop.id] = bc_component_def[prop.id];
                    }
                }
            }
            return return_definition;
        },
        "showBarInDesignTime":    function (bc_component_id) {
            $('#' + bc_component_id).toggle();
        },
        "updateBarInDesignTime":  function (bc_instance, bc_component_id, wgt_definition) {
            for (var i = 0; i < wgt_definition.definition.length; i++) {
                var component = wgt_definition.definition[i];

                if (component.id == bc_component_id) {
                    var $component = $('#' + bc_component_id),
                        $parent = $component.parent();
                    $component.remove();
                    $parent.prepend(bc_instance.renderDesign(component).fragment);
                    break;
                }
            }
        },
        "getBarDefFromWgtSrc":  function (bc_component_id, wgt_definition) {
            for (var i = 0; i < wgt_definition.definition.length; i++) {
                var component = wgt_definition.definition[i];

                if (component.id == bc_component_id) {
                    return component;
                }
            }
        }
    };

    // publish an event that bc_factory is ready
    $(document).trigger('bc_factory_ready');
});