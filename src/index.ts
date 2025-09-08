import {
	ACESFilmicToneMapping,
	Clock,
	Color,
	IcosahedronGeometry,
	Mesh,
	MeshBasicMaterial,
	PCFSoftShadowMap,
	PerspectiveCamera,
	Scene,
	ShaderChunk,
	ShaderMaterial,
	SphereGeometry,
	Spherical,
	SRGBColorSpace,
	TextureLoader,
	Uniform,
	Vector2,
	Vector3,
	WebGLRenderer,
} from 'three';
import {
	GLTFLoader,
	OrbitControls,
	RGBELoader,
	TrackballControls,
} from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Pane } from 'tweakpane';
import atmoFragmentShader from './shader/atmosphere/fragment.glsl?raw';
import atmoVertexShader from './shader/atmosphere/vertex.glsl?raw';
import earthFragmentShader from './shader/earth/fragment.glsl?raw';
import earthVertexShader from './shader/earth/vertex.glsl?raw';
import random2D from './shader/include/random2D.glsl?raw';
import simplex3DNoise from './shader/include/simplex3DNoise.glsl?raw';
import './style.css';

type ShaderLab = typeof ShaderChunk & {
	random2D: string;
	simplex3DNoise: string;
};

(ShaderChunk as ShaderLab)['random2D'] = random2D;
(ShaderChunk as ShaderLab)['simplex3DNoise'] = simplex3DNoise;

const el = document.querySelector('#root') as HTMLDivElement;

const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
	pixelratio: Math.min(2, window.devicePixelRatio),
	resolution: new Vector2(window.innerWidth, window.innerHeight),
};

/**
 * Loader
 */

const textureLoader = new TextureLoader();
textureLoader.setPath('/src/assets/textures/');

const gltfLoader = new GLTFLoader();
gltfLoader.setPath('/src/assets/models/');

const rgbeLoader = new RGBELoader();
rgbeLoader.setPath('/src/assets/hdr/');

/**
 * Textures
 */

const earthDayMapTexture = textureLoader.load('2k_earth_daymap.jpg');
earthDayMapTexture.colorSpace = SRGBColorSpace;

const earthNightMapTexture = textureLoader.load('2k_earth_nightmap.jpg');
earthNightMapTexture.colorSpace = SRGBColorSpace;

const specularCloudTexutre = textureLoader.load('specularClouds.jpg');

/**
 * Basic
 */

const renderer = new WebGLRenderer({
	alpha: true,
	antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(1.0);
renderer.toneMapping = ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
el.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color('#1e1e1e');

const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(3, 3, 3);
camera.lookAt(scene.position);

const clock = new Clock();

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableRotate = true;
controls.enablePan = false;
controls.enableZoom = false;
controls.maxPolarAngle = Math.PI / 2.25;
controls.minPolarAngle = 0;

const controls2 = new TrackballControls(camera, renderer.domElement);
controls2.noRotate = true;
controls2.noPan = true;
controls2.noZoom = false;
controls2.dynamicDampingFactor = 0.2;

const stats = new Stats();
el.append(stats.dom);

/**
 * Uniforms
 */

const uniforms = {
	uSunDirection: new Uniform(new Vector3()),

	uEarthDayMapTexture: new Uniform(earthDayMapTexture),
	uEarthNightMapTexture: new Uniform(earthNightMapTexture),
	uSpecularCloudTexture: new Uniform(specularCloudTexutre),

	uAtmosphereDayColor: new Uniform(new Color('#00aaff')),
	uAtmosphereTwilightColor: new Uniform(new Color('#ff6600')),
};

/**
 * World
 */
// Sun spherical
const sunSpherical = new Spherical(1.0, Math.PI / 2, 0.5);
const sunDirection = new Vector3();

// Sun
const sunGeometry = new IcosahedronGeometry(0.1, 3);
const sunMaterial = new MeshBasicMaterial({ color: 'yellow' });
const sun = new Mesh(sunGeometry, sunMaterial);

function updateSun() {
	// Sun direction
	sunDirection.setFromSpherical(sunSpherical);

	// Uniforms
	uniforms.uSunDirection.value.copy(sunDirection);

	// Position
	sun.position.copy(sunDirection.clone()).multiplyScalar(5.0);
}
updateSun();

scene.add(sun);

// Earth
const earthGeometry = new SphereGeometry(2, 128, 128);
const earthMaterial = new ShaderMaterial({
	uniforms,
	vertexShader: earthVertexShader,
	fragmentShader: earthFragmentShader,
	transparent: true,
});

const earth = new Mesh(earthGeometry, earthMaterial);
scene.add(earth);

const atmosphereGeometry = earthGeometry.clone();
const atmosphereMaterial = new ShaderMaterial({
	uniforms,
	vertexShader: atmoVertexShader,
	fragmentShader: atmoFragmentShader,
	transparent: true,
});

const atmosphere = new Mesh(atmosphereGeometry, atmosphereMaterial);
atmosphere.scale.setScalar(1.04);
scene.add(atmosphere);

/**
 * Pane
 */

const pane = new Pane({ title: '🚧🚧🚧 Debug Params 🚧🚧🚧' });
pane.element.parentElement!.style.width = '380px';

const sunP = pane.addFolder({ title: 'Sun' });
sunP
	.addBinding(sunSpherical, 'phi', {
		label: 'Phi',
		min: 0,
		max: Math.PI,
		step: 0.001,
	})
	.on('change', updateSun);
sunP
	.addBinding(sunSpherical, 'theta', {
		label: 'Theta',
		min: -Math.PI,
		max: Math.PI,
		step: 0.001,
	})
	.on('change', updateSun);

const earthP = pane.addFolder({ title: 'Earth' });

/**
 * Event
 */

function render() {
	// Render
	renderer.render(scene, camera);

	// Time
	const delta = clock.getDelta();

	// Update
	controls.update(delta);
	controls2.update();
	stats.update();

	earth.rotation.y += delta * 0.1;

	// Animation
	requestAnimationFrame(render);
}
render();

function resize() {
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;
	sizes.pixelratio = Math.min(2, window.devicePixelRatio);

	renderer.setSize(sizes.width, sizes.height);

	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();
}

window.addEventListener('resize', resize);
