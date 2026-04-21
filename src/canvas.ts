import { Colors } from '@blueprintjs/colors';
import {
  AxesHelper,
  Color,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  ShaderChunk,
  ShaderMaterial,
  Spherical,
  Timer,
  Uniform,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
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
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(75, size.width / size.height, 0.1, 1000);
camera.position.set(3, 3, 3);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const timer = new Timer();

/**
 * World
 */

const uniforms = {
  uTime: new Uniform(0),
  uLightDirection: new Uniform(new Vector3()),
};

const sunSpherical = new Spherical(1.0, Math.PI / 4, Math.PI / 2);
const sunPosition = new Vector3();

const sunGeometry = new IcosahedronGeometry(0.1, 3);
const sunMaterial = new MeshBasicMaterial({ color: Colors.GOLD5 });
const sun = new Mesh(sunGeometry, sunMaterial);
scene.add(sun);

function updateSun() {
  sunPosition.setFromSpherical(sunSpherical);

  uniforms.uLightDirection.value = sunPosition;

  sun.position.copy(sunPosition.clone().multiplyScalar(5.0));
}
updateSun();

const ballGeometry = mergeVertices(new IcosahedronGeometry(2, 50));
ballGeometry.computeTangents();
const ballMaterial = new ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
});
const ball = new Mesh(ballGeometry, ballMaterial);
scene.add(ball);

const axesHelper = new AxesHelper(3);
scene.add(axesHelper);

/**
 * Debug
 */

const pane = new Pane({ title: 'Debug' });
pane
  .addBinding(sunSpherical, 'phi', {
    step: 0.01,
    min: 0,
    max: Math.PI,
  })
  .on('change', updateSun);
pane
  .addBinding(sunSpherical, 'theta', {
    step: 0.01,
    min: -Math.PI,
    max: Math.PI,
  })
  .on('change', updateSun);

/**
 * Events
 */

function render() {
  // Update
  timer.update();
  controls.update(timer.getDelta());
  uniforms.uTime.value = timer.getElapsed();
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
