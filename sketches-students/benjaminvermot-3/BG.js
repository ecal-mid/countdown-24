import Easing from "./Easing.js";

export default class BG {
  constructor(ctx, sX, sY) {
    this.ctx = ctx;
    this.posX = 0;
    this.posY = 0;
    this.scaleX = sX;
    this.scaleY = sY;

    this.bgImg = new Image();
    //this.matchImg2 = new Image();
    this.bgImg.src = "./imgs/Background.png"; // Remplacez par l'URL de votre image
    //this.matchImg2.src = "../../svgs/match2.png"; // Remplacez par l'URL de votre image
    this.isLoaded = false;
    this.bgImg.onload = () => {
      this.isLoaded = true;
    };

    this.opacity;
    this.isDisplayed = true;
  }

  draw() {
    this.ctx.globalAlpha = this.opacity;
    if (this.isLoaded && this.isDisplayed) {
      this.ctx.drawImage(
        this.bgImg,
        this.posX,
        this.posY,
        this.scaleX,
        this.scaleY
      );
    }

    if (!this.isDisplayed) {
      this.opacity -= 1;
    }
  }
}
