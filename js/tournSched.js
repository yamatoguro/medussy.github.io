const races = [
      { match: "Eldri7ch vs Renantrl", estTime: "2025-10-21T18:00:00-04:00" }
    ];

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

    if (races.length === 0) {
      const li = document.createElement('li');
      li.textContent = "No races scheduled at this time.";
      raceList.appendChild(li);
    } else {
      races.forEach(race => {
        const localTime = new Date(race.estTime).toLocaleString(undefined, options);
        const li = document.createElement('li');
        li.innerHTML = `<strong>${race.match}:</strong> ${localTime}`;
        raceList.appendChild(li);
      });
    }