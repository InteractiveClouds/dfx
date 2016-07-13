var endpoint = require('../utils/endpoints'),
    SETTINGS = require('../dfx_settings'),
    log      = new (require('../utils/log')).Instance({label:'API_SERVER'}),

    api = {

        info : function () {
            return SETTINGS.serverinfo;
        },

        settings : function () {
            return SETTINGS;
        }
    };


module.exports = endpoint.json({
    parser : function( req ){
        return {
            action : req.params.action,
            data : {}
        };
    },
    action : api,
    log    : log
});
