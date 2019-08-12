import jQuery from 'jquery';
window.$ = window.jQuery = jQuery;
// import {data} from './data.js';
import {site} from './site.js';
import {api} from './api.js';

$(function () {

	let dataUrl = api.baseUrl + api.endpoint + '?fields=' + api.fields.join(',');

	let handleError = function() {
		site.toggleApiError(true);

		setTimeout(function (){
			site.toggleApiError(false);
			fetchData();
		}, 3600000);
	};
	let handleSuccess = function(data) {
		site.init(data);
		site.toggleLoading(false);

		setTimeout(function (){
			fetchData();
		}, /*3600000*/ 10000);
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
				console.log(jqXHR, status);
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