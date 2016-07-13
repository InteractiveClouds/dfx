 * [syntax](#syntax)
 * [examples](#examples)
 * [authorization](../authorization/README.md)


#### Syntax
It takes the same parameters like application's `(new DataQuery).execute()`, and returns the 'data' parameter of its answer;

#### Examples
```bash
http://localhost:3000/api/query/execute?queryName=someQueryName
```
tenant id is taken from [authorization](../authorization/README.md) info.
