let currentRaceIndex = 0;

function parseStreamers(matchString) {
  return matchString
    .split(/\s+vs\s+/i)
    .map(name => ({ platform: 'twitch', channel: name.trim() }));
}

function getEmbedURL({ platform, channel }) {
  const parent = location.hostname;
  if (platform === 'twitch') {
    return `https://player.twitch.tv/?channel=${channel}&parent=${parent}`;
  }
  if (platform === 'youtube') {
    return `https://www.youtube.com/embed/${channel}`;
  }
  return '';
}

function injectStreams(streamers) {
  const container = document.getElementById('streamContainer');
  container.innerHTML = '';
  streamers.forEach(({ channel }) => {
    const iframe = document.createElement('iframe');
    iframe.src = getEmbedURL({ platform: 'twitch', channel });
    iframe.allowFullscreen = true;
    container.appendChild(iframe);
  });
}

function injectRaceHeader(streamers, time) {
  const header = document.getElementById("raceHeader");
  const localTime = new Date(time).toLocaleString(undefined, {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short'
  });
  const names = streamers.map(s => s.display).join(" vs ");
  header.textContent = `${names} — ${localTime}`;
}

function updateCountdown(raceTime) {
  const countdownEl = document.getElementById("countdown");

  function tick() {
    const now = new Date();
    const diff = new Date(raceTime) - now;

    if (diff <= 0) {
      countdownEl.textContent = "Race is live!";
      return;
    }

    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    countdownEl.textContent = `Race starts in ${hours}h ${minutes}m ${seconds}s`;
  }

  tick(); // initial call
  return setInterval(tick, 1000);
}

function loadRace(index) {
  const raceArray = window.races || [];

  if (!Array.isArray(raceArray) || raceArray.length === 0 || index >= raceArray.length) {
    document.getElementById("raceHeader").textContent = "No races are scheduled at this time.";
    document.getElementById("countdown").textContent = "";
    document.getElementById("streamContainer").innerHTML = "";
    return;
  }

  const race = raceArray[index];
  injectRaceHeader(race.match, race.estTime);
  injectStreams(race.match);

  const countdownTimer = updateCountdown(race.estTime);

  const raceStart = new Date(race.estTime);
  const switchTime = raceStart.getTime() + 4 * 60 * 60 * 1000;
  const now = Date.now();
  const delay = Math.max(0, switchTime - now);

  setTimeout(() => {
    clearInterval(countdownTimer);
    currentRaceIndex++;
    loadRace(currentRaceIndex);
  }, delay);
}

document.addEventListener("DOMContentLoaded", () => {
  loadRace(currentRaceIndex);
});