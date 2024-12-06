import { createEngine } from "../../shared/engine.js";
import { VerletPhysics } from "../../shared/verletPhysics.js";
import { DragManager } from "../../shared/dragManager.js";

let isDraggingChain = false; // Suivi de l'état de tirage
let isScreenWhite = false; // État de l'écran
let dragCount = 0; // Compteur de tirages

const { renderer, input, math, run, finish, audio } = createEngine();
const { ctx, canvas } = renderer;

const rope = await audio.load("rope-3.mp3");

const physics = new VerletPhysics();
physics.gravityY = 1000 * 10;

const dragManager = new DragManager();

let fadeInOpacity = 2; // Opacité pour l'animation de fondu au début

// CHAIN
const chain = physics.createChain({
  startPositionX: canvas.width / 2,
  startPositionY: 0,
  endPositionX: canvas.width / 2 + 40,
  endPositionY: canvas.height / 2,
  elementCount: 16,
  linkOptions: {
    stiffness: 1,
  },
  bodyOptions: {
    drag: 0.1,
    radius: 50,
  },
});

chain.bodies[0].isFixed = true;

for (const o of chain.bodies) {
  dragManager.createDragObject({
    target: o,
    onStartDrag: (o) => {
      o.isFixed = true;
      isDraggingChain = true;
      rope.play(); // Le tirage commence
    },
    onStopDrag: (o) => {
      o.isFixed = false;
      isDraggingChain = false; // Le tirage s'arrête
      dragCount++; // Incrémenter le compteur de tirages

      // Vérifier si la séquence est terminée
      if (dragCount >= 3) {
        finish(); // Transition vers la prochaine séquence
      }
    },
  });
}

run(update);

function update(deltaTime) {
  physics.bounds = {
    bottom: canvas.height,
  };

  dragManager.update(input.getX(), input.getY(), input.isPressed());
  physics.update(deltaTime);

  const lastBody = chain.bodies[chain.bodies.length - 1];
  const halfwayY = canvas.height / 2;

  // Si on tire la chaîne et qu'elle atteint la moitié, inverser l'écran
  if (isDraggingChain && lastBody.positionY >= halfwayY) {
    isScreenWhite = true;
  } else {
    isScreenWhite = false;
  }

  ctx.fillStyle = isScreenWhite ? "white" : "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.lineWidth = 10;
  ctx.strokeStyle =
    dragCount >= 3 ? "black" : isScreenWhite ? "black" : "white"; // Couleur de la chaîne inversée
  ctx.lineJoin = "round";

  ctx.beginPath();
  const firstBody = chain.bodies[0];
  ctx.moveTo(firstBody.positionX, firstBody.positionY);
  for (const body of chain.bodies) {
    ctx.lineTo(body.positionX, body.positionY);
  }
  ctx.lineTo(lastBody.positionX, lastBody.positionY);
  ctx.stroke();

  // Cercle
  ctx.beginPath();
  ctx.arc(lastBody.positionX, lastBody.positionY, 20, 0, Math.PI * 2);
  ctx.fillStyle = dragCount >= 3 ? "black" : isScreenWhite ? "black" : "white"; // Couleur du cercle
  ctx.fill();
  ctx.closePath();

  if (isScreenWhite) {
    ctx.font = "1000px Arial";
    ctx.fillStyle = "black";

    const text = "3";
    const textWidth = ctx.measureText(text).width;
    const textHeight = 1000;

    const x = (canvas.width - textWidth) / 2;
    const y = (canvas.height + textHeight) / 2;

    ctx.fillText(text, x, y);
  }

  // Animation de fondu au début
  if (fadeInOpacity > 0) {
    fadeInOpacity -= 0.01;
    ctx.fillStyle = `rgba(0, 0, 0, ${fadeInOpacity})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}
