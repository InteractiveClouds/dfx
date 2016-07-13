module.exports = ConnCfgMap;

function ConnCfgMap(options) {
    this.dialect  = options.dialect || 'mysql';
    this.version  = options.version || '5';
    this.host     = options.host || 'localhost';
    this.port     = options.port || 3306;
    this.database = options.database;
    this.user     = options.user || undefined;
    this.password = options.password || undefined;
}