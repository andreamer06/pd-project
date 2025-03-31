function setMode(mode) {
    fetch('/set_mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: mode })
    }).then(response => response.json())
      .then(data => {
          console.log("Mode changed to:", data.mode);
          if (mode === "game") {
              document.getElementById("videoFeed").style.display = "none"; // Hide Camera
              document.querySelector(".game-area").style.display = "block"; // Show Game

              // Start new game
              score = 0;
              document.getElementById("score").innerText = "Score: " + score;
              player.x = 50;
              player.y = 50;
              spawnCoins(5);
              gameActive = true;
              startGameTimer();
              drawGame();
          } else {
              document.getElementById("videoFeed").style.display = "block"; // Show Camera
              document.querySelector(".game-area").style.display = "none"; // Hide Game
              gameActive = false;
          }
      });
}

// Make function accessible globally
window.setMode = setMode;

function updateStatus() {
    fetch('/game_action')  // Fixed the endpoint from "/action" to "/game_action"
        .then(response => response.json())
        .then(data => document.getElementById('status').innerText = "Status: " + data.direction);
}

setInterval(updateStatus, 300);

document.addEventListener("DOMContentLoaded", () => {
    console.log("Script.js loaded!");

    // Call setMode to initialize game mode
    setMode("none"); // or "camera" based on your needs
});
