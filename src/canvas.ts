import { ColliderDesc, RigidBody, RigidBodyDesc, World } from '@dimforge/rapier3d';
import { BloomEffect, EffectComposer, EffectPass, RenderPass } from 'postprocessing';
import {
  AmbientLight,
  AxesHelper,
  BufferAttribute,
  BufferGeometry,
  Color,
  LineBasicMaterial,
  LineSegments,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  Timer,
  Vector3,
  WebGLRenderer,
} from 'three';
import { ThreePerf } from 'three-perf';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { SSGIEffect } from './lib/realism-effects/index';
import './style.css';

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};
const gravity = { x: 0, y: 0, z: 0 };

const el = document.querySelector('#root');

const accents = ['#ff4060', '#ffcc00', '#20ffa0', '#4060ff'];

const shuffle = (accent = 0) => [
  { color: '#444', roughness: 0.1, metalness: 0.5 },
  { color: '#444', roughness: 0.1, metalness: 0.5 },
  { color: '#444', roughness: 0.1, metalness: 0.5 },
  { color: 'white', roughness: 0.1, metalness: 0.1 },
  { color: 'white', roughness: 0.1, metalness: 0.1 },
  { color: 'white', roughness: 0.1, metalness: 0.1 },
  { color: accents[accent], roughness: 0.1, accent: true },
  { color: accents[accent], roughness: 0.1, accent: true },
  { color: accents[accent], roughness: 0.1, accent: true },
  { color: '#444', roughness: 0.1 },
  { color: '#444', roughness: 0.3 },
  { color: '#444', roughness: 0.3 },
  { color: 'white', roughness: 0.1 },
  { color: 'white', roughness: 0.2 },
  { color: 'white', roughness: 0.1 },
  { color: accents[accent], roughness: 0.1, accent: true, transparent: true, opacity: 0.5 },
  { color: accents[accent], roughness: 0.3, accent: true },
  { color: accents[accent], roughness: 0.1, accent: true },
];

const config = {
  importanceSampling: true,
  steps: 20,
  refineSteps: 4,
  spp: 1,
  resolutionScale: 1,
  missedRays: false,
  distance: 5.980000000000011,
  thickness: 2.829999999999997,
  denoiseIterations: 1,
  denoiseKernel: 3,
  denoiseDiffuse: 25,
  denoiseSpecular: 25.54,
  radius: 11,
  phi: 0.5760000000000001,
  lumaPhi: 20.651999999999997,
  depthPhi: 23.37,
  normalPhi: 26.087,
  roughnessPhi: 18.477999999999998,
  specularPhi: 7.099999999999999,
  envBlur: 0.8,
};

const renderer = new WebGLRenderer({
  antialias: false,
  alpha: true,
  powerPreference: 'high-performance',
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
renderer.shadowMap.enabled = true;
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color('#141622');

const camera = new PerspectiveCamera(17.56, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(0, 0, 30);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const timer = new Timer();

// Post processing
const composer = new EffectComposer(renderer, {
  alpha: true,
  multisampling: 0,
});
composer.setSize(sizes.width, sizes.height);

const renderPass = new RenderPass(scene, camera);

const bloomPass = new BloomEffect({
  mipmapBlur: true,
  luminanceThreshold: 0.1,
  intensity: 0.9,
  levels: 7,
});

const ssgiPass = new SSGIEffect(composer, scene, camera, { ...config });

composer.addPass(renderPass);
composer.addPass(new EffectPass(camera, ssgiPass));
composer.addPass(new EffectPass(camera, bloomPass));

// World
let accent = 0;

const world = new World(gravity);
const debug = new LineSegments(new BufferGeometry(), new LineBasicMaterial());
debug.frustumCulled = false;
scene.add(debug);

const spheres: Record<
  string,
  {
    mesh: Mesh<SphereGeometry, MeshStandardMaterial>;
    body: RigidBody;
    accent?: boolean;
  }
> = {};
const sphereGeometry = new SphereGeometry(1, 64, 64);

function createSphere({ accent, ...props }: ReturnType<typeof shuffle>[number]) {
  const material = new MeshStandardMaterial({
    ...props,
  });
  const mesh = new Mesh(sphereGeometry, material);
  return mesh;
}

for (const i of shuffle(accent)) {
  const sphere = createSphere(i);

  const pos = new Vector3(
    MathUtils.randFloatSpread(10),
    MathUtils.randFloatSpread(10),
    MathUtils.randFloatSpread(10),
  );

  const rigidBodyDesc = RigidBodyDesc.dynamic();
  rigidBodyDesc.setTranslation(pos.x, pos.y, pos.z);
  rigidBodyDesc.setLinearDamping(4);
  rigidBodyDesc.setAngularDamping(1);
  const rigidBody = world.createRigidBody(rigidBodyDesc);

  const colliderDesc = ColliderDesc.ball(1);
  colliderDesc.setFriction(0.1);
  world.createCollider(colliderDesc, rigidBody);

  spheres[sphere.uuid] = {
    mesh: sphere,
    body: rigidBody,
    accent: i.accent,
  };

  scene.add(sphere);
}

const axesHelper = new AxesHelper(5);
scene.add(axesHelper);

const ambientLight = new AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const perf = new ThreePerf({
  anchorX: 'left',
  anchorY: 'top',
  domElement: document.body, // or other canvas rendering wrapper
  renderer: renderer, // three js renderer instance you use for rendering
});

// Events

function updateDebug() {
  const { vertices, colors } = world.debugRender();

  debug.geometry.setAttribute('position', new BufferAttribute(vertices, 3));
  debug.geometry.setAttribute('color', new BufferAttribute(colors, 4));
}

const c = new Color();
const v = new Vector3();
const lambda = 2.5;

function updateSphere(delta: number) {
  c.set(accents[accent]);

  for (const key in spheres) {
    const { mesh, body, accent } = spheres[key];

    mesh.position.copy(body.translation());
    mesh.quaternion.copy(body.rotation());

    body.applyImpulse(v.copy(body.translation()).negate().multiplyScalar(0.2), true);

    if (accent) {
      mesh.material.color.r = MathUtils.damp(mesh.material.color.r, c.r, lambda, delta);
      mesh.material.color.g = MathUtils.damp(mesh.material.color.g, c.g, lambda, delta);
      mesh.material.color.b = MathUtils.damp(mesh.material.color.b, c.b, lambda, delta);
    }
  }
}

function click() {
  accent = ++accent % accents.length;
}

function render() {
  perf.begin();

  // Update
  timer.update();

  const delta = timer.getDelta();

  world.step();
  controls.update();

  updateSphere(delta);
  // Render
  updateDebug();
  composer.render();

  perf.end();

  //Animation
  requestAnimationFrame(render);
}

render();

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  renderer.setSize(sizes.width, sizes.height);

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
});

window.addEventListener('pointerdown', click);
