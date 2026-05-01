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
  ShaderChunk,
  ShaderMaterial,
  Timer,
  Uniform,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import simplex2DNoise from './shader/include/simplex2DNoise.glsl?raw';
import simplex4DNoise from './shader/include/simplex4DNoise.glsl?raw';
import fragmentShader from './shader/test/fragment.glsl?raw';
import vertexShader from './shader/test/vertex.glsl?raw';
import './style.css';

(ShaderChunk as any)['simplex4DNoise'] = simplex4DNoise;
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
scene.background = new Color(Colors.WHITE);

const camera = new PerspectiveCamera(75, size.width / size.height, 0.1, 1000);
camera.position.set(0, 0, 1.5);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const timer = new Timer();

const raycaster = new Raycaster();

/**
 * World
 */

const GOLDENRATIO = 1.61803398875;

const uniforms = {
  uRadius: new Uniform(0.1),
  uBorder: new Uniform(0.1),
  uRatio: new Uniform(1 / GOLDENRATIO),
};

const planeGeometry = new PlaneGeometry(1, GOLDENRATIO, 32, 32);
const planeMaterial = new ShaderMaterial({
  extensions: {
    derivatives: true,
  } as any,
  transparent: true,
  uniforms,
  fragmentShader,
  vertexShader,
});
const plane = new Mesh(planeGeometry, planeMaterial);
plane.receiveShadow = true;
scene.add(plane);

const b = new Mesh(new IcosahedronGeometry(0.1, 3), new MeshBasicMaterial({ color: Colors.GOLD1 }));
scene.add(b);

/**
 * Debug
 */

const pane = new Pane({ title: 'Debug' });
pane.addBinding(uniforms.uRadius, 'value', { min: 0, max: 0.5, step: 0.001 });
pane.addBinding(uniforms.uBorder, 'value', { min: 0, max: 0.2, step: 0.001 });

/**
 * Events
 */

const cursor = new Vector2();
const pointer = new Vector3();

const speed = 5;

function render() {
  // Update
  timer.update();

  const delta = timer.getDelta();
  const t = 1.0 - Math.exp(speed * -delta);

  controls.update(delta);

  b.position.x = MathUtils.lerp(b.position.x, pointer.x, t);
  b.position.y = MathUtils.lerp(b.position.y, pointer.y, t);

  // Render
  renderer.render(scene, camera);
  // Loop
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

renderer.domElement.addEventListener('pointermove', (e) => {
  cursor.x = (e.clientX / window.innerWidth) * 2.0 - 1.0;
  cursor.y = -(e.clientY / window.innerHeight) * 2.0 + 1.0;

  raycaster.setFromCamera(cursor, camera);

  const intersect = raycaster.intersectObject(plane, true);

  if (intersect.length) {
    pointer.copy(intersect[0].point);
  }
});
