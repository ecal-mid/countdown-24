export default class Mover {
  constructor(ctx, x, y) {
    this.ctx = ctx;
    this.posX = x;
    this.posY = y;
    this.velX = 0;
    this.velY = 0;
    this.targetPosX = x;
    this.targetPosY = y;
    this.scale = 10;
    this.color = "white";

    this.targetScale = -10;

    this.isOnPlace = false;
    this.isReadyToBeDestroyed = false;
    this.isScalingDown = false;
    this.isScaledDown = false;
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.posX, this.posY, this.scale, 0, Math.PI * 2);
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
  }

  // Mouvement animé de l'hameçon
  move(deltaTime) {
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

  // Mouvement animé de l'hameçon
  scaleDown(deltaTime) {
    if (this.isScalingDown) {
      const distToTarget = this.targetScale - this.scale;
      const springForce = 120;
      const springDamping = 30;
      const force = distToTarget * springForce - this.velX * springDamping; // * this.easing.elasticInOut(this.timing);
      this.velX += force * deltaTime;
      this.scale += this.velX * deltaTime;
    }

    if (this.scale <= 0) {
      this.scale = 0;
      this.isScaledDown = true;
    }
  }

  checkMouseDistance(mouseX, mouseY, areaRadius, targetX, targetY) {
    this.distanceToMouse = this.calculateDistance(
      mouseX,
      mouseY,
      this.posX,
      this.posY
    );

    if (this.distanceToMouse <= areaRadius && !this.isReadyToBeDestroyed) {
      this.color = "white";
      this.targetPosX = targetX;
      this.targetPosY = targetY;
      this.isOnPlace = true;
    }

    if (this.distanceToMouse <= areaRadius && this.isReadyToBeDestroyed) {
      this.color = "white";
      this.isScalingDown = true;
    }
  }

  calculateDistance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
