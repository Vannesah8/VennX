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
  messageBox.textContent =
    `Queued for ${game} at ${stake} KES. In production, wallet checks and matchmaking must happen on the server.`;
  messageBox.classList.remove("hidden");
}
