import { createEngine } from "../../shared/engine.js";

const { renderer, input, run, finish } = createEngine();
const { ctx, canvas } = renderer;

const gridParts = [];
const gridPartsCompleted = [];
let mouseX = 0;
let mouseY = 0;

const scaleFactor = 1.5; // Adjust this to scale the image (1.5 = 150% of original size)
const springStrength = 0.03; // How strong the attraction force is
const dampingFactor = 0.7; // How much the speed of movement decreases over time
const returnSpeed = 0.05; // Speed at which pieces move to the center
const opacityMin = 0.3; // Minimum opacity for glowing effect
const opacityMax = 0.8; // Maximum opacity for glowing effect
const phase2Opacity = 0.07; // Opacity when in Phase 2
let phase = 1; // Track the current phase: 1 = Phase 1, 2 = Phase 2
let time = 0; // Time to control the opacity oscillation
const targetOpacity = 0.9; // Target opacity for phase 3 (when parts gradually increase)
const opacityIncreaseSpeed = 0.06;
const transitionDelay = 1000; // Delay time in milliseconds (e.g., 2000ms = 2 seconds)
let phase2EndTime = null;
const opacityFadeSpeed = 0.02;

// Load the image
const img = new Image();
img.src = "./img/3.png";

img.onload = () => {
  const scaledWidth = img.width * scaleFactor;
  const scaledHeight = img.height * scaleFactor;

  const gridRows = 10;
  const gridCols = 10;
  const tileWidth = scaledWidth / gridCols;
  const tileHeight = scaledHeight / gridRows;
  const centerX = (canvas.width - scaledWidth) / 2;
  const centerY = (canvas.height - scaledHeight) / 2;

  // Generate the grid parts
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      const partCanvas = document.createElement("canvas");
      const partCtx = partCanvas.getContext("2d");

      partCanvas.width = tileWidth;
      partCanvas.height = tileHeight;

      // Draw the scaled image
      partCtx.drawImage(
        img,
        col * (img.width / gridCols),
        row * (img.height / gridRows),
        img.width / gridCols,
        img.height / gridRows,
        0,
        0,
        tileWidth,
        tileHeight
      );

      // Set random starting positions for the pieces (initial random positions)
      gridParts.push({
        canvas: partCanvas,
        x: centerX + col * tileWidth, // Target X for the "3" shape
        y: centerY + row * tileHeight, // Target Y for the "3" shape
        width: tileWidth,
        height: tileHeight,
        originalX: Math.random() * canvas.width, // Random scatter position X
        originalY: Math.random() * canvas.height, // Random scatter position Y
        currentX: Math.random() * canvas.width, // Initial scatter X
        currentY: Math.random() * canvas.height, // Initial scatter Y
        velocityX: 0, // Initial velocity X
        velocityY: 0, // Initial velocity Y
        isAligned: false, // Track if the part is aligned in Phase 2
        opacity: 0.5, // Initial opacity
        completed: false, // Add this property
      });
    }
  }

  run(update);
};

///////////////UPDATE
function update() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  mouseX = input.getX();
  mouseY = input.getY();

  const isPressed = input.isPressed();

  // Update time for opacity oscillation
  time += 0.05;

  let allAligned = true; // Check if all parts are aligned in Phase 1
  let allOpacityStable = true; // Check if all parts reached phase2Opacity in Phase 2
  let phase3Completed = false; // Assume Phase 3 is completed until proven otherwise

  gridParts.forEach((part) => {
    if (phase === 1) {
      if (isPressed) {
        const moveX = part.x - part.currentX;
        const moveY = part.y - part.currentY;
        const forceX = moveX * springStrength;
        const forceY = moveY * springStrength;
        part.velocityX += forceX;
        part.velocityY += forceY;
        part.velocityX *= dampingFactor;
        part.velocityY *= dampingFactor;
        part.currentX += part.velocityX;
        part.currentY += part.velocityY;

        if (Math.abs(moveX) < 1 && Math.abs(moveY) < 1) {
          part.currentX = part.x;
          part.currentY = part.y;
        }
      } else {
        // Scatter logic
        const moveX = part.originalX - part.currentX;
        const moveY = part.originalY - part.currentY;
        const forceX = moveX * springStrength;
        const forceY = moveY * springStrength;
        part.velocityX += forceX;
        part.velocityY += forceY;
        part.velocityX *= dampingFactor;
        part.velocityY *= dampingFactor;
        part.currentX += part.velocityX;
        part.currentY += part.velocityY;
      }

      // Glowing effect
      part.opacity =
        opacityMin +
        ((opacityMax - opacityMin) *
          (Math.sin(time + part.currentX * 0.05) + 1)) /
          2;

      if (
        Math.abs(part.currentX - part.x) > 1 ||
        Math.abs(part.currentY - part.y) > 1
      ) {
        allAligned = false;
      }
    }

    if (phase === 2) {
      const opacityDifference = phase2Opacity - part.opacity;
      part.opacity += opacityDifference * 0.1;

      if (Math.abs(opacityDifference) > 0.01) {
        allOpacityStable = false;
      }
    }

    if (phase === 3) {
      // Interaction: Increase opacity on click
      if (
        mouseX >= part.currentX &&
        mouseX <= part.currentX + part.width &&
        mouseY >= part.currentY &&
        mouseY <= part.currentY + part.height
      ) {
        if (isPressed) {
          part.opacity = Math.min(1, part.opacity + opacityIncreaseSpeed);
        }
      }

      if (part.opacity < 0.7) {
        phase3Completed = false;
      }
    }

    ctx.globalAlpha = part.opacity;
    ctx.drawImage(part.canvas, part.currentX, part.currentY);
  });

  if (phase === 3) {
    gridParts.forEach((part) => {
      if (part.opacity >= 0.7 && !part.completed) {
        gridPartsCompleted.push(part);
        part.completed = true; // Mark as completed
      }
    });
  }

  if (gridPartsCompleted.length > 40) {
    phase3Completed = true;
  }

  ctx.globalAlpha = 1;

  if (phase === 1 && allAligned) {
    phase = 2;
    console.log("Phase 2");
  }

  if (phase === 2 && allAligned && allOpacityStable) {
    if (phase2EndTime === null) {
      phase2EndTime = Date.now();
    } else if (Date.now() - phase2EndTime >= transitionDelay) {
      phase = 3;
      console.log("Phase 3");
      phase2EndTime = null;
    }
  }

  if (phase === 3 && phase3Completed) {
    ctx.fillStyle = "black";
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fill();

    finish();
  }
}
