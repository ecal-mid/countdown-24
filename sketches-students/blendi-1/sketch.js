import { createEngine } from "../../shared/engine.js";

const { renderer, input, run, finish, audio } = createEngine();
const { ctx, canvas } = renderer;

const oneSize = canvas.height;
const oneCanvas = new OffscreenCanvas(oneSize, oneSize);
const oneCtx = oneCanvas.getContext("2d");
const magic = await audio.load({
  src: "./magic.mp3",
});
const pixel = await audio.load({
  src: "./pixel-1.mp3",
});

let soundPlayed = false;

run(update);

//création grille
const gridSize = oneCanvas.height / 20;
const cols = Math.ceil(oneCanvas.width / gridSize);
const rows = Math.ceil(oneCanvas.height / gridSize);
const grid = [];
let particles = [];
let explosionActive = false;
let explosionStartTime = 0;

const rects = [
  { x: 9, y: 3, width: 3, height: 14 },
  { x: 6, y: 4, width: 3, height: 3 },
  { x: 10, y: 2, width: 2, height: 1 },
];

//grille
for (const rect of rects) {
  for (let x = rect.x; x < rect.x + rect.width; x++) {
    for (let y = rect.y; y < rect.y + rect.height; y++) {
      grid.push({ x: x * gridSize, y: y * gridSize, visible: true });
    }
  }
}

let pixelsRevealed = 0;
const totalPixels = grid.length;

function startExplosion() {
  explosionActive = true;
  explosionStartTime = performance.now();

  //particules
  for (const square of grid) {
    if (!square.visible) {
      for (let i = 0; i < 3; i++) {
        particles.push({
          x: square.x + gridSize * 8,
          y: square.y + gridSize / 2,
          dx: (Math.random() - 0.5) * 4,
          dy: (Math.random() - 0.5) * 4,
          life: Math.random() * 2 + 1,
        });
      }
    }
  }
}

function updateParticles(deltaTime) {
  particles = particles.filter((particle) => particle.life > 0);

  for (const particle of particles) {
    particle.x += particle.dx * deltaTime * 0.1;
    particle.y += particle.dy * deltaTime * 0.1;
    particle.life -= deltaTime * 0.001;
  }
}

function drawParticles() {
  ctx.fillStyle = "white";

  // ici le son de l'explosion
  if (!soundPlayed) {
    soundPlayed = true;
    magic.play({ volume: 0.1 });
  }
  for (const particle of particles) {
    const taille = particle.life * 10; //taille
    ctx.fillRect(particle.x, particle.y, taille, taille);
  }
}

function update() {
  const deltaTime = 16.67;

  if (explosionActive) {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    updateParticles(deltaTime);
    drawParticles();

    if (
      particles.length === 0 &&
      performance.now() - explosionStartTime > 3000
    ) {
      finish();
    }
    return;
  }

  oneCtx.fillStyle = "black";
  oneCtx.fillRect(0, 0, oneCanvas.width, oneCanvas.height);

  // chiffre 1
  oneCtx.fillStyle = "white";
  oneCtx.textBaseline = "middle";
  oneCtx.font = `${oneCanvas.height}px Helvetica Neue, Helvetica, bold`;
  oneCtx.textAlign = "center";
  oneCtx.fillText("1", oneCanvas.width / 2, oneCanvas.height / 2);

  //grille carré noir
  oneCtx.fillStyle = "black";
  for (const square of grid) {
    if (square.visible) {
      oneCtx.fillRect(square.x, square.y, gridSize + 1, gridSize + 1);
    }
  }

  const oneCanvasOffsetX = (canvas.width - oneCanvas.width) / 2;

  const mouseX = input.getX() - oneCanvasOffsetX;
  const mouseY = input.getY();

  for (const square of grid) {
    if (
      square.visible &&
      mouseX > square.x &&
      mouseX < square.x + gridSize &&
      mouseY > square.y &&
      mouseY < square.y + gridSize
    ) {
      square.visible = false;
      pixelsRevealed++;
      pixel.play({ volume: 1 });
    }
  }

  const percentageRevealed = (pixelsRevealed / totalPixels) * 100;

  if (percentageRevealed >= 100) {
    startExplosion();
  }

  ctx.drawImage(oneCanvas, oneCanvasOffsetX, 0);
}
