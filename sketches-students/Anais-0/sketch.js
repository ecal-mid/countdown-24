import { createIframeClient } from "../../shared/engine/iframeClient.js";
const iframeClient = createIframeClient();
function finish() {
  iframeClient.sendFinishSignal();
}

let currentBand = null; // Variable pour suivre le bandeau actuellement glissé
let initialX, initialY; // Position initiale de la souris au moment du début du glissement
let bandsRemoved = 0; // Suivi du nombre de bandeaux supprimés
const totalBands = 5; // Nombre total de bandeaux à retirer

// Fonction pour commencer à glisser un bandeau
function startDrag(event, band) {
  currentBand = band;
  initialX = event.clientX;
  initialY = event.clientY;

  // Ajouter un écouteur d'événements pour le déplacement de la souris
  document.addEventListener("mousemove", dragMove);
  document.addEventListener("mouseup", stopDrag);
}

// Fonction pour déplacer le bandeau pendant le glissement
function dragMove(event) {
  const deltaX = event.clientX - initialX;
  const deltaY = event.clientY - initialY;

  // Déplacer le bandeau en fonction du mouvement de la souris
  currentBand.style.left = `${currentBand.offsetLeft + deltaX}px`;
  currentBand.style.top = `${currentBand.offsetTop + deltaY}px`;

  // Mettre à jour la position initiale
  initialX = event.clientX;
  initialY = event.clientY;
}

// Fonction pour arrêter le glissement et supprimer le bandeau si déplacé à côté
function stopDrag() {
  // Retirer les écouteurs d'événements
  document.removeEventListener("mousemove", dragMove);
  document.removeEventListener("mouseup", stopDrag);

  // Vérifier si le bandeau a été déplacé à l'extérieur de la zone
  if (isOutsideContainer(currentBand)) {
    currentBand.style.opacity = 0; // Le bandeau devient invisible
    setTimeout(() => {
      currentBand.remove(); // Supprimer le bandeau du DOM après l'animation
      bandsRemoved++; // Incrémenter le compteur des bandeaux retirés
      checkForFireworks(); // Vérifier si tous les bandeaux ont été retirés
    }, 300);
  } else {
    // Remettre le bandeau à sa position initiale si non déposé à côté
    currentBand.style.left = `0px`;
    currentBand.style.top = `${currentBand.dataset.initialTop}%`;
  }
}

// Fonction pour vérifier si le bandeau est en dehors de la zone du "0"
function isOutsideContainer(band) {
  const containerRect = document
    .querySelector(".container")
    .getBoundingClientRect();
  const bandRect = band.getBoundingClientRect();

  // Si le bandeau a été déplacé hors du conteneur
  return (
    bandRect.top < containerRect.top ||
    bandRect.left < containerRect.left ||
    bandRect.right > containerRect.right ||
    bandRect.bottom > containerRect.bottom
  );
}

// Fonction pour vérifier si tous les bandeaux ont été retirés et afficher les feux d'artifice
function checkForFireworks() {
  if (bandsRemoved === totalBands) {
    showFireworks(); // Afficher les feux d'artifice
  }
}

// Fonction pour afficher les feux d'artifice
function showFireworks() {
  const canvas = document.getElementById("fireworksCanvas");
  const ctx = canvas.getContext("2d");
  canvas.style.display = "block"; // Afficher le canvas

  const particles = []; // Liste des particules de feu d'artifice
  // Fonction pour créer une particule avec une couleur rose pastel ou violette
  function createParticle(x, y) {
    // Choisir aléatoirement entre rose pastel et violet
    const color =
      Math.random() < 0.5
        ? "hsl(0, 100%, 55%)" // Rouge (0° de teinte)
        : "hsl(340, 100%, 55%)"; // Rose (340° de teinte)

    const speed = Math.random() * 5 + 1;
    const angle = Math.random() * 2 * Math.PI;

    particles.push({
      x: x,
      y: y,
      speedX: speed * Math.cos(angle),
      speedY: speed * Math.sin(angle),
      color: color,
      size: Math.random() * 3 + 2, // Taille aléatoire des particules
    });
  }

  // Créer un feu d'artifice au centre
  for (let i = 0; i < 200; i++) {
    createParticle(canvas.width / 2, canvas.height / 2);
  }

  // Fonction d'animation des particules
  function animateFireworks() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.speedX;
      p.y += p.speedY;
      p.size *= 0.98; // Réduire la taille pour l'effet de dissipation
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }

    // Si les particules sont petites, on arrête l'animation
    if (particles[0] && particles[0].size < 0.1) {
      canvas.style.display = "none"; // Cacher le canvas une fois l'animation terminée
      finish();
    } else {
      requestAnimationFrame(animateFireworks); // Continuer l'animation
    }
  }

  // Jouer le son "fire.mov" au moment où les feux d'artifice commencent
  const audio = new Audio("fire.mov");
  audio.play();

  animateFireworks(); // Lancer l'animation des feux d'artifice
}

// Ajouter des écouteurs d'événements pour chaque bandeau
document.querySelectorAll(".overlay").forEach((band, index) => {
  band.dataset.initialTop = band.style.top; // Sauvegarder la position de départ du bandeau
  band.addEventListener("mousedown", (e) => startDrag(e, band));
});
