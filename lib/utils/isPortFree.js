var Q      = require('q'),
    Socket = require('net').Socket;


module.exports = function ( host, port, timeout ) {
    var D       = Q.defer(),
        timeout = timeout || 2000,
        socket  = new Socket();

    socket.on('error', function(error) {
        if (error.code === 'ECONNREFUSED') D.resolve();
    });
    
    socket.on('connect', function() {
        socket.destroy();
        D.reject(host + ':' + port + ' is in use.');
    });
    
    socket.setTimeout( timeout);

    socket.on('timeout', function() {
        socket.destroy();
        D.reject(host + ':' + port + ' is unavailable. timeout ' + timeout + 'ms.');
    });
    
    socket.connect(port, host);

    return D.promise;
};
