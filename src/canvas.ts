import { Colors } from '@blueprintjs/colors';
import {
  AxesHelper,
  Color,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Raycaster,
  Scene,
  ShaderChunk,
  Timer,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import simplex2DNoise from './shader/include/simplex2DNoise.glsl?raw';
import simplex4DNoise from './shader/include/simplex4DNoise.glsl?raw';
import './style.css';

(ShaderChunk as any)['simplex4DNoise'] = simplex4DNoise;
(ShaderChunk as any)['simplex2DNoise'] = simplex2DNoise;

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

const el = document.querySelector('#root');

/**
 * Core
 */

const renderer = new WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(size.pixelRatio);
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(Colors.WHITE);

const camera = new PerspectiveCamera(75, size.width / size.height, 0.1, 1000);
camera.position.set(0, 0, 3);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const timer = new Timer();

const raycaster = new Raycaster();
const position = new Vector3(1, 1, 1);

/**
 * DOM
 */

const tip = document.createElement('div');
tip.classList.add('tip');
document.body.append(tip);

/**
 * World
 */

const ballGeometry = new IcosahedronGeometry(1, 20);
const ballMaterial = new MeshBasicMaterial({ color: Colors.CERULEAN4 });
const ball = new Mesh(ballGeometry, ballMaterial);
scene.add(ball);

const axesHelper = new AxesHelper(3);
scene.add(axesHelper);

function updateTip() {
  const screenPosition = position.clone().project(camera);

  let x = (screenPosition.x + 1.0) / 2.0;
  x *= size.width;

  let y = -(screenPosition.y - 1.0) / 2.0;
  y *= size.height;

  console.log(screenPosition.x);

  tip.style.transform = `translateX(${x}px) translateY(${y}px)`;
}
updateTip();

controls.addEventListener('change', updateTip);

/**
 * Debug
 */

/**
 * Events
 */

function render() {
  // Update
  timer.update();
  const delta = timer.getDelta();

  controls.update(delta);

  // Render
  renderer.render(scene, camera);
  // Loop
  requestAnimationFrame(render);
}
render();

window.addEventListener('resize', () => {
  size.width = window.innerWidth;
  size.height = window.innerHeight;

  renderer.setSize(size.width, size.height);

  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();
});
