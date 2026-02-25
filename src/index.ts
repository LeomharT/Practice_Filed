import {
  AxesHelper,
  Color,
  CubeCamera,
  CylinderGeometry,
  FogExp2,
  IcosahedronGeometry,
  InstancedBufferAttribute,
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
  UniformsLib,
  UniformsUtils,
  Vector3,
  WebGLCubeRenderTarget,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import {
  EffectComposer,
  OrbitControls,
  OutputPass,
  RenderPass,
  ShaderPass,
} from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import effectFragmentShader from './shader/effect/fragment.glsl?raw';
import effectVertexShader from './shader/effect/vertex.glsl?raw';
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

const fog = new FogExp2(background, 0.03);

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

const renderScene = new RenderPass(scene, camera);
const mixPass = new ShaderPass(
  new ShaderMaterial({
    vertexShader: effectVertexShader,
    fragmentShader: effectFragmentShader,
    uniforms: {
      uDiffuse: new Uniform(null),
    },
  }),
  'uDiffuse',
);
const outputPass = new OutputPass();

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(mixPass);
composer.addPass(outputPass);

/**
 * World
 */
const params = {
  count: 5000,
  time: 0,
  speed: 20,
};

const uniforms = UniformsUtils.merge([
  UniformsLib['fog'],
  { uTime: new Uniform(0) },
]);

const startGeometry = new CylinderGeometry(0.3, 0.3, 10, 16, 16);
startGeometry.rotateX(Math.PI / 2);
const startMaterial = new ShaderMaterial({
  vertexShader: starVertexShader,
  fragmentShader: starFragmentShader,
  uniforms,
  transparent: true,
  blending: NormalBlending,
  fog: true,
});
const starts = new InstancedMesh(startGeometry, startMaterial, params.count);
const obj = new Object3D();

const positions = Array.from({ length: params.count }, () => [
  random(-100, 100),
  random(-100, 100),
  random(-100, 100),
]);

const offsetArr = new Float32Array(params.count).map(
  (_, index) => positions[index][2],
);
const offsetAttr = new InstancedBufferAttribute(offsetArr, 1);
startGeometry.setAttribute('aOffset', offsetAttr);

function upadteInstances() {
  for (let i = 0; i < params.count; i++) {
    const p = positions[i];
    obj.position.set(p[0], p[1], 0);
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
  metalness: 0.4,
  transparent: true,
  color: 'white',
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
  uniforms.uTime.value += delta;
  renderPMREM();
  updateTest(elapsed);

  sphere.visible = false;
  cubeCamera.update(renderer, scene);
  sphere.visible = true;

  if (sphere.material instanceof MeshStandardMaterial) {
    sphere.material.envMap = cubeRenderTarget.texture;
  }

  // Render
  // renderer.render(scene, camera);
  composer.render();
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
