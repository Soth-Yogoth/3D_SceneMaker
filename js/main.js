let container;
let camera, scene, renderer;

const raycaster = new THREE.Raycaster();
const intersectPoint = new THREE.Vector3(0, 0, 0);
const mouse = new THREE.Vector3();

let mouseButtonPressed = false;
let clock = new THREE.Clock();
let delta;

const N = 250;
let terrain, brush;

let brushRadius = 1;
let brushStrength = 1;

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

    const light = new THREE.PointLight(0xEEE8AA);
    light.position.set(-N/2, -N/2, N/2);
    scene.add(light);

    createTerrarin(N, N);
    scene.add(terrain);

    createBrush();
    scene.add(brush);

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
    
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) 
{ 
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;    

    raycaster.setFromCamera(mouse, camera);  
    let intersection = raycaster.intersectObject(terrain);

    if (intersection.length > 0) 
    {
        intersectPoint.x = intersection[0].point.x;
        intersectPoint.y = intersection[0].point.y;
        intersectPoint.z = intersection[0].point.z;

        brush.position.copy(intersectPoint);
        brush.position.z = 0;
    }   

    for(let i = 0; i < brush.geometry.vertices.length; i++)
    {
        let pos = new THREE.Vector3();
        pos.copy(brush.geometry.vertices[i]);
        pos.applyMatrix4(brush.matrixWorld);

        let x = Math.round(pos.x + N/2);
        let y = Math.round(pos.y + N/2);

        let index = x * (N + 1) + y + 1
        let z = terrain.geometry.vertices[index].z;

        brush.geometry.vertices[i].z = z;
    };

    brush.geometry.computeFaceNormals();
    brush.geometry.computeVertexNormals(); 
    brush.geometry.verticesNeedUpdate = true; 
    brush.geometry.normalsNeedUpdate = true; 
}

function onMouseDown(event) 
{ 
    mouseButtonPressed = true;
}

function onMouseUp(event) 
{ 
    mouseButtonPressed = false;
}

function onMouseScroll(event) 
{ 
    if ((event.wheelDelta > 0 && brushRadius < 50) || (event.wheelDelta < 0 && brushRadius > 1))
    {
        brushRadius += event.wheelDelta / 100;
        brush.scale.set(brushRadius, brushRadius, 1);
    }
}

function animate()
{
    delta = clock.getDelta();

    if(mouseButtonPressed)
    {
        terrainChange();
    }

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function terrainChange()
{
    let Xmin = Math.round(intersectPoint.x - brushRadius + N/2);
    let Xmax = Math.round(intersectPoint.x + brushRadius + N/2);
    let Ymin = Math.round(intersectPoint.y - brushRadius + N/2);
    let Ymax = Math.round(intersectPoint.y + brushRadius + N/2);

    for (let x = Xmin; x <= Xmax; x++)
    {
        for (let y = Ymin; y <= Ymax; y++)
        {
            let i = x * (N + 1) + y + 1
            let dist = intersectPoint.distanceTo(terrain.geometry.vertices[i]);

            if (dist < brushRadius)
            {
                let h = Math.sqrt(brushRadius * brushRadius - dist * dist) * brushStrength * delta;
                terrain.geometry.vertices[i].z += h;
            }
        }
    }
    
    terrain.geometry.computeFaceNormals();
    terrain.geometry.computeVertexNormals(); 
    terrain.geometry.verticesNeedUpdate = true; 
    terrain.geometry.normalsNeedUpdate = true; 
}

function createTerrarin(width, length)
{
    let geometry = new THREE.Geometry();

    //vertices
    for (let x = 0; x <= width; x++)
    {
        for (let y = 0; y <= length; y++)
        {
            geometry.vertices.push(new THREE.Vector3(x - width/2, y - length/2, 0));
        }
    }

    //polygons
    for (let j = 0; j < width; j++)
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
    
    let terrainMaterial = new THREE.MeshLambertMaterial({
        map: texture,
        wireframe: false,
        side: THREE.DoubleSide
    });   

    terrain = new THREE.Mesh(geometry, terrainMaterial);
}

function createBrush()
{
    let circleGeometry = new THREE.CircleGeometry(1, 32); 
    circleGeometry.vertices.push(circleGeometry.vertices[1].clone() ); 
    circleGeometry.vertices.shift();

    let material = new THREE.MeshBasicMaterial();

    brush = new THREE.Line(circleGeometry, material); 
}
