import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import {
	ACESFilmicToneMapping,
	Clock,
	Color,
	IcosahedronGeometry,
	Layers,
	Mesh,
	MeshBasicMaterial,
	MirroredRepeatWrapping,
	PerspectiveCamera,
	PlaneGeometry,
	Raycaster,
	Scene,
	ShaderChunk,
	ShaderMaterial,
	TextureLoader,
	Vector2,
	Vector3,
	WebGLRenderer,
	type IUniform,
} from 'three';
import {
	GLTFLoader,
	HDRLoader,
	OrbitControls,
	Reflector,
	TrackballControls,
} from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import floorFragmentShader from './shader/floor/fragment.glsl?raw';
import floorVertexShader from './shader/floor/vertex.glsl?raw';
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
	RAIN: 2,
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

/**
 * Basic
 */

const renderer = new WebGLRenderer({
	alpha: true,
	antialias: true,
});
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(size.pixelRatio);
renderer.toneMapping = ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
el.append(renderer.domElement);

const scene = new Scene();
scene.background = new Color('#1e1e1e');

const camera = new PerspectiveCamera(50, size.width / size.height, 0.1, 1000);
camera.position.set(4, 4, 4);
camera.lookAt(scene.position);
camera.layers.enable(LAYER.BLOOM);
camera.layers.enable(LAYER.RAIN);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.enabled = true;

const controls2 = new TrackballControls(camera, renderer.domElement);
controls2.noPan = true;
controls2.noRotate = true;
controls2.noZoom = false;

const clock = new Clock();

const raycaster = new Raycaster();

/**
 * World
 */

const spaceship = spaceshipModel.scene;
spaceship.scale.setScalar(0.1);
spaceship.position.x = -3;

// scene.add(spaceship);

const uniforms: Record<string, IUniform<any>> = {};

const planeGeometry = new PlaneGeometry(5, 5, 64, 64);

const floorReflector = new Reflector(planeGeometry, {
	textureWidth: size.width,
	textureHeight: size.height,
});
floorReflector.rotation.x = -Math.PI / 2;
floorReflector.position.y = -0.0001;
scene.add(floorReflector);

if (floorReflector.material instanceof ShaderMaterial) {
	uniforms['uDiffuse'] = floorReflector.material.uniforms.tDiffuse;
	uniforms['uTextureMatrix'] = floorReflector.material.uniforms.textureMatrix;
}

const planeMaterial = new ShaderMaterial({
	vertexShader: floorVertexShader,
	fragmentShader: floorFragmentShader,
	uniforms,
});

const plane = new Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

const ballGeometry = new IcosahedronGeometry(0.1, 3);
const ballMaterial = new MeshBasicMaterial({
	color: '#eb2f96',
});
const ball = new Mesh(ballGeometry, ballMaterial);
scene.add(ball);

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

/**
 * Events
 */

const point = new Vector2();
const intersectPoint = new Vector3();

let translateZ = 0;
let accelerationZ = 0;

let translateX = 0;
let accelerationX = 0;

function updateBallPosition() {
	const target = {
		x: intersectPoint.x,
		z: intersectPoint.z,
	};

	accelerationZ += (target.z - translateZ) * 0.002;
	accelerationZ *= 0.95;
	translateZ += accelerationZ;

	accelerationX += (target.x - translateX) * 0.002;
	accelerationX *= 0.95;
	translateX += accelerationX;

	ball.position.z = translateZ;
	ball.position.y = 1.25;
	ball.position.x = translateX;
}

function render() {
	fpsGraph.begin();
	// Time
	const delta = clock.getDelta();
	const elapsed = clock.getElapsedTime();

	// Render
	renderer.render(scene, camera);

	// Update
	controls.update(delta);
	controls2.update();

	updateBallPosition();

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

function onPointerMove(e: PointerEvent) {
	point.x = (e.clientX / window.innerWidth) * 2 - 1;
	point.y = -(e.clientY / window.innerHeight) * 2 + 1;

	raycaster.setFromCamera(point, camera);

	const intersects = raycaster.intersectObject(plane);

	if (intersects.length) {
		intersectPoint.copy(intersects[0].point);
	}
}

window.addEventListener('pointermove', onPointerMove);
