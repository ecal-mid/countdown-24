import Easing from "./Easing.js";

export default class Sifflet {
  constructor(ctx) {
    this.ctx = ctx;
    this.posX;
    this.posY;
    this.scale = 300;
    this.originScale = 300;

    this.targetScale = 400;

    this.timing = 0;
    this.speed = 0.0045;

    this.easing = new Easing();

    this.isSiffling = false;
  }

  draw(mouseX, mouseY) {
    this.posX = mouseX;
    this.posY = mouseY;
    this.ctx.beginPath();
    this.ctx.arc(this.posX, this.posY, this.scale, 0, Math.PI * 2);
    this.ctx.strokeStyle = "white";
    this.ctx.stroke();
  }

  siffle() {
    if (this.isSiffling) {
      this.scaleUp();
    }

    if (!this.isSiffling) {
      this.scaleDown();
    }
  }

  scaleUp() {
    this.timing += this.speed;
    this.scale =
      this.originScale +
      (this.targetScale - this.originScale) *
        this.easing.elasticOut(this.timing);
  }
  scaleDown() {
    this.timing += this.speed;
    this.scale =
      this.scale +
      (this.originScale - this.scale) * this.easing.elasticOut(this.timing);
  }
}
