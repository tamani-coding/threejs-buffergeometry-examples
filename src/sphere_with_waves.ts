import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export function sphere_with_waves() {
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
    const d = 10;
    dirLight.shadow.camera.left = - d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = - d;
    dirLight.position.z = -25;

    let target = new THREE.Object3D();
    target.position.z = -30;
    dirLight.target = target;
    dirLight.target.updateMatrixWorld();

    dirLight.shadow.camera.lookAt(0, 0, -30);
    scene.add(dirLight);
    // scene.add(new THREE.CameraHelper(dirLight.shadow.camera));


    // TEXTURES
    const textureLoader = new THREE.TextureLoader();

    const waterBaseColor = textureLoader.load("./textures/water/Water_002_COLOR.jpg");
    const waterNormalMap = textureLoader.load("./textures/water/Water_002_NORM.jpg");
    const waterHeightMap = textureLoader.load("./textures/water/Water_002_DISP.png");
    const waterRoughness = textureLoader.load("./textures/water/Water_002_ROUGH.jpg");
    const waterAmbientOcclusion = textureLoader.load("./textures/water/Water_002_OCC.jpg");

    // PLANE
    const geometry = new THREE.SphereBufferGeometry(6, 128, 128);
    const sphere = new THREE.Mesh(geometry,
        new THREE.MeshStandardMaterial({
            map: waterBaseColor,
            normalMap: waterNormalMap,
            displacementMap: waterHeightMap, displacementScale: 0.01,
            roughnessMap: waterRoughness, roughness: 0,
            aoMap: waterAmbientOcclusion
        }));
    sphere.receiveShadow = true;
    sphere.castShadow = true;
    sphere.rotation.x = - Math.PI / 4;
    sphere.position.z = - 30;
    scene.add(sphere);

    const count: number = geometry.attributes.position.count;
    
    const position_clone = JSON.parse(JSON.stringify(geometry.attributes.position.array)) as Float32Array;
    const normals_clone = JSON.parse(JSON.stringify(geometry.attributes.normal.array)) as Float32Array;
    const damping = 0.2;

    // ANIMATE
    function animate() {
        const now = Date.now() / 200;

        // iterate all vertices
        for (let i = 0; i < count; i++) {
            // indices
            const ix = i * 3
            const iy = i * 3 + 1
            const iz = i * 3 + 2

            // use uvs to calculate wave
            const uX = geometry.attributes.uv.getX(i) * Math.PI * 16
            const uY = geometry.attributes.uv.getY(i) * Math.PI * 16

            // calculate current vertex wave height
            const xangle = (uX + now)
            const xsin = Math.sin(xangle) * damping
            const yangle = (uY + now)
            const ycos = Math.cos(yangle) * damping

            // set new position
            geometry.attributes.position.setX(i, position_clone[ix] + normals_clone[ix] * (xsin + ycos))
            geometry.attributes.position.setY(i, position_clone[iy] + normals_clone[iy] * (xsin + ycos))
            geometry.attributes.position.setZ(i, position_clone[iz] + normals_clone[iz] * (xsin + ycos))
        }
        geometry.computeVertexNormals();
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