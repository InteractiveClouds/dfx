/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */
var log = new (require('./utils/log')).Instance({label: "DFX_Validator"});
var packageJson = require('./../package.json');
var path = require('path');
var SETTINGS = require('./dfx_settings');
var mdbw = require('./mdbw')(SETTINGS.mdbw_options);
var AR = require('./authRequest');
var QFS = require('q-io/fs');
var Q = require('q');

var semver = require('semver');

var Validator = {};

Validator.verifyExternalHostValue = function () {
    AR.getRequestInstance().get({url: 'http://wtfismyip.com/json'})
        .then(function (data) {
            var body = data.body.toString('utf-8');
            verifyExternalServerHost(JSON.parse(body).YourFuckingIPAddress);
        })
        .fail(function (err) {
            AR.getRequestInstance().get({url: 'http://api.ipify.org?format=json'})
                .then(function (data) {
                    var body = data.body.toString('utf-8');
                    verifyExternalServerHost(JSON.parse(body).ip);
                })
                .fail(function (err) {
                    log.warn("Can't connect to Verifying IP services");
                });
        });


}

function verifyExternalServerHost(ip) {
    if (ip != SETTINGS.external_server_host) {
        log.warn("Ip adress of yours server don't equal to external_server_host value from DFX settings!" +
        " If you are going to build applications you need to set external_server_host = " + ip + " \n");
    }
    // Verify ip
    var url = 'http://' + ip + ':' + SETTINGS.external_server_port;
    AR.getRequestInstance().get({url: url})
        .fail(function (err) {
            log.warn("Can't connect to server " + url);
        });

}

function getVersion() {
    return mdbw.get('dreamface_sysdb', 'settings', {name: "dfx version"})
    .then(function (res) {
        return (res && res.length > 0 && res[0].version)
            ? res[0].version
            : '0.0.1';
    })
}

function getPatches(currentVersion, packageJsonVersion, type) {

    var patchesPath = path.join(__dirname, '..', 'patches');

    return QFS.list(patchesPath)
    .then(function (list) {

        var filesList = list.filter(function (val) {
            var patchVersion = val.replace(".js", "");
            return (
                semver.valid(patchVersion) &&
                semver.gt(patchVersion,currentVersion) &&
                semver.lte(patchVersion,packageJsonVersion)
            );
        });

        if (type=='1') {
            log.info('local environment version : ' + currentVersion);
            log.info('code version              : ' + packageJsonVersion);
            log.info('patches to apply          : ', filesList);
        } else {
            console.log('local environment version : ' + currentVersion);
            console.log('code version              : ' + packageJsonVersion);
            console.log('patches to apply          : ', filesList);
        }

        return filesList;
    })
}

function runPatches(list){

    var D = Q(1);

    list.forEach(function (fileName) {

        var patch = require('../patches/' + fileName);

        D = D.then(patch.run).then(
            function(){

                log.ok({
                    patch       : fileName,
                    description : patch.description || 'none',
                    result      : 'success'
                });

                return saveVersion(fileName.replace('.js', ''));
            },
            function(error){

                log.warn({
                    patch       : fileName,
                    description : patch.description || 'none',
                    result      : 'failed'
                });

                return Q.reject(error);
            }
        )
    });

    return D;
}

function saveVersion(version){
    return mdbw.update(
        'dreamface_sysdb',
        'settings',
        {name: 'dfx version'},
        {
            name: 'dfx version',
            version: version
        },
        {multi: false, upsert: false}
    );
}

Validator.getVersionInfo = function() {

    var packageJsonVersion = packageJson.version;

    return getVersion()
    .then(function(res){

        var currentVersion = res;

        if (semver.gt(packageJsonVersion,currentVersion)) {
            return getPatches(currentVersion, packageJsonVersion,2)
        } else {
            console.log(res);
        }
    });
}


Validator.executePatches = function () {

    var packageJsonVersion = packageJson.version;

    return getVersion()
    .then(function(res){
        var currentVersion = res;
        if (semver.gt(packageJsonVersion,currentVersion)) {
            return getPatches(currentVersion, packageJsonVersion, 1)
            .then(runPatches)
            .then(function(){
                // if no patches was found
                saveVersion(packageJsonVersion);
            });
        } else {
            return Q.resolve()
        }
    })
}

module.exports = Validator;

