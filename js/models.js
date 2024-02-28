import gui from './gui.js';
import brush from './brush.js';

let modelsFolder = gui.addFolder('Добавить объекты');  

export default class Model 
{
    object;
    static selected = null;

    constructor(path, objName, mtlName, name) 
    {
        let onLoad = (obj) =>
        {
            obj.traverse((child) =>
            {
                if (child instanceof THREE.Mesh) 
                {   
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            this.object = obj;
            modelsFolder.add(this, 'select').name('Добавить ' + name);
        }  

        function onError(xhr)
        {
            console.log(xhr);
        }

        function mtlLoad(materials)
        {
            materials.preload;
    
            let objLoader = new THREE.OBJLoader();
            objLoader.setPath(path);
            objLoader.setMaterials(materials);
            objLoader.load(objName, onLoad, null, onError)
        }

        let mtlLoader = new THREE.MTLLoader();
        mtlLoader.setPath(path);
        mtlLoader.load(mtlName, mtlLoad);
    }

    select()
    {
        brush.visible = false;
        Model.selected = this.object;
    }
}

new Model("resources/Wall/", "grade.obj", "grade.mtl", "забор");
new Model("resources/House/", "house.obj", "house.mtl", "дом");
new Model("resources/Flora/Palma/", "palma.obj", "palma.mtl", "пляжное дерево");
new Model("resources/Flora/Tree/", "tree.obj", "tree.mtl", "дерево");
new Model("resources/Flora/Fir/", "fir.obj", "fir.mtl", "ель");
new Model("resources/Bush/", "bush.obj", "bush.mtl", "куст");