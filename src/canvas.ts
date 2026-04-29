import { Colors } from '@blueprintjs/colors';
import {
  Color,
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
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(75, size.width / size.height, 0.1, 1000);
camera.position.set(1, 1, 1.2);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const timer = new Timer();

/**
 * World
 */

const uniforms = {
  uColor: new Uniform(new Color(Colors.BLUE4).convertLinearToSRGB()),
};

const GOLDENRATIO = 1.61803398875;

const planeGeometry = new PlaneGeometry(GOLDENRATIO, GOLDENRATIO, 16, 16);
planeGeometry.computeTangents();
const planeMaterial = new ShaderMaterial({
  uniforms,
  fragmentShader,
  vertexShader,
});
const plane = new Mesh(planeGeometry, planeMaterial);
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
