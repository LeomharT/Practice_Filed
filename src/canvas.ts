import { Colors } from '@blueprintjs/colors';
import {
  BoxGeometry,
  Color,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderChunk,
  ShaderMaterial,
  Timer,
  Uniform,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
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
camera.position.set(0, 0, 3);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const timer = new Timer();

const frameRender = new WebGLRenderTarget(size.width, size.height, {
  generateMipmaps: true,
});

/**
 * World
 */

const uniforms = {
  uTime: new Uniform(0),
  uFrame: new Uniform(frameRender.texture),
};

const planeGeometry = new PlaneGeometry(1, 1, 16, 16);
const planeMaterial = new ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
});
const plane = new Mesh(planeGeometry, planeMaterial);
plane.position.set(1, 1, 1);
scene.add(plane);

const ball = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial());
scene.add(ball);

/**
 * Debug
 */

/**
 * Events
 */

function renderFrame() {
  renderer.setRenderTarget(frameRender);
  plane.visible = false;
  renderer.render(scene, camera);
  plane.visible = true;
  renderer.setRenderTarget(null);
}

function render() {
  // Update
  timer.update();
  const delta = timer.getDelta();

  controls.update(delta);

  uniforms.uTime.value += delta;

  // Render
  renderFrame();
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
