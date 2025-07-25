import * as THREE from "https://unpkg.com/three@0.112/build/three.module.js";
 import { GLTFLoader } from "https://unpkg.com/three@0.112/examples/jsm/loaders/GLTFLoader.js";
 import { OrbitControls } from "https://unpkg.com/three@0.112/examples/jsm/controls/OrbitControls.js";
 import * as CANNON from "https://unpkg.com/cannon-es@0.18.0/dist/cannon-es.js";


 const scene = new THREE.Scene();


 const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
 );


 camera.position.set(0, 15, 40);
 camera.lookAt(0, 0, 0);

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
 controls.minDistance = 20;
 controls.maxDistance = 100;
 controls.maxPolarAngle = Math.PI / 2;


 const textureLoader = new THREE.TextureLoader();
 textureLoader.load("assets/imagem-rua/cenario-filme.jpg", function (texture) {
  scene.background = texture;
 });


 // --- Início da Seção de Física ---


 const world = new CANNON.World();
 world.gravity.set(0, -9.82, 0);


 const groundMaterial = new CANNON.Material("groundMaterial");
 const hamburgerMaterial = new CANNON.Material("hamburgerMaterial");
 const trayMaterial = new CANNON.Material("trayMaterial");


 const groundHamburgerContactMaterial = new CANNON.ContactMaterial(
  groundMaterial,
  hamburgerMaterial,
  { friction: 0.8, restitution: 0.3 }
 );
 world.addContactMaterial(groundHamburgerContactMaterial);

 const trayHamburgerContactMaterial = new CANNON.ContactMaterial(
  trayMaterial,
  hamburgerMaterial,
  { friction: 1.0, restitution: 0.1 }
 );
 world.addContactMaterial(trayHamburgerContactMaterial);


 const groundBody = new CANNON.Body({
  mass: 0,
  shape: new CANNON.Plane(),
  material: groundMaterial,
 });
 groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
 world.addBody(groundBody);

 // --- Fim da Seção do Chão ---

 const textureLoaderbandeja = new THREE.TextureLoader();
 const bandejaTextura = textureLoaderbandeja.load("assets/balde-pegar/textures/Plastic_Bucket_baseColor.png");
 const bandeja = new THREE.Group();
 const bandejaMaterialVisual = new THREE.MeshStandardMaterial({ map: bandejaTextura });


 const baseGeo = new THREE.BoxGeometry(15, 1, 8);
 const base = new THREE.Mesh(baseGeo, bandejaMaterialVisual);
 bandeja.add(base);


 const paredeTrasGeo = new THREE.BoxGeometry(15, 5, 1);
 const paredeTras = new THREE.Mesh(paredeTrasGeo, bandejaMaterialVisual);
 paredeTras.position.set(0, 3, -3.5);
 bandeja.add(paredeTras);


 const paredeLadoGeo = new THREE.BoxGeometry(1, 5, 8);
 const paredeEsquerda = new THREE.Mesh(paredeLadoGeo, bandejaMaterialVisual);
 paredeEsquerda.position.set(-7, 3, 0);
 bandeja.add(paredeEsquerda);


 const paredeDireita = new THREE.Mesh(paredeLadoGeo, bandejaMaterialVisual);
 paredeDireita.position.set(7, 3, 0);
 bandeja.add(paredeDireita);


 bandeja.position.set(0, 0.5, 1);
 scene.add(bandeja);


 const bandejaBody = new CANNON.Body({
  mass: 0,
  material: trayMaterial,
 });


 const baseShape = new CANNON.Box(new CANNON.Vec3(15 / 2, 1 / 2, 8 / 2));
 const paredeTrasShape = new CANNON.Box(new CANNON.Vec3(15 / 2, 5 / 2, 1 / 2));
 const paredeLadoShape = new CANNON.Box(new CANNON.Vec3(1 / 2, 5 / 2, 8 / 2));


 bandejaBody.addShape(baseShape, new CANNON.Vec3(0, 0, 0));
 bandejaBody.addShape(paredeTrasShape, new CANNON.Vec3(0, 3, -3.5));
 bandejaBody.addShape(paredeLadoShape, new CANNON.Vec3(-7, 3, 0));
 bandejaBody.addShape(paredeLadoShape, new CANNON.Vec3(7, 3, 0));


 bandejaBody.position.copy(bandeja.position);
 world.addBody(bandejaBody);


 const hamburguers = [];
 const hamburgerGeo = new THREE.CylinderGeometry(2, 2, 1.5, 32);
 const hamburgerMaterialVisual = new THREE.MeshStandardMaterial({ color: 0x8B4513 });


 function criarHamburguer() {
  const hamburgerMesh = new THREE.Mesh(hamburgerGeo, hamburgerMaterialVisual);
  const hamburgerShape = new CANNON.Cylinder(2, 2, 1.5, 32);
  const hamburgerBody = new CANNON.Body({
  mass: 0.5,
  shape: hamburgerShape,
  material: hamburgerMaterial,
  });


  hamburgerBody.position.x = (Math.random() - 0.5) * 50;
  hamburgerBody.position.y = 40;
  hamburgerBody.position.z = (Math.random() - 0.5) * 10;


  hamburgerMesh.position.copy(hamburgerBody.position);
  hamburgerMesh.quaternion.copy(hamburgerBody.quaternion);


  hamburgerBody.addEventListener("collide", (event) => {
  if (event.body === bandejaBody) {
  console.log("Hambúrguer coletado!");
  scene.remove(hamburgerMesh);
  world.removeBody(hamburgerBody);
  // Futuramente, remover do array 'hamburguers'
  }
  });


  world.addBody(hamburgerBody);
  scene.add(hamburgerMesh);
  hamburguers.push({ mesh: hamburgerMesh, body: hamburgerBody });
 }


 setInterval(criarHamburguer, 2000);


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


 window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
  controlesDoMouseAtivos = !controlesDoMouseAtivos;
  }
 });


 window.addEventListener('mousemove', moveBandeja);


 const clock = new THREE.Clock();


 function animate() {
  requestAnimationFrame(animate);


  const deltaTime = clock.getDelta();
  world.step(1 / 60, deltaTime);


  bandejaBody.position.copy(bandeja.position);


  for (const obj of hamburguers) {
  if (obj.body.world) {
  obj.mesh.position.copy(obj.body.position);
  obj.mesh.quaternion.copy(obj.body.quaternion);
  }
  }


  controls.update();
  renderer.render(scene, camera);
 }


 animate();


 window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
 });