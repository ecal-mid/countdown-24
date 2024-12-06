import { createEngine } from "../../shared/engine.js";

const { renderer, input, math, run, finish } = createEngine();

document.addEventListener("DOMContentLoaded", () => {
  const loserImage = document.getElementById("loser-image");
  const winnerImage = document.getElementById("winner-image");

  function showImage(imageElement, show) {
    imageElement.classList.toggle("hidden", !show);
  }

  let cadres = [];
  let winnerCard;
  let loserCard;

  function createCard() {
    const card = document.createElement("div");
    card.classList.add("card");
    card.classList.add("clickable");
    const cardImg = document.createElement("img");
    cardImg.src = "Cadre1.png";
    card.appendChild(cardImg);
    document.querySelector("#card-container").appendChild(card);
    cadres.push(card);
  }

  function addCardImage(card, src) {
    const cardImg = document.createElement("img");
    cardImg.src = src;
    cardImg.classList.add("card-img");
    card.appendChild(cardImg);
    return cardImg;
  }

  function distributeCards() {
    cadres.forEach((c) => c.remove());
    cadres = [];

    for (let i = 0; i < 12; i++) {
      createCard();
    }

    const winnerCardId = Math.floor(cadres.length * Math.random());
    winnerCard = cadres[winnerCardId];
    addCardImage(winnerCard, "3.png");

    const loserCardId = Math.floor(cadres.length * Math.random());
    if (loserCardId !== winnerCardId) loserCard = cadres[loserCardId];
    else loserCard = null;
    if (loserCard) addCardImage(loserCard, "losercard.png");

    cadres.forEach((cadre) => {
      cadre.addEventListener("click", function () {
        click(cadre);
      });
    });
  }

  distributeCards();

  function click(cadre) {
    cadre.classList.add("clicked");

    // Jouer le son cardReverse.mp3 à chaque clic sur une carte
    playSound("cardReverse.mp3");

    if (cadre === winnerCard || cadre === loserCard) {
      cadre.classList.add("show-card");

      cadres.forEach((item) => {
        item.classList.add("clicked");
        item.classList.add("exit");
      });
      if (cadre === winnerCard) {
        win();
      } else if (cadre === loserCard) {
        lose();
      }
    } else {
      cadre.classList.add("exit");
    }
  }

  function lose() {
    playSound("bad2.mp3");
    document.body.style.pointerEvents = "none";
    setTimeout(() => {
      showImage(loserImage, true);
      setTimeout(() => {
        distributeCards();
        document.body.style.pointerEvents = "auto";
        showImage(loserImage, false);
      }, 2000);
    }, 1500);
  }

  function win() {
    playSound("bad1.mp3");

    document.body.style.pointerEvents = "none";
    setTimeout(() => {
      setTimeout(() => {
        showImage(winnerImage, true);
        setTimeout(() => {
          distributeCards();
          document.body.style.pointerEvents = "auto";
          showImage(winnerImage, false);

          finish();
        }, 2000);
      }, 1000);
    }, 1000);
  }

  function playSound(soundFile) {
    const sound = new Audio(soundFile);
    sound.play();
  }
});
