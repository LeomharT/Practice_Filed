import { Colors } from '@blueprintjs/colors';
import {
  AxesHelper,
  Color,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderChunk,
  ShaderMaterial,
  WebGLRenderer,
} from 'three';
import {
  EffectComposer,
  GLTFLoader,
  OrbitControls,
  OutputPass,
  RenderPass,
} from 'three/examples/jsm/Addons.js';
import simplex4DNoise from './shader/include/simplex4DNoise.glsl?raw';
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

const renderScene = new RenderPass(scene, camera);

const outputPass = new OutputPass();

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(outputPass);

const grassBaseGeometry = new PlaneGeometry(0.12, 1, 1, 16);
grassBaseGeometry.translate(0, 0.5, 0);
const grassMaterial = new ShaderMaterial({
  wireframe: true,
});

const grassBlead = new Mesh(grassBaseGeometry, grassMaterial);
scene.add(grassBlead);

/**
 * Helpers
 */

const axesHelper = new AxesHelper(3);
scene.add(axesHelper);

function render() {
  // Update
  controls.update();
  // Redner
  composer.render();
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
