import {
  AxesHelper,
  Clock,
  Color,
  CylinderGeometry,
  InstancedMesh,
  Layers,
  NormalBlending,
  Object3D,
  PerspectiveCamera,
  Scene,
  ShaderChunk,
  ShaderMaterial,
  Uniform,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import simplex3DNoise from './shader/include/simplex3DNoise.glsl?raw';
import starFragmentShader from './shader/start/fragment.glsl?raw';
import starVertexShader from './shader/start/vertex.glsl?raw';
import './style.css';

function random(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

(ShaderChunk as any)['simplex3DNoise'] = simplex3DNoise;

const el = document.querySelector('#root');

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

const layers = {
  bloom: 1,
};
const layer = new Layers();
layer.set(layers.bloom);
const background = new Color('#1e1e1e');

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
camera.position.set(0, 0, 5);
camera.lookAt(scene.position);
camera.layers.enable(layers.bloom);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const clock = new Clock();

/**
 * World
 */
const params = {
  count: 200,
  time: 0,
  speed: 20,
};

const uniforms = {
  uTime: new Uniform(0),
};

const startGeometry = new CylinderGeometry(0.1, 0.1, 10, 32, 32);
startGeometry.rotateX(Math.PI / 2);
const startMaterial = new ShaderMaterial({
  vertexShader: starVertexShader,
  fragmentShader: starFragmentShader,
  uniforms,
  transparent: true,
  blending: NormalBlending,
});
const starts = new InstancedMesh(startGeometry, startMaterial, params.count);
const obj = new Object3D();

const positions = Array.from({ length: params.count }, () => [
  random(-100, 100),
  random(-100, 100),
  random(-100, 100),
]);

function upadteInstances(time: number = 0) {
  for (let i = 0; i < params.count; i++) {
    const p = positions[i];
    p[2] += time * 20;
    p[2] = p[2] % 100;
    obj.position.set(p[0], p[1], p[2]);
    obj.updateMatrix();
    starts.setMatrixAt(i, obj.matrix);
  }
  starts.instanceMatrix.needsUpdate = true;
}
upadteInstances();
scene.add(starts);

/**
 * Helper
 */

const axesHelper = new AxesHelper();
scene.add(axesHelper);

/**
 * Pane
 */

const pane = new Pane({ title: 'Debug' });
pane.element.parentElement!.style.width = '380px';

/**
 * Event
 */

function render() {
  // Time
  const delta = clock.getDelta();
  // Update
  controls.update();
  uniforms.uTime.value += 0.01;
  upadteInstances(delta);
  // Render
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
