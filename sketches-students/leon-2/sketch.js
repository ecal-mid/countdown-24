import { createEngine } from "../../shared/engine.js";
import { Spring } from "../../shared/spring.js";

const { renderer, input, math, run, finish, audio } = createEngine();
const { ctx, canvas } = renderer;

let soundplayed = false;

const pointSound = await audio.load("./poitnSound.mp3");
const winSound = await audio.load("./win.mp3");

run(update);

const width = (canvas.width = window.innerWidth);
const height = (canvas.height = window.innerHeight);

const spring = new Spring({
  position: 0,
  frequency: 2.5,
  halfLife: 0.05,
});

const Point = [];

// Variables pour contrôler les états
let isPointAActivated = false;
let isPointFActivated = false;

// Fonction pour générer un booléen aléatoire
function randomBoolean() {
  return Math.random() >= 0.5; // 50% chance de true ou false
}

function createPoint({ x, y, aligned, flip }) {
  return {
    x,
    y,
    aligned,
    flip,
    rotationSpring: new Spring({
      position: 0,
      frequency: 7.5,
      halfLife: 0.03,
      wrap: 360,
    }),
    scaleSpring: new Spring({
      position: 0,
      frequency: 2.5,
      halfLife: 0.03,
    }),
  };
}

const numBase = 300;

let w = 2 * width;
let h = 2 * height;

// Définir les points avec aligned aléatoire
let pointA = createPoint({ x: w * 0.26, y: h * 0.25, aligned: false }); // Point spécial, toujours désaligné au départ
let pointB = createPoint({ x: w * 0.75, y: h * 0.25, aligned: false });
let pointC = createPoint({
  x: w * 0.75,
  y: h * 0.5,
  aligned: false,
  flip: true,
});
let pointD = createPoint({
  x: w * 0.25,
  y: h * 0.5,
  aligned: false,
  flip: true,
});
let pointE = createPoint({ x: w * 0.25, y: h * 0.75, aligned: false });
let pointF = createPoint({ x: w * 0.75, y: h * 0.75, aligned: false });

// Ajouter le point spécial A au début et les autres points ensuite
Point.push(pointA, pointB, pointC, pointD, pointE, pointF);

let rotationAngle = 0; // Rotation de l'angle

function update(dt) {
  if (input.isPressed()) {
    spring.target = 0;
  } else {
    spring.target = 1;
  }

  spring.step(dt);

  for (const point of Point) {
    if (point.aligned) point.rotationSpring.target = 45;
    else point.rotationSpring.target = 135;
    point.rotationSpring.step(dt);

    const interactionDist = 40;
    const distToMouse = math.dist(input.getX(), input.getY(), point.x, point.y);
    const isClose = distToMouse < interactionDist;

    // Gérer le clic pour le point A (spécial)
    if (point === pointA && isClose && input.isDown() && !isPointAActivated) {
      isPointAActivated = true; // Activer le tracé
      pointSound.play({
        rate: 0.7 + Math.random() * 1,
        volume: 1,
        loop: false,
      });
    }

    // Gérer les autres points si A est activé
    if (isPointAActivated && isClose && input.isDown() && point !== pointA) {
      point.aligned = !point.aligned;
      pointSound.play({
        volume: 0.9,
        loop: false,
      });
    }
  }

  // let numLine = 10;

  /// DRAW

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();

  // Dessiner le tracer uniquement si le point A est activé
  let lastActivatedPointId = 0;
  if (isPointAActivated) {
    ctx.moveTo(pointA.x, pointA.y);
    ctx.lineTo(Point[1].x, Point[1].y);

    for (let i = 1; i < Point.length - 1; i++) {
      const point = Point[i];
      const currX = point.x;
      const currY = point.y;

      const nextPoint = Point[i + 1];
      const nextX = nextPoint.x;
      const nextY = nextPoint.y;
      let x, y;
      if (point.aligned) {
        x = nextX;
        y = nextY;
      } else {
        x = currX - (nextX - currX) * 100;
        y = currY - (nextY - currY) * 100;
      }

      ctx.lineTo(x, y);

      // Vérifier si le laser touche le point F
      if (nextPoint === pointF) {
        const laserDist = math.dist(x, y, pointF.x, pointF.y);
        if (laserDist < 50) {
          isPointFActivated = true;
        }
      }

      if (!point.aligned) break;

      lastActivatedPointId = i;
    }
    ctx.lineWidth = 10;
    ctx.strokeStyle = "yellow";
    ctx.stroke();
  }

  if (!isPointFActivated) {
    // Dessiner le point A en vert s'il n'est pas activé, rouge sinon
    ctx.fillStyle = isPointAActivated ? "white" : "Gray";
    ctx.beginPath();
    ctx.fillRect(pointA.x - 30, pointA.y - 30, 60, 60);
    ctx.fill();

    // Dessiner les autres points
    ctx.fillStyle = "white";
    for (let i = 0; i < Point.length; i++) {
      const point = Point[i];
      if (point === pointA) continue; // Ne pas redessiner le point A
      ctx.save();
      ctx.translate(point.x, point.y);

      if (point.flip) ctx.rotate(math.toRadian(90));
      ctx.rotate(math.toRadian(point.rotationSpring.position));

      const w = 60;
      const h = 20;
      ctx.fillStyle =
        isPointAActivated && i <= lastActivatedPointId + 1 ? "white" : "black";
      ctx.beginPath();
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.restore();

      // Dessiner le point F
      if (isPointAActivated) {
        ctx.fillStyle = "gray";
        ctx.beginPath();
        ctx.arc(pointF.x - 10, pointF.y - 10, 20, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  // Afficher "2" si le laser touche le point F
  if (isPointFActivated) {
    ctx.lineWidth = 100;
    ctx.strokeStyle = "white";
    ctx.stroke();
    if (!soundplayed) {
      console.log(winSound.isPlaying);
      soundplayed = true;
      winSound.play({ volume: 1.5 });
      setTimeout(finish, 1500);
    }
    setTimeout(() => {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      finish();
      // pointSound.play({
      //   rate: 1.5 + Math.random() * 1,
      //   volume: 1,
      //   loop: true,
      // });
    }, 2000);
    //ctx.fillStyle = "black";
    //ctx.fillRect(0, 0, canvas.width, canvas.height);
    //ctx.lineWidth = 10;
    //ctx.strokeStyle = "yellow";
    //ctx.stroke();
    // ctx.fillStyle = "white";
    // ctx.font = "900px Arial";
    // ctx.fillText("2", canvas.width / 2, canvas.height / 2); // Affiche "2" au centre
  }
}
