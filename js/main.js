let charts = [];
let chartsCount = 0;
let mousePosition;
let offset = [0, 0];
let isDown = false;
let signals = [];

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

function parseTxtFile(signalName, event) {
    let fileData = event.target.result.split('\n').filter(line => line[0] != '#');
    let unixtime = Date.parse(fileData[3].replace(/(\d{2})-(\d{2})-(\d{4})/, "$3-$2-$1") + 'T' + fileData[4]);
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
                let channelId = getChannelId(file.name);
                $('#signal-navigation-menu').append('<li class="container-fluid d-flex justify-content-center signal"> <div class="container-fluid btn-group dropleft"><button type="button" class="container-fluid btn btn-info dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' + file.name + '</button><div class="dropdown-menu channels-menu"' + 'id="' + channelId + '">' + '</div></div>' + '</li>');
                if ($('#signal-navigation-menu').css('display') == 'none') {
                    $('#signal-navigation-menu').css('display', 'block');
                }
                signals[signals.length - 1].channels.forEach((channel) => {
                    $('#' + channelId).append('<button class="dropdown-item" type="button">' + channel.name + '</button>');
                });
            }
            // $('article').append('<div class="chartContainer " id="chart' + chartsCount + '"style="padding: 50px; position: absolute; resize: none; height: 430px; width: 660px; border: 2px solid black;"></div>');
            // charts.push(new CanvasJS.Chart("chart" + chartsCount, {
            //     width: 550,
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
    };
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