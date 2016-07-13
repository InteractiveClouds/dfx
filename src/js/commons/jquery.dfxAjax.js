var dfxAjax = (function ( $ ) {

    function _dfxAjax ( url, reqData, httpMethod, silent ) {

        var params = {},
            defer = $.Deferred();

        if ( reqData ) {

            if ( typeof reqData !== 'object' ) throw(
                '[dfxAjax]: second argument must be an object'
            );

            params.data = reqData;
        }

        params.type = httpMethod;

        params.statusCode = {
            401 : function () {
                var tenant = DfxStudio.tenantId;

                window.location = '/studio/'+( tenant ? tenant + '/' : '' )+'login'
            }
        };

        params.success = function(response, textStatus, jqXHR){
            defer.resolve(response.data);
        };

        params.error = function(data, textStatus, errorThrown){

            var answer,
                errorTitle = 'error',
                data,
                errorBody  = '';

            if ( data.responseText ) {
                try { answer = JSON.parse(data.responseText) } catch (e) {}
            }

            if ( !answer ) {
                errorTitle = 'connection error';
            } else {
                if ( answer.result === 'failed' && typeof answer.error === 'object' ) {
                    errorTitle = answer.error.title || answer.error.type;
                    errorBody  = answer.error.message || '';
                    data = answer.error.data;
                } else {
                    errorTitle = 'server error';
                    errorBody  = 'unknown format of the answer';
                }
            }

            if ( !silent ) DfxStudio.showNotification({
                title : errorTitle,
                error : true,
                body  : errorBody
            });

            defer.reject(data || errorBody || errorTitle);
        };

        $.ajax(url, params);

        return defer.promise();
    };


    return {
        get  : function ( url, reqData, silent ) { return _dfxAjax(url, reqData, 'GET',  !!silent) },
        post : function ( url, reqData, silent ) { return _dfxAjax(url, reqData, 'POST', !!silent) }
    };

})( jQuery );
