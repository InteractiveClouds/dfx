/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var SETTINGS = require('../lib/dfx_settings'),
    mdbw = require('../lib/mdbw')(SETTINGS.mdbw_options),
    mongo = require('mongodb'),
    DB_TENANTS_PREFIX = SETTINGS.databases_tenants_name_prefix;

var attributes_mapping;

var replaceAttributes = function(comp_definition, gc_type) {
    var i = 0, j = 0;

    var replaceChildAttrs = function(comp_def_attrs_new, attr_children) {
        for (var attr_children_map in attr_children) {
            var attr_child_old_name = attr_children_map;
            var attr_child_new_name = attr_children[attr_children_map].newName;

            comp_def_attrs_new[attr_child_new_name] = comp_def_attrs_new[attr_child_old_name];
            delete comp_def_attrs_new[attr_child_old_name];
        }
    };

    var getComboPropertyOptions = function(attr_old_name, attr_old_value) {
        //console.log('within getComboPropertyOptions');
        //console.log('attr_old_name='+attr_old_name+', attr_old_value='+JSON.stringify(attr_old_value));
        var result = null;
        try {
            var propertyOptions = {};
            propertyOptions.value = attr_old_value.substring(attr_old_value.lastIndexOf(' ') + 1);
            //console.log(JSON.stringify(propertyOptions));

            var propertyOptionsFields = {};
            var first_val_part = attr_old_value.substring(0, attr_old_value.indexOf(' '));
            var second_val_part = attr_old_value.substring(attr_old_value.indexOf(' ')).trim();
            second_val_part = second_val_part.substring(attr_old_value.indexOf(' ')).trim(); // remove 'as' at the beginning
            //console.log(first_val_part);
            //console.log(second_val_part);

            propertyOptionsFields.dataValue = first_val_part.substring(first_val_part.indexOf('.') + 1);
            propertyOptionsFields.displayValue = second_val_part.substring(second_val_part.indexOf('.') + 1, second_val_part.indexOf(' '));
            //console.log(JSON.stringify(propertyOptionsFields));

            result = {};
            result.propertyOptions = propertyOptions;
            result.propertyOptionsFields = propertyOptionsFields;
        } catch (combo_err) {
            console.log('Combobox model options old value is not correct and can not be parsed');
        }
        //console.log(JSON.stringify(result));
        return result;
    };

    var changeGridColumns = function(grid_attributes) {
        var idx = 0;
        try {
            for (idx = 0; idx < grid_attributes.gridColumns.length; idx++) {
                grid_attributes.gridColumns[idx].header = grid_attributes.gridColumns[idx].label;
                delete grid_attributes.gridColumns[idx].label;

                grid_attributes.gridColumns[idx].property = grid_attributes.gridColumns[idx].model;
                delete grid_attributes.gridColumns[idx].model;

                grid_attributes.gridColumns[idx].type.callbackFunction = '';
            }
        } catch (combo_err) {
            console.log('Datagrid can not be adjusted');
        }
        return result;
    };

    for (i = 0; i < comp_definition.length; i++) {
        if (comp_definition[i].type === gc_type) {
            var comboPropertyOptions;

            for (var attr_map in attributes_mapping) {
                if(attributes_mapping.hasOwnProperty(attr_map)) {
                    var attr_old_name = attr_map;
                    var attr_new_name = attributes_mapping[attr_map].newName;
                    var attr_old_value = comp_definition[i].attributes[attr_old_name];
                    var attr_children = attributes_mapping[attr_map].children;
                    var is_attr_array = attributes_mapping[attr_map].isArray;

                    if (gc_type === 'combobox' && attr_old_name == 'modelopts') {
                        comboPropertyOptions =  getComboPropertyOptions(attr_old_name, attr_old_value.value);
                    }

                    if (attr_old_value) {
                        comp_definition[i].attributes[attr_new_name] = attr_old_value;
                        delete comp_definition[i].attributes[attr_old_name];

                        if (attr_children) {
                            if (is_attr_array) {
                                var attr_children_arr = comp_definition[i].attributes[attr_new_name];
                                for (j = 0; j < attr_children_arr.length; j++) {
                                    replaceChildAttrs(attr_children_arr[j], attr_children);
                                }
                            } else {
                                replaceChildAttrs(comp_definition[i].attributes[attr_new_name], attr_children);
                            }
                        }
                    } else if (attr_old_name === "newAttribute") {
                        comp_definition[i].attributes[attr_new_name] = attributes_mapping[attr_map].newValue;
                    }
                }
            }

            if (gc_type === 'datagrid') {
                changeGridColumns(comp_definition[i].attributes);
            }

            //console.log('comboPropertyOptions in the main loop:');
            //console.log(JSON.stringify(comboPropertyOptions));
            if (comboPropertyOptions) {
                comp_definition[i].attributes.propertyOptions = comboPropertyOptions.propertyOptions;
                comp_definition[i].attributes.propertyOptionsFields = comboPropertyOptions.propertyOptionsFields;
            }
        } else {
            replaceAttributes(comp_definition[i].children, gc_type);
        }
    }
};

mdbw.get("dreamface_sysdb", 'tenants')
.then(function (tenants) {
    tenants.forEach(function(tenant) {
        console.log("===> tenant " + DB_TENANTS_PREFIX + tenant.id);
        mdbw.get(DB_TENANTS_PREFIX + tenant.id, 'datawidgets')
            .then(function(datawidgets) {
                datawidgets.forEach(function(datawidget) {
                    try {
                        var src_obj = JSON.parse(datawidget.src);

                        // RADIO
                        attributes_mapping = {
                            "modelCollection": {"newName": "propertyOptions"},
                            "model": {"newName": "property"},
                            "modelInit": {"newName": "propertyInit"},
                            "useRadioModel": {"newName": "dynamicOptions"},
                            "modelFields": {"newName": "propertyOptionsFields",
                                "children": {
                                    "labelName": {"newName": "displayValue"},
                                    "valueName": {"newName": "dataValue"},
                                    "labelVisibleName": {"newName": "visible"},
                                    "disabledName": {"newName": "disabled"}
                                }
                            },
                            "radioButtons": {"newName": "staticOptions",
                                "isArray": true,
                                "children": {
                                    "label": {"newName": "displayValue"},
                                    "labelshow": {"newName": "visible"},
                                    "value": {"newName": "dataValue"}
                                }
                            }
                        };
                        replaceAttributes(src_obj.definition, 'radio');

                        // COMBOBOX
                        attributes_mapping = {
                            "model": {"newName": "property"},
                            "modelopts": {"newName": "propertyOptions"},
                            "modelinit": {"newName": "propertyInit"},
                            "labelshow": {"newName": "labelVisible"},

                            "newAttribute": {"newName": "propertyOptionsFields",
                                            "newValue": {
                                                "displayValue": "label",
                                                "dataValue": "value"
                                            }
                            }
                        };
                        replaceAttributes(src_obj.definition, 'combobox');

                        // STATICTEXT
                        attributes_mapping = {
                            "model": {"newName": "bind"}
                        };
                        replaceAttributes(src_obj.definition, 'statictext');

                        // LINK
                        attributes_mapping = {
                            "model": {"newName": "property"},
                            "modelinit": {"newName": "propertyInit"},
                            "clickHandler": {"newName": "onclick"}
                        };
                        replaceAttributes(src_obj.definition, 'link');

                        // IMAGE
                        attributes_mapping = {
                            "model": {"newName": "property"},
                            "modelinit": {"newName": "propertyInit"}
                        };
                        replaceAttributes(src_obj.definition, 'image');

                        // INPUT FIELD
                        attributes_mapping = {
                            "model": {"newName": "property"},
                            "modelinit": {"newName": "propertyInit"},
                            "labelshow": {"newName": "labelVisible"}
                        };
                        replaceAttributes(src_obj.definition, 'inputfield');

                        // INPUT NUMBER
                        attributes_mapping = {
                            "model": {"newName": "property"},
                            "modelinit": {"newName": "propertyInit"},
                            "labelshow": {"newName": "labelVisible"},
                            "defvalue": {"newName": "defaultValue"}
                        };
                        replaceAttributes(src_obj.definition, 'numberfield');

                        // AMOUNT FIELD
                        attributes_mapping = {
                            "model": {"newName": "property"},
                            "modelinit": {"newName": "propertyInit"},
                            "labelshow": {"newName": "labelVisible"}
                        };
                        replaceAttributes(src_obj.definition, 'amountfield');

                        // INPUT DATE
                        attributes_mapping = {
                            "model": {"newName": "property"},
                            "modelinit": {"newName": "propertyInit"},
                            "labelshow": {"newName": "labelVisible"}
                        };
                        replaceAttributes(src_obj.definition, 'datefield');

                        // TEXTAREA
                        attributes_mapping = {
                            "model": {"newName": "property"},
                            "modelinit": {"newName": "propertyInit"},
                            "labelshow": {"newName": "labelVisible"}
                        };
                        replaceAttributes(src_obj.definition, 'textarea');

                        // CHARTS
                        attributes_mapping = {
                            "model": {"newName": "propertyData"},
                            "labelshow": {"newName": "labelVisible"}
                        };
                        replaceAttributes(src_obj.definition, 'chart');

                        // CHECKBOX
                        attributes_mapping = {
                            "model": {"newName": "property"},
                            "modelinit": {"newName": "propertyInit"},
                            "labelshow": {"newName": "labelVisible"},
                            "true_value": {"newName": "checkedValue"},
                            "false_value": {"newName": "uncheckedValue"}
                        };
                        replaceAttributes(src_obj.definition, 'checkbox');

                        // DATAGRID
                        attributes_mapping = {
                            "model": {"newName": "propertyData"}
                        };
                        replaceAttributes(src_obj.definition, 'datagrid');

                        datawidget.src = JSON.stringify(src_obj, null, '\t');

                        mdbw.update(DB_TENANTS_PREFIX + tenant.id, 'datawidgets', {name: datawidget.name}, {$set: datawidget})
                            .then(function() {
                                console.log(datawidget.name + " updated");
                            });
                    } catch(parseErr) {
                        console.log(parseErr.message);
                    }
                });
            });
    });
}).fail(function(err){
   console.log(err);
});


console.log("Wait please 30 seconds and then press CTRL + C :)");
