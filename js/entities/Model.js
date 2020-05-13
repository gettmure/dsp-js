export class Model {
    constructor(name, measuresCount, frequency, recordingTime, id) {
        this.name = name;
        this.measuresCount = measuresCount;
        this.frequency = frequency;
        this.period = 1 / frequency * 1000;
        this.recordingTime = start;
        this.endTime = this.recordingTime + this.measuresCount * this.period;
        this.id = id;
        this.chart;
    }
}