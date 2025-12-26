import {
  AxesHelper,
  Color,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import classes from './index.module.css';
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
 * Basic
 */

const renderer = new WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(size.pixelRatio);
el.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color('#1e1e1e');

const camera = new PerspectiveCamera(70, size.width / size.height, 0.1, 1000);
camera.position.set(3, 3, 3);
camera.lookAt(scene.position);

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
