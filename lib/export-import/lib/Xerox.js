const Q = require('q');
module.exports = Xerox;

function Xerox ( o ) {
    this.source  = o.source;
    this.target  = o.target;
    this.tenant  = o.tenant;
    this.doCrypt = !!(o.decrypt || o.encrypt);
}

Xerox.prototype.copy = function ( o ) {
    const
        that  = this,
        db    = o.db,
        cl    = o.cl,
        query = o.query;

    return that.source.get(db, cl, query)
    .then(function(docs){
        return that.doCrypt && typeof o.crypt === 'function'
            ? o.crypt(docs)
            : docs
    })
    .then(function(docs){
        return Q.all(docs.map(function(doc){
            if ( doc['stack'] ) {
                //console.log('STACK M : ', doc.message);
                //console.log('STACK S : ', doc.stack);
                return;
            }
            return that.target.put(db, cl, doc);
        }));
    });
};
