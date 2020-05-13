import { showSignalInfo } from './info_modal.js';
import { parseTxtFile } from './parser.js';

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
		const result = parseTxtFile(file.name, fileContent);
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
	switch (getExtension(file.name)) {
		case 'txt':
			const data = await getDataFromTxt(file);
			signals.push(data);
	};
	signals[signals.length - 1].createCharts();
})

$(document).on('click', '.channel-btn', function () {
	const clickedButton = this;
	const signalId = $(clickedButton).parent().attr('id');
	const channel = signals.find((signal) => {
		return signal.id == signalId;
	}).channels.find((channel) => {
		return channel.id == clickedButton.id;
	});
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

$('#signals-info-menu').on('click', '.signal-info-btn', function () {
	signals.forEach((signal) => {
		showSignalInfo(signal);
	})
})

$(document).on('click', '.signal-btn', function () {
	const menuId = $(this).attr('id').split('-')[0];
	const menuSelector = `.channels-menu[id='${menuId}']`;
	$('#signal-navigation-menu').css('display', 'none');
	$(menuSelector).css('display', 'flex');
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

function createModel(signalId, modelType) {
	switch (modelType) {
		case 'Delayed single impulse': {
			const impulseDelay = $('#delay').val();
			const signal = signals.find((signal) => {
				return signal.id == signalId;
			})
			if (signal) {

			}
		}
	}
}

$(document).on('click', '#create-model-btn', function () {
	const signalId = $('#signal-choice').val();
	const modelType = $('#model-type').val();
	createModel(signalId, modelType);
})