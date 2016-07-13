var QueryBasedStorage = require('./querybased').Instance,
    tools = require('./idbased')._tools,
    path = require('path'),
    fs = require('fs'),
    Q = require('q');

var RGXP_HAS_LEAD_POINT = /^\./,
    UNIQUE_FIELD = '_id';

//var mkdir  = Q.denodeify(fs.mkdir);
var rmfile = Q.denodeify(fs.unlink);

function mkdir ( _path ) {
    var D = Q.defer();

    fs.mkdir(_path, function(error){
    //var res = error ? 'FAILED' : 'DONE  '; console.log(res + ': making dir ' + _path );
        error
            ? /^Error: EEXIST/.test(error)
                ? D.resolve()
                : D.reject(error)
            : D.resolve()
    });

    return D.promise;
}

function Database ( o ) {

    var that = this;

    this._path = o.path;

    init(this);
}

function init (storage) {
    tools.markAsUnready(storage);

    cacheStructure(storage)
    .then(function(){
        return tools.markAsReady(storage);
    })
    .done();
}

function cacheStructure ( st ) {
    var tasks = [];

    st._dbs = {};

    return tools.lsStat(st._path).then(function(list){
        list.forEach(function(stat){
            if (
                !stat.isDirectory()                 ||
                RGXP_HAS_LEAD_POINT.test(stat.name)
            ) {
                return;
            }

            var dbName = stat.name;

            st._dbs[dbName] = {};

            tasks.push(

                tools.lsStat(path.join(st._path, dbName))
                .then(function(list){
                    list.forEach(function(stat){
                        if (
                            !stat.isDirectory()                 ||
                            RGXP_HAS_LEAD_POINT.test(stat.name)
                        ) {
                            return;
                        }

                        var clName = stat.name;
                        st._dbs[dbName][clName] = new QueryBasedStorage({
                            path        : path.join(st._path, dbName, clName),
                            idFieldName : UNIQUE_FIELD
                        });
                    });
                })
            );
        });
    })
    .then(function(){
        return Q.all(tasks);
    })
}

Database.prototype._updateAllCollectionsDocsLists = function(){

    var storage = this;

    return storage._isReady
        ? init(storage)
        : Q.when(storage.ready, function(){
            return init(storage)
        });
};


Database.prototype.get = function( dbName, clName, query, sort) {
    var storage = this;

    return storage._isReady
        ? _get.call(storage, dbName, clName, query, sort)
        : Q.when(storage.ready, function(){
            return _get.call(storage, dbName, clName, query, sort)
        });
};

function _get ( dbName, clName, query, sort) {

    var result = [];

    if ( !dbName ) {

        result = Object.keys(this._dbs);

    } else if ( !clName ) {

        if ( this._dbs.hasOwnProperty(dbName) ) {
            result = Object.keys(this._dbs[dbName])
        }

    } else {

        if (
            this._dbs.hasOwnProperty(dbName) &&
            this._dbs[dbName].hasOwnProperty(clName)
        ) {
            result = this._dbs[dbName][clName]
                .get(query)
                .then(function(docs){
                    return !sort
                        ? docs
                        : docs.sort(compareDocs(sort))
                })
        }
    }

    return Q(result);
};

Database.prototype.select = Database.prototype.get;

Database.prototype.exists = function( dbName, clName, query ) {
    return this.get.apply(this, arguments).then(function(docs){
        return !!docs.length;
    });
};


Database.prototype.put = function( dbName, clName, doc) {

    var storage = this;

    return storage._isReady
        ? _put.call(storage, dbName, clName, doc)
        : Q.when(storage.ready, function(){
            return _put.call(storage, dbName, clName, doc)
        });
};

function _put ( dbName, clName, doc) {

    var storage = this,
        task    = Q();

    tools.markAsUnready(storage);

    if ( !storage._dbs.hasOwnProperty(dbName) ) {

        storage._dbs[dbName] = {};

        task = task
        .then(function(){
            return mkdir(path.join(storage._path, dbName));
        });
    }

    if ( clName && !storage._dbs[dbName].hasOwnProperty(clName) ) {

        task = task
        .then(function(){
            return mkdir(path.join(storage._path, dbName, clName));
        })
        .then(function(){
            storage._dbs[dbName][clName] = new QueryBasedStorage({
                path        : path.join(storage._path, dbName, clName),
                idFieldName : UNIQUE_FIELD
            });
        });
    }

    if ( doc ) {
        task = task
        .then(function(){
            return storage._dbs[dbName][clName].put(doc)
        })
    }

    task = task
    .then(function(){
        tools.markAsReady(storage);
    });

    return task;
};

Database.prototype.update = function( dbName, clName, query, fields, options ) {
    
    const storage = this;

    if ( !dbName ) return Q.reject('need database name at least. nothing to do');
    if (
            !storage._dbs.hasOwnProperty(dbName)         ||
            !storage._dbs[dbName].hasOwnProperty(clName)
        ) {
            return storage.put(dbName, clName).then(function(){
                return storage._dbs[dbName][clName].update(query, fields, options);
            });
    }

    return storage._dbs[dbName][clName].update(query, fields, options);
};

Database.prototype.rm = function( dbName, clName, query) {

    var storage = this;

    return storage._isReady
        ? _rm.call(storage, dbName, clName, query)
        : Q.when(storage.ready, function(){
            return _rm.call(storage, dbName, clName, query)
        });
};

function _rm ( dbName, clName, query ) {

    var storage = this;

    tools.markAsUnready(storage);
    
    if ( query ) {
        return (
                this._dbs.hasOwnProperty(dbName) &&
                this._dbs[dbName].hasOwnProperty(clName)
            )
                ? this._dbs[dbName][clName].rm(query).then(function(){tools.markAsReady(storage)})
                : Q(tools.markAsReady(storage));
    }

    if ( clName ) {
        return rmdir(path.join(this._path, dbName, clName))
        .then(function(){

            if ( 
                storage._dbs.hasOwnProperty(dbName) &&
                storage._dbs[dbName].hasOwnProperty(clName)
            ) delete storage._dbs[dbName][clName];

            tools.markAsReady(storage);
        })
    } else {
        return rmdir(path.join(this._path, dbName))
        .then(function(){
            if ( storage._dbs.hasOwnProperty(dbName) ) delete storage._dbs[dbName];
            tools.markAsReady(storage);
        })
    }
}

Database.prototype.count = function( dbName, clName ) {
    
    cratch(this, 'count', dbName, clName, {});
    return this._dbs[dbName][clName].count();
};

function compareDocs ( query ) {
    var key = Object.keys(query)[0]; // TODO throw if more than 1 key
    // TODO validate query value ( 1 or -1 are allowed )

    return function ( a, b ) {
        return a[key] == b[key]
            ? 0
            : a[key] > b[key]
                ? query[key]
                : query[key] * -1
    }
}

// TODO remove
function cratch ( storage, action, dbName, clName, doc ) {

    if (!dbName) {
        return Q.reject('need database name at least. nothing to do');
    } else if ( !clName ) {

        throw(Error(
            '"' + action + '" for databases is not implemented yet' +
                '\nDB_NAME : ' + dbName +
                '\nCL_NAME : ' + clName +
                '\nSTORAGE : ' + storage.path
        ));
    } else if ( !doc ) {

        throw(Error(
            '"' + action + '" for collections is not implemented yet' +
                '\nDB_NAME : ' + dbName +
                '\nCL_NAME : ' + clName +
                '\nSTORAGE : ' + storage.path
        ));
    } else if (
            !storage._dbs.hasOwnProperty(dbName)         ||
            !storage._dbs[dbName].hasOwnProperty(clName)
        ) {
            throw(Error(
                '"' + action + '" for databases and collections is not implemented yet' +
                '\nDB_NAME : ' + dbName +
                '\nCL_NAME : ' + clName +
                '\nSTORAGE : ' + storage.path
            ));
    }
}

function rmdir ( _path ) {

    var D = Q.defer();

    fs.exists( _path, function (exists){

        if ( !exists ) return D.resolve();

        tools.lsStat(_path).then(function(list){

            var tasks = [];

            list.forEach(function(stat){
                stat.isDirectory()
                    ? tasks.push( rmdir( path.join(_path, stat.name)) )
                    : tasks.push( rmfile(path.join(_path, stat.name)) );
            });

            Q.all(tasks).then(D.resolve).fail(D.reject)
        });
    });

    return D.promise;
}

exports.Instance = Database;
