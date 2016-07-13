var mdbw_options = {
    host : 'localhost',
    port : '27017',
    user : '',
    pass : ''
}

process.argv.forEach(function (val, index, array) {
    if (index==2) {
        mdbw_options.host = val;
    } else if (index==3) {
        mdbw_options.port = val;
    } else if (index==4) {
        mdbw_options.user = val;
    } else if (index==5) {
        mdbw_options.pass = val;
    }
});

console.log( 'Connecting using: ' + JSON.stringify(mdbw_options) );

var SETTINGS = require('../lib/dfx_settings'),
    mdbw = require('../lib/mdbw')(mdbw_options),
    mongo = require('mongodb'),
    DB_TENANTS_PREFIX = SETTINGS.databases_tenants_name_prefix;

var modifyLayout = function(widget_src) {
    var replaceAll = function(find, replace, str) {
        return str.replace(new RegExp(find, 'g'), replace);
    };

    return replaceAll('layout_row', 'layout_0_row', widget_src);
};

mdbw.get("dreamface_sysdb", 'tenants')
.then(function (tenants) {
    tenants.forEach(function(tenant) {
        console.log("===> tenant " + DB_TENANTS_PREFIX + tenant.id);
        mdbw.get(DB_TENANTS_PREFIX + tenant.id, 'datawidgets')
            .then(function(datawidgets) {
                datawidgets.forEach(function(datawidget) {
                    try {
                        datawidget.src = modifyLayout(datawidget.src);

                        mdbw.update(DB_TENANTS_PREFIX + tenant.id, 'datawidgets', {name: datawidget.name}, {$set: datawidget})
                            .then(function() {
                                console.log(datawidget.name + " updated");
                            });
                    } catch(parseErr) {
                        console.log(parseErr.message);
                    }
                });
            });
    });
}).fail(function(err){
   console.log(err);
});


console.log("Wait please 30 seconds and then press CTRL + C :)");
