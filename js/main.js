import { showSignalInfo } from './info_modal.js';
import { parseTxtFile } from './parser.js';
import { createCharts, showCharts } from './chart_renderer.js'

let signals = [];

$('#open-file-btn').click(function () {
	document.getElementById('file-input').click();
})

$('#about-btn').click(function () {
	alert('DSP - программа для анализа сигналов');
})

$('#author-btn').click(function () {
	alert('Мышалов Родион Б8118-02.03.01сцт 1 подгруппа');
})

function getExtension(filename) {
	let parts = filename.split('.');
	return parts[parts.length - 1];
}

function getName(filename) {
	let parts = filename.split('.');
	return parts[0];
}

$('#file-input').change(function (event) {
	const file = event.target.files[0];
	if (!file) {
		return;
	}
	const reader = new FileReader();
	switch (getExtension(file.name)) {
		case 'txt':
			reader.readAsText(file, 'UTF-8');
			reader.onload = function (event) {
				signals.push(parseTxtFile(file.name, event));
				createCharts(file.name, signals[signals.length - 1]);
			}
	};
})

$(document).on('click', '.channel-btn', function () {
	showCharts(signals, this);
})

$('#signals-info-menu').on('click', '.signal-info-btn', function () {
	showSignalInfo(signals, this);
})