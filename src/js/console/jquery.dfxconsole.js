/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

DfxConsole = (function ($, window, document, undefined) {

    var _private = {

            current: null,

            createPopup: function (title, body, buttons) {
                $('body').append('<div class="dfx_popup_window_shade"></div>' +
                '<div class="dfx_popup_window_body">' +
                '<h3>' + title + '</h3>' +
                '<div class="dfx_popup_window_content" style="margin-bottom: 15px;">' +
                body +
                '</div>' +
                buttons +
                '</div>');
                var $d = $('.dfx_popup_window_body');
                this.current = $d;
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

            addModal: function () {
                if (!$('#dataConfirmModal').length) {
                    $('body').append('<div id="dataConfirmModal" class="modal fade" role="dialog" aria-labelledby="dataConfirmLabel" aria-hidden="true">'
                    + '<div class="modal-dialog">'
                    + '<div class="modal-content">'
                    + '<div class="modal-header">'
                    + '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>'
                    + '<h3 id="dataConfirmLabel">Please Confirm</h3></div>'
                    + '<div class="modal-body"></div>'
                    + '<div class="modal-footer">'
                    + '<button class="btn" data-dismiss="modal" aria-hidden="true">Cancel</button>'
                    + '<a class="btn btn-primary" id="dataConfirmOK">OK</a></div></div></div></div>');
                }
            },

            attachHandlers: function () {

                $('a[data-confirm]').click(function (e) {
                    var href = $(this).attr('href');
                    this.addModal();
                    $('#dataConfirmModal').find('.modal-body').html('<h4>' + $(this).attr('data-confirm') + '</h4>');
                    $('#dataConfirmOK').attr('href', href);
                    $('#dataConfirmModal').modal('show');
                    return false;
                });

            },

            confirmDialog: function (prompt, positiveCallback, negativeCallback) {
                if (this.current === null) {
                    var self = this,
                        body = '',
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
                        positiveCallback($('.form', $dialog));
                        self.removePopup();
                    });
                    $("#dfx_confirm_negative").click(function () {
                        negativeCallback();
                        self.removePopup();
                    });
                }
            },

            warningDialog: function (prompt, body, callback) {
                if (_private.current === null) {
                    var self = this,
                        buttons = '<button id="dfx_confirm_positive" class="btn btn-info btn-sm">' +
                            '<span class="fa fa-lg fa-check"></span>' +
                            '<span style="padding-left: 5px;">OK</span>' +
                            '</button>',
                        $dialog = this.createPopup(prompt, body, buttons);
                    $("#dfx_confirm_positive").click(function () {
                        self.removePopup();
                        if (callback !== undefined) callback();
                    });
                }
            }

        },

        exports = {

            init: function (settings) {
                _private.attachHandlers();
            },

            generateToken: function (e) {
                e.preventDefault();
                var elem = $('#tenantGenerateToken'),
                    token = elem.parents('.input-group').find('#tenantToken').val(),
                    tenant_name = $('#tenantId').val(),
                    data = {'token': token};
                _private.addModal();
                $('#dataConfirmModal').find('.modal-body').html('<h4>' + elem.attr('data-confirm') + '</h4>');
                $('#dataConfirmOK').unbind('click');
                $('#dataConfirmOK').click(function (ev) {
                    $.post('/console/' + tenant_name + '/generateToken/', data)
                        .then(function (resp) {
                            var o = JSON.parse(resp);
                            $('#tenantToken').val(o.token);
                            $('#dataConfirmModal').modal('hide');
                        });
                    return false;
                });
                $('#dataConfirmModal').modal('show');
                return false;
            },

            removeToken: function (e) {
                var elem = $(e.target),
                    parentDiv = elem.parents('.input-group'),
                    token = parentDiv.find('#tenantToken').val(),
                    tenant_name = $('#tenantId').val(),
                    data = {'token': token};
                $.post('/console/' + tenant_name + '/removeToken/', data)
                    .then(function (resp) {
                        parentDiv.remove();
                    });
            },

            createTenant: function (e) {
                var id = $('#fldTenantID').val(),
                    pass = $('#fldPassword').val(),
                    errors = [];

                if (!id) {
                    errors.push("Tenant's ID is required.");
                }

                if (!pass) {
                    errors.push("Password is required.");
                } else if (pass.length < 4) {
                    errors.push("Password length should be at least 4 symbols.");
                }

                if (errors.length) {
                    _private.warningDialog(
                        'There are errors on the form. Please correct them and try again.',
                        errors.join('<br>'));
                } else {
                    $.post('/console/tenant/create', $('#tenantCreate').serialize())
                        .done(function (data) {
                            _private.warningDialog(
                                'Your tenant has been successfully created.',
                                '',
                                function () {
                                    window.location.reload();
                                });
                        })
                        .fail(function (error) {
                            _private.warningDialog(
                                'Can not create tenant.',
                                error.responseText
                            );
                        });
                }
            },

            changePassword: function (e) {
                var oldPass = $('#oldPassword').val(),
                    newPass = $('#newPassword1').val(),
                    confirm = $('#newPassword2').val(),
                    errors = [];

                if (!oldPass) {
                    errors.push('Current password is required.');
                } else if (newPass == oldPass) {
                    errors.push("Old and new passwords should not match.");
                }

                if (!newPass || !confirm) {
                    errors.push("New password and it's confirm is required.");
                } else if (newPass !== confirm) {
                    errors.push("New password and it's confirm should match.");
                } else if (newPass.length < 4) {
                    errors.push("New password length should be at least 4 symbols.");
                }

                if (errors.length) {
                    _private.warningDialog(
                        'There are errors on the form. Please correct them and try again.',
                        errors.join('<br>'));
                } else {
                    $.post('/console/changepassword', $('#changePassword').serialize())
                        .done(function (data) {
                            _private.warningDialog(
                                'Your password has been successfully changed.',
                                '',
                                function () {
                                    window.location = '/console/login';
                                });
                        })
                        .fail(function (error) {
                            _private.warningDialog(
                                'Can not change password.',
                                error.responseText
                            );
                        });
                }

            },

            confirmRemovingTenant: function (tenant) {
                _private.confirmDialog('Are you sure you want to delete tenant "' + tenant + '"?',
                    function () {
                        window.location = '/console/' + tenant + '/remove';
                    },
                    function () {

                    });
            }

        };

    return exports;

})(jQuery, window, document);
