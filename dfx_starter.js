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
	auth_conf_path : path.resolve(__dirname, './lib/auth/.auth.conf'),
  app_build_path: path.resolve(__dirname, './app_builds'),
  tempDirForTemplates: path.resolve(__dirname, './temp'),
  tempDir : 'tmp',
  resources_deploy_path: 'resources',
  resources_development_path: path.resolve(__dirname, '..', './resources'),
  fsdb_path: path.resolve(__dirname, '..', './app_fsdb'),
  deploy_path: path.resolve(__dirname, '..', './deploy'),
	log_pmx: false,
	edition: 'development',
	storage: 'mongod',
	deployment_server_host: 'localhost',
	deployment_server_port: 3030
})
.start();
