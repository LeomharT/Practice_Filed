import './style.css';

// Root el
const root = document.querySelector('#root') as HTMLDivElement;
// Box el
const box = document.querySelector('.box') as HTMLDivElement;

function onPointerDown() {
	root.addEventListener('pointermove', onPointerMove);
}

function onPointerMove(e: PointerEvent) {
	root.setPointerCapture(e.pointerId);

	const boxRect = box.getBoundingClientRect();

	const center = {
		x: boxRect.x + boxRect.width / 2,
		y: boxRect.y + boxRect.height / 2,
	};

	const coord = {
		x: e.clientX,
		y: e.clientY,
	};

	const x = coord.x - center.x;
	const y = coord.y - center.y;

	let angle = Math.atan2(y, x);
	angle *= 180 / Math.PI;

	box.style.transform = `rotate(${angle}deg)`;
}

function onPointerUp() {
	root.removeEventListener('pointermove', onPointerMove);
}

root.addEventListener('pointerdown', onPointerDown);
root.addEventListener('pointerup', onPointerUp);
