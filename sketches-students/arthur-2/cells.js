//Ce code contient les classes et fonction qui divisent le baseCanvas en cellules et en crée des paires


import {baseCanvas} from './baseImage.js';

class cell{
    constructor(row,col,width,height,image){
        this.row = row;
        this.col = col;
        this.width = width;
        this.height = height;
        this.image = image;
    }
}

function subdivideImage(subdivisions){
    const cells = [];
    const cellWidth = baseCanvas.width / subdivisions;
    const cellHeight = baseCanvas.height / subdivisions;
    for (let i = 0; i < subdivisions; i++) {
        for (let j = 0; j < subdivisions; j++) {
            const cellCanvas = document.createElement('canvas');
            const cellCtx = cellCanvas.getContext('2d');
            cellCanvas.width = cellWidth;
            cellCanvas.height = cellHeight;
            cellCtx.drawImage(baseCanvas, j * cellWidth, i * cellHeight, cellWidth, cellHeight, 0, 0, cellWidth, cellHeight);
            const newCell = new cell(i, j, cellWidth, cellHeight, cellCanvas);
            cells.push(newCell);
        }
    }
    return cells;
}



export {subdivideImage};

