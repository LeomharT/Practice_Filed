import {
  AxesHelper,
  Clock,
  Color,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Uniform,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import { OrbitControls, TrackballControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
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

const LAYERS = {
  WINDOW: 1,
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
camera.position.set(3, 3, 3);
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

const frameTarget = new WebGLRenderTarget(sizes.width, sizes.height, {
  generateMipmaps: true,
});

/**
 * World
 */

const uniforms = {
  uTime: new Uniform(0),
  uFrameTexture: new Uniform(frameTarget.texture),
};

const planeGrometry = new PlaneGeometry(1, 1, 16, 16);
const planeMaterial = new ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
});
const plane = new Mesh(planeGrometry, planeMaterial);
plane.position.set(1.5, 1.5, 1.5);
plane.layers.enable(LAYERS.WINDOW);
scene.add(plane);

const ballGeometry = new IcosahedronGeometry(0.3, 1);
const ballMaterial = new MeshBasicMaterial();
const ball = new Mesh(ballGeometry, ballMaterial);
ball.layers.set(LAYERS.WINDOW);
scene.add(ball);

/**
 * Helpers
 */
const axesHelper = new AxesHelper();
scene.add(axesHelper);

/**
 * Pane
 */

const params = {
  radius: 1.75,
  frequency: 3.725,
};

const pane = new Pane({ title: 'Debug Params' });
pane.element.parentElement!.style.width = '380px';

const ballFolder = pane.addFolder({ title: '⚽ Ball' });
ballFolder.addBinding(params, 'radius', {
  label: 'Radius',
  step: 0.001,
  min: 1.0,
  max: 5.0,
});
ballFolder.addBinding(params, 'frequency', {
  label: 'Frequency',
  step: 0.001,
  min: 1.0,
  max: 5.0,
});

/**
 * Events
 */

function updateBall(angle: number, radius: number) {
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle * params.frequency) * 0.5 + 0.5;
  const z = Math.sin(angle) * radius;
  ball.position.set(x, y, z);
}

function renderFrame() {
  plane.visible = false;

  const origin = renderer.getRenderTarget();

  renderer.setRenderTarget(frameTarget);
  camera.layers.enable(LAYERS.WINDOW);
  renderer.render(scene, camera);
  camera.layers.disable(LAYERS.WINDOW);
  renderer.setRenderTarget(origin);

  plane.visible = true;
}

function render() {
  // Time
  const elapsedTime = clock.getElapsedTime();

  // Update
  controls.update();
  controls2.update();

  updateBall(elapsedTime, params.radius);

  uniforms.uTime.value = elapsedTime;

  // Render
  renderFrame();
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
