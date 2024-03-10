export let camera, scene, renderer;
export const sceneSize = 200;

export let targets = [];
export let mixers = [];

function createScene()
{
    renderer = new THREE.WebGLRenderer( { antialias: false } );
    renderer.setSize(window.innerWidth * 0.992, window.innerHeight * 0.992);
    renderer.setClearColor( 0x888888, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 4000);  
    camera.position.set(0, -sceneSize, sceneSize/2);
    camera.lookAt(0, 0, 0); 
    
    let light = new THREE.DirectionalLight( 0xffffff, 1 )
    light.position.set(-sceneSize/2, -sceneSize/2, sceneSize/2);
    light.castShadow = true;
  
    light.shadow.camera.left = -sceneSize;
    light.shadow.camera.bottom = -sceneSize;
    light.shadow.camera.right = sceneSize;
    light.shadow.camera.top = sceneSize;
    
    let ambientLight = new THREE.AmbientLight(0x404040);
    
    scene.add(light);
    scene.add(ambientLight);
    scene.add(createSky("resources/Textures/sky.jpg"))
}

function createSky(texPath)
{
    let geometry = new THREE.SphereGeometry(sceneSize * 2, 32, 32);
    
    let loader = new THREE.TextureLoader();
    let texture = loader.load(texPath);
    texture.minFilter = THREE.NearestFilter;
    
    let material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide
    });
    
    let sphere = new THREE.Mesh(geometry, material);
    sphere.rotateX(Math.PI/2);
    return sphere;
}

createScene();