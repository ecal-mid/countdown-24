//Ce code contient la baseCanvas qui est l'imgage déconstruite par la grille de cellules


const baseCanvas = document.createElement('canvas');
const baseCtx = baseCanvas.getContext('2d');
const width = 800;
const height = 800;

baseCanvas.width = width;
baseCanvas.height = height;


// Remplace ce qui suit pour créer l'image de ton choix (c'est ici qu'il faut dessiner chiffres, lettres ou formes)

let canvasIsReady = false;

function drawBaseImage(){
    const img = new Image();
img.src = './2.png';
img.onload = () => {
   
    baseCtx.drawImage(img, 0, 0, width, height);
    console.log('baseImage loaded');
    setTimeout(() => {
        canvasIsReady = true;
        const canvasReadyEvent = new Event('canvasReady');
        document.dispatchEvent(canvasReadyEvent);
    }, 1000);
    

};
}

export {baseCanvas,drawBaseImage};