import { Colors } from '@blueprintjs/colors';
import {
  BoxGeometry,
  Color,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
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
controls.maxPolarAngle = Math.PI / 2;

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

function render() {
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
