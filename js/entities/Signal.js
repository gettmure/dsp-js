export class Signal {
	constructor(name, channelsCount, measuresCount, frequency, start) {
		this.name = name;
		this.channelsCount = channelsCount;
		this.measuresCount = measuresCount;
		this.frequency = frequency;
		this.period = 1 / frequency;
		this.recordingTime = start;
		this.endTime = this.recordingTime + this.measuresCount * this.period;
		this.channels = [];
		this.id;
	}
}