How to response result when we request external source url

---
#### Examples

- javascript
------------
```js
$.ajax({
    type : "GET",
    dataType : "jsonp",
    url : "http://domainname.com/json.php?callback=?", // ?callback=?
    data : "category=111&name=Category1"
    success: function(data){
    }
});
```

- php response sample
---------------------
```js
<?
$data = array();
$data[0]["people"]["lastName"] = "Hawkins";
$data[1]["people"]["lastName"] = "Ivanov";
$data[2]["people"]["lastName"] = "Petrov";
header("Content-Type: application/json");
echo $_GET['callback'] . '(' . "{'result' : ".json_encode($data)."}" . ')';
?>
```
