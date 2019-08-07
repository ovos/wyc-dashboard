import ApexCharts from 'apexcharts';

export let site = {
	init: function (data) {
		const step_length = 0.65;
		let count = 0,
			playertype_wenig = 0,
			playertype_mittel = 0,
			playertype_viel = 0,
			step_goal_1_reached = 0,
			step_goal_2_reached = 0,
			step_goal_3_reached = 0,
			enjoys_walking_count = 0,
			checkins_total = 0,
			steps_total = 0,
			steps_daily_avg = 0,
			steps_best_day = 0;

		for (let i = 0; i < data.length; i++) {
			if (data[i]["app_starts"] < 1 || !data[i]["playertype"]) {
				continue;
			}
			playertype_wenig += data[i]["playertype"] === 1 ? 1 : 0;
			playertype_mittel += data[i]["playertype"] === 2 ? 1 : 0;
			playertype_viel += data[i]["playertype"] === 3 ? 1 : 0;
			step_goal_1_reached += parseInt(data[i]["step_goal_1_reached"]);
			step_goal_2_reached += parseInt(data[i]["step_goal_2_reached"]);
			step_goal_3_reached += parseInt(data[i]["step_goal_3_reached"]);
			enjoys_walking_count += data[i]["enjoys_walking"] ? 1 : 0;
			steps_total += parseInt(data[i]["steps_total"]);
			checkins_total += parseInt(data[i]["checkins_total"]);
			steps_daily_avg += parseInt(data[i]["steps_daily_avg"]);
			steps_best_day += parseInt(data[i]["steps_best_day"]);
			count++;
		}

		let steps_avg = Math.round((steps_total / count));
		let checkins_avg = Number.parseFloat(Number.parseFloat(checkins_total / count).toPrecision(2));
		steps_daily_avg = Math.round((steps_daily_avg / count));
		steps_best_day = Math.round((steps_best_day / count));

		const filteredData = {
			count: count,
			playertype_wenig: playertype_wenig,
			playertype_mittel: playertype_mittel,
			playertype_viel: playertype_viel,
			step_goal_1_reached: step_goal_1_reached,
			step_goal_2_reached: step_goal_2_reached,
			step_goal_3_reached: step_goal_3_reached,
			enjoys_walking_count: enjoys_walking_count,
			checkins_total: checkins_total,
			checkins_avg: checkins_avg,
			steps_total: steps_total,
			steps_avg: steps_avg,
			steps_daily_avg: steps_daily_avg,
			steps_best_day: steps_best_day
		};

		const comparisonData = {
			moonDistance: {
				name: "Distanz: Erde-Mond",
				value: 384400000
			},
			earthCircumfence: {
				name: "Erdumfang",
				value: 40075000
			},
			transsiberiaRailway: {
				name: 'Transsibirische Eisenbahn',
				value: 9298000
			},
			jakobsPath: {
				name: "Jakobsweg (Camino Francés)",
				value: 800000,
			},
			austriaWidth: {
				name: "Österreichs Grenzen: Ost-West",
				value: 575000
			},
			austriaHeight: {
				name: "Österreichs Grenzen: Nord-Süd",
				value: 292370
			},
			grazVienna: {
				name: "Luftlinie: Graz-Wien",
				value: 144860
			}
		};
		const grazViennaProgress = Math.round((filteredData.steps_total * step_length / comparisonData.grazVienna.value) * 100);
		const austriaHeightProgress = Math.round((filteredData.steps_total * step_length / comparisonData.austriaHeight.value) * 100);
		const austriaWidthProgress = Math.round((filteredData.steps_total * step_length / comparisonData.austriaWidth.value) * 100);
		const jakobsPathProgress = Math.round((filteredData.steps_total * step_length / comparisonData.jakobsPath.value) * 100);
		const transsiberiaRailwayProgress = Math.round((filteredData.steps_total * step_length / comparisonData.transsiberiaRailway.value) * 100);
		const earthCircumfenceProgress = Math.round((filteredData.steps_total * step_length / comparisonData.earthCircumfence.value) * 100);
		const moonDistanceProgress = Math.round((filteredData.steps_total * step_length / comparisonData.moonDistance.value) * 100);

		// charts
		let distanceCircleOptions = {
			chart: {
				height: 400,
				type: 'radialBar',
			},
			colors: ['rgba(200,107,107,1)', 'rgba(175,116,207,1)', 'rgba(94,173,186,1)', 'rgba(194,227,123,1)', 'rgba(237,177,100,1)'],
			plotOptions: {
				radialBar: {
					hollow: {
						size: '15%',
						background: 'transparent',
					},
					track: {
						show: true,
						background: '#40475d',
						strokeWidth: '10%',
						opacity: 0.5,
						margin: 3,
					},
				}
			},
			series: [moonDistanceProgress, earthCircumfenceProgress, transsiberiaRailwayProgress, jakobsPathProgress, grazViennaProgress],
			labels: [comparisonData.moonDistance.name, comparisonData.earthCircumfence.name, comparisonData.transsiberiaRailway.name, comparisonData.jakobsPath.name, comparisonData.grazVienna.name],
			legend: {
				show: true,
				position: 'bottom',
				fontSize: '20px',
				offsetX: 0,
				offsetY: 20,
				formatter: function (val, opts) {
					return val + " - " + opts.w.globals.series[opts.seriesIndex] + '%'
				},
				floating: false,
			},
			title: {
				text: `Zurückgelegte Distanz aller SpielerInnen: ${Math.round(filteredData.steps_total * step_length / 1000).toLocaleString('de-DE')} km`,
				align: 'center',
				margin: 10,
				offsetX: 0,
				offsetY: 20,
				floating: false,
				style: {
					fontSize: '20px',
					color: '#000000'
				},
			}
		}
		let distanceCircleChart = new ApexCharts(
			$("#distance-circle .chart-content").get(0),
			distanceCircleOptions
		);
		let playerTypePieOptions = {
			chart: {
				width: '90%',
				type: 'pie',
			},
			colors: ['rgba(237,177,100,1)', 'rgba(94,173,186,1)', 'rgba(194,227,123,1)', 'rgba(175,116,207,1)', 'rgba(200,107,107,1)'],
			dataLabels: {
				enabled: true,
				formatter: function (val, opts) {
					return opts.w.globals.seriesNames[opts.seriesIndex]
				},
				style: {
					fontSize: '20px',
					colors: ['rgba(0,0,0,1)']
				},
				dropShadow: {
					enabled: false
				}
			},
			series: [filteredData.playertype_wenig, filteredData.playertype_mittel, filteredData.playertype_viel],
			labels: ['Wenig', 'Durchschnittlich', 'Viel'],
			legend: {
				show: true,
				position: 'bottom',
				fontSize: '20px',
				offsetX: 0,
				offsetY: 0,
				formatter: function (val, opts) {
					return opts.w.globals.series[opts.seriesIndex] + '% (' + val + ')'
				},
				floating: false,
			},
			title: {
				text: "SpielerInnen nach Fußgehertypen",
				align: 'center',
				margin: 40,
				offsetX: 0,
				offsetY: 20,
				floating: false,
				style: {
					fontSize: '20px',
					color: '#000'
				},
			}
		}
		let playerTypePieChart = new ApexCharts(
			$("#playertype-pie .chart-content").get(0),
			playerTypePieOptions
		);
		let enjoysWalkingPieOptions = {
			chart: {
				width: '90%',
				type: 'pie',
			},
			colors: ['rgba(200,107,107,1)', 'rgba(194,227,123,1)'],
			dataLabels: {
				enabled: true,
				formatter: function (val, opts) {
					return opts.w.globals.seriesNames[opts.seriesIndex]
				},
				style: {
					fontSize: '20px',
					colors: ['rgba(0,0,0,1)']
				},
				dropShadow: {
					enabled: false
				}
			},
			series: [(count - filteredData.enjoys_walking_count), filteredData.enjoys_walking_count],
			labels: ['Nein', 'Ja'],
			legend: {
				show: true,
				position: 'bottom',
				fontSize: '20px',
				offsetX: 0,
				offsetY: 0,
				formatter: function (val, opts) {
					return opts.w.globals.series[opts.seriesIndex] + '% (' + val + ')'
				},
				floating: false,
			},
			title: {
				text: "Gehen unsere SpielerInnen gerne zu Fuß?",
				align: 'center',
				margin: 40,
				offsetX: 0,
				offsetY: 20,
				floating: false,
				style: {
					fontSize: '20px',
					color: '#000000'
				},
			}
		}
		let enjoysWalkingPieChart = new ApexCharts(
			$("#enjoys-walking-pie .chart-content").get(0),
			enjoysWalkingPieOptions
		);
		let barColors = ['rgba(237,177,100,1)', 'rgba(94,173,186,1)', 'rgba(175,116,207,1)'];
		let stepGoalsBarsOptions = {
			chart: {
				width: '100%',
				height: 450,
				type: 'bar',
				toolbar: {
					show: false
				}
			},
			colors: barColors,
			plotOptions: {
				bar: {
					columnWidth: '45%',
					distributed: true
				}
			},
			dataLabels: {
				enabled: false,
			},
			series: [{
				name: "Ziel erreicht",
				data: [filteredData.step_goal_1_reached, filteredData.step_goal_2_reached, filteredData.step_goal_3_reached]
			}],
			xaxis: {
				categories: ['Ziel 1', 'Ziel 2', 'Ziel 3'],
				labels: {
					style: {
						fontSize: '20px'
					}
				}
			},
			yaxis: {
				labels: {
					style: {
						fontSize: '18px',
					}
				},
				title: {
					text: undefined,
					rotate: 90,
					offsetX: 0,
					offsetY: 0,
					style: {
						color: '#000000',
						fontSize: '16px',
					},
				},
			},
			title: {
				text: "Erreichte Schritt-Tagesziele*",
				align: 'center',
				margin: 40,
				offsetX: 0,
				offsetY: 20,
				floating: false,
				style: {
					fontSize: '20px',
					color: '#000'
				},
			},
			subtitle: {
				text: "*individuell nach Fußgehertyp",
				align: 'center',
				margin: 0,
				offsetX: 0,
				offsetY: 50,
				floating: false,
				style: {
					fontSize: '16px',
					color: '#000'
				},
			}
		}
		let stepGoalsBarsChart = new ApexCharts(
			$("#step-goals-bars .chart-content").get(0),
			stepGoalsBarsOptions
		);
		distanceCircleChart.render();
		playerTypePieChart.render();
		enjoysWalkingPieChart.render();
		stepGoalsBarsChart.render();

		// stats
		let $userCountValue = $('#user-count-value');
		$userCountValue.html(`${count}`);
		let $legendStepLengthValue = $('#step-length-value');
		$legendStepLengthValue.html(`${(step_length * 1000).toLocaleString('de-DE')} cm`);

		let $stepsTotal = $('#steps-total');
		$('.value', $stepsTotal).html(filteredData.steps_total.toLocaleString('de-DE'));
		$('.value-meter', $stepsTotal).html(`ca. ${Math.round(filteredData.steps_total * step_length / 1000).toLocaleString('de-DE')} km`);

		let $stepsAvg = $('#steps-avg');
		$('.value', $stepsAvg).html(filteredData.steps_avg.toLocaleString('de-DE'));
		$('.value-meter', $stepsAvg).html(`ca. ${Math.round(filteredData.steps_avg * step_length / 1000).toLocaleString('de-DE')} km`);

		let $stepsDailyAvg = $('#steps-daily-avg');
		$('.value', $stepsDailyAvg).html(filteredData.steps_daily_avg.toLocaleString('de-DE'));
		$('.value-meter', $stepsDailyAvg).html(`ca. ${Number.parseFloat(Number.parseFloat(filteredData.steps_daily_avg * step_length / 1000).toPrecision(2)).toLocaleString('de-DE')} km`);

		let $stepsBestDay = $('#steps-best-day');
		$('.value', $stepsBestDay).html(filteredData.steps_best_day.toLocaleString('de-DE'));
		$('.value-meter', $stepsBestDay).html(`ca. ${Number.parseFloat(Number.parseFloat(filteredData.steps_best_day * step_length / 1000).toPrecision(2)).toLocaleString('de-DE')} km`);

		let $checkinsTotal = $('#checkins-total');
		$('.value', $checkinsTotal).html(filteredData.checkins_total.toLocaleString('de-DE'));

		let $checkinsAvg = $('#checkins-avg');
		$('.value', $checkinsAvg).html(filteredData.checkins_avg.toLocaleString('de-DE'));
	}
};