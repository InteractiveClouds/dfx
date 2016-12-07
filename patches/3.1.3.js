const Q = require('q');
var screens_templates   = require('../lib/dfx_screens_templates');
var SETTINGS            = require('../lib/dfx_settings');
const DB_TENANTS_PREFIX = SETTINGS.databases_tenants_name_prefix;


exports.description = 'add basic_mobile template for all old applications';

exports.run = function (cfg, opts) {
    const
        DB_TENANTS_PREFIX = opts.SETTINGS.databases_tenants_name_prefix,
        db = cfg.db;
    return db.get(
        'dreamface_sysdb',
        'tenants'
    )
        .then(function (tenants) {
            return Q.all(tenants.map(function (tenant) {
                return db.get(DB_TENANTS_PREFIX + tenant.id,'applications')
                    .then(function(applications){
                        return Q.all(applications.map(function (app) {
                            var req = {
                                session:{
                                    tenant : {
                                        id : tenant.id
                                    }
                                }
                            }
                            screens_templates.createNew({
                                "name": "basic",
                                "platform": "web",
                                "application": app.name,
                                "layout": {
                                    "header": {
                                        "content": {
                                            "type": "html",
                                            "value": ""
                                        },
                                        "height": "80px",
                                        "display": "true",
                                        "halignment": "center",
                                        "valignment": "center",
                                        "style": "",
                                        "class": ""
                                    },
                                    "left": {
                                        "content": {
                                            "type": "html",
                                            "value": ""
                                        },
                                        "width": "150px",
                                        "whiteframe": "md-whiteframe-1dp",
                                        "display": "false",
                                        "halignment": "start",
                                        "valignment": "start",
                                        "style": "",
                                        "class": ""
                                    },
                                    "right": {
                                        "content": {
                                            "type": "html",
                                            "value": ""
                                        },
                                        "width": "150px",
                                        "whiteframe": "md-whiteframe-1dp",
                                        "display": "false",
                                        "halignment": "start",
                                        "valignment": "start",
                                        "style": "",
                                        "class": ""
                                    },
                                    "body": {
                                        "style": "background:#fff;padding:10px",
                                        "class": ""
                                    },
                                    "footer": {
                                        "content": {
                                            "type": "html",
                                            "value": ""
                                        },
                                        "height": "60px",
                                        "display": "true",
                                        "halignment": "center",
                                        "valignment": "center",
                                        "style": "",
                                        "class": ""
                                    }
                                }
                            }, req);
                            screens_templates.createNew({
                                "name": "basic_mobile",
                                "platform": "mobile",
                                "application": app.name,
                                "layout": {
                                    "header": {
                                        "content": {
                                            "type": "html",
                                            "value": ""
                                        },
                                        "height": "50px",
                                        "display": "true",
                                        "halignment": "center",
                                        "valignment": "center",
                                        "style": "",
                                        "class": ""
                                    },
                                    "left": {
                                        "content": {
                                            "type": "html",
                                            "value": ""
                                        },
                                        "width": "150px",
                                        "whiteframe": "md-whiteframe-1dp",
                                        "display": "false",
                                        "halignment": "start",
                                        "valignment": "start",
                                        "style": "",
                                        "class": ""
                                    },
                                    "right": {
                                        "content": {
                                            "type": "html",
                                            "value": ""
                                        },
                                        "width": "150px",
                                        "whiteframe": "md-whiteframe-1dp",
                                        "display": "false",
                                        "halignment": "start",
                                        "valignment": "start",
                                        "style": "",
                                        "class": ""
                                    },
                                    "body": {
                                        "style": "background:#fff;",
                                        "class": ""
                                    },
                                    "footer": {
                                        "content": {
                                            "type": "html",
                                            "value": ""
                                        },
                                        "height": "30px",
                                        "display": "true",
                                        "halignment": "center",
                                        "valignment": "center",
                                        "style": "",
                                        "class": ""
                                    }
                                }
                            }, req);
                        }));
                    });
            }));
        });
};

