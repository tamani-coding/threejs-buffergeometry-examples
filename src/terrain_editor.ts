import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export function terrain_editor() {
    // SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa8def0);

    // CAMERA
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.y = 25;
    camera.position.z = 50;
    camera.position.x = -50;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true

    // CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target = new THREE.Vector3(0, 0, -25);
    controls.update();

    // AMBIENT LIGHT
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    // DIRECTIONAL LIGHT
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0)
    dirLight.position.x += 40
    dirLight.position.y += 60
    dirLight.position.z = -40
    dirLight.castShadow = true
    dirLight.shadow.mapSize.width = 4096;
    dirLight.shadow.mapSize.height = 4096;
    const d = 100;
    dirLight.shadow.camera.left = - d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = - d;

    let target = new THREE.Object3D();
    target.position.z = -20;
    dirLight.target = target;
    dirLight.target.updateMatrixWorld();

    dirLight.shadow.camera.lookAt(0, 0, -30);
    scene.add(dirLight);
    // scene.add(new THREE.CameraHelper(dirLight.shadow.camera));

    // TEXTURES
    const textureLoader = new THREE.TextureLoader();

    const soilBaseColor = textureLoader.load("./textures/soil/Rock_Moss_001_basecolor.jpg");
    const soilNormalMap = textureLoader.load("./textures/soil/Rock_Moss_001_normal.jpg");
    const soilHeightMap = textureLoader.load("./textures/soil/Rock_Moss_001_height.png");
    const soilRoughness = textureLoader.load("./textures/soil/Rock_Moss_001_roughness.jpg");
    const soilAmbientOcclusion = textureLoader.load("./textures/soil/Rock_Moss_001_ambientOcclusion.jpg");

    // PLANE
    const WIDTH = 100;
    const HEIGHT = 100;
    const geometry = new THREE.PlaneBufferGeometry(WIDTH, HEIGHT, 300, 300);
    const plane = new THREE.Mesh(geometry,
        new THREE.MeshStandardMaterial({
            map: soilBaseColor,
            normalMap: soilNormalMap,
            displacementMap: soilHeightMap, displacementScale: 2,
            roughnessMap: soilRoughness, roughness: 0,
            aoMap: soilAmbientOcclusion
        }));
    plane.receiveShadow = true;
    plane.castShadow = true;
    plane.rotation.x = - Math.PI / 2;
    plane.position.z = - 30;
    scene.add(plane);

    // CLICK EVENT
    const raycaster = new THREE.Raycaster(); // create once
    const clickMouse = new THREE.Vector2();  // create once
    const vector3 = new THREE.Vector3();   // create once
    const MAX_CLICK_DISTANCE = 10
    window.addEventListener('click', event => {

        // THREE RAYCASTER
        clickMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        clickMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(clickMouse, camera);
        const found = raycaster.intersectObjects(scene.children);
        if (found.length > 0 && (found[0].object as THREE.Mesh).geometry) {
            const mesh = found[0].object as THREE.Mesh
            const geometry = mesh.geometry
            const point = found[0].point

            for (let i = 0; i  < geometry.attributes.position.count; i++) {
                vector3.setX(geometry.attributes.position.getX(i))
                vector3.setY(geometry.attributes.position.getY(i))
                vector3.setZ(geometry.attributes.position.getZ(i))
                const toWorld = mesh.localToWorld(vector3)

                const distance = point.distanceTo(toWorld)
                if (distance < MAX_CLICK_DISTANCE) {
                    geometry.attributes.position.setZ(i, geometry.attributes.position.getZ(i) + (MAX_CLICK_DISTANCE - distance) / 2)
                }
            }
            geometry.computeVertexNormals()
            geometry.attributes.position.needsUpdate = true
        }
    })

    // ANIMATE
    function animate() {
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