import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import {
  AxesHelper,
  Color,
  FogExp2,
  Mesh,
  MirroredRepeatWrapping,
  PerspectiveCamera,
  Scene,
  ShaderChunk,
  ShaderMaterial,
  SphereGeometry,
  TextureLoader,
  Timer,
  Uniform,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import simplex3DNoise from './shader/include/simplex3DNoise.glsl?raw';
import testFragmentShader from './shader/test/fragment.glsl?raw';
import testVertexShader from './shader/test/vertex.glsl?raw';
import './style.css';

(ShaderChunk as any)['simplex3DNoise'] = simplex3DNoise;

const el = document.querySelector('#root');

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

const background = new Color('#1e1e1e');

const fog = new FogExp2(background, 0.03);

const textureLoader = new TextureLoader();
textureLoader.setPath('/src/assets/textures/');

const renderer = new WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(size.pixelRatio);
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = background;
scene.fog = fog;

const camera = new PerspectiveCamera(75, size.width / size.height, 0.1, 1000);
camera.position.set(0, 1, 2);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const clock = new Timer();

const noiseTexture = textureLoader.load('noiseTexture.png');
noiseTexture.wrapS = noiseTexture.wrapT = MirroredRepeatWrapping;

/**
 * World
 */

const uniforms = {
  uTime: new Uniform(0),
};

const sphereGeometry = new SphereGeometry(1, 64, 64);
const sphereMaterial = new ShaderMaterial({
  vertexShader: testVertexShader,
  fragmentShader: testFragmentShader,
  uniforms,
});
const sphere = new Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);

/**
 * Helper
 */

const axesHelper = new AxesHelper();
scene.add(axesHelper);

/**
 * Pane
 */

const pane = new Pane({ title: 'Debug' });
pane.element.parentElement!.style.width = '380px';
pane.registerPlugin(EssentialsPlugin);

const fpsGraph: any = pane.addBlade({
  view: 'fpsgraph',
  label: undefined,
  rows: 4,
});

/**
 * Event
 */

function render() {
  fpsGraph.begin();

  // Time
  const delta = clock.getDelta();
  const elapsed = clock.getElapsed();

  uniforms.uTime.value += delta;

  // Update
  clock.update();
  controls.update();

  // Render
  renderer.render(scene, camera);
  // Animation
  requestAnimationFrame(render);

  fpsGraph.end();
}
render();

function resize() {
  size.width = window.innerWidth;
  size.height = window.innerHeight;

  renderer.setSize(size.width, size.height);

  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
