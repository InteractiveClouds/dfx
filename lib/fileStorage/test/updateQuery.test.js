var Query  = require('../updateQuery').Instance,
    assert = require('assert');


describe('update query', function(){

    describe('$inc', function(){

        it('should increase value', function(){

            var q = new Query({
                    $inc : { a : 1 }
                }),
                o = {
                    a : 1,
                    b : 'some'
                };

            q.execute(o),

            assert.equal( o.a === 2, true );
        });

        it('should decrease value', function(){

            var q = new Query({
                    $inc : { a : -1 }
                }),
                o = {
                    a : 2,
                    b : 'some'
                };

            q.execute(o),

            assert( o.a === 1 );
        });

        it('should do multiply operations', function(){

            var q = new Query({
                    $inc : {
                        a : -1,
                        b :  1,
                        c :  2
                    }
                }),
                o = {
                    a : 2,
                    b : 2,
                    c : 3
                };

            q.execute(o);

            assert( o.a === 1 && o.b === 3 && o.c === 5 );
        });

        it('should work with nested options', function(){

            var q = new Query({
                    $inc : {
                        a       : -1,
                        'b.d.e' :  1,
                        c       :  2
                    }
                }),
                o = {
                    a : 2,
                    b : {
                        d : {
                            e : 2
                        }
                    },
                    c : 3
                };

            q.execute(o);

            assert( o.a === 1 && o.b.d.e === 3 && o.c === 5 );
        });

    });

    describe('$set', function(){

        it('should set specified option to value', function(){

            var q = new Query({
                    $set : { a : 'AA' }
                }),
                o = {
                    a : 'A',
                    b : 'some'
                };

            q.execute(o),

            assert.equal( o.a === 'AA', true );
        });

        it('should do multiply operations', function(){

            var q = new Query({
                    $set : {
                        a : 'AA',
                        b : 'BB',
                        c : 'CC'
                    }
                }),
                o = {
                    a : 'A',
                    b : 'B',
                    c : 'C'
                };

            q.execute(o);

            assert( o.a === 'AA' && o.b === 'BB' && o.c === 'CC' );
        });

        it('should work with nested options', function(){

            var q = new Query({
                    $set : {
                        a       : 'AA',
                        'b.d.e' : 'EE',
                        c       : 'CC'
                    }
                }),
                o = {
                    a : 'A',
                    b : {
                        d : {
                            e : 'E'
                        }
                    },
                    c : 'C'
                };

            q.execute(o);

            assert( o.a === 'AA' && o.b.d.e === 'EE' && o.c === 'CC' );
        });

    });

    describe('auto $set (no operators)', function(){

        it('should set specified option to value', function(){

            var q = new Query({
                    a : 'AA'
                }),
                o = {
                    a : 'A',
                    b : 'some'
                };

            q.execute(o),

            assert.equal( o.a === 'AA', true );
        });

        it('should do multiply operations', function(){

            var q = new Query({
                    a : 'AA',
                    b : 'BB',
                    c : 'CC'
                }),
                o = {
                    a : 'A',
                    b : 'B',
                    c : 'C'
                };

            q.execute(o);

            assert( o.a === 'AA' && o.b === 'BB' && o.c === 'CC' );
        });

        it('should work with nested options', function(){

            var q = new Query({
                    a       : 'AA',
                    'b.d.e' : 'EE',
                    c       : 'CC'
                }),
                o = {
                    a : 'A',
                    b : {
                        d : {
                            e : 'E'
                        }
                    },
                    c : 'C'
                };

            q.execute(o);

            assert( o.a === 'AA' && o.b.d.e === 'EE' && o.c === 'CC' );
        });

    });

    describe('$rename', function(){

        it('should rename param', function(){

            var q = new Query({
                    $rename : { b : 'c' }
                }),
                o = {
                    a : 1,
                    b : 'some'
                };

            q.execute(o),

            assert.equal( o.c === 'some' && o.b === undefined, true );
        });
    });
});
