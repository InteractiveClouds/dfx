/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/* GC Mobile Tab Bar */

var bc_mobile_tabbar = {
    "id":                  "root_tabbar",
    "attributeDefinition": {
        "categories": [
            {
                "id":         "bars_props",
                "label":      "Tab Bars",
                "expanded":   false,
                "properties": [
                    { "id": "tabs", "label": "Tabs:", "type": "tabsTabBar", "propType": "input-tabsTabBar" }
                ]
            },
            {
                "id":         "rules_props",
                "label":      "Presentation Rules",
                "expanded":   false,
                "properties": [
                    { "id": "display", "label": "Display Rule:", "type": "value", "default": "true", "propType": "input-picker", "picker": "exp" }
                ]
            },
            {
                "id":         "event_props",
                "label":      "Events",
                "expanded":   false,
                "properties": [
                    { "id": "onclick", "label": "On Click:", "type": "value", "default": "", "propType": "input-picker", "picker": "evt" }
                ]
            }
        ]
    },

    "createDefinition":    function (component_id, container_id) {
        var default_attributes = bc_factory.getDefaultAttributes(bc_mobile_tabbar.attributeDefinition);

        return {
            id:         component_id,
            type:       "tabbar",
            kind:       "bar",
            attributes: default_attributes,
            children:   [],
            container:  container_id
        };
    },

    "renderDesign":        function (component) {
        var i, attributes, fragment_html;
        if (!component.attributes) {
            attributes = bc_factory.getDefaultAttributes(bc_mobile_tabbar.attributeDefinition);
        } else {
            attributes = bc_factory.migrateAttributes(bc_mobile_tabbar.attributeDefinition, component.attributes);
        }

        fragment_html = '<nav id="' + component.id + '" gc-type="tabbar" ' +
        'style="position:absolute;" class="bar bar-tab">';

        for (i = 0; i < attributes.tabs.length; i++) {
            fragment_html += '<a class="tab-item" data-ignore="push">';
            fragment_html += '<span class="icon icon-' + attributes.tabs[i].icon.value + '"></span>';
            fragment_html += '<span class="tab-label">' + attributes.tabs[i].label.value + '</span>';
            fragment_html += '</a>';
        }

        fragment_html += '</nav>';

        var component_instance = {
            "id":       component.id,
            "fragment": fragment_html
        };
        return component_instance;
    },

    "loadPropertyPanel":   function (bc_component_definition, property_panel_id) {
        bc_factory.generatePropertyPanel(bc_mobile_tabbar.attributeDefinition, bc_component_definition, property_panel_id);

        // fill tabs panel
        var tabs = bc_component_definition.attributes.tabs, curTab;

        if (tabs.length) {
            for (var i = 0, len = tabs.length; i < len; i++) {
                if (i != 0) {
                    curTab = $('.dfx-bar-item:first').clone().insertBefore('#btnAddTabBlock');
                    $('.remove-img', curTab).show();
                } else {
                    curTab = $('.dfx-bar-item:first');
                }

                $('#bc_component_attr_icon', curTab).val(tabs[i].icon.value);
                $('#bc_component_attr_value', curTab).val(tabs[i].value.value);
                $('#bc_component_attr_label', curTab).val(tabs[i].label.value);
            }
        }

        PickerImageModal.icons.fillModal('iconsModal');// init picker
        /*
         $('.dfx_visual_editor_property_input').change( function(e) {
         DfxVisualBuilder.propertyPanelChanged();
         });*/
    },

    "savePropertyPanel":   function (wgt_definition) {
        var id = bc_mobile_tabbar.id;

        var attributes = bc_factory.getPropertiesFromPanel(bc_mobile_tabbar.attributeDefinition);

        var tabBlock = $('.dfx-bar-item'),
            tabs = [], curTabBlock, elIcon, elLabel, elValue;

        if (attributes.onclick.value) {
            attributes.onclick.value = attributes.onclick.value.replace(/\(.*?\)/g, "");
        }

        // get tabs
        for (var i = 0, len = tabBlock.length; i < len; i++) {
            curTabBlock = $(tabBlock[i]);
            elIcon = $('#bc_component_attr_icon', curTabBlock);
            elValue = $('#bc_component_attr_value', curTabBlock);
            elLabel = $('#bc_component_attr_label', curTabBlock);
            if (elIcon.val() != '') {
                tabs.push({"label": {"value": elLabel.val()}, "value": {"value": elValue.val()}, "icon": {"value": elIcon.val()}});
            }
        }
        attributes.tabs = tabs;

        if (tabs.length === 0) {
            var tabbarSrcDef = bc_factory.getBarDefFromWgtSrc(id, wgt_definition);
            attributes = tabbarSrcDef.attributes;
        }

        DfxVisualBuilder.findComponentAndUpdateAttributes(id, wgt_definition.definition, attributes, false);

        //DfxVisualBuilder.initPropertyPanelChange();

        bc_factory.updateBarInDesignTime(bc_mobile_tabbar, id, wgt_definition);
    },

    "appendTabBlock": function () {
        var el = $('.dfx-bar-item:first').clone().insertBefore('#btnAddTabBlock');
        el.find('input').val('');
        el.find('.remove-img').show();
    },

    "removeTabBlock": function (e) {
        var el = $(e.target).closest('.dfx-bar-item');
        el.remove();
    }
};
