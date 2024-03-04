let gui = new dat.GUI();
gui.width = 300;

let modeFolder = gui.addFolder('Режим');  
let modelsFolder = gui.addFolder('Добавить объекты');  
let brushFolder = gui.addFolder('Параметры кисти');

export {modelsFolder, modeFolder, brushFolder};