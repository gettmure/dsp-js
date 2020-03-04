let charts = []
let chartsCount = 1
let mousePosition;
let offset = [0, 0];
let isDown = false;

$('#open-file-btn').click(function () {
    document.getElementById('file-input').click();
});

$('#file-input').change(function (event) {
    let file = event.target.files[0];
    if (!file) {
        return;
    }
    let reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    reader.onload = function (event) {
        let fileData = event.target.result;
        $('article').append('<div class="chartContainer " id="chart' + chartsCount + '"style="padding: 50px; position: absolute; resize: none; height: 430px; width: 660px; border: 2px solid black;"></div>');
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

function getExtension(filename) {
    let parts = filename.split('.');
    return parts[parts.length - 1];
}

function getName(filename) {
    let parts = filename.split('.');
    return parts[0];
}

function getChartData(fileData, name) {
    let data = [];
    let dataSeries = { type: 'line' };
    switch (getExtension(name)) {
        case 'txt':
            dataArray = fileData.split(' ').map(Number);
            length = dataArray.length;
            if (length % 2 == 1) {
                alert('WRONG DATA');
                return;
            }
            dataPoints = [];
            for (let i = 0; i < length; i += 2) {
                if (i == length) break;
                dataPoints.push({
                    x: dataArray[i],
                    y: dataArray[i + 1],
                });
            }
            dataSeries.dataPoints = dataPoints;
            data.push(dataSeries);
            return data;
    }
}

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

function showAboutProgramInfo() {
    alert('DSP - программа для анализа сигналов')
}

function showAboutAuthorInfo() {
    alert('Мышалов Родион Б8118-02.03.01сцт 1 подгруппа')
}