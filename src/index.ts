import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import {
  ACESFilmicToneMapping,
  AmbientLight,
  Clock,
  Color,
  Layers,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  MirroredRepeatWrapping,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  Scene,
  ShaderChunk,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import {
  GLTFLoader,
  HDRLoader,
  OrbitControls,
  TrackballControls,
} from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
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
el.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color('#1e1e1e');

const camera = new PerspectiveCamera(50, size.width / size.height, 0.1, 1000);
camera.position.set(4, 0, 0);
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

const raycaster = new Raycaster();

/**
 * World
 */

const spaceship = spaceshipModel.scene;
spaceship.scale.setScalar(0.1);
spaceship.position.x = -0.7;

spaceship.traverse((obj) => {
  if (obj instanceof Mesh) {
    if (obj.material instanceof MeshStandardMaterial) {
      obj.material.depthTest = true;
      obj.material.depthWrite = true;
    }
  }
});

scene.add(spaceship);

const planeGeometry = new PlaneGeometry(5, 5, 64, 64);
const planeMaterial = new MeshBasicMaterial({
  color: '#722ed1',
  wireframe: true,
  visible: false,
});

const plane = new Mesh(planeGeometry, planeMaterial);
plane.rotation.y = Math.PI / 2;
scene.add(plane);

const ambientLight = new AmbientLight(0xffffff, 1.0);
scene.add(ambientLight);

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

/**
 * Events
 */

const point = new Vector2();
const intersectPoint = new Vector3();

let translateY = 0;
let accelerationY = 0;

let angleZ = 0;
let accelerationZ = 0;

const up = new Vector3(0, 1, 0);

function updateSpaceshipPosition() {
  const target = {
    y: intersectPoint.y,
    z: intersectPoint.z,
  };

  accelerationY += (target.y - translateY) * 0.002;
  accelerationY *= 0.95;
  translateY += accelerationY;

  // Angle
  const dir = intersectPoint
    .clone()
    .sub(new Vector3(0, translateY, 0))
    .normalize();

  const dirCos = dir.dot(up);
  const angle = Math.acos(dirCos) - Math.PI / 2;

  accelerationZ += (angle - angleZ) * 0.06;
  accelerationZ *= 0.85;
  angleZ = accelerationZ;

  spaceship.position.y = translateY;

  spaceship.rotation.x = angleZ;
  spaceship.rotation.z = angleZ;
}

function render() {
  fpsGraph.begin();
  // Time
  const delta = clock.getDelta();

  // Render
  renderer.render(scene, camera);

  // Update
  controls.update(delta);
  controls2.update();
  updateSpaceshipPosition();

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

function onPointerMove(e: PointerEvent) {
  point.x = (e.clientX / window.innerWidth) * 2 - 1;
  point.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(point, camera);

  const intersects = raycaster.intersectObject(plane);

  if (intersects.length) {
    intersects[0].point.x = 3.0;
    intersectPoint.copy(intersects[0].point);
  }
}

window.addEventListener('pointermove', onPointerMove);
