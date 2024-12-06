import { createEngine } from "../../shared/engine.js";
import { createSpringSettings, Spring } from "../../shared/spring.js";
import Particle from "./particle.js";
import Utils from "./Utils.js";

const { renderer, input, math, run, finish } = createEngine();
const { ctx, canvas } = renderer;

let pathPoints = [];
let particles = [];

// Scale and position settings
let scale = 1;
let offsetX = 0;
let offsetY = 0;
// Listen for mouse movement and pass the position to the system
let mouseX = 0;
let mouseY = 0;

let counterForEnd = 0;
let theend = false;

const targetCount = 500;

async function init() {
  pathPoints = await Utils.loadSVG("./SVG/letter.svg");
  centerAndScalePathPoints();
}

function centerAndScalePathPoints() {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  pathPoints.forEach((points) => {
    points.forEach((point) => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });
  });

  const svgWidth = maxX - minX;
  const svgHeight = maxY - minY;
  scale = Math.min(canvas.width / svgWidth, canvas.height / svgHeight) * 0.8;
  offsetX = (canvas.width - svgWidth * scale) / 2 - minX * scale;
  offsetY = (canvas.height - svgHeight * scale) / 2 - minY * scale;

  pathPoints = pathPoints.map((points) =>
    points.map((point) => ({
      x: point.x * scale + offsetX,
      y: point.y * scale + offsetY,
    }))
  );
}

function createRandomParticle() {
  const randomX = Math.random() * canvas.width;
  const randomY = Math.random() * canvas.height;
  const targetPoint = getRandomPathPoint();
  particles.push(new Particle(randomX, randomY, targetPoint.x, targetPoint.y));
}
function getRandomPathPoint() {
  const pathIndex = Math.floor(Math.random() * pathPoints.length);
  const points = pathPoints[pathIndex];
  const pointIndex = Math.floor(Math.random() * points.length);
  return points[pointIndex];
}

function update(deltaTime) {
  while (particles.length < targetCount) createRandomParticle();

  mouseX = input.getX();
  mouseY = input.getY();
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (input.isDown()) {
    particles.forEach((p) => {
      p.endTarget = getRandomPathPoint();
    });
  }

  particles.forEach((particle) => {
    if (!input.hasStarted()) {
      particle.setTarget(canvas.width / 2, canvas.height / 2); // Ensure setTarget() exists
    } else if (!input.isPressed()) {
      particle.setTarget(mouseX, mouseY); // Ensure setTarget() exists
    } else {
      particle.setTarget(particle.endTarget.x, particle.endTarget.y); // Ensure setTarget() exists
    }

    if (!theend) {
      particle.update(deltaTime);
      particle.draw(ctx);
    }
  });

  if (input.isPressed()) {
    counterForEnd++;
  }
  if (!input.isPressed()) {
    counterForEnd = 0;
  }

  if (counterForEnd > 1000) {
    console.log("the end ?");
    theend = true;
    if (counterForEnd > 1001) {
      finish();
    }
  }

  particles = particles.filter((p) => !p.isDead);
}

await init();
run(update);
