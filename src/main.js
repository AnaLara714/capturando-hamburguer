import * as THREE from "https://unpkg.com/three@0.112/build/three.module.js";
import { GLTFLoader } from "https://unpkg.com/three@0.112/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://unpkg.com/three@0.112/examples/jsm/controls/OrbitControls.js";
import * as CANNON from "https://unpkg.com/cannon-es@0.18.0/dist/cannon-es.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 15, 40);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.style.margin = 0;
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

const textureLoader = new THREE.TextureLoader();
textureLoader.load("assets/imagem-rua/cenario-filme.jpg", function (texture) {
  scene.background = texture;
});

const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

const groundMaterial = new CANNON.Material("groundMaterial");
const hamburgerMaterial = new CANNON.Material("hamburgerMaterial");
const trayMaterial = new CANNON.Material("trayMaterial");

world.addContactMaterial(new CANNON.ContactMaterial(groundMaterial, hamburgerMaterial, { friction: 0.8, restitution: 0.3 }));
world.addContactMaterial(new CANNON.ContactMaterial(trayMaterial, hamburgerMaterial, { friction: 1.0, restitution: 0.1 }));

const groundBody = new CANNON.Body({ mass: 0, shape: new CANNON.Plane(), material: groundMaterial });
groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
world.addBody(groundBody);

const bandeja = new THREE.Group();
const loaderBandeja = new GLTFLoader();

loaderBandeja.load('assets/balde-pegar/scene.gltf', (gltf) => {
    const model = gltf.scene;
    model.scale.set(7, 7, 7);
    model.traverse(child => {
        if (child.isMesh) {
            child.castShadow = true;
        }
    });
    bandeja.add(model);
});
scene.add(bandeja);

const bandejaShape = new CANNON.Box(new CANNON.Vec3(10.5, 3.5, 5.6));
const bandejaBody = new CANNON.Body({ mass: 0, shape: bandejaShape, material: trayMaterial });
world.addBody(bandejaBody);

const hamburgerTypes = [
  { 
    type: 'normal', 
    points: 10, 
    modelPath: 'assets/pontos-normais-hamburguer/scene.gltf',
    scale: 0.8
  },
  { 
    type: 'especial_mais', 
    points: 25, 
    modelPath: 'assets/pontos-altos-hamburguer/scene.gltf',
    scale: 1
  },
  { 
    type: 'especial_menos', 
    points: 5, 
    modelPath: 'assets/pontos-baixos-hamburguer/scene.gltf',
    scale: 15
  },
  { 
    type: 'penalidade', 
    points: -10, 
    modelPath: 'assets/desconta-pontos-hamburguer/scene.gltf',
    scale: 0.030
  }
];

const gltfLoader = new GLTFLoader();
const loadedModels = {};
const hamburguers = [];
const objectsToRemove = [];

function loadModel(typeInfo) {
  return new Promise((resolve, reject) => {
    gltfLoader.load(typeInfo.modelPath, (gltf) => {
      loadedModels[typeInfo.type] = gltf.scene;
      resolve();
    }, undefined, reject);
  });
}

Promise.all(hamburgerTypes.map(type => loadModel(type)))
  .then(() => {
    console.log("Todos os modelos de hambúrguer foram carregados com sucesso!");
    startGame();
  })
  .catch(error => {
    console.error("Erro ao carregar um ou mais modelos:", error);
  });

function criarHamburguer(typeInfo) {
  const model = loadedModels[typeInfo.type].clone();
  const scale = typeInfo.scale;
  model.scale.set(scale, scale, scale);

  const hamburgerShape = new CANNON.Cylinder(2, 2, 1.5, 16);
  const hamburgerBody = new CANNON.Body({ mass: 0.5, shape: hamburgerShape, material: hamburgerMaterial });

  hamburgerBody.position.x = (Math.random() - 0.5) * 70;
  hamburgerBody.position.y = 40;
  hamburgerBody.position.z = (Math.random() - 0.5) * 6 + 1;
  
  model.position.copy(hamburgerBody.position);
  model.quaternion.copy(hamburgerBody.quaternion);

  model.userData.body = hamburgerBody;
  
  hamburgerBody.addEventListener("collide", (event) => {
    const hamburguerObject = hamburguers.find(h => h.body === hamburgerBody);
    if (!hamburguerObject) return;

    if (event.body === bandejaBody) {
        if (!objectsToRemove.includes(hamburguerObject)) {
            objectsToRemove.push(hamburguerObject);
        }
    } else if (event.body === groundBody) {
        if (!hamburguerObject.deathTimestamp) {
            hamburguerObject.deathTimestamp = Date.now();
        }
    }
  });

  world.addBody(hamburgerBody);
  scene.add(model);
  
  hamburguers.push({ mesh: model, body: hamburgerBody, typeInfo: typeInfo, deathTimestamp: null });
}

function startGame() {
  setInterval(() => {
    const randomIndex = Math.floor(Math.random() * hamburgerTypes.length);
    const randomHamburgerType = hamburgerTypes[randomIndex];
    criarHamburguer(randomHamburgerType);
  }, 1000);
}

function moveBandeja(event) {
  const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  const vector = new THREE.Vector3(mouseX, 0, 0.5);
  vector.unproject(camera);
  const dir = vector.sub(camera.position).normalize();
  const distance = -camera.position.z / dir.z;
  const pos = camera.position.clone().add(dir.multiplyScalar(distance));
  const limiteHorizontal = 35;
  
  bandeja.position.x = THREE.Math.clamp(pos.x, -limiteHorizontal, limiteHorizontal);
}
window.addEventListener('mousemove', moveBandeja);

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();
  const now = Date.now();

  world.step(1 / 60, deltaTime);

  for (const obj of hamburguers) {
    if (obj.deathTimestamp && now - obj.deathTimestamp > 500) {
        if (!objectsToRemove.includes(obj)) {
            objectsToRemove.push(obj);
        }
    }
  }

  for (const obj of objectsToRemove) {
    scene.remove(obj.mesh);
    world.removeBody(obj.body);
    const index = hamburguers.indexOf(obj);
    if (index !== -1) {
      hamburguers.splice(index, 1);
    }
  }
  objectsToRemove.length = 0;

  bandejaBody.position.copy(bandeja.position);
  bandejaBody.position.y = 1;

  for (const obj of hamburguers) {
    obj.mesh.position.copy(obj.body.position);
    obj.mesh.quaternion.copy(obj.body.quaternion);
  }

  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
