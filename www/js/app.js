'use strict';

/// <reference path="./common.ts" />
// Ionic Starter App
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('hpinpoint', ['ionic', 'ngCordova', 'http-auth-interceptor', 'hpinpoint.controllers', 'hpinpoint.services']).run(function ($ionicPlatform, $ionicLoading, $rootScope, $ionicPopup, Hornet) {
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
}).config(function ($stateProvider, $urlRouterProvider) {
    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider.state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
    }).state('tab.near', {
        url: '/near',
        views: {
            'tab-near': {
                templateUrl: 'templates/tab-near.html',
                controller: 'NearCtrl'
            }
        }
    }).state('tab.near-map', {
        url: '/near/:userName',
        views: {
            'tab-near': {
                templateUrl: 'templates/locate-map.html',
                controller: 'LocateCtrl'
            }
        }
    }).state('tab.search', {
        url: '/search',
        views: {
            'tab-search': {
                templateUrl: 'templates/tab-search.html',
                controller: 'SearchCtrl'
            }
        }
    }).state('tab.search-map', {
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
/// <reference path="../typings/index.d.ts" />
"use strict";
'use strict';

/// <reference path="./common.ts" />
angular.module('hpinpoint.controllers', []).controller('NearCtrl', function ($scope, Hornet, $ionicPopup, $ionicLoading, $state) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});
    $scope.dispDist = function (dist) {
        if (dist === null) return '';
        if (dist < 1) return dist * 1000 + 'm';
        return dist + 'km';
    };
    $scope.loadMoreData = function () {
        Hornet.nearUsers($scope.lastPage + 1).then(function (response) {
            $scope.lastPage++;
            $scope.members = $scope.members.concat(response.data.members);
        }, function (error) {
            $ionicPopup.alert({
                title: "Abadon, no good",
                template: "Http Error: " + error.status
            });
        }).finally(function () {
            $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    };
    $scope.goLocate = function (user) {
        if (user.member.distance) $state.go('tab.near-map', { userName: user.member.account.username });else $ionicPopup.alert({
            title: 'No distance',
            template: 'Cannot locate user with unknown distance'
        });
    };
    $scope.refresh = function () {
        $scope.lastPage = 0;
        $scope.members = [];
        Hornet.nearUsers().then(function (response) {
            response.data.members.splice(0, 1);
            $scope.lastPage = 1;
            $scope.members = response.data.members;
            if ($scope.members.length == 0) $ionicPopup.alert({
                template: "No results found"
            });
        }, function (error) {
            $ionicPopup.alert({
                title: "Abadon, no good",
                template: "Http Error: " + error.status
            });
        }).finally(function () {
            $scope.$broadcast('scroll.refreshComplete');
        });
    };
    $scope.$on('$ionicView.loaded', $scope.refresh);
}).controller('SearchCtrl', function ($scope, Hornet, $ionicPopup, $ionicLoading, $state) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});
    $scope.dispDist = function (dist) {
        if (dist === null) return '';
        if (dist < 1) return dist * 1000 + 'm';
        return dist + 'km';
    };
    $scope.loadMoreData = function () {
        Hornet.searchUser($scope.query, $scope.lastPage + 1).then(function (response) {
            $scope.lastPage++;
            $scope.members = $scope.members.concat(response.data.members);
            if (response.data.members.length < 50) $scope.moreDataCanBeLoaded = false;else $scope.moreDataCanBeLoaded = true;
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }, function () {
            $scope.moreDataCanBeLoaded = false;
            $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    };
    $scope.clear = function () {
        $scope.lastPage = 0;
        $scope.members = [];
        $scope.moreDataCanBeLoaded = false;
        $scope.query = "";
    };
    $scope.searchUser = function (query) {
        $ionicLoading.show({ template: "Searching..." });
        Hornet.searchUser(query).then(function (response) {
            $scope.members = response.data.members;
            $ionicLoading.hide();
            if ($scope.members.length == 0) {
                $scope.lastPage = 0;
                $scope.moreDataCanBeLoaded = false;
                $scope.query = "";
                $ionicPopup.alert({
                    template: "No results found"
                });
            } else {
                $scope.lastPage = 1;
                if (response.data.members.length < 50) $scope.moreDataCanBeLoaded = false;else $scope.moreDataCanBeLoaded = true;
            }
        }, function (error) {
            $ionicLoading.hide();
            $ionicPopup.alert({
                title: "Abadon, no good",
                template: "Http Error: " + error.status
            });
        });
    };
    $scope.goLocate = function (user) {
        if (user.member.distance) $state.go('tab.search-map', { userName: user.member.account.username });else $ionicPopup.alert({
            title: 'No distance',
            template: 'Cannot locate user with unknown distance'
        });
    };
}).controller('LocateCtrl', function ($scope, Hornet, $stateParams, $ionicLoading, $ionicPopup) {
    $scope.userName = $stateParams.userName;
    $ionicLoading.show({ template: "Locating..." });
    Hornet.pinpoint($stateParams.userName).then(function (response) {
        $ionicLoading.hide();
        var mapOptions = {
            center: response.location,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        // Red big BOG warning!
        var mapEl = $('ion-nav-view[nav-view="active"]').find('#map')[0];
        $scope.map = new google.maps.Map(mapEl, mapOptions);
        google.maps.event.addListenerOnce($scope.map, 'idle', function () {
            var marker = new google.maps.Circle({
                map: $scope.map,
                center: response.location,
                radius: response.distance * 1000
            });
        });
    }, function (error) {
        $ionicLoading.hide();
        $ionicPopup.alert({
            title: "Abadon, no good",
            template: error
        });
    });
    $scope.$on('$ionicView.loaded', $scope.clear);
});
'use strict';

/// <reference path="./common.ts" />
angular.module('hpinpoint.services', ['ionic']).factory('Hornet', function ($http, $q, CurrentLocation, $rootScope, authService) {
    var baseURL = "https://gethornet.com/api/v3";
    var earthRadius = 6371;
    var session;
    var hwid;
    var http_headers = {
        'X-Client-Version': 'iOS 3.0.4',
        'Accept': '*/*',
        'Authorization': function Authorization() {
            if (session == undefined) return undefined;
            return "Hornet " + session;
        },
        'X-Device-Identifier': function XDeviceIdentifier() {
            hwid = hwid || makeid();
            return hwid;
        },
        'X-Device-Location': function XDeviceLocation() {
            var location = CurrentLocation.getLocation();
            if (location != undefined) return location.lat + ", " + location.lng;
            return undefined;
        }
    };
    function rad(deg) {
        return deg * Math.PI / 180;
    }
    function deg(rad) {
        return rad * 180 / Math.PI;
    }
    function geodist(p, ref) {
        var dist = Math.sqrt(p.x * p.x + p.y * p.y);
        var bcos = p.y / dist;
        var bsin = p.x / dist;
        var rdist = dist / earthRadius;
        var rlat = rad(ref.lat);
        var rlon = rad(ref.lng);
        var lat = Math.asin(Math.sin(rlat) * Math.cos(rdist) + Math.cos(rlat) * Math.sin(rdist) * bcos);
        var lng = ref.lng + deg(Math.atan2(bsin * Math.sin(rdist) * Math.cos(rlat), Math.cos(rdist) - Math.sin(rlat) * Math.sin(lat)));
        if (lat < -Math.PI) lat = deg(lat + 2 * Math.PI);else if (lat > Math.PI) lat = deg(lat - 2 * Math.PI);else lat = deg(lat);
        return {
            lat: lat,
            lng: lng
        };
    }
    function trilaterate(centre_r, right_r, top_r) {
        return {
            x: (2 * centre_r * centre_r - right_r * right_r) / (2 * centre_r),
            y: (2 * centre_r * centre_r - top_r * top_r) / (2 * centre_r)
        };
    }
    function makeid() {
        var possible = "0123456789abcdef"; //ghijklmnopqrstuwyxz";
        var ret = "";
        for (var i = 0; i < 40; i++) {
            ret += possible.charAt(Math.round(Math.random() * possible.length));
        }return ret;
    }
    function makeDevToken() {
        var possible = "0123456789abcdef";
        var ret = "";
        for (var i = 0; i < 8; i++) {
            for (var j = 0; j < 8; j++) {
                ret += possible.charAt(Math.round(Math.random() * possible.length));
            }ret += ' ';
        }
        return ret;
    }
    function startSession() {
        hwid = hwid || makeid();
        console.log("Authenticating with hwid " + hwid);
        var promise = $http.post(baseURL + "/session.json", { "session": { "id": hwid, "provider": "UDID" } }, { headers: http_headers });
        promise.then(function (response) {
            session = response.data.session.access_token;
            console.log("Authenticated with sessionId " + session);
        });
        return promise;
    }
    function searchUser(name, page) {
        page = page || 1;
        name = encodeURIComponent(name);
        return $http.get(baseURL + '/members/search?page=' + page + '&per_page=50&username=' + name, { headers: http_headers });
    }
    function nearUsers(page) {
        page = page || 1;
        return $http.get(baseURL + '/members/near?page=' + page + '&per_page=50', { headers: http_headers });
    }
    function getDistance(userId, loc) {
        var h = Object.assign({}, http_headers);
        var defer = $q.defer();
        h['X-Device-Location'] = loc.lat + ", " + loc.lng;
        userId = encodeURIComponent(userId);
        $http.get(baseURL + "/members/search?page=1&per_page=50&username=@" + userId, { headers: h }).then(function (response) {
            for (var i = 0; i < response.data.members.length; i++) {
                if (response.data.members[i].member.account.username == userId) {
                    defer.resolve(response.data.members[i].member.distance);
                    return;
                }
            }defer.reject("Invalid User");
        }, function (response) {
            defer.reject(response);
        });
        return defer.promise;
    }
    function pinpoint(userID) {
        var defer = $q.defer();
        var pd = Infinity;
        var loc = CurrentLocation.getLocation();
        function worker() {
            console.log('Centre Location ' + JSON.stringify(loc));
            getDistance(userID, loc).then(function (d) {
                console.log('Centre Distance ' + d);
                if (d && (d <= 0.08 || Math.abs(pd - d) < 0.01)) defer.resolve({ location: loc, distance: d });else if (d - pd > pd) defer.reject("Diverging");else {
                    var right_loc = geodist({ x: d, y: 0 }, loc);
                    var top_loc = geodist({ x: 0, y: d }, loc);
                    console.log('Top ' + JSON.stringify(top_loc));
                    console.log('Right ' + JSON.stringify(right_loc));
                    pd = d;
                    $q.all({
                        dt: getDistance(userID, top_loc),
                        dr: getDistance(userID, right_loc)
                    }).then(function (result) {
                        console.log('Distances ' + JSON.stringify(result));
                        var tri = trilaterate(d, result.dr, result.dt);
                        console.log('Trilateration ' + JSON.stringify(tri));
                        loc = geodist(tri, loc);
                        worker();
                    }, function (error) {
                        defer.reject(error);
                    });
                }
            }, function (error) {
                defer.reject(error);
            });
        }
        worker();
        return defer.promise;
    }
    $rootScope.$on('event:auth-loginRequired', function (event, data) {
        console.log('Loging Required');
        startSession().then(function (response) {
            authService.loginConfirmed('success', function (config) {
                config.headers["Authorization"] = http_headers.Authorization();
                return config;
            });
        }, function (response) {
            authService.loginCanceller('failed', response);
        });
    });
    startSession();
    return {
        pinpoint: pinpoint,
        searchUser: searchUser,
        nearUsers: nearUsers
    };
}).factory('CurrentLocation', function ($cordovaGeolocation, $rootScope) {
    var location = { lat: 0, lng: 0 };
    ionic.Platform.ready(function () {
        $cordovaGeolocation.watchPosition({ timeout: 5000, enableHighAccuracy: false }).then(null, function (err) {
            $rootScope.$broadcast('event:LocationServiceError', err);
        }, function (position) {
            location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
        });
    });
    return {
        getLocation: function getLocation() {
            return location;
        }
    };
});