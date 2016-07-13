## Object req.user

### Properties

  * req.user.tenantid
  * req.user.userid

### Methods

#### hasRight

  * **arguments**:
    * right name
  * **returns**:
    * Promise

Resolves the promise if the user has the right, rejectes otherwise.

```js
req.user.hasRight('DATAQUERY::someDataquery').then(/*...*/);

```

#### hasEitherRight

  * **arguments**: names of a rights
  * **returns**:
    * Promise

Resolves the promise if the user has at least one right from the list, rejectes if has neither.

```js
req.user.hasEitherRight( 'executeAny::dataquery', 'DATAQUERY::someDataquery').then(/*...*/);

```
