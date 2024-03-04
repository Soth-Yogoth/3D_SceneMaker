import { brushFolder } from "../systems/gui.js";

const N = 200;

let brush =
{
    cursor: createCursor(),
    border: createLine(),
    borderRadius: 1,
    intensity: 0.5,
    smooth: false,

    get radius()
    {
        return this.borderRadius;
    },

    set radius(value)
    {
        if ((value > 1 && value < N/5))
        {
            this.borderRadius = value;
            this.border.scale.set(this.radius, this.radius, 1);
        }
    },

    moveTo(intersection, terrain)
    {
        let point = intersection.point;

        this.cursor.position.set(0, 0, 0);
        this.cursor.lookAt(intersection.face.normal);
        this.cursor.position.copy(point);
        this.cursor.position.z += 5;

        this.border.position.copy(point);
        this.border.position.z = 0;

        for(let i = 0; i < this.border.geometry.vertices.length; i++)
        {
            let pos = new THREE.Vector3();
            pos.copy(this.border.geometry.vertices[i]);
            pos.applyMatrix4(this.border.matrixWorld);

            let x = Math.round(pos.x + N/2);
            let y = Math.round(pos.y + N/2);

            let index = x * (N + 1) + y + 1
            let z = terrain.geometry.vertices[index].z;

            this.border.geometry.vertices[i].z = z;
        };

        this.border.geometry.computeFaceNormals();
        this.border.geometry.computeVertexNormals(); 
        this.border.geometry.verticesNeedUpdate = true; 
        this.border.geometry.normalsNeedUpdate = true; 
    }
}

function createLine()
{
    let circleGeometry = new THREE.CircleGeometry(1, 32); 
    circleGeometry.vertices.push(circleGeometry.vertices[1].clone() ); 
    circleGeometry.vertices.shift();
    
    let material = new THREE.MeshBasicMaterial();
    
    return new THREE.Line(circleGeometry, material); 
}

function createCursor()
{
    let cursorGeometry = new THREE.ConeGeometry(2, 10, 3);
    cursorGeometry.rotateX( Math.PI / 2 );
    return new THREE.Mesh( cursorGeometry, new THREE.MeshNormalMaterial() );
}

brushFolder.add(brush, 'intensity', -1, 1, 0.1).name('Сила нажатия');
brushFolder.add(brush, 'smooth').name('Выравнивание');

export default brush;
