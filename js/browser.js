const player = new Twitch.Player("twitch", {
    channel: "dr4gonblitz",
    width: "100%",
    height: "100%"
});

player.addEventListener(Twitch.Player.READY, function initiate() {
    player.addEventListener(Twitch.Player.ONLINE, handleOnline);
    player.addEventListener(Twitch.Player.OFFLINE, handleOffline);
    player.removeEventListener(Twitch.Player.READY, initiate);
});

function handleOnline() {
    document.getElementById("twitch").classList.remove('hide');
    document.getElementById("chat").classList.remove('hide');
    document.getElementById("youtube").classList.add('hide');
    player.setMuted(false);
}

function handleOffline() {
    document.getElementById("twitch").classList.add('hide');
    document.getElementById("chat").classList.add('hide');
    document.getElementById("youtube").classList.remove('hide');
    player.setMuted(true);
}
// Coin Flip function
document.addEventListener('DOMContentLoaded', function () {
    const coin = document.getElementById('coin');
    const coinImg = coin.querySelector('img');
    const resultTextElement = document.getElementById('resultText');

    coin.addEventListener('click', function () {
        coin.classList.add('flipping');
        resultTextElement.textContent = 'Flipping...';

        setTimeout(function () {
            const flipResult = Math.random();
            let newSrc;
            let resultMessage;

            if (flipResult <= 0.5) {
                newSrc = './images/360.png';
                resultMessage = 'Heads';
            } else {
                newSrc = './images/garnetcoin.png';
                resultMessage = 'Tails';
            }

            coinImg.src = newSrc;
            coin.classList.remove('flipping');
            resultTextElement.textContent = resultMessage;

        }, 1200);
    });
});
