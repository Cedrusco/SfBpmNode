angular.module('bpm-app')
	.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
		// This turns off hashbang urls (/#about) and changes it to something normal (/about)
		$locationProvider.html5Mode(true).hashPrefix('!');
        $urlRouterProvider.otherwise('/');
        $stateProvider.state('home', {
			url: '/',
			templateUrl: '/client/views/home.html'
        });
        $stateProvider.state('createOrder', {
			url: '/createOrder',
			templateUrl: '/client/views/createOrder.html'
        });
        $stateProvider.state('searchOrder', {
			url: '/searchOrder',
			templateUrl: '/client/views/searchOrder.html'
        });
        $stateProvider.state('openTasks', {
			url: '/openTasks',
			templateUrl: '/client/views/openTasks.html'
        });
	}]);