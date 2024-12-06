import Easing from "./Easing.js";

export default class Match {
  constructor(ctx, s) {
    this.ctx = ctx;
    this.posX;
    this.posY;
    this.vel = 0;
    this.scale = s;
    this.targetScale = 900;

    this.matchImg1 = new Image();

    this.matchImg1.src = "./imgs/fire.png"; // Remplacez par l'URL de votre image
    this.isLoaded = false;
    this.matchImg1.onload = () => {
      this.isLoaded = true;
    };

    this.isDisplayed = false;
    // this.setup();
  }

  draw(x, y) {
    if (this.isLoaded && this.isDisplayed) {
      this.posX = x;
      this.posY = y;
      this.ctx.drawImage(
        this.matchImg1,
        this.posX - this.scale / 2,
        this.posY - this.scale / 2,
        this.scale,
        this.scale
      );

      console.log("fireIsDisplayed");
    }
  }

  scaleGlacon(deltaTime) {
    if (this.isLoaded && this.isDisplayed) {
      const distToTarget = this.targetScale - this.scale;
      const springForce = 100;
      const springDamping = 8;
      const force = distToTarget * springForce - this.vel * springDamping; // * this.easing.elasticInOut(this.timing);
      this.vel += force * deltaTime;
      this.scale += this.vel * deltaTime;
    }
  }

  scaleDown() {
    this.targetScale = 0;
  }
}
