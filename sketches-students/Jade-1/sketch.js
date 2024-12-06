import { createEngine } from "../../shared/engine.js";

const { renderer, input, math, run, finish } = createEngine();

document.addEventListener("DOMContentLoaded", () => {
  const eyeLeftOpen = document.getElementById("eye-left-open");
  const eyeRightOpen = document.getElementById("eye-right-open");
  const eyeLeftBlink = document.getElementById("eye-left-blink");
  const eyeRightBlink = document.getElementById("eye-right-blink");
  const eyeLeftClosed = document.getElementById("eye-left-closed");
  const eyeRightClosed = document.getElementById("eye-right-closed");
  const yeux = document.querySelector(".Yeux");

  const sparkles = document.createElement("img");
  sparkles.src = "sparkles.png";
  sparkles.alt = "Sparkles";
  sparkles.classList.add("sparkles-image");
  sparkles.style.display = "none";
  document.body.appendChild(sparkles);

  const blinkSound = new Audio("blink.mp3");

  let isBlinking = false;

  yeux.classList.add("eye-appear");

  function moveEyesOut() {
    yeux.classList.remove("eye-appear");
    yeux.classList.add("eye-moving-out");
  }

  function moveEyesIn() {
    yeux.classList.add("eye-appear");
  }

  function startBlinking() {
    if (isBlinking) return;
    if (
      eyeLeftClosed.style.display !== "block" ||
      eyeRightClosed.style.display !== "block"
    ) {
      return;
    }
    isBlinking = true;

    setTimeout(() => {
      let blinkCount = 0;
      let blinkingInterval = setInterval(() => {
        if (
          eyeLeftClosed.style.display === "block" &&
          eyeRightClosed.style.display === "block"
        ) {
          eyeLeftClosed.style.display = "none";
          eyeRightClosed.style.display = "none";
          eyeLeftBlink.style.display = "block";
          eyeRightBlink.style.display = "block";
        } else {
          eyeLeftClosed.style.display = "block";
          eyeRightClosed.style.display = "block";
          eyeLeftBlink.style.display = "none";
          eyeRightBlink.style.display = "none";
          blinkSound.play();
        }

        blinkCount++;

        if (blinkCount >= 6) {
          clearInterval(blinkingInterval);
          sparkles.style.display = "block";

          setTimeout(() => {
            sparkles.style.display = "none";
            moveEyesOut();
          }, 2000);

          isBlinking = false;
          setTimeout(() => {
            finish();
          }, 5000);
        }
      }, 300);
    }, 1000);
  }

  function fadeOutElements() {
    const allElements = document.querySelectorAll("body *");
    allElements.forEach((element) => {
      element.classList.add("eye-moving-out");

      element.addEventListener("transitionend", () => {
        element.style.display = "none";
      });
    });
  }

  eyeLeftOpen.addEventListener("click", () => {
    if (isBlinking) return;
    eyeLeftOpen.style.display = "none";
    eyeLeftBlink.style.display = "block";
  });

  eyeLeftBlink.addEventListener("click", () => {
    if (isBlinking) return;
    eyeLeftBlink.style.display = "none";
    eyeLeftClosed.style.display = "block";
    startBlinking();
    blinkSound.play();
  });

  eyeLeftClosed.addEventListener("click", () => {
    if (isBlinking) return;
    eyeLeftClosed.style.display = "none";
    eyeLeftBlink.style.display = "block";
  });

  eyeRightOpen.addEventListener("click", () => {
    if (isBlinking) return;
    eyeRightOpen.style.display = "none";
    eyeRightBlink.style.display = "block";
    moveEyesIn();
  });

  eyeRightBlink.addEventListener("click", () => {
    if (isBlinking) return;
    eyeRightBlink.style.display = "none";
    eyeRightClosed.style.display = "block";
    startBlinking();
    blinkSound.play();
  });

  eyeRightClosed.addEventListener("click", () => {
    if (isBlinking) return;
    eyeRightClosed.style.display = "none";
    eyeRightBlink.style.display = "block";
  });

  function resetEyes() {
    if (isBlinking) return;
    eyeLeftClosed.style.display = "none";
    eyeRightClosed.style.display = "none";
  }

  eyeLeftClosed.addEventListener("click", resetEyes);
  eyeRightClosed.addEventListener("click", resetEyes);
});
