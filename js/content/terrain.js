import { scene, sceneSize } from "./components.js";

let terrain = createTerrain(sceneSize, sceneSize, 'resources/textures/grass-3.jpg');

terrain.transform = function(x0, y0, radius, intensity)
{
    let Xmin = x0 - radius;
    let Xmax = x0 + radius;

    for (let x = Xmin + 1; x < Xmax; x++)
    {
        if(x + sceneSize/2 <= 0 || x + sceneSize/2 >= sceneSize) continue;

        let dist = Math.abs(x - x0);
        let h = Math.sqrt(Math.pow(radius, 2) - Math.pow(dist, 2)) * intensity;
        
        this.getVertex(x, y0).z += h;

        for(let y = y0 + 1; dist < radius - 1; y++)
        {
            dist = Math.sqrt(Math.pow(x - x0, 2) + Math.pow(y - y0, 2));
            h = Math.sqrt(Math.pow(radius, 2) - Math.pow(dist, 2)) * intensity;

            if(y + sceneSize/2 < sceneSize)
            {
                this.getVertex(x, y).z += h;
            }
            if(2 * y0 - y + sceneSize/2 > 0) 
            {
                this.getVertex(x, 2 * y0 - y).z += h;
            }
        }
    }
}

terrain.smooth = function(x0, y0, radius, intensity) 
{
    let Xmin = x0 - radius;
    let Xmax = x0 + radius;

    for (let x = Xmin + 1; x < Xmax; x++)
    {
        if(x + sceneSize/2 <= 0 || x + sceneSize/2 >= sceneSize) continue;

        let dist = Math.abs(x - x0);

        let vertex = this.getVertex(x, y0);

        if(vertex.z >= intensity)
        {
            vertex.z -= intensity;
        }
        else if(vertex.z <= -intensity)
        {
            vertex.z += intensity;
        }
        else vertex.z = 0;

        for(let y = y0 + 1; dist < radius - 1; y++)
        {
            dist = Math.sqrt(Math.pow(x - x0, 2) + Math.pow(y - y0, 2));

            if(y + sceneSize/2 < sceneSize)
            {
                let vertex = this.getVertex(x, y);

                if(vertex.z >= intensity)
                {
                    vertex.z -= intensity;
                }
                else if(vertex.z <= -intensity)
                {
                    vertex.z += intensity;
                }
                else vertex.z = 0;
            }
            if(2 * y0 - y + sceneSize/2 > 0) 
            {
                let vertex = this.getVertex(x, 2 * y0 - y);

                if(vertex.z >= intensity)
                {
                    vertex.z -= intensity;
                }
                else if(vertex.z <= -intensity)
                {
                    vertex.z += intensity;
                }
                else vertex.z = 0;
            }
        }
    }
};

terrain.updateMesh = function()
{
    this.geometry.computeFaceNormals();
    this.geometry.computeVertexNormals(); 
    this.geometry.verticesNeedUpdate = true; 
    this.geometry.normalsNeedUpdate = true; 
}

function createTerrain(width, length, texturePath)
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
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    
    let terrainMaterial = new THREE.MeshLambertMaterial({
        map: texture,
        side: THREE.DoubleSide
    });   

    let mesh = new THREE.Mesh(geometry, terrainMaterial);
    mesh.receiveShadow = true;
    return mesh;
}

terrain.getVertex = function(x,y)
{
    x = Math.round(x);
    y = Math.round(y);

    let index = (x + sceneSize/2) * (sceneSize + 1) + (y + sceneSize/2);
    
    if(index >= 0 && index < this.geometry.vertices.length)
    {
        return this.geometry.vertices[index];
    }
}

scene.add(terrain);

export default terrain;
