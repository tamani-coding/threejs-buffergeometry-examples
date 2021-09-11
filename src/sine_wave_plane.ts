import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export function sine_wave_plane () {
    // SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa8def0);

// CAMERA
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 5;

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true

// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.target = new THREE.Vector3(0, 0, -40);
controls.update();

// AMBIENT LIGHT
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
// DIRECTIONAL LIGHT
const dirLight = new THREE.DirectionalLight(0xffffff, 1.0)
dirLight.position.x += 20
dirLight.position.y += 20
dirLight.position.z += 20
dirLight.castShadow = true
dirLight.shadow.mapSize.width = 4096;
dirLight.shadow.mapSize.height = 4096;
const d = 25;
dirLight.shadow.camera.left = - d;
dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d;
dirLight.shadow.camera.bottom = - d;
dirLight.position.z = -30;

let target = new THREE.Object3D();
target.position.z = -30;
dirLight.target = target;
dirLight.target.updateMatrixWorld();

dirLight.shadow.camera.lookAt(0,0, -30);
scene.add(dirLight);
// scene.add( new THREE.CameraHelper( dirLight.shadow.camera ) );

const geometry = new THREE.PlaneBufferGeometry(30,30,200,200);
const plane = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial( {color: 0xf2a23a} ));
plane.receiveShadow = true;
plane.castShadow = true;
plane.rotation.x = - Math.PI / 2;
plane.position.z = - 30;
scene.add(plane);

const vector3 = new THREE.Vector3();
const count: number  = geometry.attributes.position.count;

// ANIMATE
function animate() {

    // SINE WAVE
    const now = Date.now() / 300;
    const position = (geometry.attributes.position.array as Float32Array);
    const normals = (geometry.attributes.normal.array as Float32Array);
    for (let i = 0; i < count; i++) {
        const x = position[i * 3];
        const y = position[i * 3 + 1];

        const xangle = x + now
        const xsin = Math.sin(xangle)
        const yangle = y + now
        const ysin = Math.sin(y + now)

        position[i * 3 + 2] = xsin
        
        vector3.x = normals[i * 3]
        vector3.y = normals[i * 3 + 1]
        vector3.z = normals[i * 3 + 2]

        const tx = 1 / Math.sqrt(1 + Math.pow(Math.cos(xangle), 2))
        const ty = Math.cos(xangle) / Math.sqrt(1 + Math.pow(Math.cos(xangle), 2))
        
        // console.log(`${tx} - ${ty}`)

        normals[i * 3] = tx
        normals[i * 3 + 1] = 0
        normals[i * 3 + 2] = -ty

        // vector3.applyAxisAngle(yaxis, xsin / Math.PI / Math.PI)
        // vector3.applyAxisAngle(yaxis, yangle)

        // normals[i * 3] = vector3.x
        // normals[i * 3 + 1] = vector3.y
        // normals[i * 3 + 2] = vector3.z
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.normal.needsUpdate = true;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
document.body.appendChild(renderer.domElement);
animate();

// RESIZE HANDLER
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);
}