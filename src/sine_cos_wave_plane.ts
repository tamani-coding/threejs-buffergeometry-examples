import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export function sine_cos_wave_plane() {
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
    target.position.z = -20;
    dirLight.target = target;
    dirLight.target.updateMatrixWorld();

    dirLight.shadow.camera.lookAt(0, 0, -30);
    scene.add(dirLight);
    // scene.add(new THREE.CameraHelper(dirLight.shadow.camera));

    const geometry = new THREE.PlaneBufferGeometry(30, 30, 200, 200);
    const plane = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ color: 0xf2a23a }));
    plane.receiveShadow = true;
    plane.castShadow = true;
    plane.rotation.x = - Math.PI / 2;
    plane.position.z = - 30;
    scene.add(plane);

    const count: number = geometry.attributes.position.count;

    // ANIMATE
    function animate() {

        // SINE WAVE
        const now = Date.now() / 300;
        for (let i = 0; i < count; i++) {
            const x = geometry.attributes.position.getX(i)
            const y = geometry.attributes.position.getY(i)

            const xangle = x + now
            const xsin = Math.sin(xangle)
            const yangle = y + now
            const ycos = Math.cos(yangle)

            geometry.attributes.position.setZ(i, xsin + ycos)
        }
        geometry.computeVertexNormals()
        geometry.attributes.position.needsUpdate = true;

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