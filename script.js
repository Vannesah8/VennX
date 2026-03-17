let selectedGame = "";
let selectedStake = 0;
let walletBalance = 124;
let queueInterval = null;

function showScreen(screenId) {
  const screens = document.querySelectorAll(".screen");
  screens.forEach((screen) => screen.classList.remove("active"));

  const selected = document.getElementById(screenId);
  if (selected) {
    selected.classList.add("active");
  }
}

function joinMatch(game, stake) {
  const messageBox = document.getElementById("messageBox");
  if (messageBox) {
    messageBox.textContent =
      `Queued for ${game} at ${stake} KES. In production, wallet checks and matchmaking must happen on the server.`;
    messageBox.classList.remove("hidden");
  }

  playClickSound(720, 0.05);
  setTimeout(() => playClickSound(920, 0.04), 45);
}

function playClickSound(frequency = 700, duration = 0.05) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  const ctx = new AudioContextClass();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

function attachButtonSounds() {
  const buttons = document.querySelectorAll("button");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      playClickSound(640, 0.045);
    });
  });
}

function selectGame(game) {
  selectedGame = game;
  const gameText = document.getElementById("selectedGameText");
  if (gameText) {
    gameText.textContent = game;
  }
}

function selectStake(stake) {
  selectedStake = stake;

  const stakeText = document.getElementById("selectedStakeText");
  const poolText = document.getElementById("poolText");
  const winnerGetsText = document.getElementById("winnerGetsText");
  const feeText = document.getElementById("feeText");

  const totalPool = stake * 2;
  const fee = Math.round(totalPool * 0.1);
  const winnerGets = totalPool - fee;

  if (stakeText) stakeText.textContent = `${stake} KES`;
  if (poolText) poolText.textContent = `${totalPool} KES`;
  if (winnerGetsText) winnerGetsText.textContent = `${winnerGets} KES`;
  if (feeText) feeText.textContent = `${fee} KES`;
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

  if (queueInterval) {
    clearInterval(queueInterval);
  }

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

      setTimeout(() => {
        finishMatch();
      }, 1200);
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

  if (walletText) {
    walletText.textContent = `${walletBalance} KES`;
  }

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

  playClickSound(didWin ? 980 : 320, 0.08);
  setTimeout(() => playClickSound(didWin ? 1180 : 260, 0.06), 70);
}

function resetPlayFlow() {
  selectedGame = "";
  selectedStake = 0;
  walletBalance = 124;

  const idsToReset = {
    selectedGameText: "None",
    selectedStakeText: "0 KES",
    poolText: "0 KES",
    winnerGetsText: "0 KES",
    feeText: "0 KES",
    walletBalance: "124 KES"
  };

  Object.keys(idsToReset).forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = idsToReset[id];
    }
  });

  const queueBox = document.getElementById("queueBox");
  const resultBox = document.getElementById("resultBox");
  const resultCard = document.getElementById("resultCard");

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
