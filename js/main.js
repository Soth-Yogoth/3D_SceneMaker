import { scene, camera, renderer, mixers} from './content/components.js';
import { onMouseScroll, onMouseUp, onMouseDown, onMouseMove, onMouseButtonHolding, keyboardEventListener } from './systems/control.js';

let container;
let stats = new Stats();

let clock = new THREE.Clock();
let timeDelta;

init();
animate();

function init()
{
    container = document.getElementById('container');
    container.appendChild(renderer.domElement);
    container.appendChild(stats.domElement);

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('keydown', keyboardEventListener);

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseleave', onMouseUp);
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

function animate()
{
    timeDelta = clock.getDelta();

    mixers.forEach(mixer => {
        mixer.update(timeDelta);
    });

    onMouseButtonHolding(timeDelta);

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    stats.update();
}