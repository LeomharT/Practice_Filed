import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import {
	BackSide,
	Clock,
	Color,
	IcosahedronGeometry,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	Scene,
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
import earthFragmentShader from './shader/earth/fragment.glsl?raw';
import earthVertexShader from './shader/earth/vertex.glsl?raw';
import './style.css';
import atmosphereFragmentShader from './shader/atmosphere/fragment.glsl?raw';
import atmosphereVertexShader from './shader/atmosphere/vertex.glsl?raw';
/**
 * Variables
 */

const el = document.querySelector('#root') as HTMLDivElement;
const size = {
	width: window.innerWidth,
	height: window.innerHeight,
	pixelRatio: Math.min(2.0, window.devicePixelRatio),
};

/**
 * Loader
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
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(size.pixelRatio);
el.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color('#1e1e1e');

const camera = new PerspectiveCamera(75, size.width / size.height, 0.1, 1000);
camera.position.set(3, 3, 3);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableRotate = true;
controls.enablePan = false;
controls.enableZoom = false;

const controls2 = new TrackballControls(camera, renderer.domElement);
controls2.noRotate = true;
controls2.noPan = true;
controls2.noZoom = false;

const clock = new Clock();

/**
 * World
 */

const uniforms = {
	uSunDirection: new Uniform(new Vector3()),
	uEarthDayMapTexture: new Uniform(earthDayMapTexture),
	uEarthNightMapTexture: new Uniform(earthNightMapTexture),
	uSpecularCloudTexture: new Uniform(specularCloudTexture),
	uAtmosphereDayColor: new Uniform(new Color('#00aaff')),
	uAtmosphereTwilightColor: new Uniform(new Color('#ff6600')),
};

const sunSpherical = new Spherical(1, Math.PI / 2, 0.5);
const sunDirection = new Vector3();

const sunGeometry = new IcosahedronGeometry(0.1, 3);
const sunMaterial = new MeshBasicMaterial({ color: 'yellow' });

const sun = new Mesh(sunGeometry, sunMaterial);
scene.add(sun);

function updateSun() {
	// Direction
	sunDirection.setFromSpherical(sunSpherical);

	// Uniform
	uniforms.uSunDirection.value.copy(sunDirection);

	// Sun position
	sun.position.copy(sunDirection.clone().multiplyScalar(5.0));
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
pane.registerPlugin(EssentialsPlugin);
// Add a FPS graph
const fpsGraph: any = pane.addBlade({
	view: 'fpsgraph',
	label: undefined,
	max: 120,
	rows: 3,
});

pane
	.addBinding(sunSpherical, 'theta', {
		min: -Math.PI,
		max: Math.PI,
		step: 0.001,
	})
	.on('change', updateSun);
pane
	.addBinding(sunSpherical, 'phi', {
		min: 0,
		max: Math.PI,
		step: 0.001,
	})
	.on('change', updateSun);
/**
 * Event
 */

function render() {
	fpsGraph.begin();

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
