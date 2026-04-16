import { Colors } from '@blueprintjs/colors';
import {
  AxesHelper,
  Color,
  DoubleSide,
  Mesh,
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

console.log(vertexShader);

const planeGeometry = new PlaneGeometry(5, 5, 128, 128);
const planeMaterial = new ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uColor: new Uniform(new Color(Colors.GOLD3)),
    uDirection: new Uniform(new Vector3(3, 1, 3).normalize()),
  },
  side: DoubleSide,
});
const plane = new Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

const axesHelper = new AxesHelper();
scene.add(axesHelper);

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
