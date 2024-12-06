import Easing from "./Easing.js";

export default class Hamecon {
  constructor(ctx) {
    this.ctx = ctx;
    this.height = window.innerHeight;
    this.width = window.innerWidth;

    this.posX = 300;
    this.posY = 200;
    this.velX = 0;
    this.velY = 0;
    this.originPosX = 300;
    this.originPosY = 200;
    this.targetPosX = 300;
    this.targetPosY = 300;

    this.scaleX = 120;
    this.scaleY = 2400;

    this.isDragging = false;
    this.isCatched = false;
    this.distanceToTarget = 0;

    this.imageSources = {
      hook: "./imgs/hook.png",
      fil: "./imgs/string.png",
      pince1: "./imgs/pince.png",
      pince2: "./imgs/pince2.png",
    };

    this.images = {}; // Stockera les images chargées
    this.easing = new Easing(); // Instance de la classe Easing

    this.timing = 0; // Initialisation du timing pour les animations
    this.speed = 0.002;

    this.isHook2There = false;
    this.hookIsOnTop = false;
    this.hasBeenHooked = false;
    this.isFinised = false;

    this.setup();
  }

  async setup() {
    try {
      await this.loadAllImages(this.imageSources);
      console.log("All images loaded!");
    } catch (err) {
      console.error("Error loading images:", err);
    }
  }

  // Fonction utilitaire pour charger une seule image
  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  }

  // Fonction pour charger toutes les images
  async loadAllImages(sources) {
    const promises = Object.keys(sources).map(async (key) => {
      this.images[key] = await this.loadImage(sources[key]);
    });

    await Promise.all(promises);
  }

  // Suit la position de la souris
  followMouse(x, y) {
    this.posX = x - 200;
    this.posY = y - 130;
  }

  // Relâche l'hameçon
  mouseUp(mouseX) {
    this.isDragging = false;
    if (!this.isCatched) {
      this.targetPosY = this.originPosY;
    } else {
      if (!this.isHook2There) {
        this.targetPosY = this.originPosY - 400;
      } else {
        this.targetPosY = this.originPosY;
      }

      setTimeout(() => {
        this.spawnHook2();
      }, 1000);
    }

    if (this.hasBeenHooked) {
      this.targetPosY = this.originPosY - 700;
      setTimeout(() => {
        this.isFinised = true;
      }, 1000);
    }

    this.targetPosX = mouseX - 120;

    this.timing = 0;
  }

  // Dessine l'hameçon et le fil
  draw(mouseX) {
    if (this.images.hook) {
      this.ctx.save();
      this.ctx.translate(this.scaleX + 30, -this.scaleY + 260);

      if (!this.isCatched && !this.isHook2There) {
        this.ctx.drawImage(
          this.images.hook,
          this.posX,
          this.posY,
          this.scaleX,
          this.scaleY
        );
      }
      if (this.isCatched && !this.isHook2There) {
        this.ctx.drawImage(
          this.images.fil,
          this.posX,
          this.posY,
          this.scaleX,
          this.scaleY
        );
      }

      if (this.isHook2There && !this.hookIsOnTop) {
        this.ctx.drawImage(
          this.images.pince1,
          this.posX,
          this.posY,
          this.scaleX,
          this.scaleY
        );
      }

      if (this.isHook2There && this.hookIsOnTop) {
        this.ctx.drawImage(
          this.images.pince2,
          this.posX,
          this.posY,
          this.scaleX,
          this.scaleY
        );
      }

      this.ctx.restore();
    }
  }

  // Mouvement animé de l'hameçon
  move(deltaTime) {
    if (!this.isDragging) {
      const distToTargetX = this.targetPosX - this.posX;
      const distToTargetY = this.targetPosY - this.posY;
      const springForce = 150;
      const springDamping = 10;
      const forceX = distToTargetX * springForce - this.velX * springDamping; // * this.easing.elasticInOut(this.timing);
      const forceY = distToTargetY * springForce - this.velY * springDamping; //* this.easing.elasticInOut(this.timing);
      this.velX += forceX * deltaTime;
      this.velY += forceY * deltaTime;
      this.posX += this.velX * deltaTime;
      this.posY += this.velY * deltaTime;
    }
  }

  // Calcul de la distance entre deux points
  calculateDistance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Supprime l'hameçon (par exemple, lorsqu'il attrape quelque chose)
  removeHamecon() {
    this.isCatched = true;
  }

  spawnHook2() {
    if (!this.hasBeenHooked) {
      this.isHook2There = true;
      this.targetPosX = 300;
      this.targetPosY = 300;
    }
  }

  edjectHook() {
    this.targetPosY = -500;
    console.log("hook is edjected");
  }
}
