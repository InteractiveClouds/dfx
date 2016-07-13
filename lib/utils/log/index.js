var channel   = require('../../channels').channels.logger,
    log       = require('./log').init({channel : channel}),
    translate = require('./dict').translate;


var all = [ 'DEBUG', 'INFO ', 'OK   ', 'WARN ', 'ERROR', 'FATAL' ],
    indexLog = new log.Instance({label: 'LOG'}),
    out = exports;


Error.stackTraceLimit = 30; // TODO watch changing

process.on('uncaughtException', function ( e ) {
    indexLog.fatal( 'CATCHED UNCAUGHT EXCEPTION:\n', e );
});

out.Instance = log.Instance;

out.init = {};

/**
 *  @param {Object} o params
 *      @param {Array} [o.stdout.watch=[ 'debug', 'info', 'ok', 'warn', 'error', 'fatal' ]] what levels to log
 *      @param {Array} [o.stdout.stackOn=[ 'error', 'fatal' ]] at what levels print stack trace
 */
out.init.stdout = function ( o ) {

    require('./outputs/stdout').init({
        channel : channel,
        watch   : o.watch
            ? o.watch.map(translate)
            : all,
        stackOn : o.stackOn
            ? o.stackOn.map(translate)
            : ['ERROR', 'FATAL']
    });

    delete out.init.stdout;
};
    
/**
 * @param {Object} o params
 *      @param {Array} [o.watch=[ 'debug', 'info', 'ok', 'warn', 'error', 'fatal' ]] what levels to log
 *      @param {Array} [o.stackOn=[ 'error', 'fatal' ]] at what levels print stack trace
 *      @param {Boolean} [o.rotate=true] to save old log (to rename it with start time/date)
 *      @param {String} o.path path to log
 */
out.init.file = function ( o ) {

    require('./utils/getLogsList').init(o.path);

    require('./outputs/file').init({
        filename: o.filename || 'log.txt',
        path    : o.path,
        rotate  : o.rotate || 0,
        channel : channel,
        watch   : o.watch
            ? o.watch.map(translate)
            : all,
        stackOn : o.stackOn
            ? o.stackOn.map(translate)
            : ['ERROR', 'FATAL']
    });

    delete out.init.file;
};

/**
 * @param {Object} o params
 *      @param {Object} o.socket socket.io socket
 */
out.init.server = function ( o ) {
    require('./outputs/server').init({
        socket  : o.socket,
        channel : channel,
        watch   : o.watch
            ? o.watch.map(translate)
            : all,
        stackOn : o.stackOn
            ? o.stackOn.map(translate)
            : ['ERROR', 'FATAL']
    }, out);
};
