import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
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
import {
  OrbitControls,
  Reflector,
  TrackballControls,
} from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import floorFragmentShader from './shader/floor/fragment.glsl?raw';
import floorVertexShader from './shader/floor/vertex.glsl?raw';
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
  uColor1: new Uniform(new Color('#cf1322')),
  uColor2: new Uniform(new Color('#1d39c4')),
  uReflector: new Uniform(null),
  uTextureMatrix: new Uniform(null),
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

const floorGeometry = new PlaneGeometry(5, 5, 16, 16);

const floorReflector = new Reflector(floorGeometry, {
  textureWidth: sizes.width,
  textureHeight: sizes.height,
});
floorReflector.rotation.x = -Math.PI / 2;
scene.add(floorReflector);

if (floorReflector.material instanceof ShaderMaterial) {
  uniforms['uReflector'].value =
    floorReflector.material.uniforms['tDiffuse'].value;
  uniforms['uTextureMatrix'].value =
    floorReflector.material.uniforms['textureMatrix'].value;
}

const floorMaterial = new ShaderMaterial({
  vertexShader: floorVertexShader,
  fragmentShader: floorFragmentShader,
  uniforms,
});
const floor = new Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

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
pane.registerPlugin(EssentialsPlugin);
pane.element.parentElement!.style.width = '380px';
const fpsGraph = pane.addBlade({
  view: 'fpsgraph',
  label: undefined,
  rows: 4,
}) as any;

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

const planPane = pane.addFolder({ title: '🏁 Plane' });
planPane.addBinding(uniforms.uColor1, 'value', {
  color: {
    type: 'float',
  },
});
planPane.addBinding(uniforms.uColor2, 'value', {
  color: {
    type: 'float',
  },
});

/**
 * Events
 */

function updateBall(angle: number, radius: number) {
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle * params.frequency) * 0.5 + 0.5;
  const z = Math.sin(angle) * radius;
  ball.position.set(x, y + 0.3, z);
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

function renderReflector() {
  plane.visible = false;
  axesHelper.visible = false;

  floorReflector.visible = true;
  ball.layers.set(0);

  renderer.render(scene, camera);

  floorReflector.visible = false;
  ball.layers.set(LAYERS.WINDOW);

  plane.visible = true;
  axesHelper.visible = true;
}

function render() {
  fpsGraph.begin();

  // Time
  const elapsedTime = clock.getElapsedTime();

  // Update
  controls.update();
  controls2.update();

  updateBall(elapsedTime, params.radius);

  uniforms.uTime.value = elapsedTime;

  // Render
  renderReflector();
  renderFrame();
  renderer.render(scene, camera);

  // Animation
  requestAnimationFrame(render);

  fpsGraph.end();
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
