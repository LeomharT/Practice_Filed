import {
  AxesHelper,
  Color,
  CubeCamera,
  CylinderGeometry,
  FogExp2,
  InstancedMesh,
  Layers,
  LinearMipmapLinearFilter,
  Mesh,
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
  WebGLCubeRenderTarget,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import simplex3DNoise from './shader/include/simplex3DNoise.glsl?raw';
import starFragmentShader from './shader/start/fragment.glsl?raw';
import starVertexShader from './shader/start/vertex.glsl?raw';
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

const cubeCamera = new CubeCamera(1, 100000, cubeRenderTarget);

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
  roughness: 0.4,
  metalness: 0.5,
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

function render() {
  // Time
  const delta = clock.getDelta();
  // Update
  clock.update();
  controls.update();
  uniforms.uTime.value += 0.01;
  upadteInstances(delta);
  renderPMREM();

  sphere.visible = false;
  cubeCamera.update(renderer, scene);
  sphere.visible = true;

  sphere.material.envMap = cubeRenderTarget.texture;

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
