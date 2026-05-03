import { Colors } from '@blueprintjs/colors';
import {
  AxesHelper,
  Color,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Raycaster,
  Scene,
  ShaderChunk,
  Timer,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import simplex2DNoise from './shader/include/simplex2DNoise.glsl?raw';
import simplex4DNoise from './shader/include/simplex4DNoise.glsl?raw';
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
camera.position.set(0, 0, 3);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const timer = new Timer();

const raycaster = new Raycaster();
const position = new Vector3(0.75, 0.75, 0.75);

/**
 * DOM
 */

const tip = document.createElement('div');
tip.classList.add('tip');

const label = document.createElement('div');

label.classList.add('label');
tip.append(label);

document.body.append(tip);

/**
 * World
 */

const ballGeometry = new IcosahedronGeometry(1, 20);
const ballMaterial = new MeshBasicMaterial({ color: Colors.CERULEAN4 });
const ball = new Mesh(ballGeometry, ballMaterial);
scene.add(ball);

const axesHelper = new AxesHelper(3);
scene.add(axesHelper);

const screenPosition = new Vector3();
const screenPositionV2 = new Vector2();

function updateTip() {
  screenPosition.copy(position.clone().project(camera));
  screenPositionV2.x = screenPosition.x;
  screenPositionV2.y = screenPosition.y;

  const x = (screenPosition.x + 1.0) / 2.0;

  const y = -(screenPosition.y - 1.0) / 2.0;

  raycaster.setFromCamera(screenPositionV2, camera);

  const intersect = raycaster.intersectObjects([ball]);

  // Vsiable
  if (intersect.length === 0) {
    label.classList.add('visiable');
    // Hiddent
  } else {
    const distanceToMesh = intersect[0].distance;
    const distanceToCamera = position.distanceTo(camera.position);

    if (distanceToMesh > distanceToCamera) {
      label.classList.add('visiable');
    } else {
      label.classList.remove('visiable');
    }
  }

  tip.style.transform = `translateX(${x * size.width}px) translateY(${y * size.height}px)`;
}
updateTip();

controls.addEventListener('change', updateTip);

/**
 * Debug
 */

/**
 * Events
 */

function render() {
  // Update
  timer.update();
  const delta = timer.getDelta();

  controls.update(delta);

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
