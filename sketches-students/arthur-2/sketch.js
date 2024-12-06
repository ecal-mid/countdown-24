import { canvas, finish } from "./main.js";
import { subdivideImage } from "./cells.js";


let cells = subdivideImage(4);


export default function sketch(p) {
  let images = [];
  let loadedImages = 0;

  class cube {
    constructor(x, y, width, height, image) {
      this.x = x;
      this.y = y;
      this.z = Math.random() * 500 - 250;
      this.width = width;
      this.height = height;
      this.image;
      this.weight = 1 + Math.random();
      this.offset = {
        x: x + Math.random() * 10 - 5,
        z: Math.random() * 10 - 5,
      };
    }

    drop() {
      this.weight += this.weight * 0.05;
    }
  }

  p.preload = () => {
    cells.forEach((cell) => {
      const img = new Image();

      img.onload = () => {
        loadedImages++;
      };
      img.src = cell.image.toDataURL();
      let Pimage = p.loadImage(cell.image.toDataURL());
      images.push(Pimage);

      //images.push(img);
    });
  };

  const width = window.innerWidth;
  const height = window.innerHeight;

  let cam;

  p.setup = () => {
    //img = loadImage('./publi/Users/arthureffront/Documents/ECAL/Semaines Bloc/Semaine Bloc 3/Cells/Cells/src/baseImage.js /Users/arthureffront/Documents/ECAL/Semaines Bloc/Semaine Bloc 3/Cells/Cells/src/cells.js/laDefense.jpg');
    p.createCanvas(width, height, p.WEBGL).parent(canvas.parentElement);
    canvas.style.display = "none";
    p.background("black");
    //p. camera(0, 0, 3000);
    p.perspective(0.4, 1);

    cam = p.createCamera();

    // Place the camera at the top-center.
    cam.setPosition(
      Math.random() * 6000 - 3000,
      Math.random() * 6000 - 3000,
      Math.random() * 6000 - 3000
    );
    let ratio = width / height;
    cam.perspective(0.4, ratio);

    // Point the camera at the origin.
    cam.lookAt(0, 0, 0);
  };

  let cubes = [];
  const aim = { x: 0, y: 0, z: 2000 };

  for (let i = 0; i < cells.length; i++) {
    let cell = cells[i];
    let image = images[i];
    let c = new cube(
      (cell.col - 1.5) * 100,
      (cell.row - 1.5) * 100,
      100,
      100,
      image
    );
    cubes.push(c);
  }

  let camInPos = false;
  let visibleCubesIndex = 0;

  function upperCubeIndex() {
    if (visibleCubesIndex < cubes.length) {
      visibleCubesIndex++;
      
    }
    setTimeout(upperCubeIndex, 200);
  }

  upperCubeIndex();

  let isInverted = false;
  let cubesAreFalling = false;
  let allCubesAtZero = false;

  p.draw = () => {
    p.background("black");
    p.fill("black");
    
    if (!camInPos && visibleCubesIndex == cubes.length) {
      
      p.orbitControl();
    }

    cubes.forEach((cube, index) => {
      if (index < visibleCubesIndex) {
        if (images.length > 0 && images[index]) {
          let image = images[index];
          p.texture(image);
        }
        p.push();
        p.translate(cube.x, cube.y, cube.z); // Adjusting for WEBGL mode
        p.noStroke();
        p.box(cube.width, cube.height);
        p.pop();
      }
      if (cubesAreFalling) {
        window.dispatchEvent(new CustomEvent("cubesAreFalling"));
        cube.drop();
        cube.y += cube.weight;
        cube.z = cube.offset.z;
        cube.x = cube.offset.x;
      }
    });

    if (cubes.every((cube) => cube.y > 1000)) {
      finish();
    }

    camInPos = isCamInPosition(cam, aim);

    if (camInPos) {
      p.orbitControl(0, 0, 0);

      cam.centerX = 0;
      cam.centerY = 0;
      cam.centerZ = 2000;

      if (!allCubesAtZero) {
        cubes.forEach((cube) => {
          if (cube.z != 0) {
            if (Math.abs(cube.z) < 1) {
              cube.z = 0;
            } else {
              cube.z += -cube.z * 0.2;
            }
          }
        });
      }

      if (cubes.every((cube) => Math.abs(cube.z) == 0)) allCubesAtZero = true;
      if (allCubesAtZero) {
        if (!isInverted) {
          images.forEach((image) => {
            image.loadPixels();
            for (let i = 0; i < image.pixels.length; i += 4) {
              image.pixels[i] = 255 - image.pixels[i]; // Invert Red
              image.pixels[i + 1] = 255 - image.pixels[i + 1]; // Invert Green
              image.pixels[i + 2] = 255 - image.pixels[i + 2]; // Invert Blue
            }
            image.updatePixels();
          });
          isInverted = true;
        }

        if (isInverted && !cubesAreFalling) {
          setTimeout(() => {
            cubesAreFalling = true;
          }, 1000);

        }
      }
      cam.lookAt(0, 0, 0);
    }
  };
}

function isCamInPosition(cam, aim) {
  const distance = Math.sqrt(
    Math.pow(cam.eyeX - aim.x, 2) +
      Math.pow(cam.eyeY - aim.y, 2) +
      Math.pow(cam.eyeZ - aim.z, 2)
  );
  let output = false;

  if (distance < 500) {
    output = true;
  }
  return output;
}
