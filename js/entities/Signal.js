export class Signal {
	#renderCharts;

	constructor(name, channelsCount, measuresCount, frequency, start, id) {
		this.name = name;
		this.channelsCount = channelsCount;
		this.measuresCount = measuresCount;
		this.frequency = frequency;
		this.period = 1 / frequency * 1000;
		this.recordingTime = start;
		this.endTime = this.recordingTime + this.measuresCount * this.period;
		this.id = id;
		this.channels = [];


		this.#renderCharts = () => {
			this.channels.forEach((channel) => {
				channel.renderChart(this)
			});
		}
	}

	createCharts() {
		const SIGNAL_BUTTON_HTML =
			`<li class="d-flex justify-content-center signal"> 
				<div class="btn-group">
					<button type="button" class="signal-btn container-fluid btn btn-info" id="${this.id}-btn aria-haspopup="true" aria-expanded="false">
						${this.name}
					</button>
				</div>
			</li>`
		const CHANNELS_MENU_HTML = `<div class="channels-menu justify-content-around" id="${this.id}"></div>`;
		const SIGNAL_INFO_BUTTON_HTML = `<button class="signal-info-btn btn dropdown-item" style="white-space:normal;" id="${this.id}-info">${this.name}</button>`;

		if ($('.signal-navigation-menu-container').css('display') == 'none') {
			$('.signal-navigation-menu-container').css('display', 'block');
		}

		$('.signal-navigation-menu-container').append(CHANNELS_MENU_HTML);
		$('#signal-navigation-menu').append(SIGNAL_BUTTON_HTML);
		$('#signals-info-menu').append(SIGNAL_INFO_BUTTON_HTML);
		$('#signal-choice').append(`<option class="signal-item" value="${this.id}">${this.name}</option>`)

		this.#renderCharts();
	}
}