(function(){
    var $form     = $('#loginForm'),
        $username = $('#username'),
        $password = $('#password');

    $form.submit(function(e){
        e.preventDefault();

        username = $username.val();
        password = $password.val();
        $.post( sessionStorage.dfx_server + '/application/login',
                {
                    tenant      : sessionStorage.dfx_tenantid,
                    application : sessionStorage.dfx_appname,
                    username    : username,
                    password    : password
                }
        ).then(function(answer){
                createCookie('dfx_app_token',answer);
                window.location = DreamFace.successfulLoginRedirectUrl || 'index.html';
            }).fail(function(err){
                alert("Unknown user or wrong password")
                console.log(err);
            })


    });

    var createCookie = function(name, value, days) {
        var expires;
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toGMTString();
        }
        else {
            expires = "";
        }
        document.cookie = name + "=" + value + expires + "; path=/";
    }

    createCookie('dfx_app_token', '', -1);

})();