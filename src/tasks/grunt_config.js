/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */


var grunt = require('grunt');
var path = require('path');

var exports = (function () {

    var src = './src/',
        studio = './studio/',
        pkg = './package.json',
        pub = './public/',
        build = './build/';

    var clean = {
        build: [build + '**/*'],
        pub:   [pub + '**/*']
    };

    var banner = (function () {


        var pkg = grunt.file.readJSON(path.join(__dirname, '..', '..', 'package.json'));
        var template = [
            '/**!',
            ' This notice must be untouched at all times.',
            '',
            ' DreamFace DFX',
            ' Version: <%= version %>',
            ' Author: Interactive Clouds',
            '',
            ' Copyright (c) 2016 Interactive Clouds, Inc.' +
            ' "DreamFace" is a trademark of Interactive Clouds, Inc.',
            '',
            ' LICENSE: <%= license %>',
            '*/',
            ''
        ].join('\n');
        return grunt.template.process(template, {data: pkg});
    })();

    var less = (function(){
        var obj = {files : {}};
        obj.files[src + 'css/dfx/dfx-bootstrap.css']   = src + 'less/studio/dreamface-studio-bootstrap.less';
        obj.files[src + 'css/dfx/dfx.css']             = src + 'less/studio/dreamface-studio.less';
        obj.files[src + 'css/dfx/dfx-studio.css']      = src + 'less/studio/dfx.studio.less';
        obj.files[src + 'css/dfx/dfx-view-editor.css'] = src + 'less/studio/dfx.view.editor.less';
        obj.files[src + 'css/dfx/dfx-page-editor.css'] = src + 'less/studio/dfx.page.editor.less';
        obj.files[src + 'css/dfx/dfx-dropzone.css']    = src + 'less/studio/dreamface-studio-dropzone.less';
        obj.files[src + 'css/vendor/bootstrap.css']    = src + 'less/bootstrap/bootstrap.less';
        return {less : obj};
    })();

    var copy = {
        studioviews: {
            expand: true,
            cwd:    src + 'studioviews/',
            src:    ['*'],
            dest:   pub + 'studioviews/',
            filter: 'isFile'
        },
        fonts:             {
            expand: true,
            cwd:    src + 'fonts/',
            src:    ['*'],
            dest:   pub + 'fonts/',
            filter: 'isFile'
        },
        images:            {
            expand: true,
            cwd:    src + 'images/',
            src:    ['*'],
            dest:   pub + 'images/',
            filter: 'isFile'
        },
        vb_icons:            {
            expand: true,
            cwd:    src + 'images/vb/icons',
            src:    ['*'],
            dest:   pub + 'images/vb/icons',
            filter: 'isFile'
        },
        build_fonts:             {
            expand: true,
            cwd:    src + 'fonts/',
            src:    ['*'],
            dest:   build + 'fonts/',
            filter: 'isFile'
        },
        build_img:             {
            expand: true,
            cwd:    src + 'images/',
            src:    ['*'],
            dest:   build + 'images/',
            filter: 'isFile'
        },
        gcontrols:{
            expand: true,
            cwd:    src + 'gcontrols/web/',
            src:    ['*'],
            dest:   'gcontrols/web/',
            filter: 'isFile'
        },
        gcontrols_build:{
            expand: true,
            cwd:    src + 'gcontrols/web/',
            src:    ['*'],
            dest:   build + 'gcontrols/web/',
            filter: 'isFile'
        },
        preview_files:             {
            expand: true,
            cwd:    src + 'js/vendor/',
            src:    [
                'login.js'
            ],
            dest:   pub + 'js/preview',
            filter: 'isFile'
        },
        runtime_files:             {
            expand: true,
            cwd:    src + 'js/vendor/',
            src:    [
                'login.js'
            ],
            dest:   build + 'js',
            filter: 'isFile'
        }
    };


    var concat = {
        console_css: {
            options: {
                banner: banner
            },
            src : [
                src + 'css/dfx/dfx-bootstrap.css',
                src + 'css/vendor/font-awesome.css',
                src + 'css/dfx/dfx.css'
            ],
            dest : pub + 'css/console/dfx.css'
        },
        console_js: {
            options: {
                banner: banner
            },
            src : [
                src + 'js/vendor/jquery.js',
                src + 'js/vendor/bootstrap.js',
                src + 'js/console/jquery.dfxconsole.js'
            ],
            dest : pub + 'js/console/dfx.js'
        },
        studio_css: {
            options: {
                banner: banner
            },
            src : [
                './node_modules/angular-material/angular-material.css',
                './node_modules/codemirror/lib/codemirror.css',
                './node_modules/codemirror/theme/abcdef.css',
                './node_modules/codemirror/addon/dialog/dialog.css',
                './node_modules/codemirror/addon/hint/show-hint.css',
                src + 'css/vendor/font-awesome.css',
                src + 'css/dfx/dfx-studio.css',
                src + 'css/dfx/dfx.css',
                src + 'css/vendor/jquery-ui.css',
                src + 'css/vendor/nv-d3.css',
                src + 'css/vendor/bootstrap.css',
                src + 'css/vendor/jqtree.css',
                src + 'css/vendor/spectrum.css',
                src + 'css/dfx/dfx-dropzone.css',
                src + 'css/dfx/dfx-resourses-panel.css'
            ],
            dest : pub + 'css/studio/dfx.css'
        },
        studio_editors_css: {
            options: {
                banner: banner
            },
            src : [
                './node_modules/angular-material/angular-material.css',
                './node_modules/angular-jk-carousel/dist/jk-carousel.css',
                './node_modules/quill/dist/quill.base.css',
                './node_modules/quill/dist/quill.snow.css',
                './node_modules/angular-material-icons/angular-material-icons.css',
                './node_modules/codemirror/lib/codemirror.css',
                './node_modules/codemirror/theme/abcdef.css',
                './node_modules/codemirror/addon/dialog/dialog.css',
                './node_modules/codemirror/addon/hint/show-hint.css',
                src + 'css/dfx/dfx-gcontrols.css',
                src + 'css/dfx/dfx-core-gcontrols.css',
                src + 'css/vendor/dfx-utils.min.css',
                src + 'css/dfx/dfx-view-editor.css',
                src + 'css/vendor/font-awesome.css',
                src + 'css/dfx/dfx-studio.css',
                src + 'css/dfx/dfx.css',
                src + 'css/vendor/jquery-ui.css',
                src + 'css/vendor/nv-d3.css',
                src + 'css/vendor/bootstrap.css',
                src + 'css/vendor/spectrum.css',
                src + 'css/dfx/dfx-dropzone.css',
                src + 'css/dfx/dfx-resourses-panel.css',
                src + 'css/dfx/block_s-select.css',
                src + 'css/vendor/smartadmin-production.min.css',
                src + 'css/dfx/dfx-page-editor.css'
            ],
            dest : pub + 'css/studio/dfx_editors.css'
        },
        studio_js: {
            options: {
                banner: banner
            },
            src : [
                './node_modules/angular/angular.js',
                './node_modules/angular-aria/angular-aria.js',
                './node_modules/angular-animate/angular-animate.js',
                './node_modules/angular-material/angular-material.js',
                './node_modules/angular-messages/angular-messages.js',
                './node_modules/angular-sanitize/angular-sanitize.js',
                './node_modules/angular-qrcode/angular-qrcode.js',
                './node_modules/angular-material-icons/angular-material-icons.js',
                './node_modules/angular-jk-carousel/dist/jk-carousel.js',
                './node_modules/quill/dist/quill.js',
                './node_modules/ng-quill/src/ng-quill.js',
                './node_modules/svg-morpheus/source/js/svg-morpheus.js',
                './node_modules/codemirror/lib/codemirror.js',
                './node_modules/codemirror/mode/javascript/javascript.js',
                './node_modules/codemirror/mode/css/css.js',
                './node_modules/codemirror/mode/xml/xml.js',
                './node_modules/codemirror/addon/selection/active-line.js',
                './node_modules/codemirror/addon/search/searchcursor.js',
                './node_modules/codemirror/addon/search/match-highlighter.js',
                './node_modules/codemirror/addon/search/search.js',
                './node_modules/codemirror/addon/dialog/dialog.js',
                './node_modules/codemirror/addon/hint/show-hint.js',
                './node_modules/codemirror/addon/hint/javascript-hint.js',
                './node_modules/codemirror/addon/edit/matchbrackets.js',
                src + 'js/vendor/angular-route.js',
                src + 'js/vendor/jquery.js',
                src + 'js/vendor/jquery-ui.js',
                src + 'js/vendor/jade.js',
                src + 'js/vendor/d3.js',
                src + 'js/vendor/jquery-slimscroll.js',
                src + 'js/vendor/bootstrap.js',
                src + 'js/vendor/jquery-cookie.js',
                src + 'js/vendor/nv-d3.js',
                src + 'js/vendor/angular-nvd3.js',
                src + 'js/vendor/spectrum.js',
                src + 'js/vendor/jquery-sparkline.js',
                src + 'js/angular/dfx.app.runtime.js',
                src + 'js/angular/dfx.app.services.js',
                src + 'js/angular/dfx.gcontrols.js',
                src + 'js/angular/dfx.pageeditor.app.js',
                src + 'js/angular/dfx.studio.api.js',
                src + 'js/angular/dfx.studio.app.js',
                src + 'js/angular/dfx.studio.landing.js',
                src + 'js/angular/dfx.vieweditor.app.js',
                src + 'js/vendor/qrcode.js',
                src + 'js/vendor/jquery.knob.js',
                src + 'js/vendor/dropzone.js',
                src + 'js/commons/dfx.directives.js',
                src + 'js/commons/jquery.dfxstudio.js',
                src + 'js/commons/jquery.dfxstudio.helpers.js',
                src + 'js/commons/jquery.dfxstudio.dialogs.js',
                src + 'js/visualbuilder/*.js',
                src + 'js/commons/jquery.dfxstudio.resources.js',
                src + 'js/commons/dfx.utils.js',
                src + 'js/commons/jquery.dfxAjax.js',
                src + 'js/commons/block_s-select.js'
            ],
            dest : pub + 'js/studio/dfx.js'
        },
        preview_css: {
            options: {
                banner: banner
            },
            src : [
                './node_modules/angular-material/angular-material.css',
                './node_modules/angular-jk-carousel/dist/jk-carousel.css',
                './node_modules/angular-material-icons/angular-material-icons.css',
                './node_modules/quill/dist/quill.base.css',
                './node_modules/quill/dist/quill.snow.css',
                src + 'css/vendor/bootstrap.css',
                src + 'css/vendor/nv-d3.css',
                src + 'css/dfx/dfx-gcontrols.css',
                src + 'css/dfx/dfx-core-gcontrols.css',
                src + 'css/vendor/bootstrap.css',
                src + 'css/vendor/font-awesome.css',
                src + 'css/vendor/smartadmin-production.min.css',
                src + 'css/vendor/smartadmin-skins.min.css',
                src + 'css/vendor/dfx-utils.min.css',
                src + 'css/vendor/app_setup.min.css'
            ],
            dest : pub + 'css/preview/dfx.css'
        },
        preview_js: {
            options: {
                banner: banner
            },
            src : [
                './node_modules/angular/angular.js',
                './node_modules/angular-aria/angular-aria.js',
                './node_modules/angular-animate/angular-animate.js',
                './node_modules/angular-material/angular-material.js',
                './node_modules/angular-messages/angular-messages.js',
                './node_modules/angular-sanitize/angular-sanitize.js',
                './node_modules/angular-jk-carousel/dist/jk-carousel.js',
                './node_modules/quill/dist/quill.js',
                './node_modules/ng-quill/src/ng-quill.js',
                './node_modules/svg-morpheus/source/js/svg-morpheus.js',
                './node_modules/angular-material-icons/angular-material-icons.js',
                src + 'js/mobile/des.min.js',
                src + 'js/vendor/angular-route.js',
                src + 'js/mobile/des.min.js',
                src + 'js/mobile/md5.js',
                src + 'js/vendor/d3.js',
                src + 'js/vendor/nv-d3.js',
                src + 'js/vendor/angular-nvd3.js',
                src + 'js/vendor/jquery.js',
                src + 'js/vendor/jquery-sparkline.js',
                src + 'js/vendor/jquery-ui.js',
                src + 'js/vendor/jquery.knob.js',
                src + 'js/vendor/bootstrap.js',
                src + 'js/vendor/authRequest.js',
                src + 'js/vendor/jquery.dreamface-1.0.js',
                src + 'js/angular/dfx.app.runtime.js',
                src + 'js/angular/dfx.app.services.js',
                src + 'js/angular/dfx.gcontrols.js',
                src + 'js/angular/dfx.pageeditor.app.js',
                src + 'js/angular/dfx.studio.api.js',
                src + 'js/angular/dfx.studio.app.js',
                src + 'js/angular/dfx.studio.landing.js',
                src + 'js/angular/dfx.vieweditor.app.js'
            ],
            dest : pub + 'js/preview/dfx.js'
        },
        runtime_web_css: {
            options: {
                banner: banner
            },
            src : [
                './node_modules/angular-material/angular-material.css',
                './node_modules/angular-jk-carousel/dist/jk-carousel.css',
                './node_modules/angular-material-icons/angular-material-icons.css',
                './node_modules/quill/dist/quill.base.css',
                './node_modules/quill/dist/quill.snow.css',
                src + 'css/vendor/nv-d3.css',
                src + 'css/vendor/bootstrap.css',
                src + 'css/vendor/font-awesome.css',
                src + 'css/dfx/dfx-gcontrols.css',
                src + 'css/dfx/dfx-core-gcontrols.css'
            ],
            dest : build + 'css/runtime_web/dfx.css'
        },
        runtime_web_js: {
            options: {
                banner: banner
            },
            src : [
                './node_modules/angular/angular.js',
                './node_modules/angular-aria/angular-aria.js',
                './node_modules/angular-animate/angular-animate.js',
                './node_modules/angular-material/angular-material.js',
                './node_modules/angular-messages/angular-messages.js',
                './node_modules/angular-sanitize/angular-sanitize.js',
                './node_modules/angular-jk-carousel/dist/jk-carousel.js',
                './node_modules/quill/dist/quill.js',
                './node_modules/ng-quill/src/ng-quill.js',
                './node_modules/svg-morpheus/source/js/svg-morpheus.js',
                './node_modules/angular-material-icons/angular-material-icons.js',
                src + 'js/mobile/des.min.js',
                src + 'js/mobile/md5.js',
                src + 'js/vendor/authRequest.js',
                src + 'js/vendor/jquery.js',
                src + 'js/vendor/jquery-ui.js',
                src + 'js/vendor/angular-route.js',
                src + 'js/vendor/d3.js',
                src + 'js/vendor/bootstrap.js',
                src + 'js/commons/dfx.utils.js',
                src + 'js/vendor/nv-d3.js',
                src + 'js/vendor/angular-nvd3.js',
                src + 'js/vendor/jquery-sparkline.js',
                src + 'js/vendor/jquery.knob.js',
                src + 'js/commons/dfx.directives.js',
                src + 'js/vendor/jquery.dreamface-1.0.js',
                src + 'js/angular/dfx.app.runtime.js',
                src + 'js/angular/dfx.app.services.js',
                src + 'js/angular/dfx.gcontrols.js',
                src + 'js/angular/dfx.pageeditor.app.js',
                src + 'js/angular/dfx.studio.api.js',
                src + 'js/angular/dfx.studio.app.js',
                src + 'js/angular/dfx.studio.landing.js',
                src + 'js/angular/dfx.vieweditor.app.js'
            ],
            dest : build + 'js/runtime_web/script.js'
        },
        runtime_web_angular_js: {
            options: {
                banner: banner
            },
            src : [
                src + 'js/commons/dfx.directives.js',
                src + 'js/vendor/jquery.dreamface-1.0.js',
                src + 'js/angular/dfx.app.runtime.js',
                src + 'js/angular/dfx.app.services.js',
                src + 'js/angular/dfx.gcontrols.js',
                src + 'js/angular/dfx.pageeditor.app.js',
                src + 'js/angular/dfx.studio.api.js',
                src + 'js/angular/dfx.studio.app.js',
                src + 'js/angular/dfx.studio.landing.js',
                src + 'js/angular/dfx.vieweditor.app.js'
            ],
            dest : build + 'js/runtime_web/dfx.js'
        },
        runtime_mobile_css: {
            options: {
                banner: banner
            },
            src : [
                './node_modules/angular-material/angular-material.css',
                './node_modules/angular-jk-carousel/dist/jk-carousel.css',
                './node_modules/angular-material-icons/angular-material-icons.css',
                './node_modules/quill/dist/quill.base.css',
                './node_modules/quill/dist/quill.snow.css',
                src + 'css/vendor/nv-d3.css',
                src + 'css/vendor/bootstrap.css',
                src + 'css/vendor/font-awesome.css',
                src + 'css/dfx/dfx-gcontrols.css',
                src + 'css/dfx/dfx-core-gcontrols.css'
            ],
            dest : build + 'css/runtime_mobile/dfx.css'
        },
        runtime_mobile_js: {
            options: {
                banner: banner
            },
            src : [
                './node_modules/angular/angular.js',
                './node_modules/angular-aria/angular-aria.js',
                './node_modules/angular-animate/angular-animate.js',
                './node_modules/angular-material/angular-material.js',
                './node_modules/angular-messages/angular-messages.js',
                './node_modules/angular-sanitize/angular-sanitize.js',
                './node_modules/angular-jk-carousel/dist/jk-carousel.js',
                './node_modules/quill/dist/quill.js',
                './node_modules/ng-quill/src/ng-quill.js',
                './node_modules/svg-morpheus/source/js/svg-morpheus.js',
                './node_modules/angular-material-icons/angular-material-icons.js',
                src + 'js/mobile/des.min.js',
                src + 'js/mobile/md5.js',
                src + 'js/vendor/authRequest.js',
                src + 'js/vendor/jquery.js',
                src + 'js/vendor/jquery-ui.js',
                src + 'js/vendor/jquery.knob.js',
                src + 'js/vendor/angular-route.js',
                src + 'js/vendor/d3.js',
                src + 'js/vendor/bootstrap.js',
                src + 'js/commons/dfx.utils.js',
                src + 'js/vendor/nv-d3.js',
                src + 'js/vendor/angular-nvd3.js',
                src + 'js/vendor/jquery-sparkline.js',
                src + 'js/commons/dfx.directives.js',
                src + 'js/vendor/jquery.dreamface-1.0.js',
                src + 'js/angular/dfx.app.runtime.js',
                src + 'js/angular/dfx.app.services.js',
                src + 'js/angular/dfx.gcontrols.js',
                src + 'js/angular/dfx.pageeditor.app.js',
                src + 'js/angular/dfx.studio.api.js',
                src + 'js/angular/dfx.studio.app.js',
                src + 'js/angular/dfx.studio.landing.js',
                src + 'js/angular/dfx.vieweditor.app.js'
            ],
            dest : build + 'js/runtime_mobile/script.js'
        },
        runtime_mobile_angular_js: {
            options: {
                banner: banner
            },
            src : [
                src + 'js/commons/dfx.directives.js',
                src + 'js/vendor/jquery.dreamface-1.0.js',
                src + 'js/angular/dfx.app.runtime.js',
                src + 'js/angular/dfx.app.services.js',
                src + 'js/angular/dfx.gcontrols.js',
                src + 'js/angular/dfx.pageeditor.app.js',
                src + 'js/angular/dfx.studio.api.js',
                src + 'js/angular/dfx.studio.app.js',
                src + 'js/angular/dfx.studio.landing.js',
                src + 'js/angular/dfx.vieweditor.app.js'
            ],
            dest : build + 'js/runtime_mobile/dfx.js'
        }
    };

    var cssmin = {
        console: {
            expand: true,
            cwd:    pub + 'css/console/',
            src:    ['*.css', '!*.min.css'],
            dest:   pub + 'css/console/',
            ext:    '.min.css'
        },
        studio: {
            expand: true,
            cwd:    pub + 'css/studio/',
            src:    ['*.css', '!*.min.css'],
            dest:   pub + 'css/studio/',
            ext:    '.min.css'
        },
        preview: {
            expand: true,
            cwd:    pub + 'css/preview/',
            src:    ['*.css', '!*.min.css'],
            dest:   pub + 'css/preview/',
            ext:    '.min.css'
        },
        runtime_web_css: {
            expand: true,
            cwd:    build + 'css/runtime_web/',
            src:    ['*.css', '!*.min.css'],
            dest:   build + 'css/runtime_web/',
            ext:    '.min.css'
        },
        runtime_mobile_css: {
            expand: true,
            cwd:    build + 'css/runtime_mobile/',
            src:    ['*.css', '!*.min.css'],
            dest:   build + 'css/runtime_mobile/',
            ext:    '.min.css'
        }
    };

    //var modify = {
    //    'testTask': {
    //        files: [
    //            {expand: true, flatten: true, src: ['./gcontrols/web/image.html'], dest: './gcontrols/web/'}
    //        ],
    //        options: {
    //            replacements: [{
    //                pattern: "$eval(attributes.src.value)",
    //                replacement: "$eval(attributes.src.value).replace('/assets','resources/assets')"
    //            }]
    //        }
    //    }
    //};

    var config = {
        pkg:    pkg,
        clean:  clean,
        less:   less,
        copy:   copy,
        concat: concat,
        cssmin: cssmin
    };

    return config;

})();

module.exports = exports;