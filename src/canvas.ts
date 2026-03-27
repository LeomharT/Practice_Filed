import { Colors } from '@blueprintjs/colors';
import {
  Color,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  Scene,
  Vector2,
  WebGLRenderer,
} from 'three';
import './style.css';

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

const el = document.querySelector('#root');

const renderer = new WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(size.pixelRatio);
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(75, size.width / size.height, 0.1, 1000);
camera.position.set(0, 0, 3);
camera.lookAt(scene.position);

const raycaster = new Raycaster();

/**
 * World
 */

const planeGeometry = new PlaneGeometry(4, 4, 16, 16);
const planeMaterial = new MeshBasicMaterial({
  color: new Color(Colors.BLUE3),
  wireframe: true,
});
const plane = new Mesh(planeGeometry, planeMaterial);
scene.add(plane);

const pointGeometry = new IcosahedronGeometry(0.1, 3);
const pointMaterial = new MeshBasicMaterial({
  color: Colors.GOLD5,
});
const point = new Mesh(pointGeometry, pointMaterial);
scene.add(point);

const cursor = new Vector2();

let translateY = 0;
let accelerationY = 0;

let translateX = 0;
let accelerationX = 0;

function intersectObject() {
  raycaster.setFromCamera(cursor, camera);
  const intersect = raycaster.intersectObject(plane);

  if (intersect.length) {
    let targetY = intersect[0].point.y - translateY;
    accelerationY += targetY;
    accelerationY *= 0.95;
    translateY += accelerationY * 0.01;

    const targetX = intersect[0].point.x - translateX;
    accelerationX += targetX;
    accelerationX *= 0.95;
    translateX += accelerationX * 0.01;

    point.position.x = translateX;
    point.position.y = translateY;
  }
}

function render() {
  intersectObject();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();

window.addEventListener('pointermove', (e) => {
  const x = (e.clientX / size.width) * 2 - 1;
  const y = -(e.clientY / size.height) * 2 + 1;

  cursor.x = x;
  cursor.y = y;

  raycaster.setFromCamera(cursor, camera);
});
