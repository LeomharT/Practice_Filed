import { Colors } from '@blueprintjs/colors';
import { createNoise2D } from 'simplex-noise';
import {
  AxesHelper,
  Color,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderChunk,
  ShaderMaterial,
  Uniform,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import simplex2DNoise from './shader/include/simplex2DNoise.glsl?raw';
import floorFragmentShader from './shader/test/fragment.glsl?raw';
import floorVertexShader from './shader/test/vertex.glsl?raw';
import './style.css';

const noise2D = createNoise2D();

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
camera.position.set(5, 5, 5);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

/**
 * World
 */

const uniforms = {
  uLightDirection: new Uniform(new Vector3()),
};

const floorGeometry = new PlaneGeometry(40, 40, 16, 16);
floorGeometry.rotateX(-Math.PI / 2);
const positionArr = floorGeometry.getAttribute('position').array;
for (let i = 0; i < positionArr.length; i += 3) {
  // positionArr[i + 1] += getYPosition(positionArr[i + 0], positionArr[i + 2]);
}
floorGeometry.attributes.position.needsUpdate = true;
const floorMaterial = new ShaderMaterial({
  uniforms,
  vertexShader: floorVertexShader,
  fragmentShader: floorFragmentShader,
  wireframe: false,
});
const lightMaterial = new MeshStandardMaterial();
const floor = new Mesh(floorGeometry, floorMaterial);
scene.add(floor);

const directionalLight = new DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 2, 4);
scene.add(directionalLight);
uniforms.uLightDirection.value.copy(directionalLight.position.normalize());

const axesHelper = new AxesHelper(3);
scene.add(axesHelper);

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
