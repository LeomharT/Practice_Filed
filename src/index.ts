import {
	AmbientLight,
	AxesHelper,
	Clock,
	Color,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial,
	MirroredRepeatWrapping,
	PerspectiveCamera,
	PlaneGeometry,
	Raycaster,
	ReinhardToneMapping,
	Scene,
	TextureLoader,
	Vector2,
	Vector3,
	WebGLRenderer,
} from 'three';
import {
	GLTFLoader,
	OrbitControls,
	TrackballControls,
} from 'three/examples/jsm/Addons.js';
import './style.css';

const el = document.querySelector('#root') as HTMLDivElement;
const size = {
	width: window.innerWidth,
	height: window.innerHeight,
	pixelRatio: Math.min(2.0, window.devicePixelRatio),
};

const LAYER = {
	RAIN: 1,
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
 * Textures
 */

const noiseTexture = textureLoader.load('noiseTexture.png');
noiseTexture.wrapT = noiseTexture.wrapS = MirroredRepeatWrapping;

/**
 * Basic
 */

const renderer = new WebGLRenderer({
	alpha: true,
	antialias: true,
});
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(size.pixelRatio);
renderer.toneMapping = ReinhardToneMapping;
renderer.toneMappingExposure = 1.05;
el.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color('#1e1e1e');

const camera = new PerspectiveCamera(50, size.width / size.height, 0.1, 1000);
camera.position.set(4, 0, 0);
camera.lookAt(scene.position);
camera.layers.enable(LAYER.RAIN);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.enabled = false;

const controls2 = new TrackballControls(camera, renderer.domElement);
controls2.noPan = true;
controls2.noRotate = true;
controls2.noZoom = false;
controls2.enabled = false;

const clock = new Clock();

const raycaster = new Raycaster();

/**
 * World
 */

const point = new Vector3();
const mouse = new Vector2();

const spaceship = spaceshipModel.scene;
spaceship.scale.setScalar(0.1);
spaceship.position.x = -0.8;

spaceship.traverse((obj) => {
	if (obj instanceof Mesh && obj.material instanceof MeshStandardMaterial) {
		obj.material.depthTest = true;
		obj.material.depthWrite = true;
	}
});
scene.add(spaceship);

const planeGeometry = new PlaneGeometry(5, 5, 64, 64);
const planeMaterial = new MeshBasicMaterial({
	color: 'yellow',
	wireframe: true,
	visible: false,
});

const plane = new Mesh(planeGeometry, planeMaterial);
plane.rotation.y = Math.PI / 2;
scene.add(plane);

/**
 * Light
 */
const ambientLight = new AmbientLight(0xffffff, 1.0);
scene.add(ambientLight);

/**
 * Helpers
 */

const axesHelper = new AxesHelper();
scene.add(axesHelper);

/**
 * Events
 */

let translY = 0;
let translAcceleration = 0;

let angleZ = 0;
let angleZAcceleration = 0;

function render() {
	// Time
	const delta = clock.getDelta();
	const elapsed = clock.getElapsedTime();

	// Render
	renderer.render(scene, camera);

	// Update
	controls.update(delta);
	controls2.update();

	// Update spaceship
	const targetY = point.y;
	translAcceleration += (targetY - translY) * 0.002;
	translAcceleration *= 0.95;
	translY += translAcceleration;

	spaceship.position.y = translY;

	// Update spaceship rotation

	// Get B to A
	const dir = point.clone().sub(new Vector3(0, translY, 0)).normalize();
	const dirCos = dir.dot(new Vector3(0, 1, 0));
	const angle = Math.acos(dirCos) - Math.PI / 2;

	angleZAcceleration += (angle - angleZ) * 0.06;
	angleZAcceleration *= 0.85;
	angleZ = angleZAcceleration;

	spaceship.rotation.setFromVector3(new Vector3(angleZ, 0, angleZ));

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

function onMouseMove(e: MouseEvent) {
	// NDC
	const x = (e.clientX / window.innerWidth) * 2.0 - 1.0;
	const y = -(e.clientY / window.innerHeight) * 2.0 + 1.0;

	mouse.set(x, y);

	raycaster.setFromCamera(mouse, camera);

	const intersects = raycaster.intersectObject(plane);

	if (intersects.length) {
		const interSectPoint = intersects[0].point.clone();
		interSectPoint.x = -3.0;
		point.copy(interSectPoint);
	}
}

window.addEventListener('mousemove', onMouseMove);
