import {
	AxesHelper,
	Clock,
	Color,
	EquirectangularReflectionMapping,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	Raycaster,
	Scene,
	Vector2,
	Vector3,
	WebGLRenderer,
} from 'three';
import { GLTFLoader, RGBELoader } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import './style.css';
const el = document.querySelector('#root') as HTMLDivElement;

const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
	pixelRatio: Math.min(2.0, window.devicePixelRatio),
};

/**
 * Loader
 */

const gltfLoader = new GLTFLoader();
gltfLoader.setPath('/src/assets/models/');

const rgbeLoader = new RGBELoader();
rgbeLoader.setPath('/src/assets/hdr/');

rgbeLoader.load('cobblestone_street_night_1k.hdr', (data) => {
	data.mapping = EquirectangularReflectionMapping;
	scene.environment = data;
});

/**
 * Basic
 */

const renderer = new WebGLRenderer({
	alpha: true,
	antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
el.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color('#1e1e1e');

const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(0, 0, 10);
camera.lookAt(scene.position);

const stats = new Stats();
el.append(stats.dom);

const clock = new Clock();

const raycaster = new Raycaster();

/**
 * World
 */

const plantGeometry = new PlaneGeometry(15, 15, 1, 1);
const plantMaterial = new MeshBasicMaterial({
	color: 'red',
	wireframe: true,
});

const plant = new Mesh(plantGeometry, plantMaterial);
scene.add(plant);

const model = await gltfLoader.loadAsync('sapceship.glb');

const spaceship = model.scene;
spaceship.traverse((mesh) => {
	if (mesh instanceof Mesh) {
		if (mesh.material instanceof MeshStandardMaterial) {
			mesh.material.depthTest = true;
			mesh.material.depthWrite = true;
		}
	}
});
spaceship.scale.setScalar(0.3);
spaceship.rotation.y = -Math.PI / 2;
scene.add(spaceship);

const axesHelper = new AxesHelper();
scene.add(axesHelper);

/**
 * Event
 */
const intersectPoint: Vector3 = new Vector3();

let translY = 0;
let translAcceleration = 0;

let angleZ = 0;
let angleAcceleration = 0;

function updateSpaceship() {
	const targetY = intersectPoint.y;
	translAcceleration += (targetY - translY) * 0.002;
	translAcceleration *= 0.95;
	translY += translAcceleration;
	spaceship.position.y = translY;

	// Direction of the target point
	const direction = intersectPoint
		.clone()
		.sub(new Vector3(0, translY, 0))
		.normalize();
	const dirCos = direction.dot(new Vector3(0, 1, 0));
	const angle = Math.acos(dirCos) - Math.PI / 2;

	angleAcceleration += (angle - angleZ) * 0.06;
	angleAcceleration *= 0.85;
	angleZ = angleAcceleration;

	spaceship.rotation.setFromVector3(new Vector3(angleZ, 0, angleZ), 'XYZ');
}

function render() {
	// Time
	const delta = clock.getDelta();

	// Update
	stats.update();
	updateSpaceship();

	// Render
	renderer.render(scene, camera);

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

function updateCursor(e: PointerEvent) {
	const mouse = {
		x: e.clientX,
		y: e.clientY,
	};

	const x = (mouse.x / sizes.width) * 2 - 1;
	const y = -(mouse.y / sizes.height) * 2 + 1;
	const coord = new Vector2(x, y);

	raycaster.setFromCamera(coord, camera);

	const intersect = raycaster.intersectObjects([plant]);
	if (intersect.length) {
		const point = intersect[0].point;
		intersectPoint.copy(point);
	}
}
window.addEventListener('pointermove', updateCursor);
