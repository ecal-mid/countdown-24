import { createEngine } from "../../shared/engine.js";
import { createSpringSettings, Spring } from "../../shared/spring.js";

const { renderer, input, math, run, finish, resize } = createEngine();
const { ctx, canvas } = renderer;
run(update);

const imageSources = [
	"./imgs/01.png",
	"./imgs/02.png",
	"./imgs/03.png",
	"./imgs/04.png",
	"./imgs/05.png",
	"./imgs/06.png",
	"./imgs/07.png",
	"./imgs/08.png",
	"./imgs/09.png",
	"./imgs/10.png",
	"./imgs/11.png",
	"./imgs/12.png",
];

// Array to store image objects
const images = [];
const cols = 3; // Number of columns in the grid
const rows = 4; // Number of rows in the grid
const imageSize = 200; // Size of each image

// Array to store original positions
const originalPositions = [];

function preloadImages() {
	imageSources.forEach((src, index) => {
		const x = (index % cols) * imageSize; // Calculate x position
		const y = Math.floor(index / cols) * imageSize; // Calculate y position
		const img = new Image();
		img.src = src;
		images.push({ img, x, y }); // Store the image and its original position
		originalPositions.push({ x, y }); // Store original position
	});
}

// Call this function in your setup
preloadImages();

// Centering variables
const totalWidth = cols * imageSize; // Total width of the grid
const totalHeight = rows * imageSize; // Total height of the grid
let offsetX = canvas.width / 2 - totalWidth / 2; // Calculate the offset for centering
let offsetY = canvas.height / 2 - totalHeight / 2; // Calculate the offset for centering

let randomFactors = [];
for (let i = 0; i < images.length; i++) {
	randomFactors.push((Math.random() * 2 - 1) * 1000); // Generates a random number between -500 and 500
}

let scrollValueX = (Math.random() * 2 - 1) * 300;
let scrollValueY = (Math.random() * 2 - 1) * 300;

function update(dt) {
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	if (input.isPressed()) {
		scrollValueX = input.getX() - totalWidth / 2;
		scrollValueY = input.getY() - totalHeight / 2;

		ctx.fillStyle = "red";
		ctx.arc(0, 0, 10, 0, Math.PI * 2);
		ctx.fill();

		images.forEach(({ img }, index) => {
			const randomFactor = randomFactors[index];
			const otherRandomFactor = randomFactors[(index + 1) % images.length];

			const offsetVX = math.map(scrollValueX, 0, offsetX, randomFactor, 0);
			const offsetVY = math.map(scrollValueY, 0, offsetY, otherRandomFactor, 0);

			const mappedX = originalPositions[index].x + offsetVX + offsetX;
			const mappedY = originalPositions[index].y + offsetVY + offsetY;

			ctx.drawImage(img, mappedX, mappedY, imageSize, imageSize);
		});
	}
}

window.addEventListener("resize", () => {
	renderer.resize();
	console.log(canvas.width, canvas.height);
	offsetX = canvas.width / 2 - totalWidth / 2;
	offsetY = canvas.height / 2 - totalHeight / 2;
});
