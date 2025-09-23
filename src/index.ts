import {
	AmbientLight,
	BoxGeometry,
	Clock,
	Color,
	EquirectangularReflectionMapping,
	Layers,
	Material,
	MathUtils,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial,
	Object3D,
	PerspectiveCamera,
	RectAreaLight,
	Scene,
	ShaderChunk,
	ShaderMaterial,
	SphereGeometry,
	Uniform,
	Vector2,
	WebGLRenderer,
} from 'three';
import {
	EffectComposer,
	GLTFLoader,
	OrbitControls,
	OutputPass,
	RectAreaLightHelper,
	RenderPass,
	RGBELoader,
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

/**
 * Variables
 */
const el = document.querySelector('#root') as HTMLDivElement;
const size = {
	width: window.innerWidth,
	height: window.innerHeight,
};
const BLOOM_LAYER = 1;

const layer = new Layers();
layer.set(BLOOM_LAYER);

/**
 * Loader
 */

const gltfLoader = new GLTFLoader();
gltfLoader.setPath('/src/assets/models/');

const rgbeLoader = new RGBELoader();
rgbeLoader.setPath('/src/assets/hdr/');

/**
 * Models
 */
const hdrTexture = await rgbeLoader.loadAsync('rural_evening_road_1k.hdr');
hdrTexture.mapping = EquirectangularReflectionMapping;

/**
 * Basic
 */

const renderer = new WebGLRenderer({
	alpha: true,
	antialias: true,
});
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(window.devicePixelRatio);
el.append(renderer.domElement);

const scene = new Scene();
scene.backgroundIntensity = 0.125;
scene.environmentIntensity = 0.125;

const camera = new PerspectiveCamera(75, size.width / size.height, 0.1, 1000);
camera.position.set(3, 3, 3);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.enableRotate = true;
controls.enableZoom = false;

const controls2 = new TrackballControls(camera, renderer.domElement);
controls2.noPan = true;
controls2.noRotate = true;
controls2.noZoom = false;

const clock = new Clock();

/**
 * Post processing
 */
const params = {
	threshold: 0.9,
	strength: 0.5,
	radius: 0.5,
	exposure: 1,
};

const darkMaterial = new MeshBasicMaterial({ color: 'black' });
const materials: Record<string, Material> = {};

// Pass
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

const sphereGeometry = new SphereGeometry(2, 32, 32);
const sphereMaterial = new MeshStandardMaterial({
	color: '#B6CEB4',
});

const sphere = new Mesh(sphereGeometry, sphereMaterial);
sphere.position.x = 1.0;

const lightColor = new Color(
	MathUtils.randFloat(0.0, 0.89),
	MathUtils.randFloat(0.0, 0.89),
	MathUtils.randFloat(0.0, 0.89)
);

const uniforms = {
	uColor: new Uniform(lightColor),
	uFrequency: new Uniform(0.85),
	uProgress: new Uniform(-1.0),
};

const cubeGeometry = new BoxGeometry(1, 1, 1);
const cubeMaterial = new ShaderMaterial({
	vertexShader: disslutionVertexShader,
	fragmentShader: disslutionFragmentShader,
	uniforms,
});

const glowCube = new Mesh(cubeGeometry, cubeMaterial);
glowCube.layers.enable(BLOOM_LAYER);
scene.add(glowCube);

// Light
const ambientLight = new AmbientLight(0xffffff);
scene.add(ambientLight);

const rectLight = new RectAreaLight(lightColor, 0.0, 1, 1);
rectLight.rotation.y = -Math.PI / 2;
rectLight.position.copy(glowCube.position);
rectLight.position.x += 0.5001;
scene.add(rectLight);

const rectLightHelper = new RectAreaLightHelper(rectLight);
rectLightHelper.visible = false;
scene.add(rectLightHelper);

/**
 * Pane
 */
const pane = new Pane({ title: 'Debug Params' });
pane.element.parentElement!.style.width = '380px';

const bloomP = pane.addFolder({ title: '✨ Bloom' });
bloomP
	.addBinding(params, 'strength', {
		min: 0,
		max: 3,
		step: 0.001,
	})
	.on('change', updateBloom);
bloomP
	.addBinding(params, 'radius', {
		min: 0,
		max: 1,
		step: 0.001,
	})
	.on('change', updateBloom);
bloomP
	.addBinding(params, 'threshold', {
		min: 0,
		max: 1,
		step: 0.001,
	})
	.on('change', updateBloom);
bloomP
	.addButton({
		title: 'Toggle',
	})
	.on('click', () => {
		glowCube.layers.toggle(BLOOM_LAYER);

		if (layer.test(glowCube.layers)) {
			rectLight.visible = true;

			// cubeMaterial.color = new Color(0x000000);
			// cubeMaterial.emissive = lightColor;
		} else {
			rectLight.visible = false;

			// cubeMaterial.color = lightColor;
			// cubeMaterial.emissive = new Color(0x000000);
		}
	});
pane.addBinding(uniforms.uFrequency, 'value', {
	label: 'Frequency',
	min: 0,
	max: 1,
	step: 0.001,
});
pane.addBinding(uniforms.uProgress, 'value', {
	label: 'Progress',
	min: -1,
	max: 1,
	step: 0.001,
});

/**
 * Event
 */

function renderComposer() {
	// Bloom composer
	scene.traverse(darkenMaterial);
	scene.background = null;
	scene.environment = null;
	rectLight.intensity = 0.0;

	bloomComposer.render();

	scene.traverse(restoreMaterial);
	scene.background = hdrTexture;
	scene.environment = hdrTexture;
	rectLight.intensity = 5.0;

	// Final composer
	composer.render();
}

function render() {
	// Time
	const delta = clock.getDelta();

	// Render
	renderComposer();

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
	composer.setSize(size.width, size.height);
	bloomComposer.setSize(size.width, size.height);

	camera.aspect = size.width / size.height;
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
	if (obj instanceof Mesh) {
		if (materials[obj.uuid]) {
			obj.material = materials[obj.uuid];
			delete materials[obj.uuid];
		}
	}
}

const ENUMS = {
	CAR: 'car_xxx_001_123456',
	EVENT_NAME_MOUSE_CLICK: '',
} as const;

const Labels = [ENUMS.CAR, 'phone', 'house', 'money'] as const;

type TpyeObj = {
	label: (typeof Labels)[number];
	value: string;
};

const obj: TpyeObj[] = [
	{ label: ENUMS.CAR, value: 'xiaomi' },
	{ label: 'phone', value: 'iphone' },
	{ label: 'money', value: '$12' },
];
