import { Colors } from '@blueprintjs/colors';
import {
  AxesHelper,
  Color,
  DoubleSide,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  Scene,
  ShaderChunk,
  ShaderMaterial,
  Spherical,
  Timer,
  Uniform,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import simplex2DNoise from './shader/include/simplex2DNoise.glsl?raw';
import fragmentShader from './shader/test/fragment.glsl?raw';
import vertexShader from './shader/test/vertex.glsl?raw';
import './style.css';

(ShaderChunk as any)['simplex2DNoise'] = simplex2DNoise;

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
  piexlRatio: Math.min(2, window.devicePixelRatio),
};

const el = document.querySelector('#root');

const renderer = new WebGLRenderer({
  antialias: true,
  alpha: true,
});
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(size.piexlRatio);
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(50, size.width / size.height, 0.1, 1000);
camera.position.set(3, 3, 3);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const raycaster = new Raycaster();

const timer = new Timer();

/**
 * World
 */

const cursor = new Vector2();
const pointer = new Vector3();

const uniforms = {
  uColor: new Uniform(new Color(Colors.GOLD3)),
  uDirection: new Uniform(new Vector3()),
};

const planeGeometry = new PlaneGeometry(5, 5, 128, 128);
planeGeometry.rotateX(-Math.PI / 2);
const planeMaterial = new ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms,
  side: DoubleSide,
});
const plane = new Mesh(planeGeometry, planeMaterial);
scene.add(plane);

const ballSpherical = new Spherical(1.0, Math.PI / 2, 0.5);
const ballPosition = new Vector3();

const ballGeometry = new IcosahedronGeometry(0.1, 3);
const ballMaterial = new MeshBasicMaterial({ color: 'yellow' });
const ball = new Mesh(ballGeometry, ballMaterial);
scene.add(ball);

function updateBall() {
  // Position
  ballPosition.setFromSpherical(ballSpherical);

  // Uniforms
  uniforms.uDirection.value.copy(ballPosition);

  //Ball
  ball.position.copy(ballPosition.clone().multiplyScalar(5.0));
}

updateBall();

const axesHelper = new AxesHelper();
scene.add(axesHelper);

const pane = new Pane({ title: 'Debug' });
pane
  .addBinding(ballSpherical, 'theta', {
    step: 0.01,
    min: -Math.PI,
    max: Math.PI,
  })
  .on('change', updateBall);
pane
  .addBinding(ballSpherical, 'phi', {
    step: 0.01,
    min: 0,
    max: Math.PI,
  })
  .on('change', updateBall);

/**
 * Events
 */

const speed = 10;

function render() {
  // Update
  timer.update();
  controls.update(timer.getDelta());

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

window.addEventListener('pointermove', (e) => {
  cursor.x = (e.clientX / size.width) * 2 - 1.0;
  cursor.y = -(e.clientY / size.height) * 2 + 1.0;

  raycaster.setFromCamera(cursor, camera);
  const intersect = raycaster.intersectObject(plane);
  intersect.length && pointer.copy(intersect[0].point);
});
