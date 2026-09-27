let scene, camera, renderer;
let carGroup;
let roadSegments = [];
let trees = [];
let buildings = [];
let roadLength = 600;
let speed = 0.4;

window.onload = function () {
    init();
    animate();
};

function init() {
    const container = document.getElementById('canvas-container');

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.FogExp2(0x87CEEB, 0.003);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 12);
    camera.lookAt(0, 1, -10);

    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
    sunLight.position.set(50, 100, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 300;
    const d = 50;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    scene.add(sunLight);

    createEnvironment();
    createCar();

    window.addEventListener('resize', onWindowResize);
}

function createEnvironment() {
    const groundGeo = new THREE.PlaneGeometry(1000, roadLength * 2);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x228B22 }); // Vibrant daytime green
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.z = -roadLength / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const roadWidth = 16;
    const roadGeo = new THREE.PlaneGeometry(roadWidth, roadLength * 2);
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x334155 }); // Dark asphalt
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.05, -roadLength / 2);
    road.receiveShadow = true;
    scene.add(road);

    const lineMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    for (let i = 0; i > -roadLength * 2; i -= 8) {
        const lineGeo = new THREE.PlaneGeometry(0.4, 4);
        const line = new THREE.Mesh(lineGeo, lineMat);
        line.rotation.x = -Math.PI / 2;
        line.position.set(0, 0.08, i);
        scene.add(line);
        roadSegments.push(line);
    }

    const cityGroup = new THREE.Group();
    scene.add(cityGroup);

    const buildingColors = [0x1a233a, 0x222b45, 0x111625, 0x2a3556];

    for (let i = 0; i < 60; i++) {
        const bWidth = 8 + Math.random() * 14;
        const bHeight = 25 + Math.random() * 65;
        const bDepth = 8 + Math.random() * 14;

        const bGeo = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
        const bMat = new THREE.MeshLambertMaterial({
            color: buildingColors[Math.floor(Math.random() * buildingColors.length)]
        });

        const building = new THREE.Mesh(bGeo, bMat);
        building.castShadow = true;
        building.receiveShadow = true;

        const side = Math.random() > 0.5 ? 1 : -1;
        const xPos = side * (24 + Math.random() * 50);
        const zPos = -Math.random() * roadLength;
        building.position.set(xPos, bHeight / 2 - 5, zPos);
        cityGroup.add(building);
        buildings.push({ mesh: building, z: zPos, roadLength: roadLength, side: side, xRange: [24, 74] });

    }



}

function createCar() {
    carGroup = new THREE.Group();

    const bodyGeo = new THREE.BoxGeometry(1.8, 0.4, 4.2);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xcc2323 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.5;
    body.castShadow = true;
    body.receiveShadow = true;
    carGroup.add(body);

    const cabinGeo = new THREE.BoxGeometry(1.4, 0.85, 2.0);
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 0.85, 0.8);
    cabin.castShadow = true;
    carGroup.add(cabin);

    const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x222222 });

    const wheelPositions = [
        [-1.0, 0.35, 1.3],
        [1.0, 0.35, 1.3],
        [-1.0, 0.35, -1.3],
        [1.0, 0.35, -1.3],
    ];

    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.position.set(...pos);
        wheel.castShadow = true;
        carGroup.add(wheel);

    });

    scene.add(carGroup);

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    roadSegments.forEach(line => {
        line.position.z += speed;
        if (line.position.z > 5) {
            line.position.z -= roadLength;
        }
    });

    buildings.forEach(item => {
        item.z += speed;
        if (item.z > 10) {
            item.z -= roadLength;
            const side = Math.random() > 0.5 ? 1 : -1;
            item.side = side;
            item.mesh.position.x = side * (item.xRange[0] + Math.random() * (item.xRange[1] - item.xRange[0]));
        }
        item.mesh.position.z = item.isNeon ? item.z + item.zOffset : item.z;
    });

    carGroup.position.y = Math.sin(Date.now() * 0.015) * 0.04;
    carGroup.rotation.z = Math.sin(Date.now() * 0.005) * 0.005;


    renderer.render(scene, camera);
}



