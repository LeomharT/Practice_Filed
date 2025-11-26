import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import {
  ACESFilmicToneMapping,
  Clock,
  Color,
  DirectionalLight,
  Layers,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshDepthMaterial,
  MeshStandardMaterial,
  MirroredRepeatWrapping,
  Object3D,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  RGBADepthPacking,
  Scene,
  ShaderChunk,
  ShaderMaterial,
  SphereGeometry,
  TextureLoader,
  Uniform,
  Vector2,
  WebGLRenderer,
} from 'three';
import CustomShaderMaterial from 'three-custom-shader-material/vanilla';
import {
  EffectComposer,
  GLTFLoader,
  HDRLoader,
  OrbitControls,
  OutputPass,
  RenderPass,
  ShaderPass,
  TrackballControls,
  UnrealBloomPass,
} from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import bloomFragmentShader from './shader/bloom/fragment.glsl?raw';
import bloomVertexShader from './shader/bloom/vertex.glsl?raw';
import disslutionFragmentShader from './shader/disslution/fragment.glsl?raw';
import disslutionVertexShader from './shader/disslution/vertex.glsl?raw';
import simplex3DNoise from './shader/include/simplex3DNoise.glsl?raw';
import './style.css';

(ShaderChunk as any)['simplex3DNoise'] = simplex3DNoise;

const el = document.querySelector('#root') as HTMLDivElement;
const size = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2.0, window.devicePixelRatio),
};

const LAYER = {
  BLOOM: 1,
  RAIN: 2,
};

const layer = new Layers();
layer.set(LAYER.BLOOM);

/**
 * Loader
 */

const hdrLoader = new HDRLoader();
hdrLoader.setPath('/src/assets/hdr/');

const textureLoader = new TextureLoader();
textureLoader.setPath('/src/assets/textures/');

const gltfLoader = new GLTFLoader();
gltfLoader.setPath('/src/assets/models/');

/**
 * Models
 */

const spaceshipModel = await gltfLoader.loadAsync('sapceship.glb');

/**
 * Textures
 */

const noiseTexture = textureLoader.load('noiseTexture.png');
noiseTexture.wrapT = noiseTexture.wrapS = MirroredRepeatWrapping;

/**
 * Basic
 */

const renderer = new WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(size.pixelRatio);
renderer.toneMapping = ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
el.append(renderer.domElement);

const scene = new Scene();
const sceneColor = new Color('#2e2e2e');
scene.background = sceneColor;

const camera = new PerspectiveCamera(50, size.width / size.height, 0.1, 1000);
camera.position.set(4, 4, 4);
camera.lookAt(scene.position);
camera.layers.enable(LAYER.BLOOM);
camera.layers.enable(LAYER.RAIN);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.enabled = true;

const controls2 = new TrackballControls(camera, renderer.domElement);
controls2.noPan = true;
controls2.noRotate = true;
controls2.noZoom = false;

const clock = new Clock();

const darkMaterial = new MeshBasicMaterial({ color: '#000000' });
const materials: Record<string, Material> = {};

/**
 * Post processing
 */

const renderScene = new RenderPass(scene, camera);
const outputPass = new OutputPass();
const bloomPass = new UnrealBloomPass(
  new Vector2(size.width, size.height),
  0.5,
  0.5,
  1.0
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
      uDiffuse: new Uniform(null),
      uBloomTexture: new Uniform(bloomComposer.renderTarget2.texture),
    },
  }),
  'uDiffuse'
);

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(mixPass);
composer.addPass(outputPass);

/**
 * World
 */

const uniforms = {
  uColor: new Uniform(new Color('#391085')),
  uEdgeColor: new Uniform(new Color('#780650')),
  uProgress: new Uniform(-1.0),
  uFrequency: new Uniform(2.5),
};

const sphereGeometry = new SphereGeometry(1, 128, 128);
const sphereMaterial = new ShaderMaterial({
  uniforms,
  vertexShader: disslutionVertexShader,
  fragmentShader: disslutionFragmentShader,
});
const sphere = new Mesh(sphereGeometry, sphereMaterial);
sphere.castShadow = true;
sphere.receiveShadow = true;
sphere.layers.set(LAYER.BLOOM);

const depthMaterial = new CustomShaderMaterial({
  baseMaterial: MeshDepthMaterial,
  uniforms,
  depthPacking: RGBADepthPacking,
  vertexShader: disslutionVertexShader,
  fragmentShader: disslutionFragmentShader,
});
sphere.customDepthMaterial = depthMaterial;
scene.add(sphere);

const planeGeometry = new PlaneGeometry(5, 5, 36, 36);
const planeMaterial = new MeshStandardMaterial({
  color: 0xffffff,
});
const plane = new Mesh(planeGeometry, planeMaterial);
plane.rotation.y = Math.PI / 2;
plane.position.x = -2;
plane.receiveShadow = true;
scene.add(plane);

const directionLight = new DirectionalLight(0xffffff, 5.0);
directionLight.position.set(2, 0, 0);
directionLight.castShadow = true;
directionLight.shadow.mapSize.set(size.width, size.height);
scene.add(directionLight);

/**
 * Pane
 */

const pane = new Pane({ title: 'Debug Params' });
pane.element.parentElement!.style.width = '380px';
pane.registerPlugin(EssentialsPlugin);
const fpsGraph: any = pane.addBlade({
  view: 'fpsgraph',
  label: undefined,
  rows: 4,
});

pane.addBinding(uniforms.uColor, 'value', {
  label: 'Color',
  color: { type: 'float' },
});
pane.addBinding(uniforms.uProgress, 'value', {
  label: 'Progress',
  step: 0.001,
  min: -1.0,
  max: 1.0,
});
pane.addBinding(uniforms.uFrequency, 'value', {
  label: 'Progress',
  step: 0.001,
  min: 1.0,
  max: 3.0,
});
/**
 * Events
 */

function renderBloomScene() {
  scene.traverse(darkenMaterials);
  scene.background = null;

  bloomComposer.render();

  scene.traverse(restoreMaterials);
  scene.background = sceneColor;
}

function render() {
  fpsGraph.begin();
  // Time
  const delta = clock.getDelta();

  // Render
  // renderer.render(scene, camera);
  renderBloomScene();
  composer.render(delta);

  // Update
  controls.update(delta);
  controls2.update();

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

function darkenMaterials(obj: Object3D) {
  if (obj instanceof Mesh && layer.test(obj.layers) === false) {
    materials[obj.uuid] = obj.material;
    obj.material = darkMaterial;
  }
}

function restoreMaterials(obj: Object3D) {
  if (obj instanceof Mesh && materials[obj.uuid]) {
    obj.material = materials[obj.uuid];
    delete materials[obj.uuid];
  }
}
