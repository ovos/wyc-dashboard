import jQuery from 'jquery';
window.$ = window.jQuery = jQuery;
// import {data} from './data.js';
import {site} from './site.js';
import {api} from './api.js';
import {options} from './options.js';

$(function () {

	let dataUrl =
		api.baseUrl +
		api.endpoint +
		'?meta=*' +
		'&limit=' + api.limit +
		'&fields=' + api.fields.join(',') +
		'&' + api.filters.join('&');

	let dashboardData = [];

	let handleError = function() {
		site.toggleApiError(true);

		setTimeout(function (){
			site.toggleApiError(false);
			fetchData();
		}, 14400000); // 1000 milliseconds * 60 seconds * 60 minutes * 4 hours
	};
	let handleResponse = function(response) {
		dashboardData = dashboardData.concat(response.data);

		if(response.meta.links.next) {
			fetchData(response.meta.links.next)
		} else {
			handleSuccess(dashboardData);
		}
	};
	let handleSuccess = function(data) {
		site.init(data, options);
		dashboardData = [];
		site.toggleLoading(false);

		setTimeout(function (){
			fetchData();
		}, 14400000); // 1000 milliseconds * 60 seconds * 60 minutes * 4 hours
	};

	let fetchData = function (aUrl = null){
		site.toggleLoading(true);
		let url = aUrl ? aUrl : dataUrl;
		$.ajax({
			type: 'GET',
			url: url,
			headers: {
				"Authorization": 'Bearer ' + api.token
			},
			complete: function (jqXHR, status) {
				let response = jqXHR.responseJSON;
				if(status !== 'success' || (typeof response.data == 'undefined') || (typeof response.meta == 'undefined')) {
					handleError();
				}
				handleResponse(response);
			}
		});
	};

	fetchData();
});