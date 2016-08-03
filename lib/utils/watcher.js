
/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var runnningReguests = {};
var inactiveTenants = [];
var CHANNELS = require('../channels').channels;

var A = {};

A.setRequestRun = function( tenant ) {
    if (!runnningReguests[tenant])  {
        runnningReguests[tenant] = 0;
    }
    runnningReguests[tenant]++;
}

A.setRequestStop = function( tenant ) {
    if (runnningReguests[tenant])  {
        runnningReguests[tenant]--;
    }
    if (A.getRequestsStatus( tenant ) == 0) {
        CHANNELS.root.publish('allTenantRequestAreFinished_' + tenant , {});
    }
    if (A.isAllRequestsAreFinished()) {
        CHANNELS.root.publish('allTenantsRequestAreFinished', {});
    }

}

A.isAllRequestsAreFinished = function() {
    var status = true;
    Object.keys(runnningReguests).forEach(function(key){
        if (runnningReguests[key] != 0){
            status = false;
        }
    });
    return status;
}

A.getRequestsStatus = function( tenant ) {
    return runnningReguests[tenant] ? runnningReguests[tenant] : 0;
}

A.getRequestsStatusAllTenants = function() {
    return runnningReguests;
}

A.setInactiveTenant = function(tenant) {
    inactiveTenants.push(tenant);
}

A.getInactiveTenants = function(tenant) {
    return inactiveTenants;
}

A.setActiveTenant = function(tenant) {
    inactiveTenants.splice(inactiveTenants.indexOf(tenant),1);
}

A.parseCookies = function(request) {
    var list = {},
        rc = request.headers.cookie;

    rc && rc.split(';').forEach(function (cookie) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}

A.verifyAuthRequest = function(url) {
    var regex1 = new RegExp("^/studio/|^/deploys/");
    var regex2 = new RegExp("/login");
    return  (regex1.exec(url) && !regex2.exec(url))  ? true : false;
}

module.exports = A;

