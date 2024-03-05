import { mode } from './mode.js';
import { scene, camera, sceneSize, mixers, targets} from '../content/components.js';
import { selectedModel } from '../content/models.js';
import terrain from '../content/terrain.js';
import brush from '../content/brush.js';

let mouse = new THREE.Vector3();

let a = -Math.PI/2;
let mouseDelta = 0;

let raycaster = new THREE.Raycaster();
let intersectPoint = new THREE.Vector3(0, 0, 0);

let selectedObject; 

export function deselectObject()
{
    if(selectedObject == null) return;

    selectedObject.material.opacity = 0;
    selectedObject = null;
}

export function onMouseMove(e)
{ 
    mouseDelta = ((e.clientX / window.innerWidth) * 2 - 1) - mouse.x;

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;    

    raycaster.setFromCamera(mouse, camera);  
    let intersection = raycaster.intersectObject(terrain);

    if (intersection.length > 0) 
    {
        intersectPoint = intersection[0].point;
        brush.moveTo(intersection[0], terrain);
    }   
}

export function onMouseDown(e) 
{ 
    if(e.button == 1)
    {
        onMouseButtonHolding = actions.moveCamera;
    }
    else if(e.button == 0)
    {
        switch(mode.selected)
        {
            case 0:
            {
                onMouseButtonHolding = actions.editTerrain;
                break;
            }
            case 1:
            {
                actions.selectObject();
                onMouseButtonHolding = actions.moveObject;
                break;
            }
            case 2:
            {
                actions.addObject(selectedModel);
                break;
            }
        }
    }
}

export function onMouseUp(e) 
{ 
    onMouseButtonHolding = () => {};
}

export function onMouseScroll(e) 
{ 
    switch(mode.selected)
    {
        case 0:
        {
            brush.radius += Math.round(e.wheelDelta / 100);
            break;
        }
        case 1:
        {
            actions.scaleObject(e.wheelDelta);
            break;
        }
    }
}

export function onMouseButtonHolding() {}

export function keyboardEventListener(e)
{
    if(selectedObject == null) return;

    switch(e.key)
    {
        case "Q": case "q": case "Й": case "й":
        {
            actions.rotateObject(-1);
            break;
        }
        case "E": case "e": case "У": case "у":
        {
            actions.rotateObject(1);
            break;
        }
        case "Delete":
        {
            actions.delete();
            break;
        }
        default: 
            break;
    }
}

let actions =
{
    addObject(model)
    {
        let object = model.getCopy();

        object.OBBox.fly = object.mesh.position.z > 0
        object.OBBox.mixer = object.mixer;
        object.OBBox.mesh = object.mesh;
        object.OBBox.size = 1;

        object.mesh.position.x += intersectPoint.x;
        object.mesh.position.y += intersectPoint.y;
        object.mesh.position.z += intersectPoint.z;

        object.OBBox.position.x += intersectPoint.x;
        object.OBBox.position.y += intersectPoint.y;
        object.OBBox.position.z += intersectPoint.z;

        scene.add(object.mesh);
        scene.add(object.OBBox);

        targets.push(object.OBBox);
        if(object.OBBox.mixer != null) mixers.push(object.OBBox.mixer);
    },

    selectObject()
    {
        deselectObject();
        let intersection = raycaster.intersectObjects(targets); 

        if(intersection.length > 0)
        {
            selectedObject = intersection[0].object;
            selectedObject.material.opacity = 0.1;
        }
    },

    editTerrain(timeDelta)
    {
        if(brush.smooth)
        {
            terrain.smooth(
                Math.round(intersectPoint.x), 
                Math.round(intersectPoint.y), 
                brush.radius, 
                Math.abs(brush.intensity) * 10 * timeDelta)
        }
        else
        {
            terrain.transform(
                Math.round(intersectPoint.x), 
                Math.round(intersectPoint.y), 
                brush.radius, 
                brush.intensity * timeDelta);
        }
        terrain.updateMesh();

        targets.forEach(target => {
            let height = terrain.getVertex(target.position.x, target.position.y).z;

            if(target.fly)
            {
                target.position.z = height + 30; 
                target.mesh.position.z = height + 30;
            }
            else
            {
                target.position.z = height + target.scale.z/2; 
                target.mesh.position.z = height;
            }
        });
    },

    moveObject()
    {
        if(selectedObject == null) return;
        
        selectedObject.mesh.position.copy(intersectPoint);
        selectedObject.position.copy(intersectPoint);

        if(selectedObject.fly)
        {
            selectedObject.position.z += 30; 
            selectedObject.mesh.position.z += 30;
        }
        else
        {
            selectedObject.position.z += selectedObject.scale.z/2; 
        }
    },

    scaleObject(value)
    {
        if(selectedObject == null) return;

        let multiplier;

        if(value < 0 && selectedObject.size > 0.5)
        {
            multiplier = 0.9;
        }
        else if (value > 0 && selectedObject.size < 2)
        {
            multiplier = 1.1;
        }
        else return;

        selectedObject.size *= multiplier;

        selectedObject.scale.x *= multiplier;
        selectedObject.scale.y *= multiplier;
        selectedObject.scale.z *= multiplier;

        selectedObject.mesh.scale.x *= multiplier;
        selectedObject.mesh.scale.y *= multiplier;
        selectedObject.mesh.scale.z *= multiplier;

        selectedObject.position.z = selectedObject.mesh.position.z;
        selectedObject.position.z += selectedObject.fly? 0 : selectedObject.scale.z/2;
    },

    rotateObject(value)
    {
        let angle = mode.fixRotateAngle? Math.PI / 4 : Math.PI / 180;
        selectedObject.rotateZ(value * angle);
        selectedObject.mesh.rotateZ(value * angle);
    },

    delete()
    {
        let i = targets.indexOf(selectedObject);
        targets.splice(i, 1);

        if(mixers.includes(selectedObject.mixer, 0))
        {
            i = mixers.indexOf(selectedObject.mixer);
            mixers.splice(i, 1);
        }
        
        scene.remove(selectedObject.mesh);
        scene.remove(selectedObject);

        deselectObject();
    },

    moveCamera()
    {
        a += mouseDelta;
        mouseDelta = 0;

        camera.position.set(sceneSize * Math.cos(a), sceneSize * Math.sin(a), sceneSize/2);
        camera.up.set(-camera.position.x, -camera.position.y, 0);
        camera.lookAt(0, 0, 0); 
    },
}
