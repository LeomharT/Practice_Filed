import { Colors } from '@blueprintjs/colors';
import {
  AxesHelper,
  Color,
  DoubleSide,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderChunk,
  ShaderMaterial,
  Spherical,
  Uniform,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import simplex2DNoise from './shader/include/simplex2DNoise.glsl?raw';
import fragmentShader from './shader/test/fragment.glsl?raw';
import vertexShader from './shader/test/vertex.glsl?raw';
import './style.css';

(ShaderChunk as any)['simplex2DNoise'] = simplex2DNoise;

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

const el = document.querySelector('#root');

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
camera.position.set(2, 2, 2);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

/**
 * World
 */

const uniforms = {
  uDirection: new Uniform(new Vector3()),
  uColor: new Uniform(new Color(Colors.GREEN4)),
};

const sunSpherical = new Spherical(1, Math.PI / 4, 0.5);
const sunPosition = new Vector3();

const sunGeometry = new IcosahedronGeometry(0.1, 3);
const sunMaterial = new MeshBasicMaterial({
  color: 'yellow',
});
const sun = new Mesh(sunGeometry, sunMaterial);
scene.add(sun);

function updateSun() {
  // Position
  sunPosition.setFromSpherical(sunSpherical);
  // Uniform
  uniforms.uDirection.value.copy(sunPosition);
  // Sun
  sun.position.copy(sunPosition.clone().multiplyScalar(3));
}

updateSun();

const planeGeometry = new PlaneGeometry(12, 12, 1024, 1024);
const planeMaterial = new ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms,
  side: DoubleSide,
});
const plane = new Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

const axesHelper = new AxesHelper(2);
scene.add(axesHelper);

const pane = new Pane({ title: 'Debug' });
pane
  .addBinding(sunSpherical, 'phi', {
    min: 0,
    max: Math.PI,
    step: 0.01,
  })
  .on('change', updateSun);
pane
  .addBinding(sunSpherical, 'theta', {
    min: -Math.PI,
    max: Math.PI,
    step: 0.01,
  })
  .on('change', updateSun);

function render() {
  //Update
  controls.update();
  //Render
  renderer.render(scene, camera);
  //Animation
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
