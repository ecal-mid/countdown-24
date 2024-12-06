import { createEngine } from "../../shared/engine.js";
import { createSpringSettings, Spring } from "../../shared/spring.js";


const { renderer, input, math, run, finish } = createEngine();
const { ctx, canvas } = renderer;
run(update);
let entered = false
const spring = new Spring({
  position: 0,
});

const settings1 = createSpringSettings({
  frequency: 3.5,
  halfLife: 0.05,
});
const settings2 = createSpringSettings({
  frequency: 0.2,
  halfLife: 1.15,
});

// Variable to hold the current character
let currentCharacter = "?";
let isShaking = false; // Flag for shaking state
let shakeIntensity = 0; // Intensity of shaking
let wow = 0;
let wow2 = 0;

// Mouse position for tracking
let mouseX = 0;
let mouseY = 0;

// Update mouse position
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
});

function update(dt) {
  if (entered && wow == 1 && !input.isPressed()) {
    currentCharacter = "3"; // Change to "3" when the mouse is released and the spring reaches its target
  }
  if (input.isPressed()) {
    spring.target = 0.2; // Set the target scale for when the mouse is pressed
    spring.settings = settings2;
    isShaking = false; // Stop shaking when mouse is pressed
    if (currentCharacter == "3") {
      wow2 = 1;
    }
  } else {
    spring.target = 1; // Set the target scale for when the mouse is not pressed
    if (wow2 == 1) {
      // Change both x and y scale to create an "explosion" effect
      spring.target = 15; // Set a very large scale when released
    }
    spring.settings = settings1;

    // When the spring is very close to its target, change the character
  }

  spring.step(dt);

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const scale = Math.max(spring.position, 0); // Ensure scale is non-negative

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.textBaseline = "middle";
  ctx.font = `${canvas.height}px Helvetica Neue, Helvetica, bold`;
  ctx.textAlign = "center";
  ctx.translate(centerX, centerY);

  // Calculate the mouse movement offset from the center and apply a small fraction for following
  const followFactor = 0.1; // Adjust this value to control how much the character follows the mouse
  const offsetX = (mouseX - centerX) * followFactor;
  const offsetY = (mouseY - centerY) * followFactor;

  ctx.translate(offsetX, offsetY); // Apply the offset

  // Apply uniform scaling in both x and y directions
  ctx.scale(scale, scale); // Updated to scale uniformly

  if (scale > .8) {
    entered = true
  }
  // Check if the scale is small to trigger shaking
  if (entered && scale < 0.5) {
    // Adjust this threshold as needed
    isShaking = true;
    wow = 1;

    shakeIntensity = Math.sin(Date.now() * 0.1) * 10; // Adjust 0.1 for speed, 10 for distance
  } else {
    isShaking = false;
    shakeIntensity = 0; // Reset shake intensity
  }

  // Apply the shaking effect only if isShaking is true
  ctx.translate(shakeIntensity, 0); // Apply horizontal shaking

  ctx.fillText(currentCharacter, 0, 0);

  if (scale >= 10) {
    finish();
    console.log("fin");
  }
}
