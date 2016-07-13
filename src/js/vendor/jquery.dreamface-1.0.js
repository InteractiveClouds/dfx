/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var IS_STUDIO = false,
    $user = {},
    dfx_app_conf = null;

var DreamFace = function(options) {
    $('[dfx-renderrer]').each( function(i) {
        var element_name = $(this).attr('name');
        var fct = new Function( 'return ' + element_name + '_eventHandler();' );
        fct();
    });
    
    
    $('[df-data-query]').each( function(i) {
        var df_component_type = $(this).prop( 'tagName' );
        if (df_component_type=='UL') {
            DreamFace.initGCListView( this );
        }
    });
};

DreamFace.initSession = function( options ) {
    if (options.dfx_server==null) {
        sessionStorage.dfx_server = window.location.protocol + '//' + window.location.hostname + ':' + window.location.port;
    } else {
        sessionStorage.dfx_server = options.dfx_server;
    }
    sessionStorage.dfx_tenantid = options.dfx_tenantid;
    sessionStorage.dfx_appname = options.dfx_appname;
    sessionStorage.dfx_ispreview = options.dfx_ispreview;
    sessionStorage.dfx_appcontext = {};
};

DreamFace.getSession = function(){
    return sessionStorage;
};

DreamFace.get = function( options ) {
    $.ajax({
            type: 'GET',
            url: sessionStorage.dfx_server + '/dfx/' + sessionStorage.dfx_tenantid + '/' + sessionStorage.dfx_appname + '/' + options.url,
            data: options.data,
            success: function(data) {
                options.callback( null, data );
            },
            error: function(jqXHR, textStatus, errorThrown) {
                options.callback( errorThrown );
            }
    });
};    

DreamFace.post = function( options ) {
    var ajax = {
            type: 'POST',
            url: sessionStorage.dfx_server + '/dfx/' + sessionStorage.dfx_tenantid + '/' + sessionStorage.dfx_appname + '/' + options.url,
            data: options.data,
            success: function(data) {
                options.callback( null, data );
            },
            error: function(jqXHR, textStatus, errorThrown) {
                options.callback( errorThrown );
            }
    };

    $.ajax(ajax);
};

DreamFace.setAppContext = function( options ) {
    // TODO
};

DreamFace.getAppContext = function (name) {
    // TODO
};

DreamFace.setUserDefinition = function () {
    $user = sessionStorage.dfx_user ? JSON.parse( sessionStorage.dfx_user ) : {};
    dfx_app_conf = sessionStorage.dfx_app_conf ? JSON.parse( sessionStorage.dfx_app_conf ) : null;
};

DreamFace.openDialog = function( options ) {
    $.mobile.changePage( 'dialog', {
        data: 'text=test',
        transition: 'pop',
        reverse: false,
        changeHash: false
    });
};


/*
    DreamFace Graphical Components
*/

DreamFace.initGCListView = function( comp ) {
    var name = $(comp).attr( "df-data-query" );
    var path = $(comp).attr( "df-data-query-path" );
    var load = ($(comp).attr( "df-data-query-load" )=='true') ? true : false;
    
    var data_query = new DataQuery(name);
    data_query.execute();
};

/*
     DreamFace Menus
 */

DreamFace.getMenu = function( name, caller_callback ) {
    authRequest( {
        type: 'GET',
        url: '/app/menu/' + sessionStorage.dfx_tenantid + '/' + sessionStorage.dfx_appname + '/' + name
    }).then(function(data){
        caller_callback(data)
    });
};

// former jquery plugin
(function( $ ){

    var methods = {
        init : function(options) {
            /*$("dfx-widget[wclass]").each( function(i) {
                var dfx_widget = this;
                var dfx_widget_id = $(this).attr("id");
                var wclass_value = $(dfx_widget).attr( "wclass" );
                $.get('widget.html?wclass='+wclass_value, function(data) {
                    $(dfx_widget).replaceWith( data );
                    $("a[data-role='button']").button();
                    var widget_initializer = new Function("return " + dfx_widget_id + "_eventHandler();");
                    widget_initializer();
                });
            });*/
        }
    };

    $.fn.dreamface = function(methodOrOptions) {
        if ( methods[methodOrOptions] ) {
            return methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
            // Default to "init"
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.dreamface' );
        }    
    };


})( jQuery );


