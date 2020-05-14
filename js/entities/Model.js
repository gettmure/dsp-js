import { Signal } from "./Signal.js";

export class Model extends Signal {
    constructor(name, measuresCount, frequency, start, id) {
        super(name, 1, measuresCount, frequency, start, id);
        this.channel;
        this.type;

        // this.#getChartData = function () {
        //     let value;
        //     let modelFunction;
        //     switch (this.type) {
        //         case 'Delayed single impulse': {
        //             modelFunction = () => {
        //                 // if (this.measuresCount == ) {

        //                 // }
        //             }
        //             break;
        //         }
        //         case 'Delayed single bounce': {
        //             const MAIN_PARAMETERS_HTML = '<input class="parameter form-control" id="delay" placeholder="Задержка скачка">';
        //             PARAMETERS_HTML = MAIN_PARAMETERS_HTML;
        //             break;
        //         }
        //         case 'Decreasing discretized exponent': {
        //             const MAIN_PARAMETERS_HTML = '<input class="parameter form-control" id="base" placeholder="Основание степени a^n">';
        //             PARAMETERS_HTML = MAIN_PARAMETERS_HTML;
        //             break;
        //         }
        //         case 'Discretized sinusoid': {
        //             const MAIN_PARAMETERS_HTML = `
        //                 <div class="form-group"><input class="parameter form-control" id="amplitude" placeholder="Амплитуда"></div>
        //                 <div class="form-group"><input class="parameter form-control" id="circular-frequency" placeholder="Круговая частота"></div>
        //                 <div class="form-group"><input class="parameter form-control" id="initial-phase" placeholder="Начальная фаза"></div>`;
        //             PARAMETERS_HTML = MAIN_PARAMETERS_HTML;
        //             break;
        //         }
        //         case 'Meander':
        //         case 'Saw': {
        //             const MAIN_PARAMETERS_HTML = '<input class="parameter form-control" id="period" placeholder="Период">';
        //             PARAMETERS_HTML = MAIN_PARAMETERS_HTML;
        //             break;
        //         }
        //     }
        //     let data = [];
        //     let dataPoints = [];
        //     let step = startTime;
        //     for (let i = 0; i < this.values.length; i += 1) {
        //         dataPoints.push({
        //             x: new Date(step),
        //             y: value,
        //         });
        //         step += this.period;
        //     }
        //     let dataSeries = { type: 'line', color: getRandomColor() };
        //     dataSeries.dataPoints = dataPoints;
        //     data.push(dataSeries);
        //     return data;
        // }
    }
}