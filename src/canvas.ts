import { ColliderDesc, RigidBodyDesc, World } from '@dimforge/rapier3d';
import {
  AxesHelper,
  BufferAttribute,
  BufferGeometry,
  Color,
  LineBasicMaterial,
  LineSegments,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  Timer,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import './style.css';

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};
const gravity = { x: 0, y: 0, z: 0 };

const el = document.querySelector('#root');

const accents = ['#ff4060', '#ffcc00', '#20ffa0', '#4060ff'];

const shuffle = (accent = 0) => [
  { color: '#444', roughness: 0.1, metalness: 0.5 },
  { color: '#444', roughness: 0.1, metalness: 0.5 },
  { color: '#444', roughness: 0.1, metalness: 0.5 },
  { color: 'white', roughness: 0.1, metalness: 0.1 },
  { color: 'white', roughness: 0.1, metalness: 0.1 },
  { color: 'white', roughness: 0.1, metalness: 0.1 },
  { color: accents[accent], roughness: 0.1, accent: true },
  { color: accents[accent], roughness: 0.1, accent: true },
  { color: accents[accent], roughness: 0.1, accent: true },
  { color: '#444', roughness: 0.1 },
  { color: '#444', roughness: 0.3 },
  { color: '#444', roughness: 0.3 },
  { color: 'white', roughness: 0.1 },
  { color: 'white', roughness: 0.2 },
  { color: 'white', roughness: 0.1 },
  { color: accents[accent], roughness: 0.1, accent: true, transparent: true, opacity: 0.5 },
  { color: accents[accent], roughness: 0.3, accent: true },
  { color: accents[accent], roughness: 0.1, accent: true },
];

const renderer = new WebGLRenderer({
  antialias: true,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
renderer.shadowMap.enabled = true;
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color('#141622');

const camera = new PerspectiveCamera(17.56, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(0, 0, 30);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const timer = new Timer();

// World
let accent = 0;

const world = new World(gravity);
const debug = new LineSegments(new BufferGeometry(), new LineBasicMaterial());
debug.frustumCulled = false;
scene.add(debug);

const sphereGeometry = new SphereGeometry(1, 64, 64);
const sphereMaterial = new MeshBasicMaterial({ color: accents[0] });
const sphere = new Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);

const ballRigidBodyDesc = RigidBodyDesc.dynamic();
const ballRigidBody = world.createRigidBody(ballRigidBodyDesc);

const ballColliderDesc = ColliderDesc.ball(1.03);
ballColliderDesc.setRestitution(0.856);
world.createCollider(ballColliderDesc, ballRigidBody);

const axesHelper = new AxesHelper(5);
scene.add(axesHelper);

// Events

function updateDebug() {
  const { vertices, colors } = world.debugRender();

  debug.geometry.setAttribute('position', new BufferAttribute(vertices, 3));
  debug.geometry.setAttribute('color', new BufferAttribute(colors, 4));
}

const c = new Color();

function updateSphere(delta: number) {
  sphere.position.copy(ballRigidBody.translation());
  sphere.quaternion.copy(ballRigidBody.rotation());

  c.set(accents[accent]);

  sphere.material.color.r = MathUtils.damp(sphere.material.color.r, c.r, 6, delta);
  sphere.material.color.g = MathUtils.damp(sphere.material.color.g, c.g, 6, delta);
  sphere.material.color.b = MathUtils.damp(sphere.material.color.b, c.b, 6, delta);
}

function click() {
  accent = ++accent % accents.length;
}

function render() {
  // Update
  timer.update();

  const delta = timer.getDelta();

  world.step();
  controls.update();

  updateSphere(delta);
  // Render
  updateDebug();
  renderer.render(scene, camera);
  //Animation
  requestAnimationFrame(render);
}

render();

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  renderer.setSize(sizes.width, sizes.height);

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
});

window.addEventListener('pointerdown', click);
