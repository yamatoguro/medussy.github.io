const options = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZoneName: 'short'
};

const raceList = document.getElementById('race-list');
const raceData = window.races || [];
const now = new Date();
let hasUpcomingOrLive = false;

if (raceData.length === 0) {
  const li = document.createElement('li');
  li.textContent = "No races scheduled at this time.";
  raceList.appendChild(li);
} else {
  raceData.forEach(race => {
    const raceTime = new Date(race.estTime);
    const raceEnd = new Date(raceTime.getTime() + 4 * 60 * 60 * 1000); // 4 hours later

    if (now < raceEnd) {
      hasUpcomingOrLive = true;

      const li = document.createElement('li');
      const localTime = raceTime.toLocaleString(undefined, options);
      const displayNames = race.match.map(s => s.display).join(" vs ");

      if (now >= raceTime) {
        li.innerHTML = `<strong>${displayNames}:</strong> <span style="color: #0f0;">Race is live!</span> (started ${localTime})`;
      } else {
        li.innerHTML = `<strong>${displayNames}:</strong> ${localTime}`;
      }

      raceList.appendChild(li);
    }
  });

  if (!hasUpcomingOrLive) {
    const li = document.createElement('li');
    li.textContent = "No races scheduled at this time.";
    raceList.appendChild(li);
  }
}