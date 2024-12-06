import { createBricks, drawBrick } from "./bricks.js";
import { createEngine } from "../../shared/engine.js";

const { renderer, input, run, pixelRatio, finish, audio } = createEngine(); // Gardez l'import `finish` si nécessaire dans `createEngine`
const { ctx, canvas } = renderer;

const click22 = await audio.load({
  src: "./click22.mp3",
});
const gameover = await audio.load({
  src: "./game-over.mp3",
});
const gamestart = await audio.load({
  src: "./game-start.mp3",
});

const blockSize = 120;
const lightColor = "#f8f9fa";
const shadowColor = "#6c757d";

// Grille
const grid = [
  [0, 1, 1, 1, 1, 1, 0],
  [1, 1, 0, 0, 0, 1, 1],
  [0, 0, 0, 0, 1, 1, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 1, 1, 0, 0, 0, 0],
  [1, 1, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1],
];

let bricks = [];
let gameStarted = false;

// Initialise les briques
function initBricks() {
  bricks = createBricks(grid, blockSize, canvas);
  console.log("Briques initialisées :", bricks);
}

// Affiche le bouton
function drawButton() {
  const button = document.getElementById("startButton");
  button.style.display = "block"; // Montre le bouton
}

// Cache le bouton
function hideButton() {
  const button = document.getElementById("startButton");
  button.style.display = "none"; // Cache le bouton
}

// Réinitialise le jeu
function resetGame() {
  initBricks();
  gameStarted = false;
  drawButton();
}

function endGame() {
  const allBricksFallen = bricks.every((brick) => brick.y >= canvas.height);
  if (allBricksFallen) {
    finish();
  }
}

// Gère les clics sur le canevas
canvas.addEventListener("click", (event) => {
  if (!gameStarted) return;

  const rect = canvas.getBoundingClientRect();
  const offsetX = (event.clientX - rect.left) * pixelRatio;
  const offsetY = (event.clientY - rect.top) * pixelRatio;

  bricks.forEach((brick) => {
    if (
      offsetX > brick.x &&
      offsetX < brick.x + blockSize &&
      offsetY > brick.y &&
      offsetY < brick.y + blockSize
    ) {
      console.log("Brique cliquée :", brick);
      bricks.forEach((b) => {
        gameover.play({ volume: 0.04 });
        b.targetY = canvas.height + blockSize;
        b.speed = Math.random() * 1400 + 800; // Vitesse de chute
      });
    }
  });
});

// Fonction d'update du jeu
function update(dt) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (!gameStarted) {
    drawButton();
    document.getElementById("startButton").addEventListener("click", () => {
      click22.play({ volume: 0.04 });
      gameStarted = true;
      initBricks();
      hideButton();
    });
  } else {
    bricks.forEach((brick) => {
      if (brick.y < brick.targetY) {
        brick.y += brick.speed * dt;
      } else {
        brick.y = brick.targetY;
        if (!brick.hasFallen) {
          gamestart.play({ volume: 0.3 }); // Joue le son de chute
          brick.hasFallen = true; // Empêche de rejouer le son à chaque chute
        }
      }

      drawBrick(brick, ctx, lightColor, shadowColor, blockSize);
    });

    // Vérifie la fin du jeu
    endGame();
  }
}

// Démarre la boucle d'animation
run(update);
