import terrain from './terrain.js';
import brush from './brush.js';
import Model from './models.js'; 

let container;
let camera, scene, renderer;
let stats = new Stats();

let N = 200;

let cursor = createCursor();

let raycaster = new THREE.Raycaster();
let intersectPoint = new THREE.Vector3(0, 0, 0);

let a = -Math.PI/2;
let mouseDelta;

let mouse = new THREE.Vector3();
let pressedMouseButton = -1;

let clock = new THREE.Clock();
let delta;

let objects = [];
let selectedObject;

init();
animate();

function init()
{
    renderer = new THREE.WebGLRenderer( { antialias: false } );
    renderer.setSize(window.innerWidth * 0.992, window.innerHeight * 0.992);
    renderer.setClearColor( 0x888888, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;

    container = document.getElementById('container');

    container.appendChild(renderer.domElement);
    container.appendChild(stats.domElement);

    createScene();

    window.addEventListener('resize', onWindowResize);

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('wheel', onMouseScroll);
}

function onWindowResize()
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize(window.innerWidth * 0.992, window.innerHeight * 0.992);
}

function onMouseMove(event) 
{ 
    mouseDelta = ((event.clientX / window.innerWidth) * 2 - 1) - mouse.x;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;    

    raycaster.setFromCamera(mouse, camera);  
    let intersection = raycaster.intersectObject(terrain.mesh);

    if (intersection.length > 0) 
    {
        intersectPoint = intersection[0].point;
        brush.moveTo(intersectPoint, terrain.mesh);

        cursor.position.set(0, 0, 0);
        cursor.lookAt(intersection[0].face.normal);
        cursor.position.copy(intersectPoint);
        cursor.position.z += 5;
    }   
}

function onMouseDown(event) 
{ 
    if (Model.selected != null && event.button == 0)
    {
        let object = Model.selected.clone()
        object.position.copy(intersectPoint);
        objects.push(object);
        scene.add(object);

        Model.selected = null;
        brush.visible = terrain.editable;
    }
    else
    {
        if(event.button == 0 && !terrain.editable)
        {
            let intersection = raycaster.intersectObjects(objects, true); 
            if(intersection.length > 0)
            {
                selectedObject = intersection[0].object.parent;
            }
        }

        pressedMouseButton = event.button;
    }
}

function onMouseUp(event) 
{ 
    pressedMouseButton = -1;
}

function onMouseScroll(event) 
{ 
    brush.radius += Math.round(event.wheelDelta / 100);
}

function animate()
{
    delta = clock.getDelta();

    switch(pressedMouseButton)
    {
        case 0:
        {
            if(terrain.editable)
            {
                terrain.editMesh(
                    Math.round(intersectPoint.x), 
                    Math.round(intersectPoint.y), 
                    brush.radius, 
                    brush.intensity * delta);
                terrain.updateMesh();
            }
            else
            {
                selectedObject.position.copy(intersectPoint);
            }
            break;
        }
        case 1:
        {
            a += mouseDelta;
            camera.position.set(N * Math.cos(a), N * Math.sin(a), N/2);
            camera.up.set(-camera.position.x, -camera.position.y, 0);
            camera.lookAt(0, 0, 0); 
            break;
        }
        default:
            break;
    }

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    stats.update();
}

function createScene()
{
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 4000);  
    camera.position.set(0, -N, N/2);
    camera.lookAt(0, 0, 0); 
    
    let light = new THREE.DirectionalLight( 0xffffff, 1 )
    light.position.set(-N/2, -N/2, N/2);
    light.castShadow = true;
  
    light.shadow.camera.left = -N;
    light.shadow.camera.bottom = -N;
    light.shadow.camera.right = N;
    light.shadow.camera.top = N;

    let ambientLight = new THREE.AmbientLight(0x404040);
    
    scene.add(terrain.mesh);
    scene.add(brush.line);
	scene.add(cursor);
    scene.add(light);
    scene.add(ambientLight);
}

function createCursor()
{
    let cursorGeometry = new THREE.ConeGeometry(2, 10, 3);
    cursorGeometry.rotateX( Math.PI / 2 );
    return new THREE.Mesh( cursorGeometry, new THREE.MeshNormalMaterial() );
}