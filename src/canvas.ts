import { Colors } from '@blueprintjs/colors';
import {
  BoxGeometry,
  Color,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  Timer,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import './style.css';

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

const el = document.querySelector('#root');

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
controls.maxAzimuthAngle = Math.PI / 3;
controls.minAzimuthAngle = -Math.PI / 3;

const timer = new Timer();

/**
 * World
 */

const planeGeometry = new BoxGeometry(2, 2, 2, 16, 16, 16);
const planeMaterial = new MeshBasicMaterial({
  color: Colors.GOLD4,
  wireframe: true,
});
const plane = new Mesh(planeGeometry, planeMaterial);
scene.add(plane);

const maxPolarAngle = Math.PI / 2;
const minPolarAngle = 0;
const maxAzimuthAngle = Math.PI / 3;
const minAzimuthAngle = -Math.PI / 3;

const speed = 10;

function render() {
  timer.update();

  const delta = timer.getDelta();

  const polar = controls.getPolarAngle();
  const azimuth = controls.getAzimuthalAngle();

  const t = 1.0 - Math.exp(-speed * delta);

  const maxAngle = MathUtils.lerp(polar, maxPolarAngle, t);
  const minAngle = MathUtils.lerp(polar, minPolarAngle, t);

  const maxAzimuth = MathUtils.lerp(azimuth, maxAzimuthAngle, t);
  const minAzimuth = MathUtils.lerp(azimuth, minAzimuthAngle, t);

  controls.maxPolarAngle = maxAngle;
  controls.minPolarAngle = minAngle;

  controls.maxAzimuthAngle = maxAzimuth;
  controls.minAzimuthAngle = minAzimuth;

  controls.update();

  renderer.render(scene, camera);

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
