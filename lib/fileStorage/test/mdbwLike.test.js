var path = require('path'),
    fs   = require('fs'),
    Q    = require('q'),
    utils   = require('./utils'),
    Database = require('../mdbwLike').Instance,

    TEMP_DIR_PATH = path.join(__dirname, 'tmp1');

before( utils.createTmpDir.bind(null, TEMP_DIR_PATH) );
after(  utils.removeTmpDir.bind(null, TEMP_DIR_PATH) );

describe('mdbw like database', function(){

    var DOC_A = JSON.stringify( require('./data/a.json') ),
        DOC_B = JSON.stringify( require('./data/b.json') ),
        DOC_C = JSON.stringify( require('./data/c.json') ),
        DOC_D = JSON.stringify( require('./data/d.json') ),
        DOC_E = JSON.stringify( require('./data/e.json') ),

        dbDescr1 = {
                'db1' : {
                    'cl1' : {
                        path        : path.join(__dirname, 'data'),
                        uniqueField : '_id'
                    }
                }
            },
        dbDescr2 = {
                'db1' : {
                    'cl1' : {
                        path        : TEMP_DIR_PATH,
                        uniqueField : '_id'
                    }
                }
            },
        sd1 = new Database(dbDescr1),
        sd2;

    describe('"get" should to return', function(){

        it('array of databases names if no arguments was passed', function(done){

            
            sd2 = new Database(dbDescr2);

            sd1.get()
            .then(function(docs){
                var got   = JSON.stringify(docs),
                    right = JSON.stringify(Object.keys(dbDescr1));

                got === right ? done() : done(Error(got));
            })
            .fail(done);
        });

        it(
            'array of collections names if just database name was passed',
            function(done){

                sd1.get('db1')
                .then(function(docs){
                    var got   = JSON.stringify(docs),
                        right = JSON.stringify(Object.keys(dbDescr1['db1']));

                    got === right ? done() : done(Error(got));
                })
                .fail(done);
            }
        );

        it(
            'empty array if just unexisting database name was passed',
            function(done){

                sd1.get('db100')
                .then(function(docs){
                    var got   = JSON.stringify(docs),
                        right = JSON.stringify([]);

                    got === right ? done() : done(Error(got));
                })
                .fail(done);
            }
        );

        it(
            'array of all items if no query was passed',
            function(done){

                sd1.get('db1', 'cl1')
                .then(function(docs){
                    docs.length === 5
                        ? done()
                        : done(Error(JSON.stringify(docs)));
                })
                .fail(done);
            }
        );

        it(
            'array of items that matches the query was passed',
            function(done){

                sd1.get('db1', 'cl1', { _id : 'a.json' })
                .then(function(docs){
                    docs.length === 1 && docs[0]._id === 'a.json'
                        ? done()
                        : done(Error(JSON.stringify(docs)));
                })
                .fail(done);
            }
        );

    });

    describe('"put" should', function(){

        it('to create a file for an item', function(done){

            sd2.put('db1', 'cl1', {
                '_id' : 'a.json',
                a : 'A'
            })
            .then(function(){
                fs.readFile(
                    path.join(TEMP_DIR_PATH, 'a.json'),
                    function(error, data){

                        if ( error ) return done(error);

                        var doc = JSON.parse( data.toString() );

                        doc.a === 'A' && doc._id === 'a.json'
                            ? done()
                            : done(Error(
                                    'wrong file format\n' + 
                                    data.toString()
                                ));
                    }
                )

            })
            .fail(done);
        });
    });

    describe('"update" should', function(){

        it('to update a file for an item', function(done){

            sd2.update(
                'db1',
                'cl1',
                { '_id' : 'a.json' },
                { a : 'AA', b : 'BB' }
            )
            .then(function(){
                fs.readFile(
                    path.join(TEMP_DIR_PATH, 'a.json'),
                    function(error, data){

                        if ( error ) return done(error);

                        var doc = JSON.parse( data.toString() );

                        doc.a === 'AA' && doc.b === 'BB' && doc._id === 'a.json'
                            ? done()
                            : done(Error(
                                    'wrong file format\n' + 
                                    data.toString()
                                ));
                    }
                )

            })
            .fail(done);
        });
    });

    describe('"rm" should', function(){

        it('to remove a file for an item', function(done){

            sd2.rm(
                'db1',
                'cl1',
                { '_id' : 'a.json' }
            )
            .then(function(){
                fs.exists( 'a.json', function (exists){

                    exists
                        ? done('the file aa.json was not removed')
                        : done()
                })
            })
            .fail(done);
        });
    });

    describe('"_updateAllCollectionsDocsLists" should', function(){
        it('should update docs list', function(done){

            var obj = {
                    _id : 'dd.json',
                    d   : 'DD'
                },
                stringified = JSON.stringify(obj);

            if ( sd2._dbs.db1.cl1._list.hasOwnProperty('dd.json') ) done(Error(
                'collection has \'dd.json\' already'
            ));

            fs.writeFile(
                path.join(TEMP_DIR_PATH, 'dd.json'),
                stringified,
                function(error){
                    if ( error ) done(Error('can\'t write file ' + error.stack));

                    sd2._updateAllCollectionsDocsLists()
                    .then(function(){
                        if ( !sd2._dbs.db1.cl1._list.hasOwnProperty('dd.json') ) done(Error(
                            'collection hasn\'t been updated'
                        ));

                        done();
                    })
                    .fail(done)
                }
            );
        });
    });
});
