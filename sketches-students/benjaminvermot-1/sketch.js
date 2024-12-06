import { createEngine } from "../../shared/engine.js";
import Match from "./Match.js";
import Glacon from "./Glacon.js";
import Letter from "./Letter.js";
import Smoke from "./Smoke.js";
import Fire from "./fire.js";

const { renderer, input, math, run, finish, audio } = createEngine();
const { ctx, canvas } = renderer;

const feuSound = await audio.load({
  loop: true,
  src: "./sounds/feu.mp3",
});

const friSound = await audio.load({
  loop: true,
  src: "./sounds/fri.mp3",
});

let width = window.innerWidth;
let height = window.innerHeight;

let url = "./imgs/iceCube.png";

let mouseX;
let mouseY;

let particles = [];
let match = new Match(ctx, 400);
let letter = new Letter(ctx, width, height, 600);
let fire = new Fire(ctx, 600);

let glacon = new Glacon(
  ctx,
  canvas.width / 2,
  canvas.height / 2,
  700,
  700,
  url
);

let feuVolume = 0.2;
let friVolume = 0;

run(update);
setup();

window.addEventListener("mousemove", (event) => {
  mouseX = event.clientX * 2;
  mouseY = event.clientY * 2;
});

function setup() {
  feuSound.play({ volume: feuVolume });
  friSound.play({ volume: friVolume });
}

setInterval(() => {
  if (fire.isDisplayed) {
    letter.isDisplayed = false;
    changeScaleTarget();
  }
  if (glacon.isShrinking && glacon.isDisplayed) {
    let randomRadius = Math.random() * (10 - 2) + 2;
    let randomVelX = Math.random() * (50 - -50) - 50;
    let randomVelY = Math.random() * (50 - -50) - 50;
    let n = new Smoke(
      ctx,
      mouseX,
      mouseY,
      randomRadius,
      randomVelX,
      randomVelY
    );
    particles.push(n);
  }
}, 50);

function update(dt) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  letter.draw();

  glacon.draw();
  glacon.checkMouseDistance(mouseX, mouseY);

  match.draw(mouseX, mouseY);

  match.checkMouseDistance(mouseX, mouseY);
  if (glacon.isShrinking) {
    friVolume = 1;
  }

  particles.forEach((element) => {
    element.draw();
    element.move(dt);
  });

  if (glacon.isDisplayed == false) {
    fire.isDisplayed = true;
    match.isDisplayed = false;
  }

  fire.draw(canvas.width / 2, canvas.height / 2);
  fire.scaleGlacon(dt);
}

function changeScaleTarget() {
  setTimeout(() => {
    finishFunction();
    fire.targetScale = 0;
  }, 2000);
}

function finishFunction() {
  setTimeout(() => {
    finish();
  }, 2000);
}

function calculateDistance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}
