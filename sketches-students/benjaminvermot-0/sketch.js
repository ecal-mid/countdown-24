import { createEngine } from "../../shared/engine.js";
import Mover from "./mover.js";
import Sifflet from "./sifflet.js";
import Utils from "./utils.js";
import Point from "./point.js";

const { renderer, input, math, run, finish, audio } = createEngine();
const { ctx, canvas } = renderer;

const plockSound = await audio.load("./sounds/plock.mp3");

let width = window.innerWidth;
let height = window.innerHeight;

let mouseX;
let mouseY;

let isClicking = false;

let movers = [];
let moversAmount = 300;

let sifflet;

let convertedPoints = 0;

let points = []; // Liste des points à partir du SVG
let pointsObjects = [];
let svgLoaded = false;

let number;

setup();
run(update);

window.addEventListener("mousemove", (event) => {
  mouseX = event.clientX * 2;
  mouseY = event.clientY * 2;
});

function setup() {
  sifflet = new Sifflet(ctx);
  for (let i = 0; i < moversAmount; i++) {
    const randomX = Math.random() * width * 2;
    const randomY = Math.random() * height * 2;
    const n = new Mover(ctx, randomX, randomY);
    movers.push(n);
  }

  loadSVG("./0.svg").then((svgElement) => {
    points = extractPointsFromSVG(svgElement, moversAmount); // Générer des points à partir du SVG
    svgLoaded = true;
    console.log("SVG chargé avec", points.length, "points.");
    drawSVGPoints(ctx, points);
  });

  setInterval(() => {
    checkConvertedPoints();
  }, 1000);

  plockSound.play();
}

window.addEventListener("mousemove", (event) => {
  mouseX = event.clientX * 2;
  mouseY = event.clientY * 2;
});

window.addEventListener("mousedown", (event) => {
  sifflet.timing = 0;
  sifflet.isSiffling = true;
  isClicking = true;
});
window.addEventListener("mouseup", (event) => {
  sifflet.timing = 0;
  sifflet.isSiffling = false;
  isClicking = false;
});

function update(dt) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  movers.forEach((element) => {
    element.draw();
    element.move(dt);
    element.scaleDown(dt);
  });

  movers.forEach((element) => {
    number;
    if (element.isScaledDown) {
      number++;
      console.log(number);
    }
  });

  if (number >= movers.length) {
    finish();
    console.log("finish");
  } else {
    number = 0;
  }

  for (let i = 0; i <= moversAmount - 1; i++) {
    if (isClicking) {
      movers[i].checkMouseDistance(
        mouseX,
        mouseY,
        sifflet.scale,
        pointsObjects[i].posX,
        pointsObjects[i].posY
      );
    }
  }

  sifflet.draw(mouseX, mouseY);
  sifflet.siffle();
}

/** Charger un fichier SVG */
async function loadSVG(url) {
  const response = await fetch(url);
  const svgText = await response.text();

  const parser = new DOMParser();
  const svgDocument = parser.parseFromString(svgText, "image/svg+xml");
  return svgDocument.querySelector("svg");
}

/** Extraire des points à partir d'un SVG */
function extractPointsFromSVG(svgElement, numPointsPerPath = 100) {
  const pointsList = [];

  const paths = svgElement.querySelectorAll("path");
  paths.forEach((path) => {
    const pathLength = path.getTotalLength();
    for (let i = 0; i < numPointsPerPath; i++) {
      const pointAtLength = path.getPointAtLength(
        (i / numPointsPerPath) * pathLength
      );
      pointsList.push({ x: pointAtLength.x, y: pointAtLength.y });
    }
  });

  return pointsList;
}

/** Dessiner les points du SVG sur le Canvas */
function drawSVGPoints(ctx, points) {
  points.forEach((point) => {
    const n = new Point(
      ctx,
      point.x + canvas.width / 2.5,
      point.y + canvas.height / 2.5 - 150
    );
    pointsObjects.push(n);
  });

  console.log(pointsObjects);
}

function checkConvertedPoints() {
  movers.forEach((element) => {
    if (element.isOnPlace) {
      convertedPoints++;
    } else {
      convertedPoints = 0;
      return;
    }
  });

  if (convertedPoints >= moversAmount) {
    console.log("all point have been converted");
    movers.forEach((element) => {
      element.isReadyToBeDestroyed = true;
    });
  }
}
