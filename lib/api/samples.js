var Q = require('q'),
    endpoint            = require('../utils/endpoints'),
    GitHubApi           = require('github'),
    _                   = require('underscore'),
    log                 = new (require('../utils/log')).Instance({label:'API_SAMPLES'}),

    /* API Definition */

    api = {
        contents : function ( o ) {
            var D = Q.defer();
            var accessToken = '5342b3d117e2ef6d3e850b3f5e6a856b0979e205';
            var userName = 'InteractiveClouds';
            var repoName = 'sampleapps';
            var path = o.path;

            readFromGitHub(accessToken, userName, repoName, path, function(err, data){
               D.resolve(data);
            })

            return D.promise;
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
       version: "3.0.0"
   });

   github.authenticate({
       type:  "oauth",
       token: accessToken
   });

   var data = {
       "user": userName,
       "repo": repoName,
       "ref":  "heads/master"
   };

   github.gitdata.getReference(data, function (err, ref) {
       if (err) return callback(err);
       var data = {
           "user":      userName,
           "repo":      repoName,
           "sha":       ref.object.sha,
           "recursive": true
       };
       /*github.gitdata.getTree(data, function (err, ref) {
           if (err) return callback(err);
           var file = _.select(ref.tree, function (file) {
               return (('blob' === file.type) && (0 == file.path.indexOf(dir)));
           }).map(function(f){
               return dir ? f.path.replace(dir + '/', '') : f.path;
           })

           if (file.length === 0) return callback(null, null);
           if (err) {
               callback(err);
           } else {
               callback(null, file);
           }
       });*/
       github.repos.getContent({
           "user":      userName,
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