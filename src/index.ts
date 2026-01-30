import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import {
  AxesHelper,
  BackSide,
  Clock,
  Color,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Spherical,
  SRGBColorSpace,
  TextureLoader,
  Uniform,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls, TrackballControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import atmosphereFragmentShader from './shader/atmosphere/fragment.glsl?raw';
import atmosphereVertexShader from './shader/atmosphere/vertex.glsl?raw';
import earthFragmentShader from './shader/earth/fragment.glsl?raw';
import earthVertexShader from './shader/earth/vertex.glsl?raw';
import './style.css';

/**
 * Variables
 */

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

const el = document.querySelector('#root');

const textureLoader = new TextureLoader();
textureLoader.setPath('/src/assets/textures/');

const earthDayMapTexture = textureLoader.load('2k_earth_daymap.jpg');
earthDayMapTexture.colorSpace = SRGBColorSpace;
earthDayMapTexture.anisotropy = 8;

const earthNightMapTexture = textureLoader.load('2k_earth_nightmap.jpg');
earthNightMapTexture.colorSpace = SRGBColorSpace;
earthNightMapTexture.anisotropy = 8;

const earthSpecularCloudTexture = textureLoader.load('specularClouds.jpg');

/**
 * Basic
 */

const renderer = new WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color('#1e1e1e');

const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(2, 2, 2);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableRotate = true;
controls.enablePan = false;
controls.enableZoom = false;

const controls2 = new TrackballControls(camera, renderer.domElement);
controls2.noRotate = true;
controls2.noPan = true;
controls2.noZoom = false;

const clock = new Clock();

/**
 * World
 */

const uniforms = {
  uTime: new Uniform(0),
  uSunDirection: new Uniform(new Vector3()),
  uDayMapTexture: new Uniform(earthDayMapTexture),
  uNightMapTexture: new Uniform(earthNightMapTexture),
  uSpecularCloudTexture: new Uniform(earthSpecularCloudTexture),
  uCloudVolumn: new Uniform(0.3),
  uAtmosphereDayColor: new Uniform(new Color('#00aaff')),
  uAtmosphereTwilightColor: new Uniform(new Color('#ff6600')),
};

const sunSpherical = new Spherical(1, Math.PI / 2, 0.5);
const sunPosition = new Vector3();

const sunGeometry = new IcosahedronGeometry(0.1, 3);
const sunMaterial = new MeshBasicMaterial({ color: 'yellow' });

const sun = new Mesh(sunGeometry, sunMaterial);
scene.add(sun);

function updateSun() {
  // Position
  sunPosition.setFromSpherical(sunSpherical);
  // Uniform
  uniforms.uSunDirection.value = sunPosition.clone();
  // Mesh Position
  sun.position.copy(sunPosition.clone().multiplyScalar(3.0));
}
updateSun();

const earthGeometry = new SphereGeometry(1, 64, 64);
const earthMaterial = new ShaderMaterial({
  uniforms,
  vertexShader: earthVertexShader,
  fragmentShader: earthFragmentShader,
});
const earth = new Mesh(earthGeometry, earthMaterial);
scene.add(earth);

const atmosphereMaterial = new ShaderMaterial({
  uniforms,
  vertexShader: atmosphereVertexShader,
  fragmentShader: atmosphereFragmentShader,
  side: BackSide,
  transparent: true,
});
const atmosphere = new Mesh(earthGeometry, atmosphereMaterial);
atmosphere.scale.setScalar(1.04);
scene.add(atmosphere);

/**
 * Helpers
 */
const axesHelper = new AxesHelper();
scene.add(axesHelper);

/**
 * Pane
 */

const pane = new Pane({ title: 'Debug Params' });
pane.registerPlugin(EssentialsPlugin);
pane.element.parentElement!.style.width = '380px';
const fpsGraph = pane.addBlade({
  view: 'fpsgraph',
  label: undefined,
  rows: 4,
}) as any;

const sunF = pane.addFolder({ title: '🌞 Sun' });
sunF
  .addBinding(sunSpherical, 'phi', {
    min: 0,
    max: Math.PI,
    step: 0.0001,
  })
  .on('change', updateSun);
sunF
  .addBinding(sunSpherical, 'theta', {
    min: -Math.PI,
    max: Math.PI,
    step: 0.0001,
  })
  .on('change', updateSun);

const cloudF = pane.addFolder({ title: '☁️ Cloud' });
cloudF.addBinding(uniforms.uCloudVolumn, 'value', {
  label: 'Cloud Volumn',
  max: 1.0,
  min: 0.0,
  step: 0.01,
});

/**
 * Events
 */

function render() {
  fpsGraph.begin();

  // Time
  const delta = clock.getDelta();
  const elapsedTime = clock.getElapsedTime();

  // Update
  controls.update();
  controls2.update();

  uniforms.uTime.value = elapsedTime;
  earth.rotation.y += delta * 0.1;
  earth.rotation.y = earth.rotation.y % (Math.PI * 2);

  // Render

  renderer.render(scene, camera);

  // Animation
  requestAnimationFrame(render);

  fpsGraph.end();
}
render();

function resize() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  renderer.setSize(sizes.width, sizes.height);
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
