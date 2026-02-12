import {
  BoxGeometry,
  Color,
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
  OrbitControls,
  OutputPass,
  RenderPass,
  ShaderPass,
  UnrealBloomPass,
} from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import ballFragmentShader from './shader/ball/fragment.glsl?raw';
import ballVertexShader from './shader/ball/vertex.glsl?raw';
import simplex3DNoise from './shader/include/simplex3DNoise.glsl?raw';
import './style.css';

(ShaderChunk as any)['simplex3DNoise'] = simplex3DNoise;

const el = document.querySelector('#root');

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

const background = new Color('#1e1e1e');

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
camera.position.set(2, 2, 2);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const renderScene = new RenderPass(scene, camera);
const outputPass = new OutputPass();

const bloomPass = new UnrealBloomPass(
  new Vector2(size.width, size.height),
  0.985,
  0.5,
  0.0,
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
};

const sphereGeometry = new SphereGeometry(1, 64, 64);
const sphereMaterial = new ShaderMaterial({
  uniforms,
  transparent: true,
  vertexShader: ballVertexShader,
  fragmentShader: ballFragmentShader,
});
const ball = new Mesh(sphereGeometry, sphereMaterial);
scene.add(ball);

const lightObj = new Mesh(
  new BoxGeometry(1, 1, 1),
  new MeshBasicMaterial({
    color: '#ffffff',
  }),
);
lightObj.position.z = -2.0;
scene.add(lightObj);

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

function render() {
  // Update
  controls.update();
  // Render
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
