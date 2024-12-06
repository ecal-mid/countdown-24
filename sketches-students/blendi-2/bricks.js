export function createBricks(grid, blockSize, canvas) {
  let bricks = [];
  const totalWidth = grid[0].length * blockSize;
  const totalHeight = grid.length * blockSize;
  const offsetX = (canvas.width - totalWidth) / 2;
  const offsetY = (canvas.height - totalHeight) / 2;

  const colors = ["#FF5733", "#33FF57", "#3357FF", "#F0E68C", "#8A2BE2"]; //couleurs

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col] === 1) {
        let brick = {
          x: col * blockSize + offsetX,
          y: -blockSize - 4000 + row * 300,
          targetY: row * blockSize + offsetY,
          speed: Math.random() * 200 + 1200,
          color: colors[Math.floor(Math.random() * colors.length)], //aléatoire
        };
        bricks.push(brick);
      }
    }
  }
  return bricks;
}

export function drawBrick(brick, ctx, lightColor, shadowColor, blockSize) {
  const x = brick.x;
  const y = brick.y;

  ctx.fillStyle = brick.color;
  ctx.fillRect(x, y, blockSize, blockSize);
}
