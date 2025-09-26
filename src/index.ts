import {
	ACESFilmicToneMapping,
	BackSide,
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
	Vector3,
	WebGLRenderer,
} from 'three';
import { OrbitControls, TrackballControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import atmosphereFragmentShader from './shader/atmosphere/fragment.glsl?raw';
import atmosphereVertexShader from './shader/atmosphere/vertex.glsl?raw';
import earthFragmentShader from './shader/earth/fragment.glsl?raw';
import earthVertexShader from './shader/earth/vertex.glsl?raw';
import simplex3DNoise from './shader/include/simplex3DNoise.glsl?raw';
import './style.css';

(ShaderChunk as any)['simplex3DNoise'] = simplex3DNoise;

/**
 * Variables
 */
const el = document.querySelector('#root') as HTMLDivElement;
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
	pixelratio: Math.min(2.0, window.devicePixelRatio),
};

/**
 * Loaders
 */

const textureLoader = new TextureLoader();
textureLoader.setPath('/src/assets/textures/');

/**
 * Textures
 */

const earthDayMapTexture = textureLoader.load('2k_earth_daymap.jpg');
earthDayMapTexture.colorSpace = SRGBColorSpace;
earthDayMapTexture.anisotropy = 8;

const earthNightMapTexture = textureLoader.load('2k_earth_nightmap.jpg');
earthNightMapTexture.colorSpace = SRGBColorSpace;
earthNightMapTexture.anisotropy = 8;

const specularCloudTexture = textureLoader.load('specularClouds.jpg');

/**
 * Basic
 */

const renderer = new WebGLRenderer({
	alpha: true,
	antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelratio);
renderer.toneMapping = ACESFilmicToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
el.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color('#1e1e1e');

const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(3, 3, 3);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableRotate = true;
controls.enablePan = false;
controls.enableZoom = false;

const controls2 = new TrackballControls(camera, renderer.domElement);
controls2.noPan = true;
controls2.noRotate = true;
controls2.noZoom = false;

const clock = new Clock();

/**
 * World
 */

const uniforms = {
	uSunDirection: new Uniform(new Vector3()),
	//
	uEarthDayMapTexture: new Uniform(earthDayMapTexture),
	uEarthNightMapTexture: new Uniform(earthNightMapTexture),
	uSpecularCloudTexture: new Uniform(specularCloudTexture),
	//
	uAtmosphereDayColor: new Uniform(new Color('#00aaff')),
	uAtmosphereTwilightColor: new Uniform(new Color('#ff6600')),
};
const sunSpherical = new Spherical(1, Math.PI / 2, 0.5);
const sunDirection = new Vector3();

const sunGeometry = new IcosahedronGeometry(0.1, 3);
const sunMaterial = new MeshBasicMaterial({
	color: 'yellow',
});

const sun = new Mesh(sunGeometry, sunMaterial);
scene.add(sun);

function updateSun() {
	// Direction
	sunDirection.setFromSpherical(sunSpherical);

	// Uniform
	uniforms.uSunDirection.value.copy(sunDirection);

	// Sun position
	sun.position.copy(sunDirection.clone().multiplyScalar(3.0));
}
updateSun();

const earthGeometry = new SphereGeometry(2, 64, 64);
const earthMaterial = new ShaderMaterial({
	uniforms,
	vertexShader: earthVertexShader,
	fragmentShader: earthFragmentShader,
});

const earth = new Mesh(earthGeometry, earthMaterial);
scene.add(earth);

const atmosphereGeometry = earthGeometry.clone();
const atmosphereMaterial = new ShaderMaterial({
	uniforms,
	vertexShader: atmosphereVertexShader,
	fragmentShader: atmosphereFragmentShader,
	transparent: true,
	side: BackSide,
});

const atmosphere = new Mesh(atmosphereGeometry, atmosphereMaterial);
atmosphere.scale.setScalar(1.04);
scene.add(atmosphere);

/**
 * Pane
 */

const pane = new Pane({ title: 'Debug Params' });
pane.element.parentElement!.style.width = '380px';

const sunP = pane.addFolder({ title: 'Sun' });
sunP
	.addBinding(sunSpherical, 'theta', {
		max: Math.PI,
		min: -Math.PI,
		step: 0.001,
	})
	.on('change', updateSun);
sunP
	.addBinding(sunSpherical, 'phi', {
		max: Math.PI,
		min: 0,
		step: 0.001,
	})
	.on('change', updateSun);

/**
 * Event
 */

function render() {
	// Time
	const delta = clock.getDelta();

	// Render
	renderer.render(scene, camera);

	// Update
	controls.update(delta);
	controls2.update();
	earth.rotation.y += 0.001;

	// Animation
	requestAnimationFrame(render);
}
render();

function resize() {
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	renderer.setSize(sizes.width, sizes.height);

	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
