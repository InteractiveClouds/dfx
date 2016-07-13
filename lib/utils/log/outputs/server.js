exports.init = function ( o, out ) {

    if ( !o.socket ) throw(Error('Socket is required.'));

    var socket  = o.socket,
        channel = o.channel,
        watch   = o.watch,
        stackOn = o.stackOn;


    stackOn.forEach(function(e){
        stackOn[e] = true;
    });

    out.startServer = function () {
    
        watch.forEach(function(e){
            channel.subscribe(e, print);
        });
    };
    
    out.stopServer = function () {
    
        watch.forEach(function(e){
            channel.unsubscribe(e, print);
        });
    };

    function print (event, m) {
         socket.emit('message', {
            level  : m.level,
            label  : m.label,
            time   : m.time,
            text   : m.text,
            stack  : stackOn[m.level] ? m.stack : '',
            number : m.number
         });
    }

    delete exports.init;
};



