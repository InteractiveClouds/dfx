/*
 This notice must be untouched at all times.

 DreamFace DFX - Visual Builder
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

$(document).ready(function () {
    DfxVisualBuilder();
    $(window).resize(function (event) {
        var gc_selected_id = $('.dfx_visual_editor_selected_box').attr('gc-selected-id');
        if (gc_selected_id != null) {
            var element = $('#' + gc_selected_id);
            DfxVisualBuilder.updateSelectedBox(element);
        }
    });
});

var DfxVisualBuilder = function () {
    //window.onbeforeunload = confirmExit;
    //function confirmExit() {
    //    return "You have attempted to leave this page. Are you sure?";
    //}
    //// Keyboard events
    //$(document).keydown(function(event) {
    //    if (event.keyCode == 83) {
    //        $('#saveWidget')[0].click();
    //    }
    //    //event.preventDefault();
    //});
};

DfxVisualBuilder.applicationName   = '';
DfxVisualBuilder.sharedCatalogName = 'dfx-common-components';

/**
 * Toggle the visibility of the visual builder
 */
DfxVisualBuilder.toggleViewSource = function () {
    var is_src_editor_visible = ($('#dfx_src_editor').css('display') == 'block') ? true : false;
    var editor                = $('#dfx_src_editor.CodeMirror')[0].CodeMirror;

    if (is_src_editor_visible) {
        $('#dfx_visual_editor_workspace').empty();
        DfxVisualBuilder.loadComponents(editor.getValue());
        DfxVisualBuilder.initGraphicalControls();
        $('#dfx_visual_editor').css('display', 'block');
        $('#dfx_src_editor').css('display', 'none');
        $('#dfx_visual_editor_view_source_text').text('View Source');
        $('#search-bar').hide();
    } else {
        // update widget description
        var ve_scope = angular.element(document.getElementById('dfx_src_widget_editor')).scope();
        for (var key in ve_scope.gc_instances) {
            var component = angular.copy(ve_scope.gc_instances[key]);
            for (attribute in component.attributes) {
                if (component.attributes[attribute].status!='overridden') {
                    delete component.attributes[attribute];
                }
            }
            var widget_definition = JSON.parse(editor.getValue());
            DfxVisualBuilder.findComponentAndUpdateAttributes(component.id, widget_definition.definition, component.attributes, false);
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
DfxVisualBuilder.init = function () {
    DfxVisualBuilder.applicationName = $('#dfx_src_widget_editor').data('application-name');
    $('#dfx_visual_editor').css('display', 'block');

    $('#dfx_visual_editor_middle #dfx_visual_editor_workspace').click(function (event) {
        event.stopPropagation();

        DfxVisualBuilder.isPropertyPanelChanged();

        $('.dfx_visual_editor_gc_layout_selected_row').removeClass('dfx_visual_editor_gc_layout_selected_row');
        $('.dfx_visual_editor_gc_layout_selected_layout').removeClass('dfx_visual_editor_gc_layout_selected_layout');

        $('.dfx_visual_editor_selected_box').css('display', 'none');
        $('#dfx-ve-property-title-selected-gc').css('display','none');
        $('#dfx-ve-property-title-selected-renderer').css('display', 'none');
        $('#dfx_visual_editor_property_panel').empty();
        $('#dfx_visual_editor_property_panel').append('No selection');
        $('#dfx_visual_editor_widget_property_title').click();

        $('.dfx-ve-gc-handle-selected').css('display', 'none');
    });

    $('#dfx_visual_editor_workspace').scroll(function (event) {
        $('.dfx_visual_editor_highlighted_box').css('display', 'none');
        var gc_selected_id = $('.dfx_visual_editor_selected_box').attr('gc-selected-id');
        if (gc_selected_id != null) {
            var element = $('#' + gc_selected_id);
            DfxVisualBuilder.updateSelectedBox(element);
        }
    });

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
            extraKeys: {
				"Alt-F": "findPersistent",
				"Ctrl-Space": "autocomplete"
			},
            foldGutter: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
        });
    srcEditor.setSize(null, window.innerHeight - 59);
    $(srcEditor.getWrapperElement()).attr("id", "dfx_src_editor");
    $('#dfx_src_editor.CodeMirror').hide();

    // Initialization of dfx_script_editor

    htmlTextArea = document.getElementById('dfx_script_editor');
    var scriptEditor = CodeMirror(function (elt) {
            htmlTextArea.parentNode.replaceChild(elt, htmlTextArea);
        },
        {
            lineNumbers: true,
            value: $('#dfx_script_editor').text(),
            mode: {name: 'javascript', globalVars: true},
            theme: script_theme,
            matchBrackets: true,
            highlightSelectionMatches: {showToken: /\w/},
            styleActiveLine: true,
            viewportMargin : Infinity,
            extraKeys: {
				"Alt-F": "findPersistent",
				"Ctrl-Space": "autocomplete"
			},
            foldGutter: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
        });
    scriptEditor.setSize(null, window.innerHeight - 59);
    $(scriptEditor.getWrapperElement()).attr("id", "dfx_script_editor");
    $('#dfx_script_editor.CodeMirror').hide();

    // Initialization of dfx_styles_editor

    htmlTextArea = document.getElementById('dfx_styles_editor');
    var stylesEditor = CodeMirror(function (elt) {
            htmlTextArea.parentNode.replaceChild(elt, htmlTextArea);
        },
        {
            lineNumbers: true,
            value: $('#dfx_styles_editor').text(),
            mode: {name: 'css', globalVars: true},
            theme: script_theme,
            matchBrackets: true,
            highlightSelectionMatches: {showToken: /\w/},
            styleActiveLine: true,
            viewportMargin : Infinity,
            extraKeys: {
				"Alt-F": "findPersistent",
				"Ctrl-Space": "autocomplete"
			},
            foldGutter: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
        });
    stylesEditor.setSize(null, window.innerHeight - 59);
    $(stylesEditor.getWrapperElement()).attr("id", "dfx_styles_editor");
    $('#dfx_styles_editor.CodeMirror').hide();

    DfxVisualBuilder.initWorkspace();
    DfxVisualBuilder.initGraphicalControls();
    angular.element(document).ready(function () {
        DfxVisualBuilder.loadComponents(srcEditor.getValue());
        DfxVisualBuilder.widgetChanged();
    });



    /*var initEverything = function () {
        gc_factory.initializeControls();
        DfxVisualBuilder.initWorkspace();
        DfxVisualBuilder.loadComponents(editor.getValue());
        DfxVisualBuilder.initGraphicalControls();

        editor.on("change", function (e) {
            DfxVisualBuilder.widgetChanged(e);
        });
        editor_styles.on("change", function (e) {
            DfxVisualBuilder.widgetChanged(e);
        });
        editor_script.on("change", function (e) {
            DfxVisualBuilder.widgetChanged(e);
        });
    };

    if (gc_factory) {
        initEverything();
    } else {
        $(document).on('gc_factory_ready bc_factory_ready', function () {
            console.log('gc_factory_ready and bc_factory_ready handler'); // do NOT remove this line!
            if (bc_factory) {
                initEverything();
            }
        });
    }*/
};

/**
 * Initializes the workspace
 */
DfxVisualBuilder.initWorkspace = function () {
    var $dfx_visual_editor  = $('#dfx_visual_editor'),
        platform            = $dfx_visual_editor.attr('platform'),
        widget_preview_link = $('#dfx_visual_editor_widget_preview'),
        applicationName     = $('#dfx_src_widget_editor').attr('data-application-name') || DfxVisualBuilder.sharedCatalogName,
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
            // add device name to the 'preview' link
            path = '/studio/widget/' + wgtName + '/preview-auth/' + applicationName + '/' + wgtName + '/' + platform + '/' + device;
            widget_preview_link.attr('href', path);
        });
    } else {
        device = 'desktop';
    }
    path = '/studio/widget/' + wgtName + '/preview-auth/' + applicationName + '/' + wgtName + '/' + platform + '/' + device;

    // if this is shared catalog widget, skip the authorization
    if (applicationName == DfxVisualBuilder.sharedCatalogName) {
        path = '/studio/_previewlogin?redirect=' +
            encodeURIComponent([
                '',
                'studio',
                'widget',
                platform,
                'preview',
                applicationName,
                wgtName,
                device
            ].join('/'))
    }
    widget_preview_link.attr('href', path);
};

/**
 * Initializes the graphical controls into the visual builder
 */
DfxVisualBuilder.initGraphicalControls = function () {

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

    /*$('.dfx_visual_editor_droppable').sortable({
        appendTo:         "body",
        cursor:           "move",
        cursorAt:         {top: 15, left: 40},
        placeholder:      'ui-placeholder',
        refreshPositions: true,
        connectWith:      ".dfx_visual_editor_droppable",
        beforeStop:       function (event, ui) {
            var gc_id   = null,
                gc_type = $(ui.item).attr('gc-type');
            if ($(ui.item).hasClass('dfx_visual_editor_gc_cat_item_draggable')) {
                gc_id  = Math.floor(Math.random() * 100000);
                var gc = gc_factory.renderDesign(gc_type, {id: gc_id}, true);
                $(ui.item).replaceWith(gc.fragment);
                DfxVisualBuilder.dropComponent(gc_id, this);
                if (gc.callback) {
                    gc.callback(gc);
                }
            } else {
                console.log(ui.item);
                gc_id = $(ui.item).attr('id');
                DfxVisualBuilder.moveComponent(gc_id, this);
            }
        },
        receive:          function (event, ui) {
            var gc_id   = $(ui.item).attr('id'),
                gc_type = $(ui.item).attr('gc-type');

            // refresh the chart when dropped
            if (gc_type == 'chart') {
                var attributes = gc_factory.getPropertiesFromPanel(gc_web_chart.attributeDefinition);
                dfxChartsPrivateApi.refreshChartModels(gc_id, attributes);
            }
        },
        start:            function (event, ui) {
            $('.dfx_visual_editor_selected_box').css('display', 'none');
            $(ui.placeholder).html('<div style="border:3px #00c3f3 dashed;min-width:50px;height:30px;"></div>');
        },
        helper:           function (event) {
            var gc_target       = $(event.target).closest('[gc-role=control]')[0];
            var gc_type         = $(gc_target).attr('gc-type');
            var helper_fragment = '<div style="border:1px #333 solid; height:24px; width:80px; background: #00c3f3; color: #fff" class="text-center">' + gc_type + '</div>';
            return helper_fragment;
        }
    });

    DfxVisualBuilder.registerSelectableItems();*/

};

DfxVisualBuilder.updateSelectedBox = function (component) {
    //console.log('component', component);
    var left   = $(component).offset().left;
    var top    = $(component).offset().top - 98 - 23;
    var width  = $(component).outerWidth() - 2;
    var height = $(component).outerHeight() - 2;
    $('.dfx_visual_editor_selected_box').css('left', left);
    $('.dfx_visual_editor_selected_box').css('top', top);
    $('.dfx_visual_editor_selected_box').width(width);
    $('.dfx_visual_editor_selected_box').height(height);
};

DfxVisualBuilder.registerSelectableItems = function () {
    $('[gc-role|=control]').hover(function () {
        var left   = $(this).offset().left;
        var top    = $(this).offset().top - 98 - 23;
        var width  = $(this).outerWidth();
        var height = $(this).outerHeight();
        $('.dfx_visual_editor_highlighted_box').css('left', left);
        $('.dfx_visual_editor_highlighted_box').css('top', top);
        $('.dfx_visual_editor_highlighted_box').width(width - 1);
        $('.dfx_visual_editor_highlighted_box').height(height - 1);
        $('.dfx_visual_editor_highlighted_box').css('display', 'block');
    }, function () {
        $('.dfx_visual_editor_highlighted_box').css('display', 'none');
    });

    $('[gc-role|=control]').click(function (event) {
        event.stopImmediatePropagation();
        if (!$(this).hasClass('dfx_visual_editor_selected_box')) {
            var gc_role        = $(this).attr('gc-role');
            var left           = $(this).offset().left;
            var top            = $(this).offset().top - 98 - 23;
            var width          = $(this).outerWidth() - 2;
            var height         = $(this).outerHeight() - 2;
            var gc_type        = $(this).attr('gc-type');
            var gc_selected_id = $(this).attr('id');

            $('.dfx_visual_editor_gc_layout_selected_row').removeClass('dfx_visual_editor_gc_layout_selected_row');
            $('.dfx_visual_editor_gc_layout_selected_layout').removeClass('dfx_visual_editor_gc_layout_selected_layout');

            $('.dfx_visual_editor_selected_box').css('left', left);
            $('.dfx_visual_editor_selected_box').css('top', top);
            $('.dfx_visual_editor_selected_box').width(width);
            $('.dfx_visual_editor_selected_box').height(height);
            $('.dfx_visual_editor_selected_box').css('display', 'block');
            $('.dfx_visual_editor_selected_box').attr('gc-type', gc_type);
            $('.dfx_visual_editor_selected_box').attr('gc-role', gc_role);
            if (gc_role == 'control-child') {
                var gc_control_id = $(this).attr('gc-control-id');
                $('.dfx_visual_editor_selected_box').attr('gc-control-id', gc_control_id);
            }
            $('.dfx_visual_editor_selected_box').attr('gc-selected-id', gc_selected_id);

            if (gc_type == 'layout-column') {
                $(this).closest('[gc-type=layout-row]').addClass('dfx_visual_editor_gc_layout_selected_row');
                $(this).closest('[gc-type=layout]').addClass('dfx_visual_editor_gc_layout_selected_layout');
            } else if (gc_type == 'layout-row') {
                $(this).closest('[gc-type=layout]').addClass('dfx_visual_editor_gc_layout_selected_layout');
            }
        }
        DfxVisualBuilder.loadPropertyPanel();
    });
};

DfxVisualBuilder.loadPropertyPanel = function () {
    /*var gc_role        = $('.dfx_visual_editor_selected_box').attr('gc-role');
    var gc_type        = $('.dfx_visual_editor_selected_box').attr('gc-type');
    var gc_selected_id = $('.dfx_visual_editor_selected_box').attr('gc-selected-id');
    if (!$('#dfx_visual_editor_property_panel').hasClass('in')) {
        $('#dfx_visual_editor_property_title').click();
    }
    if (gc_role == 'control-child') {
        var gc_control_id = $('.dfx_visual_editor_selected_box').attr('gc-control-id');
        gc_factory.loadPropertyPanel(gc_type, gc_control_id, gc_selected_id);
    } else {
        gc_factory.loadPropertyPanel(gc_type, gc_selected_id);
    }*/



};

/**
 * Loads the components
 */
DfxVisualBuilder.loadComponents = function (src_definition) {
    var cached_widget = window.localStorage.getItem(DfxVisualBuilder.getCachedWidgetName());

    var setSrcInEditor    = function (src_to_editor) {
        var editor = $('#dfx_src_editor.CodeMirror')[0].CodeMirror;
        editor.setValue(src_to_editor);
        editor.scrollTo(0, 0);
        editor.refresh();
    };
    var setScriptInEditor = function (script_to_editor) {
        var editor_script = $('#dfx_script_editor.CodeMirror')[0].CodeMirror;
        if (script_to_editor) {
            editor_script.setValue(script_to_editor);
        }
    };
    var setStylesInEditor = function (styles_to_editor) {
        var editor_styles = $('#dfx_styles_editor.CodeMirror')[0].CodeMirror;
        if (styles_to_editor) {
            editor_styles.setValue(styles_to_editor);
        }
        /*var style = editor_styles.getValue();
        if (style !== '') {
            appendCss(style);
        }*/
    };

    try {
        var src = (src_definition && src_definition != '') ? JSON.parse(src_definition) :
            DfxStudio.getWidgetDefaultDefinition().src_definition;

        var cached_script = null;
        var cached_styles = null;

        setSrcInEditor(JSON.stringify(src, null, '\t'));

        //DfxVisualBuilder.setWidgetProperties(src.properties);
        setStylesInEditor(cached_styles);
        angular.element(document).ready(function () {
            DfxVisualBuilder.loadCards(src.definition);
            DfxVisualBuilder.addComponents(src.definition, null, 'default');
        });
        //setScriptInEditor(cached_script);
    } catch (err) {
        console.error('DFX error: widget definition is corrupted');
        console.error(err.message);

        if (cached_widget && cached_widget.src) {
            setSrcInEditor(cached_widget.src);
            setScriptInEditor(cached_widget.src_script);
            setStylesInEditor(cached_widget.src_styles);
        } else if (src_definition && src_definition != '') {
            setSrcInEditor(src_definition);
            setStylesInEditor();
        }
    }
};

/**
 * Gets the name of the widget currently open in widget builder
 */
DfxVisualBuilder.getWidgetName = function () {
    return $('#dfx_src_widget_editor_title').attr('widget-name');
};

/**
 * Gets the cached name of the widget currently open in widget builder - with a special prefix for cache
 */
DfxVisualBuilder.getCachedWidgetName = function () {
    return 'dfx_' + DfxVisualBuilder.getWidgetName();
};

/**
 * Gets the controller name of the widget currently open in widget builder
 */
DfxVisualBuilder.getWidgetControllerName = function (attributes, new_widget_name) {
    if (attributes && attributes.controller && attributes.controller.value) {
        return attributes.controller.value;
    } else {
        if (new_widget_name) {
            return new_widget_name + "Controller";
        } else {
            return DfxVisualBuilder.getWidgetName() + "Controller";
        }
    }
};

/**
 * Gets the form name of the widget currently open in widget builder
 */
DfxVisualBuilder.getWidgetFormName = function (attributes, new_widget_name) {
    if (attributes && attributes.form && attributes.form.value) {
        return attributes.form.value;
    } else {
        if (new_widget_name) {
            return new_widget_name + "Form";
        } else {
            return DfxVisualBuilder.getWidgetName() + "Form";
        }
    }
};

/**
 * Set Widget Properties
 *
 * @param {properties} An object containing all widget properties
 */
DfxVisualBuilder.setWidgetProperties = function (properties) {
    $('#dfx_visual_editor_widget_title').val(properties.title.label);
    if (properties.title.visible) {
        $('#dfx_visual_editor_widget_title_visible').attr('checked', 'true');
    } else {
        $('#dfx_visual_editor_widget_title_visible').removeAttr('checked');
    }
    if (properties.tools.color) {
        $('#dfx_visual_editor_widget_toolbar_color').attr('checked', 'true');
    } else {
        $('#dfx_visual_editor_widget_toolbar_color').removeAttr('checked');
    }
    if (properties.tools.edit) {
        $('#dfx_visual_editor_widget_toolbar_edit').attr('checked', 'true');
    } else {
        $('#dfx_visual_editor_widget_toolbar_edit').removeAttr('checked');
    }
    if (properties.tools.collapse) {
        $('#dfx_visual_editor_widget_toolbar_collapse').attr('checked', 'true');
    } else {
        $('#dfx_visual_editor_widget_toolbar_collapse').removeAttr('checked');
    }
    if (properties.tools.fullscreen) {
        $('#dfx_visual_editor_widget_toolbar_fullscreen').attr('checked', 'true');
    } else {
        $('#dfx_visual_editor_widget_toolbar_fullscreen').removeAttr('checked');
    }
    if (properties.tools.delete) {
        $('#dfx_visual_editor_widget_toolbar_delete').attr('checked', 'true');
    } else {
        $('#dfx_visual_editor_widget_toolbar_delete ').removeAttr('checked');
    }
    if (properties.sortable) {
        $('#dfx_visual_editor_widget_sortable').attr('checked', 'true');
    } else {
        $('#dfx_visual_editor_widget_sortable ').removeAttr('checked');
    }
};

/**
 * Save Widget Properties
 *
 * @param {properties} An object containing all widget properties
 */
DfxVisualBuilder.savePropertyWidget = function () {
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

DfxVisualBuilder.loadCards = function (components) {
    var ve_scope = angular.element(document.getElementById('dfx_src_widget_editor')).scope();
    ve_scope.loadCards(components);
};

/**
 * Loop over the definition and add each graphical control
 *
 * @param {components} An array containing the list of components to be added
 */
DfxVisualBuilder.addComponents = function (components, container_component) {

    var ve_scope = angular.element(document.getElementById('dfx_src_widget_editor')).scope();
    ve_scope.addComponents(components, null, 'default');

};

/**
 * Drops a graphical control in a container
 *
 * @param {component_id} the dragged graphical control element ID
 * @param {container_component} the container in which the new component will be added
 */
DfxVisualBuilder.dropComponent = function (component_id, container_component, component_definition) {
    /*var ve_scope = angular.element(document.getElementById('dfx_src_widget_editor')).scope();

    var container_id = $(container_component).attr('gc-container');
    var parent_id    = $(container_component).attr('gc-parent');
    var gc_type      = $('#' + component_id).attr('gc-type');

    */

    //DfxVisualBuilder.initGraphicalControls();
};

/**
 * Moves a component from one container to another
 *
 * @param {component_id} the dragged graphical control id
 * @param {from_container_component} the container from which the component is dragged
 */
DfxVisualBuilder.moveComponent = function (component_id, from_container_component, card) {
    var component_definition;

    var from_parent_id  = $(from_container_component).attr('gc-parent');
    var to_parent_id    = $('#' + component_id).parent().closest('[gc-role=control]').attr('id');
    var gc_container_id = $('#' + component_id).parent().closest('[gc-container]').attr('gc-container');

    var editor         = $('#dfx_src_editor.CodeMirror')[0].CodeMirror;
    var wgt_definition = JSON.parse(editor.getValue());

    component_definition           = DfxVisualBuilder.findParentAndRemoveComponent(component_id, from_parent_id, wgt_definition.definition, card, false);
    component_definition.container = gc_container_id;
    DfxVisualBuilder.findParentAndAddComponent(component_id, to_parent_id, component_definition, wgt_definition.definition, card, false);

    if (component_definition) {
        editor.setValue(JSON.stringify(wgt_definition, null, '\t'));
        //editor.gotoLine(1);
    }
};

/** 
 * Moves a component from the removed container column/row to the first column/row
 */
DfxVisualBuilder.moveComponentFromRemovedLayout = function (component_id, card, container_id, to_layout_id) {
    var component_definition;

    var to_parent_id               = $('#' + component_id).parent().closest('[gc-role=control]').attr('id');

    var editor                     = $('#dfx_src_editor.CodeMirror')[0].CodeMirror;
    var wgt_definition             = JSON.parse(editor.getValue());

    component_definition           = DfxVisualBuilder.findParentAndRemoveComponent(component_id, container_id, wgt_definition.definition, card, false);
    component_definition.container = to_layout_id;
    DfxVisualBuilder.findParentAndAddComponent(component_id, to_parent_id, component_definition, wgt_definition.definition, card, false, true);

    if (component_definition) {
        editor.setValue(JSON.stringify(wgt_definition, null, '\t')); 

        var gc_container_fake_definition = {id: container_id};
        var ve_scope                     = angular.element(document.getElementById('dfx_src_widget_editor')).scope();
        ve_scope.addComponent(component_definition, gc_container_fake_definition, card);
    }
};

/** 
 * Reindexing layout child components
 */
DfxVisualBuilder.reindexLayoutChildComponents = function (removed_row_index, removed_column_index, removed_layout_id, parent_definition, card, found_it) {
    var container_definition = (card!=null) ? parent_definition[card] : parent_definition;

    var getLayoutRowColumnIndex = function (container) {
        var rowIndexPosition = container.indexOf('_row_');
        var columnIndexPosition = container.indexOf('_column_');

        var rowIndexValue = container.substring(rowIndexPosition + 5, columnIndexPosition);
        var columnIndexValue = container.substring(columnIndexPosition + 8);

        return {row_index: parseInt(rowIndexValue), column_index: parseInt(columnIndexValue)};
    };

    var replaceLayoutRowColumnIndex = function (component, newIndex) {
        var container = component.container;
        var rowIndexPosition = container.indexOf('_row_');
        var columnIndexPosition = container.indexOf('_column_');

        if (newIndex.new_row_index || newIndex.new_row_index === 0) {
            component.container = container.substring(0, rowIndexPosition + 5) +
                newIndex.new_row_index +
                container.substring(columnIndexPosition);
        }
        if (newIndex.new_column_index || newIndex.new_column_index === 0) {
            component.container = container.substring(0, columnIndexPosition + 8) +
                newIndex.new_column_index;
        }
    };

    if (!found_it) {
        for (var i = 0; i < container_definition.length; i++) {
            var next_layout = container_definition[i];
            if (next_layout.id == removed_layout_id) {
                found_it = true;
                for (var j = 0; j < next_layout.children.length; j++) {
                    var next_layout_child = next_layout.children[j];
                    if (next_layout_child) {
                        var child_index = getLayoutRowColumnIndex(next_layout_child.container);

                        if (removed_column_index !== null && child_index.column_index > removed_column_index && child_index.row_index == removed_row_index) {
                            replaceLayoutRowColumnIndex(next_layout_child, {new_column_index: child_index.column_index - 1});
                        }

                        if (removed_column_index === null && child_index.row_index > removed_row_index) {
                            replaceLayoutRowColumnIndex(next_layout_child, {new_row_index: child_index.row_index - 1});
                        }
                    }
                }

                break;
            } else {
                DfxVisualBuilder.reindexLayoutChildComponents(removed_row_index, removed_column_index, removed_layout_id, container_definition[i].children, null, found_it);
            }
        }
    }
};

/** 
 * Pastes a component to the selected container
 */
DfxVisualBuilder.pasteComponent = function (component_to_paste_definition, current_selected_component, card, do_not_reset_ids) {
    var container_definition = DfxVisualBuilder.movingComponentHelper.getTargetContainerDefinition(component_to_paste_definition, current_selected_component);

    if (container_definition) {
        if (! do_not_reset_ids) {
            DfxVisualBuilder.movingComponentHelper.setComponentsNewIdsAndNames(component_to_paste_definition, card, DfxVisualBuilder.movingComponentHelper.getViewDefinition());
        }

        DfxVisualBuilder.movingComponentHelper.addComponentToDefinition(component_to_paste_definition, container_definition, card, true);

        DfxVisualBuilder.movingComponentHelper.addComponentToScope(component_to_paste_definition, container_definition, card);
    }
};

DfxVisualBuilder.movingComponentHelper = (function () {
    var api = {};

    api.getLayoutRowColumnIndex = function (container) {
        var row_index_position = container.indexOf('_row_');
        var column_index_position = container.indexOf('_column_');

        var row_index_value = container.substring(row_index_position + 5, column_index_position);
        var column_index_value = container.substring(column_index_position + 8);

        return {row_index: parseInt(row_index_value), column_index: parseInt(column_index_value)};
    };

    api.containerHasRowColumn = function (container_definition, row_column_index) {
        if (container_definition.type == 'tabs' || container_definition.type == 'wizard') return false;

        var row_definition = container_definition.attributes.layout.rows[row_column_index.row_index];
        if (row_definition) {
            if (row_definition.cols[row_column_index.column_index]) {
                return true;
            }
        }
        return false;
    };

    api.replaceLayoutIndex = function (component_definition, new_index) {
        if (! component_definition.container) {// root panel does not have container
            component_definition.container = 'layout_0_row_0_column_0';
            return;
        }

        var row_index_position = component_definition.container.indexOf('_row_');
        component_definition.container = 'layout_' + parseInt(new_index) + component_definition.container.substring(row_index_position);
    };

    api.replaceLayoutRowColumnIndex = function (component_definition) {
        var row_index_position = component_definition.container.indexOf('_row_');
        component_definition.container = component_definition.container.substring(0, row_index_position) + '_row_0_column_0';
    };

    api.getViewDefinition = function () {
        var editor = $('#dfx_src_editor.CodeMirror')[0].CodeMirror;
        return JSON.parse(editor.getValue());
    };

    api.removeDefaultAttributes = function (component_definition) {
        for (var attribute in component_definition.attributes) {
            if (component_definition.attributes[attribute].status!='overridden') {
                delete component_definition.attributes[attribute];
            }
        }
    };

    api.changeTabOrWizardStepIndex = function (component_definition, container_definition) {
        var index_value = 0;

        if (container_definition.type == 'tabs') {
            index_value = container_definition.attributes.tabIndex ? container_definition.attributes.tabIndex.value : index_value;
        } else if (container_definition.type == 'wizard') {
            index_value = container_definition.attributes.stepIndex ? container_definition.attributes.stepIndex.value : index_value;
        }

        api.replaceLayoutIndex(component_definition, index_value);
    };

    api.changeRowColumnIndex = function (component_definition, container_definition) {
        var row_column_index = api.getLayoutRowColumnIndex(component_definition.container);
        var row_column_exists = api.containerHasRowColumn(container_definition, row_column_index);
        if (! row_column_exists) {
            api.replaceLayoutRowColumnIndex(component_definition);
        }
    };

    api.setComponentsNewIdsAndNames = function (component_definition, card, wgt_definition) {
        var platform = $('#dfx_visual_editor').attr('platform');
        component_definition.id = Math.floor(Math.random() * 100000);

        for (var i = 0; i < component_definition.children.length; i++) {
            DfxVisualBuilder.setNewComponentName(component_definition.children[i], wgt_definition, card, platform);
            api.setComponentsNewIdsAndNames(component_definition.children[i], card, wgt_definition);
        }
    };

    api.addComponentToDefinition = function (component_definition, container_definition, card, add_component_to_end) {
        var editor = $('#dfx_src_editor.CodeMirror')[0].CodeMirror;
        var wgt_definition = JSON.parse(editor.getValue());

        api.removeDefaultAttributes(component_definition);
        api.changeTabOrWizardStepIndex(component_definition, container_definition);
        api.changeRowColumnIndex(component_definition, container_definition);

        DfxVisualBuilder.findParentAndAddComponent(component_definition.id, container_definition.id, component_definition, wgt_definition.definition, card, false, add_component_to_end);
        editor.setValue(JSON.stringify(wgt_definition, null, '\t'));
    };

    api.replaceComponentInDefinition = function (component_new_definition, card) {
        var component_id = component_new_definition.id,
            found_it = false;

        var doReplace = function (parent_definition, card) {
            var ref_definition = (card !== null) ? parent_definition[card] : parent_definition;

            for (var idx = 0; idx < ref_definition.length; idx++) {
                if (found_it) break;

                if (ref_definition[idx].id == component_id) {
                    ref_definition[idx] = component_new_definition;
                    found_it = true;
                } else {
                    doReplace(ref_definition[idx].children, null);
                }
            }
        };

        var editor = $('#dfx_src_editor.CodeMirror')[0].CodeMirror;
        var view_definition = JSON.parse(editor.getValue());

        doReplace(view_definition.definition, card);
        editor.setValue(JSON.stringify(view_definition, null, '\t'));
    };

    api.addComponentToScope = function(component_definition, container_definition, card) {
        var ve_scope = angular.element(document.getElementById('dfx_src_widget_editor')).scope();
        ve_scope.addComponent(component_definition, container_definition, card);
    };

    api.isContainer = function(component_definition) {
        var attributes = component_definition.attributes;
        var is_container = attributes.layout || attributes.steps || attributes.tabs ? true : false;
        return is_container;
    };

    api.getComponentContainerDefinition = function(component_definition) {
        var parent_id = $('#' + component_definition.id).closest('[gc-parent]').attr('gc-parent');
        var container_definition = DfxVisualBuilder.getComponentDefinition(parent_id, api.getViewDefinition().definition);
        return container_definition;
    };

    api.getTargetContainerDefinition = function(component_to_paste_definition, current_selected_component) {
        if ( api.isContainer(current_selected_component) ) {
            if (current_selected_component.id !== component_to_paste_definition.id) {
                return current_selected_component;
            } else {
                return api.getComponentContainerDefinition(current_selected_component);
            }
        } else {
            return api.getComponentContainerDefinition(current_selected_component);
        }
    };

    return api;
}());

/**
 * Duplicates a component
 */
DfxVisualBuilder.duplicateComponent = function (component_id, card) {
    // find component definition
    var gc_selected_id = $('.dfx_visual_editor_selected_box').attr('gc-selected-id');
    var parent_id      = $('#' + component_id).closest('[gc-parent]').attr('gc-parent');
    var platform       = $('#dfx_visual_editor').attr('platform');
    var editor         = $('#dfx_src_editor.CodeMirror')[0].CodeMirror;

    var cardPanelId = $($('#dfx_visual_editor_workspace_' + card).children()[0]).attr('id');

    var ve_scope = angular.element(document.getElementById('dfx_src_widget_editor')).scope();

    ve_scope.updateAttributes();

    var wgt_definition = JSON.parse(editor.getValue());
    var component_definition = DfxVisualBuilder.getComponentDefinition(component_id, wgt_definition.definition);
    if (!component_definition) return;

    // create another name and id
    var setNewIdAndName = function (comp_def, card) {
        comp_def.id = Math.floor(Math.random() * 100000);
        for (var i = 0; i < comp_def.children.length; i++) {
            DfxVisualBuilder.setNewComponentName(comp_def.children[i], wgt_definition, card, platform);
            setNewIdAndName(comp_def.children[i], card);
        }
    };
    setNewIdAndName(component_definition, card);

    /*ve_scope.*/
    var gc_type = $('#'+ component_id).attr('gc-type');
    var gc_flex = $('#'+ component_id).attr('gc-flex');
    var view_editor = document.querySelector('#dfx_src_widget_editor');
    var gc = ve_scope.renderGraphicalControl(component_definition);
    $('#'+ component_id).after(gc.fragment);

    // reload widget
    /*$('#dfx_visual_editor_workspace_' + card).empty();*/
    /*DfxVisualBuilder.loadComponents(editor.getValue());*/
    DfxVisualBuilder.initGraphicalControls();

    // insert new component in the widget definition
    DfxVisualBuilder.__addComponentToDefinition(component_definition.id, parent_id, component_definition, card);
};

DfxVisualBuilder.__addComponentToDefinition = function (component_id, parent_id, component_definition, card) {
    var platform       = $('#dfx_visual_editor').attr('platform');
    var editor         = $('#dfx_src_editor.CodeMirror')[0].CodeMirror;
    var wgt_definition = JSON.parse(editor.getValue());
    DfxVisualBuilder.setNewComponentName(component_definition, wgt_definition, card, platform);// set component name

    var component_definition_copy = angular.copy(component_definition);

    for (attribute in component_definition_copy.attributes) {
        if (component_definition_copy.attributes[attribute].status!='overridden') {
            delete component_definition_copy.attributes[attribute];
        }
    }

    DfxVisualBuilder.findParentAndAddComponent(component_id, parent_id, component_definition_copy, wgt_definition.definition, card, false);
    editor.setValue(JSON.stringify(wgt_definition, null, '\t'));
    //editor.gotoLine(1);
};

/**
 * Gets Visual Editor scope from HTML page
 *
 */
DfxVisualBuilder.getVeScopeFromHtml = function () {
    return angular.element(document.getElementById('dfx_src_widget_editor')).scope();
};

/**
 * Removes a component
 *
 */
DfxVisualBuilder.removeComponent = function (component_id) {
    var ve_scope = DfxVisualBuilder.getVeScopeFromHtml();
    ve_scope.removeComponent(component_id);
};

DfxVisualBuilder.removeComponentConfirmed = function (component_id, card) {
    var editor         = $('#dfx_src_editor.CodeMirror')[0].CodeMirror;
    var wgt_definition = JSON.parse(editor.getValue());

    var parent_id = $('#'+component_id).closest('[gc-parent]').attr('gc-parent');

    if (parent_id) {
        $('#'+component_id).remove();

        DfxVisualBuilder.findParentAndRemoveComponent(component_id, parent_id, wgt_definition.definition, card, false);
        editor.setValue(JSON.stringify(wgt_definition, null, '\t'));
        //editor.gotoLine(1);
        $('#dfx_visual_editor_middle #dfx_visual_editor_workspace').click();

        // hide property panel of removed component
        var ve_scope = DfxVisualBuilder.getVeScopeFromHtml();
        ve_scope.unselectComponent();
    }

};

/**
 * Adds a component to the widget definition
 *
 * @param {component_id} the component id
 * @param {parent_id} the paret component id
 * @param {component_definition} the component object definition to be added
 */
DfxVisualBuilder.addComponentToDefinition = function (component_id, parent_id, component_definition, card) {
    var platform       = $('#dfx_visual_editor').attr('platform');
    var editor         = $('#dfx_src_editor.CodeMirror')[0].CodeMirror;
    var wgt_definition = JSON.parse(editor.getValue());
    DfxVisualBuilder.setNewComponentName(component_definition, wgt_definition, card, platform);// set component name

    var component_definition_copy = angular.copy(component_definition);

    for (attribute in component_definition_copy.attributes) {
        if (component_definition_copy.attributes[attribute].status!='overridden') {
            delete component_definition_copy.attributes[attribute];
        }
    }

    DfxVisualBuilder.findParentAndAddComponent(component_id, parent_id, component_definition_copy, wgt_definition.definition, card);
    editor.setValue(JSON.stringify(wgt_definition, null, '\t'));
    //editor.gotoLine(1);
};

/**
 * Generates and sets a name to the new component definition.
 *
 * @param {component_definition} the component object definition
 * @param {wgt_definition} the widget definition
 */
DfxVisualBuilder.setNewComponentName = function (component_definition, wgt_definition, card, platform) {
    var ve_scope = angular.element(document.getElementById('dfx_src_widget_editor')).scope();
    var found_it = false;
    var needType       = (wgt_definition.definition[card].length) ?
        getObjects(wgt_definition.definition[card], 'type', component_definition.type) :
        false;
    var needTypeLength = 1, matchNumber, arrNumberType = [];

    for (var i = 0, lenType = needType.length; i < lenType; i++) {
        if (needType[i].attributes && needType[i].attributes.name) {
            matchNumber = needType[i].attributes.name.value.match(/(\d+)/);
            if (matchNumber) {
                arrNumberType.push(matchNumber[1]);
            }
        }
    }
    if (arrNumberType.length) {
        needTypeLength = Math.max.apply(Math, arrNumberType) + 1;
    }
    if (component_definition.attributes.name && component_definition.attributes.name.value) {
        // get the GC default name
        for (var cat in ve_scope.palette) {
            for (var gc in ve_scope.palette[cat]) {
                if (gc==component_definition.type) {
                    var gc_comp = ve_scope.palette[cat][gc];
                    component_definition.attributes.name.value = gc_comp.default_name;
                    component_definition.attributes.name.status = 'overridden';
                    found_it = true;
                    break;
                }
            }
            if (found_it) {
                break;
            }
        }

        // add index to the GC default name

        component_definition.attributes.name.value = component_definition.attributes.name.value + needTypeLength;

        //component_definition.attributes.name.value = 'gc' + needTypeLength;
    }
};

/**
 * Finds a parent definition and adds the component
 *
 * @param {component_id} the component id
 * @param {parent_id} the paret component id
 * @param {component_definition} the component object definition to be added to the parent
 * @param {parent_definition} the parent definition
 * @param {found_it} specifies if the parent has been found in the recursive loop
 * @param {add_component_to_end} specifies if component has to be added at the end of layout
 */
DfxVisualBuilder.findParentAndAddComponent = function (component_id, parent_id, component_definition, parent_definition, card, found_it, add_component_to_end) {
    var idx = 0, child_idx = 0;
    var ref_definition = (card!=null) ? parent_definition[card] : parent_definition;
    if (!found_it) {
        for (idx = 0; idx < ref_definition.length; idx++) {
            if (ref_definition[idx].id == parent_id) {
                found_it                        = true;
                var child_index_position        = $('#' + component_id).index();
                var child_index_position_offset = 0;
                for (child_idx = 0; child_idx < ref_definition[idx].children.length; child_idx++) {
                    if (ref_definition[idx].children[child_idx].container == component_definition.container) {
                        if (child_index_position_offset == child_index_position) {
                            break;
                        } else {
                            child_index_position_offset++;
                        }
                    }
                }
                if (add_component_to_end) {
                    ref_definition[idx].children.push(component_definition);
                } else {
                    ref_definition[idx].children.splice(child_idx, 0, component_definition);
                }
                break;
            } else {
                DfxVisualBuilder.findParentAndAddComponent(component_id, parent_id, component_definition, ref_definition[idx].children, null, found_it, add_component_to_end);
            }
        }
    }
};

/**
 * Finds a parent definition and removes the component
 *
 * @param {component_id} the component id
 * @param {parent_id} the parent component id
 * @param {parent_definition} the parent definition
 * @param {found_it} specifies if the parent has been found in the recursive loop
 * @return {component_definition} the component object definition to be removed from its parent
 */
DfxVisualBuilder.findParentAndRemoveComponent = function (component_id, parent_id, parent_definition, card, found_it) {
    var idx                  = 0, idx_child = 0;
    var component_definition = null;
    var ref_parent_definition = (card!=null) ? parent_definition[card] : parent_definition;
    if (!found_it) {
        for (idx = 0; idx < ref_parent_definition.length; idx++) {
            if (ref_parent_definition[idx].id == parent_id) {
                found_it = true;
                for (idx_child = 0; idx_child < ref_parent_definition[idx].children.length; idx_child++) {
                    if (ref_parent_definition[idx].children[idx_child].id == component_id) {
                        component_definition = ref_parent_definition[idx].children[idx_child];
                        ref_parent_definition[idx].children.splice(idx_child, 1);
                        break;
                    }
                }
                break;
            } else {
                component_definition = DfxVisualBuilder.findParentAndRemoveComponent(component_id, parent_id, ref_parent_definition[idx].children, null, found_it);
            }
        }
    }
    return component_definition;
};

/**
 * Finds a child control component and removes it from the component
 *
 * @param {component_id} the component id
 * @param {component_attribute} the component attribute name containing the child component
 * @param {child_index} the child component index
 * @param {parent_definition} the parent definition
 * @param {found_it} specifies if the parent has been found in the recursive loop
 * @return {component_definition} the component object definition to be removed from its parent
 */
DfxVisualBuilder.findChildComponentAndRemoveComponent = function (component_id, component_attribute, child_index, parent_definition, found_it) {
    var idx = 0, updated_component_attribute = null;
    if (!found_it) {
        for (idx = 0; idx < parent_definition.length; idx++) {
            if (parent_definition[idx].id == component_id) {
                found_it                    = true;
                parent_definition[idx].attributes[component_attribute].splice(child_index, 1);
                updated_component_attribute = parent_definition[idx];
                break;
            } else {
                updated_component_attribute = DfxVisualBuilder.findChildComponentAndRemoveComponent(component_id, component_attribute, child_index, parent_definition[idx].children, found_it);
            }
        }
    }
    return updated_component_attribute;
};

/**
 * Gets a reference of the component from the widget definition
 *
 * @param {component_id} the component id
 * @param {parent_definition} the parent definition
 * @return {component_definition} the component JSON definition
 */
DfxVisualBuilder.getComponentDefinition = function (component_id, parent_definition) {
    var component_definition = null, found = [];
    found                    = getObjects(parent_definition, 'id', component_id);
    if (found.length) {
        component_definition = found[0]
    }
    /*
     var idx= 0, idx_child= 0, found_it=false;
     for (idx=0; idx<parent_definition.length; idx++) {
     if (parent_definition[idx].id==component_id) {
     found_it = true;
     component_definition = parent_definition[idx];
     } else {
     for (idx_child = 0; idx_child < parent_definition[idx].children.length; idx_child++) {
     if (parent_definition[idx].children[idx_child].id == component_id) {
     found_it = true;
     component_definition = parent_definition[idx].children[idx_child];
     break;
     }
     }
     }
     if (found_it)
     break;
     }
     */
    return component_definition;
};

/**
 * Finds the component by its id and update its attributes
 *
 * @param {component_id} the component id
 * @param {parent_definition} the parent definition
 * @param {found_it} specifies if the parent has been found in the recursive loop
 * @param {updated_attributes} the updated component attributes
 */
DfxVisualBuilder.findComponentAndUpdateAttributes = function (component_id, parent_definition, updated_attributes, card, found_it) {
    var idx = 0, child_idx = 0;
    var ref_parent_definition = (card!=null) ? parent_definition[card] : parent_definition;
    if (!found_it) {
        for (idx = 0; idx < ref_parent_definition.length; idx++) {
            if (ref_parent_definition[idx].id == component_id) {
                // style
                var editor_styles = $('#dfx_styles_editor.CodeMirror')[0].CodeMirror;
                var style         = editor_styles.getValue();
                if (style != '') {
                    appendCss(style);
                }

                found_it = true;

                DfxVisualBuilder.removeNotOverriddenAttributes(updated_attributes, ref_parent_definition[idx].type);
                ref_parent_definition[idx].attributes = updated_attributes;

                //$('#dfx_visual_editor_gc_notif').css('display', 'inline-block').hide().fadeIn().delay(3000).fadeOut();

                /*DfxStudio.showNotification({
                 title: 'Updated!',
                 error: false,
                 body: 'The GC component has been updated successfully.',
                 clickToDismiss: true
                 });*/
                break;
            } else {
                DfxVisualBuilder.findComponentAndUpdateAttributes(component_id, ref_parent_definition[idx].children, updated_attributes, null, found_it);
            }
        }
    }
};

/**
 * Removes not overridden attributes
 */
DfxVisualBuilder.removeNotOverriddenAttributes = function (updated_attributes, gc_type, attr_full_path) {
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
                        if (updated_attributes[attribute] && updated_attributes[attribute].status != 'overridden' && !isAttributeMandatory(attribute)) {
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
 * Finds the child component by its id and update its attributes
 *
 * @param {component_id} the component id
 * @param {component_attribute} the component attribute name containing the child component
 * @param {child_index} the child component index
 * @param {parent_definition} the parent definition
 * @param {updated_attributes} the updated component attributes
 * @param {found_it} specifies if the parent has been found in the recursive loop
 */
DfxVisualBuilder.findChildComponentAndUpdateAttributes = function (component_id, component_attribute, child_index, parent_definition, updated_attributes, found_it) {
    var idx = 0, updated_component_attribute = null;
    if (!found_it) {
        for (idx = 0; idx < parent_definition.length; idx++) {
            if (parent_definition[idx].id == component_id) {
                found_it                                                            = true;
                parent_definition[idx].attributes[component_attribute][child_index] = updated_attributes;
                updated_component_attribute                                         = parent_definition[idx].attributes[component_attribute];
                break;
            } else {
                updated_component_attribute = DfxVisualBuilder.findChildComponentAndUpdateAttributes(component_id, component_attribute, child_index, parent_definition[idx].children, updated_attributes, found_it);
            }
        }
    }
    return updated_component_attribute;
};

/**
 * Adds a child component to a component
 *
 * @param {component_id} the component id
 * @param {component_attribute} the component attribute name that containing child components
 * @param {parent_definition} the parent definition
 * @param {child_definition} the child component definition
 * @param {found_it} specifies if the parent has been found in the recursive loop
 */
DfxVisualBuilder.addChildComponent = function (component_id, component_attribute, parent_definition, child_definition, found_it) {
    var idx = 0, updated_component_attribute = null;
    if (!found_it) {
        for (idx = 0; idx < parent_definition.length; idx++) {
            if (parent_definition[idx].id == component_id) {
                found_it                    = true;
                parent_definition[idx].attributes[component_attribute].push(child_definition);
                updated_component_attribute = parent_definition[idx].attributes[component_attribute];
                break;
            } else {
                updated_component_attribute = DfxVisualBuilder.addChildComponent(component_id, component_attribute, parent_definition[idx].children, child_definition, found_it);
            }
        }
    }
    return updated_component_attribute;
};

/**
 * Opens the appropriate property editor related to the selected component
 *
 */
DfxVisualBuilder.editProperties = function () {
    var gc_type = 'button';

    $('dfx_visual_editor_property_panel').empty();

    var property_panel = gc_factory.loadPropertyPanel(gc_type);

    $('dfx_visual_editor_property_panel').append(property_panel);

};

/**
 * Stores the changed widget state in the localStorage
 */
DfxVisualBuilder.widgetChanged = function (e) {
    var editor        = $('#dfx_src_editor.CodeMirror')[0].CodeMirror;
    var editor_script = $('#dfx_script_editor.CodeMirror')[0].CodeMirror;
    var editor_styles = $('#dfx_styles_editor.CodeMirror')[0].CodeMirror;
    var obj           = new Object();
    obj.src           = editor.getValue();
    obj.src_script    = editor_script.getValue();
    obj.src_styles    = editor_styles.getValue();

    window.localStorage.setItem(DfxVisualBuilder.getCachedWidgetName(), obj.src);
};

/**
 * Exits to Studio
 */
DfxVisualBuilder.exitToStudio = function () {
    var wgtName     = DfxVisualBuilder.getWidgetName();
    // remove widget definition from cache
    window.localStorage.removeItem(DfxVisualBuilder.getCachedWidgetName());
    window.location = '/studio/index.html#!/catalog/widget/' + wgtName + '/';
};

/**
 * Collapse all properties
 */
DfxVisualBuilder.propertyPanelCollapseAll = function () {
    $('.dfx_visual_editor_property_collapsible_btn').each(function () {
        var target = $(this).attr('data-target');
        $(target).removeClass('in');
        $(this).addClass('collapsed');
    });
};

/**
 * Expand all properties
 */
DfxVisualBuilder.propertyPanelExpandAll = function () {
    $('.dfx_visual_editor_property_collapsible_btn').each(function () {
        var target = $(this).attr('data-target');
        $(target).addClass('in');
        $(this).removeClass('collapsed');
    });
};

/**
 * Check if property panel changed
 */
DfxVisualBuilder.isPropertyPanelChanged = function () {
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
DfxVisualBuilder.propertyPanelChanged = function () {
    $('#dfx_visual_editor_property_panel_change').val('changed');
}

/**
 * Initialize property panel status
 */
DfxVisualBuilder.initPropertyPanelChange = function () {
    $('#dfx_visual_editor_property_panel_change').val('');
}

/**
 * Gets the design time full resource path
 */
DfxVisualBuilder.getResourcePath = function (relative_resource_path) {
    if (relative_resource_path.indexOf('/_shared/') == 0) {
        return '/resources/' + $('body').attr('data-tenantid') + relative_resource_path;
    } else {
        return '/resources/' + $('body').attr('data-tenantid') + '/' + $('#dfx_src_widget_editor').attr('data-application-name') + relative_resource_path;
    }
}

/**
 * Loads predefined GC templates to the modal window
 */
DfxVisualBuilder.loadStylesPalette = function (componentPalette) {
    h.getFromServer('/styles_palettes/' + componentPalette + '.json').then(function (data) {
        DfxVisualBuilder.stylesPalette = data;
        DfxVisualBuilder.stylesPalette.fullTypeName = componentPalette;

        StylesPaletteModal.fillModal('styles-palette-modal-window');
    });
};

/**
 * Saves GC template in database
 */
DfxVisualBuilder.saveComponentAsTemplate = function(event) {
    var ve_scope = angular.element(document.getElementById('dfx_src_widget_editor')).scope();
    ve_scope.saveComponentAsTemplate(event);
};

/**
 * Gets GC templates by type to show in Drag & Drop toolbar
 */
DfxVisualBuilder.getGcTemplatesToDragDrop = function(gc_type, gc_cat) {
    var ve_scope = angular.element(document.getElementById('dfx_src_widget_editor')).scope();
    ve_scope.getGcTemplatesToDragDrop(gc_type, gc_cat);
};

/**
 * Saves predefined GC template to JSON file
 */
DfxVisualBuilder.savePredefinedTemplate = function () {
    var form = '<div class="form-group col-lg-12" style="text-align: left;">' +
        '<label for="predefined-template-name" style="font-weight: 700;">Name:</label>' +
        '<input id="predefined-template-name" type="text" name="predefined-template-name" required="required" class="form-control">' +
        '</div>' +
        '<div class="form-group col-lg-12" style="text-align: left;">' +
        '<label for="predefined-template-description" style="font-weight: 700;">Description:</label>' +
        '<input type="text" name="predefined-template-description" required="required" class="form-control">' +
        '</div><br/>';

    DfxStudio.Dialogs.formDialog({
        prompt:           'Save New Template',
        form:             form,
        positiveCallback: function ($form) {
            var platform      = $('#dfx_visual_editor').attr('platform'),
                templateName  = $('input[name=predefined-template-name]', $form).val(),
                templateDescr = $('input[name=predefined-template-description]', $form).val(),
                gc_comp       = gc_factory.controls[platform][DfxVisualBuilder.stylesPalette.type],
                attributes    = gc_factory.getPropertiesFromPanel( gc_comp.attributeDefinition );

            // check for empty name
            if (DfxStudio.testName(templateName).alert) {
                DfxStudio.showNotification({
                    title:          'Error',
                    error:          true,
                    body:           DfxStudio.testName(templateName).alert,
                    clickToDismiss: true
                });
                return;
            }

            var data = {
                styles_palette: gc_comp.styles_palette,
                name: templateName,
                description: templateDescr,
                attributes: attributes
            };

            h.getFromServer('/studio/predefined_gc/save', {
                data: data
            }, 'post').then(function (data) {
                if (data.status == 'failed') {
                    DfxStudio.showNotification({
                        title: 'Error',
                        error: true,
                        body:  data.message
                    });
                } else {
                    StylesPaletteModal.reloadModal();//reload the modal window with new definitions

                    DfxStudio.showNotification({
                        title: 'OK',
                        error: false,
                        body:  data.message
                    });
                }
            });
        },
        negativeCallback: function () {
            // empty
        }
    });

    $('#predefined-template-name').focus();
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
