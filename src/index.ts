import { Colors } from '@blueprintjs/colors';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import { createNoise2D } from 'simplex-noise';
import {
  AxesHelper,
  Color,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Mesh,
  MeshStandardMaterial,
  MirroredRepeatWrapping,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderChunk,
  ShaderMaterial,
  SRGBColorSpace,
  TextureLoader,
  Timer,
  Uniform,
  Vector4,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import grassFragmentShader from './shader/grass/fragmeng.glsl?raw';
import grassVertexShader from './shader/grass/vertex.glsl?raw';
import simplex3DNoise from './shader/include/simplex3DNoise.glsl?raw';
import './style.css';

(ShaderChunk as any)['simplex3DNoise'] = simplex3DNoise;

const el = document.querySelector('#root');

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

const noise2D = createNoise2D();

const background = new Color(Colors.LIGHT_GRAY3);

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

const camera = new PerspectiveCamera(75, size.width / size.height, 0.1, 1000);
camera.position.set(0, 2, 3);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const clock = new Timer();

const noiseTexture = textureLoader.load('noiseTexture.png');
noiseTexture.wrapS = noiseTexture.wrapT = MirroredRepeatWrapping;

const bladeAlphaTexture = textureLoader.load('blade_alpha.jpg');
const bladeDiffuseTexture = textureLoader.load('blade_diffuse.jpg');
bladeDiffuseTexture.anisotropy = 8;
bladeDiffuseTexture.colorSpace = SRGBColorSpace;

/**
 * World
 */

const groundGeometry = new PlaneGeometry(100, 100, 32, 32);
groundGeometry.rotateX(-Math.PI / 2);
const positionArr = groundGeometry.getAttribute('position').array;
for (let i = 0; i < positionArr.length; i += 3) {
  positionArr[i + 1] += getYPosition(positionArr[i + 0], positionArr[i + 2]);
}
groundGeometry.attributes.position.needsUpdate = true;
groundGeometry.computeVertexNormals();

const groundMaterial = new MeshStandardMaterial({
  color: '#000f00',
  wireframe: true,
});
const ground = new Mesh(groundGeometry, groundMaterial);
scene.add(ground);

const options = { bW: 0.12, bH: 1, joints: 5 };

const GRASS_BLADE_INSTANCE = 200000;

function getAttributeData(instance: number, width: number) {
  const offsets: number[] = [];

  //The min and max angle for the growth direction (in radians)
  const min = -0.25;
  const max = 0.25;

  for (let i = 0; i < GRASS_BLADE_INSTANCE; i++) {
    //Offset of the roots
    const offsetX = Math.random() * width - width / 2;
    const offsetZ = Math.random() * width - width / 2;
    const offsetY = getYPosition(offsetX, offsetZ);
    offsets.push(offsetX, offsetY, offsetZ);
  }

  return {
    offsets,
  };
}

const uniforms = {
  uTime: new Uniform(0),
  uAlphaTexture: new Uniform(bladeAlphaTexture),
  uDiffuseTexture: new Uniform(bladeDiffuseTexture),
};

const { offsets } = getAttributeData(GRASS_BLADE_INSTANCE, 100);

const baseGeo = new PlaneGeometry(
  options.bW,
  options.bH,
  1,
  options.joints,
).translate(0, options.bH / 2, 0);

const grassGeometry = new InstancedBufferGeometry();
grassGeometry.index = baseGeo.index;
grassGeometry.instanceCount = GRASS_BLADE_INSTANCE;
grassGeometry.setAttribute('position', baseGeo.getAttribute('position'));
grassGeometry.setAttribute('uv', baseGeo.getAttribute('uv'));
grassGeometry.setAttribute(
  'aOffset',
  new InstancedBufferAttribute(new Float32Array(offsets), 3),
);

const grassMaterial = new ShaderMaterial({
  vertexShader: grassVertexShader,
  fragmentShader: grassFragmentShader,
  uniforms,
  wireframe: false,
});

console.log(grassGeometry);

const grass = new Mesh(grassGeometry, grassMaterial);
scene.add(grass);

/**
 * Helper
 */

const axesHelper = new AxesHelper(20);
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

function getYPosition(x: number, z: number) {
  let y = 2 * noise2D(x / 50, z / 50);
  y += 4 * noise2D(x / 100, z / 100);
  y += 0.2 * noise2D(x / 10, z / 10);
  return y;
}

function multiplyQuaternions(q1: Vector4, q2: Vector4) {
  const x = q1.x * q2.w + q1.y * q2.z - q1.z * q2.y + q1.w * q2.x;
  const y = -q1.x * q2.z + q1.y * q2.w + q1.z * q2.x + q1.w * q2.y;
  const z = q1.x * q2.y - q1.y * q2.x + q1.z * q2.w + q1.w * q2.z;
  const w = -q1.x * q2.x - q1.y * q2.y - q1.z * q2.z + q1.w * q2.w;
  return new Vector4(x, y, z, w);
}

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
