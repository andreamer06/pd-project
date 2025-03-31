document.addEventListener("DOMContentLoaded", () => {
    console.log("Script.js loaded!");

    // Function to access the camera
    function startCamera() {
        // Check if the browser supports media devices
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            // Request the camera stream
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(function(stream) {
                    // Get the video element
                    const videoElement = document.getElementById('videoFeed');
                    
                    // Set the video element source to the camera stream
                    videoElement.srcObject = stream;
                    
                    // Log success
                    console.log("Camera access granted!");
                })
                .catch(function(error) {
                    // Handle errors (e.g., if permission is denied or no camera available)
                    console.error("Camera access denied or error:", error);
                    alert("Failed to access the camera. Please allow camera permissions.");
                });
        } else {
            alert("Your browser does not support accessing the camera.");
        }
    }

    // Start the camera on page load
    startCamera();

    // Function to change the mode
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

    // Function to update the status
    function updateStatus() {
        fetch('/game_action')  // Fixed the endpoint from "/action" to "/game_action"
            .then(response => response.json())
            .then(data => document.getElementById('status').innerText = "Status: " + data.direction);
    }

    // Set the interval to update status every 300ms
    setInterval(updateStatus, 300);

    // Initialize the mode (can be 'none', 'game', or 'volume')
    setMode("none"); // or "camera" based on your needs
});
