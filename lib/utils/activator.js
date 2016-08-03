var activeTenants = [];
var watcher = require('./watcher');
var CHANNELS = require('../channels').channels;
var SETTINGS = require('../dfx_settings');

var A = {};

A.init = function ( list ) {
    activeTenants = list;
}

A.activate = function ( req, res ) {
    if (req.body.tenantId) {
        var tenantId = req.body.tenantId;
        if (activeTenants.indexOf(tenantId) == -1)
            activeTenants.push(req.body.tenantId);
    } else if (req.body.list) {
        var list = req.body.list;
        list.forEach(function(tenant){
            if (activeTenants.indexOf(tenant) == -1)
                activeTenants.push(tenant);
        });
    }
    var response = req.body.tenantId ? " Request on activating tenant " + req.body.tenantId + " was sent" : "Request on activating tenants " + req.body.list + " was sent";
    res.status(200).send(response);
}

A.deactivate = function ( req, res ) {
    if (req.body.tenantId ) {
        var index = activeTenants.indexOf(req.body.tenantId);
        if (index > -1) {
            if (watcher.getRequestsStatus(req.body.tenantId) == 0) {
                activeTenants.splice(index, 1);
            } else {
                watcher.setInactiveTenant(req.body.tenantId);
                var cbFunction = function() {
                    if (CHANNELS.root._getListeners('allTenantRequestAreFinished_' + req.body.tenantId).length) {
                        watcher.setActiveTenant(req.body.tenantId);
                        activeTenants.splice(index, 1);

                        CHANNELS.root.unsubscribe('allTenantRequestAreFinished_' + req.body.tenantId, cbFunction);
                    }

                }
                setTimeout(cbFunction, SETTINGS.loadBalancing.pendingRequestsTimeOut);
                CHANNELS.root.subscribe('allTenantRequestAreFinished_' + req.body.tenantId, cbFunction);
            }
        }
    } else if (req.body.list) {
        var list = req.body.list;
        list.forEach(function(tenant){
            var index = activeTenants.indexOf(tenant);
                if (index > -1) {
                    if (watcher.getRequestsStatus(tenant) == 0) {
                        activeTenants.splice(index, 1);
                    } else {
                        watcher.setInactiveTenant(tenant);
                        var cbFunction  = function() {
                            if (CHANNELS.root._getListeners('allTenantRequestAreFinished_' + tenant).length) {
                                var index = activeTenants.indexOf(tenant);
                                watcher.setActiveTenant(tenant);
                                if (index > -1) {
                                    activeTenants.splice(index, 1);
                                }

                                CHANNELS.root.unsubscribe('allTenantRequestAreFinished_' + tenant, cbFunction);
                            }

                        }
                        setTimeout(cbFunction, SETTINGS.loadBalancing.pendingRequestsTimeOut);
                        CHANNELS.root.subscribe('allTenantRequestAreFinished_' + tenant, cbFunction);
                    }
                }
        });
    };
    var response = req.body.tenantId ? " Request on deactivating tenant " + req.body.tenantId + " was sent" : "Request on deactivating tenants " + req.body.list + " was sent";
    res.status(200).send(response);
}

A.getAll = function() {
    return activeTenants;
}

module.exports = A;
