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
    const geometry = new THREE.SphereBufferGeometry(6, 150, 150);
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
    
    const position = (geometry.attributes.position.array as Float32Array);
    const normals = (geometry.attributes.normal.array as Float32Array);
    const position_clone = JSON.parse(JSON.stringify(position)) as Float32Array;
    const normals_clone = JSON.parse(JSON.stringify(normals)) as Float32Array;
    const uvs = (geometry.attributes.uv.array as Float32Array);
    const damping = 0.2;
    const vector3 = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();

    // ANIMATE
    function animate() {
        const now = Date.now() / 200;

        // iterate all vertices
        for (let i = 0; i < count; i++) {
            // indices
            const ix = i * 3
            const iy = i * 3 + 1
            const iz = i * 3 + 2

            // normal vector
            const nX = normals_clone[ix];
            const nY = normals_clone[iy];
            const nZ = normals_clone[iz];

            // use uvs to calculate wave
            const uX = uvs[i * 2] * Math.PI * 16
            const uY = uvs[i * 2 + 1]  * Math.PI * 16

            // calculate wave height
            const xangle = (uX + now)
            const xsin = Math.sin(xangle) * damping
            const yangle = (uY + now)
            const ycos = Math.cos(yangle) * damping

            // apply wave height using original position & original normal vector
            position[ix] = position_clone[ix] + nX * (xsin + ycos);
            position[iy] = position_clone[iy] + nY * (xsin + ycos);
            position[iz] = position_clone[iz] + nZ * (xsin + ycos);

            // calculate normal vector of wave slopes
            const tsx = 1 / Math.sqrt(1 + Math.pow(Math.cos(xangle) * damping, 2))
            const tsy = Math.cos(xangle) * damping / Math.sqrt(1 + Math.pow(Math.cos(xangle) * damping, 2))
            const tcx = 1 / Math.sqrt(1 + Math.pow(Math.sin(yangle) * damping, 2))
            const tcy = Math.sin(yangle) * damping / Math.sqrt(1 + Math.pow(Math.sin(yangle) * damping, 2))

            // store normal vector in 3d vector 
            vector3.x = tsx
            vector3.y = 0
            vector3.z = -tsy
            vector3.y = tcx
            vector3.z += -tcy
            vector3.normalize()

            // create quarternion from wave normal vector
            quaternion.setFromAxisAngle(vector3, Math.PI * 2)

            // apply quarternion on original nromal vector
            vector3.x = normals_clone[ix]
            vector3.y = normals_clone[iy]
            vector3.z = normals_clone[iz]
            vector3.applyQuaternion(quaternion)

            // set new normal vector
            normals[ix] = vector3.x
            normals[iy] = vector3.y
            normals[iz] = vector3.z
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