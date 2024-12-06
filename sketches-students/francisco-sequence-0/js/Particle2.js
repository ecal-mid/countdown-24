export default class Particle2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.originalX = x; // Store the initial position
    this.originalY = y;
    this.yeah = Math.round(Math.random() * 10);

    // Particle speed and acceleration
    this.vitesseX = 0;
    this.vitesseY = 0;
    this.accelerationX = (Math.random() - 0.2) * 0.005;
    this.accelerationY = (Math.random() - 0.2) * 0.005;

    // Speed limit
    this.vitesseMax = Math.random() * 5 + 1;

    // State properties
    this.color = "blue";
    this.scale = 1;
    this.targetScale = 4;
    this.isFollowingCursor = false;
    this.growthRate = 0.05;
    this.centerX = window.innerWidth / 2; // Center of the screen
    this.centerY = window.innerHeight / 2;
    this.isAnimating = false; // Flag for animation state
    this.animationStart = 0; // Start time for animation
    this.animationDuration = 1400; // Animation duration (3 seconds)
  }

  // Update the particle's position, speed, and state
  update(cursorX, cursorY) {
    if (this.isFollowingCursor) {
      let dx = cursorX - this.x;
      let dy = cursorY - this.y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 1) {
        let speed = Math.max(this.vitesseMax, distance / 10);
        this.vitesseX = (dx / distance) * speed;
        this.vitesseY = (dy / distance) * speed;
      } else {
        this.vitesseX = 0;
        this.vitesseY = 0;
      }
    }

    this.x += this.vitesseX;
    this.y += this.vitesseY;
    this.vitesseX += this.accelerationX;
    this.vitesseY += this.accelerationY;

    this.limiterVitesse();
    this.angle = Math.atan2(this.vitesseY, this.vitesseX);

    // Handle particle teleporting when it goes off-screen
    if (this.x > window.innerWidth) {
      this.x = 0;
    } else if (this.x < 0) {
      this.x = window.innerWidth;
    }

    if (this.y > window.innerHeight) {
      this.y = 0;
    } else if (this.y < 0) {
      this.y = window.innerHeight;
    }

    if (this.isAnimating) {
      let timeElapsed = Date.now() - this.animationStart;
      if (timeElapsed < this.animationDuration) {
        let progress = timeElapsed / this.animationDuration;
        this.scale = 1 + 2 * progress; // Grow to a scale of 3 over time
      } else {
        this.isAnimating = false;
        // Optionally reset the scale to a smaller value if needed
      }
    }
  }

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

  isClicked(mouseX, mouseY) {
    let dx = mouseX - this.x;
    let dy = mouseY - this.y;
    return Math.sqrt(dx * dx + dy * dy) < 50;
  }

  changeColor(color) {
    this.color = color;
  }

  startFollowing() {
    this.isFollowingCursor = true;
  }

  startAnimation() {
    this.isAnimating = true;
    this.animationStart = Date.now();
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    const gradient = ctx.createLinearGradient(-40, -40, 40, 40);
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(1, "black");

    ctx.font = `bold ${200 * this.scale}px Arial`;
    ctx.fillStyle = gradient;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("0", 0, 0);

    ctx.restore();
  }
}
