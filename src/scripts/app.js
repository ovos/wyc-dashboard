import jQuery from 'jquery/dist/jquery.slim.js';
window.$ = window.jQuery = jQuery;
import {data} from './data.js';
import {site} from './site.js';

$(function () {
	site.init(data);
});