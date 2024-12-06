import { createIframeClient } from "../../shared/engine/iframeClient.js";
const iframeClient = createIframeClient();
function finish() {
  iframeClient.sendFinishSignal();
}

document.addEventListener("DOMContentLoaded", () => {
  const porte = document.getElementById("porte");
  const chiffre = document.getElementById("chiffre");
  const fondGris = document.createElement("div");
  fondGris.classList.add("fond-gris");

  const chiffreFondGris = document.createElement("div");
  chiffreFondGris.classList.add("chiffre");
  chiffreFondGris.textContent = "2"; // Le chiffre 2

  fondGris.appendChild(chiffreFondGris);
  document.querySelector(".container").appendChild(fondGris); // Ajoute le fond gris dans le conteneur

  let isDragging = false;
  let initialX = 0;
  let currentX = 0;
  let offsetX = 0;
  let finished = false;
  let audioPlayed = false; // Permet de ne jouer l'audio qu'une seule fois

  // Charger l'audio
  const porteAudio = new Audio("./porte.wav"); // Remplace par le chemin vers ton fichier audio

  // Fonction qui démarre le glissement
  porte.addEventListener("mousedown", (e) => {
    isDragging = true;
    initialX = e.clientX - offsetX;
    porte.style.cursor = "grabbing"; // Change le curseur pendant le glissement

    // Jouer l'audio lorsqu'on commence à glisser la porte
    if (!audioPlayed) {
      porteAudio.play();
      audioPlayed = true; // Éviter de rejouer l'audio à chaque mouvement
    }
  });

  // Fonction pour suivre le mouvement de la souris
  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      currentX = e.clientX - initialX;
      offsetX = currentX;

      // Limiter l'offset à une largeur de 300px
      if (offsetX < 0) {
        offsetX = 0;
      }
      if (offsetX > 300) {
        offsetX = 300;
      }

      // Appliquer la rotation pour simuler l'ouverture de la porte
      const rotationAngle = (offsetX / 300) * 90;

      porte.style.transform = `rotateY(${rotationAngle}deg)`; // La porte pivote autour de l'axe Y

      if (rotationAngle === 90) {
        setTimeout(() => {
          if (!finished) {
            finished = true;
            finish();
          }
        }, 1000);
      }

      function transitionBlack() {
        // Créer un élément div pour l'overlay noir
        const blackOverlay = document.createElement("div");

        // Style de l'overlay pour couvrir toute la page
        blackOverlay.style.position = "fixed";
        blackOverlay.style.top = "0";
        blackOverlay.style.left = "0";
        blackOverlay.style.width = "100%";
        blackOverlay.style.height = "100%";
        blackOverlay.style.backgroundColor = "black"; // Couleur noire
        blackOverlay.style.zIndex = "1000"; // Pour s'assurer que l'overlay soit au-dessus de tout
        blackOverlay.style.opacity = "0"; // Commence transparent
        blackOverlay.style.transition = "opacity 1s ease"; // Transition fluide de 1 seconde

        // Ajouter l'overlay au body
        document.body.appendChild(blackOverlay);

        // Déclencher la transition pour faire apparaître le noir
        setTimeout(() => {
          blackOverlay.style.opacity = "1"; // Devient noir après un petit délai
        }, 10);

        // Une fois la transition terminée, on peut retirer l'overlay si besoin ou appeler une autre action
        setTimeout(() => {
          // Par exemple, terminer ou exécuter une autre fonction après la transition
          console.log("Transition vers écran noir terminée.");
        }, 1000); // Correspond au temps de la transition
      }

      // Le fond gris et le chiffre deviennent visibles dès que la porte est suffisamment ouverte
      if (offsetX > 150) {
        fondGris.style.visibility = "visible";
        chiffreFondGris.style.visibility = "visible"; // Le chiffre devient visible sur le fond gris
      }
    }
  });

  // Fonction pour arrêter le glissement
  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      porte.style.cursor = "grab"; // Restaure le curseur initial

      // Si la porte est ouverte à plus de 150px, le chiffre et le fond gris restent visibles
      if (offsetX > 150) {
        fondGris.style.visibility = "visible";
        chiffreFondGris.style.visibility = "visible";
      } else {
        porte.style.transform = "rotateY(0deg)"; // Revenir à la position initiale
        fondGris.style.visibility = "hidden"; // Cacher le fond gris si la porte est fermée
        chiffreFondGris.style.visibility = "hidden"; // Cacher le chiffre si la porte est fermée
      }
    }
  });
});
