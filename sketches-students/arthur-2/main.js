import p5 from "./p5.js";
import { drawBaseImage } from "./baseImage.js";
import { createEngine } from "../../shared/engine.js";
const { renderer, input, math, run, finish } = createEngine();
const { ctx, canvas } = renderer;
import {init} from "./audio.js";

// const mainDiv = window.parent.document;
// console.log(mainDiv)
// mainDiv.addEventListener('click', (e) => { console.log("sakjdbeajkfb") });



window.addEventListener("message", async (event) => {
  if (event.data === "started") {
    console.log("strating 2");
    drawBaseImage();
    init();

    document.addEventListener("canvasReady", () => {
      import("./sketch.js").then((module) => {
        const sketch = module.default;
        new p5((p) => {
          sketch(p);
        });
      });
    });
  }
});

export { canvas, finish, run };
