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

const image = new Image();
image.src = '/arrow.png';

const positions = Array.from({ length: 350 }, () => ({
  x: MathUtils.randFloat(0, size.width),
  y: MathUtils.randFloat(0, size.height),
  length: MathUtils.randFloat(50, 200),
}));

const cursor = {
  x: 0,
  y: 0,
};

function clean() {
  ctx.save();
  ctx.fillStyle = Colors.GRAY1;
  ctx.fillRect(0, 0, size.width, size.height);
  ctx.restore();
}

function drawArrows() {
  ctx.save();

  for (const p of positions) {
    ctx.save();
    ctx.translate(p.x, p.y);
    let angle = Math.atan2(p.y - cursor.y, p.x - cursor.x);
    angle += Math.PI;
    ctx.rotate(angle);
    ctx.drawImage(image, -p.length / 2, -50 / 2, p.length, 50);
    ctx.restore();
  }

  ctx.restore();
}

function drawCursor() {
  ctx.save();

  ctx.beginPath();
  ctx.fillStyle = Colors.BLUE5;
  ctx.arc(cursor.x, cursor.y, 20, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function render() {
  // Clean
  clean();
  // Render
  drawArrows();
  drawCursor();
  // Animation
  requestAnimationFrame(render);
}
render();

canvas.addEventListener('pointermove', (e) => {
  cursor.x = e.clientX;
  cursor.y = e.clientY;
});
