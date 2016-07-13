var cmd  = require('child_process').exec,
    path = require('path'),

    Q    = require('q'),
    QFS  = require('q-io/fs'),
    uuid = require('node-uuid'),

    TMPDIR = require('os').tmpdir(),
    prefix = '',
    log = (function(){
        var boundConsole = console.log.bind(console, '[TEMP_DIR_TOOL]');
        return {
            info  : boundConsole,
            error : boundConsole,
            //debug : boundConsole,
            //ok    : boundConsole,
            //warn  : boundConsole,
            //fatal : boundConsole
        };
    })();

exports.init = function ( o ) {

    if ( o.log )    log    = o.log;
    if ( o.path )   TMPDIR = o.path;
    if ( o.prefix ) prefix = o.prefix;

    log.info('PREFIX: ' + prefix + ', PATH: ' + TMPDIR);

    delete exports.init;
};

exports.exec = function ( func ) {

    var wrkDir = path.join(TMPDIR, prefix + uuid.v1()); //random

    return QFS.makeTree(wrkDir).then(
        function(){

            log.info('new temp dir is created "' + wrkDir + '"');

            return func(wrkDir)
            .then(
                function (data) {
                    return rm_r(wrkDir)
                    .then(function(){ return Q.resolve(data) })
                    .fail(function(){ return Q.resolve(data) })
                },
                function (error) {
                    return rm_r(wrkDir)
                    .then(function(){ return Q.reject(error) })
                    .fail(function(_error){ return Q.reject(error) })
                }
            )
        },
        function(error){
            log.error(
                'can not create the temp dir "' + wrkDir + '", error: ',
                error
            );
            return Q.reject(error);
        }
    );
};

// TODO crossplatform
function rm_r ( p ) {

    if ( process.env.DFX_DO_NOT_RM_TEMP_DIRS ) {
        log.warn('the temp dir : ', p, 'is not removed')
        return Q.resolve();
    }

    var D = Q.defer();

    cmd('rm -r ' + p, function(error, stdout, stderr){

        var _error = error || stderr;

        if ( _error ) {
            log.error(
                'can not delete temp dir "' + p + '", error',
                _error
            );
            D.reject(_error);
        } else {
            log.info('the temp dir "' + p + '" is deleted');
            D.resolve();
        }
    })

    return D.promise;
}
