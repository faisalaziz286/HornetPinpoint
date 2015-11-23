angular.module('hpinpoint.services', ['ionic'])

		.factory('Hornet', function($http, $q) {
				var baseURL = "https://gethornet.com/api/v3";
				var service = {};
				var earthR = 6371;
				var location = {lat: -30.0331, lon: -51.2300};
				var session;
				var hwid;
				
				var http_headers = {		
						'X-Client-Version': 'Android 2.1.11',
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
								if(location != undefined)
										return location.lat + "," + location.lon;

								return undefined;
						}};
				
				function rad(deg) {
						return deg * Math.pi / 180;
				}
				
				function deg(rad) {
						return rad * 180 / Math.pi;
				}
				
				function geodist(p, ref) {
						var ret = { };
						var dist = Math.sqrt(p.x*p.x + p.y*p.y);
						var bcos = p.y/dist;
						var bsin = p.x/dist;
						var rdist = dist/earthRadius;
						var rlat = rad(ref.lat);
						var rlon = rad(ref.lon);
						
						var lat = Math.asin(Math.sin(rlat)*Math.cos(rdist) + Math.cos(rlat)*sin(rdist)*bcos);
						ret.lon = ref.lon + deg(Math.atan2(bsin*Math.sin(rdist)*Math.cos(rlat),
																							 Math.cos(rdist)-Math.sin(rlat)*Math.sin(lat)));
						
						if(lat < -Math.pi)
								ret.lat = deg(lat + 2*Math.pi);
						else if(ret.lat > Math.pi)
								ret.lat = deg(lat - 2*Math.pi);
						else
								ret.lat = deg(lat);
						
						return ret;
				}
				
				function trilaterate(centre_r, right_t, top_r) {
						var ret = {};
						
						ret.x = (2*centre_r*centre_r - right_r*right_r)/(2*centre_r);
						ret.y = (2*centre_r*centre_r - top_r*top_r)/(2*centre_r);
						
						return ret;
				}
				
				function makeid() {
						var possible = "0123456789abcdefghijklmnopqrstuwyxz";
						var ret = "";
						
						for(var i = 0 ; i < 14 ; i++)
								ret += possible.charAt(Math.round(Math.random() * possible.length));
						
						return ret;
				}

				service.startSession = function () {
						hwid = hwid || makeid();

						location = location || {lat: -30.0331, lon: -51.2300};
						
						var promise = $http.post(baseURL+"/session.json",
																		 {"session": {"id": hwid,"provider": "UDID"}},
																		 {headers: http_headers});
						
						promise.then(function(response) {
								session = response.data.session.access_token;
						});

						return promise;
				}

				service.searchUser = function (string) {
						return $http.get(baseURL+"/members/search?page=1&per_page=50&username=@"+string,
														{headers: http_headers});
				}

				service.setLocation = function (loc) {
						location = loc;
				}

				service.getDistance = function (userId, loc) {
						var h = http_headers;

						h["X-Device-Location"] = loc.lat + "," + loc.lon;

						var defer = $q.defer();

						http.get(baseURL+"/members/search?page=1&per_page=24&username=@"+userID,
										 {headers: h}).
								then(function(response) {
										try{
												defer.resolve(response.data.members[0].member.distance);
										} catch(e) {
												defer.reject("Invalid User");
										}
								}, function(response) {
										defer.reject("Error");
								});

						return defer.promise;
				}

				service.pinpoint = function (userID) {
						var defer = $q.defer();
						var pd = Infinity;
						var loc = location;

						function worker() {
								getDistance(userID, loc).then(
										function(d) {
												if(d && (Math.abs(d-pd) < 0.005))
														defer.resolve({location: loc, distance: d});
												else {
														var top_loc = geodist({x: d, y: 0}, loc);
														var right_loc = geodist({x: 0, y: d}, loc);

														pd = d;
														
														$q.all({dt: getDistance(userID, top_loc),
																		dr: getDistance(userID, right_loc)}).
																then(function (result) {
																		loc = geodist(trilaterate(d, result.dr, result.dt), loc);
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

				service.startSession();
				
				return service;
		}); /*
		.factory('HttpHeaders', function() {
				var service = {};

				service.http_headers = {};

				service.add = function (headers) {
						for(var attrname in headers)
								service.http_headers[attrname] = headers[attrname];
				}

				return service;
		}); */
