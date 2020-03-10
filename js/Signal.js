class Signal {
    constructor(name, channelsCount, measuresCount, frequency, unixtime) {
        this.name = name;
        this.channelsCount = channelsCount;
        this.measuresCount = measuresCount;
        this.frequency = frequency;
        this.recordingTime = unixtime;
        this.channels = [];
    }
}
