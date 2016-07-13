/*
 This notice must be untouched at all times.

 DreamFace DFX
 Version: 3.0.0
 Author: Interactive Clouds

 Copyright (c) 2015 Interactive Clouds, Inc.  "DreamFace" is a trademark of Interactive Clouds, Inc.

 LICENSE: DreamFace Open License
 */

var authRequest =  (function(){

    try {
        sessionStorage; //EventTarget;
    } catch (e) {
        alert([
            'The browser is not supported. Please use one of these:',
            'Chrome >= 1.0,',
            'Firefox >= 1,',
            'Geko >=1.7,',
            'Internet Explorer >= 9.0,',
            'Opera >=7,',
            'Safari >= 1.0'
        ].join('\n'));
    }


    var token  = null,
        tokens = null,
        tenant,
        getHash = md5;
    //delete window.md5; // TODO


    /*
     * secure the token
     */
    const
        TOKENS = 'DFX_app_tokens',
        FAKE   = 'fake';


    var _localStorage_getItem = localStorage.getItem.bind(localStorage),
        _localStorage_setItem = localStorage.setItem.bind(localStorage);

    localStorage.getItem = function (param) {
        return param === TOKENS ? FAKE : _localStorage_getItem(param);
    };
    localStorage.setItem = function (param, value) {
        return param !== TOKENS && _localStorage_setItem(param, value);
    };

    Object.defineProperty(localStorage, TOKENS, {
        get : function () { return FAKE},
        set : function (value) {}
    });

    try {
        tenant = sessionStorage.dfx_tenantid;
        token = JSON.parse(_localStorage_getItem(TOKENS))[tenant];
    } catch (e) {
        console.log('authRequest. first attempt to init is failed.');
    };

    // TODO
    // window.addEventListener('storage', function(e) {
    //     console.log('HACKER GOT THE TOKEN : ', e.oldValue, e.newValue );
    // });


    setRefreshTokenTimeuot();


    function sign ( o ) {
        var cnonce, key, hash, seal,
            data = o.data ? JSON.stringify(o.data) : '';

        if ( token.secret ) {

            cnonce = getHash(Math.floor(Math.random() * 1000000000)+'');
            key = [
                    token.nonce,
                    cnonce,
                    token.secret,
                    o.url, // here it is just 'path'
                    o.type.toUpperCase(),
                    data
                ].join('::');
            hash   = getHash(key);
            seal   = cnonce + hash + token.id;

        } else {

            seal = token.id;

        }

        o.data = {
            data : data,
            seal : seal
        };

        o.url = sessionStorage.dfx_server + o.url;
    }

    var activeRequests = 0,
        refreshTimeoutProcess,
        startedRefresh = false,
        pendingRefresh = false,  // starts refreshing proccess if true
        pendingRefreshBin = [];


    function request ( params, vip ) {

        if ( !token ) throw('authRequest is not initialised.');



        var DD      = $.Deferred(),
            promise = DD.promise();

        promise.always(function(){
            activeRequests--;
            //console.log('active left > %s', activeRequests);
            if ( pendingRefresh && !startedRefresh && activeRequests < 1 ) {
                startedRefresh = true;
                startTokenRefreshing();
            }
        });

        if ( pendingRefresh && !vip ) {
            pendingRefreshBin.push({
                params : params,
                defer  : DD
            });
        } else {
            token.callsLeft--;

            tokens = JSON.parse(_localStorage_getItem(TOKENS)) || {};
            tokens[tenant] = token;
            _localStorage_setItem(TOKENS, JSON.stringify(tokens));

            activeRequests++;
            if ( token.callsLeft < 4 ) pendingRefresh = true; // yep, magic number

            performRequest(params, DD);
        }

        return promise;

    }

    function startTokenRefreshing () {

        request.refreshToken().then(function(){

            activeRequests = pendingRefreshBin.length;

            if ( token.callsLeft <= activeRequests ) throw('OMG! ' + token.callsLeft + '/' + activeRequests );

            pendingRefresh = false;
            startedRefresh = false;

            while ( pendingRefreshBin.length ) {
                var r = pendingRefreshBin.pop();
                performRequest(r.params, r.defer);
                token.callsLeft--;

                tokens = JSON.parse(_localStorage_getItem(TOKENS)) || {};
                tokens[tenant] = token;
                _localStorage_setItem(TOKENS, JSON.stringify(tokens));
            }
        })
    }

    function performRequest ( params, Defer ) {

        sign(params);

        $.ajax(params).then(
            function ( data, textStatus, jqXHR ) {
                if ( data.result !== 'success' ) {
                    console.error('REQUEST ERROR REASON: %s', data.reason);

                    //if ( data.reason === 'unauthorized' ) window.location = 'index.html';

                    return Defer.reject();
                }

                var answer = data.data;

                try { answer = JSON.parse(answer) } catch (e) {};

                Defer.resolve(answer);
            },
            function ( jqXHR, textStatus, errorThrown ) {
                console.error('REQUEST ERROR: %s', errorThrown);
                //console.error(errorThrown.stack());
                var error = jqXHR.responseText;
                try { error = JSON.parse(error) } catch (e) {}
                return Defer.reject(error);
            }
        );
    
    }

    request.isLoggedIn = function () {
        return !!token
            ? request.refreshToken()
            : $.Deferred().reject();
    };

    request.initToken = function ( _token ) {

        tenant = sessionStorage.dfx_tenantid;
        if ( !tenant ) throw('authRequest is not inited – tenant is undefined.');

        if ( !_token ) {
            try {
                token = JSON.parse(_localStorage_getItem(TOKENS))[tenant];
            } catch (e) {};

            return !!token
                ? request.refreshToken()
                : $.Deferred().reject()
        }


        if ( typeof _token !== 'object'  ) {
            try { _token = JSON.parse(_token) }
            catch (e) { throw('Wrong token') }
        }

        token = _token;

        try {
            tokens = JSON.parse(_localStorage_getItem(TOKENS)) || {};
            tokens[tenant] = token;
            _localStorage_setItem(TOKENS, JSON.stringify(tokens));
        } catch (e) {}

        return request.refreshToken();
    };

    request.isInitialized = function () {
        return (!token) ? false : true;
    };

    function isTokenFresh () { return false; } // TODO

    request.refreshToken = function () {

        if ( isTokenFresh() ) return $.Deferred().resolve();

        if ( refreshTimeoutProcess ) clearTimeout(refreshTimeoutProcess);

        var DD = $.Deferred();
    
        return request({url : '/app/refreshtoken', type : 'post'}, true).then(
            function ( data, textStatus, jqXHR ) {
                var upO,
                    upS = token.secret
                        ?  CryptoJS.TripleDES
                            .decrypt(data, token.secret)
                            .toString(CryptoJS.enc.Utf8)
                        : data;

                if ( !upS ) {

                    console.error('REFRESH TOKEN. DECRYPT ERROR.');

                    return DD.reject();
                }

                if ( token.secret ) {
                    try { upO = JSON.parse(upS); }
                    catch (e) {
                        console.error('REFRESH TOKEN. PARSE ERROR.');
                        DD.reject(e);
                    }
                } else {
                    upO = upS;
                }

                token.nonce     = upO.nonce;
                token.callsLeft = upO.callsLeft;
                token.expires   = upO.expires;

                tokens = JSON.parse(_localStorage_getItem(TOKENS)) || {};
                tokens[tenant] = token;
                _localStorage_setItem(TOKENS, JSON.stringify(tokens));

                setRefreshTokenTimeuot();

                //console.log('token nonce is refreshed. "%s"', token.nonce);

                DD.resolve();
            }
        );

        return DD.promise();
    };


    function setRefreshTokenTimeuot () {

        if ( !token ) return;

        //console.log('refresh token timout is set');

        refreshTimeoutProcess = setTimeout(function(){

            //console.log(
            //    'refreshing timeout invoked, active requests = %s',
            //    activeRequests
            //);

            // start refreshing proccess
            if ( activeRequests ) pendingRefresh = true;
            else request.refreshToken();

        }, token.expires - 1000 * 60 * 3);
    }

    request.redirect = function ( params ) {

        sign(params);

        if ( !/get/i.test(params.type) ) throw(
            'only GET is implemented for authRequest.redirect'
        );

        var query = '?data=' + encodeURIComponent(params.data.data) +
                    '&seal=' + encodeURIComponent(params.data.seal),
            url = params.url + query;

        //console.log('REDIRECTING TO : ' + url);
        window.location.replace(url);
    };

    request.removeToken = function () {
        
        tenant = tenant || sessionStorage.dfx_tenantid;

        if ( !tenant ) throw('authRequest. can not remove token, cause tenant is undefined.');

        tokens = JSON.parse(_localStorage_getItem(TOKENS)) || {};
        delete tokens[tenant];
        _localStorage_setItem(TOKENS, JSON.stringify(tokens));
    };

    return request
})();

var requestAPIRoute = (function(exports){
    return function requestAPIRoute ( o, func ) {

        var _url = o.url;

        o.url = [
            '',
            'app',
            sessionStorage.dfx_appname,
            'apiRoute',
            o.url
        ].join('/');

        function done () {
            authRequest.redirect({
                url : '/app/obtainaccesstoken/',
                type : 'get',
                data : {
                    apiroute : _url,
                    appurl   : window.location.toString()
                }
            });
        }

        return authRequest(o).then(function(res){
            return res.typeError === 'oAuth2 redirection is required'
                ? typeof func === 'function' ? func(done) : done()
                : res;
        })
    }
})(window);
/*
http://dfx.host:9000/studio/widget/web/preview-auth/a1/NewView625/web/desktop
http://dfx.host:9000/studio/widget/web/preview/a1/NewView625/desktop
*/
