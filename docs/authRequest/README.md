#### Example

```js
var sysadmin = require('./dfx_sysadmin'),
    AR = require('./authRequest');
 
sysadmin.provider.get({tenant:'tenantName', provider:'providerName'}) // get auth info
.then(AR.getRequestInstance) // get authReqest instance charged with the info
.then(function(authRequest){
    /**
     * Here you can use any implemented authRequst methods with the instance
     * 'get', 'post', (for 'basic' and 'digest' protocols)
     * 'get', 'post', 'put', 'delete' (for 'oAuth1')
     */
 
 
    //
    // GET example
    //
    return authRequest.get({ url: 'http://localhost:3000/database/get/db1/' })
 
    .then(function (response) { // show answer
        console.log({
            'STATUS'  : response.status,
            'HEADERS' : response.headers,
            'BODY'    : response.body.toString('utf-8')
        });
    });
     
 
     
    //
    // POST example
    //
    return authRequest.post({
        url: 'http://localhost:3000/database/put',
        headers: {'Content-Type': 'application/json; charset=utf-8'},
        body: JSON.stringify({
            'database': 'db1',
            'collection': 'cl12',
            'document': {
                "param_1": "value_1",
                "param_2": "value_2",
                "param_3": "value_3"
            }
        })
    })
 
    // show answer
    .then(function (response) {
        console.log({
            'STATUS'  : response.status,
            'HEADERS' : response.headers,
            'BODY'    : response.body.toString('utf-8')
        });
    })
}).done();


```
#### Twitter example. Posting new tweet.

```js
var sysadmin = require('./lib/dfx_sysadmin'),
    AR = require('./lib/dfx_authRequest');

sysadmin.provider.get({tenant:'n1', provider:'rw'})
.then(AR.getRequestInstance) // get authReqest instance charged with the info
.then(function(authRequest){

    authRequest.post({
        url  : 'https://api.twitter.com/1.1/statuses/update.json',
        body : {
            status : 'some auto posted tweet'
        }
    })
    .then(console.log)

})
.done();
```


#### Twitter example. Removing last 50 tweets.

```js

var sysadmin = require('./lib/dfx_sysadmin'),
    AR = require('./lib/dfx_authRequest'),
    Q = require('q');

sysadmin.provider.get({tenant:'n1', provider:'rw'})
.then(AR.getRequestInstance) // get authReqest instance charged with the info
.then(function(authRequest){


    // get last 50 twits

    return authRequest.get({
        url  : 'https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=litichevskij&count=50',
    })
    .then(function(response){


        // get list of twit's ids

        return JSON.parse(response.body)
            .map(function(twit){
                return twit.id_str;
            });
    })
    .then(function(ids){
        var results = [];


        // remove them one by one

        for ( i = 0, l = ids.length; i < l; i++ ) {
            results.push(authRequest.post({
                url : 'https://api.twitter.com/1.1/statuses/destroy/' + ids[i] + '.json'
            }))
        }

        return Q.all(results).then(function(){
            console.log('removed %s twits', ids.length);
        })
    })

})
.done();

```

#### oAuth2 example. getting file from yandex.disk.
```js
var oa = require('./lib/dfx_authRequest').getRequestInstance({
    schema            : 'oAuth2',
    credentials       : {
            access_token      : 'd25e0b7ab20f4998869e9aa746cb51fb'
        }

});

oa.get({url: 'https://webdav.yandex.ru/yandex.disk.json'})
.then(function(answer){console.log(answer);})
.done();
```
