import { Colors } from '@blueprintjs/colors';
import {
  Color,
  IcosahedronGeometry,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  Scene,
  ShaderMaterial,
  Timer,
  Uniform,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import testFragmentShader from './shader/test/fragment.glsl?raw';
import testVertexShader from './shader/test/vertex.glsl?raw';
import './style.css';

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2.0, window.devicePixelRatio),
};

const el = document.querySelector('#root');

/**
 * Core
 */
const renderer = new WebGLRenderer({
  antialias: true,
  alpha: true,
});
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(size.pixelRatio);
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(70, size.width / size.height, 0.1, 1000);
camera.position.set(0, 0, 3);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const timer = new Timer();

const raycaster = new Raycaster();

const uniforms = {
  uRadius: new Uniform(0.1),
};

const planeGeometry = new PlaneGeometry(3, 4, 16, 16);
const planeMaterial = new ShaderMaterial({
  uniforms,
  vertexShader: testVertexShader,
  fragmentShader: testFragmentShader,
});
const plane = new Mesh(planeGeometry, planeMaterial);
scene.add(plane);

const cursorGeometry = new IcosahedronGeometry(0.08, 3);
const cursorMaterial = new MeshBasicMaterial({ color: Colors.GREEN4 });
const cursor = new Mesh(cursorGeometry, cursorMaterial);
scene.add(cursor);

const pane = new Pane({ title: 'Debug' });
pane.addBinding(uniforms.uRadius, 'value', {
  label: 'Radius',
  step: 0.001,
  min: 0.0,
  max: 0.5,
});

/**
 * Events
 */

const pointer = new Vector2();
const pos = new Vector3();

let translateX = 0;
let accelerationX = 0;

let translateY = 0;
let accelerationY = 0;

const speed = 5;

function render() {
  timer.update();

  const delta = timer.getDelta();

  const t = 1.0 - Math.exp(-speed * delta);
  cursor.position.x = MathUtils.lerp(cursor.position.x, pos.x, t);

  // Updat cursor
  // const targetX = pos.x - translateX;
  // accelerationX += targetX;
  // accelerationX *= 0.95;
  // translateX += accelerationX * 0.002;

  // const targetY = pos.y - translateY;
  // accelerationY += targetY;
  // accelerationY *= 0.95;
  // translateY += accelerationY * 0.002;

  // cursor.position.x = translateX;
  // cursor.position.y = translateY;

  // Update
  controls.update();
  // Render
  renderer.render(scene, camera);
  // Animation
  requestAnimationFrame(render);
}
render();

window.addEventListener('pointermove', (e) => {
  pointer.x = (e.clientX / size.width) * 2 - 1;
  pointer.y = -(e.clientY / size.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObject(plane);
  if (intersects.length) {
    pos.copy(intersects[0].point);
  }
});

window.addEventListener('resize', () => {
  size.width = window.innerWidth;
  size.height = window.innerHeight;

  renderer.setSize(size.width, size.height);

  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();
});
