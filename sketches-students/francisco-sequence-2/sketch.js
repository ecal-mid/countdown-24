import { createEngine } from "../../shared/engine.js";
import { createSpringSettings, Spring } from "../../shared/spring.js";
import { createIframeClient } from "../../../shared/engine/iframeClient.js";
const iframeClient = createIframeClient();

const { renderer, input, math, run, finish } = createEngine();
const { ctx, canvas } = renderer;
//run(update);

// Define the grid layout as 2 rows by 3 columns
const gridWidth = 3;
const gridHeight = 2;
const gridSpacingX = 200; // Horizontal distance between grid points
const gridSpacingY = 200; // Vertical distance between grid points

// Calculate the starting position for the grid to center it on the canvas
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

// Define positions for the grid dynamically based on the center
let gridPositions = [];
for (let row = 0; row < gridHeight; row++) {
  for (let col = 0; col < gridWidth; col++) {
    gridPositions.push({
      x: centerX - ((gridWidth - 1) * gridSpacingX) / 2 + col * gridSpacingX,
      y: centerY - ((gridHeight - 1) * gridSpacingY) / 2 + row * gridSpacingY,
    });
  }
}

// Load images
const images = [];
const imagePaths = ["cup.png", "cup.png", "cup.png", "die1.png"]; // Paths to the images
let imagesLoaded = 0;

imagePaths.forEach((path, index) => {
  const img = new Image();
  img.src = path;
  img.onload = () => {
    images[index] = img;
    imagesLoaded++;
    if (imagesLoaded === imagePaths.length) {
      run(update); // Run the game loop after images are loaded
    }
  };
});

// Initial image positions (top row)
let imagePositions = [
  { x: gridPositions[0].x, y: gridPositions[3].y }, // Top left
  { x: gridPositions[1].x, y: gridPositions[4].y }, // Top center
  { x: gridPositions[2].x, y: gridPositions[5].y }, // Top right
];

// Target positions (bottom row)
const targetPositions = [
  { x: gridPositions[3].x, y: gridPositions[3].y }, // Bottom left
  { x: gridPositions[4].x, y: gridPositions[4].y }, // Bottom center
  { x: gridPositions[5].x, y: gridPositions[5].y }, // Bottom right
];

// Hidden image initial position at the bottom center
let hiddenImagePosition = { x: gridPositions[4].x, y: gridPositions[4].y };

// Animation state
let isAnimating = false;
let animationStartTime = 0;
let animationDuration = 2; // Duration of the initial movement animation
let swapCount = 0;
const maxSwaps = 4; // Number of times to swap images
let swapDuration = 1.5; // Initial duration of the swap animation

// Flag to indicate whether the swap animation is complete
let swapAnimationComplete = false;

// Initial intro animation state
let introAnimationStartTime = 0;
let introAnimationDuration = 1.5; // Duration of the intro animation
let isIntroAnimating = true;

// Function to start the initial animation when clicked
function startAnimation() {
  if (!isAnimating) {
    isAnimating = true;
    animationStartTime = performance.now();
  }
}

// Function to perform the swap animation
function startSwapAnimation() {
  if (swapCount < maxSwaps) {
    // Choose two images randomly to swap (excluding the hidden image)
    let indices = [0, 1, 2];
    let firstIndex = indices.splice(
      Math.floor(Math.random() * indices.length),
      1
    )[0];
    let secondIndex = indices[Math.floor(Math.random() * indices.length)];

    // Store the initial positions of the chosen images
    let firstPosition = { ...imagePositions[firstIndex] };
    let secondPosition = { ...imagePositions[secondIndex] };

    // Update positions for the swap animation
    let swapStartTime = performance.now();

    function swap() {
      const elapsedTime = (performance.now() - swapStartTime) / 1000;
      if (elapsedTime < swapDuration) {
        const t = elapsedTime / swapDuration;
        const easedT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // Eased animation

        // Move the first image towards the second's position
        imagePositions[firstIndex].x =
          firstPosition.x + easedT * (secondPosition.x - firstPosition.x);
        imagePositions[firstIndex].y =
          firstPosition.y + easedT * (secondPosition.y - firstPosition.y);

        // Move the second image towards the first's position
        imagePositions[secondIndex].x =
          secondPosition.x + easedT * (firstPosition.x - secondPosition.x);
        imagePositions[secondIndex].y =
          secondPosition.y + easedT * (firstPosition.y - secondPosition.y);

        requestAnimationFrame(swap);
      } else {
        // Ensure the final position is exactly at the target
        imagePositions[firstIndex] = { ...secondPosition };
        imagePositions[secondIndex] = { ...firstPosition };

        swapCount++;
        swapDuration *= 0.8; // Make the swap animation faster for each iteration
        if (swapCount < maxSwaps) {
          swapStartTime = performance.now();
          requestAnimationFrame(startSwapAnimation);
        } else {
          isAnimating = false; // Stop animation after the final swap
          swapAnimationComplete = true; // Mark swap animation as complete
        }
      }
    }

    swapStartTime = performance.now();
    requestAnimationFrame(swap);
  }
}

// Function to move the clicked image up to the grid point above
function moveImageUp(clickedIndex) {
  console.log("moveimageupwork");
  const targetRow = Math.max(0, Math.floor(clickedIndex / gridWidth) - 1); // Calculate the row above
  const targetIndex = targetRow * gridWidth + (clickedIndex % gridWidth); // Calculate the new index

  if (targetIndex >= 0 && targetIndex < imagePositions.length) {
    console.log("same x, yeah.");
    for (let i = 0; i < images.length - 1; i++) { }

    const targetPosition = gridPositions[targetIndex];

    // Animate the clicked image to its new position
    const initialPosition = { ...imagePositions[clickedIndex] };
    let moveStartTime = performance.now();

    function moveUp() {
      const elapsedTime = (performance.now() - moveStartTime) / 1000;
      if (elapsedTime < animationDuration) {
        const t = elapsedTime / animationDuration;
        const easedT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

        // Update the y position of the clicked image only (no horizontal movement)
        imagePositions[clickedIndex].y =
          initialPosition.y + easedT * (targetPosition.y - initialPosition.y);

        requestAnimationFrame(moveUp);
      } else {
        isAnimating = false; // Stop the animation

        if (imagePositions[clickedIndex].x === hiddenImagePosition.x) {
          console.log("start leave animation");
          const ballScaleFactor = 1000;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          images.forEach((img, index) => {
            const { x, y } =
              index < 3 ? imagePositions[index] : hiddenImagePosition;
            const scaleFactor =
              index === 3 && index === clickedIndex ? ballScaleFactor : 0.1; // Scale up the ball if it's the clicked cup
            const imageWidth = img.width * scaleFactor;
            const imageHeight = img.height * scaleFactor;

            ctx.drawImage(
              img,
              x - imageWidth / 2,
              y - imageHeight / 2,
              imageWidth,
              imageHeight
            );
          });

          // Add animation to move all images out of the frame to the right
          startLeaveAnimation();
        }
      }
    }

    moveStartTime = performance.now();
    requestAnimationFrame(moveUp);
  }
}

// Function to start the leave animation for all images
function startLeaveAnimation() {
  console.log("start leave animation");

  let leaveAnimationStartTime = performance.now();
  const leaveAnimationDuration = 2; // Duration of the leave animation

  function leave() {
    const elapsedTime = (performance.now() - leaveAnimationStartTime) / 1000;
    if (elapsedTime < leaveAnimationDuration) {
      const t = elapsedTime / leaveAnimationDuration;
      const easedT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      // Move each image out of the frame to the right
      images.forEach((img, index) => {
        if (index < imagePositions.length) {
          imagePositions[index].x += easedT * canvas.width;
        }
      });

      requestAnimationFrame(leave);
    } else {
      // Ensure final positions are set
      imagePositions = imagePositions.map((pos) => ({
        x: pos.x + canvas.width,
        y: pos.y,
      }));

      isAnimating = false;
      console.log("FINISH");
      iframeClient.sendFinishSignal();
    }
  }

  leaveAnimationStartTime = performance.now();
  requestAnimationFrame(leave);
}
function update(dt) {
  hiddenImagePosition.x = imagePositions[1].x;

  if (isIntroAnimating) {
    const elapsedTime = (performance.now() - introAnimationStartTime) / 1000;
    if (elapsedTime < introAnimationDuration) {
      const t = elapsedTime / introAnimationDuration;
      const easedT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // Eased animation

      // Update positions of the images to slide in from the left
      for (let i = 0; i < images.length - 1; i++) {
        imagePositions[i].x = gridPositions[i].x - (1 - easedT) * canvas.width;
      }

      requestAnimationFrame(() => update(dt));
    } else {
      // Ensure final positions are set and start main animation
      imagePositions = [
        { x: gridPositions[0].x, y: gridPositions[3].y },
        { x: gridPositions[1].x, y: gridPositions[4].y },
        { x: gridPositions[2].x, y: gridPositions[5].y },
      ];
      isIntroAnimating = false;
      // Start the main animation after the intro
    }
  }

  if (isAnimating) {
    const elapsedTime = (performance.now() - animationStartTime) / 1000;
    if (elapsedTime < animationDuration) {
      const t = elapsedTime / animationDuration;
      const easedT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // Eased animation

      for (let i = 0; i < images.length - 1; i++) {
        imagePositions[i].y =
          gridPositions[i].y +
          easedT * (gridPositions[i + 3].y - gridPositions[i].y);
      }

      hiddenImagePosition.x = imagePositions[1].x;
      requestAnimationFrame(() => update(dt));
    } else {
      imagePositions = [
        { x: gridPositions[0].x, y: gridPositions[3].y },
        { x: gridPositions[1].x, y: gridPositions[4].y },
        { x: gridPositions[2].x, y: gridPositions[5].y },
      ];

      isAnimating = false;
      images[3].src = "die2.png";
      startSwapAnimation();
    }
  }

  // Draw background
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw the die image first (background)
  const dieImage = images[3]; // Assuming the die image is at index 3
  const { x: dieX, y: dieY } = hiddenImagePosition;
  const dieScaleFactor = 0.1;
  const dieWidth = dieImage.width * dieScaleFactor;
  const dieHeight = dieImage.height * dieScaleFactor;

  ctx.drawImage(
    dieImage,
    dieX - dieWidth / 2,
    dieY - dieHeight / 2,
    dieWidth,
    dieHeight
  );

  // Draw the cup images on top of the die image
  images.forEach((img, index) => {
    if (index < 3) {
      // Skip the die image
      const { x, y } = index < 3 ? imagePositions[index] : hiddenImagePosition;
      const scaleFactor = 0.1;
      const imageWidth = img.width * scaleFactor;
      const imageHeight = img.height * scaleFactor;

      ctx.drawImage(
        img,
        x - imageWidth / 2,
        y - imageHeight / 2,
        imageWidth,
        imageHeight
      );
    }
  });
}

// Start the animation when clicked
canvas.addEventListener("click", (e) => {
  if (!isAnimating && !swapAnimationComplete) {
    startAnimation();
  }
  if (swapAnimationComplete) {
    console.log("hello yeah its done");

    const clickX = e.clientX;
    const clickY = e.clientY;

    for (let i = 0; i < imagePositions.length; i++) {
      const { x, y } = imagePositions[i];
      const scaleFactor = 0.1;

      const imageWidth = images[i].width * scaleFactor;
      const imageHeight = images[i].height * scaleFactor;

      if (
        clickX >= x - imageWidth / 2 &&
        clickX <= x + imageWidth / 2 &&
        clickY >= y - imageHeight / 2 &&
        clickY <= y + imageHeight / 2
      ) {
        moveImageUp(i);
        break;
      }
    }
  }
});
