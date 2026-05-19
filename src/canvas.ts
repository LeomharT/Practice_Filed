import { Colors } from '@blueprintjs/colors';
import {
  Color,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Timer,
  Uniform,
  WebGLRenderer,
} from 'three';
import fragmentShader from './shader/test/fragment.glsl?raw';
import vertexShader from './shader/test/vertex.glsl?raw';
import './style.css';

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
camera.position.set(0, 0, 3);
camera.lookAt(scene.position);

const timer = new Timer();

/**
 * World
 */

const uniforms = {
  uTime: new Uniform(0),
};

const planeGeometry = new PlaneGeometry(1, 1, 16, 16);
const planeMaterial = new ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
});
const plane = new Mesh(planeGeometry, planeMaterial);
scene.add(plane);

function render() {
  // Update
  timer.update();
  const e = timer.getElapsed();
  uniforms.uTime.value = e;

  // Render
  renderer.render(scene, camera);
  // Animation
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
