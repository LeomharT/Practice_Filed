import { Colors } from '@blueprintjs/colors';
import { MathUtils, type Vector2Like } from 'three';
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

const posisions = Array.from({ length: 500 }, () => ({
  x: MathUtils.randFloat(0, size.width),
  y: MathUtils.randFloat(0, size.height),
  length: MathUtils.randFloat(50, 200),
  angle: 0,
}));

function clean() {
  ctx.save();
  ctx.fillStyle = Colors.BLACK;
  ctx.fillRect(0, 0, size.width, size.height);
  ctx.restore();
}
clean();

function line() {
  ctx.save();

  for (const p of posisions) {
    ctx.save();

    const w = p.x;
    const h = p.y;

    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = Colors.BLUE5;
    ctx.beginPath();
    ctx.translate(w, h);
    ctx.rotate(p.angle);
    ctx.moveTo(-p.length / 2, 0);
    ctx.lineTo(p.length / 2, 0);
    ctx.stroke();

    ctx.restore();
  }

  ctx.restore();
}

function point(p: Vector2Like) {
  ctx.save();

  const s = 200;
  ctx.fillStyle = Colors.GOLD5;
  ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);

  ctx.restore();
}

function screen(p: Vector2Like) {
  const x = ((p.x + 1.0) / 2.0) * size.width;
  const y = -((p.y - 1.0) / 2.0) * size.height;

  return {
    x: x,
    y: y,
  };
}

let enabled = false;
let targetAngle = 0;

const target = {
  x: 0,
  y: 0,
};

const center = {
  x: size.width / 2,
  y: size.height / 2,
};

canvas.addEventListener('pointerdown', () => (enabled = true));
canvas.addEventListener('pointerup', () => (enabled = false));
canvas.addEventListener('pointermove', (e) => {
  if (enabled) {
    target.x = e.clientX;
    target.y = e.clientY;

    targetAngle = Math.atan2(target.y - center.y, target.x - center.x);

    for (const p of posisions) {
      p.angle = Math.atan2(target.y - p.y, target.x - p.x);
      p.angle += Math.PI / 2;
    }
  }
});

let prevTime = 0;
const speed = 5;

function render(time: number = 0) {
  const delta = (time - prevTime) / 1000;
  prevTime = time;

  const t = 1.0 - Math.exp(-speed * delta);

  clean();

  point(screen({ x: 0, y: 0.25 }));

  requestAnimationFrame(render);
}

render();
