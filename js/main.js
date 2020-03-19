import { Signal } from './Signal.js'
import { Channel } from './Channel.js'

const MILLISECONDS_PER_DAY = 86400000;
const MILLISECONDS_PER_HOUR = 3600000;
const MILLISECONDS_PER_MINUTE = 60000;
const MILLISECONDS_PER_SECOND = 1000;
const COLORS_COUNT = 16777215;

let chartsCount = 0;
let signals = [];
let signalsCount = 0;

function showAboutProgramInfo() {
	alert('DSP - программа для анализа сигналов')
}

function showAboutAuthorInfo() {
	alert('Мышалов Родион Б8118-02.03.01сцт 1 подгруппа')
}

function getExtension(filename) {
	let parts = filename.split('.');
	return parts[parts.length - 1];
}

function getName(filename) {
	let parts = filename.split('.');
	return parts[0];
}

function getValidSignalId(id) {
	let parts = id.split('-');
	return parts[0];
}

function parseDateTime(date) {
	const dateElements = date.split(/\D/);
	return new Date(dateElements[0], dateElements[1] - 1, dateElements[2], dateElements[3], dateElements[4], dateElements[5]);
}

function getRandomColor() {
	return `#${Math.floor(Math.random() * COLORS_COUNT).toString(16)}`;
}

function parseTxtFile(signalName, event) {
	const fileData = event.target.result.split('\n').filter(line => line[0] != '#');
	const startDate = fileData[3].replace(/(\d{2})-(\d{2})-(\d{4})/, "$3-$2-$1");
	const startTime = fileData[4];
	const date = `${startDate} ${startTime}`;
	const unixtime = parseDateTime(date).getTime();
	let signal = new Signal(signalName, parseInt(fileData[0]), parseInt(fileData[1]), parseFloat(fileData[2]), unixtime);
	fileData[5].split(';').forEach(channelName => {
		if (channelName == "") {
			return;
		}
		signal.channels.push(new Channel(channelName));
	});
	for (let lineIndex = 6; lineIndex < fileData.length; lineIndex++) {
		if (fileData[lineIndex] == '') {
			break;
		}
		for (let channelIndex = 0; channelIndex < signal.channelsCount; channelIndex++) {
			const data = fileData[lineIndex].split(' ');
			signal.channels[channelIndex].values.push(parseFloat(data[channelIndex]));
		}
	}
	return signal;
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

$('#file-input').change(function (event) {
	const file = event.target.files[0];
	if (!file) {
		return;
	}
	let reader = new FileReader();
	switch (getExtension(file.name)) {
		case 'txt':
			reader.readAsText(file, 'UTF-8');
			reader.onload = function (event) {
				signals.push(parseTxtFile(file.name, event));
				let signalId = `signal${signalsCount}`;
				signals[signals.length - 1].id = signalId;
				$('#signal-navigation-menu').append(`
                    <li class="container-fluid d-flex justify-content-center signal"> 
                        <div class="container-fluid цbtn-group dropleft">
                            <button type="button" class="container-fluid btn btn-info dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                ${file.name}
                            </button>
                            <div class="dropdown-menu channels-menu" id="${signalId}">
                            </div>
                        </div>
                    </li>
                `);
				if ($('#signal-navigation-menu').css('display') == 'none') {
					$('#signal-navigation-menu').css('display', 'block');
				}
				signals[signals.length - 1].channels.forEach((channel) => {
					const chartId = `chart${chartsCount}`;
					$(`#${signalId}`).append(`<button class="dropdown-item channel-btn" type="button" id="${chartId}">${channel.name}</button>`);
					$('article').append(`
                        <div class="chartContainer" id="${chartId}-container">
                        </div>
                    `);
					channel.chart =
					{
						plot: new CanvasJS.Chart(`${chartId}-container`, {
							width: 520,
							height: 325,
							animationEnabled: true,
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
							data: getChartData(channel, signals[signals.length - 1].period),
						}),
						id: chartId
					}
					chartsCount++;
				});
				$('#signals-info-menu').append(`
                    <button class="signal-info-btn btn dropdown-item" style="white-space:normal;" id="${signalId}-info">
                        ${signals[signals.length - 1].name}
                    </button>
                `);
			}
			signalsCount++;
	};
})

$(document).on('click', '.channel-btn', function () {
	const signalId = $(this).parent().attr('id');
	const chartId = this.id;
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
})

function getValidDate(date) {
	const year = date.getFullYear();
	let month = date.getMonth() + 1;
	Math.floor(month / 10) == 0 ? month = `0${month}` : month;
	let day = date.getDate();
	Math.floor(day / 10) == 0 ? day = `0${day}` : day;
	let hours = date.getHours();
	Math.floor(hours / 10) == 0 ? hours = `0${hours}` : hours;
	let minutes = date.getMinutes();
	Math.floor(minutes / 10) == 0 ? minutes = `0${minutes}` : minutes;
	let seconds = + date.getSeconds();
	Math.floor(seconds / 10) == 0 ? seconds = `0${seconds}` : seconds;
	const milliseconds = + date.getMilliseconds();

	return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}.${milliseconds}`;
}

function getDatesDifference(unixtime) {
	const days = Math.floor(unixtime / MILLISECONDS_PER_DAY);
	unixtime -= days * MILLISECONDS_PER_DAY;
	const hours = Math.floor(unixtime / MILLISECONDS_PER_HOUR);
	unixtime -= hours * MILLISECONDS_PER_HOUR;
	const minutes = Math.floor(unixtime / MILLISECONDS_PER_MINUTE);
	unixtime -= minutes * MILLISECONDS_PER_MINUTE;
	const seconds = Math.floor(unixtime / MILLISECONDS_PER_SECOND);
	unixtime -= seconds * MILLISECONDS_PER_SECOND;
	const milliseconds = unixtime - seconds;

	return `${days} дней ${hours} часов ${minutes} минут ${seconds} секунд ${milliseconds} миллисекунд`;
}

$('#signals-info-menu').on('click', '.signal-info-btn', function () {
	const restoredId = getValidSignalId(this.id);
	const restoredSignal = signals.find((signal) => {
		return restoredId == signal.id;
	});
	const name = restoredSignal.name;
	const channelsCount = restoredSignal.channelsCount;
	const pointsCount = restoredSignal.measuresCount;
	const frequency = restoredSignal.frequency;
	const period = 1 / frequency;
	const recordedAt = restoredSignal.recordingTime;
	const startDate = new Date(recordedAt);
	const endDate = new Date(recordedAt + pointsCount * period);
	const duration = getDatesDifference(endDate.getTime() - startDate.getTime());

	$('.modal-title').text(`Информация о сигнале ${name}`);
	$('.modal-body').html(`
        Общее число каналов: ${channelsCount} <br>
        Общее количество отсчетов: ${pointsCount} <br>
        Частота дискретизации: ${frequency} Гц (шаг между отсчетами ${period} сек <br>
        Дата и время начала записи: ${getValidDate(startDate)} <br>
        Дата и время окончания записи: ${getValidDate(endDate)} <br>
        Длительность: ${duration} <br>
    `);
	$('.modal-body').append(`
        <table class="table table-bordered">
            <thead>
                <tr>
                    <th scope="col">
                    №
                    </th>
                    <th scope="col">
                    Имя
                    </th>
                    <th scope="col">
                    Источник
                    </th>
                </tr>
            </thead>
            <tbody id="channels-table">
            </tbody>
        </table>
    `);

	restoredSignal.channels.forEach((channel, index) => {
		$('#channels-table').append(`
            <tr>
                <th scope="row">
                    ${index + 1}
                </th>
                <td>
                    ${channel.name}
                </td>
                <td>
                    ${restoredSignal.name}
                </td>
            </tr>
        `);
	})

	$('#signal-info-modal').modal();
})

$('#open-file-btn').click(function () {
	document.getElementById('file-input').click();
})