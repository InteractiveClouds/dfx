/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

// TODO check multi-put
var Q = require('q'),
    MDB = require('mongodb'),
    MCL = require('mongodb').MongoClient,
    OLDVERSION = !!( MDB.BSONPure && MDB.BSONPure.ObjectID ),
    ObjectID = OLDVERSION ? MDB.BSONPure.ObjectID : MDB.ObjectID;

var cache = {},
    DEFAULTS = {
        maxOpenedConnections: 200,
        host: 'localhost',
        port: 27017
    };

function composeCacheID ( addresses ) {
    return addresses
    .map(function(addr){ return addr }) //clone for keeping source unchanged
    .sort(function(a, b){
        return a.host + a.port > b.host + b.port;
    })
    .reduce(function(total, current){
        return total + current.host + current.port;
    }, '');
}

function prepareURLs ( addresses ) {
    return 'mongodb://' + addresses
    .map(function(addr){
        return addr.host + ':' + addr.port || DEFAULTS.port;
    })
    .join(',') + '/';
}

function compose_URL_OPTS ( o ) {
    const _URL_OPTS = [];

    if ( this._replicaSetName ) _URL_OPTS.push('replicaSet=' + this._replicaSetName);
    if ( o.opts ) {
        if ( o.opts.ssl ) _URL_OPTS.push('ssl=true');
        if ( o.opts.connectTimeoutMS ) _URL_OPTS.push('connectTimeoutMS=' + o.opts.connectTimeoutMS);
        // TODO other options : https://docs.mongodb.com/manual/reference/connection-string/
    }

    return _URL_OPTS.length && ( '?' + _URL_OPTS.join('&') ) || '';
}

/**
 * @constructor
 * @param {Object} o options
 *
 * @returns {Object}
 */
function Mdbw(o) {
    if (!(this instanceof Mdbw)) return new Mdbw(o);
    o = o || {};

    const
        that = this;
        RAW_URLs = o.replicaSet && o.replicaSet.servers || [{
                host : o.host || DEFAULTS.host, port : o.port || DEFAULTS.port
            }];

    this._replicaSetName = o.replicaSet && o.replicaSet.name;



    this._cacheID = composeCacheID(RAW_URLs);

    if (o.user && o.pass) {
        this.creds = {
            user: o.user,
            pass: o.pass
        }
    }

    this._ADDRESS = prepareURLs(RAW_URLs);  // -- mongodb://host1:port1,host2:port2,etc:etc/
    this._URL_OPTS = compose_URL_OPTS.call(this, o);

    if (cache[that._cacheID]) return this;

    var D = Q.defer();
    cache[that._cacheID] = {
        options: {
            maxOpenedConnections: o.maxOpenedConnections - 2
                // why ( -2 ) :
                // +1 root,  +1 next connection ( it checks before connecting to new )
                || DEFAULTS.maxOpenedConnections
        },
        connections: {},
        queue : [],
        handlers : {},
        root: {},
        ready: D.promise
    };

    connect.call(that)
        .then(function (db) {
            if (!that.creds) {
                cache[that._cacheID].root = db;
                D.resolve();
                return;
            }
            db.admin().authenticate(
                that.creds.user,
                that.creds.pass,
                function (error, result) {
                    if (error) console.log('MDBW.ERROR: root auth failed');

                    cache[that._cacheID].root = db;
                    D.resolve();
                }
            );
        })
        .done();
}

// for tests only
Mdbw.prototype._cache = cache;

/**
 * @param {String} dbName database name
 * @param {String} clName collection name
 * @param {Object} query mongodb query
 * @param {Object} sort sort order
 *
 * @returns {Promise | Array} array of strings (names) if was not specified query,
 *                  and array of objects (documents) otherwise
 */
Mdbw.prototype.get = function (dbName, clName, query, sort) {
    const that = this;
    return getConnection.call(this, dbName, clName)
        .then(function (cnct) {
            if (cnct === null) return [];
            if (!dbName) return getDatabasesList(cnct);
            if (!clName) return getCollectionsNames(cnct);
            return getDocuments(cnct, query, sort);
        })
        .then(function(result){
            return reviewConnectionsAndReturn.call(that, dbName, false, result);
        })
};

/**
 * @param {String} dbName database name
 * @param {String} clName collection name
 * @param {Object} query mongodb query
 * @param {Object} fields mongodb projection
 * @param {Object} sort sort order
 *
 * @returns {Promise | Array} array of strings (names) if was not specified query,
 *                  and array of objects (documents) otherwise
 */
Mdbw.prototype.select = function (dbName, clName, query, fields, sort) {
    const that = this;
    return getConnection.call(this, dbName, clName)
        .then(function (cnct) {
            if (cnct === null) return [];
            if (!dbName) return getDatabasesList(cnct);
            if (!clName) return getCollectionsNames(cnct);
            return selectDocuments(cnct, query, fields, sort);
        })
        .then(function(result){
            return reviewConnectionsAndReturn.call(that, dbName, false, result);
        })
};

/**
 * @param {String} dbName database name
 * @param {String} clName collection name
 * @param {Object} doc document
 */
Mdbw.prototype.put = function (dbName, clName, doc) {
    const that = this;
    if (!dbName) return Q.reject('need database name at least. nothing to put');
    return getConnection.call(this, dbName, '', true)
        .then(function (db) {

                                // in this case means to create db if not exists
            if (!clName) return getCollectionsNames(db).then(function(){});

            if (!doc) return createCollection(db, clName);

            return saveDocument(db, clName, doc);
        })
        .then(function(result){
            return reviewConnectionsAndReturn.call(that, dbName, false, result);
        })
}

/**
 * @param {String} dbName database name
 * @param {String} clName collection name
 * @param {Object} query mongodb query
 *
 * @returns {Promise | Boolean}
 */
Mdbw.prototype.exists = function (dbName, clName, query) {
    return this.count(dbName, clName, query)
        .then(function (n) {
            return !!n
        });
}

/**
 * @param {String} dbName database name
 * @param {String} clName collection name
 * @param {Object} query mongodb query
 * @param {Object} fields what to update
 *
 * @returns {Promise | Number} quantity of updated documents
 */
Mdbw.prototype.update = function (dbName, clName, query, fields, options) {
    const that = this;
    if (arguments.length < 4) return Q.reject('need four or five arguments');
    options = options || {};
    const clearOptions = {
            multi: typeof options.multi === 'boolean' ? options.multi : true,
            upsert: typeof options.upsert === 'boolean' ? options.upsert : false
        };
    return getConnection.call(this, dbName, clName, clearOptions.upsert)
        .then(function (cl) {
            if (cl === null) return 0;
            return update(cl, query, fields, clearOptions)
        })
        .then(function(result){
            return reviewConnectionsAndReturn.call(that, dbName, false, result);
        })
};

/**
 * @param {String} dbName database name
 * @param {String} clName collection name
 * @param {Object} query mongodb query
 *
 * @returns {Promise | Number} quantity of removed items
 */
Mdbw.prototype.rm = function (dbName, clName, query) {
    const that = this;
    if (!dbName) return Q.reject('need at least name of a database');
    var rm = false;
    return getConnection.call(this, dbName, clName)
        .then(function (cnct) {
            if (cnct === null) return 0;
            if (!clName) {
                rm = true;
                return removeDatabase(cnct)
            }
            if (!query) return removeCollection(cnct)
            return removeDocuments(cnct, query);
        })
        .then(function(result){
            return reviewConnectionsAndReturn.call(that, dbName, rm, result);
        })
};

/**
 * @param {String} dbName database name
 * @param {String} clName collection name
 *
 * @returns {Promise | Object} node-mongodb-native objects
 *              for database, or collection
 */
Mdbw.prototype.native = function (dbName, clName) {
    const that = this;
    return getConnection.call(this, dbName, clName)
    .then(function(db){
        var _close = db.close;

        db.close = function () {
            db.close = _close;
            return reviewConnectionsAndReturn.call(that, dbName, true);
        };

        return db;
    })
};

/**
 * @param {String} dbName database name
 * @param {String} clName collection name
 * @param {Object} query mongodb query
 *
 * @returns {Promise | Object}
 */
Mdbw.prototype.getOne = function (dbName, clName, query) {
    const that = this;
    if (arguments.length != 3) return Q.reject('need exactly three arguments');
    return getConnection.call(this, dbName, clName)
        .then(function (cl) {
            if (cl === null) return undefined;
            return findOne(cl, query)
        })
        .then(function(result){
            return reviewConnectionsAndReturn.call(that, dbName, false, result);
        })
};

/**
 * @param {String} dbName database name
 * @param {String} clName collection name
 * @param {Object} query mongodb query
 *
 * @returns {Promise | Number}
 */
Mdbw.prototype.count = function (dbName, clName, query) {
    const that = this;
    return getConnection.call(this, dbName, clName)
        .then(function (cnct) {
            if (cnct === null) return 0;
            if (!dbName) return getDatabasesList(cnct).then(function (dbs) {
                return dbs.length
            });
            if (!clName) return getCollectionsNames(cnct).then(function (cls) {
                return cls.length
            });
            return count(cnct, query);
        })
        .then(function(result){
            return reviewConnectionsAndReturn.call(that, dbName, false, result);
        })
};

/**
 * closes all opened connections
 */
Mdbw.prototype.exit = function () {
    const
        that        = this,
        _cache      = cache[this._cacheID],
        connections = _cache.connections,
        promises    = [];

    for (var dbName in connections) {
        promises.push(closeConnection.call(that, dbName));
    }
    return Q.all(promises).then(function(){
            _cache.root.close(); // TODO imposible to open after exit
        return Q.resolve();
    });
};

/**
 * @param {Object} db mongodb's db
 * @param {String} clName collection name
 * @param {Object} query mongodb's query
 *
 * @returns {Promise | Number} quantity of removed documents
 */
function removeDocuments(cl, query) {
    var D = Q.defer();
    if (query['_id']) {
        query['_id'] = typeof query['_id'] !== 'object'
            ? ObjectID(query['_id'])
            : query['_id'];
    }
    cl.remove(query, function (error, quantity) {
        return error
            ? D.reject(error)
            : D.resolve(quantity);
    })
    return D.promise;
}

/**
 * @param {Object} db mongodb's db
 * @param {String} clName collection name
 *
 * @returns {Promise | Number} quantity of removed collections
 */
function removeCollection(cl) {
    var D = Q.defer();
    cl.drop(function (error, result) {
        return error ? D.reject(error) : D.resolve(result ? 1 : 0);
    });
    return D.promise;
}

/**
 * @param {Object} db mongodb's db
 *
 * @returns {Promise | Number} quantity of removed databases
 */
function removeDatabase(db) {
    var D = Q.defer();
    db.dropDatabase(function (error) {
        return error ? D.reject(error) : D.resolve(1);
    });
    return D.promise;
}

/**
 * @param {Object} cl mongodb's cursor of collection
 * @param {Object} query mongodb's query for searching documents
 * @param {Object} fields mongodb's query for updating
 *
 * @returns {Promise | Number} quantity of updating documents
 */
function update(cl, _query, fields, options) {
    var D = Q.defer(),
        query = clone(_query);
    if (query && query._id && typeof query._id === 'string') {
        query._id = new ObjectID.createFromHexString(query._id);
    }
    cl.update(query, fields, options, function (error, result) {

        return error
            ? D.reject(error)
            : OLDVERSION
                ? D.resolve(result)
                : D.resolve(result.result.n)
    });
    return D.promise;
}

/**
 * @param {Object} cl mongodb's cursor of collection
 * @param {Object} query mongodb's query
 *
 * @returns {Promise | Object} document
 */
function findOne(cl, query) {
    var D = Q.defer();
    cl.findOne(query, function (error, doc) {
        return error ? D.reject(error) : D.resolve(doc || undefined);
    });
    return D.promise;
}

/**
 * @param {Object} cl mongodb's cursor of collection
 * @param {Object} query mongodb's query
 *
 * @returns {Promise | Number} quantity of document matching the query
 */
function count(cl, query) {
    var D = Q.defer();
    cl.count(query, function (error, count) {
        return error ? D.reject(error) : D.resolve(count || 0);
    });
    return D.promise;
}

/**
 * @param {Object} db mongodb's db
 * @param {String} clName collection name
 * @param {Object} doc document
 *
 * @returns {Promise}
 */
function saveDocument(db, clName, doc) {
    if (typeof doc !== 'object') return Q.reject('document should be an object');
    return connectCollection(db, clName)
        .then(function (cl) {
            var D = Q.defer();
            if (doc['_id']) {
                doc['_id'] = typeof doc['_id'] !== 'object'
                    ? ObjectID(doc['_id'])
                    : doc['_id'];
                cl.save(doc, function (error, result) {
                    return error ? D.reject(error) : D.resolve();
                });
            } else {
                if ( OLDVERSION ) {
                    cl.insert(doc, function (error, result) {
                        return error
                            ? D.reject(error)
                            : D.resolve(result[0]['_id'].toHexString());
                    });
                } else {
                    cl.insertOne(doc, function (error, result) {
                        return error
                            ? D.reject(error)
                            : D.resolve(result.insertedId)
                    });
                }
            }
            return D.promise;
        })
}

/**
 * @param {Object} db mongodb's db
 * @param {String} clName collection name
 *
 * @returns {Promise}
 */
function createCollection(db, clName) {
    var D = Q.defer();
    db.createCollection(clName, function (error, collection) {
        return error
            ? D.reject(error)
            : D.resolve();
    });
    return D.promise;
}

/**
 * @param {Object} db
 *
 * @returns {Promise | Array}
 */
function getDatabasesList(db) {
    var D = Q.defer();
    db.admin().listDatabases(function (error, dbs) {
        if (error) return D.reject(error);
        var list = dbs.databases.map(function (c) {
            return c.name
        });
        return D.resolve(list);
    });
    return D.promise;
}

/**
 * @param {Object} collection
 * @param {Object} _query
 * @param {Object} sort The field or fields to sort by and a value of 1 or -1
 *   to specify an ascending or descending sort respectively
 *
 * @returns {Promise | Array} array of objects
 */
function getDocuments(collection, _query, sort) {
    var D = Q.defer(),
        query = clone(_query);
    if (query && query._id && typeof query._id === 'string') {
        query._id = new ObjectID.createFromHexString(query._id);
    }
    var cursor = collection.find(query);
    if (sort && typeof sort == 'object') {
        cursor.sort(sort);
    }
    cursor.toArray(function (error, arr) {
        return error ? D.reject(error) : D.resolve(arr);
    });
    return D.promise;
}

/**
 * @param {Object} collection
 * @param {Object} _query
 * @param {Object} projection If the argument is specified, the matching documents contain only
 *   the projection fields and the _id field. You can optionally exclude the _id field.
 * @param {Object} sort The field or fields to sort by and a value of 1 or -1
 *   to specify an ascending or descending sort respectively
 *
 * @returns {Promise | Array} array of objects
 */
function selectDocuments(collection, _query, projection, sort) {
    var D = Q.defer(),
        query = clone(_query);
    if (query && query._id && typeof query._id === 'string') {
        query._id = new ObjectID.createFromHexString(query._id);
    }
    var cursor = collection.find(query, projection);
    if (sort && typeof sort == 'object') {
        cursor.sort(sort);
    }
    cursor.toArray(function (error, arr) {
        return error ? D.reject(error) : D.resolve(arr);
    });
    return D.promise;
}


/**
 * @param {Object} db mongodb's db
 * @param {String} clName collection name
 *
 * @returns {Promise | Object} mongodb's cursor
 */
function connectCollection(db, clName) {
    var D = Q.defer();
    db.collection(clName, function (error, collection) {
        return error ? D.reject(error) : D.resolve(collection);
    });
    return D.promise;
}

/**
 * @param {Object} db
 *
 * @returns {Promise | Array} array of strings
 */
function getCollectionsNames(db) {
    var D = Q.defer();
    if ( OLDVERSION ) {
        db.collectionNames(_getCollectionsHandler.bind(null, D))
    } else {
        db.listCollections().toArray(_getCollectionsHandler.bind(null, D));
    }
    return D.promise;
}


function _getCollectionsHandler (D, error, collections) {
    if (!collections) return D.resolve([]);
    var collectionsArr = collections.filter(function (e) {
        return !/\.system\.indexes$/.test(e.name);
    }).map(function (c) {
        return c.name.replace(/^.+\.([^.]+)$/, '$1');
    });
    return error ? D.reject(error) : D.resolve(collectionsArr);
}

/**
 * looking for link to the database in cache first,
 * then connects, if not found
 *
 * @param {String} dbName database name
 * @param {String} clName collection name
 * @param {Boolean} force to connect if a database is not exists
 *
 * @returns {Promise | Object} mongodb's 'db' or 'cl'
 *          or null if 'force' is not true and database or collection is not exists
 */
function getConnection ( dbName, clName, force ) {
    const
        that = this,
        _cache = cache[this._cacheID];

    return _cache.ready
    .then(function () {
        var _db = dbName
            ? _cache.connections[dbName]
            : _cache.root;

        if ( dbName ) _cache.handlers[dbName] = ( _cache.handlers[dbName] || 0 ) + 1;

        if (_db) {

            if (!clName) return _db; // TODO (now it either promise or db)

            return _db.then(function(db){
                return getCollectionsNames(db)
                .then(function (cls) {
                    return !~cls.indexOf(clName) && !force ? null : connectCollection(db, clName);
                })
            });
        }

        return getDatabasesList(_cache.root)
            .then(function (dbs) {
                if (dbs.indexOf(dbName) === -1 && !force) return null;

                return connectAndWrite.call(that, dbName)
                .then(function (db) {
                    if (!that.creds) return db;

                    var D = Q.defer();
                    db.admin().authenticate(
                        that.creds.user,
                        that.creds.pass,
                        function (error, result) {
                            if (error) console.log('MDBW.ERROR: auth failed');
                            D.resolve(db);
                        }
                    );
                    return D.promise;
                })
                .then(function (db) {
                    if (!clName) return db;
                    return getCollectionsNames(db)
                        .then(function (cls) {
                            return !~cls.indexOf(clName) && !force
                                ? null
                                : connectCollection(db, clName);
                        })
                })
            })
    });
}

/**
 * connects to the database and writes the link to cache
 *
 * @param {Object} dbName database name
 *
 * @returns {Promise | Object} mongodb's db
 */
function connectAndWrite( dbName ) {
    if ( isFreeSlots.call(this) ) {
        return cache[this._cacheID].connections[dbName] = connect.call(this, dbName);
    } else {
        return addToQueue.call(this, dbName)
    }
}

function isFreeSlots () {
    const _cache = cache[this._cacheID];

    return Object.keys(_cache.connections).length < _cache.options.maxOpenedConnections;
}

function reviewConnectionsAndReturn ( dbName, rmAnyway, result ) {
    const
        that = this,
        _cache = cache[this._cacheID];

    _cache.handlers[dbName]--;

    return (function(){
        if ( rmAnyway ) {
            return closeConnection.call(that, dbName)
        } else {
            if ( !isFreeSlots.call(that) ) {
                // TODO check frequency
                if ( !_cache.handlers[dbName] ) return closeConnection.call(that, dbName);
                else return Q.reject('handlers');
            } else {
                return Q.resolve();
            }
        }
    })()
    .then(
        function(){
            if ( _cache.queue.length ) {
                var task = _cache.queue.shift();

                if ( _cache.connections[task.dbName] ) {
                    task.defer.resolve( _cache.connections[task.dbName] );
                } else {
                    task.defer.resolve(
                        _cache.connections[task.dbName] = connect.call(that, task.dbName)
                    );
                }
            }

            return Q.resolve(result);
        },
        function(error){
            if ( error !== 'handlers' ) {
                return Q.reject(error);
            } else return Q.resolve(result);
        }
    )
}

/**
 * @param {Object} dbName database name
 *
 * @returns {Promise | Object} mongodb's db
 */
function connect( dbName ) {
    dbName = dbName || '';
    const
        D = Q.defer(),
        URL = composeURL.call(this, dbName);

    MCL.connect(URL, function (error, db){
        if ( error ) {
            D.reject(error);
        } else {
            D.resolve(db);
        }
    });

    var t = D.promise.then(
        function (db) {
            return Q.resolve(db);
        },
        function (error) {
            return Q.reject(error);
        }
    );

    return t;
}

function composeURL ( dbName ) {
    return this._ADDRESS + dbName + this._URL_OPTS;
}

function addToQueue (dbName) {

    var task = {
        dbName : dbName,
        defer  : Q.defer()
    };

    cache[this._cacheID].queue.push(task);

    return task.defer.promise;
}

function closeConnection( dbName ) {
    const _cache = cache[this._cacheID]
    if (!dbName) return Q.resolve();
    var D = Q.defer();
    _cache.connections[dbName].then(function(db){
        db.close(true, function (error) {
            if (error) return D.reject(error);
            delete _cache.connections[dbName];
            return D.resolve();
        });
    });
    return D.promise;
}

function clone(p) {
    function C() {
    }

    C.prototype = p;
    return new C;
}

module.exports = Mdbw;
