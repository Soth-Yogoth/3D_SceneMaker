import Model from './models.js'; 
import brush from './brush.js';
import gui from './gui.js';

const N = 200;

let terrain = 
{
    mesh: createMesh(N, N, 'resources/textures/grass.jpg'),
    editable: true,

    switchMode()
    {
        this.editable = !this.editable;
        brush.visible = this.editable;
        Model.selected = null;

        if(this.editable)
        {
            modeButton.name("Включить режим перетаскивания объектов");
        }
        else
        {
            modeButton.name("Включить режим редактирования ландшафта");
        }
    },

    editMesh(x0, y0, radius, intensity)
    {
        let Xmin = x0 - radius;
        let Xmax = x0 + radius;

        for (let x = Xmin + 1; x < Xmax; x++)
        {
            if(x + N/2 <= 0 || x + N/2 >= N) continue;

            let dist = Math.sqrt(Math.pow(x - x0, 2))
            let h = Math.sqrt(Math.pow(radius, 2) - Math.pow(dist, 2)) * intensity;

            this.mesh.geometry.vertices[(x + N/2) * (N + 1) + (y0 + N/2)].z += h;

            for(let y = y0 + 1; dist < radius - 1; y++)
            {
                dist = Math.sqrt(Math.pow(x - x0, 2) + Math.pow(y - y0, 2))
                h = Math.sqrt(Math.pow(radius, 2) - Math.pow(dist, 2)) * intensity;
            
                if(y + N/2 < N)
                {
                    this.mesh.geometry.vertices[(x + N/2) * (N + 1) + (y + N/2)].z += h;
                }
                if(2 * y0 - y + N/2 > 0) 
                {
                    this.mesh.geometry.vertices[(x + N/2) * (N + 1) + (2 * y0 - y + N/2)].z += h;
                }
            }
        }
    },

    updateMesh()
    {
        this.mesh.geometry.computeFaceNormals();
        this.mesh.geometry.computeVertexNormals(); 
        this.mesh.geometry.verticesNeedUpdate = true; 
        this.mesh.geometry.normalsNeedUpdate = true; 
    }
}

function createMesh(width, length, texturePath)
{
    let geometry = new THREE.Geometry();

    for (let x = 0; x <= width; x++)
    {
        for (let y = 0; y <= length; y++)
        {
            geometry.vertices.push(new THREE.Vector3(x - width/2, y - length/2, 0));
        }
    }

    for (let j = 0; j < width; j++)
    {
        for (let i = j * (length + 1); i < (j + 1) * (length + 1) - 1; i++)
        {    
            geometry.faces.push(new THREE.Face3(i, i + 1, length + 1 + i));
            geometry.faces.push(new THREE.Face3(i + 1, i + length + 2, length + 1 + i));   
        }
    }

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
    let texture = loader.load(texturePath);
    
    let terrainMaterial = new THREE.MeshLambertMaterial({
        map: texture,
        wireframe: false,
        side: THREE.DoubleSide
    });   

    let mesh = new THREE.Mesh(geometry, terrainMaterial);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    return mesh;
}

let modeButton = gui.add(terrain, 'switchMode').name('Включить режим перетаскивания объектов');

export default terrain;
