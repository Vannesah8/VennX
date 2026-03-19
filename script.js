const API_URL = "https://vennx-backend.onrender.com";

const AppState = {
  selectedGame: "",
  selectedStake: 0,
  walletBalance: 0,
  token: "",
  activeMatchId: null,
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

  resultMeta.textContent = `Stake ${stake} KES • Pool ${totalPool} KES • Fee ${fee} KES • Server verified`;
  resultCard.classList.remove("hidden");
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
    console.warn("Audio playback failed.", error);
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

async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (AppState.token) {
    headers.Authorization = `Bearer ${AppState.token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

async function loginDemoUser() {
  const savedToken = localStorage.getItem("vennx_token");
  if (savedToken) {
    AppState.token = savedToken;
    return;
  }

  const data = await apiFetch("/api/auth/login", {
    method: "POST",
    headers: {},
    body: JSON.stringify({
      username: "apollo",
      password: "1234",
    }),
  });

  if (data.token) {
    AppState.token = data.token;
    localStorage.setItem("vennx_token", data.token);
  }
}

async function fetchWallet() {
  const data = await apiFetch("/api/wallet", {
    method: "GET",
  });

  if (typeof data.balance === "number") {
    AppState.walletBalance = data.balance;
    updateWalletDisplay();
  }
}

async function fetchLeaderboard() {
  const leaderboardBody = getElement("leaderboardBody");
  if (!leaderboardBody) return;

  try {
    const data = await apiFetch("/api/leaderboard", {
      method: "GET",
      headers: {},
    });

    leaderboardBody.innerHTML = "";

    data.forEach((player) => {
      const matchesPlayed = player.wins + player.losses;
      const winRate = matchesPlayed > 0 ? Math.round((player.wins / matchesPlayed) * 100) : 0;

      const row = document.createElement("div");
      row.className = "leaderboard-row";
      row.innerHTML = `
        <span>#${player.rank}</span>
        <span>${player.username}</span>
        <span>${player.wins}</span>
        <span>${winRate}%</span>
      `;
      leaderboardBody.appendChild(row);
    });
  } catch (error) {
    console.error("Leaderboard load failed:", error.message);
  }
}

async function startMatchmaking() {
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
  AppState.isMatchmaking = true;

  try {
    showQueueMessage("Submitting match request...");
    const data = await apiFetch("/api/matches/queue", {
      method: "POST",
      body: JSON.stringify({
        game: AppState.selectedGame,
        stake: AppState.selectedStake,
      }),
    });

    await fetchWallet();

    if (data.status === "searching") {
      showQueueMessage("Waiting for opponent...");
      AppState.isMatchmaking = false;
      return;
    }

    if (data.status === "matched" && data.match?.id) {
      AppState.activeMatchId = data.match.id;
      showQueueMessage("Opponent found. Match starting now...");

      setTimeout(async () => {
        await finishMatch();
      }, 1200);

      return;
    }

    showQueueMessage("Unexpected matchmaking response.");
    AppState.isMatchmaking = false;
  } catch (error) {
    showQueueMessage(error.message);
    AppState.isMatchmaking = false;
  }
}

async function finishMatch() {
  if (!AppState.activeMatchId) {
    showQueueMessage("No active match found.");
    AppState.isMatchmaking = false;
    return;
  }

  try {
    showQueueMessage("Match in progress...");
    const data = await apiFetch("/api/matches/result", {
      method: "POST",
      body: JSON.stringify({
        matchId: AppState.activeMatchId,
      }),
    });

    const totalPool = AppState.selectedStake * 2;
    const fee = Math.round(totalPool * 0.1);
    const winnerGets = totalPool - fee;

    AppState.walletBalance = data.balance;
    updateWalletDisplay();

    showQueueMessage("Match completed. Result verified.");

    if (data.didWin) {
      showResultMessage(
        `Victory! You won ${winnerGets} KES in ${AppState.selectedGame}.`
      );
    } else {
      showResultMessage(
        `Defeat. You lost ${AppState.selectedStake} KES in ${AppState.selectedGame}.`
      );
    }

    showResultCard({
      didWin: data.didWin,
      game: AppState.selectedGame,
      stake: AppState.selectedStake,
      totalPool,
      fee,
      winnerGets,
    });

    AppState.activeMatchId = null;
    AppState.isMatchmaking = false;

    playClickSound(data.didWin ? 920 : 300, 0.06);
  } catch (error) {
    showQueueMessage(error.message);
    AppState.isMatchmaking = false;
  }
}

async function resetPlayFlow() {
  AppState.selectedGame = "";
  AppState.selectedStake = 0;
  AppState.activeMatchId = null;
  AppState.isMatchmaking = false;

  updateSelectionDisplay();
  updateStakeDisplays(0, 0, 0);
  clearQueueMessage();
  clearResultMessage();
  hideResultCard();

  const activeButtons = getElements("[data-game].active, [data-stake].active");
  activeButtons.forEach((button) => button.classList.remove("active"));

  try {
    await fetchWallet();
  } catch (error) {
    console.error("Wallet refresh failed:", error.message);
  }
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

async function initApp() {
  attachButtonSounds();
  attachHoverSounds();
  initRevealMotion();
  initAutoBinding();
  initPageDefaults();

  try {
    await loginDemoUser();
    await fetchWallet();
    await fetchLeaderboard();
  } catch (error) {
    console.error("App init failed:", error.message);
    showQueueMessage(`Backend connection failed: ${error.message}`);
  }
}

window.selectGame = selectGame;
window.selectStake = selectStake;
window.startMatchmaking = startMatchmaking;
window.finishMatch = finishMatch;
window.resetPlayFlow = resetPlayFlow;

document.addEventListener("DOMContentLoaded", initApp);

// ===== REACTION RUSH GAME =====

const RR = {
  score: 0,
  time: 20,
  playing: false,
  timer: null,
};

function startReactionGame() {
  showElement("reactionGame");
  hideElement("resultCard");

  RR.score = 0;
  RR.time = 20;
  RR.playing = false;

  setText("rrScore", 0);
  setText("rrTime", 20);

  const countdownEl = getElement("rrCountdown");
  const target = getElement("rrTarget");

  target.classList.add("hidden");
  countdownEl.classList.remove("hidden");

  let count = 3;
  countdownEl.textContent = count;

  const countdownInterval = setInterval(() => {
    count--;

    if (count === 0) {
      clearInterval(countdownInterval);
      countdownEl.classList.add("hidden");
      startRRGameplay();
      return;
    }

    countdownEl.textContent = count;
  }, 1000);
}

function startRRGameplay() {
  RR.playing = true;

  const target = getElement("rrTarget");
  target.classList.remove("hidden");

  moveTarget();

  RR.timer = setInterval(() => {
    RR.time--;
    setText("rrTime", RR.time);

    if (RR.time <= 0) {
      endReactionGame();
    }
  }, 1000);
}

function moveTarget() {
  const arena = getElement("rrArena");
  const target = getElement("rrTarget");

  const x = Math.random() * (arena.clientWidth - 70);
  const y = Math.random() * (arena.clientHeight - 70);

  target.style.left = `${x}px`;
  target.style.top = `${y}px`;
}

getElement("rrTarget")?.addEventListener("click", () => {
  if (!RR.playing) return;

  RR.score++;
  setText("rrScore", RR.score);
  moveTarget();
});

function endReactionGame() {
  clearInterval(RR.timer);
  RR.playing = false;

  showQueueMessage("Submitting your score...");

  submitScoreToBackend(RR.score);
}

async function submitScoreToBackend(score) {
  try {
    const data = await apiFetch("/api/matches/submit-score", {
      method: "POST",
      body: JSON.stringify({
        matchId: AppState.activeMatchId,
        score,
      }),
    });

    showQueueMessage("Match completed. Result verified.");

    showResultMessage(
      data.didWin
        ? `Victory! You scored ${score}.`
        : `Defeat. You scored ${score}.`
    );

    showResultCard({
      didWin: data.didWin,
      game: "Reaction Rush",
      stake: AppState.selectedStake,
      totalPool: AppState.selectedStake * 2,
      fee: Math.round(AppState.selectedStake * 2 * 0.1),
      winnerGets: data.payout,
    });

    hideElement("reactionGame");

  } catch (error) {
    showQueueMessage("Score submission failed.");
  }
}
