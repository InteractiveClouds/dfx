var spawn = require('child_process').spawn,
    fork  = require('child_process').fork,
    fs    = require('graceful-fs'),
    path  = require('path'),
    Q     = require('q'),
    QFS   = require('q-io/fs'),


    oldVersionPath = process.argv[2],
    newVersionPath = process.argv[3],
    workingDir     = process.argv[4],
    runWith        = process.argv[5],
    oldVersion     = process.argv[6],
    packageName    = process.argv[7],
    oldProcessPid  = process.argv[8],

    nameForOldVersion = oldVersionPath + '.version.' + oldVersion,


    Log = require(path.join(oldVersionPath, 'lib', 'utils', 'log')),

    logFileName  = packageName + '.version.' + oldVersion + '.upgrade.log.txt',
    killAttempts = 0;


Log.init.file({
    path     : workingDir,
    filename : logFileName
});


Log.init.stdout({});

var log = new Log.Instance({label:'UPGRADE_CHILD'});


var isServerKilled = (function () {

    var D = Q.defer();

    return function () {
    
        // check if parent still alive
        try { process.kill(oldProcessPid, 0); }
        catch ( e ) { return D.resolve(log.ok('Server is killed')) }


        log.warn('parent process is still alive.');

        if ( ++killAttempts > 20 ) {
            return D.reject('Can\'t kill server.');
        } else {
            setTimeout(isServerKilled, 500);
            if ( killAttempts === 1 ) return D.promise;
        }
    }
})();

// TODO create temp log

log.info(
    '\n'                                 ,
    'oldVersionPath = ' + oldVersionPath ,
    'newVersionPath = ' + newVersionPath ,
    'workingDir     = ' + workingDir     ,
    'runWith        = ' + runWith        ,
    'oldVersion     = ' + oldVersion     ,
    'packageName    = ' + packageName    ,
    'oldProcessPid  = ' + oldProcessPid  ,
    ''
);

log.info(
    'Trying to kill server, its pid is ' + oldProcessPid +
    ', my pid is ' + process.pid + '.'
);

try { process.kill(oldProcessPid, 'SIGINT'); }
catch ( e ) { return log.error('Can\'t kill parent process.', e); }

process.chdir(workingDir);


isServerKilled()
.then(freeDirname)
.then(function () {
    return QFS.rename(oldVersionPath, nameForOldVersion)
})
.then(function () {
    return QFS.rename(newVersionPath, oldVersionPath)
})
.then(function(){
    try {
        process.chdir(oldVersionPath)
    } catch (e) {
        return Q.reject(
            'can not change dir to "' + oldVersionPath + '". ' + e.message
        );
    }

    var newServer = fork(runWith);

    newServer.unref();

    log.info('starting new dfx server with pid: ' + newServer.pid);
})
.then(
    function(){
        process.exit();
    },
    function(error){
        log.error(error.stack || error);
        process.exit();
    }
);


function freeDirname () {
    log.info('checking if "'+nameForOldVersion+'" exists...');
    return QFS.exists(nameForOldVersion)
    .then(function (exists) {
        log.info(nameForOldVersion + ' does' + (exists ? ' ' : ' not ') + 'exist.');
        return exists ? QFS.removeTree(nameForOldVersion) : null;
    });
}
