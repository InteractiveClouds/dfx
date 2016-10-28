var Q = require('q'),
    endpoint            = require('../utils/endpoints'),
    GitHubApi           = require('github'),
    _                   = require('underscore'),
    log                 = new (require('../utils/log')).Instance({label:'API_SAMPLES'}),
    SETTINGS            = require('../dfx_settings');
    path                = require('path');
    QFS                 = require('q-io/fs');

    /* API Definition */

    api = {
        contents : function ( o ) {
            var D = Q.defer();

            var accessToken = SETTINGS.GitHub_samples.accessToken;
            var userName = SETTINGS.GitHub_samples.userName;
            var repoName = SETTINGS.GitHub_samples.repoName;
            var path = o.path;

            readFromGitHub(accessToken, userName, repoName, path, function(err, data){
                if (err) {
                    D.reject(err)
                } else {
                    D.resolve(data);
                }
            })

            return D.promise;
        },
        isPathExists : function( o ) {
            var pathToFile = path.join(__dirname,'..','..', 'src', o.path);
            return QFS.exists(pathToFile).then(function(exists){
                return Q.resolve(exists);
            });
        }
    };

module.exports =  endpoint.json({

    parser : function( req ){
        return {
            action : req.params.action,
            data : {
                path: req.query.path
            }
        };
    },
    action : api,
    log    : log

});

function readFromGitHub(accessToken, userName, repoName, path, callback) {
   
   var target_path = path;

    var github = new GitHubApi({
        debug: SETTINGS.GitHub_samples.debug,
        protocol: "https",
        host: "api.github.com",
        headers: {
            "user-agent": "Interactive-clouds-company"
        }
    });

    github.authenticate({
       type:  "oauth",
       token: accessToken
   });

   var data = {
       "owner": userName,
       "repo": repoName,
       "ref":  "heads/master"
   };

   github.gitdata.getReference(data, function (err, ref) {
       if (err) return callback(err);
       github.repos.getContent({
           "owner":      userName,
           "repo":      repoName,
           "path":      target_path
       }, function( err, content) {
            if (err) {
               callback(err);
           } else {
               callback(null, content);
           }
       });
   });
}