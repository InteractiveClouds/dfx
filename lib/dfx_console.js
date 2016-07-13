/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */
var getLogsList = require('./utils/log/utils/getLogsList'),
    sysadmin    = require('./dfx_sysadmin'),
    updateTool  = require('./updateTool'),
    version     = require('../package.json').version,

    Console = {};

Console.getConsole = function(req, res) {
    sysadmin.cloudRepository.get().then(function ( info ) {

        info.version = version;

        updateTool.checkVersion().then(
            function(newVersion){
                info.newVersion = newVersion;
                res.render('console', info);
            },
            function () {
                res.render('console', info);
            }
        );
    });
};

Console.editTenant = function(req, res) {
    sysadmin.tenant.get(req.params.tenantId)
        .then(function(tenant){
            if(!tenant.databaseTokens){
                res.redirect('/console');
                return;
            }
            res.render('tenant', {tenant: tenant, version: version});
        })
};

Console.createTenant = function(req, res) {
    sysadmin.tenant.create(req.body.fldTenantID, req.body.fldPassword)
        .then( function () { res.redirect('/console'); } )
        .fail(function(err){
            res.send(500, err);
        })
};

Console.deleteTenant = function(req, res) {
    sysadmin.tenant.remove(req.params.tenantId)
        .then( function () { res.redirect('/console'); } )
};

Console.generateToken = function(req, res) {
    var tenantId = req.params.tenantId,
        token = req.body.token;
    if(tenantId && token){
        sysadmin.tenant.removeDatabaseToken(tenantId, token)
            .then(function(data){
                sysadmin.tenant.generateNewDatabaseToken(tenantId)
                    .then(function(data){
                        res.end(JSON.stringify({
                            token: data
                        }));
                    })
            })
    }
};

Console.removeToken = function(req, res) {
    var tenantId = req.params.tenantId,
        token = req.body.token;
    if(tenantId && token){
        sysadmin.tenant.removeDatabaseToken(tenantId, token)
            .then(function(data){
                res.redirect('/console/'+tenantId+'/edit');
            })
            .fail( function (error){ throw error; } )
    }
};

Console.initRepo = function(req, res) {
    console.log("Init");
    sysadmin.cloudRepository.init().fin(function() {
        res.redirect('/console');
    });
};

Console.getFilesList = function(req, res) {
    getLogsList().then(
        function(list){ res.json({ list : list }); },
        function(list){ res.json({ list : [] }); }
    );
};



module.exports = Console;
