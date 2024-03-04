import terrain from "./terrain.js";
import brush from "./brush.js";

const N = 200;

export let camera, scene, renderer;

renderer = new THREE.WebGLRenderer( { antialias: false } );
renderer.setSize(window.innerWidth * 0.992, window.innerHeight * 0.992);
renderer.setClearColor( 0x888888, 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;

export function createScene()
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
    
    scene.add(terrain);
    scene.add(brush.border);
	scene.add(brush.cursor);
    scene.add(light);
    scene.add(ambientLight);
}

