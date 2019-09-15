export const api = {
	token: 'HLYC7Vt!%zKy&nFN5XVJwgtgx!jF5#t2#bF+',
	baseUrl: 'https://data-time2walk.ovos.at/_/items/',
	endpoint: 'user',
	fields: [
		'steps_total',
		'steps_daily_avg',
		'steps_best_day',
		'checkins_total',
		'walk_minutes_per_day',
		'enjoys_walking',
		'playertype',
		'step_goal_1_reached',
		'step_goal_2_reached',
		'step_goal_3_reached'
	],
	filters: [
		'filter[created_on][gt]=2019-09-15'
	]
};