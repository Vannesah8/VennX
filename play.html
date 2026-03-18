const AppState = {
  selectedGame: "",
  selectedStake: 0,
  walletBalance: 124,
  queueInterval: null,
  isMatchmaking: false,
};

function getElement(id) {
  return document.getElementById(id);
}

function getElements(selector) {
  return document.querySelectorAll(selector);
}

function setText(id, value) {
  const element = getElement(id);
  if (element) {
    element.textContent = value;
  }
}

function showElement(id) {
  const element = getElement(id);
  if (element) {
    element.classList.remove("hidden");
  }
}

function hideElement(id) {
  const element = getElement(id);
  if (element) {
    element.classList.add("hidden");
  }
}

function playClickSound(frequency = 700, duration = 0.04) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  try {
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

    oscillator.onended = () => {
      if (typeof ctx.close === "function") {
        ctx.close().catch(() => {});
      }
    };
  } catch (error) {
    console.warn("Audio playback was blocked or failed.", error);
  }
}

function attachButtonSounds() {
  const clickableItems = getElements("button, .btn, .nav-link, .site-nav a");

  clickableItems.forEach((item) => {
    item.addEventListener("click", () => {
      playClickSound(620, 0.04);
    });
  });
}

function attachHoverSounds() {
  const hoverItems = getElements(".feature-card, .player-card, .stat-card, .info-card");

  hoverItems.forEach((item) => {
    item.addEventListener("mouseenter", () => {
      playClickSound(760, 0.025);
    });
  });
}

function updateStakeDisplays(totalPool, fee, winnerGets) {
  setText("poolText", `${totalPool} KES`);
  setText("feeText", `${fee} KES`);
  setText("winnerGetsText", `${winnerGets} KES`);
  setText("winnerGetsTextSide", `${winnerGets} KES`);
}

function updateWalletDisplay() {
  setText("walletBalance", `${AppState.walletBalance} KES`);
}

function updateSelectionDisplay() {
  setText("selectedGameText", AppState.selectedGame || "None");
  setText(
    "selectedStakeText",
    AppState.selectedStake ? `${AppState.selectedStake} KES` : "0 KES"
  );
}

function selectGame(game) {
  AppState.selectedGame = game;
  updateSelectionDisplay();

  const gameButtons = getElements("[data-game]");
  gameButtons.forEach((button) => {
    const isActive = button.getAttribute("data-game") === game;
    button.classList.toggle("active", isActive);
  });
}

function selectStake(stake) {
  AppState.selectedStake = Number(stake) || 0;
  updateSelectionDisplay();

  const totalPool = AppState.selectedStake * 2;
  const fee = Math.round(totalPool * 0.1);
  const winnerGets = totalPool - fee;

  updateStakeDisplays(totalPool, fee, winnerGets);

  const stakeButtons = getElements("[data-stake]");
  stakeButtons.forEach((button) => {
    const isActive = Number(button.getAttribute("data-stake")) === AppState.selectedStake;
    button.classList.toggle("active", isActive);
  });
}

function showQueueMessage(message) {
  const queueBox = getElement("queueBox");
  if (!queueBox) return;

  queueBox.textContent = message;
  queueBox.classList.remove("hidden");
}

function clearQueueMessage() {
  const queueBox = getElement("queueBox");
  if (!queueBox) return;

  queueBox.textContent = "";
  queueBox.classList.add("hidden");
}

function showResultMessage(message) {
  const resultBox = getElement("resultBox");
  if (!resultBox) return;

  resultBox.textContent = message;
  resultBox.classList.remove("hidden");
}

function clearResultMessage() {
  const resultBox = getElement("resultBox");
  if (!resultBox) return;

  resultBox.textContent = "";
  resultBox.classList.add("hidden");
}

function hideResultCard() {
  hideElement("resultCard");
}

function showResultCard({ didWin, game, stake, totalPool, fee, winnerGets }) {
  const resultCard = getElement("resultCard");
  const resultTitle = getElement("resultTitle");
  const resultDescription = getElement("resultDescription");
  const resultMeta = getElement("resultMeta");

  if (!resultCard || !resultTitle || !resultDescription || !resultMeta) return;

  resultTitle.textContent = didWin ? "Victory" : "Defeat";
  resultDescription.textContent = didWin
    ? `You outperformed your opponent in ${game}. Your prize after platform fee is ${winnerGets} KES.`
    : `Your opponent won this ${game} match. Better luck next round.`;

  resultMeta.textContent = `Stake ${stake} KES • Pool ${totalPool} KES • Fee ${fee} KES • Server validation placeholder`;

  resultCard.classList.remove("hidden");
}

function stopMatchmakingInterval() {
  if (AppState.queueInterval) {
    clearInterval(AppState.queueInterval);
    AppState.queueInterval = null;
  }
  AppState.isMatchmaking = false;
}

function startMatchmaking() {
  if (AppState.isMatchmaking) return;

  if (!AppState.selectedGame || !AppState.selectedStake) {
    showQueueMessage("Please select a game and a stake first.");
    return;
  }

  if (AppState.walletBalance < AppState.selectedStake) {
    showQueueMessage("Insufficient wallet balance for this match.");
    return;
  }

  clearResultMessage();
  hideResultCard();

  let seconds = 3;
  AppState.isMatchmaking = true;

  showQueueMessage(
    `Searching for opponent for ${AppState.selectedGame} at ${AppState.selectedStake} KES... ${seconds}`
  );

  stopMatchmakingInterval();

  AppState.isMatchmaking = true;
  AppState.queueInterval = setInterval(() => {
    seconds -= 1;

    if (seconds > 0) {
      showQueueMessage(
        `Searching for opponent for ${AppState.selectedGame} at ${AppState.selectedStake} KES... ${seconds}`
      );
      return;
    }

    stopMatchmakingInterval();
    showQueueMessage("Opponent found. Match starting now...");

    setTimeout(() => {
      finishMatch();
    }, 1000);
  }, 1000);
}

function finishMatch() {
  const totalPool = AppState.selectedStake * 2;
  const fee = Math.round(totalPool * 0.1);
  const winnerGets = totalPool - fee;
  const didWin = Math.random() > 0.45;

  AppState.walletBalance -= AppState.selectedStake;

  if (didWin) {
    AppState.walletBalance += winnerGets;
  }

  updateWalletDisplay();
  showQueueMessage("Match completed. Result verified.");

  if (didWin) {
    showResultMessage(
      `Victory! You won ${winnerGets} KES in ${AppState.selectedGame}.`
    );
  } else {
    showResultMessage(
      `Defeat. You lost ${AppState.selectedStake} KES in ${AppState.selectedGame}.`
    );
  }

  showResultCard({
    didWin,
    game: AppState.selectedGame,
    stake: AppState.selectedStake,
    totalPool,
    fee,
    winnerGets,
  });

  playClickSound(didWin ? 920 : 300, 0.06);
}

function resetPlayFlow() {
  stopMatchmakingInterval();

  AppState.selectedGame = "";
  AppState.selectedStake = 0;
  AppState.walletBalance = 124;

  updateSelectionDisplay();
  updateWalletDisplay();
  updateStakeDisplays(0, 0, 0);
  clearQueueMessage();
  clearResultMessage();
  hideResultCard();

  const activeButtons = getElements("[data-game].active, [data-stake].active");
  activeButtons.forEach((button) => button.classList.remove("active"));
}

function initRevealMotion() {
  const revealItems = getElements(".reveal-up");

  if (!revealItems.length) return;

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          currentObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealItems.forEach((item) => observer.observe(item));
}

function initAutoBinding() {
  const gameButtons = getElements("[data-game]");
  gameButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const game = button.getAttribute("data-game");
      if (game) selectGame(game);
    });
  });

  const stakeButtons = getElements("[data-stake]");
  stakeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const stake = button.getAttribute("data-stake");
      if (stake) selectStake(stake);
    });
  });

  const startButton = getElement("startMatchBtn");
  if (startButton) {
    startButton.addEventListener("click", startMatchmaking);
  }

  const resetButton = getElement("resetPlayBtn");
  if (resetButton) {
    resetButton.addEventListener("click", resetPlayFlow);
  }
}

function initPageDefaults() {
  updateSelectionDisplay();
  updateWalletDisplay();

  if (!AppState.selectedStake) {
    updateStakeDisplays(0, 0, 0);
  }
}

function initApp() {
  attachButtonSounds();
  attachHoverSounds();
  initRevealMotion();
  initAutoBinding();
  initPageDefaults();
}

window.selectGame = selectGame;
window.selectStake = selectStake;
window.startMatchmaking = startMatchmaking;
window.finishMatch = finishMatch;
window.resetPlayFlow = resetPlayFlow;

document.addEventListener("DOMContentLoaded", initApp);
