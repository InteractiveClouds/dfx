var dfxStudioLandingApp = angular.module("dfxStudioLandingApp", ['ngRoute', 'ngMaterial', 'dfxStudioApi']);

dfxStudioLandingApp.config([ '$routeProvider', '$mdThemingProvider', function($routeProvider, $mdThemingProvider) {
    
    $routeProvider
	    .when('/home', {
	      controller: 'dfx_studio_landing_controller',
	      templateUrl: 'studioviews/landing_home.html'
    	})
    	.when('/getting-started', {
	      controller: 'dfx_studio_landing_getting_started_controller',
	      templateUrl: 'studioviews/landing_getting_started.html'
    	})
    	.otherwise( '/home', {
	      controller: 'dfx_studio_landing_controller',
	      templateUrl: 'studioviews/landing_home.html'
    	})

    $mdThemingProvider.theme('altTheme')
        .primaryPalette('blue') // specify primary color, all
    // other color intentions will be inherited
    // from default
    $mdThemingProvider.setDefaultTheme('altTheme');
}]);

dfxStudioLandingApp.controller("dfx_studio_landing_controller", [ '$scope', '$location', '$window', function($scope, $location, $window) {
	$scope.tenant_id = $('#dfx-studio-landing-body').attr( 'data-tenantid' );
	$scope.dfx_version_major   = '3';
    $scope.dfx_version_minor   = '02';
    $scope.dfx_version_release = 'R6';

	$scope.openDocumentation = function() {
		$window.open( 'http://interactive-clouds.com/documentation/' );
	}

	$scope.openGettingStarted = function() {
		$location.path('/getting-started');
	}

}]);

dfxStudioLandingApp.controller("dfx_studio_landing_getting_started_controller", [ '$scope', '$window', function($scope, $window) {

}]);

dfxStudioLandingApp.controller("dfx_studio_login_controller", [ '$scope', '$window', function($scope, $window) {

}]);
