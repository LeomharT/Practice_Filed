import {
  AmbientLight,
  AxesHelper,
  Color,
  DirectionalLight,
  FogExp2,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  Scene,
  ShaderMaterial,
  UniformsLib,
  UniformsUtils,
  Vector2,
  WebGLRenderer,
} from 'three';
import {
  GLTFLoader,
  OrbitControls,
  type GLTF,
} from 'three/examples/jsm/Addons.js';
import classes from './index.module.css';
import floorFragmentShader from './shader/floor/fragment.glsl?raw';
import floorVertexShader from './shader/floor/vertex.glsl?raw';
import './style.css';

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2.0, window.devicePixelRatio),
};

const pathes = {
  ambulance: '/ambulance.png',
  delivery: '/delivery.png',
  deliveryFlat: '/deliveryFlat.png',
  firetruck: '/firetruck.png',
} as const;

const pointer = new Vector2();

const el = document.querySelector('#root') as HTMLDivElement;

const gltfLoader = new GLTFLoader();
gltfLoader.setPath('/models/');

const models: Record<keyof typeof pathes, GLTF | undefined> = {
  ambulance: undefined,
  delivery: undefined,
  deliveryFlat: undefined,
  firetruck: undefined,
};

let selectedKey: keyof typeof pathes | undefined = undefined;

/**
 * Basic
 */

const renderer = new WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(size.pixelRatio);
renderer.domElement.addEventListener('dragover', (e) => {
  e.preventDefault();

  pointer.x = (e.clientX / size.width) * 2 - 1;
  pointer.y = -(e.clientY / size.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  const intersect = raycaster.intersectObjects([floor]);
  if (intersect.length && selectedKey) {
    const pointer = intersect[0].point;

    const model = models[selectedKey]!.scene;

    model.scale.setScalar(0.2);
    model.position.copy(pointer);
    scene.add(model);
  }
});
renderer.domElement.addEventListener('drop', (e) => {
  e.preventDefault();
});
el.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color('#1e1e1e');

const camera = new PerspectiveCamera(70, size.width / size.height, 0.1, 1000);
camera.position.set(0, 2, 2);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enabled = true;

const raycaster = new Raycaster();

/**
 * DOM
 */

const panel = document.createElement('div');
panel.classList.add(classes.panel);
el.append(panel);

const wrapper = document.createElement('div');
wrapper.classList.add(classes.wrapper);
panel.append(wrapper);

const list = document.createElement('div');
list.classList.add(classes.list);
wrapper.append(list);

Object.entries(pathes).forEach((value) => {
  gltfLoader.load(value[0] + '.glb', (data) => {
    models[value[0] as keyof typeof pathes] = data;
  });

  const cover = document.createElement('img');
  cover.src = '/preview' + value[1];

  const text = document.createElement('span');
  text.innerText = value[0];

  const item = document.createElement('div');
  item.classList.add(classes.item);
  item.draggable = true;
  item.addEventListener('dragstart', (e) => {
    const img = cover.cloneNode() as HTMLImageElement;
    img.style.opacity = '0.15';

    e.dataTransfer?.setDragImage(img, 32, 32);
    selectedKey = value[0] as keyof typeof pathes;
  });

  item.append(cover);
  item.append(text);
  list.append(item);
});

/**
 * World
 */

const floorGeometry = new PlaneGeometry(10, 10, 64, 64);
const floorMaterial = new ShaderMaterial({
  uniforms: UniformsUtils.merge([
    UniformsLib['fog'], // Include fog uniforms
  ]),
  vertexShader: floorVertexShader,
  fragmentShader: floorFragmentShader,
  transparent: true,
  fog: true,
});

const floor = new Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const fog = new FogExp2(scene.background, 0.2);
scene.fog = fog;

/**
 * Helper
 */
const axesHelper = new AxesHelper(1);
axesHelper.material.fog = false;
scene.add(axesHelper);

const ambientLight = new AmbientLight(0xffffff, 10.0);
scene.add(ambientLight);

const directionLight = new DirectionalLight(0xffffff, 10.0);
scene.add(directionLight);

const directionLight1 = new DirectionalLight(0xffffff, 10.0);
directionLight1.position.x = 1;
scene.add(directionLight1);

const directionLight2 = new DirectionalLight(0xffffff, 10.0);
directionLight2.position.x = -1;
scene.add(directionLight2);

const directionLight3 = new DirectionalLight(0xffffff, 10.0);
directionLight3.position.z = 1;
scene.add(directionLight3);

const directionLight4 = new DirectionalLight(0xffffff, 10.0);
directionLight4.position.z = -1;
scene.add(directionLight4);

/**
 * Events
 */

function render() {
  // Render
  renderer.render(scene, camera);

  // Update
  controls.update();

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
