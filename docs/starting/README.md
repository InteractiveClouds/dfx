# Starting dreamface

Method `init` of the dreamface module must be invoked before method `start`. The `init` expects for argument, it must be either — absolute path to local settings file, or object of the local settings. The local settings must set option `auth_conf_path` as absolute path to `.auth.conf` ( name of it does not matters ), if there is no file at the set path, and if no repository was inited, new file will be created at the path at the moment of initializing of a repository.

### EXAMPLES

#### path to local settings file

app.js
```js
var path = require('path');

require(‘dreamface’)
.init( path.resolve(__dirname, 'localSettings.js') )
.start();
```

localSettings.js
```js
var path = require('path');

module.exports = {
    auth_conf_path : path.resolve(__dirname, '.auth.conf'),
    /* other local settings if differs from default ones*/
};
```

#### object of local settings

app.js
```js
var path = require('path');

require(‘dreamface’)
.init({
    auth_conf_path : path.resolve(__dirname, '.auth.conf'),
    /* other local settings if differs from default ones*/
})
.start();
```
