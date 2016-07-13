// TODO
// add port number for test run to settings
// add min-version-check-interval to settings
// check .git dir


// it can create a dir for new version of the package in the parent dir.
// the dir can has one of these names:
// dreamface.version.untested.part  - for package wich is not compleatly loaded
// dreamface.version.untested       - for package wich is not tested
// dreamface.version                - for package wich is ready for running
//
// version of the new package is stored in its package.json
var Q          = require('q'),
    npm        = require('npm'),
    QFS        = require('q-io/fs'),
    spawn      = require('child_process').spawn,
    fork       = require('child_process').fork,
    thePackage = require('../../package.json'),
    path       = require('path'),
    log        = new (require('../utils/log')).Instance({label:'UPGRADE'}),
    endpoints  = require('../utils/endpoints'),

    inProcess             = false,
    parentDir             = path.join(__dirname, '..', '..', '..'), // TODO
    thisVersionPath       = path.join(__dirname, '..', '..'), // TODO
    thisVersion           = thePackage.version,
    thisPackageName       = thePackage.name, // 'dreamface'
    thisRunnedWith        = require.main.filename,
    tempDirMainSuffix     = '.version',
    tempDirUntestedSuffix = '.untested',
    // the suffix appended to temp dir until the module is not 'npm install'ed
    tempDirPartSuffix     = '.part',
    tempDirMovedSuffix    = '.moved',
    staffToCopy = [ // move to SETTINGS
            //'.git',
            //'deploy',
            //path.join('lib', 'dfx_settings.local.js'),
            'resources',
            'logs',
            'run',
            //path.join('lib', 'auth', '.auth.conf')
        ],
    _dir = dir = path.join(
            parentDir,
            thisPackageName           +
                tempDirMainSuffix     +
                tempDirUntestedSuffix +
                tempDirPartSuffix
        ),
    npmConfigLoaded = loadNpmConfigSettings(),
    rgxp_findObject = /^[^{]+(\{[\s\S]+\})[^}]+$/;


function loadNpmConfigSettings () {
    return Q.ninvoke(npm, 'load');
}

function qnpmView ( arr ) {
    return Q.when(npmConfigLoaded, function(){
        var D = Q.defer();

        npm.commands.view(arr, function (error, view) {
            error
                ? D.reject(error)
                : D.resolve(view);
        } );

        return D.promise;
    });
}

function npmInstall ( where, packages ) {
    var args = [where];

    if ( !(where instanceof Array) ) args.push(packages);

    return Q.when(npmConfigLoaded, function () {
        return Q.npost(npm.commands, 'install', args)
    });
}

function isThereNewerVersion () {

    log.info('checking last version...');

    return Q.reject(log.ok('it is the newest version'));

    return qnpmView([thisPackageName, 'dist-tags']).then(function(data){
        var lastVersion = Object.keys(data)[0];

        return lastVersion === thisVersion
            ? Q.reject(log.ok('it is the newest version'))
            : Q.resolve(lastVersion);
    });
}


function loadVersion ( version ) {
    log.info('loading version ' + version);

    return QFS.makeDirectory(dir)
    .then(function(){
        return npmInstall(dir, [thisPackageName])
    })
    .then(function(){

        log.ok('new version ' + version + ' is loaded.');

        return QFS.move(
            path.join(dir, 'node_modules', thisPackageName),
            dir + tempDirMovedSuffix
        );
    })
    .then(function(){
        return QFS.removeTree(dir);
    })
    .then(function(){
        dir += tempDirMovedSuffix;

        log.ok('new version ' + version + ' is moved to ' + dir);
    })
}

function freeTempDirname ( version ) {
    return Q.all([
        QFS.exists(dir),
        QFS.exists(dir + tempDirMovedSuffix)
    ])
    .spread(function(part, moved){

        if ( !part && !moved ) return Q.resolve();
        else log.warn('working directory is unclear');

        var tasks = [];

        if ( part  ) {
            log.info('removing old ' + dir);

            tasks.push(
                QFS.removeTree(dir)
                .then(
                    function(){ log.ok(dir + ' is removed') },
                    log.fatal.bind.log
                )
            );
        }

        if ( moved ) {
            log.info('removing old ' + dir + tempDirMovedSuffix);
            tasks.push(
                QFS.removeTree(dir + tempDirMovedSuffix)
                .then(
                    function(){ log.ok(dir + tempDirMovedSuffix + ' is removed') },
                    log.fatal.bind.log
                )
            );
        }

        return  Q.all(tasks);
    })
    .then(function(){
        return version;
    });
}

function copyStaff () {
    var errors = [],
        tasks = staffToCopy.map(function(fileName){
            if ( typeof fileName !== 'string' ) errors.push(fileName + ' isn\'t string');

            var theFileNameWithPath = path.join(thisVersionPath, fileName);

            return QFS.exists(theFileNameWithPath).then(function(yes){

                var targetFileName = path.join(dir, fileName);

                if ( yes ) {
                    log.info(
                        'copying "' + theFileNameWithPath + '" to "' + targetFileName + '"'
                    );

                    return QFS.copyTree(theFileNameWithPath, targetFileName)
                } else {
                    log.info(
                        '"' + theFileNameWithPath + '" is not existed'
                    );

                    return Q.resolve()
                }
            })
        });

    if ( errors.length ) return Q.reject(Error(errors.join(',\n')));

    return tasks
        ? Q.all(tasks)
        : Q.resolve();
}

function restart () {

    fork( path.join(__dirname, 'restartAfterUpgrade.js'), [
        thisVersionPath,
        dir,
        parentDir,
        thisRunnedWith,
        thisVersion,
        thisPackageName,
        process.pid
    ])
    .unref();
}

function update () {

    log.info('version update is requested...');

    if ( inProcess ) return Q.reject('updating is processing now.');

    inProcess = true;

    return isThereNewerVersion()
    .then(
        freeTempDirname,
        function () {
            return Q.reject('nothing to upgrade.');
        }
    )
    .then(loadVersion)
    .then(copyStaff)
    .then(function () {
        restart();
        return 'restarting';
    })
    .fail(function(error){
        inProcess = false;
        dir = _dir;
        return Q.reject(error);
    })
};


exports.checkVersion = isThereNewerVersion;

exports.update = endpoints.json({
    action  : update,
    log     : log
});
