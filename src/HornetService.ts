/// <reference path="../typings/index.d.ts" />
/// <reference path="./CurrentLocationService.ts" />

namespace Services {
    export interface IHornetService {
				getDistance(userId: string, loc: ILocation): number;
				searchUser(name: string, page: number): ng.IHttpPromise<Hornet.ISearchResponse>;
				nearUsers(page: number): ng.IHttpPromise<Hornet.ISearchResponse>;
    }

		export namespace Hornet {

				export interface ISearchResponse {
				}
				
				export class HornetService implements IHornetService {

						private $http: ng.IHttpService;
						private $q: ng.IQService;
						private $rootScope: ng.IRootScopeService;
						private authService: ng.httpAuth.IAuthService;
						private CurrentLocation: Services.ICurrentLocationService;

						private session: string;
						private hwid: string;

						private baseURL = "https://gethornet.com/api/v3";
						private http_headers: ng.HttpHeaderType = {
								'X-Client-Version': 'iOS 3.0.4',
								'Accept': '*/*',
								'Authorization': function () {
										if (this.session == undefined)
												return undefined;

										return "Hornet " + this.session;
								},
								'X-Device-Identifier': function () {
										this.hwid = this.hwid || this.makeid();

										return this.hwid;
								},
								'X-Device-Location': function () {
										var location = this.CurrentLocation.getLocation();

										if (location != undefined)
												return location.lat + ", " + location.lng;

										return undefined;
								}
						};

						constructor($http: ng.IHttpService, $q: ng.IQService, $rootScope: ng.IRootScopeService,
												authService: ng.httpAuth.IAuthService,
												CurrentLocation: Services.ICurrentLocationService) {
								this.$http = $http;
								this.$q = $q;
								this.$rootScope = $rootScope;
								this.authService = authService
						}
						
				}
		}
}
