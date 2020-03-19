import { Signal } from './entities/Signal.js';
import { Channel } from './entities/Channel.js';

function parseDateTime(date) {
	const dateElements = date.split(/\D/);
	return new Date(dateElements[0], dateElements[1] - 1, dateElements[2], dateElements[3], dateElements[4], dateElements[5]);
}

export function parseTxtFile(signalName, event) {
	const fileData = event.target.result.split('\n').filter(line => line[0] != '#');
	const startDate = fileData[3].replace(/(\d{2})-(\d{2})-(\d{4})/, "$3-$2-$1");
	const startTime = fileData[4];
	const date = `${startDate} ${startTime}`;
	const unixtime = parseDateTime(date).getTime();
	let signal = new Signal(signalName, parseInt(fileData[0]), parseInt(fileData[1]), parseFloat(fileData[2]), unixtime);
	fileData[5].split(';').forEach(channelName => {
		if (channelName == "") {
			return;
		}
		signal.channels.push(new Channel(channelName));
	});
	for (let lineIndex = 6; lineIndex < fileData.length; lineIndex++) {
		if (fileData[lineIndex] == '') {
			break;
		}
		for (let channelIndex = 0; channelIndex < signal.channelsCount; channelIndex++) {
			const data = fileData[lineIndex].split(' ');
			signal.channels[channelIndex].values.push(parseFloat(data[channelIndex]));
		}
	}
	return signal;
}