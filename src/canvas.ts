import {
  BoxGeometry,
  HalfFloatType,
  IcosahedronGeometry,
  Layers,
  Material,
  Mesh,
  MeshBasicMaterial,
  NeutralToneMapping,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderChunk,
  ShaderMaterial,
  Timer,
  Uniform,
  Vector2,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import {
  EffectComposer,
  OrbitControls,
  OutputPass,
  RenderPass,
  ShaderPass,
  UnrealBloomPass,
} from 'three/examples/jsm/Addons.js';
import simplex2DNoise from './shader/include/simplex2DNoise.glsl?raw';
import simplex4DNoise from './shader/include/simplex4DNoise.glsl?raw';
import bloomFragmentShader from './shader/test/bloom/fragment.glsl?raw';
import bloomVertexShader from './shader/test/bloom/vertex.glsl?raw';
import fragmentShader from './shader/test/fragment.glsl?raw';
import vertexShader from './shader/test/vertex.glsl?raw';

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
renderer.toneMapping = NeutralToneMapping;
el?.append(renderer.domElement);

const scene = new Scene();

const camera = new PerspectiveCamera(75, size.width / size.height, 0.1, 1000);
camera.position.set(0, 0, 3);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const timer = new Timer();

const frameRender = new WebGLRenderTarget(size.width, size.height, {
  generateMipmaps: true,
  samples: 4,
});

const renderScene = new RenderPass(scene, camera);
const outputPass = new OutputPass();
const bloomPass = new UnrealBloomPass(new Vector2(size.width, size.height), 1.0, 0.5, 0.0);

const bloomComposer = new EffectComposer(
  renderer,
  new WebGLRenderTarget(size.width, size.height, {
    type: HalfFloatType,
  }),
);
bloomComposer.renderToScreen = false;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

const mixPass = new ShaderPass(
  new ShaderMaterial({
    uniforms: {
      uDiffuse: new Uniform(null),
      uBloomTexture: new Uniform(bloomComposer.renderTarget2.texture),
    },
    vertexShader: bloomVertexShader,
    fragmentShader: bloomFragmentShader,
  }),
  'uDiffuse',
);
mixPass.needsSwap = true;

const composer = new EffectComposer(
  renderer,
  new WebGLRenderTarget(size.width * size.pixelRatio, size.height * size.pixelRatio, {
    samples: 4,
    generateMipmaps: true,
    type: HalfFloatType,
  }),
);
composer.addPass(renderScene);
composer.addPass(mixPass);
composer.addPass(outputPass);

const BLOOM_LAYER = 1;

const layer = new Layers();
layer.set(BLOOM_LAYER);

const materials: Record<string, Material> = {};
const darkMaterial = new MeshBasicMaterial({ color: '#000000' });

/**
 * World
 */

const uniforms = {
  uTime: new Uniform(0),
  uFrame: new Uniform(frameRender.texture),
};

const planeGeometry = new PlaneGeometry(1, 1, 128, 128);
const planeMaterial = new ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
});
const plane = new Mesh(planeGeometry, planeMaterial);
plane.position.set(1, 1, 1);
scene.add(plane);

const ball = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial());
ball.visible = false;
scene.add(ball);

const r = 3;

const sun = new Mesh(
  new IcosahedronGeometry(0.1, 3),
  new MeshBasicMaterial({
    color: 'yellow',
  }),
);
sun.layers.enable(BLOOM_LAYER);
scene.add(sun);

/**
 * Debug
 */

/**
 * Events
 */

function renderFrame() {
  renderer.setRenderTarget(frameRender);
  plane.visible = false;
  ball.visible = true;
  renderer.render(scene, camera);
  plane.visible = true;
  ball.visible = false;
  renderer.setRenderTarget(null);
}

function darkenMaterial(obj: Object3D) {
  if (obj instanceof Mesh && obj.layers.test(layer) === false) {
    materials[obj.uuid] = obj.material;
    obj.material = darkMaterial;
  }
}

function restoreMaterial(obj: Object3D) {
  if (obj instanceof Mesh && materials[obj.uuid]) {
    obj.material = materials[obj.uuid];
    delete materials[obj.uuid];
  }
}

function render() {
  // Update
  timer.update();
  const delta = timer.getDelta();

  controls.update(delta);

  uniforms.uTime.value += delta;

  // Render

  // renderFrame();

  scene.traverse(darkenMaterial);
  bloomComposer.render();
  scene.traverse(restoreMaterial);
  composer.render();

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
