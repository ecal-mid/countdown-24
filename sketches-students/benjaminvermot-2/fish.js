export default class Fish {
  constructor(ctx, x, y, sX, sY) {
    this.ctx = ctx;

    this.scaleX = sX;
    this.scaleY = sY;
    this.originScaleX = sX;
    this.originScaleY = sY;
    this.targetScaleX = sX;
    this.targetScaleY = sY;
    this.velX = 0;
    this.velY = 0;
    this.posX = x;
    this.posY = y;
    this.height = window.innerHeight;
    this.basePos;
    this.isActive = true;
  }

  draw() {
    if (this.isActive) {
      this.ctx.save();
      this.ctx.translate(-this.scaleX / 2, -this.scaleY / 2);
      this.ctx.beginPath();
      this.ctx.rect(this.posX, this.posY, this.scaleX, this.scaleY);

      this.ctx.fillStyle = "white";
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  remove() {
    this.isActive = false;
  }

  scale(deltaTime) {
    const distToTargetX = this.targetScaleX - this.scaleX;
    const distToTargetY = this.targetScaleY - this.scaleY;
    const springForce = 150;
    const springDamping = 10;
    const forceX = distToTargetX * springForce - this.velX * springDamping; // * this.easing.elasticInOut(this.timing);
    const forceY = distToTargetY * springForce - this.velY * springDamping; //* this.easing.elasticInOut(this.timing);
    this.velX += forceX * deltaTime;
    this.velY += forceY * deltaTime;
    this.scaleX += this.velX * deltaTime;
    this.scaleY += this.velY * deltaTime;
  }
}
