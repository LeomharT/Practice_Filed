import { Colors } from '@blueprintjs/colors';
import { fs, vs } from './Monkey123';
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
function clear(color: string = Colors.BLACK) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size.width, size.height);
  ctx.restore();
}
function point(v: Vector2, color: string = Colors.BLUE1) {
  ctx.save();
  const s = 10;
  ctx.fillStyle = color;
  ctx.fillRect(v.x - s / 2, v.y - s / 2, s, s);
  ctx.restore();
}
function screen(v: Vector2): Vector2 {
  const x = ((v.x + 1.0) / 2.0) * size.width;
  const y = -((v.y - 1.0) / 2.0) * size.height;
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
function line(from: Vector2, to: Vector2) {
  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = Colors.VIOLET3;
  ctx.lineWidth = 3;
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.restore();
}
function rotate(v: Vector3, angle: number) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return {
    ...v,
    x: v.x * c - v.z * s,
    z: v.x * s + v.z * c,
  };
}
let prevTime = 0;
let dz = 3.5;
let angle = 0;
function render(time: number = 0) {
  // Update
  const dt = (time - prevTime) / 1000;
  prevTime = time;
  // dz += dt;
  angle += dt;
  clear();
  for (const v of vs) {
    point(screen(project(translateZ(rotate({ ...v }, angle), dz))));
  }
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
  //Animation
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
