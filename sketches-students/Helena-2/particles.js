import * as math from "../../shared/engine/math.js";

export function createParticles(
  particleCount,
  gridBounds,
  canvasWidth,
  canvasHeight
) {
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    let x, y;

    do {
      x = Math.random() * canvasWidth;
      y = Math.random() * canvasHeight;
    } while (
      x > gridBounds.left &&
      x < gridBounds.right &&
      y > gridBounds.top &&
      y < gridBounds.bottom
    );

    particles.push({
      accelerationX: 0,
      accelerationY: 0,
      positionX: x,
      positionY: y,
      radius: Math.random() * 5 + 2, // Radius between 2 and 7
      speedX: (Math.random() * 2 - 1) * 60, // Horizontal speed between -1 and 1
      speedY: (Math.random() * 2 - 1) * 60, // Vertical speed between -1 and 1
    });
  }

  return particles;
}

export function pushParticle(
  particle,
  pointX,
  pointY,
  minDist,
  maxDist,
  minForce,
  maxForce
) {
  const distToMouseX = pointX - particle.positionX;
  const distToMouseY = pointY - particle.positionY;
  const distToMouse = math.len(distToMouseX, distToMouseY);
  if (distToMouse <= 0.0001) return;
  const dirNormalizedX = distToMouseX / distToMouse;
  const dirNormalizedY = distToMouseY / distToMouse;

  const forceMultiplier = -math.mapClamped(
    distToMouse,
    minDist,
    maxDist,
    minForce,
    maxForce
  );
  particle.accelerationX += dirNormalizedX * forceMultiplier;
  particle.accelerationY += dirNormalizedY * forceMultiplier;
}

export function updateParticles(
  deltaTime,
  particles,
  canvasWidth,
  canvasHeight,
  minConnections,
  maxConnections
) {
  for (const particle of particles) {
    particle.closestParticles = particles
      .filter((p) => p !== particle)
      .sort((a, b) => getDistance(particle, a) - getDistance(particle, b))
      .slice(
        0,
        Math.floor(Math.random() * (maxConnections - minConnections + 1)) +
          minConnections
      );

    for (const p of particle.closestParticles) {
      pushParticle(p, particle.positionX, particle.positionY, 50, 100, 1000, 0);
    }
  }
  const drag = 1;
  for (const particle of particles) {
    particle.speedY *= Math.exp(-deltaTime * drag);
    particle.speedY *= Math.exp(-deltaTime * drag);
    particle.speedY += particle.accelerationX * deltaTime;
    particle.speedY += particle.accelerationY * deltaTime;
    particle.positionX += particle.speedX * deltaTime;
    particle.positionY += particle.speedY * deltaTime;
    particle.accelerationX = 0;
    particle.accelerationY = 0;

    // Bounce off the edges
    if (particle.positionX < 0 || particle.positionX > canvasWidth) {
      particle.speedX *= -1;
    }
    if (particle.positionY < 0 || particle.positionY > canvasHeight) {
      particle.speedY *= -1;
    }
  }
}

function getDistance(p1, p2) {
  const dx = p1.positionX - p2.positionX;
  const dy = p1.positionY - p2.positionY;
  return Math.sqrt(dx * dx + dy * dy);
}

export function drawParticles(ctx, particles) {
  ctx.fillStyle = "white";
  for (const particle of particles) {
    ctx.beginPath();
    ctx.arc(
      particle.positionX,
      particle.positionY,
      particle.radius,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Connexion esthétique avec les particules les plus proches
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  ctx.lineWidth = 1;

  for (const particle of particles) {
    // Tri des particules les plus proches

    // Dessin des lignes vers les particules les plus proches
    for (const closest of particle.closestParticles) {
      ctx.beginPath();
      ctx.moveTo(particle.positionX, particle.positionY);
      ctx.lineTo(closest.positionX, closest.positionY);
      ctx.stroke();
    }
  }
}
