import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import {
  Color,
  Layers,
  Material,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  ShaderChunk,
  ShaderMaterial,
  SphereGeometry,
  Uniform,
  Vector2,
  WebGLRenderer,
} from 'three';
import {
  EffectComposer,
  GLTFLoader,
  OrbitControls,
  OutputPass,
  RenderPass,
  ShaderPass,
  UnrealBloomPass,
} from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import bloomFragmentShader from './shader/bloom/fragment.glsl?raw';
import bloomVertexShader from './shader/bloom/vertex.glsl?raw';
import dissolutionFragmentShader from './shader/dissolution/fragment.glsl?raw';
import dissolutionVertexShader from './shader/dissolution/vertex.glsl?raw';
import simplex3DNoise from './shader/include/simplex3DNoise.glsl?raw';
import './style.css';

(ShaderChunk as any)['simplex3DNoise'] = simplex3DNoise;

const darkMaterial = new MeshBasicMaterial({ color: '#000000' });
const background = new Color('#1e1e1e');
const materials: Record<string, Material> = {};

const BLOOM_LAYER = new Layers();
BLOOM_LAYER.set(1);

/** DOM */
const root = document.querySelector('#root');

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2.0, window.devicePixelRatio),
};

const gltfLoader = new GLTFLoader();
gltfLoader.setPath('/src/assets/models/');

const renderer = new WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(size.pixelRatio);
root?.append(renderer.domElement);

const scene = new Scene();
scene.background = background;

const camera = new PerspectiveCamera(75, size.width / size.height, 0.1, 1000);
camera.position.set(2, 2, 2);
camera.lookAt(scene.position);
camera.layers.enable(1);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(
  new Vector2(size.width, size.height),
  0.85,
  0.1,
  0.0,
);

const bloomComposer = new EffectComposer(renderer);

bloomComposer.renderToScreen = false;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

const mixPass = new ShaderPass(
  new ShaderMaterial({
    vertexShader: bloomVertexShader,
    fragmentShader: bloomFragmentShader,
    uniforms: {
      uDiffuseColor: new Uniform(null),
      uBloomTexture: new Uniform(bloomComposer.renderTarget2.texture),
    },
  }),
  'uDiffuseColor',
);

const outputPass = new OutputPass();

const composer = new EffectComposer(renderer);
composer.setSize(size.width, size.height);
composer.addPass(renderScene);
composer.addPass(mixPass);
composer.addPass(outputPass);

const uniforms = {
  uFrequency: new Uniform(2.0),
  uProgress: new Uniform(0.0),
};

/** World */
const sphereGeometry = new SphereGeometry(1, 128, 128);
const sphereMaterial = new ShaderMaterial({
  uniforms,
  vertexShader: dissolutionVertexShader,
  fragmentShader: dissolutionFragmentShader,
});

const sphere = new Mesh(sphereGeometry, sphereMaterial);
sphere.layers.set(1);
scene.add(sphere);

/** Helper */

/** Pane */
const pane = new Pane({ title: 'Debug Param' });
pane.element.parentElement!.style.width = '380px';
pane.registerPlugin(EssentialsPlugin);

const fpsGraph: any = pane.addBlade({
  view: 'fpsgraph',
  label: undefined,
  rows: 4,
});

pane.addBinding(uniforms.uFrequency, 'value', {
  label: 'frequency',
  step: 0.01,
  min: 1,
  max: 10,
});
pane.addBinding(uniforms.uProgress, 'value', {
  label: 'progress',
  step: 0.01,
  min: 0,
  max: 1,
});

const folder_camera = pane.addFolder({ title: '📷 Camera' });
folder_camera
  .addBinding(camera, 'fov', {
    step: 1,
    min: 20,
    max: 90,
  })
  .on('change', () => {
    camera.updateProjectionMatrix();
  });

function renderBloom() {
  scene.background = null;
  darkenMaterial();

  bloomComposer.render();

  restoreMaterial();
  scene.background = background;
}

function render() {
  fpsGraph.begin();
  // Update
  controls.update();
  // Render
  renderBloom();
  composer.render();
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

function darkenMaterial() {
  scene.traverse((obj) => {
    if (obj instanceof Mesh && obj.layers.test(BLOOM_LAYER) === false) {
      materials[obj.uuid] = obj.material;
      obj.material = darkMaterial;
    }
  });
}

function restoreMaterial() {
  scene.traverse((obj) => {
    if (obj instanceof Mesh && materials[obj.uuid]) {
      obj.material = materials[obj.uuid];
      delete materials[obj.uuid];
    }
  });
}
