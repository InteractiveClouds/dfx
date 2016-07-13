## Usage

### inside a code

It is plugged in at dfx.js with settings from `lib/dfx_settings.js` or `lib/dfx_settings.local.js`.
To use it inside a module, you have to requre it and to create new instance.

```js
var log = new (require('./utils/log')).Instance({label : youLabel});
```

Where the `youLabel` is a label which will be attached to every message of the instance.

There is some log levels (which are the instance methods):

    * `dbg` or `debug` for debug messages
    * `info`
    * `ok`
    * `warn`
    * `error`
    * `fatal` it throws an error inside (so no code after log.fatal('something') will not be executed)

Each method returns its arguments. For example:

```js
    var message = 'Some warn message',
        a = log.warn(message);

    a === message; // true
```

It is convinience, cause there is no need to duplicate messages:

```js
function doSomeThing () {

    // ... do something

    return isAllOk
        ? Q.resolve(result)
        : Q.reject(log.warn('something is wrong'))
}
```

But if there are more than one argument or it is not a string returned value will be formatted: objects will be stringified, and all arguments will be joined with '\n'.

```js
var obj = {
    a : 'A',
    b : 'B'
}

var result = log.error('the object', 'is not ok:', obj);

// result is the string:
// the object
// is not ok: {
//     "a": "A",
//     "b": "B"
// }
```

### web-viewer
link to the viewer is at the bottom of the `/console` screen.

#### filtering
There are two groups of filters `by label` and `by level`, its are bound with logical OR, so, for example, if you want to see just warning messages uncheck all except `WARN`.
