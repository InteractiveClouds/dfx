var crypto   = require('crypto'),
    path = require('path'),
    Q   = require('q'),
    QFS = require('q-io/fs');

var confFilePath = path.join(__dirname, '..', 'lib', 'auth', '.auth.conf'),
    ac;


try {
    ac = require(confFilePath);
} catch (e) {}

if ( !ac || !ac.storagePass || !ac.nonce ) {
    console.log('failed. can not find .auth.conf');
    process.exit();
} else {
    console.log(ac);
    console.log('\n\n')
}

QFS.remove(confFilePath).then(function(){
    return createStoreCredentialsPasswordFile(ac.storagePass, ac.nonce)
})
.then(
    function(){console.log('success')},
    function(error){console.log('failed', error)}
)
.done();


function createStoreCredentialsPasswordFile ( pass, nonce, consumer_key, consumer_secret ) {
    return Q.all([
            ( pass            ? Q(pass)            : random(64)  ),
            ( nonce           ? Q(nonce)           : random(128) ),
            ( consumer_key    ? Q(consumer_key)    : random(12)  ),
            ( consumer_secret ? Q(consumer_secret) : random(24)  )
    ]).spread(function ( pass, nonce, consumer_key, consumer_secret ) {
        var content =   'exports.storagePass  = \'' + pass  + '\';\n' +
                        'exports.nonce        = \'' + nonce + '\';\n' +
                        'exports.externalGate = {\n' +
                        '   consumer_key    : \'' + consumer_key    + '\',\n' +
                        '   consumer_secret : \'' + consumer_secret + '\'\n' +
                        '}\n';

        return QFS.write(confFilePath, content, {mode:0400});
    })
};

function random ( length ) {
    var D = Q.defer();
    length = length ? length >> 1 : 4;
    crypto.randomBytes(length, function(error, buf) {
    return error
        ? D.reject(error)
        : D.resolve( new Buffer(buf).toString('hex') );
    });
    return D.promise;
};
