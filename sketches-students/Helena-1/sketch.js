import Particle from "./Particle.js";
import { createEngine } from "../../shared/engine.js";
import { Spring } from "../../shared/spring.js";

const { renderer, input, math, run, finish } = createEngine();
const { ctx, canvas } = renderer;

let particles = [];
let specialParticle;
const gridSize = 40;
let offsetX, offsetY;

let threeAsbeenFound = false;

let destroyed = false;

let scaleCounter = 0;

createGrid();
run(update);

window.addEventListener("resize", handleResize.bind(this));

function handleResize() {
  particles = [];
  createGrid();
}

function createGrid() {
  // Centering offsets
  const cols = Math.floor(canvas.width / gridSize);
  const rows = Math.floor(canvas.height / gridSize);
  offsetX = (canvas.width - cols * gridSize) / 2;
  offsetY = (canvas.height - rows * gridSize) / 2;
  console.log("create grid");
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ+*#£$!?^=&%§";

  const specialCharPos = {
    x: Math.floor(Math.random() * cols),
    y: Math.floor(Math.random() * rows),
  };
  // console.log(specialCharPos);

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let letter = letters.charAt(Math.floor(Math.random() * letters.length));

      const isSpecial =
        !specialParticle && i === specialCharPos.x && j === specialCharPos.y;
      if (isSpecial) {
        letter = "1";
      }
      const p = new Particle(
        ctx,
        letter,
        isSpecial,
        i * gridSize + offsetX,
        j * gridSize + offsetY
      );
      if (isSpecial) specialParticle = p;

      particles.push(p);
    }
  }
}

function update() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const specialCharPosPX = {
    x: specialParticle.x,
    y: specialParticle.y,
  };

  let allParticlesConverged = true;

  particles.forEach((particle) => {
    const dx = particle.x - input.getX();
    const dy = particle.y - input.getY();
    const distance = Math.sqrt(dx * dx + dy * dy);

    const sx = specialCharPosPX.x - input.getX();
    const sy = specialCharPosPX.y - input.getY();

    const distanceWithSpecialChar = Math.sqrt(sx * sx + sy * sy);
    const progress = math.mapClamped(distanceWithSpecialChar, 100, 600, 1, 0);
    const maxDistance = math.mapClamped(progress, 0, 1, 200, 30);

    particle.scale = Math.max(0.3, 2 - distance / maxDistance);

    if (particle.isSpecial) {
      if (input.isDown() && distanceWithSpecialChar < 20) {
        threeAsbeenFound = true;
      }

      if (threeAsbeenFound) {
        const dx = canvas.width / 2 - particle.x;
        const dy = canvas.height / 2 - particle.y;
        const forceX = dx * 0.06;
        const forceY = dy * 0.06;
        particle.forceX += forceX;
        particle.forceY += forceY;

        particle.scale = 40;
      }
    } else {
      if (input.isPressed()) {
        const force = Math.max(0, 150 - distance) / 100;
        const forceX = force * dx * 1;
        const forceY = force * dy * 1;
        particle.forceX += forceX;
        particle.forceY += forceY;
      } else if (!threeAsbeenFound) {
        const dx = particle.initialX - particle.x;
        const dy = particle.initialY - particle.y;
        const forceX = dx * 0.9;
        const forceY = dy * 0.9;
        particle.forceX += forceX;
        particle.forceY += forceY;
      }

      if (threeAsbeenFound) {
        const dx = specialParticle.x - particle.x;
        const dy = specialParticle.y - particle.y;
        const dist = math.len(dx, dy);

        const forceMulti = 1.5;
        const forceX = (dx / dist) * forceMulti;
        const forceY = (dy / dist) * forceMulti;
        particle.forceX += forceX;
        particle.forceY += forceY;

        if (dist > 100) {
          allParticlesConverged = false; // Not all particles are close enough yet
        }
      }
    }
    if (threeAsbeenFound && allParticlesConverged) {
      // console.log("allParticlesConverged=true");

      scaleCounter += 0.001;

      if (particle.isSpecial) {
        particle.scale -= scaleCounter;
        if (particle.scale < 0.1) {
          console.log("Special particle shrunk and centered. Finishing...");
          destroy();
        }
      }

      // // if (particle.isSpecial)
      // if (specialParticle.scale <= 1) {

      // }
    }

    particle.updatePosition();
    if (!destroyed) {
      particle.draw();
    }
  });

  function destroy() {
    destroyed = true;
    finish();
  }

  // Check if all particles have converged and finish the animation

  // specialParticle.updatePosition();
  // specialParticle.draw();
}
