import { Colors } from '@blueprintjs/colors';
import {
  AxesHelper,
  Color,
  FrontSide,
  Matrix4,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderChunk,
  ShaderMaterial,
  Texture,
  Uniform,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import {
  GLTFLoader,
  OrbitControls,
  Reflector,
} from 'three/examples/jsm/Addons.js';
import simplex4DNoise from './shader/include/simplex4DNoise.glsl?raw';
import portalFragmentShader from './shader/portal/fragment.glsl?raw';
import portalVertexShader from './shader/portal/vertex.glsl?raw';
import './style.css';

(ShaderChunk as any)['simplex4DNoise'] = simplex4DNoise;

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2.0, window.devicePixelRatio),
};

const el = document.querySelector('#root');

const background = new Color(Colors.BLACK);

const gltfLoader = new GLTFLoader();

const renderer = new WebGLRenderer({
  antialias: true,
  alpha: true,
});
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(size.pixelRatio);
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = background;

const camera = new PerspectiveCamera(75, size.width / size.height, 0.1, 1000);
camera.position.set(0, 3, 3);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const portalRenderTarget = new WebGLRenderTarget(size.width, size.height, {
  generateMipmaps: true,
});

const uniforms = {
  uTime: new Uniform(0),
  uTextureMatrix: new Uniform(new Matrix4()),
  uReflectionTexture: new Uniform(new Texture()),
};

const model = await gltfLoader.loadAsync('/low_poly_mccree/scene.gltf');
const mccree = model.scene;
mccree.position.z = -0.25;
controls.target.y = 1.0;
scene.add(mccree);

const portalGeometry = new PlaneGeometry(5, 5, 128, 128);

const reflector = new Reflector(portalGeometry, {
  textureWidth: size.width,
  textureHeight: size.height,
});
reflector.rotation.x = -Math.PI / 2;
reflector.position.y = -0.001;
scene.add(reflector);

portalGeometry.computeTangents();
const portalMaterial = new ShaderMaterial({
  vertexShader: portalVertexShader,
  fragmentShader: portalFragmentShader,
  uniforms,
  wireframe: false,
  side: FrontSide,
});
if (reflector.material instanceof ShaderMaterial) {
  uniforms['uTextureMatrix'].value =
    reflector.material.uniforms['textureMatrix'].value;
  uniforms['uReflectionTexture'].value =
    reflector.material.uniforms['tDiffuse'].value;
}

const wobble = new Mesh(portalGeometry, portalMaterial);
wobble.rotation.x = -Math.PI / 2;
scene.add(wobble);

const tempColor = new Color(Colors.BLUE1);

/**
 * Helpers
 */

const axesHelper = new AxesHelper(3);
scene.add(axesHelper);

function render() {
  // Update
  controls.update();
  uniforms['uTime'].value += 0.01;

  // Redner
  renderer.render(scene, camera);
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
