/// <reference path="../typings/index.d.ts" />

namespace Services {
    export interface ILocation {
        lat: number;
        lng: number;
    }

    export interface ICurrentLocationService {
        getLocation(): ILocation;
    }

		export class CurrentLocation implements ICurrentLocationService {
				private location : ILocation = { lat: 0, lng: 0};

				constructor($cordovaGeolocation: ngCordova.IGeolocationService,
										$rootScope: ng.IRootScopeService) {
						ionic.Platform.ready(function () {
								$cordovaGeolocation.watchPosition({ timeout: 5000, enableHighAccuracy: false })
										.then(null, function (err: ngCordova.IGeoPositionError) {
												$rootScope.$broadcast('event:LocationServiceError', err);
										}, function (position: ngCordova.IGeoPosition) {
												this.location = {
														lat: position.coords.latitude,
														lng: position.coords.longitude
												};
										});
						});
				}
				
				getLocation() : ILocation {
						return this.location;
				}
		}
}

angular.module('hpinpoint.services', ['ionic']).service('CurrentLocation', Services.CurrentLocation);
