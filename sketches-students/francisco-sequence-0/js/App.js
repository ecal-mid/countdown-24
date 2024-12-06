import BaseApp from "./BaseApp.js";
import Particle from "./Particle.js";
import Particle2 from "./Particle2.js";
import { createIframeClient } from "../../../shared/engine/iframeClient.js";
const iframeClient = createIframeClient();

//iframeClient.sendFinishSignal();

export default class App extends BaseApp {
  constructor() {
    super();
    this.end = false;
    this.end2 = false;
    this.collection = [];
    this.cursor = { x: 0, y: 0 };
    this.circleRadius = 1;
    this.circleCenter = false;
    this.animationSpeed = 0.05; // Controls how fast the cursor moves to the center
    this.targetX = window.innerWidth / 2; // Center of the screen
    this.targetY = window.innerHeight / 2; // Center of the screen
    this.maxRadius = window.innerHeight / 3; // Maximum radius for the circle
    this.radiusAnimation = false; // To control when the circle is animating
    iframeClient.fi;
    // Create particles
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        const particle = new Particle(i * 200, 200);
        this.collection.push(particle);
      }
    }

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        const particle = new Particle(i * 200, 800);
        this.collection.push(particle);
      }
    }

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        const particle = new Particle(i * 200, 500);
        this.collection.push(particle);
      }
    }
    const particle2 = new Particle2(400, 400);
    this.collection.push(particle2);

    // Event listener for mouse movement
    window.addEventListener("mousemove", (event) => {
      if (!this.circleCenter) {
        this.cursor.x = event.clientX;
        this.cursor.y = event.clientY;
      }
    });

    // Event listener for mouse click
    window.addEventListener("click", (event) => {
      if (this.circleRadius <= 1 && !this.isAnimating) {
        // Start the animation only if not already animating and if the current radius is at or below 1
        this.isAnimating = true; // Set the flag to indicate that an animation is in progress
        this.targetRadius = 200; // Set the target radius value
        this.animationStep = 2; // The increment step for each frame of the animation

        // Function to animate the radius gradually
        const animateRadius = () => {
          if (this.circleRadius < this.targetRadius) {
            this.circleRadius += this.animationStep;
            if (this.circleRadius > this.targetRadius) {
              this.circleRadius = this.targetRadius; // Ensure we don't overshoot the target
            }
            requestAnimationFrame(animateRadius); // Continue animating
          } else {
            this.isAnimating = false; // Animation complete
          }
        };

        // Start the animation
        requestAnimationFrame(animateRadius);
      }
      if (this.end == true) {
        this.end2 = true;
      }
      this.collection.forEach((particle) => {
        if (particle instanceof Particle2) {
          if (particle.isClicked(event.clientX, event.clientY)) {
            particle.changeColor("red");
            particle.startFollowing();
            particle.startAnimation(); // Start animation for scaling
            this.circleCenter = true; // Lock cursor to the center
            this.radiusAnimation = true; // Start animating the circle
          }
        }
      });
    });

    this.draw();
  }

  draw() {
    // Smoothly move the cursor to the center if the circleCenter flag is true
    if (this.circleCenter) {
      const dx = this.targetX - this.cursor.x;
      const dy = this.targetY - this.cursor.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Move the cursor gradually towards the center
      if (distance > 1) {
        this.cursor.x += dx * this.animationSpeed;
        this.cursor.y += dy * this.animationSpeed;
      } else {
        // Ensure the cursor stays locked at the center
        this.cursor.x = this.targetX;
        this.cursor.y = this.targetY;
      }
    }

    // Animate the circle radius
    if (this.radiusAnimation) {
      if (this.circleRadius < this.maxRadius && this.end == false) {
        console.log("ok");
        this.circleRadius += 2; // Increase size until the max radius is reached
      } else if (this.circleRadius >= this.maxRadius && this.circleRadius > 0) {
        console.log("edntrue");
        this.end = true;
      } else {
        console.log("huh");
      }
      if (this.end == true && this.end2 == true) {
        if (this.circleRadius > 11) {
          this.circleRadius -= 10;
        }
        if (this.circleRadius < 11) {
          this.circleRadius = 0;
          iframeClient.sendFinishSignal();
        }
      }
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Save the current canvas state
    this.ctx.save();

    // Clip to the circle
    this.ctx.beginPath();
    this.ctx.arc(
      this.cursor.x,
      this.cursor.y,
      this.circleRadius,
      0,
      Math.PI * 2
    );
    this.ctx.clip();

    // Update and draw particles
    this.collection.forEach((particle) => {
      particle.update(this.cursor.x, this.cursor.y);
      particle.limiterVitesse();
      particle.draw(this.ctx, this.cursor.x, this.cursor.y);
    });

    this.ctx.restore();

    // Draw the circle at the cursor
    this.ctx.beginPath();
    this.ctx.arc(
      this.cursor.x,
      this.cursor.y,
      this.circleRadius,
      0,
      Math.PI * 2
    );
    this.ctx.strokeStyle = "rgba(255, 255, 255, 1)";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    requestAnimationFrame(() => this.draw());
  }
}
