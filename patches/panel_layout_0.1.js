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
    async = require('async'),
    mongo = require('mongodb'),
    _ = require('underscore');

var DB_TENANTS_PREFIX = SETTINGS.databases_tenants_name_prefix;

var replaceLayout = function(datawidget) {
    var i;
    for (i=0; i<datawidget.definition.length; i++) {
        if (datawidget.definition[i].type === 'panel') {
            replaceLayoutPanel(datawidget.definition[i]);
        }
    }
};

var replaceLayoutPanel = function(panel) {
    var i, j;
    var new_layout = {  rows: [],
        classes: {value: ""},
        dynamicClasses: {value: ""},
        style: {value: ""}
    };
    for (i=0; i<panel.attributes.rows.length; i++) {
        var row = { cols:[],
            classes: {value: panel.attributes.rows[i].classes},
            dynamicClasses: {value: ""},
            style: {value: ""}
        };
        for (j=0; j<panel.attributes.rows[i].panelColumns.length; j++) {
            row.cols.push( {
                width: {value: panel.attributes.rows[i].panelColumns[j].width},
                classes: {value: panel.attributes.rows[i].panelColumns[j].classes},
                dynamicClasses: {value: ""},
                style: {value: ""}
            });
        }
        new_layout.rows.push( row );
    }
    panel.attributes.layout = new_layout;
    delete panel.attributes.rows;
    for (i=0; i<panel.children.length; i++) {
        var container = panel.children[i].container;
        var container_rowcol = container.split('-');
        var row_index = container_rowcol[0].substring(3);
        var col_index = container_rowcol[1].substring(3);
        panel.children[i].container = 'layout_row_' + row_index + '_column_' + col_index;
        if (panel.children[i].type=='panel') {
            replaceLayoutPanel(panel.children[i]);
        }
    }
};

mdbw.get("dreamface_sysdb", 'tenants')
    .then(function (tenants) {
        if (!_.isEmpty(tenants)) {
            async.each(tenants, function (tenant, callback) {
                async.parallel(
                    [
                        function (cb) {
                            mdbw.get(DB_TENANTS_PREFIX + tenant.id, 'datawidgets')
                                .then(function (datawidgets) {
                                    datawidgets.forEach(function(datawidget) {
                                        try {
                                            var src_obj = JSON.parse(datawidget.src);
                                            replaceLayout(src_obj);

                                            datawidget.src = JSON.stringify(src_obj, null, '\t');

                                            mdbw.update(DB_TENANTS_PREFIX + tenant.id, 'datawidgets', {name: datawidget.name}, {$set: datawidget})
                                                .then(function () {
                                                    console.log(datawidget.name + " updated");
                                                });

                                        } catch(parseErr) {
                                            console.log(parseErr.message);
                                        }
                                    });
                                });
                        }
                    ]
                ,function(){});
        },function(){});
    }
}).fail(function(err){
    console.log(err);
});


console.log("Wait please 5 seconds and then press CTRL + C :)");