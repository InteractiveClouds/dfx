/*
 This notice must be untouched at all times.

 DreamFace DFX - Visual Builder
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var DfxGcTemplateBuilder = function () {
};

DfxGcTemplateBuilder.applicationName = '';
DfxGcTemplateBuilder.gc_template_type = '';

/**
 * Toggle the visibility of the visual builder
 */
DfxGcTemplateBuilder.toggleViewSource = function () {
    var is_src_editor_visible = ($('#dfx_src_editor').css('display') == 'block') ? true : false;
    var editor                = $('#dfx_src_editor.CodeMirror')[0].CodeMirror;
    var ve_scope              = angular.element(document.getElementById('dfx_src_widget_editor')).scope();

    if (is_src_editor_visible) {
        $('#dfx_visual_editor_workspace').empty();
        DfxGcTemplateBuilder.loadComponents(editor.getValue());
        DfxGcTemplateBuilder.initGraphicalControls();
        $('#dfx_visual_editor').css('display', 'block');
        $('#dfx_src_editor').css('display', 'none');
        $('#dfx_visual_editor_view_source_text').text('View Source');
        $('#search-bar').hide();
    } else {
        // update widget description
        for (var key in ve_scope.gc_instances) {
            var component = angular.copy(ve_scope.gc_instances[key]);
            for (attribute in component.attributes) {
                if (component.attributes[attribute].status!='overridden') {
                    delete component.attributes[attribute];
                }
            }
            var widget_definition = JSON.parse(editor.getValue());
            DfxGcTemplateBuilder.findComponentAndUpdateAttributes(widget_definition.definition, component.attributes);
            editor.setValue(JSON.stringify(widget_definition, null, '\t'));
            editor.scrollTo(0, 0);
            editor.refresh();
        }

        $('#search-bar').show();
        $('#dfx_visual_editor_middle #dfx_visual_editor_workspace').click();
        $('#dfx_visual_editor').css('display', 'none');
        $('#dfx_src_editor').css('display', 'block');
        $('#dfx_visual_editor_view_source_text').text('View Visual');
    }

};

/**
 * Initializes the visual builder
 */
DfxGcTemplateBuilder.init = function ($timeout, $scope) {
    DfxGcTemplateBuilder.applicationName = $('#dfx_src_widget_editor').data('application-name');
    DfxGcTemplateBuilder.gc_template_type = $('#dfx_src_widget_editor').data('gctemplate-type');

    $('#dfx_visual_editor').css('display', 'block');

/*
    $('#dfx_visual_editor_workspace').scroll(function (event) {
        $('.dfx_visual_editor_highlighted_box').css('display', 'none');
        var gc_selected_id = $('.dfx_visual_editor_selected_box').attr('gc-selected-id');
        if (gc_selected_id != null) {
            var element = $('#' + gc_selected_id);
            //DfxGcTemplateBuilder.updateSelectedBox(element);
        }
    });
*/
    var script_theme = localStorage.getItem('DFX_script_theme')!=null ? localStorage.getItem('DFX_script_theme') : 'monokai';

    // Initialization of dfx_src_editor
    var htmlTextArea = document.getElementById('dfx_src_editor');
    var srcEditor = CodeMirror(function (elt) {
            htmlTextArea.parentNode.replaceChild(elt, htmlTextArea);
        },
        {
            lineNumbers: true,
            value: $('#dfx_src_editor').text(),
            mode: {name: 'application/json', globalVars: true},
            theme: script_theme,
            matchBrackets: true,
            highlightSelectionMatches: {showToken: /\w/},
            styleActiveLine: true,
            viewportMargin : Infinity,
            extraKeys: {"Alt-F": "findPersistent", "Ctrl-Space": "autocomplete"},
            foldGutter: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
        }
    );
    srcEditor.setSize(null, window.innerHeight - 59);
    $(srcEditor.getWrapperElement()).attr("id", "dfx_src_editor");
    $('#dfx_src_editor.CodeMirror').hide();

    DfxGcTemplateBuilder.initWorkspace();
    DfxGcTemplateBuilder.initGraphicalControls();
    angular.element(document).ready(function () {
        var src_content = {
            "id": Math.floor(Math.random() * 100000), // any unique ID is fine here, used only for design purposes, not saved to mongo after
            "type": DfxGcTemplateBuilder.gc_template_type,
            "attributes": JSON.parse(srcEditor.getValue())
        };

        DfxGcTemplateBuilder.loadComponents(src_content, function () {
            DfxGcTemplateBuilder.getVeScopeFromHtml().loadPropertyPanel(src_content.id);
            //$('#' + src_content.id).trigger('click');
        });
    });
};

/**
 * Initializes the workspace
 */
DfxGcTemplateBuilder.initWorkspace = function () {
    var $dfx_visual_editor  = $('#dfx_visual_editor'),
        platform            = $dfx_visual_editor.attr('platform'),
        applicationName     = $('#dfx_src_widget_editor').attr('data-application-name') || DfxGcTemplateBuilder.sharedCatalogName,
        wgtName             = $('#dfx_src_widget_editor_title').attr('widget-name'),
        path,
        device;

    if (platform == 'mobile') {
        var $dfx_visual_editor_device_size = $('#dfx_visual_editor_device_size'),
            device_size                    = $dfx_visual_editor_device_size.val(),
            dimension                      = device_size.split('x'),
            width                          = $dfx_visual_editor.width() - (151 + 351),
            device_width                   = parseInt(dimension[0]),
            device_height                  = parseInt(dimension[1]),
            $dfx_visual_editor_workspace   = $('#dfx_visual_editor_workspace');

        device = $("option:selected", $dfx_visual_editor_device_size).data('platform');

        var device_width_offset = (width - device_width) / 2;
        $dfx_visual_editor_workspace.
            css('left', (device_width_offset)).
            css('position', 'absolute').
            css('top', 0).
            css('width', device_width).
            css('height', device_height).
            addClass('gc_m_design_panel dfx-ios ratchet');
        $dfx_visual_editor_device_size.on('change', function () {
            var selected = $("option:selected", $(this)).data('platform');
            $('.gc_m_design_panel').removeClass(function (i, c) {
                return c.match(/dfx-ios|dfx-android/)[0];
            }).addClass(selected);
        });
    } else {
        device = 'desktop';
    }
};

/**
 * Initializes the graphical controls into the visual builder
 */
DfxGcTemplateBuilder.initGraphicalControls = function () {

    // Initializes draggable components
    $('.dfx_visual_editor_gc_cat_item_draggable').draggable({
        appendTo:          "body",
        cursorAt:          {top: 5, left: 20},
        cursor:            "move",
        start:             function (event, ui) {
            $('.dfx_visual_editor_selected_box').css('display', 'none');
            $('.dfx_visual_editor_gc_layout_selected_row').removeClass('dfx_visual_editor_gc_layout_selected_row');
            $('.dfx_visual_editor_gc_layout_selected_layout').removeClass('dfx_visual_editor_gc_layout_selected_layout');
        },
        helper: function (event) {
                    var gc_cat         = $(this).attr('gc-cat');
                    var gc_type         = $(this).attr('gc-type');
                    var helper_fragment = '<img style="width:36px;" src="/images/vb/icons/' + gc_cat + '_' + gc_type + '_drag.png"/>';
                    return helper_fragment;
                },
        connectToSortable: ".dfx_visual_editor_droppable"
    });
};

/**
 * Loads the components
 */
DfxGcTemplateBuilder.loadComponents = function (src_definition, callback) {
    var setSrcInEditor    = function (src_to_editor) {
        var editor = $('#dfx_src_editor.CodeMirror')[0].CodeMirror;
        editor.setValue(src_to_editor);
        editor.scrollTo(0, 0);
        editor.refresh();
    };

    try {
        setSrcInEditor(JSON.stringify(src_definition, null, '\t'));

        angular.element(document).ready(function () {
            DfxGcTemplateBuilder.addComponent(src_definition, function() {
                callback();
            });
        });
    } catch (err) {
        console.error('DFX error: template definition is corrupted');
        console.error(err.message);

        if (src_definition && src_definition != '') {
            setSrcInEditor(src_definition);
        }
    }
};

/**
 * Save Widget Properties
 *
 * @param {properties} An object containing all widget properties
 */
DfxGcTemplateBuilder.savePropertyWidget = function () {
    var platform         = $('#dfx_visual_editor').attr('platform');
    var title            = $('#dfx_visual_editor_widget_title').val();
    var title_visible    = ($('#dfx_visual_editor_widget_title_visible').is(':checked')) ? true : false;
    var tools_color      = ($('#dfx_visual_editor_widget_toolbar_color').is(':checked')) ? true : false;
    var tools_edit       = ($('#dfx_visual_editor_widget_toolbar_edit').is(':checked')) ? true : false;
    var tools_collapse   = ($('#dfx_visual_editor_widget_toolbar_collapse').is(':checked')) ? true : false;
    var tools_fullscreen = ($('#dfx_visual_editor_widget_toolbar_fullscreen').is(':checked')) ? true : false;
    var tools_delete     = ($('#dfx_visual_editor_widget_toolbar_delete').is(':checked')) ? true : false;
    var sortable         = ($('#dfx_visual_editor_widget_sortable').is(':checked')) ? true : false;
    var wgt_resources    = $('#wgt_attr_resources').val();

    var properties = {
        title:    {
            label:   title,
            visible: title_visible,
            color:   ""
        },
        tools:    {
            color:      tools_color,
            edit:       tools_edit,
            collapse:   tools_collapse,
            fullscreen: tools_fullscreen,
            delete:     tools_delete
        },
        sortable: sortable
    };

    var resources = [];
    if (wgt_resources) {
        wgt_resources = JSON.parse(wgt_resources);
    }
    for (var i = 0; i < wgt_resources.length; i++) {
        resources.push({name: wgt_resources[i].name});
    }

    var editor         = $('#dfx_src_editor.CodeMirror')[0].CodeMirror;
    var wgt_definition = JSON.parse(editor.getValue());

    wgt_definition.properties = properties;
    if (resources.length > 0) {
        wgt_definition.resources = resources;
    }

    if (bc_factory && platform == 'mobile') {
        bc_factory.updateBarsDefinition(wgt_definition);
    }

    DfxStudio.showNotification({
        title:          'Updated!',
        error:          false,
        body:           'The widget properties have been updated successfully.',
        clickToDismiss: true
    });
    editor.setValue(JSON.stringify(wgt_definition, null, '\t'));
    //editor.gotoLine(1);
};

DfxGcTemplateBuilder.addComponent = function (component) {

    var ve_scope = angular.element(document.getElementById('dfx_src_widget_editor')).scope();
    ve_scope.addComponent(component);

};

/**
 * Gets Visual Editor scope from HTML page
 *
 */
DfxGcTemplateBuilder.getVeScopeFromHtml = function () {
    return angular.element(document.getElementById('dfx_src_widget_editor')).scope();
};

/**
 * Gets a reference of the component from the widget definition
 *
 * @param {component_id} the component id
 * @param {parent_definition} the parent definition
 * @return {component_definition} the component JSON definition
 */
DfxGcTemplateBuilder.getComponentDefinition = function (component_id, parent_definition) {
    var component_definition = null, found = [];
    found                    = getObjects(parent_definition, 'id', component_id);
    if (found.length) {
        component_definition = found[0]
    }
    return component_definition;
};

/**
 * Finds the component by its id and update its attributes
 *
 * @param {parent_definition} the parent definition
 * @param {updated_attributes} the updated component attributes
 */
DfxGcTemplateBuilder.findComponentAndUpdateAttributes = function (parent_definition, updated_attributes) {
    DfxGcTemplateBuilder.removeNotOverriddenAttributes(updated_attributes, parent_definition.type);
    parent_definition.attributes = updated_attributes;
};

/**
 * Removes not overridden attributes
 */
DfxGcTemplateBuilder.removeNotOverriddenAttributes = function (updated_attributes, gc_type, attr_full_path) {
    var getGcDefaultTemplate = function (gc_type, callback) {
        gc_type = (gc_type == 'datatable') ? 'table' : gc_type;
        gc_type = (gc_type == 'json') ? 'gc_json' : gc_type;

        var template = JSON.parse( sessionStorage.getItem('dfx_' + gc_type) );

        if (template != null) {
            callback(template);
        }
        else {
            var app_body = angular.element(document.querySelector('body'));
            var app_scope = angular.element(app_body).scope();

            app_scope.getGCDefaultAttributes(gc_type).then(function (default_attributes) {
                callback(default_attributes);
            });
        }
    };
    var getDeepValue = function(obj, path) {
        for (var i = 0, path = path.split('.'), len = path.length; i < len; i++) {
            obj = obj[ path[i] ];
        }
        return obj;
    };
    var hasNestedAttributes = function (obj) {
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr) && attr != 'value' && attr != 'status') {
                return true;
            }
        }
        return false;
    };
    var isAttributeMandatory = function (attr_name) {
        if (attr_name == 'name' || attr_name == 'flex') {
            return true;
        }
        return false;
    };

    var removeOverriddenWithDefaultValues = function (attr_full_path, attr_updated_value, updated_attributes, attr_short_path, template) {
        var attr_default_value = getDeepValue(template, attr_full_path);

        if (attr_updated_value !== null && typeof attr_updated_value === 'object') {
            if ((!attr_default_value || attr_updated_value.value == attr_default_value.value)
                && !hasNestedAttributes(attr_updated_value) && !isAttributeMandatory(attr_short_path))
            {
                delete updated_attributes[attr_short_path];
            }
        } else {
            if (attr_updated_value == attr_default_value && !isAttributeMandatory(attr_short_path)) {
                delete updated_attributes[attr_short_path];
            }
        }
    };

    var removeOverriddenDefaultArraysOrObjects = function (attr_updated_value, updated_attributes_parent, attribute_name,
        attr_full_path, template)
    {
        var attr_default_value = getDeepValue(template, attr_full_path);

        // to compare without status
        attr_updated_value = angular.copy(attr_updated_value);
        if (attr_updated_value.status == 'overridden') {
            if (attr_default_value.status == '') {
                attr_updated_value.status == '';
            } else if (! attr_default_value.hasOwnProperty('status')) {
                delete attr_updated_value['status'];
            }
        }

        // compare
        if (angular.equals(attr_updated_value, attr_default_value)) {
            delete updated_attributes_parent[attribute_name];
        }
    };

    var removeNotOverridden = function (updated_attributes, attr_full_path, template, updated_attributes_parent) {
        for (var attribute in updated_attributes) {
            if (updated_attributes.hasOwnProperty(attribute)) {
                if ( (attribute == 'value' && Array.isArray(updated_attributes[attribute]))
                    || (attribute == 'value' && angular.isObject(updated_attributes[attribute]) && !angular.isString(updated_attributes[attribute]))
                    || (attribute == 'layout' && gc_type == 'panel') )
                {
                    var attr_path = attr_full_path ? attr_full_path + '.' + attribute : attribute;
                    var attribute_name = attr_full_path ? attr_full_path.substring(attr_full_path.lastIndexOf('.') + 1) : attribute;
                    var updated_attributes_parent = updated_attributes_parent ? updated_attributes_parent : updated_attributes;

                    removeOverriddenDefaultArraysOrObjects(updated_attributes[attribute], updated_attributes_parent, attribute_name,
                        attr_path, template);
                }
                else if (attribute != 'value' && attribute != 'status' && !Array.isArray(updated_attributes[attribute]))
                {
                    var attr_path = attr_full_path ? attr_full_path + '.' + attribute : attribute;

                    if (updated_attributes[attribute] !== null && typeof updated_attributes[attribute] === 'object') {
                        if (updated_attributes[attribute] && updated_attributes[attribute].status != 'overridden' && !isAttributeMandatory(attribute))
                        {
                            delete updated_attributes[attribute];
                        }
                        removeNotOverridden(updated_attributes[attribute], attr_path, template, updated_attributes);
                    }
                    removeOverriddenWithDefaultValues(attr_path, updated_attributes[attribute], updated_attributes, attribute, template);
                }
            }
        }
    };

    getGcDefaultTemplate(gc_type, function(template) {
        removeNotOverridden(updated_attributes, attr_full_path, template);
    });
};

/**
 * Opens the appropriate property editor related to the selected component
 *
 */
DfxGcTemplateBuilder.editProperties = function () {
    var gc_type = 'button';

    $('dfx_visual_editor_property_panel').empty();

};

/**
 * Exits to Studio
 */
DfxGcTemplateBuilder.exitToStudio = function () {
    var wgtName     = DfxGcTemplateBuilder.getWidgetName();
    // remove widget definition from cache
    window.location = '/studio/index.html#!/catalog/widget/' + wgtName + '/';
};

/**
 * Collapse all properties
 */
DfxGcTemplateBuilder.propertyPanelCollapseAll = function () {
    $('.dfx_visual_editor_property_collapsible_btn').each(function () {
        var target = $(this).attr('data-target');
        $(target).removeClass('in');
        $(this).addClass('collapsed');
    });
};

/**
 * Expand all properties
 */
DfxGcTemplateBuilder.propertyPanelExpandAll = function () {
    $('.dfx_visual_editor_property_collapsible_btn').each(function () {
        var target = $(this).attr('data-target');
        $(target).addClass('in');
        $(this).removeClass('collapsed');
    });
};

/**
 * Check if property panel changed
 */
DfxGcTemplateBuilder.isPropertyPanelChanged = function () {
    var panel_status = $('#dfx_visual_editor_property_panel_change').val();
    if (panel_status == 'changed') {
        return true;
    } else {
        return false;
    }
}

/**
 * Set property panel status to 'changed'
 */
DfxGcTemplateBuilder.propertyPanelChanged = function () {
    $('#dfx_visual_editor_property_panel_change').val('changed');
}

/**
 * Initialize property panel status
 */
DfxGcTemplateBuilder.initPropertyPanelChange = function () {
    $('#dfx_visual_editor_property_panel_change').val('');
}

/**
 * Gets the design time full resource path
 */
DfxGcTemplateBuilder.getResourcePath = function (relative_resource_path) {
    if (relative_resource_path.indexOf('/_shared/') == 0) {
        return '/resources/' + $('body').attr('data-tenantid') + relative_resource_path;
    } else {
        return '/resources/' + $('body').attr('data-tenantid') + '/' + $('#dfx_src_widget_editor').attr('data-application-name') + relative_resource_path;
    }
}

/**
 * Loads predefined GC templates to the modal window
 */
DfxGcTemplateBuilder.loadStylesPalette = function (componentPalette) {
    h.getFromServer('/styles_palettes/' + componentPalette + '.json').then(function (data) {
        DfxGcTemplateBuilder.stylesPalette = data;
        DfxGcTemplateBuilder.stylesPalette.fullTypeName = componentPalette;

        StylesPaletteModal.fillModal('styles-palette-modal-window');
    });
};

/**
 * return an array of objects according to key, value
 * @param obj
 * @param key
 * @param val
 * @returns {Array}
 */
function getObjects(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjects(obj[i], key, val));
        } else {
            //if key matches and value matches
            if (i == key && obj[i] == val) { //
                objects.push(obj);
            }
        }
    }
    return objects;
}
/**
 * create style
 * @param title
 * @returns {HTMLElement}
 */
var createSheet = function (title) {
    // Create the <style> tag
    var style = document.createElement("style");
    style.setAttribute('type', 'text/css');
    style.setAttribute('title', title);
    // Add a media (and/or media query) here if you'd like!
    // style.setAttribute("media", "screen")
    // style.setAttribute("media", "only screen and (max-width : 1024px)")

    // WebKit hack :(
    style.appendChild(document.createTextNode(""));

    // Add the <style> element to the page
    document.head.appendChild(style);

    return style;
};
/**
 * append styleContent
 * @param styleContent
 * @returns {*|CssRule[]|CSSRule[]}
 */
var appendCss   = function (styleContent) {
    var styleElement, title = 'dynamicStyleSheet';
    if (!$('[title="' + title + '"]', 'head').length) {
        styleElement = createSheet(title);
    } else {
        styleElement = $('[title="' + title + '"]', 'head')[0];
    }
    styleElement.textContent = styleContent;
    // the style will only be parsed once it is added to a document
    document.head.appendChild(styleElement);

    return styleElement.sheet.cssRules;
};
