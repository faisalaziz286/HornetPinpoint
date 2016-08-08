/// <reference path="./common.ts" />

// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('hpinpoint', ['ionic', 'ngCordova', 'http-auth-interceptor',
    'hpinpoint.controllers', 'hpinpoint.services'])

    .run(function ($ionicPlatform, $ionicLoading, $rootScope, $ionicPopup, Hornet) {
        $ionicPlatform.ready(function () {
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

            $rootScope.$on('event:auth-loginCancelled', function (response) {
                $ionicPopup.confirm({
                    title: 'Authentication Error',
                    content: 'Could not authenticate into hornet servers'
                });
            });

        });
    })

    .config(function ($stateProvider, $urlRouterProvider) {
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

            .state('tab.near', {
                url: '/near',
                views: {
                    'tab-near': {
                        templateUrl: 'templates/tab-near.html',
                        controller: 'NearCtrl'
                    }
                }
            })

            .state('tab.near-map', {
                url: '/near/:userName',
                views: {
                    'tab-near': {
                        templateUrl: 'templates/locate-map.html',
                        controller: 'LocateCtrl'
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
            .state('tab.search-map', {
                url: '/search/:userName',
                views: {
                    'tab-search': {
                        templateUrl: 'templates/locate-map.html',
                        controller: 'LocateCtrl'
                    }
                }
            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/tab/search');

    });
