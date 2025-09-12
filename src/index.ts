import {
	ACESFilmicToneMapping,
	AxesHelper,
	BoxGeometry,
	BufferGeometry,
	CatmullRomCurve3,
	Clock,
	Color,
	IcosahedronGeometry,
	Line,
	LineBasicMaterial,
	MathUtils,
	Mesh,
	MeshBasicMaterial,
	PCFSoftShadowMap,
	PerspectiveCamera,
	Scene,
	ShaderChunk,
	SRGBColorSpace,
	TextureLoader,
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
controls.enabled = false;

const controls2 = new TrackballControls(camera, renderer.domElement);
controls2.noRotate = true;
controls2.noPan = true;
controls2.noZoom = false;
controls2.dynamicDampingFactor = 0.2;
controls2.enabled = false;

const stats = new Stats();
el.append(stats.dom);

/**
 * Uniforms
 */

const POINTS = [
	new Vector3(-3, 0, -3),
	new Vector3(0, 1, -3),
	new Vector3(3, 0, -3),
	new Vector3(3, 0, 0),
	new Vector3(3, 0, 3),
	new Vector3(0, 1, 3),
	new Vector3(-3, 0, 3),
	new Vector3(-3, 0, 0),
];

/**
 * World
 */
const hanldeGeometry = new IcosahedronGeometry(0.1, 3);
const hanldeMaterial = new MeshBasicMaterial({});

for (const i of POINTS) {
	const material = hanldeMaterial.clone();
	material.color = new Color(
		MathUtils.randFloat(0, 1),
		MathUtils.randFloat(0, 1),
		MathUtils.randFloat(0, 1)
	);

	const handle = new Mesh(hanldeGeometry, material);
	handle.position.copy(i);
	scene.add(handle);
}

const curve = new CatmullRomCurve3(POINTS, true);
const points = curve.getPoints(50) as Vector3[];

const lineGeometry = new BufferGeometry().setFromPoints(points);
const lineMaterial = new LineBasicMaterial({ color: 'red' });

const line = new Line(lineGeometry, lineMaterial);
scene.add(line);

const cubeGeometry = new BoxGeometry(0.5, 0.5, 0.5);
const cubeMaterial = new MeshBasicMaterial({ color: 'yellow' });

const cube = new Mesh(cubeGeometry, cubeMaterial);
cube.position.copy(points[0]);
scene.add(cube);

/**
 * Helper
 */

const axesHelper = new AxesHelper();
scene.add(axesHelper);

/**
 * Pane
 */

const pane = new Pane({ title: '🚧🚧🚧 Debug Params 🚧🚧🚧' });
pane.element.parentElement!.style.width = '380px';

/**
 * Event
 */

let index = 0;

function render() {
	// Render
	renderer.render(scene, camera);

	// Time
	const delta = clock.getDelta();

	const position = curve.getPointAt(index);
	const tangent = curve.getTangentAt(index).normalize() as Vector3;

	cube.position.copy(position);

	camera.position.copy(position);
	camera.lookAt(position.clone().add(tangent));

	index += 0.001;
	if (index >= 1) index = 0;

	// Update
	// controls.update(delta);
	// controls2.update();
	stats.update();

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
