var path = require('path'),
    fs   = require('fs'),
    Q    = require('q'),
    utils   = require('./utils'),
    Database = require('../mdbwLikeWithDbAndCl').Instance,
    QueryBasedStorage = require('../querybased').Instance,

    TEMP_DIR_PATH = path.join(__dirname, 'tmp2');

//before( utils.createTmpDir.bind(null, TEMP_DIR_PATH) );
before(function(done){
    utils.createTmpDir(TEMP_DIR_PATH, done)
});
after(  utils.removeTmpDir.bind(null, TEMP_DIR_PATH) );

describe('mdbwFull like database', function(){

    describe('should on existing filestructure', function(){

        var db;

        it('--- fake ---', function(done){
            db = new Database({
                path : path.join(TEMP_DIR_PATH)
            });

            db2 = new Database({
                path : path.join(__dirname, 'databases')
            });

            done();
        });


        it('to create appropriate _dbs', function(done){

            var db = new Database({
                path : path.join(__dirname, 'databases')
            });

            db.ready.then(function(){
                if (
                    db.hasOwnProperty('_dbs')                    &&
                    db._dbs.hasOwnProperty('db1')                &&
                    db._dbs.hasOwnProperty('db2')                &&
                    db._dbs.db1.hasOwnProperty('cl1')            &&
                    db._dbs.db1.hasOwnProperty('cl2')            &&
                    db._dbs.db1.cl1 instanceof QueryBasedStorage
                ) {
                    done()
                } else {
                    done('ERROR') // TODO
                }
            })
        });

        it('to create empty _dbs if filestructure is empty', function(done){

            db.ready.then(function(){
                if (
                    typeof db._dbs === 'object' &&
                    Object.keys(db._dbs).length === 0
                ) {
                    done()
                } else {
                    done('ERROR') // TODO
                }
            });
        });

        it('to create dir if database is not exists', function(done){

            db.ready.then(function(){
                return db.put('db3')
                .then(function(){
                    fs.exists(path.join(db._path, 'db3'), function(exists){
                        exists ? done() : done('failed')
                    });
                })
            })
            .fail(done)
        });

        it('to create dir if collection is not exists', function(done){

            return db.put('db3', 'cl1')
            .then(function(){
                fs.exists(path.join(db._path, 'db3', 'cl1'), function(exists){
                    exists ? done() : done('failed')
                });
            })
            .fail(done)
        });

        it('to return documents in right order (ascending)', function(done){

            return db2.get('db1', 'cl1', {}, {'s' : 1})
            .then(function(docs){

                if (
                    docs[0].s === '1' &&
                    docs[1].s === '2' &&
                    docs[2].s === '3'
                ) done();

                else done(JSON.stringify(docs, null, 4));
            })
            .fail(done)
        });

        it('to return documents in right order (descending)', function(done){

            return db2.get('db1', 'cl1', {}, {'s' : -1})
            .then(function(docs){

                if (
                    docs[0].s === '3' &&
                    docs[1].s === '2' &&
                    docs[2].s === '1'
                ) done();

                else done(JSON.stringify(docs, null, 4));
            })
            .fail(done)
        });
    });

});
