module.exports = ConnCfgMap;

function ConnCfgMap(options) {
    this.dialect  = options.dialect || 'oracle';
    this.version  = options.version || '11';
    this.hostname = options.host || 'localhost';
    this.port     = options.port || 1521;
    this.database = options.database;
    this.user     = options.user || undefined;
    this.password = options.password || undefined;
}