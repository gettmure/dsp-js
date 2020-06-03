import { Source } from "./Source.js";
import { Model } from "./Model.js";
import { findElementById } from "../main.js";

export class Signal extends Source {
  #createButtons;
  #getModelData;
  constructor(name, channelsCount, measuresCount, frequency, startTime, id) {
    super(measuresCount, frequency, startTime, id);
    this.name = name;
    this.channelsCount = channelsCount;
    this.channels = [];
    this.models = [];

    this.#createButtons = () => {
      const SIGNAL_BUTTON_HTML = `<li class="d-flex justify-content-center signal"> 
					<div class="btn-group">
						<button type="button" class="signal-btn container-fluid btn btn-info" id="${this.id}-btn aria-haspopup="true" aria-expanded="false">
							${this.name}
						</button>
					</div>
				</li>`;
      const CHANNELS_MENU_HTML = `<div class="channels-menu" id="${this.id}"></div>`;
      const SIGNAL_INFO_BUTTON_HTML = `<button class="signal-info-btn btn dropdown-item" style="white-space:normal;" id="${this.id}-info">${this.name}</button>`;

      if ($(".signal-navigation-menu-container").css("display") == "none") {
        $(".signal-navigation-menu-container").css("display", "block");
      }

      $(".signal-navigation-menu-container").append(CHANNELS_MENU_HTML);
      $("#signal-navigation-menu").append(SIGNAL_BUTTON_HTML);
      $("#signals-info-menu").append(SIGNAL_INFO_BUTTON_HTML);
      $(".signal-choice").append(
        `<option class="signal-item" value="${this.id}" id="${
          this.id.match(/\d+/)[0]
        }">${this.name}</option>`
      );
    };

    this.#getModelData = (params, type) => {
      let data = [];
      let modelFunction;
      let normalLawValues = [];
      switch (type) {
        case "Delayed single impulse": {
          modelFunction = (params, step) => {
            const impulseDelay = params[0];
            return step == impulseDelay ? 1 : 0;
          };
          break;
        }
        case "Delayed single bounce": {
          modelFunction = (params, step) => {
            const bounceDelay = params[0];
            return step >= bounceDelay ? 1 : 0;
          };
          break;
        }
        case "Decreasing discretized exponent": {
          modelFunction = (params, step) => {
            const base = params[0];
            return Math.pow(base, step);
          };
          break;
        }
        case "Discretized sinusoid": {
          modelFunction = (params, step) => {
            const amplitude = params[0];
            const frequency = params[1];
            const phase = params[2];
            return amplitude * Math.sin(frequency * step + phase);
          };
          break;
        }
        case "Meander": {
          modelFunction = (params, step) => {
            const period = params[0];
            return step % period < period / 2 ? 1 : -1;
          };
          break;
        }
        case "Saw": {
          modelFunction = (params, step) => {
            const period = params[0];
            return (step % period) / period;
          };
          break;
        }
        case "Exponential envelope": {
          modelFunction = (params, step) => {
            step = (step * this.period) / 1000;
            const amplitude = params[0];
            const width = params[1];
            const carrierFrequency = params[2];
            const initialPhase = params[3];
            return (
              amplitude *
              Math.exp(-(step / width)) *
              Math.cos(2 * Math.PI * carrierFrequency * step + initialPhase)
            );
          };
          break;
        }
        case "Balance envelope": {
          modelFunction = (params, step) => {
            step = (step * this.period) / 1000;
            const amplitude = params[0];
            const envelopeFrequency = params[1];
            const carrierFrequency = params[2];
            const initialPhase = params[3];
            return (
              amplitude *
              Math.cos(2 * Math.PI * envelopeFrequency * step) *
              Math.cos(2 * Math.PI * carrierFrequency * step + initialPhase)
            );
          };
          break;
        }
        case "Tonal envelope": {
          modelFunction = (params, step) => {
            step = (step * this.period) / 1000;
            const amplitude = params[0];
            const envelopeFrequency = params[1];
            const carrierFrequency = params[2];
            const initialPhase = params[3];
            const index = params[4];
            return (
              amplitude *
              (1 + index * Math.cos(2 * Math.PI * envelopeFrequency * step)) *
              Math.cos(2 * Math.PI * carrierFrequency * step + initialPhase)
            );
          };
          break;
        }
        case "White noise (interval)": {
          modelFunction = (params, step) => {
            const left = params[0][0];
            const right = params[0][1];
            return left + (right - left) * Math.random();
          };
          break;
        }
        case "White noise (normal law)": {
          modelFunction = (params, step) => {
            const alpha = params[0];
            const sigma = Math.sqrt(params[1]);
            let randomValue = 0;
            for (let i = 0; i < 12; i++) {
              randomValue += Math.random();
            }
            randomValue -= 6;
            return alpha + sigma * randomValue;
          };
          break;
        }
        case "АРСС": {
          modelFunction = (params, step) => {
            const sigma = Math.sqrt(params[0]);
            const aCoefs = params[1];
            const bCoefs = params[2];
            const P = aCoefs.length;
            const Q = bCoefs.length;
            let randomValue = 0;
            for (let i = 0; i < 12; i++) {
              randomValue += Math.random();
            }
            randomValue -= 6;
            normalLawValues.push(sigma * randomValue);
            if (step == 0) {
              return normalLawValues[0];
            } else {
              let value = normalLawValues[step];
              for (let i = 0; i < Q; i++) {
                const index = step - i - 1;
                if (index >= 0) {
                  value += bCoefs[i] * normalLawValues[index];
                }
              }
              for (let i = 0; i < P; i++) {
                const index = step - i - 1;
                if (index >= 0) {
                  value -= aCoefs[i] * data[index];
                }
              }
              return value;
            }
          };
          break;
        }
      }
      for (let i = 0; i < this.measuresCount; i++) {
        const value = modelFunction(params, i);
        data.push(value);
      }
      return data;
    };
  }

  renderChannels() {
    this.#createButtons();
    this.channels.forEach((channel) => {
      channel.renderChart(this.channels);
    });
  }

  renderModel(type, parameters) {
    if (this.channels.length == 0 && this.models.length == 0) {
      this.#createButtons();
    }
    const modelIndex = this.channels.length + this.models.length;
    const modelId = `model-chart${modelIndex}`;
    const model = new Model(
      type,
      this.measuresCount,
      this.frequency,
      this.recordingTime,
      type,
      modelId,
      this.id,
      parameters
    );
    model.values = this.#getModelData(parameters, model.type);
    this.models.push(model);
    this.channelsCount++;
    model.renderChart(this.models);
  }

  renderSuperposition(sources) {
    let superpositionValues = new Array(this.measuresCount).fill(0);
    const modelIndex = this.channels.length + this.models.length;
    const modelId = `model-chart${modelIndex}`;
    const channels = this.channels.filter((channel) => {
      return findElementById(sources, channel.id) != undefined;
    });
    const models = this.models.filter((model) => {
      return findElementById(sources, model.id) != undefined;
    });
    if (channels) {
      channels.forEach((channel) => {
        channel.values.forEach((value, index) => {
          const coef = findElementById(sources, channel.id).value;
          superpositionValues[index] += value * coef;
        });
      });
    }
    if (models) {
      models.forEach((model) => {
        model.values.forEach((value, index) => {
          const coef = findElementById(sources, model.id).value;
          superpositionValues[index] += value * coef;
        });
      });
    }
    const superposition = new Model(
      `Суперпозиция каналов`,
      this.measuresCount,
      this.frequency,
      this.recordingTime,
      "superposition",
      modelId,
      this.id,
      []
    );
    superposition.values = superpositionValues;
    superposition.renderChart(this.channels);
    this.models.push(superposition);
  }
}
