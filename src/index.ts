import {
	BufferAttribute,
	BufferGeometry,
	Clock,
	Color,
	DoubleSide,
	InstancedMesh,
	MathUtils,
	Matrix4,
	Object3D,
	PerspectiveCamera,
	ReinhardToneMapping,
	Scene,
	ShaderChunk,
	ShaderMaterial,
	TextureLoader,
	Uniform,
	WebGLRenderer,
} from 'three';
import {
	GLTFLoader,
	OrbitControls,
	TrackballControls,
} from 'three/examples/jsm/Addons.js';
import grassFragmentShader from './shader/grass/fragment.glsl?raw';
import grassVertexShader from './shader/grass/vertex.glsl?raw';
import './style.css';

console.log(ShaderChunk['begin_vertex']);
console.log(ShaderChunk['project_vertex']);

const el = document.querySelector('#root') as HTMLDivElement;
const size = {
	width: window.innerWidth,
	height: window.innerHeight,
	pixelRatio: Math.min(2.0, window.devicePixelRatio),
};

const LAYER = {
	RAIN: 1,
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
 * Textures
 */

const noiseTexture = textureLoader.load('noiseTexture.png');

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
camera.position.set(3, 3, 3);
camera.lookAt(scene.position);
camera.layers.enable(LAYER.RAIN);

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

const params = {
	count: 8500,
	radius: 5.5,
};

const uniforms = {
	uTime: new Uniform(0.0),
	uInstanceMatrix: new Uniform(new Matrix4()),
	uRootColor: new Uniform(new Color('#135200')),
	uGrassColor: new Uniform(new Color('#95de64')),
	uGrassColor2: new Uniform(new Color('#52c41a')),
	uNoiseTexture: new Uniform(noiseTexture),
};

const positionArr = new Float32Array([
	-0.5, 0.0, 0.0, 0.0, 2.0, 0.0, 0.5, 0.0, 0.0,
]);
const attrPosition = new BufferAttribute(positionArr, 3);

const uvArr = new Float32Array([
	0.0,
	0.0, // 左下角
	0.5,
	1.0, // 顶点
	1.0,
	0.0, // 右下角
]);
const attrUv = new BufferAttribute(uvArr, 2);

const grassGeometry = new BufferGeometry();
grassGeometry.computeVertexNormals();
grassGeometry.setAttribute('position', attrPosition);
grassGeometry.setAttribute('uv', attrUv);

const grassMaterial = new ShaderMaterial({
	side: DoubleSide,
	vertexShader: grassVertexShader,
	fragmentShader: grassFragmentShader,
	uniforms,
});

const grass = new InstancedMesh(grassGeometry, grassMaterial, params.count);
grass.scale.setScalar(0.3);

const objGrass = new Object3D();
for (let i = 0; i < params.count; i++) {
	objGrass.position.set(
		MathUtils.randFloat(-params.radius, params.radius),
		0,
		MathUtils.randFloat(-params.radius, params.radius)
	);

	objGrass.scale.setY(MathUtils.randFloat(0.6, 1.0));

	objGrass.updateMatrix();
	objGrass.updateMatrixWorld();

	uniforms.uInstanceMatrix.value.copy(objGrass.matrix);

	grass.setMatrixAt(i, objGrass.matrix);
}

scene.add(grass);

/**
 * Events
 */

function render() {
	// Time
	const delta = clock.getDelta();
	const elapsed = clock.getElapsedTime();

	// Render
	renderer.render(scene, camera);

	// Update
	controls.update(delta);
	controls2.update();
	uniforms.uTime.value = elapsed;

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
