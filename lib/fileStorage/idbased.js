var fs   = require('fs'),
    path = require('path'),
    Q    = require('q'),

    DATA_DIR_NAME = '.',
    RGXP_HAS_LEAD_POINT = /^\./;


function Storage ( o ) {

    var storage = this;

    markAsUnready(this);

    this.path = o.path;
    this.size = 0;
    this.queue = new Queue(storage);

    cacheDocsList(this, function (error){
        if ( error ) throw(error);
        markAsReady(storage)
    });
}

function markAsReady ( storage ) {
    storage._readyDefer.resolve();
    storage._isReady = true;
}

function markAsUnready ( storage ) {
    storage._readyDefer = Q.defer();
    storage._isReady = false;
    storage.ready = storage._readyDefer.promise;
}

Storage.fn = Storage.prototype;

Storage.fn.put = function ( id, cnt ) {

    var that = this;

    if ( arguments.length < 2 ) {
        cnt = id;
        id = getUniqueId();
    }

    var storage = this;

    return this.queue.add(new Task({
        storage : storage,
        action  : 'put',
        args    : arguments
    }));

    //return this._isReady
    //    ? _put.call(this, id, cnt)
    //    : Q.when(this.ready, function(){ return _put.call(that, id, cnt) });
};

Storage.fn.get = function ( id ) {

    var storage = this;

    return this.queue.add(new Task({
        storage : storage,
        action  : 'get',
        args    : arguments
    }));

    //var that = this;

    //return this._isReady
    //    ? _get.call(this, id)
    //    : Q.when(this.ready, function(){ return _get.call(that, id) });
};

Storage.fn.rm = function ( id ) {

    var storage = this;

    return this.queue.add(new Task({
        storage : storage,
        action  : 'rm',
        args    : arguments
    }));

    //var that = this;

    //return this._isReady
    //    ? _rm.call(this, id)
    //    : Q.when(this.ready, function(){ return _rm.call(that, id) });
};

Storage.fn.count = function () {
    return Q(this._list.length);
};

Storage.fn._updateDocsList = function () {
    var D = Q.defer(),
        storage = this;

    markAsUnready(storage);

    cacheDocsList(this, function(error){
        if ( error ) return D.reject(error);
        markAsReady(storage);
        D.resolve();
    });

    return D.promise;
}

function Task ( o ) {
    this.storage    = o.storage;
    this._defer     = Q.defer();
    this.promise    = this._defer.promise;
    this.inProgress = false;
    this.action     = o.action;
    this.args       = o.args;
}

Task.prototype.run = function () {

    var theTask = this,
        func;

    this.inProgress = true;

    if      ( theTask.action === 'get' ) func = _get;
    else if ( theTask.action === 'rm'  ) func = _rm;
    else if ( theTask.action === 'put' ) func = _put;
    else throw(Error('unknown action "' + theTask.action + '"'))

    return func.apply(this.storage, this.args)
    .then(
        function(data) { theTask._defer.resolve(data); theTask.inProgress = false; },
        function(error){ theTask._defer.reject(error); theTask.inProgress = false; }
    )
};

function Queue ( storage ) {
    this._storage = storage;
    this.stack = [];
    this.actionInProgress = '';
}

Queue.prototype.add = function ( task ) {
    var storage = this._storage,
        theQueue = this;

    return storage._isReady
        ? theQueue._add.call(this, task)
        : Q.when(storage.ready, function(){ return theQueue._add.call(theQueue, task) });
};

Queue.prototype._add = function ( task ) {

    var theQueue = this;

    this.stack.push(task);

    if ( this.actionInProgress === '' ) {
        this.actionInProgress = task.action;
        task.run().fin(function(){ manageQueue.call(theQueue, task) });
    } else if ( 'get' === this.actionInProgress && 'get' === task.action ) {
        task.run().fin(function(){ manageQueue.call(theQueue, task) });
    } else if ( 'rm'  === this.actionInProgress && 'rm'  === task.action ) {
        task.run().fin(function(){ manageQueue.call(theQueue, task) });
    } else if ( 'put'  === this.actionInProgress && 'put'  === task.action ) {
        task.run().fin(function(){ manageQueue.call(theQueue, task) });
    }

    return task.promise;
};

function manageQueue ( task ) {
    //if ( !(task instanceof Task) ) {
    //    console.log('\n+++++++++++++++++++++++++\n');
    //    console.log( (new Error()).stack );
    //}

    var index = this.stack.indexOf(task),
        theQueue = this;

    if ( ~index ) this.stack.splice(index, 1);

    var nextTask = this.stack[0];

    if ( !nextTask ) {
        this.actionInProgress = '';
        return;
    }

    if ( nextTask.inProgress ) return;

    this.actionInProgress = nextTask.action;
    nextTask.run().fin(function(){ manageQueue.call(theQueue, nextTask) });

    var i = 1;

    while ( theQueue.stack[i] && theQueue.actionInProgress === theQueue.stack[i].action ) {

        (function(i, theQueue){

            var task = theQueue.stack[i];

            task
            .run()
            .fin(function(){ manageQueue.call(theQueue, task) });

        })(i, theQueue);

        i++;
    }
}

function _rm ( id ) {
    if ( !this._list.hasOwnProperty(id) ) return;

    var D = Q.defer();

    delete this._list[id];

    fs.unlink(path.join(this.path, id), function(error){
        error ? D.reject(error) : D.resolve();
    });

    return D.promise;
}

function _getFD ( id, flag, cb ) {
    fs.open( path.join(this.path, id.toString()), flag, function (error, fd) {
        error ? cb(error) : cb(null, fd);
    });
};

function _closeFD ( fd, cb ) {
    fs.close( fd, function (error) {
        cb(error || null);
    });
};

function _put ( id, cnt ) {

    //if ( this._list.hasOwnProperty(id) ) return Q.reject(
    //    'item "' + id + '" already exists'
    //);

    var that = this,
        D = Q.defer();

    cnt = cnt.toString();

    _getFD.call(this, id, 'w', function( error, fd ) {
        if ( error ) return D.reject(error);

        fs.write( fd, cnt, 0, 'utf-8', function(error_1, size){
            _closeFD(fd, function(error_2){
                var error = error_1 || error_2;

                if ( error ) return D.reject(error);

                that.size += size;

                that._list[id] = { size : size };
                D.resolve(id);
            })
        });
    });

    return D.promise;
};

function _get ( id ) {

    if ( !this._list.hasOwnProperty(id) ) return Q.resolve(null);

    var that = this,
        D = Q.defer();

    _getFD.call(this, id, 'r', function( error, fd ) {
        if ( error ) return D.reject(error);

        fs.stat(path.join(that.path, id), function(error, stat){

            if ( error ) return D.reject(error);

            var _size = that._list[id].size;
            var size = stat.size;

            if ( _size !== size ) console.log('----- [fStorage WARN]: stat size do not match stored size for "' + id + '"');

            if ( size === 0 ) return D.resolve(null);

            fs.read( fd, new Buffer(size), 0, size, 0, function(error_1, bytesRead, buffer){
                _closeFD(fd, function(error_2){
                    var error = error_1 || error_2;

                    if ( error ) return D.reject(error);

                    try {
                        doc = JSON.parse( buffer.toString('utf-8') )
                    } catch ( error ) {
                        return D.reject(error);
                    }

                    D.resolve(doc);
                })
            });
        });
    });

    return D.promise;
};

function cacheDocsList ( st, cb ) {
    lsStat( st.path, function(error, itemsList){
        if ( error ) return cb(error);

        if ( !itemsList ) return cb(new Error(
            'the path ' + st.path + ' does not exist'
        ));

        st._list = {};

        itemsList.forEach(function(stat, i){

            if ( !stat.isFile() || RGXP_HAS_LEAD_POINT.test(stat.name) ) return;

            st.size += stat.size;

            st._list[stat.name] = {
                size : stat.size
            };
        });

        return cb(null);
    });
}

function arrayToObject ( array, id ) {
    var obj = {},
        item,
        l = array.length;

    for ( var i = 0; i < l; i++ ) {

        item = array[i];

        if ( id ) {
            if ( !item.hasOwnProperty(id) ) {
                obj = new Error('array item has no property "' + id + '"');
                break;
            }

            name = item[id];
        } else {
            name = item;
        }

        if ( obj.hasOwnProperty(name) ) {
            obj = new Error('property "' + ( id || name ) + '" is not unique');
            break;
        }

        obj[name] = id ? item : true;
    }

    return obj;
}

function ls ( p, cb ) {
    fs.readdir( p, function(error, list){
        error ? cb(error) : cb(null, list);
    });
}

function lsStat ( p, cb ) {
    fs.readdir( p, function(error, list){

        if ( error ) return cb(error);

        if ( !list.length ) return cb(null, []);

        var res = [],
            done = 0,
            total = list.length,
            failed = false;

        list.forEach(function(fn){
            fs.stat( path.join(p, fn), function (error, stat){

                if ( failed ) return;

                if ( error ) {
                    failed = true;
                    cb(error);
                }

                stat.name = fn;

                res.push(stat);

                if ( ++done === total ) cb(null, res);
            });
        });
    })
}

var getUniqueId = (function(){
    var lastId = 0;
    return function () {
        var time = (new Date()).getTime();
        return '__fs.storage.' + time + ++lastId
    }
})();

exports.Instance = Storage;
exports._tools = {
    lsStat        : Q.denodeify(lsStat),
    getUniqueId   : getUniqueId,
    markAsUnready : markAsUnready,
    markAsReady   : markAsReady
};
