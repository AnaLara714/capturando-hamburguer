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

camera.position.set(0, 20, 100);
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


function animate() {
  requestAnimationFrame(animate);
   controls.update();
  renderer.render(scene, camera);
}

animate();
