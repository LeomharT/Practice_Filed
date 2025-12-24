import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import {
  ACESFilmicToneMapping,
  Clock,
  Color,
  FrontSide,
  IcosahedronGeometry,
  Layers,
  Mesh,
  MeshBasicMaterial,
  MirroredRepeatWrapping,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderChunk,
  ShaderMaterial,
  TextureLoader,
  Uniform,
  WebGLRenderer,
  WebGLRenderTarget,
  type IUniform,
} from 'three';
import {
  GLTFLoader,
  HDRLoader,
  OrbitControls,
  Reflector,
  TrackballControls,
} from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import floorFragmentShader from './shader/floor/fragment.glsl?raw';
import floorVertexShader from './shader/floor/vertex.glsl?raw';
import simplex3DNoise from './shader/include/simplex3DNoise.glsl?raw';
import mirrowFragmentShader from './shader/mirrow/fragment.glsl?raw';
import mirrowVertexShader from './shader/mirrow/vertex.glsl?raw';
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
camera.position.set(2, 2, 2);
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

const sceneTexture = new WebGLRenderTarget(
  window.innerWidth,
  window.innerHeight,
  { generateMipmaps: true }
);

/**
 * World
 */

const uniforms: Record<string, IUniform<any>> = {
  uTime: new Uniform(0.0),
};

const planeGeometry = new PlaneGeometry(2, 2, 64, 64);

const reflector = new Reflector(planeGeometry);
reflector.rotation.x = -Math.PI / 2;
reflector.position.y = -0.001;

if (reflector.material instanceof ShaderMaterial) {
  uniforms['uDiffuse'] = reflector.material.uniforms.tDiffuse;
  uniforms['uTextureMatrix'] = reflector.material.uniforms.textureMatrix;

  console.log(uniforms);
}

scene.add(reflector);

const planeMaterial = new ShaderMaterial({
  vertexShader: floorVertexShader,
  fragmentShader: floorFragmentShader,
  transparent: false,
  wireframe: false,
  side: FrontSide,
  uniforms,
});

const plane = new Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

const ballGeometry = new IcosahedronGeometry(0.1, 3);
const ballMaterial = new MeshBasicMaterial({
  color: 'yellow',
});

const ball = new Mesh(ballGeometry, ballMaterial);
scene.add(ball);

const mirrowGeometry = new PlaneGeometry(0.5, 0.5);
const mirrowMaterial = new ShaderMaterial({
  vertexShader: mirrowVertexShader,
  fragmentShader: mirrowFragmentShader,
  uniforms: {
    uSceneTexture: new Uniform(sceneTexture.texture),
  },
});

const mirrow = new Mesh(mirrowGeometry, mirrowMaterial);
mirrow.position.set(1.25, 1.25, 1.25);
scene.add(mirrow);

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
pane.addBinding(planeMaterial, 'wireframe');

/**
 * Events
 */

function renderSceneTexture() {
  renderer.setRenderTarget(sceneTexture);

  mirrow.visible = false;
  sceneTexture.texture.needsUpdate = true;
  renderer.render(scene, camera);
  mirrow.visible = true;

  renderer.setRenderTarget(null);
}

function render() {
  fpsGraph.begin();
  // Time
  const elapsed = clock.getElapsedTime();
  const delta = clock.getDelta();

  // Render
  renderSceneTexture();
  renderer.render(scene, camera);

  // Update
  controls.update(delta);
  controls2.update();
  uniforms.uTime.value += 0.01;

  ball.position.x = Math.cos(elapsed * 0.5) * 0.5;
  ball.position.y = Math.max(0.25, Math.sin(elapsed) * 1.0);
  ball.position.z = Math.sin(elapsed * 0.5) * 0.5;

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
