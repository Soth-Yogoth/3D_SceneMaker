import { modelsFolder } from '../systems/gui.js';
import { mode } from '../systems/mode.js';
import { scene, targets, mixers } from './components.js';

export let selectedModel;

export function deselectModel()
{
    if(selectedModel == null) return;

    selectedModel.guiButton.name('Добавить ' + selectedModel.name);
    selectedModel = null;
}

class Model
{
    constructor(obj, name, clip)
    {
        this.mesh = obj;
        this.clip = clip;

        this.name = name;
        this.guiButton = modelsFolder.add(this, 'select').name('Добавить ' + name);
    }

    select()
    {
        deselectModel();
        this.guiButton.name('Добавить ' + this.name + ' (выбрано)')

        selectedModel = this;
        mode.setAddObjectMode();
    }

    placeCopy(pos)
    {
        let mesh = this.mesh.clone();

        mesh.position.x += pos.x;
        mesh.position.y += pos.y;
        mesh.position.z += pos.z;

        let object = createOBBox(mesh);
        object.mesh = mesh;
        object.mixer = null;

        object.fly = object.mesh.position.z > 0
        object.size = 1;

        console.log(object.fly);

        scene.add(object.mesh);
        scene.add(object);
        targets.push(object);

        if(this.clip != null)
        {
            object.mesh.rotateZ = object.mesh.rotateY;

            object.mixer = new THREE.AnimationMixer(object.mesh);
            let action = object.mixer.clipAction(this.clip);
            action.play();
        }

        if(object.mixer != null) mixers.push(object.mixer);
    }
}

function createStaticModel(path, objName, mtlName, name) 
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
        new Model(obj, name, null);
    }  

    let onError = (xhr) => console.log(xhr);

    let mtlLoad = (materials) =>
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

function createAnimatedModel(path, name)
{
    let loader = new THREE.GLTFLoader();

    loader.load(path, (gltf) =>
    {
        let obj = gltf.scene.children[0];
        let clip = gltf.animations[0];

        obj.castShadow = true;
        obj.receiveShadow = true;

        new Model(obj, name, clip);
    });
}

function createOBBox(mesh)
{
    let boundingBox = new THREE.Box3();
    boundingBox.setFromObject(mesh);

    let pos = new THREE.Vector3();
    boundingBox.getCenter(pos);

    let size = new THREE.Vector3();
    boundingBox.getSize(size);

    let geometry = new THREE.BoxGeometry(1, 1, 1);
    let material = new THREE.MeshBasicMaterial( {transparent: true, opacity: 0, }); 
    let OBBox = new THREE.Mesh( geometry, material );

    OBBox.position.copy(pos);
    OBBox.scale.set(size.x, size.y, size.z);

    return OBBox;
}

createAnimatedModel("resources/Animals/Parrot.glb", "попугай");
createAnimatedModel("resources/Animals/Flamingo.glb", "фламинго");
createAnimatedModel("resources/Animals/Horse.glb", "лошадь");

createStaticModel("resources/Wall/", "grade.obj", "grade.mtl", "забор");
createStaticModel("resources/House/", "house.obj", "house.mtl", "дом");
createStaticModel("resources/Flora/Palma/", "palma.obj", "palma.mtl", "пляжное дерево");
createStaticModel("resources/Flora/Tree/", "tree.obj", "tree.mtl", "дерево");
createStaticModel("resources/Flora/Fir/", "fir.obj", "fir.mtl", "ель");
createStaticModel("resources/Bush/", "bush.obj", "bush.mtl", "куст");
