/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var Q = require('q'),
    core = require('../core'),
    log = new (require('../../utils/log')).Instance({label:'GATES_CORE'});


function Constr ( o ) {
    core.Constructor.call(this, o ? { users : o.users } : null);
};


Constr.fn = Constr.prototype = new core.Constructor;


Constr.fn.onFail = function (req, res, reason, httpStatus) {
    res.statusCode = httpStatus || 200;
    res.json({
        result : 'failed',
        reason : reason || 'unauthorized'
    })
};

Constr.fn.onSuccess = function (req, res, next, pocket) {
    this.catchRes(req, res, pocket);
    next();
};

Constr.fn.onEnd = function () {};

// proxy res.end to make essential changes on its invokation
Constr.fn.catchRes = function (req, res, pocket) {
    var end = res.end,
        that = this;

    res.end = function (data, encoding) {
        res.end = end;

        if ( !that.onEnd ) return res.end(data, encoding);

        Q.when(that.onEnd(req, res, data, pocket),
            function (_data) {

                if ( _data === data ) {
                    //log.dbg('Answered with unchanged data: ');
                    //log.dbg(data);
                    return res.end(data, encoding);
                }

                if ( typeof _data !== 'string' ) {
                    //log.dbg('Answered with changed data(not a string): ');
                    //log.dbg(_data);
                    return res.json(_data);
                }

                    //log.dbg('Answered with changed data(is string): ');
                    //log.dbg(_data);
                res.end(_data);
            },
            function (error) {
                log.error(error);
                res.statusCode = 500;
                res.end();
            }
        )
        .done();
    }
}


exports.Constructor = Constr;
