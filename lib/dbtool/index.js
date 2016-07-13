var DBTool = require("./lib/dbtool");

//module.exports = dbWrapper;
module.exports = {
    createDBTool: function(options) {
        return new DBTool(options);
    }
};
