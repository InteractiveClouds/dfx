var Q = require('q');

function Storage ( o ) {
    this.dbName = o.database,
    this.clFld  = o.collectionField,
    this.keyFld = o.keyField,
    this.db     = o.db
}

/**
 * @returns {Object|Array} document by 'id' (keyFld) or all documents
 */
Storage.prototype.get = function ( o ) {

    var query  = {},
        clName = o[this.clFld],
        that = this;

    if ( o[this.keyFld] ) query[this.keyFld] = o[this.keyFld];

    return ( o[this.keyFld] && isKeyWrong(o[this.keyFld]) ) ||
        isClNameWrong(clName)         ||
        this.db.get(this.dbName, clName, query)
        .then(function ( docs ){

            if ( that.keyFld !== '_id' ) docs = docs.map(function(e){
                delete e._id;
                return e;
            });

            return o[that.keyFld]
                ? docs && docs[0] || Q.reject('no such document')
                : docs || Q.reject('no documents found')
        });
}


Storage.prototype.put = function ( o ) {

    var clName = o[this.clFld];

    return isObjWrong(o.fields)    ||
        isClNameWrong(clName)      ||
        isKeyWrong(o.fields[this.keyFld]) ||
        this.db.put(this.dbName, clName, o.fields);
}


Storage.prototype.rm = function ( o ) {

    var query = {},
        clName = o[this.clFld];

    query[this.keyFld] = o[this.keyFld];

    return isKeyWrong(o[this.keyFld]) ||
        isClNameWrong(clName)         ||
        this.db.rm(this.dbName, clName, query)
        .then(function(){});
}


Storage.prototype.update = function ( o ) {

    var query = {},
        clName = o[this.clFld];

    query[this.keyFld] = o[this.keyFld];

    return isKeyWrong(o[this.keyFld]) ||
        isObjWrong(o.fields)          ||
        isClNameWrong(clName)         ||

        this.db.update(
            this.dbName,
            clName,
            query,
            {$set:o.fields},
            {multi: false}
        );
}

function isKeyWrong ( key ) {

    if ( !key ) return Q.reject('key is required');
    if ( typeof key !== 'string' ) return Q.reject('key must be a string');
}

function isClNameWrong ( clName ) {

    if ( !clName ) return Q.reject('collection name is required');
    if ( typeof clName !== 'string' ) return Q.reject('collection name must be a string');
}

function isObjWrong ( obj ) {

    return ( !obj || typeof obj !== 'object' )
        ? Q.reject('object is required')
        : undefined;
}

exports.Instance = Storage;
