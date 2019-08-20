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
		'?fields=' + api.fields.join(',') +
		'&' + api.filters.join('&');

	let handleError = function() {
		site.toggleApiError(true);

		setTimeout(function (){
			site.toggleApiError(false);
			fetchData();
		}, 14400000); // 1000 milliseconds * 60 seconds * 60 minutes * 4 hours
	};
	let handleSuccess = function(data) {
		site.init(data, options);
		site.toggleLoading(false);

		setTimeout(function (){
			fetchData();
		}, 14400000); // 1000 milliseconds * 60 seconds * 60 minutes * 4 hours
	};

	let fetchData = function (){
		site.toggleLoading(true);
		$.ajax({
			type: 'GET',
			url: dataUrl,
			headers: {
				"Authorization": 'Bearer ' + api.token
			},
			complete: function (jqXHR, status) {
				if(status !== 'success') {
					handleError();
				}
				let response = jqXHR.responseJSON;
				handleSuccess(response.data);
			}
		});
	};

	fetchData();
});