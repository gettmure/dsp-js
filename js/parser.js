import { Signal } from "./entities/Signal.js";
import { Channel } from "./entities/Channel.js";

let channelIndex = 0;

export function parseDateTime(date) {
  const dateElements = date.split(/\D/);
  dateElements.filter((element) => element != "" || element != null);
  return new Date(
    dateElements[0],
    dateElements[1] - 1,
    dateElements[2],
    dateElements[3],
    dateElements[4],
    dateElements[5],
    dateElements[6]
  );
}

export function parseTxtFile(signalName, fileContent, signalIndex) {
  const fileData = fileContent.split("\n").filter((line) => line[0] != "#");
  const channelsCount = parseInt(fileData[0]);
  const measuresCount = parseInt(fileData[1]);
  const frequency = parseFloat(fileData[2]);
  const startDate = fileData[3].replace(/(\d{2})-(\d{2})-(\d{4})/, "$3-$2-$1");
  const startTime = fileData[4];
  const date = `${startDate} ${startTime}`;
  const unixtime = parseDateTime(date).getTime();
  const signalId = `signal${signalIndex}`;
  const signal = new Signal(
    signalName,
    channelsCount,
    measuresCount,
    frequency,
    unixtime,
    signalId
  );
  fileData[5].split(";").forEach((channelName) => {
    if (channelName == "") {
      return;
    }
    const channelId = `chart${channelIndex}`;
    signal.channels.push(
      new Channel(
        channelName,
        measuresCount,
        frequency,
        unixtime,
        channelId,
        signalId
      )
    );
    channelIndex++;
  });
  for (let lineIndex = 6; lineIndex < fileData.length; lineIndex++) {
    if (fileData[lineIndex] == "") {
      break;
    }
    for (
      let channelIndex = 0;
      channelIndex < signal.channelsCount;
      channelIndex++
    ) {
      const data = fileData[lineIndex].split(" ");
      data.pop();
      signal.channels[channelIndex].values.push(parseFloat(data[channelIndex]));
    }
  }
  signalIndex++;
  return signal;
}
