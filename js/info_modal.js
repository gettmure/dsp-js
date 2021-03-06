const MILLISECONDS_PER_DAY = 86400000;
const MILLISECONDS_PER_HOUR = 3600000;
const MILLISECONDS_PER_MINUTE = 60000;
const MILLISECONDS_PER_SECOND = 1000;

export function showSignalInfo(signal) {
  const name = signal.name;
  const channelsCount = signal.channelsCount;
  const pointsCount = signal.measuresCount;
  const frequency = signal.frequency;
  const period = signal.period;
  const recordedAt = signal.recordingTime;
  const endTime = signal.endTime;
  const startDate = new Date(recordedAt);
  const endDate = new Date(endTime);
  const duration = getDatesDifference(endDate.getTime() - startDate.getTime());
  $('#modal-signal-name').text(`Информация о сигнале ${name}`);
  $('#modal-signal-info').html(`
    Общее число каналов: ${channelsCount} <br>
    Общее количество отсчетов: ${pointsCount} <br>
    Частота дискретизации: ${frequency} Гц (шаг между отсчетами ${period} сек <br>
    Дата и время начала записи: ${getValidDate(startDate)} <br>
    Дата и время окончания записи: ${getValidDate(endDate)} <br>
    Длительность: ${duration} <br>
	`);
  $('#modal-signal-info').append(`
    <table class="table table-bordered">
      <thead>
    	  <tr>
      	  <th scope="col">
            №
          </th>
          <th scope="col">
            Имя
          </th>
        	<th scope="col">
            Источник
          </th>
        </tr>
      </thead>
      <tbody class="channels-table">
      </tbody>
    </table>
    `);
  signal.channels.forEach((channel, index) => {
    $('.channels-table').append(`
    	<tr>
      	<th scope="row">
        	${index + 1}
      	</th>
      	<td>
        	${channel.name}
      	</td>
      	<td>
        	${signal.name}
      	</td>
    	</tr>
  	`);
  })
  $('#signal-info-modal').modal();
}

function getDatesDifference(unixtime) {
  const days = Math.floor(unixtime / MILLISECONDS_PER_DAY);
  unixtime -= days * MILLISECONDS_PER_DAY;

  const hours = Math.floor(unixtime / MILLISECONDS_PER_HOUR);
  unixtime -= hours * MILLISECONDS_PER_HOUR;

  const minutes = Math.floor(unixtime / MILLISECONDS_PER_MINUTE);
  unixtime -= minutes * MILLISECONDS_PER_MINUTE;

  const seconds = Math.floor(unixtime / MILLISECONDS_PER_SECOND);
  unixtime -= seconds * MILLISECONDS_PER_SECOND;

  let milliseconds = unixtime;

  return `${days} дней ${hours} часов ${minutes} минут ${seconds} секунд ${milliseconds} миллисекунд`;
}

function getValidDate(date) {
  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  Math.floor(month / 10) == 0 ? month = `0${month}` : month;
  let day = date.getDate();
  Math.floor(day / 10) == 0 ? day = `0${day}` : day;
  let hours = date.getHours();
  Math.floor(hours / 10) == 0 ? hours = `0${hours}` : hours;
  let minutes = date.getMinutes();
  Math.floor(minutes / 10) == 0 ? minutes = `0${minutes}` : minutes;
  let seconds = + date.getSeconds();
  Math.floor(seconds / 10) == 0 ? seconds = `0${seconds}` : seconds;
  const milliseconds = + date.getMilliseconds();

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}.${milliseconds}`;
}