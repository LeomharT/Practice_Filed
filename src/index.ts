import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import {
	ACESFilmicToneMapping,
	Clock,
	Color,
	CubeCamera,
	Group,
	Layers,
	Material,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial,
	Object3D,
	PCFSoftShadowMap,
	PerspectiveCamera,
	PlaneGeometry,
	RepeatWrapping,
	Scene,
	ShaderMaterial,
	SphereGeometry,
	SpotLight,
	TextureLoader,
	TorusGeometry,
	Uniform,
	Vector2,
	WebGLCubeRenderTarget,
	WebGLRenderer,
} from 'three';
import CustomShaderMaterial from 'three-custom-shader-material/vanilla';
import {
	EffectComposer,
	GLTFLoader,
	OrbitControls,
	OutputPass,
	Reflector,
	RenderPass,
	ShaderPass,
	TrackballControls,
	UnrealBloomPass,
} from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import bloomFragmentShader from './shader/bloom/fragment.glsl?raw';
import bloomVertexShader from './shader/bloom/vertex.glsl?raw';
import floorFragmentShader from './shader/floor/fragment.glsl?raw';
import floorVertexShader from './shader/floor/vertex.glsl?raw';

import './style.css';

const el = document.querySelector('#root') as HTMLDivElement;
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
	pixelRatio: Math.max(2.0, window.devicePixelRatio),
};

const bloomParams = {
	strength: 0.5,
	radius: 0.5,
	threshold: 0.0,
};

const darkMaterial = new MeshBasicMaterial({
	color: '#000000',
});
const materials: Record<string, Material> = {};

const LAYERS = {
	ENVIRONMENT: 1,
	BLOOM: 2,
};

const layers = new Layers();
layers.set(LAYERS.BLOOM);

/**
 * Loader
 */

const gltfLoader = new GLTFLoader();
gltfLoader.setPath('/src/assets/models/');

const textureLoader = new TextureLoader();
textureLoader.setPath('/src/assets/textures/');

/**
 * Modles
 */

const corvetteModel = await gltfLoader.loadAsync('chevrolet_corvette_c7.glb');

/**
 * Textures
 */

const normalMap = textureLoader.load('terrain-normal.jpg');
normalMap.wrapS = normalMap.wrapT = RepeatWrapping;
normalMap.repeat.set(5, 5);

const roughnessMap = textureLoader.load('terrain-roughness.jpg');
roughnessMap.wrapS = roughnessMap.wrapT = RepeatWrapping;
roughnessMap.repeat.set(5, 5);

/**
 * Basic
 */
const renderer = new WebGLRenderer({
	alpha: true,
	antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
renderer.toneMapping = ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
el.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color('#000000');

const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(3, 3, 3);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const controls2 = new TrackballControls(camera, renderer.domElement);
controls2.noPan = true;
controls2.noRotate = true;
controls2.noZoom = false;

const clock = new Clock();

const cubeRenderTarget = new WebGLCubeRenderTarget(512, {
	generateMipmaps: true,
});

const cubeCamera = new CubeCamera(0.01, 1000, cubeRenderTarget);
cubeCamera.layers.set(LAYERS.ENVIRONMENT);

/**
 * Post processing
 */

const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(
	new Vector2(sizes.width / 2, sizes.height / 2),
	0.5,
	0.5,
	0.0
);
function updateBloom() {
	bloomPass.strength = bloomParams.strength;
	bloomPass.radius = bloomParams.radius;
	bloomPass.threshold = bloomParams.threshold;
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

// Corvette
const corvette = corvetteModel.scene;
corvette.scale.setScalar(0.005);
corvette.traverse((obj) => {
	if (obj instanceof Mesh && obj.material instanceof MeshStandardMaterial) {
		obj.castShadow = true;
		obj.receiveShadow = true;

		obj.material.envMap = cubeRenderTarget.texture;
		obj.material.envMapIntensity = 10.0;
	}
});
scene.add(corvette);

const sphere = new Mesh(
	new SphereGeometry(1, 32, 32),
	new MeshStandardMaterial({
		color: 0x000000,
		roughness: 0.0,
		envMap: cubeRenderTarget.texture,
		envMapIntensity: 10.0,
	})
);
sphere.position.y = 1.0;
scene.add(sphere);

// Floor
const floorGeometry = new PlaneGeometry(30, 30, 128, 128);
const floorReflection = new Reflector(floorGeometry, {
	textureWidth: sizes.width / 2,
	textureHeight: sizes.height / 2,
});
floorReflection.rotation.x = -Math.PI / 2;
floorReflection.position.y = -0.01;
scene.add(floorReflection);

const uniforms = {
	uReflectionTexture: (floorReflection.material as ShaderMaterial).uniforms
		.tDiffuse,
	uTextureMatrix: (floorReflection.material as ShaderMaterial).uniforms
		.textureMatrix,
	uNormalMapCustom: new Uniform(normalMap),
	uRoughnessMapCustom: new Uniform(roughnessMap),
};

const floorMaterial = new CustomShaderMaterial({
	baseMaterial: MeshStandardMaterial,
	uniforms,
	dithering: true,
	vertexShader: floorVertexShader,
	fragmentShader: floorFragmentShader,
	normalMap: normalMap,
	roughnessMap: roughnessMap,
});

const floor = new Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Ring
const rings = new Group();
rings.layers.enable(LAYERS.ENVIRONMENT);

const ringCount = 14;
const ringGap = 3.5;

const ringGeometry = new TorusGeometry(3.35, 0.05, 10, 100);
const ringMaterial = new MeshStandardMaterial({
	color: 0x000000,
});

for (let i = 0; i < ringCount; i++) {
	const ring = new Mesh(ringGeometry, ringMaterial.clone());

	ring.castShadow = true;
	ring.receiveShadow = true;
	ring.layers.enable(LAYERS.ENVIRONMENT);
	ring.layers.enable(LAYERS.BLOOM);

	rings.add(ring);
}

scene.add(rings);

/**
 * Lights
 */

const LIGHT_COLORS = {
	BLUE: new Color(1, 0.25, 0.7),
	RED: new Color(0.14, 0.5, 1.0),
};

const light1 = new SpotLight(LIGHT_COLORS.BLUE, 230);
light1.angle = 0.6;
light1.penumbra = 0.5;
light1.castShadow = true;
light1.shadow.normalBias = 0.01;
light1.position.set(5, 5, 0);
scene.add(light1);

const light2 = new SpotLight(LIGHT_COLORS.RED, 230);
light2.position.set(-5, 5, 0);
light2.angle = 0.6;
light2.penumbra = 0.5;
light2.castShadow = true;
light2.shadow.normalBias = 0.01;
scene.add(light2);

const pane = new Pane({ title: 'Debug Params' });
pane.element.parentElement!.style.width = '380px';
pane.registerPlugin(EssentialsPlugin);
const fpsGraph: any = pane.addBlade({
	view: 'fpsgraph',
	label: undefined,
	max: 80,
	rows: 3,
});

const lightPane = pane.addFolder({ title: 'Light' });
lightPane.addBinding(light1, 'color', {
	label: 'Light1 Color',
	color: {
		type: 'float',
	},
});

const bloomPane = pane.addFolder({ title: 'Bloom' });
bloomPane
	.addBinding(bloomParams, 'strength', {
		min: 0.0,
		max: 2.0,
		step: 0.001,
	})
	.on('change', updateBloom);
bloomPane
	.addBinding(bloomParams, 'radius', {
		min: 0.0,
		max: 1.0,
		step: 0.001,
	})
	.on('change', updateBloom);
bloomPane
	.addBinding(bloomParams, 'threshold', {
		min: 0.0,
		max: 1.0,
		step: 0.001,
	})
	.on('change', updateBloom);

/**
 * Events
 */

function updateRings(time: number) {
	time *= 0.0004;

	for (let i = 0; i < ringCount; i++) {
		const ring = rings.children[i] as Mesh<TorusGeometry, MeshStandardMaterial>;

		// mul(2) is important
		const z = (7 - i) * ringGap - (time % ringGap) * 2;

		// [-7, 7]
		const distance = Math.abs(z);

		ring.position.z = z;
		ring.scale.setScalar(1 - distance * 0.04);

		let colorScale = 1.0;

		if (distance > 2) {
			colorScale = 1 - (Math.min(distance, 12) - 2) / 10;
		}
		colorScale *= 0.5;

		if (i % 2 === 1) {
			ring.material.emissive = new Color(6, 0.15, 0.7).multiplyScalar(
				colorScale
			);
		} else {
			ring.material.emissive = new Color(0.1, 0.7, 3).multiplyScalar(
				colorScale
			);
		}
	}
}

function composerRender() {
	scene.traverse(darkenMaterial);

	bloomComposer.render();

	scene.traverse(restoreMaterial);

	composer.render();
}

function render(time: number = 0) {
	fpsGraph.begin();

	// Time
	const delta = clock.getDelta();

	// Redner
	composerRender();

	// Update
	controls.update(delta);
	controls2.update();
	cubeCamera.update(renderer, scene);
	updateRings(time);

	// Animation
	requestAnimationFrame(render);

	fpsGraph.end();
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

function darkenMaterial(obj: Object3D) {
	if (obj instanceof Mesh && layers.test(obj.layers) === false) {
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
