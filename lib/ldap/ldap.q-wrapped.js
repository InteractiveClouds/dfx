var Ldap = function(){},
    Q    = require('q'),
    log = new (require('../utils/log')).Instance({label:'LDAP_'}),
    SETTINGS   = require('../dfx_settings');

if (SETTINGS.useLdapModule) {
    try {
        Ldap = require('LDAP');
    } catch ( e ) {
        log.error('module LDAP is not installed.');
    }
}

function Fake ( o ) {
    this.__trueLdap = new Ldap(o);
}


Fake.prototype.open = function () {
    return Q.ninvoke(this.__trueLdap, 'open');
};


Fake.prototype.simplebind = function ( o ) {
    return Q.ninvoke(this.__trueLdap, 'simplebind', o);
};


Fake.prototype.search = function ( o ) {
    return Q.ninvoke(this.__trueLdap, 'search', o);
};


Fake.prototype.close = function () {
    return this.__trueLdap.close();
};


exports.Instance = Fake;
