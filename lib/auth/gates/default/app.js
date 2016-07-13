/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var Q     = require('q'),
    core  = require('../gate.core'),
    utils = require('../../utils'),

    md5   = utils.md5,
    time  = utils.time;

var log = new (require('../../../utils/log')).Instance({label:'GATES_APP'});

function Constr ( o ) {
    core.Constructor.call(this, { users : o.users });

    this.tokenManager = o.tokenManager;

    this.use(this.parse);
    this.use(this.parseSeal);
    this.use(this.checkTokenFreshness);
    this.use(this.checkSeal);
}

Constr.prototype = new core.Constructor;

Constr.fn = Constr.prototype;

Constr.fn.onEnd = function (req, res, data, pocket) {
    var _data = data;

    try { _data = JSON.parse(data) } catch (e) {};

    return Q.when(
        this.tokenManager.tick(pocket.tokenid, req.session),
        function ( nonce ) {

            return {
                data   : _data,
                result : 'success'
            };
        }
    )
}

Constr.fn.parse = function (req, success, fail, pocket) {

    //log.dbg('trying to parse request ...');

    var method = req.method,
        where  = method === 'GET' ? 'query' : 'body',
        seal   = req[where].seal,
        data   = null;

    if ( !seal ) return fail('no seal');

    try { data = JSON.parse(req[where].data) }
    catch (e) {};

    pocket.where      = where;
    pocket.method     = method;
    pocket.path       = req.path;
    pocket.dataString = req[where].data;
    pocket.data       = data;
    pocket.seal       = seal;
    pocket.appname    = req.params.appname;
    pocket.apiroute   = req.params[0];

    if ( !pocket.seal ) return fail('no seal is found');

    //log.dbg(
    //    'gate.app request is PARSED:\n"' +
    //    pocket.method + '" request for "' + pocket.path + '"' +
    //    '\nDATA: '    + pocket.dataString +
    //    '\nPARSED: '  + !!pocket.data +
    //    '\nCNONCE: '  + pocket.cnonce +
    //    '\nCHASH: '   + pocket.chash + 
    //    '\nTOKENID: ' + pocket.tokenid
    //);

    success();
};

Constr.fn.parseSeal = function (req, success, fail, pocket) {

    pocket.cnonce     = pocket.seal.slice(0,32);
    pocket.chash      = pocket.seal.slice(32,64);
    pocket.tokenid    = pocket.seal.slice(64);

    if ( !pocket.tokenid ) return fail('no token id is found');

    success();
};

Constr.fn.checkTokenFreshness = function (req, success, fail, pocket) {

    //log.dbg('trying to check token freshness ...');

    var that = this;

    this.tokenManager.get(pocket.tokenid)
    .then(
        function(token){

            pocket.token = token;
            req.session = token.session;

            var error;

            if ( token.callsLeft < 1 ) {
                error = log.dbg('Token "' + pocket.tokenid + '" has no calls left.');
            }

            if ( token.expires < time.now ) {
                error = log.dbg('Token "' + pocket.tokenid + '" is expired.');
            }

            return !error
                ? Q.resolve()
                : that.tokenManager.rm(pocket.tokenid)
                    .then(function(){

                        log.dbg('Token "' + pocket.tokenid + '" has been removed.');

                        return Q.reject('expired token');
                    })
        },
        function (error) {
        
            return Q.reject(Error(log.dbg(
                'Checking token FAILED: Can not found the token with the id "' +
                pocket.tokenid + '". ' + (error || '')
            )));
        }
    )
    .then(success, fail);
};

Constr.fn.checkSeal = function (req, success, fail, pocket) {

    var token = pocket.token,
        key = [
                token.nonce,
                pocket.cnonce,
                token.secret,
                pocket.path,
                pocket.method,
                pocket.dataString
            ].join('::'),
        hash = md5(key);

    if ( hash !== pocket.chash ) return fail(Error(
        //log.dbg(
        'Cheking seal FAILED. Have got wrong hash\n"' +
        pocket.hash + '", it must be\n"' + hash + '".\nKey is:\n' + key
        //)
    ));

    pocket.tenantid = token.tenantid;
    pocket.userid   = token.userid;

    req.user = this.touchUser(token.tenantid, token.userid, token.appid);
    req.user.tokenid  = pocket.tokenid;

    req[pocket.where] = req.data = pocket.data;

    success();
};

exports.Constructor = Constr;
