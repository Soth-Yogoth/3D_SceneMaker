import gui from './gui.js';

const N = 200;

let brush =
{
    line: createLine(),
    _radius: 1,
    intensity: 0.5,

    get radius()
    {
        return this._radius;
    },

    set radius(value)
    {
        if ((value > 1 && value < N/5))
        {
            this._radius = value;
            this.line.scale.set(this.radius, this.radius, 1);
        }
    },

    set visible(value)
    {
        this.line.visible = value;
    },

    moveTo(point, terrain)
    {
        this.line.position.copy(point);
        this.line.position.z = 0;

        for(let i = 0; i < this.line.geometry.vertices.length; i++)
        {
            let pos = new THREE.Vector3();
            pos.copy(this.line.geometry.vertices[i]);
            pos.applyMatrix4(this.line.matrixWorld);

            let x = Math.round(pos.x + N/2);
            let y = Math.round(pos.y + N/2);

            let index = x * (N + 1) + y + 1
            let z = terrain.geometry.vertices[index].z;

            this.line.geometry.vertices[i].z = z;
        };

        this.line.geometry.computeFaceNormals();
        this.line.geometry.computeVertexNormals(); 
        this.line.geometry.verticesNeedUpdate = true; 
        this.line.geometry.normalsNeedUpdate = true; 
    }
}

let brushFolder = gui.addFolder('Параметры кисти');
brushFolder.add(brush, 'intensity', -1, 1, 0.1).name('Сила нажатия');

function createLine()
{
    let circleGeometry = new THREE.CircleGeometry(1, 32); 
    circleGeometry.vertices.push(circleGeometry.vertices[1].clone() ); 
    circleGeometry.vertices.shift();
    
    let material = new THREE.MeshBasicMaterial();
    
    return new THREE.Line(circleGeometry, material); 
}

export default brush;
