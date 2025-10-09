import {
	Color,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	ShaderMaterial,
	Uniform,
	WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import floorFragmentShader from './shader/floor/fragment.glsl?raw';
import floorVertexShader from './shader/floor/vertex.glsl?raw';
import './style.css';

const el = document.querySelector('#root') as HTMLDivElement;
const size = {
	width: window.innerWidth,
	height: window.innerHeight,
	pixelRatio: Math.min(2.0, window.devicePixelRatio),
};

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
camera.position.set(2, 2, 2);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

/**
 * World
 */

const floorGeometry = new PlaneGeometry(5, 5, 256, 256);

const floorMaterial = new ShaderMaterial({
	uniforms: {
		uColor: new Uniform(new Color('#22efe8')),
		uEdgeColor: new Uniform(new Color('#25ffff')),
	},
	vertexShader: floorVertexShader,
	fragmentShader: floorFragmentShader,
	transparent: true,
});

const floor = new Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const plane2 = new Mesh(
	new PlaneGeometry(20.0, 20.0, 64, 64),
	new MeshBasicMaterial()
);
plane2.position.y = -0.1;
plane2.rotation.x = -Math.PI / 2.0;

scene.add(plane2);

const pane = new Pane({ title: 'Debug Params' });

/**
 * Events
 */

function render() {
	// Render
	renderer.render(scene, camera);

	// Update
	controls.update();

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
