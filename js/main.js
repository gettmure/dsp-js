import { showSignalInfo } from './info_modal.js';
import { parseTxtFile } from './parser.js';
import { Signal } from './entities/Signal.js';

export let signals = [];
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

function getSignal(signals, id) {
	return signals.find((signal) => {
		return signal.id == id;
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
		const SIGNALS_LIST_HTML = '<div class="form-group"><label for="signal-choice">Выберите сигнал</label><select class="form-control" id="signal-choice"></select></div>'
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

$(document).on('click', '.channel-btn', function () {
	let channel;
	const clickedButton = this;
	const signalId = $(clickedButton).parent().attr('id');
	const chartId = $(clickedButton).attr('id');
	const isModel = (chartId.match(/model/gm) != null);
	const signal = getSignal(signals, signalId);
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
	const signal = getSignal(signals, signalId);
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
	const ADDITIONAL_PARAMETERS_HTML = '<div class="form-group"><input class="parameter form-control" id="measures-count" placeholder="Количество отсчётов"></div><div class="form-group"><input class="parameter form-control" id="frequency" placeholder="Частота"></div>'
	const buttonId = $(this).attr('id');
	switch (buttonId) {
		case 'determinated-signal-btn': {
			let DEFAULT_PARAMETERS_HTML = '<div class="form-group"><input class="parameter form-control" id="delay" placeholder="Задержка импульса"></div>';
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
			if (signals.length == 0) {
				DEFAULT_PARAMETERS_HTML = ADDITIONAL_PARAMETERS_HTML + DEFAULT_PARAMETERS_HTML;
			}
			$('#parameters-container').html(DEFAULT_PARAMETERS_HTML);
			break;
		}

		case 'random-signal-btn': {
			let DEFAULT_PARAMETERS_HTML = `
			<div class="form-group"><input class="parameter form-control" id="amplitude" placeholder="Амплитуда"></div>
			<div class="form-group"><input class="parameter form-control" id="envelope-width" placeholder="Ширина огибающей"></div>
			<div class="form-group"><input class="parameter form-control" id="frequency" placeholder="Частота несущей"></div>
			<div class="form-group"><input class="parameter form-control" id="initial-phase" placeholder="Начальная фаза несущей"></div>`;
			const MODEL_TYPE_ITEMS_HTML = `
				<option value="Exponential envelope">Экспоненциальная огибающая</option>
				<option value="Balance envelope">Балансная огибающая</option>
				<option value="Tonal envelope">Тональная огибающая</option>
			`;
			$('#model-type').html(MODEL_TYPE_ITEMS_HTML);
			if (signals.length == 0) {
				DEFAULT_PARAMETERS_HTML = ADDITIONAL_PARAMETERS_HTML + DEFAULT_PARAMETERS_HTML;
			}
			$('#parameters-container').html(DEFAULT_PARAMETERS_HTML);
			break;
		}
	}
})

$(document).on('change', '#model-type', function () {
	const type = $(this).val();
	const parametersContainer = $('#parameters-container');
	let PARAMETERS_HTML;
	const ADDITIONAL_PARAMETERS_HTML = '<div class="form-group"><input class="parameter form-control" id="measures-count" placeholder="Количество отсчётов"></div><div class="form-group"><input class="parameter form-control" id="frequency" placeholder="Частота"></div>'

	switch (type) {
		case 'Delayed single impulse': {
			const MAIN_PARAMETERS_HTML = '<input class="parameter form-control" id="delay" placeholder="Задержка импульса">';
			PARAMETERS_HTML = MAIN_PARAMETERS_HTML;
			break;
		}
		case 'Delayed single bounce': {
			const MAIN_PARAMETERS_HTML = '<input class="parameter form-control" id="delay" placeholder="Задержка скачка">';
			PARAMETERS_HTML = MAIN_PARAMETERS_HTML;
			break;
		}
		case 'Decreasing discretized exponent': {
			const MAIN_PARAMETERS_HTML = '<input class="parameter form-control" id="base" placeholder="Основание степени a^n">';
			PARAMETERS_HTML = MAIN_PARAMETERS_HTML;
			break;
		}
		case 'Discretized sinusoid': {
			const MAIN_PARAMETERS_HTML = `
				<div class="form-group"><input class="parameter form-control" id="amplitude" placeholder="Амплитуда"></div>
				<div class="form-group"><input class="parameter form-control" id="circular-frequency" placeholder="Круговая частота"></div>
				<div class="form-group"><input class="parameter form-control" id="initial-phase" placeholder="Начальная фаза"></div>`;
			PARAMETERS_HTML = MAIN_PARAMETERS_HTML;
			break;
		}
		case 'Meander':
		case 'Saw': {
			const MAIN_PARAMETERS_HTML = '<input class="parameter form-control" id="period" placeholder="Период">';
			PARAMETERS_HTML = MAIN_PARAMETERS_HTML;
			break;
		}
		case 'Exponential envelope': {
			const MAIN_PARAMETERS_HTML = `
			<div class="form-group"><input class="parameter form-control" id="amplitude" placeholder="Амплитуда"></div>
			<div class="form-group"><input class="parameter form-control" id="envelope-width" placeholder="Ширина огибающей"></div>
			<div class="form-group"><input class="parameter form-control" id="frequency" placeholder="Частота несущей"></div>
			<div class="form-group"><input class="parameter form-control" id="initial-phase" placeholder="Начальная фаза несущей"></div>`;
			PARAMETERS_HTML = MAIN_PARAMETERS_HTML;
			break;
		}
		case 'Balance envelope': {
			const MAIN_PARAMETERS_HTML = `
			<div class="form-group"><input class="parameter form-control" id="amplitude" placeholder="Амплитуда"></div>
			<div class="form-group"><div class="form-group"><input class="parameter form-control" id="envelope-frequency" placeholder="Частота огибающей"></div>
			<div class="form-group"><input class="parameter form-control" id="carrier-frequency" placeholder="Частота несущей"></div>
			<div class="form-group"><input class="parameter form-control" id="initial-phase" placeholder="Начальная фаза несущей"></div>`
			PARAMETERS_HTML = MAIN_PARAMETERS_HTML;
			break;
		}
		case 'Tonal envelope': {
			const MAIN_PARAMETERS_HTML = `
			<div class="form-group"><input class="parameter form-control" id="amplitude" placeholder="Амплитуда"></div>
			<div class="form-group"><input class="parameter form-control" id="envelope-frequency" placeholder="Частота огибающей"></div>
			<div class="form-group"><input class="parameter form-control" id="carrier-frequency" placeholder="Частота несущей"></div>
			<div class="form-group"><input class="parameter form-control" id="initial-phase" placeholder="Начальная фаза несущей"></div>
			<div class="form-group"><input class="parameter form-control" id="depth-index" placeholder="Индекс глубины модуляции"></div>`
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
	const signalId = $('#signal-choice').val();
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
			const SIGNALS_LIST_HTML = '<div class="form-group"><label for="signal-choice">Выберите сигнал</label><select class="form-control" id="signal-choice"></select></div>'
			$('#options-container').before(SIGNALS_LIST_HTML);
			$('#measures-count').remove();
			$('#frequency').remove();
		}
		else {
			signal = getSignal(signals, signalId);
		}
		signal.renderModel(modelType, parameters);
	}
})