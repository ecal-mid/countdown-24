import Easing from "./Easing.js";

export default class Mask {
  constructor(ctx, s) {
    this.ctx = ctx;
    this.posX = 0;
    this.posY = 0;
    this.velX = 0;
    this.velY = 0;
    this.targetPosX = 0;
    this.targetPosY = 0;

    this.scale = s;
    this.targetScale = s;

    this.maskImage = new Image();
    this.maskImage.src = "./imgs/DashedOutline.png"; // Remplacez par l'URL de votre image
    this.isLoaded = false;
    this.maskImage.onload = () => {
      this.isLoaded = true;
    };

    this.ending = false;
  }

  draw() {
    if (this.isLoaded) {
      const ctx = this.ctx;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.arc(this.posX, this.posY, this.scale, 0, Math.PI * 2);
      ctx.clip("evenodd");
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.restore();

      ctx.save();
      ctx.translate(-this.scale / 2, -this.scale / 2);
      this.ctx.drawImage(
        this.maskImage,
        this.posX - this.scale / 2,
        this.posY - this.scale / 2,
        this.scale * 2,
        this.scale * 2
      );
      ctx.restore();
    }

    if (!this.ending) {
      this.scale = (this.velX * 3) / 130 + 400;
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
  }

  calculateDistance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  grow() {
    this.scaleX += 1920 / 1.5;
    this.scaleY += 1080 / 1.5;
  }
}
