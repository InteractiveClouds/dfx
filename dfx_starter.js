/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
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
	log_pmx: false,
	app_build_path: path.resolve(__dirname, './app_builds'),
	edition: 'development',
	storage: 'mongod',
	deployment_server_host: '192.168.12.15',
	deployment_server_port: 3030,
})
.start();


/*
,
	docker_daemon : {
        host : '192.168.99.100',
        port : process.env.DOCKER_PORT || 2376,
        ca   : fs.readFileSync('/Users/olivier/.docker/machine/certs/ca.pem').toString('utf8'),
        cert : fs.readFileSync('/Users/olivier/.docker/machine/certs/cert.pem').toString('utf8'),
        key  : fs.readFileSync('/Users/olivier/.docker/machine/certs/key.pem').toString('utf8')
    }
*/