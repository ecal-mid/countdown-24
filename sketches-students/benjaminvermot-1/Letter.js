import Easing from "./Easing.js";

export default class Letter {
  constructor(ctx, x, y, s) {
    this.ctx = ctx;
    this.posX = x;
    this.posY = y;
    this.scale = s;

    this.isDisplayed = true;
  }

  draw() {
    if (this.isDisplayed) {
      this.ctx.font = `${this.scale}px NeueCorp`; // Taille et police
      this.ctx.fillStyle = "white"; // Couleur de remplissage
      this.ctx.textAlign = "center"; // Alignement horizontal
      this.ctx.textBaseline = "middle"; // Alignement vertical

      // Dessiner le texte
      this.ctx.fillText("1", this.posX, this.posY);
    }
  }
}
