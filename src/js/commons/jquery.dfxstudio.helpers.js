/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var h = {};

/**
 * makes request to server,
 * parses the answer,
 * handles errors (shows notifications, and rejects the promise)
 *
 * @param {String} path
 * @param {Object} params - jquery-params for request
 * @param {String) [method="get"] - 'post' or 'get'
 *
 * @returns {Promise | Object} answer ( data or error )
 */
h.getFromServer = function (path, reqParams, method, passError) {
    //if ( path === '/studio/home' ) throw new Error('HOME');
    var params  = {};
    params.data = reqParams;
    params.type = method ? method.toUpperCase() : 'GET';
    params.statusCode = {
        401: function () {
            var tenant = DfxStudio.tenantId;

            window.location = '/studio/' + ( tenant ? tenant + '/' : '' ) + 'login'
        }
    },
        params.success = function (data, textStatus, jqXHR) {

            if (typeof data !== 'object') {
                return $.Deferred().reject({error: 'broken data, not object'});
            }

            return data.error ? $.Deferred().reject(data) : data;
        };
    params.error = function (data, textStatus, errorThrown) {
        if (passError) {
            var answer = {};
            try {
                answer = JSON.parse(data.responseText);
            } catch (e) {
            }
            answer.status = data.status;
            return answer;
        }

        var errorTitle = 'unknown error';
        if (data && data.error) {
            if (typeof data.error === 'function') {
                errorTitle = textStatus || 'connection error';
                // TODO check how DfxStudio.showNotifications renders it ( without &nbsp; it is awful )
                errorBody = errorTitle || 'try&nbsp;later';
            } else {
                errorTitle = 'error';
                errorBody  = data.responseText;
            }
        }
        DfxStudio.showNotification({title: errorTitle, error: true, body: errorBody});

        return data;
    };
    return $.ajax(path, params);
};


/**
 * loads and compiles templates if it is not loaded yet
 *
 * @param {String} path to templates (part of it after '/studio/templates/')
 * @param {Boolean} [force="false"] to load templates even if its are loaded already
 * @returns {Promise}
 */
h.loadTemplates = function (path, force) {
    path = path
        .replace(/^\/|\/$/g, '')
        .replace(/\s+/g, '');

    var pathArr = path.split('/'),
        exists  = true,
        current = DfxStudio.templates;

    for (var i = 0, l = pathArr.length; i < l; i++) {
        if (!current[pathArr[i]]) {
            current[pathArr[i]] = {};
            exists              = false;
        }
        current = current[pathArr[i]];
    }

    return exists && !force ?
        $.Deferred().resolve() :
        this.getFromServer('/studio/templates/' + path).done(function (res) {
            var data = JSON.parse(res.data);
            for (var idx in data) {
                if (data.hasOwnProperty(idx)) {
                    if (current.hasOwnProperty(idx)) delete current[idx];
                    (function (idx) {
                        Object.defineProperty(current, idx, {
                            enumerable : true,
                            get: function () {
                                if (!current.compiled) current.compiled = {};
                                if (current.compiled[idx]) {
                                    return current.compiled[idx];
                                } else {
                                    current.compiled[idx] = jade.compile(data[idx]);
                                    return current.compiled[idx];
                                }
                            }
                        })
                    })(idx);
                }
            }
        });
};

$.ajax('/templates/block_s-select.jade').then(function (data) {
    if (!DfxStudio.templates.blocks) DfxStudio.templates.blocks = {};
    DfxStudio.templates.blocks['s-select'] = jade.compile(data);
});

/**
 * Function to upload files using POST AJAX request
 *
 * @param filesToUpload
 */
var dfx_files_upload = function (filesToUpload, url) {
    // Create a FormData object and add the files
    var formData = new FormData();
    $.each(filesToUpload, function (key, value) {
        formData.append(key, value);
    });

    $.ajax({
        url:         url,
        type:        'POST',
        data:        formData,
        cache:       false,
        dataType:    'json',
        processData: false, // Don't process the files
        contentType: false, // Set content type to false as jQuery will tell the server it's a query string request
        success:     function (data) {
            DfxStudio.showNotification({
                title: 'OK:',
                error: false,
                body:  'Files successfully uploaded.'
            });
        },
        error:       function (error) {
            DfxStudio.showNotification({
                title: 'Can\'t upload files',
                error: true,
                body:  error
            });
        }
    });
};

/**
 * Module contains functions common for GCs.
 */
var dfx_gc_common_helpers = (function () {
    var showAsExpression = function (value) {
        return (value && value.indexOf('{{') > -1 && value.indexOf('}}') > -1) ? '{{expression}}' : value;
    };

    /*
     * Public API.
     */
    return {
        showAsExpression: showAsExpression
    };
})();
