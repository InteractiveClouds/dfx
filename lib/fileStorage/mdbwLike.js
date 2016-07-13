var QueryBasedStorage = require('./querybased').Instance,
    Q = require('q');

function Database ( o ) {

    this._dbs = {};

    var that = this;

    Object.keys(o).forEach(function(dbName){

        that._dbs[dbName] = {};

        Object.keys(o[dbName]).forEach(function(clName){
            that._dbs[dbName][clName] = new QueryBasedStorage({
                path        : o[dbName][clName].path,
                idFieldName : o[dbName][clName].uniqueField
            });
        });
    });
}

Database.prototype.get = function( dbName, clName, query) {

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
            result = this._dbs[dbName][clName].get(query)
        }
    }

    return Q(result);
};

Database.prototype.put = function( dbName, clName, doc) {
    
    cratch(this, 'put', dbName, clName, doc);
    return this._dbs[dbName][clName].put(doc);
};

Database.prototype.update = function( dbName, clName, query, fields ) {
    
    cratch(this, 'update', dbName, clName, query);
    return this._dbs[dbName][clName].update(query, fields);
};

Database.prototype.rm = function( dbName, clName, query) {
    
    cratch(this, 'rm', dbName, clName, query);
    return this._dbs[dbName][clName].rm(query);
};

Database.prototype.count = function( dbName, clName ) {
    
    cratch(this, 'count', dbName, clName, {});
    return this._dbs[dbName][clName].count();
};

Database.prototype._updateAllCollectionsDocsLists = function() {
    var tasks = [];

    for ( var dbName in this._dbs ) {
        for ( var clName in this._dbs[dbName] ) {
            tasks.push( this._dbs[dbName][clName]._updateDocsList() )
        }
    }

    return Q.all(tasks);
};
    

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

exports.Instance = Database;
