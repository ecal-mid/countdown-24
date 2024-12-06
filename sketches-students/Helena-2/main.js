import { createEngine } from "../../shared/engine.js";
import {
  createParticles,
  updateParticles,
  drawParticles,
  pushParticle,
} from "./particles.js";
const { renderer, input, math, run, finish } = createEngine();
const { ctx, canvas } = renderer;
run(update);

const lines = [];
let startPoint;
let clickPositionX;
let clickPositionY;
const pointRadius = 10;
let globalOpacity = 1; // Opacité initiale
let opacityTransitioning = false;
const opacityTransitionSpeed = 0.4; // Contrôle la vitesse de la transition (ajustez selon vos besoins)
const opacityTarget = 0.1;

//CREATE POINTS
const points = [
  {
    //1
    positionX: -400,
    positionY: -300,
    radius: pointRadius,
  },
  {
    //2
    positionX: 0,
    positionY: -500,
    radius: pointRadius,
  },
  {
    //3
    positionX: 400,
    positionY: -300,
    radius: pointRadius,
  },
  {
    //4
    positionX: 400,
    positionY: -50,
    radius: pointRadius,
  },
  {
    //5
    positionX: -300,
    positionY: 400,
    radius: pointRadius,
  },
  {
    //6
    positionX: 400,
    positionY: 400,
    radius: pointRadius,
  },

  {
    //7
    positionX: 450,
    positionY: 500,
    radius: pointRadius,
  },
  {
    //8
    positionX: -400,
    positionY: 500,
    radius: pointRadius,
  },
  {
    //9
    positionX: -400,
    positionY: 350,
    radius: pointRadius,
  },
  {
    //10
    positionX: 300,
    positionY: -100,
    radius: pointRadius,
  },
  {
    //11
    positionX: 300,
    positionY: -250,
    radius: pointRadius,
  },
  {
    //12
    positionX: 0,
    positionY: -400,
    radius: pointRadius,
  },
  {
    //13
    positionX: -400,
    positionY: -200,
    radius: pointRadius,
  },
];

points.forEach((p, i) => {
  p.id = i;
  p.positionX += canvas.width / 2;
  p.positionY += canvas.height / 2;
});

function createLine(startPoint, endPoint) {
  const line = {
    startPoint,
    endPoint,
  };

  lines.push(line);
  return line;
}

function deleteLine(line) {
  const id = lines.indexOf(line);
  lines.splice(id, 1);
}

const gridBounds = {
  left: canvas.width / 4,
  right: (canvas.width / 4) * 3,
  top: canvas.height / 4,
  bottom: (canvas.height / 4) * 3,
};

const particles = createParticles(100, gridBounds, canvas.width, canvas.height);

/////////////UPDATE
function update(deltaTime) {
  ctx.fillStyle = `rgba(0, 0, 0, ${globalOpacity})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const mouseX = input.getX();
  const mouseY = input.getY();

  ctx.globalAlpha = globalOpacity;

  particles.forEach((p) => {
    pushParticle(p, mouseX, mouseY, 100, 300, 1000, 0);
    for (const point of points) {
      pushParticle(p, point.positionX, point.positionY, 50, 100, 1000, 0);
    }
  });

  updateParticles(deltaTime, particles, canvas.width, canvas.height, 3, 10);
  drawParticles(ctx, particles);

  // Points et lignes
  ctx.fillStyle = `rgba(255, 255, 255, ${globalOpacity})`;
  points.forEach((point) => {
    ctx.beginPath();
    ctx.ellipse(
      point.positionX,
      point.positionY,
      point.radius,
      point.radius,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  });

  if (input.isDown()) {
    clickPositionX = mouseX;
    clickPositionY = mouseY;
  }

  if (input.isPressed()) {
    if (!startPoint) {
      for (const point of points) {
        const dist = math.dist(
          point.positionX,
          point.positionY,
          input.getX(),
          input.getY()
        );

        if (dist < point.radius) {
          startPoint = point;
        }
      }
    }

    if (!startPoint) {
      // click on empty space
      for (const line of lines) {
        const mouseSide = getSideOfLineSegment(
          line.startPoint.positionX,
          line.startPoint.positionY,
          line.endPoint.positionX,
          line.endPoint.positionY,
          mouseX,
          mouseY
        );
        const clickSide = getSideOfLineSegment(
          line.startPoint.positionX,
          line.startPoint.positionY,
          line.endPoint.positionX,
          line.endPoint.positionY,
          clickPositionX,
          clickPositionY
        );

        if (clickSide !== mouseSide) {
          deleteLine(line);
          break;
        }
      }
    }
  }

  let currentLineX = input.getX();
  let currentLineY = input.getY();

  if (startPoint) {
    for (const point of points) {
      if (point === startPoint) continue;

      const distToEndPoint = closestDistanceToSegment(
        startPoint.positionX,
        startPoint.positionY,
        currentLineX,
        currentLineY,
        point.positionX,
        point.positionY
      );

      if (distToEndPoint < point.radius) {
        createLine(startPoint, point);
        startPoint = point;
      }
    }

    for (const point of points) {
      if (point === startPoint) continue;

      const distToEndPoint = math.dist(
        point.positionX,
        point.positionY,
        currentLineX,
        currentLineY
      );

      if (distToEndPoint < point.radius) {
        createLine(startPoint, point);
        startPoint = null;
        break;
      }
    }
  }

  if (!input.isPressed()) {
    startPoint = null;
  }

  let failed = false;
  for (let i = 1; i < points.length; i++) {
    const foundLine = lines.find((line) => {
      const startId = points.indexOf(line.startPoint);
      const endId = points.indexOf(line.endPoint);
      return (
        (startId === i && endId === i - 1) || (endId === i && startId === i - 1)
      );
    });
    if (!foundLine) {
      failed = true;
      break;
    }
  }

  ctx.fillStyle = "white";
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    ctx.beginPath();
    ctx.ellipse(
      point.positionX,
      point.positionY,
      point.radius,
      point.radius,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    const idString = (i + 1).toString();
    ctx.font = "20px sans-serif";
    ctx.fillText(idString, point.positionX, point.positionY + 40);
  }

  ctx.strokeStyle = "white";
  ctx.lineWidth = 5;
  for (const line of lines) {
    ctx.beginPath();
    ctx.moveTo(line.startPoint.positionX, line.startPoint.positionY);
    ctx.lineTo(line.endPoint.positionX, line.endPoint.positionY);
    ctx.stroke();
  }

  if (startPoint) {
    ctx.beginPath();
    ctx.moveTo(startPoint.positionX, startPoint.positionY);
    ctx.lineTo(currentLineX, currentLineY);
    ctx.stroke();
  }

  let isComplete = true;

  for (let i = 0; i < points.length; i++) {
    const nextIndex = (i + 1) % points.length; // Pour boucler de 13 à 1
    const foundLine = lines.find((line) => {
      const startId = points.indexOf(line.startPoint);
      const endId = points.indexOf(line.endPoint);
      return (
        (startId === i && endId === nextIndex) ||
        (endId === i && startId === nextIndex)
      );
    });

    if (!foundLine) {
      isComplete = false;
      break;
    }
  }

  if (isComplete && globalOpacity > opacityTarget) {
    console.log("All points are connected, starting opacity transition...");
    // Réduire l'opacité progressivement
    globalOpacity -= deltaTime * opacityTransitionSpeed;

    // Vérifier si on a atteint la cible d'opacité
    if (globalOpacity <= opacityTarget) {
      globalOpacity = opacityTarget; // Empêche de descendre en dessous
      console.log("Opacity target reached, finishing...");
      finish(); // Appelle finish() une fois l'opacité cible atteinte
    }
  }
}

function closestDistanceToSegment(x1, y1, x2, y2, px, py) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) return math.dist(x1, y1, px, py);

  const t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy);
  const clampedT = Math.max(0, Math.min(1, t));
  const nearestX = x1 + clampedT * dx;
  const nearestY = y1 + clampedT * dy;
  return math.dist(nearestX, nearestY, px, py);
}
function getSideOfLineSegment(x1, y1, x2, y2, px, py) {
  const determinant = (x2 - x1) * (py - y1) - (y2 - y1) * (px - x1);
  const withinXBounds = Math.min(x1, x2) <= px && px <= Math.max(x1, x2);
  const withinYBounds = Math.min(y1, y2) <= py && py <= Math.max(y1, y2);
  const epsilon = 1e-10; // Petite marge pour gérer les imprécisions

  if (Math.abs(determinant) < epsilon) {
    if (withinXBounds && withinYBounds) {
      return "on"; // Le point est sur le segment
    } else {
      return "outside bounds"; // Le point est aligné mais hors des limites
    }
  } else if (determinant > 0) {
    return "left"; // Le point est à gauche du segment
  } else {
    return "right"; // Le point est à droite du segment
  }
}
