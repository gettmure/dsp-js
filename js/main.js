import { showSignalInfo } from './info_modal.js';
import { parseTxtFile } from './parser.js';
import { Signal } from './entities/Signal.js';

let signals = [];
let isOpened = false;

$('#open-file-btn').click(function () {
	document.getElementById('file-input').click();
})

$('#about-btn').click(function () {
	alert('DSP - программа для анализа сигналов');
})

$('#author-btn').click(function () {
	alert('Мышалов Родион Б8118-02.03.01сцт 1 подгруппа');
})

export function getRandomColor() {
	const COLORS_COUNT = 16777215;
	return `#${Math.floor(Math.random() * COLORS_COUNT).toString(16)}`;
}

function getExtension(filename) {
	let parts = filename.split('.');
	return parts[parts.length - 1];
}

function getName(filename) {
	let parts = filename.split('.');
	return parts[0];
}

function findElementById(elements, id) {
	return elements.find((element) => {
		return element.id == id;
	})
}

function readTxtFile(file) {
	const fileReader = new FileReader();
	return new Promise((resolve, reject) => {
		fileReader.onerror = () => {
			fileReader.abort();
			reject(new DOMException("Problem parsing input file."));
		};

		fileReader.onload = () => {
			resolve(fileReader.result);
		};
		fileReader.readAsText(file);
	});
}

async function getDataFromTxt(file) {
	try {
		const fileContent = await readTxtFile(file);
		const result = parseTxtFile(file.name, fileContent, signals.length);
		return result;
	} catch (e) {
		console.log(e);
	}
}
$('#file-input').change(async function (event) {
	const file = event.target.files[0];
	if (!file) {
		return;
	}
	if (signals.length == 0) {
		const SIGNALS_LIST_HTML = '<div class="form-group"><label for="signal-choice">Выберите сигнал</label><select class="form-control signal-choice" id="modelling-signal"></select></div>'
		$('#options-container').before(SIGNALS_LIST_HTML);
		$('#measures-count').remove();
		$('#frequency').remove();
	}

	switch (getExtension(file.name)) {
		case 'txt':
			const data = await getDataFromTxt(file);
			signals.push(data);
			break;
	};
	signals[signals.length - 1].renderChannels();
})

$(document).on('click change', '#save-file-btn, #save-signal', function () {
	const signalId = $('#save-signal').val();
	const signal = findElementById(signals, signalId);
	if (signal) {
		const getChannelCheckboxHtml = (channel) => {
			return `<div class="form-check">
							 <input class="form-check-input" type="checkbox" value="${channel.id}" id="${channel.name}-checkbox">
							 <label class="form-check-label" for="${channel.name}-checkbox">
								 ${channel.name}
							 </label>
						 </div>`
		}
		let channels = '';
		if (signal.channels.length != 0) {
			signal.channels.forEach((channel) => {
				channels += getChannelCheckboxHtml(channel)
			})
		}
		if (signal.models.length != 0) {
			signal.models.forEach((model) => {
				channels += getChannelCheckboxHtml(model);
			})
		}
		$('#channels-checkbox').html(channels);
	}
})

function getOutputData() {
	let channels = [];
	let valuesString = '';
	const signalId = $('#save-signal').val();
	const signal = findElementById(signals, signalId);
	const date = new Date(signal.recordingTime);
	const sources = Array.from(document.getElementsByClassName('form-check-input')).filter(checkbox => checkbox.checked).map(checkbox => ({
		id: checkbox.value,
		name: checkbox.id.split('-')[0]
	}));
	sources.forEach((sourceObject) => {
		const isModel = (sourceObject.id.match(/model/gm) != null);
		let source;
		if (isModel) {
			source = findElementById(signal.models, sourceObject.id)
		}
		else {
			source = findElementById(signal.channels, sourceObject.id)
		}
		channels.push(source);
	})
	for (let i = 0; i < signal.measuresCount; i++) {
		for (let j = 0; j < channels.length; j++) {
			valuesString += `${channels[j].values[i]} `;
		}
		valuesString += '\n';
	}
	let data = `${signal.channelsCount}\n${signal.measuresCount}\n${signal.frequency}\n${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}\n${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}\n${sources.map(source => source.name).join(';')}\n${valuesString}`
	return data;
}

$(document).on('click', '#save-file', function () {
	const outputData = getOutputData();
	const fileName = $('#file-name').val();
	let anchor = document.createElement('a');
	const blob = new Blob([outputData], { type: 'text/plain' });
	anchor.download = fileName;
	anchor.href = (window.webkitURL || window.URL).createObjectURL(blob);
	anchor.dataset.downloadurl = ['text/plain', anchor.download, anchor.href].join(':');
	anchor.click();
})

$(document).on('click', '.channel-btn', function () {
	let channel;
	const clickedButton = this;
	const signalId = $(clickedButton).parent().attr('id');
	const chartId = $(clickedButton).attr('id');
	const isModel = (chartId.match(/model/gm) != null);
	const signal = findElementById(signals, signalId);
	if (isModel) {
		channel = signal.models.find((model) => { return model.id == chartId });
	}
	else {
		channel = signal.channels.find((channel) => { return channel.id == chartId });
	}
	channel.showChart();
})

$('#show-signal-navigation-menu-btn').click(function () {
	if (!isOpened) {
		$('.signal-navigation-menu-container').css('right', '0');
		$('#show-signal-navigation-menu-btn').html('&#62');
	} else {
		$('.signal-navigation-menu-container').css('right', '-15rem');
		$('#show-signal-navigation-menu-btn').html('&#60');
	}
	isOpened = !isOpened;
})

$(document).on('click', '.signal-info-btn', function () {
	const signalId = $(this).attr('id').split('-')[0];
	const signal = findElementById(signals, signalId);
	showSignalInfo(signal);
})

$(document).on('click', '.signal-btn', function () {
	const menuId = $(this).attr('id').split('-')[0];
	const menuSelector = `.channels-menu[id='${menuId}']`;
	$('#signal-navigation-menu').css('display', 'none');
	$(menuSelector).css('display', 'block');
	$('#return-btn').css('display', 'block');
})

$(document).on('click', '.channel-btn', function () {
	$('#show-signal-navigation-menu-btn').html('&#60');
	$('.signal-navigation-menu-container').css('right', '-15rem');
	$('#signal-navigation-menu').css('display', 'block');
	$('.channels-menu').css('display', 'none');
	$('#return-btn').css('display', 'none');
	isOpened = !isOpened;
})

$(document).on('click', '#return-btn', function () {
	$('.channels-menu').css('display', 'none');
	$('#signal-navigation-menu').css('display', 'block');
	$('#return-btn').css('display', 'none');
})

$(document).on('click', '.modelling-btn', function () {
	const ADDITIONAL_PARAMETERS_HTML = '<div class="form-group"><label for="measures-count">Количество отсчётов (N)</label><input class="parameter form-control" id="measures-count" placeholder="N"></div><div class="form-group"><label for="frequency">Частота (f)</label><input class="parameter form-control" id="frequency" placeholder="f"></div>'
	const buttonId = $(this).attr('id');
	let DEFAULT_PARAMETERS_HTML;
	switch (buttonId) {
		case 'determinated-signal-btn': {
			let defaultDelay;
			signals.length == 0 ? defaultDelay = 'N' : defaultDelay = signals[0].measuresCount;
			DEFAULT_PARAMETERS_HTML = `<label for="delay">Задержка импульса (N0): [1, ${defaultDelay}]</label><input class="parameter form-control" id="delay" placeholder="N0">`;
			const MODEL_TYPE_ITEMS_HTML = `
				<option value="Delayed single impulse">Задержанный единичный импульс</option>
				<option value="Delayed single bounce">Задержанный единичный скачок</option>
				<option value="Decreasing discretized exponent">Дискретизированная убывающая
					экспонента
				</option>
				<option value="Discretized sinusoid">Дискретизированная синусоида</option>
				<option value="Meander">"Меандр" (прямоугольная решетка)</option>
				<option value="Saw">“Пила"</option>`;
			$('#model-type').html(MODEL_TYPE_ITEMS_HTML);
			break;
		}
		case 'random-signal-btn': {
			let defaultCarrierFrequency;
			signals.length == 0 ? defaultCarrierFrequency = '0.5*f' : defaultCarrierFrequency = 0.5 * signals[0].frequency;
			DEFAULT_PARAMETERS_HTML = `
			<div class="form-group"><label for="amplitude">Амплитуда (a)</label><input value="1" class="parameter form-control" id="amplitude" placeholder="a"></div>
			<div class="form-group"><label for="envelope-width">Ширина огибающей (tao)</label><input value="1" class="parameter form-control" id="envelope-width" placeholder="tao"></div>
			<div class="form-group"><label for="carrier-frequency">Частота несущей (fн): fн -> [0, ${defaultCarrierFrequency}]</label><input class="parameter form-control" id="carrier-frequency" placeholder="fн"></div>
			<div class="form-group"><label for="initial-phase">Начальная фаза несущей (phi)</label><input value="0" class="parameter form-control" id="initial-phase" placeholder="phi"></div>`;
			const MODEL_TYPE_ITEMS_HTML = `
				<option value="Exponential envelope">Экспоненциальная огибающая</option>
				<option value="Balance envelope">Балансная огибающая</option>
				<option value="Tonal envelope">Тональная огибающая</option>
			`
			$('#model-type').html(MODEL_TYPE_ITEMS_HTML);
			break;
		}
	}
	if (signals.length == 0) {
		DEFAULT_PARAMETERS_HTML = ADDITIONAL_PARAMETERS_HTML + DEFAULT_PARAMETERS_HTML;
	}
	$('#parameters-container').html(DEFAULT_PARAMETERS_HTML);
})

$(document).on('change', '#model-type', function () {
	const signalId = $('#modelling-signal').val();
	const signal = findElementById(signals, signalId);
	const type = $(this).val();
	const parametersContainer = $('#parameters-container');
	let PARAMETERS_HTML;
	const ADDITIONAL_PARAMETERS_HTML = '<div class="form-group"><label for="measures-count">Количество отсчётов (N)</label><input class="parameter form-control" id="measures-count" placeholder="N"></div><div class="form-group"><label for="frequency">Частота (f)</label><input class="parameter form-control" id="frequency" placeholder="f"></div>'

	switch (type) {
		case 'Delayed single impulse': {
			let MAIN_PARAMETERS_HTML;
			if (signals.length == 0) {
				MAIN_PARAMETERS_HTML = `<label for="delay">Задержка импульса (N0): [1, N]</label><input class="parameter form-control" id="delay" placeholder="N0">`;
			}
			else {
				const DEFAULT_DELAY = signal.measuresCount / 2;
				MAIN_PARAMETERS_HTML = `<label for="delay">Задержка импульса (N0): [1, ${signal != undefined ? signal.measuresCount : "N"}]</label><input class="parameter form-control" id="delay" value=${DEFAULT_DELAY} placeholder="N0">`;
			}
			PARAMETERS_HTML = MAIN_PARAMETERS_HTML;
			break;
		}
		case 'Delayed single bounce': {
			let MAIN_PARAMETERS_HTML;
			if (signals.length == 0) {
				MAIN_PARAMETERS_HTML = `<label for="delay">Задержка скачка (N0): [1, N]</label><input class="parameter form-control" id="delay" placeholder="N0">`;
			}
			else {
				const DEFAULT_DELAY = signal.measuresCount / 2;
				MAIN_PARAMETERS_HTML = `<label for="delay">Задержка скачка (N0): [1, ${signal.measuresCount}]</label><input class="parameter form-control" id="delay" value=${DEFAULT_DELAY} placeholder="N0">`;
			}
			PARAMETERS_HTML = MAIN_PARAMETERS_HTML;
			break;
		}
		case 'Decreasing discretized exponent': {
			const DEFAULT_BASE = 0.5;
			const MAIN_PARAMETERS_HTML = `<label for="base">Основание степени (a): a -> (0, 1)</label><input value=${DEFAULT_BASE} class="parameter form-control" id="base" placeholder="a">`;
			PARAMETERS_HTML = MAIN_PARAMETERS_HTML;
			break;
		}
		case 'Discretized sinusoid': {
			const DEFAULT_AMPLITUDE = 1;
			const DEFAULT_CIRCULAR_FREQUENCY = 1.570796326;
			const DEFAULT_INITIAL_PHASE = 0;
			const MAIN_PARAMETERS_HTML = `
				<div class="form-group"><label for="amplitude">Амплитуда (a)</label><input value=${DEFAULT_AMPLITUDE} class="parameter form-control" id="amplitude" placeholder="a"></div>
				<div class="form-group"><label for="circular-frequency">Круговая частота (w): w -> [0, PI]</label><input value=${DEFAULT_CIRCULAR_FREQUENCY} class="parameter form-control" id="circular-frequency" placeholder="w"></div>
				<div class="form-group"><label for="initial-phase">Начальная фаза (phi): phi -> [0, 2*PI]</label><input value=${DEFAULT_INITIAL_PHASE} class="parameter form-control" id="initial-phase" placeholder="phi"></div>`;
			PARAMETERS_HTML = MAIN_PARAMETERS_HTML;
			break;
		}
		case 'Meander':
		case 'Saw': {
			const DEFAULT_PERIOD = 5;
			const MAIN_PARAMETERS_HTML = `<label for="period">Период (L)</label><input value=${DEFAULT_PERIOD} class="parameter form-control" id="period" placeholder="L">`;
			PARAMETERS_HTML = MAIN_PARAMETERS_HTML;
			break;
		}
		case 'Exponential envelope': {
			const DEFAULT_AMPLITUDE = 1;
			const DEFAULT_ENVELOPE_WIDTH = 1;
			const DEFAULT_INITIAL_PHASE = 0;
			let PART;
			let MAIN_PARAMETERS_HTML;
			if (signals.length == 0) {
				PART = `<div class="form-group"><label for="carrier-frequency">Частота несущей (fн): fн -> [0, 0.5*f]</label><input class="parameter form-control" id="carrier-frequency" placeholder="fн"></div>`
			}
			else {
				const DEFAULT_FREQUENCY = 0.5 * signal.frequency;
				PART = `<div class="form-group"><label for="carrier-frequency">Частота несущей (fн): fн -> [0, ${0.5 * signal.frequency}]</label><input value=${DEFAULT_FREQUENCY} class="parameter form-control" id="carrier-frequency" placeholder="fн"></div>`
			}
			MAIN_PARAMETERS_HTML = `
			<div class="form-group"><label for="amplitude">Амплитуда (a)</label><input value=${DEFAULT_AMPLITUDE} class="parameter form-control" id="amplitude" placeholder="a"></div>
			<div class="form-group"><label for="envelope-width">Ширина огибающей (tao)</label><input value=${DEFAULT_ENVELOPE_WIDTH} class="parameter form-control" id="envelope-width" placeholder="tao"></div>
			${PART}
			<div class="form-group"><label for="initial-phase">Начальная фаза несущей (phi)</label><input value=${DEFAULT_INITIAL_PHASE} class="parameter form-control" id="initial-phase" placeholder="phi"></div>`;
			PARAMETERS_HTML = MAIN_PARAMETERS_HTML;
			break;
		}
		case 'Balance envelope': {
			const DEFAULT_AMPLITUDE = 1;
			const DEFAULT_ENVELOPE_FREQUENCY = 1;
			const DEFAULT_INITIAL_PHASE = 0;
			let PART;
			let MAIN_PARAMETERS_HTML;
			if (signals.length == 0) {
				PART = '<div class="form-group"><label for="carrier-frequency">Частота несущей (fн): fн -> [0, 0.5*f]</label><input class="parameter form-control" id="carrier-frequency" placeholder="fн"></div>'
			}
			else {
				const DEFAULT_CARRIER_FREQUENCY = 0.5 * signal.frequency / 2;
				PART = `<div class="form-group"><label for="carrier-frequency">Частота несущей (fн): fн -> [0, ${0.5 * signal.frequency}]</label><input value=${DEFAULT_CARRIER_FREQUENCY} class="parameter form-control" id="carrier-frequency" placeholder="fн"></div>`;
			}
			MAIN_PARAMETERS_HTML = `
			<div class="form-group"><label for="amplitude">Амплитуда (a)</label><input value=${DEFAULT_AMPLITUDE} class="parameter form-control" id="amplitude" placeholder="a"></div>
			<div class="form-group"><label for="envelope-frequency">Частота огибающей (fо)</label><div class="form-group"><input value=${DEFAULT_ENVELOPE_FREQUENCY} class="parameter form-control" id="envelope-frequency" placeholder="fо"></div>
			${PART}
			<div class="form-group"><label for="initial-phase">Начальная фаза несущей (phi)</label><input value=${DEFAULT_INITIAL_PHASE} class="parameter form-control" id="initial-phase" placeholder="phi"></div>`
			PARAMETERS_HTML = MAIN_PARAMETERS_HTML;
			break;
		}
		case 'Tonal envelope': {
			const DEFAULT_AMPLITUDE = 1;
			const DEFAULT_ENVELOPE_FREQUENCY = 1;
			const DEFAULT_INITIAL_PHASE = 0;
			const DEFAULT_DEPTH_INDEX = 0.5;
			let PART;
			if (signals.length == 0) {
				PART = '<div class="form-group"><label for="carrier-frequency">Частота несущей (fн): fн -> [0, 0.5*f]</label><input class="parameter form-control" id="carrier-frequency" placeholder="fн"></div>'
			}
			else {
				const DEFAULT_CARRIER_FREQUENCY = 0.5 * signal.frequency / 2;
				PART = `<div class="form-group"><label for="carrier-frequency">Частота несущей (fн): fн -> [0, ${0.5 * signal.frequency}]</label><input value=${DEFAULT_CARRIER_FREQUENCY} class="parameter form-control" id="carrier-frequency" placeholder="fн"></div>`;
			}
			const MAIN_PARAMETERS_HTML = `
			<div class="form-group"><label for="amplitude">Амплитуда (a)</label><input value=${DEFAULT_AMPLITUDE} class="parameter form-control" id="amplitude" placeholder="a"></div>
			<div class="form-group"><label for="envelope-frequency">Частота огибающей (fо)</label><div class="form-group"><input value=${DEFAULT_ENVELOPE_FREQUENCY} class="parameter form-control" id="envelope-frequency" placeholder="fо"></div>
			${PART}
			<div class="form-group"><label for="initial-phase">Начальная фаза несущей (phi)</label><input value=${DEFAULT_INITIAL_PHASE} class="parameter form-control" id="initial-phase" placeholder="phi"></div>
			<div class="form-group"><label for="depth-inde">Глубина модуляции (m): m -> [0, 1]</label><input value=${DEFAULT_DEPTH_INDEX} class="parameter form-control" id="depth-index" placeholder="m"></div>`
			PARAMETERS_HTML = MAIN_PARAMETERS_HTML;
			break;
		}
	}
	if (signals.length == 0) {
		PARAMETERS_HTML = ADDITIONAL_PARAMETERS_HTML + PARAMETERS_HTML;
	}
	parametersContainer.html(PARAMETERS_HTML);
})

function arraysAreEqual(arr1, arr2) {
	if (arr1.length !== arr2.length) return false;
	for (let i = 0; i < arr1.length; i++) {
		if (arr1[i] !== arr2[i]) return false;
	}
	return true;
};

$(document).on('click', '#create-model-btn', function () {
	const modelType = $('#model-type').val();
	const signalId = $('.signal-choice').val();
	let parameters = $('.parameter').map(function () {
		return parseFloat($(this).val());
	}).get();
	const isRendered = signals.some((signal) => {
		return (signal.id == signalId) && (signal.models.some((model) => { return ((model.type == modelType) && (arraysAreEqual(model.parameters, parameters))) }) && signal.models.length != 0);
	});
	if (!isRendered) {
		let signal;
		if (signals.length == 0) {
			const measuresCount = parameters[0];
			const frequency = parameters[1];
			parameters = parameters.splice(2, parameters.length - 2);
			const unixtime = Date.parse('2000-01-01 00:00:00.000 GMT');
			signal = new Signal(`Пользовательский сигнал`, 1, measuresCount, frequency, unixtime, `signal${signals.length}`);
			signals.push(signal);
			const SIGNALS_LIST_HTML = '<div class="form-group"><label for="signal-choice">Выберите сигнал</label><select class="form-control signal-choice"></select></div>'
			$('#options-container').before(SIGNALS_LIST_HTML);
			$('#measures-count').remove();
			$('#frequency').remove();
		}
		else {
			signal = findElementById(signals, signalId);
		}
		signal.renderModel(modelType, parameters);
	}
})