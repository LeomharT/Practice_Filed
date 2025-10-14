import {
	AmbientLight,
	Clock,
	Color,
	IcosahedronGeometry,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	TextureLoader,
	WebGLRenderer,
} from 'three';
import {
	GLTFLoader,
	OrbitControls,
	TrackballControls,
} from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import './style.css';

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

const gltfLoader = new GLTFLoader();
gltfLoader.setPath('/src/assets/models/');

/**
 * Models
 */

const spaceshipModel = await gltfLoader.loadAsync('sapceship.glb');

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
controls.enablePan = false;

const controls2 = new TrackballControls(camera, renderer.domElement);
controls2.noPan = true;
controls2.noRotate = true;
controls2.noZoom = false;

const clock = new Clock();

/**
 * World
 */

const planeGeometry = new PlaneGeometry(3, 3, 16, 16);
const palneMaterial = new MeshBasicMaterial({
	color: 'yellow',
	wireframe: true,
});

const plane = new Mesh(planeGeometry, palneMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

const identifier = new Mesh(
	new IcosahedronGeometry(0.1, 3),
	new MeshBasicMaterial({ color: 'blue' })
);
identifier.position.y = 1.0;
scene.add(identifier);

const pane = new Pane({ title: 'Debug Params' });
pane.element.parentElement!.style.width = '380px';

/**
 * Light
 */

const ambientLight = new AmbientLight(0xffffff, 2.0);
scene.add(ambientLight);

/**
 * Events
 */

const radius = 1.0;

function render() {
	// Time
	const delta = clock.getDelta();
	const elapsedTime = clock.getElapsedTime();

	// Render
	renderer.render(scene, camera);

	// Update
	controls.update(delta);
	controls2.update();

	identifier.position.x = Math.cos(elapsedTime) * radius;
	identifier.position.y = Math.sin(elapsedTime * 3.0) * 0.5 + 0.5;
	identifier.position.z = Math.sin(elapsedTime) * radius;

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
