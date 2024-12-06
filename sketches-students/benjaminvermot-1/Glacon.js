export default class Glacon {
  constructor(ctx, x, y, sX, sY, url) {
    this.ctx = ctx;
    this.posX = x;
    this.posY = y;
    this.scaleX = sX;
    this.scaleY = sY;

    this.glaconImg = new Image();

    this.glaconImg.src = url;

    this.isLoaded = false;
    this.glaconImg.onload = () => {
      this.isLoaded = true;
    };

    this.isDisplayed = true;
    this.isShrinking = false;
  }

  draw() {
    if (this.isLoaded && this.isDisplayed) {
      this.ctx.save();
      this.ctx.translate(0, -this.scaleY / 2);
      this.ctx.drawImage(
        this.glaconImg,
        this.posX - this.scaleX / 2,
        this.posY - this.scaleY / 2 + 300,
        this.scaleX,
        this.scaleY
      );
      this.ctx.restore();

      console.log(
        this,
        "glacon is beeing drawned with this url-> ",
        this.glaconImg.src
      );
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
      this.shrinkDown();
      this.isShrinking = true;
    } else {
      this.isShrinking = false;
    }
  }

  shrinkDown() {
    this.scaleY -= 2;
    console.log("shrink");

    if (this.scaleY <= 0.1) {
      this.isDisplayed = false;
    }
  }

  calculateDistance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
