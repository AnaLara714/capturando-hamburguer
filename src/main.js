import * as THREE from "https://unpkg.com/three@0.112/build/three.module.js";
import { GLTFLoader } from "https://unpkg.com/three@0.112/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://unpkg.com/three@0.112/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(0, 15, 40);
camera.lookAt(0, 60, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.style.margin = 0;
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true; 
controls.dampingFactor = 0.05;

controls.enablePan = false;
controls.minDistance = 50; 
controls.maxDistance = 200; 
controls.maxPolarAngle = Math.PI / 2;


const textureLoader = new THREE.TextureLoader();
textureLoader.load("assets/imagem-rua/cenario-filme.jpg", function (texture) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = texture.image.width;
  canvas.height = texture.image.height;

  context.drawImage(texture.image, 0, 0);

  context.fillStyle = "rgba(0, 0, 0, 0.5)"; 
  context.fillRect(0, 0, canvas.width, canvas.height);

  const darkTexture = new THREE.Texture(canvas);
  darkTexture.needsUpdate = true;

  scene.background = darkTexture;
});


// const loader = new GLTFLoader();
// loader.load(
//   "assets/balde-pegar/scene.gltf",
//   function (gltf) {
//       const bucket = gltf.scene;
//       bucket.scale.set(30, 30, 30);
//       bucket.position.set(0, 14, 0);
//       bucket.rotation.y = Math.PI;
//     scene.add(bucket);
//   },
//   undefined,
//   function (error) {
//     console.error("Erro ao carregar o modelo GLTF:", error);
//   }
// );

const textureLoaderbandeja = new THREE.TextureLoader();
const bandejaTextura = textureLoaderbandeja.load("assets/balde-pegar/textures/Plastic_Bucket_baseColor.png");
const bandeja = new THREE.Group();
const bandejaMaterial = new THREE.MeshStandardMaterial({ map: bandejaTextura });
        
const baseGeo = new THREE.BoxGeometry(15, 1, 8);
const base = new THREE.Mesh(baseGeo, bandejaMaterial);
bandeja.add(base);

const paredeTrasGeo = new THREE.BoxGeometry(15, 5, 1);
const paredeTras = new THREE.Mesh(paredeTrasGeo, bandejaMaterial);
paredeTras.position.set(0, 3, -3.5);
bandeja.add(paredeTras);

const paredeLadoGeo = new THREE.BoxGeometry(1, 5, 8);
const paredeEsquerda = new THREE.Mesh(paredeLadoGeo, bandejaMaterial);
paredeEsquerda.position.set(-7, 3, 0);
bandeja.add(paredeEsquerda);
        
const paredeDireita = new THREE.Mesh(paredeLadoGeo, bandejaMaterial);
paredeDireita.position.set(7, 3, 0);
bandeja.add(paredeDireita);
        
bandeja.position.set(0, -20, 1);
scene.add(bandeja);

// controle da bandeja com o mouse //
let controlesDoMouseAtivos = true;

function moveBandeja(event) {
  if (!controlesDoMouseAtivos) {
    return;
  }
  const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  const vector = new THREE.Vector3(mouseX, 0, 0.5);
  vector.unproject(camera);
  const dir = vector.sub(camera.position).normalize();
  const distance = -camera.position.z / dir.z;
  const pos = camera.position.clone().add(dir.multiplyScalar(distance));
  const limiteHorizontal = 35;
  bandeja.position.x = THREE.Math.clamp(pos.x, -limiteHorizontal, limiteHorizontal);
}

// se apertar esc a bandeja para de seguir o mouse //
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
  controlesDoMouseAtivos = !controlesDoMouseAtivos;
  const infoElement = document.getElementById('info');
  if (controlesDoMouseAtivos) {
    infoElement.textContent = "Mova o mouse para controlar a bandeja e pressione ESC para pausar)";
  } else {
    infoElement.textContent = "Controle pausado, pressione ESC para retomar.";
    }
  }
});

window.addEventListener('mousemove', moveBandeja);

function animate() {
  requestAnimationFrame(animate);
   controls.update();
  renderer.render(scene, camera);
}

animate();

// responsividade // 
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
