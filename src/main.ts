import { Colors } from '@blueprintjs/colors';
import {
  AxesHelper,
  Color,
  CylinderGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Uniform,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import waveFragmentShader from './shader/wave/fragment.glsl?raw';
import waveVertexShader from './shader/wave/vertex.glsl?raw';
import './style.css';

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2.0, window.devicePixelRatio),
};

const el = document.querySelector('#root');

const background = new Color(Colors.BLACK);

const renderer = new WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(size.pixelRatio);
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = background;

const camera = new PerspectiveCamera(75, size.width / size.height, 0.1, 1000);
camera.position.set(4.5, 4.5, 4.5);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

/**
 * World
 */

const uniforms = {
  uTime: new Uniform(0),
};

const planeGeometry = new PlaneGeometry(5, 5, 128, 128);
const plangMaterial = new ShaderMaterial({
  vertexShader: waveVertexShader,
  fragmentShader: waveFragmentShader,
  uniforms,
});

const plane = new Mesh(planeGeometry, plangMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

const pillarGeometry = new CylinderGeometry(0.25, 0.25, 10);
const pillarMaterial = new MeshBasicMaterial();
const pillar = new Mesh(pillarGeometry, pillarMaterial);
scene.add(pillar);

/**
 * Helper
 */
const axesHelper = new AxesHelper();
scene.add(axesHelper);

function render() {
  uniforms.uTime.value += 0.01;
  controls.update();

  renderer.render(scene, camera);

  requestAnimationFrame(render);
}
render();

function resize() {
  size.width = window.innerWidth;
  size.height = window.innerHeight;

  renderer.setSize(size.width, size.height);

  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
