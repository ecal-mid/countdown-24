import { createSpringSettings, Spring } from "../../shared/spring.js";
import { createEngine } from "../../shared/engine.js";
import Easing from "./Easing.js";

export default class Letter {
  constructor(ctx, x, y) {
    this.ctx = ctx;
    this.posX = x;
    this.posY = y;

    this.vel = 0;

    this.scale = 200;
    this.scaleOrigin = 200;
    this.scaleTarget = 600;

    this.rotation = (Math.PI / 2) * 2;
    this.originRotation = (Math.PI / 2) * 2;
    this.targetRotation = Math.PI * 1.5;

    this.isActive = false;
    this.isDisplayed = true;

    this.easing = new Easing();

    this.timing = 0;
    this.speed = 0.01;
  }

  draw() {
    if (this.isActive && this.isDisplayed) {
      this.ctx.save();

      // Configurer les transformations
      this.ctx.translate(this.posX, this.posY); // Déplacer l'origine au point de pivot (centre)
      this.ctx.rotate(this.rotation); // Appliquer la rotation (en radians)
      this.ctx.translate(-this.posX, -this.posY); // Déplacer l'origine au point de pivot (centre)

      this.ctx.font = `${this.scale}px NeueCorp`; // Taille et police
      this.ctx.fillStyle = "white"; // Couleur de remplissage
      this.ctx.textAlign = "center"; // Alignement horizontal
      this.ctx.textBaseline = "middle"; // Alignement vertical
      this.ctx.fillText("2", this.posX, this.posY);

      this.ctx.restore();

      console.log(this.posX, this.posY, this.scale);
    }
  }

  scaleLetter(deltaTime) {
    const distToTarget = this.scaleTarget - this.scale;
    const springForce = 100;
    const springDamping = 10;
    const force = distToTarget * springForce - this.vel * springDamping; // * this.easing.elasticInOut(this.timing);
    this.vel += force * deltaTime;
    this.scale += this.vel * deltaTime;
  }

  rotateLetter() {
    this.timing += this.speed;
    this.rotation =
      this.targetRotation +
      (this.targetRotation - this.originRotation) *
        this.easing.elasticOut(this.timing);
    console.log("rotate", this.rotation);
  }
}
