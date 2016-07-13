var Query  = require('../searchQuery').Instance;
    assert = require('assert');


describe('query', function(){

    describe('should return true on', function(){

        it('single $eq', function(){

            var q = new Query({
                    a : { $eq : 'A' }
                }),
                o = {
                    a : 'A',
                    b : 'some'
                };

            assert.equal( q.test(o), true );
        });

        it('hidden $eq', function(){

            var q = new Query({
                    a : 'A'
                }),
                o = {
                    a : 'A',
                    b : 'some'
                };

            assert.equal( q.test(o), true );
        });

        it('single $lt', function(){

            var q = new Query({
                    a : { $lt : 2 }
                }),
                o = {
                    a : 1,
                    b : 'some'
                };

            assert.equal( q.test(o), true );
        });

        it('single $gt', function(){

            var q = new Query({
                    a : { $gt : 2 }
                }),
                o = {
                    a : 3,
                    b : 'some'
                };

            assert.equal( q.test(o), true );
        });

        it('single $or', function(){

            var q = new Query({
                    $or : [
                        { a : 'A' },
                        { b : 'B' }
                    ]
                }),
                o = {
                    a : 'not A',
                    b : 'B'
                };

            assert.equal( q.test(o), true );
        });

        it('complex $or', function(){

            var q = new Query({
                    $or : [
                        { a : 'A' },
                        { b : { $lt : 7 } }
                    ]
                }),
                o = {
                    a : 'not A',
                    b : 5
                };

            assert.equal( q.test(o), true );
        });

    });

    describe('should return false on', function(){

        it('single $eq', function(){

            var q = new Query({
                    a : { $eq : 'A' }
                }),
                o = {
                    a : 'not A',
                    b : 'some'
                };

            assert.equal( q.test(o), false );
        });

        it('hidden $eq', function(){

            var q = new Query({
                    a : 'A'
                }),
                o = {
                    a : 'not A',
                    b : 'some'
                };

            assert.equal( q.test(o), false );
        });

        it('single $lt', function(){

            var q = new Query({
                    a : { $lt : 2 }
                }),
                o = {
                    a : 3,
                    b : 'some'
                };

            assert.equal( q.test(o), false );
        });

        it('single $gt', function(){

            var q = new Query({
                    a : { $gt : 2 }
                }),
                o = {
                    a : 1,
                    b : 'some'
                };

            assert.equal( q.test(o), false );
        });

        it('single $or', function(){

            var q = new Query({
                    $or : [
                        { a : 'A' },
                        { b : 'B' }
                    ]
                }),
                o = {
                    a : 'not A',
                    b : 'not B'
                };

            assert.equal( q.test(o), false );
        });

        it('complex $or', function(){

            var q = new Query({
                    $or : [
                        { a : 'A' },
                        { b : { $lt : 3 } }
                    ]
                }),
                o = {
                    a : 'not A',
                    b : 5
                };

            assert.equal( q.test(o), false );
        });

        it('when $exists is true', function(){

            var q = new Query({
                    a : { $exists : true }
                }),
                o = {
                    a : 'A',
                    b : 'some'
                };

            assert.equal( q.test(o), true );
        });

        it('when $exists is true and value is false', function(){

            var q = new Query({
                    a : { $exists : true }
                }),
                o = {
                    a : false,
                    b : 'some'
                };

            assert.equal( q.test(o), true );
        });


    });

    describe('should return true on dot notation', function(){

        it('single $eq', function(){

            var q = new Query({
                    'a.b.c' : { $eq : 'C' }
                }),
                o = {
                    a : {
                        b : {
                            c : 'C',
                            d : 'D'
                        }
                    },
                    b : 'some'
                };

            assert.equal( q.test(o), true );
        });

        it('single $lt', function(){

            var q = new Query({
                    'a.b.c' : { $lt : 3 }
                }),
                o = {
                    a : {
                        b : {
                            c : 1,
                            d : 'D'
                        }
                    },
                    b : 'not B'
                };

            assert.equal( q.test(o), true );
        });

        it('complex $or 1', function(){

            var q = new Query({
                    $or : [
                        { b : 'B' },
                        { 'a.b.c' : { $lt : 3 } }
                    ]
                }),
                o = {
                    a : {
                        b : {
                            c : 1,
                            d : 'D'
                        }
                    },
                    b : 'not B'
                };

            assert.equal( q.test(o), true );
        });

        it('complex $or 2', function(){

            var q = new Query({
                    $or : [
                        { b : 'B' },
                        {
                            'a.b.c' : { $lt : 5 },
                            'a.b.c' : { $gt : 1 }
                        }
                    ]
                }),
                o = {
                    a : {
                        b : {
                            c : 3,
                            d : 'D'
                        }
                    },
                    b : 'not B'
                };

            assert.equal( q.test(o), true );
        });

        it('when $exists is true', function(){

            var q = new Query({
                    'a.b.c' : { $exists : true }
                }),
                o = {
                    a : {
                        b : {
                            c : 'C',
                            d : 'D'
                        }
                    },
                    b : 'some'
                };

            assert.equal( q.test(o), true );
        });

        it('when $exists is false', function(){

            var q = new Query({
                    'a.b.c' : { $exists : false }
                }),
                o = {
                    a : {
                        b : {
                            c : 'C',
                            d : 'D'
                        }
                    },
                    b : 'some'
                };

            assert.equal( q.test(o), false );
        });

        it('when $exists is true for unexisting option', function(){

            var q = new Query({
                    'a.b.c' : { $exists : true }
                }),
                o = {
                    a : {
                        b : {
                            d : 'D'
                        }
                    },
                    b : 'some'
                };

            assert.equal( q.test(o), false );
        });
    });

});
