import { Colors } from '@blueprintjs/colors';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import { createNoise2D } from 'simplex-noise';
import {
  AxesHelper,
  Color,
  DirectionalLight,
  DoubleSide,
  IcosahedronGeometry,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  MathUtils,
  Mesh,
  MeshDepthMaterial,
  MeshStandardMaterial,
  MirroredRepeatWrapping,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  RGBADepthPacking,
  Scene,
  ShaderChunk,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  TextureLoader,
  Timer,
  Uniform,
  Vector3,
  Vector4,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import CustomShaderMaterial from 'three-custom-shader-material/vanilla';
import { OrbitControls, Sky } from 'three/examples/jsm/Addons.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Pane } from 'tweakpane';
import grassFragmentShader from './shader/grass/fragment.glsl?raw';
import grassVertexShader from './shader/grass/vertex.glsl?raw';
import simplex2DNoise from './shader/include/simplex2DNoise.glsl?raw';
import simplex3DNoise from './shader/include/simplex3DNoise.glsl?raw';
import simplex4DNoise from './shader/include/simplex4DNoise.glsl?raw';
import mirrowFragmentShader from './shader/mirrow/fragment.glsl?raw';
import mirrowVertexShader from './shader/mirrow/vertex.glsl?raw';
import sphereFragmentShader from './shader/sphere/fragment.glsl?raw';
import sphereVertexShader from './shader/sphere/vertex.glsl?raw';
import './style.css';
(ShaderChunk as any)['simplex3DNoise'] = simplex3DNoise;
(ShaderChunk as any)['simplex2DNoise'] = simplex2DNoise;
(ShaderChunk as any)['simplex4DNoise'] = simplex4DNoise;

const el = document.querySelector('#root');

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

const noise2D = createNoise2D();

const background = new Color(Colors.LIGHT_GRAY3);

const textureLoader = new TextureLoader();
textureLoader.setPath('/src/assets/textures/');

const renderer = new WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(size.pixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFShadowMap;
// renderer.toneMapping = ACESFilmicToneMapping;
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = background;

const camera = new PerspectiveCamera(75, size.width / size.height, 0.1, 1000);
camera.position.set(5, 20, -15);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const clock = new Timer();

const noiseTexture = textureLoader.load('noiseTexture.png');
noiseTexture.wrapS = noiseTexture.wrapT = MirroredRepeatWrapping;

const bladeAlphaTexture = textureLoader.load('blade_alpha.jpg');
const bladeDiffuseTexture = textureLoader.load('blade_diffuse.jpg');
bladeDiffuseTexture.anisotropy = 8;
bladeDiffuseTexture.colorSpace = SRGBColorSpace;

const pmrem = new PMREMGenerator(renderer);

let envMap: WebGLRenderTarget | undefined = undefined;

const sceneRenderTarget = new WebGLRenderTarget(
  size.width / 2,
  size.height / 2,
  {
    generateMipmaps: true,
  },
);

/**
 * World
 */

const groundGeometry = new PlaneGeometry(100, 100, 32, 32);
groundGeometry.rotateX(-Math.PI / 2);
const positionArr = groundGeometry.getAttribute('position').array;
for (let i = 0; i < positionArr.length; i += 3) {
  positionArr[i + 1] += getYPosition(positionArr[i + 0], positionArr[i + 2]);
}
groundGeometry.attributes.position.needsUpdate = true;
groundGeometry.computeVertexNormals();

const groundMaterial = new MeshStandardMaterial({
  color: '#000f00',
  wireframe: false,
  side: DoubleSide,
});
const ground = new Mesh(groundGeometry, groundMaterial);
scene.add(ground);

const options = { bW: 0.12, bH: 1, joints: 5 };

const GRASS_BLADE_INSTANCE = 200000;

function getAttributeData(instance: number, width: number) {
  const offsets: number[] = [];
  const orientations: number[] = [];
  const stretches: number[] = [];
  const halfRootAngleSin: number[] = [];
  const halfRootAngleCos: number[] = [];

  let quaternion_0 = new Vector4();
  let quaternion_1 = new Vector4();

  //The min and max angle for the growth direction (in radians)
  const min = -0.25;
  const max = 0.25;

  for (let i = 0; i < instance; i++) {
    //Offset of the roots
    let offsetX = Math.random() * width - width / 2;
    let offsetZ = Math.random() * width - width / 2;

    const distance = offsetX * offsetX + offsetZ * offsetZ;

    // if (Math.pow(distance, 2.0) < 100.0) {
    //   offsetX += Math.random() * 10;
    //   offsetZ += Math.random() * 10;
    // }

    const offsetY = getYPosition(offsetX, offsetZ);
    offsets.push(offsetX, offsetY, offsetZ);

    //Define random growth directions
    //Rotate around Y
    let angle = Math.PI - Math.random() * (2 * Math.PI);
    halfRootAngleSin.push(Math.sin(0.5 * angle));
    halfRootAngleCos.push(Math.cos(0.5 * angle));

    let RotationAxis = new Vector3(0, 1, 0);
    let x = RotationAxis.x * Math.sin(angle / 2.0);
    let y = RotationAxis.y * Math.sin(angle / 2.0);
    let z = RotationAxis.z * Math.sin(angle / 2.0);
    let w = Math.cos(angle / 2.0);
    quaternion_0.set(x, y, z, w).normalize();

    //Rotate around X
    angle = Math.random() * (max - min) + min;
    RotationAxis = new Vector3(1, 0, 0);
    x = RotationAxis.x * Math.sin(angle / 2.0);
    y = RotationAxis.y * Math.sin(angle / 2.0);
    z = RotationAxis.z * Math.sin(angle / 2.0);
    w = Math.cos(angle / 2.0);
    quaternion_1.set(x, y, z, w).normalize();

    //Combine rotations to a single quaternion
    quaternion_0 = multiplyQuaternions(quaternion_0, quaternion_1);

    //Rotate around Z
    angle = Math.random() * (max - min) + min;
    RotationAxis = new Vector3(0, 0, 1);
    x = RotationAxis.x * Math.sin(angle / 2.0);
    y = RotationAxis.y * Math.sin(angle / 2.0);
    z = RotationAxis.z * Math.sin(angle / 2.0);
    w = Math.cos(angle / 2.0);
    quaternion_1.set(x, y, z, w).normalize();

    //Combine rotations to a single quaternion
    quaternion_0 = multiplyQuaternions(quaternion_0, quaternion_1);

    orientations.push(
      quaternion_0.x,
      quaternion_0.y,
      quaternion_0.z,
      quaternion_0.w,
    );

    // Define variety in height
    if (i < GRASS_BLADE_INSTANCE / 3) {
      stretches.push(Math.random() * 1.8);
    } else {
      stretches.push(Math.random());
    }
  }

  return {
    offsets,
    halfRootAngleCos,
    halfRootAngleSin,
    stretches,
    orientations,
  };
}

const uniforms = {
  uTime: new Uniform(0),
  uAlphaTexture: new Uniform(bladeAlphaTexture),
  uDiffuseTexture: new Uniform(bladeDiffuseTexture),
  uTipColor: new Uniform(new Color(0.0, 0.6, 0.0).convertSRGBToLinear()),
  uTipColor2: new Uniform(new Color(0.0, 0.2, 0.1).convertSRGBToLinear()),
  uBottomColor: new Uniform(new Color(0.0, 0.1, 0.0).convertSRGBToLinear()),
  uNoiseTexture: new Uniform(noiseTexture),
};

const { offsets, halfRootAngleCos, halfRootAngleSin, stretches, orientations } =
  getAttributeData(GRASS_BLADE_INSTANCE, 100);

const baseGeo = new PlaneGeometry(
  options.bW,
  options.bH,
  1,
  options.joints,
).translate(0, options.bH / 2, 0);

const grassGeometry = new InstancedBufferGeometry();
grassGeometry.index = baseGeo.index;
grassGeometry.instanceCount = GRASS_BLADE_INSTANCE;
grassGeometry.setAttribute('position', baseGeo.getAttribute('position'));
grassGeometry.setAttribute('uv', baseGeo.getAttribute('uv'));
grassGeometry.setAttribute(
  'aOffset',
  new InstancedBufferAttribute(new Float32Array(offsets), 3),
);
grassGeometry.setAttribute(
  'aHalfRootAngleCos',
  new InstancedBufferAttribute(new Float32Array(halfRootAngleCos), 1),
);
grassGeometry.setAttribute(
  'aHalfRootAngleSin',
  new InstancedBufferAttribute(new Float32Array(halfRootAngleSin), 1),
);
grassGeometry.setAttribute(
  'aOrientation',
  new InstancedBufferAttribute(new Float32Array(orientations), 4),
);
grassGeometry.setAttribute(
  'aStretches',
  new InstancedBufferAttribute(new Float32Array(stretches), 1),
);

const grassMaterial = new ShaderMaterial({
  vertexShader: grassVertexShader,
  fragmentShader: grassFragmentShader,
  uniforms,
  wireframe: false,
  side: DoubleSide,
});

const grass = new Mesh(grassGeometry, grassMaterial);
scene.add(grass);

const sphereGeometry = new SphereGeometry(4, 32, 32);
const sphereMaterial = new MeshStandardMaterial({
  metalness: 0.5,
  roughness: 0.74,
});
const sphere = new Mesh(sphereGeometry, sphereMaterial);

scene.add(sphere);

const sky = new Sky();
sky.scale.setScalar(10000);
const sun = new Vector3();
const effectController = {
  turbidity: 10,
  rayleigh: 3,
  mieCoefficient: 0.005,
  mieDirectionalG: 0.7,
  elevation: 2,
  azimuth: 180,
  exposure: renderer.toneMappingExposure,
  cloudCoverage: 0.4,
  cloudDensity: 0.4,
  cloudElevation: 0.5,
};
function guiChanged() {
  const uniforms = sky.material.uniforms;
  uniforms['turbidity'].value = effectController.turbidity;
  uniforms['rayleigh'].value = effectController.rayleigh;
  uniforms['mieCoefficient'].value = effectController.mieCoefficient;
  uniforms['mieDirectionalG'].value = effectController.mieDirectionalG;
  uniforms['cloudCoverage'].value = effectController.cloudCoverage;
  uniforms['cloudDensity'].value = effectController.cloudDensity;
  uniforms['cloudElevation'].value = effectController.cloudElevation;

  const phi = MathUtils.degToRad(90 - effectController.elevation);
  const theta = MathUtils.degToRad(effectController.azimuth);

  sun.setFromSphericalCoords(1, phi, theta);

  uniforms['sunPosition'].value.copy(sun);

  renderer.toneMappingExposure = effectController.exposure;
}
guiChanged();
scene.add(sky);

const uniforms_ = {
  uProgress: new Uniform(0),
  uTime: uniforms['uTime'],
};

const disslutionMaterial = new ShaderMaterial({
  vertexShader: sphereVertexShader,
  fragmentShader: sphereFragmentShader,
  uniforms: uniforms_,
});

const disslutionGeometry = mergeVertices(new IcosahedronGeometry(2.5, 50));
disslutionGeometry.computeTangents();

const depthMaterial = new CustomShaderMaterial({
  baseMaterial: MeshDepthMaterial,
  vertexShader: sphereVertexShader,
  fragmentShader: sphereFragmentShader,
  uniforms: uniforms_,
  depthPacking: RGBADepthPacking,
});
depthMaterial.defines = { IS_DEPTH_MATERIAL: true };

const disslution = new Mesh(disslutionGeometry, disslutionMaterial);
disslution.position.y = 15;
disslution.castShadow = true;
disslution.receiveShadow = true;

disslution.customDepthMaterial = depthMaterial;
scene.add(disslution);

const shadowPlane = new Mesh(
  new PlaneGeometry(20, 20, 16, 16),
  new MeshStandardMaterial({ shadowSide: DoubleSide }),
);
shadowPlane.receiveShadow = true;
shadowPlane.position.y = 15;
shadowPlane.position.z = 8;
shadowPlane.lookAt(disslution.position);
scene.add(shadowPlane);

const mirrowGeometry = new PlaneGeometry(3, 3, 32, 32);
const mirrowMaterial = new ShaderMaterial({
  wireframe: false,
  vertexShader: mirrowVertexShader,
  fragmentShader: mirrowFragmentShader,
  uniforms: {
    uDiffuseTexture: new Uniform(sceneRenderTarget.texture),
  },
});
const mirrow = new Mesh(mirrowGeometry, mirrowMaterial);
mirrow.rotateY(Math.PI);
mirrow.position.set(0, 15, -5);
scene.add(mirrow);

const floorGeometry = new PlaneGeometry(10, 10, 32, 32);
const floorMaterial = new ShaderMaterial();
const floor = new Mesh(floorGeometry, floorMaterial);
floor.position.set(2, 5, -3);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

/**
 * Light
 */

const directionalLight = new DirectionalLight(0xffffff, 2);
directionalLight.castShadow = true;
directionalLight.position.z = -10;
directionalLight.position.y = 0;
directionalLight.shadow.camera.top = 25;
directionalLight.shadow.camera.far = 20;
directionalLight.shadow.camera.updateProjectionMatrix();
directionalLight.shadow.needsUpdate = true;
directionalLight.shadow.mapSize.set(256, 256);
scene.add(directionalLight);

/**
 * Helper
 */

const axesHelper = new AxesHelper(20);
scene.add(axesHelper);

/**
 * Pane
 */

const pane = new Pane({ title: 'Debug' });
pane.element.parentElement!.style.width = '380px';
pane.registerPlugin(EssentialsPlugin);

const fpsGraph: any = pane.addBlade({
  view: 'fpsgraph',
  label: undefined,
  rows: 4,
});

const f_grass = pane.addFolder({ title: '🌱 Grass Blead' });

f_grass.addBinding(uniforms.uTipColor, 'value', {
  label: 'uTipColor',
  color: { type: 'float' },
});
f_grass.addBinding(uniforms.uBottomColor, 'value', {
  label: 'uBottomColor',
  color: { type: 'float' },
});

const f_sphere = pane.addFolder({ title: 'Sphere' });
f_sphere.addBinding(uniforms_.uProgress, 'value', {
  step: 0.01,
  min: 0,
  max: 1,
});

/**
 * Event
 */

function getYPosition(x: number, z: number) {
  let y = 2 * noise2D(x / 50, z / 50);
  y += 4 * noise2D(x / 100, z / 100);
  y += 0.2 * noise2D(x / 10, z / 10);
  return y;
}

function multiplyQuaternions(q1: Vector4, q2: Vector4) {
  const x = q1.x * q2.w + q1.y * q2.z - q1.z * q2.y + q1.w * q2.x;
  const y = -q1.x * q2.z + q1.y * q2.w + q1.z * q2.x + q1.w * q2.y;
  const z = q1.x * q2.y - q1.y * q2.x + q1.z * q2.w + q1.w * q2.z;
  const w = -q1.x * q2.x - q1.y * q2.y - q1.z * q2.z + q1.w * q2.w;
  return new Vector4(x, y, z, w);
}

function renderEnvScene() {
  if (envMap) envMap.dispose();
  envMap = pmrem.fromScene(scene, 0.0, 0.01, 100, {});

  sphereMaterial.envMap = envMap.texture;
}

function renderScene() {
  renderer.setRenderTarget(sceneRenderTarget);
  mirrow.visible = false;
  renderer.render(scene, camera);
  mirrow.visible = true;
  renderer.setRenderTarget(null);
}

function render() {
  fpsGraph.begin();

  // Time
  const delta = clock.getDelta();
  const elapsed = clock.getElapsed();

  uniforms.uTime.value += delta * 0.5;

  // Update
  clock.update();
  controls.update();

  // Render
  renderScene();
  renderEnvScene();
  renderer.render(scene, camera);
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
