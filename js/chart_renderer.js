const COLORS_COUNT = 16777215;

let chartsCount = 0;
let signalsCount = 0;

export function showCharts(signals, element) {
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
		const chartData = getChartData(channel, signal.period, 1);
		const chartId = `chart${chartsCount}`;
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
				valueFormatString: " "
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
				title: {
					text: channel.name,
				},
				axisY: {
					includeZero: true,
				},
				axisX: {
					includeZero: true,
				},
				data: chartData,
			}),
			id: chartId
		}
		chartsCount++;
	});
	$('#signals-info-menu').append(`
    <button class="signal-info-btn btn dropdown-item" style="white-space:normal;" id="${signalId}-info">
			${signal.name}
    </button>
  `);
    signalsCount++;
}

function getChartData(channel, period) {
	let data = [];
	let dataPoints = [];
	let step = 0;
	for (let i = 0; i < channel.values.length; i += 1) {
		dataPoints.push({
			x: step,
			y: channel.values[i],
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