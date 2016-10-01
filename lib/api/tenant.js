var endpoint = require('../utils/endpoints'),
    tenants  = require('../dfx_sysadmin').tenant,
    users    = require('../dfx_sysadmin').tenant.user,
    roles    = require('../dfx_sysadmin').tenant.role,
    sysadmin = require('../dfx_sysadmin'),
    log = new (require('../utils/log')).Instance({label:'API_TENANTS'}),
    SETTINGS = require('../dfx_settings'),

    api = {

        create : function ( o ) {
            return tenants.create(o.tenantid, ''/*o.password*/, {
                userId    : o.userid,
                userType  : o.usertype,
                rolesList : o.roles,
                partner   : o.partner,
                lastName  : o.lastName,
                firstName : o.firstName
            });
        },

        edit : function( o ) {
            return tenants.edit(o.tenantid, o.query);
        },

        remove : function ( o ) {
            return tenants.remove(o.tenantid, true);
        },

        activate : function ( o ) {
            return tenants.activate(o.tenantid);
        },

        deactivate : function ( o ) {
            return tenants.deactivate(o.tenantid);
        },

        list : function ( o ) {
            return tenants.list();
        },
        get : function ( o ) {
            return tenants.get(o.tenantid);
        },
        exists : function ( o ) {
            return tenants.exists(o.tenantid);
        },
        getUsers : function ( o ) {
            return users.list(o.tenantid, false, null, o.application);
        },
        getRoles : function ( o ) {
            return roles.list({ tenant: o.tenantid }).then(function(roles) {
                var result = [];

                roles.map(function(role) {
                    // remove staff roles, they don't have _id and they are redundant for app run time
                    if ( role._id ) {
                        // take only shared and this app roles
                        if (role.application == o.application || role.application == SETTINGS.sharedCatalogName) {
                            result.push(role);
                        }
                    }
                });

                return result;
            })
        },
        getUserDefinition : function ( o ) {
            return tenants.userDefinition.get(o.application, o.tenantid).then(function (data) {
                return [data];
            });
        },
        getAuthProviders : function ( o ) {
            return sysadmin.provider.fullList({tenant:o.tenantid, applicationName:o.application});
        },
        getDbDrivers : function ( o ) {
            return sysadmin.dbDriver.fullList({tenant:o.tenantid, applicationName:o.application});
        }
    };


module.exports = endpoint.json({

    parser : function ( req ) {

        var partner = null;

        try { partner = JSON.parse(req.query.partner); } catch (e) {}
        // TODO check partner structure

        return {
            action : req.params.action,
            data : {
                tenantid  : req.query.tenantid,
                userid    : req.query.userid,
                usertype  : req.query.usertype,
                roles     : [].concat(req.query.roles),
                lastName  : req.query.lastName,
                firstName : req.query.firstName,
                query     : req.body.query,
                partner   : partner,
                application : req.query.application,
                password  : undefined // TODO encrypted with consumer_key
            }
        }
    },

    action : api,

    log : log
});
