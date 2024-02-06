let container;
let camera, scene, renderer;

const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
let intersection;

const N = 250;
let terrain, brush;

init();
animate();

function init()
{
    container = document.getElementById('container');

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 4000);  
    camera.position.set(0, -N, N/2);
    camera.lookAt(new THREE.Vector3(0, 0, 0)); 

    renderer = new THREE.WebGLRenderer( { antialias: false } );
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor( 0x888888, 1);
    container.appendChild(renderer.domElement);

    createTerrarin(N, N);
    scene.add(terrain);

    createBrush();
    scene.add(brush);

    window.addEventListener('resize', onWindowResize);

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    //renderer.domElement.addEventListener('mouseup', onMouseUp);
    //renderer.domElement.addEventListener('wheel', onMouseScroll);
}

function onWindowResize()
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseScroll(event) 
{ 

}

function onMouseMove(event) 
{ 

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;    

    raycaster.setFromCamera(mouse, camera);  
    intersection = raycaster.intersectObject(terrain);

    if(intersection[0])
    {
        let point = intersection[0].point;
        brush.position.set(point.x, point.y, point.z);
    }
}

function onMouseDown(event) 
{ 

}
function onMouseUp(event) 
{ 

}

function animate()
{
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function createTerrarin(width, length)
{
    let geometry = new THREE.Geometry();

    //push vertices
    for (let x = 0; x <= width; x++)
    {
        for (let y = 0; y <= length; y++)
        {
            geometry.vertices.push(new THREE.Vector3(x - width/2, y - length/2, 0));
        }
    }

    //polygonal grid
    for (let j = 0.0; j < width; j++)
    {
        for (let i = j * (length + 1); i < (j + 1) * (length + 1) - 1; i++)
        {    
            geometry.faces.push(new THREE.Face3(i, i + 1, length + 1 + i));
            geometry.faces.push(new THREE.Face3(i + 1, i + length + 2, length + 1 + i));   
        }
    }

    //texture coordinates
    for (let x = 0.0; x < 1; x += 1/width)
    {
        for (let y = 0.0; y < 1; y += 1/length)
        {    
            geometry.faceVertexUvs[0].push([
                new THREE.Vector2(x, y),
                new THREE.Vector2(x, y + 1/length),
                new THREE.Vector2(x + 1/width, y)]);
                
           geometry.faceVertexUvs[0].push([
                new THREE.Vector2(x, y + 1/length),
                new THREE.Vector2(x + 1/width, y + 1/length),
                new THREE.Vector2(x + 1/width, y)]);
        }
    }

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    let loader = new THREE.TextureLoader();
    let texture = loader.load('resources/textures/grass.jpg');
    
    let terrainMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        wireframe: false,
        side: THREE.DoubleSide
    });   

    terrain = new THREE.Mesh(geometry, terrainMaterial);
}

function createBrush()
{
    let circleGeometry = new THREE.CircleGeometry(20, 32); 
    let material = new THREE.LineBasicMaterial();
    circleGeometry.vertices.shift();
    brush = new THREE.Line(circleGeometry, material); 
}
