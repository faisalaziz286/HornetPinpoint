"use strict";

angular.module('hpinpoint.controllers', [])

		.controller('NearCtrl', function($scope, Hornet, $ionicPopup, $ionicLoading, $state) {
				// With the new view caching in Ionic, Controllers are only called
				// when they are recreated or on app start, instead of every page change.
				// To listen for when this page is active (for example, to refresh data),
				// listen for the $ionicView.enter event:
				//
				//$scope.$on('$ionicView.enter', function(e) {
				//});

				$scope.dispDist = function(dist) {
						if(dist === null)
								return '';
						
						if(dist < 1)
								return dist*1000 + 'm';
						
						return dist+'km';
				}

				$scope.loadMoreData = function() {
						Hornet.nearUsers($scope.lastPage+1)
								.then(function(response) {
										$scope.lastPage++;
										$scope.members = $scope.members.concat(response.data.members);
								}, function() {
										$ionicPopup.alert({
												title: "Abadon, no good",
												template: "Http Error: " + error.status
										});
								}).finally(function() {
										$scope.$broadcast('scroll.infiniteScrollComplete');
								});
				}

				$scope.goLocate = function (user) {
						if(user.member.distance)
								$state.go('tab.near-map', { userName: user.member.account.username });
						else
								$ionicPopup.alert({
										title: 'No distance',
										template: 'Cannot locate user with unknown distance'
								});
				}

				$scope.refresh = function() {
						$scope.lastPage = 0;
						$scope.members = [];
						Hornet.nearUsers()
								.then(function(response) {
										response.data.members.splice(0, 1);
										$scope.lastPage = 1;
										$scope.members = response.data.members;
										if($scope.members.length == 0)
												$ionicPopup.alert({
														template: "No results found"
												});
								}, function(error) {
										$ionicPopup.alert({
												title: "Abadon, no good",
												template: "Http Error: " + error.status
										});
								}).finally(function() {
										$scope.$broadcast('scroll.refreshComplete');
								});
				}

				$scope.$on('$ionicView.loaded', $scope.refresh);
		})

		.controller('SearchCtrl', function($scope, Hornet, $ionicPopup, $ionicLoading, $state) {
				// With the new view caching in Ionic, Controllers are only called
				// when they are recreated or on app start, instead of every page change.
				// To listen for when this page is active (for example, to refresh data),
				// listen for the $ionicView.enter event:
				//
				//$scope.$on('$ionicView.enter', function(e) {
				//});

				$scope.dispDist = function(dist) {
						if(dist === null)
								return '';
						
						if(dist < 1)
								return dist*1000 + 'm';
						
						return dist+'km';
				}

				$scope.loadMoreData = function() {
						Hornet.searchUser($scope.query, $scope.lastPage+1)
								.then(function(response) {
										$scope.lastPage++;
										$scope.members = $scope.members.concat(response.data.members);
										if(response.data.members.length < 50)
												$scope.moreDataCanBeLoaded = false;
										else
												$scope.moreDataCanBeLoaded = true;

										$scope.$broadcast('scroll.infiniteScrollComplete');
								}, function() {
										$scope.moreDataCanBeLoaded = false;
										$scope.$broadcast('scroll.infiniteScrollComplete');
								});
				}

				$scope.clear = function() {
						$scope.lastPage = 0;
						$scope.members = [];
						$scope.moreDataCanBeLoaded = false;
						$scope.query = "";
				}
				
				$scope.searchUser = function(query) {
						$ionicLoading.show({template: "Searching..."});
						Hornet.searchUser(query)
								.then(function(response) {
										$scope.members = response.data.members;
										$ionicLoading.hide();
										if($scope.members.length == 0) {
												$scope.lastPage = 0;
												$scope.moreDataCanBeLoaded = false;
												$scope.query = "";
												$ionicPopup.alert({
														template: "No results found"
												});
										} else {
												$scope.lastPage = 1;
												if(response.data.members.length < 50)
														$scope.moreDataCanBeLoaded = false;
												else
														$scope.moreDataCanBeLoaded = true;
										}
								}, function(error) {
										$ionicLoading.hide();
										$ionicPopup.alert({
												title: "Abadon, no good",
												template: "Http Error: " + error.status
										});
								});
				};

				$scope.goLocate = function (user) {
						if(user.member.distance)
								$state.go('tab.search-map', { userName: user.member.account.username });
						else
								$ionicPopup.alert({
										title: 'No distance',
										template: 'Cannot locate user with unknown distance'
								});
				}
		})

		.controller('LocateCtrl', function($scope, Hornet, $stateParams, $ionicLoading, $ionicPopup) {
				
				$scope.userName = $stateParams.userName;

				$ionicLoading.show({template: "Locating..."});
				Hornet.pinpoint($stateParams.userName)
						.then(function(response) {
								
								$ionicLoading.hide();

								var mapOptions = {
										center: response.location,
										zoom: 15,
										mapTypeId: google.maps.MapTypeId.ROADMAP
								};

								// Red big BOG warning!
								var mapEl = $('ion-nav-view[nav-view="active"]').find('#map')[0];
								
								$scope.map = new google.maps.Map(mapEl, mapOptions);
								
								google.maps.event.addListenerOnce($scope.map, 'idle', function(){
										var marker = new google.maps.Circle({
												map: $scope.map,
												center: response.location,
												radius: response.distance*1000
										});      
										
								});
						}, function(error) {
								$ionicLoading.hide();
								$ionicPopup.alert({
										title: "Abadon, no good",
										template: error
								});
						});
				
				$scope.$on('$ionicView.loaded', $scope.clear);
		});
