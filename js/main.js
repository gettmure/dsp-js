import { showSignalInfo } from './info_modal.js';
import { parseTxtFile } from './parser.js';
import { createChannelsCheckboxes, saveFile } from './save_file.js';
import { createChannelChoiceButtons } from './analysis.js';
import {
  createModel,
  switchModelType,
  showModellingWindow,
  createSuperposition,
  createSuperpositionButtons,
} from './modelling.js';
import { Signal } from './entities/Signal.js';

let signals = [];
let isOpened = false;

$('#open-file-btn').click(function () {
  document.getElementById('file-input').click();
});

$('#about-btn').click(function () {
  alert('DSP - программа для анализа сигналов');
});

$('#author-btn').click(function () {
  alert('Мышалов Родион Б8118-02.03.01сцт 1 подгруппа');
});

export function getRandomColor() {
  const COLORS_COUNT = 16777215;
  return `#${Math.floor(Math.random() * COLORS_COUNT).toString(16)}`;
}

export function findElementById(elements, id) {
  return elements.find((element) => {
    return element.id == id;
  });
}

function isModel(id) {
  return id.match(/model/gm) != null;
}

function getExtension(filename) {
  let parts = filename.split('.');
  return parts[parts.length - 1];
}

function showSignalsMenu() {
  $('.channels-menu').css('display', 'none');
  $('#signal-navigation-menu').css('display', 'block');
  $('#return-btn').css('display', 'none');
}

function readTxtFile(file) {
  const fileReader = new FileReader();
  return new Promise((resolve, reject) => {
    fileReader.onerror = () => {
      fileReader.abort();
      reject(new DOMException('Problem parsing input file.'));
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
    const SIGNALS_LIST_HTML =
      '<div class="form-group"><label for="signal-choice">Выберите сигнал</label><select class="form-control signal-choice" id="modelling-signal"></select></div>';
    $('#options-container').before(SIGNALS_LIST_HTML);
    $('#measures-count').remove();
    $('#frequency').remove();
  }
  switch (getExtension(file.name)) {
    case 'txt':
      const data = await getDataFromTxt(file);
      signals.push(data);
      break;
  }
  signals[signals.length - 1].renderChannels();
});

$(document).on('click change', '#save-file-btn, #save-signal', function () {
  const signalId = $('#save-signal').val();
  const signal = findElementById(signals, signalId);
  if (signal) {
    createChannelsCheckboxes(signal);
  }
});

$(document).on('click', '#save-file', function () {
  const signalId = $('#save-signal').val();
  const signal = findElementById(signals, signalId);
  saveFile(signal);
});

$(document).on('click', '.channel-btn', function () {
  let source;
  const clickedButton = this;
  const signalId = $(clickedButton).parent().attr('id');
  const chartId = $(clickedButton).attr('id');
  const signal = findElementById(signals, signalId);
  if (isModel(chartId)) {
    source = findElementById(signal.models, chartId);
  } else {
    source = findElementById(signal.channels, chartId);
  }
  source.showChart();
});

$(document).on('click', '.signal-info-btn', function () {
  const signalId = $(this).attr('id').split('-')[0];
  const signal = findElementById(signals, signalId);
  showSignalInfo(signal);
});

$(document).on('click', '.modelling-btn', function () {
  const buttonId = $(this).attr('id');
  showModellingWindow(signals, buttonId);
});

$(document).on('click', '#superposition-btn', function () {
  if (signals.length != 0) {
    const id = $('#superposition-signal').val();
    const signal = findElementById(signals, id);
    createSuperpositionButtons(signal);
  }
});

$(document).on('change', '#superposition-signal', function () {
  const id = $(this).val();
  const signal = findElementById(signals, id);
  createSuperpositionButtons(signal);
});

$(document).on('click', '#create-superposition-btn', function () {
  const signalId = $('.signal-choice').val();
  const signal = findElementById(signals, signalId);
  createSuperposition(signal);
});

$(document).on('change', '#model-type', function () {
  const type = $(this).val();
  switchModelType(signals, type);
});

$(document).on('click', '#create-model-btn', function () {
  createModel(signals);
});

$(document).on('click', '.signal-btn', function () {
  const menuId = $(this).attr('id').split('-')[0];
  const menuSelector = `.channels-menu[id='${menuId}']`;
  $('#signal-navigation-menu').css('display', 'none');
  $(menuSelector).css('display', 'block');
  $('#return-btn').css('display', 'block');
});

$(document).on('click', '.channel-btn', function () {
  $('#show-signal-navigation-menu-btn').html('&#60');
  $('.signal-navigation-menu-container').css('right', '-15rem');
  showSignalsMenu();
  isOpened = !isOpened;
});

$(document).on('click', '#return-btn', function () {
  showSignalsMenu();
});

$('#show-signal-navigation-menu-btn').click(function () {
  if (!isOpened) {
    $('.signal-navigation-menu-container').css('right', '0');
    $('#show-signal-navigation-menu-btn').html('&#62');
  } else {
    $('.signal-navigation-menu-container').css('right', '-15rem');
    $('#show-signal-navigation-menu-btn').html('&#60');
  }
  isOpened = !isOpened;
});

$(document).on('click', '.analysis-btn', function () {
  $('#statistics-container').css('display', 'none');
  const signalId = $('.signal-choice').val();
  createChannelChoiceButtons(signals, signalId);
});

$(document).on('change', '.signal-choice', function () {
  const signalId = $(this).val();
  createChannelChoiceButtons(signals, signalId);
});

$(document).on('click', '#create-statistics-btn', function () {
  const signalId = $('.signal-choice').val();
  const sourceId = $('.channel-choice').val();
  const intervalsCount = parseInt($('#intervals-count').val());
  const signal = findElementById(signals, signalId);
  let source;
  if (isModel(sourceId)) {
    source = findElementById(signal.models, sourceId);
  } else {
    source = findElementById(signal.channels, sourceId);
  }
  source.renderStatistics(intervalsCount);
});

$(document).on('click', '#create-spectral-btn', function () {
  const signalId = $('.signal-choice').val();
  const sourceId = $('.channel-choice').val();
  const smoothParameter = $('#smoothing-parameter').val();
  const signal = findElementById(signals, signalId);
  let source;
  if (isModel(sourceId)) {
    source = findElementById(signal.models, sourceId);
  } else {
    source = findElementById(signal.channels, sourceId);
  }
  const channelsCount =
    parseInt(
      signals[signals.length - 1].channels[
        signals[signals.length - 1].channels.length - 1
      ].id.match(/\d+/g)[0]
    ) + 1;
  source.renderSpectral(smoothParameter, channelsCount, signals);
});
