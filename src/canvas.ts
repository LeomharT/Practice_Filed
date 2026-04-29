import { Colors } from '@blueprintjs/colors';
import {
  Color,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
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
import { Pane } from 'tweakpane';
import simplex2DNoise from './shader/include/simplex2DNoise.glsl?raw';
import simplex4DNoise from './shader/include/simplex4DNoise.glsl?raw';
import fragmentShader from './shader/test/fragment.glsl?raw';
import vertexShader from './shader/test/vertex.glsl?raw';
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
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(75, size.width / size.height, 0.1, 1000);
camera.position.set(10, 10, 10);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const timer = new Timer();

/**
 * World
 */

const uniforms = {
  uColor: new Uniform(new Color(Colors.BLUE4).convertLinearToSRGB()),
  uLightDirection: new Uniform(new Vector3()),
};

const sunSpherical = new Spherical(1.0, Math.PI / 3, Math.PI / 2);
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

const GOLDENRATIO = 20;

const planeGeometry = new PlaneGeometry(GOLDENRATIO, GOLDENRATIO, 126, 126);
planeGeometry.computeTangents();
const planeMaterial = new ShaderMaterial({
  uniforms,
  fragmentShader,
  vertexShader,
  wireframe: true,
});
const plane = new Mesh(planeGeometry, planeMaterial);
plane.receiveShadow = true;
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

/**
 * Debug
 */

const pane = new Pane({ title: 'Debug' });
pane
  .addBinding(uniforms.uColor, 'value', {
    color: { type: 'float' },
  })
  .on('change', (val) => (uniforms.uColor.value = new Color(val.value).convertSRGBToLinear()));
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
