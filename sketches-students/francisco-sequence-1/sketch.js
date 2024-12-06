import { createEngine } from "../../shared/engine.js";
import { Spring } from "../../shared/spring.js";
import { createIframeClient } from "../../../shared/engine/iframeClient.js";
const iframeClient = createIframeClient();

const { renderer, input, math, run, finish } = createEngine();
const { ctx, canvas } = renderer;
run(update);

const imageSources = [
  "grass.png",
  "grass2.png",
  "grass3.png",
  "flower.png",
  "can.png", // Custom cursor image
];
const images = imageSources.map((src) => {
  const img = new Image();
  img.src = src;
  return img;
});

const gridSpacing = 100; // Distance between grid points
const imageSize = 70; // Maximum size of the images
const imageMax = 5; // Number of images per clump
const normalImageTrail = []; // Trail for normal images
const specialImageTrail = []; // Trail for special images
const activatedGridPoints = new Set(); // To track activated grid points
const activatedSpecialImages = new Set(); // To track activated special images

// Scatter scales for normal and special images
const normalScatterScale = 80; // Normal image scatter scale
const specialScatterScale = 50; // Special image scatter scale

// Variable to hold the position of the custom cursor
let cursorX = 0;
let cursorY = 0;

// Variable to control the size of the custom cursor image
const cursorSize = 50; // Adjust this value to resize the cursor image

// Flag to determine if all normal images have been activated
let allNormalImagesActivated = false;

// Flag to determine if deactivation is in progress
let isDeactivating = false;

// Hide the default cursor and set up custom cursor behavior
canvas.style.cursor = "none";

// Create a grid of points on the canvas
function createGrid() {
  const grid = [];
  for (let x = 0; x < canvas.width; x += gridSpacing) {
    for (let y = 0; y < canvas.height; y += gridSpacing) {
      grid.push({ x, y, isSpecial: false });
    }
  }
  return grid;
}

// Function to find the grid point closest to the center of the canvas
function findClosestToCenter(grid, xoffset, yoffset) {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  let closestPoint = null;
  let minDistance = Infinity;

  for (const point of grid) {
    const distance = Math.sqrt(
      (point.x + xoffset - centerX) ** 2 + (point.y + yoffset - centerY) ** 2
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestPoint = point;
    }
  }

  if (closestPoint) {
    closestPoint.isSpecial = true; // Mark the closest point as special
  }
}

// Create the grid and mark the special points
const gridPoints = createGrid();
findClosestToCenter(gridPoints, 200, 100);
findClosestToCenter(gridPoints, 0, 300);
findClosestToCenter(gridPoints, 100, 200);
findClosestToCenter(gridPoints, 0, -200);
findClosestToCenter(gridPoints, 0, -100);
findClosestToCenter(gridPoints, 0, 0);
findClosestToCenter(gridPoints, 0, 100);
findClosestToCenter(gridPoints, -200, -300);
findClosestToCenter(gridPoints, 200, -300);
findClosestToCenter(gridPoints, -100, -300);
findClosestToCenter(gridPoints, 0, -300);
findClosestToCenter(gridPoints, 100, -300);

// Function to create a clump of images at the specified grid point
function createClump(x, y, isSpecial) {
  const clump = [];
  for (let i = 0; i < imageMax; i++) {
    const scatterScale = isSpecial ? specialScatterScale : normalScatterScale;
    const scatterDeviation = scatterScale * 0.2 * (Math.random() - 0.5); // Random deviation of ±20%
    const finalScatterScale = scatterScale + scatterDeviation;

    const offsetX = (Math.random() - 0.5) * finalScatterScale;
    const offsetY = (Math.random() - 0.5) * finalScatterScale;

    const newX = x + offsetX;
    const newY = y + offsetY;

    const randomImageSource = isSpecial
      ? images[3]
      : images[Math.floor(Math.random() * 3)]; // Random normal image selection

    const delay = isSpecial ? 0 : Math.random() * 2000; // Delay for normal images only

    const image = {
      x: newX,
      y: newY,
      size: 0,
      rotation: 0,
      scale: 3 + (Math.random() - 0.5) * 0.2, // Initial random scale
      img: randomImageSource,
      delay: delay,
      startTime: null,
    };

    clump.push(image);
  }
  if (isSpecial) {
    specialImageTrail.push(clump);
    activatedSpecialImages.add(`${x},${y}`);
    if (activatedSpecialImages.size >= 12) {
      activateAllNonSpecialImages();
    }
  } else {
    normalImageTrail.push(clump);
  }
}

// Function to activate all non-special images that haven't been activated yet
function activateAllNonSpecialImages() {
  for (const point of gridPoints) {
    if (!point.isSpecial && !activatedGridPoints.has(`${point.x},${point.y}`)) {
      createClump(point.x, point.y, false);
      activatedGridPoints.add(`${point.x},${point.y}`);
    }
  }
  allNormalImagesActivated = true;
}

// Function to update and animate images in the trail
function updateClumps() {
  const currentTime = Date.now();

  for (const clump of normalImageTrail) {
    for (const image of clump) {
      if (image.startTime === null) {
        image.startTime = currentTime;
      }

      if (currentTime - image.startTime >= image.delay) {
        if (image.size < imageSize) {
          image.size += 1;
        }
      }
    }
  }

  for (const clump of specialImageTrail) {
    for (const image of clump) {
      if (image.size < imageSize) {
        image.size += 1;
      }
    }
  }
}

// Function to deactivate all images by scaling them down to 0
function deactivateAllImages() {
  if (isDeactivating) return; // Prevent multiple deactivation triggers
  isDeactivating = true;

  const deactivationInterval = setInterval(() => {
    let allImagesInvisible = true;

    for (const clump of normalImageTrail.concat(specialImageTrail)) {
      for (const image of clump) {
        if (image.scale > 0) {
          image.scale -= 0.1;
          image.size -= 1; // Gradually reduce size
          allImagesInvisible = false;
        }
        if (image.scale < 0) {
          image.scale = 0;

          image.size = 0;
        }
      }
    }

    if (allImagesInvisible) {
      clearInterval(deactivationInterval);
      isDeactivating = false; // Reset deactivation flag
      console.log("end");

      iframeClient.sendFinishSignal();
      console.log("end");
    }
  }, 50); // Adjust the interval for smoother animation
}

// Function to handle mouse clicks
canvas.addEventListener("click", () => {
  if (allNormalImagesActivated && !isDeactivating) {
    deactivateAllImages();
  }
});

function update(dt) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  updateClumps();

  // Draw normal images
  for (const clump of normalImageTrail) {
    for (const image of clump) {
      if (image.size > 0) {
        ctx.save();
        ctx.translate(image.x, image.y);
        ctx.rotate(image.rotation);
        ctx.scale(image.scale, image.scale);
        ctx.drawImage(
          image.img,
          -image.size / 2,
          -image.size / 2,
          image.size,
          image.size
        );
        ctx.restore();
      }
    }
  }

  // Draw special images
  for (const clump of specialImageTrail) {
    for (const image of clump) {
      if (image.size > 0) {
        ctx.save();
        ctx.translate(image.x, image.y);
        ctx.rotate(image.rotation);
        ctx.scale(image.scale, image.scale);
        ctx.drawImage(
          image.img,
          -image.size / 2,
          -image.size / 2,
          image.size,
          image.size
        );
        ctx.restore();
      }
    }
  }

  // Draw the custom cursor image at the mouse position
  ctx.drawImage(
    images[4],
    cursorX - cursorSize / 2,
    cursorY - cursorSize / 2,
    cursorSize,
    cursorSize
  );
}

// Update the cursor position on mouse movement
canvas.addEventListener("mousemove", (event) => {
  cursorX = event.clientX;
  cursorY = event.clientY;

  for (const point of gridPoints) {
    const distance = Math.sqrt(
      (cursorX - point.x) ** 2 + (cursorY - point.y) ** 2
    );
    if (distance < gridSpacing / 2) {
      const key = `${point.x},${point.y}`;
      if (!activatedGridPoints.has(key)) {
        createClump(point.x, point.y, point.isSpecial);
        activatedGridPoints.add(key);
        break;
      }
    }
  }
});
