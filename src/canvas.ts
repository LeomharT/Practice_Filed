import { Colors } from '@blueprintjs/colors';
import {
  AxesHelper,
  Color,
  DirectionalLight,
  IcosahedronGeometry,
  Mesh,
  MeshStandardMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderChunk,
  ShaderMaterial,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import simplex4DNoise from './shader/include/simplex4DNoise.glsl?raw';
import testFragmentShader from './shader/test/fragment.glsl?raw';
import testVertexShader from './shader/test/vertex.glsl?raw';
import './style.css';

(ShaderChunk as any)['simplex4DNoise'] = simplex4DNoise;

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
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFShadowMap;
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color(Colors.BLACK);

const camera = new PerspectiveCamera(75, size.width / size.height, 0.1, 1000);
camera.position.set(0, 5, 5);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

/**
 * World
 */

const uniforms = {};

const ballGeometry = new IcosahedronGeometry(2, 50);
const ballMaterial = new ShaderMaterial({
  uniforms,
  vertexShader: testVertexShader,
  fragmentShader: testFragmentShader,
});
const ball = new Mesh(ballGeometry, ballMaterial);
ball.castShadow = true;
scene.add(ball);

const planeGeometry = new PlaneGeometry(10, 10, 32, 32);
const planeMaterial = new MeshStandardMaterial({});
const plane = new Mesh(planeGeometry, planeMaterial);
plane.position.set(-3, -3, 0);
plane.lookAt(ball.position);
plane.receiveShadow = true;
scene.add(plane);

const directionLight = new DirectionalLight('#fff', 2);
directionLight.position.set(3, 2, 0);
directionLight.castShadow = true;
scene.add(directionLight);

const axesHelper = new AxesHelper(5);
scene.add(axesHelper);

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
