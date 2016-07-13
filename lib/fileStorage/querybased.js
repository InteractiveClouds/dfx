// TODO throws to something else
var Q = require('q'),

    Core        = require('./idbased').Instance,
    _coreTools  = require('./idbased')._tools,
    SearchQuery = require('./searchQuery').Instance,
    UpdateQuery = require('./updateQuery').Instance,

    _coreRm  = Core.prototype.rm,
    _coreGet = Core.prototype.get,
    _corePut = Core.prototype.put;


function QueryBased ( o ) {

    Core.call(this, o);

    this.idFieldName = o.idFieldName;
}

QueryBased.fn = QueryBased.prototype;
QueryBased.fn._updateDocsList = Core.prototype._updateDocsList;

QueryBased.fn.get = function ( query ) {

    if (
        query                                       &&
        query.hasOwnProperty(this.idFieldName)      &&
        Object.keys(query).length === 1             &&
        typeof query[this.idFieldName] === 'string'
    ) {
        return _coreGet.call(this, query[this.idFieldName])
        .then(function(doc){ return doc === null ? [] : [doc] });
    }

    var that = this;

    return this._isReady
        ? getMatched( this, new SearchQuery(query) )
        : Q.when(this.ready, function(){
                return getMatched( that, new SearchQuery(query) );
            });
};

QueryBased.fn.put = function ( obj ) {

    if ( !obj.hasOwnProperty(this.idFieldName) ) {
        obj[this.idFieldName] = _coreTools.getUniqueId();
        // TODO inform
    }

    var doc = JSON.stringify(obj);

    return _corePut.call(this, obj[this.idFieldName], doc)
};

QueryBased.fn.update = function ( searchQuery, updateQuery, options ) {

    options  = options || {};

    const
        multi  = options.hasOwnProperty('multi')  ? options.multi  : true,
        upsert = options.hasOwnProperty('upsert') ? options.upsert : false;

    var that = this;

    return this.get(searchQuery).then(function(docs){

        var updateDoc = new UpdateQuery(updateQuery),
            newDoc = {},
            promises = [];

        if ( !docs.length ) {
            if ( !upsert ) return;
            updateDoc.execute(newDoc);
            return that.put(newDoc)
        }

        if ( multi ) {
            docs.forEach(function(doc){
                updateDoc.execute(doc);
                promises.push( that.put(doc) );
            });

            return Q.all(promises);
        } else {
            updateDoc.execute(docs[0]);
            return that.put(docs[0]); //TODO put upsert?
        }
    });
};

QueryBased.fn.rm = function ( query ) {
    var that = this;

    return this.get(query).then(function(docs){

        if ( !docs.length ) return;

        var promises = [];

        docs.forEach(function(doc){
            promises.push(
                _coreRm.call(that, doc[that.idFieldName])
            );
        });

        return Q.all(promises);
    });
};

QueryBased.fn.count  = function (query) {
    return this.get(query).then(function(docs){ return docs.length });
};

QueryBased.fn.exists = function () { throw(Error('not implemented')) };
QueryBased.fn.exit   = function () { throw(Error('not implemented')) };
QueryBased.fn.native = function () { throw(Error('not implemented')) };
QueryBased.fn.getOne = function () { throw(Error('not implemented')) };

function getMatched ( storage, query ) {

    var promises = [],
        docs     = [];

    Object.keys(storage._list).forEach(function(id){

        promises.push(_coreGet.call(storage, id).then(function(doc){

            // TODO find another way to inform about it
            if ( !doc.hasOwnProperty(storage.idFieldName) ) throw(Error(
                'wrong doc format: no "' + storage.idFieldName + '" was found'
            ));

            if ( query.test(doc) ) docs.push(doc);
        }))
    });

    return Q.all(promises)
    .then(function(){
        return docs;
    });
}

exports.Instance = QueryBased;
