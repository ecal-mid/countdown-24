import { createEngine } from "../../shared/engine.js";

const { renderer, input, math, run, finish } = createEngine();
const { ctx, canvas } = renderer;

const size = Math.min(canvas.width, canvas.height);
const offscreenCanvas = new OffscreenCanvas(size, size);
let offscreenCtx = offscreenCanvas.getContext("2d");

const response = await fetch("./31.svg");
const svgText = await response.text();
const parser = new DOMParser();
const doc = parser.parseFromString(svgText, "image/svg+xml");
const crayon = new Image();
crayon.src = "Sujet.png";

const percentageDisplay = document.getElementById("percentageDisplay");

let canDraw = true; // Variable d'état pour vérifier si le dessin est activé
let isDrawing = false;
let audioPlayed = false; // Variable pour éviter de rejouer l'audio plusieurs fois

document.body.style.cursor = "none";

// Extraire le chemin du SVG
const path = doc.querySelector("g path");
const pathData = new Path2D(path.getAttribute("d"));
const pathWidth = 428;
const pathHeight = 324;

let prevX = 0;
let prevY = 0;
const scale = Math.min(
  offscreenCanvas.width / pathWidth,
  offscreenCanvas.height / pathHeight
);

const targetFill = 0.6; // Réduisez légèrement pour tolérer les erreurs mineures

// Appliquer un clipPath pour restreindre le dessin à la zone du chemin
offscreenCtx.save();
offscreenCtx.beginPath();
offscreenCtx.translate(offscreenCanvas.width / 2, offscreenCanvas.height / 2);
offscreenCtx.scale(scale, scale);
offscreenCtx.translate(-pathWidth / 2, -pathHeight / 2);
offscreenCtx.clip(pathData); // Utiliser le chemin comme clip pour limiter l'espace de dessin
offscreenCtx.closePath();
offscreenCtx.resetTransform();

run(update);
offscreenCtx.fillStyle = "rgba(0, 0, 0, 0)"; // Couleur semi-transparente
offscreenCtx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);

const audio = new Audio("./ecrirre.mp3"); // Remplacer par le chemin vers ton fichier audio
audio.loop = true; // Active la lecture en boucle

document.addEventListener("mousedown", () => {
  audio.play(); // Jouer l'audio lorsque l'utilisateur commence à interagir
});

document.addEventListener("mouseup", () => {
  audio.pause(); // Arrête la lecture si nécessaire
});
function update() {
  if (!canDraw) return; // Empêcher le dessin si le crayon n'a pas été cliqué

  const xOffset = (canvas.width - offscreenCanvas.width) / 2;
  const yOffset = (canvas.height - offscreenCanvas.height) / 2;
  const mouseX = input.getX() - xOffset;
  const mouseY = input.getY() - yOffset;

  if (input.isPressed()) {
    if (!isDrawing) {
      isDrawing = true;

      // Jouer l'audio lorsque l'utilisateur commence à dessiner
      if (!audioPlayed) {
        audio.play(); // Joue l'audio
        audioPlayed = true; // Empêche de rejouer l'audio pendant la session de dessin
      }
    }

    // Dessiner un cercle à la position de la souris
    offscreenCtx.beginPath();
    offscreenCtx.arc(mouseX, mouseY, 200, 0, Math.PI * 2); // Crée un cercle avec un rayon de 200
    offscreenCtx.fillStyle = "rgba(255, 182, 193, 1)"; // Remplir le cercle en rose pâle
    offscreenCtx.fill();
    offscreenCtx.closePath();
  } else {
    if (isDrawing) {
      isDrawing = false;
    }
  }

  // Analyse de l'image et vérification de remplissage
  const imageData = offscreenCtx.getImageData(
    0,
    0,
    offscreenCanvas.width,
    offscreenCanvas.height
  );
  const data = imageData.data;
  let count = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    if (r > 0) count++;
  }
  const maxCount = data.length / 4;
  const fill = count / maxCount;

  // Mettre à jour l'affichage du pourcentage
  const fillPercentage = Math.round(fill * 100); // Convertir en pourcentage
  percentageDisplay.textContent = `Remplissage: ${fillPercentage}%`;

  // Si le remplissage atteint 58%, l'écran devient entièrement noir
  if (fillPercentage >= 58) {
    // Efface le canvas principal et remplit avec du noir
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Arrête l'animation
    finish();
    return;
  }

  // Effacer et redessiner le contenu sur le canvas principal
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(
    offscreenCanvas,
    xOffset,
    yOffset,
    offscreenCanvas.width,
    offscreenCanvas.height
  );
  ctx.drawImage(
    crayon,
    input.getX() - crayon.width / 2,
    input.getY() - crayon.height / 2,
    crayon.width,
    crayon.height
  );
}
