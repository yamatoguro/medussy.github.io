let currentRaceIndex = 0;
let currentMatch = [];
let winnerIndex = null;

// Ban/pick state
const allOptions = ['Chimera', 'Cornivus', 'Nimble-Lite', 'Rampage', 'Recycler'];
let bannedByFirst = null;
let bannedBySecond = [];
let finalPick = null;

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

  tick();
  return setInterval(tick, 1000);
}

function loadRace(index) {
  const raceArray = window.races || [];

  if (!Array.isArray(raceArray) || raceArray.length === 0 || index >= raceArray.length) {
    document.getElementById("raceHeader").textContent = "No races are scheduled at this time.";
    document.getElementById("countdown").textContent = "";
    document.getElementById("streamContainer").innerHTML = "";
    currentMatch = [];
    return;
  }

  const race = raceArray[index];
  currentMatch = race.match;

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

function startBanPhase() {
  const firstPlayer = currentMatch[winnerIndex];
  const secondPlayer = currentMatch[1 - winnerIndex];

  bannedByFirst = null;
  bannedBySecond = [];
  finalPick = null;

  const banArea = document.getElementById('banArea');
  banArea.innerHTML = `<h3>${firstPlayer.display} bans one option:</h3>`;
  allOptions.forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.onclick = () => banByFirst(opt);
    banArea.appendChild(btn);
  });
}

function banByFirst(option) {
  bannedByFirst = option;
  logEntry('log-first', `${currentMatch[winnerIndex].display} banned: ${option}`);

  const secondPlayer = currentMatch[1 - winnerIndex];
  const banArea = document.getElementById('banArea');
  banArea.innerHTML = `<h3>${secondPlayer.display} bans two options:</h3>`;
  const remaining = allOptions.filter(opt => opt !== bannedByFirst);
  remaining.forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.disabled = opt === bannedByFirst;
    if (opt === bannedByFirst) btn.classList.add('banned-by-first');
    else btn.onclick = () => banBySecond(opt);
    banArea.appendChild(btn);
  });
}

function banBySecond(option) {
  if (bannedBySecond.includes(option)) return;
  bannedBySecond.push(option);
  logEntry('log-second', `${currentMatch[1 - winnerIndex].display} banned: ${option}`);

  const buttons = document.querySelectorAll('#banArea button');
  buttons.forEach(btn => {
    if (btn.textContent === option) {
      btn.disabled = true;
      btn.classList.add('banned-by-second');
    }
  });

  if (bannedBySecond.length === 2) {
    const firstPlayer = currentMatch[winnerIndex];
    const banArea = document.getElementById('banArea');
    banArea.innerHTML += `<h3>${firstPlayer.display} picks one of the remaining options:</h3>`;
    const remaining = allOptions.filter(opt =>
      opt !== bannedByFirst && !bannedBySecond.includes(opt)
    );
    remaining.forEach(opt => {
      const btn = document.createElement('button');
      btn.textContent = opt;
      btn.onclick = () => pickFinal(opt);
      banArea.appendChild(btn);
    });
  }
}

function pickFinal(option) {
  finalPick = option;
  const banArea = document.getElementById('banArea');
  banArea.innerHTML = `<h3>Final pick: ${option}</h3>`;
  logEntry('log-final', `Final pick: ${option}`);

  const winnerSelector = document.getElementById('winnerSelector');
  const winnerButtons = [document.getElementById('winner0'), document.getElementById('winner1')];

  if (Array.isArray(currentMatch) && currentMatch.length === 2) {
    winnerButtons[0].textContent = `Winner: ${currentMatch[0].display}`;
    winnerButtons[1].textContent = `Winner: ${currentMatch[1].display}`;
  }

  winnerSelector.style.display = 'block';
}

function logEntry(type, text) {
  const banLog = document.getElementById('banLog');
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  entry.textContent = text;
  banLog.appendChild(entry);
}

document.addEventListener("DOMContentLoaded", () => {
  loadRace(currentRaceIndex);

  const coin = document.getElementById('coin');
  const coinImg = coin.querySelector('img');
  const resultTextElement = document.getElementById('resultText');

  const playerImages = [
    './images/360.png',
    './images/garnetcoin.png'
  ];

  coin.addEventListener('click', function () {
    if (!Array.isArray(currentMatch) || currentMatch.length < 2) {
      resultTextElement.textContent = 'No match loaded.';
      return;
    }

    coin.classList.add('flipping');
    resultTextElement.textContent = 'Flipping...';

    setTimeout(function () {
      winnerIndex = Math.random() <= 0.5 ? 0 : 1;
      const selectedRacer = currentMatch[winnerIndex];
      const newSrc = playerImages[winnerIndex];

      coinImg.src = newSrc;
      coin.classList.remove('flipping');
      resultTextElement.textContent = `${selectedRacer.display} wins the flip!`;

      startBanPhase();
    }, 1200);
  });
  const winnerButtons = [document.getElementById('winner0'), document.getElementById('winner1')];
  const winnerSelector = document.getElementById('winnerSelector');

  winnerButtons.forEach((btn, index) => {
  btn.onclick = () => {
    if (!Array.isArray(currentMatch) || currentMatch.length < 2) return;
    winnerIndex = index;
    const winner = currentMatch[winnerIndex];
    const loser = currentMatch[1 - winnerIndex];
    document.getElementById('resultText').textContent = `${winner.display} is selected as the winner.`;
    logEntry('log-winner', `Race winner: ${winner.display}`);

    const banArea = document.getElementById('banArea');
    banArea.innerHTML = `<h3>${winner.display} bans one option:</h3>`;
    allOptions.forEach(opt => {
      const btn = document.createElement('button');
      btn.textContent = opt;
      btn.onclick = () => {
        logEntry('log-first', `${winner.display} banned: ${opt}`);
        const remaining = allOptions.filter(o => o !== opt);
        banArea.innerHTML = `<h3>${loser.display} selects one of the remaining options:</h3>`;
        remaining.forEach(choice => {
          const pickBtn = document.createElement('button');
          pickBtn.textContent = choice;
          pickBtn.onclick = () => {
            finalPick = choice;
            banArea.innerHTML = `<h3>Final pick: ${choice}</h3>`;
            logEntry('log-final', `Final pick: ${choice}`);
            winnerSelector.style.display = 'block';
          };
          banArea.appendChild(pickBtn);
        });
      };
      banArea.appendChild(btn);
    });

    winnerSelector.style.display = 'none';
  };
});

});