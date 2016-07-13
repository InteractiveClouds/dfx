var fs = require('fs');

exports.compileFile = function ( path ) {
    var raw = fs.readFileSync(path).toString('utf8').split('%%');

    return function ( data ) {
        return raw.reduce(function(p, c, i, a){
            if ( i%2 === 0 ) return p + c;
            return p + data[c];
        }, '');
    }
};
