import { createEngine } from "../../shared/engine.js";
import { Spring } from "../../shared/spring.js";
import Hamecon from "./hamecon.js";
import Fish from "./fish.js";
import Letter from "./letter.js";

const { renderer, input, math, run, finish, audio } = createEngine();
const { ctx, canvas } = renderer;

const plockSound = await audio.load("./sounds/plock.mp3");

let width = window.innerWidth;
let height = window.innerHeight;
let hamecon = new Hamecon(ctx);
let fish = new Fish(ctx, canvas.width / 2, canvas.height / 2, 40, 5);
let letter = new Letter(ctx, canvas.width / 2, canvas.height / 2);

let isClicking = false;

let letterOut = false;

let mouseX;
let mouseY;

run(update);

window.addEventListener("mousedown", (event) => {
  isClicking = true;
  hamecon.timing = 0;

  const distanceToHamecon = calculateDistance(
    mouseX,
    mouseY,
    hamecon.posX,
    hamecon.posY
  );

  if (distanceToHamecon <= 400) {
    hamecon.isDragging = true;
    plockSound.play();
  }
});

window.addEventListener("mouseup", (event) => {
  const distanceToFish = calculateDistance(
    mouseX,
    mouseY,
    fish.posX,
    fish.posY
  );

  if (hamecon.isDragging && distanceToFish <= 400 && !hamecon.isHook2There) {
    hamecon.isCatched = true;
    hamecon.targetPosY = -800;
    letter.isActive = true;
    fish.isActive = false;
    plockSound.play();
  }

  if (hamecon.hookIsOnTop) {
    hamecon.edjectHook();
    hamecon.hasBeenHooked = true;
    letterOut = true;
  }

  isClicking = false;
  hamecon.isDragging = false;

  hamecon.mouseUp(mouseX);
});

window.addEventListener("mousemove", (event) => {
  mouseX = event.clientX * 2;
  mouseY = event.clientY * 2;

  const distanceToHook = calculateDistance(
    mouseX,
    mouseY,
    hamecon.posX,
    hamecon.posY
  );

  if (isClicking && distanceToHook <= 400) {
    hamecon.followMouse(mouseX, mouseY);
  }

  const distanceToFish = calculateDistance(
    mouseX,
    mouseY,
    fish.posX,
    fish.posY
  );

  if (distanceToFish <= 60 && hamecon.isDragging) {
    fish.targetScaleX = 60;
    fish.targetScaleY = 5;
  } else {
    fish.targetScaleX = fish.originScaleX;
    fish.targetScaleY = fish.originScaleY;
  }

  if (distanceToFish <= 300 && hamecon.isHook2There) {
    hamecon.hookIsOnTop = true;
  } else {
    hamecon.hookIsOnTop = false;
  }
});

function update(dt) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  fish.draw();
  fish.scale(dt);
  hamecon.move(dt);
  hamecon.draw(mouseX);

  if (letter.isActive) {
    letter.draw();
    letter.scaleLetter(dt);
    letter.rotateLetter(dt);
  }

  if (letterOut) {
    letter.posX = hamecon.posX;
    letter.posY = hamecon.posY;
  }

  if (hamecon.isFinised) {
    finish();
  }
}

function calculateDistance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}
