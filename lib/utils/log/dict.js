var dict = {
    'dbg'   : 'DEBUG',
    'debug' : 'DEBUG',
    'DEBUG' : 'DEBUG',

    'error' : 'ERROR',
    'ERROR' : 'ERROR',

    'warn'  : 'WARN ',
    'WARN ' : 'WARN ',
    'WARN'  : 'WARN ',

    'info'  : 'INFO ',
    'INFO ' : 'INFO ',
    'INFO'  : 'INFO ',

    'fatal' : 'FATAL',
    'FATAL' : 'FATAL',

    'ok'    : 'OK   ',
    'OK'    : 'OK   ',
    'OK   ' : 'OK   '
};


exports.translate = function translate ( e ) {
    if ( !dict.hasOwnProperty(e) ) throw('LOGGER. Unknown level "' + e + '".');
    return dict[e];
}
