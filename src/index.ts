import {
  AxesHelper,
  Color,
  FogExp2,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  Scene,
  ShaderMaterial,
  UniformsLib,
  UniformsUtils,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import classes from './index.module.css';
import floorFragmentShader from './shader/floor/fragment.glsl?raw';
import floorVertexShader from './shader/floor/vertex.glsl?raw';
import './style.css';

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2.0, window.devicePixelRatio),
};

const pathes = {
  ambulance: '/ambulance.png',
  delivery: '/delivery.png',
  deliveryFlat: '/deliveryFlat.png',
  firetruck: '/firetruck.png',
};

const el = document.querySelector('#root') as HTMLDivElement;

/**
 * Basic
 */

const renderer = new WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(size.pixelRatio);
renderer.domElement.addEventListener('dragover', (e) => {
  e.preventDefault();

  console.log(e);
});
renderer.domElement.addEventListener('drop', (e) => {
  e.preventDefault();

  console.warn(e);
});
el.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color('#1e1e1e');

const camera = new PerspectiveCamera(70, size.width / size.height, 0.1, 1000);
camera.position.set(0, 2, 2);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enabled = true;

const raycaster = new Raycaster();

/**
 * DOM
 */

const panel = document.createElement('div');
panel.classList.add(classes.panel);
el.append(panel);

const list = document.createElement('div');
list.classList.add(classes.list);
panel.append(list);

Object.entries(pathes).forEach((value) => {
  const cover = document.createElement('img');
  cover.src = '/preview' + value[1];

  const item = document.createElement('div');
  item.classList.add(classes.item);
  item.draggable = true;
  item.addEventListener('dragstart', (e) => {
    e.dataTransfer?.setDragImage(cover, 32, 32);
  });

  item.append(cover);
  list.append(item);
});

/**
 * World
 */

const floorGeometry = new PlaneGeometry(10, 10, 64, 64);
const floorMaterial = new ShaderMaterial({
  uniforms: UniformsUtils.merge([
    UniformsLib['fog'], // Include fog uniforms
  ]),
  vertexShader: floorVertexShader,
  fragmentShader: floorFragmentShader,
  transparent: true,
  fog: true,
});

const floor = new Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const fog = new FogExp2(new Color('red'), 0.1);
scene.fog = fog;

/**
 * Helper
 */
const axesHelper = new AxesHelper(1);
scene.add(axesHelper);

/**
 * Events
 */

function render() {
  // Render
  renderer.render(scene, camera);

  // Update
  controls.update();

  // Animation
  requestAnimationFrame(render);
}

render();

function resize() {
  size.width = window.innerWidth;
  size.height = window.innerHeight;

  renderer.setSize(size.width, size.height);

  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
