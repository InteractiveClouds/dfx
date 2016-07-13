/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var exports,
    grunt = require('grunt');

exports = (function () {

    var config,
        root = './',
        src = './src/',
        studio = './studio/',
        temp = './.tmp/',
        pkg = './package.json',
        pub = './public/',
        build = './build/';

    var clean = {
        build: [build + '**/*'],
        pub:   [pub + '**/*'],
        temp:  [
            pub + 'js/console/*.js',
            '!' + pub + 'js/console/*.min.js',
            pub + 'js/studio/*.js',
            '!' + pub + 'js/studio/*.min.js',
            pub + 'js/visualbuilder/*.js',
            '!' + pub + 'js/visualbuilder/*.min.js',
            pub + 'js/preview/*.js',
            '!' + pub + 'js/preview/*.min.js'
        ]
    };

    /**
     * Format and return the header for files
     * @return {String}           Formatted file header
     */
    var banner = (function () {

        var path = require('path'),
            pkg = grunt.file.readJSON(path.join(__dirname, '..', '..', 'package.json'));
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

    var less = (function () {
        var bootstrap,
            dfx_bs,
            dfx,
            dfx_studio,
            dfx_view_editor,
            dfx_page_editor,
            dfx_tree,
            dfx_fg,
            dfx_dz;

        bootstrap = dfx_bs = dfx = dfx_studio = dfx_view_editor = dfx_page_editor = dfx_dz = dfx_tree = dfx_fg = {
                    files: {}
                };

        dfx_bs.files[src + 'css/dfx/dfx-bootstrap.css'] = src + 'less/studio/dreamface-studio-bootstrap.less';
        dfx.files[src + 'css/dfx/dfx.css'] = src + 'less/studio/dreamface-studio.less';
        dfx_studio.files[src + 'css/dfx/dfx-studio.css'] = src + 'less/studio/dfx.studio.less';
        dfx_view_editor.files[src + 'css/dfx/dfx-view-editor.css'] = src + 'less/studio/dfx.view.editor.less';
        dfx_page_editor.files[src + 'css/dfx/dfx-page-editor.css'] = src + 'less/studio/dfx.page.editor.less';
        dfx_dz.files[src + 'css/dfx/dfx-dropzone.css'] = src + 'less/studio/dreamface-studio-dropzone.less';
        //dfx_dz.files[src + 'css/dfx/dfx-resourses-panel.css'] = src + 'less/studio/dreamface-studio-resourses-panel.less';
        //dfx_tree.files[src + 'css/dfx/dfx-tree.css'] = src + 'less/studio/dreamface-studio-tree.less';
        //dfx_tree.files[src + 'css/dfx/dfx-flexigrid.css'] = src + 'less/studio/flexigrid.less';
        bootstrap.files[src + 'css/vendor/bootstrap.css'] = src + 'less/bootstrap/bootstrap.less';

        return {
            bootstrap:         bootstrap,
            dfx_bs:            dfx_bs,
            dfx:               dfx,
            dfx_studio:        dfx_studio,
            dfx_view_editor:   dfx_view_editor,
            dfx_page_editor:   dfx_page_editor
            //dfx_tree:          dfx_tree,
           // dfx_dz:            dfx_dz
            //dfx_fg:            dfx_fg
        };

    })();

    var cssmin = {
        vendor: {
            expand: true,
            cwd:    src + 'css/vendor/',
            src:    ['*.css', '!*.min.css'],
            dest:   pub + 'css/vendor/',
            ext:    '.min.css'
        },
        dfx:    {
            expand: true,
            cwd:    src + 'css/dfx/',
            src:    ['*.css', '!*.min.css'],
            dest:   pub + 'css/dfx/',
            ext:    '.min.css'
        },
        mobile: {
            expand: true,
            cwd:    src + 'css/mobile/',
            src:    ['*.css', '!*.min.css'],
            dest:   build + 'css/mobile/',
            ext:    '.min.css'
        }
    };

    var concat = {
        angular: {
            options: {
                banner: banner
            },
            src:     [
                src + 'js/angular/dfx.studio.api.js',
                src + 'js/angular/dfx.studio.landing.js',
                src + 'js/angular/dfx.studio.app.js',
                src + 'js/angular/dfx.gcontrols.js',
                src + 'js/angular/dfx.vieweditor.app.js',
                src + 'js/angular/dfx.pageeditor.app.js',
                src + 'js/angular/dfx.app.services.js',
                src + 'js/angular/dfx.app.runtime.js'
            ],
            dest:    pub + 'js/angular/dfx.js'
        },
        angular_build: {
            options: {
                banner: banner
            },
            src:     [
                src + 'js/angular/dfx.studio.api.js',
                src + 'js/angular/dfx.gcontrols.js',
                src + 'js/angular/dfx.vieweditor.app.js',
                src + 'js/angular/dfx.pageeditor.app.js',
                src + 'js/angular/dfx.app.services.js',
                src + 'js/angular/dfx.app.runtime.js'
            ],
            dest:    build + 'js/angular/dfx.js'
        },
        //studio: {
        //    options: {
        //        banner: banner
        //    },
        //    src:     [
        //        src + 'js/commons/jquery.dfxstudio.js',
        //        src + 'js/commons/jquery.dfxstudio.routing.js',
        //        src + 'js/studio/*.js',
        //        src + 'js/studio/home/*.js',
        //        src + 'js/commons/jquery.dfxstudio.helpers.js',
        //        src + 'js/commons/jquery.dfxstudio.dialogs.js',
        //        src + 'js/studio/jquery.dfxstudio.picker-image-modal.js',
        //        //src + 'js/commons/dfx.gcontrols.js',
        //        //src + 'js/commons/dfx.bcontrols.js',
        //        src + 'js/commons/dfx.directives.js',
        //        src + 'js/commons/jquery.dfxAjax.js',
        //        src + 'js/commons/dataquery.js',
        //        src + 'js/commons/block_s-select.js'
        //    ],
        //    dest:    pub + 'js/studio/jquery.dfxstudio.js'
        //},
        visualbuilder:           {
            options: {
                banner: banner
            },
            src:     [
                src + 'js/commons/jquery.dfxstudio.js',
                src + 'js/commons/jquery.dfxstudio.helpers.js',
                src + 'js/commons/jquery.dfxstudio.dialogs.js',
                src + 'js/visualbuilder/*.js',
                src + 'js/commons/jquery.dfxstudio.resources.js',
                //src + 'js/commons/dfx.directives.js',
                src + 'js/commons/dfx.utils.js',
                src + 'js/commons/jquery.dfxAjax.js',
                src + 'js/commons/dataquery.js',
                src + 'js/commons/block_s-select.js'
            ],
            dest:    pub + 'js/visualbuilder/jquery.dfx.visualbuilder.js'
        },
        console:                 {
            options: {
                banner: banner
            },
            src:     [
                src + 'js/console/*.js'
            ],
            dest:    pub + 'js/console/jquery.dfx.console.js'
        },
        web:                     {
            options: {
                banner: banner
            },
            src:     [
                //src + 'js/mobile/authRequest.js',
                src + 'js/commons/dataquery.js'
                //src + 'js/commons/dfx.utils.js',
                //src + 'js/commons/dfx.directives.js',
                //src + 'js/commons/jquery.dfxAjax.js',
                //src + 'js/mobile/jquery.dreamface-1.0.js',
                //src + 'js/commons/dfx.widgets.js'
            ],
            dest:    build + 'js/web/dfx.web.js'
        },
        mobile:                  {
            options: {
                banner: banner
            },
            src:     [
                src + 'js/commons/dataquery.js'
                //src + 'js/commons/dfx.utils.js',
                //src + 'js/commons/dfx.directives.js',
                //src + 'js/commons/dfx.widgets.js',
                //src + 'js/commons/jquery.dfxAjax.js',
                //src + 'js/mobile/authRequest.js',
                //src + 'js/mobile/jquery.dreamface-1.0.js'
            ],
            dest:    build + 'js/mobile/dfx.mobile.js'
        },
        wgt_mobile_auth_preview: {
            options: {
                banner: banner
            },
            src:     [
                src + 'js/commons/dataquery.js',
                src + 'js/mobile/authRequest.js',
                src + 'js/mobile/jquery.dreamface-1.0.js'
            ],
            dest:    pub + 'js/preview/dfx.preview-auth.js'
        },
        wgt_auth_preview:        {
            options: {
                banner: banner
            },
            src:     [
                src + 'js/mobile/authRequest.js',
                src + 'js/mobile/jquery.dreamface-1.0.js'
            ],
            dest:    pub + 'js/preview/dfx.preview.js'
        }
    };

    var jshint = {
        grunt:            ['Gruntfile.js', src + 'tasks/grunt.config.js'],
        wgt_auth_preview: concat.wgt_auth_preview.src
    };

    var copy = {
        css_lib: {
            expand: true,
            cwd:    './node_modules/',
            src:    ['angular-material/angular-material.css',
                     'angular-jk-carousel/dist/jk-carousel.css',
                     'quill/dist/quill.base.css',
                     'quill/dist/quill.snow.css',
                     'angular-material-icons/angular-material-icons.css'
                    ],
            dest:   pub + 'css/lib',
            filter: 'isFile'
        },
        css_lib_build: {
            expand: true,
            cwd:    './node_modules/',
            src:    ['angular-material/angular-material.css',
                     'angular-jk-carousel/dist/jk-carousel.css',
                     'quill/dist/quill.base.css',
                     'quill/dist/quill.snow.css',
                     'angular-material-icons/angular-material-icons.css'
                    ],
            dest:   build + 'css/lib',
            filter: 'isFile'
        },
        js_lib: {
            expand: true,
            cwd:    './node_modules/',
            src:    ['angular/angular.js',
                     'angular-aria/angular-aria.js',
                     'angular-animate/angular-animate.js',
                     'angular-material/angular-material.js',
                     'angular-messages/angular-messages.js',
                     'angular-sanitize/angular-sanitize.js',
                     'angular-jk-carousel/dist/jk-carousel.js',
                     'angular-qrcode/angular-qrcode.js',
                     'quill/dist/quill.js',
                     'ng-quill/src/ng-quill.min.js',
                     'svg-morpheus/source/js/svg-morpheus.js',
                     'angular-material-icons/angular-material-icons.min.js'
                    ],
            dest:   pub + 'js/lib',
            filter: 'isFile'
        },
        js_lib_build: {
            expand: true,
            cwd:    './node_modules/',
            src:    ['angular/angular.js',
                     'angular-aria/angular-aria.js',
                     'angular-animate/angular-animate.js',
                     'angular-material/angular-material.js',
                     'angular-messages/angular-messages.js',
                     'angular-sanitize/angular-sanitize.js',
                     'angular-jk-carousel/dist/jk-carousel.js',
                     'quill/dist/quill.js',
                     'ng-quill/src/ng-quill.min.js',
                     'svg-morpheus/source/js/svg-morpheus.js',
                     'angular-material-icons/angular-material-icons.min.js'
                    ],
            dest:   build + 'js/lib',
            filter: 'isFile'
        },
        studioviews: {
            expand: true,
            cwd:    src + 'studioviews/',
            src:    ['*'],
            dest:   pub + 'studioviews/',
            filter: 'isFile'
        },
        gcontrols_web: {
            expand: true,
            cwd:    src + 'gcontrols/web/',
            src:    ['*'],
            dest:   'gcontrols/web/',
            filter: 'isFile'
        },
        gcontrols_web_build: {
            expand: true,
            cwd:    src + 'gcontrols/web/',
            src:    ['*'],
            dest:   build + 'gcontrols/web/',
            filter: 'isFile'
        },
        fonts:             {
            expand: true,
            cwd:    src + 'fonts/',
            src:    ['*'],
            dest:   pub + 'fonts/',
            filter: 'isFile'
        },
        templates:         {
            expand: true,
            cwd:    src + 'templates/',
            src:    ['*'],
            dest:   pub + 'templates/',
            filter: 'isFile'
        },
        images:            {
            expand: true,
            cwd:    src + 'images/',
            src:    ['*'],
            dest:   pub + 'images/',
            filter: 'isFile'
        },
        images_sampleapps:            {
            expand: true,
            cwd:    src + 'images/sampleapps',
            src:    ['*'],
            dest:   pub + 'images/sampleapps',
            filter: 'isFile'
        },
        core_gcontrols_css:        {
            expand: true,
            cwd:    pub + 'css/dfx/',
            src:    [
                'dfx-core-gcontrols.min.css'
            ],
            dest:   build + 'css/vendor/',
            filter: 'isFile'
        },
        vendor_css:        {
            expand: true,
            cwd:    pub + 'css/vendor/',
            src:    [
                'bootstrap.min.css',
                'font-awesome.min.css',
                'nv-d3.min.css',
                'spectrum.min.css'
            ],
            dest:   build + 'css/vendor/',
            filter: 'isFile'
        },
        public_css:        {
            expand: true,
            cwd:    pub + 'css/dfx/',
            src:    [
                'dfx-gcontrols.min.css',
                'dfx-core-gcontrols.min.css'
            ],
            dest:   build + 'css/vendor/',
            filter: 'isFile'
        },
        package_css:       {
            expand: true,
            cwd:    src + 'packages/std/css/',
            src:    [
                'smartadmin-production.min.css',
                'smartadmin-skins.min.css',
                'app_setup.min.css'
            ],
            dest:   build + 'css/vendor/',
            filter: 'isFile'
        },
        mobile_css:        {
            expand: true,
            cwd:    pub + 'css/dfx/',
            src:    [
                'dfx-gcontrols.min.css'
            ],
            dest:   build + 'css/mobile/',
            filter: 'isFile'
        },
        mobile_css_vb:     {
            expand: true,
            cwd:    src + '/packages/std/css',
            src:    [
                'dfx-utils.min.css'
            ],
            dest:   build + 'css/mobile/',
            filter: 'isFile'
        },
        dfx_utils_css:     {
            expand: true,
            cwd:    src + 'packages/std/css/',
            src:    [
                'dfx-utils.min.css'
            ],
            dest:   build + 'css/web/',
            filter: 'isFile'
        },
        vendor_js:         {
            expand: true,
            cwd:    pub + 'js/vendor/',
            src:    [
                'angular.min.js',
                'angular-route.min.js',
                'd3.min.js',
                'jquery.min.js',
                'jquery-ui.min.js',
                'bootstrap.min.js',
                'nv-d3.min.js',
                'angular-nvd3.min.js',
                'spectrum.min.js',                
                'jquery-inputmask.min.js',
                'jquery-sparkline.min.js',
                // maps
                'angular.min.js.map',
                'angular-route.min.js.map',
                'd3.min.js.map',
                'jquery.min.js.map',
                'jquery-ui.min.js.map',
                'bootstrap.min.js.map',
                'nv-d3.min.js.map',
                'angular-nvd3.min.js.map',
                'spectrum.min.js.map',                
                'jquery-inputmask.min.js.map',
                'jquery-sparkline.min.js.map',
                'dropzone.js',
                'qrcode.js'
            ],
            dest:   build + 'js/vendor/',
            filter: 'isFile'
        },
        mobile_js:         {
            expand: true,
            cwd:    src + 'js/mobile/',
            src:    [
                'des.min.js',
                'md5.js',
                'login.js'
            ],
            dest:   build + 'js/vendor/',
            filter: 'isFile'
        },
        mobile_common_js:         {
            expand: true,
            cwd:    src + 'js/commons/',
            src:    [
                'jquery.dfxAjax.js',
                'dfx.widgets.js',
                'dfx.directives.js',
                'dfx.utils.js'
            ],
            dest:   build + 'js/commons/',
            filter: 'isFile'
        },
        mobile_mobile_js:         {
            expand: true,
            cwd:    src + 'js/mobile/',
            src:    [
                'jquery.dreamface-1.0.js',
                'authRequest.js'
            ],
            dest:   build + 'js/commons/',
            filter: 'isFile'
        },
        mobile_stdmobile_js:         {
            expand: true,
            cwd:    src + 'packages/std-mobile/js/',
            src:    [
                'app_setup_mobile.min.js'
            ],
            dest:   build + 'js/mobile/',
            filter: 'isFile'
        },
        mobile_preview_js: {
            expand: true,
            cwd:    src + 'packages/std/js/',
            src:    [
                'jarvis.widget.min.js'
            ],
            dest:   pub + 'js/vendor/',
            filter: 'isFile'
        },
        package_js:        {
            expand: true,
            cwd:    src + 'packages/std/js/',
            src:    [
                'jarvis.widget.min.js',
                'notification/*',
                'plugin/**/*',
                'app_setup.min.js'
            ],
            dest:   build + 'js/vendor/',
            filter: 'isFile'
        },
        package_img:        {
            expand: true,
            cwd:    src + 'packages/std/img/',
            src:    [
                'alpha*',
                'hue*',
                'saturation*'
            ],
            dest:   pub + 'images/',
            filter: 'isFile'
        },
        min_js:            {
            expand: true,
            cwd:    studio + 'js/',
            src:    [
                'des.min.js',
                'md5.js'
            ],
            dest:   build + 'js/vendor/',
            filter: 'isFile'
        },
        visualbuilder:     {
            expand: true,
            cwd:    src + 'packages/std/css/',
            src:    [
                'dfx-utils.min.css'
            ],
            dest:   pub + 'css/visualbuilder/',
            filter: 'isFile'
        },
        visualbuilder_commons:     {
            expand: true,
            cwd:    src + 'js/commons/',
            src:    [
                'dfx.directives.js'
            ],
            dest:   pub + 'js/visualbuilder',
            filter: 'isFile'
        },
        visualbuilder_pkg: {
            expand: true,
            cwd:    src + 'packages/std/css/',
            src:    [
                'smartadmin-production.min.css',
                'smartadmin-skins.min.css',
                'app_setup.min.css'
            ],
            dest:   pub + 'css/visualbuilder/',
            filter: 'isFile'
        },
        wgt_preview:       {
            expand: true,
            cwd:    src + 'js/mobile/',
            src:    [
                'des.min.js',
                'md5.js',
                'login.js'
            ],
            dest:   pub + 'js/vendor/',
            filter: 'isFile'
        },
        wgt_preview_dt:    {
            expand: true,
            cwd:    src + 'packages/std/js/plugin/datatables',
            src:    [
                'dataTables.bootstrap.min.js',
                'dataTables.colReorder.min.js',
                'dataTables.colVis.min.js',
                'dataTables.extensions.min.js',
                'dataTables.tableTools.min.js',
                'jquery.dataTables.min.js'
            ],
            dest:   pub + 'js/preview/datatables/',
            filter: 'isFile'
        },
        build_fonts:             {
            expand: true,
            cwd:    src + 'fonts/',
            src:    [
                'FontAwesome.otf',
                'fontawesome-webfont.eot',
                'fontawesome-webfont.svg',
                'fontawesome-webfont.ttf',
                'fontawesome-webfont.woff',
                'fontawesome-webfont.woff2',
                'glyphicons-halflings-regular.eot',
                'glyphicons-halflings-regular.svg',
                'glyphicons-halflings-regular.ttf',
                'glyphicons-halflings-regular.woff',
                'glyphicons-halflings-regular.woff2'
            ],
            dest:   build + 'fonts/',
            filter: 'isFile'
        },
        build_img:             {
            expand: true,
            cwd:    src + 'packages/std-mobile/img/',
            src:    [
                'mybg.png',
                'locked.png',
                'flags/*'
            ],
            dest:   build + 'img/',
            filter: 'isFile'
        }
    };

    var uglify = {
        vendor: {
            options: {
                sourceMap:               true,
                sourceMapIncludeSources: true,
                preserveComments:        'some'
            },
            files:   [{
                expand: true,
                cwd:    src + 'js/vendor/',
                src:    ['**/*.js'],
                dest:   pub + 'js/vendor/',
                ext:    '.min.js',
                filter: function (src) {
                    return !/\/mode-|theme-|worker-\w+\.js$/.test(src);
                }
            }]
        },
        ace_js:             {
            options: {
                sourceMap:               true,
                sourceMapIncludeSources: true,
                preserveComments:        'some'
            },
            files:   [{
                expand: true,
                cwd:    src + 'js/vendor/',
                src:    ['**/*.js'],
                dest:   pub + 'js/vendor/',
                filter: function (src) {
                    return /\/mode-|theme-|worker-\w+\.js$/.test(src);
                }
            }]
        },
        //studio:             {
        //    options: {
        //        sourceMap:               true,
        //        sourceMapIncludeSources: true,
        //        preserveComments:        'some'
        //    },
        //    files:   [{
        //        src:  pub + 'js/studio/jquery.dfxstudio.js',
        //        dest: pub + 'js/studio/jquery.dfxstudio.min.js'
        //    }]
        //},
        visualbuilder:      {
            options: {
                sourceMap:               true,
                sourceMapIncludeSources: true,
                preserveComments:        'some'
            },
            files:   [{
                src:  pub + 'js/visualbuilder/jquery.dfx.visualbuilder.js',
                dest: pub + 'js/visualbuilder/jquery.dfx.visualbuilder.min.js'
            }]
        },
        console:            {
            options: {
                sourceMap:               true,
                sourceMapIncludeSources: true,
                preserveComments:        'some'
            },
            files:   [{
                src:  pub + 'js/console/jquery.dfx.console.js',
                dest: pub + 'js/console/jquery.dfx.console.min.js'
            }]
        },
        soap:               {
            options: {
                sourceMap:               true,
                sourceMapIncludeSources: true,
                preserveComments:        'some'
            },
            files:   grunt.file.expandMapping(
                ['js/commons/dfx.soap.js'],
                pub,
                {
                    cwd:    src,
                    rename: function (destBase, destPath) {
                        return destBase + destPath.replace('.js', '.min.js');
                    }
                }
            )
        },
        wgt_auth_preview:   {
            options: {
                sourceMap:               true,
                sourceMapIncludeSources: true,
                preserveComments:        'some'
            },
            files:   [{
                src:  pub + 'js/preview/dfx.preview.js',
                dest: pub + 'js/preview/dfx.preview.min.js'
            }]
        },
        wgt_mobile_preview: {
            options: {
                sourceMap:               true,
                sourceMapIncludeSources: true,
                preserveComments:        'some'
            },
            files:   [{
                src:  pub + 'js/preview/dfx.mobile.js',
                dest: pub + 'js/preview/dfx.mobile.min.js'
            }]
        },
        login:              {
            options: {
                sourceMap:               true,
                sourceMapIncludeSources: true,
                preserveComments:        'some'
            },
            files:   [{
                src:  src + 'js/mobile/login.js',
                dest: pub + 'js/preview/login.min.js'
            }]
        }
    };

    var watch = {
        dfx_bs_less:      {
            files:   src + 'less/studio/dreamface-studio-bootstrap.less',
            tasks:   ['less:dfx_bs', 'cssmin:dfx'],
            options: {
                debounceDelay: 250
            }
        },
        dfx_less:         {
            files:   src + 'less/studio/dreamface-studio.less',
            tasks:   ['less:dfx', 'cssmin:dfx'],
            options: {
                debounceDelay: 250
            }
        },
        //studio_js:        {
        //    files:   concat.studio.src,
        //    tasks:   ['concat:studio', 'uglify:studio'],
        //    options: {
        //        debounceDelay: 250
        //    }
        //},
        visualbuilder_js: {
            files:   concat.visualbuilder.src,
            tasks:   ['concat:visualbuilder', 'uglify:visualbuilder'],
            options: {
                debounceDelay: 250
            }
        },
        gruntfiles:       {
            files:   [root + 'Gruntfile.js', src + 'tasks/grunt.config.js'],
            tasks:   ['build'],
            options: {
                debounceDelay: 250
            }
        }
    };

    config = {
        pkg:    pkg,
        clean:  clean,
        less:   less,
        uglify: uglify,
        concat: concat,
        copy:   copy,
        cssmin: cssmin,
        watch:  watch,
        jshint: jshint
    };

    return config;

})();

module.exports = exports;