import { Colors } from '@blueprintjs/colors';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import {
  AmbientLight,
  AxesHelper,
  ClampToEdgeWrapping,
  Color,
  DirectionalLight,
  DodecahedronGeometry,
  Euler,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
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

const threeTexture = textureLoader.load('/three.png');
threeTexture.colorSpace = SRGBColorSpace;
threeTexture.wrapS = ClampToEdgeWrapping;
threeTexture.wrapT = ClampToEdgeWrapping;

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
const point = new Vector3();

// World

const floorGeometry = new PlaneGeometry(10, 10, 32, 32);
const floorMaterial = new ShadowMaterial({
  transparent: true,
});
const floor = new Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const gridMaterial = new MeshBasicMaterial({
  color: Colors.VIOLET3,
  wireframe: true,
});
const grid = new Mesh(floorGeometry, gridMaterial);
grid.rotation.x = -Math.PI / 2;
scene.add(grid);

const ballGeometry = new DodecahedronGeometry(0.5, 0);
const ballMaterial = new MeshPhysicalMaterial({});
const ball = new Mesh(ballGeometry, ballMaterial);
ball.castShadow = true;
ball.position.y = 0.5;
ball.updateMatrixWorld(true);
scene.add(ball);

const decals = [
  {
    name: 'react',
    position: new Vector3(-0.03, 0.87, 0.09),
    orientation: new Euler(-1.0, 0, 0, 'XYZ'),
    size: new Vector3(0.15, 0.15, 0.15),
    texture: reactTexture,
  },
  {
    name: 'react',
    position: new Vector3(0.21, 0.83, 0.12),
    orientation: new Euler(-1.03, 0.46, -0.26, 'XYZ'),
    size: new Vector3(0.15, 0.15, 0.15),
    texture: threeTexture,
  },
];

function createDecals() {
  for (const decal of decals) {
    const geometry = new DecalGeometry(ball, decal.position, decal.orientation, decal.size);
    const material = new MeshPhysicalMaterial({
      map: decal.texture,
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
    const mesh = new Mesh(geometry, material);
    mesh.position.sub(ball.position);
    ball.add(mesh);
  }
}

createDecals();

const stickerReactMaterial = new MeshPhysicalMaterial({
  map: threeTexture,
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
  position: new Vector3(-0.03, 0.87, 0.09),
  orientation: new Vector3(-1.0, 0, 0),
  iridescenceThicknessRange: { min: 300, max: 1500 },
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
  stickerReact.position.sub(ball.position);
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
directionLight.position.z = 20;
directionLight.castShadow = true;
directionLight.shadow.mapSize.set(4069, 4069);
directionLight.shadow.needsUpdate = true;
directionLight.shadow.blurSamples = 18;
directionLight.shadow.radius = 30;
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
pane.registerPlugin(EssentialsPlugin);

pane.addBinding(params, 'position', { step: 0.01 }).on('change', () => {
  createDecalReact(params);
});
pane.addBinding(params, 'orientation', { step: 0.01 }).on('change', () => {
  createDecalReact(params);
});

pane.addBinding(stickerReactMaterial, 'ior', { min: 1, max: 2.333, step: 0.001 });
pane.addBinding(stickerReactMaterial, 'iridescence', { min: 0, max: 1, step: 0.001 });
pane.addBinding(stickerReactMaterial, 'iridescenceIOR', { min: 1, max: 2.333, step: 0.001 });
pane.addBinding(params, 'iridescenceThicknessRange', { min: 100, max: 2000 });

const speed = 3;

function render() {
  perf.begin();

  // Update
  timer.update();

  controls1.update();
  controls2.update();

  const delta = timer.getDelta();
  const elapsed = timer.getElapsed();

  const t = 1.0 - Math.exp(speed * -delta);

  ball.position.x = MathUtils.lerp(ball.position.x, point.x, t);
  ball.position.z = MathUtils.lerp(ball.position.z, point.z, t);

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

  const intersect = raycaster.intersectObject(grid);

  if (intersect.length) point.copy(intersect[0].point);
});
