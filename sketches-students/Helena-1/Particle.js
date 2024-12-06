export default class Particle {
  constructor(
    /** @type CanvasRenderingContext */ ctx,
    letter,
    isSpecial,
    x,
    y
  ) {
    this.ctx = ctx;
    this.letter = letter;
    this.x = x;
    this.y = y;
    this.initialX = x;
    this.initialY = y;
    this.isSpecial = isSpecial;
    this.vx = 0;
    this.vy = 0;
    this.forceX = 0;
    this.forceY = 0;
    this.color = "white";
    this.scale = 1;
    this.hasBeenClicked = false;

    this.font = "bold 20px Arial";
    this.color = "white";
  }

  updatePosition() {
    this.vx *= 0.6;
    this.vy *= 0.6;
    this.vx += this.forceX;
    this.vy += this.forceY;
    this.x += this.vx;
    this.y += this.vy;

    this.forceX = 0;
    this.forceY = 0;
  }

  ///////PREVIOUS
  // draw() {
  //   this.ctx.save();
  //   this.ctx.translate(this.x, this.y);
  //   this.ctx.fillStyle = this.color;
  //   this.ctx.font = `${this.scale * 20}px monospace`;
  //   this.ctx.textAlign = "center";
  //   this.ctx.textBaseline = "middle";
  //   this.ctx.fillText(this.letter, 0, 0);
  //   this.ctx.restore();
  // }

  draw() {
    this.ctx.save();
    this.ctx.translate(this.x, this.y);
    this.ctx.fillStyle = this.color;
    // this.ctx.scale(this.scale, this.scale);
    // Dynamically combine font size with other font styles
    const fontSize = `${this.scale * 20}px`;
    const fontFamily = "monospace";
    this.ctx.font = `${this.font.split(" ")[0]} ${fontSize} ${fontFamily}`;

    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(this.letter, 0, 0);
    this.ctx.restore();
  }
}
