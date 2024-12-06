export default class Point {
  constructor(ctx, x, y) {
    this.ctx = ctx;
    this.posX = x;
    this.posY = y;
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.posX, this.posY, 2, 0, Math.PI * 2);
    this.ctx.fillStyle = "white";
    this.ctx.fill();
    this.ctx.closePath();
  }
}
