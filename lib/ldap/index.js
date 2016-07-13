var bindedStorage = require('../utils/storage_wrappers/db_key.bindedMDBWStorage.js'),
    endpoints     = require('../utils/endpoints'),
    Ldap          = require('./ldap.q-wrapped');


exports.init = function ( o ) {
    var db        = o.db,
        credCrypt = o.credCrypt,
        log       = o.log,
        tenants   = o.tenants,

        storage = new bindedStorage.Instance({
            db              : db,
            database        : 'ldapProviders',
            collectionField : 'tenant',
            keyField        : 'id'
        }),

        ldapProvidersStorage = require('./ldapProvidersStorage').init({
            storage : storage,
            crypt   : credCrypt,
            log     : log,
            tenants : tenants
        }),
    
        binder = require('./bind').init({
            storage : ldapProvidersStorage.storage,
            Ldap    : Ldap
        }),

        search = require('./search').init({
            bind    : binder.bind
        });


    exports.storage = endpoints.json({
        parser  : parseStorageReq,
        action  : ldapProvidersStorage.endpoint,
        log     : log
    });

    exports.searchR = search.search;
    exports.search = endpoints.json({
        parser  : parseSearchReq,
        action  : search.endpoint,
        log     : log
    });

    exports.bind  = binder.bind;
    exports.check = binder.check;


    delete exports.init;


    return exports;
}


function parseStorageReq ( req ) {
    return {
        tenant : req.session.tenant.id,
        action : req.body.action,
        id     : req.body.id,     // provider
        fields : req.body.fields
    }
}


function parseSearchReq ( req ) {
    return {
        tenant   : req.session.tenant.id,
        provider : req.body.provider,
        base     : req.body.base,
        filter   : req.body.filter || '',
        attrs    : req.body.attrs  || ''
    }
}


// TODO remove

//var SETTINGS = require('../dfx_settings');
//SETTINGS.mdbw_options = {user:'root',pass:'root'};
//var db = require('../mdbw')({user:'root',pass:'root'}),
//    credCrypt = require('../auth/utils/credCrypt'),
//    Log = require('../utils/log'),
//    tenants = require('../dfx_sysadmin').tenant;
//
//Log.init.stdout(SETTINGS.logging.stdout);
//
//var log = new Log.Instance({label:'LDAP'});
//
//var sp = exports.init({
//    db        : db,
//    credCrypt : credCrypt,
//    log       : log,
//    tenants   : tenants,
//});
//
//
//sp.searchR({
//    tenant   : 'o1',
//    provider : 'p1',
//    base     : 'o=SurrName Inc.,dc=surr,dc=name',
//    filter   : 'ou=Accounting',
//    attrs    : 'mail sn'
//})
//.then(log.info, log.error);
//
//
////sp.check({
////    tenant   : 'o1',
////    provider : 'p1',
////    creds : {
////        dn   : 'uid=rossij,ou=people,o=SurrName Inc.,dc=surr,dc=name',
////        pass :'june'
////    }
////})
////.then( function(){log.ok('binded')}, log.error );
//
//
//
//
//
//
//
//
//
//{
//    "result": "success",
//    "data": [
//        {
//            "objectClass": [
//                "top",
//                "organization"
//            ],
//            "o": [
//                "SurrName Inc."
//            ],
//            "description": [
//                "The SurrName incorporate."
//            ],
//            "dn": "o=SurrName Inc.,dc=surr,dc=name"
//        },
//        {
//            "objectClass": [
//                "organizationalUnit"
//            ],
//            "ou": [
//                "people"
//            ],
//            "description": [
//                "All people in organisation"
//            ],
//            "dn": "ou=people,o=SurrName Inc.,dc=surr,dc=name"
//        },
//        {
//            "objectClass": [
//                "person",
//                "organizationalPerson",
//                "inetOrgPerson"
//            ],
//            "cn": [
//                "June Rossi"
//            ],
//            "sn": [
//                "Rossi"
//            ],
//            "givenName": [
//                "June"
//            ],
//            "mail": [
//                "jrossi@example.com"
//            ],
//            "userPassword": [
//                "june"
//            ],
//            "ou": [
//                "Accounting"
//            ],
//            "telephoneNumber": [
//                "4101"
//            ],
//            "roomNumber": [
//                "220"
//            ],
//            "uid": [
//                "jrossi",
//                "juner"
//            ],
//            "dn": "uid=juner,ou=people,o=SurrName Inc.,dc=surr,dc=name"
//        },
//        {
//            "objectClass": [
//                "person",
//                "organizationalPerson",
//                "inetOrgPerson"
//            ],
//            "cn": [
//                "June Rossi"
//            ],
//            "sn": [
//                "Rossi"
//            ],
//            "givenName": [
//                "June"
//            ],
//            "mail": [
//                "rossij@example.com"
//            ],
//            "userPassword": [
//                "june"
//            ],
//            "ou": [
//                "Accounting"
//            ],
//            "telephoneNumber": [
//                "4102"
//            ],
//            "roomNumber": [
//                "220"
//            ],
//            "uid": [
//                "rossij"
//            ],
//            "dn": "uid=rossij,ou=people,o=SurrName Inc.,dc=surr,dc=name"
//        },
//        {
//            "objectClass": [
//                "person",
//                "organizationalPerson",
//                "inetOrgPerson"
//            ],
//            "cn": [
//                "Marc Chambers"
//            ],
//            "sn": [
//                "Chambers"
//            ],
//            "givenName": [
//                "Marc"
//            ],
//            "mail": [
//                "chambers@example.com"
//            ],
//            "userPassword": [
//                "mark"
//            ],
//            "telephoneNumber": [
//                "4201"
//            ],
//            "ou": [
//                "Engineering"
//            ],
//            "roomNumber": [
//                "167"
//            ],
//            "uid": [
//                "marc"
//            ],
//            "dn": "uid=marc,ou=people,o=SurrName Inc.,dc=surr,dc=name"
//        },
//        {
//            "objectClass": [
//                "person",
//                "organizationalPerson",
//                "inetOrgPerson"
//            ],
//            "cn": [
//                "Robert Wong",
//                "Bob Wong"
//            ],
//            "sn": [
//                "Wong"
//            ],
//            "givenName": [
//                "Robert",
//                "Bob"
//            ],
//            "mail": [
//                "bwong@example.com"
//            ],
//            "userPassword": [
//                "robert"
//            ],
//            "telephoneNumber": [
//                "4202"
//            ],
//            "roomNumber": [
//                "211"
//            ],
//            "ou": [
//                "Engineering"
//            ],
//            "uid": [
//                "robert"
//            ],
//            "dn": "uid=robert,ou=people,o=SurrName Inc.,dc=surr,dc=name"
//        },
//        {
//            "objectClass": [
//                "person",
//                "organizationalPerson",
//                "inetOrgPerson"
//            ],
//            "cn": [
//                "Jan Paul"
//            ],
//            "sn": [
//                "Paul"
//            ],
//            "givenName": [
//                "Jan"
//            ],
//            "mail": [
//                "janpaul@example.com"
//            ],
//            "userPassword": [
//                "jan"
//            ],
//            "telephoneNumber": [
//                "4203"
//            ],
//            "roomNumber": [
//                "212"
//            ],
//            "ou": [
//                "Engineering"
//            ],
//            "uid": [
//                "jan"
//            ],
//            "dn": "uid=jan,ou=people,o=SurrName Inc.,dc=surr,dc=name"
//        },
//        {
//            "objectClass": [
//                "person",
//                "organizationalPerson",
//                "inetOrgPerson"
//            ],
//            "cn": [
//                "Kelly Pan"
//            ],
//            "sn": [
//                "Pan"
//            ],
//            "givenName": [
//                "Kelly"
//            ],
//            "mail": [
//                "kellypan1@example.com",
//                "kellypan2@example.com"
//            ],
//            "userPassword": [
//                "kelly"
//            ],
//            "telephoneNumber": [
//                "4203"
//            ],
//            "roomNumber": [
//                "213"
//            ],
//            "ou": [
//                "Engineering"
//            ],
//            "uid": [
//                "kelly"
//            ],
//            "dn": "uid=kelly,ou=people,o=SurrName Inc.,dc=surr,dc=name"
//        }
//    ]
//} 
