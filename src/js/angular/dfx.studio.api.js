var dfxStudioApi = angular.module("dfxStudioApi",[]);

dfxStudioApi.factory('dfxMessaging', ['$mdToast', function($mdToast) {

    var messaging_service = {};

    messaging_service.showMessage = function (message) {
        $mdToast.show(
          $mdToast.simple()
            .textContent(message)
            .theme('success-toast')
            .position('top right')
            .hideDelay(3000)
        );
    };

    messaging_service.showWarning = function (message) {
        $mdToast.show(
          $mdToast.simple()
            .textContent(message)
            .theme('warn-toast')
            .position('top right')
            .hideDelay(3000)
        );
    };

    messaging_service.showError = function (message) {
        $mdToast.show(
          $mdToast.simple()
            .textContent(message)
            .theme('error-toast')
            .position('top right')
            .hideDelay(3000)
        );
    };

    return messaging_service;

}]);

dfxStudioApi.factory('dfxAuthRequest', function() {

    var aut_request = {};

    aut_request.send = function( config, callback) {
        authRequest( config ).then( function(data) {
            callback(data);
        });
    };
    
    return aut_request;
});

dfxStudioApi.factory('dfxStats', [ '$http', '$q', function($http, $q) {

    var api_stats = {};

    api_stats.getMain = function( scope ) {
        var deferred = $q.defer();
        
        $http({
            method: 'GET',
            url: '/studio/stats/main'
        }).then(function successCallback(response) {
            deferred.resolve( response.data );
        });
        
        return deferred.promise;
    }
    return api_stats;
}]);

dfxStudioApi.factory('dfxPlatformBluemix', ['$http', '$q', function($http, $q) {
    var api_bluemix = {};

    api_bluemix.getAppsBuilds = function(){
        var deferred = $q.defer();
        $http({
            url: '/studio/builds',
            method: "GET"
        }).then(function successCallback(response) {
            deferred.resolve( response);
        }, function errorCallback(response){
            deferred.reject( response);
        });
        return deferred.promise;
    }

    api_bluemix.bluemixLogin = function(data){
        var deferred = $q.defer();
        $http({
            url: '/studio/bm/loginBlueMix',
            method: "POST",
            data: {
                email:      data.email,
                password:   data.pass
            }
        }).then(function successCallback(response) {
            deferred.resolve( response);
        }, function errorCallback(response){
            deferred.reject( response);
        });
        return deferred.promise;
    }

    api_bluemix.bluemixLogout = function(){
        var deferred = $q.defer();
        $http({
            url: '/studio/bm/logout',
            method: "POST"
        }).then(function successCallback(response) {
            deferred.resolve( response);
        }, function errorCallback(response){
            deferred.reject( response);
        });
        return deferred.promise;
    }

    api_bluemix.getOrgsList = function(){
        var deferred = $q.defer();
        $http({
            url: '/studio/bm/getOrgsList',
            method: "GET"
        }).then(function successCallback(response) {
            deferred.resolve( response);
        }, function errorCallback(response){
            deferred.reject( response);
        });
        return deferred.promise;
    }

    api_bluemix.saveImage = function (imgname, version, apps){
        var deferred = $q.defer();
        $http({
            url: '/studio/bm/build',
            method: "POST",
            data: {
                "cnt": {
                    applications: apps
                },
                imageName:      imgname,
                imageVersion:   version
            }
        }).then(function successCallback(response) {
            deferred.resolve( response );
        }, function errorCallback(response){
            deferred.reject( response);
        });
        return deferred.promise;
    }

    /*studio/bm/loginStatus*/

    api_bluemix.getUser = function (){
        var deferred = $q.defer();
        $http({
            url: '/studio/bm/loginStatus',
            method: "POST"
        }).then(function successCallback(response) {
            deferred.resolve( response );
        }, function errorCallback(response){
            deferred.reject( response);
        });
        return deferred.promise;
    }

    api_bluemix.deleteImage = function (imgname, version){
        var deferred = $q.defer();
        $http({
            url: '/studio/bm/removeImage',
            method: "POST",
            data: {
                imageName:      imgname,
                version:   version
            }
        }).then(function successCallback(response) {
            deferred.resolve( response );
        }, function errorCallback(response){
            deferred.reject( response);
        });
        return deferred.promise;
    }

    api_bluemix.setChoosenOrg = function(guid){
        var deferred = $q.defer();
        $http({
            url: '/studio/bm/setChoosenOrg',
            method: "POST",
            data: {
                guid: guid
            }
        }).then(function successCallback(response) {
            deferred.resolve( response);
        });
        return deferred.promise;
    }

    api_bluemix.getSpacesList = function(){
        var deferred = $q.defer();
        $http({
            url: '/studio/bm/getSpacesList',
            method: "GET"
        }).then(function successCallback(response) {
            deferred.resolve( response);
        });
        return deferred.promise;
    }

    api_bluemix.setChoosenSpace = function(guid){
        var deferred = $q.defer();
        $http({
            url: '/studio/bm/setChoosenSpace',
            method: "POST",
            data: {
                guid: guid
            }
        }).then(function successCallback(response) {
            deferred.resolve( response);
        });
        return deferred.promise;
    }

    api_bluemix.getChoosenSpace = function(){
        var deferred = $q.defer();
        $http({
            url: '/studio/bm/getChoosenSpace',
            method: "GET"
        }).then(function successCallback(response) {
            deferred.resolve( response);
        });
        return deferred.promise;
    }

    api_bluemix.loginCF = function(){
        var deferred = $q.defer();
        $http({
            url: '/studio/bm/loginCF',
            method: "POST"
        }).then(function successCallback(response) {
            deferred.resolve( response);
        });
        return deferred.promise;
    }

    api_bluemix.remoteImagesList = function(){
        var deferred = $q.defer();
        $http({
            url: '/studio/bm/remoteImagesList',
            method: "GET"
        }).then(function successCallback(response) {
            deferred.resolve( response.data.data);
        });
        return deferred.promise;
    }

    api_bluemix.getNamespace = function(){
        var deferred = $q.defer();
        $http({
            url: '/studio/bm/getNamespace',
            method: "GET"
        }).then(function successCallback(response) {
            deferred.resolve( response);
        });
        return deferred.promise;
    }

    return api_bluemix;
}]);

dfxStudioApi.factory('dfxPlatformDevelopers', [ '$http', '$q', function($http, $q) {
    var api_developers = {};

    api_developers.getUsers = function (data){
        var deferred = $q.defer();
        $http({
            url: '/studio/users/list',
            method: "POST",
            data: data
        }).then(function successCallback(response) {
            deferred.resolve( response.data.data);
        });
        return deferred.promise;
    }

    api_developers.updateUser = function (user, newpass, passchanged){
        var deferred = $q.defer();
        if(passchanged){
            $http({
                url: '/studio/users/update/',
                method: "POST",
                data: {
                    "login": user.login,
                    "firstName": user.firstName,
                    "lastName": user.lastName,
                    "email": user.email,
                    "pass": newpass,
                    "roles": {
                        "list": user.roles.list,
                        "default": user.roles.default
                    }
                }
            }).then(function successCallback(response) {
                deferred.resolve( response );
            });
        }else{
            $http({
                url: '/studio/users/update/',
                method: "POST",
                data: {
                    "login": user.login,
                    "firstName": user.firstName,
                    "lastName": user.lastName,
                    "email": user.email,
                    "roles": {
                        "list": user.roles.list,
                        "default": user.roles.default
                    }
                }
            }).then(function successCallback(response) {
                deferred.resolve( response );
            });
        }
        return deferred.promise;
    }

    api_developers.createUser = function (user){
        var deferred = $q.defer();
        $http({
            url: '/studio/users/create/',
            method: "POST",
            data: {
                "login": user.login,
                "firstName": user.firstName,
                "lastName": user.lastName,
                "email": user.email,
                "pass": user.pass,
                "kind": "system",
                "roles": {
                    "list": user.roles.list,
                    "default": user.roles.default
                }
            }
        }).then(function successCallback(response) {
            deferred.resolve( response );
        }, function errorCallback(response){
            deferred.reject( response );
        });
        return deferred.promise;
    }

    api_developers.deleteUser = function (login){
        var deferred = $q.defer();
        $http({
            url: '/studio/users/remove',
            method: "POST",
            data: {
                "login": login
            }
        }).then(function successCallback(response) {
            deferred.resolve( response.data.data);
        });

        return deferred.promise;
    }

    return api_developers;
}]);

dfxStudioApi.factory('dfxGoogleMapProperties', [ '$http', '$q', function($http, $q) {
    var api = {};

    api.getAPIKey = function (tenantId){
        var deferred = $q.defer();
        $http({
            url: '/api/tenant/get?tenantid=' + tenantId,
            method: "GET"
        }).then(function successCallback(response) {
            deferred.resolve( response.data.data);
        });
        return deferred.promise;
    }

    api.putAPIKey = function (tenantId, APIKey){
        var deferred = $q.defer();
        var data = {"query" : {"googleAPIKey":APIKey}};
        $http({
            url: '/api/tenant/edit?tenantid=' + tenantId,
            method: "POST",
            data: data
        }).then(function successCallback(response) {
            deferred.resolve( response.data.data);
        });
        return deferred.promise;
    }


    return api;
}]);

dfxStudioApi.factory('dfxPhoneGapProperties', [ '$http', '$q', function($http, $q) {
    var api = {};

    api.getData = function (tenantId){
        var deferred = $q.defer();
        $http({
            url: '/api/tenant/get?tenantid=' + tenantId,
            method: "GET"
        }).then(function successCallback(response) {
            deferred.resolve( response.data.data);
        });
        return deferred.promise;
    }

    api.saveData = function (tenantId, data){
        var deferred = $q.defer();
        var query = {"query" : data};
        $http({
            url: '/api/tenant/edit?tenantid=' + tenantId,
            method: "POST",
            data: query
        }).then(function successCallback(response) {
            deferred.resolve( response.data.data);
        });
        return deferred.promise;
    }


    return api;
}]);

dfxStudioApi.factory('dfxEmail', [ '$http', '$q', function($http, $q) {
    var email = {};

    email.sendMail = function(data){
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/studio/support-email/send',
            data: {
                contactName: data.contact_name,
                contactEmail: data.contact_email,
                contactMsg: data.contact_msg,
                subject: data.subject
            }

        }).then(function successCallback(response){
            deferred.resolve(response);
        }, function errorCallback(response){
            deferred.reject( response );
        })
        return deferred.promise;
    }
    return email;
}]);

dfxStudioApi.factory('dfxApplications', [ '$http', '$q', function($http, $q) {
    var api_applications = {};

    api_applications.getUserInfo = function() {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/studio/application/getUserInfo/test'
        }).then(function successCallback(response) {
            deferred.resolve( response.data.data[0]);
        }, function errorCallback(response){
            deferred.reject( response);
        })
        return deferred.promise;
    }

    api_applications.createNewApp = function(appname, title, logo) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/studio/application/create',
            data: {
                "applicationName": appname,
                "platform": "web",
                "ownerId": "",
                "title": title,
                "logo": logo
            }
        }).then(function successCallback(response) {
            deferred.resolve( response );
        }, function errorCallback(response){
            deferred.reject( response.message );
        })
        return deferred.promise;
    }

    api_applications.deleteApp = function(appname) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/studio/application/delete',
            data: {
                "applicationName": appname
            }
        }).then(function successCallback(response) {
            deferred.resolve( response );
        });
        return deferred.promise;
    }

    api_applications.getAll = function( scope ) {
        var deferred = $q.defer();
        
        $http({
            method: 'GET',
            url: '/studio/tree'
        }).then(function successCallback(response) {
            deferred.resolve( response );
        });
        
        return deferred.promise;
    }

    api_applications.getAppTree = function( scope, app_name ) {
        var deferred = $q.defer();
        
        $http({
            method: 'GET',
            url: '/studio/tree?application=' + app_name
        }).then(function successCallback(response) {
            deferred.resolve( response );
        });
        
        return deferred.promise;
    }

    api_applications.getGeneral = function(appname) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/studio/application/get/'+ appname
        }).then(function successCallback(response) {
            deferred.resolve( response.data.data );
        });
        return deferred.promise;
    }

    api_applications.saveGeneral = function (title, appname, logo){
        var deferred = $q.defer();
        $http({
            url: '/studio/application/update/'+ appname,
            method: "POST",
            data: {
                    "title": title,
                    "logo": logo
            }
        }).then(function successCallback(response) {
            deferred.resolve( response );
        });

        return deferred.promise;
    }

    api_applications.saveLoginPage = function (obj){
        var deferred = $q.defer();
        $http({
            url: '/studio/application/update/'+ obj.application,
            method: "POST",
            data: obj.data
        }).then(function successCallback(response) {
            deferred.resolve( response );
        }, function errorCallback(response){
            deferred.reject( response.message );
        });

        return deferred.promise;
    }

    api_applications.saveCollaboration = function (channel, appname){
        var deferred = $q.defer();
        $http({
            url: '/studio/application/update/'+ appname,
            method: "POST",
            data: {
                "channel": channel
            }
        }).then(function successCallback(response) {
            deferred.resolve( response );
        });

        return deferred.promise;
    }

    api_applications.getGithubData = function (appname){
        var deferred = $q.defer();
        $http({
            url: '/studio/github/fetch-settings/' + appname,
            method: "GET"
        }).then(function successCallback(response) {
            deferred.resolve( response );
        });

        return deferred.promise;
    }

    api_applications.saveGithub = function (data){
        var deferred = $q.defer();
        $http({
            url: '/studio/github/saveSettings/',
            method: "POST",
            data: data
        }).then(function successCallback(response) {
            deferred.resolve( response );
        });

        return deferred.promise;
    }

    api_applications.getImages = function(appname){
        var deferred = $q.defer();
        $http({
            url: '/studio/resources',
            method: "POST",
            data: {
                "action" : "list",
                "applicationName" : appname
            }
        }).then(function successCallback(response) {
            var arr = response.data.data;
            var result = [];
            for(var i =0; i < arr.length; i++){
                if(arr[i].name === "assets"){
                    var images = arr[i].items;
                    for(var j=0; j < images.length; j++){
                        result.push('/studio/resources/preview/' + appname + '/assets/' + images[j].path);
                    };
                }
            }
            deferred.resolve(result);
        });
        return deferred.promise;
    }

    api_applications.getSharedImages = function(){
        var deferred = $q.defer();
        $http({
            url: '/studio/resources',
            method: "POST",
            data: {
                "action" : "list"
            }
        }).then(function successCallback(response) {
            var arr = response.data.data;
            var result = [];
            for(var i =0; i < arr.length; i++){
                if(arr[i].name === "assets"){
                    var images = arr[i].items;
                    for(var j=0; j < images.length; j++){
                        result.push('/studio/resources/preview/' + '_shared/assets/' + images[j].path);
                    };
                }
            }
            deferred.resolve(result);
        });
        return deferred.promise;
    }

    api_applications.saveResources = function(data){
        var deferred = $q.defer();
        $http({
            url: '/studio/resources',
            method: "POST",
            data: data
        }).then(function successCallback(response) {
            deferred.resolve(response);
        });
        return deferred.promise;
    }

    api_applications.saveDictionary = function(appname, data){
        var deferred = $q.defer();
        $http({
            url: '/studio/data_dictionary/put/' + appname,
            method: "POST",
            data: data
        }).then(function successCallback(response) {
            deferred.resolve(response);
        });
        return deferred.promise;
    }

    api_applications.removeDataDictionary = function(name, appname){
        var deferred = $q.defer();
        $http({
            url: '/studio/data_dictionary/remove/' + name + '/' + appname,
            method: "DELETE"
        }).then(function successCallback(response) {
            deferred.resolve(response);
        });
        return deferred.promise;
    }

    api_applications.getDataDictionaries = function(appname){
        var deferred = $q.defer();
        $http({
            url: '/studio/data_dictionary/list/' + appname,
            method: "GET"
        }).then(function successCallback(response) {
            deferred.resolve(response);
        });
        return deferred.promise;
    }

    api_applications.getResources = function(appname){
        var deferred = $q.defer();
        $http({
            url: '/studio/resources',
            method: "POST",
            data: {
                "action" : "list",
                "applicationName" : appname
            }
        }).then(function successCallback(response) {
            deferred.resolve(response);
        });
        return deferred.promise;
    }

    api_applications.createResource = function(data){
        var deferred = $q.defer();
        $http({
            url: '/studio/resources',
            method: "POST",
            data: data
        }).then(function successCallback(response) {
            deferred.resolve(response);
        });
        return deferred.promise;
    }

    api_applications.getResourceContent = function(data){
        var deferred = $q.defer();
        $http({
            url: '/studio/resources',
            method: "POST",
            data: data
        }).then(function successCallback(response) {
            deferred.resolve(response.data.data);
        });
        return deferred.promise;
    }

    api_applications.updateResource = function(data){
        var deferred = $q.defer();
        $http({
            url: '/studio/resources',
            method: "POST",
            data: data
        }).then(function successCallback(response) {
            deferred.resolve(response);
        });
        return deferred.promise;
    }

    api_applications.findAll = function( search ) {
        var deferred = $q.defer();
        
        $http({
            method: 'GET',
            url: '/studio/components/search?q=' + search
        }).then(function successCallback(response) {
            deferred.resolve( response );
        });
        
        return deferred.promise;
    };

    api_applications.copyObject = function( scope, to_copy ) {
        var deferred = $q.defer();
        
        var data = {
            saveAsName:        to_copy.name,
            applicationName:   to_copy.application,
            applicationTarget: to_copy.applicationTarget,            
            categoryTarget:    to_copy.categoryTarget,
            type:              to_copy.type
        }

        switch ( to_copy.type ) {
            case 'screen': data.screenName = to_copy.queryName; data.platform = to_copy.platform; data.ownerId = ''; break;
            case 'widget': data.widgetName = to_copy.queryName; data.platform = to_copy.platform; break;
            case 'dataquery':
                data.queryName = to_copy.queryName;
                data.prefix    = to_copy.prefix;
                break;
        }

        $http({
            method: 'POST',
            url: '/studio/application/copyObject',
            data: data
        }).then(function successCallback(response) {
            deferred.resolve( response );
        });

        return deferred.promise;
    }

    api_applications.copyCategory = function( scope, category ) {
        var deferred = $q.defer();
        
        $http({
            method: 'POST',
            url: '/studio/application/copyCategory',
            data: category
        }).then(function successCallback(response) {
            deferred.resolve( response );
        }, function errorCallback(response){
            deferred.reject( response );
        });

        return deferred.promise;
    }

    return api_applications;
}]);

dfxStudioApi.factory('dfxDeployment', [ '$http', '$q', function($http, $q) {
    var api_build = {};

    api_build.getAppBuilds = function(appname, platform) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/studio/compiler/build/list/' + appname + '/' + platform
        }).then(function successCallback(response) {
            deferred.resolve( response.data );
        });
        return deferred.promise;
    }

    api_build.runCompilerTask = function(url) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: url
        }).then(function successCallback(response) {
            deferred.resolve( response );
        },function errorCallback(response) {
            deferred.reject(response);
        });
        return deferred.promise;
    }

    api_build.registerNewBuild = function(data, appname, platform){
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/studio/compiler/build/register/' + appname + '/' + platform,
            data: {
                applicationName:    appname,
                platform:           platform,
                applicationVersion: data.app_version,
                buildNumber:        data.build_number,
                buildDescription:   data.description,
                buildReleaseNotes:  data.release_notes,
                buildDate:          data.build_date,
                error:              data.error
            }
        }).then(function successCallback(response) {
            deferred.resolve( response );
        });
        return deferred.promise;
    }

    api_build.deleteBuild = function(data){
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/studio/compiler/build/remove/' + data.applicationName + '/' + data.platform,
            data: {
                applicationName:    data.applicationName,
                applicationVersion: data.applicationVersion,
                buildNumber:        data.buildNumber
            }
        }).then(function successCallback(response) {
            deferred.resolve( response );
        });
        return deferred.promise;
    }

    api_build.getLogFile = function(data){
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/studio/compiler/getlogfile' ,
            data: data
        }).then(function successCallback(response) {
            deferred.resolve( response.data );
        });
        return deferred.promise;
    }

    api_build.getDeployedBuilds = function(data){
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/studio/deployment/list'
        }).then(function successCallback(response) {
            deferred.resolve( response.data.data );
        },function failCallback(response) {
            deferred.reject( response );
        });
        return deferred.promise;
    }

    api_build.deleteDeployedBuild = function(appname, build){
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/studio/deployment/delete/' + appname + '/' + build
        }).then(function successCallback(response) {
            deferred.resolve( response );
        });
        return deferred.promise;
    }

    api_build.deployBuild = function(data){
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/studio/deployment/deploy' ,
            data: data
        }).then(function successCallback(response) {
            if ((response.data.status) && (response.data.status == "failed")){
                deferred.reject("Error");
            } else {
                deferred.resolve(response);
            }
        });
        return deferred.promise;
    }

    api_build.getMobileApp = function(build) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/studio/phonegap/getByPlatform',
            params: { platform: 'android', appId: build.phoneGapAppId }
        }).then(function successCallback(response) {
            deferred.resolve( response.data );
        });
        return deferred.promise;
    }

    return api_build;
}]);

dfxStudioApi.factory('dfxAuthProviders', [ '$http', '$q', function($http, $q) {
    var api_providers = {};

    api_providers.createProvider = function(protocol, provider, appname) {
        var deferred = $q.defer();
        if(protocol === "none"){
            $http({
                method: 'POST',
                url: '/studio/auth-providers/',
                data:  {
                    "action":           "put",
                    "dataSource":        provider.selected_data_source,
                    "provider":          provider.provider,
                    "schema":            provider.schema,
                    "applicationName":   appname,
                    "route":             provider.rest.route,
                    "credentials": {}
                }
            }).then(function successCallback(response) {
                deferred.resolve( response);
            });
        }else if(protocol === "basic" || protocol === "digest"){
            $http({
                method: 'POST',
                url: '/studio/auth-providers/',
                data:  {
                    "action":           "put",
                    "dataSource":        provider.selected_data_source,
                    "provider":          provider.provider,
                    "schema":            provider.schema,
                    "applicationName":   appname,
                    "credentials": {
                        "username":      provider.ap_basic_digest.credentials.username,
                        "password":      provider.ap_basic_digest.credentials.password
                    }
                }
            }).then(function successCallback(response) {
                deferred.resolve( response);
            });
        }else if(protocol === "oAuth1"){
            $http({
                method: 'POST',
                url: '/studio/auth-providers/',
                data:  {
                    "action" :           "put",
                    "dataSource":        provider.selected_data_source,
                    "provider":          provider.provider,
                    "schema":            "oAuth1",
                    "applicationName":   appname,
                    "credentials" : {
                        "signature_method": provider.ap_oAuth_1.credentials.selected_method,
                        "consumer_key" :    provider.ap_oAuth_1.credentials.consumer_key,
                        "access_token" :    provider.ap_oAuth_1.credentials.access_token,
                        "consumer_secret" : provider.ap_oAuth_1.credentials.consumer_secret,
                        "access_secret" :   provider.ap_oAuth_1.credentials.access_secret
                    }
                }
            }).then(function successCallback(response) {
                deferred.resolve( response);
            });
        }else if(protocol === "oAuth2"){
            if(provider.ap_oAuth_2.selected_type === "facebook"){
                $http({
                    method: 'POST',
                    url: '/studio/auth-providers/',
                    data:  {
                        "action" :           "put",
                        "dataSource":        provider.selected_data_source,
                        "provider":          provider.provider,
                        "schema":            "oAuth2",
                        "applicationName":   appname,
                        "credentials" : {
                            "type":               "facebook",
                            "access_token":       provider.ap_oAuth_2.credentials.access_token,
                            "consumer_key" :      provider.ap_oAuth_2.credentials.consumer_key,
                            "consumer_secret" :   provider.ap_oAuth_2.credentials.consumer_secret,
                            "authorize_path" :    provider.ap_oAuth_2.credentials.authorize_path,
                            "access_token_path" : provider.ap_oAuth_2.credentials.access_token_path,
                            "response_type" :     provider.ap_oAuth_2.credentials.response_type,
                            "scope" :             provider.ap_oAuth_2.credentials.scope
                        }
                    }
                }).then(function successCallback(response) {
                    deferred.resolve( response);
                });
            }else if(provider.ap_oAuth_2.selected_type === "google"){
                $http({
                    method: 'POST',
                    url: '/studio/auth-providers/',
                    data:  {
                        "action" :           "put",
                        "dataSource":        provider.selected_data_source,
                        "provider":          provider.provider,
                        "schema":            "oAuth2",
                        "applicationName":   appname,
                        "credentials" : {
                            "type":               "google",
                            "access_token":       provider.ap_oAuth_2.credentials.access_token,
                            "consumer_key" :      provider.ap_oAuth_2.credentials.consumer_key,
                            "consumer_secret" :   provider.ap_oAuth_2.credentials.consumer_secret,
                            "base_site" :         provider.ap_oAuth_2.credentials.base_provider_url,
                            "authorize_path" :    provider.ap_oAuth_2.credentials.authorize_path,
                            "access_token_path" : provider.ap_oAuth_2.credentials.access_token_path,
                            "response_type" :     provider.ap_oAuth_2.credentials.response_type,
                            "scope" :             provider.ap_oAuth_2.credentials.scope
                        }
                    }
                }).then(function successCallback(response) {
                    deferred.resolve( response);
                });
            }
        }
        return deferred.promise;
    };

    api_providers.saveProvider = function(protocol, provider, appname) {
        var deferred = $q.defer();
        if(protocol === "none"){
            $http({
                method: 'POST',
                url: '/studio/auth-providers/',
                data:  {
                    "action":           "put",
                    "dataSource":        provider.dataSource,
                    "provider":          provider.provider,
                    "schema":            provider.schema,
                    "route":             provider.route,
                    "applicationName":   appname,
                    "credentials": {}
                }
            }).then(function successCallback(response) {
                deferred.resolve( response);
            });
        }else if(protocol === "basic" || protocol === "digest"){
            $http({
                method: 'POST',
                url: '/studio/auth-providers/',
                data:  {
                    "action":           "put",
                    "dataSource":        provider.dataSource,
                    "provider":          provider.provider,
                    "schema":            provider.schema,
                    "applicationName":   appname,
                    "credentials": {
                        "username":      provider.credentials.username,
                        "password":      provider.credentials.password
                    }
                }
            }).then(function successCallback(response) {
                deferred.resolve( response);
            });
        }else if(protocol === "oAuth1"){
            $http({
                method: 'POST',
                url: '/studio/auth-providers/',
                data:  {
                    "action" :           "put",
                    "dataSource":        provider.dataSource,
                    "provider":          provider.provider,
                    "schema":            "oAuth1",
                    "applicationName":   appname,
                    "credentials" : {
                        "signature_method": provider.credentials.signature_method,
                        "consumer_key" :    provider.credentials.consumer_key,
                        "access_token" :    provider.credentials.access_token,
                        "consumer_secret" : provider.credentials.consumer_secret,
                        "access_secret" :   provider.credentials.access_secret
                    }
                }
            }).then(function successCallback(response) {
                deferred.resolve( response);
            });
        }else if(protocol === "oAuth2"){
            if(provider.credentials.type === "facebook"){
                $http({
                    method: 'POST',
                    url: '/studio/auth-providers/',
                    data:  {
                        "action" :           "put",
                        "dataSource":        provider.dataSource,
                        "provider":          provider.provider,
                        "schema":            "oAuth2",
                        "applicationName":   appname,
                        "credentials" : {
                            "type":               "facebook",
                            "access_token":       provider.credentials.access_token,
                            "consumer_key" :      provider.credentials.consumer_key,
                            "consumer_secret" :   provider.credentials.consumer_secret,
                            "authorize_path" :    provider.credentials.authorize_path,
                            "access_token_path" : provider.credentials.access_token_path,
                            "response_type" :     provider.credentials.response_type,
                            "scope" :             provider.credentials.scope
                        }
                    }
                }).then(function successCallback(response) {
                    deferred.resolve( response);
                });
            }else if(provider.credentials.type === "google"){
                $http({
                    method: 'POST',
                    url: '/studio/auth-providers/',
                    data:  {
                        "action" :           "put",
                        "dataSource":        provider.dataSource,
                        "provider":          provider.provider,
                        "schema":            "oAuth2",
                        "applicationName":   appname,
                        "credentials" : {
                            "type":               "google",
                            "access_token":       provider.credentials.access_token,
                            "consumer_key" :      provider.credentials.consumer_key,
                            "consumer_secret" :   provider.credentials.consumer_secret,
                            "base_site" :         provider.credentials.base_site,
                            "authorize_path" :    provider.credentials.authorize_path,
                            "access_token_path" : provider.credentials.access_token_path,
                            "response_type" :     provider.credentials.response_type,
                            "scope" :             provider.credentials.scope
                        }
                    }
                }).then(function successCallback(response) {
                    deferred.resolve( response);
                });
            }
        }
        return deferred.promise;
    };

    api_providers.getProviders = function(appname) {
        var deferred = $q.defer();

        $http({
            method: 'POST',
            url: '/studio/auth-providers',
            data:{
                action:             'items',
                applicationName:    appname
            }
        }).then(function successCallback(response) {
            deferred.resolve( response.data.data );
        });

        return deferred.promise;
    };

    api_providers.getProvider = function(providername, appname) {
        var deferred = $q.defer();

        $http({
            method: 'POST',
            url: '/studio/auth-providers',
            data:{
                action:             "get",
                provider:           providername,
                applicationName:    appname
            }
        }).then(function successCallback(response) {
            deferred.resolve( response.data.data );
        });

        return deferred.promise;
    };

    api_providers.removeProvider = function(appname, providername) {
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: '/studio/auth-providers',
            data:{
                action:             "remove",
                applicationName:    appname,
                provider:           providername

            }
        }).then(function successCallback(response) {
            deferred.resolve( response );
        });

        return deferred.promise;
    };


    return api_providers;
}]);

dfxStudioApi.factory('dfxViews', [ '$http', '$q', function($http, $q) {

    var api_views = {};

    api_views.getOne = function( scope, app_name, view_name, platform ) {
        // url: '/studio/widget/item/' + app_name + '/' + view_name  + '/' + view.platform
    	var deferred = $q.defer();
        
        $http({
  			method: 'GET',
  			url: '/studio/widget/item/' + app_name + '/' + view_name + '/' + platform
		}).then(function successCallback(response) {
        	deferred.resolve( response.data.widget );
        });
        
        return deferred.promise;
    };

    api_views.getByApp = function( scope, app_name, platform ) {
        // url: '/studio/widget/search/' + app_name + '/' + platform + '?q='
        var deferred = $q.defer();

        $http({
            method: 'GET',
            url: '/studio/widget/search/' + app_name + '/' + platform + '?q='
        }).then(function successCallback(response) {
            deferred.resolve( { "views": response.data.widgets } );
        });
        
        return deferred.promise;
    };

    api_views.update = function( scope, view ) {
        // add view.platform
        var deferred = $q.defer();

        delete view._id;
        
        $http({
            url: '/studio/widget/update/' + view.name,
            method: 'POST',
            data: {"change":view}
        }).then(function successCallback(response) {
            deferred.resolve( response.data );
        });
        
        return deferred.promise;
    }

    api_views.rename = function( scope, view ) {
        // add view,platform
        var deferred = $q.defer();

        $http({
            url: '/studio/widget/update/' + view.oldname,
            method: 'POST',
            data: {
                "change": {
                    "name": view.name,
                    "application": view.application,
                    "category": view.category,
                    "platform": view.platform,
                    "src_script": view.src_script
                }
            }
        }).then(function successCallback(response) {
            deferred.resolve( response.data );
        }, function failCallback(response) {
            deferred.reject( response );
        });

        return deferred.promise;
    }

    api_views.create = function( scope, view ) {
        var deferred = $q.defer();
        
        $http({
            url: '/studio/widget/create/',
            method: 'POST',
            data: view
        }).then(function successCallback(response) {
            deferred.resolve( response.data.widget );
        }, function errorCallback(response) {
            deferred.reject(response);
        });
        
        return deferred.promise;
    }

    api_views.delete = function( scope, view ) {
        // add view.platform
        var deferred = $q.defer();
        
        $http({
            url: '/studio/widget/delete/',
            method: 'POST',
            data: {
                "widgetName" : view.name,
                "applicationName" : view.application,
                "platform": view.platform
            }
        }).then(function successCallback(response) {
            deferred.resolve( response.data.widget );
        });
        
        return deferred.promise;
    }

    api_views.getCategories = function( scope, app_name, platform ) {
        // url: '/studio/widget/category/list/' + app_name + '/' + platform
        var deferred = $q.defer();
        
        $http({
            url: '/studio/widget/category/list/' + app_name + '/' + platform,
            method: 'GET',
            data: {}
        }).then(function successCallback(response) {
            deferred.resolve( response );
        });
        
        return deferred.promise;
    }

    api_views.createCategory = function( scope, category_name, app_name, platform ) {
        var deferred = $q.defer();
        
        $http({
            method: 'POST',
            url: '/studio/widget/category/createCategory',
            data: { name: category_name, ownerId: "", application: app_name, platform: platform }
        }).then(function successCallback(response) {
            deferred.resolve( response );
        });
        
        return deferred.promise;
    }

    api_views.editCategory = function( scope, old_name, new_name, app_name, platform ) {
        // data: { name: new_name, application: app_name, platform : platform }
        var deferred = $q.defer();
        
        $http({
            method: 'POST',
            url: '/studio/widget/category/updateCategory/' + old_name,
            data: { name: new_name, application: app_name, platform : platform }
        }).then(function successCallback(response) {
            deferred.resolve( response );
        });
        
        return deferred.promise;
    }

    api_views.removeCategory = function( scope, category_name, app_name, platform ) {
        // data: { name: category_name, ownerId: "", application: app_name, platform: platform }
        var deferred = $q.defer();
        
        $http({
            method: 'POST',
            url: '/studio/widget/category/removeCategory/' + category_name,
            data: { name: category_name, ownerId: "", application: app_name, platform: platform }
        }).then(function successCallback(response) {
            deferred.resolve( response );
        });
        
        return deferred.promise;
    }

    api_views.createFromModel = function( scope, view ) {
        // Где это используется ? Нужно тоже добавить view.platform
        var deferred = $q.defer();
        
        $http({
            url: '/studio/widget/create-from-model/',
            method: 'POST',
            data: view
        }).then(function successCallback(response) {
            deferred.resolve( response.data.widget );
        }, function errorCallback(response) {
            deferred.reject(response);
        });
        
        return deferred.promise;
    }

    return api_views;
}]);

dfxStudioApi.factory('dfxPages', [ '$http', '$q', function($http, $q) {

    var api_pages = {};

    api_pages.getOne = function( scope, app_name, page_name, platform ) {
        // url: '/studio/screen/item/' + page_name + '/' + app_name + '/' + platform
    	var deferred = $q.defer();
        
        $http({
  			method: 'GET',
  			url: '/studio/screen/item/' + page_name + '/' + app_name + '/' + platform
		}).then(function successCallback(response) {
        	deferred.resolve( response.data.screen );
        });
        
        return deferred.promise;
    }

    api_pages.update = function( scope, page ) {
        // add page.platform
        var deferred = $q.defer();

        delete page._id;
        
        $http({
            url: '/studio/screen/update/',
            method: 'POST',
            data: {"change":page}
        }).then(function successCallback(response) {
            deferred.resolve( response.data );
        });
        
        return deferred.promise;
    }

    api_pages.delete = function( scope, page ) {
        // add page.platform
        var deferred = $q.defer();
        
        $http({
            url: '/studio/screen/delete/',
            method: 'POST',
            data: {
                "screenName" : page.name,
                "screenID" : page._id,
                "applicationName" : page.application,
                "platform": page.platform
            }
        }).then(function successCallback(response) {
            deferred.resolve( response.data.screen );
        });
        
        return deferred.promise;
    }

    api_pages.create = function( scope, page ) {
        // Если нет то add page.platform
        var deferred = $q.defer();
        
        $http({
            url: '/studio/screen/create/',
            method: 'POST',
            data: page
        }).then(function successCallback(response) {
            deferred.resolve( response.data.screen );
        }, function errorCallback(response) {
            deferred.reject(response);
        });
        
        return deferred.promise;
    }

    api_pages.getCategories = function( scope, app_name, platform ) {
        // url: '/studio/screen-category/list/' + app_name + '/' + platform
        var deferred = $q.defer();
        
        $http({
            url: '/studio/screen-category/list/' + app_name + '/' + platform,
            method: 'GET'
        }).then(function successCallback(response) {
            deferred.resolve( response );
        });
        
        return deferred.promise;
    }

    api_pages.createCategory = function( scope, category_name, app_name, platform ) {
        var deferred = $q.defer();
        
        $http({
            method: 'POST',
            url: '/studio/screen-category/create',
            data: { name: category_name, application: app_name, title: category_name, platform: platform }
        }).then(function successCallback(response) {
            deferred.resolve( response );
        });
        
        return deferred.promise;
    }

    api_pages.editCategory = function( scope, old_name, new_name, app_name, platform ) {
        //  data: { name: new_name, application: app_name, platform : platform }
        var deferred = $q.defer();
        
        $http({
            method: 'POST',
            url: '/studio/screen-category/update/' + old_name,
            data: { name: new_name, application: app_name, platform: platform }
        }).then(function successCallback(response) {
            deferred.resolve( response );
        });
        
        return deferred.promise;
    }

    api_pages.removeCategory = function( scope, category_name, app_name, platform ) {
        // data: { applicationName: app_name, screenCategoryName: category_name, platform: platform }
        var deferred = $q.defer();
        
        $http({
            method: 'POST',
            url: '/studio/screen-category/delete/' + category_name,
            data: { applicationName: app_name, screenCategoryName: category_name, platform: platform }
        }).then(function successCallback(response) {
            deferred.resolve( response );
        });
        
        return deferred.promise;
    }

    api_pages.preview = function( url ) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: url
        }).then(function successCallback(response) {
            deferred.resolve( response );
        },function errorCallback(err){
            deferred.reject(err);
        });

        return deferred.promise;
    }

    return api_pages;
}]);

dfxStudioApi.factory('dfxTemplates', [ '$http', '$q', function($http, $q) {

    var api_templates = {};

    api_templates.getOne = function( scope, app_name, template_name ) {
        var deferred = $q.defer();
        
        $http({
            method: 'GET',
            url: '/studio/screentemplates/item/' + template_name + '/' + app_name
        }).then(function successCallback(response) {
            deferred.resolve(response.data.screenTemplate);
        });
        
        return deferred.promise;
    };

    api_templates.getAll = function( scope, app_name ) {
        var deferred = $q.defer();
        
        $http({
            method: 'GET',
            url: '/studio/screentemplates/list/' + app_name
        }).then(function successCallback(response) {
            deferred.resolve(response.data.screens_templates);
        });
        
        return deferred.promise;
    };

    api_templates.create = function( scope, template ) {
        var deferred = $q.defer();

        delete template._id;
        
        $http({
            url: '/studio/screentemplates/create/',
            method: 'POST',
            data: template
        }).then(function successCallback(response) {
            deferred.resolve( response );
        });
        
        return deferred.promise;
    }

    api_templates.update = function( scope, template ) {
        var deferred = $q.defer();

        delete template._id;
        
        $http({
            url: '/studio/screentemplates/update/',
            method: 'POST',
            data: {"change":template}
        }).then(function successCallback(response) {
            deferred.resolve( response.data.screenTemplate );
        });
        
        return deferred.promise;
    }

    return api_templates;
}]);

dfxStudioApi.factory('dfxAppRoles', [ '$http', '$q', function($http, $q) {

    var api_roles = {};

    api_roles.getAll = function( scope, app_name ) {
        var deferred = $q.defer();

        $http({
            method: 'GET',
            url: '/studio/roles/' + app_name + '/search?q='
        }).then(function successCallback(response) {
            deferred.resolve( response.data.roles );
        });

        return deferred.promise;
    };

    api_roles.getAllRights = function( scope, app_name ) {
        var deferred = $q.defer();

        $http({
            method: 'GET',
            url: '/studio/query/list-by-app/' + app_name
        }).then(function successCallback(response) {
            var dataqueries = response.data.queries;

            deferred.resolve( dataqueries );
        });

        return deferred.promise;
    };

    api_roles.edit = function( scope, app_name, role_name ) {
        var deferred = $q.defer();

        $http({
            method: 'GET',
            url: '/studio/query/list-by-app/' + app_name
        }).then(function successCallback(response) {
            var dataqueries = response.data.queries;

            $http({
                url: '/studio/roles/get',
                method: 'POST',
                data: {
                    tenant:      scope.tenant_id,
                    application: app_name,
                    name:        role_name
                }
            }).then(function successCallback(response) {
                var role = response.data;
                role.all_dataqueries = dataqueries;

                //TODO: check if getRights is not redundant because we already have rights in role object
                $http({
                    url: '/studio/roles/getRights',
                    method: 'POST',
                    data: {
                        tenant:      scope.tenant_id,
                        application: app_name,
                        role:        role_name
                    }
                }).then(function successCallback(response) {
                    role.rights = response.data;
                    console.log('role: ', role);

                    deferred.resolve( role );
                });
            });
        });

        return deferred.promise;
    };

    api_roles.update = function( scope, to_update ) {
        var deferred = $q.defer();

        var data = {
            name:        to_update.name,
            application: to_update.app_name,
            description: to_update.description
        };
        if (to_update.rights && to_update.rights.length > 0) {
            data.rights = to_update.rights;//need to pass rights to server only if there are checked ones
        }

        $http({
            url: '/studio/roles/update',
            method: 'POST',
            data: data
        }).then(function successCallback(response) {
            deferred.resolve( response );
        });

        return deferred.promise;
    };

    api_roles.create = function( scope, to_update ) {
        var deferred = $q.defer();

        var data = {
            tenant:      scope.tenant_id,
            name:        to_update.name,
            application: to_update.app_name,
            description: to_update.description
        };
        if (to_update.rights && to_update.rights.length > 0) {
            data.rights = to_update.rights;//need to pass rights to server only if there are checked ones
        }

        $http({
            url: '/studio/roles/create',
            method: 'POST',
            data: data
        }).then(function successCallback(response) {
            deferred.resolve( response );
        }, function failCallback(response) {
            deferred.reject( response );
        });

        return deferred.promise;
    };

    api_roles.delete = function( scope, app_name, role_name ) {
        var deferred = $q.defer();

        $http({
            url: '/studio/roles/remove',
            method: 'POST',
            data: {
                name:        role_name,
                application: app_name
            }
        }).then(function successCallback(response) {
            deferred.resolve( response );
        });

        return deferred.promise;
    };

    return api_roles;
}]);

dfxStudioApi.factory('dfxAppUsers', [ '$http', '$q', function($http, $q) {

    var api_users = {};

    api_users.getAll = function( scope, app_name ) {
        var deferred = $q.defer();

        $http({
            method: 'GET',
            url: '/studio/users/' + app_name + '/search?q='
        }).then(function successCallback(response) {
            deferred.resolve( response.data.users );
        });

        return deferred.promise;
    };

    api_users.getAllRoles = function( scope, app_name ) {
        var deferred = $q.defer();

        $http({
            url: '/studio/roles/list',
            method: 'POST',
            data: {
                application: app_name
            }
        }).then(function successCallback(response) {
            deferred.resolve( response.data.data );
        });

        return deferred.promise;
    };

    api_users.edit = function( scope, app_name, user_login ) {
        var deferred = $q.defer();

        $http({
            url: '/studio/roles/list',
            method: 'POST',
            data: {
                application: app_name
            }
        }).then(function successCallback(response) {
            var all_roles = response.data.data;

            $http({
                url: 'metadata/user_definition/' + app_name,
                method: 'GET'
            }).then(function successCallback(response) {
                var user_def = response.data;

                $http({
                    url: '/studio/users/get',
                    method: 'POST',
                    data: {
                        tenant:      scope.tenant_id,
                        application: app_name,
                        login:       user_login
                    }
                }).then(function successCallback(response) {
                    var user = response.data.data;
                    user.all_roles = all_roles;
                    user.user_def = user_def;

                    deferred.resolve( user );
                });
            });
        });

        return deferred.promise;
    };

    api_users.update = function( scope, to_update, new_pass, pass_changed ) {
        var deferred = $q.defer();

        var data = {
            tenant:      scope.tenant_id,
            application: to_update.app_name,
            login:       to_update.login,
            firstName:   to_update.firstName,
            lastName:    to_update.lastName,
            email:       to_update.email,
            roles:       to_update.roles,
            properties:  to_update.properties
        };

        if (pass_changed) data.pass = new_pass;

        $http({
            url: '/studio/users/update',
            method: 'POST',
            data: data
        }).then(function successCallback(response) {
            deferred.resolve( response );
        });

        return deferred.promise;
    };

    api_users.create = function( scope, to_create ) {
        var deferred = $q.defer();

        var data = {
            kind:        'application',
            type:        '',
            tenant:      scope.tenant_id,
            application: to_create.app_name,
            login:       to_create.login,
            firstName:   to_create.firstName,
            lastName:    to_create.lastName,
            email:       to_create.email,
            pass:        to_create.new_pass,
            roles:       to_create.roles,
            properties:  to_create.properties
        };

        $http({
            url: '/studio/users/create',
            method: 'POST',
            data: data
        }).then(function successCallback(response) {
            deferred.resolve( response.config.data );
        }, function failCallback(response) {
            deferred.reject( response );
        });

        return deferred.promise;
    };

    api_users.delete = function( scope, app_name, user_login ) {
        var deferred = $q.defer();

        $http({
            url: '/studio/users/remove',
            method: 'POST',
            data: {
                login:       user_login,
                application: app_name
            }
        }).then(function successCallback(response) {
            deferred.resolve( response );
        });

        return deferred.promise;
    };

    return api_users;
}]);

dfxStudioApi.factory('dfxUserDefinition', [ '$http', '$q', function($http, $q) {

    var api_user_def = {};

    api_user_def.getUserDefinition = function( scope, app_name ) {
        var deferred = $q.defer();

        $http({
            method: 'GET',
            url: 'metadata/user_definition/' + app_name
        }).then(function successCallback(response) {
            deferred.resolve( response.data );
        });

        return deferred.promise;
    };

    api_user_def.updateUserDefinition = function( scope, app_name, user_definition ) {
        var deferred = $q.defer();

        var data = angular.copy(user_definition);
        data.applicationName = app_name;

        $http({
            url: '/studio/metadata/user_definition/update',
            method: 'POST',
            data: data
        }).then(function successCallback(response) {
            deferred.resolve( response );
        });

        return deferred.promise;
    };

    return api_user_def;
}]);

dfxStudioApi.factory('dfxApiServiceObjects', [ '$http', '$q', function($http, $q) {

    var api_service_objects = {};

    api_service_objects.getAll = function( scope, app_name ) {
        var deferred = $q.defer();
        
        $http({
            method: 'POST',
            url: '/studio/auth-providers',
            data: { action: "fullList", getCreds : true, applicationName : app_name }
        }).then(function successCallback(response) {
            deferred.resolve( response );
        });
        
        return deferred.promise;
    }

    api_service_objects.getOne = function( scope, app_name, api_so_name ) {
        var deferred = $q.defer();
        
        $http({
            method: 'GET',
            url: '/studio/query/dataNew/' + app_name + '/' + api_so_name
        }).then(function successCallback(response) {
            deferred.resolve( response );
        });
        
        return deferred.promise;
    }

    api_service_objects.getCategories = function( scope, app_name ) {
        var deferred = $q.defer();
        
        $http({
            method: 'GET',
            url: '/studio/query/category/list/' + app_name
        }).then(function successCallback(response) {
            deferred.resolve( response );
        });
        
        return deferred.promise;
    }

    api_service_objects.createCategory = function( scope, category_name, app_name ) {
        var deferred = $q.defer();
        
        $http({
            method: 'POST',
            url: '/studio/query/category/createCategory',
            data: { name: category_name, ownerId: "", application: app_name }
        }).then(function successCallback(response) {
            deferred.resolve( response );
        });
        
        return deferred.promise;
    }

    api_service_objects.editCategory = function( scope, old_name, new_name, app_name ) {
        var deferred = $q.defer();
        
        $http({
            method: 'POST',
            url: '/studio/query/category/updateCategory/' + old_name,
            data: { name: new_name, application: app_name }
        }).then(function successCallback(response) {
            deferred.resolve( response );
        });
        
        return deferred.promise;
    }

    api_service_objects.removeCategory = function( scope, category_name, app_name ) {
        var deferred = $q.defer();
        
        $http({
            method: 'POST',
            url: '/studio/query/category/removeCategory/' + category_name,
            data: { name: category_name, ownerId: "", application: app_name }
        }).then(function successCallback(response) {
            deferred.resolve( response );
        });
        
        return deferred.promise;
    }

    api_service_objects.createSo = function( scope, so ) {
        var deferred = $q.defer();

        $http({
            method: 'POST',
            url: '/studio/query/create/' + so.name,
            data: so
        }).then(function successCallback(response) {
            deferred.resolve( response );
        }, function errorCallback(response){
            deferred.reject( response );
        });
        
        return deferred.promise;
    }

    api_service_objects.updateSo = function( scope, so ) {
        var deferred = $q.defer();

        $http({
            method: 'POST',
            url: '/studio/query/update/' + so.name,
            data: so
        }).then(function successCallback(response) {
            deferred.resolve( response );
        });
        
        return deferred.promise;
    }

    api_service_objects.renameSo = function( scope, so, oldName ) {
        var deferred = $q.defer();

        $http({
            method: 'POST',
            url: '/studio/query/update/' + oldName,
            data: so
        }).then(function successCallback(response) {
            deferred.resolve( response );
        }, function errorCallback(response){
            deferred.reject( response );
        });

        return deferred.promise;
    }

    api_service_objects.deleteSo = function( scope, so ) {
        var deferred = $q.defer();
        
        $http({
            url: '/studio/query/delete/',
            method: 'POST',
            data: {
                "queryName" : so.name,
                "applicationName" : so.application,
            }
        }).then(function successCallback(response) {
            deferred.resolve( response );
        });
        
        return deferred.promise;
    }

    api_service_objects.validateSoName = function( scope, api_so_name, app_name ) {
        var deferred = $q.defer();
        
        $http({
            method: 'POST',
            url: '/studio/query/validateServiceName',
            data: { name: api_so_name, applicationName: app_name }
        }).then(function successCallback(response) {
            deferred.resolve( response );
        });
        
        return deferred.promise;
    }

    api_service_objects.validateSoUrl = function( scope, api_route, app_name, route_id ) {
        var deferred = $q.defer();
        
        $http({
            method: 'POST',
            url: '/studio/query/validateServiceUrl',
            data: { name: api_route, applicationName: app_name, uuid: route_id }
        }).then(function successCallback(response) {
            deferred.resolve( response );
        });
        
        return deferred.promise;
    }

    api_service_objects.getCatalog = function( scope ) {
        var deferred = $q.defer();
        
        $http({
            method: 'GET',
            url: '/src/catalog/datasources.json'
        }).then(function successCallback(response) {
            deferred.resolve( response );
        });
        
        return deferred.promise;
    }

    api_service_objects.getStrongLoop = function( scope, server_url ) {
        var deferred = $q.defer();
        
        $http({
            method: 'GET',
            url: server_url + '/explorer/swagger.json'
        }).then(function successCallback(response) {
            deferred.resolve( response );
        });
        
        return deferred.promise;
    }

    api_service_objects.clearCache = function( o ) {
        var deferred = $q.defer();

        $http({
            method: 'POST',
            url: '/studio/query/clearCache',
            data: { type : o.type, application : o.application, name : o.name }
        }).then(function successCallback(response) {
            deferred.resolve( response );
        },function negativeCallback(err){
            deferred.reject( err );
        });

        return deferred.promise;
    }

    return api_service_objects;
}]);

dfxStudioApi.factory('dfxSamples', [ '$http', '$q', function($http, $q) {

    var api_samples = {};

    api_samples.contents = function( scope, path ) {
        var deferred = $q.defer();

        $http({
            method: 'GET',
            url: 'samples/contents',
            params: {'path': path}
        }).then(function successCallback(response) {
            deferred.resolve( response.data );
        });

        return deferred.promise;
    };

    return api_samples;
}]);
