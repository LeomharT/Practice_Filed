import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import {
	ACESFilmicToneMapping,
	Clock,
	Color,
	Mesh,
	MeshStandardMaterial,
	PCFSoftShadowMap,
	PerspectiveCamera,
	PlaneGeometry,
	RepeatWrapping,
	Scene,
	ShaderMaterial,
	SpotLight,
	TextureLoader,
	WebGLRenderer,
} from 'three';
import CustomShaderMaterial from 'three-custom-shader-material/vanilla';
import {
	GLTFLoader,
	OrbitControls,
	Reflector,
} from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import floorFragmentShader from './shader/floor/fragment.glsl?raw';
import floorVertexShader from './shader/floor/vertex.glsl?raw';
import './style.css';

const el = document.querySelector('#root') as HTMLDivElement;
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
	pixelRatio: Math.max(2.0, window.devicePixelRatio),
};

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
camera.position.set(6, 6, 6);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const clock = new Clock();

/**
 * World
 */

// Corvette
const corvette = corvetteModel.scene;
corvette.scale.setScalar(0.008);
corvette.traverse((obj) => {
	if (obj instanceof Mesh) {
		obj.castShadow = true;
		obj.receiveShadow = true;
	}
});
scene.add(corvette);

// Floor
const floorGeometry = new PlaneGeometry(30, 30, 128, 128);
const floorReflection = new Reflector(floorGeometry, {});
floorReflection.rotation.x = -Math.PI / 2;
floorReflection.position.y = -0.01;
scene.add(floorReflection);

const uniforms = {
	uReflectionTexture: (floorReflection.material as ShaderMaterial).uniforms
		.tDiffuse,
	uTextureMatrix: (floorReflection.material as ShaderMaterial).uniforms
		.textureMatrix,
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

/**
 * Events
 */

function render() {
	fpsGraph.begin();

	// Time
	const delta = clock.getDelta();

	// Redner
	renderer.render(scene, camera);

	// Update
	controls.update(delta);

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
