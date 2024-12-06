export default class Particle {
  constructor(x, y) {
    this.x = Math.random() * innerWidth;
    this.y = Math.random() * innerHeight;
    this.yeah = Math.round(Math.random() * 10);

    // Particle velocity
    this.vitesseX = 0;
    this.vitesseY = 0;

    // Particle acceleration
    this.accelerationX = (Math.random() - 0.2) * 0.005;
    this.accelerationY = (Math.random() - 0.2) * 0.005;

    // Speed limit
    this.vitesseMax = Math.random() * 5 + 1;
  }

  // Update the particle's position and velocity
  update() {
    this.vitesseX += this.accelerationX;
    this.vitesseY += this.accelerationY;

    this.x += this.vitesseX;
    this.y += this.vitesseY;

    this.angle = Math.atan2(this.vitesseY, this.vitesseX);

    // Handle edge wrapping
    this.gererBordsEcran();
  }

  // Limit the particle's speed
  limiterVitesse() {
    this.vitesseX = Math.min(
      Math.max(this.vitesseX, -this.vitesseMax),
      this.vitesseMax
    );
    this.vitesseY = Math.min(
      Math.max(this.vitesseY, -this.vitesseMax),
      this.vitesseMax
    );
  }

  // Handle the particle going off-screen and teleporting to the other side
  gererBordsEcran() {
    if (this.x > window.innerWidth) {
      this.x = 0; // Wrap around to the left side
    } else if (this.x < 0) {
      this.x = window.innerWidth; // Wrap around to the right side
    }

    if (this.y > window.innerHeight) {
      this.y = 0; // Wrap around to the top side
    } else if (this.y < 0) {
      this.y = window.innerHeight; // Wrap around to the bottom side
    }
  }

  // Draw the particle, making the white part of the gradient face the mouse
  draw(ctx, mouseX, mouseY) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Calculate the angle between the particle and the mouse position
    const angleToMouse = Math.atan2(mouseY - this.y, mouseX - this.x);

    // Create a linear gradient with the direction facing the mouse
    const gradient = ctx.createLinearGradient(
      40 * Math.cos(angleToMouse), // Start point adjusted to angle
      40 * Math.sin(angleToMouse), // Start point adjusted to angle
      -40 * Math.cos(angleToMouse), // End point adjusted to angle
      -40 * Math.sin(angleToMouse) // End point adjusted to angle
    );

    gradient.addColorStop(0, "white"); // White color at the start of the gradient
    gradient.addColorStop(1, "black"); // Black color at the end of the gradient

    ctx.font = "bold 200px Arial"; // Use bold font
    ctx.fillStyle = gradient; // Use the gradient as the fill style
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.yeah, 0, 0);
    ctx.restore();
  }
}
