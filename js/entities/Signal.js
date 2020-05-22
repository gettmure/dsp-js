import { Source } from "./Source.js";
import { Model } from "./Model.js";

export class Signal extends Source {
	#createButtons;
	#getModelData;

	constructor(name, channelsCount, measuresCount, frequency, startTime, id) {
		super(measuresCount, frequency, startTime, id)
		this.name = name;
		this.channelsCount = channelsCount;
		this.channels = [];
		this.models = [];

		this.#createButtons = () => {
			const SIGNAL_BUTTON_HTML =
				`<li class="d-flex justify-content-center signal"> 
					<div class="btn-group">
						<button type="button" class="signal-btn container-fluid btn btn-info" id="${this.id}-btn aria-haspopup="true" aria-expanded="false">
							${this.name}
						</button>
					</div>
				</li>`
			const CHANNELS_MENU_HTML = `<div class="channels-menu" id="${this.id}"></div>`;
			const SIGNAL_INFO_BUTTON_HTML = `<button class="signal-info-btn btn dropdown-item" style="white-space:normal;" id="${this.id}-info">${this.name}</button>`;

			if ($('.signal-navigation-menu-container').css('display') == 'none') {
				$('.signal-navigation-menu-container').css('display', 'block');
			}

			$('.signal-navigation-menu-container').append(CHANNELS_MENU_HTML);
			$('#signal-navigation-menu').append(SIGNAL_BUTTON_HTML);
			$('#signals-info-menu').append(SIGNAL_INFO_BUTTON_HTML);
			$('#signal-choice').append(`<option class="signal-item" value="${this.id}" id="${this.id.match(/\d+/)[0]}">${this.name}</option>`)
		}

		this.#getModelData = (params, type) => {
			let data = [];
			let modelFunction;
			switch (type) {
				case 'Delayed single impulse': {
					modelFunction = (params, step) => {
						const impulseDelay = params[0];
						return (step == impulseDelay ? 1 : 0);
					}
					break;
				}
				case 'Delayed single bounce': {
					modelFunction = (params, step) => {
						const bounceDelay = params[0];
						return (step >= bounceDelay ? 1 : 0);
					}
					break;
				}
				case 'Decreasing discretized exponent': {
					modelFunction = (params, step) => {
						const base = params[0];
						return Math.pow(base, step)
					}
					break;
				}
				case 'Discretized sinusoid': {
					modelFunction = (params, step) => {
						const amplitude = params[0];
						const frequency = params[1];
						const phase = params[2];
						return amplitude * Math.sin(frequency * step + phase);
					}
					break;
				}
				case 'Meander': {
					modelFunction = (params, step) => {
						const period = params[0];
						return ((step % period) < (period / 2) ? 1 : -1);
					}
					break;
				}
				case 'Saw': {
					modelFunction = (params, step) => {
						const period = params[0];
						return ((step % period) / period);
					}
					break;
				}
				case 'Exponential envelope': {
					modelFunction = (params, step) => {
						const amplitude = params[0];
						const width = params[1];
						const carrierFrequency = params[2];
						const initialPhase = params[3];
						return amplitude * Math.exp(-(step / width)) * Math.cos(2 * Math.PI * carrierFrequency * step + initialPhase);
					}
					break;
				}
				case 'Balance envelope': {
					modelFunction = (params, step) => {
						const amplitude = params[0];
						const envelopeFrequency = params[1];
						const carrierFrequency = params[2];
						const initialPhase = params[3];
						return amplitude * Math.cos(2 * Math.PI * envelopeFrequency * step) * Math.cos(2 * Math.PI * carrierFrequency * step + initialPhase);
					}
					break
				}
				case 'Tonal envelope': {
					modelFunction = (params, step) => {
						const amplitude = params[0];
						const envelopeFrequency = params[1];
						const carrierFrequency = params[2];
						const initialPhase = params[3];
						const index = params[4];
						return amplitude * (1 + index * Math.cos(2 * Math.PI * envelopeFrequency * step)) * Math.cos(2 * Math.PI * carrierFrequency * step + initialPhase);
					}
					break
				}
			}
			for (let i = 0; i < this.measuresCount; i++) {
				const value = modelFunction(params, (i + 1) * this.period / 1000);
				data.push(value);
			}
			return data;
		}
	}

	renderChannels() {
		this.#createButtons();
		this.channels.forEach((channel) => {
			channel.renderChart(this.channels)
		});
	}

	renderModel(type, parameters) {
		if (this.channels.length == 0) {
			this.#createButtons();
		}
		const modelIndex = this.channels.length + this.models.length;
		const modelId = `model-chart${modelIndex}`;
		const model = new Model(type, this.measuresCount, this.frequency, this.recordingTime, type, modelId, this.id, parameters);
		model.values = this.#getModelData(parameters, model.type);
		this.models.push(model);
		model.renderChart(this.models);
	}
}