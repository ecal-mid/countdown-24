export default class Star {
  constructor(ctx, x, y) {
    this.ctx = ctx;
    this.posX = x;
    this.posY = y;
    this.targetPosX = x;
    this.targetPosY = y;
    this.velX = 0;
    this.velY = 0;
    this.scale = Math.random() * (10 - 1) + 1;
    this.originScale = this.scale;
    this.targetScale = this.scale * 1.3;

    this.amplitude = 2;

    this.scaleDown = false;
    this.hasDisapear = false;
  }

  draw() {
    this.ctx.beginPath();

    this.ctx.arc(this.posX, this.posY, this.scale, 0, Math.PI * 2);
    this.ctx.fillStyle = "white";
    this.ctx.fill();

    this.ctx.closePath();

    if (this.scaleDown) {
      this.scale -= 0.05;
    }

    if (this.scale <= 0.1) {
      this.hasDisapear = true;
      this.scale = 0;
    }
  }

  move(deltaTime) {
    const distToTargetX = this.targetPosX - this.posX;
    const distToTargetY = this.targetPosY - this.posY;
    const springForce = 100;
    const springDamping = 10;
    const forceX = distToTargetX * springForce - this.velX * springDamping; // * this.easing.elasticInOut(this.timing);
    const forceY = distToTargetY * springForce - this.velY * springDamping; //* this.easing.elasticInOut(this.timing);
    this.velX += forceX * deltaTime;
    this.velY += forceY * deltaTime;
    this.posX += this.velX * deltaTime;
    this.posY += this.velY * deltaTime;
  }

  updateTarget(x, y) {
    this.targetPosX = x;
    this.targetPosY = y;
    console.log("updateTarget");
  }

  //   updateStar(deltaTime) {
  //     // Augmenter le temps en fonction de deltaTime
  //     this.time += deltaTime;

  //     // Osciller la taille de l'étoile avec une fonction sinusoïdale
  //     this.scale = this.originScale + Math.sin(this.time) * this.amplitude;
  //   }

  //   scaleStar(deltaTime) {
  //     const distToTarget = this.targetScale - this.scale;
  //     const springForce = 150;
  //     const springDamping = 10;
  //     const force = distToTarget * springForce - this.vel * springDamping;
  //     this.vel += force * deltaTime;
  //     this.scale += this.vel * deltaTime;
  //   }
}
