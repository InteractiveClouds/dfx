var path = require('path'),
    fs   = require('fs'),
    Q    = require('q'),
    utils   = require('./utils'),
    Storage = require('../querybased').Instance,

    TEMP_DIR_PATH = path.join(__dirname, 'tmp');

before( utils.createTmpDir.bind(null, TEMP_DIR_PATH) );
after(  utils.removeTmpDir.bind(null, TEMP_DIR_PATH) );

describe('query-based-storage', function(){

    var DOC_A = JSON.stringify( require('./data/a.json') ),
        DOC_B = JSON.stringify( require('./data/b.json') ),
        DOC_C = JSON.stringify( require('./data/c.json') ),
        sd = new Storage({
                path : path.join(__dirname, 'data'),
                idFieldName : '_id'
            }),
        se;

    it('should read existing entries by query with the id', function(done){

        // creating the storage here is a cratch
        // cause it must be done after creating temp dir 'tmp'
        se = new Storage({
                path : TEMP_DIR_PATH,
                idFieldName : '_id'
            });

        sd.get({_id : 'a.json'})
        .then(function(docs){

            doc = JSON.stringify(docs[0]);

            if ( doc === DOC_A ) done();
            else done(Error(
                '\nshould be:\n' +
                DOC_A +
                '\nbut got:\n' +
                doc
            ))
        })
        .fail(done);
    });

    it('should read entries by query 1', function(done){

        sd.get({
            $or : [
                { b : { $lt : 2 } },
                { b : { $gt : 4 } }
            ]
        })
        .then(function(docs){

            if ( docs.length !== 2 ) return done(Error(
                    'docs length !== 2\n' +
                    JSON.stringify(docs,null,4)
                ))

            if (
                ( docs[0]['_id'] === 'a.json' && docs[1]['_id'] === 'e.json' ) ||
                ( docs[0]['_id'] === 'e.json' && docs[1]['_id'] === 'a.json' )
            ) {
                done();
            } else {
                done(Error(
                    JSON.stringify(docs,null,4)
                ))
            }
        })
        .fail(done);
    });

    it('should read entries by query 2', function(done){

        sd.get({
            c : 'C'
        })
        .then(function(docs){

            if ( docs.length !== 2 ) return done(Error(
                    'docs length !== 2\n' +
                    JSON.stringify(docs,null,4)
                ))

            if (
                ( docs[0]['_id'] === 'b.json' && docs[1]['_id'] === 'd.json' ) ||
                ( docs[0]['_id'] === 'd.json' && docs[1]['_id'] === 'b.json' )
            ) {
                done();
            } else {
                done(Error(
                    JSON.stringify(docs,null,4)
                ))
            }
        })
        .fail(done);
    });

    it('should read entries by query 3', function(done){

        sd.get({
            d : 'D'
        })
        .then(function(docs){

            if ( docs.length !== 2 ) return done(Error(
                    'docs length !== 2\n' +
                    JSON.stringify(docs,null,4)
                ))

            if (
                ( docs[0]['_id'] === 'b.json' && docs[1]['_id'] === 'd.json' ) ||
                ( docs[0]['_id'] === 'd.json' && docs[1]['_id'] === 'b.json' )
            ) {
                done();
            } else {
                done(Error(
                    JSON.stringify(docs,null,4)
                ))
            }
        })
        .fail(done);
    });

    it('should create file for new entry', function(done){

        var obj = {
                _id : 'f.json',
                f   : 'FF'
            },
        stringified = JSON.stringify(obj);

        se.put(obj)
        .then(function(){
            fs.readFile( path.join(TEMP_DIR_PATH, 'f.json'), function(error, data){

                if ( error ) return done(error);

                if ( data.toString() === stringified ) done();
                else done(Error(
                    '\nexpected:\n' +
                    stringified +
                    '\ngotten:\n' +
                    data
                ))
            })
        })
        .fail(done)
    });

    it('should create file for new entry', function(done){

        var obj_1 = {
                _id : 'aa.json',
                f   : 'F',
                j   : 'J'
            },
            obj_2 = {
                _id : 'bb.json',
                f   : 'F',
                j   : 'J'
            },
            obj_3 = {
                _id : 'cc.json',
                f   : 'F'
            },
        json_1 = JSON.stringify(obj_1),
        json_2 = JSON.stringify(obj_2),
        json_3 = JSON.stringify(obj_3);

        Q.all([
            se.put(obj_1),
            se.put(obj_2),
            se.put(obj_3)
        ])
        .then(function(){
            return se.update(
                //{ $exists : 'j' },
                { j : 'J' },
                { $set : { f : 'FF' } }
            );
        })
        .then(function(){
            fs.readFile( path.join(TEMP_DIR_PATH, 'aa.json'), function(error, aa){
                if ( error ) return done(error);
                fs.readFile( path.join(TEMP_DIR_PATH, 'bb.json'), function(error, bb){
                    if ( error ) return done(error);
                    fs.readFile( path.join(TEMP_DIR_PATH, 'cc.json'), function(error, cc){
                        if ( error ) return done(error);

                        var a, b, c;
                        
                        try {
                            a = JSON.parse( aa.toString() );
                            b = JSON.parse( bb.toString() );
                            c = JSON.parse( cc.toString() );
                        } catch (error) {
                            done(Error(
                                'can not parse:\n' +
                                aa.toString() + '\n' +
                                bb.toString() + '\n' +
                                cc.toString()
                            ));
                        }

                        if (
                            a.f === 'FF' &&
                            b.f === 'FF' &&
                            c.f === 'F'
                        ) {
                            done();
                        } else {
                            done(Error(
                                'wrong update:\n' +
                                JSON.stringify(a) + '\n' +
                                JSON.stringify(b) + '\n' +
                                JSON.stringify(c)
                            ));
                        }
                    })
                })
            })
        })
        .fail(done)
    });

    it('should remove items according query', function(done){
        se.rm({ j : 'J' }).then(function(){

            fs.exists( 'aa.json', function (exists){
                if ( exists ) return done('the file aa.json was not removed');

                fs.exists( 'bb.json', function (exists){
                    if ( exists ) return done('the file bb.json was not removed');

                    done();
                });
            });
        })
        .fail(done)
    });

    it('should resolve if rm for unexisting id is invoked', function(done){
        se.rm({ _id : 'unexisting' }).then(function(){
            done();
        })
        .fail(done)
    });

    it('should return all items if there is no query', function(done){

        se.get().then(function(docs){

            docs.length === 3
                ? done()
                : done(JSON.stringify(docs))
        })
        .fail(done)
    });

    it('should count items according a query', function(done){

        sd.count({d : { $exists : true }}).then(function(n){

            n === 2
                ? done()
                : done(n)
        })
        .fail(done)
    });
})
