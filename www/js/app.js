// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('hpinpoint', ['ionic', 'ngCordova', 'hpinpoint.controllers', 'hpinpoint.services', 'http-auth-interceptor'])

		.run(function($ionicPlatform, $ionicLoading, $rootScope, Hornet, authService) {
				$ionicPlatform.ready(function() {
						// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
						// for form inputs)
						if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
								cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
								cordova.plugins.Keyboard.disableScroll(true);

						}
						if (window.StatusBar) {
								// org.apache.cordova.statusbar required
								StatusBar.styleDefault();
						}

						$rootScope.$on('event:auth-loginRequired', function(event, data) {
								$ionicLoading.show({template: 'Authenticating'});
								Hornet.startSession().then(function(response) {
										authService.loginConfirmed('success', function(config){
												config.headers["Authorization"] = Hornet.http_headers.Authorization();
												return config;
										});
										$ionicLoading.hide();
								}, function(response){
										$ionicLoading.show({template: response});
								});
						});
				});
		})

		.config(function($stateProvider, $urlRouterProvider) {

				// Ionic uses AngularUI Router which uses the concept of states
				// Learn more here: https://github.com/angular-ui/ui-router
				// Set up the various states which the app can be in.
				// Each state's controller can be found in controllers.js
				$stateProvider

				// setup an abstract state for the tabs directive
						.state('tab', {
								url: '/tab',
								abstract: true,
								templateUrl: 'templates/tabs.html'
						})

				// Each tab has its own nav history stack:

						.state('tab.dash', {
								url: '/dash',
								views: {
										'tab-dash': {
												templateUrl: 'templates/tab-dash.html',
												controller: 'DashCtrl'
										}
								}
						})

						.state('tab.search', {
								url: '/search',
								views: {
										'tab-search': {
												templateUrl: 'templates/tab-search.html',
												controller: 'SearchCtrl'
										}
								}
						})
						.state('locate', {
								url: '/locate/:userId',
								templateUrl: 'templates/locate-map.html',
								controller: 'LocateCtrl'
						});

				// if none of the above states are matched, use this as the fallback
				$urlRouterProvider.otherwise('/tab/search');
				
		});
