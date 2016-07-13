module.exports = PoolCfg;

var PoolCount = 0;
function PoolCfg(options) {
    this.name = options.name? options.name: 'Pool_' + PoolCount++;
    this.idleTimeoutMillis = options.idleTimeoutMillis? options.idleTimeoutMillis: 100;
    this.min = options.min? options.min: 0;
    this.max = options.max? options.max: 1;
}