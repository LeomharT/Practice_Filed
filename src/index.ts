import {
  AxesHelper,
  Color,
  Layers,
  PerspectiveCamera,
  Scene,
  ShaderChunk,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import simplex3DNoise from './shader/include/simplex3DNoise.glsl?raw';
import './style.css';

(ShaderChunk as any)['simplex3DNoise'] = simplex3DNoise;

const el = document.querySelector('#root');

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

const layers = {
  bloom: 1,
};
const layer = new Layers();
layer.set(layers.bloom);
const background = new Color('#1e1e1e');

const renderer = new WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(size.pixelRatio);
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = background;

const camera = new PerspectiveCamera(75, size.width / size.height, 0.1, 1000);
camera.position.set(2, 3, 2);
camera.lookAt(scene.position);
camera.layers.enable(layers.bloom);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

/**
 * World
 */

/**
 * Helper
 */

const axesHelper = new AxesHelper();
scene.add(axesHelper);

/**
 * Pane
 */

const pane = new Pane({ title: 'Debug' });
pane.element.parentElement!.style.width = '380px';

/**
 * Event
 */

function render() {
  // Update
  controls.update();
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
