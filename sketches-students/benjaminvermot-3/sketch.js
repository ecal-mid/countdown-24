import { createEngine } from "../../shared/engine.js";
import Mask from "./Mask.js";
import BG from "./BG.js";
import Constellation from "./Constallation.js";
import Star from "./Star.js";

const { renderer, input, math, run, finish, audio } = createEngine();
const { ctx, canvas } = renderer;

const starSound = await audio.load("./sounds/shine.mp3");
const music = await audio.load("./sounds/music.mp3");
const transi = await audio.load("./sounds/transition.mp3");

let width = window.innerWidth;
let height = window.innerHeight;

let mask = new Mask(ctx, 600);
let bg = new BG(ctx, width * 2, height * 2);
let constellation = new Constellation(ctx, width * 2, height * 2);

let ending = false;
let size = 0;

let stars = [];

let soundHasPlay;

run(update);
setup();

music.play();

function setup() {
  for (let i = 0; i < 100; i++) {
    const n = new Star(
      ctx,
      Math.random() * width * 2,
      Math.random() * height * 2
    );
    stars.push(n);
  }
}

window.addEventListener("click", (event) => {
  if (mask.ending) {
    let targetX = event.clientX * 2;
    let targetY = event.clientY * 2;

    stars.forEach((element) => {
      element.updateTarget(targetX, targetY);
      element.scaleDown = true;
      end();
    });
    constellation.isDisplayed = false;
    bg.isDisplayed = false;
  }

  if (mask.ending) {
    starSound.play();
  }
});

function update(dt) {
  const mouseX = input.getX();
  const mouseY = input.getY();
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  bg.draw();
  stars.forEach((element) => {
    element.draw();
    element.move(dt);
  });
  constellation.draw(mouseX, mouseY);
  constellation.checkMouseDistance(mouseX, mouseY, width, height);

  if (input.hasStarted()) {
    mask.targetPosX = mouseX;
    mask.targetPosY = mouseY;
  }
  mask.move(dt);
  mask.draw();
  // mask.scaleMask(dt);

  if (constellation.isRevealed) {
    ending = true;
  }

  endInteraction();
}

function endInteraction() {
  if (ending) {
    mask.ending = true;
    if ((soundHasPlay = false)) {
      transi.play();
      soundHasPlay = true;
    }
    mask.scale += 20;
    ctx.beginPath();
    ctx.arc(width, height, size, 0, Math.PI * 2);
    ctx.fillStyle = "black";
    ctx.strokeStyle = "white";
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
  }
}

function end() {
  setTimeout(() => {
    finish();
    console.log("finisg");
  }, 3000);
}
