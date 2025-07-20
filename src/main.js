import * as THREE from "https://unpkg.com/three@0.112/build/three.module.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x7aadff);

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

const floorGeometry = new THREE.BoxGeometry(180, 25, 47);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
const ground = new THREE.Mesh(floorGeometry, floorMaterial);

ground.rotation.x = -50;

ground.receiveShadow = true;
scene.add(ground);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
