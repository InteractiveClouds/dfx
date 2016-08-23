var SETTINGS = require('../dfx_settings');
var Q = require('q');
var watcher = require('./watcher');
var CHANNELS = require('../channels').channels;
var cache = require('./redisLayer');

var A = {};

A.init = function ( list ) {
    return cache.Arr.get("activeTenants").then(function( tenants ){
        if (!tenants.length) {
            cache.Arr.add("activeTenants",list);
        }
    });
}

A.add = function ( tenant ) {
    cache.Arr.add("activeTenants", tenant);
}

A.delete = function ( tenant ) {
    cache.Arr.delete("activeTenants", tenant);
}

A.activate = function ( req, res ) {
    cache.Arr.get("activeTenants").then(function( tenants ){
        if (req.body.tenantId) {
            var tenantId = req.body.tenantId;
            if (tenants.indexOf(tenantId) == -1)
                A.add(req.body.tenantId);
        } else if (req.body.list) {
            var list = req.body.list;
            list.forEach(function(tenant){
                if (tenants.indexOf(tenant) == -1)
                    A.add(tenant);
            });
        }
        var response = req.body.tenantId ? " Request on activating tenant " + req.body.tenantId + " was sent" : "Request on activating tenants " + req.body.list + " was sent";
        res.status(200).send(response);
    });
}

A.deactivate = function ( req, res ) {
    cache.Arr.get("activeTenants").then(function( tenants ) {
        if (req.body.tenantId) {
            var index = tenants.indexOf(req.body.tenantId);
            if (index > -1) {
                if (watcher.getRequestsStatus(req.body.tenantId) == 0) {
                    cache.Arr.delete("activeTenants", req.body.tenantId);
                } else {
                    watcher.setInactiveTenant(req.body.tenantId);
                    var cbFunction = function () {
                        if (CHANNELS.root._getListeners('allTenantRequestAreFinished_' + req.body.tenantId).length) {
                            watcher.setActiveTenant(req.body.tenantId);
                            cache.Arr.delete("activeTenants", req.body.tenantId);

                            CHANNELS.root.unsubscribe('allTenantRequestAreFinished_' + req.body.tenantId, cbFunction);
                        }

                    }
                    setTimeout(cbFunction, SETTINGS.loadBalancing.pendingRequestsTimeOut);
                    CHANNELS.root.subscribe('allTenantRequestAreFinished_' + req.body.tenantId, cbFunction);
                }
            }
        } else if (req.body.list) {
            var list = req.body.list;
            list.forEach(function (tenant) {
                var index = tenants.indexOf(tenant);
                if (index > -1) {
                    if (watcher.getRequestsStatus(tenant) == 0) {
                        cache.Arr.delete("activeTenants", tenant);
                    } else {
                        watcher.setInactiveTenant(tenant);
                        var cbFunction = function () {
                            if (CHANNELS.root._getListeners('allTenantRequestAreFinished_' + tenant).length) {
                                var index = tenants.indexOf(tenant);
                                watcher.setActiveTenant(tenant);
                                if (index > -1) {
                                    cache.Arr.delete("activeTenants", tenant);
                                }

                                CHANNELS.root.unsubscribe('allTenantRequestAreFinished_' + tenant, cbFunction);
                            }

                        }
                        setTimeout(cbFunction, SETTINGS.loadBalancing.pendingRequestsTimeOut);
                        CHANNELS.root.subscribe('allTenantRequestAreFinished_' + tenant, cbFunction);
                    }
                }
            });
        }
        var response = req.body.tenantId ? " Request on deactivating tenant " + req.body.tenantId + " was sent" : "Request on deactivating tenants " + req.body.list + " was sent";
        res.status(200).send(response);
    });
}

A.getAll = function() {
    return cache.isInit() ? cache.Arr.get("activeTenants") : Q.resolve(false);
}

module.exports = A;
