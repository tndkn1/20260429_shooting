const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("scoreDisplay");
const messageScreen = document.getElementById("message");
const restartButton = document.getElementById("restartButton");
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

const player = {
  x: canvasWidth / 2,
  y: canvasHeight - 60,
  width: 40,
  height: 24,
  speed: 5,
  color: "#7de0ff",
  cooldown: 0,
};

const bullets = [];
const enemies = [];
let keys = { left: false, right: false, fire: false };
let score = 0;
let gameOver = false;
let frame = 0;

function startGame() {
  score = 0;
  frame = 0;
  gameOver = false;
  bullets.length = 0;
  enemies.length = 0;
  player.x = canvasWidth / 2;
  player.cooldown = 0;
  scoreDisplay.textContent = `スコア: ${score}`;
  messageScreen.classList.add("hidden");
  requestAnimationFrame(update);
}

function spawnEnemy() {
  const width = 34;
  const height = 26;
  const x = Math.random() * (canvasWidth - width - 20) + 10;
  const y = -height;
  const speed = 1.8 + Math.min(2.8, score / 50);
  enemies.push({ x, y, width, height, speed, color: "#ff6a6a" });
}

function update() {
  if (gameOver) return;

  frame += 1;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  if (keys.left) player.x -= player.speed;
  if (keys.right) player.x += player.speed;
  player.x = Math.max(player.width / 2, Math.min(canvasWidth - player.width / 2, player.x));

  if (keys.fire && player.cooldown <= 0) {
    bullets.push({ x: player.x, y: player.y - 16, radius: 4, speed: 8, color: "#fff" });
    player.cooldown = 12;
  }
  if (player.cooldown > 0) player.cooldown -= 1;

  if (frame % 40 === 0) spawnEnemy();

  bullets.forEach((bullet, index) => {
    bullet.y -= bullet.speed;
    if (bullet.y < -10) bullets.splice(index, 1);
  });

  enemies.forEach((enemy, index) => {
    enemy.y += enemy.speed;
    if (enemy.y > canvasHeight + enemy.height) {
      enemies.splice(index, 1);
      score -= 5;
      if (score < 0) score = 0;
    }
  });

  bullets.forEach((bullet, bi) => {
    enemies.forEach((enemy, ei) => {
      if (
        bullet.x > enemy.x &&
        bullet.x < enemy.x + enemy.width &&
        bullet.y > enemy.y &&
        bullet.y < enemy.y + enemy.height
      ) {
        bullets.splice(bi, 1);
        enemies.splice(ei, 1);
        score += 10;
      }
    });
  });

  enemies.forEach((enemy) => {
    if (
      player.x + player.width / 2 > enemy.x &&
      player.x - player.width / 2 < enemy.x + enemy.width &&
      player.y - player.height / 2 < enemy.y + enemy.height &&
      player.y + player.height / 2 > enemy.y
    ) {
      endGame();
    }
  });

  drawPlayer();
  bullets.forEach(drawBullet);
  enemies.forEach(drawEnemy);

  scoreDisplay.textContent = `スコア: ${score}`;

  if (!gameOver) requestAnimationFrame(update);
}

function drawPlayer() {
  ctx.save();
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.moveTo(player.x, player.y - player.height / 2);
  ctx.lineTo(player.x - player.width / 2, player.y + player.height / 2);
  ctx.lineTo(player.x + player.width / 2, player.y + player.height / 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawBullet(bullet) {
  ctx.fillStyle = bullet.color;
  ctx.beginPath();
  ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawEnemy(enemy) {
  ctx.fillStyle = enemy.color;
  ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  ctx.fillStyle = "#ffd7d7";
  ctx.fillRect(enemy.x + 6, enemy.y + 6, enemy.width - 12, enemy.height - 12);
}

function endGame() {
  gameOver = true;
  messageScreen.classList.remove("hidden");
  messageScreen.querySelector("button").focus();
}

window.addEventListener("keydown", (event) => {
  if (event.code === "ArrowLeft" || event.code === "KeyA") {
    keys.left = true;
  }
  if (event.code === "ArrowRight" || event.code === "KeyD") {
    keys.right = true;
  }
  if (event.code === "Space") {
    keys.fire = true;
    event.preventDefault();
  }
});

window.addEventListener("keyup", (event) => {
  if (event.code === "ArrowLeft" || event.code === "KeyA") {
    keys.left = false;
  }
  if (event.code === "ArrowRight" || event.code === "KeyD") {
    keys.right = false;
  }
  if (event.code === "Space") {
    keys.fire = false;
  }
});

restartButton.addEventListener("click", startGame);
window.addEventListener("load", startGame);
