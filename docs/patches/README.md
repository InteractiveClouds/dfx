# Patches

## Auto patching system

Now the project has an system that automaticaly checks version of project and applies patches if they exists at start moment. Current version is stored in database `sysdb`, collection `settings`, document `{name: 'dfx version', version: <VERSION>}`.

Also you can just check the versions and patches info with `node dfx.js -v`.

## Format of pathc files

Patches must be stored at /patches folder, and to be named in such way:
`number of version (package.json)`.js

A patch must exports method `run` that must return Q.promise, and to resolve it if it is applied successfully, or to reject otherwise.

Optionally a patch can exports String option `description`.

Example:

```js

exports.run = function(){

    // do something

    return executeSomethingThatReturnsPromise();
};


exports.description = 'some description';

```

Another example:

```js

exports.run = function(){

    var D = Q.defer();

    // do something

    executeSomethingThatAcceptsCallback(function( error, data ){

        !!error
            ? D.reject(error)
            : D.resolve();
    })

    return D.promise;
};


exports.description = 'some description';

```
