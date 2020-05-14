export class Source {
    constructor(measuresCount, frequency, startTime, id) {
        this.measuresCount = measuresCount;
        this.frequency = frequency;
        this.period = 1 / frequency * 1000;
        this.recordingTime = startTime;
        this.endTime = this.recordingTime + this.measuresCount * this.period;
        this.id = id;
    }
}