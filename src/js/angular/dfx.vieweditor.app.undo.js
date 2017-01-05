var DfxViewEditorUndo = (function() {
    var api = {};

    var getAttibutesChainValue = function(path, obj) {
        var schema = obj,
            pList = path.split('.');

        for (var i = 0; i < pList.length; i++) {
            var elem = pList[i];
            if (!schema[elem] && schema[elem] !== '' && schema[elem] !== false) {
                schema[elem] = {};
            }
            schema = schema[elem];
        }
        if (schema !== null && typeof schema === 'object' && schema.hasOwnProperty('value')) {
            return schema.value;
        } else {
            return schema;
        }
    };
    var setAttributesChainValue = function(path, obj, value) {
        var schema = obj,
            pList = path.split('.'),
            last_path_segment = '';

        if (pList.length > 1) {
            for (var i = 0; i < pList.length-1; i++) {
                var elem = pList[i];
                if (!schema[elem] && schema[elem] !== '' && schema[elem] !== false) {
                    schema[elem] = {};
                }
                schema = schema[elem];
            }
            last_path_segment = pList[pList.length-1];
        } else {
            last_path_segment = path;
        }
        if (typeof schema[last_path_segment] === 'object' && schema[last_path_segment].hasOwnProperty('value')) {
            schema[last_path_segment].value = value;
        } else {
            schema[last_path_segment] = value;
        }
    };
    var removeAttributesPrefixFromPath = function(path) {
        if (path && path.indexOf('attributes') == 0) {
            return path.substring(path.indexOf('.') + 1);
        } else {
            return path;
        }
    };
    var cleanDefaultValues = function(attribute, old_attribute_value) {
        if (!old_attribute_value || (Array.isArray(old_attribute_value) && old_attribute_value.length == 0)) {
            delete attribute.status;
        }
    };
    var setAttributesGroup = function(gc_attributes, old_attributes_group) {
        var attributes_names = Object.keys(old_attributes_group);

        for (var i = 0; i < attributes_names.length; i++) {
            var attrbute_name = attributes_names[i];
            var old_attribute_value = old_attributes_group[attrbute_name];

            if (typeof gc_attributes[attrbute_name] === 'object' && gc_attributes[attrbute_name].hasOwnProperty('value')) {
                cleanDefaultValues(gc_attributes[attrbute_name], old_attribute_value);

                gc_attributes[attrbute_name].value = angular.copy(old_attribute_value);
            } else {
                //TODO: no such cases right now, if happens, need to adjust and call cleanDefaultValues()
                gc_attributes[attrbute_name] = angular.copy(old_attribute_value);
            }
        }
    };

    api.setCalledFromPicker = function(scope) {
        scope.dfx_undo_called_from_picker = true;
    };
    api.cacheAttributeOldValue = function(options, scope) {
        var attribute_name = options.name,
            attribute_value = options.value;

        // Called from picker using $.focus() and must be ignored
        if (scope.dfx_undo_called_from_picker) {
            scope.dfx_undo_called_from_picker = false;
            return;
        };

        if (attribute_value || attribute_value == '') {
            scope.dfx_attribute_old_value = angular.copy( attribute_value );
        } else {
            scope.dfx_attribute_old_value = angular.copy( getAttibutesChainValue(attribute_name, scope.gc_selected.attributes) );
        }
    };
    api.cacheAttributeNewValue = function(options, scope) {
        var attribute_name,
            attribute_new_value;

        if (options.group) {
            attribute_name = 'undo_group_' + scope.gc_selected.id;
            attribute_new_value = options.value;
        } else {
            attribute_name = removeAttributesPrefixFromPath(options);
            attribute_new_value = getAttibutesChainValue(attribute_name, scope.gc_selected.attributes);
        }

        var attribute_old_value = scope.hasOwnProperty('dfx_attribute_old_value') ?  scope.dfx_attribute_old_value : '';

        if (attribute_new_value !== attribute_old_value) {
            scope.dfx_view_editor_actions_stack = scope.dfx_view_editor_actions_stack || [];
            scope.dfx_view_editor_actions_stack.unshift({
                component_id: scope.gc_selected.id,
                attribute_name: attribute_name,
                attribute_old_value: angular.copy(attribute_old_value)
            });
        }
    };
    api.viewEditorUndo = function(event, scope) {
        $(event.srcElement).animateCss('pulse');

        if (scope.dfx_view_editor_actions_stack && scope.dfx_view_editor_actions_stack.length > 0) {
            var action_for_undo = scope.dfx_view_editor_actions_stack.shift();
            var gc_for_undo = scope.gc_instances[ action_for_undo.component_id ];

            if (action_for_undo.attribute_name.indexOf('undo_group_') == 0) {
                setAttributesGroup(gc_for_undo.attributes, action_for_undo.attribute_old_value);
            } else {
                setAttributesChainValue(action_for_undo.attribute_name, gc_for_undo.attributes, action_for_undo.attribute_old_value);
            }
        }
    };

    return api;
}());
