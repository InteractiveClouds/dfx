var Q = require('q');

exports.isActive = function ( tenantid ) {
    //console.log('light tenants');
    return Q.resolve() // Q.reject()
};

exports.get = function ( tenantid ) {
    return Q({
        id : tenantid
    });
};
