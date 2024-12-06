import "./pathseg.js";

import { createEngine } from "../../shared/engine.js";
import "./decomp.js";



const { renderer, input, math, run, finish } = createEngine();
const { ctx, canvas } = renderer;

const background = document.createElement("div");
document.body.appendChild(background);
background.style.width = "100vw";
background.style.height = "100vh";
background.style.position = "fixed";
background.style.top = 0;
background.style.left = 0;
background.style.backgroundColor = "black";
background.style.zIndex = -1;


// Include Matter.js library from CDN

export default function sketch() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  const Matter = window.Matter;

  var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Common = Matter.Common,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    Composite = Matter.Composite,
    Vertices = Matter.Vertices,
    Svg = Matter.Svg,
    Bodies = Matter.Bodies;

  // provide concave decomposition support library
  Common.setDecomp(decomp);


  // create engine
  var engine = Engine.create(),
    world = engine.world;

  // create renderer
  var render = Render.create({
    canvas: canvas,
    engine: engine,
    options: {
      width: canvas.width,
      height: canvas.height,
      wireframes: false,
      background: "transparent",
    },
  });

  world.bounds = {
    min: { x: 0, y: 0 },
    max: { x: width, y: height },
  };

  Render.run(render);

  // create runner
  var runner = Runner.create();
  Runner.run(runner, engine);

  let finalvertices;
  let bigOneVertices;

  // add bodies
  if (typeof fetch !== "undefined") {
    var select = function (root, selector) {
      return Array.prototype.slice.call(root.querySelectorAll(selector));
    };

    var loadSvg = function (url) {
      return fetch(url)
        .then(function (response) {
          return response.text();
        })
        .then(function (raw) {
          return new window.DOMParser().parseFromString(raw, "image/svg+xml");
        });
    };

    loadSvg("./one.svg").then(function (root) {
      var scaleFactor = 0.8;
      var vertexSets = select(root, "path").map(function (path) {
        var vertices = Svg.pathToVertices(path, 100);
        return vertices.map(function (vertex) {
          return { x: vertex.x*scaleFactor , y: vertex.y *scaleFactor };
        });
      });
      finalvertices = vertexSets;
    });
  } else {
    Common.warn("Fetch is not available. Could not load SVG.");
  }
  if (typeof fetch !== "undefined") {
    var select = function (root, selector) {
      return Array.prototype.slice.call(root.querySelectorAll(selector));
    };

    var loadSvg = function (url) {
      return fetch(url)
        .then(function (response) {
          return response.text();
        })
        .then(function (raw) {
          return new window.DOMParser().parseFromString(raw, "image/svg+xml");
        });
    };

    loadSvg("./one.svg").then(function (root) {
      var scaleFactor = 4;
      var vertexSets = select(root, "path").map(function (path) {
        var vertices = Svg.pathToVertices(path, 100);
        return vertices.map(function (vertex) {
          return { x: vertex.x*scaleFactor , y: vertex.y *scaleFactor };
        });
      });
      bigOneVertices = vertexSets;
    });
  } else {
    Common.warn("Fetch is not available. Could not load SVG.");
  }

  let numOnes = 0;
  let restart = false;

  function addSVGShape() {
    Composite.add(
      world,
      Bodies.fromVertices(
        (Math.random() * width)*0.8 + width*0.1,
        -400,
        finalvertices,
        {
          render: {
            fillStyle: "white",
            strokeStyle: "white",
            lineWidth: 1,
            
          },
        },
        true
      )
    );

    numOnes++;
    if (numOnes > width*0.8) {
      //document.dispatchEvent(new CustomEvent("show"));
      Composite.remove(world, Composite.allBodies(world)[0]);

      setTimeout(() => {
      Composite.add(
        world,
        Bodies.fromVertices(
          (width/2),
          -(height/2),
          bigOneVertices,
          {
            render: {
              fillStyle: "white",
              strokeStyle: "white",
              lineWidth: 1,
              
            },
          },
          true
        )
      );
        Matter.Events.on(engine, "afterUpdate", function () {
          const bodies = Composite.allBodies(world);
          if (bodies.length > 0 && bodies[bodies.length - 1].position.y >= height / 2 && !restart) {
            const mainBody = bodies[bodies.length - 1];
            Matter.Body.setStatic(mainBody, true);
            window.dispatchEvent(new CustomEvent("kick"));
          }
        });
      
      setTimeout(()=>{
        restart = true;
        const bodies = Composite.allBodies(world);
        const mainBody = bodies[bodies.length - 1];
        Matter.Body.setStatic(mainBody, false);
        mainBody.friction = -0.01;

        Composite.add(world, [
          Bodies.rectangle(width / 2, height + 5, width * 2, 10, { isStatic: true }),]);
        Matter.Events.on(engine, "afterUpdate", function () {
          
            if (mainBody.position.y > height || mainBody.position.x < 0 || mainBody.position.x > width || mainBody.position.y < 0) {
              finish();
            }
          
        });
      },3000)
    }, 1000);
      return;
      
    }
    setTimeout(() => {
      addSVGShape();
    }, 1);
  }

  Composite.add(world, [
    Bodies.rectangle(width / 2, height + 5, width * 2, 10, { isStatic: true }),
    Bodies.rectangle(-10, height / 2, 10, height, {
      isStatic: true,
    }),
    Bodies.rectangle(width + 10, height / 2, 10, height, { isStatic: true }),
  ]);

  // add mouse control
  var mouse = Mouse.create(render.canvas),
    mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.1,
        render: {
          visible: false,
        },
      },
    });

  Composite.add(world, mouseConstraint);

  // keep the mouse in sync with rendering
  render.mouse = mouse;

  // fit the render viewport to the scene
  Render.lookAt(render, {
    min: { x: 0, y: 0 },
    max: { x: width, y: height },
  });

  

  function addShapes(e){
    console.log(Tone.context.state);
    if(Tone.context.state !== 'running'){
      
      Tone.start(0);
      console.log("started");
    }
    addSVGShape(
      e.clientX ,
      e.clientY 
    );
    document.removeEventListener("click", addShapes);
  }

  document.addEventListener("click", addShapes);

    

  let isShown = false;


document.addEventListener("show", () => {
  if(isShown) return
  const bg = new Image();
  

      bg.src = "./one.svg";
      bg.onload = () => {
        console.log("loaded");
        render.options.background = "transparent";
        canvas.style.background = "black";
        canvas.style.backgroundImage = `url(${bg.src})`;
        canvas.style.backgroundRepeat = "no-repeat";
        canvas.style.backgroundSize = "100vw 100vh";
        canvas.style.backgroundOrigin = "border-box";
        canvas.style.backgroundPosition = "center center";
        
      };
      isShown = true;
    });

    // stop animation when the last body's y position is at height/2

    
   

  // context for MatterTools.Demo
  return {
    engine: engine,
    runner: runner,
    render: render,
    canvas: render.canvas,
    stop: function () {
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
    },
  };
}

