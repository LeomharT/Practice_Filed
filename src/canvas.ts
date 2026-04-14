import { Colors } from '@blueprintjs/colors';
import {
  AxesHelper,
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
import './style.css';

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

const camera = new PerspectiveCamera(75, size.width / size.height, 0.1, 1000);
camera.position.set(0, 0, 3);
camera.lookAt(scene.position);

const raycaster = new Raycaster();

const timer = new Timer();

/**
 * World
 */

const cursor = new Vector2();
const pointer = new Vector3();

const planeGeometry = new PlaneGeometry(5, 5, 16, 16);
const planeMaterial = new MeshBasicMaterial({
  color: 'lightBlue',
  wireframe: true,
});
const plane = new Mesh(planeGeometry, planeMaterial);
scene.add(plane);

const ballGeometry = new IcosahedronGeometry(0.1, 3);
const ballMaterial = new MeshBasicMaterial();
const ball = new Mesh(ballGeometry, ballMaterial);
scene.add(ball);

const axesHelper = new AxesHelper();
scene.add(axesHelper);

/**
 * Events
 */

const speed = 10;

function render() {
  // Update
  timer.update();
  const delta = timer.getDelta();
  const t = 1.0 - Math.exp(speed * -delta);

  ball.position.x = MathUtils.lerp(ball.position.x, pointer.x, t);
  ball.position.y = MathUtils.lerp(ball.position.y, pointer.y, t);

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
