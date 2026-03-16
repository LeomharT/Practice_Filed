import { Colors } from '@blueprintjs/colors';
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

const vs = [
  { x: 0.25, y: 0.25, z: 0.25 },
  { x: -0.25, y: 0.25, z: 0.25 },
  { x: -0.25, y: -0.25, z: 0.25 },
  { x: 0.25, y: -0.25, z: 0.25 },

  { x: 0.25, y: 0.25, z: -0.25 },
  { x: -0.25, y: 0.25, z: -0.25 },
  { x: -0.25, y: -0.25, z: -0.25 },
  { x: 0.25, y: -0.25, z: -0.25 },
];

const fs = [
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

function point(v: Vector2) {
  ctx.save();

  const s = 20;
  ctx.fillStyle = Colors.FOREST4;
  ctx.fillRect(v.x - s / 2, v.y - s / 2, s, s);

  ctx.restore();
}

function line(from: Vector2, to: Vector2) {
  ctx.save();

  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.strokeStyle = Colors.FOREST2;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.restore();
}

function screen(v: Vector2) {
  const x = (v.x * 0.5 + 0.5) * size.width;
  const y = -(v.y * 0.5 - 0.5) * size.height;

  return {
    x,
    y,
  };
}

function project(v: Vector3) {
  return {
    x: v.x / v.z,
    y: (v.y / v.z) * size.aspect,
  };
}

function translateZ(v: Vector3, dz: number) {
  return {
    ...v,
    z: v.z + dz,
  };
}

function rotate(v: Vector3, angle: number) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);

  const x = v.x * c - v.z * s;
  const z = v.x * s + v.z * c;

  return {
    ...v,
    x,
    z,
  };
}

let prev = 0;

let dz = 1;
let angle = 0;

function render(time: number = 0) {
  const dt = (time - prev) / 1000;
  prev = time;

  // dz += dt;
  angle += dz * 0.01;

  clean();

  for (const f of fs) {
    for (let i = 0; i < f.length; i++) {
      const from = vs[f[i]];
      const to = vs[f[(i + 1) % f.length]];

      line(
        screen(project(translateZ(rotate({ ...from }, angle), dz))),
        screen(project(translateZ(rotate({ ...to }, angle), dz))),
      );
    }
  }

  for (const v of vs) {
    point(screen(project(translateZ(rotate({ ...v }, angle), dz))));
  }

  requestAnimationFrame(render);
}

render();
