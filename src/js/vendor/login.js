(function(){

    authRequest.initToken()
    .then(function(){
        return getUserDefinitionAndRedirect();
    })
    .fail(function(error){
        authRequest.removeToken();
        sessionStorage.setItem('applicationToken', '');

        var $form     = $('#loginForm'),
            $username = $('#username'),
            $password = $('#password');

        var rawToken = '';

        $form.submit(function(e){

            e.preventDefault();

            var username = $username.val(),
                password = $password.val(),
                D = $.Deferred();

            (function(){
                return rawToken
                    ? D.resolve(rawToken)
                    : $.post(
                            sessionStorage.dfx_server + '/app/login',
                            {
                                tenantid  : sessionStorage.dfx_tenantid,
                                appid     : sessionStorage.dfx_appname,
                                ispreview : sessionStorage.dfx_ispreview,
                                userid    : username
                            }
                        ).then(
                            function(answer){

                                if ( !answer.result ) {
                                    return D.reject('no result in server response');
                                }

                                if ( answer.result === 'failed' ) {
                                    return D.reject('unknown user or wrong password');
                                }

                                rawToken = answer.data;

                                return D.resolve(rawToken);
                            },
                            function(error){
                                return $.Deferred().reject(error);
                            }
                        );

            })()
            .then(function(rawToken){

                var token = rawToken.type === 'default'
                    ? decryptToken(rawToken.token, password)
                    : rawToken.token; // type === 'plain'

                if ( !token ) {
                    return $.Deferred().reject('unknown user or wrong password');
                }

                $username.val('');
                $password.val('');

                sessionStorage.setItem('applicationToken', token);

                return authRequest
                    .initToken(token)
                    .then(getUserDefinitionAndRedirect)
            })
            .fail(function(message){
                $username.val('');
                $password.val('');
                $username.focus();
                $username.val(JSON.stringify(message));
                if ( message ) {
                    alert(message);
                }
            })
        });

        if ( getUrlParameter('login') === 'guest' ) {
            $username.val('guest');
            $password.val('guest');
            $form.submit();
        } else {
            var cached_username = window.localStorage.getItem('DFX_ve_login_userid');
            if (cached_username!=null && cached_username!='') {
              $username.val(cached_username);
              $password.val(window.localStorage.getItem('DFX_ve_login_password'));
              $form.submit();
            }
        }

        function decryptToken ( raw, pass ) {

            var token = '';

            try {
                token = CryptoJS.TripleDES
                    .decrypt(raw, pass)
                    .toString(CryptoJS.enc.Utf8)

            } catch (e) {}

            return token;
        }
    })

    function getUserDefinitionAndRedirect () {
        return authRequest({
            type: 'GET',
            url:  '/app/user_definition'
        }).then(function (data) {
            //var data = JSON.parse('{"data":{"user":{"tenant":"WebTests2","roles":{"list":["guest"],"default":"guest"},"email":"","lastName":"","firstName":""},"app_conf":[]},"result":"success"}');
            sessionStorage.dfx_user = JSON.stringify( data.user );
            sessionStorage.dfx_app_conf = JSON.stringify( data.app_conf );

            window.location = DreamFace.successfulLoginRedirectUrl || 'index.html';
        });
    }
    function getUrlParameter(sParam) {
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }
    };
})();
