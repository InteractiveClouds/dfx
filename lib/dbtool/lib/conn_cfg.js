var path = require('path');

module.exports = ConnCfg;

function ConnCfg(options) {
    if (!options || typeof options !== 'object') {
        throw Error("options must be an object!")
    };

    if (!options.dialect || typeof options.dialect!=='string') {
        throw Error("a dialect must include a dialect config(string type)!")
    }

    var connCfgMapFile = path.join(__dirname, "/dialects/"+options.dialect+"/"+"conn_cfg_map");
    var connCfgMap = require(connCfgMapFile);
    connCfgMap.call(this, options);
}