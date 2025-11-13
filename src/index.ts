import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import {
	AmbientLight,
	Clock,
	Color,
	EquirectangularReflectionMapping,
	Layers,
	Material,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial,
	MirroredRepeatWrapping,
	Object3D,
	PerspectiveCamera,
	ReinhardToneMapping,
	Scene,
	ShaderChunk,
	ShaderMaterial,
	SphereGeometry,
	TextureLoader,
	Uniform,
	Vector2,
	WebGLRenderer,
} from 'three';
import CustomShaderMaterial from 'three-custom-shader-material/vanilla';
import {
	EffectComposer,
	GLTFLoader,
	HDRLoader,
	OrbitControls,
	OutputPass,
	RenderPass,
	ShaderPass,
	TrackballControls,
	UnrealBloomPass,
} from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import bloomFragmentShader from './shader/bloom/fragment.glsl?raw';
import bloomVertexShader from './shader/bloom/vertex.glsl?raw';
import disslutionFragmentShader from './shader/disslution/fragment.glsl?raw';
import disslutionVertexShader from './shader/disslution/vertex.glsl?raw';
import simplex3DNoise from './shader/include/simplex3DNoise.glsl?raw';
import './style.css';

(ShaderChunk as any)['simplex3DNoise'] = simplex3DNoise;

const el = document.querySelector('#root') as HTMLDivElement;
const size = {
	width: window.innerWidth,
	height: window.innerHeight,
	pixelRatio: Math.min(2.0, window.devicePixelRatio),
};

const LAYER = {
	BLOOM: 1,
};

const layer = new Layers();
layer.set(LAYER.BLOOM);

/**
 * Loader
 */

const hdrLoader = new HDRLoader();
hdrLoader.setPath('/src/assets/hdr/');

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

hdrLoader.load('rural_evening_road_1k.hdr', (data) => {
	data.mapping = EquirectangularReflectionMapping;

	scene.background = data;
	// scene.backgroundBlurriness = 0.95;
});

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
renderer.toneMappingExposure = 1.0;
el.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color('#1e1e1e');

const camera = new PerspectiveCamera(50, size.width / size.height, 0.1, 1000);
camera.position.set(4, 0, 0);
camera.lookAt(scene.position);
camera.layers.enable(LAYER.BLOOM);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.enabled = true;

const controls2 = new TrackballControls(camera, renderer.domElement);
controls2.noPan = true;
controls2.noRotate = true;
controls2.noZoom = false;

const clock = new Clock();

const darkMaterial = new MeshBasicMaterial({ color: 0x000000 });
const materials: Record<string, Material> = {};

/**
 * Post processing
 */

const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(
	new Vector2(size.width, size.height),
	0.8,
	0.1,
	1.5
);

const outputPass = new OutputPass();

const bloomComposer = new EffectComposer(renderer);
bloomComposer.renderToScreen = false;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

const mixPass = new ShaderPass(
	new ShaderMaterial({
		vertexShader: bloomVertexShader,
		fragmentShader: bloomFragmentShader,
		uniforms: {
			uDiffuseColor: new Uniform(null),
			uBloomTexture: new Uniform(bloomComposer.renderTarget2.texture),
		},
	}),
	'uDiffuseColor'
);

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(mixPass);
composer.addPass(outputPass);

/**
 * World
 */

const uniforms = {
	uProgress: new Uniform(-1.0),
	uFrequency: new Uniform(2.0),
	uNoiseTexture: new Uniform(noiseTexture),
	uBasicColor: new Uniform(new Color('#87e8de')),
	uDisslutionColor: new Uniform(new Color('#ff7875')),
};

const sphereGeometry = new SphereGeometry(1, 64, 64);
const sphereMaterial = new CustomShaderMaterial({
	baseMaterial: MeshStandardMaterial,
	uniforms,
	vertexShader: disslutionVertexShader,
	fragmentShader: disslutionFragmentShader,
	metalness: 0.98,
	roughness: 0.1,
});

const sphere = new Mesh(sphereGeometry, sphereMaterial);
sphere.layers.set(LAYER.BLOOM);

scene.add(sphere);

const ambientLight = new AmbientLight(0xffffff, 10.0);
scene.add(ambientLight);

/**
 * Pane
 */
const pane = new Pane({ title: 'Debug Params' });
pane.element.parentElement!.style.width = '380px';
pane.registerPlugin(EssentialsPlugin);
const fpsGraph: any = pane.addBlade({
	view: 'fpsgraph',
	label: undefined,
	rows: 4,
});

pane.addBinding(uniforms.uProgress, 'value', {
	step: 0.01,
	min: -1.0,
	max: 1.0,
});

/**
 * Events
 */

let env: Scene['background'];

function renderBloom(delta: number) {
	scene.traverse(darkenMaterial);
	env = scene.background;
	scene.background = null;

	bloomComposer.render(delta);

	scene.background = env;
	scene.traverse(restoreMaterial);
}

function render() {
	fpsGraph.begin();
	// Time
	const delta = clock.getDelta();

	// Render
	renderBloom(delta);
	composer.render(delta);

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

	camera.aspect = size.width / size.height;
	camera.updateProjectionMatrix();
}

window.addEventListener('resize', resize);

function darkenMaterial(obj: Object3D) {
	if (obj instanceof Mesh && obj.layers.test(layer) === false) {
		materials[obj.uuid] = obj.material;
		obj.material = darkMaterial;
	}
}

function restoreMaterial(obj: Object3D) {
	if (materials[obj.uuid] && obj instanceof Mesh) {
		obj.material = materials[obj.uuid];
		delete materials[obj.uuid];
	}
}
