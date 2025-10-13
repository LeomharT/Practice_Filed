import {
	AmbientLight,
	Clock,
	Color,
	Mesh,
	MeshStandardMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	ShaderMaterial,
	TextureLoader,
	WebGLRenderer,
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

const spaceship = spaceshipModel.scene;
spaceship.traverse((obj) => {
	if (obj instanceof Mesh && obj.material instanceof MeshStandardMaterial) {
		obj.material.depthWrite = true;
		obj.material.depthTest = true;
	}
});
spaceship.scale.setScalar(0.2);
spaceship.position.set(-1.5, 1, -1);
scene.add(spaceship);

const floorGeometry = new PlaneGeometry(5, 5, 32, 32);

const floorReflector = new Reflector(floorGeometry, {
	textureWidth: size.width / 2,
	textureHeight: size.height / 2,
});
floorReflector.rotation.x = -Math.PI / 2;
floorReflector.position.y = -0.001;
scene.add(floorReflector);

const uniforms: Record<string, IUniform<any>> = {};

if (floorReflector.material instanceof ShaderMaterial) {
	uniforms['uTextureMatrix'] = floorReflector.material.uniforms.textureMatrix;
	uniforms['uDiffuse'] = floorReflector.material.uniforms.tDiffuse;
}

const floorMaterial = new ShaderMaterial({
	uniforms,
	vertexShader: floorVertexShader,
	fragmentShader: floorFragmentShader,
});

const floor = new Mesh(floorGeometry, floorMaterial);
floor.quaternion.copy(floorReflector.quaternion);
scene.add(floor);

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

function render() {
	// Time
	const delta = clock.getDelta();

	// Render
	renderer.render(scene, camera);

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

	camera.aspect = size.width / size.height;
	camera.updateProjectionMatrix();
}

window.addEventListener('resize', resize);
