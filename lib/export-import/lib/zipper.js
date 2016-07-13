const
    fs       = require('fs'),
    Q        = require('q'),
    Unzip    = require('decompress-zip'),
    archiver = require('archiver');

/**
 * @param {String} inputPath
 * @param {String|Object} output path to file or stream
 * @returns {Object*Promise}
 */
exports.packDir = function ( inputPath, output ) {

    const
        outputStream = typeof output === 'object'
            ? output // stream
            : fs.createWriteStream(output), // path to file
        zip = archiver('zip'),
        D = Q.defer();

    outputStream.on( 'close', D.resolve.bind(D) );

    zip.on( 'error', D.reject.bind(D)  );
    zip.pipe(outputStream);
    zip.bulk([{ src: [ '**' ], cwd: inputPath, expand: true }]);
    zip.finalize();

    return D.promise;
};

/**
 * @param {String} input  path to a zip
 * @param {String} output path to a dir
 * @returns {Object*Promise}
 */
exports.unpackDir = function ( input, output ) {
    
    const
        D = Q.defer(),
        unzipper = new Unzip(input);

    unzipper.on( 'error',   D.reject.bind(D)  );
    unzipper.on( 'extract', D.resolve.bind(D) );

    unzipper.extract({ path : output });

    return D.promise;
};
