import {
	AmbientLight,
	Clock,
	Color,
	InstancedMesh,
	Layers,
	Material,
	MathUtils,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial,
	MirroredRepeatWrapping,
	Object3D,
	PerspectiveCamera,
	PlaneGeometry,
	Raycaster,
	ReinhardToneMapping,
	Scene,
	ShaderMaterial,
	TextureLoader,
	Uniform,
	Vector2,
	Vector3,
	WebGLRenderer,
} from 'three';
import {
	EffectComposer,
	GLTFLoader,
	OrbitControls,
	OutputPass,
	RenderPass,
	ShaderPass,
	TrackballControls,
	UnrealBloomPass,
} from 'three/examples/jsm/Addons.js';
import bloomFragmentShader from './shader/bloom/fragment.glsl?raw';
import bloomVertexShader from './shader/bloom/vertex.glsl?raw';
import './style.css';

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

const alphaMap = textureLoader.load('starAlpha.png');

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
renderer.toneMappingExposure = 1.05;
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
controls.enabled = false;

const controls2 = new TrackballControls(camera, renderer.domElement);
controls2.noPan = true;
controls2.noRotate = true;
controls2.noZoom = false;
controls2.enabled = false;

const clock = new Clock();

const raycaster = new Raycaster();

/**
 * Post processing
 */

const renderScene = new RenderPass(scene, camera);

const outputPass = new OutputPass();

const bloomPass = new UnrealBloomPass(
	new Vector2(size.width, size.height),
	0.85,
	0.1,
	0.0
);

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

const darkMaterial = new MeshBasicMaterial({ color: 0x000000 });
const materials: Record<string, Material> = {};

/**
 * World
 */

const point = new Vector3();
const mouse = new Vector2();

const planeGeometry = new PlaneGeometry(5, 5, 64, 64);
const planeMaterial = new MeshBasicMaterial({
	color: 'yellow',
	transparent: true,
	opacity: 0.0,
	visible: false,
});

const plane = new Mesh(planeGeometry, planeMaterial);
plane.rotation.y = Math.PI / 2;
scene.add(plane);

const spaceship = spaceshipModel.scene;
spaceship.scale.setScalar(0.1);
spaceship.position.x = -0.8;

spaceship.traverse((obj) => {
	if (obj instanceof Mesh && obj.material instanceof MeshStandardMaterial) {
		obj.material.depthTest = true;
		obj.material.depthWrite = true;
	}
});
scene.add(spaceship);

const STAR = {
	count: 300,
	colors: ['#fcaa67', '#c75d59', '#ffffc7', '#8cc5c6', '#a5898c'],
};
const STARS: {
	len: number;
	pos: Vector3;
	color: Color;
	speed: number;
}[] = [];

const r = MathUtils.randFloat;

function resetStar() {
	let len = 0;
	let pos;

	if (Math.random() > 0.8) {
		len = r(1.5, 15);
		pos = new Vector3(r(-15, 15), r(-15, 15), r(-15, 15));
	} else {
		len = r(2.5, 20);
		pos = new Vector3(r(-45, 15), r(-15, 15), r(-15, 15));
	}

	const color = new Color(
		STAR.colors[Math.floor(Math.random() * STAR.colors.length)]
	)
		.convertSRGBToLinear()
		.multiplyScalar(1.3);
	const speed = r(19.5, 42);

	return {
		len,
		pos,
		color,
		speed,
	};
}

const starGeometry = new PlaneGeometry(1, 0.1);
const starMaterial = new MeshBasicMaterial({
	transparent: true,
	alphaMap: alphaMap,
	alphaTest: 0.2,
});
const stars = new InstancedMesh(starGeometry, starMaterial, STAR.count);
stars.rotation.y = Math.PI / 2;
stars.layers.set(LAYER.BLOOM);
scene.add(stars);

for (let i = 0; i < STAR.count; i++) {
	STARS.push(resetStar());
}

const object3D = new Object3D();
for (let i = 0; i < STARS.length; i++) {
	object3D.position.copy(STARS[i].pos);
	object3D.scale.x = STARS[i].len;
	object3D.updateMatrix();

	stars.setMatrixAt(i, object3D.matrix);
	stars.setColorAt(i, STARS[i].color);
}

/**
 * Light
 */
const ambientLight = new AmbientLight(0xffffff, 1.0);
scene.add(ambientLight);

/**
 * Helpers
 */

/**
 * Events
 */

let translY = 0;
let translAcceleration = 0;

let angleZ = 0;
let angleZAcceleration = 0;

function updateStars(delta: number) {
	stars.instanceMatrix.needsUpdate = true;

	for (let i = 0; i < STARS.length; i++) {
		if (STARS[i].pos.x >= 40) {
			STARS[i] = resetStar();
		}
		STARS[i].pos.x += STARS[i].speed * delta;
		object3D.position.copy(STARS[i].pos);
		object3D.scale.x = STARS[i].len;

		object3D.updateMatrix();

		stars.setMatrixAt(i, object3D.matrix);
		stars.setColorAt(i, STARS[i].color);
	}
}

function renderBloom(delta: number) {
	scene.background = null;
	scene.traverse(darkenMaterial);
	plane.visible = false;

	bloomComposer.render(delta);

	plane.visible = true;
	scene.background = new Color('#1e1e1e');
	scene.traverse(restoreMaterial);
}

function render() {
	// Time
	const delta = clock.getDelta();

	// Render
	renderBloom(delta);
	composer.render(delta);

	// Update
	controls.update(delta);
	controls2.update();

	// Update spaceship
	const targetY = point.y;
	translAcceleration += (targetY - translY) * 0.002;
	translAcceleration *= 0.95;
	translY += translAcceleration;

	spaceship.position.y = translY;

	// Update spaceship rotation

	// Get B to A
	const dir = point.clone().sub(new Vector3(0, translY, 0)).normalize();
	const dirCos = dir.dot(new Vector3(0, 1, 0));
	const angle = Math.acos(dirCos) - Math.PI / 2;

	angleZAcceleration += (angle - angleZ) * 0.06;
	angleZAcceleration *= 0.85;
	angleZ = angleZAcceleration;

	spaceship.rotation.setFromVector3(new Vector3(angleZ, 0, angleZ));

	updateStars(delta);

	// Animation
	requestAnimationFrame(render);
}
render();

function resize() {
	size.width = window.innerWidth;
	size.height = window.innerHeight;

	renderer.setSize(size.width, size.height);
	bloomComposer.setSize(size.width, size.height);
	composer.setSize(size.width, size.height);

	camera.aspect = size.width / size.height;
	camera.updateProjectionMatrix();
}

window.addEventListener('resize', resize);

function onMouseMove(e: MouseEvent) {
	// NDC
	const x = (e.clientX / window.innerWidth) * 2.0 - 1.0;
	const y = -(e.clientY / window.innerHeight) * 2.0 + 1.0;

	mouse.set(x, y);

	raycaster.setFromCamera(mouse, camera);

	const intersects = raycaster.intersectObject(plane);

	if (intersects.length) {
		const interSectPoint = intersects[0].point.clone();
		interSectPoint.x = -3.0;
		point.copy(interSectPoint);
	}
}

window.addEventListener('mousemove', onMouseMove);

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
