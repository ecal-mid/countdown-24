import { createEngine } from "../../shared/engine.js";
import { Spring } from "../../shared/spring.js";

const { renderer, input, math, run, finish, audio } = createEngine();
const { ctx, canvas } = renderer;

const hand1 = await loadImage("left.png");
const hand2 = await loadImage("right.png");

const springFreq = 1.5;
const springHalfLife = 0.25;
const handPosX = new Spring({
  position: canvas.width / 2,
  frequency: springFreq,
  halfLife: springHalfLife,
});
const handPosY = new Spring({
  position: canvas.height + 200,
  frequency: springFreq,
  halfLife: springHalfLife,
});

const images = [
  await loadImage("gugus1.png"),
  await loadImage("gugus2.png"),
  await loadImage("gugus3.png"),
  await loadImage("gugus4.png"),
  await loadImage("gugus5.png"),
  await loadImage("gugus6.png"),
  await loadImage("gugus7.png"),
  await loadImage("gugus8.png"),
  await loadImage("gugus9.png"),
  await loadImage("gugus10.png"),
  await loadImage("gugus11.png"),
  await loadImage("gugus12.png"),
  await loadImage("gugus13.png"),
  await loadImage("gugus14.png"),
  await loadImage("gugus15.png"),
  await loadImage("gugus16.png"),
];

let imageId = 0;
let opacity = 0;
const fadeInDuration = 3;
const fadeOutDuration = 3;
let fadeInStartTime = null;
let fadeOutStartTime = null;
let handsGone = false;

const clapSound = await audio.load("clap.mp3"); // Charger le son de clap

// Ajout de la gestion du flash d'écran
const flashDuration = 0.2; // Durée du flash en secondes
let flashActiveTime = 0;
let handsTouching = false;

const clapSpring = new Spring({
  position: 300,
  frequency: 12.5,
  halfLife: 0.05,
});

// Facteur de mise à l'échelle de base pour les gugus et les mains
const baseScaleFactorGugus = 1;
const scaleFactorHands = 1.5; // Agrandir les mains 1.5 fois

function update(deltaTime) {
  const mouseX = input.getX();
  const mouseY = input.getY();

  if (flashActiveTime > 0) {
    // Si l'écran doit devenir blanc, on change la couleur de fond
    ctx.fillStyle = "white"; // Couleur blanche pendant le flash
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    // Sinon, fond noir comme d'habitude
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (flashActiveTime > 0) {
    flashActiveTime -= deltaTime;
    flashActiveTime = Math.max(0, flashActiveTime);
  }
  const timeElapsed = (performance.now() - fadeInStartTime) / 1000;
  if (timeElapsed < fadeInDuration) {
    opacity = timeElapsed / fadeInDuration;
  } else {
    opacity = 1;
  }

  if (handsGone) {
    const fadeOutTimeElapsed = (performance.now() - fadeOutStartTime) / 1000;
    if (fadeOutTimeElapsed < fadeOutDuration) {
      opacity = 1 - fadeOutTimeElapsed / fadeOutDuration;
    } else {
      opacity = 0;
      console.log("FIN ?");
      finish();
    }
  }

  ctx.save();
  ctx.globalAlpha = opacity;

  ctx.translate(canvas.width / 2, canvas.height / 2);

  // Calcul du facteur de mise à l'échelle dynamique pour les gugus
  const scaleFactorGugus = baseScaleFactorGugus * (1 + 0.1 * imageId); // Augmente à chaque fois que l'image change

  const img = images[imageId];
  ctx.drawImage(
    img,
    (-img.width / 2) * scaleFactorGugus,
    (-img.height / 2) * scaleFactorGugus,
    img.width * scaleFactorGugus,
    img.height * scaleFactorGugus
  );

  ctx.restore();

  if (input.isDown()) {
    if (imageId < images.length - 1) imageId++;
  }

  if (input.hasStarted()) {
    if (imageId === images.length - 1) {
      handPosY.target = canvas.height + 500;

      if (!handsGone) {
        handsGone = true;
        fadeOutStartTime = performance.now();
      }
    } else {
      handPosX.target = mouseX;
      handPosY.target = mouseY;
    }
  }

  handPosX.step(deltaTime);
  handPosY.step(deltaTime);

  ctx.save();
  ctx.translate(handPosX.position, handPosY.position);

  if (input.isPressed()) {
    clapSpring.target = 150;
  } else {
    clapSpring.target = 300;
  }
  clapSpring.step(deltaTime);

  const prevHandsTouching = handsTouching;

  // check if clapping
  handsTouching =
    input.isPressed() && clapSpring.position < clapSpring.target + 50;

  // update if it changed
  if (handsTouching && !prevHandsTouching) {
    console.log(clapSpring);
    console.log("clap");
    clapSound.play({
      volume: math.lerp(0.8, 1.2, Math.random()),
      rate: math.lerp(0.8, 1.2, Math.random()),
    });

    flashActiveTime = flashDuration;
  }

  const clapDistance = clapSpring.position;
  ctx.save();
  ctx.translate(-clapDistance / 2, 0);

  // Agrandir les mains
  ctx.drawImage(
    hand1,
    (-hand1.width / 2) * scaleFactorHands,
    (-hand1.height / 2) * scaleFactorHands,
    hand1.width * scaleFactorHands,
    hand1.height * scaleFactorHands
  );
  ctx.restore();

  ctx.save();
  ctx.translate(clapDistance / 2, 0);

  // Agrandir les mains
  ctx.drawImage(
    hand2,
    (-hand2.width / 8) * scaleFactorHands,
    (-hand2.height / 2) * scaleFactorHands,
    hand2.width * scaleFactorHands,
    hand2.height * scaleFactorHands
  );
  ctx.restore();
}

run(update);

async function loadImage(imageUrl) {
  try {
    const img = new Image();
    img.src = imageUrl;

    await new Promise((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = (error) =>
        reject(new Error("Failed to load image: " + error));
    });

    return img;
  } catch (error) {
    console.error(error);
  }
}
