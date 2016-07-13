## data query API
How to use DataQuery.
We can create instance of DataQuery by query name or in a studio setting options.

### DataQuery by query name

#### Start
```html
<script src="/all/commons/js/dataquery.js"></script>
```

#### Create instance
```js
var dq = new DataQuery('queryName');
```

#### Execute Query, get Data and MetaData
```js
dq.execute()
.done(function(data){
    var data = dq.getData(),
        metadata = dq.getMetaData();
})
.fail(function(objError){
    // objError as {'textError':'Not Found','typeError':'request'/'app'}
    if(objError.typeError == 'app'){
        //....
    }
});
```

#### Set Parameters
```js
dq.setParameters({"name":"John"});
dq.execute()
.done(function(data){
    var data = dq.getData(),
        metadata = dq.getMetaData();
})
.fail(function(objError){
    console.log(objError.textError)
});
```

#### Error Handling
When we add new data query we can define a runtime error
adding 2 fields in Application Exceptions section:
[text error] and [regular expression].

```js
Examples:
 * if returned field = "error"
    [text error]: Error has occurred
    [regular expression]: error

 * if returned field is empty
    [text error]: Empty list
    [regular expression]: countries\":\s*\[\]
```

```js
dq.execute()
.done(function(data){
    //...
})
.fail(function(objError){
    // here error handling
    DfxStudio.showNotification({
        title: objError.typeError + " Error",
        body: objError.textError,
        clickToDismiss: true
    });
});
```

### Execution in PostMan
```
1) need basic auth
    enter on Basic Auth tab
    Username = tenantid
    Password = token
2) enter url
    URL - http://localhost:3000/api/query/execute?queryName=qDB&data[lastname]=Holiday
```

### DataQuery (definition screen)

#### Twitter example. Get 10 last tweets
```js
[Request URL] = https://api.twitter.com/1.1/statuses/user_timeline.json
[Request Type] = GET
add 2 parameters:
[screen_name] = your_screen_name
[count] = 10
```

#### Twitter example. Post tweet
```js
[Request URL] = https://api.twitter.com/1.1/statuses/update.json
[Request Type] = POST
[Request Body] = {"status": "your new twitt"}
```


#### Pre code examples
use a params variable as an array

```js
if (params[0].name == 'lng' && params[0].value == 'en') params[0].value = 'EN';

if(params[0].value =='en'){ abortQueryExecution({"name":"abort Execution"}); }

```

```js
executeQuery({"qName":"qExtServer"}, function(res){
    params.push( {
        'name':'params',
        'value':encodeURIComponent(JSON.stringify(res)),
        'type':'request'
    });
    terminateFilter();
});
```


#### PostCode examples
use a response variable as json

##### first example

```js
var countries = response.countries;
countries.push({'country':'Ukraine', 'capital':'Kiev'});
```

##### postCode example - executeQuery

###### without params

```js
executeQuery({"qName":"qTwitterGet"}, function(res){
    response.my_twitter = res;
    terminateFilter();
});
```

###### with params

```js
executeQuery({"qName":"qMikhail","params":{"count":3}}, function(res){
    response.mikhail_twitter = res;
    terminateFilter();
});
```

##### filterProperties for twitter postCode example - leave only those properties that we need

```js
filterProperties(response, ['created_at','text'], function(res){
    response = res;
    terminateFilter();
});
```

##### excludeProperties - exclude properties that we need

```js
excludeProperties(response, ['name','_id'], function(res){
    response = res;
    terminateFilter();
});
```


##### filterData - leave data that satisfy our condition
operators: eq, ne, lt, gt
```js
filterData(res, [{prop:"name",op:"eq",value:"James"},{prop:"lastname",op:"ne",value:"Bond"}],function(res){
    response = res;
    terminateFilter();
})
```