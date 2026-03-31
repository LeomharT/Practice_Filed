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
  Timer,
  Uniform,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Pane } from 'tweakpane';
import simplex3DNoise from './shader/include/simplex3DNoise.glsl?raw';
import simplex4DNoise from './shader/include/simplex4DNoise.glsl?raw';
import testFragmentShader from './shader/test/fragment.glsl?raw';
import testVertexShader from './shader/test/vertex.glsl?raw';
import './style.css';

(ShaderChunk as any)['simplex3DNoise'] = simplex3DNoise;
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

const clock = new Timer();

/**
 * World
 */

const uniforms = {
  uTime: new Uniform(0),
  uFrequency: new Uniform(1.0),
  uProgress: new Uniform(0.0),
  uSunDirection: new Uniform(new Vector3()),
};

const ballGeometry = mergeVertices(new IcosahedronGeometry(2.5, 50));
ballGeometry.computeTangents();
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
uniforms.uSunDirection.value.copy(directionLight.position.normalize());

const axesHelper = new AxesHelper(5);
scene.add(axesHelper);

const pane = new Pane({ title: 'debug' });
pane.addBinding(uniforms.uFrequency, 'value', {
  label: 'Frequency',
  step: 0.001,
  min: 0,
  max: 5,
});
pane.addBinding(uniforms.uProgress, 'value', {
  label: 'Progress',
  step: 0.001,
  min: 0,
  max: 5,
});

function render() {
  uniforms.uTime.value = clock.getElapsed();

  clock.update();
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
