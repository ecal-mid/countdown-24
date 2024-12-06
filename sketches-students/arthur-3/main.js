import { createEngine } from "../../shared/engine.js";
import { loadSVGAndExtractPoints } from "./svg.js";
import {init} from "./audio.js"

document.body.style.background = "black";

const { renderer, input, math, run, finish } = createEngine();
const { ctx, canvas } = renderer;

window.addEventListener("message", async (event) => {
  if (event.data === "started") {
    console.log("strating 3");
    init();
    

    const width = (canvas.width = window.innerWidth );
    const height = (canvas.height = window.innerHeight );

    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    canvas.style.display = "block";
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";

    class svgShape {
      constructor(path, x, y) {
        this.size = 2;
        this.path = path;
        this.points = [];
        this.insidePoints = [];
        this.x = 0;
        this.y = 0;
        this.extractPoints();
        this.minY;
        this.maxY;
      }
      extractPoints() {
        loadSVGAndExtractPoints(this.path).then((points) => {
          this.points = points;
          this.offset();

          this.createPath();
          this.insidePoints = this.createInsidePoints(width*2 );
          let insidePoints = [];

          this.insidePoints.forEach((point) => {
            point.x *= this.size;
            point.y *= this.size;
            insidePoints.push(point);
          });
          this.insidePoints = [];

          points.forEach((point) => {
            var x = Math.round(point[0]) * this.size;
            var y = Math.round(point[1]) * this.size;

            insidePoints.push({ x: x, y: y });
          });

          let minX = Math.min(...insidePoints.map((point) => point.x));
          let minY = Math.min(...insidePoints.map((point) => point.y));
          let maxX = Math.max(...insidePoints.map((point) => point.x));
          let maxY = Math.max(...insidePoints.map((point) => point.y));

          let svgWidth = maxX - minX;
          let svgHeight = maxY - minY;

          let ratio = Math.min(
            canvas.width / svgWidth,
            canvas.height / svgHeight
          );

          insidePoints.forEach((point) => {
            point.x *= ratio * 0.8;
            point.y *= ratio * 0.8;
          });

          minX = Math.min(...insidePoints.map((point) => point.x));
          minY = Math.min(...insidePoints.map((point) => point.y));
          maxX = Math.max(...insidePoints.map((point) => point.x));
          maxY = Math.max(...insidePoints.map((point) => point.y));

          svgWidth = maxX - minX;
          svgHeight = maxY - minY;

          insidePoints.forEach((point) => {
            point.x = point.x - minX + (width / 2 - svgWidth / 2);
            point.y = point.y - minY + (height / 2 - svgHeight / 2);
          });

          minX = Math.min(...insidePoints.map((point) => point.x));
          minY = Math.min(...insidePoints.map((point) => point.y));
          maxX = Math.max(...insidePoints.map((point) => point.x));
          maxY = Math.max(...insidePoints.map((point) => point.y));

          this.minY = minY;
          this.maxY = maxY;

          this.insidePoints = [];

          this.insidePoints = insidePoints;
        });
      }

      offset() {
        this.points.forEach((point) => {
          point[0] += this.x;
          point[1] += this.y;
        });
      }

      createPath() {
        ctx.beginPath();
        ctx.moveTo(this.points[0][0], this.points[0][1]);
        for (let i = 1; i < this.points.length; i++) {
          ctx.lineTo(this.points[i][0], this.points[i][1]);
        }
        ctx.closePath();
        ctx.stroke();
      }

      createInsidePoints(num) {
        let points = [];

        for (let i = 0; i < num; i++) {
          let x = Math.random() * canvas.width;
          let y = Math.random() * canvas.height;

          if (ctx.isPointInPath(x, y)) {
            points.push({
              x: x,
              y: y,
            });
          }
        }

        return points;
      }

      setNewDestination() {
        let destination_point =
          this.insidePoints[
            Math.floor(Math.random() * this.insidePoints.length)
          ];
        this.d_pos = new Vector(destination_point.x, destination_point.y);
      }
    }

    class Particle {
      constructor(x, y) {
        this.originalPos = { x: x, y: y };
        this.pos = { x: x, y: y };
        this.vel = { x: 0, y: 0 };
        this.acc = { x: 0, y: 0 };
        this.maxSpeed = 5;
        this.maxForce = 0.1;
        if (Math.random() > 0.8) {
          this.size = Math.random() * 10;
        } else if (Math.random() > 0.5) {
          this.size = Math.random() * 5;
        } else {
          this.size = Math.random() * 2;
        }
        this.weight = this.size;
        this.alpha = 1;
        this.alphaStep = 0;

        this.xSpeed = Math.random() * 2 - 1;
        this.ySpeed = Math.random() * 2 - 1;

        this.isVisible = false;
      }
      update() {

        
        this.vel.x *= 0.99;
        this.vel.y *= 0.99;
        this.vel.x += this.acc.x;
        this.vel.y += this.acc.y;
        // this.vel.x +=
        //   Math.sin(Date.now() * 0.01 * this.xSpeed) * 0.001 * this.size;
        // this.vel.y +=
        //   Math.cos(Date.now() * 0.01 * this.ySpeed) * 0.001 * this.size;
        
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
        this.acc.x *= 0.;
        this.acc.y *= 0.;

        this.alpha += this.alphaStep;
      }
      draw(size) {
        let s = size || this.size;
        ctx.fillStyle = `rgba(255,255,255,${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }
    }

    let particles = [];

    const svgPath = new svgShape("three.svg", particles);

    function buildParticles(points) {
      for (let i = 0; i < points.length; i++) {
        particles.push(new Particle(points[i].x, points[i].y));
      }
    }

    let isMouseDown = false;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let visibleParticles = [];

    function joinParticles() {
      for (let a = 0; a < visibleParticles.length; a++) {
        let connections = 0;
        for (
          let b = a + 1;
          b < visibleParticles.length && connections < 10;
          b++
        ) {
          let dx = visibleParticles[a].pos.x - visibleParticles[b].pos.x;
          let dy = visibleParticles[a].pos.y - visibleParticles[b].pos.y;
          let dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < width / 20) {
            ctx.strokeStyle = `white`;
            ctx.fillStyle = `rgba(255,255,255,${Math.pow(1 - dist / 10, 2)})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(visibleParticles[a].pos.x, visibleParticles[a].pos.y);
            ctx.lineTo(visibleParticles[b].pos.x, visibleParticles[b].pos.y);

            // Find the closest third point to form a triangle
            let closestPoint = null;
            let minDist = Infinity;
            for (let c = 0; c < visibleParticles.length; c++) {
              if (c !== a && c !== b) {
                let dx2 = visibleParticles[b].pos.x - visibleParticles[c].pos.x;
                let dy2 = visibleParticles[b].pos.y - visibleParticles[c].pos.y;
                let dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
                if (dist2 < minDist) {
                  minDist = dist2;
                  closestPoint = visibleParticles[c];
                }
              }
            }

            if (closestPoint) {
              ctx.lineTo(closestPoint.pos.x, closestPoint.pos.y);
            }

            ctx.closePath();
            ctx.fill(); // Fill the triangle with red color
            ctx.stroke();

            connections++;
          }
        }
      }
    }

    let mouse = { x: 0, y: 0 };

    function updateMousePosition(e) {
      mouse.x = e.clientX ;
      mouse.y = e.clientY ;
    }

    let audioIsAvailable = true;
    let dragBack = true;

    function update() {
      if (particles.length == 0 && svgPath.insidePoints.length > 0) {
        buildParticles(svgPath.insidePoints);
      }

      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (particles.length > 0) {
        visibleParticles = [];
        particles.forEach((particle) => {
          let dx = particle.pos.x - mouse.x;
          let dy = particle.pos.y - mouse.y;
          let distance = Math.sqrt(dx * dx + dy * dy);

          particle.update();
          if (distance < 100) {
            particle.isVisible = true;
            
          
          }
          if (particle.isVisible) {
            visibleParticles.push(particle);
          }
        });
        visibleParticles.forEach((particle) => {
          let pullBackX = particle.pos.x - particle.originalPos.x;
          let pullBackY = particle.pos.y - particle.originalPos.y;

          let dist = Math.sqrt((mouse.x - particle.pos.x) ** 2 + (mouse.y - particle.pos.y) ** 2);

          if(dist < 200){
          particle.acc.x += (mouse.x - particle.pos.x) * 0.001 - particle.vel.x * 0.0001;
          particle.acc.y += (mouse.y - particle.pos.y) * 0.001 - particle.vel.y * 0.0001;
          }
          if(dragBack){
          particle.acc.x += pullBackX * -0.01 - particle.vel.x * 0.001;
          particle.acc.y += pullBackY * -0.01 - particle.vel.y * 0.001;
          particle.draw();
          }
          
        });
      }

      if (particles.length > 0) {
        if (visibleParticles.length >= particles.length * 0.94) {
          dragBack = false;
          setTimeout(() => {
            particles.forEach((particle) => {

              let distX = particle.pos.x - width / 2;
              let distY = particle.pos.y - height / 2; 
              let dist = Math.sqrt(distX * distX + distY * distY);
              particle.acc.x = 0.2*(distX/dist);
              particle.acc.y = 0.2*(distY/dist);
              particle.alphaStep = -0.005;
              
            });
            
          }, 1000);
            
          if(particles.every((particle)=>particle.pos.x<0 || particle.pos.x>width || particle.pos.y<0 || particle.pos.y>height)){
            console.log("all particles are out");
            finish();
          }
          // setTimeout(() => {
          //   finish();
          //   console.log("done");
          // }, 5000);
        }
      }

      joinParticles();
      requestAnimationFrame(update);
    }

    update();

    let mouseBefore;

    document.addEventListener("mousedown", () => {
      isMouseDown = true;
      updateMousePosition(event);
      mouseBefore = mouse.y;
      addEventListener("mousemove", updateMousePosition);
    });

    document.addEventListener("mouseup", () => {
      mouse.x = 1000000;
      mouse.y = 1000000;
      isMouseDown = false;
      removeEventListener("mousemove", updateMousePosition);
    });
  }
});
