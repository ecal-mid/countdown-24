export default class Smoke {
  constructor(ctx, x, y, r, velX, velY) {
    this.ctx = ctx;
    this.posX = x;
    this.posY = y;
    this.scale = r;
    this.velX = velX;
    this.velY = velY;
    this.opacity = 1;
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.posX, this.posY, this.scale, 0, Math.PI * 2);
    this.ctx.fillStyle = "orange";
    this.ctx.fill();
    this.ctx.closePath();

    const randomForceValue = Math.random() * -1;

    this.velY += randomForceValue;
  }

  move(deltaTime) {
    const force = 10;
    this.posX += this.velX * deltaTime * force;
    this.posY += this.velY * deltaTime * force;
  }
}
