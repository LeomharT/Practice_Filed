import {
	Color,
	IcosahedronGeometry,
	MathUtils,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	ShaderMaterial,
	Uniform,
	WebGLRenderer,
	WebGLRenderTarget,
} from 'three';
import { OrbitControls, Reflector } from 'three/examples/jsm/Addons.js';
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

const sceneRenderTarget = new WebGLRenderTarget(size.width, size.height, {
	generateMipmaps: true,
});

/**
 * World
 */

const floorGeometry = new PlaneGeometry(5, 5, 64, 64);

const reflector = new Reflector(floorGeometry, {
	textureWidth: size.width / 2,
	textureHeight: size.height / 2,
});
reflector.rotation.x = -Math.PI / 2;
scene.add(reflector);

console.log(reflector);

const uniforms = {
	uReflectionTexture: (reflector.material as ShaderMaterial).uniforms.tDiffuse,
	uTextureMatrix: (reflector.material as ShaderMaterial).uniforms.textureMatrix,
};

const floorMaterial = new ShaderMaterial({
	uniforms,
	vertexShader: floorVertexShader,
	fragmentShader: floorFragmentShader,
});

const floor = new Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0.001;
scene.add(floor);

const testGeometry = new IcosahedronGeometry(0.1, 3);
const testMaterial = new MeshBasicMaterial({
	color: 'yellow',
});

const test = new Mesh(testGeometry, testMaterial);
test.position.y = 0.5;
scene.add(test);

const rainGeometry = new PlaneGeometry(1, 1);
const rainMaterial = new ShaderMaterial({
	uniforms: {
		uScreenTexture: new Uniform(sceneRenderTarget.texture),
	},
	vertexShader: rainVertexShader,
	fragmentShader: rainFragmentShader,
});

const rain = new Mesh(rainGeometry, rainMaterial);
rain.position.set(
	MathUtils.randFloat(0, 3),
	MathUtils.randFloat(0, 3),
	MathUtils.randFloat(0, 3)
);
scene.add(rain);

function updateFrameTexture() {
	floor.visible = false;
	reflector.visible = false;
	rain.visible = false;

	renderer.setRenderTarget(sceneRenderTarget);

	renderer.render(scene, camera);

	renderer.setRenderTarget(null);

	floor.visible = true;
	reflector.visible = true;
	rain.visible = true;
}

function render() {
	// Render
	updateFrameTexture();
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
