import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import {
	AxesHelper,
	BoxGeometry,
	Clock,
	Color,
	CubeCamera,
	CubeRefractionMapping,
	EquirectangularRefractionMapping,
	Layers,
	Material,
	MathUtils,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial,
	PerspectiveCamera,
	RectAreaLight,
	Scene,
	ShaderMaterial,
	SphereGeometry,
	Uniform,
	Vector2,
	WebGLCubeRenderTarget,
	WebGLRenderer,
} from 'three';
import {
	EffectComposer,
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
import './style.css';

const root = document.querySelector('#root') as HTMLDivElement;

const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
	pixelratio: Math.max(2.0, window.devicePixelRatio),
};

/**
 * Loaders
 */

const rgbeLoader = new RGBELoader();
rgbeLoader.setPath('/src/assets/hdr/');

/**
 * Texture
 */
const environment = await rgbeLoader.loadAsync(
	'cobblestone_street_night_1k.hdr'
);
environment.mapping = EquirectangularRefractionMapping;

/**
 * Basic
 */
const renderer = new WebGLRenderer({
	alpha: true,
	antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelratio);
root.append(renderer.domElement);

const scene = new Scene();

const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(0, 1, 2);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.enableZoom = false;
controls.enableRotate = true;

const controls2 = new TrackballControls(camera, renderer.domElement);
controls2.noPan = true;
controls2.noRotate = true;
controls2.noZoom = false;

const clock = new Clock();

const BOLOM_LAYER = 1;

const layers = new Layers();
layers.set(BOLOM_LAYER);

const darkMaterial = new MeshBasicMaterial({ color: 0x000000 });
const materials: Record<string, Material | Material[]> = {};

const cuebRenderTarget = new WebGLCubeRenderTarget(128, {
	generateMipmaps: true,
	mapping: CubeRefractionMapping,
});
const cubeCamera = new CubeCamera(0.001, 1000, cuebRenderTarget);

/**
 * Post processing
 */

const params = {
	threshold: 0,
	strength: 1,
	radius: 0.5,
	exposure: 1,
};

const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(
	new Vector2(window.innerWidth, window.innerHeight),
	params.strength,
	params.radius,
	params.threshold
);
bloomPass.threshold = params.threshold;
bloomPass.strength = params.strength;
bloomPass.radius = params.radius;

function updateBloom() {
	bloomPass.threshold = params.threshold;
	bloomPass.strength = params.strength;
	bloomPass.radius = params.radius;
}

const bloomComposer = new EffectComposer(renderer);
bloomComposer.renderToScreen = false;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

const mixUniforms = {
	baseTexture: new Uniform(null),
	bloomTexture: new Uniform(bloomComposer.renderTarget2.texture),
};

// Mix bloom scene and normal scene
const mixPass = new ShaderPass(
	new ShaderMaterial({
		uniforms: mixUniforms,
		vertexShader: bloomVertexShader,
		fragmentShader: bloomFragmentShader,
	}),
	'baseTexture'
);
mixPass.needsSwap = true;

const outputPass = new OutputPass();

const finalComposer = new EffectComposer(renderer);
finalComposer.renderToScreen = true;
finalComposer.addPass(renderScene);
finalComposer.addPass(mixPass);
finalComposer.addPass(outputPass);

/**
 * World
 */

const lightColor = new Color(
	MathUtils.randFloat(0, 1),
	MathUtils.randFloat(0, 1),
	MathUtils.randFloat(0, 1)
);

const cubeGeometry = new BoxGeometry(1, 1, 1, 32, 32, 32);

const illuminatedMaterial = new MeshStandardMaterial({
	emissive: lightColor,
	emissiveIntensity: 0.5,
});
const cubeIlluminated = new Mesh(cubeGeometry, illuminatedMaterial);
cubeIlluminated.position.x = -0.8;
cubeIlluminated.layers.enable(BOLOM_LAYER);
cubeIlluminated.scale.setScalar(0.215);
scene.add(cubeIlluminated);

const cubeMaterial = new MeshBasicMaterial({
	envMap: cuebRenderTarget.texture,
});
const cube = new Mesh(new SphereGeometry(0.5, 128, 128), cubeMaterial);
cube.position.x = 0.8;
scene.add(cube);

/**
 * Lights
 */

const rectLight = new RectAreaLight(lightColor, 1, 1, 1);
const lightPosition = cubeIlluminated.position.clone();
lightPosition.x += 0.51;
rectLight.position.copy(lightPosition);
rectLight.lookAt(cube.position);
scene.add(rectLight);

const lightHelper = new RectAreaLightHelper(rectLight);
lightHelper.visible = false;
scene.add(lightHelper);

const axesHelper = new AxesHelper();
scene.add(axesHelper);

/**
 * Pane
 */

const pane = new Pane({ title: 'Debug Params' });
pane.registerPlugin(EssentialsPlugin);
pane.element.parentElement!.style.width = '380px';

const fpsGraph: any = pane.addBlade({
	view: 'fpsgraph',
	label: undefined,
	rows: 4,
});

const bloomPan = pane.addFolder({ title: '🌟 Bloom' });
bloomPan
	.addBinding(params, 'strength', {
		max: 2,
		min: 0,
		step: 0.001,
	})
	.on('change', updateBloom);
bloomPan
	.addBinding(params, 'radius', {
		max: 1,
		min: 0,
		step: 0.001,
	})
	.on('change', updateBloom);
bloomPan
	.addBinding(params, 'threshold', {
		max: 1,
		min: 0,
		step: 0.001,
	})
	.on('change', updateBloom);
bloomPan
	.addButton({
		title: 'Toogle Bloom',
	})
	.on('click', () => {
		cubeIlluminated.layers.toggle(BOLOM_LAYER);
		if (cubeIlluminated.layers.test(layers)) {
			scene.add(rectLight);
		} else {
			scene.remove(rectLight);
		}
	});

/**
 * Event
 */

function composerRender(delta: number) {
	scene.traverse((obj) => {
		if (obj instanceof Mesh) {
			darkenNonBloomed(obj);
		}
	});
	scene.background = null;
	rectLight.intensity = 0;
	axesHelper.visible = false;
	// Bloom scene render
	bloomComposer.render(delta);

	scene.traverse((obj) => {
		if (obj instanceof Mesh) {
			restoreMaterial(obj);
		}
	});
	scene.background = environment;
	axesHelper.visible = true;
	rectLight.intensity = 5.0;
	finalComposer.render(delta);
}

function render() {
	fpsGraph.begin();

	// Time
	const delta = clock.getDelta();

	// Render
	composerRender(delta);

	cube.visible = false;
	cubeCamera.position.copy(cube.position);
	cubeCamera.update(renderer, scene);
	cube.visible = true;

	// Update
	controls.update(delta);
	controls2.update();

	// Animation loop
	requestAnimationFrame(render);

	fpsGraph.end();
}
render();

function resize() {
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;
	sizes.pixelratio = Math.min(2.0, window.devicePixelRatio);

	renderer.setSize(sizes.width, sizes.height);
	bloomComposer.setSize(sizes.width, sizes.height);
	finalComposer.setSize(sizes.width, sizes.height);

	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);

function darkenNonBloomed(obj: Mesh) {
	if (obj.isMesh && layers.test(obj.layers) === false) {
		materials[obj.uuid] = obj.material;
		obj.material = darkMaterial;
	}
}

function restoreMaterial(obj: Mesh) {
	if (materials[obj.uuid]) {
		obj.material = materials[obj.uuid];
		delete materials[obj.uuid];
	}
}
