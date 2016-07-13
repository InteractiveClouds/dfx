# mdbw
mongodb wrapper

---
### Description
Provides simple promises [interface](#api) for **node-mongodb-native**.

Methods:

 * [get](#get)
 * [put](#put)
 * [update](#update)
 * [rm](#rm)
 * [exists](#exists)
 * [count](#count)
 * [exit](#exit)
 * [native](#native)
 * [getOne](#getone)


You should not think about opening and closing connections (almost),
and about creating databases and collections. You can just say:
```js
mdbw.put('testDatabase', 'testCollection', {name: 'John', role: 'agent'});
```
And it shall works even there was neither 'testDatabase', nor 'testCollection'.
You can to do not guess if some item exists before taking it:
```js
mdbw.get('someDb', 'someCl')
    .then(function(data){
        // we are here if:
        //
        //      - 'someDb' and 'someCl' exists, and there are some document(s)
        //            - data is array of objects
        //
        //      - 'someDb' and 'someCl' exists, and there are not any document
        //            - data is an empty array
        //
        //      - 'someDb' exists, but 'someCl' not
        //            - data is an empty array
        //
        //      - neither 'someDb', nor 'someCl' exists
        //            - data is an empty array
        //
    })
    .fail(function(error){
        // we are here if some error had happened:
        //      - node-mongodb-native error
        //      - mongodb is not running
        //      - wrong quantity of arguments, etc.
    })
    .fin(function(){
        // we are here in any case (if we do need this)
        // if it's surprised you — you have to read Q docs =)
    })
```

### Dependecies
 * [node-mongodb-native](https://github.com/mongodb/node-mongodb-native)
 * [q](https://github.com/kriskowal/q)

### Start

```js
var mdbw = require('mdbw')( options );
```
#### Options:

option | default | type
------ | ------- | -----------
`maxOpenedConnections` | 5 | Number
`host`                 | 'localhost' | String
`port`                 | 27017 | Number

## API


### get
Get list of databases or collections (strings), or list of documents (objects).

###### Syntax:
```js
mdbw.get([ <database name>[, <collection name>[, <query>[, <sort>]] ] ]);
```
 * `query` is **node-mongodb-native** query (where to replace) [see node-mongodb-native query-selectors](http://docs.mongodb.org/manual/reference/operator/#query-selectors)
 * `sort` is a document that defines the sort order of the result set (http://docs.mongodb.org/manual/reference/method/cursor.sort/)

###### Returns
Array of Strings or Array of Objects

###### Examples
```js
// get list of all databases
mdbw.get()
    .then(function(dbs){
        // dbs is array of databases names (strings)
    });


// get list of all collections of 'testDB'
mdbw.get('testDB')
    .then(function(cls){
        // cls is array of collections names in 'testDB'
    });


// get list of all documents in collection 'testCL' of 'testDB'
mdbw.get('testDB', 'testCL')
    .then(function(docs){
        // docs is array of objects in collection 'testCL' of 'testDB'
    });


// get list of all documents in collection 'testCL' of 'testDB',
// that matches query {'name':'John'}
mdbw.get('testDB', 'testCL', {'name':'John'})
    .then(function(docs){
        // docs is array of objects in collection 'testCL' of 'testDB'
        // that matches query {'name':'John'}
    });
```


### put
Create some item, or replace document (if `_id` is specified).

###### Syntax:
```js
mdbw.put( <database name>[, <collection name>[, <document>] ] );
```
 * `document` is an Object

###### Returns
nothing or id of new document

###### Examples
```js
// create database
mdbw.put('testDB');


// create collection in 'testDB'
mdbw.put('testDB', 'testCL');


// create new document in collection 'testCL' of 'testDB',
mdbw.put('testDB', 'testCL', {'name':'Mary'})
    .then(function(id){
        // id is an id of new document
    });


// replace document with the id in collection 'testCL' of 'testDB',
mdbw.put('testDB', 'testCL', {'name':'Mary', '_id':'90812749187234981'});
```


### update
Replace specified fields in matched documents.

###### Syntax:
```js
mdbw.update( <database name>, <collection name>, <query>, <fields> [, <params> ] );
```
 * `query` is **node-mongodb-native** query (where to replace) [see node-mongodb-native query-selectors](http://docs.mongodb.org/manual/reference/operator/#query-selectors)
 * `fields` is an Object [see node-mongodb-native update-parameter](http://docs.mongodb.org/manual/reference/method/db.collection.update/#update-parameter)
 * `params` is object with `multi` and `upsert` params. Default values are: `{multi: true, upsert: false}`

###### Returns
quantity of updating documents

###### Examples
```js
// change field 'role' to 'super agent' in all documents in collection 'testCL' of 'testDB',
// that matches query {'name':'John'}
mdbw.update('testDB', 'testCL', {'name':'John'}, {$set : {'role': 'super agent'}})
    .then(function(quantity){
        // quantity is number of updated documents
    });


// remove field 'role' in all documents in collection 'testCL' of 'testDB',
// that matches query {'name':'John'}
mdbw.update('testDB', 'testCL', {'name':'John'}, {$unset : {'role': true}})
    .then(function(quantity){
        // quantity is number of updated documents
    });


// increase field 'number' by 5 in all documents in collection 'testCL' of 'testDB',
// that matches query {'name':'John'}
mdbw.update('testDB', 'testCL', {'name':'John'}, {$inc : {'number': 5}})
    .then(function(quantity){
        // quantity is number of updated documents
    });
```

### rm
Remove item.

###### Syntax:
```js
mdbw.rm( <database name> [, <collection name> [, <query> ] ] );
```
 * `query` is **node-mongodb-native** query (where to replace) [see node-mongodb-native query-selectors](http://docs.mongodb.org/manual/reference/operator/#query-selectors)

###### Returns
quantity of deleted items

###### Examples
```js
// remove database 'testDB'
mdbw.rm('testDB')
    .then(function(quantity){
        // quantity is number of deleted databases
        // actually, 0 or 1
    });


// remove collection 'testCL' in database 'testDB'
mdbw.rm('testDB', 'testCL')
    .then(function(quantity){
        // quantity is number of deleted collections
        // actually, 0 or 1
    });


// remove documents matched with {role:'agent'}
// in collection 'testCL' in database 'testDB'
mdbw.rm('testDB', 'testCL', {role:'agent'})
    .then(function(quantity){
        // quantity is number of deleted documents
    });

```

### exists
Check if some item exists.

###### Syntax:
```js
mdbw.exists( [ <database name>[, <collection name>[, <query>] ] ] );
```
 * `query` is **node-mongodb-native** query (where to replace) [see node-mongodb-native query-selectors](http://docs.mongodb.org/manual/reference/operator/#query-selectors)

###### Returns
Boolean

###### Examples
```js
// check is there any databases
mdbw.exists()
    .then(function(answer){
        // answer is true or false
    });


// check is there a 'testDB'
mdbw.exists('testDB')
    .then(function(answer){
        // answer is true or false
    });


// check is there a 'testCL' in 'testDB'
mdbw.exists('testDB', 'testCL')
    .then(function(answer){
        // answer is true or false
    });


// check is there a document that matches { 'quantity': { $gt: 10 } } in 'testCL' of 'testDB'
mdbw.exists('testDB', 'testCL', { 'quantity': { $gt: 10 } })
    .then(function(answer){
        // answer is true or false
    });
```


### getOne

###### Syntax:
```js
mdbw.get(<database name>, <collection name>, <query>);
```
 * `query` is **node-mongodb-native** query (where to replace) [see node-mongodb-native query-selectors](http://docs.mongodb.org/manual/reference/operator/#query-selectors)

###### Returns
object or undefined

###### Examples
```js
mdbw.getOne('testDB', 'testCL', {'name':'John'})
    .then(function(doc){
        // doc is an object
        // first document in collection 't`estCL' of 'testDB'
        // that matches query {'name':'John'}
    });
```


### count

###### Syntax:
```js
mdbw.count ( [<database name> [, <collection name> [, <query> ] ] ] );
```
 * `query` is **node-mongodb-native** query (where to replace) [see node-mongodb-native query-selectors](http://docs.mongodb.org/manual/reference/operator/#query-selectors)

###### Returns
number

###### Examples
```js
mdbw.count()
    .then(function(quantity){
        // quantity of databases
    });


mdbw.count('testDB')
    .then(function(quantity){
        // quantity of collections in the database
    });


mdbw.count('testDB', 'testCL')
    .then(function(quantity){
        // quantity of documents in the collection
    });


mdbw.count('testDB', 'testCL', {'name':'John'})
    .then(function(quantity){
        // quantity of documents that matches the query
    });
```


### native
Get **node-mongodb-native**'s object for [database](http://mongodb.github.io/node-mongodb-native/api-generated/db.html) 
or for [collection](http://mongodb.github.io/node-mongodb-native/api-generated/collection.html)

BE AWARE: you must explicitly run `close` method of gotten object after you do not need it anymore.

###### Syntax:
```js
mdbw.native( [ <database name>[, <collection name> ] ] );
```

###### Returns
Object

###### Example
```js
mdbw.native('testDb')
    .then(function(db){
        // here you can invoke any node-mongodb-native method of db
        // for example to create index
        db.createIndex(
            'someCollection',
            {a:1, b:1},
            {unique:true, background:true, dropDups:true, w:1},
            function(err, indexName) {
                // …

                db.close() // be sure you did not forget to do this!!!
            }
        );
    });
```


### exit
Close all opened connections. **node-mongodb-native** keeps connections alive, so your programm shall never ends up if at least one connection is still opened.

###### Syntax:
```js
mdbw.exit();
```

###### Returns
nothing

###### Example
```js
mdbw.exit()
    .then(function(){
        // here all connections are closed
    });
```
