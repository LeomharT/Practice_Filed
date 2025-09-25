import {
	AxesHelper,
	Clock,
	Color,
	DirectionalLight,
	DoubleSide,
	EquirectangularReflectionMapping,
	Layers,
	Material,
	MathUtils,
	Mesh,
	MeshBasicMaterial,
	MeshDepthMaterial,
	MeshStandardMaterial,
	Object3D,
	PCFSoftShadowMap,
	PerspectiveCamera,
	PlaneGeometry,
	RGBADepthPacking,
	Scene,
	ShaderChunk,
	ShaderMaterial,
	SphereGeometry,
	Uniform,
	Vector2,
	WebGLRenderer,
} from 'three';
import CustomShaderMaterial from 'three-custom-shader-material/vanilla';
import {
	EffectComposer,
	OrbitControls,
	OutputPass,
	RenderPass,
	RGBELoader,
	ShaderPass,
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

/**
 * Variables
 */
const el = document.querySelector('#root') as HTMLDivElement;
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
	pixelratio: Math.min(2.0, window.devicePixelRatio),
};

const BLOOM_LAYER = 1;
const layer = new Layers();
layer.set(BLOOM_LAYER);

/**
 * Loaders
 */

const rgbeLoader = new RGBELoader();
rgbeLoader.setPath('/src/assets/hdr/');

/**
 * Textures
 */

const environment = await rgbeLoader.loadAsync('rural_evening_road_1k.hdr');
environment.mapping = EquirectangularReflectionMapping;

/**
 * Basic
 */

const renderer = new WebGLRenderer({
	alpha: true,
	antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelratio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
el.append(renderer.domElement);

const scene = new Scene();
scene.background = environment;
scene.backgroundIntensity = 0.125;

const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(3, 3, 3);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const clock = new Clock();

/**
 * Post processing
 */

const params = {
	strength: 0.5,
	radius: 0.5,
	threshold: 1.0,
};

const darkMaterial = new MeshBasicMaterial({ color: 0x000000 });
const materials: Record<string, Material> = {};

const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(
	new Vector2(sizes.width / 2, sizes.height / 2),
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
composer.addPass(renderScene);
composer.addPass(mixPass);
composer.addPass(outputPass);

/**
 * World
 */

const lightColor = new Color(
	MathUtils.randFloat(0.0, 1.0),
	MathUtils.randFloat(0.0, 1.0),
	MathUtils.randFloat(0.0, 1.0)
);

const uniforms = {
	uColor: new Uniform(lightColor),
	uProgress: new Uniform(-1.08),
	uFrequency: new Uniform(0.85),
};

const sphereGometry = new SphereGeometry(2, 36, 36);
const sphereMaterial = new ShaderMaterial({
	vertexShader: disslutionVertexShader,
	fragmentShader: disslutionFragmentShader,
	uniforms,
	side: DoubleSide,
});

const glowSphere = new Mesh(sphereGometry, sphereMaterial);
glowSphere.castShadow = true;
glowSphere.layers.enable(BLOOM_LAYER);
scene.add(glowSphere);

const depthMaterial = new CustomShaderMaterial({
	baseMaterial: MeshDepthMaterial,
	uniforms,
	vertexShader: disslutionVertexShader,
	fragmentShader: disslutionFragmentShader,
	depthPacking: RGBADepthPacking,
});

glowSphere.customDepthMaterial = depthMaterial;

const plane = new Mesh(new PlaneGeometry(15, 15), new MeshStandardMaterial());
plane.castShadow = true;
plane.receiveShadow = true;
plane.rotation.y = Math.PI / 2;
plane.position.x = -3.0;
scene.add(plane);

const axesHelper = new AxesHelper(5);
scene.add(axesHelper);

/**
 * Light
 */

const directionalLight = new DirectionalLight(0xffffff, 3.0);
directionalLight.position.x = 5.0;
directionalLight.position.y = 1.5;
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(sizes.width, sizes.height);

scene.add(directionalLight);

/**
 * Pane
 */

const pane = new Pane({ title: 'Debug Params' });
pane.element.parentElement!.style.width = '380px';

const bP = pane.addFolder({ title: 'Bloom' });
bP.addBinding(params, 'strength', {
	min: 0,
	max: 2,
	step: 0.001,
}).on('change', updateBloom);
bP.addBinding(params, 'radius', {
	min: 0,
	max: 1,
	step: 0.001,
}).on('change', updateBloom);
bP.addBinding(params, 'threshold', {
	min: 0,
	max: 1,
	step: 0.001,
}).on('change', updateBloom);

pane.addBinding(uniforms.uFrequency, 'value', {
	label: 'Frequency',
	max: 2,
	min: 0,
	step: 0.001,
});
pane.addBinding(uniforms.uProgress, 'value', {
	label: 'Progress',
	max: 1,
	min: -1.08,
	step: 0.001,
});

/**
 * Event
 */

function composerRender() {
	scene.traverse(darkenMaterial);
	scene.background = null;

	bloomComposer.render();

	scene.traverse(restoreMaterial);
	scene.background = environment;

	composer.render();
}

function render() {
	// Time
	const delta = clock.getDelta();

	// Render
	composerRender();

	// Update
	controls.update(delta);

	// Animation
	requestAnimationFrame(render);
}
render();

function resize() {
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	renderer.setSize(sizes.width, sizes.height);
	composer.setSize(sizes.width, sizes.height);

	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);

function darkenMaterial(obj: Object3D) {
	if (obj instanceof Mesh && layer.test(obj.layers) === false) {
		materials[obj.uuid] = obj.material;
		obj.material = darkMaterial;
	}
}

function restoreMaterial(obj: Object3D) {
	if (obj instanceof Mesh && materials[obj.uuid]) {
		obj.material = materials[obj.uuid];
		delete materials[obj.uuid];
	}
}
