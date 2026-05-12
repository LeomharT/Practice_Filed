import {
  AxesHelper,
  BoxGeometry,
  Color,
  FloatType,
  HalfFloatType,
  IcosahedronGeometry,
  Layers,
  Material,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  NeutralToneMapping,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  Scene,
  ShaderChunk,
  ShaderMaterial,
  Timer,
  Uniform,
  Vector2,
  Vector3,
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

import { Colors } from '@blueprintjs/colors';
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
const background = new Color(Colors.GRAY1);
scene.background = background;

const camera = new PerspectiveCamera(75, size.width / size.height, 0.1, 1000);
camera.position.set(0, 0, 5);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const timer = new Timer();

const frameRender = new WebGLRenderTarget(size.width, size.height, {
  generateMipmaps: true,
  samples: 4,
});

const bloomScene = new Scene();
const bloomRender = new RenderPass(bloomScene, camera);

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
bloomComposer.addPass(bloomRender);
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
    type: FloatType,
  }),
);
composer.addPass(renderScene);
composer.addPass(mixPass);
composer.addPass(outputPass);

const BLOOM_LAYER = 1;

const layer = new Layers();
layer.set(BLOOM_LAYER);

const materials: Record<string, Material> = {};
const fragments: Record<string, string> = {};
const darkMaterial = new MeshBasicMaterial({ color: '#000000' });
const blackFragment = `
void main() {
  vec3 color = vec3(0.0);
  gl_FragColor = vec4(color, 1.0);
}
`;

const raycaster = new Raycaster();

/**
 * World
 */

const uniforms = {
  uTime: new Uniform(0),
  uFrame: new Uniform(bloomComposer.renderTarget2.texture),
};

const planeGeometry = new PlaneGeometry(1, 1, 128, 128);
const planeMaterial = new ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
});
const plane = new Mesh(planeGeometry, planeMaterial);
plane.position.set(0, 0, 1);
scene.add(plane);

const ball = new Mesh(
  new BoxGeometry(1, 1, 1),
  new MeshBasicMaterial({
    color: new Color(Colors.CERULEAN3),
  }),
);
ball.name = 'Box';
ball.layers.enable(BLOOM_LAYER);
bloomScene.add(ball);

const r = 3;

const sun = new Mesh(
  new IcosahedronGeometry(0.1, 3),
  new MeshBasicMaterial({
    color: 'yellow',
  }),
);
scene.add(sun);

const hoverPlaneGeometry = new PlaneGeometry(10, 10, 16, 16);
const hoverPlaneMaterial = new MeshBasicMaterial({
  wireframe: true,
});
const hoverPlane = new Mesh(hoverPlaneGeometry, hoverPlaneMaterial);
hoverPlane.position.z = 1;
hoverPlane.visible = false;
scene.add(hoverPlane);

/**
 * Debug
 */

const axesHelper = new AxesHelper(3);
scene.add(axesHelper);

/**
 * Events
 */

function renderFrame() {
  renderer.setRenderTarget(frameRender);
  plane.visible = false;
  ball.visible = true;
  renderer.render(scene, camera);
  ball.visible = false;
  plane.visible = true;
  renderer.setRenderTarget(null);
}

function darkenMaterial(obj: Object3D) {
  if (obj instanceof Mesh && obj.layers.test(layer) === false) {
    if (obj.material instanceof ShaderMaterial) {
      fragments[obj.uuid] = obj.material.fragmentShader;
      obj.material.fragmentShader = blackFragment;
      obj.material.needsUpdate = true;
    } else {
      materials[obj.uuid] = obj.material;
      obj.material = darkMaterial;
    }
  }
}

function restoreMaterial(obj: Object3D) {
  if (obj instanceof Mesh && materials[obj.uuid]) {
    obj.material = materials[obj.uuid];
    delete materials[obj.uuid];
  }
  if (obj instanceof Mesh && obj.material instanceof ShaderMaterial && fragments[obj.uuid]) {
    obj.material.fragmentShader = fragments[obj.uuid];
    obj.material.needsUpdate = true;
    delete fragments[obj.uuid];
  }
}

const speed = 8;
const cursor = new Vector2();
const point = new Vector3();

function render() {
  // Update
  timer.update();
  const delta = timer.getDelta();

  controls.update(delta);

  const t = 1 - Math.exp(-speed * delta);

  plane.position.x = MathUtils.lerp(plane.position.x, point.x, t);
  plane.position.y = MathUtils.lerp(plane.position.y, point.y, t);

  uniforms.uTime.value += delta;

  sun.position.x = r * Math.cos(uniforms.uTime.value);
  sun.position.z = r * Math.sin(uniforms.uTime.value);

  // Render

  // scene.traverse(darkenMaterial);
  bloomScene.background = null;
  bloomComposer.render();
  bloomScene.background = background;
  // scene.traverse(restoreMaterial);

  // renderFrame();
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

window.addEventListener('pointermove', (e) => {
  cursor.x = (e.clientX / size.width) * 2.0 - 1.0;
  cursor.y = -(e.clientY / size.height) * 2.0 + 1.0;

  raycaster.setFromCamera(cursor, camera);

  const intersect = raycaster.intersectObject(hoverPlane);

  if (intersect.length) {
    point.copy(intersect[0].point);
  }
});
