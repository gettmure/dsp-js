import { findElementById } from './main.js';

export function createChannelChoiceButtons(signals, signalId) {
  if (signals.length != 0) {
    const signal = findElementById(signals, signalId);
    let CHANNELS_SELECT_HTML = '';
    if (signal.channels.length != 0) {
      signal.channels.forEach((channel) => {
        CHANNELS_SELECT_HTML += `
          <option class="signal-item" value="${channel.id}" id="${channel.id}">${channel.name}
          </option>`;
      });
    }
    if (signal.models.length != 0) {
      signal.models.forEach((model) => {
        CHANNELS_SELECT_HTML += `
          <option class="signal-item" value="${model.id}" id="${model.id}">${model.name}
          </option>`;
      });
    }
    $('.channel-choice').html(CHANNELS_SELECT_HTML);
  }
}
