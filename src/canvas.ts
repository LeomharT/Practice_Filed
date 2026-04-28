import {
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderChunk,
  ShaderMaterial,
  Timer,
  Uniform,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import simplex4DNoise from './shader/include/simplex4DNoise.glsl?raw';
import fragmentShader from './shader/test/fragment.glsl?raw';
import vertexShader from './shader/test/vertex.glsl?raw';
import './style.css';

(ShaderChunk as any)['simplex4DNoise'] = simplex4DNoise;

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

const camera = new PerspectiveCamera(75, size.width / size.height, 0.1, 1000);
camera.position.set(0, 0, 1.2);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const timer = new Timer();

/**
 * World
 */

const GOLDENRATIO = 1.61803398875;

const uniforms = {
  uRadius: new Uniform(0.1),
  uRatio: new Uniform(1 / GOLDENRATIO),
};

const planeGeometry = new PlaneGeometry(1, GOLDENRATIO, 2, 2);
const planeMaterial = new ShaderMaterial({
  uniforms,
  fragmentShader,
  vertexShader,
});
const plane = new Mesh(planeGeometry, planeMaterial);

scene.add(plane);

/**
 * Debug
 */

const pane = new Pane({ title: 'Debug' });
pane.addBinding(uniforms.uRadius, 'value', {
  label: 'radius',
  step: 0.001,
  max: 0.5,
  min: 0,
});

/**
 * Events
 */

function render() {
  // Update
  timer.update();
  controls.update(timer.getDelta());
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
