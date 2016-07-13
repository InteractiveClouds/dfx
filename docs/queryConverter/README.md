## query converter


creates URI-encoded **node-mongodb-native** queries from array of objects of parameters


### Start
```html
<script src="/js/queryConverter/queryConverter.js"></script>
```
It creates the function `window.convertParams`.

### Parameters array example
```js
var params = [

    {
        field     : 'planet',
        value     : 'Earth',
        operation : 'ne'    // not equal
    },

    {
        field     : 'name',
        value     : 'John',
        operation : 'eq'    // equal
    },


    {
        field     : 'star',
        value     : '/^\w+\s\d+$/',
        operation : 'regexp'
    },


    {
        field     : 'star',
        value     : /^\w+\s\d+$/,
        operation : 'regexp'
    },


    {
        field     : 'quantity',
        value     : 5,
        operation : 'lt'   // less than
    }
];
```

### Implemented operations

operation | description
--------- | ---
eq | equal
ne | not equal
lt | less than
gt | greater than
regexp | regular expression


### Usage

```js
var query = convertParams( paramsArray ).toMongoQuery();
```

### Returns

String ready to concat with URL:
```js
var query = convertParams( paramsArray ).toMongoQuery();

var url = 'http://some.where/get?' + query;
```

### Error handling

If there is an error it returns object with an 'error' option:
```js
var query = convertParams().toMongoQuery();

if ( query.error ) // do smth.
```
