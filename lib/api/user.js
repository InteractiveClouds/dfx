var endpoint = require('../utils/endpoints'),
    users    = require('../dfx_sysadmin').tenant.user,
    crypt    = require('../auth/utils/tripleDes.wrapped.js'),
    log = new (require('../utils/log')).Instance({label:'API_USERS'}),

    api = {

        create : function ( o ) {
            return users.create({
                tenant    : o.tenantid,
                login     : o.userid,
                type      : o.usertype,
                kind      : o.userkind,
                firstName : o.firstName,
                lastName  : o.lastName,
                email     : o.email,
                pass      : o.password,
                roles     : {
                        list      : o.roles,
                        'default' : o.roles[0] || ''
                    }
            })
        },

        remove : function ( o ) {
            return users.remove( o.tenantid, o.userid )
        }
    };


module.exports =  endpoint.json({

    parser : function ( req ) {
        return Q.when(
            (function () {
                var secret, encryptedPass;

                try {
                    secret   = req.user.credentials.secret;
                    encryptedPass = req.query.password;
                } catch (e) {}

                return req.query.usertype === '' && secret && encryptedPass
                    ? crypt.decrypt(encryptedPass, secret)
                    : undefined;
            })(),
            function ( decryptedPass ) {
                return {
                    action : req.params.action,
                    data : {
                        tenantid  : req.query.tenantid,
                        userid    : req.query.userid,
                        usertype  : req.query.usertype,
                        userkind  : req.query.userkind,
                        roles     : [].concat(req.query.roles || []),
                        lastName  : req.query.lastName,
                        firstName : req.query.firstName,
                        email     : req.query.email,
                        password  : decryptedPass
                    }
                }
            }
        );
    },

    action : api,

    log : log
});
