import { findElementById } from "./main.js";

export function createChannelsCheckboxes(signal) {
  const getChannelCheckboxHtml = (channel) => {
    return `
      <div class="form-check">
        <input class="form-check-input" type="checkbox" value="${channel.id}" id="${channel.name}-checkbox">
        <label class="form-check-label" for="${channel.name}-checkbox">
         ${channel.name}
        </label>
      </div>`;
  };
  let channels = "";
  if (signal.channels.length != 0) {
    signal.channels.forEach((channel) => {
      channels += getChannelCheckboxHtml(channel);
    });
  }
  if (signal.models.length != 0) {
    signal.models.forEach((model) => {
      channels += getChannelCheckboxHtml(model);
    });
  }
  $("#channels-checkbox").html(channels);
}

export function saveFile(signal) {
  const outputData = getOutputData(signal);
  const fileName = $("#file-name").val();
  let anchor = document.createElement("a");
  const blob = new Blob([outputData], { type: "text/plain" });
  anchor.download = fileName;
  anchor.href = (window.webkitURL || window.URL).createObjectURL(blob);
  anchor.dataset.downloadurl = [
    "text/plain",
    anchor.download,
    anchor.href,
  ].join(":");
  anchor.click();
}

function getOutputData(signal) {
  let channels = [];
  let valuesString = "";
  const date = new Date(signal.recordingTime).toISOString().split("T");
  let savingChannelsCount = 0;
  const sources = Array.from(
    document.getElementsByClassName("form-check-input")
  )
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => ({
      id: checkbox.value,
      name: checkbox.id.split("-")[0],
    }));
  sources.forEach((sourceObject) => {
    const isModel = sourceObject.id.match(/model/gm) != null;
    let source;
    if (isModel) {
      source = findElementById(signal.models, sourceObject.id);
    } else {
      source = findElementById(signal.channels, sourceObject.id);
    }
    savingChannelsCount++;
    channels.push(source);
  });
  for (let i = 0; i < signal.measuresCount; i++) {
    for (let j = 0; j < channels.length; j++) {
      valuesString += `${channels[j].values[i]} `;
    }
    valuesString += "\n";
  }
  const day = date[0];
  const time = date[1].slice(0, -1);
  let data = `${savingChannelsCount}\n${signal.measuresCount}\n${
    signal.frequency
  }\n${day}\n${time}\n${sources
    .map((source) => source.name)
    .join(";")}\n${valuesString}`;
  return data;
}
