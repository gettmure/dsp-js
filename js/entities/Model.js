import { Channel } from "./Channel.js";

export class Model extends Channel {
    constructor(name, measuresCount, frequency, start, type, id, signalId) {
        super(name, measuresCount, frequency, start, id, signalId);
        this.type = type;
    }

    _createScroll() {
        $(`#${this.id}-container`).append(`<div class="slider-container"><div class="${this.signalId}-model-slider" id="${this.id}-slider"></div></div>`);
    }

    _getSelector() {
        return `.${this.signalId}-model-slider`;
    }
}