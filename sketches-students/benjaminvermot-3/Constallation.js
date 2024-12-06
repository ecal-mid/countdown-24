import Easing from "./Easing.js";

export default class Constellation {
  constructor(ctx, sX, sY) {
    this.ctx = ctx;
    this.posX = 0;
    this.posY = 0;
    this.scaleX = sX;
    this.scaleY = sY;
    this.opacity = 0;

    this.constImg = new Image();
    //this.matchImg2 = new Image();
    this.constImg.src = "./imgs/Constellation.png"; // Remplacez par l'URL de votre image
    //this.matchImg2.src = "../../svgs/match2.png"; // Remplacez par l'URL de votre image
    this.isLoaded = false;
    this.constImg.onload = () => {
      this.isLoaded = true;
    };

    this.isRevealed = false;

    this.isDisplayed = true;
  }

  draw() {
    this.ctx.globalAlpha = this.opacity;

    if (this.isLoaded && this.isDisplayed) {
      this.ctx.drawImage(
        this.constImg,
        this.posX,
        this.posY,
        this.scaleX,
        this.scaleY
      );
      this.ctx.globalAlpha = 1.0;
    }

    if (this.opacity >= 1) {
      this.isRevealed = true;
    }
  }

  checkMouseDistance(mouseX, mouseY, width, height) {
    this.distanceToMouse = this.calculateDistance(
      mouseX,
      mouseY,
      width * 2 - 500,
      height
    );

    if (this.distanceToMouse <= 600) {
      console.log("isClose");
      this.opacity += 0.005;
    }
    if (this.distanceToMouse >= 600) {
      console.log("isClose");
      if (this.opacity <= 0) {
        return;
      } else {
        this.opacity -= 0.005;
      }
    }
  }

  calculateDistance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
