import Utils from "./Utils.js";
import * as math from "../../shared/engine/math.js";

export default class Particle {
  /**
   * Crée une nouvelle particule avec une position initiale et une position cible.
   * @param {number} x - Position x initiale.
   * @param {number} y - Position y initiale.
   * @param {number} targetX - Position x cible.
   * @param {number} targetY - Position y cible.
   */
  constructor(x, y, targetX, targetY) {
    this.pos = { x, y }; // Position actuelle
    this.target = { x: targetX, y: targetY }; // Cible
    this.endTarget = { x: targetX, y: targetY }; // Cible
    this.velocity = { x: 0, y: 0 }; // Vitesse initiale
    this.acceleration = { x: 0, y: 0 }; // Accélération initiale

    this.radius = 3; // Rayon de la particule
    this.maxSpeed = 5; // Vitesse maximale
    this.maxForce = 0.1; // Force maximale d'accélération
    this.slowDownDistance = 10; // Distance de ralentissement avant d'atteindre la cible

    this.isAtTarget = false; // Si la particule est arrivée à la cible
    this.isDead = false; // Si la particule est morte
    this.targetTimer = 0; // Compteur pour la durée de présence sur la cible
    this.fadeOutDuration = 1; // Durée de fondu avant suppression

    this.minLifetime = 0;
    this.maxLifetime = 20;
    this.lifetime = 0;
    this.fadeTime = 0;

    this.lifetime =
      Math.floor(Math.random() * (this.maxLifetime - this.minLifetime)) +
      this.minLifetime;
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  setTarget(x, y) {
    this.target = { x, y };
  }

  /**
   * @returns {Object}
   */
  seek() {
    const desired = {
      x: this.target.x - this.pos.x,
      y: this.target.y - this.pos.y,
    };

    const distanceToTarget = Utils.getSpeed(desired);

    if (distanceToTarget === 0) return { x: 0, y: 0 };

    let desiredSpeed = this.maxSpeed;
    if (distanceToTarget < this.slowDownDistance) {
      desiredSpeed = this.maxSpeed * (distanceToTarget / this.slowDownDistance);
    }

    const movement = Utils.getDirection(desired, desiredSpeed);
    const steer = {
      distanceToTarget: distanceToTarget,
      x: movement.x - this.velocity.x,
      y: movement.y - this.velocity.y,
    };

    return Utils.getDirection(steer, this.maxForce);
  }

  update(deltaTime) {
    this.fadeTime += deltaTime;
    this.lifetime -= deltaTime;

    if (this.isAtTarget) {
      this.targetTimer += deltaTime;
      if (this.targetTimer >= this.fadeOutDuration) {
        this.isDead = true;
        return;
      }
    } else if (this.lifetime <= 0) {
      this.isDead = true;
      return;
    }

    // Applique la force de direction pour se rapprocher de la cible
    const steering = this.seek();
    const currentSpeed = Utils.getSpeed(this.velocity);

    const wasAtTarget = this.isAtTarget;
    this.isAtTarget = steering.distanceToTarget < 0.5 && currentSpeed < 0.5;

    if (!wasAtTarget && this.isAtTarget) {
      this.targetTimer = 0;
    }

    this.acceleration.x += steering.x;
    this.acceleration.y += steering.y;

    // Mise à jour de la vitesse
    this.velocity.x += this.acceleration.x;
    this.velocity.y += this.acceleration.y;

    // Limitation de la vitesse maximale
    const speed = Utils.getSpeed(this.velocity);
    if (speed > this.maxSpeed) {
      const movement = Utils.getDirection(this.velocity, this.maxSpeed);
      this.velocity.x = movement.x;
      this.velocity.y = movement.y;
    }

    // Mise à jour de la position
    this.pos.x += this.velocity.x;
    this.pos.y += this.velocity.y;

    // Réinitialisation de l'accélération
    this.acceleration.x = 0;
    this.acceleration.y = 0;
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    /* ctx.strokeStyle = "red";
    ctx.moveTo(this.pos.x, this.pos.y);
    ctx.lineTo(this.target.x, this.target.y);
    ctx.stroke();
   */

    ctx.save();
    ctx.shadowColor = "rgba(0, 255, 255, 1)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = -3;
    ctx.shadowOffsetY = -3;

    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
    const alpha = math.mapClamped(this.fadeTime, 0, 1, 0, 1);
    ctx.fillStyle = "rgba(255,255,255," + alpha + ")";
    ctx.fill();

    ctx.restore();
  }
}
