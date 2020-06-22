import { Source } from './Source.js';
import { getRandomColor } from '../main.js';
import { Signal } from './Signal.js';

export class Channel extends Source {
  #getChartData;
  #getMinMax;
  #syncHandler;
  #scrollHandler;
  #middle;
  #dispersion;
  #deviation;
  #statisticsSum;
  #variationCoef;
  #asymmetryCoef;
  #excessCoef;
  #calculateQuantile;
  #calculateStatistics;
  #getSpectralData;

  constructor(name, measuresCount, frequency, startTime, id, signalId) {
    super(measuresCount, frequency, startTime, id);
    this.name = name;
    this.signalId = signalId;
    this.demoChart;
    this.chart;
    this.values = [];
    this.minimalValue;
    this.maximalValue;
    this.mode = 'channel';

    this.#statisticsSum = (power) => {
      let denominator;
      power == 2
        ? (denominator = 1)
        : (denominator = Math.pow(this.#deviation, power));
      return (
        this.values.reduce(
          (previousValue, currentValue) =>
            previousValue + Math.pow(currentValue - this.#middle, power)
        ) /
        (this.measuresCount * denominator)
      );
    };

    this.#calculateStatistics = () => {
      this.#middle =
        this.values.reduce(
          (previousValue, currentValue) => previousValue + currentValue
        ) / this.measuresCount;
      this.#dispersion = this.#statisticsSum(2);
      this.#deviation = Math.sqrt(this.#dispersion);
      this.#variationCoef = this.#deviation / this.#middle;
      this.#asymmetryCoef = this.#statisticsSum(3);
      this.#excessCoef = this.#statisticsSum(4) - 3;
    };

    this.#calculateQuantile = (order) => {
      const index = Math.trunc(order * this.measuresCount);
      return this.values.sort((a, b) => a - b)[index];
    };

    this.#getSpectralData = (L) => {
      let dpf = [{ real: 0, imaginary: 0 }];
      for (let k = 1; k < this.measuresCount / 2; k++) {
        const complexRe = this.values.reduce(
          (previousValue, currentValue, index) =>
            previousValue +
            currentValue *
              Math.cos((-2 * Math.PI * k * index) / this.measuresCount)
        );
        const complexIm = this.values.reduce(
          (previousValue, currentValue, index) =>
            previousValue +
            currentValue *
              Math.sin((-2 * Math.PI * k * index) / this.measuresCount)
        );
        const value = {
          real: complexRe,
          imaginary: complexIm,
        };
        dpf.push(value);
      }
      let A = dpf.map((value) => {
        return Math.sqrt(
          value.real * value.real + value.imaginary * value.imaginary
        );
      });
      A.pop();
      let P = A.map((value) => value * value);
      if (L > 0) {
        A = A.map((value, index) => {
          const multiplier = 1 / (2 * L + 1);
          let sum = 0;
          for (let i = -L; i <= L; i++) {
            sum += A[Math.abs(index + i)];
          }
          return multiplier * sum;
        });
        P = P.map((value, index) => {
          const multiplier = 1 / (2 * L + 1);
          let sum = 0;
          for (let i = -L; i <= L; i++) {
            sum += P[Math.abs(index + i)];
          }
          return multiplier * sum;
        });
      }
      const Alg = A.map((value) => (value == 0 ? 0 : 20 * Math.log10(value)));
      const Plg = P.map((value) => (value == 0 ? 0 : 20 * Math.log10(value)));
      return [A, P, Alg, Plg];
    };

    this.#syncHandler = (e, channels) => {
      channels.forEach((channel) => {
        const chart = channel.chart;
        const options = chart.options;
        if (!options.axisX) {
          options.axisX = {};
        }
        if (!options.axisY) {
          options.axisY = {};
        }
        if (e.trigger === 'reset') {
          options.axisX.viewportMinimum = options.axisX.viewportMaximum = null;
          options.axisY.viewportMinimum = options.axisY.viewportMaximum = null;
          chart.render();
        } else {
          if (chart !== e.chart) {
            options.axisX.viewportMinimum = e.axisX[0].viewportMinimum;
            options.axisX.viewportMaximum = e.axisX[0].viewportMaximum;
            options.axisY.viewportMinimum = e.axisY[0].viewportMinimum;
            options.axisY.viewportMaximum = e.axisY[0].viewportMaximum;
            chart.render();
          }
        }
      });
    };

    this.#getChartData = () => {
      let data = [];
      let dataPoints = [];
      switch (this.mode) {
        case 'spectral': {
          let step = 0;
          this.recordingTime = 0;
          for (let i = 0; i < this.measuresCount; i++) {
            dataPoints.push({
              x: step,
              y: this.values[i],
            });
            step = i / (this.measuresCount * this.period);
          }
          this.endTime = step;
          break;
        }
        default: {
          let step = this.recordingTime;
          for (let i = 0; i < this.measuresCount; i++) {
            dataPoints.push({
              x: new Date(step),
              y: this.values[i],
            });
            step += this.period;
          }
          break;
        }
      }
      let dataSeries = { type: 'line', color: '#000000' };
      dataSeries.dataPoints = dataPoints;
      data.push(dataSeries);
      return data;
    };

    this.#getMinMax = (array) => {
      let min = array[0],
        max = array[0];
      for (let i = 1; i < array.length; i++) {
        min = array[i] < min ? array[i] : min;
        max = array[i] > max ? array[i] : max;
      }
      if (this.mode == 'spectral') {
        this.minimalValue = 0;
      } else {
        this.minimalValue = min;
      }
      this.maximalValue = max;
    };

    this.#scrollHandler = (e, channels, range) => {
      const classSelector = this._getSelector();
      const trigger = e.trigger;
      const currentLeftValue = e.axisX[0].viewportMinimum;
      const start = this.recordingTime;
      const end = this.endTime - range;
      $(function () {
        if (trigger == 'reset') {
          if ($(classSelector).slider()) {
            $(classSelector).slider('destroy');
          }
        }
        if (trigger == 'zoom' || trigger == 'pan') {
          $(classSelector).slider({
            min: start,
            max: end,
            value: currentLeftValue,
            slide: function (e, ui) {
              const leftLimit = ui.value;
              const rightLimit = leftLimit + range;
              if (rightLimit > this.endTime) {
                return;
              }
              channels.forEach((channel) => {
                const currentAsixX = channel.chart.axisX[0];
                currentAsixX.set('viewportMinimum', leftLimit, false);
                currentAsixX.set('viewportMaximum', rightLimit);
              });
              $(classSelector).each(function () {
                $(this).slider('option', 'value', leftLimit);
              });
            },
          });
        }
      });
    };
  }

  renderChart(channels) {
    const chartData = this.#getChartData();
    const CHANNEL_BUTTON_HTML = `
      <button class="dropdown-item channel-btn" type="button" id="${this.id}">${this.name}</button>`;
    this.#getMinMax(this.values);
    $(`#${this.signalId}`).append(CHANNEL_BUTTON_HTML);
    this.demoChart = new CanvasJS.Chart(`${this.id}`, {
      width: 200,
      height: 100,
      interactivityEnabled: false,
      title: {
        text: this.name,
      },
      axisY: {
        title: '',
        valueFormatString: ' ',
        minimum: this.minimalValue,
        maximum: this.maximalValue,
        viewportMaximum: this.maximalValue,
        viewportMinimum: this.minimalValue,
      },
      axisX: {
        title: '',
        valueFormatString: ' ',
      },
      data: chartData,
    });
    $(
      '.channel-btn > div > .canvasjs-chart-canvas1 + .canvasjs-chart-canvas1'
    ).css('position', '');
    this.demoChart.render();
    $('article').append(
      `<div class="chartContainer mb-2" id="${this.id}-container"></div>`
    );
    this.chart = new CanvasJS.Chart(`${this.id}-container`, {
      width: 520,
      height: 325,
      animationEnabled: false,
      zoomEnabled: true,
      zoomType: 'x',
      rangeChanging: (e) => {
        const axisX = this.chart.axisX[0];
        const range =
          axisX.get('viewportMaximum') - axisX.get('viewportMinimum');
        this.#scrollHandler(e, channels, range);
      },
      rangeChanged: (e) => {
        this.#syncHandler(e, channels);
      },
      title: {
        text: this.name,
      },
      axisY: {
        includeZero: true,
        minimum: this.minimalValue,
        maximum: this.maximalValue,
      },
      axisX: {
        includeZero: true,
      },
      data: chartData,
    });
    this._createScroll();
  }

  showChart() {
    this.chart.render();
    $(`#${this.id}-container`).css({
      display: 'block',
      'background-color': getRandomColor(),
    });
  }

  renderStatistics(intervalsCount) {
    this.#calculateStatistics();
    let data = [];
    let dataPoints = [];
    let barData = [];
    barData.length = intervalsCount;
    barData.fill(0);
    const width = (this.maximalValue - this.minimalValue) / intervalsCount;
    this.values.forEach((value) => {
      const index = Math.trunc((value - this.minimalValue) / width);
      if (index == 0) {
        barData[0]++;
      } else {
        barData[index - 1]++;
      }
    });
    for (let i = 0; i < intervalsCount; i += 1) {
      dataPoints.push({
        x: i + 1,
        y: barData[i],
      });
    }
    let dataSeries = { type: 'column', color: '#000000' };
    dataSeries.dataPoints = dataPoints;
    data.push(dataSeries);

    const chart = new CanvasJS.Chart('bar-chart', {
      width: 400,
      height: 200,
      interactivityEnabled: false,
      axisY: {
        title: '',
        valueFormatString: ' ',
      },
      axisX: {
        title: '',
        valueFormatString: ' ',
      },
      data: data,
    });
    $('#options-container').css('display', 'none');
    $('#statistics-container').css('display', 'flex');
    $('#middle').html(`Среднее = ${this.#middle}`);
    $('#dispersion').html(`Дисперсия = ${this.#dispersion}`);
    $('#deviation').html(`Ср. кв. откл = ${this.#deviation}`);
    $('#variationCoef').html(`Вариация = ${this.#variationCoef}`);
    $('#asymmetryCoef').html(`Асимметрия = ${this.#asymmetryCoef}`);
    $('#excessCoef').html(`Эксцесс = ${this.#excessCoef}`);
    $('#max-value').html(`Максимум = ${this.maximalValue}`);
    $('#min-value').html(`Минимум = ${this.minimalValue}`);
    $('#quantile005').html(
      `Квантиль порядка 0.05 = ${this.#calculateQuantile(0.05)}`
    );
    $('#quantile095').html(
      `Квантиль порядка 0.95 = ${this.#calculateQuantile(0.95)}`
    );
    $('#median').html(`Медиана = ${this.#calculateQuantile(0.5)}`);
    chart.render();
  }

  renderSpectral(L, channelsCount, signals, id) {
    let A, P, Alg, Plg;
    [A, P, Alg, Plg] = this.#getSpectralData(L);
    const signal = new Signal(
      `Спектральный анализ ${this.name}`,
      4,
      this.measuresCount / 2 - 1,
      this.frequency,
      this.startTime,
      `signal${id}`
    );
    for (let i = 0; i < signal.channelsCount; i++) {
      let channelName;
      let data;
      switch (i) {
        case 0: {
          channelName = 'Амплитудный спектр';
          data = A;
          break;
        }
        case 1: {
          channelName = 'СПМ';
          data = P;
          break;
        }
        case 2: {
          channelName = 'Логарифмический амплитудный спектр';
          data = Alg;
          break;
        }
        case 3: {
          channelName = 'Логарифмический СПМ';
          data = Plg;
          break;
        }
      }
      const channel = new Channel(
        channelName,
        signal.measuresCount,
        signal.frequency,
        signal.startTime,
        `chart${channelsCount + i}`,
        signal.id
      );
      channel.values = data;
      channel.mode = 'spectral';
      channel.minimalValue = 0;
      signal.channels.push(channel);
    }
    signals.push(signal);
    signal.renderChannels();
  }

  renderSpectro(width, height, coef) {
    const sectionBase = this.measuresCount / width;
    const sectionN = parseInt(sectionBase * coef);
    const N = 2 * height;
    let matrix = [];
    let NN = N;
    let L;
    if (sectionN > N) {
      while (NN < sectionN) {
        NN += N;
      }
      L = NN / N;
    } else {
      NN = N;
      L = 1;
    }
    for (let i = 0; i < width; i++) {
      let values = [];
      let A = [];
      const n0 = i * parseInt(sectionBase);
      for (let j = n0; j < n0 + sectionN; j++) {
        const value = this.values[j];
        if (value == undefined) {
          break;
        }
        values.push(value);
      }
      const average =
        values.reduce(
          (accumulator, currentValue) => accumulator + currentValue
        ) / sectionN;
      values = values.map((value, index) => {
        const W =
          0.54 - 0.46 * Math.cos((2 * Math.PI * index) / (sectionN - 1));
        return (value - average) * W;
      });
      for (let j = sectionN; j < NN; j++) {
        values.push(0);
      }
      if (L == 1) {
        for (let j = 0; j < height; j++) {
          const complexRe = values.reduce(
            (previousValue, currentValue, index) =>
              previousValue +
              currentValue * Math.cos((-2 * Math.PI * j * index) / N)
          );
          const complexIm = values.reduce(
            (previousValue, currentValue, index) =>
              previousValue +
              currentValue * Math.sin((-2 * Math.PI * j * index) / N)
          );
          const value = {
            real: complexRe,
            imaginary: complexIm,
          };
          A.push(value);
        }
        A = A.map((value) => {
          return (
            this.period *
            Math.sqrt(
              value.real * value.real + value.imaginary * value.imaginary
            )
          );
        });
      }
      if (L > 1) {
        const L1 = -(L - 1) / 2;
        const L2 = L / 2;
        for (let j = 0; j < NN / 2; j++) {
          const complexRe = values.reduce(
            (previousValue, currentValue, index) =>
              previousValue +
              currentValue * Math.cos((-2 * Math.PI * j * index) / N)
          );
          const complexIm = values.reduce(
            (previousValue, currentValue, index) =>
              previousValue +
              currentValue * Math.sin((-2 * Math.PI * j * index) / N)
          );
          const value = {
            real: complexRe,
            imaginary: complexIm,
          };
          A.push(value);
        }
        A = A.map((value) => {
          return (
            this.period *
            Math.sqrt(
              value.real * value.real + value.imaginary * value.imaginary
            )
          );
        });
        A = A.map((value, index) => {
          sum = 0;
          for (let j = L1; j <= L2; j++) {
            sum += A[Math.abs(L * index + j)];
          }
          return sum / L;
        });
      }
      matrix.push(A);
    }
    let initialCoef = 1;
    let max = 0;
    matrix.forEach((array) => {
      array.forEach((value) => {
        if (value > max) {
          max = value;
        }
      });
    });
    let canvas1 = document.getElementById('canvas1');
    canvas1.width = width;
    canvas1.height = height;
    console.log(matrix);
    let ctx = canvas1.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas1.width, canvas1.height);
    let imageData = ctx1.getImageData(0, 0, canvas1.width, canvas1.height);
    matrix.forEach((array, rowIndex) => {
      for (let i = 0; i < array.length; i += 4) {
        const index = rowIndex + i * imageData.width;
        const B = parseInt(array[i] % 256);
        const G = parseInt(((array[i] - B) / 256) % 256);
        const R = parseInt((array[i] - B) / (256 * 256) - G / 256);
        const avg = (R + G + B) / 3;
        imageData.data[index * 4] = avg;
        imageData.data[index * 4 + 1] = avg;
        imageData.data[index * 4 + 2] = avg;
        imageData.data[index * 4 + 3] = 255;
      }
    });
    ctx2.putImageData(imageData, 0, 0);
  }

  _createScroll() {
    $(`#${this.id}-container`).append(
      `<div class="slider-container"><div class="${this.signalId}-slider" id="${this.id}-slider"></div></div>`
    );
  }

  _getSelector() {
    return `.${this.signalId}-slider`;
  }
}
