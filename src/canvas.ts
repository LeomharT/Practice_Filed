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

const LENGTH = 500;

function clean() {
  ctx.save();
  ctx.fillStyle = Colors.BLACK;
  ctx.fillRect(0, 0, size.width, size.height);
  ctx.restore();
}
clean();

function line(angle: number = 0) {
  ctx.save();

  const w = size.width / 2;
  const h = size.height / 2;

  ctx.lineWidth = 20;
  ctx.lineCap = 'round';
  ctx.strokeStyle = Colors.BLUE5;
  ctx.beginPath();
  ctx.translate(w, h);
  ctx.rotate(angle);
  ctx.moveTo(-LENGTH / 2, 0);
  ctx.lineTo(LENGTH / 2, 0);
  ctx.stroke();

  ctx.restore();
}

line();

let enabled = false;
let angle = 0;
let targetAngle = 0;

const center = {
  x: size.width / 2,
  y: size.height / 2,
};

canvas.addEventListener('pointerdown', () => (enabled = true));
canvas.addEventListener('pointerup', () => (enabled = false));
canvas.addEventListener('pointermove', (e) => {
  if (enabled) {
    const target = {
      x: e.clientX,
      y: e.clientY,
    };

    targetAngle = Math.atan2(target.y - center.y, target.x - center.x);
  }
});

let prevTime = 0;
const speed = 5;

function render(time: number = 0) {
  const delta = (time - prevTime) / 1000;
  prevTime = time;

  const t = 1.0 - Math.exp(-speed * delta);

  angle = MathUtils.lerp(angle, targetAngle, t);

  clean();
  line(angle);
  requestAnimationFrame(render);
}

render();
