var fs = require('graceful-fs'),
    rotate = require('../utils/rotate'),
    format = require('../format'),
    path   = require('path'),
    getTime = require('../utils/gettime');

var stackOn = {},
    isStreamReady = false,
    bin = '',
    stream;


/**
 * @param {Object} o params
 *  @param {String} o.path to a log
 *  @param {Array}  o.watch on what events ('debug', 'info', etc.)
 *  @param {Array}  o.stackOn what events ('debug', 'info', etc.)
 */
exports.init = function ( o ) {

    if ( !o.path ) throw('Path is required.');

    if ( o.rotate ) {
        rotate(o.rotate, o.path)
            //.fail(function(error){console.log('LOG FILE ERROR: ', error, error.stack)})
            .fin(function(){ createStream(o) })
    } else {
        createStream(o);
    }

    (o.watch || []).forEach(function(e){
        o.channel.subscribe(e, print)
    });

    (o.stackOn || []).forEach(function(e){
        stackOn[e] = true;
    });


    delete exports.init;
};


function createStream ( o ) {

    stream = fs.createWriteStream(
        path.join(o.path, o.filename),
        {encoding: 'utf8'}
    );

    stream.once('drain', function () {
        isStreamReady = true;
        writeToStream(bin);
        bin = '';
    });

    stream.once('error', function () {
        console.log('[LOGGER ERROR]: stream error.');
        // TODO recreate the stream
    });

    isStreamReady = true;

    writeToStream('log created at ' + getTime() + '\n\n');

    if ( bin ) {
        writeToStream(bin);
        bin = '';
    }
}

function print ( event, message ) {

    writeToStream(format.oneString.encode(
        message, stackOn[message.level]
    ) + '\n');
}


function writeToStream ( data ) {

    if ( !isStreamReady ) bin += data;
    else isStreamReady = stream.write(data);
}
