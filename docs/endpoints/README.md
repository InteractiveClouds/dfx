An abstract layer that is intended to help:

* to split logic of what a module does and how it communicates with outside via HTTP
* to normalise a client-server communication (format of the HTTP response)
* to make modules more testable


The main idea is to split a flow of request-response to the steps:

* to parse an incoming request ( to extract a data from **express**'es `request` object that is required by module to do its work )
* to do an action ( what a module was intended for ), using just data extracted at previous step, and not using **express**'es `request` and `response` objects
* to log if some error was occurred
* to send a result of the action with an HTTP response in normalised form

===

There can be two formats of communication `json` and `html`, so the module exports two methods: 'json' and '[html](#html)'.

# JSON

* **argument** — object of options:
  * **parser**: function, optional
  * **action** : function or object of functions ( [see bellow](#single-or-multi-functions-action) )
  * **log** : instance of the [logger](https://github.com/opoupeney/dfx/tree/master/docs/logger)
* **returns** a function with the signature **function ( req, res, next )**. When the function is invoked with a request, it executes the **parser** with `req`, then the **action** with result of the **parser**, then [formats](#formatting-results) result of the **action** and sends a response.

Both **parser** and **action** can returns either a [promise](https://github.com/kriskowal/q), or a value.

## Single or multi functions action

There are two cases: if the **action** is an function, or an object of functions.

### single

In this case **parser** is optional, and format of its result is not limited. The result ( if it exists ) is just passed to **action**, and that is all.
Example:
```js
var Q = require('q'),
    endpoints = require('./utils/endpoints'),
    log = new (require('./utils/log')).Instance({label:'SOME_MODULE'}),


    /*...*/


function someAction ( parsed ) {

    if ( isValid(parsed.someData) ) return doSomething();

    return Q.reject('data is invalid'); // means HTTP 400 ( request error )
};


export.endpoint = endpoints.json({

    parser : function ( req ) {
        return {
            tenant   : req.session.tenant.id,
            user     : req.session.user.id,
            someData : req.query.someData
        }
    },

    action : someAction,

    log : log
});

```
### multi

It is convenience shorthand for a case when you are implementing some kind of multi methods API (**create**, **remove**, **update**, etc.)

**parser** is required and must return an object (ex.: **parsed**), with required `action` (String) parameter, and optional `data` parameter of any type. Then if the **action** object has own method **parsed.action** it will be invoked in context of **action** object with **parsed.data** as an argument, otherwise an HTTP response with status **400** and **error.message**='unknown action' will be sent.
Example of usage:
```js
var endpoints = require('./utils/endpoints'),
    log = new (require('./utils/log')).Instance({label:'SOME_MODULE'}),

var api = {
    create : function ( parsedRequest ) { /*...*/ },
    remove : function ( parsedRequest ) { /*...*/ },
    update : function ( parsedRequest ) { /*...*/ }
};

export.endpoint = endpoints.json({

    parser : function ( req ) {
        return {
            action : req.query.action,
            data : {
                tenant : req.session.tenant.id,
                someInfo : req.query.someInfo
            }
        }
    },

    action : api,

    log : log
});
```

## formatting results

If the **action** returns a value or resolves a promise with a value (not instance of **Error**) , HTTP status is **200**, and format is:
```js
{
    result : 'success',
    data : <the value>
}
```

if it rejects a promise with a value, HTTP status is **400**, and format is:
```js
{
    result : 'failed',
    error :{
        type : 'request error',
        message :  <the value>
    }
}
```

if it rejects a promise with an instance of **Error** or returns it, or throws, HTTP status is **500**, and format is:
```js
{
    result : 'failed',
    error :{
        type : 'server error',
        message :  '' // pay attention -- no message is sent in this case
    }
}
```

In both cases, when result is **failed**, returned value will be logged, so you do not need to do it by yourself.


# HTML

Is not implemented yet.
