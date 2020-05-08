const COLORS_COUNT = 16777215;

let chartsCount = 0;
let signalsCount = 0;
let dataSeriesArray = {};

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
    </li>`);
	if ($('#signal-navigation-menu').css('display') == 'none') {
		$('#signal-navigation-menu').css('display', 'block');
	}
	signal.channels.forEach((channel) => {
		const chartData = getChartData(channel.values, signal.period, signal.recordingTime);
		const chartId = `chart${chartsCount}`;
		dataSeriesArray[chartId] = chartData[0].dataPoints;
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
		$('article').append(`<div class="chartContainer mb-2" id="${chartId}-container"></div>`);
		channel.chart =
		{
			plot: new CanvasJS.Chart(`${chartId}-container`, {
				width: 520,
				height: 325,
				animationEnabled: false,
				zoomEnabled: true,
				zoomType: 'x',
				rangeChanging: (e) => {
					const axisX = channel.chart.plot.axisX[0];
					const range = axisX.get('viewportMaximum') - axisX.get('viewportMinimum');
					scrollHandler(e, signal.id, signal.channels, signal.recordingTime, signal.endTime, range);
				},
				rangeChanged: (e) => {
					syncHandler(e, signal.channels);
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
		$(`#${chartId}-container > .canvasjs-chart-container`).after(`<div class="${signal.id}-slider" id="${chartId}-slider"></div>`);
	});
	$('#signals-info-menu').append(`<button class="signal-info-btn btn dropdown-item" style="white-space:normal;" id="${signalId}-info">${signal.name}</button>`);
	signalsCount++;
}

function scrollHandler(e, signalId, channels, recordingTime, endTime, range) {
	const classSelector = `.${signalId}-slider`;
	const trigger = e.trigger;
	const currentLeftValue = e.axisX[0].viewportMinimum;
	$(function () {
		if (trigger == 'reset') {
			if ($(classSelector).slider()) {
				$(classSelector).slider('destroy');
			}
		}
		if (trigger == 'zoom' || trigger == 'pan') {
			$(classSelector).slider({
				min: recordingTime,
				max: endTime - range,
				value: currentLeftValue,
				slide: function (e, ui) {
					const leftLimit = ui.value;
					const rightLimit = leftLimit + range;
					if (rightLimit > endTime) {
						return;
					};
					channels.forEach((channel) => {
						const currentAsixX = channel.chart.plot.axisX[0];
						currentAsixX.set('viewportMinimum', leftLimit, false)
						currentAsixX.set('viewportMaximum', rightLimit);
					})
					$(classSelector).each(function () {
						$(this).slider('option', 'value', leftLimit);
					})
				}
			})
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