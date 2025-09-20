import {
	BoxGeometry,
	Clock,
	Color,
	Layers,
	MathUtils,
	Mesh,
	MeshStandardMaterial,
	PerspectiveCamera,
	Scene,
	ShaderMaterial,
	SphereGeometry,
	Vector2,
	WebGLRenderer,
} from 'three';
import {
	EffectComposer,
	GLTFLoader,
	OrbitControls,
	OutputPass,
	RenderPass,
	ShaderPass,
	TrackballControls,
	UnrealBloomPass,
} from 'three/examples/jsm/Addons.js';
import './style.css';

/**
 * Variables
 */
const el = document.querySelector('#root') as HTMLDivElement;
const size = {
	width: window.innerWidth,
	height: window.innerHeight,
};
const BLOOM_LAYER = 1;

const layer = new Layers();
layer.set(BLOOM_LAYER);

/**
 * Loader
 */

const gltfLoader = new GLTFLoader();
gltfLoader.setPath('/src/assets/models/');

/**
 * Models
 */

/**
 * Basic
 */

const renderer = new WebGLRenderer({
	alpha: true,
	antialias: true,
});
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(window.devicePixelRatio);
el.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color('#1e1e1e');

const camera = new PerspectiveCamera(75, size.width / size.height, 0.1, 1000);
camera.position.set(3, 3, 3);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.enableRotate = true;
controls.enableZoom = false;

const controls2 = new TrackballControls(camera, renderer.domElement);
controls2.noPan = true;
controls2.noRotate = true;
controls2.noZoom = false;

const clock = new Clock();

/**
 * Post processing
 */
const params = {
	threshold: 0,
	strength: 1,
	radius: 0.5,
	exposure: 1,
};

// Pass
const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(
	new Vector2(size.width, size.height),
	params.strength,
	params.radius,
	params.threshold
);
function updateBloom() {
	bloomPass.strength = params.strength;
	bloomPass.radius = params.radius;
	bloomPass.threshold = params.threshold;
}
const mixPass = new ShaderPass(new ShaderMaterial({}));
const outputPass = new OutputPass();

const bloomComposer = new EffectComposer(renderer);
bloomComposer.renderToScreen = false;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(mixPass);
composer.addPass(outputPass);

/**
 * World
 */

const sphereGeometry = new SphereGeometry(0.5, 32, 32);
const sphereMaterial = new MeshStandardMaterial({
	color: '#B6CEB4',
});

const sphere = new Mesh(sphereGeometry, sphereMaterial);
sphere.position.x = 1.0;
scene.add(sphere);

const lightColor = new Color(
	MathUtils.randFloat(0, 1),
	MathUtils.randFloat(0, 1),
	MathUtils.randFloat(0, 1)
);

const cubeGeometry = new BoxGeometry(1, 1, 1);
const cubeMaterial = new MeshStandardMaterial({
	emissive: lightColor,
});

const glowCube = new Mesh(cubeGeometry, cubeMaterial);
glowCube.position.x = -1.0;
scene.add(glowCube);

/**
 * Event
 */

function render() {
	// Time
	const delta = clock.getDelta();

	// Render
	composer.render();

	// Update
	controls.update(delta);
	controls2.update();

	// Animation
	requestAnimationFrame(render);
}
render();

function resize() {
	size.width = window.innerWidth;
	size.height = window.innerHeight;

	renderer.setSize(size.width, size.height);
	composer.setSize(size.width, size.height);
	bloomComposer.setSize(size.width, size.height);

	camera.aspect = size.width / size.height;
	camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
