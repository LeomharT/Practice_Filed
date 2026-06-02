import {
  AmbientLight,
  AxesHelper,
  ClampToEdgeWrapping,
  Color,
  DirectionalLight,
  DodecahedronGeometry,
  Euler,
  Mesh,
  MeshPhysicalMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  Scene,
  ShadowMaterial,
  SRGBColorSpace,
  TextureLoader,
  Timer,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { ThreePerf } from 'three-perf';
import { DecalGeometry, OrbitControls, TrackballControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import './style.css';

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

const el = document.querySelector('#root');

const textureLoader = new TextureLoader();

const reactTexture = textureLoader.load('/react.png');
reactTexture.colorSpace = SRGBColorSpace;
reactTexture.wrapS = ClampToEdgeWrapping;
reactTexture.wrapT = ClampToEdgeWrapping;

const renderer = new WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFShadowMap;
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color('#f3f3f3');

const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(2, 2, 2);
camera.lookAt(scene.position);

const controls1 = new TrackballControls(camera, renderer.domElement);
controls1.enabled = true;
controls1.noRotate = true;
controls1.noPan = true;
controls1.noZoom = false;

const controls2 = new OrbitControls(camera, renderer.domElement);
controls2.enableDamping = true;
controls2.enablePan = true;
controls2.enableRotate = true;
controls2.enableZoom = false;

const timer = new Timer();

const raycaster = new Raycaster();
const mouse = new Vector2();

// World

const floorGeometry = new PlaneGeometry(10, 10, 32, 32);
const floorMaterial = new ShadowMaterial({
  transparent: true,
});
const floor = new Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const ballGeometry = new DodecahedronGeometry(0.5, 0);
const ballMaterial = new MeshPhysicalMaterial({});
const ball = new Mesh(ballGeometry, ballMaterial);
ball.castShadow = true;
ball.receiveShadow = true;
ball.position.y = 0.5;
ball.updateMatrixWorld(true);
scene.add(ball);

const stickerReactMaterial = new MeshPhysicalMaterial({
  map: reactTexture,
  transparent: true,
  polygonOffset: true,
  polygonOffsetFactor: -4,
  depthTest: true,
  depthWrite: false,
  metalness: 0.7,
  thickness: 0,
  ior: 1.5,
  iridescence: 1,
  iridescenceIOR: 1,
  iridescenceThicknessRange: [300, 1500],
});
let stickerReact: Mesh | undefined;

const params = {
  position: new Vector3(-0.09, 0.92, 0.12),
  orientation: new Vector3(-1.06, 0.02, 0),
};

function createDecalReact(_params: typeof params) {
  if (stickerReact) {
    stickerReact.geometry.dispose();
    ball.remove(stickerReact);
    stickerReact = undefined;
  }
  const geometry = new DecalGeometry(
    ball,
    _params.position,
    new Euler().setFromVector3(_params.orientation),
    new Vector3(0.15, 0.15, 0.15),
  );
  stickerReact = new Mesh(geometry, stickerReactMaterial);
  ball.add(stickerReact);
}

createDecalReact(params);

const axesHelper = new AxesHelper();
scene.add(axesHelper);

// Light
const ambientLight = new AmbientLight(0xf3f3f3, 0.05);
scene.add(ambientLight);

const directionLight = new DirectionalLight(0xf3f3f3, 5.35);
directionLight.position.y = 30;
directionLight.castShadow = true;
directionLight.shadow.mapSize.set(sizes.width, sizes.height);
directionLight.shadow.needsUpdate = true;
directionLight.shadow.blurSamples = 18;
scene.add(directionLight);

const perf = new ThreePerf({
  anchorX: 'left',
  anchorY: 'top',
  domElement: document.body,
  renderer: renderer,
  backgroundOpacity: 1,
});

const pane = new Pane({
  title: 'Debug',
});
pane.addBinding(params, 'position', { step: 0.01 }).on('change', () => {
  createDecalReact(params);
});
pane.addBinding(params, 'orientation', { step: 0.01 }).on('change', () => {
  createDecalReact(params);
});

pane.addBinding(stickerReactMaterial, 'ior', { min: 1, max: 2.333, step: 0.001 });
pane.addBinding(stickerReactMaterial, 'iridescence', { min: 0, max: 1, step: 0.001 });
pane.addBinding(stickerReactMaterial, 'iridescenceIOR', { min: 1, max: 2.333, step: 0.001 });

function render() {
  perf.begin();

  // Update
  timer.update();

  controls1.update();
  controls2.update();

  const delta = timer.getDelta();
  const elapsed = timer.getElapsed();

  // Render
  renderer.render(scene, camera);
  perf.end();
  // Animation
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

window.addEventListener('pointerdown', (e) => {
  mouse.x = (e.clientX / sizes.width) * 2 - 1;
  mouse.y = -(e.clientY / sizes.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersect = raycaster.intersectObject(ball);

  if (intersect.length) {
    console.log(intersect[0].point);
    console.log(intersect[0].face?.normal);
  }
});
