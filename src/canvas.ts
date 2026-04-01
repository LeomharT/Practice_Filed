import { Colors } from '@blueprintjs/colors';
import { createNoise2D } from 'simplex-noise';
import {
  Color,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import floorFragmentShader from './shader/test/fragment.glsl?raw';
import floorVertexShader from './shader/test/vertex.glsl?raw';
import './style.css';

const noise2D = createNoise2D();

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
camera.position.set(5, 5, 5);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

/**
 * World
 */

const floorGeometry = new PlaneGeometry(40, 40, 32, 32);
floorGeometry.rotateX(-Math.PI / 2);
const positionArr = floorGeometry.getAttribute('position').array;
for (let i = 0; i < positionArr.length; i += 3) {
  positionArr[i + 1] += getYPosition(positionArr[i + 0], positionArr[i + 2]);
}
floorGeometry.attributes.position.needsUpdate = true;
floorGeometry.computeVertexNormals();
const floorMaterial = new ShaderMaterial({
  vertexShader: floorVertexShader,
  fragmentShader: floorFragmentShader,
});
const lightMaterial = new MeshStandardMaterial();
const floor = new Mesh(floorGeometry, lightMaterial);
scene.add(floor);

const directionalLight = new DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 2, 4);
scene.add(directionalLight);

/**
 * Events
 */

function render() {
  // Update
  controls.update();
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

function getYPosition(x: number, z: number) {
  let y = 2 * noise2D(x / 50, z / 50);
  y += 4 * noise2D(x / 40, z / 40);
  y += 0.2 * noise2D(x / 10, z / 10);
  return y;
}
