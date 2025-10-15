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
	ShaderMaterial,
	TextureLoader,
	Uniform,
	WebGLRenderer,
	WebGLRenderTarget,
	type IUniform,
} from 'three';
import {
	GLTFLoader,
	OrbitControls,
	Reflector,
	TrackballControls,
} from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import floorFragmentShader from './shader/floor/fragment.glsl?raw';
import floorVertexShader from './shader/floor/vertex.glsl?raw';
import rainFragmentShader from './shader/rain/fragment.glsl?raw';
import rainVertexShader from './shader/rain/vertex.glsl?raw';
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
camera.layers.enable(LAYER.RAIN);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;

const controls2 = new TrackballControls(camera, renderer.domElement);
controls2.noPan = true;
controls2.noRotate = true;
controls2.noZoom = false;

const clock = new Clock();

const frameRenderTarget = new WebGLRenderTarget(
	size.width / 2.0,
	size.height / 2.0,
	{
		generateMipmaps: true,
	}
);

/**
 * World
 */

const planeGeometry = new PlaneGeometry(3, 3, 16, 16);

const floorReflector = new Reflector(planeGeometry);
floorReflector.rotation.x = -Math.PI / 2;
floorReflector.position.y = -0.001;
scene.add(floorReflector);

const uniforms: Record<string, IUniform<any>> = {};

if (floorReflector.material instanceof ShaderMaterial) {
	uniforms['uTextureMatrix'] = floorReflector.material.uniforms.textureMatrix;
	uniforms['uDiffuse'] = floorReflector.material.uniforms.tDiffuse;
}

const palneMaterial = new ShaderMaterial({
	uniforms,
	vertexShader: floorVertexShader,
	fragmentShader: floorFragmentShader,
});

const plane = new Mesh(planeGeometry, palneMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

const identifier = new Mesh(
	new IcosahedronGeometry(0.1, 1),
	new MeshBasicMaterial({ color: 'blue' })
);
identifier.position.y = 1.0;
scene.add(identifier);

const rainGeometry = new PlaneGeometry(0.5, 0.5, 16, 16);
const rainMaterial = new ShaderMaterial({
	uniforms: {
		uFrame: new Uniform(frameRenderTarget.texture),
	},
	vertexShader: rainVertexShader,
	fragmentShader: rainFragmentShader,
});

const rain = new Mesh(rainGeometry, rainMaterial);
rain.layers.set(LAYER.RAIN);
rain.position.set(1, 1, 1);
scene.add(rain);

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

function updateFrame() {
	rain.visible = false;

	renderer.setRenderTarget(frameRenderTarget);
	renderer.render(scene, camera);
	renderer.setRenderTarget(null);

	rain.visible = true;
}

function render() {
	// Time
	const delta = clock.getDelta();
	const elapsedTime = clock.getElapsedTime();

	// Render
	updateFrame();
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
