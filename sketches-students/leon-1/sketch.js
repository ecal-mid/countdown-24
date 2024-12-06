import { createEngine } from "../../shared/engine.js";
import { Spring } from "../../shared/spring.js";

const { renderer, input, math, run, finish, audio } = createEngine();
const { ctx, canvas } = renderer;

const pointSoundFile = await audio.load({
  src: "./poitnSound.mp3",
  loop: true,
});

const pointSound = pointSoundFile.play({
  rate: 1,
  volume: 0,
});
run(update);

const winSound = await audio.load("./win.mp3");

let mouseX = 0;
let mouseY = 0;
let mouseDown = false; // Indicateur pour savoir si la souris est enfoncée
let rotationAngle = 0; // Initialiser l'angle de rotation à 0
const particles = []; // Tableau pour stocker les particules
let particleInterval; // Variable pour stocker l'intervalle de création des particules

let elapsedTime = 0; // Temps écoulé pendant que la souris est enfoncée
let scale = 1; // Échelle initiale de la lettre
const maxScale = 35; // Taille maximale que la lettre peut atteindre
let isScalingFixed = false; // Indicateur pour savoir si la lettre a atteint sa taille maximale
let fin = 0;

// Créer une section pour la lettre, séparée du reste
const letterSection = document.createElement("div");
letterSection.style.position = "absolute";
letterSection.style.bottom = "0"; // Fixer en bas de l'écran
letterSection.style.left = "50%"; // Centrer horizontalement
letterSection.style.transform = "translateX(-50%)"; // Centrer par rapport à la position horizontale
letterSection.style.zIndex = "1"; // Le z-index de la lettre est inférieur à celui du SVG de la souris
document.body.appendChild(letterSection);

// Créer un élément SVG pour la lettre et l'ajouter à la section
const svgLetter = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svgLetter.setAttribute("width", "20");
svgLetter.setAttribute("height", "20");
svgLetter.setAttribute("viewBox", "0 0 20 20");
svgLetter.style.position = "absolute";
svgLetter.style.pointerEvents = "none"; // Pour éviter toute interaction avec le SVG
letterSection.appendChild(svgLetter);

// Charger le contenu du SVG de la lettre via un fichier (par exemple, lettre "1")
fetch("./1.svg")
  .then((response) => response.text())
  .then((svgContent) => {
    svgLetter.innerHTML = svgContent; // Ajouter le contenu SVG dans l'élément
  });

// Créer un élément SVG pour Mouse (suivi de la souris)
const svgMouse = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svgMouse.setAttribute("width", "300");
svgMouse.setAttribute("height", "300");
svgMouse.setAttribute("viewBox", "0 0 300 300");
svgMouse.style.position = "absolute";
svgMouse.style.pointerEvents = "none"; // Ne permet pas d'interaction
svgMouse.style.zIndex = "9999"; // Placer le SVG de la souris au-dessus de tout le reste
document.body.appendChild(svgMouse);

// Charger le contenu du SVG Mouse via le fichier
fetch("./arosoire.svg")
  .then((response) => response.text())
  .then((svgContent) => {
    svgMouse.innerHTML = svgContent;
  });

// Mettre à jour la position de la souris
document.addEventListener("mousemove", (e) => {
  mouseX = e.pageX - 150; // Centrer le SVG par rapport à la souris
  mouseY = e.pageY - 150;
});

// Détecter le clic de souris pour démarrer la rotation et créer des particules
document.addEventListener("mousedown", () => {
  if (isScalingFixed) return; // Empêcher tout scaling si la taille maximale est atteinte
  mouseDown = true; // La souris est enfoncée
  elapsedTime = 0; // Réinitialiser le temps écoulé

  // pointSound.setVolume(0.7);
  // pointSound.setRate(1 + Math.random() * 1);

  rotationAngle += -45; // Augmenter l'angle de 45 degrés au clic
  if (rotationAngle >= 360) {
    rotationAngle = 0; // Réinitialiser l'angle si on dépasse 360 degrés
  }

  // Commencer à créer des particules toutes les 50ms
  particleInterval = setInterval(() => {
    createParticles(mouseX, mouseY);
  }, 50);

  // Démarrer le scaling de la lettre
  scaleLetter();
});

// Détecter la fin du clic
document.addEventListener("mouseup", () => {
  mouseDown = false; // La souris est relâchée
  rotationAngle = 0; // Réinitialiser la rotation à 0 lorsqu'on relâche la souris

  pointSound.setVolume(0);
  // Réinitialiser le scale de la lettre si la taille maximale n'est pas atteinte
  if (!isScalingFixed) {
    scale = 1;
    svgLetter.style.transform = `translateX(-50%) scale(${scale})`;
  }

  // Arrêter la création de particules
  clearInterval(particleInterval);
});

// Fonction pour scaler la lettre
function scaleLetter() {
  if (mouseDown && !isScalingFixed) {
    elapsedTime += 100; // Ajouter ~16ms (environ 60 FPS)
    scale = 1 + elapsedTime / 1000; // Augmenter la taille de la lettre (ex. 1 unité par seconde)

    // Vérifier si on atteint la taille maximale
    if (scale >= maxScale) {
      scale = maxScale; // Fixer la taille à la taille maximale
      isScalingFixed = true; // Marquer la lettre comme "fixée"
      fin = 1;
      handleFinish();
    }

    // Appliquer la nouvelle échelle
    svgLetter.style.transition = "transform 1s ease-out"; // Transition fluide pour l'échelle et la rotation
    svgLetter.style.transform = `translateX(-50%) scale(${scale})`;
    svgLetter.style.transformOrigin = "bottom center";

    // Continuer tant que mouseDown = true
    requestAnimationFrame(scaleLetter);
  }
}

// Classe de particule
class Particle {
  constructor(x, y) {
    this.x = x - 20;
    this.y = y + 150;
    this.size = 6;
    this.speedX = Math.random() * 3 - 1.5;
    this.speedY = Math.random() * 20 - 1.5;
    this.gravity = 0.8; // Force de la gravité
    this.friction = 0.98; // Friction pour ralentir les particules

    pointSound.setVolume(0.5);
    pointSound.setRate(1.2 + Math.random() * 0.5);

    // Créer un élément DOM pour chaque particule
    this.element = document.createElement("div");
    this.element.style.position = "absolute";
    this.element.style.width = `${this.size * 2}px`;
    this.element.style.height = `${this.size * 2}px`;
    this.element.style.backgroundColor = "white";
    this.element.style.borderRadius = "5%"; // Rond pour la particule
    document.body.appendChild(this.element);
  }

  // Mettre à jour la position et la taille de la particule
  update() {
    this.speedY += this.gravity; // Appliquer la gravité
    this.speedX *= this.friction; // Appliquer la friction
    this.speedY *= this.friction;

    this.x += this.speedX;
    this.y += this.speedY;

    // Mettre à jour la position de l'élément DOM
    this.element.style.left = `${this.x - this.size}px`;
    this.element.style.top = `${this.y - this.size}px`;

    // Réduire la taille de la particule avec le temps
    if (this.size > 0.1) {
      this.size -= 0.05;
      this.element.style.width = `${this.size * 2}px`;
      this.element.style.height = `${this.size * 2}px`;
    }
  }
}

// Fonction pour créer des particules
function createParticles(x, y) {
  for (let i = 0; i < 5; i++) {
    // Créer 5 particules à chaque intervalle
    particles.push(new Particle(x, y));
  }
}

// Fonction de mise à jour
function update(dt) {
  const scale = 1; // Définir un facteur de mise à l'échelle (tu peux l'ajuster)

  // Mettre à jour le fond du canvas
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Utilisation de `mouseX` et `mouseY` pour déplacer le SVG de la souris
  svgMouse.style.left = `${mouseX}px`;
  svgMouse.style.top = `${mouseY}px`;

  // Appliquer la rotation si la souris est enfoncée
  if (mouseDown) {
    svgMouse.style.transform = `rotate(${rotationAngle}deg)`;
  } else {
    // Réinitialiser la rotation à 0 lorsqu'on relâche la souris
    svgMouse.style.transform = `rotate(0deg)`;
  }

  // Mettre à jour et dessiner toutes les particules
  particles.forEach((particle, index) => {
    particle.update();

    // Supprimer les particules trop petites
    if (particle.size <= 0.2) {
      document.body.removeChild(particle.element);
      particles.splice(index, 1);
    }
  });

  // Terminer si le spring est à l'état final
  // if (fin <= 1) {
  //   finish();
  // }
}

function handleFinish() {
  winSound.play();
  document.body.removeChild(svgMouse);
  setTimeout(finish, 1500);
  // Vérifier si l'animation est terminée
}
