import {
  BoxGeometry,
  Color,
  Layers,
  Material,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderChunk,
  ShaderMaterial,
  SphereGeometry,
  Uniform,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import {
  EffectComposer,
  OrbitControls,
  OutputPass,
  Reflector,
  RenderPass,
  ShaderPass,
  UnrealBloomPass,
} from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import ballFragmentShader from './shader/ball/fragment.glsl?raw';
import ballVertexShader from './shader/ball/vertex.glsl?raw';
import bloomFragmentShader from './shader/bloom/fragment.glsl?raw';
import bloomVertexShader from './shader/bloom/vertex.glsl?raw';
import simplex3DNoise from './shader/include/simplex3DNoise.glsl?raw';
import mirrowFragmentShader from './shader/mirrow/fragment.glsl?raw';
import mirrowVertexShader from './shader/mirrow/vertex.glsl?raw';
import './style.css';

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
const darkMaterial = new MeshBasicMaterial({ color: '#000' });
const materials: Record<string, Material> = {};

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
camera.position.set(2, 3, 2);
camera.lookAt(scene.position);
camera.layers.enable(layers.bloom);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const renderScene = new RenderPass(scene, camera);
const outputPass = new OutputPass();

const bloomPass = new UnrealBloomPass(
  new Vector2(size.width, size.height),
  0.5,
  0.5,
  0.99,
);

const bloomComposer = new EffectComposer(renderer);
bloomComposer.renderToScreen = false;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

const mixPass = new ShaderPass(
  new ShaderMaterial({
    uniforms: {
      uDiffuseColor: new Uniform(null),
      uBloomTexture: new Uniform(bloomComposer.renderTarget2.texture),
    },
    vertexShader: bloomVertexShader,
    fragmentShader: bloomFragmentShader,
  }),
  'uDiffuseColor',
);

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(mixPass);
composer.addPass(outputPass);

/**
 * World
 */
const uniforms = {
  uFrequency: new Uniform(2.0),
  uProgress: new Uniform(0.0),
  uColor: new Uniform(new Color('#531dab')),
  uEdgeColor: new Uniform(new Color('#c41d7f')),
  uDirection: new Uniform(new Vector3()),
};

const sphereGeometry = new SphereGeometry(1, 64, 64);
const sphereMaterial = new ShaderMaterial({
  uniforms,
  transparent: true,
  vertexShader: ballVertexShader,
  fragmentShader: ballFragmentShader,
});
const ball = new Mesh(sphereGeometry, sphereMaterial);
ball.layers.enable(layers.bloom);
scene.add(ball);

const lightCube = new Mesh(
  new BoxGeometry(0.5, 0.5, 0.5),
  new MeshBasicMaterial({ color: new Color(1, 1, 1) }),
);
scene.add(lightCube);
lightCube.position.x = 2;
lightCube.layers.enable(layers.bloom);
uniforms.uDirection.value.copy(lightCube.position.clone().normalize());

const floorGeometry = new PlaneGeometry(5, 5, 64, 64);
const floorReflector = new Reflector(floorGeometry, {
  textureWidth: size.width,
  textureHeight: size.height,
  clipBias: 0.003,
});
floorReflector.layers.enable(layers.bloom);
floorReflector.rotation.x = -Math.PI / 2;
floorReflector.position.y = -1;
scene.add(floorReflector);

const mirrowGeometry = new PlaneGeometry(1, 1, 16, 16);
const mirrowMaterial = new ShaderMaterial({
  vertexShader: mirrowVertexShader,
  fragmentShader: mirrowFragmentShader,
});

const mirrow = new Mesh(mirrowGeometry, mirrowMaterial);
mirrow.position.set(1, 1, 1);
scene.add(mirrow);

/**
 * Pane
 */

const pane = new Pane({ title: 'Debug' });
pane.element.parentElement!.style.width = '380px';
pane.addBinding(uniforms.uFrequency, 'value', {
  label: 'Frequency',
  min: 1.0,
  max: 10.0,
  step: 0.1,
});
pane.addBinding(uniforms.uProgress, 'value', {
  label: 'Progress',
  min: 0.0,
  max: 1.0,
  step: 0.001,
});

/**
 * Event
 */

function renderBloom() {
  scene.traverse(darkenMatrials);
  scene.background = null;
  bloomComposer.render();
  scene.background = background;
  scene.traverse(restoreMatrial);
}

function render() {
  // Update
  controls.update();
  // Render
  renderBloom();
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

function darkenMatrials(obj: Object3D) {
  if (obj instanceof Mesh && obj.layers.test(layer) === false) {
    materials[obj.uuid] = obj.material;
    obj.material = darkMaterial;
  }
}
function restoreMatrial(obj: Object3D) {
  if (obj instanceof Mesh && materials[obj.uuid]) {
    obj.material = materials[obj.uuid];
    delete materials[obj.uuid];
  }
}
