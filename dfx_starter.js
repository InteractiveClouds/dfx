/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */
var path = require('path');
var fs = require('fs');

var dreamface = require('./dfx')
.init({
	studio_version: 3,
	server_port: 3000,
	auth_conf_path : '/Users/olivier/Documents/Dev/ic/workspace/.auth.conf',

	fsdb_path: '/Users/olivier/Documents/Dev/ic/workspace/app_fsdb',
	deploy_path: '/Users/olivier/Documents/Dev/ic/workspace/deploy',
	app_build_path: '/Users/olivier/Documents/Dev/ic/workspace/build',

	tempDir: '/Users/olivier/Documents/Dev/ic/workspace/tmp',
	tempDirForTemplates: '/Users/olivier/Documents/Dev/ic/workspace/temp',

	resources_development_path: '/Users/olivier/Documents/Dev/ic/workspace/resources',
 	resources_development_path: '/Users/olivier/Documents/Dev/ic/workspace/resources',

 	public_dir_path: '/Users/olivier/Documents/Dev/ic/dfx/public',

 	log_pmx: false,
	edition: 'development',
	storage: 'mongod',
	deployment_server_host: 'localhost',
	deployment_server_port: 3030
})
.start();
