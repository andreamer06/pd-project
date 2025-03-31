document.addEventListener("DOMContentLoaded", function () {
    let gameConfig = {
        type: Phaser.AUTO,
        width: 400,
        height: 400,
        parent: 'phaser-game',
        physics: {
            default: 'arcade',
            arcade: { gravity: { y: 0 } }
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };

    let game = new Phaser.Game(gameConfig);
    let player, coin, score = 0, timer;
    const moveSpeed = 5;

    function preload() {
        // No images needed, using Phaser graphics
    }

    function create() {
        let graphics = this.add.graphics();

        // Create Player (Blue Square) - Increased to 30x30
        player = this.physics.add.sprite(200, 200, null);
        player.displayWidth = 30;
        player.displayHeight = 30;
        player.setCollideWorldBounds(true);
        graphics.fillStyle(0x0000FF, 1);
        graphics.fillRect(player.x - 15, player.y - 15, 30, 30);

        // Create Coin (Yellow Circle) - Increased to 20 diameter
        coin = this.physics.add.sprite(randomX(), randomY(), null);
        coin.displayWidth = 20;
        coin.displayHeight = 20;
        graphics.fillStyle(0xFFFF00, 1);
        graphics.fillCircle(coin.x, coin.y, 10);

        this.physics.add.overlap(player, coin, collectCoin, null, this);

        // Start game timer (1 min)
        timer = this.time.addEvent({ delay: 60000, callback: gameOver, callbackScope: this });
    }

    function update() {
        fetch("/game_action")
            .then(response => response.json())
            .then(data => {
                let direction = data.direction;

                if (direction === "up" && player.y > moveSpeed) player.y -= moveSpeed;
                else if (direction === "down" && player.y < 400 - moveSpeed) player.y += moveSpeed;
                else if (direction === "left" && player.x > moveSpeed) player.x -= moveSpeed;
                else if (direction === "right" && player.x < 400 - moveSpeed) player.x += moveSpeed;
            });
    }

    function collectCoin() {
        score++;
        if (score >= 5) {
            alert("🎉 You Win!");
            location.reload();
        }
        coin.setPosition(randomX(), randomY());
    }

    function gameOver() {
        alert("Time Over! Restarting...");
        location.reload();
    }

    function randomX() { return Phaser.Math.Between(50, 350); }
    function randomY() { return Phaser.Math.Between(50, 350); }
});
