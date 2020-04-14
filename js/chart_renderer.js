const COLORS_COUNT = 16777215;

let chartsCount = 0;
let signalsCount = 0;

export function renderChart(signals, element) {
	const signalId = $(element).parent().attr('id');
	const chartId = element.id;
	const signal = signals.find((signal) => {
		return signalId == signal.id;
	});
	const chart = signal.channels.find((channel) => {
		return chartId == channel.chart.id;
	}).chart;
	chart.plot.render();
	$(`#${chart.id}-container`).css({
		'display': 'block',
		'background-color': getRandomColor(),
	});
}

export function createCharts(fileName, signal) {
	let signalId = `signal${signalsCount}`;
	signal.id = signalId;
	$('#signal-navigation-menu').append(`
  	<li class="container-fluid d-flex justify-content-center signal"> 
      <div class="container-fluid цbtn-group dropleft">
    	  <button type="button" class="container-fluid btn btn-info dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
      	  ${fileName}
        </button>
      	<div class="dropdown-menu channels-menu" id="${signalId}">
        </div>
      </div>
    </li>
  `);
	if ($('#signal-navigation-menu').css('display') == 'none') {
		$('#signal-navigation-menu').css('display', 'block');
	}
	signal.channels.forEach((channel) => {
		const chartData = getChartData(channel.values, signal.period, signal.recordingTime);
		const chartId = `chart${chartsCount}`;
		const [minimalPoint, maximalPoint] = getMinMax(channel.values);
		$(`#${signalId}`).append(`<button class="dropdown-item channel-btn" type="button" id="${chartId}">${channel.name}</button>`);
		let chartDemo = new CanvasJS.Chart(`${chartId}`, {
			width: 200,
			height: 100,
			interactivityEnabled: false,
			title: {
				text: channel.name,
			},
			axisY: {
				title: "",
				valueFormatString: " ",
				minimum: minimalPoint,
				maximum: maximalPoint
			},
			axisX: {
				title: "",
				valueFormatString: " "
			},
			data: chartData,
		})
		$('.channel-btn > div > .canvasjs-chart-canvas + .canvasjs-chart-canvas').css('position', '');
		chartDemo.render();
		$('article').append(`
	  <div class="chartContainer mb-2" id="${chartId}-container">
      </div>
	`);
		channel.chart =
		{
			plot: new CanvasJS.Chart(`${chartId}-container`, {
				width: 520,
				height: 325,
				animationEnabled: false,
				zoomEnabled: true,
				zoomType: "x",
				rangeChanged: (e) => {
					const chart = e;
					scrollHandler(chart, signal.id, signal.channels, chartId, signal.recordingTime, signal.endTime, channel.chart);
					if (e.trigger == 'zoom' || e.trigger == 'reset') {
						syncHandler(e, signal.channels);
					}
				},
				title: {
					text: channel.name,
				},
				axisY: {
					includeZero: true,
					minimum: minimalPoint,
					maximum: maximalPoint
				},
				axisX: {
					includeZero: true,
				},
				data: chartData,
			}),
			id: chartId
		}
		chartsCount++;
		$(`#${chartId}-container`).append(`<div class="${signal.id}-slider" id="${chartId}-slider"></div>`);
	});
	$('#signals-info-menu').append(`
    <button class="signal-info-btn btn dropdown-item" style="white-space:normal;" id="${signalId}-info">
			${signal.name}
    </button>
  `);
	signalsCount++;
}

$('.ui-slider-handle').mousedown(() => {
	console.log(1)
})

function scrollHandler(e, signalId, channels, chartId, recordingTime, endTime, chart) {
	const idSelector = `#${chartId}-slider`;
	let axisX = chart.plot.axisX[0]
	const classSelector = `.${signalId}-slider`;
	const trigger = e.trigger;
	const sliderValue = e.axisX[0].viewportMinimum;
	let validChart;
	$(function () {
		if (trigger == 'reset') {
			if ($(classSelector).slider()) {
				$(classSelector).slider('destroy');
			}
			axisX.set('viewportMinimum', null);
			axisX.set('viewportMaximum', null);
		}
		if (trigger == 'zoom') {
			$(classSelector, $(this)).slider({
				min: recordingTime,
				max: endTime,
				value: sliderValue,
				start: function(e, ui) {
					const scrollId = this.id.split('-')[0];
					const plot = channels.find((channel) => {
						return channel.chart.id == scrollId;
					})
					validChart = plot.chart;
				},
				slide: function (e, ui) {
					const dif = axisX.get('viewportMaximum') - axisX.get('viewportMinimum');
					const start = ui.value;
					const end = start + dif;
					validChart.plot.axisX[0].set('viewportMinimum', start)
					validChart.plot.axisX[0].set('viewportMaximum', end);
				}
			});
		}
	});
}

function syncHandler(e, channels) {
	channels.forEach((channel) => {
		const chart = channel.chart.plot;
		const options = chart.options;
		if (!options.axisX) {
			options.axisX = {};
		}
		if (!options.axisY) {
			options.axisY = {};
		}
		if (e.trigger === "reset") {
			options.axisX.viewportMinimum = options.axisX.viewportMaximum = null;
			options.axisY.viewportMinimum = options.axisY.viewportMaximum = null;
			chart.render();
		} else {
			if (chart !== e.chart) {
				options.axisX.viewportMinimum = e.axisX[0].viewportMinimum;
				options.axisX.viewportMaximum = e.axisX[0].viewportMaximum;
				options.axisY.viewportMinimum = e.axisY[0].viewportMinimum;
				options.axisY.viewportMaximum = e.axisY[0].viewportMaximum;
				chart.render();
			}
		}
	})
}

function getChartData(channelData, period, startTime) {
	let data = [];
	let dataPoints = [];
	let step = startTime;
	for (let i = 0; i < channelData.length; i += 1) {
		dataPoints.push({
			x: new Date(step),
			y: channelData[i],
		});
		step += period;
	}
	let dataSeries = { type: 'line', color: getRandomColor() };
	dataSeries.dataPoints = dataPoints;
	data.push(dataSeries);
	return data;
}

function getRandomColor() {
	return `#${Math.floor(Math.random() * COLORS_COUNT).toString(16)}`;
}

function getMinMax(array) {
	let min = array[0], max = array[0];
	for (let i = 1; i < array.length; i++) {
		min = (array[i] < min) ? array[i] : min;
		max = (array[i] > max) ? array[i] : max;
	}
	return [min, max];
}