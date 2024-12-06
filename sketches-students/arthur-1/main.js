import sketch from "./sketch.js";
import {init} from "./audio.js"




window.addEventListener("message", async (event) => {
  if (event.data === "started") {
    console.log("strating 1");
    init();
    sketch();
  }
});
