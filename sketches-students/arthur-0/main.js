import {sketch} from "./sketch.js";
import {init} from "./audio.js"



window.addEventListener("modelLoaded", async (detail) => {
  init();
  sketch();
    
  
});






window.addEventListener("message", async (event) => {
  if (event.data === "started") {
    window.addEventListener("modelLoaded", async (detail) => {
      init();
      sketch();
    });
  }
});
