sql = require('mssql')

config = 
    server: '192.168.1.104'
    port: 1433
    database: 'NRS2_DB'
    user: 'sa'
    password: 'aabbccdd_123'

connection = new sql.Connection config, (err) ->
    if err 
        connection.close()
        console.log err 
        return false
    request = new sql.Request connection 
    request.verbose = true
    request.query 'select * from ru_cost', (err, recordset)->
        console.log recordset[0].ID
        connection.close()