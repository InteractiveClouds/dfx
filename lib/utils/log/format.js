var colors = {
        'WARN ' : '\033[33m',
        'ERROR' : '\033[31m',
        'FATAL' : '\033[31m\033[1m',
        'INFO ' : '',
        'DEBUG' : '',
        'OK   ' : '\033[32m',
        dim     : '\033[2m',
        clear   : '\033[0m'
    };

exports.color = function ( o ) {
    return  colors[o.level] + o.level + colors['clear'] + ' ' +
            colors['dim'] + ' [' + o.label + '] ' + colors['clear'] +
            o.text
}

exports.plain = function ( o ) {
    return '\n' +
        o.level + ' ' + o.time + ' [' + o.label + '] ' + o.text;
}

exports.oneString = {};

exports.oneString.encode = function ( m, doStack ) {
    return [

        m.level,
        m.time,
        m.label.replace(/%/g, '\%'),
        m.text.replace(/%/g, '\%'),
        ( doStack ? m.stack.replace(/%/g, '\%') : '' ),
        m.number

    ].join('%%').replace(/&/g, '\&').replace(/\n/g, '&&');
}

exports.oneString.decode = function ( s ) {
    var a = s.replace(/&&/g, '\n').replace(/\\&/g, '&').split('%%');

    return {
        level  : a[0],
        time   : a[1],
        label  : a[2].replace(/\%/g, '%'),
        text   : a[3].replace(/\%/g, '%'),
        stack  : a[4].replace(/\%/g, '%'),
        number : a[5]
    }
}
