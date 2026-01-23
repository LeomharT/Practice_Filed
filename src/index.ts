import {
  AxesHelper,
  Clock,
  Color,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Uniform,
  WebGLRenderer,
} from 'three';
import { OrbitControls, TrackballControls } from 'three/examples/jsm/Addons.js';
import fragmentShader from './shader/rotate/fragment.glsl?raw';
import vertexShader from './shader/rotate/vertex.glsl?raw';
import './style.css';

/**
 * Variables
 */

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

const el = document.querySelector('#root');

/**
 * Basic
 */

const renderer = new WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color('#1e1e1e');

const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(2, 2, 2);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableRotate = true;
controls.enablePan = false;
controls.enableZoom = false;

const controls2 = new TrackballControls(camera, renderer.domElement);
controls2.noRotate = true;
controls2.noPan = true;
controls2.noZoom = false;

const clock = new Clock();

/**
 * World
 */

const uniforms = {
  uTime: new Uniform(0),
};

const planeGrometry = new PlaneGeometry(1, 1, 16, 16);
const planeMaterial = new ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
});
const plane = new Mesh(planeGrometry, planeMaterial);
scene.add(plane);

/**
 * Helpers
 */
const axesHelper = new AxesHelper();
scene.add(axesHelper);

/**
 * Events
 */

function render() {
  // Time
  const elapsedTime = clock.getElapsedTime();

  // Update
  controls.update();
  controls2.update();
  uniforms.uTime.value = elapsedTime;

  // Render
  renderer.render(scene, camera);

  // Animation
  requestAnimationFrame(render);
}
render();

function resize() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  renderer.setSize(sizes.width, sizes.height);
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
