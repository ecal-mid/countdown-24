import fs from "fs";
import { JSDOM } from "jsdom";

function loadSvg(filePath, callback) {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading SVG file:", err);
      return;
    }

    const dom = new JSDOM(data);
    const svgElement = dom.window.document.querySelector("svg");

    if (!svgElement) {
      console.error("No SVG element found in the file.");
      return;
    }

    callback(svgElement);
  });
}

export { loadSvg };
