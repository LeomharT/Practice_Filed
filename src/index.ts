import {
  AxesHelper,
  Color,
  CubeCamera,
  CylinderGeometry,
  FogExp2,
  IcosahedronGeometry,
  InstancedMesh,
  Layers,
  LinearMipmapLinearFilter,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  NormalBlending,
  Object3D,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  ShaderChunk,
  ShaderMaterial,
  SphereGeometry,
  Timer,
  Uniform,
  Vector3,
  WebGLCubeRenderTarget,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import simplex3DNoise from './shader/include/simplex3DNoise.glsl?raw';
import starFragmentShader from './shader/start/fragment.glsl?raw';
import starVertexShader from './shader/start/vertex.glsl?raw';
import testFragmentShader from './shader/test/fragment.glsl?raw';
import testVertexShader from './shader/test/vertex.glsl?raw';

import './style.css';

function random(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

(ShaderChunk as any)['simplex3DNoise'] = simplex3DNoise;

const el = document.querySelector('#root');

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

const layers = {
  bloom: 1,
};
const layer = new Layers();
layer.set(layers.bloom);
const background = new Color('#1e1e1e');

const fog = new FogExp2(background, 0.4);

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
camera.position.set(0, 0, 5);
camera.lookAt(scene.position);
camera.layers.enable(layers.bloom);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const clock = new Timer();

let envMap: WebGLRenderTarget | undefined;

const pmremGenerator = new PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

const cubeRenderTarget = new WebGLCubeRenderTarget(256, {
  generateMipmaps: true,
  minFilter: LinearMipmapLinearFilter,
});

const cubeCamera = new CubeCamera(1.0, 100000, cubeRenderTarget);

/**
 * World
 */
const params = {
  count: 2000,
  time: 0,
  speed: 20,
};

const uniforms = {
  uTime: new Uniform(0),
};

const startGeometry = new CylinderGeometry(0.3, 0.3, 10, 32, 32);
startGeometry.rotateX(Math.PI / 2);
const startMaterial = new ShaderMaterial({
  vertexShader: starVertexShader,
  fragmentShader: starFragmentShader,
  uniforms,
  transparent: true,
  blending: NormalBlending,
});
const starts = new InstancedMesh(startGeometry, startMaterial, params.count);
const obj = new Object3D();

const positions = Array.from({ length: params.count }, () => [
  random(-100, 100),
  random(-100, 100),
  random(-100, 100),
]);

function upadteInstances(time: number = 0) {
  for (let i = 0; i < params.count; i++) {
    const p = positions[i];
    p[2] += time * 20;
    if (p[2] > 100) {
      p[2] = random(-100, 100) - 100;
    }
    obj.position.set(p[0], p[1], p[2]);
    obj.updateMatrix();
    starts.setMatrixAt(i, obj.matrix);
  }
  starts.instanceMatrix.needsUpdate = true;
}
upadteInstances();
scene.add(starts);

const sphereGeometry = new SphereGeometry(1, 32, 32);
const sphereMaterial = new MeshStandardMaterial({
  fog: false,
  roughness: 0.2,
  metalness: 0.8,
  transparent: true,
});
const uniforms_ = {
  uDirection: new Uniform(new Vector3()),
};
const testMaterial = new ShaderMaterial({
  uniforms: uniforms_,
  vertexShader: testVertexShader,
  fragmentShader: testFragmentShader,
});
const sphere = new Mesh(sphereGeometry, testMaterial);
scene.add(sphere);

const envObj1 = new Mesh(
  new IcosahedronGeometry(0.1, 3),
  new MeshBasicMaterial({ color: '#123ffc' }),
);

scene.add(envObj1);

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

/**
 * Event
 */

function renderPMREM() {
  if (envMap) envMap.dispose();
  envMap = pmremGenerator.fromScene(scene, 0, 0.1, 1000);

  // if (envMap) {
  //   sphere.material.envMap = envMap.texture;
  // }
}

function updateTest(time: number) {
  const radius = 2;

  envObj1.position.x = Math.cos(time) * radius;
  envObj1.position.y = Math.sin(time * 3) * 0.5;
  envObj1.position.z = Math.sin(time) * radius;

  uniforms_.uDirection.value.copy(envObj1.position.clone().normalize());
}

function render() {
  // Time
  const delta = clock.getDelta();
  const elapsed = clock.getElapsed();

  // Update
  clock.update();
  controls.update();
  uniforms.uTime.value += 0.01;
  upadteInstances(delta);
  renderPMREM();
  updateTest(elapsed);

  sphere.visible = false;
  cubeCamera.update(renderer, scene);
  sphere.visible = true;

  // sphere.material.envMap = cubeRenderTarget.texture;

  // Render
  renderer.render(scene, camera);
  // Animation
  requestAnimationFrame(render);
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
