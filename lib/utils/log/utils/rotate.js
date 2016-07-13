var Q    = require('q'),
    QFS  = require('q-io/fs'),
    path = require('path'),
    getLogsList = require('./getLogsList');


var logDir,
    logFn = 'log.txt',
    maxInLogDir = 0,
    oldLogPath;



module.exports = function ( n, dir ) {

    if ( !n ) return Q.resolve();

    maxInLogDir = n;

    logDir = dir;
    oldLogPath  = path.join(logDir, logFn);

    return getLogInfo(oldLogPath)
        .then(renameOldLog)
        .fin(removeExcess);
};



function getLogInfo ( pathToLog ) {
    return QFS.stat(pathToLog)
        .then(function(stat){
            return Q.all([
                
                QFS.open(pathToLog, {
                    falgs : 'r',
                    end   : 50
                }).then(getReaden),
        
                QFS.open(pathToLog, {
                    falgs : 'r',
                    begin : stat.size - 12, // 9 digits left, so 999 999 999 is max number
                    end   : stat.size
                }).then(getReaden)
        
            ]).spread(function(begin, end){
                var started = begin.replace(/^log\screated\sat\s(\d+)\n[\s\S]+/, '$1'),
                    quantity = end.replace(/[\s\S]*%%(\d+)\n$/, '$1') || 0;
        
                return /^\d+$/.test(started) && /^\d+$/.test(quantity)
                    ? Q.resolve({
                            started  : started,
                            quantity : quantity
                        })
                    : Q.reject('wrong format of the log file') // TODO use log.error
            })
        })
}


function renameOldLog ( o ) {
    var newLogPath = path.join(
            logDir,
            logInfoToName(o)
        );

    return QFS.rename(oldLogPath, newLogPath)
}


function removeExcess () {

    return getLogsList().then(function(list){

        var logFilesQuantity = list.length,
            last   = logFilesQuantity - maxInLogDir,
            toRemove,
            promises;

        if ( last < 1 ) return Q.resolve();

        toRemove = list.splice(0, last);

        promises = toRemove.map(function(fileName){
            return QFS.remove(path.join(logDir, fileName));
        });

        return Q.all(promises);
    });
}


function getReaden ( buff ) {
    var res = buff.read();

    buff.close();

    return res;
}


function logInfoToName ( o ) {
    return o.started + '_' + o.quantity + '.log.txt';
}
