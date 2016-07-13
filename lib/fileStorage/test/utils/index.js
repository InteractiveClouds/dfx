var path = require('path'),
    Q = require('q'),
    fs   = require('fs'),
    
    tools = require('../../idbased')._tools;

function rmdir ( _path, cb ) {
    _rmdir(_path)
    .then(function(){cb()})
    .fail(function(error){cb(error)})
}

function _rmdir ( _path ) {

    var D = Q.defer();

    fs.exists( _path, function (exists){

        if ( !exists ) return D.resolve();

        tools.lsStat(_path).then(function(list){

            var tasks = [];

            list.forEach(function(stat){
                stat.isDirectory()
                    ? tasks.push( _rmdir(path.join(_path, stat.name)) )
                    : tasks.push( rmfile(path.join(_path, stat.name)) )
            });

            Q.all(tasks)
            .then(function(){
                fs.rmdir(_path, function(error){error ? D.reject(error) : D.resolve()})
            })
            .fail(function(error){
                D.reject(error)
            })
        });
    });

    return D.promise;
}

function rmfile ( _path ) {
    var D = Q.defer();

    fs.unlink(_path, function(error){
        error
            ? D.reject(error)
            : D.resolve();
    });

    return D.promise;
}

exports.createTmpDir = function(_path, done){

    rmdir( _path, function(error){
        if ( error ) return done(error);

        fs.mkdir( _path, done );
    });
};

exports.removeTmpDir = function(_path, done){
    rmdir( _path, done );
};

