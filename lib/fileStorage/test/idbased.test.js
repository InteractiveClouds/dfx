var path = require('path'),
    fs   = require('fs'),
    utils   = require('./utils'),
    Storage = require('../idbased').Instance,

    TEMP_DIR_PATH = path.join(__dirname, 'tmp');

before( utils.createTmpDir.bind(null, TEMP_DIR_PATH) );
after(  utils.removeTmpDir.bind(null, TEMP_DIR_PATH) );

describe('id-based-storage', function(){

    var DOC_A = JSON.stringify( require('./data/a.json') ),
        sd = new Storage({
                path : path.join(__dirname, 'data')
            }),
        se;

    it('should read existing entries', function(done){

        // creating the storage here is a cratch
        // cause it must be done after creating temp dir 'tmp'
        se = new Storage({
            path : TEMP_DIR_PATH
        });

        sd.get('a.json')
        .then(function(doc){

            doc = JSON.stringify(doc);

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

    it('should return null for unexisting entries', function(done){

        sd.get('unexisting.json')
        .then(done)
        .fail(done);
    });

    it('should create file for new entry', function(done){

        var obj = { d : 'D' },
            stringified = JSON.stringify(obj);

        se.put('d.json', stringified)
        .then(function(){
            fs.readFile( path.join(TEMP_DIR_PATH, 'd.json'), function(error, data){
                if ( error ) return done(error);

                if ( data.toString() === stringified ) done();
                else done(Error(
                    '\nexpected:\n>' +
                    stringified +
                    '<\ngotten:\n>' +
                    data +
                    '<'
                ))
            })
        })
        .fail(done)
    });

    it('should update docs list', function(done){

        var obj = {
                _id : 'dd.json',
                d   : 'DD'
            },
            stringified = JSON.stringify(obj);

        if ( se._list.hasOwnProperty('dd.json') ) done(Error(
            'storage has \'dd.json\' already'
        ));

        fs.writeFile(
            path.join(TEMP_DIR_PATH, 'dd.json'),
            stringified,
            function(error){
                if ( error ) done(Error('can\'t write file ' + error.stack));

                se._updateDocsList()
                .then(function(){
                    if ( !se._list.hasOwnProperty('dd.json') ) done(Error(
                        'storage hasn\'t been updated'
                    ));

                    done();
                })
                .fail(done)
            }
        );
    });

    it('should remove file when rm is invoked', function(done){

        se.rm('d.json')
        .then(function(){

            fs.exists( 'd.json', function (exists){
                return !exists
                    ? done()
                    : done('the file was not removed')
            });
        });
    });
})
