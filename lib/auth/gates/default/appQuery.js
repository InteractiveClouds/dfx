/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 2.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var Q        = require('q'),
    sysadmin = require('../../../dfx_sysadmin'),
    queries = require('../../../dfx_queries'),
    appGate  = require('./app');

var log = new (require('../../../utils/log')).Instance({label:'GATES_APPQUERY'});

function Constr ( o ) {
    appGate.Constructor.call(this, o);

    this.use(checkRights);
}

Constr.prototype = new appGate.Constructor({});

function checkRights (req, success, fail, pocket) {
    return queries.getDQObjByApiRoute(
        pocket.tenantid,
        pocket.appname,
        pocket.apiroute
    ).then(function(dataquery){

        if ( !dataquery ) return Q.reject(Error(
            'no dataqueri was found for' +
            ' tenant: ' + pocket.tenantid +
            ' application: ' + pocket.appname +
            ' apiRoute: ' + pocket.apiroute
        ));

        return req.user.hasEitherRight(
            'executeAny::dataquery', 'DATAQUERY::' + dataquery.name
        ).fail(function ( error ) {

            if (error) log.dbg(error);
            
            return Q.reject(Error(
                'User ' + pocket.tenantid + ':' + pocket.userid +
                ' has not right to execute query ' + pocket.data.queryName
            ));
        })
        .then(success, fail)
    });
}

exports.Constructor = Constr;
exports.checkRights = checkRights;
