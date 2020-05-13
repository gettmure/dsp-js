import { getRandomColor } from '../main.js';

export class Channel {
	name;
	values = [];
	chart;
	id;

	#showChart;
	#getChartData;
	#getMinMax;
	#syncHandler;
	#scrollHandler;

	constructor(name, id) {
		this.name = name;
		this.id = id;

		this.#syncHandler = function (e, channels) {
			channels.forEach((channel) => {
				const chart = channel.chart;
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

		this.#getChartData = function (period, startTime) {
			let data = [];
			let dataPoints = [];
			let step = startTime;
			for (let i = 0; i < this.values.length; i += 1) {
				dataPoints.push({
					x: new Date(step),
					y: this.values[i],
				});
				step += period;
			}
			let dataSeries = { type: 'line', color: getRandomColor() };
			dataSeries.dataPoints = dataPoints;
			data.push(dataSeries);
			return data;
		}

		this.#getMinMax = function (array) {
			let min = array[0], max = array[0];
			for (let i = 1; i < array.length; i++) {
				min = (array[i] < min) ? array[i] : min;
				max = (array[i] > max) ? array[i] : max;
			}
			return [min, max];
		}

		this.#scrollHandler = function (e, signal, range) {
			const classSelector = `.${signal.id}-slider`;
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
						min: signal.recordingTime,
						max: signal.endTime - range,
						value: currentLeftValue,
						slide: function (e, ui) {
							const leftLimit = ui.value;
							const rightLimit = leftLimit + range;
							if (rightLimit > signal.endTime) {
								return;
							};
							signal.channels.forEach((channel) => {
								const currentAsixX = channel.chart.axisX[0];
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
	}

	renderChart(signal) {
		const chartData = this.#getChartData(signal.period, signal.recordingTime);
		const CHANNEL_BUTTON_HTML = `<button class="dropdown-item channel-btn" type="button" id="${this.id}">${this.name}</button>`;
		const [minimalPoint, maximalPoint] = this.#getMinMax(this.values);

		$(`#${signal.id}`).append(CHANNEL_BUTTON_HTML);
		let chartDemo = new CanvasJS.Chart(`${this.id}`, {
			width: 200,
			height: 100,
			interactivityEnabled: false,
			title: {
				text: this.name,
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
		$('article').append(`<div class="chartContainer mb-2" id="${this.id}-container"></div>`);
		this.chart =
			new CanvasJS.Chart(`${this.id}-container`, {
				width: 520,
				height: 325,
				animationEnabled: false,
				zoomEnabled: true,
				zoomType: 'x',
				rangeChanging: (e) => {
					const axisX = this.chart.axisX[0];
					const range = axisX.get('viewportMaximum') - axisX.get('viewportMinimum');
					this.#scrollHandler(e, signal, range);
				},
				rangeChanged: (e) => {
					this.#syncHandler(e, signal.channels);
				},
				title: {
					text: signal.name,
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
			})
		$(`#${this.id}-container > .canvasjs-chart-container`).after(`<div class="${signal.id}-slider" id="${this.id}-slider"></div>`);
	}

	showChart() {
		this.chart.render();
		$(`#${this.id}-container`).css({
			'display': 'block',
			'background-color': getRandomColor(),
		});
	}
}