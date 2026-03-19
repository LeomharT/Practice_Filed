import { Colors } from '@blueprintjs/colors';
import { fs, vs } from './penger';
import './style.css';

type Vector2 = {
  x: number;
  y: number;
};

type Vector3 = Vector2 & {
  z: number;
};

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
  aspect: window.innerWidth / window.innerHeight,
};

const el = document.querySelector('#root');

const canvas = document.createElement('canvas');
canvas.width = size.width;
canvas.height = size.height;
canvas.style.width = size.width + 'px';
canvas.style.height = size.height + 'px';
el?.append(canvas);

const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

const _vs = [
  { x: 0.25, y: 0.25, z: 0.25 },
  { x: -0.25, y: 0.25, z: 0.25 },
  { x: -0.25, y: -0.25, z: 0.25 },
  { x: 0.25, y: -0.25, z: 0.25 },

  { x: 0.25, y: 0.25, z: -0.25 },
  { x: -0.25, y: 0.25, z: -0.25 },
  { x: -0.25, y: -0.25, z: -0.25 },
  { x: 0.25, y: -0.25, z: -0.25 },
];

const _fs = [
  [0, 1, 2, 3],
  [4, 5, 6, 7],
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7],
];

function clean() {
  ctx.save();
  ctx.fillStyle = Colors.BLACK;
  ctx.fillRect(0, 0, size.width, size.height);
  ctx.restore();
}

function point(p: Vector2) {
  ctx.save();

  const s = 10;
  ctx.fillStyle = Colors.GRAY5;
  ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);

  ctx.restore();
}

function line(from: Vector2, to: Vector2) {
  ctx.save();

  ctx.beginPath();
  ctx.strokeStyle = Colors.GRAY5;
  ctx.lineWidth = 2.0;
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();

  ctx.restore();
}

function screen(p: Vector2) {
  const x = ((p.x + 1.0) / 2.0) * size.width;
  const y = -((p.y - 1.0) / 2.0) * size.height;

  return {
    x,
    y,
  };
}

function project(p: Vector3) {
  return {
    x: p.x / p.z,
    y: (p.y / p.z) * size.aspect,
  };
}

function translateZ(p: Vector3, dz: number) {
  return {
    ...p,
    z: p.z + dz,
  };
}

function rotate2D(p: Vector3, angle: number) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);

  const x = p.x * c - p.z * s;
  const z = p.x * s + p.z * c;

  return {
    ...p,
    x,
    z,
  };
}

let prev = 0;
let dz = 1.5;
let angle = 0;

function render(time: number = 0) {
  const dt = (time - prev) / 1000;
  prev = time;

  // dz += dt;
  angle += dt;

  // Clean
  clean();
  // Render
  for (const v of vs) {
    point(screen(project(translateZ(rotate2D({ ...v }, angle), dz))));
  }

  for (const f of fs) {
    for (let i = 0; i < f.length; i++) {
      const form = vs[f[i]];
      const to = vs[f[(i + 1) % f.length]];

      line(
        screen(project(translateZ(rotate2D({ ...form }, angle), dz))),
        screen(project(translateZ(rotate2D({ ...to }, angle), dz))),
      );
    }
  }

  // Animation
  requestAnimationFrame(render);
}
render();
