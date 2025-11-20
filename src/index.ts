import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import {
	ACESFilmicToneMapping,
	Clock,
	Color,
	EquirectangularReflectionMapping,
	IcosahedronGeometry,
	Layers,
	Mesh,
	MeshBasicMaterial,
	MirroredRepeatWrapping,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	ShaderChunk,
	ShaderMaterial,
	SRGBColorSpace,
	TextureLoader,
	Uniform,
	WebGLRenderer,
	WebGLRenderTarget,
	type IUniform,
} from 'three';
import {
	GLTFLoader,
	HDRLoader,
	OrbitControls,
	Reflector,
	TrackballControls,
} from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import floorFragmentShader from './shader/floor/fragment.glsl?raw';
import floorVertexShader from './shader/floor/vertex.glsl?raw';
import simplex3DNoise from './shader/include/simplex3DNoise.glsl?raw';
import rainFragmentShader from './shader/rain/fragment.glsl?raw';
import rainVertexShader from './shader/rain/vertex.glsl?raw';
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

/**
 * Textures
 */

const rainNormal = textureLoader.load('rainNormal.png');

const noiseTexture = textureLoader.load('noiseTexture.png');
noiseTexture.wrapT = noiseTexture.wrapS = MirroredRepeatWrapping;

hdrLoader.load('rural_evening_road_1k.hdr', (data) => {
	data.mapping = EquirectangularReflectionMapping;
	scene.background = data;
});

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
camera.position.set(4, 4, 4);
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

const frameRenderTarget = new WebGLRenderTarget(size.width, size.height, {
	generateMipmaps: true,
	colorSpace: SRGBColorSpace,
});

/**
 * World
 */

const sphereGeometry = new IcosahedronGeometry(0.1, 3);
const sphereMaterial = new MeshBasicMaterial({
	color: 'yellow',
});
const sphere = new Mesh(sphereGeometry, sphereMaterial);
sphere.position.y = 0.5;
scene.add(sphere);

const floorGeometry = new PlaneGeometry(3, 3, 64, 64);

const floorReflector = new Reflector(floorGeometry, {
	textureWidth: size.width,
	textureHeight: size.height,
});
floorReflector.rotation.x = -Math.PI / 2;
floorReflector.position.y = -0.001;
scene.add(floorReflector);

const uniforms: Record<string, IUniform<any>> = {
	uFrameTexture: new Uniform(frameRenderTarget.texture),
	uRainNormal: new Uniform(rainNormal),
};

if (floorReflector.material instanceof ShaderMaterial) {
	uniforms['uReflectorColor'] = floorReflector.material.uniforms.tDiffuse;
	uniforms['uTextureMatrix'] = floorReflector.material.uniforms.textureMatrix;
}

const floorMaterial = new ShaderMaterial({
	vertexShader: floorVertexShader,
	fragmentShader: floorFragmentShader,
	uniforms,
	transparent: true,
});

const floor = new Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const rainGeometry = new PlaneGeometry(0.5, 0.5, 64, 64);
const rainMaterial = new ShaderMaterial({
	vertexShader: rainVertexShader,
	fragmentShader: rainFragmentShader,
	uniforms,
});

const rain = new Mesh(rainGeometry, rainMaterial);
rain.position.set(1, 1, 1);
rain.layers.set(LAYER.RAIN);
scene.add(rain);

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

function renderFrameTexture() {
	rain.visible = false;

	renderer.setRenderTarget(frameRenderTarget);
	renderer.render(scene, camera);
	renderer.setRenderTarget(null);

	rain.visible = true;
}

function render() {
	fpsGraph.begin();
	// Time
	const delta = clock.getDelta();

	// Render
	renderFrameTexture();
	renderer.render(scene, camera);

	// Update
	controls.update(delta);
	controls2.update();

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
