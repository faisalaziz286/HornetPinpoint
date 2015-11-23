angular.module('hpinpoint.controllers', [])

		.controller('DashCtrl', function($scope) {})

		.controller('SearchCtrl', function($scope, Hornet, $ionicPopup, $ionicLoading) {
				// With the new view caching in Ionic, Controllers are only called
				// when they are recreated or on app start, instead of every page change.
				// To listen for when this page is active (for example, to refresh data),
				// listen for the $ionicView.enter event:
				//
				//$scope.$on('$ionicView.enter', function(e) {
				//});
				
				$scope.members = [];
				$scope.searchUser = function(query) {
						$ionicLoading.show({template: "Searching..."});
						Hornet.searchUser(query)
								.then(function(response) {
										$scope.members = response.data.members;
										$ionicLoading.hide();
										if($scope.members.length == 0) {
												$ionicPopup.alert({
														template: "No result found"
												});
												$scope.query = "";
										}
								}, function(error) {
										$ionicLoading.hide();
										$ionicPopup.alert({
												title: "I am sorry",
												template: "Http Error: " + error.status
										});
								});
				};
				
				$scope.clearSearch = function() {
						$scope.query = "";
						$scope.members = [];
				};
		})

		.controller('LocateCtrl', function($scope) {});
