import { Colors } from '@blueprintjs/colors';
import {
  AxesHelper,
  Color,
  DoubleSide,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderChunk,
  ShaderMaterial,
  Uniform,
  WebGLRenderer,
} from 'three';
import { GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons.js';
import simplex4DNoise from './shader/include/simplex4DNoise.glsl?raw';
import wobbleFragmentShader from './shader/wobble/fragment.glsl?raw';
import wobbleVertexShader from './shader/wobble/vertex.glsl?raw';
import './style.css';

(ShaderChunk as any)['simplex4DNoise'] = simplex4DNoise;

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2.0, window.devicePixelRatio),
};

const el = document.querySelector('#root');

const background = new Color(Colors.BLACK);

const gltfLoader = new GLTFLoader();

const renderer = new WebGLRenderer({
  antialias: true,
  alpha: true,
});
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(size.pixelRatio);
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = background;

const camera = new PerspectiveCamera(75, size.width / size.height, 0.1, 1000);
camera.position.set(3, 3, 3);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const uniforms = {
  uTime: new Uniform(0),
};

const wobbleSphereGeometry = new PlaneGeometry(5, 5, 128, 128);
wobbleSphereGeometry.computeTangents();
const wobbleMaterial = new ShaderMaterial({
  vertexShader: wobbleVertexShader,
  fragmentShader: wobbleFragmentShader,
  uniforms,
  wireframe: false,
  side: DoubleSide,
});
const wobble = new Mesh(wobbleSphereGeometry, wobbleMaterial);
wobble.rotation.x = -Math.PI / 2;
scene.add(wobble);

/**
 * Helpers
 */

const axesHelper = new AxesHelper(5);
scene.add(axesHelper);

function render() {
  // Update
  controls.update();
  uniforms['uTime'].value += 0.01;

  // Redner
  renderer.render(scene, camera);
  // Animation
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
