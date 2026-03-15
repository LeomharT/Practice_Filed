import { Colors } from '@blueprintjs/colors';
import { MathUtils } from 'three';
import './style.css';

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const el = document.querySelector('#root');

const canvas = document.createElement('canvas');
canvas.width = size.width;
canvas.height = size.height;
canvas.style.width = size.width + 'px';
canvas.style.height = size.height + 'px';
el?.append(canvas);

const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

const cursor = {
  x: 0,
  y: 0,
};

const positions = Array.from({ length: 250 }, () => ({
  x: MathUtils.randFloat(0, size.width),
  y: MathUtils.randFloat(0, size.height),
  length: MathUtils.randFloat(100, 250),
}));

const colors = [
  ...['#FFB7A5', '#E9947D', '#D17257', '#B85033', '#9E2B0E'],
  ...['#FFB3D0', '#EB91AF', '#D56F90', '#BF4B72', '#A82255'],
  ...['#E1BAE1', '#BF93BE', '#9D6D9C', '#7C497B', '#5C255C'],
  ...['#D6CCFF', '#B7A8E8', '#9784D2', '#7763BC', '#5642A6'],
  ...['#97F3EB', '#78D5CC', '#58B8AE', '#369C91', '#008075'],
  ...['#E4CBB2', '#C3A68A', '#A38364', '#836140', '#63411E'],
];

function clean() {
  ctx.save();
  ctx.fillStyle = Colors.BLACK;
  ctx.fillRect(0, 0, size.width, size.height);
  ctx.restore();
}

let angle = 0;

function renderLines() {
  ctx.save();

  for (let i = 0; i < positions.length; i++) {
    ctx.save();
    ctx.beginPath();

    ctx.lineWidth = 5;
    ctx.strokeStyle = colors[i % colors.length];

    const p = positions[i];

    let angle = Math.atan2(p.y - cursor.y, p.x - cursor.x);
    angle += Math.PI / 2;

    ctx.translate(p.x, p.y);
    ctx.rotate(angle);

    ctx.moveTo(-p.length / 2, 0);
    ctx.lineTo(+p.length / 2, 0);
    ctx.stroke();

    ctx.restore();
  }

  ctx.restore();
}

function renderCursor(x: number, y: number) {
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = Colors.CERULEAN5;
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function render() {
  clean();

  renderLines();
  renderCursor(cursor.x, cursor.y);

  requestAnimationFrame(render);
}

render();

canvas.addEventListener('pointermove', (e) => {
  cursor.x = e.clientX;
  cursor.y = e.clientY;
});
