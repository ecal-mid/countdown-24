import { createEngine } from "../../shared/engine.js";
const { renderer, run, finish, audio } = createEngine();
const { ctx, canvas } = renderer;

const winSound = await audio.load("./win.mp3");
const tacSound = await audio.load("./tac.mp3");

// function soundWin() {
//   if (input.isDown()) {
//     winSound.play({
//       rate: 1 + Math.random() * 1,
//       volume: 0.5 + Math.random() * 0.5,
//     });
//   }
// }

// Charger un seul SVG
let svgImageA = new Image();
svgImageA.src = "./00_Z.svg";

let sizeBase = 300 * 6;

// Variables pour contrôler le défilement
const images = [svgImageA]; // On garde uniquement svgImageA
const imageWidth = sizeBase * 4; // Largeur de l'image
const imageHeight = sizeBase; // Hauteur de l'image
// Espacement entre les images (non utilisé)

canvas.width = canvas.height = imageHeight; // Taille du canvas
canvas.style.height = "100vh"; // Taille de l'écran

// Position initiale, décalée du centre de la page
const initialPositionX = canvas.width / 2 - imageWidth / 2 - 100; // Centré mais décalé légèrement à gauche
let positions = [
  { x: initialPositionX, y: canvas.height / 2 - imageHeight / 2 }, // Position initiale pour l'image A
];

// Vitesse indépendante pour chaque SVG
let speeds = [150]; // Vitesse de l'image (uniquement pour svgImageA)

// Points de magnétisme pour chaque image
const magnetPoints = images.map(() => []);

// Initialiser les points de magnétisme pour chaque image
function initializeMagnetPoints() {
  const screenOffset = canvas.width / 2 + canvas.width / 4; // Décalage ajusté pour corriger l'erreur
  for (let i = 0; i < images.length; i++) {
    const points = [];
    // Ajouter le décalage de la moitié de l'écran à chaque point
    for (let j = 0; j < 4; j++) {
      points.push((j - 1.5) * (imageWidth / 4) + screenOffset); // Décalage ajusté pour centrer
    }
    magnetPoints[i] = points;
  }
}

// Trouver le point de magnétisme le plus proche en tenant compte de la position cyclique
function findClosestMagnetPoint(imageIndex, currentX) {
  const points = magnetPoints[imageIndex];
  let closest = points[0];
  let minDistance = Infinity;

  for (let point of points) {
    // Calculer la distance pour tous les décalages possibles (boucle continue)
    const basePosition = currentX % imageWidth;
    const potentialPositions = [point, point + imageWidth, point - imageWidth];

    for (let potential of potentialPositions) {
      const distance = Math.abs(basePosition - potential);
      if (distance < minDistance) {
        closest = potential;
        minDistance = distance;
      }
    }
  }

  return closest;
}

// === Remplacer le bouton par un clic de souris ===
let isSpinning = false; // Indique si les images sont en mouvement

canvas.addEventListener("mousedown", () => {
  clicked = true;
  isSpinning = !isSpinning; // Alterne l'état de défilement à chaque clic
});

// === Créer les flèches ===
// Crée les flèches de navigation gauche et droite pour chaque SVG
function createNavigationArrows(i) {
  const leftArrow = document.createElement("button");
  const rightArrow = document.createElement("button");

  leftArrow.textContent = "<";
  rightArrow.textContent = ">";

  leftArrow.style.position = "absolute";
  leftArrow.style.top = `${positions[i].y + imageHeight / 2}px`;
  leftArrow.style.left = `${positions[i].x - 30}px`; // À gauche du SVG
  leftArrow.style.fontSize = "16px";
  leftArrow.style.padding = "5px 10px";
  leftArrow.style.zIndex = "1000";

  rightArrow.style.position = "absolute";
  rightArrow.style.top = `${positions[i].y + imageHeight / 2}px`;
  rightArrow.style.left = `${positions[i].x + imageWidth + 10}px`; // À droite du SVG
  rightArrow.style.fontSize = "16px";
  rightArrow.style.padding = "5px 10px";
  rightArrow.style.zIndex = "1000";

  // Gérer les clics des flèches
  leftArrow.addEventListener("click", () => moveToNextMagnetPoint(i, -1));
  rightArrow.addEventListener("click", () => moveToNextMagnetPoint(i, 1));

  document.body.appendChild(leftArrow);
  document.body.appendChild(rightArrow);
}

// Déplacer vers le point de magnétisme suivant ou précédent
function moveToNextMagnetPoint(i, direction) {
  const currentMagnetPoint = findClosestMagnetPoint(i, positions[i].x);
  const points = magnetPoints[i];
  let currentIndex = points.indexOf(currentMagnetPoint);

  // Si direction est -1, on va vers le point précédent, sinon vers le suivant
  if (direction === -1) {
    currentIndex = (currentIndex - 1 + points.length) % points.length;
  } else {
    currentIndex = (currentIndex + 1) % points.length;
  }

  // Déplacer l'image vers le point choisi
  positions[i].x = points[currentIndex];
}

// === Ajouter les flèches pour chaque SVG ===
for (let i = 0; i < images.length; i++) {
  createNavigationArrows(i);
}

let clicked = false;

positions[0].x = 1000;

// Fonction pour mettre à jour et animer les SVGs
function update() {
  // Créer un fond noir
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Dessiner l'image
  ctx.drawImage(
    images[0], // Seulement l'image A
    positions[0].x,
    positions[0].y,
    imageWidth,
    imageHeight
  );
  ctx.drawImage(
    images[0], // Deuxième copie pour l'effet continu
    positions[0].x + imageWidth,
    positions[0].y,
    imageWidth,
    imageHeight
  );

  // Déplacer l'image de droite à gauche ou la fixer
  if (isSpinning) {
    // Pendant que le défilement est activé
    positions[0].x -= speeds[0];
  } else {
    // Quand le défilement est arrêté
    const closestMagnetPoint = findClosestMagnetPoint(0, positions[0].x);

    // Ajustement progressif vers le point le plus proche
    const delta = closestMagnetPoint - positions[0].x;
    if (Math.abs(delta) < 1) {
      positions[0].x = closestMagnetPoint; // Arrêter quand très proche

      if (clicked) handleStop();
      // winSound.play({ volume: 0.5 });
    } else {
      positions[0].x += delta * 0.1; // Ajustement fluide
    }
  }

  // Réinitialiser la position pour créer un effet de boucle continue
  if (positions[0].x <= -imageWidth) {
    positions[0].x += imageWidth; // Replacer pour qu'il suive immédiatement
  } else if (positions[0].x > imageWidth) {
    positions[0].x -= imageWidth; // Replacer si dépassement à droite
  }
}

let soundplayed = false;

// Initialiser les points de magnétisme
initializeMagnetPoints();

function handleStop() {
  const imageXPosition = positions[0].x;

  console.log("Image X Position:", imageXPosition);

  if (imageXPosition == -3150) {
    if (!soundplayed) {
      console.log(winSound.isPlaying);
      soundplayed = true;
      winSound.play({ volume: 1.5 });
      setTimeout(finish, 1500);
    }
  }
}
// Lancer la boucle d'animation
run(update);
