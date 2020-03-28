import { showSignalInfo } from './info_modal.js';
import { parseTxtFile } from './parser.js';
import { createCharts, renderChart } from './chart_renderer.js'

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

async function getPromiseFromTxt(file) {
	try {
		const fileContent = await readTxtFile(file);
		const result = parseTxtFile(file.name, fileContent);
		return result;
	} catch(e) {
		console.log(e);
	}
}

$('#file-input').change(function (event) {
	const file = event.target.files[0];
	if (!file) {
		return;
	}
	switch (getExtension(file.name)) {
		case 'txt':
			signals.push(getPromiseFromTxt(file));
	};
	signals[signals.length - 1].then((signal) => {
		createCharts(file.name, signal);
	})
})

$(document).on('click', '.channel-btn', function () {
	const clickedButton = this;
	Promise.all(signals).then(values => {
		renderChart(values, clickedButton);
	})
})

$('#signals-info-menu').on('click', '.signal-info-btn', function () {
	const clickedButton = this;
	Promise.all(signals).then(values => {
		showSignalInfo(values, clickedButton);
	})
})