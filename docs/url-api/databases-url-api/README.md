All methods returns a string what can be parsed to an object what contains either `data` or `error` option. Option `data` contains the same what the method of [mdbw](https://github.com/opoupeney/dfx/tree/master/node_modules/mdbw#mdbw) with the same name returns.

---

 * [syntax](#syntax)
 * [examples](#examples)
 * [authorization](../authorization/README.md)

#### Syntax

method | HTTP Method | URL Syntax | POST options
------ | ----------- | ---------- | ---
**get** | GET | / api / database / get [ / `db` [ / `cl` [ / `query` ] ] ] |
**getOne** | GET | / api / database / getOne / `db` / `cl` / `query` |
**exists** | GET | / api / database / exists / `db` [ / `cl` [ / `query` ] ] |
**count** | GET | / api / database / count / `db` / `cl` [ / `query` ] |
**put** | POST | / api / database / put | `database`,<br/>`collection`, <br/>`document`
**update** | POST | / api / database / update | `database`, <br/>`collection`, <br/>`query`, <br/>`fields`
**rm** | POST | / api / database / rm | `database`, <br/>`collection`, <br/>`query`

 * `db` — database name
 * `cl` — collection name
 * `query` — [query-selector](http://docs.mongodb.org/manual/reference/operator/#query-selectors)
 * `fields` — [update-parametr](http://docs.mongodb.org/manual/reference/method/db.collection.update/#update-parameter)

---

#### Examples

```js
$.get('/api/database/get/testDB/testCL/{"name": "John"}')
.done(function(answer){
    var parsed = JSON.parse(answer);
    if ( parsed.error ) // do smth.
    parsed.data; // array of objects
})
```

```js
$.get('/api/database/exists/testDB/testCL/{"name": "John"}')
.done(function(answer){
    var parsed = JSON.parse(answer);
    if ( parsed.error ) // do smth.
    parsed.data; // boolean
})
```

```js
$.get('/api/database/count/testDB/testCL/{"name": "John"}')
.done(function(answer){
    var parsed = JSON.parse(answer);
    if ( parsed.error ) // do smth.
    parsed.data; // number
})
```

```js
$.post('/api/database/put',
    {
        database   : 'dbName',
        collection : 'clName',
        'document' : {"_id": ID, name: 'John'}
    }
)
.done(function(answer){
    var parsed = JSON.parse(answer);
    if ( parsed.error ) // do smth.
    parsed.data; // undefined
})
```

```js
$.post('/api/database/put',
    {
        database   : 'dbName',
        collection : 'clName',
        'document' : {name: 'John'}
    }
)
.done(function(answer){
    var parsed = JSON.parse(answer);
    if ( parsed.error ) // do smth.
    parsed.data; // id
})
```
