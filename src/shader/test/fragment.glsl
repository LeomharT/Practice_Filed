varying float vH;
varying vec2 vUv;

uniform float uRadius;

void main() {
  float h      = vH;
  float aspect = 3.0 / 4.0;
  vec3  color  = vec3(1.0);
  float r      = uRadius;

  vec2 uv    = vUv;
       uv.y /= aspect;

  vec2 center    = vec2(0.5);
       center.y /= aspect;

  vec2 halfSize = abs(uv - center);

  vec2 p = halfSize - (center - r);

  if (p.x > 0.0 && p.y > 0.0) {
    if (length(p) > r) {
       discard;
    }
  }

  gl_FragColor = vec4(color, 1.0);
}
