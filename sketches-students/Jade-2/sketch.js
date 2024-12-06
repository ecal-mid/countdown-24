import { createEngine } from "../../shared/engine.js";

const { renderer, input, math, run, finish } = createEngine();

document.addEventListener("DOMContentLoaded", () => {
  const images = [
    { id: "gugus1", src: "gugus1.png" },
    { id: "gugus2", src: "gugus2.png" },
    { id: "gugus3", src: "gugus3.png" },
    { id: "gugus4", src: "gugus4.png" },
    { id: "gugus5", src: "gugus5.png" },
    { id: "gugus6", src: "gugus6.png" },
    { id: "gugus7", src: "gugus7.png" },
    { id: "gugus8", src: "gugus8.png" },
    { id: "gugus9", src: "gugus9.png" },
    { id: "gugus10", src: "gugus10.png" },
  ];

  const container = document.querySelector(".image-container");
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  const imageElements = images.map((image) => {
    const img = document.createElement("img");
    img.id = image.id;
    img.src = image.src;
    img.alt = `Image ${image.id}`;
    img.classList.add("image");
    // img.style.position = "absolute";
    img.style.display = "none";
    img.style.transition = "opacity 2s";
    img.style.width = "300px";
    img.style.height = "300px";
    container.appendChild(img);
    return img;
  });

  let centerX;
  let centerY;

  let containerPositionX;
  let containerPositionY;

  let startPositionX;
  let startPositionY;

  function centerContainer() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Assuming the container is 300px by 300px
    containerPositionX = centerX - 300 / 2;
    containerPositionY = centerY - 300 / 2;

    // Correctly setting the container's position using template literals
    container.style.top = `${containerPositionY}px`;
    container.style.left = `${containerPositionX}px`;

    startPositionX = containerPositionX;
    startPositionY = containerPositionY;
  }

  let launched = false;
  let currentIndex = 0;
  let currentImage = imageElements[currentIndex];

  let position = {
    x: 0,
    y: 0,
  };

  let velocity = {
    dx: 0,
    dy: 0,
  };

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  let isGugus10Visible = false;

  currentImage.style.display = "block";
  currentImage.style.top = 0;
  currentImage.style.left = 0;

  currentImage.style.opacity = 0;
  setTimeout(() => {
    currentImage.style.opacity = 1;
  }, 100);

  container.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - container.getBoundingClientRect().left;
    offsetY = e.clientY - container.getBoundingClientRect().top;
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      position.x = e.clientX - offsetX;
      position.y = e.clientY - offsetY;
      container.style.left = position.x + "px";
      container.style.top = position.y + "px";
    }
  });

  document.addEventListener("mouseup", (e) => {
    if (isDragging) {
      isDragging = false;

      // Log initial and final positions
      console.log(startPositionX, startPositionY);
      console.log(position.x, position.y);

      // Calculate the direction of movement based on the relative position
      const deltaX = position.x - startPositionX;
      const deltaY = position.y - startPositionY;

      // Normalize the direction vector (so we get a unit vector for dx and dy)
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY); // Length of the vector
      const speed = 20; // Set your desired speed

      // Calculate velocity as a normalized direction vector multiplied by speed
      velocity.dx = (deltaX / distance) * speed;
      velocity.dy = (deltaY / distance) * speed;

      launched = true;
    }
  });

  function updatePosition() {
    if (launched) {
      position.x += velocity.dx;
      position.y += velocity.dy;

      let rectWidth = container.getBoundingClientRect().width;
      let rectHeight = container.getBoundingClientRect().height;

      if (position.x <= 0 || position.x + rectWidth >= screenWidth) {
        velocity.dx = -velocity.dx;
        playSound("boing.mp3");
        if (!isGugus10Visible) {
          switchToNextImage();
        }
      }

      if (position.y <= 0 || position.y + rectHeight >= screenHeight) {
        velocity.dy = -velocity.dy;
        playSound("boing.mp3");
        if (!isGugus10Visible) {
          switchToNextImage();
        }
      }

      container.style.left = position.x + "px";
      container.style.top = position.y + "px";
    }
  }

  function launchImage() {
    launched = true;

    // if (Math.abs(velocity.dx) < 0.1 && Math.abs(velocity.dy) < 0.1) {
    //   velocity.dx = 0;
    //   velocity.dy = 0;
    // }
  }

  function switchToNextImage() {
    if (isGugus10Visible) return;

    currentImage.style.display = "none";
    currentIndex = (currentIndex + 1) % images.length;
    currentImage = imageElements[currentIndex];

    if (currentImage.id === "gugus10") {
      isGugus10Visible = true;
      currentImage.style.display = "block";
      currentImage.style.opacity = 0;
      setTimeout(() => {
        currentImage.style.opacity = 1;
      }, 100);

      setTimeout(() => {
        currentImage.style.opacity = 0;

        setTimeout(() => {
          currentImage.style.display = "none";
          velocity.dx = 0;
          velocity.dy = 0;
          finish();
        }, 2000);
      }, 2000);
    }

    currentImage.style.display = "block";
    currentImage.style.opacity = 1;
    velocity = {
      dx: velocity.dx,
      dy: velocity.dy,
    };
  }

  function playSound(soundFile) {
    const audio = new Audio(soundFile);
    audio.play();
  }

  function animate() {
    updatePosition();
    requestAnimationFrame(animate);
  }
  centerContainer();
  animate();
});
