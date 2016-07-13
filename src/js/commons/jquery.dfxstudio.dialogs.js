/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

DfxStudio.Dialogs = (function ($, window, document, undefined) {

    var _private = {

            current: null,

            modal: null,

            addMethod: function (object, name, predicate) {
                var old      = object[name];
                object[name] = function () {
                    if (predicate.length == arguments.length) {
                        return predicate.apply(this, arguments);
                    } else if (typeof old == 'function') {
                        return old.apply(this, arguments);
                    }
                };
            },

            createPopup: function (title, body, buttons) {
                $('body').append('<div class="dfx_popup_window_shade"></div>' +
                    '<div class="dfx_popup_window_body">' +
                    '<h3>' + title + '</h3>' +
                    '<div class="dfx_popup_window_content">' +
                    body +
                    '</div>' +
                    buttons +
                    '</div>');
                var $d       = $('.dfx_popup_window_body');
                this.current = $d;
                $d.css('top', (window.innerHeight - $d.height()) / 2 + 'px')
                    .css('left', (window.innerWidth - $d.width()) / 2 + 'px')
                    .show();
                return $d;
            },

            createModal: function (title) {
                $('body').append('<div class="dfx_modal_window_shade"></div>' +
                    '<div class="dfx_modal_window_body">' +
                    '<h3>' + title + '</h3>' +
                    '<div class="progress">' +
                    '<div id="progressBar" class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width:1%;"></div></div>' +
                    '<p id="webSocketsEventBox"></p>' +
                    '</div></div>' +
                    '</div>');
                var $d     = $('.dfx_modal_window_body');
                this.modal = $d;
                $d.css('top', (window.innerHeight - $d.height()) / 2 + 'px')
                    .css('left', (window.innerWidth - $d.width()) / 2 + 'px')
                    .show();
                return $d;
            },

            createStripedBarModal: function (title) {
                $('body').append('<div class="dfx_modal_window_shade"></div>' +
                    '<div class="dfx_modal_window_body">' +
                    '<h3>' + title + '</h3>' +
                    '<div class="progress">' +
                    '<div id="progressBar" class="progress-bar progress-bar-success progress-bar-striped active" role="progressbar" aria-valuenow="99" aria-valuemin="0" aria-valuemax="100" style="width:100%;"></div></div>' +
                    '<p id="webSocketsEventBox"></p>' +
                    '</div></div>' +
                    '</div>');
                var $d     = $('.dfx_modal_window_body');
                this.modal = $d;
                $d.css('top', (window.innerHeight - $d.height()) / 2 + 'px')
                    .css('left', (window.innerWidth - $d.width()) / 2 + 'px')
                    .show();
                return $d;
            },

            removePopup: function () {
                this.current = null;
                $('.dfx_popup_window_body').remove();
                $('.dfx_popup_window_shade').remove();
            },

            removeModal: function () {
                this.modal = null;
                $('.dfx_modal_window_body').remove();
                $('.dfx_modal_window_shade').remove();
            },

            confirmDialog: function (prompt, positiveCallback, negativeCallback, body, positiveButton, negativeButton) {
                if (this.current === null) {
                    body           = body === undefined ? '' : body;
                    positiveButton = positiveButton === undefined ? 'OK' : positiveButton;
                    negativeButton = negativeButton === undefined ? 'Cancel' : negativeButton;
                    var self       = this,
                        buttons    = '<button id="dfx_confirm_positive" class="btn btn-info btn-sm">' +
                            '<span class="fa fa-lg fa-check"></span>' +
                            '<span style="padding-left: 5px;">' + positiveButton + '</span>' +
                            '</button>' +
                            '<button id="dfx_confirm_negative" class="btn btn-danger btn-sm">' +
                            '<span class="fa fa-lg fa-times"></span>' +
                            '<span style="padding-left: 5px;">' + negativeButton + '</span>' +
                            '</button>',
                        $dialog    = this.createPopup(prompt, body, buttons);
                    $("#dfx_confirm_positive").click(function () {
                        positiveCallback($('.form', $dialog));
                        self.removePopup();
                    });
                    $("#dfx_confirm_negative").click(function () {
                        negativeCallback();
                        self.removePopup();
                    });
                }
            },

            selectDialog: function (prompt, body, buttons) {
                if (this.current === null) {
                    var self    = this,
                        btns    = '';
                    $.each(buttons, function (index, value) {
                        btns += '<button data-option="' + index + '" class="btn ' + (value.class !== undefined ? value.class : 'btn-info') + ' btn-sm">' +
                            '<span class="fa fa-lg ' + (value.icon !== undefined ? value.icon : 'fa-square') + '"></span>' +
                            '<span style="padding-left: 5px;">' + value.title + '</span>' +
                            '</button>';
                    });
                    var $dialog = this.createPopup(prompt, body, btns);
                    $('button', $dialog).click(function () {
                        self.current = null;
                        buttons[$(this).data('option')].callback();
                        self.removePopup();
                    });
                }
            },

            formDialog: function (prompt, form, positiveCallback, negativeCallback) {
                if (this.current === null) {
                    var self    = this,
                        body    = '<div class="form">' + form + '</div>',
                        buttons = '<button id="dfx_confirm_positive" class="btn btn-info btn-sm">' +
                            '<span class="fa fa-lg fa-check"></span>' +
                            '<span style="padding-left: 5px;">OK</span>' +
                            '</button>' +
                            '<button id="dfx_confirm_negative" class="btn btn-danger btn-sm">' +
                            '<span class="fa fa-lg fa-times"></span>' +
                            '<span style="padding-left: 5px;">Cancel</span>' +
                            '</button>',
                        $dialog = this.createPopup(prompt, body, buttons);
                    $('input[type=text]:first-of-type', $dialog).focus();
                    $("#dfx_confirm_positive").click(function () {
                        self.current = null;
                        positiveCallback($('.form', $dialog));
                        self.removePopup();
                    });
                    $("#dfx_confirm_negative").click(function () {
                        self.current = null;
                        negativeCallback();
                        self.removePopup();
                    });
                    $('input[type=text]', $dialog).on('keypress', function (e) {
                        if (e.keyCode == 13) {
                            self.current = null;
                            positiveCallback($('.form', $dialog));
                            self.removePopup();
                        }
                    });
                    $(document).on('keyup', function (e) {
                        if (e.keyCode == 27) {
                            $(document).off('keyup');
                            self.current = null;
                            negativeCallback();
                            self.removePopup();
                        }
                    });
                }
            },

            formDialogWithRequiredFields: function (prompt, form, positiveCallback, negativeCallback, enableSubmitCallback) {
                if (this.current === null) {
                    var self    = this,
                        body    = '<div class="form">' + form + '</div>',
                        buttons = '<button id="dfx_confirm_positive" class="btn btn-info btn-sm">' +
                            '<span class="fa fa-lg fa-check"></span>' +
                            '<span style="padding-left: 5px;">OK</span>' +
                            '</button>' +
                            '<button id="dfx_confirm_negative" class="btn btn-danger btn-sm">' +
                            '<span class="fa fa-lg fa-times"></span>' +
                            '<span style="padding-left: 5px;">Cancel</span>' +
                            '</button>',
                        $dialog = this.createPopup(prompt, body, buttons);
                    $("#dfx_confirm_positive").click(function () {
                        self.current = null;
                        positiveCallback($('.form', $dialog));
                        self.removePopup();
                    });
                    $("#dfx_confirm_negative").click(function () {
                        self.current = null;
                        negativeCallback();
                        self.removePopup();
                    });
                    $("input", $dialog).change(function () {
                        enableSubmitCallback($dialog);
                    });
                }
            },

            promptDialog: function (prompt, placeholder, positiveCallback, negativeCallback, value) {
                value = value ? value : '';
                if (this.current === null) {
                    var self    = this,
                        body    = '<div class="form-group">' +
                            '<input id="dfx_prompt_input" type="text" name="dfx_prompt_input" placeholder="' + placeholder + '" value="' + value + '" class="form-control">' +
                            '</div>',
                        buttons = '<button id="dfx_confirm_positive" class="btn btn-info btn-sm">' +
                            '<span class="fa fa-lg fa-check"></span>' +
                            '<span style="padding-left: 5px;">OK</span>' +
                            '</button>' +
                            '<button id="dfx_confirm_negative" class="btn btn-danger btn-sm">' +
                            '<span class="fa fa-lg fa-times"></span>' +
                            '<span style="padding-left: 5px;">Cancel</span>' +
                            '</button>',
                        $dialog = this.createPopup(prompt, body, buttons);
                    $('#dfx_prompt_input').focus();
                    $("#dfx_confirm_positive").click(function () {
                        self.current = null;
                        positiveCallback($('#dfx_prompt_input', $dialog).val());
                        self.removePopup();
                    });
                    $("#dfx_confirm_negative").click(function () {
                        self.current = null;
                        negativeCallback();
                        self.removePopup();
                    });
                    $('input[type=text]', $dialog).on('keypress', function (e) {
                        if (e.keyCode == 13) {
                            self.current = null;
                            positiveCallback($('#dfx_prompt_input', $dialog).val());
                            self.removePopup();
                        }
                    });
                    $(document).on('keyup', function (e) {
                        if (e.keyCode == 27) {
                            $(document).off('keyup');
                            self.current = null;
                            negativeCallback();
                            self.removePopup();
                        }
                    });
                }
            }

        },

        exports  = {

            init: function () {
                _private.addMethod(this, 'confirmDialog', function (options) {
                    _private.confirmDialog(options.prompt, options.positiveCallback,
                        options.negativeCallback, options.body, options.positiveButton, options.negativeButton);
                });
                _private.addMethod(this, 'confirmDialog', function (prompt, positiveCallback, negativeCallback) {
                    _private.confirmDialog(prompt, positiveCallback, negativeCallback);
                });
                _private.addMethod(this, 'selectDialog', function (options) {
                    _private.selectDialog(options.prompt, options.body !== undefined ? options.body : 'xxx',
                        options.buttons);
                });
                _private.addMethod(this, 'selectDialog', function (prompt, body, buttons) {
                    _private.selectDialog(prompt, body, buttons);
                });
                _private.addMethod(this, 'formDialog', function (options) {
                    _private.formDialog(options.prompt, options.form,
                        options.positiveCallback, options.negativeCallback);
                });
                _private.addMethod(this, 'formDialogWithRequiredFields', function (options) {
                    _private.formDialogWithRequiredFields(options.prompt, options.form,
                        options.positiveCallback, options.negativeCallback, options.enableSubmitCallback);
                });
                _private.addMethod(this, 'formDialog', function (prompt, form, positiveCallback, negativeCallback) {
                    _private.formDialog(prompt, form, positiveCallback, negativeCallback);
                });
                _private.addMethod(this, 'promptDialog', function (options) {
                    _private.promptDialog(options.prompt, options.placeholder,
                        options.positiveCallback, options.negativeCallback, options.value);
                });
                _private.addMethod(this, 'promptDialog', function (prompt, placeholder, positiveCallback, negativeCallback, value) {
                    _private.promptDialog(prompt, placeholder, positiveCallback, negativeCallback, value);
                });

                return this;
            },

            pleaseWait: function (title) {
                _private.createModal(title);
            },

            pleaseWaitWithStripedBar: function (title) {
                _private.createStripedBarModal(title);
            },

            removeModal: function () {
                _private.removeModal();
            }

        };

    return exports.init();

})(jQuery, window, document);
