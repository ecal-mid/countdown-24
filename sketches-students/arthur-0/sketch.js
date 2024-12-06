
import { createEngine } from "../../shared/engine.js";

const { renderer, input, math, run, finish } = createEngine();
const { ctx, canvas } = renderer;

var myFont = new FontFace('myFont', 'url(StretchPro.otf)');
myFont.load().then(function(font){
    document.fonts.add(font);
    console.log("font loaded");
  
  });


canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.background = "black";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.position = "fixed";

const miniCanvas = document.createElement('canvas')
    const miniCtx = miniCanvas.getContext('2d');

let dims;

if(canvas.width > canvas.height){
    let size = canvas.height;
    dims = {
        x: (canvas.width-size)/2,
        y: 0,
        size: size
    }

}
else{
    let size = canvas.width;
    dims = {
        x: 0,
        y: (canvas.height-size)/2,
        size: size
    }
}



canvas.style.position = "fixed";

function sketch(){

    


// Preprocess the canvas image
function preprocessCanvas(canvas) {
    return tf.browser.fromPixels(canvas)
        .resizeBilinear([28, 28])
        .mean(2)  // Convert to grayscale
        .expandDims(0)
        .expandDims(-1)  // Add an extra dimension at the end
        .toFloat()
        .div(tf.scalar(255));  // Normalize to 0-1 range
}

let guess;

// Classify the image on the canvas
async function classifyCanvas(img) {
    if (!model) {
        console.error('Model not loaded.');
        return;
    }
    
    const imageTensor = preprocessCanvas(img);
    const predictions = await model.predict(imageTensor).data();
    const label = predictions.indexOf(Math.max(...predictions));
    console.log(label);



    if(label == 0){
        success();
    }
    else{
        setTimeout(fail, 1000);
        
    }
    
}

function Classify(){
    
    miniCanvas.width = 28;
    miniCanvas.height = 28;
    miniCtx.fillStyle = 'black';
    miniCtx.fillRect(0, 0, 28,28);
    miniCtx.drawImage(canvas,dims.x,dims.y,dims.size,dims.size, 0, 0, 28, 28);
    ctx.drawImage(miniCanvas, 0, 0, 28, 28, dims.x, dims.y, dims.size, dims.size);
    canvas.style.filter = "contrast(1000000%)";

    const img = new Image();
    
    img.width = 28;
    img.height = 28;
    img.src = miniCanvas.toDataURL();
    img.onload = () => {
        classifyCanvas(img);
    };
}

// p5.js function to handle key press
function keyPressed(e) {
    if (e.key === 's' || e.key === 'S') {  // Use 's' key to trigger classification
        const miniCanvas = document.createElement('canvas')
        const miniCtx = miniCanvas.getContext('2d');
        miniCanvas.width = 28;
        miniCanvas.height = 28;
        miniCtx.fillStyle = 'black';
        miniCtx.fillRect(0, 0, 28,28);
        miniCtx.drawImage(canvas,dims.x,dims.y,dims.size,dims.size, 0, 0, 28, 28);
        ctx.drawImage(miniCanvas, 0, 0, 28, 28);

        const img = new Image();
        
        img.width = 28;
        img.height = 28;
        img.src = miniCanvas.toDataURL();
        img.onload = () => {
            classifyCanvas(img);
        };
       
    }
    else{
        fail();
    }
}


let points = [];
let lines = [];

function draw(e){
    points.push({x: e.clientX, y: e.clientY})
    ctx.strokeStyle = "white";
    ctx.lineWidth = canvas.width/20;
    ctx.lineJoin = ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((point)=>{
        ctx.lineTo(point.x,point.y);
    });
    ctx.stroke();
    
    lines.forEach((line)=>{
        ctx.beginPath();
        ctx.moveTo(line[0].x, line[0].y);
        line.forEach((point)=>{
            ctx.lineTo(point.x,point.y);
        });
        ctx.stroke();
    });
}

function success(){
    window.dispatchEvent(new CustomEvent("success"));
    console.log("Success!");
    canvas.style.filter = "invert(100%)";
    window.dispatchEvent(new CustomEvent("flash"));
    setTimeout(()=>{
        canvas.style.filter = "invert(0%)";
        window.dispatchEvent(new CustomEvent("flash"));
       setTimeout(()=>{ canvas.style.filter = "invert(100%)";
        window.dispatchEvent(new CustomEvent("flash"));
        ctx.fillStyle = "black";
        ctx.fillRect(0,0,canvas.width,canvas.height);
        setTimeout(()=>{canvas.style.filter = "invert(0%)";
            window.dispatchEvent(new CustomEvent("flash"));
        setTimeout(()=>{
            canvas.style.filter = "invert(100%)";
            window.dispatchEvent(new CustomEvent("flash"));
            setTimeout(()=>{
                canvas.style.filter = "invert(0%)";
                window.dispatchEvent(new CustomEvent("flash"));
                ctx.fillStyle = "black";
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "70vh myFont";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("0",canvas.width/2,canvas.height/2);
        setTimeout(()=>{
            canvas.style.filter = "invert(100%)";
            window.dispatchEvent(new CustomEvent("flash"));
            setTimeout(()=>{
                canvas.style.filter = "invert(0%)";
                window.dispatchEvent(new CustomEvent("flash"));
                setTimeout(()=>{
                    canvas.style.filter = "invert(100%)";
                    window.dispatchEvent(new CustomEvent("flash"));
                    setTimeout(()=>{
                        canvas.style.filter = "invert(0%)";
                        window.dispatchEvent(new CustomEvent("flash"));
                        ctx.fillStyle = "black";
                        ctx.fillRect(0,0,canvas.width,canvas.height);
                        finish();
                    },100);
                },100);
            },100);
            
        
    },1000);
            },100);
        },100);
    });
    },100);
    },100);

}

function fail(){
    window.dispatchEvent(new CustomEvent("fail"));
    canvas.style.filter = "invert(100%)";
    window.dispatchEvent(new CustomEvent("flash"));
    setTimeout(()=>{
        canvas.style.filter = "invert(0%)";
        window.dispatchEvent(new CustomEvent("flash"));
        setTimeout(()=>{
            canvas.style.filter = "invert(100%)";
            window.dispatchEvent(new CustomEvent("flash"));
            setTimeout(()=>{
                canvas.style.filter = "invert(0%)";
                window.dispatchEvent(new CustomEvent("flash"));
                ctx.fillStyle = "black";
        ctx.fillRect(0,0,canvas.width,canvas.height);
        lines = [];
        points  = [];
            },100);
        },100);
    },100);
    
}

document.addEventListener("mousedown",(e)=>{
    Tone.start();
    points.push({x: e.clientX, y: e.clientY});
    draw(e);
    document.addEventListener("mousemove",draw);
})

document.addEventListener("mouseup",(e)=>{
    document.removeEventListener("mousemove",draw); 
    Classify();
    lines.push(points);

   
    
    

});
}



export { sketch }
