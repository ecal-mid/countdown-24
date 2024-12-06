import { createEngine } from "../../shared/engine.js";

const { renderer, run, finish, audio } = createEngine();
const { ctx, canvas } = renderer;

let zoomLevel = 0.1;
const maxZoom = 3;
const minZoom = 0.05;
let shapes = [];
let showZero = false;
let fadeOut = false;
let fadeOpacity = 0;
let fadeInOpacity = 2;

function generateShapes() {
  shapes = Array.from({ length: 2000 }, () => ({
    initialX: (Math.random() - 0.5) * canvas.width * 2,
    initialY: (Math.random() - 0.5) * canvas.height * 2,
    targetX: 0,
    targetY: 0,
    size: Math.random() * 10 + 5,
    type: Math.random() > 0.5 ? "circle" : "square",
  }));
}

function calculateTargetPositions() {
  const radiusX = canvas.width * 0.3;
  const radiusY = canvas.height * 0.8;
  const innerRadiusX = radiusX * 0.5;
  const innerRadiusY = radiusY * 0.8;

  shapes.forEach((shape, index) => {
    const angle = (index / shapes.length) * 2 * Math.PI;
    const rX = index % 2 === 0 ? radiusX : innerRadiusX;
    const rY = index % 2 === 0 ? radiusY : innerRadiusY;
    shape.targetX = rX * Math.cos(angle);
    shape.targetY = rY * Math.sin(angle);
  });
}

let scrollDelta = 0;
canvas.addEventListener("wheel", (event) => {
  if (!showZero) {
    scrollDelta += event.deltaY > 0 ? 1 : -1;
  }
});
function getScrollDelta() {
  const delta = scrollDelta;
  scrollDelta = 0;
  return delta;
}

generateShapes();
calculateTargetPositions();

function update(dt) {
  const scrollAmount = getScrollDelta();
  zoomLevel = Math.min(
    maxZoom,
    Math.max(minZoom, zoomLevel + scrollAmount * 0.01)
  );

  const progress = (zoomLevel - minZoom) / (maxZoom - minZoom);

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(1 / zoomLevel, 1 / zoomLevel);

  shapes.forEach((shape) => {
    const x = shape.initialX + progress * (shape.targetX - shape.initialX);
    const y = shape.initialY + progress * (shape.targetY - shape.initialY);
    const size = shape.size;

    ctx.fillStyle = "white";
    if (shape.type === "circle") {
      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      ctx.fillRect(x - size / 2, y - size / 2, size, size);
    }
  });

  ctx.restore();

  if (fadeInOpacity > 0) {
    fadeInOpacity -= 0.01;
    ctx.fillStyle = `rgba(0, 0, 0, ${fadeInOpacity})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (progress >= 1) {
    showZero = true;
    fadeOut = true;
  }

  if (fadeOut) {
    fadeOpacity += 0.01;
    ctx.fillStyle = `rgba(0, 0, 0, ${fadeOpacity})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (fadeOpacity >= 1) {
      finish();
    }
  }
}

run(update);
