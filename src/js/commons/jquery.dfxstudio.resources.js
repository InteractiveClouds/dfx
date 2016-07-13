/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

DfxStudio.Resources = (function ($, window, document) {
    var _private = {

            getAll: function (callback) {
                // var  applicationName = DfxVisualBuilder.applicationName;
                var  applicationName = $("body").attr('data-application');

                dfxAjax.post('/studio/resources', {
                    action:          'list',
                    applicationName: applicationName,
                    include_commons: true
                }).then(function (resources) {
                    callback(resources);
                });
            },

            getShared: function (callback) {
                dfxAjax.post('/studio/resources', {action: 'list'})
                    .then(function (resources) {
                        callback(resources);
                    });
            }
        },

        exports  = {

            init: function () {
                // nothing for the moment
            },

            getAllResources: function (callback) {
                _private.getAll(callback);
            },

            getSharedResources: function (callback) {
                _private.getShared(callback);
            },

            getWidgetImageResources: function (callback) {
                _private.getAll(function (resources) {
                    var wgt_img_res   = [];

                    var includeImageResource = function (resource) {
                        wgt_img_res.push({
                            name:        resource.name,
                            application: resource.application,
                            images:      $.grep(resource.items, function (item) {
                                item.path = '/' + resource.studio_res_path + '/' + item.path;

                                // return item.type == 'Image';
                                if ( item.type.toLowerCase().indexOf('image') === 0 ) {
                                    return item;
                                }
                            })
                        });
                    };

                    for (var i = 0; i < resources.length; i++) {
                        var resource = resources[i];
                        if (resource.name != 'assets') continue;//images can be only in assets
                        includeImageResource(resource);
                    }
                    callback(wgt_img_res);
                }, true);
            }
        };

    return exports;

})(jQuery, window, document);
