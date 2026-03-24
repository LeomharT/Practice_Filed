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

const arrow = new Image();
arrow.src = '/arrow.png';

function clean() {
  ctx.save();

  ctx.fillStyle = Colors.GRAY2;
  ctx.fillRect(0, 0, size.width, size.height);

  ctx.restore();
}

const cursor = {
  x: 0,
  y: 0,
};

const lines = Array.from({ length: 50 }, () => ({
  x: MathUtils.randFloat(0, size.width),
  y: MathUtils.randFloat(0, size.height),
  length: MathUtils.randFloat(150, 200),
}));

function renderLines() {
  ctx.save();

  for (const l of lines) {
    ctx.save();

    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = Colors.GRAY1;

    let angle = Math.atan2(l.y - cursor.y, l.x - cursor.x);

    if (l.y - cursor.y > 0) {
      angle += Math.PI;
    }
    ctx.translate(l.x, l.y);
    ctx.rotate(angle);

    ctx.drawImage(arrow, -l.length / 2, -25, l.length, 50);

    ctx.restore();
  }

  ctx.restore();
}

function renderCursor() {
  ctx.save();

  ctx.fillStyle = Colors.CERULEAN4;
  ctx.beginPath();
  ctx.arc(cursor.x, cursor.y, 30, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function render() {
  clean();
  renderLines();
  renderCursor();

  // Animation
  requestAnimationFrame(render);
}

render();

canvas.addEventListener('pointermove', (e) => {
  cursor.x = e.clientX;
  cursor.y = e.clientY;
});
