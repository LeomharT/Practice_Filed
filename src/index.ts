import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import {
	AxesHelper,
	Clock,
	EquirectangularReflectionMapping,
	Layers,
	Material,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial,
	Object3D,
	PerspectiveCamera,
	Scene,
	ShaderMaterial,
	Uniform,
	Vector2,
	WebGLRenderer,
} from 'three';
import {
	EffectComposer,
	GLTFLoader,
	OrbitControls,
	OutputPass,
	RenderPass,
	RGBELoader,
	ShaderPass,
	TrackballControls,
	UnrealBloomPass,
} from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import bloomFragmentShader from './shader/bloom/fragment.glsl?raw';
import bloomVertexShader from './shader/bloom/vertex.glsl?raw';
import './style.css';

/**
 * Variables
 */

const el = document.querySelector('#root') as HTMLDivElement;
const size = {
	width: window.innerWidth,
	height: window.innerHeight,
	pixelRatio: Math.min(2.0, window.devicePixelRatio),
};

const BLOOM_LAYER = 1;
const layer = new Layers();
layer.set(BLOOM_LAYER);

const darkMaterial = new MeshBasicMaterial({ color: 0x000000 });
const materials: Record<string, Material> = {};

const params = {
	strength: 0.5,
	radius: 0.5,
	threshold: 0.0,
};

/**
 * Loader
 */

const rgbeLoader = new RGBELoader();
rgbeLoader.setPath('/src/assets/hdr/');

const gltfLoader = new GLTFLoader();
gltfLoader.setPath('/src/assets/models/');

/**
 * Textures
 */

const environment = await rgbeLoader.loadAsync(
	'cobblestone_street_night_1k.hdr'
);
environment.mapping = EquirectangularReflectionMapping;

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
scene.background = environment;
scene.environment = environment;
scene.environmentIntensity = 0.5;

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
 * Post progressing
 */

const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(
	new Vector2(size.width / 2, size.height / 2),
	params.strength,
	params.radius,
	params.threshold
);
function updateBloom() {
	bloomPass.strength = params.strength;
	bloomPass.radius = params.radius;
	bloomPass.threshold = params.threshold;
}

const bloomComposer = new EffectComposer(renderer);
bloomComposer.renderToScreen = false;
bloomComposer.setSize(size.width, size.height);

bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

const mixPass = new ShaderPass(
	new ShaderMaterial({
		vertexShader: bloomVertexShader,
		fragmentShader: bloomFragmentShader,
		uniforms: {
			uBaseTexture: new Uniform(null),
			uBloomTexture: new Uniform(bloomComposer.renderTarget2.texture),
		},
	}),
	'uBaseTexture'
);

const outputPass = new OutputPass();

const composer = new EffectComposer(renderer);
composer.setSize(size.width, size.height);
composer.setPixelRatio(size.pixelRatio);
composer.addPass(renderScene);
composer.addPass(mixPass);
composer.addPass(outputPass);

/**
 * World
 */

const ROSCarModel = await gltfLoader.loadAsync('/ROS_CAR.glb');
const ROS_CAR = ROSCarModel.scene;

const lightMaterial = new MeshStandardMaterial({
	color: 'red',
});

const leftLight = ROS_CAR.getObjectByName('左灯');
const rightLight = ROS_CAR.getObjectByName('右灯');

if (leftLight instanceof Mesh && rightLight instanceof Mesh) {
	leftLight.layers.enable(BLOOM_LAYER);
	rightLight.layers.enable(BLOOM_LAYER);

	leftLight.material = lightMaterial;
	rightLight.material = lightMaterial;
}

scene.add(ROS_CAR);

const axesHelper = new AxesHelper();
scene.add(axesHelper);

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

const bP = pane.addFolder({ title: 'Bloom' });
bP.addBinding(params, 'strength', {
	max: 2,
	min: 0,
	step: 0.001,
}).on('change', updateBloom);
bP.addBinding(params, 'radius', {
	max: 1,
	min: 0,
	step: 0.001,
}).on('change', updateBloom);
bP.addBinding(params, 'threshold', {
	max: 1,
	min: 0,
	step: 0.001,
}).on('change', updateBloom);
bP.addBinding(lightMaterial, 'color', {
	color: {
		type: 'float',
	},
});

bP.addButton({ title: 'Toggle' });

/**
 * Event
 */

function composerRender() {
	scene.traverse(darkenMaterials);
	scene.background = null;
	axesHelper.visible = false;
	bloomComposer.render();

	scene.traverse(restoreMaterials);
	scene.background = environment;
	axesHelper.visible = true;
	composer.render();
}

function render() {
	fpsGraph.begin();

	// Time
	const delta = clock.getDelta();

	// Render
	composerRender();

	// Update
	controls.update(delta);
	controls2.update();

	// Animation
	requestAnimationFrame(render);

	fpsGraph.end();
}
render();

function resize() {
	size.width = window.innerWidth;
	size.height = window.innerHeight;

	renderer.setSize(size.width, size.height);
	composer.setSize(size.width, size.height);

	camera.aspect = size.width / size.height;
	camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);

function darkenMaterials(obj: Object3D) {
	if (obj instanceof Mesh && layer.test(obj.layers) === false) {
		materials[obj.uuid] = obj.material;
		obj.material = darkMaterial;
	}
}

function restoreMaterials(obj: Object3D) {
	if (obj instanceof Mesh && materials[obj.uuid]) {
		obj.material = materials[obj.uuid];
		delete materials[obj.uuid];
	}
}
