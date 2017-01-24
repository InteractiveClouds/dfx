///*
// This notice must be untouched at all times.
//
// DreamFace DFX
// Version: 3.0.0
// Author: Interactive Clouds
//
// Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.
//
// LICENSE: DreamFace Open License
// */

var requestAPIRoute = (function(exports){
    return function requestAPIRoute ( o ) {
        var Defer = $.Deferred();
        var params = {
            url: o.url,
            type: o.type,
            data: o.data
        }

        document.cookie = "X-DREAMFACE-TENANT=" + o.data.tenantid + ";path=/;";

        setTimeout(function(){
            $.ajax(params).then(
                function ( data, textStatus, jqXHR ) {
                    if ( textStatus !== 'success' ) {
                        console.error('REQUEST ERROR');
                        return Defer.reject();
                    }

                    Defer.resolve(data);
                },
                function ( jqXHR, textStatus, errorThrown ) {
                    console.error('REQUEST ERROR: %s', errorThrown);
                    //console.error(errorThrown.stack());
                    var error = jqXHR.responseText;
                    try { error = JSON.parse(error) } catch (e) {}
                    return Defer.reject(error);
                }
            );
        },0);

        return Defer.promise();
    }

})(window);




