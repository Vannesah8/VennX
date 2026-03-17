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

document.addEventListener("DOMContentLoaded", () => {
  attachButtonSounds();
});
