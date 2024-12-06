import { createEngine } from "../../shared/engine.js";
import { createSpringSettings, Spring } from "../../shared/spring.js";

const { renderer, input, math, run, finish, audio } = createEngine();
const { ctx, canvas } = renderer;

const pointSound = await audio.load("./poitnSound.mp3");
const winSound = await audio.load("./win.mp3");

run(update);

const grid = [];

const cellSize = 100;
const gridRows = Math.floor(canvas.height / cellSize);
const gridCols = Math.floor(canvas.width / cellSize);

const maxNumber = 10;
let currentRemainingCount = maxNumber;

const targetCells = [
  {
    // Partie haute courte
    x: 10,
    y: 3,
    width: 5,
    height: 1,
  },
  {
    // partie haute courte
    x: 9,
    y: 4,
    width: 1,
    height: 6,
  },
  {
    x: 15,
    y: 4,
    width: 1,
    height: 6,
  },
  {
    x: 10,
    y: 10,
    width: 5,
    height: 1,
  },
  // {
  //   x: 10,
  //   y: 17,
  //   width: 10,
  //   height: 1,
  // },
  // {
  //   x: 10,
  //   y: 16,
  //   width: 12,
  //   height: 1,
  // },
];

let totalTargetCellCount = 0;

for (let x = 0; x < gridCols; x++) {
  for (let y = 0; y < gridRows; y++) {
    function condition(cell) {
      return (
        x >= cell.x &&
        x < cell.x + cell.width &&
        y >= cell.y &&
        y < cell.y + cell.height
      );
    }
    const isTargetCell = targetCells.find(condition) != undefined;
    if (isTargetCell) totalTargetCellCount++;

    grid.push({
      x: x * cellSize,
      y: y * cellSize,
      gridX: x,
      gridY: y,
      isTargetCell: isTargetCell,
    });
  }
}

let isPlaying = true;

function update(dt) {
  const mouseX = input.getX();
  const mouseY = input.getY();
  const mouseDown = input.isPressed();

  if (isPlaying) {
    for (const cell of grid) {
      const isOver =
        mouseX > cell.x &&
        mouseX < cell.x + cellSize &&
        mouseY > cell.y &&
        mouseY < cell.y + cellSize;
      cell.isOver = isOver;

      if (cell.isOver && mouseDown && !cell.isActive) {
        cell.isActive = true;

        if (!cell.isTargetCell) {
          pointSound.play();
          currentRemainingCount--;
          if (currentRemainingCount <= 0) {
            currentRemainingCount = maxNumber;
            grid.forEach((cell) => {
              cell.isActive = false;
            });
          }
        } else {
          let activeCellCount = 0;
          pointSound.play({
            rate: 1.3,
          });
          for (const cell of grid) {
            if (cell.isTargetCell && cell.isActive) {
              activeCellCount++;
            }
          }
          console.log(activeCellCount, totalTargetCellCount);

          if (activeCellCount === totalTargetCellCount) {
            handleFinish(); // Appel de la fonction handleFinish lorsque la condition est vraie
          }
        }
      }
    }

    for (const cell of grid) {
      if (cell.isOver) {
        ctx.fillStyle = "blue";
      } else if (cell.isActive) {
        if (cell.isTargetCell) {
          ctx.fillStyle = "green";
        } else {
          ctx.fillStyle = "grey";
        }
      } else {
        ctx.fillStyle = "black";
      }
      ctx.fillRect(cell.x, cell.y, cellSize, cellSize);
    }
  }
}

function handleFinish() {
  isPlaying = false;
  //document.body.removeChild(svgMouse);
  ctx.fillStyle = "black";
  winSound.play();

  ctx.fillRect(0, 0, canvas.width, canvas.height);
  console.log("finish");
  setTimeout(finish(), 3000);
  // Vérifier si l'animation est terminée
}
