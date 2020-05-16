import { Channel } from "./Channel.js";

export class Model extends Channel {
    #scrollHandler
    constructor(name, measuresCount, frequency, start, type, id, signalId) {
        super(name, measuresCount, frequency, start, id, signalId);
        this.type = type;
        this.chart =
            new CanvasJS.Chart(`${this.id}-container`, {
                width: 520,
                height: 325,
                animationEnabled: false,
                zoomEnabled: true,
                zoomType: 'x',
                rangeChanging: (e) => {
                    const axisX = this.chart.axisX[0];
                    const range = axisX.get('viewportMaximum') - axisX.get('viewportMinimum');
                    this.#scrollHandler(e, range);
                },
                title: {
                    text: this.name,
                },
                axisY: {
                    includeZero: true,
                    minimum: this.minimalValue,
                    maximum: this.maximalValue
                },
                axisX: {
                    includeZero: true,
                },
                data: this._getChartData(),
            })

        this.#scrollHandler = (e, range) => {
            console.log(1)
            const selector = `#${this.id}-slider`;
            const trigger = e.trigger;
            const currentLeftValue = e.axisX[0].viewportMinimum;
            const start = this.recordingTime;
            const end = this.endTime - range;
            $(function () {
                if (trigger == 'reset') {
                    if ($(selector).slider()) {
                        $(selector).slider('destroy');
                    }
                }
                if (trigger == 'zoom' || trigger == 'pan') {
                    $(selector).slider({
                        min: start,
                        max: end,
                        value: currentLeftValue,
                        slide: function (e, ui) {
                            const leftLimit = ui.value;
                            const rightLimit = leftLimit + range;
                            if (rightLimit > this.endTime) {
                                return;
                            };
                            const currentAsixX = this.chart.axisX[0];
                            currentAsixX.set('viewportMinimum', leftLimit, false)
                            currentAsixX.set('viewportMaximum', rightLimit);
                        }
                    })
                }
            });
        }
    }
}