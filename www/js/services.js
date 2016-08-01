"use strict";

angular.module('hpinpoint.services', ['ionic'])

		.factory('Hornet', function($http, $q, CurrentLocation, $rootScope, authService) {
				var baseURL = "https://gethornet.com/api/v3";
				var service = {};
				var earthRadius = 6371;
				var session;
				var hwid;
				
				var http_headers = {		
						'X-Client-Version': 'iOS 3.0.4',
						'Accept': '*/*',
						'Authorization': function() {
								if(session == undefined)
										return undefined;
								
								return "Hornet " + session;
						},
						'X-Device-Identifier': function() {
								hwid = hwid || makeid();
								
								return hwid;
						},
						'X-Device-Location': function() {
								var location = CurrentLocation.getLocation();
								
								if(location != undefined)
										return location.lat + ", " + location.lng;

								return undefined;
						}};

				service.http_headers = http_headers;
				
				function rad(deg) {
						return deg * Math.PI / 180;
				}
				
				function deg(rad) {
						return rad * 180 / Math.PI;
				}
				
				function geodist(p, ref) {
						var ret = { };
						var dist = Math.sqrt(p.x*p.x + p.y*p.y);
						var bcos = p.y/dist;
						var bsin = p.x/dist;
						var rdist = dist/earthRadius;
						var rlat = rad(ref.lat);
						var rlon = rad(ref.lng);
						
						var lat = Math.asin(Math.sin(rlat)*Math.cos(rdist) + Math.cos(rlat)*Math.sin(rdist)*bcos);
						ret.lng = ref.lng + deg(Math.atan2(bsin*Math.sin(rdist)*Math.cos(rlat),
																							 Math.cos(rdist)-Math.sin(rlat)*Math.sin(lat)));
						
						if(lat < -Math.PI)
								ret.lat = deg(lat + 2*Math.PI);
						else if(ret.lat > Math.PI)
								ret.lat = deg(lat - 2*Math.PI);
						else
								ret.lat = deg(lat);
						
						return ret;
				}
				
				function trilaterate(centre_r, right_r, top_r) {
						var ret = {};
						
						ret.x = (2*centre_r*centre_r - right_r*right_r)/(2*centre_r);
						ret.y = (2*centre_r*centre_r - top_r*top_r)/(2*centre_r);
						
						return ret;
				}
				
				function makeid() {
						var possible = "0123456789abcdef";//ghijklmnopqrstuwyxz";
						var ret = "";
						
						for(var i = 0 ; i < 40 ; i++)
								ret += possible.charAt(Math.round(Math.random() * possible.length));
						
						return ret;
				}

				function makeDevToken() {
						var possible = "0123456789abcdef";
						var ret = "";

						for(var i = 0; i < 8 ; i++) {
								for(var j = 0 ; j < 8 ; j++)
										ret += possible.charAt(Math.round(Math.random() * possible.length));

								ret += ' ';
						}
				}

				service.startSession = function () {
						hwid = hwid || makeid();

						console.log("Authenticating with hwid "+hwid);
						
						var promise = $http.post(baseURL+"/session.json",
																			{"session": {"id": hwid,"provider": "UDID"}},
																			{headers: http_headers});
						
						promise.then(function(response) {
								session = response.data.session.access_token;
								console.log("Authenticated with sessionId "+session);
						});
						
						return promise;
				}

				service.searchUser = function (string, page) {
						page = page || 1;
						string = encodeURIComponent(string);
						return $http.get(baseURL+'/members/search?page='+page+'&per_page=50&username='+string,
														 {headers: http_headers});
				}

				service.nearUsers = function (page) {
						page = page || 1;
						return $http.get(baseURL+'/members/near?page='+page+'&per_page=50',
														 {headers: http_headers});
				}


				service.getDistance = function (userId, loc) {
						var h = Object.assign({}, http_headers);

						var defer = $q.defer();

						h['X-Device-Location'] = loc.lat + ", " + loc.lng;

						userId = encodeURIComponent(userId);

						$http.get(baseURL+"/members/search?page=1&per_page=50&username=@"+userId,
											{headers: h})
								.then(function(response) {
										for(var i = 0 ; i < response.data.members.length ; i++)
												if(response.data.members[i].member.account.username == userId) {
														defer.resolve(response.data.members[i].member.distance);
														return;
												}
										defer.reject("Invalid User");
								}, function(response) {
										defer.reject(response);
								});
						
						return defer.promise;
				}

				service.pinpoint = function (userID) {
						var defer = $q.defer();
						var pd = Infinity;
						var loc = CurrentLocation.getLocation();

						function worker() {
								console.log('Centre Location '+JSON.stringify(loc));
								service.getDistance(userID, loc).then(
										function(d) {
												console.log('Centre Distance ' + d);
												if(d && (d <= 0.08 || Math.abs(pd-d) < 0.01))
														defer.resolve({location: loc, distance: d});
												else if (d - pd > 1)
														defer.reject("Diverging");
												else {
														var right_loc = geodist({x: d, y: 0}, loc);
														var top_loc = geodist({x: 0, y: d}, loc);

														console.log('Top '+JSON.stringify(top_loc));
														console.log('Right '+JSON.stringify(right_loc));

														pd = d;
														
														$q.all({dt: service.getDistance(userID, top_loc),
																		dr: service.getDistance(userID, right_loc)}).
																then(function (result) {
																		console.log('Distances '+JSON.stringify(result));
																		var tri = trilaterate(d, result.dr, result.dt);
																		console.log('Trilateration '+JSON.stringify(tri));
																		loc = geodist(tri, loc);
																		worker();
																}, function (error) {
																		defer.reject(error);
																});
														
												}
										}, function(error) {
												defer.reject(error);
										})
						}

						worker();
						
						return defer.promise;
				}

				$rootScope.$on('event:auth-loginRequired', function(event, data) {
						console.log('Loging Required');
						service.startSession().then(function(response) {
								authService.loginConfirmed('success', function(config){
										config.headers["Authorization"] = http_headers.Authorization();
										return config;
								});
						}, function(response){
								authService.loginCanceller('failed', response);
						});
				});

				service.startSession();
				
				return service;
		}).factory('CurrentLocation', function ($cordovaGeolocation, $rootScope) {
				var location = {lat: 0, lng: 0};

				ionic.Platform.ready(function() {
						$cordovaGeolocation.watchPosition({timeout: 5000, enableHighAccuracy: false})
								.then(null, function(err) {
										$rootScope.$broadcast('event:LocationServiceError', err);
								}, function(position) {
										location = {lat: position.coords.latitude,
																lng: position.coords.longitude};
								});
				});
				
				return {
						getLocation: function() {
								return location;
						}
				}
		});

