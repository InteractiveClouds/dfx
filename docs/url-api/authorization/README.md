#### Authorization

url-api uses *HTTP Basic Authorization protocol* now. `User` is tenants id (name), `Password` is one of tokens of the tenant. Tokens is stored in database `dreamface_sysdb`, collection `tenats`, document with `id` which equals name of the tenant, property `databaseTokens`.
