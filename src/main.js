import * as THREE from "https://unpkg.com/three@0.112/build/three.module.js";
import { GLTFLoader } from "https://unpkg.com/three@0.112/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://unpkg.com/three@0.112/examples/jsm/controls/OrbitControls.js";
import * as CANNON from "https://unpkg.com/cannon-es@0.18.0/dist/cannon-es.js";
import * as dat from "https://cdn.jsdelivr.net/npm/dat.gui@0.7.9/build/dat.gui.module.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 20, 30);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.style.margin = 0;
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 15, 10);
directionalLight.castShadow = true;
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffff, 1, 30);
pointLight.position.set(0, 5, 10);
scene.add(pointLight);

const textureLoader = new THREE.TextureLoader();
textureLoader.load("assets/imagem-rua/cenario-filme.jpg", function (texture) {
  scene.background = texture;
});

const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;
controls.minDistance = 20;
controls.maxDistance = 60;
controls.maxPolarAngle = Math.PI / 2.2;
controls.minPolarAngle = Math.PI / 3;
controls.minAzimuthAngle = -Math.PI / 6;
controls.maxAzimuthAngle = Math.PI / 6;
controls.enablePan = false;

const hudControls = {
  gravidade: 9.82,
  frequenciaQueda: 10,
};

const world = new CANNON.World();
world.gravity.set(0, -hudControls.gravidade, 0);

const gui = new dat.GUI();

gui
  .add(hudControls, "gravidade", 1, 25)
  .name("Gravidade")
  .onChange((value) => {
    world.gravity.set(0, -value, 0);
  });

gui
  .add(hudControls, "frequenciaQueda", 1, 30)
  .step(1)
  .name("Frequência (x100ms)")
  .onChange((value) => {
    const intervaloReal = value * 100; // Converte para milissegundos
    clearInterval(spawnInterval);
    spawnInterval = setInterval(() => {
      if (jogoAtivo) {
        const randomType =
          hamburgerTypes[Math.floor(Math.random() * hamburgerTypes.length)];
        criarHamburguer(randomType);
      }
    }, intervaloReal); // Usa o valor convertido
  });

const groundMaterial = new CANNON.Material("groundMaterial");
const hamburgerMaterial = new CANNON.Material("hamburgerMaterial");
const trayMaterial = new CANNON.Material("trayMaterial");

world.addContactMaterial(
  new CANNON.ContactMaterial(groundMaterial, hamburgerMaterial, {
    friction: 0.8,
    restitution: 0.3,
  })
);

world.addContactMaterial(
  new CANNON.ContactMaterial(trayMaterial, hamburgerMaterial, {
    friction: 1.0,
    restitution: 0.1,
  })
);

const groundBody = new CANNON.Body({
  mass: 0,
  shape: new CANNON.Plane(),
  material: groundMaterial,
});

groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
world.addBody(groundBody);

const bandeja = new THREE.Group();
const loaderBandeja = new GLTFLoader();
loaderBandeja.load("assets/balde-pegar/scene.gltf", (gltf) => {
  const model = gltf.scene;
  model.scale.set(7, 7, 7);
  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
    child.receiveShadow = true;
    }
  });
  bandeja.add(model);
});
scene.add(bandeja);

const bandejaShape = new CANNON.Box(new CANNON.Vec3(10.5, 3.5, 5.6));
const bandejaBody = new CANNON.Body({
  mass: 0,
  shape: bandejaShape,
  material: trayMaterial,
});
world.addBody(bandejaBody);

let score = 0;
const scoreElement = document.createElement("div");
scoreElement.style.position = "absolute";
scoreElement.style.top = "20px";
scoreElement.style.left = "20px";
scoreElement.style.color = "white";
scoreElement.style.fontSize = "27px";
scoreElement.style.fontFamily = "Arial, sans-serif";
scoreElement.innerText = "Pontos: 0";
document.body.appendChild(scoreElement);

// === INTERFACE DE TEMPO ===
let tempoRestante = 60;
const tempoElement = document.createElement("div");
tempoElement.style.position = "absolute";
tempoElement.style.top = "60px";
tempoElement.style.left = "20px";
tempoElement.style.color = "white";
tempoElement.style.fontSize = "27px";
tempoElement.style.fontFamily = "Arial, sans-serif";
tempoElement.innerText = "Tempo: 60s";
document.body.appendChild(tempoElement);

// === TELA DE FIM DE JOGO ===
const gameOverScreen = document.createElement("div");
gameOverScreen.style.position = "absolute";
gameOverScreen.style.top = "0";
gameOverScreen.style.left = "0";
gameOverScreen.style.width = "100%";
gameOverScreen.style.height = "100%";
gameOverScreen.style.backgroundColor = "rgba(0, 0, 0, 0.75)";
gameOverScreen.style.color = "white";
gameOverScreen.style.display = "none";
gameOverScreen.style.justifyContent = "center";
gameOverScreen.style.alignItems = "center";
gameOverScreen.style.flexDirection = "column";
gameOverScreen.style.fontFamily = "Arial, sans-serif";
gameOverScreen.style.textAlign = "center";
gameOverScreen.style.cursor = "pointer";
gameOverScreen.innerHTML = `
    <h1 style="font-size: 4em; margin: 0;">Fim de Jogo</h1>
    <p style="font-size: 1.5em;">Sua pontuação final foi:</p>
    <p id="finalScore" style="font-size: 3em; color: #ffc107; margin: 20px 0;"></p>
    <p style="font-size: 1.2em; margin-top: 40px;">Clique em qualquer lugar para reiniciar</p>
`;
document.body.appendChild(gameOverScreen);

gameOverScreen.addEventListener("click", () => {
  location.reload();
});

function mostrarTelaFimDeJogo(pontuacaoFinal) {
  document.getElementById("finalScore").innerText = pontuacaoFinal;
  gameOverScreen.style.display = "flex";
}

let jogoAtivo = true;

function atualizarCronometro() {
  if (!jogoAtivo) return;

  tempoRestante--;
  tempoElement.innerText = "Tempo: " + tempoRestante + "s";

  if (tempoRestante <= 0) {
    jogoAtivo = false;
    tempoElement.innerText = "Tempo esgotado!";
    mostrarTelaFimDeJogo(score);
  }
}

setInterval(atualizarCronometro, 1000);

let audioGanha = new Audio("assets/sounds/ganhar.mp3");
let audioPerde = new Audio("assets/sounds/perder.mp3");

const hamburgerTypes = [
  {
    type: "normal",
    points: 10,
    modelPath: "assets/pontos-normais-hamburguer/scene.gltf",
    scale: 0.8,
  },
  {
    type: "especial_mais",
    points: 25,
    modelPath: "assets/pontos-altos-hamburguer/scene.gltf",
    scale: 1,
  },
  {
    type: "especial_menos",
    points: 5,
    modelPath: "assets/pontos-baixos-hamburguer/scene.gltf",
    scale: 15,
  },
  {
    type: "penalidade",
    points: -10,
    modelPath: "assets/desconta-pontos-hamburguer/scene.gltf",
    scale: 0.03,
  },
];

const gltfLoader = new GLTFLoader();
const loadedModels = {};
const hamburguers = [];
const objectsToRemove = [];

function loadModel(typeInfo) {
  return new Promise((resolve, reject) => {
    gltfLoader.load(
      typeInfo.modelPath,
      (gltf) => {
        loadedModels[typeInfo.type] = gltf.scene;
        resolve();
      },
      undefined,
      reject
    );
  });
}

Promise.all(hamburgerTypes.map((type) => loadModel(type)))
  .then(() => {
    console.log("Todos os modelos de hambúrguer foram carregados com sucesso!");
    startGame();
  })
  .catch((error) => {
    console.error("Erro ao carregar um ou mais modelos:", error);
  });

function criarHamburguer(typeInfo) {
  if (!jogoAtivo) return;

  const model = loadedModels[typeInfo.type].clone();
  const scale = typeInfo.scale;
  model.scale.set(scale, scale, scale);

  if (typeInfo.type === "penalidade") {
  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;

      child.material = child.material.clone();

      if (child.material.color) {
        child.material.color.multiplyScalar(2);
      }
    }
  });
}

  const hamburgerShape = new CANNON.Cylinder(2, 2, 1.5, 16);
  const hamburgerBody = new CANNON.Body({
    mass: 0.5,
    shape: hamburgerShape,
    material: hamburgerMaterial,
  });

  hamburgerBody.position.x = (Math.random() - 0.5) * 70;
  hamburgerBody.position.y = 40;
  hamburgerBody.position.z = (Math.random() - 0.5) * 6 + 1;

  model.position.copy(hamburgerBody.position);
  model.quaternion.copy(hamburgerBody.quaternion);

  model.userData.body = hamburgerBody;

  let contabilizado = false;

  hamburgerBody.addEventListener("collide", (event) => {
    const hamburguerObject = hamburguers.find((h) => h.body === hamburgerBody);
    if (!hamburguerObject) return;

    if (event.body === bandejaBody && !contabilizado) {
      contabilizado = true;
      score += hamburguerObject.typeInfo.points;
      scoreElement.innerText = "Pontos: " + score;

      if (!objectsToRemove.includes(hamburguerObject)) {
        objectsToRemove.push(hamburguerObject);
      }

      if (hamburguerObject.typeInfo.points > 0) {
        audioGanha.currentTime = 0;
        audioGanha.play();
      } else if (hamburguerObject.typeInfo.points < 0) {
        audioPerde.currentTime = 0;
        audioPerde.play();
      }
    } else if (event.body === groundBody) {
      if (!hamburguerObject.deathTimestamp) {
        hamburguerObject.deathTimestamp = Date.now();
      }
    }
  });

  world.addBody(hamburgerBody);
  scene.add(model);

  hamburguers.push({
    mesh: model,
    body: hamburgerBody,
    typeInfo: typeInfo,
    deathTimestamp: null,
  });
}

let spawnInterval;
function startGame() {
  // Inicia o intervalo usando o valor inicial convertido
  spawnInterval = setInterval(() => {
    if (jogoAtivo) {
      const randomType =
        hamburgerTypes[Math.floor(Math.random() * hamburgerTypes.length)];
      criarHamburguer(randomType);
    }
  }, hudControls.frequenciaQueda * 100);
}

function moveBandeja(event) {
  const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  const vector = new THREE.Vector3(mouseX, 0, 0.5);
  vector.unproject(camera);
  const dir = vector.sub(camera.position).normalize();
  const distance = -camera.position.z / dir.z;
  const pos = camera.position.clone().add(dir.multiplyScalar(distance));
  const limiteHorizontal = 35;

  bandeja.position.x = THREE.Math.clamp(
    pos.x,
    -limiteHorizontal,
    limiteHorizontal
  );
}
window.addEventListener("mousemove", moveBandeja);

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();
  const now = Date.now();

  if (jogoAtivo) {
    world.step(1 / 60, deltaTime);
  }

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

  controls.update(); // necessário para damping funcionar

  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
