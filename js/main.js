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

function getChannelId(filename) {
    return getName(filename) + '-' + getExtension(filename);
}

function getSignalId(filename) {
    return getName(filename) + '-' + getExtension(filename);
}

function getValidSignalId(id) {
    let parts = id.split('-');
    return parts[0];
}

function parseTxtFile(signalName, event) {
    let fileData = event.target.result.split('\n').filter(line => line[0] != '#');
    console.log(fileData[3].replace(/(\d{2})-(\d{2})-(\d{4})/, "$3-$2-$1") + 'T' + fileData[4])
    let unixtime = Date.parse(fileData[3].replace(/(\d{2})-(\d{2})-(\d{4})/, "$3/$2/$1") + ' ' + fileData[4] + 'Z');
    console.log(unixtime)
    let signal = new Signal(signalName, parseInt(fileData[0]), parseInt(fileData[1]), parseInt(fileData[2]), unixtime);
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
                $('#signal-navigation-menu').append('<li class="container-fluid d-flex justify-content-center signal"> <div class="container-fluid цbtn-group dropleft"><button type="button" class="container-fluid btn btn-info dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' + file.name + '</button><div class="dropdown-menu channels-menu"' + 'id="' + signalId + '">' + '</div></div>' + '</li>');
                if ($('#signal-navigation-menu').css('display') == 'none') {
                    $('#signal-navigation-menu').css('display', 'block');
                }
                signals[signals.length - 1].channels.forEach((channel) => {
                    $('#' + signalId).append('<button class="dropdown-item" type="button">' + channel.name + '</button>');
                });
                $('#signals-info-menu').append('<button class="signal-info-btn btn dropdown-item" style="white-space:normal;" id="' + signalId + '-info">' + signals[signals.length - 1].name + '</button>');
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
    let date = new Date(unixtime * 1000);
    console.log(date)
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = + date.getSeconds();
    let milliseconds = + date.getMilliseconds();
    return day + '-' + month + '-' + year + ' ' + hours + ':' + minutes + ':' + seconds + '.' + milliseconds;
}

function convertDifferenceToDate(unixtime) {
    return Math.floor(unixtime / MILLISECONDS_PER_DAY).toString() + '-' +
        Math.floor(unixtime / MILLISECONDS_PER_HOUR).toString() + '-' +
        Math.floor(unixtime / MILLISECONDS_PER_MINUTE).toString() + '-' +
        Math.floor(unixtime / MILLISECONDS_PER_SECOND).toString() + '.' +
        unixtime % MILLISECONDS_PER_SECOND.toString();
}

$('#signals-info-menu').on('click', '.signal-info-btn', function () {
    let restoredId = getValidSignalId(this.id);
    let restoredSignal = signals.find((signal) => {
        return restoredId == signal.id;
    });
    $('.modal-title').text('Информация о сигнале ' + restoredSignal.name);
    $('.modal-body').html('Общее число каналов: ' + restoredSignal.channelsCount + ' <br \/>Общее количество отсчетов: ' + restoredSignal.measuresCount
        + '<br \/>Частота дискретизации: ' + restoredSignal.frequency + ' Гц (шаг между отсчетами ' + 1 / restoredSignal.frequency + ' сек)' +
        '<br \/>Дата и время начала записи: ' + convertUnixtimeToDate(restoredSignal.recordingTime) + '<br \/>Дата и время окончания записи: ' +
        convertUnixtimeToDate(restoredSignal.recordingTime + restoredSignal.measuresCount * (1 / restoredSignal.frequency)) +
        '<br \/>Длительность: ' + convertDifferenceToDate((restoredSignal.recordingTime + restoredSignal.measuresCount * (1 / restoredSignal.frequency)) - restoredSignal.recordingTime) + '<hr>');
    $('.modal-body').append('<table class="table table-bordered"><thead><tr><th scope="col">№</th><th scope="col">Имя</th><th scope="col">Источник</th></tr></thead><tbody id="channels-table"></tbody></table>')
    restoredSignal.channels.forEach((channel, index) => {
        $('#channels-table').append('<tr><th scope="row">' + (index + 1) + '</th><td>' + channel.name + '</td><td>' + restoredSignal.name + '</td></tr>');
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