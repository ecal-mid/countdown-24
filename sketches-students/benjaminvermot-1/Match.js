import Easing from "./Easing.js";

export default class Match {
  constructor(ctx, s) {
    this.ctx = ctx;
    this.posX;
    this.posY;
    this.targetPosX;
    this.targetPosY;
    this.velX;
    this.scale = s;

    this.matchImg1 = new Image();
    //this.matchImg2 = new Image();
    this.matchImg1.src = "./imgs/match.png"; // Remplacez par l'URL de votre image
    //this.matchImg2.src = "../../svgs/match2.png"; // Remplacez par l'URL de votre image
    this.isLoaded = false;
    this.matchImg1.onload = () => {
      this.isLoaded = true;
    };

    this.isDisplayed = true;
  }

  draw(mouseX, mouseY) {
    if (this.isLoaded && this.isDisplayed) {
      this.posX = mouseX;
      this.posY = mouseY;
      this.ctx.drawImage(
        this.matchImg1,
        this.posX - this.scale / 2 - 50,
        this.posY - 100,
        this.scale,
        this.scale
      );
    }
  }

  move(deltaTime) {
    if (this.isLoaded) {
      const distToTargetX = this.targetPosX - this.posX;
      const distToTargetY = this.targetPosY - this.posY;
      const springForce = 50;
      const springDamping = 10;
      const forceX = distToTargetX * springForce - this.velX * springDamping; // * this.easing.elasticInOut(this.timing);
      const forceY = distToTargetY * springForce - this.velY * springDamping; //* this.easing.elasticInOut(this.timing);
      this.velX += forceX * deltaTime;
      this.velY += forceY * deltaTime;
      this.posX += this.velX * deltaTime;
      this.posY += this.velY * deltaTime;
    }
  }

  checkMouseDistance(mouseX, mouseY) {
    this.distanceToMouse = this.calculateDistance(
      mouseX,
      mouseY,
      this.posX,
      this.posY
    );
    if (this.distanceToMouse < 400) {
    } else {
      return;
    }
  }

  calculateDistance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
