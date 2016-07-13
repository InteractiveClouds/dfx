var stackOn = {};


exports.init = function ( o ) {

    (o.watch || []).forEach(function(e){
        o.channel.subscribe(e, print)
    });

    (o.stackOn || []).forEach(function(e){
        stackOn[e] = true;
    });

    delete exports.init;
};


function print ( event, message ) {

    console.log(message.colorString);

    if ( stackOn[message.level] ) console.log(message.stack);
}
