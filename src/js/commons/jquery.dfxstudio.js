/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

/**
 * Array.prototype.find()
 * The find() method returns a value in the array, if an element in the array satisfies
 * the provided testing function. Otherwise undefined is returned.
 */
if (!Array.prototype.find) {
    Array.prototype.find = function (predicate) {
        if (this == null) {
            throw new TypeError('Array.prototype.find called on null or undefined');
        }
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }
        var list    = Object(this),
            length  = list.length >>> 0,
            thisArg = arguments[1],
            value;

        for (var i = 0; i < length; i++) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
                return value;
            }
        }
        return undefined;
    };
}

$.extend($.fn, {
    replaceClass: function (first, second) {
        return this.filter('.' + first).removeClass(first).addClass(second).end();
    }
});

$(document).ready(function () {
    DfxStudio();
});

var IS_STUDIO = true; // flag --> studio or application

var DfxStudio = function (options) {
    // Initialize Dispatcher except for Visual Builder
    if (DfxStudio.Dispatcher) {
        DfxStudio.Dispatcher.init({
            prefix:       '#!/',
            defaultRoute: '#!/home/'
        }).run();
    }

    DfxStudio.clearCachedWidgets();

    DfxStudio.tenantId          = $('body').data('tenantid');
    DfxStudio.userId            = $('body').data('username');
    DfxStudio.sharedCatalogName = $('body').data('shared-catalog-name');
    DfxStudio.deploymentUrl     = $('body').data('deployment-url');
    DfxStudio.initNotifCounter();
    DfxStudio.initMainMenu();
    //ace.config.set("basePath", "/js/vendor");
};

DfxStudio.templates               = {};
DfxStudio.blocks                  = {};
DfxStudio.notificationStackHeight = 0;
DfxStudio.notifications           = new Array();
DfxStudio.pendingNotifications    = new Array();
DfxStudio.currentConfirmDialog    = null;
DfxStudio.currentEditScreen       = null;
DfxStudio.tenantId                = '';
DfxStudio.userId                  = '';

DfxStudio.clearCachedWidgets = function () {
    for (var key in window.localStorage){
        if (key.indexOf('dfx_') == 0) {
            window.localStorage.removeItem(key);
        }
    }
};

DfxStudio.testName = function (name) {
    var alert = '';

    if (name.indexOf(" ") != -1) {
        alert = "The name cannot have empty spaces";
    }
    else if ($.isEmptyObject(name)) {
        alert = "The name cannot be empty";
    }
    else if (!/^[a-zA-Z0-9-_.]+$/.test(name)) {
        alert = "The name can have only letters, numbers, underscore or dash symbols";
    }

    if (alert) {
        return {alert: alert};
    } else {
        return {};
    }
};

DfxStudio.toggleWorkbook = function () {
    if ($('#dfx_studio_workbook').css('display') == 'none') {
        $('#dfx_studio_workbook').css('display', 'block');
    } else {
        $('#dfx_studio_workbook').css('display', 'none');
    }
};

DfxStudio.confirmDialog = function (options) {
    if (DfxStudio.currentConfirmDialog) {
        return console.log("There can only be 1 confirm dialog at once.");
    }
    var dialog                       = document.createElement("div");
    var id                           = Math.floor(Math.random() * 100000);
    dialog.style['display']          = 'none';
    dialog.style['width']            = "auto";
    dialog.style['height']           = "auto";
    dialog.style['z-index']          = "0";
    dialog.style['position']         = "fixed";
    dialog.style['background']       = "white";
    dialog.style['text-align']       = "center";
    dialog.style['padding']          = "20px 30px";
    dialog.style['background-color'] = "#223957";
    dialog.style['color']            = "white";

    $(dialog).addClass("dfx_content_normal");
    document.body.appendChild(dialog);
    DfxStudio.currentConfirmDialog   = dialog;

    /*setTimeout(function () {
     dialog.style['top'] = (window.innerHeight - $(dialog).height()) / 2 + "px";
     dialog.style['left'] = (window.innerWidth - $(dialog).width()) / 2 + "px";
     dialog.style['display'] = 'block';
     }, 10);*/

    var html = "";
    html += "<h3 style='font-size: 18px; margin-top: 0; margin-bottom: 20px;'>" + options.prompt + "</h3>";
    html += "<div style='width:100%;'><button id='dfx_confirm_positive' class='btn btn-info btn-sm' type='submit' style='margin:0;margin-right:20px;border-radius: 4px;padding: 6px 22px;'><span class='fa fa-lg fa-check'></span>&nbsp;Confirm</button><button id='dfx_confirm_negative' class='btn btn-danger btn-sm' type='submit' value='Cancel' style='width:auto;margin:0;border-radius: 4px;padding: 6px 22px;'><span class='fa fa-lg fa-times'></span>&nbsp;Cancel</button></div>";
    $(dialog).html(html);

    $(dialog).css('top', (window.innerHeight - $(dialog).height()) / 2 + "px");
    $(dialog).css('left', (window.innerWidth - $(dialog).width()) / 2 + "px");
    $(dialog).css('display', 'block');

    $("#dfx_confirm_positive").click(function () {
        DfxStudio.currentConfirmDialog = null;
        options.positiveCallback();
        /*dialog.style['width'] = "0";
         dialog.style['height'] = "0";
         dialog.style['visibility'] = "hidden";
         $(dialog).html("");
         */
        $(dialog).remove();
    });
    $("#dfx_confirm_negative").click(function () {
        DfxStudio.currentConfirmDialog = null;
        options.negativeCallback();
        /*dialog.style['width'] = "0";
         dialog.style['height'] = "0";
         dialog.style['visibility'] = "hidden";
         $(dialog).html("");*/
        $(dialog).remove();
    });
};

DfxStudio.promptDialog = function (options) {
    if (typeof DfxStudio.currentPromptDialog !== 'undefined' && DfxStudio.currentPromptDialog !== null) {
        return console.log("There can only be 1 prompt dialog at once.");
    }
    var dialog                       = document.createElement("div"),
        id                           = Math.floor(Math.random() * 100000);
    dialog.style['display']          = 'none';
    dialog.style['width']            = 'auto';
    dialog.style['height']           = 'auto';
    dialog.style['z-index']          = '0';
    dialog.style['position']         = 'fixed';
    dialog.style['background']       = 'white';
    dialog.style['text-align']       = 'center';
    dialog.style['padding']          = '20px 30px';
    dialog.style['background-color'] = '#223957';
    dialog.style['color']            = 'white';
    dialog.style['min-width']        = '350px';
    $(dialog).addClass('dfx_prompt_dialog dfx_content_normal');
    DfxStudio.currentPromptDialog    = dialog;

    var html = '<h3 style="font-size: 18px; margin-top: 0; margin-bottom: 20px;">' + options.prompt + '</h3>' +
        '<div style="width: 100%;">' +
        '<div>' +
        '<div class="form-group">' +
        '<input id="dfx_prompt_input" type="text" name="dfx_prompt_input" placeholder="' + options.placeholder + '" value="" class="form-control">' +
        '</div>' +
        '</div>' +
        '<button id="dfx_confirm_positive" class="btn btn-info btn-sm" style="margin: 0; margin-right: 20px; border-radius: 4px; padding: 6px 22px;">' +
        '<span class="fa fa-lg fa-check"></span>' +
        '<span style="padding-left: 5px;">OK</span>' +
        '</button>' +
        '<button id="dfx_confirm_negative" class="btn btn-danger btn-sm" style="width: auto; margin: 0; border-radius: 4px; padding: 6px 22px;">' +
        '<span class="fa fa-lg fa-times"></span>' +
        '<span style="padding-left: 5px;">Cancel</span>' +
        '</button>' +
        '</div>';

    dialog.style['top']  = (window.innerHeight - $(dialog).height()) / 2 + "px";
    dialog.style['left'] = (window.innerWidth - $(dialog).width()) / 2 + "px";
    $(dialog).html(html);
    document.body.appendChild(dialog);
    $('.dfx_prompt_dialog').show();

    $("#dfx_confirm_positive").click(function () {
        DfxStudio.currentPromptDialog = null;
        options.positiveCallback($("#dfx_prompt_input").val());
        dialog.style['width']         = '0';
        dialog.style['height']        = '0';
        dialog.style['visibility']    = 'hidden';
        $(dialog).html('');
    });
    $("#dfx_confirm_negative").click(function () {
        DfxStudio.currentPromptDialog = null;
        options.negativeCallback();
        dialog.style['width']         = '0';
        dialog.style['height']        = '0';
        dialog.style['visibility']    = 'hidden';
        $(dialog).html('');
    });
};

// DEPRECATED Please use DfxStudio.Dialogs.formDialog()
// TODO Remove method
DfxStudio.formDialog = function (options) {
    if (typeof DfxStudio.currentFormDialog !== 'undefined' && DfxStudio.currentFormDialog !== null) {
        return console.log("There can only be 1 prompt dialog at once.");
    }
    var $dialog                 = $('<div></div>'),
        id                      = Math.floor(Math.random() * 100000);
    $dialog.css('display', 'none')
        .css('width', 'auto')
        .css('height', 'auto')
        .css('z-index', '0')
        .css('position', 'fixed')
        .css('text-align', 'center')
        .css('padding', '20px 30px')
        .css('background-color', '#223957')
        .css('color', 'white')
        .css('min-width', '350px')
        .addClass('dfx_form_dialog dfx_content_normal');
    DfxStudio.currentFormDialog = $dialog;
    var html                    = '<h3 style="font-size: 18px; margin-top: 0; margin-bottom: 20px;">' + options.prompt + '</h3>' +
        '<div style="width: 100%;">' +
        '<div>' +
        '<div class="form">' +
        options.form +
        '</div>' +
        '</div>' +
        '<button id="dfx_confirm_positive" class="btn btn-info btn-sm" style="margin: 0; margin-right: 20px; border-radius: 4px; padding: 6px 22px;">' +
        '<span class="fa fa-lg fa-check"></span>' +
        '<span style="padding-left: 5px;">OK</span>' +
        '</button>' +
        '<button id="dfx_confirm_negative" class="btn btn-danger btn-sm" style="width: auto; margin: 0; border-radius: 4px; padding: 6px 22px;">' +
        '<span class="fa fa-lg fa-times"></span>' +
        '<span style="padding-left: 5px;">Cancel</span>' +
        '</button>' +
        '</div>';
    $dialog.html(html);
    $('body').append($dialog);
    var $d                      = $('.dfx_form_dialog');
    $d.css('top', (window.innerHeight - $d.height()) / 2 + 'px')
        .css('left', (window.innerWidth - $d.width()) / 2 + 'px')
        .show();
    $("#dfx_confirm_positive").click(function () {
        DfxStudio.currentFormDialog = null;
        options.positiveCallback($('.form', $d));
        $d.remove();
    });
    $("#dfx_confirm_negative").click(function () {
        DfxStudio.currentFormDialog = null;
        options.negativeCallback();
        $d.remove();
    });
};

// DEPRECATED Please use DfxStudio.Dialogs.selectDialog()
// TODO Remove method
DfxStudio.selectDialog = (function (options) {
    if (DfxStudio.currentConfirmDialog) {
        return console.log("There can only be 1 confirm dialog at once.");
    }
    var dialog                     = document.createElement("div");
    var id                         = Math.floor(Math.random() * 100000);
    dialog.style['width']          = "auto";
    dialog.style['height']         = "auto";
    dialog.style['z-index']        = "0";
    dialog.style['position']       = "fixed";
    dialog.style['background']     = "white";
    dialog.style['border']         = "black 5px solid";
    dialog.style['text-align']     = "center";
    dialog.style['padding']        = "10px";

    $(dialog).addClass("dfx_content_normal");
    document.body.appendChild(dialog);
    DfxStudio.currentConfirmDialog = dialog;

    setTimeout(function () {
        dialog.style['top']  = (window.innerHeight - $(dialog).height()) / 2 + "px";
        dialog.style['left'] = (window.innerWidth - $(dialog).width()) / 2 + "px";
    }, 10);

    var html = "";
    html += "<h3>" + options.prompt + "</h3>";
    html += "<div style='width:100%'>";
    $.each(options.items, function (index, value) {
        html += "<input id='dfx_dialog_item_" + index + "' data-option='" + index + "' class='dfx_gc_input' type='submit' value='" + value.title + "' style='width:auto;margin:0;margin-right:20px;'/>";
    });
    html += "</div>";
    $(dialog).html(html);
    $(".dfx_gc_input").click(function () {
        DfxStudio.currentConfirmDialog = null;
        options.items[$(this).data('option')].callback();
        dialog.style['width']          = "0";
        dialog.style['height']         = "0";
        dialog.style['visibility']     = "hidden";
        $(dialog).html("");
    });
});

DfxStudio.initNotifCounter = function () {
    DfxStudio.hiddenNotifCounter = document.createElement("div");
    $(DfxStudio.hiddenNotifCounter).addClass('dfx_notification_counter');
    $(DfxStudio.hiddenNotifCounter).html("" + DfxStudio.pendingNotifications.length);
    document.body.appendChild(DfxStudio.hiddenNotifCounter);
    DfxStudio.refreshNotifCounter();
};

DfxStudio.refreshNotifCounter = function () {
    $(DfxStudio.hiddenNotifCounter).html("" + DfxStudio.pendingNotifications.length);
    if (DfxStudio.pendingNotifications.length != 0) {
        $(DfxStudio.hiddenNotifCounter).css('opacity', 1);
    } else {
        $(DfxStudio.hiddenNotifCounter).css('opacity', 0);
    }
};

DfxStudio.getFormObject = function (options) {
    var x   = document.getElementById(options.formId);
    var obj = {};
    for (var i = 0; i < x.length; i++) {
        var inputname = x.elements[i].getAttribute("data-inputname");
        if (inputname) {
            obj[inputname] = x.elements[i].value;
            console.log(inputname + ": " + x.elements[i].value);
        }
    }
    return obj;
};

DfxStudio.getAllWidgets = function (options) {
    h.getFromServer('/studio/widget/list', options || {}).then(function (data) {
        data = JSON.parse(data);
        options.callback(data.widgets);
    });
};

DfxStudio.initMainMenu = function () {
    $('#dfxStudioMainMenu .nav.navbar-nav').on('click', 'a', function (e) {
        if (!DfxStudio.Dispatcher.getConfirmNavigation()) {
            $('#dfxStudioMainMenu .nav.navbar-nav li').removeClass('active');
            $(this).parent().addClass('active');
        }
    });
};

DfxStudio.selectMainMenu = function (options) {
    $("#dfx_help_ctx").css("display", "none");
    $("[parentmenuid=" + options.menuid + "]").toggle();
    if (!options) throw new Error('[DfxStudio.selectMainMenu]: need options');
    switch (options.menuid) {
        case 'dashboard':
            DfxStudio.loadScreen({
                screenname: "dashboard",
                complete:   function () {
                    $('#collapseApplications').on('shown.bs.collapse', function (e) {
                        console.log('shown.bs.collapse');
                        $('.panel-collapse-link span').removeClass('fa-angle-right').addClass('fa-angle-down');
                    });

                    $('#collapseApplications').on('hidden.bs.collapse', function (e) {
                        console.log('hidden.bs.collapse');
                        $('.panel-collapse-link span').removeClass('fa-angle-down').addClass('fa-angle-right');
                    });
                }
            });
            break;
        case 'sessions':
            DfxStudio.loadScreen({screenname: "sessions"});
            break;
        case 'databases':
            DfxStudio.databases.init();
            break;
        case 'create':
            if (options.type) {
                DfxStudio.loadScreen({
                    screenname: "" + options.type + "/create"
                });
            }
            break;
        case 'workflow':
            DfxStudio.loadScreen({screenname: "workflow"});
            break;
        case 'github':
            DfxStudio.loadScreen({
                screenname: "github/select-components", complete: function () {
                    $('form').on('change', 'input[data-app]', function () {
                        var app = $(this).data('app');//,
                        $('form input[id^=selectComponentsForm_checkboxes_' + app + '_]').prop('checked', $(this).prop('checked'));
                    });
                }
            });
            break;
        case 'settings':
            DfxStudio.settings.init();
            break;
        case 'feedback':
            DfxStudio.loadScreen({screenname: "feedback"});
            break;
        default:
            throw new Error('[DfxStudio.selectMainMenu]: need parameter menuid');
    }
};

DfxStudio.loadScreen = function (options) {
    var $content = $(".dfx_content"),
        path     = '/studio/' + options.screenname;
    $.ajax(path, {
        statusCode: {
            401: function () {
                var tenantid    = $('.label.label-info').html();
                window.location = (tenantid) ? '/studio/' + tenantid + '/login' : '/studio/login';
            }
        },
        success:    function (data, textStatus, jqXHR) {
            $content.html(data);
        },
        error:      function (error) {
            try {
                throw new HttpException(error.status, error.responseText);
            } catch (e) {
                e.handler();
            }
        },
        complete:   function () {
            if ('undefined' !== typeof options.complete) {
                options.complete();
            }
        }
    });
};

/* APPLICATION MANAGEMENT */


DfxStudio.deleteScreen = function (options) {
    DfxStudio.confirmDialog({
        prompt:           "Are you sure you want to delete this page?",
        positiveCallback: function () {
            h.getFromServer('/studio/screen/delete', options, 'post').then(function (data) {

                DfxStudio.showNotification({
                    title: 'OK',
                    error: false,
                    body:  data.data
                });

                DfxStudio.Dispatcher.run('#!/catalog/application/' + options.appName + '/edit_ui/');
            }).fail(function (err) {
                DfxStudio.showNotification({
                    title: 'Error',
                    error: true,
                    body:  JSON.parse(err.responseText).error.message
                });
            });
        },
        negativeCallback: function () {
            console.log("negativeCallback");
        }
    });
};

DfxStudio.appSelectTheme = function (element) {
    var theme_id  = '#dfx_theme_' + $(element).val();
    var thumbnail = $(theme_id).attr('thumbnail');
    $('#dfx_theme_thumbnail').attr('src', thumbnail);
};

/* END APPLICATION MANAGEMENT */

/* SCREEN MANAGEMENT */

DfxStudio.createScreen = function (options) {
//    var parent_itemType = $('.tree-selected').parent().attr('item-type');
//    var parent_screenName = $('.tree-selected').parent().attr('item-screen');
    var item_applicationName = options.application ? options.application : $('#fldAddScreen').attr('item-application');
    var obj                  = {
        name:        options.screenName ? options.screenName : $('#fldAddScreen').val(),
        application: item_applicationName,
        title:       options.screenName ? options.screenName : $('#fldAddScreen').val(),
        ownerId:     ''
    };

//    if (parent_itemType == 'screen' && parent_screenName != '') {
//        obj.parentname = parent_screenName;
//    }

    if (obj.name === '') {
        DfxStudio.showNotification({
            title:          'Error',
            error:          true,
            body:           "The name of your screen cannot be empty.",
            clickToDismiss: true
        });
        return;
    }

    if (obj.name.indexOf(" ") != -1) {
        DfxStudio.showNotification({
            title:          'Error',
            error:          true,
            body:           "The name of your screen cannot have spaces in it.",
            clickToDismiss: true
        });
        return;
    }

    if (obj.name.match(/^[\u00C0-\u1FFF\u2C00-\uD7FF\w\d]*$/i) === null) {
        DfxStudio.showNotification({
            title:          'Error',
            error:          true,
            body:           "The name of your screen must consist of letters and numbers.",
            clickToDismiss: true
        });
        return;
    }

    h.getFromServer('/studio/screen/create', obj, 'post').then(function (data) {
        DfxStudio.showNotification({
            title: 'OK',
            error: false,
            body:  data.data
        });
        DfxStudio.Dispatcher.run('#!/catalog/application/' + obj.application + '/edit_ui/');
    }).fail(function (err) {
        DfxStudio.showNotification({
            title: 'Error',
            error: true,
            body:  JSON.parse(err.responseText).error.message
        });
    });
};

/* END SCREEN MANAGEMENT */

/* WIDGET MANAGEMENT */

DfxStudio.widgetApi = (function () {
    /**
     private functions
     */
    var _private = {
        actionCat:       {},
        applicationName: '',
        /**
         * set category action (create/update/remove)
         * @param actionCat
         */
        setAction:       function (actionCat) {
            this.actionCat = actionCat;
        },

        /**
         * set Application Name, now use for Wodget Category
         * @param {String} actionCat - name of action
         */
        setApplicationName: function (applicationName) {
            this.applicationName = applicationName;
        },


        /**
         * create bootstrap popover
         * @param elem
         * @param title
         * @param html
         * @param place
         */
        createPopUp: function (elem, title, html, place) {
            if (!place) {
                place = /^#!\/home/.test(window.location.hash) ? 'right' : 'right';
            }
            elem.popover({
                html:      true,
                placement: place,
                trigger:   'manual',
                title:     function () {
                    return title;
                },
                content:   html
            });
        },
        /**
         * toggle bootstrap popover
         * @param elem
         * @param title
         * @param html
         */
        togglePopUp: function (elem, title, html) {
            elem.popover('toggle');
            var elCurrPopup = elem.next('.popover');
            if (elCurrPopup.length) {
                if (title) {
                    elCurrPopup.find('.popover-title').html(title);
                }
                if (html) {
                    elCurrPopup.find('.mpopover').html(html);
                }
            }
        },
        /**
         * close bootstrap popover
         * @param e
         */
        closePopUp:  function (e) {
            var elem       = $(e.target).parents('.popover').prev();
            var parPopover = elem.next('.popover');
            if (elem.length) {
                elem.popover('hide');
                if (parPopover.hasClass('fade')) {
                    parPopover.css("display", "none", "important");
                }
            }
        },

        /**
         * Updating Category - show Popup
         */
        updateCat:        function () {
            var widgetCat = $('#fldWidgetCategory');
            this.togglePopUp(widgetCat, "Update category");
            $('#widgetCatName', '.popover-content').val(widgetCat.val());
        },
        /**
         * Remove Category with Dialog Window
         */
        removeCat:        function () {
            DfxStudio.Dialogs.confirmDialog({
                prompt:           "Are you sure you want to delete this Category?",
                positiveCallback: function () {
                    _private.deleteCat();
                },
                negativeCallback: function () {
                    // Здесь пусто, нет ничего вообще.
                }
            });
        },
        /**
         * Remove Category without dialog window
         */
        confirmDeleteCat: function () {
            var elWidgetCat         = $('#widgetRMCat'),
                htmlDeleteCatDialog = '<form class="form-inline" id="formWidgetCat">' +
                    '<div style="width:270px" class="control-group">' +
                    '<div class="controls">' +
                    '<button type="button" style="margin-left: 6px;" class="btn btn-info submitCat" onclick="DfxStudio.widgetApi.widgetCat(\'delete\'); DfxStudio.widgetApi.closePopUp(event);">' +
                    '<span class="fa fa-lg fa-trash-o"></span>' +
                    '<span style="padding-left:5px">Remove</span>' +
                    '</button>' +
                    '<button type="button" style="margin-left: 6px;" class="btn btn-default closeMDPopover" onclick="DfxStudio.widgetApi.closePopUp(event);">' +
                    '<span class="fa fa-lg fa-undo"></span>' +
                    '<span style="padding-left:5px">Cancel</span>' +
                    '</button>' +
                    '</div>' +
                    '</div>' +
                    '</form>';

            this.createPopUp(elWidgetCat, "Remove category", htmlDeleteCatDialog, 'left');
            this.togglePopUp(elWidgetCat);
        },

        deleteCat: function () {
            var elWidgetCat  = $('#fldWidgetCategory'),
                valWidgetCat = elWidgetCat.val();
            h.getFromServer('/studio/widget/category/removeCategory/0', {'name': valWidgetCat, 'application': _private.applicationName}, 'post').then(function (data) {
                $('option[value="' + valWidgetCat + '"]', elWidgetCat).remove();
                DfxStudio.showNotification({
                    title: 'OK',
                    error: false,
                    body:  data.data
                });
            }).fail(function (err) {
                DfxStudio.showNotification({
                    title: 'Error',
                    error: true,
                    body:  JSON.parse(err.responseText).error.message
                });
            });
        },

        /**
         * Save Widget Category (create/update)
         */
        saveWidgetCat: function (e) {
            var self        = this,
                inpCatName  = $('#widgetCatName', '.popover-content'),
                elWidgetCat = $('#fldWidgetCategory');

            if (inpCatName.val() == "") {
                inpCatName.parents('.control-group').addClass('has-error');
                return false;
            }
            var objCat = {
                    name:        inpCatName.val(),
                    ownerId:     '',
                    application: self.applicationName
                },

                url    = '/studio/widget/category/' + ((self.actionCat == 'create') ? 'createCategory' : 'updateCategory');
            if (self.actionCat == 'update') {
                url += '/' + elWidgetCat.val();
            }
            h.getFromServer(url, objCat, 'post').then(function (data) {
                if ((data.data == 'View\'s category was created successfully!') || (data.data == 'View\'s category has been updated successfully!')) {
                    if (self.actionCat == 'create') {
                        // if success create new category - we add new option
                        $(':selected', elWidgetCat).attr('selected', false);
                        elWidgetCat.prepend($('<option value="' + objCat.name + '" selected="selected">' + objCat.name + '</option>'));
                    } else {
                        $('option[value="' + elWidgetCat.val() + '"]', elWidgetCat).val(objCat.name).text(objCat.name);
                    }
                    DfxStudio.showNotification({
                        title: 'OK',
                        error: false,
                        body:  data.data
                    });
                    self.actionCat = "";
                    self.closePopUp(e);
                } else {
                    self.actionCat = "";
                    DfxStudio.showNotification({
                        title: 'Error',
                        error: true,
                        body:  data.data
                    });
                }
            }).fail(function (err) {
                self.actionCat = "";
                DfxStudio.showNotification({
                    title: 'Error',
                    error: true,
                    body:  JSON.parse(err.responseText).error.message
                });
            });
            return false;
        }

    };

    /**
     public functions
     */
    return {
        /**
         * widgetCat - actions for widget Category
         * @param actionCat (create/update/remove)
         */
        widgetCat:     function (actionCat, applicationName) {
            var elWidgetCat  = $('#fldWidgetCategory'),
                valWidgetCat = elWidgetCat.val(),
                htmlFormCat  = '<form class="form-inline" id="formWidgetCat">' +
                    '<div style="width:270px" class="control-group">' +
                    '<div class="controls">' +
                    '<input id="widgetCatName" type="text" name="widgetCatName" placeholder="Category name" style="width: 160px; border: 1px solid #7F9AA8;" required="required" class="form-control">' +
                    '<button type="button" style="margin-left: 6px;" class="btn btn-info submitCat" onclick="DfxStudio.widgetApi.saveWidgetCat(event)">' +
                    '<span class="fa fa-lg fa-floppy-o"></span>' +
                    '</button>' +
                    '<button type="button" style="margin-left: 6px;" class="btn btn-default closeMDPopover" onclick="DfxStudio.widgetApi.closePopUp(event)">' +
                    '<span class="fa fa-lg fa-undo"></span>' +
                    '</button>' +
                    '</div>' +
                    '</div>' +
                    '</form>';
            _private.setAction(actionCat);
            _private.setApplicationName(applicationName);

            if (actionCat == "remove") {
                if (valWidgetCat != "" && valWidgetCat != "Default") {
                    _private.removeCat();
                }
            } else if (actionCat == "confirm") {
                if (valWidgetCat != "" && valWidgetCat != "Default") {
                    _private.confirmDeleteCat();
                }
            } else if (actionCat == "delete") {
                if (valWidgetCat != "" && valWidgetCat != "Default") {
                    _private.deleteCat();
                }
            } else if (actionCat == "create") {
                _private.createPopUp(elWidgetCat, "Adding category", htmlFormCat, /^#!\/home/.test(window.location.hash) ? 'left' : 'right');
                _private.togglePopUp(elWidgetCat);
            } else if (actionCat == "update") {
                if (valWidgetCat == "" || valWidgetCat == "Default") {
                    _private.createPopUp(elWidgetCat, "Adding category", htmlFormCat, /^#!\/home/.test(window.location.hash) ? 'left' : 'right');
                } else {
                    _private.createPopUp(elWidgetCat, "Add/Update category", htmlFormCat, /^#!\/home/.test(window.location.hash) ? 'left' : 'right');
                    _private.updateCat();
                }
                //_private.togglePopUp(elWidgetCat);
            }
        },
        closePopUp:    function (e) {
            _private.closePopUp(e);
        },
        saveWidgetCat: function (e) {
            _private.saveWidgetCat(e);
        }
    };
}());

DfxStudio.previewWidget = function (options) {
    $('#saveWidget').find('span.fa.fa-floppy-o').trigger('click');
    var editor        = $('#dfx_src_editor.CodeMirror')[0].CodeMirror;
    window.localStorage.setItem( 'dfx_' + options.widgetName, editor.getValue() );
    //window.open(window.location.host + '/studio/widget/preview/' + options.widgetName + '/web', '_blank');
};

//DfxStudio.editWidgetUISearch = function (options) {
//    var search_value = $(options.searchInput).val();
//    var editor       = $('#dfx_src_editor.CodeMirror')[0].CodeMirror;
//
//    //
//    //editor.find(search_value, {
//    //    backwards:     false,
//    //    wrap:          false,
//    //    caseSensitive: false,
//    //    wholeWord:     false,
//    //    regExp:        false
//    //});
//};

//DfxStudio.editWidgetUISearchPrevious = function (options) {
//    var editor = $('#dfx_src_editor.CodeMirror')[0].CodeMirror;
//    // editor.findPrevious();
//};
//
//DfxStudio.editWidgetUISearchNext = function (options) {
//    var editor = $('#dfx_src_editor.CodeMirror')[0].CodeMirror;
//    //  editor.findNext();
//};

DfxStudio.editWidgetUILoadDoc = function (options) {
    $('#dfx_editor_doc_menu').css('display', 'none');
    h.getFromServer('/studio/editor/' + options.docName + '/' + options.formFileName).then(function (data) {
        $('#dfx_editor_doc_form').empty();
        $('#dfx_editor_doc_form').append(data);
        $('#dfx_editor_doc_form').css('display', 'block');
        $('#dfx_editor_doc_btn_build').css('display', 'inline-block');
        $('#dfx_editor_doc_btn_back').css('display', 'inline-block');
        $('#dfx_editor_doc_btn_build').attr('doc-name', options.docName);
        $('#dfx_editor_doc_btn_build').attr('form-name', options.formName);
    });
};

DfxStudio.editWidgetUIBack = function (options) {
    $('#dfx_editor_doc_form').css('display', 'none');
    $('#dfx_editor_doc_btn_build').css('display', 'none');
    $('#dfx_editor_doc_btn_back').css('display', 'none');
    $('#dfx_editor_doc_menu').css('display', 'block');
};

//DfxStudio.editWidgetUIBuildDoc = function () {
//    var docName      = $('#dfx_editor_doc_btn_build').attr('doc-name');
//    var formName     = $('#dfx_editor_doc_btn_build').attr('form-name');
//    var options      = {"docName": docName, "formName": formName, "formId": formName + 'Form'};
//    var editor       = $('#dfx_src_editor.CodeMirror')[0].CodeMirror;
//    var current_line = editor.selection.getCursor().row;
//    var current_text = editor.getSession().getLine(current_line);
//
//    var obj        = DfxStudio.getFormObject(options);
//    var match_tabs = current_text.match(/\s/g);
//    if (match_tabs != null) {
//        obj._tabCount = parseInt(match_tabs.length / 4);
//    } else {
//        obj._tabCount = 0;
//    }
//
//    $.post('/studio/editor/' + docName + '/' + formName, {
//        form: obj
//    }, function (data) {
//        var editor = $('#dfx_src_editor.CodeMirror')[0].CodeMirror;
//        //
//        editor.replaceSelection(data);
//        $('#dfx_editor_doc_form').css('display', 'none');
//        $('#dfx_editor_doc_btn_build').css('display', 'none');
//        $('#dfx_editor_doc_menu').css('display', 'block');
//        $('#dfx_doc_jquery').modal('hide');
//        editor.focus();
//    });
//};

DfxStudio.selectWidgetSource = function (options) {
    $('li[data-type=dfx-src-widget-editor]').removeClass('active');
    $('.dfx_src_widget_editor_active').removeClass('dfx_src_widget_editor_active');
    if (options.src == 'script') {
        $('#search-bar').show();
    } else {
        $('#search-bar').hide();
    }
    if (options.src == 'design') {
        $('#dfx_src_widget_editor_design').addClass('active');
        $('#dfx_src_widget_editor_design a span').addClass('dfx_src_widget_editor_active');
        $('#dfx_script_editor').css('display', 'none');
        $('#dfx_styles_editor').css('display', 'none');
        $('#dfx_src_editor_help').css('display', 'none');
        var is_visual_editor_visible = ($('#dfx_visual_editor').css('display') == 'block') ? true : false;
        if (!is_visual_editor_visible) {
            $('#dfx_src_editor').css('display', 'block');
        }
        if ($('#dfx_visual_editor').attr('widget-type') == 'visual') {
            $('#dfx_visual_editor_view_source').css('display', 'block');
        }
    } else if (options.src == 'script') {
        $('#dfx_src_widget_editor_script').addClass('active');
        $('#dfx_src_widget_editor_script a span').addClass('dfx_src_widget_editor_active');
        $('#dfx_src_editor').css('display', 'none');
        $('#dfx_visual_editor_view_source').css('display', 'none');
        $('#dfx_script_editor').css('display', 'block');
        $('#dfx_styles_editor').css('display', 'none');
        $('#dfx_src_editor_help').css('display', 'block');
    } else if (options.src == 'styles') {
        $('#dfx_src_widget_editor_styles').addClass('active');
        $('#dfx_src_widget_editor_styles a span').addClass('dfx_src_widget_editor_active');
        $('#dfx_src_editor').css('display', 'none');
        $('#dfx_visual_editor_view_source').css('display', 'none');
        $('#dfx_script_editor').css('display', 'none');
        $('#dfx_styles_editor').css('display', 'block');
        $('#dfx_src_editor_help').css('display', 'none');
    }
};

DfxStudio.updateWidgetSource = function (options) {
    var editor        = $('#dfx_src_editor.CodeMirror')[0].CodeMirror;

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
        editor.setValue(JSON.stringify(widget_definition, null, '\t'), 0);
    }
    var editor_script = $('#dfx_script_editor.CodeMirror')[0].CodeMirror;
    var editor_styles = $('#dfx_styles_editor.CodeMirror')[0].CodeMirror;
    
    var view_condensed_src = JSON.parse(editor.getValue());

    var obj           = {
        src:         JSON.stringify(view_condensed_src),
        src_script:  editor_script.getValue(),
        src_styles:  editor_styles.getValue(),
        application: options.applicationName,
        category:    options.category
    };

    // Update Widget Cache
    window.localStorage.setItem( 'dfx_' + options.widgetName, editor.getValue() );

    h.getFromServer('/studio/widget/update/' + options.widgetName, {
        change: obj
    },'post').then(function (data) {
        DfxStudio.showNotification({
            title: 'OK',
            error: false,
            body:  data.data
        });
    }).fail(function (err) {
        DfxStudio.showNotification({
            title: 'Error:',
            error: true,
            body:  JSON.parse(err.responseText).error.message
        });
        try {
            throw new HttpException(err.status, err.responseText);
        } catch (e) {
            e.handler();
        }
    });
};

DfxStudio.getWidgetControllerName = function (attributes, widget_name) {
    if (attributes && attributes.controller && attributes.controller.value) {
        return attributes.controller.value;
    } else {
        return widget_name + "Controller";
    }
};

DfxStudio.getWidgetFormName = function (attributes, widget_name) {
    if (attributes && attributes.form && attributes.form.value) {
        return attributes.form.value;
    } else {
        return widget_name + "Form";
    }
};

DfxStudio.saveWidgetAsFromBuilder = function (options) {
    DfxStudio.Dialogs.promptDialog({
        prompt:           'Please enter new view name:',
        placeholder:      'Enter name',
        positiveCallback: function (val) {
            if (DfxStudio.testName(val).alert) {
                DfxStudio.showNotification({
                    title:          'Error',
                    error:          true,
                    body:           DfxStudio.testName(val).alert,
                    clickToDismiss: true
                });
                return;
            } else {
                options.saveAsName = val;
                DfxStudio.saveWidgetAs(options);
            }
        },
        negativeCallback: function () {
            // empty
        }
    });
};

DfxStudio.saveWidgetAs = function (options) {
    var replaceWidgetBasedNames = function (src_obj, src_script, save_as_widget_name) {
        // replace controller and form name in the source - in JSON object
        var attributes    = src_obj.definition[0].attributes;
        var old_form_name = attributes.form.value;

        // need to empty old names in definition before constructing new names
        attributes.controller.value = null;
        attributes.form.value       = null;

        var new_controller_name = (options.fromBuilder == 'no')
            ? DfxStudio.getWidgetControllerName(attributes, save_as_widget_name)
            : DfxVisualBuilder.getWidgetControllerName(attributes, save_as_widget_name);
        var new_form_name       = (options.fromBuilder == 'no')
            ? DfxStudio.getWidgetFormName(attributes, save_as_widget_name)
            : DfxVisualBuilder.getWidgetFormName(attributes, save_as_widget_name);

        attributes.controller.value = new_controller_name;
        attributes.form.value       = new_form_name;

        var src_str = JSON.stringify(src_obj, null, '\t');

        // if the form name is used somewhere else in the source, replace it using RegExp
        src_str = src_str.replace(old_form_name, new_form_name);

        // replace all this in the script
        var replaceUsingRegEx = function (src, re, replaceFor, replaceForPrefix) {
            return src.replace(re, function (m, p1, p2) {
                return replaceForPrefix + p1 + replaceFor + p1;
            });
        };

        // replace widget name in the module declaration
        src_script = replaceUsingRegEx(src_script, /angular\.module\s*\(\s*(["'])(\w*)["']/g, save_as_widget_name, 'angular.module( ');
        // replace controller name in its declaration
        src_script = replaceUsingRegEx(src_script, /\.controller\s*\(\s*(["'])(\w*)["']/g, new_controller_name, '.controller( ');
        // replace form name everywhere in the script
        src_script = src_script.replace(old_form_name, new_form_name);

        return {"new_src": src_str, "new_src_script": src_script};
    };

    var prepareDataToSend = function (save_as_widget_name, callback) {
        var dataToSend = {};

        if (options.fromBuilder == 'no') {
            h.getFromServer('/studio/widget/item/' + options.applicationName + '/' + options.widgetName).then(function (data) {
                var widget      = JSON.parse(data).widget,
                    src_styles  = widget.src_styles,
                    new_sources = replaceWidgetBasedNames(JSON.parse(widget.src), widget.src_script, save_as_widget_name);

                dataToSend.src                 = new_sources.new_src;
                dataToSend.src_script          = new_sources.new_src_script;
                dataToSend.src_styles          = src_styles;
                dataToSend.current_widget_name = options.widgetName;

                dataToSend.ownerId           = options.ownerId;
                dataToSend.description       = options.description;
                dataToSend.category          = options.category;
                dataToSend.application       = options.applicationName;
                dataToSend.applicationTarget = options.applicationTarget;
                dataToSend.categoryTarget    = options.categoryTarget;

                callback(dataToSend);
            });
        } else {
            var editor        = $('#dfx_src_editor.CodeMirror')[0].CodeMirror,
                editor_script = $('#dfx_script_editor.CodeMirror')[0].CodeMirror,
                editor_styles = $('#dfx_styles_editor.CodeMirror')[0].CodeMirror;
                new_sources   = replaceWidgetBasedNames(JSON.parse(editor.getValue()), editor_script.getValue(), save_as_widget_name);

            dataToSend.src                 = new_sources.new_src;
            dataToSend.src_script          = new_sources.new_src_script;
            dataToSend.src_styles          = editor_styles.getValue();
            dataToSend.current_widget_name = options.widgetName;
            dataToSend.application         = options.applicationName;

            callback(dataToSend);
        }
    };

    var save_as_widget_name = options.saveAsName.trim();

    prepareDataToSend(save_as_widget_name, function (dataToSend) {
        h.getFromServer('/studio/widget/saveas/' + save_as_widget_name, {
            change: dataToSend
        },'post').then(function (data) {
            if (data.data == 'View created!') {
                DfxStudio.showNotification({
                    title: 'OK',
                    error: false,
                    body:  data.data
                });
                $('#cloud-platform-treeview').tree('loadDataFromUrl', '/studio/home/treedata');
            } else {
                DfxStudio.showNotification({
                    title: 'Error',
                    error: true,
                    body:  data.data
                });
            }
        }).fail(function (err) {
            DfxStudio.showNotification({
                title: 'Error',
                error: true,
                body:  JSON.parse(err.responseText).error.message
            });
            try {
                throw new HttpException(err.status, err.responseText);
            } catch (e) {
                e.handler();
            }
        });
    });
};



DfxStudio.deleteWidget = function (options) {
    console.log("Deleting view " + options.widgetName);
    DfxStudio.confirmDialog({
        prompt:           "Are you sure you want to delete this view?",
        positiveCallback: function () {
            h.getFromServer('/studio/widget/delete', options, 'post').then(function (data) {
                DfxStudio.showNotification({
                    title: 'OK',
                    error: false,
                    body:  data.data
                });
                DfxStudio.recentActivity.rm({
                    name: options.widgetName,
                    type: 'Widget'
                });

                if (/^#!\/home/.test(window.location.hash)) {
                    $('#cloud-platform-treeview').tree('loadDataFromUrl', '/studio/home/treedata');
                    DfxStudio.Dispatcher.run('#!/home/' + options.applicationName + '/widgets');
                } else {
                    DfxStudio.Dispatcher.run('#!/catalog/');
                }

                //DfxStudio.loadScreen({
                //    screenname: "dashboard",
                //    complete:   function () {
                //        DfxStudio.Dashboard.init();
                //    }
                //});

            }).fail(function (err) {
                DfxStudio.showNotification({
                    title: 'Error',
                    error: true,
                    body:  JSON.parse(err.responseText).error.message
                });
            });
        },
        negativeCallback: function () {

        }
    });
};

DfxStudio.migrateWidget = function () {
    var i;
    var editor = ace.edit('dfx_widget_source');
    editor.setTheme("ace/theme/twilight");
    editor.getSession().setMode("ace/mode/json");

    var editor_gc = ace.edit('dfx_gc_source');
    editor_gc.setTheme("ace/theme/twilight");
    editor_gc.getSession().setMode("ace/mode/json");

    var editor_migrated = ace.edit('dfx_gc_migrated');
    editor_migrated.setTheme("ace/theme/twilight");
    editor_migrated.getSession().setMode("ace/mode/json");

    var widget_gc_list = {};

    var addWidgetElement = function (element, parent_id) {
        var j;
        widget_gc_list[element.id] = element;
        $('#' + parent_id).append('<li element-id="' + element.id + '"><a href="javascript:void(0);" onclick="DfxStudio.migrateWidgetLoadGC(this)">' + element.id + ' (' + element.type + ')</a><ul id="' + element.id + '" style="list-style-type:none;"></ul></li>');
        if (element.children && element.children.length > 0) {
            for (j = 0; j < element.children.length; j++) {
                addWidgetElement(element.children[j], element.id);
            }
        }
    };

    var wgt_def         = editor.getValue();
    var widget_elements = JSON.parse(wgt_def).definition;
    for (i = 0; i < widget_elements.length; i++) {
        addWidgetElement(widget_elements[i], 'dfx_gc_list');
    }
    $('#dfx_gc_object_list').val(JSON.stringify(widget_gc_list));
};

DfxStudio.migrateWidgetLoadGC = function (link) {
    var i;
    var li_id     = $(link).closest('li').attr('element-id');
    var editor_gc = ace.edit('dfx_gc_source');

    var widget_gc_list = JSON.parse($('#dfx_gc_object_list').val());
    var element        = widget_gc_list[li_id];

    editor_gc.setValue(JSON.stringify(element, null, 4));

    var editor_migrated = ace.edit('dfx_gc_migrated');

    var migrated_content;
    //if (element.type != 'panel' && element.type != 'statictext') {
    var gc_type;
    if (element.type == 'inputfield') {
        gc_type = 'input_field';
    } else {
        gc_type = element.type;
    }
    var dyn_fct_src  = 'return gc_web_' + gc_type + '.attributeDefinition';
    var dyn_fct      = new Function(dyn_fct_src);
    migrated_content = gc_factory.getDefaultAttributes(dyn_fct());

    if (element.type == 'panel') {
        element.attributes['css']                = migrated_content.css;
        element.attributes['dynamicClasses']     = migrated_content.dynamicClasses;
        element.attributes['bodyCss']            = migrated_content.bodyCss;
        element.attributes['bodyClasses']        = migrated_content.bodyClasses;
        element.attributes['bodyDynamicClasses'] = migrated_content.bodyDynamicClasses;
        element.attributes['bodyStyle']          = migrated_content.bodyStyle;
    } else if (element.type == 'button') {
        element.attributes['css']                     = migrated_content.css;
        element.attributes['containerCss']            = migrated_content.containerCss;
        element.attributes['containerClasses']        = migrated_content.containerClasses;
        element.attributes['containerDynamicClasses'] = migrated_content.containerDynamicClasses;
        element.attributes['containerStyle']          = migrated_content.containerStyle;
    } else if (element.type == 'inputfield') {
        element.attributes['css']                     = migrated_content.css;
        element.attributes['containerCss']            = migrated_content.containerCss;
        element.attributes['containerClasses']        = migrated_content.containerClasses;
        element.attributes['containerDynamicClasses'] = migrated_content.containerDynamicClasses;
        element.attributes['containerStyle']          = migrated_content.containerStyle;
        element.attributes['labelVisible']            = (element.attributes['labelVisible'].value) ? {"value": "yes"} : {"value": "no"};
        element.attributes['required']                = (element.attributes['required'].value) ? {"value": "yes"} : {"value": "no"};
        if (element.attributes['propertyByType'].text) {
            element.attributes['textIcon']           = element.attributes['propertyByType'].text.icon;
            element.attributes['textIconPosition']   = element.attributes['propertyByType'].text.iconPosition;
            element.attributes['textMinlength']      = element.attributes['propertyByType'].text.minlength;
            element.attributes['textMaxlength']      = element.attributes['propertyByType'].text.maxlength;
            element.attributes['textPattern']        = element.attributes['propertyByType'].text.pattern;
            element.attributes['textMask']           = element.attributes['propertyByType'].text.mask;
            element.attributes['textPlaceholder']    = element.attributes['propertyByType'].text.placeholder;
            element.attributes['textErrorMinlength'] = element.attributes['propertyByType'].text.error.minlength;
            element.attributes['textErrorMaxlength'] = element.attributes['propertyByType'].text.error.maxlength;
            element.attributes['textErrorPattern']   = element.attributes['propertyByType'].text.error.pattern;
            element.attributes['errorRequired']      = element.attributes['propertyByType'].text.error.required;
            delete element.attributes['propertyByType'];
        }
    } else if (element.type == 'textarea') {
        element.attributes['css']                     = migrated_content.css;
        element.attributes['containerCss']            = migrated_content.containerCss;
        element.attributes['containerClasses']        = migrated_content.containerClasses;
        element.attributes['containerDynamicClasses'] = migrated_content.containerDynamicClasses;
        element.attributes['containerStyle']          = migrated_content.containerStyle;
        element.attributes['labelVisible']            = (element.attributes['labelVisible'].value) ? {"value": "yes"} : {"value": "no"};
        element.attributes['required']                = (element.attributes['required'].value) ? {"value": "yes"} : {"value": "no"};
        element.attributes['errorRequired']           = element.attributes.error.required;
    } else if (element.type == 'datagrid') {
        element.attributes['css']                     = migrated_content.css;
        element.attributes['dynamicClasses']          = migrated_content.dynamicClasses;
        if (element.attributes['panelClass']) {
            element.attributes['classes'] = 'panel ' + element.attributes['panelClass'].value;
        } else {
            element.attributes['classes'] = 'panel';
        }
        delete element.attributes['panelClass'];
        element.attributes['containerCss']            = migrated_content.containerCss;
        element.attributes['containerClasses']        = migrated_content.containerClasses;
        element.attributes['containerDynamicClasses'] = migrated_content.containerDynamicClasses;
        element.attributes['containerStyle']          = migrated_content.containerStyle;
        element.attributes['titleVisible']            = (element.attributes['titleVisible'].value) ? {"value": "yes"} : {"value": "no"};
        element.attributes['filter']                  = (element.attributes['filter'].value) ? {"value": "yes"} : {"value": "no"};
        element.attributes['paging']                  = (element.attributes['paging'].value) ? {"value": "yes"} : {"value": "no"};
        element.attributes['bordered']                = (element.attributes['bordered'].value) ? {"value": "yes"} : {"value": "no"};
        element.attributes['striped']                 = (element.attributes['striped'] && element.attributes['striped'].value) ? {"value": "yes"} : {"value": "no"};
        element.attributes['condensed']               = (element.attributes['condensed'].value) ? {"value": "yes"} : {"value": "no"};
        element.attributes['dataLoaded']              = migrated_content.dataLoaded;
        element.attributes['property']                = element.attributes['propertyData'];
        delete element.attributes['propertyData'];
        for (i = 0; i < element.attributes['gridColumns'].length; i++) {
            element.attributes['gridColumns'][i].html             = {"value": ""};
            element.attributes['gridColumns'][i].property         = {"value": element.attributes['gridColumns'][i].property};
            element.attributes['gridColumns'][i].width            = {"value": element.attributes['gridColumns'][i].width};
            element.attributes['gridColumns'][i].header           = {"value": element.attributes['gridColumns'][i].header};
            element.attributes['gridColumns'][i].classes          = {"value": element.attributes['gridColumns'][i].type.classes};
            element.attributes['gridColumns'][i].style            = {"value": element.attributes['gridColumns'][i].type.style};
            element.attributes['gridColumns'][i].css              = migrated_content.css;
            element.attributes['gridColumns'][i].callbackFunction = {"value": element.attributes['gridColumns'][i].type.callbackFunction};
            element.attributes['gridColumns'][i].type             = {"value": element.attributes['gridColumns'][i].type.tname};
        }
    } else if (element.type == 'rating') {
        element.attributes['css']                     = migrated_content.css;
        element.attributes['dynamicClasses']          = migrated_content.dynamicClasses;
        element.attributes['containerCss']            = migrated_content.containerCss;
        element.attributes['containerClasses']        = migrated_content.containerClasses;
        element.attributes['containerDynamicClasses'] = migrated_content.containerDynamicClasses;
        element.attributes['containerStyle']          = migrated_content.containerStyle;
        element.attributes['labelVisible']            = (element.attributes['labelVisible'].value) ? {"value": "yes"} : {"value": "no"};
        element.attributes['captionVisible']          = (element.attributes['captionVisible'].value) ? {"value": "yes"} : {"value": "no"};
        element.attributes['clearVisible']            = (element.attributes['clearVisible'].value) ? {"value": "yes"} : {"value": "no"};
        element.attributes['symbol']                  = {"name": "star", "value": "&#57350;"}
    } else if (element.type == 'statictext') {
        element.attributes['css']                     = migrated_content.css;
        element.attributes['dynamicClasses']          = migrated_content.dynamicClasses;
        element.attributes['containerCss']            = migrated_content.containerCss;
        element.attributes['containerClasses']        = migrated_content.containerClasses;
        element.attributes['containerDynamicClasses'] = migrated_content.containerDynamicClasses;
        element.attributes['containerStyle']          = migrated_content.containerStyle;
        element.attributes['tooltip']                 = migrated_content.tooltip;
        element.attributes['tooltipPosition']         = migrated_content.tooltipPosition;
        element.attributes['onclick']                 = migrated_content.onclick;
    } else if (element.type == 'html') {
        element.attributes['css']                     = migrated_content.css;
        element.attributes['dynamicClasses']          = migrated_content.dynamicClasses;
        element.attributes['containerCss']            = migrated_content.containerCss;
        element.attributes['containerClasses']        = migrated_content.containerClasses;
        element.attributes['containerDynamicClasses'] = migrated_content.containerDynamicClasses;
        element.attributes['containerStyle']          = migrated_content.containerStyle;
        element.attributes['property']                = migrated_content.property;
        element.attributes['onclick']                 = migrated_content.onclick;
    } else if (element.type == 'image') {
        element.attributes['css']                     = migrated_content.css;
        element.attributes['containerCss']            = migrated_content.containerCss;
        element.attributes['containerClasses']        = migrated_content.containerClasses;
        element.attributes['containerDynamicClasses'] = migrated_content.containerDynamicClasses;
        element.attributes['containerStyle']          = migrated_content.containerStyle;
        element.attributes['display']                 = migrated_content.property;
    } else if (element.type == 'link') {
        element.attributes['css']                     = migrated_content.css;
        element.attributes['dynamicClasses']          = migrated_content.dynamicClasses;
        element.attributes['containerCss']            = migrated_content.containerCss;
        element.attributes['containerClasses']        = migrated_content.containerClasses;
        element.attributes['containerDynamicClasses'] = migrated_content.containerDynamicClasses;
        element.attributes['containerStyle']          = migrated_content.containerStyle;
        element.attributes['property']                = migrated_content.property;
        element.attributes['onclick']                 = migrated_content.onclick;
    } else if (element.type == 'knob') {
        element.attributes['css']                     = migrated_content.css;
        element.attributes['dynamicClasses']          = migrated_content.dynamicClasses;
        element.attributes['containerCss']            = migrated_content.containerCss;
        element.attributes['containerClasses']        = migrated_content.containerClasses;
        element.attributes['containerDynamicClasses'] = migrated_content.containerDynamicClasses;
        element.attributes['containerStyle']          = migrated_content.containerStyle;
        element.attributes['labelVisible']            = (element.attributes['labelVisible'].value) ? {"value": "yes"} : {"value": "no"};
        element.attributes['symbol']                  = element.attributes['format'];
        element.attributes['symbolPosition']          = element.attributes['formatPosition'];
        element.attributes['css'].width               = element.attributes['width'].value;
        element.attributes['css'].color               = element.attributes['fgcolor'].value;
        element.attributes['css'].background          = element.attributes['bgcolor'].value;
        delete element.attributes['format'];
        delete element.attributes['formatPosition'];
        delete element.attributes['width'];
        delete element.attributes['fgcolor'];
        delete element.attributes['bgcolor'];
    } else if (element.type == 'chart') {
        element.attributes['css']                     = migrated_content.css;
        element.attributes['dynamicClasses']          = migrated_content.dynamicClasses;
        element.attributes['containerCss']            = migrated_content.containerCss;
        element.attributes['containerClasses']        = migrated_content.containerClasses;
        element.attributes['containerDynamicClasses'] = migrated_content.containerDynamicClasses;
        element.attributes['containerStyle']          = migrated_content.containerStyle;
        element.attributes['labelVisible']            = (element.attributes['labelVisible'].value) ? {"value": "yes"} : {"value": "no"};
        element.attributes['tooltips']                = (element.attributes['tooltips'].value) ? {"value": "yes"} : {"value": "no"};
        element.attributes['labelsDataPoints']        = (element.attributes['labels_data_points'].value) ? {"value": "yes"} : {"value": "no"};
        element.attributes['innerRadius']             = element.attributes['inner_radius'];
        element.attributes['legendVisible']           = (element.attributes['legend_visible'].value) ? {"value": "yes"} : {"value": "no"};
        element.attributes['legendPosition']          = (element.attributes['legend_position'].value) ? {"value": "yes"} : {"value": "no"};
        element.attributes['property']                = element.attributes['propertyData'];
        delete element.attributes['labels_data_points'];
        delete element.attributes['inner_radius'];
        delete element.attributes['legend_visible'];
        delete element.attributes['legend_position'];
        delete element.attributes['propertyData'];
    } else if (element.type == 'slider') {
        element.attributes['css']                     = migrated_content.css;
        element.attributes['dynamicClasses']          = migrated_content.dynamicClasses;
        element.attributes['containerCss']            = migrated_content.containerCss;
        element.attributes['containerClasses']        = migrated_content.containerClasses;
        element.attributes['containerDynamicClasses'] = migrated_content.containerDynamicClasses;
        element.attributes['containerStyle']          = migrated_content.containerStyle;
        element.attributes['labelVisible']            = (element.attributes['labelVisible'].value) ? {"value": "yes"} : {"value": "no"};
        element.attributes['css'].width               = element.attributes['width'].value;
        element.attributes['css'].height              = element.attributes['height'].height;
        element.attributes['css'].color               = element.attributes['fgcolor'].value;
        element.attributes['css'].background          = element.attributes['bgcolor'].value;
        element.attributes['css'].handleColor         = (element.attributes['handleColor']) ? element.attributes['handleColor'].value : '';
        delete element.attributes['width'];
        delete element.attributes['height'];
        delete element.attributes['fgcolor'];
        delete element.attributes['bgcolor'];
        delete element.attributes['handleColor'];
    } else if (element.type == 'combobox') {
        element.attributes['css']                     = migrated_content.css;
        element.attributes['dynamicClasses']          = migrated_content.dynamicClasses;
        element.attributes['containerCss']            = migrated_content.containerCss;
        element.attributes['containerClasses']        = migrated_content.containerClasses;
        element.attributes['containerDynamicClasses'] = migrated_content.containerDynamicClasses;
        element.attributes['containerStyle']          = migrated_content.containerStyle;
        element.attributes['labelVisible']            = (element.attributes['labelVisible'].value) ? {"value": "yes"} : {"value": "no"};
        element.attributes['tooltip']                 = migrated_content.tooltip;
        element.attributes['tooltipPosition']         = migrated_content.tooltipPosition;
        element.attributes['displayValue']            = {"value": element.attributes['propertyOptionsFields'].displayValue};
        element.attributes['dataValue']               = {"value": element.attributes['propertyOptionsFields'].dataValue};
        element.attributes['required']                = (element.attributes['required'].value) ? {"value": "yes"} : {"value": "no"};
        element.attributes['errorRequired']           = element.attributes['error'].required;
        delete element.attributes['error'];
        delete element.attributes['propertyOptionsFields'];
    } else if (element.type == 'checkbox') {
        element.attributes['css']                     = migrated_content.css;
        element.attributes['containerCss']            = migrated_content.containerCss;
        element.attributes['containerClasses']        = migrated_content.containerClasses;
        element.attributes['containerDynamicClasses'] = migrated_content.containerDynamicClasses;
        element.attributes['containerStyle']          = migrated_content.containerStyle;
        element.attributes['required']                = {"value": "no"};
        element.attributes['dynamicOptions']          = false;
        element.attributes['propertyOptions']         = migrated_content.propertyOptions;
        element.attributes['propertyOptionsFields']   = migrated_content.propertyOptionsFields;
        element.attributes['staticOptions']           = [{
            "displayValue":   element.attributes['label'].value,
            "checkedValue":   element.attributes['checkedValue'].value,
            "uncheckedValue": element.attributes['uncheckedValue'].value,
            "disabled":       false
        }];
        element.attributes['orientation']             = 'vertical';
    }

    editor_migrated.setValue(JSON.stringify(element, null, 4));
    //}
};

DfxStudio.migrateWidgetSaveComponent = function () {
    var editor          = ace.edit('dfx_widget_source');
    var widget_def      = JSON.parse(editor.getValue());
    var editor_migrated = ace.edit('dfx_gc_migrated');
    var element_src     = JSON.parse(editor_migrated.getValue());

    DfxStudio.migrateWidgetSearchComponent(widget_def.definition, element_src);

    /*for (i=0; i< widget_def.definition.length; i++) {
     if (element_src.id==widget_def.definition[i].id) {
     widget_def.definition[i] = element_src;
     found = true;
     break;
     } else {
     if (widget_def.definition[i].children && widget_def.definition[i].children.length>0) {
     found = DfxStudio.migrateWidgetSearchComponent(widget_def.definition[i].children, element_src);
     if (found) {
     break;
     }
     }
     }
     }*/

    editor.setValue(JSON.stringify(widget_def, null, 4));

};

DfxStudio.migrateWidgetSearchComponent = function (def, element) {
    var i, found = false;

    for (i = 0; i < def.length; i++) {
        if (element.id == def[i].id) {
            def[i] = element;
            found  = true;
            break;
        } else {
            if (def[i].children && def[i].children.length > 0) {
                found = DfxStudio.migrateWidgetSearchComponent(def[i].children, element);
                if (found) {
                    break;
                }
            }
        }
    }

    return found;
};

/**
 * Gets widget default definition
 */
DfxStudio.getWidgetDefaultDefinition = function (platform) {
    var is_mobile                     = (platform && platform == 'mobile') ? true : false;
    var properties_default_definition = {
        title:    {
            label:   "",
            visible: true,
            color:   ""
        },
        tools:    {
            color:      true,
            edit:       true,
            collapse:   true,
            fullscreen: true,
            delete:     true
        },
        sortable: true
    };
    var layout_default_definition     = (is_mobile)
        ? {
        "rows":           [
            {
                "cols":           [
                    {
                        "width":          {"value": "100"},
                        "classes":        {"value": ""},
                        "dynamicClasses": {"value": ""},
                        "style":          {"value": ""},
                        "orientation":    {"value": "row"},
                        "halignment":     {"value": "start"},
                        "valignment":     {"value": "start"}
                    }
                ],
                "classes":        {"value": ""},
                "dynamicClasses": {"value": ""},
                "style":          {"value": ""}
            }
        ],
        "classes":        {"value": ""},
        "dynamicClasses": {"value": ""},
        "style":          {"value": ""}
    }
        : {
        "rows":           [
            {
                "cols":           [
                    {
                        "width":          {"value": "100"},
                        "classes":        {"value": ""},
                        "dynamicClasses": {"value": ""},
                        "style":          {"value": ""},
                        "orientation":    {"value": "row"},
                        "halignment":     {"value": "start"},
                        "valignment":     {"value": "start"}
                    }
                ],
                "classes":        {"value": ""},
                "dynamicClasses": {"value": ""},
                "style":          {"value": ""}
            }
        ],
        "classes":        {"value": ""},
        "dynamicClasses": {"value": ""},
        "style":          {"value": ""}
    };
    var src_default_definition        = (is_mobile) ?
    {
        properties: properties_default_definition,
        definition: [
            {
                id:         Math.floor(Math.random() * 1000),
                type:       "panel",
                attributes: {
                    "name":               {"value": "pnlPanel1"}
                },
                children:   []
            }
        ]
    }
        : {
        properties: properties_default_definition,
        definition: {
            'default': [
            {
                id:         Math.floor(Math.random() * 1000),
                type:       "panel",
                attributes: {
                    "name": { "value": "pnlPanel1", "status": "overridden" }
                },
                children:   []
            }
        ]}
    };
    return {
        src_definition:        src_default_definition,
        properties_definition: properties_default_definition,
        layout:                layout_default_definition
    }
};

/* END WIDGET MANAGEMENT */

/* QUERY MANAGEMENT */


/*
 var queryManager = function(options){
 var self = this;
 this.action = options.action;
 this.queryName = options.queryName;
 this.dq = null;
 this.dqput = null;
 this.data = null;
 this.metadata = null;
 this.create = function(){
 this.dq = new DataQuery(this.queryName);
 console.log("Create Data Query By Name!");
 //console.log(this.dq);
 };
 this.execute = function(){
 console.log("Start execution!")
 if(this.dq == null){
 DfxStudio.showNotification({
 title: "Warning",
 warning: true,
 body: "You have not yet created a DataQuery",
 clickToDismiss: true
 });
 return;
 }
 this.dq.execute()
 .done(function(){
 console.log("End execution!")
 self.data = self.dq.getData();
 self.metadata = self.dq.getMetaData();
 })
 .fail(function(objerr){
 DfxStudio.showNotification({
 title: objerr.typeError + " Error",
 error: true,
 body: objerr.textError,
 clickToDismiss: true
 });
 });
 };
 this.setParams = function(){
 if(this.dq == null){
 DfxStudio.showNotification({
 title: "Warning",
 warning: true,
 body: "You have not yet created a DataQuery",
 clickToDismiss: true
 });
 return;
 }
 this.dq.setParameters({"name":"Petrov"});
 console.log("Set parameters!");
 //console.log(this.dq);
 };
 this.viewResult = function(){
 if(self.data != null && self.metadata != null){
 console.log("Data-->>>");
 console.log(self.data);
 console.log("MetaData-->>>");
 console.log(self.metadata);
 } else {
 DfxStudio.showNotification({
 title: "Warning",
 warning: true,
 body: "You have not executed a DataQuery",
 clickToDismiss: true
 });
 }
 };
 this.put = function(){
 this.dqput = new DataQuery({
 'source': 'db',
 'url': 'http://localhost:3000/database/put',
 'typeRequest': 'POST',
 'params': {'database':'mydb','collection':'people','document':{'name':'Salvador'}}
 });
 this.dqput.execute()
 .done(function(){
 console.log("Put document!")
 })
 .fail(function(objerr){
 DfxStudio.showNotification({
 title: objerr.typeError + " Error",
 error: true,
 body: objerr.textError,
 clickToDismiss: true
 });
 });
 }
 return this;
 }

 DfxStudio.executeQuery = function(options) {
 $.when(
 $.getScript( "/all/commons/js/dataquery.js" ),
 $.getScript( "/js/queryConverter/queryConverter.js" ),
 $.Deferred(function( deferred ){
 $( deferred.resolve );
 })
 ).done(function(){

 qm = (typeof qm == "undefined")? {} : qm;
 qm[options.queryName] = (typeof qm[options.queryName] == "undefined")?
 new queryManager(options):
 qm[options.queryName];

 qm[options.queryName][options.action]();

 }).fail(function( jqxhr, settings, exception ) {
 console.log(jqxhr.responseText);
 });

 };
 */
/* END QUERY MANAGEMENT */

/* BUILD APPLICATION */

DfxStudio.buildZipApplication = function (options) {
    window.location = '/studio/compiler/make/zip/' + options.applicationName;
};

DfxStudio.buildDeployApplication = function (options) {
    $('#btnRunApplication').css('display', 'none');
    $('#deployApplicationFailed').css('display', 'none');
    $('#progressDeployApplication').css('display', 'block');
    $('#create-phonegap-archive, #download-app-archive, #build-phonegap').hide();

    h.getFromServer('/studio/compiler/build/create/' + options.applicationName).then(function (data) {
        $('#progressDeployApplication').css('display', 'none');
        if (data) data = JSON.parse(data);

        if (data && data.status === "failed") {
            if (data.message) {
                $('#deployApplicationFailedMessage').text($('#deployApplicationFailedMessage').text() + ': ' + data.message);
            }
            $('#deployApplicationFailed').css('display', 'block');
            $('#btnRunApplication').css('display', 'none');
        } else {
            $('#deployApplicationFailed').css('display', 'none');
            $('#btnRunApplication').css('display', 'block');
            $('#create-phonegap-archive').show();
        }
    });
};

DfxStudio.buildGithubApplication = function (options) {
    h.getFromServer('/studio/compiler/make/github/' + options.applicationName, {}).then(function () {
    });
};

DfxStudio.buildPhoneGapApplication = function (options) {
    h.getFromServer('/studio/compiler/phonegap/' + options.applicationName, {}, 'post').then(function (data) {
        //$('#download-app-archive, #build-phonegap').show();
        $('#download-app-archive').show();
        DfxStudio.showNotification({
            title: 'OK',
            error: false,
            body:  data.data
        });
    }).fail(function (err) {
        DfxStudio.showNotification({
            title: 'Error',
            error: true,
            body:  JSON.parse(err.responseText).error.message
        });
    });
};

DfxStudio.downloadPhoneGapApplication = function (options) {
    h.getFromServer('/studio/compiler/download/' + options.applicationName, {}, 'post').then(function (data) {
        DfxStudio.showNotification({
            title: 'OK',
            error: false,
            body:  data.data
        });
    }).fail(function (err) {
        DfxStudio.showNotification({
            title: 'Error',
            error: true,
            body:  JSON.parse(err.responseText).error.message
        });
    });
};

/* END BUILD APPLICATION */

/* SESSION MANAGEMENT */

DfxStudio.showSession = function (options) {
    var dialog                 = document.createElement("div");
    var id                     = Math.floor(Math.random() * 100000);
    dialog.style['width']      = "600px";
    dialog.style['height']     = "550px";
    dialog.style['z-index']    = "0";
    dialog.style['position']   = "fixed";
    dialog.style['background'] = "white";
    dialog.style['border']     = "black 5px solid";
    dialog.style['top']        = (window.innerHeight - 600) / 2 + "px";
    dialog.style['left']       = (window.innerWidth - 600) / 2 + "px";

    $(dialog).addClass("dfx_content_normal");
    document.body.appendChild(dialog);

    $(dialog).load('/studio/session/view', {
        sessionId: options.sessionId
    }, function (responseText) {
        $(dialog).html("<h1 style=''>Session " + options.sessionId + "</h1><div style='overflow:auto;height:400px'>" + responseText.replace(/\n/g, "<br />").replace(/\t/g, "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp") + "</div><br /><button id=" + id + ">Close</button>");
        $("#" + id).click(function () {
            dialog.style['width']      = "0";
            dialog.style['height']     = "0";
            dialog.style['visibility'] = "hidden";
            $(dialog).html("");
        });
    });
};

/* END SESSION MANAGEMENT */

/* HELP CONTEXT */

DfxStudio.hideHelpContext = function (options) {
    $("#dfx_help_ctx").css("display", "none");
};

DfxStudio.showHelpContext = function (options) {
    $("#dfx_help_ctx").css("display", "block");
};

DfxStudio.loadHelpContext = function (options) {
    h.getFromServer("/studio/help/" + options.screen + ".json").then(function (data) {
        var i = 0;
        $(".dfx_help_ctx_content_article").empty();
        for (i = 0; i < data.steps.length; i++) {
            var article  = data.steps[i];
            var fragment = "<span data-type='context-help-step' step='" + i + "' top='" + article.top + "' left='" + article.left + "' class='dfx_help_ctx_content_article_item'>";
            fragment += "<p class='dfx_help_ctx_content_title'>" + article.title + "</p>";
            fragment += "<p class='dfx_help_ctx_content_text'>" + article.content + "</p></span>";
            $(".dfx_help_ctx_content_article").append(fragment);
        }
        var first_item      = $("span[data-type=context-help-step][step=0]")[0];
        var first_item_top  = $(first_item).attr("top");
        var first_item_left = $(first_item).attr("left");
        $("#dfx_help_ctx").css("top", first_item_top + "px");
        $("#dfx_help_ctx").css("left", first_item_left + "px");
        $(first_item).addClass("dfx_help_ctx_content_article_item_selected");
    });
};

DfxStudio.nextHelpContext = function (options) {
    var nb_articles     = $("span[data-type=context-help-step]").size();
    var current_article = $(".dfx_help_ctx_content_article_item_selected")[0];
    var current_step    = parseInt($(current_article).attr("step"));
    var next_step       = current_step + 1;
    if ((next_step + 1) <= nb_articles) {
        var next_article = $("span[data-type=context-help-step][step=" + next_step + "]")[0];
        var item_top     = $(next_article).attr("top");
        var item_left    = $(next_article).attr("left");
        $("#dfx_help_ctx").css("top", item_top + "px");
        $("#dfx_help_ctx").css("left", item_left + "px");
        $(current_article).removeClass("dfx_help_ctx_content_article_item_selected");
        $("span[data-type=context-help-step][step=" + next_step + "]").addClass("dfx_help_ctx_content_article_item_selected");
    }
};

DfxStudio.previousHelpContext = function (options) {
    var current_article = $(".dfx_help_ctx_content_article_item_selected")[0];
    var current_step    = parseInt($(current_article).attr("step"));
    var prev_step       = current_step - 1;
    if (prev_step >= 0) {
        var prev_article = $("span[data-type=context-help-step][step=" + prev_step + "]")[0];
        var item_top     = $(prev_article).attr("top");
        var item_left    = $(prev_article).attr("left");
        $("#dfx_help_ctx").css("top", item_top + "px");
        $("#dfx_help_ctx").css("left", item_left + "px");
        $(current_article).removeClass("dfx_help_ctx_content_article_item_selected");
        $("span[data-type=context-help-step][step=" + prev_step + "]").addClass("dfx_help_ctx_content_article_item_selected");
    }
};

/* END HELP CONTEXT */

/* LOADING MESSAGE MANAGEMENT */

DfxStudio.updateLoadingBar = function (options) {
    console.log("Updating loading bar: " + JSON.stringify(options));
    if (options.done) {
        setTimeout(function () {
            $('#dfx_header_loadingbar_container').css('opacity', 0);
            $('#dfx_header_loadingbar_title').html("");
            $('##dfx_header_loadingbar_info').css('width', 0 + "%");
            $('#dfx_header_loadingbar_info').html("");
            $('#dfx_header_loadingbar_subtitle').html("");
        }, 5000);
    }
    if (options.error) {
        $('#dfx_header_loadingbar_info').removeClass("progress-bar-info");
        $('#dfx_header_loadingbar_info').addClass("progress-bar-danger");
    } else {
        $('#dfx_header_loadingbar_info').addClass("progress-bar-info");
        $('#dfx_header_loadingbar_info').removeClass("progress-bar-danger");
    }

    options.mode = options.mode ? options.mode : "nobar";
    if (options.mode == 'nobar') {
        // There will usually only be 1 call with a nobar
        $('#dfx_header_loadingbar_container').css('opacity', 1);
        $('#dfx_header_loadingbar_title').html("");
        $('#dfx_header_loadingbar_info').css('width', "100%");
        $('#dfx_header_loadingbar_info').html(options.done ? "Saved!" : "Saving...");
        $('#dfx_header_loadingbar_subtitle').html("");
    } else if (options.mode == 'bar') {
        $('#dfx_header_loadingbar_container').css('opacity', 1);
        $('#dfx_header_loadingbar_title').html(options.title);
        $('#dfx_header_loadingbar_info').css('width', options.percent + "%");
        $('#dfx_header_loadingbar_info').html(Math.floor(options.percent) + "%");
        $('#dfx_header_loadingbar_subtitle').html(options.subtitle);
    }
};

/* END LOADING MESSAGE MANAGEMENT */

/* NOTIFICATION MANAGEMENT */

DfxStudio.showNotification = function (options) {
//    console.log("showNotification: " + JSON.stringify(options));

    if (DfxStudio.notificationStackHeight > 500) {
        DfxStudio.pendingNotifications.push(options);
        DfxStudio.refreshNotifCounter();
        return;
    }

    DfxStudio.refreshNotifCounter();

    var container = document.createElement('div'),
        bodyId    = Math.floor(Math.random() * 1000);

    $(container).addClass('dfx_notification_container');
    $(container).addClass('alert');
    $(container).addClass('fade');
    $(container).addClass('in');
    if (options.error) {
        $(container).addClass('dfx_notification_container_error');
    }
    $(container).html('<div class="dfx_notification_title">' + options.title + '</div>' +
        '<button id="' + bodyId + '_close" class="close" style="right: 0px;"><span class="fa fa-times-circle"></span></button>' +
        '<div class="clearfix"></div>' +
        '<div id="' + bodyId + '" class="dfx_notification_body">' + (options.body ? options.body : '') + '</div>');

    $("body").append(container);
    var width     = (options.width != undefined ? options.width : $(container).width()),
        height    = (options.height != undefined ? options.height : $(container).height());
    height        = height > 400 ? 400 : height;
    $(container).height(height);
    $(container).width(width);
    $(container).css('bottom', -height + 'px');
    $(container).css('right', '10px');
//    $(container).css('right', -width+'px');

//    $(container).css('left', ($("#dfx_footer").width() - width - 50) + "px");

    var previousStackHeight = DfxStudio.notificationStackHeight;
    setTimeout(function () {
//        $(container).css('top', ($("#dfx_footer").position().top - height - 5 - previousStackHeight - 15) + "px");
        $(container).css('bottom', (previousStackHeight + 10) + "px");
    }, 10);

    DfxStudio.notificationStackHeight += height + 20;
    DfxStudio.notifications.push(container);

    // always auto dismiss the notification
    //if (options.autoDismiss) {
    setTimeout(function () {
        DfxStudio.onDismissNotification({
            container: container,
            width:     width,
            height:    height
        });
    }, 5000);
    //}
    $("#" + bodyId + "_close").click(function () {
        setTimeout(function () {
            DfxStudio.onDismissNotification({
                container: container,
                width:     width,
                height:    height
            });
        }, 10);
    });
    if (options.dismissButtonId) {
        $('#' + options.dismissButtonId).click(function () {
            setTimeout(function () {
                DfxStudio.onDismissNotification({
                    container: container,
                    width:     width,
                    height:    height
                });
            }, 10);
        });
    }
    $('#' + bodyId).height(height - $('.dfx_notification_title').height() - $('.dfx_notification_footer').height() - 13);
};

DfxStudio.onDismissNotification = function (options) {
    var container = options.container;
    var width     = options.width;
    var height    = options.height;

    DfxStudio.notificationStackHeight -= height + 5;
    var hasRemoved = false;
    for (var i = 0; i < DfxStudio.notifications.length; i++) {
        if (DfxStudio.notifications[i] === container) {
            DfxStudio.notifications.splice(i, 1);
            break;
        }
    }

    $(container).css('right', (-width - 20) + "px");
    setTimeout(function () {
        $(container).remove();
    }, 1100);
    if (DfxStudio.pendingNotifications.length != 0) {
        DfxStudio.showNotification(DfxStudio.pendingNotifications[0]);
        DfxStudio.pendingNotifications.splice(0, 1);
    }
    DfxStudio.refreshNotifCounter();
    setTimeout(function () {
        var newStackHeight = 0;
        for (var i = 0; i < DfxStudio.notifications.length; i++) {
//            console.log(DfxStudio.notifications[i].height);
//            $(DfxStudio.notifications[i]).css('top', ($("#dfx_footer").position().top - $(DfxStudio.notifications[i]).height() - 5 - newStackHeight - 15) + "px");
            newStackHeight += $(DfxStudio.notifications[i]).height() + 30;
        }
        DfxStudio.notificationStackHeight = newStackHeight;
    }, 10);
};

/* END NOTIFICATION MANAGEMENT */

/* UTILITIES */

DfxStudio.getQueryParam = function (name) {
    var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results == null) {
        return null;
    } else {
        return results[1] || 0;
    }
};

DfxStudio.switchCollapsible = function (id) {
    var $collapsible_icon = $('#dfx_collapsible_icon_' + id),
        $collapsible      = $('#dfx_collapsible_' + id);
    if ($collapsible_icon.hasClass('fa-angle-down')) {
        $collapsible.css('display', 'none');
        $collapsible_icon.removeClass('fa-angle-down').addClass('fa-angle-right');
    } else {
        $collapsible.css('display', 'block');
        $collapsible_icon.removeClass('fa-angle-right').addClass('fa-angle-down');
    }
};

/* END UTILITIES */

DfxStudio.doNothing = function () {
    // do nothing
};

/* DEPRECATED */

DfxStudio.openMenu = function (options) {
    var top_offset          = options.top;
    var left_offset         = options.left;
    var left_offset_padding = 0;
    var i                   = 0;

    if ((left_offset + 150) > $(window).width()) {
        left_offset_padding = ((left_offset + 150) - $(window).width()) + 10;
    }

    $("#dfx_ddmenu_arrow").remove();
    $("#dfx_ddmenu").remove();
    var fragment            = "<div id='dfx_ddmenu_arrow' class='dfx_ddmenu_arrow'></div><div id='dfx_ddmenu' class='dfx_ddmenu'><ul id='dfx_ddmenu_items'></ul></div>";
    $("body").append(fragment);
    $("#dfx_ddmenu_arrow").css("top", top_offset - 6);
    $("#dfx_ddmenu_arrow").css("left", left_offset + 10);
    $("#dfx_ddmenu").css("top", top_offset);
    $("#dfx_ddmenu").css("left", (left_offset - left_offset_padding));

    if (options.items != null) {
        for (i = 0; i < options.items.length; i++) {
            $("#dfx_ddmenu_items").append("<li><a href='#' id='" + options.items[i].id + "'>" + options.items[i].label + "</a></li>");
            $("#" + options.items[i].id).bind('click', {
                action: options.items[i].action
            }, function (event) {
                event.data.action();
            });
        }
    }
};

/* END DEPRECATED */

(function ($) {
    var methods    = {
        init: function (options) {
            // TODO
        }
    };
    $.fn.dfxStudio = function (methodOrOptions) {
        if (methods[methodOrOptions]) {
            return methods[methodOrOptions].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof methodOrOptions === 'object' || !methodOrOptions) {
            // Default to "init"
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on dreamface studio');
        }
    };

})(jQuery);
