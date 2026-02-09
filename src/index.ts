import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import {
  AmbientLight,
  AxesHelper,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import { GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import './style.css';

/** DOM */
const root = document.querySelector('#root');

const el = document.createElement('div');
el.classList.add('viewer');
root?.append(el);

const rect = el.getBoundingClientRect();

const size = {
  width: rect.width - 32 * 2,
  height: rect.height - 32 * 2,
  pixelRatio: Math.min(2.0, window.devicePixelRatio),
};

const gltfLoader = new GLTFLoader();
gltfLoader.setPath('/src/assets/models/');

const renderer = new WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(size.pixelRatio);
el?.append(renderer.domElement);

const scene = new Scene();

const camera = new PerspectiveCamera(45, size.width / size.height, 0.1, 1000);
camera.position.set(3, 3, 3);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

/** World */

gltfLoader.load('Drone.gltf', (model) => {
  scene.add(model.scene);
});

/** Lights */
const ambientLight = new AmbientLight('0xffffff', 1.5);
scene.add(ambientLight);

/** Helper */
const axesHelper = new AxesHelper();
scene.add(axesHelper);

/** Pane */
const pane = new Pane({ title: 'Debug Param' });
pane.element.parentElement!.style.width = '380px';
pane.registerPlugin(EssentialsPlugin);

const fpsGraph: any = pane.addBlade({
  view: 'fpsgraph',
  label: undefined,
  rows: 4,
});

const folder_camera = pane.addFolder({ title: '📷 Camera' });
folder_camera
  .addBinding(camera, 'fov', {
    step: 1,
    min: 20,
    max: 90,
  })
  .on('change', () => {
    camera.updateProjectionMatrix();
  });

function render() {
  fpsGraph.begin();
  // Update
  controls.update();
  // Render
  renderer.render(scene, camera);
  // Animation
  requestAnimationFrame(render);
  fpsGraph.end();
}
render();

function resize() {
  size.width = window.innerWidth;
  size.height = window.innerHeight;

  renderer.setSize(size.width, size.height);

  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();
}
// window.addEventListener('resize', resize);
