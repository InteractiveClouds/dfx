module.exports = ConnCfgMap;

function ConnCfgMap(options) {
    this.dialect  = options.dialect || 'mssql';
    this.version  = options.version || '2008';
    this.server     = options.host || 'localhost';
    this.port     = options.port || 1433;
    this.database = options.database;
    this.user     = options.user || undefined;
    this.password = options.password || undefined;
}