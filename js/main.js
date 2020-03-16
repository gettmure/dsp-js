import { Signal } from './Signal.js'
import { Channel } from './Channel.js'

const MILLISECONDS_PER_DAY = 86400000;
const MILLISECONDS_PER_HOUR = 3600000;
const MILLISECONDS_PER_MINUTE = 60000;
const MILLISECONDS_PER_SECOND = 1000;

let charts = [];
let chartsCount = 0;
let mousePosition;
let offset = [0, 0];
let isDown = false;
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

function parseDateTime(s) {
    const dateElements = s.split(/\D/);
    return new Date(Date.UTC(dateElements[0], dateElements[1] - 1, dateElements[2], dateElements[3], dateElements[4], dateElements[5]));
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
            let data = fileData[lineIndex].split(' ');
            signal.channels[channelIndex].values.push(parseFloat(data[channelIndex]));
        }
    }
    return signal;
}

$('#file-input').change(function (event) {
    let file = event.target.files[0];
    if (!file) {
        return;
    }
    let reader = new FileReader();
    switch (getExtension(file.name)) {
        case 'txt':
            reader.readAsText(file, 'UTF-8');
            reader.onload = function (event) {
                signals.push(parseTxtFile(file.name, event));
                let signalId = 'signal' + signalsCount;
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
                    $(`#${signalId}`).append(`<button class="dropdown-item" type="button">${channel.name}</button>`);
                });
                $('#signals-info-menu').append(`
                    <button class="signal-info-btn btn dropdown-item" style="white-space:normal;" id="${signalId}-info">
                        ${signals[signals.length - 1].name}
                    </button>
                `);
            }

            // $('article').append('<div class="chartContainer " id="chart' + chartsCount + '"style="padding: 50px; position: absolute; resize: none; height: 430px; width: 660px; border: 2px solid black;"></div>');
            // charts.push(new CanvasJS.Chart("chart" + chartsCount, {
            //     width: 550,DAY
            //     height: 350,
            //     backgroundColor: null,
            //     animationEnabled: true,
            //     zoomEnabled: true,
            //     zoomType: "xy",
            //     title: {
            //         text: getName(file.name)
            //     },
            //     axisY: {
            //         includeZero: true
            //     },
            //     axisX: {
            //         includeZero: true
            //     },
            //     data: getChartData(fileData, file.name)
            // }));
            // charts[charts.length - 1].render();
            // chartsCount++;


            $('.chartContainer').mousedown(function (event) {
                isDown = true;
                offset = [
                    this.offsetLeft - event.clientX,
                    this.offsetTop - event.clientY
                ];
            });
            signalsCount++;
    };
});

function convertUnixtimeToDate(unixtime) {
    const date = new Date(unixtime);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = + date.getSeconds();
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
        Дата и время начала записи: ${startDate} <br>
        Дата и время окончания записи: ${endDate} <br>
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
});

function getChartData(fileData, name) {
    let data = [];
    let dataSeries = { type: 'line' };
    switch (getExtension(name)) {
        case 'txt':
        // dataArray = fileData.split(' ').map(Number);
        // length = dataArray.length;
        // if (length % 2 == 1) {
        //     alert('WRONG DATA');
        //     return;
        // }
        // dataPoints = [];
        // for (let i = 0; i < length; i += 2) {
        //     if (i == length) break;
        //     dataPoints.push({
        //         x: dataArray[i],
        //         y: dataArray[i + 1],
        //     });
        // }
        // dataSeries.dataPoints = dataPoints;
        // data.push(dataSeries);
        // return data;
    }
}

$('#open-file-btn').click(function () {
    document.getElementById('file-input').click();
});

$(document).mouseup(function () {
    isDown = false;
});

$(document).mousemove(function (event) {
    event.preventDefault();
    if (isDown) {
        mousePosition = {
            x: event.clientX,
            y: event.clientY
        };
        if ($(event.target).is('.chartContainer')) {
            event.target.style.left = (mousePosition.x + offset[0]) + 'px';
            event.target.style.top = (mousePosition.y + offset[1]) + 'px';
        }
        else {
            $(event.currentTarget).parent().css('left', (mousePosition.x + offset[0]) + 'px');
            $(event.currentTarget).parent().css('top', (mousePosition.x + offset[1]) + 'px');
        }
    }
});