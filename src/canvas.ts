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
  Timer,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
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

const planeGeometry = new PlaneGeometry(3, 3, 16, 16);
const planeMaterial = new MeshBasicMaterial({
  color: Colors.BLUE1,
  wireframe: true,
});
const plane = new Mesh(planeGeometry, planeMaterial);
scene.add(plane);

const cursorGeometry = new IcosahedronGeometry(0.08, 3);
const cursorMaterial = new MeshBasicMaterial({ color: Colors.GREEN4 });
const cursor = new Mesh(cursorGeometry, cursorMaterial);
scene.add(cursor);

/**
 * Events
 */

const pointer = new Vector2();
const pos = new Vector3();

let translateX = 0;
let accelerationX = 0;

let translateY = 0;
let accelerationY = 0;

function render() {
  timer.update();

  const delta = timer.getDelta();
  const speed = 2; // 越大越快
  const alpha = 1 - Math.exp(-speed * delta);
  // Updat cursor
  cursor.position.x = MathUtils.lerp(cursor.position.x, pos.x, alpha);
  // const targetX = pos.x - translateX;
  // accelerationX += targetX;
  // translateX = accelerationX * 0.1;

  // const targetY = pos.y - translateY;
  // accelerationY += targetY;
  // translateY = accelerationY * 0.1;

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
