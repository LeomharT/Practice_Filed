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
  pixelRatio: Math.min(2, window.devicePixelRatio),
  aspect: window.innerWidth / window.innerHeight,
};

const root = document.querySelector('#root');

const canvas = document.createElement('canvas');
canvas.width = size.width;
canvas.height = size.height;
canvas.style.width = size.width + 'px';
canvas.style.height = size.height + 'px';
root?.append(canvas);

const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

function clean() {
  ctx.save();
  ctx.fillStyle = Colors.BLACK;
  ctx.fillRect(0, 0, size.width, size.height);
  ctx.restore();
}

clean();

function point(v: Vector2) {
  ctx.save();
  const s = 30;
  ctx.fillStyle = Colors.FOREST5;
  ctx.fillRect(v.x - s / 2, v.y - s / 2, s, s);
  ctx.restore();
}

function screen(v: Vector2) {
  const x = ((v.x + 1.0) / 2.0) * size.width;
  const y = -((v.y - 1.0) / 2.0) * size.height;

  return { x, y };
}

function project(v: Vector3) {
  return {
    x: v.x / v.z,
    y: (v.y / v.z) * size.aspect,
  };
}

function translatZ(v: Vector3, dz: number) {
  return {
    ...v,
    z: v.z + dz,
  };
}

function line(from: Vector2, to: Vector2) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.strokeStyle = Colors.FOREST5;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

function rotate(v: Vector3, angle: number) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);

  return {
    x: v.x * c - v.z * s,
    y: v.y,
    z: v.x * s + v.z * c,
  };
}

const vs: Vector3[] = [
  { x: -0.25, y: 0.25, z: 0.25 },
  { x: 0.25, y: 0.25, z: 0.25 },
  { x: 0.25, y: -0.25, z: 0.25 },
  { x: -0.25, y: -0.25, z: 0.25 },
  { x: -0.25, y: 0.25, z: -0.25 },
  { x: 0.25, y: 0.25, z: -0.25 },
  { x: 0.25, y: -0.25, z: -0.25 },
  { x: -0.25, y: -0.25, z: -0.25 },
];

const fs = [
  [0, 1, 2, 3],
  [4, 5, 6, 7],
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7],
];

let prevTime = 0;
let dz = 1;
let angle = 0;

function render(time: number = 0) {
  clean();

  const dt = (time - prevTime) / 1000;
  prevTime = time;

  //   dz += dt;
  angle += dt;

  for (const v of vs) {
    point(screen(project(translatZ(rotate({ ...v }, angle), dz))));
  }

  for (const f of fs) {
    for (let i = 0; i < f.length; i++) {
      const v1 = vs[f[i]];
      const v2 = vs[f[(i + 1) % f.length]];

      line(
        screen(project(translatZ(rotate({ ...v1 }, angle), dz))),
        screen(project(translatZ(rotate({ ...v2 }, angle), dz))),
      );
    }
  }

  requestAnimationFrame(render);
}

render();

window.addEventListener('resize', () => {
  size.width = window.innerWidth;
  size.height = window.innerHeight;
  size.aspect = size.width / size.height;

  canvas.width = size.width;
  canvas.height = size.height;
  canvas.style.width = size.width + 'px';
  canvas.style.height = size.height + 'px';
});
