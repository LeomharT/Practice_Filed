import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import {
  AxesHelper,
  BoxGeometry,
  Color,
  Mesh,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import './style.css';

/** DOM */
const root = document.querySelector('#root');

const el = document.createElement('div');
el.classList.add('viewer');
root?.append(el);

const rect = el.getBoundingClientRect();
const size = {
  width: rect.width,
  height: rect.height,
  pixelRatio: Math.min(2.0, window.devicePixelRatio),
};

const renderer = new WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(size.pixelRatio);
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color('#1e1e1e');

const camera = new PerspectiveCamera(30, size.width / size.height, 0.1, 1000);
camera.position.set(3, 3, 3);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

/** World */
const floorGeometry = new BoxGeometry(1, 1, 1);
const floorMaterial = new ShaderMaterial();

const test = new Mesh(floorGeometry, floorMaterial);
scene.add(test);

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
