import { Colors } from '@blueprintjs/colors';
import {
  Color,
  DoubleSide,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Uniform,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import fragmentShader from './shader/test/fragment.glsl?raw';
import vertexShader from './shader/test/vertex.glsl?raw';
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

/**
 * World
 */

const uniforms = {
  uTime: new Uniform(0),
  uColor: new Uniform(new Color(Colors.BLUE4)),
  uWidth: new Uniform(16.0),
};

const planeGeometry = new PlaneGeometry(16, 2, 16, 16);
const planeMaterial = new ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
  side: DoubleSide,
});
const plane = new Mesh(planeGeometry, planeMaterial);
scene.add(plane);

const plane2Geometry = new PlaneGeometry(8, 2, 16, 16);
const plane2Material = new ShaderMaterial({
  uniforms: {
    uTime: new Uniform(0),
    uWidth: new Uniform(8.0),
  },
  vertexShader,
  fragmentShader,
  side: DoubleSide,
});
const plane2 = new Mesh(plane2Geometry, plane2Material);
plane2.position.z += 1;
scene.add(plane2);

const pane = new Pane({ title: 'Debug Pane' });
pane
  .addBinding(uniforms.uColor, 'value', {
    color: { type: 'float' },
  })
  .on('change', (val) => {
    uniforms.uColor.value = new Color(val.value).convertSRGBToLinear();
  });

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
