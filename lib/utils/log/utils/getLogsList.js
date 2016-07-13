var QFS  = require('q-io/fs');


// TODO cache the list and watch on dir's change
exports.init = function init ( logDir ) {

    if ( !logDir) throw('[utils/getLogsList.js init]: path to log dir is required.');

    module.exports = function () {
        return QFS.list(logDir).then(function(list){
            var all = [];
    
            list.forEach(function(e){
                if ( /^\d+_\d+\.log\.txt$/.test(e) ) all.push(e);
            });
    
            all.sort();
    
            return all;
        })
    }

    return module.exports;
}
