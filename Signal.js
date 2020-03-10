class Signal {
    constructor(channelsCount, measuresCount, frequency, unixtime) {
        this.channelsCount = channelsCount;
        this.measuresCount = measuresCount;
        this.frequency = frequency;
        this.recordingTime = unixtime;
        this.channels = [];
    }
}
