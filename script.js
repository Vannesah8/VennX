let selectedGame = "";
let selectedStake = 0;
let walletBalance = 124;
let queueInterval = null;

function playClickSound(frequency = 700, duration = 0.04) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  const ctx = new AudioContextClass();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.025, ctx.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

function attachButtonSounds() {
  const clickable = document.querySelectorAll("button, .btn, .nav-link");
  clickable.forEach((item) => {
    item.addEventListener("click", () => {
      playClickSound(620, 0.04);
    });
  });
}

function updateStakeDisplays(totalPool, fee, winnerGets) {
  const poolText = document.getElementById("poolText");
  const feeText = document.getElementById("feeText");
  const winnerGetsText = document.getElementById("winnerGetsText");
  const winnerGetsTextSide = document.getElementById("winnerGetsTextSide");

  if (poolText) poolText.textContent = `${totalPool} KES`;
  if (feeText) feeText.textContent = `${fee} KES`;
  if (winnerGetsText) winnerGetsText.textContent = `${winnerGets} KES`;
  if (winnerGetsTextSide) winnerGetsTextSide.textContent = `${winnerGets} KES`;
}

function selectGame(game) {
  selectedGame = game;
  const gameText = document.getElementById("selectedGameText");
  if (gameText) gameText.textContent = game;
}

function selectStake(stake) {
  selectedStake = stake;

  const stakeText = document.getElementById("selectedStakeText");
  if (stakeText) stakeText.textContent = `${stake} KES`;

  const totalPool = stake * 2;
  const fee = Math.round(totalPool * 0.1);
  const winnerGets = totalPool - fee;

  updateStakeDisplays(totalPool, fee, winnerGets);
}

function startMatchmaking() {
  const queueBox = document.getElementById("queueBox");
  const resultBox = document.getElementById("resultBox");
  const resultCard = document.getElementById("resultCard");

  if (!selectedGame || !selectedStake) {
    if (queueBox) {
      queueBox.textContent = "Please select a game and a stake first.";
      queueBox.classList.remove("hidden");
    }
    return;
  }

  if (walletBalance < selectedStake) {
    if (queueBox) {
      queueBox.textContent = "Insufficient wallet balance for this match.";
      queueBox.classList.remove("hidden");
    }
    return;
  }

  if (resultBox) resultBox.classList.add("hidden");
  if (resultCard) resultCard.classList.add("hidden");

  let seconds = 3;

  if (queueBox) {
    queueBox.textContent = `Searching for opponent for ${selectedGame} at ${selectedStake} KES... ${seconds}`;
    queueBox.classList.remove("hidden");
  }

  if (queueInterval) clearInterval(queueInterval);

  queueInterval = setInterval(() => {
    seconds--;

    if (seconds > 0) {
      if (queueBox) {
        queueBox.textContent = `Searching for opponent for ${selectedGame} at ${selectedStake} KES... ${seconds}`;
      }
    } else {
      clearInterval(queueInterval);

      if (queueBox) {
        queueBox.textContent = "Opponent found. Match starting now...";
      }

      setTimeout(() => finishMatch(), 1000);
    }
  }, 1000);
}

function finishMatch() {
  const queueBox = document.getElementById("queueBox");
  const resultBox = document.getElementById("resultBox");
  const resultCard = document.getElementById("resultCard");
  const resultTitle = document.getElementById("resultTitle");
  const resultDescription = document.getElementById("resultDescription");
  const resultMeta = document.getElementById("resultMeta");
  const walletText = document.getElementById("walletBalance");

  const totalPool = selectedStake * 2;
  const fee = Math.round(totalPool * 0.1);
  const winnerGets = totalPool - fee;
  const didWin = Math.random() > 0.45;

  walletBalance -= selectedStake;
  if (didWin) {
    walletBalance += winnerGets;
  }

  if (walletText) walletText.textContent = `${walletBalance} KES`;

  if (queueBox) {
    queueBox.textContent = "Match completed. Result verified.";
  }

  if (resultBox) {
    resultBox.classList.remove("hidden");
    resultBox.textContent = didWin
      ? `Victory! You won ${winnerGets} KES in ${selectedGame}.`
      : `Defeat. You lost ${selectedStake} KES in ${selectedGame}.`;
  }

  if (resultCard && resultTitle && resultDescription && resultMeta) {
    resultCard.classList.remove("hidden");
    resultTitle.textContent = didWin ? "Victory" : "Defeat";
    resultDescription.textContent = didWin
      ? `You outperformed your opponent in ${selectedGame}. Your prize after platform fee is ${winnerGets} KES.`
      : `Your opponent won this ${selectedGame} match. Better luck next round.`;
    resultMeta.textContent = `Stake ${selectedStake} KES • Pool ${totalPool} KES • Fee ${fee} KES • Server validation placeholder`;
  }

  playClickSound(didWin ? 920 : 300, 0.06);
}

function resetPlayFlow() {
  selectedGame = "";
  selectedStake = 0;
  walletBalance = 124;

  const gameText = document.getElementById("selectedGameText");
  const stakeText = document.getElementById("selectedStakeText");
  const walletText = document.getElementById("walletBalance");
  const queueBox = document.getElementById("queueBox");
  const resultBox = document.getElementById("resultBox");
  const resultCard = document.getElementById("resultCard");

  if (gameText) gameText.textContent = "None";
  if (stakeText) stakeText.textContent = "0 KES";
  if (walletText) walletText.textContent = "124 KES";

  updateStakeDisplays(0, 0, 0);

  if (queueBox) {
    queueBox.classList.add("hidden");
    queueBox.textContent = "";
  }

  if (resultBox) {
    resultBox.classList.add("hidden");
    resultBox.textContent = "";
  }

  if (resultCard) {
    resultCard.classList.add("hidden");
  }

  if (queueInterval) {
    clearInterval(queueInterval);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  attachButtonSounds();
});
