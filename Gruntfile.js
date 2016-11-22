/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2016 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var config = require('./src/tasks/grunt_config');

module.exports = function (grunt) {
    grunt.initConfig({
        pkg:    grunt.file.readJSON(config.pkg),
        clean:  config.clean,
        copy:   config.copy,
        less:   config.less,
        cssmin: config.cssmin,
        concat: config.concat,
        watch:  config.watch,
        jshint: config.jshint
       // "string-replace" : config.modify
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-concat-css');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    //grunt.loadNpmTasks('grunt-string-replace');

    //grunt.registerTask('test',[
    //   'string-replace:testTask'
    //]);

    grunt.registerTask('dev', [
        'copy_static',
        'console',
        'studio',
        'preview'
    ]);

    grunt.registerTask('copy_static', [
        'copy:studioviews',
		'copy:commons',
		'copy:commons_build',
        'copy:gcontrols',
        'copy:gcontrols_build',
        'copy:fonts',
        'copy:build_fonts',
        'copy:build_img',
        'copy:images'
    ]);

    grunt.registerTask('console', [
        'concat:console_css',
        'concat:console_js',
        'cssmin:console'
    ]);

    grunt.registerTask('studio', [
        'concat:studio_css',
        'concat:studio_editors_css',
        'concat:studio_js',
        'cssmin:studio'
    ]);

    grunt.registerTask('preview', [
        'copy:preview_files',
        'concat:preview_css',
        'concat:preview_js',
        'cssmin:preview'
    ]);

    grunt.registerTask('runtime_web', [
        'copy:runtime_files',
        'concat:runtime_web_css',
        'concat:runtime_web_js',
        'concat:runtime_web_angular_js',
        'cssmin:runtime_web_css'
    ]);

    grunt.registerTask('runtime_mobile', [
        'concat:runtime_mobile_css',
        'concat:runtime_mobile_js',
        'concat:runtime_mobile_angular_js',
        'cssmin:runtime_mobile_css'
    ]);

    grunt.registerTask('init', [
        'clean:build',
        'clean:pub'
    ]);

    grunt.registerTask('build', [
        'init',
        'copy_static',
        'less',
        'console',
        'studio',
        'preview',
        'runtime_web',
        'runtime_mobile'
    ]);

};
